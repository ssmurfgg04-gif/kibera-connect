"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how" className="bg-white border-y border-border py-16 sm:py-24 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-section-title">
            From &ldquo;nobody is coming&rdquo; to &ldquo;it is fixed&rdquo;{" "}
            <span className="text-annotation ml-1 text-[1.2rem]">in 3 steps</span>
          </h2>
        </div>

        <ol className="mt-12 relative">
          {/* the line that ties the steps together */}
          <span
            aria-hidden="true"
            className="hidden md:block absolute left-[15px] top-2 bottom-2 w-[2px] bg-clay/70"
          />

          {/* Step 1 */}
          <motion.li
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease }}
            className="relative md:pl-16 pb-12 md:pb-14"
          >
            <span
              aria-hidden="true"
              className="hidden md:grid absolute left-0 top-0 place-items-center w-8 h-8 rounded-full bg-terra text-primary-foreground font-display font-bold text-sm"
            >
              1
            </span>
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6 items-start">
              <div>
                <h3 className="font-display text-2xl font-bold text-inkkc">
                  You see it. You snap it.
                </h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-charcoal max-w-[58ch]">
                  Broken pipe. Pothole swallowing a boda boda whole. Sewage
                  running past the school gate again. Open KiberaConnect, take
                  one photo, say it the way you would tell a neighbour. GPS tags
                  itself. No forms. No account.
                </p>
                <p className="font-hand text-[1.4rem] text-terra mt-3 -rotate-1">
                  takes 30 seconds, we timed it
                </p>
              </div>
              <div className="lg:justify-self-end w-full max-w-[320px]">
                <div className="card-raw card-raw-ink">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    What you send
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-charcoal">
                    One photo. Six words if that is all you have.{" "}
                    <span className="font-semibold text-inkkc">
                      &ldquo;Maji haya flow kwa road, Lindi.&rdquo;
                    </span>{" "}
                    is enough. English, Kiswahili or Sheng, all fine.
                  </p>
                </div>
              </div>
            </div>
          </motion.li>

          {/* Step 2 */}
          <motion.li
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.05, ease }}
            className="relative md:pl-16 pb-12 md:pb-14"
          >
            <span
              aria-hidden="true"
              className="hidden md:grid absolute left-0 top-0 place-items-center w-8 h-8 rounded-full bg-terra text-primary-foreground font-display font-bold text-sm"
            >
              2
            </span>
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6 items-start">
              <div>
                <h3 className="font-display text-2xl font-bold text-inkkc">We make noise.</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-charcoal max-w-[58ch]">
                  Your report joins every other report from your street, your
                  village, your section. When 20 neighbours report the same broken
                  pipe, that is not 20 complaints anymore. That is one problem
                  the county cannot pretend not to see.
                </p>
                <p className="text-[15.5px] leading-relaxed text-charcoal mt-3">
                  The moment you submit, you find out you were never the only
                  one. Nineteen of your neighbours already said the same thing.
                </p>
              </div>
              <div className="lg:justify-self-end w-full max-w-[320px]">
                <div className="card-raw">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Same pipe, this week
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className="w-2.5 h-2.5 rounded-full bg-terra/80"
                        style={{ transform: `rotate(${i * 17}deg) translateY(${(i % 3) - 1}px)` }}
                      />
                    ))}
                    <span className="font-hand text-[1.3rem] text-terra ml-2">+8 more</span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-charcoal">
                    Every dot is one person who took 30 seconds. Together they
                    are a work order.
                  </p>
                </div>
              </div>
            </div>
          </motion.li>

          {/* Step 3 */}
          <motion.li
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="relative md:pl-16"
          >
            <span
              aria-hidden="true"
              className="hidden md:grid absolute left-0 top-0 place-items-center w-8 h-8 rounded-full bg-terra text-primary-foreground font-display font-bold text-sm"
            >
              3
            </span>
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6 items-start">
              <div>
                <h3 className="font-display text-2xl font-bold text-inkkc">Someone shows up.</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-charcoal max-w-[58ch]">
                  With the right tools, because they knew exactly what was
                  broken, where, and how bad. You get a text when the status
                  changes. You go and confirm with your own eyes. Then your
                  street moves on.
                </p>
                <p className="text-[15.5px] leading-relaxed text-charcoal mt-3">
                  We do not disappear after you press submit. That is the whole
                  point.
                </p>
              </div>
              <div className="lg:justify-self-end w-full max-w-[340px]">
                <div className="flex items-stretch gap-2">
                  <figure className="flex-1">
                    <div className="photo-authentic relative aspect-square overflow-hidden border border-border">
                      <Image
                        src="/images/pipe-before.jpg"
                        alt="A burst water pipe flooding an alley in Kibera"
                        fill
                        sizes="(max-width: 1024px) 45vw, 160px"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="font-hand text-[1.2rem] text-charcoal mt-1.5 -rotate-1">
                      tuesday
                    </figcaption>
                  </figure>
                  <span
                    aria-hidden="true"
                    className="self-center font-display text-xl text-terra font-bold"
                  >
                    →
                  </span>
                  <figure className="flex-1">
                    <div className="photo-authentic-alt relative aspect-square overflow-hidden border border-border">
                      <Image
                        src="/images/pipe-after.jpg"
                        alt="The same water point repaired, jerrycans filling with clean water"
                        fill
                        sizes="(max-width: 1024px) 45vw, 160px"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="font-hand text-[1.2rem] text-sky-deep mt-1.5 rotate-1">
                      thursday
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </motion.li>
        </ol>
      </div>
    </section>
  );
}
