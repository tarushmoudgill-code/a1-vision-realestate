"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, AlertTriangle, Download } from "lucide-react";
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
import { formatDate, timeAgo } from "@/lib/format";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  detail: string;
  createdAt: string;
  user?: { name: string | null; email: string | null } | null;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  UPDATE: "bg-primary/15 text-primary border-primary/20",
  DELETE: "bg-destructive/15 text-destructive border-destructive/20",
  SEED: "bg-gold/15 text-gold border-gold/30",
  LOGIN: "bg-amber-100 text-amber-800 border-amber-200",
  LOGOUT: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

function downloadCsv(rows: AuditLog[]) {
  if (!rows.length) return;
  const headers = ["timestamp", "user", "email", "action", "entity", "entityId", "detail"];
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.createdAt,
        r.user?.name || "",
        r.user?.email || "",
        r.action,
        r.entity,
        r.entityId || "",
        r.detail || "",
      ]
        .map(escape)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function AuditAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setLogs(j.logs || []);
    } catch {
      toast.error("Failed to load audit log.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const actions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set);
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      const matchQ =
        !q ||
        (l.user?.name || "").toLowerCase().includes(q) ||
        (l.user?.email || "").toLowerCase().includes(q) ||
        (l.detail || "").toLowerCase().includes(q) ||
        (l.entity || "").toLowerCase().includes(q);
      const matchA = filterAction === "all" || l.action === filterAction;
      return matchQ && matchA;
    });
  }, [logs, search, filterAction]);

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
              placeholder="Search user, entity, detail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>
                  {a.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => downloadCsv(filtered)}
          disabled={!filtered.length}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No audit log entries.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          <p className="font-medium">{formatDate(l.createdAt)}</p>
                          <p className="text-xs text-muted-foreground">
                            {timeAgo(l.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">
                            {l.user?.name || "System"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {l.user?.email || "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={ACTION_COLORS[l.action] || ""}
                          >
                            {l.action.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{l.entity}</span>
                          {l.entityId && (
                            <p className="text-xs text-muted-foreground">
                              {l.entityId}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                          {l.detail || "—"}
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
    </div>
  );
}
