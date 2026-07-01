"use client";
import { useState } from "react";
import { Star, Flag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

export function FeedbackWidget({ reportId }: { reportId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const submitRating = (value: number) => {
    setRating(value);
    setSubmitted(true);
    track("Feedback Submitted", { reportId, type: "rating", value });
  };

  const submitIssue = () => {
    track("Feedback Submitted", {
      reportId,
      type: "incorrect_duplicate_report",
      details: issueText.slice(0, 500),
    });
    setIssueSubmitted(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {!submitted ? (
        <>
          <p className="text-xs font-medium text-center mb-2">How did this report look?</p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => submitRating(value)}
                aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                className="p-0.5"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    (hoverRating || rating) >= value
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 py-1">
          <CheckCircle2 className="h-4 w-4" /> Thanks for the feedback!
        </div>
      )}

      <div className="mt-3 border-t border-border pt-3 text-center">
        {!showIssueForm ? (
          <button
            type="button"
            onClick={() => setShowIssueForm(true)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="h-3.5 w-3.5" /> Report an incorrect duplicate detection
          </button>
        ) : issueSubmitted ? (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Report sent — thank you, this helps us improve the engine.
          </div>
        ) : (
          <div className="space-y-2 text-left">
            <textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Which row(s) were flagged incorrectly, and what should the result have been?"
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowIssueForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitIssue} disabled={issueText.trim().length === 0}>
                Send report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
