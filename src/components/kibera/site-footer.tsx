"use client";

import { ArrowRight, Github } from "lucide-react";

export function SiteFooter({ onReport }: { onReport: () => void }) {
  return (
    <footer className="relative bg-charcoal text-[#eef3ef] edge-tear mt-4">
      {/* The loop, said once, plain */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-20 pb-12">
        <p className="font-hand text-[1.6rem] text-sunrise -rotate-1">
          one more thing
        </p>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] max-w-[18ch] mt-2">
          See a problem. Get people behind it. See what happens.
        </h2>
        <p className="mt-5 text-[15.5px] leading-relaxed text-white/70 max-w-[54ch]">
          KiberaConnect is not a suggestion box. When you report here, the
          status stays public from the first photo to the last wrench. Report
          it, then follow it. That is the difference.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onReport}
            className="inline-flex items-center gap-2 bg-terra hover:bg-[#d05040] active:scale-[0.98] text-white font-semibold min-h-[52px] px-6 rounded-[2px] transition-all"
          >
            Report an issue
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>
          <a
            href="#live"
            className="inline-flex items-center gap-2 font-semibold min-h-[52px] px-6 rounded-[2px] border-2 border-white/30 hover:border-sunrise hover:text-sunrise transition-all"
          >
            Track progress
          </a>
          <span className="text-sm text-white/55">
            Works on any phone. Even the slow one. Even on credit.
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 64 64" className="w-7 h-7" aria-hidden="true">
              <rect width="64" height="64" fill="#C44536" />
              <circle cx="32" cy="34" r="15" fill="#F4A261" />
              <rect x="0" y="34" width="64" height="3" fill="#E9C46A" />
              <path
                d="M0 40 L0 64 L64 64 L64 40 L58 40 L58 45 L52 45 L52 40 L44 40 L44 45 L38 45 L38 40 L30 40 L30 45 L24 45 L24 40 L16 40 L16 45 L10 45 L10 40 Z"
                fill="#1D3557"
              />
              <rect x="0" y="52" width="64" height="12" fill="#264653" />
            </svg>
            <div>
              <div className="font-display font-bold text-white">KiberaConnect</div>
              <div className="text-[12px] text-white/50">Built in Kibera, Nairobi. Twaweza.</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-white/60">
            <a href="#live" className="hover:text-white transition-colors">The map</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#proof" className="hover:text-white transition-colors">Proof</a>
          </nav>

          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[12.5px] text-white/50 hover:text-white transition-colors"
            aria-label="Source on GitHub"
          >
            <Github className="w-4 h-4" />
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
