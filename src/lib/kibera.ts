// ── KiberaConnect shared types & metadata ──

export type Severity = "low" | "medium" | "high" | "critical";
export type Status = "reported" | "verified" | "in_progress" | "resolved";

export const CATEGORIES = [
  "water",
  "sanitation",
  "infrastructure",
  "safety",
  "health",
  "environment",
  "education",
  "energy",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  water: { label: "Water", color: "#2a9d8f" },
  sanitation: { label: "Sanitation", color: "#8c6a3f" },
  infrastructure: { label: "Infrastructure", color: "#264653" },
  safety: { label: "Safety", color: "#c44536" },
  health: { label: "Health", color: "#a85d75" },
  environment: { label: "Environment", color: "#7a8b3d" },
  education: { label: "Education", color: "#4a6fa5" },
  energy: { label: "Energy", color: "#d98e32" },
};

export const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; weight: number }> = {
  low: { label: "Low", color: "#2a9d8f", bg: "rgba(42,157,143,0.12)", weight: 1 },
  medium: { label: "Medium", color: "#d98e32", bg: "rgba(217,142,50,0.14)", weight: 2 },
  high: { label: "High", color: "#f4a261", bg: "rgba(244,162,97,0.16)", weight: 3 },
  critical: { label: "Critical", color: "#c44536", bg: "rgba(196,69,54,0.13)", weight: 4 },
};

export const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  reported: { label: "Reported", color: "#d98e32", bg: "rgba(217,142,50,0.14)" },
  verified: { label: "Verified", color: "#4a6fa5", bg: "rgba(74,111,165,0.12)" },
  in_progress: { label: "In Progress", color: "#c44536", bg: "rgba(196,69,54,0.13)" },
  resolved: { label: "Resolved", color: "#2a9d8f", bg: "rgba(42,157,143,0.12)" },
};

export const VILLAGES = [
  "Gatwekera",
  "Soweto West",
  "Kianda",
  "Lindi",
  "Kisumu Ndogo",
  "Makina",
  "Karanja",
  "Olympic",
  "Laini Saba",
  "Silanga",
  "Mashimoni",
] as const;

export const KIBERA_CENTER: [number, number] = [-1.3145, 36.7892];

export interface IssueUpdate {
  id: string;
  issueId: string;
  message: string;
  status: string | null;
  author: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  reporterName: string | null;
  isAnonymous: boolean;
  status: Status;
  aiSummary: string | null;
  aiActions: string | null; // JSON array
  aiAffected: number | null;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  updates?: IssueUpdate[];
}

export interface AiAnalysis {
  severity: Severity;
  category: string;
  summary: string;
  actions: string[];
  affectedEstimate: number;
  urgencyNote: string;
}

export function parseActions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
