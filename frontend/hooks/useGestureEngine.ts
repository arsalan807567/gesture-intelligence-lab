"use client";

import { useRef } from "react";
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

  // Index fingertip (landmark 8), mirrored to match the flipped video
  const hand = result?.landmarks?.[0];
  const pointer = hand ? { x: 1 - hand[8].x, y: hand[8].y } : null;

  return { videoRef, status, gesture, confidence: prediction?.confidence ?? 0, pointer };
}
