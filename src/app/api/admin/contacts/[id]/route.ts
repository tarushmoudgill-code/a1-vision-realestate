import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  for (const f of ["status","name","email","phone","subject","message"]) {
    if (f in b) data[f] = b[f];
  }
  const updated = await db.contactSubmission.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "contact", ctx.params.id, `Contact ${updated.status}`);
  return NextResponse.json({ contact: updated });
}, "contacts");

export const DELETE = adminHandler(async (ctx) => {
  await db.contactSubmission.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "contact", ctx.params.id, "Deleted contact");
  return NextResponse.json({ ok: true });
}, "contacts");
