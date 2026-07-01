"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { Zap } from "lucide-react";
import { AuthBackground } from "./AuthBackground";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">DataPulse</span>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </main>
  );
}
