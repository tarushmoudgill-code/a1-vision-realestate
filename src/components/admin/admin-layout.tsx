"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  Users,
  FileText,
  Star,
  MessageSquare,
  Building,
  MapPin,
  BarChart3,
  Settings,
  ScrollText,
  UserCircle,
  Menu,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  X,
  Bell,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth, type AuthUser } from "@/store/auth";
import { canAccessSection } from "@/lib/admin-rbac";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Listings",
    items: [
      { key: "properties", label: "Properties", icon: Home },
      { key: "inspections", label: "Inspections", icon: CalendarCheck },
    ],
  },
  {
    label: "CRM",
    items: [
      { key: "leads", label: "Leads", icon: Users },
      { key: "customers", label: "Customers", icon: UserCircle },
      { key: "contacts", label: "Contacts", icon: MessageSquare },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "blog", label: "Blog", icon: FileText },
      { key: "testimonials", label: "Testimonials", icon: Star },
      { key: "gallery", label: "Gallery", icon: Building },
    ],
  },
  {
    label: "Settings",
    items: [
      { key: "team", label: "Team", icon: Building },
      { key: "suburbs", label: "Suburbs", icon: MapPin },
      { key: "reports", label: "Reports", icon: BarChart3 },
      { key: "audit", label: "Audit Log", icon: ScrollText },
      { key: "settings", label: "Settings", icon: Settings },
      { key: "users", label: "User Accounts", icon: UserCircle },
    ],
  },
];

const SECTION_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  properties: "Properties",
  inspections: "Inspections",
  leads: "Leads CRM",
  customers: "Customers",
  blog: "Blog Posts",
  testimonials: "Testimonials",
  contacts: "Contact Submissions",
  gallery: "Gallery",
  team: "Team & Agents",
  suburbs: "Suburb Guides",
  reports: "Reports & Analytics",
  audit: "Audit Log",
  settings: "Site Settings",
  users: "User Accounts",
  developer: "Developer Console",
  profile: "My Profile",
};

const ROLE_LABEL: Record<AuthUser["role"], string> = {
  ADMIN: "Administrator",
  DEVELOPER: "Developer",
  AGENT: "Agent",
  PROPERTY_MANAGER: "Property Manager",
  MARKETING: "Marketing",
};

function NavList({
  active,
  onNavigate,
  role,
}: {
  active: string;
  onNavigate: (s: string) => void;
  role: AuthUser["role"];
}) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-3">
      {NAV_GROUPS.map((group, gi) => {
        const visibleItems = group.items.filter((item) => canAccessSection(role, item.key));
        if (visibleItems.length === 0) return null;
        return (
          <div key={group.label}>
            {gi > 0 && <Separator className="my-2 bg-sidebar-border" />}
            <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group.label}
            </p>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gold text-gold-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-gold-foreground"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function BrandMark() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm">
        <Image src="/logo.png" alt="A1 Vision Real Estate" width={130} height={44} className="h-9 w-auto shrink-0 object-contain sm:h-10" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
        Admin Console
      </p>
    </div>
  );
}

function UserMenu() {
  const navigate = useRouter((s) => s.navigate);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-2.5 text-sm shadow-sm transition-colors hover:bg-muted sm:pr-3">
          <Avatar className="size-7">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-medium leading-tight">{user.name}</span>
            <span className="block text-[10px] text-muted-foreground leading-tight">
              {ROLE_LABEL[user.role]}
            </span>
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <Badge className="mt-3 w-fit bg-gold text-gold-foreground">
            {ROLE_LABEL[user.role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("admin/settings")}>
          <Settings className="size-4" />
          Site settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("admin/audit")}>
          <ScrollText className="size-4" />
          Activity log
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("home")}>
          <ExternalLink className="size-4" />
          View website
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            await logout();
            navigate("home");
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AdminLayoutProps {
  active: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
}

export function AdminLayout({ active, onNavigate, children }: AdminLayoutProps) {
  const navigate = useRouter((s) => s.navigate);
  const user = useAuth((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = SECTION_TITLES[active] || "Dashboard";

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <BrandMark />
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-luxe">
          {user && (
            <NavList
              active={active}
              role={user.role}
              onNavigate={(s) => onNavigate(s)}
            />
          )}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border px-5 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle asChild>
                <div><BrandMark /></div>
              </SheetTitle>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto">
            {user && (
              <NavList
                active={active}
                role={user.role}
                onNavigate={(s) => {
                  setMobileOpen(false);
                  onNavigate(s);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <button
                onClick={() => onNavigate("dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                Admin
              </button>
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
              <span className="font-medium text-foreground">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => navigate("home")}
            >
              <ExternalLink className="size-4" />
              View site
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => navigate("home")}
              aria-label="View site"
            >
              <ExternalLink className="size-4" />
            </Button>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
