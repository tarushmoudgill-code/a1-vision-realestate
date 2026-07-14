import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler } from "@/lib/api";

export const GET = adminHandler(async () => {
  const customers = await db.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ customers });
}, "customers");
