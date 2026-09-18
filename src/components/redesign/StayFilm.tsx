"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFramePlayer, parseFrameManifest, type FrameManifest } from "./frame-player";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import s from "./MastihaOdisej.module.css";

type Connection = { saveData?: boolean; effectiveType?: string; addEventListener?: (name: string, fn: () => void) => void; removeEventListener?: (name: string, fn: () => void) => void };
export function StayFilm({ locale }: { locale: StayLocale }) {
  const section = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null), bar = useRef<HTMLSpanElement>(null);
  const [settings, setSettings] = useState<{ allow: boolean; mobile: boolean } | null>(null);
  const [failed, setFailed] = useState(false); const [step, setStep] = useState(0);
  const c = getStayCopy(locale);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)"); const mobile = window.matchMedia("(max-width: 760px)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const read = () => {
      const allow = !motion.matches && !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
      setSettings((old) => old?.allow === allow && old.mobile === mobile.matches ? old : { allow, mobile: mobile.matches });
    };
    read(); motion.addEventListener("change", read); mobile.addEventListener("change", read); connection?.addEventListener?.("change", read);
    return () => { motion.removeEventListener("change", read); mobile.removeEventListener("change", read); connection?.removeEventListener?.("change", read); };
  }, []);

  useEffect(() => {
    const element = section.current, surface = canvas.current;
    if (!settings?.allow || failed || !element || !surface) return;
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false, visible = false, progress = 0, lastStep = -1, starting = false;
    let manifest: FrameManifest | null = null;
    let player: ReturnType<typeof createFramePlayer> | null = null;
    const request = new AbortController();
    const fail = () => { if (!disposed) setFailed(true); };
    const trigger = ScrollTrigger.create({ trigger: element, start: "top top", end: "bottom bottom", onUpdate: (self) => {
      progress = self.progress; element.dataset.progress = progress.toFixed(4);
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      const next = progress < .34 ? 0 : progress < .7 ? 1 : 2;
      if (lastStep !== next) { lastStep = next; setStep(next); }
      player?.seek(progress);
    } });
    progress = trigger.progress;
    const start = async () => {
      if (starting || player || !visible || disposed) return;
      starting = true;
      try {
        if (!manifest) {
          const timeout = setTimeout(() => request.abort(), 10000);
          try { const response = await fetch("/sequence/sequence-manifest.json", { signal: request.signal }); if (!response.ok) throw new Error("Film manifest unavailable"); manifest = parseFrameManifest(await response.json()); } finally { clearTimeout(timeout); }
        }
        if (!visible || disposed) return;
        player = createFramePlayer(surface, settings.mobile ? manifest.mobile : manifest.desktop, { mobile: settings.mobile, onError: fail });
        player.seek(progress);
      } catch { if (!disposed) fail(); } finally { starting = false; }
    };
    // No film-frame downloads while the first-screen photograph is being presented.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .001;
      if (visible) void start(); else { player?.dispose(); player = null; }
    }, { rootMargin: "0px", threshold: [0, .001] });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); request.abort(); trigger.kill(); player?.dispose(); };
  }, [settings, failed]);

  const isStatic = settings?.allow === false || failed;
  return <section id="film" ref={section} className={s.film} data-static={isStatic} data-testid="scroll-film" aria-label={c.filmEyebrow}>
    <div className={s.filmViewport} data-media-frame>
      <Image src="/sequence/poster.webp" alt={c.filmFallback} fill sizes="100vw" className={s.filmPoster} />
      <canvas ref={canvas} className={s.filmCanvas} aria-hidden="true" data-testid="film-canvas" />
      <div className={s.filmShade} aria-hidden="true" />
      <div className={s.filmTop}><span>{c.filmEyebrow}</span><a href="#suite">{c.skipFilm} ↘</a></div>
      <div className={s.filmCaption}><p>{isStatic ? c.filmFallback : c.filmHint}</p><h2>{isStatic ? c.filmTitle : c.filmSteps[step]}</h2></div>
      <div className={s.filmProgress} aria-hidden="true"><span ref={bar} /></div>
    </div>
    <noscript><style>{"#film{height:82svh!important}#film>div{position:relative!important;height:100%!important}"}</style></noscript>
  </section>;
}
