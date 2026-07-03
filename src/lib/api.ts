/**
 * api.ts — Client for the CorePulse Flask backend.
 * Set NEXT_PUBLIC_API_URL in .env.local (default: http://localhost:8000).
 *
 * Progress reporting has two phases:
 *   0–40%  = file bytes uploading   (xhr.upload.onprogress — real)
 *   40–92% = backend processing      (simulated ticker — keeps bar alive)
 *   92–100% = response received      (xhr.onload)
 * This prevents the "100% frozen forever" loop appearance while the 4-phase
 * pipeline runs on the server.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dhr-d4ds.onrender.com";

import { supabase } from "./supabase";

/** Current Supabase JWT (if signed in), attached as a Bearer token on every backend call. */
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ColumnProfile {
  column: string; missing: number; total: number; pct: number; filled: number;
}
export interface FuzzyMatch {
  row_a: number; row_b: number; score: number; reason: string;
}
export interface DuplicateByColumn {
  column: string; duplicates: number; clean: number;
}
export interface RecordRow {
  _row: number; status: "clean" | "duplicate" | "missing"; issue: string | null;
  [key: string]: string | number | null;
}

export interface PipelinePhase1 { rows_in: number; rows_after_exact_dedupe: number; exact_duplicates_dropped: number; structural_errors: string[]; elapsed_seconds: number; }
export interface PipelinePhase2 { block_count: number; largest_block_size: number; elapsed_seconds: number; roles_detected: Record<string, string>; }
export interface PipelinePhase3 { pairs_found: number; blocks_processed: number; blocks_skipped_oversized: number; worker_count: number; elapsed_seconds: number; }
export interface PipelinePhase4 { clusters_found: number; rows_in_clusters: number; review_batches: number; elapsed_seconds: number; }
export interface PipelineMatch { row_a: number; row_b: number; phonetic_score: number; fuzzy_score: number; weighted_score: number; reason: string; confidence: "high" | "medium" | "low"; }
export interface PipelineCluster { cluster_id: number; rows: number[]; size: number; max_score: number; avg_score: number; }
export interface PipelineReport {
  phases: { phase1_preprocessing: PipelinePhase1; phase2_blocking: PipelinePhase2; phase3_matching: PipelinePhase3; phase4_resolution: PipelinePhase4; };
  total_elapsed_seconds: number; clusters: PipelineCluster[]; matches: PipelineMatch[];
  review_batches: { row_a: number; row_b: number; score: number; reason: string }[][];
  high_confidence_dupe_row_count: number; exact_duplicates_dropped: number;
}
export interface ComparisonRecord { _row: number; [key: string]: string | number; }
export interface Comparison {
  cluster_id: number; size: number; max_score: number; avg_score: number;
  reason: string | null; records: ComparisonRecord[]; columns: string[];
  decision: "pending" | "accept" | "reject";
}
export interface AnalysisReport {
  meta: { rows: number; columns: number; processing_seconds: number; analyzed_at: string; fuzzy_threshold: number; report_id: string; filename: string; };
  kpi: { total_records: number; duplicate_records: number; missing_value_rows: number; missing_value_cells: number; quality_score: number; };
  column_profile: ColumnProfile[]; duplicate_by_column: DuplicateByColumn[];
  exact_duplicate_groups: { first_row: number; duplicate_rows: number[] }[];
  fuzzy_matches: FuzzyMatch[]; quality_breakdown: { name: string; value: number }[];
  records: RecordRow[]; columns: string[]; row_status_map: Record<string, string>;
  pipeline?: PipelineReport;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export type UploadPhase = "uploading" | "processing" | "finalizing";

export async function analyzeFile(
  file: File,
  fuzzyThreshold: number = 85,
  onProgress?: (pct: number, phase: UploadPhase) => void
): Promise<AnalysisReport> {
  const headers = await authHeader();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fuzzy_threshold", String(fuzzyThreshold));

    // Ticker that runs after upload bytes are sent, simulating processing progress.
    // Crawls slowly from 42 → 90 so it never reaches the "done" mark on its own —
    // the xhr.onload handler clears it and snaps to 100.
    let ticker: ReturnType<typeof setInterval> | null = null;
    let simPct = 42;

    const clearTicker = () => { if (ticker) { clearInterval(ticker); ticker = null; } };

    xhr.open("POST", `${API_BASE}/api/analyze`);
    xhr.timeout = 10 * 60 * 1000; // 10 min hard cap — pipeline won't need more
    if (headers.Authorization) xhr.setRequestHeader("Authorization", headers.Authorization);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        // Upload bytes: map 0–100% → 0–40% of total progress
        const pct = Math.round((e.loaded / e.total) * 40);
        onProgress(pct, "uploading");
      }
    };

    xhr.upload.onload = () => {
      // Bytes fully sent. Start a slow ticker for the backend processing phase.
      // Increments ~0.5% every 300ms. Takes ~4 min to reach 90 from 42
      // — the actual pipeline finishes long before that for any normal file.
      onProgress?.(42, "processing");
      ticker = setInterval(() => {
        simPct = Math.min(90, simPct + 0.5);
        onProgress?.(Math.round(simPct), "processing");
        if (simPct >= 90) clearTicker();
      }, 300);
    };

    xhr.onload = () => {
      clearTicker();
      onProgress?.(100, "finalizing");
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as AnalysisReport);
        } else {
          reject(new ApiError(data.error || "Analysis failed", xhr.status));
        }
      } catch {
        reject(new ApiError("Invalid response from server", xhr.status));
      }
    };

    xhr.onerror = () => { clearTicker(); reject(new ApiError("Network error — is the backend running?", 0)); };
    xhr.ontimeout = () => { clearTicker(); reject(new ApiError("Request timed out after 10 minutes.", 0)); };

    xhr.send(formData);
  });
}

