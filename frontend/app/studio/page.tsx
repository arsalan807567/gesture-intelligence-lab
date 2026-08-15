"use client";

import { useRef } from "react";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { useGesturePrediction } from "@/hooks/useGesturePrediction";
import { HandmarkOverlay } from "@/components/HandmarkOverlay";

const CONFIDENCE_THRESHOLD = 0.75;

export default function StudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, result } = useHandLandmarker(videoRef);
  const prediction = useGesturePrediction(result);

  const isConfident =
    prediction && prediction.confidence >= CONFIDENCE_THRESHOLD;

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Gesture Studio</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Live hand tracking and gesture classification.
      </p>

      <div className="mt-4 flex gap-3">
        <a
          href="/studio/draw"
          className="px-4 py-2 rounded-lg border border-neutral-700 hover:border-cyan-500 hover:text-cyan-400 transition text-sm"
        >
          Open Drawing Mode
        </a>
        <a
          href="/studio/fireworks"
          className="px-4 py-2 rounded-lg border border-neutral-700 hover:border-pink-500 hover:text-pink-400 transition text-sm"
        >
          Open Fireworks Mode
        </a>
      </div>

      {status === "denied" && (
        <p className="mt-4 text-red-400">
          Camera access is required to use Gesture Studio. Please enable
          camera permissions in your browser.
        </p>
      )}

      <div className="mt-6 flex gap-8 items-start">
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
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Detected gesture
          </p>
          {prediction ? (
            <>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  isConfident ? "text-cyan-400" : "text-neutral-600"
                }`}
              >
                {prediction.gesture}
              </p>
              <p className="text-sm text-neutral-500">
                Confidence {(prediction.confidence * 100).toFixed(1)}%
              </p>
              {!isConfident && (
                <p className="mt-2 text-sm text-yellow-500">
                  Uncertain gesture
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-neutral-600">No hand detected</p>
          )}
        </div>
      </div>
    </div>
  );
}
