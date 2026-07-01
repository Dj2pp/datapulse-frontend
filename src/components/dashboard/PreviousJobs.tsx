"use client";
import { useEffect, useState } from "react";
import { FileSpreadsheet, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getJobs, JobSummary } from "@/lib/jobs";

export function PreviousJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);

  useEffect(() => {
    setJobs(getJobs(user?.id ?? null));
  }, [user]);

  if (jobs.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Previous jobs</h3>
      <div className="space-y-1.5">
        {jobs.slice(0, 5).map((job) => (
          <div
            key={job.id}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs hover:bg-accent/50 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium truncate flex-1">{job.filename}</span>
            <span className="text-muted-foreground shrink-0">{job.rows.toLocaleString()} rows</span>
            <span className="text-muted-foreground shrink-0">{job.duplicatesRemoved.toLocaleString()} dupes</span>
            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              {new Date(job.analyzedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
