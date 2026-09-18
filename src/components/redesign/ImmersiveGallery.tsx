"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { Captions, Counter, Fullscreen, Thumbnails, Zoom } from "yet-another-react-lightbox/plugins";
import { trackEvent } from "@/lib/analytics";
import styles from "./ImmersiveGallery.module.css";

type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  description?: string;
  priority?: boolean;
};

const items: GalleryItem[] = [
  {
    src: "/photography/living-room.webp",
    alt: "Living room at Mastiha Luxury Suites",
    title: "Living room",
    description: "Natural light, open living and dining.",
    priority: true,
  },
  {
    src: "/photography/master-bedroom.webp",
    alt: "Master bedroom at Mastiha Luxury Suites",
    title: "Master bedroom",
    description: "A calm private bedroom with a king bed.",
  },
  {
    src: "/sequence/desktop/frame-0028.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Inside Mastiha",
  },
  {
    src: "/photography/second-bedroom.webp",
    alt: "Second bedroom at Mastiha Luxury Suites",
    title: "Second bedroom",
  },
  {
    src: "/sequence/desktop/frame-0044.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Apartment film",
  },
  {
    src: "/photography/bathroom.webp",
    alt: "Bathroom at Mastiha Luxury Suites",
    title: "Bathroom",
  },
  {
    src: "/sequence/desktop/frame-0060.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Apartment film",
  },
  {
    src: "/photography/hero.webp",
    alt: "Terrace at Mastiha Luxury Suites",
    title: "Terrace",
    description: "A private outdoor place for slow mornings and evenings.",
  },
  {
    src: "/sequence/desktop/frame-0076.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Apartment film",
  },
  {
    src: "/sequence/desktop/frame-0092.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Apartment film",
  },
  {
    src: "/sequence/desktop/frame-0108.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Apartment film",
  },
  {
    src: "/sequence/desktop/frame-0118.avif",
    alt: "Still from the Mastiha Luxury Suites apartment film",
    title: "Apartment film",
  },
];

export function ImmersiveGallery() {
  const [index, setIndex] = useState<number | null>(null);

  const slides = useMemo(
    () =>
      items.map((item) => ({
        src: item.src,
        alt: item.alt,
        title: item.title,
        description: item.description,
      })),
    []
  );

  const open = (nextIndex: number) => {
    setIndex(nextIndex);
    trackEvent("gallery_open", { index: nextIndex, src: items[nextIndex].src });
  };

  return (
    <section id="gallery" className={styles.gallery} aria-labelledby="gallery-title">
      <div className={styles.topline}>
        <span>03 · Photographs</span>
        <span>{items.length} views · originals + film stills</span>
      </div>

      <div className={styles.heading}>
        <h2 id="gallery-title">Inside<br />Mastiha.</h2>
        <div>
          <p>
            A slower look at the suite. Tap any frame for the full-screen collection.
          </p>
          <button type="button" onClick={() => open(0)} className={styles.viewAll}>
            View the full gallery <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>

      <div className={styles.editorialGrid}>
        {items.slice(0, 9).map((item, itemIndex) => (
          <button
            type="button"
            className={styles.frame}
            key={item.src}
            onClick={() => open(itemIndex)}
            aria-label={`Open gallery at ${item.title}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={item.priority}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 42vw"
              className={styles.image}
            />
            <span className={styles.frameMeta}>
              <span>{String(itemIndex + 1).padStart(2, "0")}</span>
              <span>{item.title}</span>
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        open={index !== null}
        close={() => setIndex(null)}
        index={index ?? 0}
        slides={slides}
        plugins={[Captions, Counter, Fullscreen, Thumbnails, Zoom]}
        carousel={{ finite: false, preload: 2 }}
        animation={{ fade: 300, swipe: 420 }}
        controller={{ closeOnBackdropClick: true }}
        captions={{ descriptionTextAlign: "center" }}
        counter={{ container: { style: { top: 12, left: 12 } } }}
        thumbnails={{ position: "bottom", width: 82, height: 58, gap: 8 }}
        on={{
          view: ({ index: viewedIndex }) =>
            trackEvent("gallery_image_view", {
              index: viewedIndex,
              src: items[viewedIndex]?.src,
            }),
        }}
        styles={{
          container: { backgroundColor: "rgba(14, 18, 15, .97)" },
          slide: { padding: "clamp(16px, 3vw, 48px)" },
          captionsTitleContainer: {
            background: "linear-gradient(180deg, transparent, rgba(14,18,15,.82))",
          },
        }}
      />
    </section>
  );
}
