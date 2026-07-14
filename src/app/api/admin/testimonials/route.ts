import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler } from "@/lib/api";

export const GET = adminHandler(async () => {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ testimonials });
}, "testimonials");
