"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnalysisReport, analyzeFile, ApiError, UploadPhase } from "@/lib/api";

interface ReportContextValue {
  report: AnalysisReport | null;
  loading: boolean;
  progress: number;
  phase: UploadPhase;
  error: string | null;
  upload: (file: File, fuzzyThreshold?: number) => Promise<void>;
  reset: () => void;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<UploadPhase>("uploading");
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, fuzzyThreshold = 85) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setPhase("uploading");
    try {
      const result = await analyzeFile(file, fuzzyThreshold, (pct, ph) => {
        setProgress(pct);
        setPhase(ph);
      });
      setReport(result);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Something went wrong analyzing the file.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setError(null);
    setProgress(0);
    setPhase("uploading");
  }, []);

  return (
    <ReportContext.Provider value={{ report, loading, progress, phase, error, upload, reset }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used within a ReportProvider");
  return ctx;
}
