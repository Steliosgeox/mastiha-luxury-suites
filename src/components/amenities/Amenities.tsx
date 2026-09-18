"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  IconBeach,
  IconSeaView,
  IconParking,
  IconWifi,
  IconClimate,
  IconKitchen,
  IconEspresso,
  IconWasher,
  IconTV,
  IconSoundproof,
  IconFamily,
  IconEntrance,
} from "@/components/navigation/DockIcons";

export const Amenities: React.FC = () => {
  const t = useTranslations("amenities");

  const amenitiesList = [
    { icon: IconBeach, label: t("beachAccess"), desc: "Approx. 40 metres from the shoreline" },
    { icon: IconSeaView, label: t("seaView"), desc: "Open Mediterranean horizon" },
    { icon: IconParking, label: t("parking"), desc: "Reserved on-site private space" },
    { icon: IconWifi, label: t("wifi"), desc: "Fast Wi-Fi verified at 92 Mbps" },
    { icon: IconClimate, label: t("climate"), desc: "Dual air conditioning and heating units" },
    { icon: IconKitchen, label: t("kitchen"), desc: "Full kitchen with oven and cookware" },
    { icon: IconEspresso, label: t("espresso"), desc: "Espresso machine with coffee bar" },
    { icon: IconWasher, label: t("laundry"), desc: "In-unit laundry washing machine" },
    { icon: IconTV, label: t("entertainment"), desc: "Two Smart TVs with streaming access" },
    { icon: IconSoundproof, label: t("soundproofing"), desc: "Acoustic insulation for quiet rest" },
    { icon: IconFamily, label: t("family"), desc: "Crib available for infants (0-3 yrs)" },
    { icon: IconEntrance, label: t("entrance"), desc: "Private ground-floor entrance" },
  ];

  return (
    <section id="amenities" className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 border-t border-white/10" aria-label="Amenities">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-16">
        <div className="max-w-xl space-y-3">
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
            {t("title")}
          </h2>
          <p className="font-sans text-sm sm:text-base text-stone-400 font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Compact, Refined Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {amenitiesList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-200 shrink-0 group-hover:border-white/25 group-hover:bg-white/10 transition-all duration-200">
                  <Icon className="w-5 h-5 text-stone-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans text-sm font-medium text-white tracking-wide">
                    {item.label}
                  </h3>
                  <p className="font-sans text-xs text-stone-400 font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
