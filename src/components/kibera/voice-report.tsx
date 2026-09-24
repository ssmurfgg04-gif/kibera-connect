"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Speech-to-text straight from the browser, no server, no key, no cost.
// On Chrome and most Android browsers this just works. Where it does not,
// we say so plainly and hand the user back to the keyboard. Deterministic,
// boring, dependable: the same reasons the dedup is rule-based.

type Lang = "en-KE" | "sw-KE";

export function VoiceReport({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState("");
  const [lang, setLang] = useState<Lang>("en-KE");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(Boolean(SR));
    return () => {
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setMicError("");
    setInterim("");
    finalRef.current = "";

    const rec = new SR();
    recRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang; // en-KE = Kenyan English accents; sw-KE for Kiswahili
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          finalRef.current += " " + r[0].transcript.trim();
        } else {
          live += r[0].transcript;
        }
      }
      setInterim(live);
      const done = finalRef.current.trim();
      if (done) onTranscript(done);
    };

    rec.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone is blocked. Allow mic access in your browser, or type below.");
      } else if (event.error === "no-speech") {
        setMicError("We did not catch that. Move closer and try again, or type below.");
      } else if (event.error !== "aborted") {
        setMicError("Voice did not come through. Type below instead, it works just as well.");
      }
      setListening(false);
    };

    rec.onend = () => setListening(false);

    try {
      rec.start();
      setListening(true);
    } catch {
      setMicError("Voice did not start. Type below instead.");
    }
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  };

  if (supported === null) return null;

  // Honest fallback. No spinner pretending, no dead button.
  if (!supported) {
    return (
      <div className="rounded-[2px] bg-secondary/60 border-l-4 border-clay px-3.5 py-2.5 text-[12.5px] leading-snug text-muted-foreground">
        Voice reporting is not available on this browser. Typing works just as well, use the box above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant={listening ? "destructive" : "outline"}
          onClick={listening ? stop : start}
          aria-pressed={listening}
          className={`rounded-[2px] h-11 gap-2 font-semibold min-w-[48px] ${
            listening ? "bg-terra hover:bg-terra-deep text-white" : "bg-background border-input"
          }`}
        >
          {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-deep" />}
          {listening ? "Stop" : "Say it instead"}
        </Button>
        <div className="flex rounded-[2px] overflow-hidden ring-1 ring-border" role="group" aria-label="Speech language">
          {(["en-KE", "sw-KE"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-3 h-11 text-[12px] font-bold uppercase tracking-wide transition-colors ${
                lang === l ? "bg-inkkc text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              {l === "en-KE" ? "English" : "Kiswahili"}
            </button>
          ))}
        </div>
        {listening && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-terra">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terra" />
            </span>
            Listening. Speak like you are telling a neighbour.
          </span>
        )}
      </div>

      {interim && (
        <div className="rounded-[2px] bg-card ring-1 ring-border px-3.5 py-2.5 text-[13px] italic text-muted-foreground">
          {interim}…
        </div>
      )}

      {micError && (
        <div className="rounded-[2px] bg-terra/8 ring-1 ring-terra/25 px-3.5 py-2.5 text-[12.5px] text-terra flex items-start gap-2">
          <Loader2 className="w-3.5 h-3.5 mt-0.5 shrink-0 hidden" />
          {micError}
        </div>
      )}

      <p className="text-[11.5px] text-muted-foreground">
        Try: "Maji yamejaa barabarani" or "The sewer at Lindi Road has been open for two weeks."
      </p>
    </div>
  );
}
