// ── Deterministic triage: categorization + dedup that work with zero AI ──
//
// Why deterministic? Three reasons that matter in Kibera:
// 1. It works on a KSh 6,000 phone with two bars of network. No round trip.
// 2. It never fails during a demo, an outage, or a deadline.
// 3. You can explain it to a village elder in one sentence:
//    "Reports 50 steps apart saying the same thing are the same problem."
//
// English, Kiswahili and Sheng all feed the same keyword lists, because
// people report problems in the language they think in.

import type { Severity } from "./kibera";

export const TRIAGE_CATEGORIES = [
  "water",
  "sanitation",
  "infrastructure",
  "safety",
  "health",
  "environment",
  "education",
  "energy",
] as const;
export type TriageCategory = (typeof TRIAGE_CATEGORIES)[number];

// Ordered by specificity: the first list that matches wins. "Sewage near
// the school" is sanitation first, education second. That is the right call.
const CATEGORY_KEYWORDS: { category: TriageCategory; words: string[] }[] = [
  {
    category: "sanitation",
    words: [
      "sewer", "sewage", "exhauster", "toilet", "latrine", "pit latrine", "choo",
      "mtaro", "waste", "garbage", "trash", "takataka", "rubbish", "flying toilet",
      "defecat", "open defecation", "smell", "kunuka", "blocked drain line", "spill",
      "overflow", "raw sewage", "moo tu", "ukara",
    ],
  },
  {
    category: "water",
    words: [
      "water", "pipe", "tap", "maji", "mtaro wa maji", "burst", "leak", "leaking",
      "kiosk", "water point", "queue for water", "dry tap", "no water", "hakuna maji",
      "bowser", "rusted pipe", "burst", "vendex", "nairobi water", "maji hafu",
    ],
  },
  {
    category: "energy",
    words: [
      "electricity", "power outage", "power lines", "transformer", "stima", "umeme",
      "cable", "live wire", "token", "meter", "generator", "solar", "battery", "gas",
      "cylinder", "explosion",
    ],
  },
  {
    category: "safety",
    words: [
      "streetlight", "street light", "street light", "lamp post", "taa", "security light",
      "dark alley", "dark at night", "crime", "theft", "insecure", "usiku", "harassed",
      "mugging", "gang", "unsafe", "attack", "gender", "gbv", " harassment",
    ],
  },
  {
    category: "health",
    words: [
      "clinic", "dispensary", "hospital", "cholera", "malaria", "typhoid", "diarrhea",
      "diarrhoea", "sick", "outbreak", "medic", "dawa", "afya", "chv", "community health",
      "first aid", "maternity", "kemia", "hygiene", "sanitizer", "ambulance",
    ],
  },
  {
    category: "environment",
    words: [
      "flood", "flooding", "drain", "drainage", "mvua", "mvula", "river", "ngong river",
      "dam", "pollution", "smoke", "fumes", "burning", "dumpsite", "tree", "miti",
      "erosion", "mudslide", "landslide",
    ],
  },
  {
    category: "education",
    words: [
      "school", "shule", "classroom", "teacher", "pupils", "students", "desk", "textbook",
      "fees", "darasa", "school feeding", "kitchen at school", "playground", "mchanga",
    ],
  },
  {
    category: "infrastructure",
    words: [
      "road", "barabara", "pothole", "pot hole", "shimo", "path", "bridge", "daraja",
      "footbridge", "collapsed", "building", "wall", "roof", "mabati", "mud house",
      "staircase", "railway", "train", "blocked path", "borehole", "market shade",
      "structure", "plank",
    ],
  },
];

// These override the count math. A broken pipe is an inconvenience; sewage
// next to a school is an emergency even on day one.
const SEVERITY_BOOSTERS: { word: string; to: Severity }[] = [
  { word: "cholera", to: "critical" },
  { word: "outbreak", to: "critical" },
  { word: "child", to: "high" },
  { word: "school", to: "high" },
  { word: "clinic", to: "high" },
  { word: "hospital", to: "high" },
  { word: "sewage", to: "high" },
  { word: "raw sewage", to: "critical" },
  { word: "live wire", to: "critical" },
  { word: "collapsed", to: "critical" },
  { word: "drinking", to: "high" },
  { word: "queue", to: "medium" },
];

export function inferCategory(text: string, fallback: string = "infrastructure"): TriageCategory {
  const t = text.toLowerCase();
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return category;
  }
  if (TRIAGE_CATEGORIES.includes(fallback as TriageCategory)) return fallback as TriageCategory;
  return "infrastructure";
}

// ── Distance: haversine, the same math sailors used with paper maps ──

