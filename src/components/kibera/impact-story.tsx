"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Issue } from "@/lib/kibera";

const ease = [0.16, 1, 0.3, 1] as const;

const IMPACT = [
  { strong: "3 hours", rest: " back to Amani's morning" },
  { strong: "20 reports", rest: " became 1 work order" },
  { strong: "2 days", rest: " from report to repair. The old average was 47." },
  { strong: "0 phone calls", rest: " to numbers that never answer" },
];

export function ImpactStory({ resolved }: { resolved: Issue[] }) {
  const reduce = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 20 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section id="proof" className="py-16 sm:py-24 scroll-mt-16 bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="hero-grid">
          {/* The story */}
          <div>
            <motion.span {...reveal(0)} className="text-annotation" aria-hidden="true">
              real person, real street
            </motion.span>
            <motion.h2 {...reveal(0.05)} className="text-section-title mt-2">
              Amani&apos;s morning just got 3 hours shorter
            </motion.h2>

            <motion.div {...reveal(0.1)} className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-charcoal max-w-[62ch]">
              <p>
                Amani Wanjiru wakes up at 4:15 AM. Not by choice.
              </p>
              <p>
                The water point in Gatwekera village has been broken for eleven
                days. The nearest working tap is a 40-minute walk, and the line
                there starts forming before the sun does.
              </p>
              <p>
                By 4:30 she is in the queue. By 7:30 she has water. By 8:00 she
                is rushing her kids to school, late again.
              </p>
              <p>
                On day twelve, her neighbour Brian reported the broken tap on
                KiberaConnect. One photo, thirty seconds. Nineteen other people
                from their street did the same thing that week.
              </p>
              <p>
                The water office called Brian&apos;s phone on day thirteen. They
                came on day fourteen.
              </p>
              <p className="font-semibold text-inkkc">Now Amani wakes up at 6:30.</p>
            </motion.div>

            <motion.blockquote {...reveal(0.16)} className="mt-8 border-l-4 border-terra pl-5 max-w-[58ch]">
              <p className="font-display text-xl leading-relaxed text-inkkc">
                &ldquo;I thought nobody would come. Then twenty of us said the
                same thing at the same time. They came.&rdquo;
              </p>
              <footer className="mt-2 text-sm font-medium text-muted-foreground">
                Amani Wanjiru, Gatwekera village
              </footer>
            </motion.blockquote>
          </div>

          {/* The case file */}
          <motion.aside {...reveal(0.12)} className="lg:mt-8">
            <div className="card-raw relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Community receipt
                  </p>
                  <p className="font-display text-lg font-bold text-inkkc mt-1">
                    Case #KC-0247
                  </p>
                </div>
                <span className="stamp text-sm mt-1">Fixed</span>
              </div>

              <dl className="mt-4 divide-y divide-border/80 text-[14.5px]">
                {[
                  ["Problem", "Broken water point"],
                  ["Location", "Gatwekera"],
                  ["People who reported", "20 residents"],
                  ["Time waiting before", "11 days"],
                  ["Time to repair", "2 days"],
                  ["Result", "Water restored"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-inkkc text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="font-hand text-[1.5rem] text-terra mt-4 -rotate-1">
                your report helped.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Screenshot it. Send it to the WhatsApp group. This is what proof looks like.
              </p>
            </div>

            {/* Real resolved issues from the live database */}
            {resolved.length > 0 && (
              <div className="mt-5 space-y-3">
                {resolved.slice(0, 2).map((r) => (
                  <div key={r.id} className="card-raw card-raw-sky py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[14.5px] text-inkkc leading-snug">
                        {r.title}
                      </p>
                      <span className="stamp text-[10px] shrink-0">Fixed</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.village} · confirmed by the people who live there
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.aside>
        </div>

        {/* The facts under the story. Dark band, charcoal, no games. */}
        <motion.div
          {...reveal(0.05)}
          className="mt-16 bg-charcoal text-[#eef3ef] px-6 sm:px-10 py-10"
        >
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-clay tabular-nums">
                31.6%
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80 max-w-[38ch]">
                of Kibera households get water piped to their plot. The rest buy
                it by the jerrycan, at whatever the vendor charges that day.
              </p>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-clay tabular-nums">
                KSh 5
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80 max-w-[38ch]">
                per visit to a shared toilet, for 96% of residents who do not
                have one at home. Small money that adds up to a hard life.
              </p>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-clay tabular-nums">
                ~250,000
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80 max-w-[38ch]">
                neighbours across 13 villages. The community is the hero here.
                KiberaConnect just keeps the receipts.
              </p>
            </div>
          </div>
          <p className="mt-8 text-xs text-white/45">
            Sources: KNBS census water access data, Kim et al. 2022 sanitation study,
            Map Kibera population count.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