export async function getReport(reportId: string): Promise<AnalysisReport> {
  const res = await fetch(`${API_BASE}/api/report/${reportId}`, { headers: await authHeader() });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed" })); throw new ApiError(err.error, res.status); }
  return res.json();
}

export function getCleanedFileUrl(reportId: string, mode: "remove" | "flag" = "remove") {
  return `${API_BASE}/api/download/cleaned/${reportId}?mode=${mode}`;
}
export function getPdfReportUrl(reportId: string) { return `${API_BASE}/api/download/report/${reportId}`; }
export function getPipelineCsvUrl(reportId: string) { return `${API_BASE}/api/download/csv/${reportId}`; }

export async function getComparisonTable(reportId: string): Promise<{ comparisons: Comparison[]; total_clusters: number }> {
  const res = await fetch(`${API_BASE}/api/comparison/${reportId}`, { headers: await authHeader() });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed" })); throw new ApiError(err.error, res.status); }
  return res.json();
}

export async function submitReviewDecision(reportId: string, clusterId: number, decision: "accept" | "reject"): Promise<{ cluster_id: number; decision: string; saved: boolean }> {
  const res = await fetch(`${API_BASE}/api/review/${reportId}`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ cluster_id: clusterId, decision }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed" })); throw new ApiError(err.error, res.status); }
  return res.json();
}

export interface AiStatus { configured: boolean; provider: string | null; model: string | null; key_set: boolean; }
export interface AiVerdict { row_a: number; row_b: number; is_duplicate: boolean; ai_confidence: number; ai_reason: string; }
export interface AiVerifyResult { status: "not_configured" | "completed" | "failed" | "no_uncertain_pairs"; message?: string; provider?: string; model?: string; batches_sent?: number; batches_failed?: number; verdicts: AiVerdict[]; }

export async function getAiStatus(): Promise<AiStatus> {
  const res = await fetch(`${API_BASE}/api/ai-status`);
  if (!res.ok) throw new ApiError("Failed to fetch AI status", res.status);
  return res.json();
}

export async function runAiVerification(reportId: string): Promise<AiVerifyResult> {
  const res = await fetch(`${API_BASE}/api/ai-verify/${reportId}`, { method: "POST", headers: await authHeader() });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: "AI verification failed" })); throw new ApiError(err.error, res.status); }
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try { const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) }); return res.ok; }
  catch { return false; }
}
export async function wakeBackend(
  onStatus?:  (msg: string) => void,
  onElapsed?: (secs: number) => void,
  maxWaitMs = 90_000,
): Promise<boolean> {
  const POLL_MS = 2_500;
  const started = Date.now();
  let attempt = 0;
  let elapsedSecs = 0;

  const ticker = setInterval(() => {
    elapsedSecs++;
    onElapsed?.(elapsedSecs);
  }, 1_000);

  const messages = [
    "Waking up server…",
    "Server is starting, please wait…",
    "Still starting — Render cold start takes 30–60s…",
    "Almost there…",
    "Hang tight, loading your environment…",
  ];

  try {
    while (Date.now() - started < maxWaitMs) {
      onStatus?.(messages[Math.min(attempt, messages.length - 1)]);
      attempt++;
      try {
        const res = await fetch(`${API_BASE}/api/health`, {
          signal: AbortSignal.timeout(4_000),
          cache: "no-store",
        });
        if (res.ok) {
          onStatus?.("Server is ready!");
          return true;
        }
      } catch {
        // still sleeping
      }
      await new Promise<void>((r) => setTimeout(r, POLL_MS));
    }
    onStatus?.("Server did not respond. Please try again.");
    return false;
  } finally {
    clearInterval(ticker);
  }
}

