"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useReveal } from "@/components/animations/useReveal";
import { faqs } from "@/lib/faqs";

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
