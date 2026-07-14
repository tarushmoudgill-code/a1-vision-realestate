"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, Loader2, AlertTriangle, Star } from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-gold/15 text-gold border-gold/30",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/20",
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < value ? "fill-gold text-gold" : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [filter, setFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setRows(j.testimonials || []);
    } catch {
      toast.error("Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => filter === "all" || r.status === filter);
  }, [rows, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  async function setStatus(t: Testimonial, status: string) {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) => (r.id === t.id ? { ...r, status } : r))
      );
      toast.success(
        status === "APPROVED"
          ? "Testimonial approved."
          : status === "REJECTED"
          ? "Testimonial rejected."
          : "Updated."
      );
    } catch {
      toast.error("Failed to update testimonial.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Testimonial deleted.");
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete testimonial.");
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
      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.toLowerCase()}
              </p>
              <p className="font-serif text-2xl font-semibold">
                {counts[s] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
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
        <Badge variant="outline">{filtered.length} items</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="min-w-[280px]">Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No testimonials.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.location}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {t.serviceType || "—"}
                        </TableCell>
                        <TableCell>
                          <Stars value={t.rating} />
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          <p className="line-clamp-3 text-sm text-muted-foreground">
                            &ldquo;{t.message}&rdquo;
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_BADGE[t.status] || ""}
                          >
                            {t.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {t.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-emerald-700 hover:text-emerald-800"
                                onClick={() => setStatus(t, "APPROVED")}
                                title="Approve"
                              >
                                <Check className="size-4" />
                              </Button>
                            )}
                            {t.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-amber-700 hover:text-amber-800"
                                onClick={() => setStatus(t, "REJECTED")}
                                title="Reject"
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(t)}
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the testimonial from{" "}
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
