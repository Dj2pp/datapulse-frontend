"use client";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { useTilt } from "@/components/animations/useTilt";

interface KpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: React.ElementType;
  description: string;
  delay?: number;
}

export function KpiCard({ title, value, suffix = "", prefix = "", decimals = 0, icon: Icon, description, delay = 0 }: KpiCardProps) {
  const tilt = useTilt(7);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      className="tilt-card animate-reveal-up"
      style={{ animationDelay: `${delay}ms`, transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out" }}
    >
      <Card className="h-full overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-semibold tracking-tight">
            {prefix}<AnimatedCounter target={value} suffix={suffix} decimals={decimals} duration={1400} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
