"use client";
import dynamic from "next/dynamic";

const ParticleField = dynamic(() => import("@/components/animations/ParticleField").then(m => m.ParticleField), { ssr: false });
const Sphere3D = dynamic(() => import("@/components/animations/Sphere3D").then(m => m.Sphere3D), { ssr: false });

export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-background">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.16),transparent)]" />

      {/* Floating gradient orbs — slow drift, pure CSS */}
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />
      <div className="auth-orb auth-orb-c" />

      {/* Connected-particle mesh */}
      <ParticleField />

      {/* Rotating wireframe sphere, anchored off-canvas for depth */}
      <div className="absolute -right-24 top-1/2 hidden -translate-y-1/2 opacity-70 lg:block xl:-right-16">
        <Sphere3D size={460} />
      </div>
      <div className="absolute -left-32 -bottom-32 opacity-40 lg:block">
        <Sphere3D size={320} />
      </div>

      <style jsx>{`
        .auth-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          opacity: 0.35;
          animation: auth-drift 18s ease-in-out infinite;
        }
        .auth-orb-a {
          width: 320px;
          height: 320px;
          top: -60px;
          left: 8%;
          background: radial-gradient(circle, hsl(222 84% 60% / 0.55), transparent 70%);
          animation-duration: 22s;
        }
        .auth-orb-b {
          width: 260px;
          height: 260px;
          bottom: -40px;
          right: 18%;
          background: radial-gradient(circle, hsl(262 83% 66% / 0.5), transparent 70%);
          animation-duration: 26s;
          animation-delay: -6s;
        }
        .auth-orb-c {
          width: 200px;
          height: 200px;
          top: 40%;
          left: 42%;
          background: radial-gradient(circle, hsl(189 94% 55% / 0.4), transparent 70%);
          animation-duration: 20s;
          animation-delay: -12s;
        }
        @keyframes auth-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -24px) scale(1.08); }
          66% { transform: translate(-22px, 18px) scale(0.96); }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-orb { animation: none; }
        }
      `}</style>
    </div>
  );
}
