"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Loader2, AlertTriangle, Building2 } from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface SiteSettings {
  id: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  maintenanceMode: boolean;
}

const EMPTY: SiteSettings = {
  id: "singleton",
  businessName: "",
  tagline: "",
  phone: "",
  email: "",
  address: "",
  hours: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  heroCtaText: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  maintenanceMode: false,
};

export function SettingsAdmin() {
  const navigate = useRouter((s) => s.navigate);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  const [settings, setSettings] = useState<SiteSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const j = await res.json();
      setSettings({ ...EMPTY, ...(j.settings || {}) });
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error("Save failed");
      const j = await res.json();
      setSettings({ ...EMPTY, ...(j.settings || {}) });
      toast.success("Settings saved.");
    } catch {
      toast.error("Failed to save settings.");
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

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          These values drive the public website&apos;s branding, contact
          details, hero section and social links.
        </p>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Business info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-gold" />
              Business information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input
                value={settings.businessName}
                onChange={(e) =>
                  setSettings({ ...settings, businessName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={settings.tagline}
                onChange={(e) =>
                  setSettings({ ...settings, tagline: e.target.value })
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Opening hours</Label>
              <Input
                value={settings.hours}
                onChange={(e) =>
                  setSettings({ ...settings, hours: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Hero */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Homepage hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Hero title</Label>
              <Input
                value={settings.heroTitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroTitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hero subtitle</Label>
              <Textarea
                rows={3}
                value={settings.heroSubtitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroSubtitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hero image URL</Label>
              <Input
                value={settings.heroImage}
                onChange={(e) =>
                  setSettings({ ...settings, heroImage: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hero CTA text</Label>
              <Input
                value={settings.heroCtaText}
                onChange={(e) =>
                  setSettings({ ...settings, heroCtaText: e.target.value })
                }
              />
            </div>
            {settings.heroImage && (
              <div className="overflow-hidden rounded-md border">
                <img
                  src={settings.heroImage}
                  alt="Hero preview"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Social links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input
                value={settings.facebook}
                onChange={(e) =>
                  setSettings({ ...settings, facebook: e.target.value })
                }
                placeholder="https://facebook.com/…"
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={settings.instagram}
                onChange={(e) =>
                  setSettings({ ...settings, instagram: e.target.value })
                }
                placeholder="https://instagram.com/…"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={settings.linkedin}
                onChange={(e) =>
                  setSettings({ ...settings, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/…"
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube</Label>
              <Input
                value={settings.youtube}
                onChange={(e) =>
                  setSettings({ ...settings, youtube: e.target.value })
                }
                placeholder="https://youtube.com/…"
              />
            </div>
          </CardContent>
        </Card>

        {/* Operations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="text-sm font-medium">Maintenance mode</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, the public site shows a maintenance notice.
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) =>
                  setSettings({ ...settings, maintenanceMode: v })
                }
              />
            </div>
            <Separator />
            <div className="rounded-md bg-muted/40 p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Tip</p>
              <p className="mt-1">
                Changes take effect immediately on the public website. Use
                maintenance mode during scheduled outages.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
