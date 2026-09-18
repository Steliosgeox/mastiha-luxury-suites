"use client";

import React from "react";
import { useTranslations } from "next-intl";

export const ChiosStory: React.FC = () => {
  const t = useTranslations("heritage");

  return (
    <section id="heritage" className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 border-t border-white/10 overflow-hidden" aria-label="Chios Mastiha Heritage">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-amber-300 font-sans font-medium">
              {t("eyebrow")} · Inscribed 2014
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              {t("title")}
            </h2>
          </div>

          <p className="font-sans text-base sm:text-lg text-stone-300 font-light leading-relaxed">
            {t("p1")}
          </p>

          <p className="font-sans text-base sm:text-lg text-stone-400 font-light leading-relaxed">
            {t("p2")}
          </p>

          <div className="pt-4">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-stone-900/50 border border-white/10 text-xs font-sans text-stone-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>UNESCO Representative List of Intangible Cultural Heritage</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
