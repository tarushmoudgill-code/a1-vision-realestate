"use client";

import { useCallback, useEffect, useMemo, useState, Fragment } from "react";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Loader2,
  AlertTriangle,
  Mail,
  ChevronDown,
  ChevronRight,
  Reply,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
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
import type { ContactSubmission } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"];

const STATUS_BADGE: Record<string, string> = {
  NEW: "bg-gold/15 text-gold border-gold/30",
  READ: "bg-primary/15 text-primary border-primary/20",
  REPLIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ARCHIVED: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

export function ContactsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contacts", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setRows(j.contacts || []);
    } catch {
      toast.error("Failed to load contacts.");
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
        (r.subject || "").toLowerCase().includes(q);
      const matchS = filter === "all" || r.status === filter;
      return matchQ && matchS;
    });
  }, [rows, search, filter]);

  async function patch(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contacts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Contact deleted.");
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete contact.");
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
              placeholder="Search name, email, subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
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
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        No contact submissions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => {
                      const open = expanded === r.id;
                      return (
                        <Fragment key={r.id}>
                          <TableRow
                            className="cursor-pointer"
                            onClick={() => {
                              setExpanded(open ? null : r.id);
                              if (r.status === "NEW") patch(r.id, "READ");
                            }}
                          >
                            <TableCell>
                              {open ? (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="size-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                            </TableCell>
                            <TableCell className="max-w-[260px] truncate text-sm">
                              {r.subject || "(no subject)"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(STATUS_BADGE[r.status] || "")}
                              >
                                {r.status.toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(r.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8"
                                  asChild
                                >
                                  <a href={`mailto:${r.email}?subject=RE: ${encodeURIComponent(r.subject || "")}`}>
                                    <Reply className="size-4" />
                                    Reply
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget(r)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {open && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={6}>
                                <div className="space-y-3 py-2">
                                  {r.phone && (
                                    <p className="text-sm">
                                      <span className="font-medium">Phone:</span>{" "}
                                      {r.phone}
                                    </p>
                                  )}
                                  <div className="rounded-md border bg-background p-4">
                                    <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      <Mail className="size-3" />
                                      Message
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm">
                                      {r.message}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <Select
                                      value={r.status}
                                      onValueChange={(v) => patch(r.id, v)}
                                    >
                                      <SelectTrigger size="sm" className="h-8 w-[160px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {STATUSES.map((s) => (
                                          <SelectItem key={s} value={s}>
                                            {s.toLowerCase()}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
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
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission from{" "}
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
