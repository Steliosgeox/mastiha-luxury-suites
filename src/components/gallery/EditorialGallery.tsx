"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lightbox, GalleryItem } from "./Lightbox";

export const EditorialGallery: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      src: "/photography/hero.webp",
      alt: "Private terrace with wicker seating overlooking pines and Aegean light",
      caption: "Private Outdoor Terrace",
      category: "Outdoor",
    },
    {
      src: "/photography/master-bedroom.webp",
      alt: "Master bedroom suite with king-size bed, fresh strawberries, wine, and plush linen",
      caption: "Master Bedroom Suite",
      category: "Bedroom",
    },
    {
      src: "/photography/living-room.webp",
      alt: "Living room lounge with modern sofa, warm Aegean sunlight, and dining space",
      caption: "Daylight Living Lounge",
      category: "Living",
    },
    {
      src: "/photography/bathroom.webp",
      alt: "Stone bathroom vanity with ceramic vessel sink and illuminated LED mirror",
      caption: "Modern Stone Bathroom",
      category: "Bathroom",
    },
    {
      src: "/photography/second-bedroom.webp",
      alt: "Second bedroom with single bed, botanical framed prints, and warm lighting",
      caption: "Second Bedroom",
      category: "Bedroom",
    },
    {
      src: "/photography/terrace.webp",
      alt: "Sunny terrace lounge seating with morning light and pine views",
      caption: "Terrace Morning View",
      category: "Outdoor",
    },
  ];

  return (
    <section id="gallery" className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 border-t border-white/10" aria-label="Editorial Gallery">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-14">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Moments from the Suite
            </h2>
            <p className="font-sans text-sm sm:text-base text-stone-400 font-light leading-relaxed">
              Grounded in Aegean light, natural textures, and the calm rhythm of coastal Vrontados.
            </p>
          </div>

          <span className="text-xs font-sans text-stone-400 tracking-wider uppercase">
            6 Selected Photographs
          </span>
        </div>

        {/* Editorial Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {galleryItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              aria-label={`View ${item.caption} photograph`}
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-stone-900 cursor-pointer shadow-lg hover:border-white/20 transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
                <span className="font-serif text-white text-base tracking-wide font-normal">
                  {item.caption}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      <Lightbox
        items={galleryItems}
        currentIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        onNavigate={(newIdx) => setSelectedImageIndex(newIdx)}
      />
    </section>
  );
};
