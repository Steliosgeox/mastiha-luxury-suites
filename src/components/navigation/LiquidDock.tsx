"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconSuite,
  IconGallery,
  IconLocation,
  IconStar,
  IconBook,
} from "@/components/navigation/DockIcons";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";

interface LiquidDockProps {
  onOpenBooking: () => void;
}

export const LiquidDock: React.FC<LiquidDockProps> = ({ onOpenBooking }) => {
  const t = useTranslations("nav");
  const commonT = useTranslations("common");
  const { scrollTo } = useSmoothScroll();
  const [activeSection, setActiveSection] = useState<string>("suite");

  useEffect(() => {
    const sectionIds = ["suite", "spaces", "gallery", "location", "reviews"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, id: string) => {
    setActiveSection(id);
    scrollTo(href, { offset: -60 });
  };

  const navItems = [
    { id: "suite", label: t("suite"), icon: IconSuite, href: "#suite" },
    { id: "spaces", label: "Spaces", icon: IconGallery, href: "#spaces" },
    { id: "location", label: t("location"), icon: IconLocation, href: "#location" },
    { id: "reviews", label: "Reviews", icon: IconStar, href: "#reviews" },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-5 inset-x-4 z-40 flex justify-center pointer-events-none md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="pointer-events-auto w-full max-w-sm flex items-center justify-between px-2 py-1.5 rounded-full bg-stone-900/90 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.href, item.id)}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                isActive ? "text-stone-100 font-medium" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-sans tracking-wide mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="w-px h-6 bg-white/10 mx-0.5" aria-hidden="true" />

        {/* High-visibility Reserve CTA Pill */}
        <button
          type="button"
          onClick={onOpenBooking}
          aria-label={commonT("bookStay")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 text-stone-950 font-sans text-xs font-semibold tracking-wide hover:bg-white active:scale-95 transition-all shadow-md"
        >
          <IconBook className="w-3.5 h-3.5 text-stone-950" />
          <span>Book</span>
        </button>
      </div>
    </nav>
  );
};
