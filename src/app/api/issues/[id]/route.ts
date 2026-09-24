import { NextRequest, NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/issues/[id] — single issue with full update history
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbReady;
    const { id } = await params;
    const issue = await db.issue.findUnique({
      where: { id },
      include: { updates: { orderBy: { createdAt: "desc" } } },
    });
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    return NextResponse.json({ issue });
  } catch (error) {
    console.error("GET /api/issues/[id] error:", error);
    return NextResponse.json({ error: "Failed to load issue" }, { status: 500 });
  }
}

// PATCH /api/issues/[id] — update status / add official update note
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbReady;
    const { id } = await params;
    const { status, message, author } = await req.json();

    const validStatuses = ["reported", "verified", "in_progress", "resolved"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await db.issue.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    const issue = await db.issue.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
      },
    });

    if (message?.trim()) {
      await db.issueUpdate.create({
        data: {
          issueId: id,
          message: message.trim(),
          status: status || existing.status,
          author: author?.trim() || "Community Response Team",
        },
      });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("PATCH /api/issues/[id] error:", error);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}
