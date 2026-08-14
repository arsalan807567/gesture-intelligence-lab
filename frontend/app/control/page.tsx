"use client";

import { useEffect, useState } from "react";
import { useGestureEngine } from "@/hooks/useGestureEngine";

export default function ControlPage() {
  const { videoRef, status, gesture, pointer } = useGestureEngine();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [boxPos, setBoxPos] = useState({ x: 300, y: 200 });
  const dragging = { current: false };

  const targets = ["A", "B", "C"];

  useEffect(() => {
    if (gesture === "THUMBS_UP" && selected) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 1200);
    }
    if (gesture === "FIST" && pointer) {
      setBoxPos({ x: pointer.x * 640, y: pointer.y * 480 });
    }
  }, [gesture, pointer, selected]);

  useEffect(() => {
    if (gesture !== "POINT" || !pointer) {
      setSelected(null);
      return;
    }
    const px = pointer.x * 640;
    const py = pointer.y * 480;
    const zones: Record<string, [number, number, number, number]> = {
      A: [40, 40, 160, 120],
      B: [240, 40, 360, 120],
      C: [440, 40, 560, 120],
    };
    const hit = targets.find((t) => {
      const [x1, y1, x2, y2] = zones[t];
      return px >= x1 && px <= x2 && py >= y1 && py <= y2;
    });
    setSelected(hit ?? null);
  }, [gesture, pointer]);

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Gesture Control</h1>
      <p className="mt-2 text-sm text-neutral-500">
        POINT to hover a target · PINCH to select · FIST to drag the box · THUMBS_UP to confirm
      </p>
      {status === "denied" && <p className="mt-4 text-red-400">Camera access required.</p>}

      <div className="relative mt-6 w-[640px] h-[480px] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
        <video ref={videoRef} className="hidden" muted playsInline />

        {targets.map((t, i) => (
          <div
            key={t}
            className={`absolute top-10 w-30 h-20 rounded-lg border flex items-center justify-center text-sm ${
              selected === t
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-neutral-700 text-neutral-500"
            }`}
            style={{ left: 40 + i * 200, width: 120, height: 80 }}
          >
            Target {t}
          </div>
        ))}

        <div
          className="absolute w-6 h-6 rounded-full bg-pink-400"
          style={{ left: boxPos.x - 12, top: boxPos.y - 12 }}
        />

        {pointer && (
          <div
            className="absolute w-3 h-3 rounded-full bg-cyan-400"
            style={{ left: pointer.x * 640 - 6, top: pointer.y * 480 - 6 }}
          />
        )}

        {confirmed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl text-cyan-300">
            Confirmed: {selected}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-neutral-400">Gesture: {gesture ?? "—"}</p>
    </div>
  );
}
