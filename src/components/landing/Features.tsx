"use client";
import { Copy, AlertCircle, BarChart3, FileDown, Zap, ShieldCheck } from "lucide-react";
import { useReveal } from "@/components/animations/useReveal";
import { useTilt } from "@/components/animations/useTilt";

const features = [
  { icon: Copy, title: "Exact & Fuzzy Duplicate Detection", description: "Finds exact copies and near-matches using Levenshtein distance, Soundex phonetic matching, and token similarity. Catches 'Jon Smith' vs 'John Smith' automatically." },
  { icon: AlertCircle, title: "Missing Value Analysis", description: "Identifies null, empty, and placeholder values across every column. Shows fill rates and flags fields that breach your quality thresholds." },
  { icon: BarChart3, title: "Quality Score Dashboard", description: "A single 0–100 quality score with column-level breakdowns. Track improvement over time as you clean and re-upload your data." },
  { icon: FileDown, title: "One-Click Cleaned Export", description: "Download a deduplicated, validated Excel file instantly. Rows annotated with issue flags so your team knows exactly what changed." },
  { icon: Zap, title: "AI-Powered Insights", description: "Executive-ready summaries and prioritized recommendations generated automatically — no manual analysis required." },
  { icon: ShieldCheck, title: "Enterprise Security", description: "Files processed in-memory, never stored permanently. End-to-end encryption in transit and at rest." },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const tilt = useTilt(6);
  const { ref: revealRef, visible } = useReveal();

  return (
    <div
      ref={revealRef}
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.handleMouseMove}
        onMouseLeave={tilt.handleMouseLeave}
        className="tilt-card group h-full rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
          <feature.icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
}

export function Features() {
  const { ref, visible } = useReveal();
  return (
    <section id="features" className="py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`mx-auto max-w-2xl text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Capabilities</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to trust your data</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">From a single file upload to enterprise-grade data pipelines — CorePulse handles the entire quality lifecycle.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  );
}
