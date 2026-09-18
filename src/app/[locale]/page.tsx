"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { LiquidDock } from "@/components/navigation/LiquidDock";
import { Hero } from "@/components/hero/Hero";
import { ScrollFilm } from "@/components/sequence/ScrollFilm";
import { PropertyIntro } from "@/components/property/PropertyIntro";
import { SpaceStory } from "@/components/property/SpaceStory";
import { EditorialGallery } from "@/components/gallery/EditorialGallery";
import { Amenities } from "@/components/amenities/Amenities";
import { Reviews } from "@/components/trust/Reviews";
import { LocationStory } from "@/components/location/LocationStory";
import { ChiosStory } from "@/components/destination/ChiosStory";
import { FAQ } from "@/components/faq/FAQ";
import { BookingCTA } from "@/components/booking/BookingCTA";
import { BookingChooser } from "@/components/booking/BookingChooser";
import { Footer } from "@/components/layout/Footer";
import { trackEvent } from "@/lib/analytics";

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleOpenBooking = (source: string = "general") => {
    if (source === "hero") {
      trackEvent("hero_book_click");
    } else if (source === "dock") {
      trackEvent("dock_book_click");
    } else if (source === "header") {
      trackEvent("header_book_click");
    }
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <main className="relative min-h-[100dvh] bg-stone-950 text-stone-100 selection:bg-amber-400 selection:text-stone-950">
      {/* PC & Tablet Fixed Luxury Header */}
      <Header onOpenBooking={() => handleOpenBooking("header")} />

      {/* Flagship Editorial Hero */}
      <Hero onOpenBooking={() => handleOpenBooking("hero")} />

      {/* Cinematic 60fps Frame Scrub Sequence */}
      <ScrollFilm />

      {/* Architectural Statement & Property Metrics */}
      <PropertyIntro />

      {/* Space & Living Story */}
      <SpaceStory />

      {/* Editorial Photography Gallery */}
      <EditorialGallery />

      {/* Verified Comforts & Amenities */}
      <Amenities />

      {/* Verified Distances & Aegean Location */}
      <LocationStory />

      {/* Verified Guest Reviews & Trust Badges */}
      <Reviews />

      {/* UNESCO Mastiha Heritage Story */}
      <ChiosStory />

      {/* Essential Stay Information FAQ */}
      <FAQ />

      {/* Closing Reservation CTA */}
      <BookingCTA onOpenBooking={() => handleOpenBooking("cta")} />

      {/* Registered Host Footer */}
      <Footer />

      {/* Mobile-Only Sleek Navigation Dock */}
      <LiquidDock onOpenBooking={() => handleOpenBooking("dock")} />

      {/* Pure Specular Glass Booking Modal */}
      <BookingChooser
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />
    </main>
  );
}
