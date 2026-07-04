export const faqs = [
  {
    q: "What file formats are supported?",
    a: "CorePulse supports Excel (.xlsx, .xls), CSV, and TSV files. You can upload files up to 50MB on the free plan and larger files on paid plans.",
  },
  {
    q: "How does fuzzy duplicate detection work?",
    a: "We use a combination of Levenshtein distance, Soundex phonetic matching, and token-based comparison to catch near-duplicates like 'Jon Smith' vs 'John Smith'. Sensitivity thresholds are configurable.",
  },
  {
    q: "Is my data secure and private?",
    a: "Yes. Files are processed in isolated, ephemeral compute environments and never written to permanent storage. All data is encrypted in transit (TLS 1.3) and at rest (AES-256).",
  },
  {
    q: "Can I automate uploads via API?",
    a: "Yes, the CorePulse REST API allows you to submit files, poll for results, and retrieve structured JSON reports programmatically.",
  },
  {
    q: "How is the quality score calculated?",
    a: "The quality score (0–100) is a weighted composite of: completeness (fill rate), uniqueness (absence of duplicates), consistency (format uniformity), and validity (values within expected ranges).",
  },
  {
    q: "Do I need to install anything?",
    a: "No. CorePulse runs entirely in your browser — upload a file, and results are generated in the cloud in seconds. No plugins, macros, or installations required.",
  },
] as const;
