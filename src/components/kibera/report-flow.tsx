"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Toilet,
  HardHat,
  ShieldAlert,
  HeartPulse,
  Leaf,
  GraduationCap,
  Zap,
  Sparkles,
  MapPin,
  Crosshair,
  Camera,
  Send,
  X,
  RotateCcw,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock3,
  Loader2,
  MessageSquareHeart,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORIES,
  CATEGORY_META,
  VILLAGES,
  SEVERITY_META,
  AiAnalysis,
  timeAgo,
} from "@/lib/kibera";
import { VoiceReport } from "./voice-report";

interface SimilarMatch {
  id: string;
  title: string;
  village: string | null;
  status: string;
  upvotes: number;
  createdAt: string;
  distanceM: number | null;
  similarity: number;
}

function fmtDistance(m: number | null): string {
  if (m == null) return "same words";
  if (m < 15) return "right here";
  if (m <= 60) return `${m} steps away`;
  return null as unknown as string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  water: <Droplets className="w-5 h-5" />,
  sanitation: <Toilet className="w-5 h-5" />,
  infrastructure: <HardHat className="w-5 h-5" />,
  safety: <ShieldAlert className="w-5 h-5" />,
  health: <HeartPulse className="w-5 h-5" />,
  environment: <Leaf className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  energy: <Zap className="w-5 h-5" />,
};

type Phase = "form" | "analyzing" | "analyzed" | "submitting" | "done" | "joining" | "joined";

