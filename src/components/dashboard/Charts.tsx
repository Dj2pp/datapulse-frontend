"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useReveal } from "@/components/animations/useReveal";
import { useReport } from "@/lib/ReportContext";

const PIE_COLORS = ["#3b82f6", "#6366f1", "#94a3b8"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs">
      {label && <p className="font-medium mb-1.5">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
      Upload a file to see {label}
    </div>
  );
}

export function DuplicateBarChart() {
  const { ref, visible } = useReveal();
  const { report } = useReport();
  const data = report?.duplicate_by_column ?? [];

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Duplicate vs Clean Records</CardTitle>
          <CardDescription>Computed from your uploaded file — top affected columns</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? <EmptyChart label="duplicate breakdown" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="column" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="clean" name="Clean" fill="hsl(var(--primary))" opacity={0.25} radius={[4,4,0,0]} />
                <Bar dataKey="duplicates" name="Duplicates" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function MissingValuesChart() {
  const { ref, visible } = useReveal();
  const { report } = useReport();
  const data = (report?.column_profile ?? []).slice(0, 6);

  return (
    <div ref={ref} className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Missing Values by Column</CardTitle>
          <CardDescription>Real fill-rate computed per column</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? <EmptyChart label="missing-value breakdown" /> : (
            <div className="space-y-3">
              {data.map((row) => (
                <div key={row.column}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{row.column}</span>
                    <span className="text-xs text-muted-foreground">{row.pct}% · {row.missing.toLocaleString()} rows</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: visible ? `${row.pct}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function QualityPieChart() {
  const { ref, visible } = useReveal();
  const { report } = useReport();
  const data = report?.quality_breakdown ?? [];

  return (
    <div ref={ref} className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Data Quality Breakdown</CardTitle>
          <CardDescription>{report ? `${report.meta.rows.toLocaleString()} total records` : "Upload a file to begin"}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? <EmptyChart label="quality breakdown" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function FuzzyMatchesChart() {
  const { ref, visible } = useReveal();
  const { report } = useReport();
  const matches = (report?.fuzzy_matches ?? []).slice(0, 8);

  // Bucket fuzzy match scores into bands for a real distribution chart
  const buckets = [
    { range: "95-100%", count: matches.filter(m => m.score >= 95).length },
    { range: "90-94%", count: matches.filter(m => m.score >= 90 && m.score < 95).length },
    { range: "85-89%", count: matches.filter(m => m.score >= 85 && m.score < 90).length },
    { range: "<85%", count: matches.filter(m => m.score < 85).length },
  ];

  return (
    <div ref={ref} className={`transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Fuzzy Match Confidence</CardTitle>
          <CardDescription>Distribution of fuzzy-matched duplicate pairs by score</CardDescription>
        </CardHeader>
        <CardContent>
          {!report || report.fuzzy_matches.length === 0 ? <EmptyChart label="fuzzy match scores" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={buckets} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="range" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Match pairs" fill="hsl(var(--primary))" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
