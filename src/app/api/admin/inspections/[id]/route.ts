import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  for (const f of ["status","agentId","preferredDate","preferredTime","message"]) {
    if (f in b) data[f] = b[f];
  }
  const updated = await db.inspection.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "inspection", ctx.params.id, `Inspection ${updated.status}`);
  return NextResponse.json({ inspection: updated });
}, "inspections");

export const DELETE = adminHandler(async (ctx) => {
  await db.inspection.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "inspection", ctx.params.id, "Deleted inspection");
  return NextResponse.json({ ok: true });
}, "inspections");
