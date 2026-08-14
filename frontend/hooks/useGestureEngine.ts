"use client";

import { useMemo, useRef } from "react";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { useGesturePrediction } from "@/hooks/useGesturePrediction";

const CONFIDENCE_THRESHOLD = 0.75;

export function useGestureEngine() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, result } = useHandLandmarker(videoRef);
  const prediction = useGesturePrediction(result);

  const gesture =
    prediction && prediction.confidence >= CONFIDENCE_THRESHOLD
      ? prediction.gesture
      : null;

  const hand = result?.landmarks?.[0];
  const rawX = hand ? 1 - hand[8].x : null;
  const rawY = hand ? hand[8].y : null;

  // Only creates a new object when the underlying numbers actually change
  const pointer = useMemo(() => {
    if (rawX === null || rawY === null) return null;
    return { x: rawX, y: rawY };
  }, [rawX, rawY]);

  return {
    videoRef,
    status,
    gesture,
    confidence: prediction?.confidence ?? 0,
    pointer,
  };
}
