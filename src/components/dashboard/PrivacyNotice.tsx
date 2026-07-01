import { ShieldCheck } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground">Your data stays yours.</span>{" "}
        Files are automatically deleted after processing. We do not permanently store your Excel data.
      </p>
    </div>
  );
}
