"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { propertyData } from "@/content/property";
import { trackEvent } from "@/lib/analytics";
import { IconClose, IconArrowRight, IconStar } from "@/components/navigation/DockIcons";

interface BookingChooserProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingChooser: React.FC<BookingChooserProps> = ({ isOpen, onClose }) => {
  const t = useTranslations("bookingModal");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOutboundClick = (platform: "airbnb" | "booking") => {
    trackEvent("booking_outbound_click", { platform });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-chooser-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg relative bg-stone-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] space-y-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={tCommon("close")}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300"
        >
          <IconClose className="w-5 h-5 text-stone-300" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <span className="text-[11px] uppercase tracking-[0.2em] text-amber-300 font-sans font-medium">
            {tCommon("directBooking")}
          </span>
          <h2 id="booking-chooser-title" className="font-serif text-2xl sm:text-3xl text-white font-normal">
            {t("title")}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Platform Choice Cards */}
        <div className="space-y-4">
          {/* Airbnb Option */}
          <a
            href={propertyData.bookingLinks.airbnb}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleOutboundClick("airbnb")}
            className="group block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-white font-medium">Airbnb</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-sans font-semibold">
                    <IconStar className="w-3 h-3 text-amber-300" />
                    <span>5.0</span>
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-sans font-light">
                  {t("airbnbNote")}
                </p>
              </div>
              <IconArrowRight className="w-5 h-5 text-stone-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </a>

          {/* Booking.com Option */}
          <a
            href={propertyData.bookingLinks.booking}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleOutboundClick("booking")}
            className="group block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-white font-medium">Booking.com</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-stone-200 text-[10px] font-sans font-semibold">
                    9.9 / 10
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-sans font-light">
                  {t("bookingNote")}
                </p>
              </div>
              <IconArrowRight className="w-5 h-5 text-stone-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </a>
        </div>

        {/* Security / Non-spoofing Note */}
        <p className="text-[11px] text-stone-500 text-center font-sans font-light pt-1">
          {t("securityNote")}
        </p>
      </div>
    </div>
  );
};
