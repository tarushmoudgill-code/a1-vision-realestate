import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.published)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const related = await db.blogPost.findMany({
    where: { published: true, id: { not: post.id }, category: post.category },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json({ post, related });
}
