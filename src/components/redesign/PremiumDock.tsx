"use client";

import Image from "next/image";
import styles from "./PremiumDock.module.css";

type IconName = "home" | "suite" | "gallery" | "location" | "booking";

const links: { name: Exclude<IconName, "booking">; label: string; target: string }[] = [
  { name: "home", label: "Home", target: "#home" },
  { name: "suite", label: "The suite", target: "#suite" },
  { name: "gallery", label: "Gallery", target: "#gallery" },
  { name: "location", label: "Location", target: "#location" },
];

function DockImage({ name, booking = false }: { name: IconName; booking?: boolean }) {
  // Use a new URL for the repaired bitmap to avoid the old optimized-image cache.
  const filename = name === "suite" ? "suite-repaired" : name;
  return (
    <Image
      src={`/ui/dock/${filename}.webp`}
      alt=""
      width={booking ? 28 : 40}
      height={booking ? 28 : 40}
      className={booking ? styles.bookingIcon : styles.icon}
      unoptimized
      draggable={false}
      aria-hidden="true"
    />
  );
}

export function PremiumDock({
  onNavigate,
  onBook,
}: {
  onNavigate: (target: string) => void;
  onBook: () => void;
}) {
  return (
    <nav className={styles.dock} aria-label="Quick navigation" data-testid="mastiha-dock">
      {links.map(({ name, label, target }) => (
        <button
          key={name}
          type="button"
          className={styles.button}
          aria-label={label}
          title={label}
          onClick={() => onNavigate(target)}
        >
          <DockImage name={name} />
        </button>
      ))}
      <button type="button" className={styles.book} aria-label="Book your stay" onClick={onBook}>
        <DockImage name="booking" booking />
        <span className={styles.label}>Book</span>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </button>
    </nav>
  );
}
