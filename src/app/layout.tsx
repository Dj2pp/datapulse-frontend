import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { Analytics } from "@vercel/analytics/next";
const SITE_URL = "https://corepulse.dpdns.org/";

export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "CorePulse — AI Data Quality & Duplicate Detection for Excel & CSV",
    template: "%s | CorePulse",
  },

  description:
    "Upload Excel or CSV files and let AI detect duplicate records, missing values, invalid data, and quality issues in seconds. Free to start — no setup required.",

  keywords: [
    "AI data cleaning",
    "Excel duplicate finder",
    "CSV duplicate detection",
    "data quality tool",
    "data deduplication software",
    "fuzzy matching tool",
    "clean customer data",
    "remove duplicate rows Excel",
    "data quality report generator",
    "AI data validation",
    "spreadsheet cleaning tool",
    "CorePulse",
  ],

  authors: [{ name: "CorePulse", url: SITE_URL }],
  creator: "CorePulse",
  publisher: "CorePulse",
  applicationName: "CorePulse",
  category: "Technology",

  // Canonical URL
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // Open Graph (Facebook, LinkedIn, Discord, Slack)
  openGraph: {
    title: "CorePulse — AI Data Quality & Duplicate Detection",
    description:
      "Clean Excel and CSV files with AI. Detect duplicates, missing values, and data quality issues instantly.",
    url: SITE_URL,
    siteName: "CorePulse",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CorePulse — AI Data Quality & Duplicate Detection Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "CorePulse",
    description:
      "AI-powered Excel & CSV data cleaning and duplicate detection.",
    images: ["/og-image.png"],
  },

  // Favicon
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",

  // Crawling / indexing directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Fill in once registered with Google Search Console
  verification: {
    google: "2FujUQ6he09rEwNYcituBsg4EPjFFPq1Ht5O59_Eeo",
  },

  formatDetection: {
    telephone: false,
  },
};

// Site-wide structured data: identifies the organization + enables the
// sitewide search box rich result. Page-specific schema (SoftwareApplication,
// FAQPage) lives in the pages that actually match that content.
function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CorePulse",
    url: "https://corepulse.dpdns.org/",
    logo: "https://corepulse.dpdns.org/",
    sameAs: [] as string[],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CorePulse",
    url: "https://corepulse.dpdns.org/",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ScrollProgress />
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
