import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  for (const f of ["name","location","rating","serviceType","message","avatar","status"]) {
    if (f in b) data[f] = b[f];
  }
  const updated = await db.testimonial.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "testimonial", ctx.params.id, `Testimonial ${updated.status}`);
  return NextResponse.json({ testimonial: updated });
}, "testimonials");

export const DELETE = adminHandler(async (ctx) => {
  await db.testimonial.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "testimonial", ctx.params.id, "Deleted testimonial");
  return NextResponse.json({ ok: true });
}, "testimonials");
