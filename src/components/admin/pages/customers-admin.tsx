"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, AlertTriangle, Mail, Phone, Save, Loader2 } from "lucide-react";
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
import { formatDate } from "@/lib/format";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  preferences?: string;
  notes: string;
  createdAt: string;
}

const ROLES = ["BUYER", "SELLER", "TENANT", "LANDLORD", "INVESTOR"];

const ROLE_BADGE: Record<string, string> = {
  BUYER: "bg-primary/15 text-primary border-primary/20",
  SELLER: "bg-gold/15 text-gold border-gold/30",
  TENANT: "bg-amber-100 text-amber-800 border-amber-200",
  LANDLORD: "bg-emerald-100 text-emerald-800 border-emerald-200",
  INVESTOR: "bg-violet-100 text-violet-800 border-violet-200",
};

export function CustomersAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [notesTarget, setNotesTarget] = useState<Customer | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setCustomers(j.customers || []);
    } catch {
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchR = filterRole === "all" || c.role === filterRole;
      return matchQ && matchR;
    });
  }, [customers, search, filterRole]);

  function openNotes(c: Customer) {
    setNotesTarget(c);
    setNotesValue(c.notes || "");
  }

  async function saveNotes() {
    if (!notesTarget) return;
    setSaving(true);
    try {
      // Customers route is read-only on the server; we keep this optimistic
      // and persist via a local map (the API does not yet expose PATCH).
      // When a PATCH endpoint is added, replace this with a real request.
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === notesTarget.id ? { ...c, notes: notesValue } : c
        )
      );
      toast.success("Notes saved locally.");
      setNotesTarget(null);
    } catch {
      toast.error("Failed to save notes.");
    } finally {
      setSaving(false);
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
              placeholder="Search name, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">{filtered.length} customers</Badge>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="size-3" /> {c.email}
                          </a>
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Phone className="size-3" /> {c.phone}
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={ROLE_BADGE[c.role] || ""}
                          >
                            {c.role.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                          {c.notes || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openNotes(c)}
                          >
                            Edit notes
                          </Button>
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

      <Dialog
        open={Boolean(notesTarget)}
        onOpenChange={(o) => !o && setNotesTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notes — {notesTarget?.name}</DialogTitle>
            <DialogDescription>
              Internal notes about this customer. Visible to staff only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cust-notes">Notes</Label>
            <Textarea
              id="cust-notes"
              rows={6}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Preferences, requirements, history…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveNotes} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
