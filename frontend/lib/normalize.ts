import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";

// Wrist-relative, scale-invariant normalization.
// Landmark 0 = wrist, landmark 9 = middle finger MCP (used as scale reference).
export function normalizeLandmarks(
  result: HandLandmarkerResult
): number[] | null {
  const hand = result.landmarks?.[0];
  if (!hand || hand.length !== 21) return null;

  const wrist = hand[0];
  const scaleRef = hand[9];
  const scale = Math.hypot(
    scaleRef.x - wrist.x,
    scaleRef.y - wrist.y,
    scaleRef.z - wrist.z
  );
  if (scale === 0) return null;

  const features: number[] = [];
  for (const point of hand) {
    features.push(
      (point.x - wrist.x) / scale,
      (point.y - wrist.y) / scale,
      (point.z - wrist.z) / scale
    );
  }
  return features; // length 63
}

export const GESTURES = [
  "OPEN_PALM",
  "FIST",
  "POINT",
  "PINCH",
  "PEACE",
  "THUMBS_UP",
  "THUMBS_DOWN",
] as const;

export type Gesture = (typeof GESTURES)[number];
