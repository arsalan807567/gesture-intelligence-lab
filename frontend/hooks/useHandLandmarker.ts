"use client";

import { useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

type Status = "idle" | "loading" | "ready" | "denied" | "error";
const RESULT_INTERVAL_MS = 100;

export function useHandLandmarker(videoRef: React.RefObject<HTMLVideoElement>) {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<HandLandmarkerResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus("loading");
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        if (cancelled) return;
        landmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("ready");
        loop();
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setStatus("denied");
        } else {
          setStatus("error");
        }
        console.error(err);
      }
    }

    function loop() {
      if (cancelled) return;
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (video && landmarker && video.readyState >= 2) {
        const now = performance.now();
        if (now - lastUpdateRef.current >= RESULT_INTERVAL_MS) {
          lastUpdateRef.current = now;
          const res = landmarker.detectForVideo(video, now);
          setResult(res);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [videoRef]);

  return { status, result };
}
