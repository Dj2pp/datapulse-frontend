"use client";
import { useEffect, useState, useCallback } from "react";
import { GitCompareArrows, Check, X, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReport } from "@/lib/ReportContext";
import { getComparisonTable, submitReviewDecision, getAiStatus, runAiVerification, Comparison, AiStatus } from "@/lib/api";

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 90) return <Badge variant="success">High · {score.toFixed(0)}%</Badge>;
  if (score >= 70) return <Badge variant="warning">Medium · {score.toFixed(0)}%</Badge>;
  return <Badge variant="secondary">Low · {score.toFixed(0)}%</Badge>;
}

function ClusterCard({ comparison, reportId, onDecision }: { comparison: Comparison; reportId: string; onDecision: (id: number, decision: "accept" | "reject") => void }) {
  const [expanded, setExpanded] = useState(true);
  const [submitting, setSubmitting] = useState<"accept" | "reject" | null>(null);

  const decide = useCallback(async (decision: "accept" | "reject") => {
    setSubmitting(decision);
    try {
      await submitReviewDecision(reportId, comparison.cluster_id, decision);
      onDecision(comparison.cluster_id, decision);
    } finally {
      setSubmitting(null);
    }
  }, [reportId, comparison.cluster_id, onDecision]);

  const decided = comparison.decision !== "pending";

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all",
      comparison.decision === "accept" && "border-emerald-500/40 bg-emerald-500/[0.03]",
      comparison.decision === "reject" && "border-red-500/30 bg-red-500/[0.02] opacity-60",
      comparison.decision === "pending" && "border-border"
    )}>
      <div className="flex items-center justify-between gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 min-w-0">
          <GitCompareArrows className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{comparison.size} potential duplicates · cluster #{comparison.cluster_id}</p>
            {comparison.reason && <p className="text-xs text-muted-foreground truncate">{comparison.reason}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConfidenceBadge score={comparison.max_score} />
          {decided && (
            <Badge variant={comparison.decision === "accept" ? "success" : "destructive"} className="capitalize">
              {comparison.decision}d
            </Badge>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Row</th>
                  {comparison.columns.map(col => (
                    <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.records.map((rec, i) => (
                  <tr key={rec._row} className={i === 0 ? "bg-primary/[0.03]" : ""}>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {rec._row} {i === 0 && <span className="text-[10px] text-primary ml-1">(keep)</span>}
                    </td>
                    {comparison.columns.map(col => (
                      <td key={col} className="px-3 py-2 max-w-[160px] truncate">{String(rec[col] ?? "") || <span className="text-muted-foreground/40">—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm" variant={comparison.decision === "accept" ? "default" : "outline"}
              className="h-7 text-xs gap-1.5" disabled={submitting !== null}
              onClick={() => decide("accept")}
            >
              {submitting === "accept" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Confirm duplicate
            </Button>
            <Button
              size="sm" variant={comparison.decision === "reject" ? "destructive" : "outline"}
              className="h-7 text-xs gap-1.5" disabled={submitting !== null}
              onClick={() => decide("reject")}
            >
              {submitting === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              Not a duplicate
            </Button>
            <span className="text-[11px] text-muted-foreground ml-auto">
              Confirming removes rows {comparison.records.slice(1).map(r => r._row).join(", ")} from the cleaned export.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComparisonTable() {
  const { report } = useReport();
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "accept" | "reject">("all");
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  useEffect(() => {
    getAiStatus().then(setAiStatus).catch(() => setAiStatus(null));
  }, []);

  useEffect(() => {
    if (!report) return;
    setLoading(true);
    getComparisonTable(report.meta.report_id)
      .then(res => setComparisons(res.comparisons))
      .catch(() => setComparisons([]))
      .finally(() => setLoading(false));
  }, [report]);

  const handleDecision = useCallback((clusterId: number, decision: "accept" | "reject") => {
    setComparisons(prev => prev.map(c => c.cluster_id === clusterId ? { ...c, decision } : c));
  }, []);

  const runAiCheck = useCallback(async () => {
    if (!report) return;
    setAiRunning(true);
    setAiMessage(null);
    try {
      const result = await runAiVerification(report.meta.report_id);
      if (result.status === "completed") {
        setAiMessage(`AI reviewed ${result.verdicts.length} uncertain pair(s) across ${result.batches_sent} batch(es). Refreshing…`);
        const refreshed = await getComparisonTable(report.meta.report_id);
        setComparisons(refreshed.comparisons);
      } else if (result.status === "no_uncertain_pairs") {
        setAiMessage("No medium-confidence pairs needed AI review — every match was already high or low confidence.");
      } else if (result.status === "not_configured") {
        setAiMessage(result.message || "AI provider not configured.");
      } else {
        setAiMessage("AI verification failed — check your API key in backend/.env and try again.");
      }
    } catch {
      setAiMessage("Could not reach the AI verification endpoint.");
    } finally {
      setAiRunning(false);
    }
  }, [report]);

  if (!report) {
    return (
      <Card>
        <CardContent className="p-16 text-center text-sm text-muted-foreground">
          Upload a file to see the duplicate comparison table.
        </CardContent>
      </Card>
    );
  }

  const filtered = filter === "all" ? comparisons : comparisons.filter(c => c.decision === filter);
  const pendingCount = comparisons.filter(c => c.decision === "pending").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Duplicate Comparison &amp; Manual Review</CardTitle>
            <CardDescription>
              {comparisons.length} clusters found via fingerprint blocking + parallel fuzzy matching
              {pendingCount > 0 && <> · <span className="text-amber-600 dark:text-amber-400 font-medium">{pendingCount} pending review</span></>}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {(["all", "pending", "accept", "reject"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >{f}</button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* AI verification panel — see backend/app/ai_verify.py to connect a
            free API key (Groq/OpenRouter/Gemini). Works fine without one
            too; this just stays informative instead of doing anything. */}
        <div className={cn(
          "flex items-center gap-3 rounded-xl border p-3 mb-2",
          aiStatus?.configured ? "border-violet-500/30 bg-violet-500/5" : "border-border bg-muted/30"
        )}>
          <div className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
            aiStatus?.configured ? "bg-violet-500/15 text-violet-500" : "bg-muted text-muted-foreground"
          )}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            {aiStatus?.configured ? (
              <>
                <p className="text-xs font-medium">AI verification ready — {aiStatus.provider} ({aiStatus.model})</p>
                <p className="text-xs text-muted-foreground">Batches medium-confidence pairs (10-20 per call) to your configured model for a second opinion.</p>
              </>
            ) : (
              <>
                <p className="text-xs font-medium">AI verification not connected</p>
                <p className="text-xs text-muted-foreground">
                  Add a free API key in <code className="px-1 py-0.5 rounded bg-muted font-mono">backend/.env</code> (Groq, OpenRouter, or Gemini) to auto-verify uncertain matches. Manual review below works either way.
                </p>
              </>
            )}
          </div>
          <Button
            size="sm" variant={aiStatus?.configured ? "default" : "outline"}
            className="shrink-0 h-8 text-xs gap-1.5"
            disabled={!aiStatus?.configured || aiRunning}
            onClick={runAiCheck}
          >
            {aiRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Verify with AI
          </Button>
        </div>
        {aiMessage && (
          <p className="text-xs text-muted-foreground px-1 pb-1">{aiMessage}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading comparison clusters…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            {comparisons.length === 0 ? "No duplicate clusters found — this dataset looks clean." : `No ${filter} clusters.`}
          </div>
        ) : (
          filtered.map(c => (
            <ClusterCard key={c.cluster_id} comparison={c} reportId={report.meta.report_id} onDecision={handleDecision} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
