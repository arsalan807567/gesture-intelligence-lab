"use client";

import { useEffect, useRef, useState } from "react";
import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { normalizeLandmarks } from "@/lib/normalize";

type Prediction = {
  gesture: string;
  confidence: number;
  probabilities: Record<string, number>;
};

const PREDICT_INTERVAL_MS = 200;

export function useGesturePrediction(result: HandLandmarkerResult | null) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const lastCallRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const now = performance.now();
    if (now - lastCallRef.current < PREDICT_INTERVAL_MS) return;
    if (inFlightRef.current) return;

    const features = result ? normalizeLandmarks(result) : null;
    if (!features) {
      setPrediction(null);
      return;
    }

    lastCallRef.current = now;
    inFlightRef.current = true;

    fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features }),
    })
      .then((res) => res.json())
      .then((data) => setPrediction(data))
      .catch((err) => console.error("Prediction failed:", err))
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [result]);

  return prediction;
}
