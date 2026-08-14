"use client";

import { useEffect, useRef } from "react";
import { HandLandmarkerResult } from "@mediapipe/tasks-vision";

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function HandmarkOverlay({
  result,
  width,
  height,
}: {
  result: HandLandmarkerResult | null;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const hand = result?.landmarks?.[0];
    if (!hand) return;

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(hand[a].x * width, hand[a].y * height);
      ctx.lineTo(hand[b].x * width, hand[b].y * height);
      ctx.stroke();
    }

    ctx.fillStyle = "#f472b6";
    for (const point of hand) {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [result, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0"
    />
  );
}