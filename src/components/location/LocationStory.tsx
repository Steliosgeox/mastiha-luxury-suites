"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { locationData } from "@/content/locations";
import { MapPreview } from "./MapPreview";

export const LocationStory: React.FC = () => {
  const t = useTranslations("location");

  return (
    <section id="location" className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 border-t border-white/10" aria-label="Location and Surroundings">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-16">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
            {t("title")}
          </h2>
          <p className="font-sans text-sm sm:text-base text-stone-400 font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Map Composition */}
        <MapPreview />

        {/* Verified Distances & Neighborhood Context */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 pt-4">
          {/* Key Landmarks */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-serif text-2xl text-white font-normal">
              Verified Distance Markers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {locationData.landmarks.map((landmark) => (
                <div
                  key={landmark.id}
                  className="p-5 rounded-xl bg-stone-900/40 border border-white/10 space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans text-sm font-medium text-stone-100">
                      {landmark.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-stone-200 font-sans text-xs font-semibold">
                      {landmark.distance}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-stone-400 font-light leading-relaxed">
                    {landmark.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Essentials */}
          <div className="lg:col-span-4 space-y-6 p-7 rounded-2xl bg-stone-900/40 border border-white/10">
            <h3 className="font-serif text-xl text-white font-normal">
              {t("amenitiesHeader")}
            </h3>
            <p className="font-sans text-xs text-stone-400 leading-relaxed font-light">
              {t("amenitiesBody")}
            </p>

            <ul className="space-y-3 pt-4 border-t border-white/10 text-xs font-sans text-stone-300">
              {locationData.amenitiesNearby.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
