"use client";
/**
 * rateLimit.ts — Free Beta limits, enforced client-side.
 *
 * NOTE: this is a UX guard, not a security boundary — someone could clear
 * localStorage and re-upload. Real enforcement (and the source of truth
 * for "remaining uploads") should live on the backend, keyed off the
 * authenticated user. This module is written so swapping the storage
 * layer for an API call later only touches this file.
 */

export const FREE_BETA_LIMITS = {
  uploadsPerDay: 3,
  maxRows: 10_000,
  maxFileMb: 10,
} as const;

const STORAGE_KEY = "datapulse_upload_log";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function scopeKey(userId: string | null): string {
  return `${STORAGE_KEY}:${userId ?? "anon"}`;
}

interface UploadLog {
  date: string;
  count: number;
}

function readLog(userId: string | null): UploadLog {
  if (typeof window === "undefined") return { date: todayKey(), count: 0 };
  try {
    const raw = window.localStorage.getItem(scopeKey(userId));
    if (!raw) return { date: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as UploadLog;
    if (parsed.date !== todayKey()) return { date: todayKey(), count: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function writeLog(userId: string | null, log: UploadLog) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(scopeKey(userId), JSON.stringify(log));
  } catch {
    // ignore quota errors — fails open, which is the safer direction for UX
  }
}

export function getUploadsUsedToday(userId: string | null): number {
  return readLog(userId).count;
}

export function getRemainingUploadsToday(userId: string | null): number {
  return Math.max(0, FREE_BETA_LIMITS.uploadsPerDay - getUploadsUsedToday(userId));
}

export function canUploadToday(userId: string | null): boolean {
  return getRemainingUploadsToday(userId) > 0;
}

export function recordUpload(userId: string | null): void {
  const log = readLog(userId);
  writeLog(userId, { date: log.date, count: log.count + 1 });
}
