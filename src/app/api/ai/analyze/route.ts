import { NextRequest, NextResponse } from "next/server";
import { inferCategory, inferSeverity, localSummary, CATEGORY_PLAYBOOK, type TriageCategory } from "@/lib/triage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface AnalyzeRequest {
  title: string;
  description: string;
  category?: string;
  village?: string;
}

interface Analysis {
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  summary: string;
  actions: string[];
  affectedEstimate: number;
  urgencyNote: string;
}

const CATEGORIES = ["water", "sanitation", "infrastructure", "safety", "health", "environment", "education", "energy"];

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, village } = (await req.json()) as AnalyzeRequest;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Title and description are required for analysis" }, { status: 400 });
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `You are an urban community-response analyst with deep expertise in Kibera, Nairobi — Africa's largest urban informal settlement (~250,000 residents across 11 villages, ~2,000 people per hectare in the densest zones). You understand: limited piped water/sewerage, informal housing fire risk, flooding during the long rains (March-May), community health volunteer networks, village elder councils, NG-CDF funds, Nairobi Water & Sewerage Company, and KEMSA supply chains.

Analyze community-reported issues and respond ONLY with valid JSON in exactly this shape:
{
  "severity": "low" | "medium" | "high" | "critical",
  "category": one of [${CATEGORIES.join(", ")}],
  "summary": "2-3 sentence assessment with Kibera-specific context",
  "actions": ["3-5 concrete, locally-realistic action steps naming real local actors (county offices, KEMSA, village elders, CHVs, youth groups, etc.)"],
  "affectedEstimate": <integer estimate of affected residents>,
  "urgencyNote": "one short sentence on time-sensitivity, e.g. 'Actions needed within 24 hours to prevent outbreak'"
}

Severity guide: critical = immediate health/life risk or mass service outage; high = significant harm or livelihood loss developing; medium = quality-of-life degradation with compounding risk; low = improvement opportunity. Respond with JSON only, no markdown fences.`,
        },
        {
          role: "user",
          content: `Analyze this community report from ${village ? `the ${village} village of ` : ""}Kibera, Nairobi:

Title: ${title}
Description: ${description}
${category ? `Reporter-selected category: ${category}` : ""}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let analysis: Analysis | null = null;

    // Robust JSON extraction (strip fences, find first { ... last })
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        analysis = JSON.parse(cleaned.slice(start, end + 1)) as Analysis;
      }
    } catch {
      analysis = null;
    }

    if (!analysis || !analysis.severity || !Array.isArray(analysis.actions)) {
      // Graceful fallback so reporting never blocks. The rulebook here is the
      // same one the dedup uses: keyword categories tuned to English,
      // Kiswahili and Sheng, plus a playbook of actions that name real desks
      // in Kibera. Not a stub. A working triage engine that runs anywhere.
      const text = `${title} ${description}`;
      const cat: TriageCategory = inferCategory(text, category && CATEGORIES.includes(category) ? category : "infrastructure");
      const play = CATEGORY_PLAYBOOK[cat];
      analysis = {
        severity: inferSeverity({ description: text, category: cat }),
        category: cat,
        summary: localSummary(cat, village ?? null, 1),
        actions: play.actions.slice(0, 4),
        affectedEstimate: play.affected,
        urgencyNote:
          cat === "sanitation"
            ? "Spills move fast between households. Verify within 24 hours."
            : cat === "water"
              ? "Water outages compound daily. Confirm within 48 hours."
              : "Verify on the ground within 48 hours.",
      };
    }

    // Normalize
    if (!CATEGORIES.includes(analysis.category)) {
      analysis.category = category && CATEGORIES.includes(category) ? category : "infrastructure";
    }
    if (!["low", "medium", "high", "critical"].includes(analysis.severity)) analysis.severity = "medium";
    analysis.affectedEstimate = Math.max(1, Math.round(Number(analysis.affectedEstimate) || 100));

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("POST /api/ai/analyze error:", error);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
