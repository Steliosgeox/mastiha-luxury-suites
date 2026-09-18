"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export const SpaceStory: React.FC = () => {
  const t = useTranslations("spaces");

  return (
    <section id="spaces" className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-24 sm:space-y-32">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
            {t("title")}
          </h2>
          <p className="font-sans text-base text-stone-400 font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Space 1: Master Bedroom - Large Editorial Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-8 relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-stone-900">
            <Image
              src="/photography/master-bedroom.webp"
              alt="Mastiha Luxury Suites Master Bedroom with King bed, wine presentation, and plush towels"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-700 hover:scale-102"
            />
          </div>
          <div className="lg:col-span-4 space-y-3 pr-4">
            <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
              Primary Suite · 1 King Bed
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              {t("master.title")}
            </h3>
            <p className="font-sans text-sm text-stone-400 leading-relaxed font-light">
              {t("master.desc")}
            </p>
          </div>
        </div>

        {/* Space 2 & 3: Asymmetrical Two-Column - Living Room & Terrace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Living Lounge */}
          <div className="md:col-span-7 space-y-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-stone-900">
              <Image
                src="/photography/living-room.webp"
                alt="Mastiha Luxury Suites spacious living lounge with sofa bed, natural Mediterranean daylight, and dining table"
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 hover:scale-102"
              />
            </div>
            <div className="space-y-2 max-w-lg">
              <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
                Daylight Lounge · 1 Sofa Bed
              </span>
              <h3 className="font-serif text-2xl text-white font-normal">
                {t("living.title")}
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed font-light">
                {t("living.desc")}
              </p>
            </div>
          </div>

          {/* Terrace */}
          <div className="md:col-span-5 space-y-5 md:pt-14">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-stone-900">
              <Image
                src="/photography/terrace.webp"
                alt="Mastiha Luxury Suites outdoor private terrace with woven wicker furniture overlooking coastal pine trees"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 hover:scale-102"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
                Outdoor Sanctuary · Sea Breeze
              </span>
              <h3 className="font-serif text-2xl text-white font-normal">
                {t("terrace.title")}
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed font-light">
                {t("terrace.desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Space 4 & 5: Second Bedroom & Bathroom Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-stone-900">
              <Image
                src="/photography/second-bedroom.webp"
                alt="Second bedroom with single bed, botanical art, and bright window"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-102"
              />
            </div>
            <div className="space-y-2 pt-1">
              <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
                Guest Room · 1 Single Bed
              </span>
              <h3 className="font-serif text-2xl text-white font-normal">
                {t("second.title")}
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed font-light">
                {t("second.desc")}
              </p>
            </div>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-stone-900">
              <Image
                src="/photography/bathroom.webp"
                alt="Luxury stone bathroom vanity with vessel sink and illuminated LED mirror"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-102"
              />
            </div>
            <div className="space-y-2 pt-1">
              <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400 font-sans font-medium">
                Private Bathroom · Travertine & Chrome
              </span>
              <h3 className="font-serif text-2xl text-white font-normal">
                {t("bathroom.title")}
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed font-light">
                {t("bathroom.desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
