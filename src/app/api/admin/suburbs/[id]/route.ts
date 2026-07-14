import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  const fields = ["name","state","postcode","description","medianPrice","medianRent","growthRate","population","lifestyle","image","featured"];
  for (const f of fields) if (f in b) data[f] = b[f];
  if ("demographics" in b) data.demographics = JSON.stringify(b.demographics);
  if ("amenities" in b) data.amenities = JSON.stringify(b.amenities);
  const updated = await db.suburb.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "suburb", ctx.params.id, `Updated suburb ${updated.name}`);
  return NextResponse.json({ suburb: updated });
}, "suburbs");

export const DELETE = adminHandler(async (ctx) => {
  await db.suburb.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "suburb", ctx.params.id, "Deleted suburb");
  return NextResponse.json({ ok: true });
}, "suburbs");
