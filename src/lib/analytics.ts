"use client";
/**
 * analytics.ts — minimal event tracker.
 *
 * Wire this up to PostHog/Amplitude/GA/Segment/etc. by replacing the body
 * of `track()`. For now it logs to the console and keeps a rolling buffer
 * in localStorage so you can inspect what would have been sent.
 *
 * Events tracked across the app: "Upload Started", "Upload Completed",
 * "Download Clicked", "Processing Failed", "Feedback Submitted",
 * "Signed Up", "Logged In", "Logged Out".
 */

export type AnalyticsEvent =
  | "Upload Started"
  | "Upload Completed"
  | "Download Clicked"
  | "Processing Failed"
  | "Feedback Submitted"
  | "Signed Up"
  | "Logged In"
  | "Logged Out";

interface AnalyticsRecord {
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
  timestamp: string;
}

const STORAGE_KEY = "datapulse_analytics";
const MAX_BUFFERED_EVENTS = 200;

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  const record: AnalyticsRecord = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${event}`, properties ?? {});
  }

  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const buffer: AnalyticsRecord[] = raw ? JSON.parse(raw) : [];
    buffer.push(record);
    while (buffer.length > MAX_BUFFERED_EVENTS) buffer.shift();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — analytics is best-effort
  }
}

export function getBufferedEvents(): AnalyticsRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
