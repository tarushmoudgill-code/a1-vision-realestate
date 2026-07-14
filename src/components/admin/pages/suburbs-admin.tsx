"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Star,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/format";
import type { Suburb } from "@/lib/types";

interface FormState {
  name: string;
  state: string;
  postcode: string;
  description: string;
  medianPrice: string;
  medianRent: string;
  growthRate: string;
  population: string;
  lifestyle: string;
  image: string;
  featured: boolean;
}

const EMPTY: FormState = {
  name: "",
  state: "VIC",
  postcode: "",
  description: "",
  medianPrice: "",
  medianRent: "",
  growthRate: "",
  population: "",
  lifestyle: "",
  image: "",
  featured: false,
};

export function SuburbsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Suburb | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Suburb | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/suburbs", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setSuburbs(j.suburbs || []);
    } catch {
      toast.error("Failed to load suburbs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  }

  function openEdit(s: Suburb) {
    setEditing(s);
    setForm({
      name: s.name || "",
      state: s.state || "VIC",
      postcode: s.postcode || "",
      description: s.description || "",
      medianPrice: String(s.medianPrice ?? ""),
      medianRent: String(s.medianRent ?? ""),
      growthRate: String(s.growthRate ?? ""),
      population: String(s.population ?? ""),
      lifestyle: s.lifestyle || "",
      image: s.image || "",
      featured: Boolean(s.featured),
    });
    setDialogOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      state: form.state,
      postcode: form.postcode,
      description: form.description,
      medianPrice: Number(form.medianPrice) || 0,
      medianRent: Number(form.medianRent) || 0,
      growthRate: Number(form.growthRate) || 0,
      population: Number(form.population) || 0,
      lifestyle: form.lifestyle,
      image: form.image,
      featured: form.featured,
    };
    try {
      const url = editing
        ? `/api/admin/suburbs/${editing.id}`
        : "/api/admin/suburbs";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error("Save failed");
      toast.success(editing ? "Suburb updated." : "Suburb created.");
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Failed to save suburb.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(s: Suburb) {
    try {
      const res = await fetch(`/api/admin/suburbs/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !s.featured }),
      });
      if (!res.ok) throw new Error();
      setSuburbs((prev) =>
        prev.map((x) =>
          x.id === s.id ? { ...x, featured: !x.featured } : x
        )
      );
      toast.success(s.featured ? "Unfeatured." : "Featured.");
    } catch {
      toast.error("Failed to toggle featured.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/suburbs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Suburb deleted.");
      setSuburbs((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete suburb.");
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Suburb guides shown on the public website. Featured suburbs appear on
          the homepage.
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add suburb
        </Button>
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
                    <TableHead>Suburb</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead className="text-right">Median price</TableHead>
                    <TableHead className="text-right">Median rent</TableHead>
                    <TableHead className="text-right">Growth</TableHead>
                    <TableHead className="text-right">Population</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suburbs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        No suburbs yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    suburbs.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <button
                            onClick={() => navigate(`suburb/${s.id}`)}
                            className="font-medium hover:text-gold"
                          >
                            {s.name}
                          </button>
                          <p className="text-xs text-muted-foreground">{s.state}</p>
                        </TableCell>
                        <TableCell className="text-sm">{s.postcode}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatPrice(s.medianPrice || 0)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {s.medianRent ? `${formatPrice(s.medianRent)}/wk` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-sm ${
                              (s.growthRate || 0) >= 0
                                ? "text-emerald-700"
                                : "text-destructive"
                            }`}
                          >
                            <TrendingUp className="size-3" />
                            {s.growthRate > 0 ? "+" : ""}
                            {s.growthRate?.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {s.population?.toLocaleString() || "—"}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleFeatured(s)}
                            className="inline-flex items-center"
                            title={s.featured ? "Featured" : "Not featured"}
                          >
                            <Star
                              className={
                                s.featured
                                  ? "size-4 fill-gold text-gold"
                                  : "size-4 text-muted-foreground/40"
                              }
                            />
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(s)}>
                                <Pencil className="size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFeatured(s)}>
                                <Star className="size-4" />
                                {s.featured ? "Unfeature" : "Feature"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(s)}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit suburb" : "New suburb"}</DialogTitle>
            <DialogDescription>
              Suburb guide data shown publicly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postcode</Label>
                  <Input
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Median price</Label>
                <Input
                  type="number"
                  value={form.medianPrice}
                  onChange={(e) => setForm({ ...form, medianPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Median rent (weekly)</Label>
                <Input
                  type="number"
                  value={form.medianRent}
                  onChange={(e) => setForm({ ...form, medianRent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Growth rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.growthRate}
                  onChange={(e) => setForm({ ...form, growthRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Population</Label>
                <Input
                  type="number"
                  value={form.population}
                  onChange={(e) => setForm({ ...form, population: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Lifestyle</Label>
                <Input
                  value={form.lifestyle}
                  onChange={(e) => setForm({ ...form, lifestyle: e.target.value })}
                  placeholder="Coastal, Family-friendly, Café culture…"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) =>
                    setForm({ ...form, featured: v === true })
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Feature on homepage
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : editing ? (
                  "Save changes"
                ) : (
                  "Create suburb"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete suburb?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.name}. Properties in
              this suburb will lose their suburb reference.
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
