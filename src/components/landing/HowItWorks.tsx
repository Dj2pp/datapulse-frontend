"use client";
import { Upload, Cpu, BarChart3, Download } from "lucide-react";
import { useReveal } from "@/components/animations/useReveal";

const steps = [
  { icon: Upload, title: "Upload your file", description: "Drag and drop any Excel (.xlsx, .xls) or CSV file. No formatting requirements — we handle messy real-world data.", color: "bg-blue-500/10 text-blue-500" },
  { icon: Cpu, title: "AI analyzes in seconds", description: "Our engine runs 12 quality checks simultaneously: duplicates, missing values, format inconsistencies, outliers, and more.", color: "bg-indigo-500/10 text-indigo-500" },
  { icon: BarChart3, title: "Review the dashboard", description: "Explore interactive charts, browse flagged records, and read AI-generated findings with prioritized recommendations.", color: "bg-violet-500/10 text-violet-500" },
  { icon: Download, title: "Export and act", description: "Download a cleaned file or a detailed PDF report. Share with your team or pipe results into your CRM via API.", color: "bg-blue-500/10 text-blue-500" },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  // Each card gets its own hook call at the top level of its own component —
  // calling useReveal() directly inside the parent's .map() would violate
  // React's Rules of Hooks (hooks can't be called in loops) and can crash
  // the page with "Rendered more/fewer hooks than during the previous render".
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-start gap-4 sm:items-center sm:text-center transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background shadow-sm">
        <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${step.color.split(" ")[0]}`}>
          <step.icon className={`h-3.5 w-3.5 ${step.color.split(" ")[1]}`} />
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Step {index + 1}</p>
        <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const { ref, visible } = useReveal();
  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`mx-auto max-w-2xl text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Process</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From upload to insight in under 10 seconds</h2>
        </div>
        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-5 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          {steps.map((step, i) => <StepCard key={step.title} step={step} index={i} />)}
        </div>
      </div>
    </section>
  );
}
