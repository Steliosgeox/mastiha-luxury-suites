"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { propertyData } from "@/content/property";
import { IconMastihaDrop } from "@/components/navigation/DockIcons";

export const Footer: React.FC = () => {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <footer className="relative w-full py-16 bg-stone-950 text-stone-100 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-amber-300">
                <IconMastihaDrop className="w-3 h-3 text-amber-300" />
              </div>
              <span className="font-serif text-lg tracking-[0.2em] uppercase font-normal text-white">
                Mastiha
              </span>
            </div>
            <p className="font-sans text-xs text-stone-400 font-light max-w-sm leading-relaxed">
              {t("tagline")}
            </p>
            <p className="font-sans text-[11px] text-stone-500 font-light">
              Ethnikis Antistaseos / G Parodos 18 · Vrontados, Chios 822 00, Greece
            </p>
          </div>

          {/* Direct Reserve Channels */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-sans text-amber-300 font-medium">
              Verified Booking
            </h4>
            <ul className="space-y-2 text-xs font-sans text-stone-400">
              <li>
                <a
                  href={propertyData.bookingLinks.airbnb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Airbnb (Guest Favorite · 5.0)
                </a>
              </li>
              <li>
                <a
                  href={propertyData.bookingLinks.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Booking.com (Exceptional · 9.9)
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation & Legal */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-sans text-amber-300 font-medium">
              Legal & Registration
            </h4>
            <div className="space-y-2 text-xs font-sans text-stone-400">
              <p>{t("registered")}</p>
              <div className="flex items-center gap-4 pt-2 text-[11px]">
                <Link href="/privacy" className="hover:text-white underline underline-offset-4">
                  {tCommon("privacyPolicy")}
                </Link>
                <span>·</span>
                <span>{t("ownerNotice")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 font-sans font-light gap-4">
          <p>© {new Date().getFullYear()} Mastiha Luxury Suites. {t("rights")}</p>
          <p className="text-[10px] tracking-widest uppercase">Chios Island, Greece</p>
        </div>
      </div>
    </footer>
  );
};
