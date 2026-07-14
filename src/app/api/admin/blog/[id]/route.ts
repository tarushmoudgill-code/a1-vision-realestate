import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const PATCH = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const data: Record<string, unknown> = {};
  const fields = ["title","slug","excerpt","content","category","featuredImage","published","metaTitle","metaDescription"];
  for (const f of fields) if (f in b) data[f] = b[f];
  if ("tags" in b) data.tags = Array.isArray(b.tags) ? (b.tags as string[]).join(",") : String(b.tags);
  const updated = await db.blogPost.update({ where: { id: ctx.params.id }, data });
  await audit(ctx.session.sub, "UPDATE", "blog", ctx.params.id, `Updated post ${updated.title}`);
  return NextResponse.json({ post: updated });
}, "blog");

export const DELETE = adminHandler(async (ctx) => {
  await db.blogPost.delete({ where: { id: ctx.params.id } });
  await audit(ctx.session.sub, "DELETE", "blog", ctx.params.id, "Deleted blog post");
  return NextResponse.json({ ok: true });
}, "blog");
