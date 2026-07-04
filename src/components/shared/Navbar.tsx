"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    track("Logged Out");
    router.push("/");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">CorePulse</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {ready && user ? (
              <>
                <Link href="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-3.5 w-3.5" /> Log out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
                <Link href="/signup"><Button size="sm">Get started free</Button></Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {ready && user ? (
                <>
                  <Link href="/dashboard"><Button variant="outline" size="sm" className="w-full">Dashboard</Button></Link>
                  <Button size="sm" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" /> Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login"><Button variant="outline" size="sm" className="w-full">Sign in</Button></Link>
                  <Link href="/signup"><Button size="sm" className="w-full">Get started free</Button></Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
