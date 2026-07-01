/**
 * errors.ts — turns raw/backend error strings into the friendly,
 * actionable copy from the product spec, e.g.:
 *
 *   500 Internal Server Error
 *     -> "❌ Unsupported file. Please upload a valid .xlsx file."
 *
 *   "Maximum rows exceeded"
 *     -> "Maximum 10,000 rows allowed in Beta."
 */
import { FREE_BETA_LIMITS } from "./rateLimit";

export const FRIENDLY_ERRORS = {
  unsupportedFile: "❌ Unsupported file.\n\nPlease upload a valid .xlsx file.",
  tooManyRows: `Maximum ${FREE_BETA_LIMITS.maxRows.toLocaleString()} rows allowed in Beta.`,
  tooLarge: `File is too large. Maximum ${FREE_BETA_LIMITS.maxFileMb}MB allowed in Beta.`,
  rateLimited: `Daily upload limit reached (${FREE_BETA_LIMITS.uploadsPerDay}/${FREE_BETA_LIMITS.uploadsPerDay}). Try again tomorrow.`,
  backendOffline: "We couldn't reach the analysis server. Please try again in a moment.",
  generic: "Something went wrong while processing your file. Please try again.",
} as const;

/** Maps a raw error (often straight from the network/backend) to friendly copy. */
export function toFriendlyMessage(raw: string | null | undefined): string {
  if (!raw) return FRIENDLY_ERRORS.generic;
  const lower = raw.toLowerCase();

  if (lower.includes("network error") || lower.includes("backend")) {
    return FRIENDLY_ERRORS.backendOffline;
  }
  if (lower.includes("500") || lower.includes("internal server error")) {
    return FRIENDLY_ERRORS.generic;
  }
  if (lower.includes("row")) {
    return FRIENDLY_ERRORS.tooManyRows;
  }
  if (lower.includes("extension") || lower.includes("file type") || lower.includes("xlsx")) {
    return FRIENDLY_ERRORS.unsupportedFile;
  }
  if (lower.includes("expired") || lower.includes("no longer available")) {
    return "This report has expired. Please upload the file again.";
  }
  // Otherwise, in dev it's useful to see the backend's actual message;
  // in production, never surface raw/unrecognized error text to users
  // (it could be a stack trace, internal path, or other implementation
  // detail) — fall back to generic, friendly copy instead.
  if (process.env.NODE_ENV !== "production") return raw;
  return FRIENDLY_ERRORS.generic;
}
