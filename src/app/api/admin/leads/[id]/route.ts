import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  for (const f of ["status","assignedAgentId","notes","type","name","email","phone"]) {
    if (f in b) data[f] = b[f];
  }
  const updated = await db.lead.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "lead", ctx.params.id, `Lead ${updated.status}`);
  return NextResponse.json({ lead: updated });
}, "leads");

export const DELETE = adminHandler(async (ctx) => {
  await db.lead.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "lead", ctx.params.id, "Deleted lead");
  return NextResponse.json({ ok: true });
}, "leads");
