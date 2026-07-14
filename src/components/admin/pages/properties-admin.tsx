"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Loader2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, listingBadge, imageUrl } from "@/lib/format";
import {
  PROPERTY_TYPES,
  LISTING_TYPE_LABEL,
} from "@/lib/constants";
import type { Property, Agent, Suburb } from "@/lib/types";
import { cn } from "@/lib/utils";

const LISTING_TYPES = Object.keys(LISTING_TYPE_LABEL);
const STATUS_OPTIONS = ["ACTIVE", "UNDER_OFFER", "SOLD", "LEASED", "WITHDRAWN"];

interface PropertyRow extends Property {
  images: string[];
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  address: string;
  suburbId: string;
  price: string;
  priceDisplay: string;
  listingType: string;
  status: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  carSpaces: string;
  landSize: string;
  buildingSize: string;
  features: string; // comma-separated
  images: string; // newline-separated URLs
  agentId: string;
  featured: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  description: "",
  address: "",
  suburbId: "",
  price: "",
  priceDisplay: "",
  listingType: "SALE",
  status: "ACTIVE",
  propertyType: "House",
  bedrooms: "0",
  bathrooms: "0",
  carSpaces: "0",
  landSize: "0",
  buildingSize: "0",
  features: "",
  images: "",
  agentId: "",
  featured: false,
};

function rowToForm(p: PropertyRow): FormState {
  const imgs = Array.isArray(p.images) ? p.images : [];
  return {
    title: p.title || "",
    slug: p.slug || "",
    description: p.description || "",
    address: p.address || "",
    suburbId: p.suburbId || "",
    price: String(p.price ?? ""),
    priceDisplay: p.priceDisplay || "",
    listingType: p.listingType || "SALE",
    status: p.status || "ACTIVE",
    propertyType: p.propertyType || "House",
    bedrooms: String(p.bedrooms ?? 0),
    bathrooms: String(p.bathrooms ?? 0),
    carSpaces: String(p.carSpaces ?? 0),
    landSize: String(p.landSize ?? 0),
    buildingSize: String(p.buildingSize ?? 0),
    features: Array.isArray(p.features) ? p.features.join(", ") : "",
    images: imgs.join("\n"),
    agentId: p.agentId || "",
    featured: Boolean(p.featured),
  };
}

function formToPayload(f: FormState) {
  return {
    title: f.title,
    slug: f.slug || undefined,
    description: f.description,
    address: f.address,
    suburbId: f.suburbId,
    price: Number(f.price) || 0,
    priceDisplay: f.priceDisplay,
    listingType: f.listingType,
    status: f.status,
    propertyType: f.propertyType,
    bedrooms: Number(f.bedrooms) || 0,
    bathrooms: Number(f.bathrooms) || 0,
    carSpaces: Number(f.carSpaces) || 0,
    landSize: Number(f.landSize) || 0,
    buildingSize: Number(f.buildingSize) || 0,
    features: f.features
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    images: f.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    agentId: f.agentId,
    featured: f.featured,
  };
}

