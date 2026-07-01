"use client";
import Link from "next/link";
import { ArrowRight, Upload, Play, BarChart3, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticleField } from "@/components/animations/ParticleField";
import { Sphere3D } from "@/components/animations/Sphere3D";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { useTilt } from "@/components/animations/useTilt";

const stats = [
  { value: 24, suffix: "M+", label: "Records processed" },
  { value: 99.2, suffix: "%", label: "Detection accuracy", decimals: 1 },
  { value: 3.2, suffix: "s", label: "Avg. analysis time", decimals: 1 },
  { value: 4800, suffix: "+", label: "Teams worldwide" },
];

function MockDashboardCard() {
  const tilt = useTilt(8);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      className="tilt-card relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden"
      style={{ transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out" }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        <span className="ml-3 text-xs font-mono text-muted-foreground">customer_database_q2.xlsx — DataPulse</span>
      </div>

      <div className="p-5">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Records", val: "24,831", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Duplicates", val: "1,247", icon: Zap, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "Missing", val: "3,891", icon: Shield, color: "text-slate-500", bg: "bg-slate-500/10" },
            { label: "Score", val: "87.4", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((m, i) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-background p-3 animate-reveal-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${m.bg} mb-2`}>
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
              </div>
              <div className="text-base font-semibold">{m.val}</div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Mini bar chart */}
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <div className="text-[10px] text-muted-foreground mb-2 font-medium">Quality trend — last 6 months</div>
          <div className="flex items-end gap-1.5 h-20">
            {[52, 61, 68, 74, 81, 87].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-primary/50 animate-reveal-up"
                  style={{ height: `${h}%`, animationDelay: `${300 + i * 60}ms` }}
                />
                <span className="text-[8px] text-muted-foreground">{["J","F","M","A","M","J"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status badges */}
        <div className="mt-3 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600">
            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> 891 duplicates ready to remove
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
            Analysis complete · 3.2s
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col justify-center pt-24 pb-16 sm:pt-28 sm:pb-24">
      {/* Particle field background */}
      <ParticleField />

      {/* Radial gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-indigo-500/6 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: text */}
          <div>
            <div className="animate-reveal-up">
              <Badge className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Now with AI-powered fuzzy matching
              </Badge>
            </div>

            <h1 className="animate-reveal-up delay-100 text-balance text-4xl font-semibold tracking-tight sm:text-5xl leading-[1.15]">
              Upload any Excel file.{" "}
              <span className="gradient-text">Instantly find duplicates,</span>{" "}
              missing data &amp; quality issues.
            </h1>

            <p className="animate-reveal-up delay-200 mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
              DataPulse analyzes spreadsheets in seconds — detecting exact and fuzzy duplicates,
              flagging missing values, and generating a quality score with actionable AI recommendations.
            </p>

            <div className="animate-reveal-up delay-300 mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/signup">
                <Button size="xl" className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto">
                  <Upload className="h-4 w-4" />
                  Upload a file — free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Play className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            </div>

            <p className="animate-reveal-up delay-400 mt-4 text-xs text-muted-foreground">
              Free account · Excel (.xlsx) · Results in &lt;5 seconds
            </p>

            {/* Stats */}
            <div className="animate-reveal-up delay-500 mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card/80 p-3 text-center glass">
                  <div className="text-xl font-semibold tracking-tight">
                    <AnimatedCounter target={s.value} suffix={s.suffix} decimals={s.decimals} duration={1600} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D sphere + dashboard card */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Floating sphere */}
            <div className="absolute -top-10 -right-10 opacity-60 animate-float-slow hidden lg:block">
              <Sphere3D size={180} />
            </div>

            {/* Small orbiting blobs */}
            <div className="absolute top-8 -left-4 h-3 w-3 rounded-full bg-blue-500/60 animate-float" />
            <div className="absolute bottom-12 right-4 h-2 w-2 rounded-full bg-indigo-400/70 animate-float-delayed" />
            <div className="absolute top-1/2 -left-8 h-4 w-4 rounded-full bg-primary/30 blur-sm animate-float-slow" />

            <MockDashboardCard />
          </div>
        </div>
      </div>
    </section>
  );
}
