import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { faqs } from "@/lib/faqs";

// Homepage-scoped structured data. Kept out of the root layout so it
// doesn't leak onto /login, /signup, /dashboard where it isn't accurate.
function JsonLd() {
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CorePulse",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Data Quality Software",
    operatingSystem: "Web",
    url: "https://corepulse.dpdns.org/",
    description:
      "CorePulse is an AI-powered data quality and duplicate detection platform. Upload Excel or CSV files to instantly detect duplicate records, missing values, invalid data, and quality issues.",
    image: "https://corepulse.dpdns.org/og-image.png",
    featureList: [
      "Exact and fuzzy duplicate detection",
      "Missing value analysis",
      "AI-generated data quality scoring",
      "One-click cleaned file export",
      "REST API access",
    ],
    publisher: {
      "@type": "Organization",
      name: "CorePulse",
      url: "https://corepulse.dpdns.org/",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <JsonLd />
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <CTASection />
      <FAQ />
      <Footer />
    </main>
  );
}
