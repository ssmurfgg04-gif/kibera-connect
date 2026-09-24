"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Loader2, Flame, ShieldCheck, Activity, MapPin } from "lucide-react";
import {
  CATEGORY_META,
  CATEGORIES,
  STATUS_META,
  SEVERITY_META,
  Issue,
  Status,
} from "@/lib/kibera";

const ease = [0.22, 1, 0.36, 1] as const;

export function Dashboard({ issues, loading }: { issues: Issue[]; loading: boolean }) {
  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: CATEGORY_META[c].label,
        short: CATEGORY_META[c].label.slice(0, 5),
        value: issues.filter((i) => i.category === c).length,
        color: CATEGORY_META[c].color,
      })).filter((d) => d.value > 0),
    [issues]
  );

  const byStatus = useMemo(() => {
    const order: Status[] = ["reported", "verified", "in_progress", "resolved"];
    return order
      .map((s) => ({
        name: STATUS_META[s].label,
        value: issues.filter((i) => i.status === s).length,
        color: STATUS_META[s].color,
      }))
      .filter((d) => d.value > 0);
  }, [issues]);

  const byDay = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let d = 13; d >= 0; d--) {
      const day = new Date(Date.now() - d * 86400000);
      days.push({
        date: day.toISOString().slice(0, 10),
        label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        count: 0,
      });
    }
    for (const i of issues) {
      const key = new Date(i.createdAt).toISOString().slice(0, 10);
      const bucket = days.find((b) => b.date === key);
      if (bucket) bucket.count += 1;
    }
    return days;
  }, [issues]);

  const topVillages = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of issues) if (i.village) counts[i.village] = (counts[i.village] ?? 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [issues]);

  const stats = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    const critical = issues.filter((i) => i.severity === "critical" && i.status !== "resolved").length;
    const rate = total === 0 ? 0 : Math.round((resolved / total) * 100);
    return { total, resolved, critical, rate };
  }, [issues]);

  if (loading) {
    return (
      <div className="h-[640px] grid place-items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Crunching community signals…
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <Activity className="w-[18px] h-[18px]" />, label: "Total reports", value: stats.total, tint: "#c44536" },
          { icon: <ShieldCheck className="w-[18px] h-[18px]" />, label: "Resolution rate", value: `${stats.rate}%`, tint: "#2a9d8f" },
          { icon: <Flame className="w-[18px] h-[18px]" />, label: "Critical active", value: stats.critical, tint: "#c44536" },
          { icon: <MapPin className="w-[18px] h-[18px]" />, label: "Villages reporting", value: topVillages.length, tint: "#4a6fa5" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06, ease }}
            className="rounded-[2px] bg-card ring-1 ring-border p-4"
          >
            <span className="grid place-items-center w-9 h-9 rounded-[2px]" style={{ background: `${k.tint}18`, color: k.tint }}>
              {k.icon}
            </span>
            <div className="mt-3 font-display text-2xl font-semibold tabular-nums">{k.value}</div>
            <div className="text-[12.5px] font-medium text-muted-foreground mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Category bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="rounded-[2px] bg-card ring-1 ring-border p-5"
        >
          <h4 className="font-display text-lg font-semibold">Reports by category</h4>
          <p className="text-[13px] text-muted-foreground mt-0.5">Where the community feels the most friction.</p>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6dcc9" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 11, fill: "#5b6b78" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#5b6b78" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(228,87,13,0.06)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={34}>
                  {byCategory.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease }}
          className="rounded-[2px] bg-card ring-1 ring-border p-5"
        >
          <h4 className="font-display text-lg font-semibold">Response pipeline</h4>
          <p className="text-[13px] text-muted-foreground mt-0.5">Every report moves left to right, to done.</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-[240px] w-[55%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {byStatus.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2.5 min-w-0">
              {byStatus.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-[13px] font-medium">
                  <span className="cat-dot" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-bold tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Reports over time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="rounded-[2px] bg-card ring-1 ring-border p-5"
        >
          <h4 className="font-display text-lg font-semibold">Reporting momentum</h4>
          <p className="text-[13px] text-muted-foreground mt-0.5">Last 14 days. A community that speaks up.</p>
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byDay} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c44536" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#c44536" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6dcc9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#5b6b78" }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: "#5b6b78" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#c44536" strokeWidth={2.5} fill="url(#areaFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Village leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.16, ease }}
          className="rounded-[2px] bg-card ring-1 ring-border p-5"
        >
          <h4 className="font-display text-lg font-semibold">Most active villages</h4>
          <p className="text-[13px] text-muted-foreground mt-0.5">Where neighbours are organising fastest.</p>
          <div className="mt-4 space-y-3">
            {topVillages.map(([village, count], idx) => {
              const max = topVillages[0][1];
              return (
                <div key={village}>
                  <div className="flex items-center justify-between text-[13px] font-semibold">
                    <span>
                      <span className="text-muted-foreground font-bold tabular-nums mr-2">{String(idx + 1).padStart(2, "0")}</span>
                      {village}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(count / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2 + idx * 0.08, ease }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          idx === 0
                            ? "linear-gradient(90deg,#c44536,#f4a261)"
                            : "linear-gradient(90deg,#d98e3255,#c4453688)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Severity strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        className="rounded-[2px] bg-card ring-1 ring-border p-5"
      >
        <h4 className="font-display text-lg font-semibold">Severity spread</h4>
        <div className="mt-4 h-5 rounded-full overflow-hidden flex gap-0.5">
          {(["critical", "high", "medium", "low"] as const).map((s) => {
            const count = issues.filter((i) => i.severity === s).length;
            const pct = issues.length ? (count / issues.length) * 100 : 0;
            return (
              <motion.div
                key={s}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease }}
                style={{ width: `${pct}%`, background: SEVERITY_META[s].color, originX: 0 }}
                className="h-full rounded-full first:rounded-l-full"
                title={`${SEVERITY_META[s].label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {(["critical", "high", "medium", "low"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: SEVERITY_META[s].color }}>
              <span className="cat-dot" style={{ background: SEVERITY_META[s].color }} />
              {SEVERITY_META[s].label}
              <span className="text-muted-foreground tabular-nums">
                ({issues.filter((i) => i.severity === s).length})
              </span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
