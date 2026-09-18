"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ScrollTarget = string | number | HTMLElement;
type ScrollOptions = Record<string, unknown>;
const ScrollContext = createContext<{ lenis: Lenis | null; scrollTo: (target: ScrollTarget, options?: ScrollOptions) => void }>({ lenis: null, scrollTo: () => {} });
export const useSmoothScroll = () => useContext(ScrollContext);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const instance = useRef<Lenis | null>(null); const [lenis, setLenis] = useState<Lenis | null>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    const setup = () => {
      stop(); instance.current = null; setLenis(null);
      if (motion.matches) return;
      const current = new Lenis({ autoRaf: false, duration: 1.05, smoothWheel: true, syncTouch: false, prevent: (node) => Boolean(node.closest("dialog, [data-lenis-prevent], .yarl__root")) });
      instance.current = current; setLenis(current);
      const update = () => ScrollTrigger.update(); const tick = (seconds: number) => current.raf(seconds * 1000);
      current.on("scroll", update); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
      stop = () => { gsap.ticker.remove(tick); current.off("scroll", update); current.destroy(); };
    };
    setup(); motion.addEventListener("change", setup);
    return () => { motion.removeEventListener("change", setup); stop(); instance.current = null; };
  }, []);
  const scrollTo = useCallback((target: ScrollTarget, options?: ScrollOptions) => {
    if (instance.current) { instance.current.scrollTo(target, options); return; }
    const element = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : typeof target === "number" ? null : target;
    const top = typeof target === "number" ? target : element ? window.scrollY + element.getBoundingClientRect().top : null;
    if (top === null) return;
    window.scrollTo({ top: top + Number(options?.offset ?? 0), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, []);
  const value = useMemo(() => ({ lenis, scrollTo }), [lenis, scrollTo]);
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}
