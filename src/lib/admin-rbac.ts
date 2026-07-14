import type { AuthUser } from "@/store/auth";

export type Role = AuthUser["role"];

// Mirrors server-side ROLE_ACCESS in src/lib/auth.ts (client-side gate).
// Items not in this list for a role are hidden from the sidebar and
// navigation to them is blocked with a "no access" panel.
export const SECTION_ACCESS: Record<Role, string[]> = {
  ADMIN: [
    "dashboard",
    "properties",
    "inspections",
    "leads",
    "customers",
    "blog",
    "testimonials",
    "contacts",
    "team",
    "suburbs",
    "reports",
    "settings",
    "audit",
    "users",
    "developer",
  ],
  DEVELOPER: [
    "dashboard",
    "properties",
    "inspections",
    "leads",
    "customers",
    "blog",
    "testimonials",
    "contacts",
    "team",
    "suburbs",
    "reports",
    "settings",
    "audit",
    "users",
    "developer",
  ],
  AGENT: [
    "dashboard",
    "properties",
    "inspections",
    "leads",
    "customers",
    "blog",
    "testimonials",
    "contacts",
    "reports",
    "suburbs",
    "audit",
  ],
  PROPERTY_MANAGER: [
    "dashboard",
    "properties",
    "inspections",
    "leads",
    "customers",
    "reports",
  ],
  MARKETING: [
    "dashboard",
    "blog",
    "testimonials",
    "contacts",
    "suburbs",
    "reports",
  ],
};

export function canAccessSection(role: Role, section: string): boolean {
  return SECTION_ACCESS[role]?.includes(section) ?? false;
}
