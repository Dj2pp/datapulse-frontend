"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useReveal } from "@/components/animations/useReveal";

const faqs = [
  { q: "What file formats are supported?", a: "CorePulse supports Excel (.xlsx, .xls), CSV, and TSV files. You can upload files up to 50MB on the free plan and up to 500MB on Pro." },
  { q: "How does fuzzy duplicate detection work?", a: "We use a combination of Levenshtein distance, Soundex phonetic matching, and token-based comparison to catch near-duplicates like 'Jon Smith' vs 'John Smith'. Sensitivity thresholds are configurable on Pro and Enterprise plans." },
  { q: "Is my data secure and private?", a: "Yes. Files are processed in isolated, ephemeral compute environments and never written to permanent storage. All data is encrypted in transit (TLS 1.3) and at rest (AES-256)." },
  { q: "Can I automate uploads via API?", a: "Yes, the CorePulse REST API allows you to submit files, poll for results, and retrieve structured JSON reports programmatically. API access is available on Pro and Enterprise plans." },
  { q: "How is the quality score calculated?", a: "The quality score (0–100) is a weighted composite of: completeness (fill rate), uniqueness (absence of duplicates), consistency (format uniformity), and validity (values within expected ranges). Weights are tunable on Enterprise." },
  { q: "What happens after the 14-day trial?", a: "At the end of your trial you are automatically moved to the free Starter plan. No credit card is required to start the trial and you will not be charged unless you upgrade." },
];

export function FAQ() {
  const { ref, visible } = useReveal();
  return (
    <section id="faq" className="py-20 sm:py-28 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Common questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
