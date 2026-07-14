import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const service = await db.service.findUnique({ where: { slug } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    service: {
      ...service,
      process: parseJson(service.process, []),
      included: parseJson(service.included, []),
    },
  });
}
