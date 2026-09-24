"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteNav } from "@/components/kibera/site-nav";
import { Hero } from "@/components/kibera/hero";
import { StatsBand } from "@/components/kibera/stats-band";
import { AppShowcase, AppTab } from "@/components/kibera/app-showcase";
import { HowItWorks } from "@/components/kibera/how-it-works";
import { ImpactStory } from "@/components/kibera/impact-story";
import { SiteFooter } from "@/components/kibera/site-footer";
import { Issue } from "@/lib/kibera";

export default function Home() {
  const [tab, setTab] = useState<AppTab>("map");
  const [refreshKey, setRefreshKey] = useState(0);
  const [resolved, setResolved] = useState<Issue[]>([]);

  useEffect(() => {
    fetch("/api/issues?status=resolved&limit=2")
      .then((r) => r.json())
      .then((d) => setResolved(d.issues ?? []))
      .catch(() => {});
  }, [refreshKey]);

  const goToReport = useCallback(() => {
    setTab("report");
    requestAnimationFrame(() => {
      document.getElementById("live")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const goToMap = useCallback(() => {
    setTab("map");
    requestAnimationFrame(() => {
      document.getElementById("live")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleNewIssue = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav onReport={goToReport} />
      <main className="flex-1">
        <Hero onReport={goToReport} onExplore={goToMap} />
        <StatsBand refreshKey={refreshKey} />
        <AppShowcase tab={tab} onTabChange={setTab} refreshKey={refreshKey} onNewIssue={handleNewIssue} />
        <HowItWorks />
        <ImpactStory resolved={resolved} />
      </main>
      <SiteFooter onReport={goToReport} />
    </div>
  );
}
