"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { IconMastihaDrop } from "@/components/navigation/DockIcons";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";

interface HeaderProps {
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const t = useTranslations("common");
  const navT = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { scrollTo } = useSmoothScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (newLocale: "en" | "el" | "tr") => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  const navLinks = [
    { label: navT("suite"), href: "#suite" },
    { label: "Spaces", href: "#spaces" },
    { label: "Amenities", href: "#amenities" },
    { label: navT("location"), href: "#location" },
    { label: "Reviews", href: "#reviews" },
    { label: "Heritage", href: "#heritage" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-stone-950/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/25"
          : "bg-gradient-to-b from-stone-950/80 via-stone-950/40 to-transparent border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 sm:h-[68px] flex items-center justify-between">
        {/* Left: Refined Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-stone-100 group focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300 rounded"
        >
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform duration-300">
            <IconMastihaDrop className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.22em] text-sm sm:text-base font-normal uppercase text-stone-100">
              Mastiha
            </span>
            <span className="text-[9px] tracking-[0.2em] text-stone-400 uppercase font-sans -mt-0.5">
              Luxury Suites · Chios
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Single Line) */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden md:flex items-center gap-7 text-[11px] font-sans uppercase tracking-[0.18em] text-stone-300"
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href, { offset: -70 })}
              className="hover:text-white transition-colors duration-200 focus:outline-none focus-visible:text-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Language Switcher & Book Direct CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div
            className="flex items-center rounded-full bg-white/5 border border-white/10 p-0.5 text-[11px] font-sans"
            role="group"
            aria-label="Language selection"
          >
            {(["en", "el", "tr"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 py-1 rounded-full uppercase font-medium transition-all duration-200 ${
                  locale === lang
                    ? "bg-white/20 text-white font-semibold shadow-xs"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                aria-label={`Change language to ${lang.toUpperCase()}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Desktop Direct Booking CTA */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="hidden sm:inline-flex items-center justify-center px-4 sm:px-5 py-2 text-[11px] uppercase tracking-[0.16em] font-semibold bg-stone-100 text-stone-950 hover:bg-white rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200"
          >
            {t("bookStay")}
          </button>
        </div>
      </div>
    </header>
  );
};