export function ReportFlow({ onSubmitted }: { onSubmitted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [reporter, setReporter] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState("");
  const [similar, setSimilar] = useState<SimilarMatch[]>([]);
  const [checking, setChecking] = useState(false);
  const [dismissedSimilar, setDismissedSimilar] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const simTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // As the description grows, quietly check whether a neighbour already
  // reported this same problem. 60 meters and similar words means it is
  // the same broken pipe. Rule-based, instant, works on two bars of network.
  useEffect(() => {
    if (phase !== "form") return;
    const text = description.trim();
    if (text.length < 20) {
      setSimilar([]);
      setDismissedSimilar(false);
      return;
    }
    if (simTimer.current) clearTimeout(simTimer.current);
    simTimer.current = setTimeout(async () => {
      setChecking(true);
      try {
        const qs = new URLSearchParams({ description: text });
        if (coords) { qs.set("lat", String(coords.lat)); qs.set("lng", String(coords.lng)); }
        const res = await fetch(`/api/issues/similar?${qs.toString()}`);
        const data = await res.json();
        setSimilar(Array.isArray(data.matches) ? data.matches : []);
      } catch {
        // Dedup is a courtesy, never a blocker
      } finally {
        setChecking(false);
      }
    }, 700);
    return () => {
      if (simTimer.current) clearTimeout(simTimer.current);
    };
  }, [description, coords, phase]);

  const joinExisting = async () => {
    const top = similar[0];
    if (!top) return;
    setPhase("joining");
    try {
      const res = await fetch(`/api/issues/${top.id}/upvote`, { method: "POST" });
      const d = await res.json();
      setSimilar((prev) => [
        { ...top, upvotes: typeof d.upvotes === "number" ? d.upvotes : top.upvotes + 1 },
        ...prev.slice(1),
      ]);
      setPhase("joined");
      setTimeout(() => {
        reset();
        onSubmitted();
      }, 3200);
    } catch {
      setError("Could not add your voice. Try again or post a fresh report.");
      setPhase("form");
    }
  };

  const valid = title.trim().length > 5 && description.trim().length > 15 && category !== "";

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: Number(pos.coords.latitude.toFixed(6)), lng: Number(pos.coords.longitude.toFixed(6)) });
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. You can pick the village instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 560;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhoto(canvas.toDataURL("image/jpeg", 0.72));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!valid) return;
    setError("");
    setPhase("analyzing");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category: category || undefined, village: village || undefined }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data.analysis);
      setPhase("analyzed");
    } catch {
      setError("The AI analyst is unreachable right now. You can still post the report.");
      setPhase("form");
    }
  };

  const submit = async () => {
    setPhase("submitting");
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: analysis?.category || category,
          severity: analysis?.severity || "medium",
          village,
          latitude: coords?.lat,
          longitude: coords?.lng,
          reporterName: reporter,
          isAnonymous: anonymous,
          photoUrl: photo,
          aiAnalysis: analysis
            ? {
                summary: analysis.summary,
                actions: analysis.actions,
                affectedEstimate: analysis.affectedEstimate,
              }
            : null,
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setPhase("done");
      setTimeout(() => {
        reset();
        onSubmitted();
      }, 2600);
    } catch {
      setError("Couldn't post your report. Check your connection and try again.");
      setPhase("analyzed");
    }
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setVillage("");
    setReporter("");
    setAnonymous(false);
    setCoords(null);
    setPhoto(null);
    setAnalysis(null);
    setSimilar([]);
    setDismissedSimilar(false);
    setPhase("form");
    setError("");
  };

  const sev = analysis ? SEVERITY_META[analysis.severity] : null;

  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-[640px]">
      {/* ── Form side ── */}
      <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-border">
        <AnimatePresence mode="wait">
          {phase === "done" || phase === "joined" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full min-h-[420px] grid place-items-center text-center"
            >
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  className={`mx-auto grid place-items-center w-20 h-20 rounded-full ${
                    phase === "joined" ? "bg-primary/10 text-primary" : "bg-sky/12 text-sky-deep"
                  }`}
                >
                  {phase === "joined" ? <MessageSquareHeart className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                </motion.div>
                {phase === "joined" ? (
                  <>
                    <h3 className="font-display mt-5 text-2xl font-semibold">Sauti yako imehesabika.</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                      Your voice joined the report that was already there. It now stands at{" "}
                      <strong className="text-foreground tabular-nums">{similar[0]?.upvotes ?? "?"} neighbours strong</strong>. That is what a work order looks like. Taking you there…
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-display mt-5 text-2xl font-semibold">Asante sana! Report posted.</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                      Your report is now live on the community map for verification. Taking you there…
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-semibold">What&apos;s happening?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Plain language is perfect. Write like you&apos;d tell a neighbour.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rf-title" className="text-[13px] font-semibold">
                  Title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="rf-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water kiosk queue exceeds 4 hours"
                  className="h-11 rounded-[2px] bg-background"
                  maxLength={120}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rf-desc" className="text-[13px] font-semibold">
                  Description <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="rf-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is happening, who is affected, and for how long? Details help the AI and responders act faster."
                  className="min-h-24 rounded-[2px] bg-background resize-none"
                  maxLength={1200}
                />
                <VoiceReport
                  onTranscript={(text) =>
                    setDescription((prev) => (prev ? `${prev.trim()} ${text}`.slice(0, 1200) : text))
                  }
                />
              </div>

              {/* You are not the only one. Neighbours beat you to it, and that is good news. */}
              {phase === "form" && !dismissedSimilar && similar.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2px] bg-card border-l-4 border-primary px-4 py-3.5"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-primary" />
                    <span className="font-display text-[15px] font-semibold">
                      You are not the only one.
                    </span>
                    {checking && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {similar.length === 1
                      ? "One neighbour already reported this."
                      : `${similar.length} neighbours already reported this.`}{" "}
                    {similar[0].upvotes > 1 && `That is ${similar[0].upvotes} voices on one paper instead of ${similar[0].upvotes} papers in a drawer.`}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {similar.slice(0, 3).map((m) => (
                      <li key={m.id} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                        <span className="cat-dot bg-primary/60 shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[46%]">{m.title}</span>
                        <span>{m.village ?? "Kibera"}</span>
                        <span className="text-border">·</span>
                        <span className="tabular-nums">{fmtDistance(m.distanceM)}</span>
                        <span className="text-border">·</span>
                        <span>{timeAgo(m.createdAt)}</span>
                        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground tabular-nums">
                          <MessageSquareHeart className="w-3 h-3 text-primary" />
                          {m.upvotes}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      onClick={joinExisting}
                      disabled={phase === "joining"}
                      className="rounded-[2px] bg-primary hover:bg-terra-deep text-primary-foreground h-10 px-4 text-[13px] font-semibold gap-2"
                    >
                      {phase === "joining" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareHeart className="w-4 h-4" />}
                      Add my voice to theirs
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDismissedSimilar(true)}
                      className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Mine is different, post it anyway
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold">
                  Category <span className="text-primary">*</span>
                </Label>
                <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Issue category">
                  {CATEGORIES.map((c) => {
                    const meta = CATEGORY_META[c];
                    const active = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setCategory(c)}
                        className={`flex flex-col items-center gap-1.5 rounded-[2px] py-2.5 px-1 ring-1 transition-all duration-150 ${
                          active
                            ? "ring-primary/60 bg-accent"
                            : "ring-border bg-background hover:ring-primary/30"
                        }`}
                      >
                        <span style={{ color: active ? meta.color : "#5b6b78" }}>{CATEGORY_ICONS[c]}</span>
                        <span className={`text-[10.5px] font-semibold leading-none ${active ? "text-foreground" : "text-muted-foreground"}`}>
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold">Village</Label>
                  <div className="relative">
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="h-11 w-full rounded-[2px] bg-background border border-input px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                      aria-label="Select village"
                    >
                      <option value="">Select a village…</option>
                      {VILLAGES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold">Location pin</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={locate}
                    className="w-full h-11 rounded-[2px] justify-start gap-2 bg-background border-input font-medium"
                    disabled={locating}
                  >
                    {locating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Crosshair className="w-4 h-4 text-primary" />
                    )}
                    {coords ? `${coords.lat}, ${coords.lng}` : "Use my current location"}
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="rf-name" className="text-[13px] font-semibold">
                    Your name
                  </Label>
                  <div className="relative">
                    <Input
                      id="rf-name"
                      value={reporter}
                      onChange={(e) => setReporter(e.target.value)}
                      placeholder="Optional"
                      disabled={anonymous}
                      className="h-11 rounded-[2px] bg-background pr-10"
                      maxLength={60}
                    />
                    {anonymous && <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[2px] bg-secondary/70 px-4 h-11">
                  <Label htmlFor="rf-anon" className="text-[13px] font-semibold cursor-pointer">
                    Post anonymously
                  </Label>
                  <Switch id="rf-anon" checked={anonymous} onCheckedChange={setAnonymous} />
                </div>
              </div>

              <div className="space-y-2.5">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0])}
                  aria-label="Attach a photo"
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-[2px] h-10 gap-2 bg-background border-input font-medium"
                  >
                    <Camera className="w-4 h-4 text-primary" />
                    {photo ? "Change photo" : "Attach a photo"}
                  </Button>
                  <span className="text-[12px] text-muted-foreground">
                    One photo is worth forty phone calls.
                  </span>
                </div>
                {photo ? (
                  <div className="relative overflow-hidden rounded-[2px] ring-1 ring-border">
                    <img
                      src={photo}
                      alt="Attached preview"
                      className="w-full h-36 object-cover"
                      style={{ filter: "contrast(1.08) saturate(0.92)" }}
                    />
                    <span className="absolute bottom-2 left-2 bg-inkkc/85 text-primary-foreground text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-[2px]">
                      {coords ? "Pinned and attached" : "Photo attached. Add a pin for the map"}
                    </span>
                    <button
                      onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="absolute top-2 right-2 grid place-items-center w-8 h-8 rounded-[2px] bg-inkkc/85 text-primary-foreground hover:bg-inkkc"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-[2px] bg-terra/8 bg-[rgba(196,43,28,0.07)] ring-1 ring-terra/25 px-3.5 py-2.5 text-[13px] text-terra">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {phase === "analyzed" ? (
                  <>
                    <Button
                      onClick={submit}
                      disabled={phase === "submitting"}
                      className="rounded-[2px] bg-sky hover:bg-sky-deep text-white h-12 px-6 text-[15px] font-semibold gap-2"
                    >
                      {phase === "submitting" ? (
                        <Loader2 className="w-4.5 h-4.5 w-[18px] h-[18px] animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post to community map
                    </Button>
                    <Button variant="ghost" onClick={() => setPhase("form")} className="rounded-[2px] h-12 text-muted-foreground font-semibold">
                      <RotateCcw className="w-4 h-4" />
                      Edit report
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={analyze}
                    disabled={!valid || phase === "analyzing"}
                    className="rounded-[2px] bg-primary hover:bg-terra-deep text-primary-foreground h-12 px-6 text-[15px] font-semibold gap-2"
                  >
                    {phase === "analyzing" ? (
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    ) : (
                      <Sparkles className="w-[18px] h-[18px]" />
                    )}
                    {phase === "analyzing" ? "AI is reading your report…" : "Analyze with AI"}
                  </Button>
                )}
                {!valid && phase === "form" && (
                  <span className="text-[12.5px] text-muted-foreground">
                    Add a title, a short description and a category to continue.
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── AI analysis side ── */}
      <div className="relative p-6 sm:p-8 bg-[linear-gradient(180deg,#fdf9f1,#f8efdf)] dark:bg-secondary/30 min-h-[320px]">
        <AnimatePresence mode="wait">
          {phase === "analyzing" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[420px] grid place-items-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  className="mx-auto w-16 h-16 rounded-[2px] bg-card ring-1 ring-border grid place-items-center"
                >
                  <Sparkles className="w-7 h-7 text-primary" />
                </motion.div>
                <div className="mt-5 font-display text-xl font-semibold shimmer-text">
                  Reading your report with local context…
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-[260px] mx-auto">
                  Checking severity, affected population and next actions for Kibera&apos;s 11 villages.
                </p>
              </div>
            </motion.div>
          )}

          {phase === "analyzed" && analysis && sev && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Triage
                </h3>
                <Badge variant="outline" className="rounded-[2px] text-[11px] font-bold border-border text-muted-foreground">
                  3.2s · Kibera-tuned
                </Badge>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-5 rounded-[2px] bg-card ring-1 ring-border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Severity
                  </span>
                  <span
                    className="rounded-[2px] px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide"
                    style={{ color: sev.color, background: sev.bg }}
                  >
                    {sev.label}
                  </span>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden flex gap-0.5">
                  {(["low", "medium", "high", "critical"] as const).map((s) => {
                    const idx = ["low", "medium", "high", "critical"].indexOf(analysis.severity);
                    const thisIdx = ["low", "medium", "high", "critical"].indexOf(s);
                    return (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: thisIdx <= idx ? 1 : 0.25 }}
                        transition={{ delay: 0.3 + thisIdx * 0.12 }}
                        className="h-full flex-1 rounded-full"
                        style={{ background: thisIdx <= idx ? SEVERITY_META[s].color : "#e6dcc9" }}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-9 h-9 rounded-[2px] bg-accent text-primary">
                      <Users className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold tabular-nums leading-none">
                        ~{analysis.affectedEstimate.toLocaleString()}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">residents affected</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-9 h-9 rounded-[2px] bg-accent text-primary">
                      <Clock3 className="w-[18px] h-[18px]" />
                    </span>
                    <div>
                      <div className="text-[13px] font-bold leading-tight">{CATEGORY_META[analysis.category]?.label ?? category}</div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">routed category</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 rounded-[2px] bg-card ring-1 ring-border p-4"
              >
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Assessment
                </div>
                <p className="mt-2 text-[14px] leading-relaxed">{analysis.summary}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-3 rounded-[2px] bg-card ring-1 ring-border p-4"
              >
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Suggested actions
                </div>
                <ul className="mt-2.5 space-y-2">
                  {analysis.actions.map((a, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.1 }}
                      className="flex gap-2.5 text-[13.5px] leading-snug"
                    >
                      <span className="grid place-items-center shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {a}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-3 flex items-start gap-2 rounded-[2px] ring-1 p-3"
                style={{ background: sev.bg, borderColor: sev.color }}
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: sev.color }} />
                <p className="text-[13px] leading-snug font-medium">{analysis.urgencyNote}</p>
              </motion.div>
            </motion.div>
          )}

          {(phase === "form" || phase === "analyzing" || phase === "submitting" || phase === "done") &&
            phase !== "analyzed" && phase !== "analyzing" && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[420px] grid place-items-center"
              >
                <div className="text-center max-w-[300px]">
                  <div className="mx-auto w-16 h-16 rounded-[2px] bg-card ring-1 ring-border grid place-items-center rotate-3">
                    <Sparkles className="w-7 h-7 text-sunrise" />
                  </div>
                  <h3 className="font-display mt-5 text-xl font-semibold">
                    Your report meets Kibera&apos;s context.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    The AI analyst weighs population density, ongoing weather, infrastructure gaps
                    and real response capacity, then drafts the action plan for you.
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className="cat-dot bg-sky" /> Severity with local nuance
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="cat-dot bg-sunrise" /> Affected-population estimate
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="cat-dot bg-primary" /> 3–5 concrete next actions
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
