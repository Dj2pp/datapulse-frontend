"use client";
import { ShieldCheck, Zap, BarChart3, FileSpreadsheet, Lock, Sparkles } from "lucide-react";

const items = [
  { icon: FileSpreadsheet, label: "Excel & CSV native" },
  { icon: Zap, label: "AI fuzzy matching" },
  { icon: ShieldCheck, label: "SOC 2-ready security" },
  { icon: BarChart3, label: "Real-time quality scoring" },
  { icon: Lock, label: "Encrypted in transit & at rest" },
  { icon: Sparkles, label: "GPT-powered insights" },
];

function Row({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-10 px-5" aria-hidden={ariaHidden}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 text-muted-foreground">
          <item.icon className="h-4 w-4 text-primary/70" />
          <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="border-t border-border bg-muted/20 py-8 overflow-hidden">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        Built for teams that can&apos;t afford bad data
      </p>
      <div className="marquee-pause relative flex overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex animate-marquee">
          <Row />
          <Row ariaHidden />
        </div>
      </div>
    </section>
  );
}
