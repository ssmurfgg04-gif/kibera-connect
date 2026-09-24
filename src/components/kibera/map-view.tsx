"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  MapPin,
  MessageSquareHeart,
  Sparkles,
  X,
  Clock,
  ArrowRight,
  Loader2,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_META,
  CATEGORIES,
  SEVERITY_META,
  STATUS_META,
  parseActions,
  timeAgo,
  Issue,
} from "@/lib/kibera";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center bg-secondary">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading Kibera map…
      </div>
    </div>
  ),
});

export function MapView({
  issues,
  loading,
  error,
  onRetry,
  onReport,
}: {
  issues: Issue[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onReport: () => void;
}) {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [village, setVillage] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (status !== "all" && i.status !== status) return false;
      if (village !== "all" && i.village !== village) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.village ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [issues, category, status, village, query]);

  const selected = useMemo(() => issues.find((i) => i.id === selectedId) ?? null, [issues, selectedId]);

  const hasFilters = category !== "all" || status !== "all" || village !== "all" || query !== "";

  return (
    <div className="grid lg:grid-cols-[400px_1fr] h-[820px] max-lg:h-auto max-lg:max-h-[860px]">
      {/* ── Sidebar: filters + issue feed ── */}
      <aside className="flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-0 max-lg:max-h-[400px]">
        <div className="p-4 pb-3 space-y-3 border-b border-border/70">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Community feed
            </h3>
            <span className="text-[12px] font-semibold text-muted-foreground tabular-nums">
              {loading ? "…" : `${filtered.length} issues`}
            </span>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search water, Soweto, lights…"
            className="h-10 rounded-[2px] bg-background border-border focus-visible:ring-primary/40"
            aria-label="Search issues"
          />
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 rounded-[2px] text-[13px] bg-background flex-1" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 rounded-[2px] text-[13px] bg-background flex-1" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setVillage("all")}
              className={`rounded-[2px] px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                village === "all" ? "bg-inkkc text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              All villages
            </button>
            {village !== "all" && (
              <button
                onClick={() => setVillage("all")}
                className="rounded-[2px] px-2.5 py-1 text-[12px] font-semibold bg-primary text-primary-foreground"
              >
                {village} <X className="inline w-3 h-3" />
              </button>
            )}
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setCategory("all");
                setStatus("all");
                setVillage("all");
                setQuery("");
              }}
              className="text-[12px] font-semibold text-primary hover:text-terra-deep text-left"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="nice-scroll flex-1 overflow-y-auto p-3 space-y-2.5">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[2px] bg-secondary/60 h-24 animate-pulse" />
            ))}
          {!loading && error && issues.length === 0 && (
            <div className="py-10 px-4 text-center">
              <div className="mx-auto w-10 h-10 rounded-[2px] bg-secondary ring-1 ring-border grid place-items-center" aria-hidden="true">
                <WifiOff className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-[14px] font-semibold text-inkkc">The feed did not load.</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Probably the connection, not you. The reports are still there.
              </p>
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-[2px] bg-inkkc text-primary-foreground text-[13px] font-semibold hover:bg-charcoal active:scale-[0.98] transition-all"
              >
                <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Try again
              </button>
            </div>
          )}
          {!loading && !error && issues.length === 0 && (
            <div className="py-10 px-4 text-center">
              <p className="text-[14px] font-semibold text-inkkc">No reports yet. The first one starts the count.</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                See a broken pipe, a dark street, an overflowing toilet? That is what this map is for.
              </p>
              <button
                onClick={onReport}
                className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-[2px] bg-terra text-primary-foreground text-[13px] font-semibold hover:bg-terra-deep active:scale-[0.98] transition-all"
              >
                Be the first to report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {!loading && !error && issues.length > 0 && filtered.length === 0 && (
            <div className="py-10 px-4 text-center">
              <p className="text-[14px] font-semibold text-inkkc">Nothing matches those filters.</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {issues.length} reports are on the map. Loosen the search or clear the filters to see them.
              </p>
              <button
                onClick={() => {
                  setCategory("all");
                  setStatus("all");
                  setVillage("all");
                  setQuery("");
                }}
                className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-[2px] bg-secondary text-inkkc text-[13px] font-semibold hover:bg-accent active:scale-[0.98] transition-all"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          )}
          {filtered.map((issue) => {
            const sev = SEVERITY_META[issue.severity];
            const cat = CATEGORY_META[issue.category];
            const st = STATUS_META[issue.status];
            return (
              <button
                key={issue.id}
                onClick={() => setSelectedId(issue.id === selectedId ? null : issue.id)}
                className={`w-full text-left rounded-[2px] p-3.5 ring-1 transition-all duration-200 ${
                  issue.id === selectedId
                    ? "bg-accent ring-primary/50"
                    : "bg-card ring-border hover:ring-primary/30 hover:shadow-warm"
                }`}
              >
                <div className="flex items-center gap-2 text-[12px] font-semibold">
                  <span className="cat-dot" style={{ background: cat.color }} />
                  <span style={{ color: cat.color }}>{cat.label}</span>
                  <span className="text-border">·</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ color: sev.color, background: sev.bg }}
                  >
                    {sev.label}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground font-medium">
                    <Clock className="w-3 h-3" />
                    {timeAgo(issue.createdAt)}
                  </span>
                </div>
                <h4 className="mt-1.5 text-[14.5px] font-semibold leading-snug">{issue.title}</h4>
                {issue.photoUrl && (
                  <div className="mt-2 relative overflow-hidden rounded-[2px]">
                    <img
                      src={issue.photoUrl}
                      alt="Photo attached to this report"
                      loading="lazy"
                      className="w-full h-24 object-cover"
                      style={{ filter: "contrast(1.08) saturate(0.92)" }}
                    />
                    <span className="absolute bottom-1 right-1 bg-inkkc/80 text-primary-foreground text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]">
                      photo evidence
                    </span>
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {issue.village ?? "Kibera"}
                  <span className="text-border">·</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 font-bold"
                    style={{ color: st.color, background: st.bg }}
                  >
                    {st.label}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold tabular-nums">
                    <MessageSquareHeart className="w-3.5 h-3.5 text-primary" />
                    {issue.upvotes}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-border/70">
          <Button
            onClick={onReport}
            className="w-full rounded-[2px] bg-primary hover:bg-terra-deep text-primary-foreground font-semibold h-11 gap-2"
          >
            See something? Report it
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* ── Map + floating detail ── */}
      <div className="relative min-h-[380px] max-lg:h-[460px] lg:h-auto">
        <MapInner issues={filtered} selectedId={selectedId} onSelect={setSelectedId} />

        {/* Legend */}
        <div className="absolute left-3 bottom-3 z-[500] rounded-[2px] bg-card/95 border border-border ring-border px-3.5 py-2.5 hidden sm:block">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
            Severity
          </div>
          <div className="flex items-center gap-3">
            {(Object.keys(SEVERITY_META) as (keyof typeof SEVERITY_META)[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: SEVERITY_META[s].color }}>
                <span className="cat-dot" style={{ background: SEVERITY_META[s].color }} />
                {SEVERITY_META[s].label}
              </span>
            ))}
          </div>
        </div>

        {/* Floating detail card */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute inset-x-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-[400px] z-[600] rounded-[2px] bg-card/95 border border-border ring-border max-h-[62%] flex flex-col"
            >
              <div className="p-4 pb-3 border-b border-border/70 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[12px] font-semibold flex-wrap">
                    <span className="cat-dot" style={{ background: CATEGORY_META[selected.category].color }} />
                    <span style={{ color: CATEGORY_META[selected.category].color }}>
                      {CATEGORY_META[selected.category].label}
                    </span>
                    <span className="text-border">·</span>
                    <span className="text-muted-foreground">{selected.village ?? "Kibera"}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10.5px] font-bold uppercase"
                      style={{
                        color: SEVERITY_META[selected.severity].color,
                        background: SEVERITY_META[selected.severity].bg,
                      }}
                    >
                      {SEVERITY_META[selected.severity].label}
                    </span>
                  </div>
                  <h4 className="mt-1.5 font-display text-[17px] font-semibold leading-snug">
                    {selected.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="grid place-items-center w-8 h-8 rounded-full hover:bg-secondary transition-colors shrink-0"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="nice-scroll overflow-y-auto p-4 pt-3 space-y-3">
                {selected.photoUrl && (
                  <div className="relative overflow-hidden rounded-[2px] ring-1 ring-border">
                    <img
                      src={selected.photoUrl}
                      alt="Photo evidence attached to this report"
                      className="w-full h-44 object-cover"
                      style={{ filter: "contrast(1.08) saturate(0.92)" }}
                    />
                    <span className="absolute top-2 left-2 bg-inkkc/85 text-primary-foreground text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-[2px]">
                      First photo · evidence
                    </span>
                  </div>
                )}
                <p className="text-[13.5px] leading-relaxed text-muted-foreground line-clamp-4">
                  {selected.description}
                </p>

                {selected.aiSummary && (
                  <div className="rounded-[2px] bg-accent/70 ring-1 ring-gold/25 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-terra-deep">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI assessment
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed">{selected.aiSummary}</p>
                  </div>
                )}

                {parseActions(selected.aiActions).length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                      Suggested actions
                    </div>
                    <ul className="space-y-1.5">
                      {parseActions(selected.aiActions).slice(0, 4).map((a, i) => (
                        <li key={i} className="flex gap-2 text-[13px] leading-snug">
                          <span className="mt-[7px] cat-dot bg-primary/70" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.updates && selected.updates.length > 0 && (
                  <div className="rounded-[2px] bg-secondary/60 p-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                      Response updates
                    </div>
                    {selected.updates.slice(0, 2).map((u) => (
                      <div key={u.id} className="text-[13px] leading-snug">
                        <span className="font-semibold">{u.author}:</span> {u.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 pt-2.5 border-t border-border/70 flex items-center gap-2">
                <UpvoteButton issueId={selected.id} count={selected.upvotes} />
                <Badge variant="outline" className="rounded-full text-[11.5px] font-semibold border-border text-muted-foreground">
                  {STATUS_META[selected.status].label}
                </Badge>
                <span className="ml-auto text-[12px] text-muted-foreground">
                  {selected.isAnonymous ? "Anonymous" : selected.reporterName}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function UpvoteButton({ issueId, count }: { issueId: string; count: number }) {
  const [voted, setVoted] = useState(false);
  const [n, setN] = useState(count);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        if (voted) return;
        setVoted(true);
        setN((v) => v + 1);
        try {
          const res = await fetch(`/api/issues/${issueId}/upvote`, { method: "POST" });
          const d = await res.json();
          if (typeof d.upvotes === "number") setN(d.upvotes);
        } catch {}
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[13px] font-bold transition-all ${
        voted ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-sunrise/20"
      }`}
      aria-label="Upvote this issue"
    >
      <MessageSquareHeart className="w-4 h-4" />
      <span className="tabular-nums">{n}</span>
    </button>
  );
}
