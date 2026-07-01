"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TopBar } from "@/components/dashboard/TopBar";
import { useReport } from "@/lib/ReportContext";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { PreviousJobs } from "@/components/dashboard/PreviousJobs";
import { BarChart3, Copy, AlertCircle, TrendingUp, FileUp, Table2, LayoutDashboard, GitCompareArrows, SlidersHorizontal, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Lazy-loaded: these pull in recharts / large table renderers, which don't
// need to block the initial dashboard paint. Each only mounts once its tab
// is opened, and shows a lightweight skeleton in the meantime.
function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
const DuplicateBarChart = dynamic(() => import("@/components/dashboard/Charts").then(m => m.DuplicateBarChart), { loading: ChartSkeleton, ssr: false });
const MissingValuesChart = dynamic(() => import("@/components/dashboard/Charts").then(m => m.MissingValuesChart), { loading: ChartSkeleton, ssr: false });
const QualityPieChart = dynamic(() => import("@/components/dashboard/Charts").then(m => m.QualityPieChart), { loading: ChartSkeleton, ssr: false });
const FuzzyMatchesChart = dynamic(() => import("@/components/dashboard/Charts").then(m => m.FuzzyMatchesChart), { loading: ChartSkeleton, ssr: false });
const ResultsTable = dynamic(() => import("@/components/dashboard/ResultsTable").then(m => m.ResultsTable), { loading: ChartSkeleton, ssr: false });
const ComparisonTable = dynamic(() => import("@/components/dashboard/ComparisonTable").then(m => m.ComparisonTable), { loading: ChartSkeleton, ssr: false });
const PipelineStats = dynamic(() => import("@/components/dashboard/PipelineStats").then(m => m.PipelineStats), { loading: ChartSkeleton, ssr: false });

export default function DashboardPage() {
  const [tab, setTab] = useState("upload");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { report } = useReport();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pendingReview = report?.pipeline?.clusters.length ?? 0;

  const handleLogout = () => {
    logout();
    track("Logged Out");
    router.push("/login");
  };

  // useCallback so UploadZone's runUpload doesn't rebuild on every render
  const handleAnalyzed = useCallback(() => setTab("overview"), []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={tab}
        onTabChange={setTab}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {report
                ? `${report.meta.filename} · ${report.meta.rows.toLocaleString()} rows · analyzed ${new Date(report.meta.analyzed_at).toLocaleString()}`
                : "Upload a file to run real duplicate detection & quality analysis"}
            </p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-2 flex-wrap h-auto gap-1">
              <TabsTrigger value="overview"  className="gap-1.5 text-xs"><LayoutDashboard   className="h-3.5 w-3.5" />Overview</TabsTrigger>
              <TabsTrigger value="upload"    className="gap-1.5 text-xs"><FileUp             className="h-3.5 w-3.5" />Upload</TabsTrigger>
              <TabsTrigger value="compare"   className="gap-1.5 text-xs">
                <GitCompareArrows className="h-3.5 w-3.5" />Compare
                {pendingReview > 0 && <Badge className="ml-1 h-4 px-1.5 text-[10px]">{pendingReview}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="results"   className="gap-1.5 text-xs"><Table2            className="h-3.5 w-3.5" />Results</TabsTrigger>
              <TabsTrigger value="settings"  className="gap-1.5 text-xs"><SlidersHorizontal className="h-3.5 w-3.5" />Settings</TabsTrigger>
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              {!report ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
                    No data yet.{" "}
                    <button className="text-primary font-medium underline" onClick={() => setTab("upload")}>Upload a file</button>
                    {" "}to see live KPIs, charts, and AI-generated findings.
                  </div>
                  <PreviousJobs />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <KpiCard title="Total Records"       value={report.kpi.total_records}        icon={BarChart3}   description="Rows in uploaded file"    delay={0}   />
                    <KpiCard title="Duplicate Records"   value={report.kpi.duplicate_records}    icon={Copy}        description="Exact + fuzzy matches"    delay={80}  />
                    <KpiCard title="Missing Value Rows"  value={report.kpi.missing_value_rows}   icon={AlertCircle} description="Rows with ≥1 empty field" delay={160} />
                    <KpiCard title="Quality Score"       value={report.kpi.quality_score}        icon={TrendingUp}  description="Out of 100" decimals={1}   delay={240} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <DuplicateBarChart /><FuzzyMatchesChart />
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2"><MissingValuesChart /></div>
                    <QualityPieChart />
                  </div>
                  <SummaryCards />
                  <PipelineStats />
                </>
              )}
            </TabsContent>

            {/* ── Upload ── */}
            <TabsContent value="upload" className="mt-0">
              <UploadZone onAnalyzed={handleAnalyzed} />
            </TabsContent>

            {/* ── Compare ── */}
            <TabsContent value="compare" className="mt-0">
              <ComparisonTable />
            </TabsContent>

            {/* ── Results ── */}
            <TabsContent value="results" className="mt-0">
              <ResultsTable />
            </TabsContent>

            {/* ── Settings ── */}
            <TabsContent value="settings" className="mt-0">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-sm font-semibold mb-1">Account</h3>
                  <p className="text-xs text-muted-foreground mb-4">Signed in for this session.</p>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><p className="text-muted-foreground text-xs mb-1">Name</p><p className="font-medium">{user?.name ?? "—"}</p></div>
                    <div><p className="text-muted-foreground text-xs mb-1">Email</p><p className="font-medium">{user?.email ?? "—"}</p></div>
                    <div><p className="text-muted-foreground text-xs mb-1">Plan</p><p className="font-medium">Free Beta</p></div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleLogout}>Log out</Button>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-sm font-semibold mb-1">Backend</h3>
                  <p className="text-xs text-muted-foreground">
                    API URL: <code className="px-1 py-0.5 rounded bg-muted font-mono">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
