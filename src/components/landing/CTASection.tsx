"use client";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/components/animations/useReveal";
import { ParticleField } from "@/components/animations/ParticleField";

export function CTASection() {
  const { ref, visible } = useReveal();

  return (
    <section className="relative overflow-hidden border-t border-border py-20 sm:py-28">
      <ParticleField />

      {/* Animated gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] animate-gradient-pan"
        style={{
          backgroundImage:
            "linear-gradient(120deg, hsl(var(--primary)), #6366f1, hsl(var(--primary)))",
        }}
      />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      <div
        ref={ref}
        className={`relative mx-auto max-w-3xl px-4 text-center transition-all duration-700 sm:px-6 lg:px-8 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Stop shipping spreadsheets you don&apos;t trust.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
          Upload your first file and get a full duplicate and data-quality report in
          under 10 seconds — no credit card, no setup.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="xl" className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              Upload a file — free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="xl" variant="outline" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
