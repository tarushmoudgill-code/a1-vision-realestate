import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async () => {
  let s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!s) s = await db.siteSettings.create({ data: { id: "singleton" } });
  return NextResponse.json({ settings: s });
}, "settings");

export const PATCH = adminHandler(async (ctx, req) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const allowed = [
    "businessName","tagline","phone","email","address","hours","heroTitle",
    "heroSubtitle","heroImage","heroCtaText","facebook","instagram","linkedin",
    "youtube","maintenanceMode",
  ];
  const data: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) data[k] = body[k];
  let s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!s) s = await db.siteSettings.create({ data: { id: "singleton" } });
  const updated = await db.siteSettings.update({
    where: { id: "singleton" },
    data,
  });
  await audit(ctx.session.sub, "UPDATE", "settings", "singleton", "Updated site settings");
  return NextResponse.json({ settings: updated });
}, "settings");
