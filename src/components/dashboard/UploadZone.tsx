"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, AlertCircle, SlidersHorizontal, WifiOff, Zap, Database, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReport } from "@/lib/ReportContext";
import { checkHealth, getCleanedFileUrl, getPdfReportUrl, getPipelineCsvUrl, wakeBackend } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { toFriendlyMessage, FRIENDLY_ERRORS } from "@/lib/errors";
import { validateUpload } from "@/lib/fileValidation";
import { canUploadToday, getRemainingUploadsToday, recordUpload, FREE_BETA_LIMITS } from "@/lib/rateLimit";
import { addJob } from "@/lib/jobs";
import { PrivacyNotice } from "./PrivacyNotice";
import { RemainingUploadsBadge } from "./RemainingUploadsBadge";
import { FeedbackWidget } from "./FeedbackWidget";

type LocalState = "idle" | "dragging" | "error";
type BackendStatus = "checking" | "online" | "offline";

const PHASE_LABELS = {
  uploading:   "Uploading…",
  processing:  "Processing…",
  finalizing:  "Creating report…",
};
const PHASE_ICONS = {
  uploading:  Upload,
  processing: Zap,
  finalizing: FileOutput,
};

export function UploadZone({ onAnalyzed }: { onAnalyzed?: () => void }) {
  const { upload, loading, progress, phase, error, report, reset } = useReport();
  const { user } = useAuth();
  const [local, setLocal] = useState<LocalState>("idle");
  const [fileName, setFileName] = useState("");
  const [threshold, setThreshold] = useState(85);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [localError, setLocalError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [remaining, setRemaining] = useState<number>(FREE_BETA_LIMITS.uploadsPerDay);
  const inputRef = useRef<HTMLInputElement>(null);
  const [wakeStatus,  setWakeStatus]  = useState("");
const [wakeElapsed, setWakeElapsed] = useState(0);
const [isWaking,    setIsWaking]    = useState(false);
  const userId = user?.id ?? null;

  useEffect(() => {
    setRemaining(getRemainingUploadsToday(userId));
  }, [userId, report]);

  useEffect(() => {
    let cancelled = false;
    checkHealth().then((ok) => {
      if (!cancelled) setBackendStatus(ok ? "online" : "offline");
    });
    return () => { cancelled = true; };
  }, []);

  const retryHealthCheck = useCallback(() => {
    setBackendStatus("checking");
    checkHealth().then((ok) => setBackendStatus(ok ? "online" : "offline"));
  }, []);

  const runUpload = useCallback(async (file: File) => {
    setLocalError(null);
    setFileName(file.name);
    setLocal("idle");

    if (!canUploadToday(userId)) {
      setLocalError(FRIENDLY_ERRORS.rateLimited);
      setLocal("error");
      return;
    }

    setValidating(true);
    const validation = await validateUpload(file);
    setValidating(false);

    if (!validation.ok) {
      setLocalError(validation.error ?? FRIENDLY_ERRORS.generic);
      setLocal("error");
      track("Processing Failed", { reason: validation.error, filename: file.name });
      return;
    }

    track("Upload Started", { filename: file.name, sizeBytes: file.size, rowCount: validation.rowCount });
    recordUpload(userId);
    setRemaining(getRemainingUploadsToday(userId));

    try {
      // Step 1: wake the Render server before doing anything
      setIsWaking(true);
      const online = await wakeBackend(
        (msg)  => setWakeStatus(msg),
        (secs) => setWakeElapsed(secs),
      );
      setIsWaking(false);
  
      // Step 2: if server never woke up, show error and stop
      if (!online) {
        setLocal("error");
        return;
      }
  
      // Step 3: server is alive, now do the actual upload
      await upload(file, threshold);
      onAnalyzed?.();
    } catch {
      setIsWaking(false);
      setLocal("error");
    }
  }, [upload, threshold, onAnalyzed]);

  // Persist a lightweight job summary once a report lands.
  useEffect(() => {
    if (report) addJob(userId, report);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setLocal("idle");
    const file = e.dataTransfer.files[0];
    if (file) runUpload(file);
  }, [runUpload]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // ↓ CRITICAL: reset the input value so re-uploading the same file works
    e.target.value = "";
    if (file) runUpload(file);
  };

  const tryAgain = () => { reset(); setLocal("idle"); setFileName(""); setLocalError(null); };

  const blockedByRateLimit = remaining <= 0;
  const showIdle  = !loading && !validating && !report && local !== "error";
  const showError = !loading && local === "error";
  const showDone  = !loading && !!report && local !== "error";
  const displayError = localError ?? toFriendlyMessage(error);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://dhr-d4ds.onrender.com";
  const PhaseIcon = PHASE_ICONS[phase];
 
  // Progress bar colour: blue uploading, violet processing, green finalizing
  const barColor = phase === "finalizing" ? "bg-emerald-500"
    : phase === "processing" ? "bg-violet-500"
    : "bg-primary";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Server wake-up modal — shows while Render cold-starts */}
{isWaking && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Dark backdrop */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

    {/* Modal card */}
    <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-8 text-center space-y-4 shadow-2xl">

      {/* Spinner icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>

      {/* Title and live status message */}
      <div>
        <h3 className="text-base font-semibold">Starting server…</h3>
        <p className="text-sm text-muted-foreground mt-1">{wakeStatus}</p>
      </div>

      {/* Live elapsed seconds counter */}
      <p className="text-xs text-muted-foreground">
        ⏱ {wakeElapsed}s elapsed · Render cold start takes 30–60s
      </p>

    </div>
  </div>
)}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">Upload a file</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            .xlsx only · Max {FREE_BETA_LIMITS.maxRows.toLocaleString()} rows · Max {FREE_BETA_LIMITS.maxFileMb}MB · Free Beta
          </p>
        </div>
        <RemainingUploadsBadge remaining={remaining} total={FREE_BETA_LIMITS.uploadsPerDay} />
      </div>

      <PrivacyNotice />

      {/* Backend connectivity banner */}
      {backendStatus === "offline" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Service temporarily unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">
              We can&apos;t reach the analysis server right now. Please try again in a moment.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <>
                <p className="text-xs text-muted-foreground mt-2">
                  Dev only — couldn&apos;t reach <code className="px-1 py-0.5 rounded bg-muted font-mono">{apiBase}</code>. Start it with:
                </p>
                <pre className="mt-2 rounded-lg bg-muted px-3 py-2 text-[11px] font-mono overflow-x-auto">cd backend{"\n"}pip install -r requirements.txt{"\n"}python run.py</pre>
              </>
            )}
          </div>
          <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs" onClick={retryHealthCheck}>Retry</Button>
        </div>
      )}

      {/* Rate limit banner */}
      {blockedByRateLimit && backendStatus !== "offline" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Daily limit reached</p>
            <p className="text-xs text-muted-foreground mt-1">{FRIENDLY_ERRORS.rateLimited}</p>
          </div>
        </div>
      )}

      {/* Fuzzy threshold slider */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Fuzzy match sensitivity</span>
            <span className="font-medium">{threshold}%</span>
          </div>
          <input
            type="range" min={50} max={100} value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={loading}
            className="w-full h-1.5 accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Broad (50%)</span><span>Strict (100%)</span>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      {showIdle && (
        <div
          onDragOver={(e) => { e.preventDefault(); if (backendStatus !== "offline" && !blockedByRateLimit) setLocal("dragging"); }}
          onDragLeave={() => setLocal("idle")}
          onDrop={backendStatus === "offline" || blockedByRateLimit ? (e) => e.preventDefault() : handleDrop}
          onClick={() => { if (backendStatus !== "offline" && !blockedByRateLimit) inputRef.current?.click(); }}
          className={cn(
            "upload-zone relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300",
            backendStatus === "offline" || blockedByRateLimit
              ? "cursor-not-allowed opacity-60 border-border"
              : local === "dragging"
                ? "border-primary bg-primary/5 scale-[1.02] cursor-pointer"
                : "border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
          )}
        >
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300", local === "dragging" ? "bg-primary/15 scale-110" : "bg-muted")}>
            <Upload className={cn("h-7 w-7 transition-colors", local === "dragging" ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="font-semibold text-sm">{local === "dragging" ? "Drop to analyze" : "Drag & drop your file here"}</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse · .xlsx only</p>
          </div>
          <Button variant="outline" size="sm" className="pointer-events-none" disabled={backendStatus === "offline" || blockedByRateLimit}>Browse files</Button>
          <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} disabled={backendStatus === "offline" || blockedByRateLimit} />
        </div>
      )}

      {/* Validating (client-side pre-flight checks) */}
      {validating && (
        <Card>
          <CardContent className="p-8 flex items-center gap-3 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Checking file type, size & row count…</p>
          </CardContent>
        </Card>
      )}

      {/* Loading — shows distinct phases so the bar never looks frozen */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {PHASE_LABELS[phase]}
                </p>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
            </div>

            {/* Multi-phase progress bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <PhaseIcon className="h-3 w-3" />
                  {phase === "uploading" ? "Uploading" : phase === "processing" ? "Processing" : "Creating report"}
                </span>
                <span className="font-medium tabular-nums">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", barColor)}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Phase step indicators */}
              <div className="flex items-center gap-0 mt-1">
                {(["uploading", "processing", "finalizing"] as const).map((p, i) => (
                  <div key={p} className="flex items-center flex-1">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
                      phase === p ? "bg-primary scale-125" :
                      (i === 0 && phase !== "uploading") || (i === 1 && phase === "finalizing")
                        ? "bg-emerald-500" : "bg-muted"
                    )} />
                    {i < 2 && <div className={cn("h-px flex-1 transition-colors",
                      (i === 0 && phase !== "uploading") || (i === 1 && phase === "finalizing")
                        ? "bg-emerald-500" : "bg-muted")} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                <span>Upload</span><span className="text-center">Process</span><span>Report</span>
              </div>

              {phase === "processing" && (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                  The 4-phase engine is running fingerprint blocking, parallel fuzzy matching, and graph clustering across all rows. Large files may take 20-60s.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {showError && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Analysis failed</h3>
            <p className="text-xs text-muted-foreground mb-6 whitespace-pre-line">{displayError}</p>
            <Button size="sm" variant="outline" onClick={tryAgain}>Try again</Button>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {showDone && report && (
        <>
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div className="text-center mb-6">
                <h3 className="font-semibold text-sm mb-1">Finished ✅</h3>
                <p className="text-xs text-muted-foreground">{report.meta.filename}</p>
              </div>

              {/* Exact-format summary */}
              <div className="rounded-xl border border-border bg-background px-4 py-3 mb-6 font-mono text-xs space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Rows:</span><span className="font-semibold">{report.meta.rows.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duplicates Removed:</span><span className="font-semibold">{report.kpi.duplicate_records.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Processing Time:</span><span className="font-semibold">{report.meta.processing_seconds}s</span></div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl border border-border bg-background p-3 text-center">
                  <div className="text-lg font-semibold">{report.kpi.duplicate_records.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Duplicates found</div>
                </div>
                <div className="rounded-xl border border-border bg-background p-3 text-center">
                  <div className="text-lg font-semibold">{report.kpi.missing_value_rows.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Missing data rows</div>
                </div>
                <div className="rounded-xl border border-border bg-background p-3 text-center">
                  <div className="text-lg font-semibold">{report.kpi.quality_score.toFixed(1)}</div>
                  <div className="text-[10px] text-muted-foreground">Quality score</div>
                </div>
              </div>

              {/* Downloads */}
              <div className="rounded-xl border border-border bg-background p-4 mb-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-3">Download results</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={getCleanedFileUrl(report.meta.report_id, "remove")}
                    download
                    onClick={() => track("Download Clicked", { type: "cleaned_xlsx_remove", reportId: report.meta.report_id })}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <Database className="h-3.5 w-3.5 text-primary shrink-0" />
                    Cleaned .xlsx
                    <span className="ml-auto text-[10px] text-muted-foreground">dupes removed</span>
                  </a>
                  <a
                    href={getCleanedFileUrl(report.meta.report_id, "flag")}
                    download
                    onClick={() => track("Download Clicked", { type: "cleaned_xlsx_flag", reportId: report.meta.report_id })}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <Database className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Flagged .xlsx
                    <span className="ml-auto text-[10px] text-muted-foreground">status column</span>
                  </a>
                  <a
                    href={getPdfReportUrl(report.meta.report_id)}
                    download
                    onClick={() => track("Download Clicked", { type: "pdf_report", reportId: report.meta.report_id })}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <FileOutput className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    Report .pdf
                    <span className="ml-auto text-[10px] text-muted-foreground">full summary</span>
                  </a>
                </div>
                {report.pipeline && (
                  <a
                    href={getPipelineCsvUrl(report.meta.report_id)}
                    download
                    onClick={() => track("Download Clicked", { type: "pipeline_csv", reportId: report.meta.report_id })}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent transition-colors w-full"
                  >
                    <Zap className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    Pipeline .csv
                    <span className="ml-auto text-[10px] text-muted-foreground">cluster-aware dedup</span>
                  </a>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={onAnalyzed}>View dashboard →</Button>
                <Button size="sm" variant="outline" onClick={tryAgain}>Upload another</Button>
              </div>
            </CardContent>
          </Card>

          <FeedbackWidget reportId={report.meta.report_id} />
        </>
      )}
    </div>
  );
}
