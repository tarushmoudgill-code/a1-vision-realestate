"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Calendar,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import type { Agent, Inspection, Property } from "@/lib/types";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-primary/15 text-primary border-primary/20",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  NO_SHOW: "bg-neutral-200 text-neutral-700 border-neutral-300",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/20",
};

interface Row extends Inspection {
  property?: Property;
  agent?: Agent | null;
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] || "";
  return (
    <Badge variant="outline" className={`capitalize ${cls}`}>
      {status.replace("_", " ").toLowerCase()}
    </Badge>
  );
}

export function InspectionsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [rows, setRows] = useState<Row[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ir, ar] = await Promise.all([
        fetch("/api/admin/inspections", { cache: "no-store" }),
        fetch("/api/admin/agents", { cache: "no-store" }),
      ]);
      if (ir.status === 401) {
        setSessionExpired(true);
        return;
      }
      const [ij, aj] = await Promise.all([ir.json(), ar.json()]);
      setRows(ij.inspections || []);
      setAgents(aj.agents || []);
    } catch {
      toast.error("Failed to load inspections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.property?.title || "").toLowerCase().includes(q);
      const matchS = filter === "all" || r.status === filter;
      return matchQ && matchS;
    });
  }, [rows, search, filter]);

  // Group by date for calendar view
  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      const key = r.preferredDate
        ? formatDate(r.preferredDate)
        : "No date set";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [filtered]);

  async function patch(id: string, body: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/inspections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...body } : r))
      );
      toast.success("Inspection updated.");
    } catch {
      toast.error("Failed to update inspection.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/inspections/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Inspection deleted.");
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete inspection.");
    } finally {
      setDeleting(false);
    }
  }

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, property…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="w-fit">
          {filtered.length} inspection{filtered.length !== 1 && "s"}
        </Badge>
      </div>

      {/* Calendar-style grouping */}
      <div className="grid gap-3 lg:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : grouped.map(([date, items]) => (
              <Card key={date}>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Calendar className="size-4 text-gold" />
                  <CardTitle className="text-sm font-medium">{date}</CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    {items.length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {items.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-md border bg-background p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {r.property?.title || "Property removed"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.name} · {r.preferredTime || "Any time"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <a
                              href={`mailto:${r.email}`}
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              <Mail className="size-3" /> {r.email}
                            </a>
                            {r.phone && (
                              <a
                                href={`tel:${r.phone}`}
                                className="inline-flex items-center gap-1 hover:text-foreground"
                              >
                                <Phone className="size-3" /> {r.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Select
                          value={r.status}
                          onValueChange={(v) => patch(r.id, { status: v })}
                        >
                          <SelectTrigger size="sm" className="h-8 w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.replace("_", " ").toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={r.agentId || "_unassigned"}
                          onValueChange={(v) =>
                            patch(r.id, {
                              agentId: v === "_unassigned" ? null : v,
                            })
                          }
                        >
                          <SelectTrigger size="sm" className="h-8 w-[170px]">
                            <SelectValue placeholder="Assign agent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_unassigned">Unassigned</SelectItem>
                            {agents.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(r)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Full table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All inspections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date / time</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No inspections found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-[180px] truncate font-medium">
                          {r.property?.title || "—"}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.preferredDate ? formatDate(r.preferredDate) : "—"}
                          {r.preferredTime ? ` · ${r.preferredTime}` : ""}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.agent?.name || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inspection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the inspection booking for{" "}
              {deleteTarget?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
