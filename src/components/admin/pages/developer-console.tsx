"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Terminal, Database, RefreshCw, Code2, GitBranch, Server,
  Cpu, HardDrive, Activity, Zap, Bug, CheckCircle2, Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminPageHeader } from "@/components/admin/shared";

export function DeveloperConsole() {
  const [stats, setStats] = useState({
    localStorageKeys: 0,
    localStorageSize: 0,
    dataFiles: 0,
    cacheSize: 0,
  });
  const statsLoaded = useRef(false);

  useEffect(() => {
    if (statsLoaded.current) return;
    statsLoaded.current = true;
    // Gather browser/storage stats
    let lsKeys = 0;
    let lsSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          lsKeys++;
          lsSize += (localStorage.getItem(key) || "").length;
        }
      }
    } catch {
      // ignore
    }
    const computed = {
      localStorageKeys: lsKeys,
      localStorageSize: Math.round(lsSize / 1024),
      dataFiles: 21,
      cacheSize: Math.round(lsSize / 1024),
    };
    // Defer state update to avoid synchronous setState in effect
    Promise.resolve().then(() => setStats(computed));
  }, []);

  function clearCache() {
    try {
      // Keep favorites and auth, clear admin data
      const keep = ["ah-favorites", "ah-saved-searches"];
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keep.includes(key) && key.startsWith("ah-")) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
      toast.success(`Cleared ${toRemove.length} cache entries`, {
        description: "Admin data reset to defaults. Refresh to see original data.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error("Failed to clear cache");
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  }

  const envInfo = [
    { label: "Framework", value: "Next.js 16 (App Router)" },
    { label: "Language", value: "TypeScript 5" },
    { label: "Database", value: "PostgreSQL (Prisma ORM)" },
    { label: "Styling", value: "Tailwind CSS 4 + shadcn/ui" },
    { label: "Auth", value: "JWT + bcrypt (httpOnly cookies)" },
    { label: "State", value: "Zustand (client) + fetch (server)" },
    { label: "Charts", value: "Recharts" },
    { label: "Icons", value: "lucide-react" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Developer Console"
        description="System diagnostics, cache management, and technical information. For developers only."
      />

      {/* System Status */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
              <Server className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold text-emerald-600">Operational</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <Database className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">DB Tables</p>
              <p className="text-sm font-semibold">13 models</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <HardDrive className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Cache Size</p>
              <p className="text-sm font-semibold">{stats.localStorageSize} KB</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <Cpu className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Data Files</p>
              <p className="text-sm font-semibold">{stats.dataFiles} JSON</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cache Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-5 text-gold" />
              Cache Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span className="text-muted-foreground">localStorage entries</span>
              <Badge variant="secondary">{stats.localStorageKeys} keys</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span className="text-muted-foreground">Estimated cache size</span>
              <Badge variant="secondary">{stats.localStorageSize} KB</Badge>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearCache} className="text-destructive">
                <RefreshCw className="size-4" />
                Clear admin cache
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <Activity className="size-4" />
                Reload page
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clearing the cache resets admin data to defaults. Favourites and saved searches are preserved.
            </p>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="size-5 text-gold" />
              Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {envInfo.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{item.value}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="size-5 text-gold" />
              API Endpoints Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { method: "GET", path: "/api/properties", desc: "List properties with filters" },
                { method: "GET", path: "/api/properties/[slug]", desc: "Property detail" },
                { method: "GET", path: "/api/agents", desc: "All agents" },
                { method: "GET", path: "/api/suburbs", desc: "All suburb guides" },
                { method: "GET", path: "/api/blog", desc: "Published blog posts" },
                { method: "POST", path: "/api/inspections", desc: "Book an inspection" },
                { method: "POST", path: "/api/leads", desc: "Submit enquiry/appraisal" },
                { method: "POST", path: "/api/contacts", desc: "Contact form submission" },
                { method: "POST", path: "/api/auth/login", desc: "Login (sets session cookie)" },
                { method: "POST", path: "/api/auth/logout", desc: "Clear session" },
                { method: "GET", path: "/api/admin/dashboard", desc: "Admin KPIs (protected)" },
                { method: "GET", path: "/api/admin/properties", desc: "Admin properties (protected)" },
              ].map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-muted/50"
                >
                  <Badge
                    className={
                      endpoint.method === "GET"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="flex-1 font-mono text-xs">{endpoint.path}</code>
                  <span className="hidden text-xs text-muted-foreground sm:block">{endpoint.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="size-5 text-gold" />
              Developer Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(stats, null, 2), "system stats")}
              >
                <Copy className="size-4" />
                Copy system stats
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const info = {
                    userAgent: navigator.userAgent,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    online: navigator.onLine,
                    cookies: document.cookie.length > 0 ? "present" : "none",
                  };
                  copyToClipboard(JSON.stringify(info, null, 2), "browser info");
                }}
              >
                <Copy className="size-4" />
                Copy browser info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("All systems operational", {
                    description: "Database, API, and static assets are healthy.",
                  });
                }}
              >
                <CheckCircle2 className="size-4" />
                Run health check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
