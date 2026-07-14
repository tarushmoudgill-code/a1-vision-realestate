import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseJson } from "@/lib/api";

export const GET = adminHandler(async () => {
  const agents = await db.agent.findMany({
    include: {
      _count: {
        select: { properties: true, leads: true, inspections: true },
      },
    },
    orderBy: { soldCount: "desc" },
  });

  const topProperties = await db.property.findMany({
    orderBy: { views: "desc" },
    take: 8,
    include: { suburb: true },
  });

  const leadStatusCounts = await db.lead.groupBy({
    by: ["status"],
    _count: true,
  });
  const leadTypeCounts = await db.lead.groupBy({
    by: ["type"],
    _count: true,
  });

  const inspectionsByStatus = await db.inspection.groupBy({
    by: ["status"],
    _count: true,
  });

  const soldProps = await db.property.findMany({
    where: { status: "SOLD" },
    select: { price: true, updatedAt: true },
  });
  const salesVolume = soldProps.reduce((s, p) => s + p.price, 0);

  const enquiries = await db.lead.count();
  const inspectionsDone = await db.inspection.count({
    where: { status: "COMPLETED" },
  });

  return NextResponse.json({
    agentLeaderboard: agents.map((a) => ({
      id: a.id,
      name: a.name,
      title: a.title,
      photo: a.photo,
      soldCount: a.soldCount,
      totalSalesValue: a.totalSalesValue,
      activeListings: a.activeListings,
      rating: a.rating,
      properties: a._count.properties,
      leads: a._count.leads,
      inspections: a._count.inspections,
    })),
    topProperties: topProperties.map((p) => ({
      ...p,
      images: parseJson<string[]>(p.images, []),
    })),
    leadStatusCounts,
    leadTypeCounts,
    inspectionsByStatus,
    salesVolume,
    enquiries,
    inspectionsDone,
    conversionRate: enquiries > 0 ? (inspectionsDone / enquiries) * 100 : 0,
  });
}, "reports");
