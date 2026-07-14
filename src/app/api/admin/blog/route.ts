import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseBody } from "@/lib/api";
import { audit } from "@/lib/auth";

export const GET = adminHandler(async () => {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ posts });
}, "blog");

export const POST = adminHandler(async (ctx, req) => {
  const b = await parseBody<Record<string, unknown>>(req);
  const title = String(b.title || "");
  const slug = String(b.slug || slugify(title) + "-" + rand());
  const created = await db.blogPost.create({
    data: {
      title,
      slug,
      excerpt: String(b.excerpt || ""),
      content: String(b.content || ""),
      category: String(b.category || "Insights"),
      tags: Array.isArray(b.tags) ? (b.tags as string[]).join(",") : String(b.tags || ""),
      authorId: ctx.session.sub,
      featuredImage: String(b.featuredImage || ""),
      published: Boolean(b.published),
      publishedAt: new Date(),
      metaTitle: b.metaTitle ? String(b.metaTitle) : null,
      metaDescription: b.metaDescription ? String(b.metaDescription) : null,
    },
  });
  await audit(ctx.session.sub, "CREATE", "blog", created.id, `Created post ${created.title}`);
  return NextResponse.json({ post: created });
}, "blog");

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function rand() {
  return Math.random().toString(36).slice(2, 6);
}
