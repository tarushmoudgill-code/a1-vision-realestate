"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useRouter } from "@/store/router";
import { useAuth, type AuthUser } from "@/store/auth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminLayout } from "@/components/admin/admin-layout";
import { canAccessSection } from "@/lib/admin-rbac";

type Role = AuthUser["role"];

// Lazy-load each section to keep the admin bundle reasonable.
const DashboardPage = dynamic(() => import("@/components/admin/pages/dashboard-page").then((m) => m.DashboardPage), { ssr: false });
const PropertiesAdmin = dynamic(() => import("@/components/admin/pages/properties-admin").then((m) => m.PropertiesAdmin), { ssr: false });
const InspectionsAdmin = dynamic(() => import("@/components/admin/pages/inspections-admin").then((m) => m.InspectionsAdmin), { ssr: false });
const LeadsAdmin = dynamic(() => import("@/components/admin/pages/leads-admin").then((m) => m.LeadsAdmin), { ssr: false });
const BlogAdmin = dynamic(() => import("@/components/admin/pages/blog-admin").then((m) => m.BlogAdmin), { ssr: false });
const TestimonialsAdmin = dynamic(() => import("@/components/admin/pages/testimonials-admin").then((m) => m.TestimonialsAdmin), { ssr: false });
const ContactsAdmin = dynamic(() => import("@/components/admin/pages/contacts-admin").then((m) => m.ContactsAdmin), { ssr: false });
const TeamAdmin = dynamic(() => import("@/components/admin/pages/team-admin").then((m) => m.TeamAdmin), { ssr: false });
const SuburbsAdmin = dynamic(() => import("@/components/admin/pages/suburbs-admin").then((m) => m.SuburbsAdmin), { ssr: false });
const ReportsAdmin = dynamic(() => import("@/components/admin/pages/reports-admin").then((m) => m.ReportsAdmin), { ssr: false });
const SettingsAdmin = dynamic(() => import("@/components/admin/pages/settings-admin").then((m) => m.SettingsAdmin), { ssr: false });
const AuditAdmin = dynamic(() => import("@/components/admin/pages/audit-admin").then((m) => m.AuditAdmin), { ssr: false });
const CustomersAdmin = dynamic(() => import("@/components/admin/pages/customers-admin").then((m) => m.CustomersAdmin), { ssr: false });
const UsersAdmin = dynamic(() => import("@/components/admin/pages/users-admin").then((m) => m.UsersAdmin), { ssr: false });
const DeveloperConsole = dynamic(() => import("@/components/admin/pages/developer-console").then((m) => m.DeveloperConsole), { ssr: false });

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-sidebar">
      <div className="flex flex-col items-center gap-4 text-sidebar-foreground">
        <div className="rounded-lg bg-white px-4 py-2.5 shadow-md animate-pulse">
          <Image src="/logo.png" alt="A1 Vision Real Estate" width={170} height={58} className="h-12 w-auto object-contain sm:h-14" />
        </div>
        <p className="text-xs text-sidebar-foreground/70">Loading staff portal…</p>
      </div>
    </div>
  );
}

function NoAccess() {
  const navigate = useRouter((s) => s.navigate);
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={22} />
        </span>
        <h2 className="font-serif text-2xl">No access</h2>
        <p className="text-sm text-muted-foreground">
          Your role does not have permission to view this section. Contact an
          administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate("admin/dashboard")}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export function AdminApp() {
  const segments = useRouter((s) => s.segments);
  const navigate = useRouter((s) => s.navigate);
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const fetchMe = useAuth((s) => s.fetchMe);

  useEffect(() => {
    if (!hydrated) fetchMe();
  }, [hydrated, fetchMe]);

  const section = segments[1] || "dashboard";

  const page = useMemo(() => {
    switch (section) {
      case "dashboard": return <DashboardPage />;
      case "properties": return <PropertiesAdmin />;
      case "inspections": return <InspectionsAdmin />;
      case "leads": return <LeadsAdmin />;
      case "blog": return <BlogAdmin />;
      case "testimonials": return <TestimonialsAdmin />;
      case "contacts": return <ContactsAdmin />;
      case "team": return <TeamAdmin />;
      case "suburbs": return <SuburbsAdmin />;
      case "reports": return <ReportsAdmin />;
      case "settings": return <SettingsAdmin />;
      case "audit": return <AuditAdmin />;
      case "customers": return <CustomersAdmin />;
      case "users": return <UsersAdmin />;
      case "developer": return <DeveloperConsole />;
      default: return <DashboardPage />;
    }
  }, [section]);

  if (!hydrated) return <Splash />;

  if (!user) return <AdminLogin />;

  // Normalize unknown sections to dashboard for access checks.
  const allowed = canAccessSection(user.role, section === "profile" ? "profile" : section);

  return (
    <AdminLayout active={section} onNavigate={(s) => navigate(`admin/${s}`)}>
      {allowed ? page : <NoAccess />}
    </AdminLayout>
  );
}
