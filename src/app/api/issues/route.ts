import { NextRequest, NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/issues — list issues with optional filters
export async function GET(req: NextRequest) {
  try {
    await dbReady;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const village = searchParams.get("village");
    const search = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 200);

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (status && status !== "all") where.status = status;
    if (severity && severity !== "all") where.severity = severity;
    if (village && village !== "all") where.village = village;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { village: { contains: search } },
      ];
    }

    const issues = await db.issue.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      include: { updates: { orderBy: { createdAt: "desc" }, take: 5 } },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("GET /api/issues error:", error);
    return NextResponse.json({ error: "Failed to load issues" }, { status: 500 });
  }
}

// POST /api/issues — create a new issue (with optional AI analysis payload)
export async function POST(req: NextRequest) {
  try {
    await dbReady;
    const body = await req.json();
    const { title, description, category, severity, village, latitude, longitude, reporterName, isAnonymous, photoUrl, aiAnalysis } = body;

    if (!title?.trim() || !description?.trim() || !category) {
      return NextResponse.json({ error: "Title, description and category are required" }, { status: 400 });
    }

    const issue = await db.issue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        severity: severity ?? "medium",
        village: village || null,
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
        photoUrl: photoUrl || null,
        reporterName: isAnonymous ? null : reporterName?.trim() || "Community Member",
        isAnonymous: Boolean(isAnonymous),
        aiSummary: aiAnalysis?.summary ?? null,
        aiActions: aiAnalysis?.actions ? JSON.stringify(aiAnalysis.actions) : null,
        aiAffected: aiAnalysis?.affectedEstimate ?? null,
        status: "reported",
      },
    });

    // Auto-upvote by reporter (their issue, they care)
    await db.issue.update({ where: { id: issue.id }, data: { upvotes: 1 } });

    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    console.error("POST /api/issues error:", error);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
