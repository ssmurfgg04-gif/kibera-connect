import { NextRequest, NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { compareReports, inferCategory } from "@/lib/triage";

export const dynamic = "force-dynamic";

// GET /api/issues/similar?lat=&lng=&description=
// Deterministic dedup: is someone already reporting this?
// No AI, no network calls beyond the local database, instant on any phone.
export async function GET(req: NextRequest) {
  try {
    await dbReady;
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    const description = (searchParams.get("description") ?? "").trim();
    const excludeId = searchParams.get("excludeId");

    if (!description || description.length < 8) {
      return NextResponse.json({ matches: [] });
    }

    const candidates = await db.issue.findMany({
      where: {
        status: { in: ["reported", "verified", "in_progress"] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true, title: true, description: true, category: true, severity: true,
        village: true, status: true, upvotes: true, createdAt: true, latitude: true, longitude: true,
      },
    });

    const point = {
      description,
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
    };

    const matches = candidates
      .map((c) => {
        const verdict = compareReports(
          point,
          { description: c.description, latitude: c.latitude, longitude: c.longitude }
        );
        return { ...c, distanceM: verdict.distanceM, similarity: Math.round(verdict.similarity * 100), same: verdict.same };
      })
      .filter((m) => m.same)
      .sort((a, b) => {
        const da = a.distanceM ?? 99999;
        const db_ = b.distanceM ?? 99999;
        return da - db_ || b.upvotes - a.upvotes;
      })
      .slice(0, 5);

    return NextResponse.json({
      matches,
      suggestedCategory: inferCategory(description),
    });
  } catch (error) {
    console.error("GET /api/issues/similar error:", error);
    return NextResponse.json({ matches: [] });
  }
}
