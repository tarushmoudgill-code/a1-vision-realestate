import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminHandler, parseJson } from "@/lib/api";

export const GET = adminHandler(async () => {
  const [
    totalProperties,
    activeProperties,
    soldProperties,
    pendingInspections,
    newLeads,
    pendingTestimonials,
    newContacts,
    agents,
    activeListings,
  ] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { status: "ACTIVE" } }),
    db.property.count({ where: { status: "SOLD" } }),
    db.inspection.count({ where: { status: "PENDING" } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.testimonial.count({ where: { status: "PENDING" } }),
    db.contactSubmission.count({ where: { status: "NEW" } }),
    db.agent.count(),
    db.property.count({ where: { status: { in: ["ACTIVE", "UNDER_OFFER"] } } }),
  ]);

  const totalSalesValue = await db.agent.aggregate({ _sum: { totalSalesValue: true } });
  const recentProperties = await db.property.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { suburb: true, agent: true },
  });
  const recentLeads = await db.lead.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { property: true },
  });
  const recentInspections = await db.inspection.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { property: true, agent: true },
  });
  const activityFeed = await db.auditLog.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    kpis: {
      totalProperties,
      activeProperties,
      soldProperties,
      pendingInspections,
      newLeads,
      pendingTestimonials,
      newContacts,
      agents,
      activeListings,
      totalSalesValue: totalSalesValue._sum.totalSalesValue || 0,
    },
    recentProperties: recentProperties.map((p) => ({
      ...p,
      images: parseJson<string[]>(p.images, []),
    })),
    recentLeads,
    recentInspections,
    activityFeed,
  });
}, "dashboard");
