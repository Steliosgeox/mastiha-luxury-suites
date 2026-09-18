"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { IconClose } from "@/components/navigation/DockIcons";

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  category: string;
}

interface LightboxProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  items,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    const newIdx = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    onNavigate(newIdx);
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const newIdx = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIdx);
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || currentIndex === null) return null;

  const currentItem = items[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Gallery Lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl transition-opacity duration-300 select-none"
      onClick={onClose}
    >
      {/* Top Bar: Counter & Close */}
      <div
        className="absolute top-6 inset-x-6 z-20 flex items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs tracking-widest uppercase font-sans text-stone-300">
          {currentIndex + 1} / {items.length} · {currentItem.caption}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300"
        >
          <IconClose className="w-5 h-5 text-stone-200" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative w-full max-w-5xl h-[75vh] px-4 sm:px-12 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-h-full">
          <Image
            src={currentItem.src}
            alt={currentItem.alt}
            fill
            sizes="(max-width: 1280px) 90vw, 1200px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        aria-label="Previous photograph"
        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label="Next photograph"
        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
