import { NextRequest, NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/issues/[id]/upvote — amplify signal for an issue
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbReady;
    const { id } = await params;
    const issue = await db.issue.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });
    return NextResponse.json({ upvotes: issue.upvotes });
  } catch (error) {
    console.error("POST /api/issues/[id]/upvote error:", error);
    return NextResponse.json({ error: "Failed to upvote" }, { status: 500 });
  }
}
