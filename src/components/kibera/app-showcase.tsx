"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Issue } from "@/lib/kibera";
import { MapView } from "./map-view";
import { ReportFlow } from "./report-flow";
import { Dashboard } from "./dashboard";

export type AppTab = "map" | "report" | "insights";

const TABS: { id: AppTab; label: string }[] = [
  { id: "map", label: "The map" },
  { id: "report", label: "Report" },
  { id: "insights", label: "The numbers" },
];

export function AppShowcase({
  tab,
  onTabChange,
  refreshKey,
  onNewIssue,
}: {
  tab: AppTab;
  onTabChange: (t: AppTab) => void;
  refreshKey: number;
  onNewIssue: () => void;
}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reduce = useReducedMotion();

  const loadIssues = useCallback(async () => {
    try {
      const res = await fetch("/api/issues", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "feed failed");
      setIssues(data.issues ?? []);
      setError(false);
    } catch {
      // keep stale data on failure, but say it out loud
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues, refreshKey]);

  return (
    <section id="live" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-section-title"
          >
            Every dot on this map is a neighbour
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-[15.5px] leading-relaxed text-charcoal"
          >
            Live reports from the villages. Grey dots are waiting, orange dots
            are being worked on, green dots are fixed.{" "}
            <span className="font-semibold text-inkkc">Every green dot is proof.</span>
          </motion.p>
        </div>

        {/* Tab bar: sharp, file-folder style */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="App views">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
              className={`h-11 px-5 text-sm font-semibold rounded-[2px] border-2 transition-colors ${
                tab === t.id
                  ? "bg-terra border-terra text-primary-foreground"
                  : "bg-transparent border-border text-charcoal hover:border-terra hover:text-terra"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel: sharp, one border, no shadow circus */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8"
        id="report-panel"
      >
        <div className="bg-card border border-border overflow-hidden rounded-[2px]">
          {tab === "map" && (
            <MapView
              issues={issues}
              loading={loading}
              error={error}
              onRetry={loadIssues}
              onReport={() => onTabChange("report")}
            />
          )}
          {tab === "report" && (
            <ReportFlow
              onSubmitted={() => {
                onNewIssue();
                onTabChange("map");
              }}
            />
          )}
          {tab === "insights" && <Dashboard issues={issues} loading={loading} />}
        </div>
      </motion.div>
    </section>
  );
}
