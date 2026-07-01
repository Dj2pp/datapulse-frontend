"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReveal } from "@/components/animations/useReveal";
import { useTilt } from "@/components/animations/useTilt";
import { cn } from "@/lib/utils";

const plans = [
  { name: "Starter", price: "$0", period: "forever", description: "For individuals and small experiments.", features: ["Up to 5,000 rows per file","3 uploads per month","Duplicate & missing value detection","CSV export of results","7-day result history"], cta: "Start free", highlighted: false },
  { name: "Pro", price: "$49", period: "per month", description: "For teams running regular data ops.", features: ["Up to 500,000 rows per file","Unlimited uploads","AI-powered fuzzy matching","PDF & Excel export","Dashboard & trend charts","Priority support","API access (1M rows/mo)"], cta: "Start 14-day trial", highlighted: true },
  { name: "Enterprise", price: "Custom", period: "contact us", description: "For large-scale pipelines and compliance.", features: ["Unlimited rows & uploads","Custom matching rules","SSO / SAML","Dedicated infrastructure","SLA & audit logs","On-premise deployment","Dedicated CSM"], cta: "Talk to sales", highlighted: false },
];

function PlanCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const tilt = useTilt(5);
  const { ref: revealRef, visible } = useReveal();
  return (
    <div ref={revealRef} className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100}ms` }}>
      <div
        ref={tilt.ref}
        onMouseMove={tilt.handleMouseMove}
        onMouseLeave={tilt.handleMouseLeave}
        className={cn("tilt-card relative rounded-2xl border p-8 flex flex-col h-full", plan.highlighted ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/10" : "border-border bg-card")}
      >
        {plan.highlighted && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">Most popular</Badge>}
        <div>
          <h3 className="font-semibold">{plan.name}</h3>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
            <span className="text-sm text-muted-foreground mb-0.5">/{plan.period}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
        </div>
        <ul className="mt-6 space-y-3 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/signup" className="block">
            <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} size="lg">{plan.cta}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const { ref, visible } = useReveal();
  return (
    <section id="pricing" className="py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`mx-auto max-w-2xl text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">No per-seat fees. No hidden limits. Pay for what you process.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} />)}
        </div>
      </div>
    </section>
  );
}
