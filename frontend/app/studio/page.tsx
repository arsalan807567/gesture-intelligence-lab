"use client";

import { useRef } from "react";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { HandmarkOverlay } from "@/components/HandmarkOverlay";

export default function StudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, result } = useHandLandmarker(videoRef);

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Gesture Studio</h1>

      {status === "denied" && (
        <p className="mt-4 text-red-400">
          Camera access is required to use Gesture Studio. Please enable
          camera permissions in your browser.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-red-400">
          Something went wrong starting the camera or model. Try reloading.
        </p>
      )}
      {status === "loading" && (
        <p className="mt-4 text-neutral-500">Loading model and camera...</p>
      )}

      <div className="relative mt-6 w-[640px] h-[480px] rounded-lg overflow-hidden border border-neutral-800 bg-black">
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

      {result?.landmarks?.[0] && (
        <p className="mt-3 text-sm text-neutral-500">Hand detected</p>
      )}
      {status === "ready" && !result?.landmarks?.[0] && (
        <p className="mt-3 text-sm text-neutral-500">No hand detected</p>
      )}
    </div>
  );
}
