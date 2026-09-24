import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/stats — aggregate dashboard statistics
export async function GET() {
  try {
    const [total, resolved, inProgress, verified, critical, byCategoryRaw, upvotesAgg, last7d] = await Promise.all([
      db.issue.count(),
      db.issue.count({ where: { status: "resolved" } }),
      db.issue.count({ where: { status: "in_progress" } }),
      db.issue.count({ where: { status: "verified" } }),
      db.issue.count({ where: { severity: "critical" } }),
      db.issue.groupBy({ by: ["category"], _count: { _all: true } }),
      db.issue.aggregate({ _sum: { upvotes: true } }),
      db.issue.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } } }),
    ]);

    const byVillageRaw = await db.issue.groupBy({ by: ["village"], _count: { _all: true } });

    const byCategory: Record<string, number> = {};
    for (const row of byCategoryRaw) byCategory[row.category] = row._count._all;

    const byVillage: Record<string, number> = {};
    for (const row of byVillageRaw) if (row.village) byVillage[row.village] = row._count._all;

    return NextResponse.json({
      total,
      resolved,
      inProgress,
      verified,
      critical,
      last7d,
      totalUpvotes: upvotesAgg._sum.upvotes ?? 0,
      byCategory,
      byVillage,
      // Impact estimates from AI analysis of affected populations on resolved + in-progress issues
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
