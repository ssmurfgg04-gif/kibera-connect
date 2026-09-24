"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const LINKS = [
  { href: "#live", label: "The map" },
  { href: "#how", label: "How it works" },
  { href: "#proof", label: "Proof" },
];

export function SiteNav({ onReport }: { onReport: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-paper transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_#e4dfd2]" : ""
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2.5" aria-label="KiberaConnect home">
          {/* Mark: 6am sun over a mabati roofline, red earth sky */}
          <svg viewBox="0 0 64 64" className="w-8 h-8" aria-hidden="true">
            <rect width="64" height="64" fill="#C44536" />
            <circle cx="32" cy="34" r="15" fill="#F4A261" />
            <rect x="0" y="34" width="64" height="3" fill="#E9C46A" />
            <path
              d="M0 40 L0 64 L64 64 L64 40 L58 40 L58 45 L52 45 L52 40 L44 40 L44 45 L38 45 L38 40 L30 40 L30 45 L24 45 L24 40 L16 40 L16 45 L10 45 L10 40 Z"
              fill="#1D3557"
            />
            <rect x="0" y="52" width="64" height="12" fill="#264653" />
          </svg>
          <span className="font-display text-lg font-bold tracking-tight text-inkkc">
            Kibera<span className="text-terra">Connect</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-charcoal hover:text-terra transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReport}
            className="hidden md:inline-flex items-center gap-1.5 bg-terra hover:bg-terra-deep active:scale-[0.98] text-primary-foreground text-sm font-semibold h-10 px-4 rounded-[2px] transition-all"
          >
            Report an issue
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            className="md:hidden grid place-items-center w-10 h-10 text-inkkc"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-paper border-t border-border px-4 pb-4 pt-2 flex flex-col">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-1 py-3 text-[15px] font-medium text-charcoal border-b border-border/60"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onReport();
            }}
            className="mt-3 bg-terra hover:bg-terra-deep text-primary-foreground h-12 font-semibold rounded-[2px]"
          >
            Report an issue
          </button>
        </div>
      )}
    </header>
  );
}
