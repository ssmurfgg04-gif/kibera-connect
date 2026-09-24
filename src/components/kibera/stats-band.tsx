"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const STORIES = [
  {
    number: "47",
    unit: "days",
    story:
      "The average wait for one broken water point to get fixed here, counted by the people queuing, not by a spreadsheet.",
    hand: "our target: 72 hours",
    border: "border-l-terra",
  },
  {
    number: "19",
    unit: "neighbours",
    story:
      "Reported the burst sewage line on Lindi Road in a single week. Before this, that was 19 phone calls to a number nobody picked.",
    hand: "19 reports, 1 work order",
    border: "border-l-sky",
  },
  {
    number: "1",
    unit: "photo",
    story:
      "That is all it took to get the Karanja Road streetlight back on. Reported Tuesday 9 PM. Fixed Thursday 2 PM.",
    hand: "beat that, city hall",
    border: "border-l-sunrise",
  },
];

export function StatsBand({ refreshKey }: { refreshKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [live, setLive] = useState({ total: 0, resolved: 0, open: 0 });

  useEffect(() => {
    if (!inView) return;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        const total = d.total ?? 0;
        const resolved = d.resolved ?? 0;
        setLive({ total, resolved, open: Math.max(total - resolved, 0) });
      })
      .catch(() => {});
  }, [inView, refreshKey]);

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-14 sm:pb-20">
      {/* Kibera right now: the live counter */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-wrap items-end gap-x-10 gap-y-4 border-b-2 border-inkkc/90 pb-5"
      >
        <h2 className="text-section-title">
          Kibera, right now
        </h2>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3 pb-1">
          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-inkkc tabular-nums leading-none">
              {live.total}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">issues reported</div>
          </div>
          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-terra tabular-nums leading-none">
              {live.open}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">being pushed</div>
          </div>
          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-sky-deep tabular-nums leading-none">
              {live.resolved}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">confirmed fixed</div>
          </div>
        </div>
      </motion.div>

      {/* Numbers that matter. Each one is a small story. */}
      <div className="mt-10 grid md:grid-cols-3 gap-6 lg:gap-8">
        {STORIES.map((s, i) => (
          <motion.article
            key={s.number + s.unit}
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease }}
            className={`card-raw ${s.border} flex flex-col`}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-inkkc tabular-nums leading-none">
                {s.number}
              </span>
              <span className="font-display text-lg font-semibold text-terra">{s.unit}</span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-charcoal flex-1">{s.story}</p>
            <p className="font-hand text-[1.35rem] text-terra mt-3 -rotate-1">{s.hand}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
