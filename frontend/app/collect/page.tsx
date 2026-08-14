"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { HandmarkOverlay } from "@/components/HandmarkOverlay";
import { normalizeLandmarks, GESTURES, Gesture } from "@/lib/normalize";

type Sample = { label: Gesture; features: number[] };

export default function CollectPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, result } = useHandLandmarker(videoRef);
  const [gesture, setGesture] = useState<Gesture>(GESTURES[0]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const resultRef = useRef(result);
  resultRef.current = result;
  const gestureRef = useRef(gesture);
  gestureRef.current = gesture;

  const capture = useCallback(() => {
    const features = normalizeLandmarks(resultRef.current!);
    if (!features) return;
    setSamples((prev) => [...prev, { label: gestureRef.current, features }]);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        capture();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capture]);

  const counts = GESTURES.reduce<Record<string, number>>((acc, g) => {
    acc[g] = samples.filter((s) => s.label === g).length;
    return acc;
  }, {});

  function downloadCSV() {
    const header = [
      "label",
      ...Array.from({ length: 21 }, (_, i) => [
        `f${i}_x`,
        `f${i}_y`,
        `f${i}_z`,
      ]).flat(),
    ].join(",");
    const rows = samples.map((s) => [s.label, ...s.features].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gesture_dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Dataset Collector</h1>

      {status === "denied" && (
        <p className="mt-4 text-red-400">
          Camera access is required to collect data.
        </p>
      )}

      <div className="mt-6 flex gap-8">
        <div className="relative w-[640px] h-[480px] rounded-lg overflow-hidden border border-neutral-800 bg-black">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1] opacity-0"
            muted
            playsInline
          />
          <div className="scale-x-[-1] absolute top-0 left-0 w-full h-full">
            <HandmarkOverlay result={result} width={640} height={480} />
          </div>
        </div>

        <div className="w-64">
          <label className="text-sm text-neutral-400">Current gesture</label>
          <select
            value={gesture}
            onChange={(e) => setGesture(e.target.value as Gesture)}
            className="mt-1 w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          >
            {GESTURES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <p className="mt-4 text-sm text-neutral-500">
            Press SPACE to capture a sample for {gesture}.
          </p>

          <div className="mt-6 space-y-1 text-sm">
            {GESTURES.map((g) => (
              <div key={g} className="flex justify-between">
                <span className={g === gesture ? "text-cyan-400" : "text-neutral-400"}>
                  {g}
                </span>
                <span>{counts[g]}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-neutral-500">
            Total: {samples.length}
          </p>

          <button
            onClick={downloadCSV}
            disabled={samples.length === 0}
            className="mt-6 w-full bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-500 rounded px-4 py-2 text-sm font-medium"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
