"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Shield, Loader2, UserCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminPageHeader, AdminLoading, AdminEmpty } from "@/components/admin/shared";

interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  DEVELOPER: "Developer",
  AGENT: "Agent",
  PROPERTY_MANAGER: "Property Manager",
  MARKETING: "Marketing",
};

export function UsersAdmin() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "AGENT" });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // In static mode, this returns the seeded users from localStorage or JSON
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error();
        const data = await res.json();
        // If the API doesn't exist (static mode), construct from admin/user.json
        if (data.users) {
          setUsers(data.users);
        } else {
          // Fallback: show the 3 seeded accounts
          setUsers([
            { id: "1", email: "tarush@a1vision.com.au", name: "Tarush Moudgill", role: "DEVELOPER", active: true, createdAt: new Date().toISOString() },
            { id: "2", email: "admin@a1vision.com.au", name: "Ravi Kumar", role: "ADMIN", active: true, createdAt: new Date().toISOString() },
            { id: "3", email: "govinder@a1vision.com.au", name: "Govinder Kumar", role: "AGENT", active: true, createdAt: new Date().toISOString() },
          ]);
        }
      } catch {
        // Fallback for static mode
        setUsers([
          { id: "1", email: "tarush@a1vision.com.au", name: "Tarush Moudgill", role: "DEVELOPER", active: true, createdAt: new Date().toISOString() },
          { id: "2", email: "admin@a1vision.com.au", name: "Ravi Kumar", role: "ADMIN", active: true, createdAt: new Date().toISOString() },
          { id: "3", email: "govinder@a1vision.com.au", name: "Govinder Kumar", role: "AGENT", active: true, createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCreate() {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("All fields are required");
      return;
    }
    setCreating(true);
    try {
      const created: UserAccount = {
        id: "ls-" + Date.now(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [created, ...prev]);
      toast.success(`Account created for ${newUser.name}`, {
        description: `Email: ${newUser.email} · Role: ${ROLE_LABELS[newUser.role]}`,
      });
      setNewUser({ name: "", email: "", password: "", role: "AGENT" });
      setShowCreate(false);
    } catch {
      toast.error("Failed to create account");
    } finally {
      setCreating(false);
    }
  }

  function handleDelete(user: UserAccount) {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast.success(`Account deleted: ${user.email}`);
    setDeleteTarget(null);
  }

  const initials = (name: string) =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Accounts"
        description="Manage staff login accounts and permissions. Admins and Developers can create new accounts."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Create account
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle className="size-5 text-muted-foreground" />
            All accounts ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AdminLoading rows={4} />
          ) : users.length === 0 ? (
            <AdminEmpty title="No accounts" description="Create a new account to get started." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "ADMIN" || user.role === "DEVELOPER"
                              ? "bg-gold text-gold-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"} className="text-xs">
                          {user.active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog open={deleteTarget?.id === user.id} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(user)}
                            aria-label="Delete account"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the account for {user.name} ({user.email}). This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create account dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Create new staff account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full name</Label>
              <Input
                id="new-name"
                placeholder="e.g. John Smith"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="john@a1vision.com.au"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Temporary password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator — full access</SelectItem>
                  <SelectItem value="DEVELOPER">Developer — full access + coding tools</SelectItem>
                  <SelectItem value="AGENT">Agent — listings, leads, inspections</SelectItem>
                  <SelectItem value="PROPERTY_MANAGER">Property Manager — rentals & inspections</SelectItem>
                  <SelectItem value="MARKETING">Marketing — blog, testimonials, content</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
