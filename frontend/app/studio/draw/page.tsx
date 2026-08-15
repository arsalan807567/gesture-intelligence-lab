"use client";

import { useEffect, useRef, useState } from "react";
import { useGestureEngine } from "@/hooks/useGestureEngine";

const COLORS = ["#22d3ee", "#f472b6", "#facc15", "#4ade80"];

export default function DrawPage() {
  const { videoRef, status, gesture, pointer } = useGestureEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const colorIdx = useRef(0);
  const lastPeace = useRef(false);
  const [colorLabel, setColorLabel] = useState(COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (gesture === "FIST") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lastPoint.current = null;
      return;
    }

    if (gesture === "PEACE") {
      if (!lastPeace.current) {
        colorIdx.current = (colorIdx.current + 1) % COLORS.length;
        setColorLabel(COLORS[colorIdx.current]);
      }
      lastPeace.current = true;
      lastPoint.current = null;
      return;
    }
    lastPeace.current = false;

    if (gesture === "THUMBS_UP") {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "gesture-drawing.png";
      a.click();
      return;
    }

    if (gesture === "PINCH" && pointer) {
      const x = pointer.x * canvas.width;
      const y = pointer.y * canvas.height;
      ctx.strokeStyle = COLORS[colorIdx.current];
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      if (lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      lastPoint.current = { x, y };
    } else {
      lastPoint.current = null;
    }
  }, [gesture, pointer]);

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Gesture Drawing</h1>
      <p className="mt-2 text-sm text-neutral-500">
        PINCH to draw · FIST to clear · PEACE to change color · THUMBS_UP to save
      </p>
      {status === "denied" && (
        <p className="mt-4 text-red-400">Camera access required.</p>
      )}
      <div className="relative mt-6 w-[640px] h-[480px] rounded-lg overflow-hidden border border-neutral-800 bg-black">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-0"
          muted
          playsInline
        />
        <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0" />
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
        <span>Brush:</span>
        <span
          className="w-4 h-4 rounded-full inline-block"
          style={{ backgroundColor: colorLabel }}
        />
        <span className="ml-4">Gesture: {gesture ?? "—"}</span>
      </div>
    </div>
  );
}
