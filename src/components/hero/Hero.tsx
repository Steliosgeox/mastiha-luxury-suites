"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { IconMastihaDrop } from "@/components/navigation/DockIcons";

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const t = useTranslations("hero");
  const { scrollTo } = useSmoothScroll();

  return (
    <section
      id="hero"
      className="relative w-full min-h-[100dvh] flex flex-col justify-end overflow-hidden bg-stone-950 select-none pb-20 sm:pb-24 pt-20"
      aria-label="Hero"
    >
      {/* Real Property Hero Photography */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/photography/hero.webp"
          alt="Mastiha Luxury Suites private terrace overlooking pine canopies in Vrontados, Chios"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transform scale-100"
        />
        {/* Subtle Mediterranean dark vignette & scrim for pristine typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/30" />
      </div>

      {/* Editorial Content: Asymmetrical Left Alignment */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full">
        <div className="max-w-2xl text-stone-100 space-y-5">
          {/* Location Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] tracking-[0.2em] uppercase font-sans font-medium text-stone-200">
            <IconMastihaDrop className="w-3 h-3 text-amber-300" />
            <span>{t("eyebrow")}</span>
          </div>

          {/* Headline (Max 2 lines on desktop) */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.04] tracking-tight text-white">
            {t("headline")}
          </h1>

          {/* Subtext (Max 20 words) */}
          <p className="font-sans text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl font-light">
            {t("subheadline")}
          </p>

          {/* CTAs (1 primary + 1 secondary) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-7 py-3 rounded-full bg-stone-100 text-stone-950 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-lg"
            >
              {t("ctaBook")}
            </button>

            <button
              type="button"
              onClick={() => scrollTo("#suite", { offset: -60 })}
              className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-stone-200 font-sans text-xs uppercase tracking-widest font-medium hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
            >
              {t("ctaExplore")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
