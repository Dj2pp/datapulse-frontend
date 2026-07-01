"use client";
import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReport } from "@/lib/ReportContext";
import { getCleanedFileUrl, getPdfReportUrl } from "@/lib/api";

type Filter = "all" | "clean" | "duplicate" | "missing";

const STATUS_STYLES: Record<string, string> = {
  clean: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  duplicate: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  missing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function ResultsTable() {
  const { report } = useReport();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortCol, setSortCol] = useState<string>("_row");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const columns = report?.columns ?? [];
  const records = report?.records ?? [];

  const filtered = useMemo(() => {
    let rows = [...records];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => columns.some(c => String(r[c] ?? "").toLowerCase().includes(q)));
    }
    if (filter !== "all") rows = rows.filter(r => r.status === filter);
    rows.sort((a, b) => {
      const va = a[sortCol] ?? ""; const vb = b[sortCol] ?? "";
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [records, search, filter, sortCol, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: string }) => sortCol === col
    ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
    : <ChevronUp className="h-3 w-3 opacity-20" />;

  if (!report) {
    return (
      <Card>
        <CardContent className="p-16 text-center text-sm text-muted-foreground">
          No results yet — upload a file from the <span className="font-medium text-foreground">Upload</span> tab to see real analysis here.
        </CardContent>
      </Card>
    );
  }

  const reportId = report.meta.report_id;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Records · {records.length.toLocaleString()} total</CardTitle>
          <div className="flex items-center gap-2">
            <a href={getCleanedFileUrl(reportId, "remove")} download>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Download className="h-3.5 w-3.5" /> Cleaned file
              </Button>
            </a>
            <a href={getPdfReportUrl(reportId)} download>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <FileText className="h-3.5 w-3.5" /> PDF report
              </Button>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search records…"
              className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {(["all","clean","duplicate","missing"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >{f}</button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th onClick={() => toggleSort("_row")} className="px-4 py-2.5 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">Row<SortIcon col="_row" /></div>
                </th>
                {columns.map(col => (
                  <th key={col} onClick={() => toggleSort(col)} className="px-4 py-2.5 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">{col}<SortIcon col={col} /></div>
                  </th>
                ))}
                <th onClick={() => toggleSort("status")} className="px-4 py-2.5 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">Status<SortIcon col="status" /></div>
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Issue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((row) => (
                <tr key={row._row} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row._row}</td>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-3 max-w-[180px] truncate">{String(row[col] ?? "") || <span className="text-muted-foreground/40">—</span>}</td>
                  ))}
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[row.status])}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate">{row.issue || <span className="text-muted-foreground/40">—</span>}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={columns.length + 3} className="px-4 py-10 text-center text-muted-foreground">No records match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p-1)}>Prev</Button>
            {Array.from({length: totalPages}, (_,i) => i+1).slice(0, 7).map(n => (
              <Button key={n} variant={page===n?"default":"outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
