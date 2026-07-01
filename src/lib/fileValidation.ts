/**
 * fileValidation.ts — pre-flight checks that run BEFORE a file is sent to
 * the backend, so the user gets instant, friendly feedback instead of
 * waiting on a round trip (or a generic 500) for things we can catch
 * locally: wrong extension, file too large, too many rows.
 *
 * `xlsx` (SheetJS) is a large library, so it's dynamically imported only
 * when we actually need to parse a workbook — not bundled into every page
 * that touches file validation.
 */
import { FREE_BETA_LIMITS } from "./rateLimit";
import { FRIENDLY_ERRORS } from "./errors";

export interface ValidationResult {
  ok: boolean;
  error?: string;
  rowCount?: number;
}

export function validateExtension(file: File): ValidationResult {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx")) {
    return { ok: false, error: FRIENDLY_ERRORS.unsupportedFile };
  }
  return { ok: true };
}

export function validateFileSize(file: File): ValidationResult {
  const maxBytes = FREE_BETA_LIMITS.maxFileMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, error: FRIENDLY_ERRORS.tooLarge };
  }
  return { ok: true };
}

/** Reads just enough of the workbook to count data rows on the first sheet. */
export async function validateRowCount(file: File): Promise<ValidationResult> {
  try {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", sheetRows: 0 });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { ok: false, error: FRIENDLY_ERRORS.unsupportedFile };
    }
    const sheet = workbook.Sheets[firstSheetName];
    const ref = sheet["!ref"];
    if (!ref) return { ok: true, rowCount: 0 };
    const range = XLSX.utils.decode_range(ref);
    // Subtract 1 for the header row; clamp at 0 for empty sheets.
    const rowCount = Math.max(0, range.e.r - range.s.r);
    if (rowCount > FREE_BETA_LIMITS.maxRows) {
      return { ok: false, error: FRIENDLY_ERRORS.tooManyRows, rowCount };
    }
    return { ok: true, rowCount };
  } catch {
    // If we can't parse it client-side, let the backend be the source of
    // truth rather than blocking a possibly-valid file on a parsing quirk.
    return { ok: true };
  }
}

/** Runs all pre-flight checks in order, short-circuiting on the first failure. */
export async function validateUpload(file: File): Promise<ValidationResult> {
  const extCheck = validateExtension(file);
  if (!extCheck.ok) return extCheck;

  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.ok) return sizeCheck;

  return validateRowCount(file);
}
