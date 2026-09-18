"use client";

import React from "react";
import { useTranslations } from "next-intl";

export const PropertyIntro: React.FC = () => {
  const t = useTranslations("intro");

  return (
    <section
      id="suite"
      className="relative w-full py-28 sm:py-36 bg-stone-950 text-stone-100 overflow-hidden border-t border-white/10"
      aria-label="Property Introduction"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Editorial Statement */}
        <div className="max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.12] tracking-tight text-stone-100">
            {t("statement")}
          </h2>
          <p className="font-sans text-base sm:text-lg text-stone-400 leading-relaxed font-light max-w-2xl">
            {t("narrative")}
          </p>
        </div>

        {/* Factual Architectural Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 pt-16 border-t border-white/10 mt-20">
          <div className="space-y-2">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white block">
              {t("metricArea")}
            </span>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
              {t("metricAreaLabel")}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white block">
              {t("metricGuests")}
            </span>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
              {t("metricGuestsLabel")}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white block">
              {t("metricBedrooms")}
            </span>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
              {t("metricBedroomsLabel")}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white block">
              {t("metricDistance")}
            </span>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
              {t("metricDistanceLabel")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
