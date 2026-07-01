"use client";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function RemainingUploadsBadge({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  const depleted = remaining <= 0;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        depleted
          ? "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400"
          : "border-border bg-muted/50 text-muted-foreground"
      )}
    >
      <Zap className="h-3 w-3" />
      {remaining}/{total} uploads left today
    </div>
  );
}
