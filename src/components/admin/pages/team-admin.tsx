"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  Star,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { Agent } from "@/lib/types";

interface FormState {
  name: string;
  title: string;
  bio: string;
  photo: string;
  email: string;
  phone: string;
  specialisations: string;
  suburbs: string;
  languages: string;
  yearsExperience: string;
  rating: string;
}

const EMPTY: FormState = {
  name: "",
  title: "",
  bio: "",
  photo: "",
  email: "",
  phone: "",
  specialisations: "",
  suburbs: "",
  languages: "English",
  yearsExperience: "0",
  rating: "5",
};

export function TeamAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/agents", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setAgents(j.agents || []);
    } catch {
      toast.error("Failed to load agents.");
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

  function openEdit(a: Agent) {
    setEditing(a);
    setForm({
      name: a.name || "",
      title: a.title || "",
      bio: a.bio || "",
      photo: a.photo || "",
      email: a.email || "",
      phone: a.phone || "",
      specialisations: Array.isArray(a.specialisations) ? a.specialisations.join(", ") : (a.specialisations as string) || "",
      suburbs: Array.isArray(a.suburbs) ? a.suburbs.join(", ") : (a.suburbs as string) || "",
      languages: Array.isArray(a.languages) ? a.languages.join(", ") : (a.languages as string) || "English",
      yearsExperience: String(a.yearsExperience ?? 0),
      rating: String(a.rating ?? 5),
    });
    setDialogOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.title) {
      toast.error("Name and title are required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      title: form.title,
      bio: form.bio,
      photo: form.photo,
      email: form.email,
      phone: form.phone,
      specialisations: form.specialisations.split(",").map((s) => s.trim()).filter(Boolean),
      suburbs: form.suburbs.split(",").map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      yearsExperience: Number(form.yearsExperience) || 0,
      rating: Number(form.rating) || 5,
    };
    try {
      const url = editing ? `/api/admin/agents/${editing.id}` : "/api/admin/agents";
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
      toast.success(editing ? "Agent updated." : "Agent created.");
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Failed to save agent.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/agents/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Agent deleted.");
      setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete agent.");
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
          Manage agent profiles. Agents with matching email may have login
          accounts (role: AGENT).
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add agent
        </Button>
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
                    <TableHead>Agent</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialisations</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Sales value</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        No agents yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((a) => {
                      const initials = (a.name || "")
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      const specs = Array.isArray(a.specialisations)
                        ? a.specialisations
                        : String(a.specialisations || "").split(",").map((s) => s.trim()).filter(Boolean);
                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage src={a.photo} alt={a.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <button
                                  onClick={() => navigate(`agent/${a.id}`)}
                                  className="font-medium hover:text-gold"
                                >
                                  {a.name}
                                </button>
                                <p className="text-xs text-muted-foreground">
                                  Experienced
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{a.title}</TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${a.email}`}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Mail className="size-3" /> {a.email}
                            </a>
                            {a.phone && (
                              <a
                                href={`tel:${a.phone}`}
                                className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Phone className="size-3" /> {a.phone}
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex max-w-[200px] flex-wrap gap-1">
                              {specs.slice(0, 3).map((s) => (
                                <Badge key={s} variant="outline" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                              {specs.length > 3 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{specs.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {a.soldCount}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatPrice(a.totalSalesValue || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Star className="size-3 fill-gold text-gold" />
                              {a.rating?.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(a)}>
                                  <Pencil className="size-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(a)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
            <DialogTitle>{editing ? "Edit agent" : "New agent"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update agent profile details."
                : "Add a new agent to the team."}
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
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Senior Sales Agent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Photo URL</Label>
                <Input
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Specialisations (comma separated)</Label>
                <Input
                  value={form.specialisations}
                  onChange={(e) => setForm({ ...form, specialisations: e.target.value })}
                  placeholder="Residential, Auctions"
                />
              </div>
              <div className="space-y-2">
                <Label>Suburbs (comma separated)</Label>
                <Input
                  value={form.suburbs}
                  onChange={(e) => setForm({ ...form, suburbs: e.target.value })}
                  placeholder="Brighton, Brighton"
                />
              </div>
              <div className="space-y-2">
                <Label>Languages (comma separated)</Label>
                <Input
                  value={form.languages}
                  onChange={(e) => setForm({ ...form, languages: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Years experience</Label>
                  <Input
                    type="number"
                    value={form.yearsExperience}
                    onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  />
                </div>
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
                  "Create agent"
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
            <AlertDialogTitle>Delete agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the agent profile for{" "}
              {deleteTarget?.name}. Linked user accounts are not affected.
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
