"use client";

import { useEffect, useRef } from "react";
import { useGestureEngine } from "@/hooks/useGestureEngine";

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const PALETTES = [
  ["#22d3ee", "#67e8f9"],
  ["#f472b6", "#fbcfe8"],
  ["#facc15", "#fde68a"],
];

export default function FireworksPage() {
  const { videoRef, status, gesture, pointer } = useGestureEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const paletteIdx = useRef(0);
  const lastPeace = useRef(false);
  const lastSpawn = useRef(0);
  const rafRef = useRef<number | null>(null);

  function spawn(x: number, y: number, count: number) {
    const palette = PALETTES[paletteIdx.current];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: palette[i % palette.length],
      });
    }
  }

  useEffect(() => {
    if (gesture === "PEACE") {
      if (!lastPeace.current) paletteIdx.current = (paletteIdx.current + 1) % PALETTES.length;
      lastPeace.current = true;
    } else {
      lastPeace.current = false;
    }

    if (gesture === "FIST") {
      particles.current = [];
    }

    if (gesture === "THUMBS_UP") {
      spawn(320, 240, 60);
    }

    if (gesture === "POINT" && pointer) {
      const now = performance.now();
      if (now - lastSpawn.current > 150) {
        lastSpawn.current = now;
        spawn(pointer.x * 640, pointer.y * 480, 20);
      }
    }
  }, [gesture, pointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function tick() {
      ctx!.fillStyle = "rgba(0,0,0,0.15)";
      ctx!.fillRect(0, 0, 640, 480);

      particles.current = particles.current.filter((p) => p.life > 0);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life -= 0.02;
        ctx!.globalAlpha = Math.max(p.life, 0);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="px-6 py-16">
      <a href="/studio" className="text-sm text-neutral-500 hover:text-neutral-300 transition">
        ← Back to Studio
      </a>
      <h1 className="mt-3 text-2xl font-semibold">Gesture Fireworks</h1>
      <p className="mt-2 text-sm text-neutral-500">
        POINT to launch small bursts · THUMBS_UP for a big burst · FIST to clear · PEACE to change colors
      </p>
      {status === "denied" && (
        <p className="mt-4 text-red-400">Camera access required.</p>
      )}
      <div className="relative mt-6 w-[640px] h-[480px] rounded-lg overflow-hidden border border-neutral-800 bg-black">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-0"
          muted
          playsInline
        />
        <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0" />
      </div>
      <p className="mt-3 text-sm text-neutral-400">Gesture: {gesture ?? "—"}</p>
    </div>
  );
}
