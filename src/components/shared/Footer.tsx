import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Developers: ["Documentation", "API Reference", "SDKs", "Status"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">DataPulse</span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">AI-powered data quality and duplicate detection for enterprise teams.</p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">© 2024 DataPulse Technologies, Inc. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">SOC 2 Type II Certified · GDPR Compliant · ISO 27001</p>
        </div>
      </div>
    </footer>
  );
}
