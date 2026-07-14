import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/api";
import { audit } from "@/lib/auth";
import { runSeed } from "@/lib/seed";

export const POST = adminHandler(async (ctx) => {
  const result = await runSeed();
  await audit(ctx.session.sub, "SEED", "system", "db", "Re-seeded database");
  return NextResponse.json(result);
}, "dashboard");
