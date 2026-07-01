"use client";
import { useEffect, useRef } from "react";

export function Sphere3D({ size = 220 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = size * 0.38;
    let angle = 0;
    let animId: number;

    // Latitude / longitude lines
    const latLines = 10, lonLines = 16;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Glow
      const grd = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.2);
      grd.addColorStop(0, "rgba(99,102,241,0.08)");
      grd.addColorStop(1, "rgba(99,102,241,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Latitude rings
      for (let i = 1; i < latLines; i++) {
        const lat = (i / latLines) * Math.PI;
        const ringR = r * Math.sin(lat);
        const ringY = cy - r * Math.cos(lat);
        ctx.beginPath();
        ctx.ellipse(cx, ringY, ringR, ringR * 0.22, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(99,102,241,0.18)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Longitude arcs (animated rotation)
      for (let i = 0; i < lonLines; i++) {
        const lon = (i / lonLines) * Math.PI * 2 + angle;
        ctx.beginPath();
        for (let t = 0; t <= 100; t++) {
          const lat2 = (t / 100) * Math.PI;
          const x3d = r * Math.sin(lat2) * Math.cos(lon);
          const y3d = -r * Math.cos(lat2);
          const z3d = r * Math.sin(lat2) * Math.sin(lon);
          const scale = 1 + z3d / (r * 8);
          const px = cx + x3d * scale;
          const py = cy + y3d * scale;
          const alpha = Math.max(0, 0.05 + (z3d / r) * 0.2);
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(99,102,241,${0.15})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Dots on surface
      const dotCount = 40;
      for (let i = 0; i < dotCount; i++) {
        const lat2 = Math.acos(1 - (2 * i) / dotCount);
        const lon2 = Math.PI * (1 + Math.sqrt(5)) * i + angle * 0.5;
        const x3d = r * Math.sin(lat2) * Math.cos(lon2);
        const y3d = -r * Math.cos(lat2);
        const z3d = r * Math.sin(lat2) * Math.sin(lon2);
        if (z3d > -r * 0.2) {
          const brightness = 0.3 + (z3d / r) * 0.7;
          ctx.beginPath();
          ctx.arc(cx + x3d, cy + y3d, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(147,197,253,${brightness})`;
          ctx.fill();
        }
      }

      angle += 0.006;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
