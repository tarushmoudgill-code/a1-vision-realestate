import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;
  const posts = await db.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ posts });
}
