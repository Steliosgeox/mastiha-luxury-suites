"use client";

import React, { useState } from "react";
import { propertyData } from "@/content/property";
import { trackEvent } from "@/lib/analytics";
import { IconLocation } from "@/components/navigation/DockIcons";

export const MapPreview: React.FC = () => {
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);

  const handleOpenGoogleMaps = () => {
    trackEvent("map_open", { action: "external_link" });
    window.open(propertyData.location.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const handleGetDirections = () => {
    trackEvent("directions_click");
    window.open(propertyData.location.googleDirectionsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-stone-900 border border-white/10 shadow-2xl">
      {!showInteractiveMap ? (
        <div className="relative w-full aspect-[16/9] min-h-[360px] bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-8 flex flex-col justify-between overflow-hidden">
          {/* Subtle Aegean Grid Vector */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Top Location Pill */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs tracking-wider uppercase font-sans text-stone-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Vrontados · Coastal Chios</span>
            </div>
          </div>

          {/* Center Property Pin */}
          <div className="relative z-10 my-auto text-center space-y-3">
            <div className="inline-flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-950 flex items-center justify-center shadow-xl">
                <IconLocation className="w-6 h-6 text-stone-950" />
              </div>
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-xl sm:text-2xl text-white font-normal">
                Mastiha Luxury Suites
              </h4>
              <p className="font-sans text-xs text-stone-400 font-light max-w-sm mx-auto">
                {propertyData.location.address}, {propertyData.location.postalCode}
              </p>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs text-stone-400 font-sans font-light">
              40 metres from the Aegean Shoreline
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGetDirections}
                className="px-4 py-2 rounded-full bg-stone-100 text-stone-950 text-xs font-sans font-semibold tracking-wide hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                Get Directions
              </button>

              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-stone-200 border border-white/15 text-xs font-sans font-medium transition-all"
              >
                Open in Google Maps
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-[16/9] min-h-[360px] relative">
          <iframe
            title="Mastiha Luxury Suites Location Map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              "Mastiha Luxury Suites Ethnikis Antistaseos G Parodos 18 Vrontados Chios Greece"
            )}&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
