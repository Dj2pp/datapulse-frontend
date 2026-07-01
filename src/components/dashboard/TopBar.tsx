"use client";
import { Moon, Sun, Zap, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  return ((parts[0][0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [dark, setDark] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggle = () => {
    setDark(d => !d);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    track("Logged Out");
    router.push("/login");
  };

  const displayName = user?.name?.split(" ")[0] || "there";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <button onClick={onMenuClick} aria-label="Open menu"
          className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold">DataPulse</span>
      </div>
      <div className="hidden lg:block text-sm text-muted-foreground">
        Welcome back, <span className="text-foreground font-medium">{displayName}</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
          {user ? initials(user.name) : "?"}
        </div>
      </div>
    </header>
  );
}
