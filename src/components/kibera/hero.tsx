"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero({ onReport, onExplore }: { onReport: () => void; onExplore: () => void }) {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 sm:pt-28 pb-8 lg:pb-12">
        <div className="hero-grid">
          {/* Copy. Reads like a note somebody left you. */}
          <div>
            <motion.span {...fade(0)} className="text-annotation" aria-hidden="true">
              read this first ↓
            </motion.span>

            <motion.h1 {...fade(0.06)} className="text-hero mt-2">
              The water pipe broke
              <br />
              <span className="highlight-hand">three weeks ago</span>. Nobody
              came.
            </motion.h1>

            <motion.p
              {...fade(0.14)}
              className="mt-6 text-lg leading-relaxed text-charcoal max-w-[52ch]"
            >
              Until now. People in Kibera wait an average of{" "}
              <strong className="text-inkkc">47 days</strong> for a repair that
              takes an afternoon. We are here to make it{" "}
              <strong className="text-terra">72 hours</strong>.
            </motion.p>

            <motion.div {...fade(0.22)} className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onReport}
                className="inline-flex items-center gap-2 bg-terra hover:bg-terra-deep active:scale-[0.98] text-primary-foreground font-semibold min-h-[52px] px-6 rounded-[2px] transition-all"
              >
                Report an issue
                <ArrowRight className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 font-semibold text-inkkc border-2 border-inkkc/80 hover:border-terra hover:text-terra active:scale-[0.98] min-h-[52px] px-6 rounded-[2px] transition-all bg-transparent"
              >
                Track progress
              </button>
              <span className="text-sm text-muted-foreground basis-full sm:basis-auto">
                Takes 30 seconds. No account needed.
              </span>
            </motion.div>
          </div>

          {/* Photo. Documentary, not decoration. */}
          <motion.figure {...fade(0.18)} className="lg:mt-6">
            <div className="photo-authentic relative aspect-[4/3] overflow-hidden border border-border bg-secondary">
              <Image
                src="/images/alley.jpg"
                alt="A narrow alley in Kibera after the morning rains, Nairobi"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 38vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3">
              <span className="text-annotation text-[1.15rem]">6:47 AM, Gatwekera village</span>
              <p className="text-sm leading-relaxed text-charcoal mt-1 max-w-[46ch]">
                Amani has been in line for water since 4:30. Twenty neighbours
                reported the same broken pipe. That is the whole trick. You are
                never the only one.
              </p>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
