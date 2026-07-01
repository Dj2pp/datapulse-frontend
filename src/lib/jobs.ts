"use client";
/**
 * jobs.ts — "Previous Jobs" history (optional dashboard feature).
 *
 * Stores lightweight job summaries only (filename, counts, timing) — not
 * the full row-level report — so localStorage doesn't balloon. Swap for a
 * real `/api/jobs` endpoint when you have persistent backend storage.
 */
import { AnalysisReport } from "./api";

export interface JobSummary {
  id: string;
  filename: string;
  rows: number;
  duplicatesRemoved: number;
  processingSeconds: number;
  qualityScore: number;
  analyzedAt: string;
}

const STORAGE_KEY = "datapulse_jobs";
const MAX_JOBS = 20;

function scopeKey(userId: string | null): string {
  return `${STORAGE_KEY}:${userId ?? "anon"}`;
}

export function getJobs(userId: string | null): JobSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(scopeKey(userId));
    return raw ? (JSON.parse(raw) as JobSummary[]) : [];
  } catch {
    return [];
  }
}

export function addJob(userId: string | null, report: AnalysisReport): void {
  if (typeof window === "undefined") return;
  const job: JobSummary = {
    id: report.meta.report_id,
    filename: report.meta.filename,
    rows: report.meta.rows,
    duplicatesRemoved: report.kpi.duplicate_records,
    processingSeconds: report.meta.processing_seconds,
    qualityScore: report.kpi.quality_score,
    analyzedAt: report.meta.analyzed_at,
  };
  const jobs = [job, ...getJobs(userId).filter((j) => j.id !== job.id)].slice(0, MAX_JOBS);
  try {
    window.localStorage.setItem(scopeKey(userId), JSON.stringify(jobs));
  } catch {
    // quota exceeded — non-critical feature, fail silently
  }
}
