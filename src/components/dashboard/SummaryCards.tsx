"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReveal } from "@/components/animations/useReveal";
import { useReport } from "@/lib/ReportContext";
import { AlertTriangle, Info, ArrowRight } from "lucide-react";

export function SummaryCards() {
  const { ref, visible } = useReveal();
  const { report } = useReport();

  if (!report) return null;

  const { kpi, column_profile, fuzzy_matches, meta } = report;
  const dupPct = kpi.total_records ? ((kpi.duplicate_records / kpi.total_records) * 100).toFixed(1) : "0";
  const grade = kpi.quality_score >= 90 ? "excellent" : kpi.quality_score >= 75 ? "good" : kpi.quality_score >= 60 ? "fair" : "poor";

  const worstCols = column_profile.filter(c => c.missing > 0).slice(0, 4);
  const topFuzzy = fuzzy_matches.slice(0, 4);

  const actions: { priority: "high" | "medium" | "low"; action: string; impact: string }[] = [];
  if (kpi.duplicate_records > 0) {
    actions.push({
      priority: "high",
      action: `Remove ${kpi.duplicate_records.toLocaleString()} flagged duplicate records`,
      impact: `Reduces dataset by ${dupPct}% — download the cleaned file from Results.`,
    });
  }
  if (worstCols[0]) {
    actions.push({
      priority: worstCols[0].pct > 25 ? "high" : "medium",
      action: `Investigate '${worstCols[0].column}' — ${worstCols[0].pct}% missing`,
      impact: `${worstCols[0].missing.toLocaleString()} rows affected. Consider enrichment or marking optional.`,
    });
  }
  if (topFuzzy.length > 0) {
    actions.push({
      priority: "medium",
      action: `Manually review ${fuzzy_matches.length} fuzzy-matched pairs`,
      impact: "These are near-duplicates below 98% confidence — verify before removing.",
    });
  }
  if (kpi.quality_score < 75) {
    actions.push({ priority: "high", action: "Quality score below 75 — re-analyze after cleanup", impact: "Score is a weighted blend of completeness and uniqueness." });
  }
  if (actions.length === 0) {
    actions.push({ priority: "low", action: "No critical issues detected", impact: "Dataset meets quality thresholds for production use." });
  }

  const PRIORITY: Record<string, string> = {
    high: "bg-red-500/10 text-red-600 dark:text-red-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <div ref={ref} className={`grid grid-cols-1 gap-4 lg:grid-cols-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm"><Info className="h-4 w-4 text-primary" />Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Analysis of {kpi.total_records.toLocaleString()} records from <span className="font-medium text-foreground">{meta.filename}</span> completed
            in {meta.processing_seconds}s. The dataset scored <span className="font-medium text-foreground">{kpi.quality_score.toFixed(1)}/100</span>,
            rated <span className="font-medium text-foreground">{grade}</span>. {kpi.duplicate_records.toLocaleString()} duplicate
            records ({dupPct}%) were found via exact match and fuzzy matching (Levenshtein + Soundex + normalized email/phone) at a
            {" "}{meta.fuzzy_threshold}% similarity threshold.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-amber-500" />Key Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {kpi.duplicate_records.toLocaleString()} duplicate records detected ({dupPct}% of total)
            </li>
            <li className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {fuzzy_matches.length} fuzzy match pairs found (name/email/phone similarity)
            </li>
            {worstCols.map(c => (
              <li key={c.column} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                '{c.column}' missing in {c.pct}% of rows ({c.missing.toLocaleString()})
              </li>
            ))}
            <li className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              Quality score: {kpi.quality_score.toFixed(1)}/100 ({grade})
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-emerald-500" />Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize ${PRIORITY[a.priority]}`}>
                  {a.priority}
                </span>
                <div>
                  <p className="text-xs font-medium">{a.action}</p>
                  <p className="text-[11px] text-muted-foreground">{a.impact}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
