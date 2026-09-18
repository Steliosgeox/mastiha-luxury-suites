"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SequenceCanvas, SequenceCanvasHandle } from "./SequenceCanvas";

export const ScrollFilm: React.FC = () => {
  const t = useTranslations("sequence");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasHandleRef = useRef<SequenceCanvasHandle | null>(null);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsReducedMotion(true);
      return;
    }

    if (typeof window === "undefined" || !containerRef.current || !stickyRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=260%",
      pin: stickyRef.current,
      pinSpacing: true,
      scrub: 0.3,
      onUpdate: (self) => {
        const progress = self.progress;
        const frameCount = canvasHandleRef.current?.getFrameCount() || 120;
        const targetFrame = Math.round(progress * (frameCount - 1));
        canvasHandleRef.current?.setFrame(targetFrame);

        if (progress < 0.2) {
          setActiveStep(1);
        } else if (progress < 0.4) {
          setActiveStep(2);
        } else if (progress < 0.6) {
          setActiveStep(3);
        } else if (progress < 0.78) {
          setActiveStep(4);
        } else if (progress < 0.9) {
          setActiveStep(5);
        } else {
          setActiveStep(6);
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const steps = [
    { id: 1, text: t("step1") },
    { id: 2, text: t("step2") },
    { id: 3, text: t("step3") },
    { id: 4, text: t("step4") },
    { id: 5, text: t("step5") },
    { id: 6, text: t("step6") },
  ];

  if (isReducedMotion) {
    return (
      <section className="relative w-full py-28 bg-stone-950 text-stone-100 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100">
            {t("step1")}
          </h2>
          <p className="text-stone-400 font-sans text-base sm:text-lg">
            {t("step2")} · {t("step3")} · {t("step5")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-stone-950"
      aria-label="Apartment Cinematic Film"
    >
      <div
        ref={stickyRef}
        className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center"
      >
        {/* Canvas Sequence Frame Scrub */}
        <div className="absolute inset-0 z-0">
          <SequenceCanvas ref={canvasHandleRef} />
        </div>

        {/* Narrative Milestone Subtitles */}
        <div className="relative z-10 pointer-events-none max-w-4xl mx-auto px-6 text-center">
          {steps.map((step) => {
            const isCurrent = activeStep === step.id;
            return (
              <div
                key={step.id}
                className={`transition-all duration-500 ease-out transform ${
                  isCurrent
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-4 scale-98 pointer-events-none absolute inset-0 flex items-center justify-center"
                }`}
                aria-hidden={!isCurrent}
              >
                <div className="inline-block px-7 py-3.5 rounded-full bg-stone-950/60 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/60">
                  <p className="font-serif text-xl sm:text-3xl md:text-4xl font-light tracking-wide text-stone-100">
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeStep === step.id
                  ? "w-8 bg-amber-400/90"
                  : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
