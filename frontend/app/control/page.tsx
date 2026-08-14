"use client";

import { useEffect, useState } from "react";
import { useGestureEngine } from "@/hooks/useGestureEngine";

const TARGETS = [
  { id: "A", x: 40, y: 40 },
  { id: "B", x: 240, y: 40 },
  { id: "C", x: 440, y: 40 },
];

export default function ControlPage() {
  const { videoRef, status, gesture, pointer } = useGestureEngine();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!pointer) {
      setHovered(null);
      return;
    }
    const px = pointer.x * 640;
    const py = pointer.y * 480;
    const hit = TARGETS.find(
      (t) => px >= t.x && px <= t.x + 120 && py >= t.y && py <= t.y + 80
    );
    setHovered(hit?.id ?? null);
  }, [pointer]);

  useEffect(() => {
    if (gesture === "PINCH" && hovered) {
      setSelected(hovered);
    }
  }, [gesture, hovered]);

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Gesture Control</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Point at a box to highlight it. Pinch to select it.
      </p>
      {status === "denied" && <p className="mt-4 text-red-400">Camera access required.</p>}

      <div className="relative mt-6 w-[640px] h-[480px] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
        <video ref={videoRef} className="hidden" muted playsInline />

        {TARGETS.map((t) => (
          <div
            key={t.id}
            className={`absolute rounded-lg border flex items-center justify-center text-sm transition-colors ${
              selected === t.id
                ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                : hovered === t.id
                ? "border-cyan-600 bg-cyan-600/10 text-cyan-400"
                : "border-neutral-700 text-neutral-500"
            }`}
            style={{ left: t.x, top: t.y, width: 120, height: 80 }}
          >
            {t.id}
          </div>
        ))}

        {pointer && (
          <div
            className="absolute w-3 h-3 rounded-full bg-pink-400 pointer-events-none"
            style={{ left: pointer.x * 640 - 6, top: pointer.y * 480 - 6 }}
          />
        )}
      </div>

      <p className="mt-3 text-sm text-neutral-400">
        Gesture: {gesture ?? "—"} · Selected: {selected ?? "none"}
      </p>
    </div>
  );
}
