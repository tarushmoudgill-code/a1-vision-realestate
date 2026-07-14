"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  StickyNote,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { timeAgo, formatDate } from "@/lib/format";
import type { Agent, Lead, Property } from "@/lib/types";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "ACTIVE", "WON", "LOST"];
const TYPES = ["ENQUIRY", "APPRAISAL", "LIST", "INSPECTION", "CONTACT"];

const STATUS_BADGE: Record<string, string> = {
  NEW: "bg-gold/15 text-gold border-gold/30",
  CONTACTED: "bg-primary/15 text-primary border-primary/20",
  QUALIFIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ACTIVE: "bg-amber-100 text-amber-800 border-amber-200",
  WON: "bg-emerald-700 text-white border-emerald-800",
  LOST: "bg-neutral-300 text-neutral-700 border-neutral-400",
};

interface Row extends Lead {
  property?: Property | null;
  agent?: Agent | null;
}

export function LeadsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [rows, setRows] = useState<Row[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [notesTarget, setNotesTarget] = useState<Row | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lr, ar] = await Promise.all([
        fetch("/api/admin/leads", { cache: "no-store" }),
        fetch("/api/admin/agents", { cache: "no-store" }),
      ]);
      if (lr.status === 401) {
        setSessionExpired(true);
        return;
      }
      const [lj, aj] = await Promise.all([lr.json(), ar.json()]);
      setRows(lj.leads || []);
      setAgents(aj.agents || []);
    } catch {
      toast.error("Failed to load leads.");
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
        (r.message || "").toLowerCase().includes(q);
      const matchS = filterStatus === "all" || r.status === filterStatus;
      const matchT = filterType === "all" || r.type === filterType;
      return matchQ && matchS && matchT;
    });
  }, [rows, search, filterStatus, filterType]);

  const sourceCounts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }
    const byType: Record<string, number> = {};
    for (const r of rows) {
      byType[r.type] = (byType[r.type] || 0) + 1;
    }
    return { byStatus, byType };
  }, [rows]);

  async function patch(id: string, body: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...body } : r))
      );
      toast.success("Lead updated.");
    } catch {
      toast.error("Failed to update lead.");
    }
  }

  function openNotes(r: Row) {
    setNotesTarget(r);
    setNotesValue(r.notes || "");
  }

  async function saveNotes() {
    if (!notesTarget) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/leads/${notesTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) =>
          r.id === notesTarget.id ? { ...r, notes: notesValue } : r
        )
      );
      toast.success("Notes saved.");
      setNotesTarget(null);
    } catch {
      toast.error("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Lead deleted.");
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete lead.");
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
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.toLowerCase()}
              </p>
              <p className="font-serif text-2xl font-semibold">
                {sourceCounts.byStatus[s] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No leads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium">{r.name}</p>
                          <a
                            href={`mailto:${r.email}`}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="size-3" /> {r.email}
                          </a>
                          {r.phone && (
                            <a
                              href={`tel:${r.phone}`}
                              className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Phone className="size-3" /> {r.phone}
                            </a>
                          )}
                          {r.message && (
                            <p className="mt-1 max-w-[260px] truncate text-xs text-muted-foreground">
                              {r.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {r.type?.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm">
                          {r.property?.title || "—"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={r.status}
                            onValueChange={(v) => patch(r.id, { status: v })}
                          >
                            <SelectTrigger size="sm" className="h-8 w-[140px]">
                              <SelectValue>
                                <Badge
                                  variant="outline"
                                  className={STATUS_BADGE[r.status] || ""}
                                >
                                  {r.status.toLowerCase()}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={r.assignedAgentId || "_unassigned"}
                            onValueChange={(v) =>
                              patch(r.id, {
                                assignedAgentId:
                                  v === "_unassigned" ? null : v,
                              })
                            }
                          >
                            <SelectTrigger size="sm" className="h-8 w-[160px]">
                              <SelectValue placeholder="Assign" />
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
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(r.createdAt)}
                          <p className="text-[11px]">{timeAgo(r.createdAt)}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openNotes(r)}
                              title="Notes"
                            >
                              <StickyNote className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(r)}
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
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

      {/* Notes dialog */}
      <Dialog
        open={Boolean(notesTarget)}
        onOpenChange={(o) => !o && setNotesTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lead notes — {notesTarget?.name}</DialogTitle>
            <DialogDescription>
              Internal notes about this lead. Visible to staff only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={6}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Add context, follow-up reminders, preferences…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveNotes} disabled={savingNotes}>
              {savingNotes ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save notes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the lead from {deleteTarget?.name}.
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