export function PropertiesAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PropertyRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PropertyRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, ag, su] = await Promise.all([
        fetch("/api/admin/properties", { cache: "no-store" }),
        fetch("/api/admin/agents", { cache: "no-store" }),
        fetch("/api/admin/suburbs", { cache: "no-store" }),
      ]);
      if (pr.status === 401) {
        setSessionExpired(true);
        return;
      }
      const [pj, aj, sj] = await Promise.all([pr.json(), ag.json(), su.json()]);
      setRows(pj.properties || []);
      setAgents(aj.agents || []);
      setSuburbs(sj.suburbs || []);
    } catch {
      toast.error("Failed to load properties.");
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
        r.title.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        (r.suburb?.name || "").toLowerCase().includes(q);
      const matchType = filterType === "all" || r.listingType === filterType;
      return matchQ && matchType;
    });
  }, [rows, search, filterType]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      suburbId: suburbs[0]?.id || "",
      agentId: agents[0]?.id || "",
    });
    setDialogOpen(true);
  }

  function openEdit(p: PropertyRow) {
    setEditing(p);
    setForm(rowToForm(p));
    setDialogOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title || !form.suburbId || !form.agentId) {
      toast.error("Title, suburb and agent are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const url = editing
        ? `/api/admin/properties/${editing.id}`
        : "/api/admin/properties";
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
      toast.success(editing ? "Property updated." : "Property created.");
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Failed to save property.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(p: PropertyRow) {
    try {
      const res = await fetch(`/api/admin/properties/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !p.featured }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) => (r.id === p.id ? { ...r, featured: !r.featured } : r))
      );
      toast.success(p.featured ? "Removed from featured." : "Marked as featured.");
    } catch {
      toast.error("Failed to toggle featured.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/properties/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Property deleted.");
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error("Failed to delete property.");
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, address, suburb…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Listing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {LISTING_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {LISTING_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add property
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
                    <TableHead className="w-[60px]" />
                    <TableHead>Title</TableHead>
                    <TableHead>Suburb</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                        No properties found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => {
                      const img = p.images?.[0] ? imageUrl(p.images[0]) : "";
                      const badge = listingBadge(p.listingType);
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="size-11 overflow-hidden rounded-md bg-muted">
                              {img && (
                                <img
                                  src={img}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{p.title}</span>
                              {p.featured && (
                                <Star className="size-3.5 fill-gold text-gold" />
                              )}
                            </div>
                            <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                              {p.address}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {p.suburb?.name || "—"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {p.priceDisplay || formatPrice(p.price)}
                          </TableCell>
                          <TableCell>
                            <Badge className={badge.tone}>
                              {LISTING_TYPE_LABEL[p.listingType] || p.listingType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {p.status?.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {p.agent?.name || "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {p.views ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`property/${p.slug}`)}>
                                  <Eye className="size-4" />
                                  View listing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(p)}>
                                  <Pencil className="size-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleFeatured(p)}>
                                  <Star className="size-4" />
                                  {p.featured ? "Unfeature" : "Feature"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(p)}
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

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit property" : "New property"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the listing details below."
                : "Fill in the details to create a new listing."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (optional)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated if blank"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Suburb</Label>
                <Select
                  value={form.suburbId}
                  onValueChange={(v) => setForm({ ...form, suburbId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select suburb" />
                  </SelectTrigger>
                  <SelectContent>
                    {suburbs.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}, {s.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select
                  value={form.agentId}
                  onValueChange={(v) => setForm({ ...form, agentId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (number)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price display</Label>
                <Input
                  value={form.priceDisplay}
                  onChange={(e) => setForm({ ...form, priceDisplay: e.target.value })}
                  placeholder="$2,450,000 or Offers Over"
                />
              </div>
              <div className="space-y-2">
                <Label>Listing type</Label>
                <Select
                  value={form.listingType}
                  onValueChange={(v) => setForm({ ...form, listingType: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {LISTING_TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="w-full">
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
              </div>
              <div className="space-y-2">
                <Label>Property type</Label>
                <Select
                  value={form.propertyType}
                  onValueChange={(v) => setForm({ ...form, propertyType: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Beds</Label>
                  <Input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Baths</Label>
                  <Input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cars</Label>
                  <Input
                    type="number"
                    value={form.carSpaces}
                    onChange={(e) => setForm({ ...form, carSpaces: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Land size (m²)</Label>
                  <Input
                    type="number"
                    value={form.landSize}
                    onChange={(e) => setForm({ ...form, landSize: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Building size (m²)</Label>
                  <Input
                    type="number"
                    value={form.buildingSize}
                    onChange={(e) => setForm({ ...form, buildingSize: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Features (comma separated)</Label>
                <Input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Pool, Garage, Air conditioning"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Images (one URL per line)</Label>
                <Textarea
                  rows={4}
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
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
                  Feature this property on the homepage
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
                  "Create property"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className={cn(
                "bg-destructive text-white hover:bg-destructive/90"
              )}
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
