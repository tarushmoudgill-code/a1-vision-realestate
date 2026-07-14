"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Home,
  CalendarCheck,
  Users,
  MessageSquare,
  Mail,
  DollarSign,
  TrendingUp,
  Plus,
  RefreshCw,
  Loader2,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPrice, formatDate, timeAgo, listingBadge, imageUrl } from "@/lib/format";
import { LISTING_TYPE_LABEL } from "@/lib/constants";
import type { Property, Lead, Inspection } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityFeedItem {
  id: string;
  action: string;
  entity: string;
  detail: string;
  createdAt: string;
  user?: { name: string } | null;
}

interface DashboardData {
  kpis: {
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
    pendingInspections: number;
    newLeads: number;
    pendingTestimonials: number;
    newContacts: number;
    agents: number;
    activeListings: number;
    totalSalesValue: number;
  };
  recentProperties: (Property & { images: string[] })[];
  recentLeads: Lead[];
  recentInspections: Inspection[];
  activityFeed: ActivityFeedItem[];
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: typeof Home;
  hint?: string;
  tone?: "default" | "gold";
}

function KpiCard({ label, value, icon: Icon, hint, tone = "default" }: KpiCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 truncate font-serif text-2xl font-semibold",
              tone === "gold" && "text-gold"
            )}
          >
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg",
            tone === "gold"
              ? "bg-gold/15 text-gold"
              : "bg-primary/10 text-primary"
          )}
        >
          <Icon size={18} />
        </span>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useRouter((s) => s.navigate);
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        setData(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      setData(json);
      setSessionExpired(false);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reseed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (res.status === 401) {
        toast.error("Session expired");
        setSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error("Seed failed");
      toast.success("Demo data re-seeded.");
      await load();
    } catch {
      toast.error("Failed to re-seed database.");
    } finally {
      setSeeding(false);
    }
  }

  if (sessionExpired) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="font-medium">Session expired</p>
          <p className="text-sm text-muted-foreground">
            Please log in again to continue.
          </p>
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

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "Staff"}.
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your portfolio today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("admin/properties")}>
            <Plus className="size-4" />
            Add property
          </Button>
          <Button variant="outline" onClick={() => navigate("admin/leads")}>
            View leads
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="size-4" />
                Reset demo data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will wipe and re-seed the database with the original
                  sample listings, agents, leads and content. Useful for demos
                  but irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={reseed}
                  disabled={seeding}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {seeding ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    "Yes, reset"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {loading || !data ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <KpiCard
              label="Total Properties"
              value={String(data.kpis.totalProperties)}
              icon={Building2}
              hint={`${data.kpis.activeProperties} active`}
            />
            <KpiCard
              label="Active Listings"
              value={String(data.kpis.activeListings)}
              icon={Home}
              hint={`${data.kpis.soldProperties} sold`}
            />
            <KpiCard
              label="Pending Inspections"
              value={String(data.kpis.pendingInspections)}
              icon={CalendarCheck}
            />
            <KpiCard
              label="New Leads"
              value={String(data.kpis.newLeads)}
              icon={Users}
              tone="gold"
            />
            <KpiCard
              label="New Contacts"
              value={String(data.kpis.newContacts)}
              icon={Mail}
            />
            <KpiCard
              label="Total Sales Value"
              value={formatPrice(data.kpis.totalSalesValue)}
              icon={DollarSign}
              tone="gold"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent leads */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent leads</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("admin/leads")}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading || !data ? (
              <Skeleton className="h-48 rounded-md" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          No leads yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentLeads.slice(0, 6).map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {lead.type?.toLowerCase() || "enquiry"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{lead.status?.toLowerCase()}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {timeAgo(lead.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading || !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            ) : (
              <ol className="max-h-96 space-y-3 overflow-y-auto pr-1 scrollbar-luxe">
                {data.activityFeed.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No recent activity.</li>
                ) : (
                  data.activityFeed.map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{a.user?.name || "System"}</span>{" "}
                          <span className="text-muted-foreground">{a.action.toLowerCase()}</span>{" "}
                          <span className="font-medium">{a.entity}</span>
                        </p>
                        {a.detail && (
                          <p className="truncate text-xs text-muted-foreground">
                            {a.detail}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {timeAgo(a.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent inspections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent inspections</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("admin/inspections")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading || !data ? (
              <Skeleton className="h-40 rounded-md" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>When</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentInspections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          No inspections yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentInspections.slice(0, 6).map((insp) => (
                        <TableRow key={insp.id}>
                          <TableCell className="max-w-[160px] truncate font-medium">
                            {insp.property?.title || "—"}
                          </TableCell>
                          <TableCell className="text-sm">{insp.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {insp.preferredDate ? formatDate(insp.preferredDate) : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{insp.status?.toLowerCase()}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent properties</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("admin/properties")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading || !data ? (
              <Skeleton className="h-40 rounded-md" />
            ) : (
              <ul className="divide-y">
                {data.recentProperties.length === 0 ? (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    No properties yet.
                  </li>
                ) : (
                  data.recentProperties.slice(0, 5).map((p) => {
                    const img = p.images?.[0] ? imageUrl(p.images[0]) : "";
                    const badge = listingBadge(p.listingType);
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-2.5">
                        <div className="size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                          {img && (
                            <img
                              src={img}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.address || p.suburb?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{p.priceDisplay || formatPrice(p.price)}</p>
                          <Badge className={cn("mt-0.5", badge.tone)}>
                            {LISTING_TYPE_LABEL[p.listingType] || p.listingType}
                          </Badge>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats footer */}
      <Card className="bg-sidebar text-sidebar-foreground">
        <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Agents</p>
            <p className="font-serif text-2xl">{data?.kpis.agents ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Active listings</p>
            <p className="font-serif text-2xl">{data?.kpis.activeListings ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Pending testimonials</p>
            <p className="font-serif text-2xl">{data?.kpis.pendingTestimonials ?? "—"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-sidebar-foreground/60">
              <TrendingUp className="size-3" /> Sold
            </p>
            <p className="font-serif text-2xl">{data?.kpis.soldProperties ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