export function haversineMeters(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ── Text similarity: Jaccard on meaningful words (drops Kiswahili stopwords too) ──

const STOPWORDS = new Set([
  "the", "and", "that", "this", "with", "have", "has", "was", "were", "there", "here",
  "from", "near", "next", "into", "over", "under", "been", "being", "since", "still",
  "very", "they", "them", "their", "our", "your", "you", "for", "not", "but", "all",
  "hii", "hapa", "kule", "kuna", "hakuna", "ya", "wa", "za", "ni", "kwa", "na", "cha",
  "vingine", "sana", "tu", "mpaka", "hadi", "lakini", "kama",
]);

// "street light" and "streetlight" are the same complaint written twice.
// So are "pot hole" and "pothole". Fold them before anything else.
const COMPOUND_FOLDS: [RegExp, string][] = [
  [/street\s+light/g, "streetlight"],
  [/pot\s+hole/g, "pothole"],
  [/pit\s+latrine/g, "pitlatrine"],
  [/water\s+pipe/g, "waterpipe"],
  [/burst\s+pipe/g, "burstpipe"],
  [/flying\s+toilet/g, "flyingtoilet"],
];

export function normalizeText(text: string): string {
  let t = " " + text.toLowerCase() + " ";
  for (const [re, rep] of COMPOUND_FOLDS) t = t.replace(re, rep);
  return t;
}

// Light stemming: lights→light, streetlights→streetlight, leaking→leak.
// Kiswahili nouns mostly survive this untouched, which is fine.
function stem(w: string): string {
  if (w.length > 6 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 5 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

export function words(text: string): string[] {
  return normalizeText(text)
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map(stem)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export function textSimilarity(a: string, b: string): number {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

// ── Diagnostic terms: the specific nouns that name a problem ──
//
// "streetlight" and "footpath" carry the complaint. Words like "night" and
// "very" do not. Both reports naming the same two diagnostic terms 40 meters
// apart is the same broken thing, even when the sentences read differently.

const DIAGNOSTIC_TERMS: Set<string> = (() => {
  const s = new Set<string>();
  for (const { words } of CATEGORY_KEYWORDS) {
    for (const phrase of words) {
      for (const w of normalizeText(phrase).replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
        if (w.length > 3) s.add(stem(w));
      }
    }
  }
  return s;
})();

export function diagnosticTerms(text: string): Set<string> {
  return new Set(words(text).filter((w) => DIAGNOSTIC_TERMS.has(w)));
}

// ── Dedup verdict ──
//
// Same problem = within 60 meters of each other AND descriptions overlap.
// 60m is roughly two alley blocks in Gatwekera. Different streets, different
// problems. Similar words without proximity is a coincidence, not a match.

export const SAME_ISSUE_RADIUS_M = 60;
export const SAME_ISSUE_SIMILARITY = 0.3;

export interface SimilarityVerdict {
  same: boolean;
  distanceM: number | null;
  similarity: number;
}

export function compareReports(
  a: { description: string; latitude: number | null; longitude: number | null },
  b: { description: string; latitude: number | null; longitude: number | null }
): SimilarityVerdict {
  const similarity = textSimilarity(a.description, b.description);
  const diagA = diagnosticTerms(a.description);
  const diagB = diagnosticTerms(b.description);
  const shared = [...diagA].filter((t) => diagB.has(t));
  // A burst pipe and a dead streetlight can sit 10 meters apart. Distance and
  // shared words alone would call them duplicates. They are not: a broken pipe
  // goes to Nairobi Water, a dead taa goes to Kenya Power. Same category first.
  const sameCategory = inferCategory(a.description, "") === inferCategory(b.description, "");
  const hasCoords = a.latitude != null && a.longitude != null && b.latitude != null && b.longitude != null;
  const distanceM = hasCoords
    ? haversineMeters(a.latitude as number, a.longitude as number, b.latitude as number, b.longitude as number)
    : null;

  if (distanceM != null) {
    // Close AND same kind of problem AND (similar sentences OR naming the same specifics)
    const same = distanceM <= SAME_ISSUE_RADIUS_M && sameCategory && (similarity >= SAME_ISSUE_SIMILARITY || shared.length >= 2);
    return { same, distanceM, similarity };
  }
  // No GPS on either side: lean on words only, with a higher bar.
  const same = similarity >= 0.45 || (sameCategory && shared.length >= 3 && similarity >= 0.2);
  return { same, distanceM: null, similarity };
}

// ── Severity without AI: neighbours speaking up counts too ──

export function inferSeverity(opts: {
  description: string;
  reportCount?: number;
  ageDays?: number;
  category?: string;
}): Severity {
  const t = opts.description.toLowerCase();
  for (const { word, to } of SEVERITY_BOOSTERS) {
    if (t.includes(word)) return to;
  }
  const reports = opts.reportCount ?? 1;
  const days = opts.ageDays ?? 0;
  if (reports >= 10 || days >= 14) return "critical";
  if (reports >= 5 || days >= 7) return "high";
  if (reports >= 2 || days >= 3) return "medium";
  if (opts.category === "water" || opts.category === "sanitation") return "medium";
  return "low";
}

// ── Actions + actors, grounded in how Kibera actually works ──

export const CATEGORY_PLAYBOOK: Record<TriageCategory, { actions: string[]; actors: string[]; affected: number }> = {
  water: {
    actions: [
      "Log the outage with Nairobi Water and note the ticket number",
      "Alert the village water committee to organize a bowser stop-gap",
      "Share queue times with neighbours so the vulnerable skip the line",
      "Escalate to the area MCA office once reports pass ten",
    ],
    actors: ["Nairobi Water", "Village water committee", "Area MCA office"],
    affected: 350,
  },
  sanitation: {
    actions: [
      "Warn households downstream of the spill today, not tomorrow",
      "Notify public health officers; cholera moves fast in the rainy season",
      "Request an exhauster through the sanitation office or a youth group contractor",
      "CHVs to run a handwashing point near the affected choo line",
    ],
    actors: ["County public health office", "CHV network", "Village elder council"],
    affected: 500,
  },
  infrastructure: {
    actions: [
      "Flag the hazard with the county roads office, photos attached",
      "If a structure collapsed, keep people clear until the inspector comes",
      "Ask the village committee to mark the spot; night falls fast here",
      "Follow up with the MCA fund office for repair allocation",
    ],
    actors: ["County roads office", "Village committee", "Area MCA office"],
    affected: 200,
  },
  safety: {
    actions: [
      "Report the dead streetlight to Kenya Power and the county lighting desk",
      "Ask the chief's office for a night patrol in the meantime",
      "Community members: walk in pairs until the light is back",
      "Youth boda stage nearby can keep a torch loop running",
    ],
    actors: ["Kenya Power", "Chief's office", "Village committee"],
    affected: 150,
  },
  health: {
    actions: [
      "Notify the nearest dispensary and the CHV network covering the village",
      "If symptoms match cholera or typhoid, push samples to the county lab",
      "Share clean-water points with affected households today",
      "Request a county health team visit through the community health strategy desk",
    ],
    actors: ["CHV network", "County health office", "Nearby dispensary"],
    affected: 300,
  },
  environment: {
    actions: [
      "Clear the drainage line with the village youth group before the next rain",
      "Report repeat flooding to the county environment office",
      "Mark safe walking routes for children going to school",
      "Register the site for the county's cleanup roster",
    ],
    actors: ["County environment office", "Village youth group", "Village elder council"],
    affected: 250,
  },
  education: {
    actions: [
      "Alert the head teacher and the school's board of management",
      "Loop in the NG-CDF office for classroom or desk repairs",
      "CHVs to check affected pupils for related health symptoms",
      "Parents' association to keep attendance steady while it is fixed",
    ],
    actors: ["School board", "NG-CDF office", "CHV network"],
    affected: 180,
  },
  energy: {
    actions: [
      "Report downed lines or outages to Kenya Power immediately; treat wires as live",
      "Keep children away from the spot and post someone to warn others",
      "Log the incident reference for follow-up with the area supervisor",
      "Village committee to arrange lighting alternatives for the affected lane",
    ],
    actors: ["Kenya Power", "Village committee", "Area MCA office"],
    affected: 220,
  },
};

// Local summary lines for the deterministic path. Written like a person on
// Lindi Road would say it, because a canned template reads like a canned template.
export function localSummary(category: TriageCategory, village: string | null, reportCount: number): string {
  const v = village ?? "this part of Kibera";
  const together = reportCount > 1 ? `${reportCount} neighbours have now reported the same thing` : "this is the first report from this spot";
  const lines: Record<TriageCategory, string> = {
    water: `Water problem in ${v}. ${together}. In the dense lanes one broken pipe serves hundreds of hands, so this is queued for the water committee and Nairobi Water.`,
    sanitation: `Sanitation hazard in ${v}. ${together}. Spills here travel fast between households, so public health volunteers should hear about this today.`,
    infrastructure: `Infrastructure failure in ${v}. ${together}. Marked for the county desks and the MCA fund office with the photo as evidence.`,
    safety: `Safety risk in ${v}. ${together}. Dark lanes and unsafe spots need light and presence; the chief's office and Kenya Power are the first calls.`,
    health: `Health concern in ${v}. ${together}. CHVs covering ${v} should verify on the ground before the clinic queue grows.`,
    environment: `Environmental hazard in ${v}. ${together}. Drainage and flood spots get worse every rain this is left, so it is on the cleanup roster.`,
    education: `School-adjacent issue in ${v}. ${together}. The board of management and the NG-CDF office can move on this without waiting on the county.`,
    energy: `Electrical risk in ${v}. ${together}. Live lines and outages go straight to Kenya Power with the community keeping watch.`,
  };
  return lines[category];
}
