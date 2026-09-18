"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface BookingCTAProps {
  onOpenBooking: () => void;
}

export const BookingCTA: React.FC<BookingCTAProps> = ({ onOpenBooking }) => {
  const t = useTranslations("common");

  return (
    <section className="relative w-full py-28 sm:py-36 bg-stone-950 text-stone-100 border-t border-white/10 overflow-hidden" aria-label="Reservation">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center space-y-7">
        <span className="text-[11px] uppercase tracking-[0.2em] text-amber-300 font-sans font-medium">
          Mastiha Luxury Suites · Vrontados, Chios
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-tight">
          Reserve your stay by the Aegean.
        </h2>

        <p className="font-sans text-base sm:text-lg text-stone-400 font-light max-w-xl mx-auto leading-relaxed">
          75 m² private sanctuary for up to four guests. 40 metres from the shoreline, with private parking and thoughtful amenities.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-100 text-stone-950 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-xl"
          >
            {t("bookStay")}
          </button>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 font-sans font-light">
          <span>Airbnb 5.0 Guest Favorite</span>
          <span>·</span>
          <span>Booking.com 9.9 Exceptional</span>
          <span>·</span>
          <span>Verified September 2026</span>
        </div>
      </div>
    </section>
  );
};
