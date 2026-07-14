import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const agents = await db.agent.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({
    agents: agents.map((a) => ({
      ...a,
      specialisations: a.specialisations.split(",").map((s) => s.trim()).filter(Boolean),
      suburbs: a.suburbs.split(",").map((s) => s.trim()).filter(Boolean),
      languages: a.languages.split(",").map((s) => s.trim()).filter(Boolean),
    })),
  });
}
