"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { reviewStats } from "@/content/reviews";
import { IconStar, IconShield } from "@/components/navigation/DockIcons";

export const Reviews: React.FC = () => {
  const t = useTranslations("trust");
  const tCommon = useTranslations("common");

  return (
    <section id="reviews" className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 border-t border-white/10 overflow-hidden" aria-label="Guest Reviews and Ratings">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              {t("title")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-stone-400 font-light">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-stone-400 tracking-wider uppercase">
            <IconShield className="w-4 h-4 text-amber-300" />
            <span>{tCommon("ratingsVerified")}</span>
          </div>
        </div>

        {/* Dual Platform Score Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Airbnb Showcase */}
          <div className="p-8 sm:p-10 rounded-2xl bg-stone-900/40 border border-white/10 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="font-serif text-2xl tracking-wide font-normal text-white">
                Airbnb
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-sans font-medium">
                <IconStar className="w-3.5 h-3.5 text-amber-300" />
                <span>{t("airbnbBadge")}</span>
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl sm:text-6xl font-light text-white">
                {reviewStats.airbnb.score.toFixed(1)}
              </span>
              <span className="text-sm font-sans text-stone-400">/ 5.0</span>
            </div>

            <p className="font-sans text-xs text-stone-400 leading-relaxed">
              {t("airbnbSub")} · {reviewStats.airbnb.count} verified reviews
            </p>

            <blockquote className="font-serif italic text-sm text-stone-300 pt-4 border-t border-white/10 leading-relaxed">
              &ldquo;{reviewStats.verifiedQuotes[0].quote}&rdquo;
            </blockquote>
          </div>

          {/* Booking.com Showcase */}
          <div className="p-8 sm:p-10 rounded-2xl bg-stone-900/40 border border-white/10 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="font-serif text-2xl tracking-wide font-normal text-white">
                Booking.com
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-stone-200 text-xs font-sans font-medium">
                {t("bookingLabel")}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl sm:text-6xl font-light text-white">
                {reviewStats.booking.score.toFixed(1)}
              </span>
              <span className="text-sm font-sans text-stone-400">/ 10.0</span>
            </div>

            <p className="font-sans text-xs text-stone-400 leading-relaxed">
              Cleanliness 10 · Facilities 10 · Comfort 10 · Staff 10 · Value 10 · Location 9.7
            </p>

            <blockquote className="font-serif italic text-sm text-stone-300 pt-4 border-t border-white/10 leading-relaxed">
              &ldquo;{reviewStats.verifiedQuotes[1].quote}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};
