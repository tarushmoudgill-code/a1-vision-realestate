"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Printer,
  Loader2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, imageUrl } from "@/lib/format";

const CHART_COLORS = [
  "oklch(0.30 0.06 258)", // navy
  "oklch(0.76 0.135 86)", // gold
  "oklch(0.62 0.10 40)", // terracotta
  "oklch(0.55 0.08 200)", // teal-blue
  "oklch(0.70 0.09 320)", // mauve
  "oklch(0.45 0.05 258)", // dark navy
];

interface AgentLeader {
  id: string;
  name: string;
  title: string;
  photo: string;
  soldCount: number;
  totalSalesValue: number;
  activeListings: number;
  rating: number;
  properties: number;
  leads: number;
  inspections: number;
}

interface TopProperty {
  id: string;
  title: string;
  price: number;
  views: number;
  suburb?: { name: string };
  images: string[];
}

interface ReportsData {
  agentLeaderboard: AgentLeader[];
  topProperties: TopProperty[];
  leadStatusCounts: { status: string; _count: number }[];
  leadTypeCounts: { type: string; _count: number }[];
  inspectionsByStatus: { status: string; _count: number }[];
  salesVolume: number;
  enquiries: number;
  inspectionsDone: number;
  conversionRate: number;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: typeof DollarSign;
}

function KpiCard({ label, value, hint, icon: Icon }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-gold/15 text-gold">
          <Icon size={18} />
        </span>
      </CardContent>
    </Card>
  );
}

export function ReportsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setData(j);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (sessionExpired) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="font-medium">Session expired</p>
          <Button
            onClick={async () => {
              await logout();
              await fetchMe();
              navigate("admin");
            }}
          >
            Return to login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const leadStatusData = data.leadStatusCounts.map((c) => ({
    name: c.status.toLowerCase(),
    value: c._count,
  }));
  const leadTypeData = data.leadTypeCounts.map((c) => ({
    name: c.type.toLowerCase(),
    value: c._count,
  }));
  const inspectionsData = data.inspectionsByStatus.map((c) => ({
    name: c.status.toLowerCase().replace("_", " "),
    value: c._count,
  }));

  return (
    <div className="space-y-4">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Sales volume"
          value={formatPrice(data.salesVolume)}
          hint="From sold properties"
          icon={DollarSign}
        />
        <KpiCard
          label="Enquiries"
          value={String(data.enquiries)}
          hint="Total leads received"
          icon={Activity}
        />
        <KpiCard
          label="Inspections done"
          value={String(data.inspectionsDone)}
          hint="Completed inspections"
          icon={Target}
        />
        <KpiCard
          label="Conversion rate"
          value={`${data.conversionRate.toFixed(1)}%`}
          hint="Inspections / enquiries"
          icon={TrendingUp}
        />
      </div>

      {/* Conversion funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversion funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Enquiries
              </p>
              <p className="font-serif text-2xl font-semibold">
                {data.enquiries}
              </p>
            </div>
            <div className="rounded-lg bg-gold/15 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Inspections completed
              </p>
              <p className="font-serif text-2xl font-semibold text-gold">
                {data.inspectionsDone}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Won leads
              </p>
              <p className="font-serif text-2xl font-semibold text-emerald-800">
                {data.leadStatusCounts.find((c) => c.status === "WON")?._count || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {leadStatusData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No lead data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {leadStatusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead type breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {leadTypeData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No lead data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={leadTypeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Leads" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inspections by status</CardTitle>
          </CardHeader>
          <CardContent>
            {inspectionsData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No inspection data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={inspectionsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Inspections" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Agent performance leaderboard</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv(
                "agent-leaderboard.csv",
                data.agentLeaderboard.map((a) => ({
                  name: a.name,
                  title: a.title,
                  sold: a.soldCount,
                  salesValue: a.totalSalesValue,
                  activeListings: a.activeListings,
                  rating: a.rating,
                  leads: a.leads,
                  inspections: a.inspections,
                }))
              )
            }
          >
            <Download className="size-4" />
            CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Listings</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Sales value</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Inspections</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.agentLeaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No agents.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.agentLeaderboard.map((a, i) => {
                    const initials = (a.name || "")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Badge
                            variant={i < 3 ? "default" : "outline"}
                            className={
                              i < 3
                                ? "bg-gold text-gold-foreground"
                                : ""
                            }
                          >
                            #{i + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage src={a.photo} alt={a.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{a.name}</p>
                              <p className="text-xs text-muted-foreground">{a.title}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">{a.activeListings}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{a.soldCount}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatPrice(a.totalSalesValue || 0)}
                        </TableCell>
                        <TableCell className="text-right text-sm">{a.leads}</TableCell>
                        <TableCell className="text-right text-sm">{a.inspections}</TableCell>
                        <TableCell className="text-right text-sm">{a.rating?.toFixed(1)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top viewed properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Top viewed properties</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv(
                  "top-properties.csv",
                  data.topProperties.map((p) => ({
                    title: p.title,
                    suburb: p.suburb?.name || "",
                    price: p.price,
                    views: p.views,
                  }))
                )
              }
            >
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]" />
                  <TableHead>Property</TableHead>
                  <TableHead>Suburb</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No properties.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topProperties.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="size-10 overflow-hidden rounded-md bg-muted">
                          {p.images?.[0] && (
                            <img
                              src={imageUrl(p.images[0])}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate font-medium">
                        {p.title}
                      </TableCell>
                      <TableCell className="text-sm">{p.suburb?.name || "—"}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatPrice(p.price)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-gold">
                        {p.views}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
