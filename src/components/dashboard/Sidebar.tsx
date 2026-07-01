"use client";
import { LayoutDashboard, FileUp, Table2, GitCompareArrows, Settings, Zap, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  return ((parts[0][0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const NAV = [
  { icon: LayoutDashboard, label: "Overview",  tab: "overview" },
  { icon: FileUp,          label: "Upload",    tab: "upload" },
  { icon: GitCompareArrows,label: "Compare",   tab: "compare" },
  { icon: Table2,          label: "Results",   tab: "results" },
  { icon: Settings,        label: "Settings",  tab: "settings" },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ activeTab, onTabChange, mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const content = (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">DataPulse</span>
        </div>
        <button onClick={onMobileClose} aria-label="Close menu"
          className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((item) => (
          <button key={item.tab}
            onClick={() => { onTabChange(item.tab); onMobileClose(); }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors",
              activeTab === item.tab
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-0.5">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <HelpCircle className="h-4 w-4" /> Help & docs
        </a>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">{user ? initials(user.name) : "?"}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name ?? "Guest"}</p>
            <p className="text-[10px] text-muted-foreground truncate">Free Beta plan</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card min-h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      <div className={cn("fixed inset-0 z-50 lg:hidden transition-opacity duration-200",
        mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
        <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
        <aside className={cn(
          "absolute left-0 top-0 flex h-full w-64 max-w-[80vw] flex-col bg-card shadow-xl transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {content}
        </aside>
      </div>
    </>
  );
}
