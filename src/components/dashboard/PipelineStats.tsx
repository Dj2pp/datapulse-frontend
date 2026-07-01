"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers, GitBranch, Cpu, Network, Zap } from "lucide-react";
import { useReport } from "@/lib/ReportContext";
import { useReveal } from "@/components/animations/useReveal";

function PhaseRow({ icon: Icon, label, detail, ms, color }: { icon: React.ElementType; label: string; detail: string; ms: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{detail}</p>
      </div>
      <span className="text-xs font-mono text-muted-foreground shrink-0">{ms.toFixed(1)}ms</span>
    </div>
  );
}

export function PipelineStats() {
  const { report } = useReport();
  const { ref, visible } = useReveal();

  if (!report?.pipeline) return null;
  const { phases, total_elapsed_seconds } = report.pipeline;

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Processing Pipeline
          </CardTitle>
          <CardDescription>
            4-phase architecture · fingerprint blocking → parallel matching → graph clustering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            <PhaseRow
              icon={Layers}
              label="Phase 1 · Pre-processing"
              detail={`${phases.phase1_preprocessing.exact_duplicates_dropped} exact duplicates dropped via hash set`}
              ms={phases.phase1_preprocessing.elapsed_seconds * 1000}
              color="bg-blue-500/10 text-blue-500"
            />
            <PhaseRow
              icon={GitBranch}
              label="Phase 2 · Fingerprint Blocking"
              detail={`${phases.phase2_blocking.block_count} blocks · largest ${phases.phase2_blocking.largest_block_size} rows`}
              ms={phases.phase2_blocking.elapsed_seconds * 1000}
              color="bg-indigo-500/10 text-indigo-500"
            />
            <PhaseRow
              icon={Cpu}
              label="Phase 3 · Parallel Matching"
              detail={`${phases.phase3_matching.pairs_found} pairs scored across ${phases.phase3_matching.worker_count} thread workers`}
              ms={phases.phase3_matching.elapsed_seconds * 1000}
              color="bg-violet-500/10 text-violet-500"
            />
            <PhaseRow
              icon={Network}
              label="Phase 4 · Graph Resolution"
              detail={`${phases.phase4_resolution.clusters_found} clusters via union-find connected components`}
              ms={phases.phase4_resolution.elapsed_seconds * 1000}
              color="bg-emerald-500/10 text-emerald-500"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total pipeline time</span>
            <span className="text-sm font-semibold text-primary">{(total_elapsed_seconds * 1000).toFixed(1)}ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
