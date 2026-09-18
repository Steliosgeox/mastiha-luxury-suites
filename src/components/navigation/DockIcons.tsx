"use client";

import React from "react";
import {
  House,
  Bed,
  Images,
  MapPin,
  CalendarCheck,
  Drop,
  Waves,
  Car,
  WifiHigh,
  ThermometerSimple,
  CookingPot,
  Coffee,
  Television,
  Door,
  Baby,
  SpeakerHigh,
  Star,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkle,
  X,
  Check,
  Eye,
  Armchair,
} from "@phosphor-icons/react";

interface IconProps {
  className?: string;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

export const IconHome: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <House size={size} weight={weight} className={className} />
);

export const IconSuite: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Bed size={size} weight={weight} className={className} />
);

export const IconGallery: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Images size={size} weight={weight} className={className} />
);

export const IconLocation: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <MapPin size={size} weight={weight} className={className} />
);

export const IconBook: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <CalendarCheck size={size} weight={weight} className={className} />
);

export const IconMastihaDrop: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16, weight = "fill" }) => (
  <Drop size={size} weight={weight} className={className} />
);

export const IconBeach: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Waves size={size} weight={weight} className={className} />
);

export const IconSeaView: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Waves size={size} weight={weight} className={className} />
);

export const IconParking: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Car size={size} weight={weight} className={className} />
);

export const IconWifi: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <WifiHigh size={size} weight={weight} className={className} />
);

export const IconClimate: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <ThermometerSimple size={size} weight={weight} className={className} />
);

export const IconKitchen: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <CookingPot size={size} weight={weight} className={className} />
);

export const IconEspresso: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Coffee size={size} weight={weight} className={className} />
);

export const IconWasher: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Armchair size={size} weight={weight} className={className} />
);

export const IconTV: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Television size={size} weight={weight} className={className} />
);

export const IconTerrace: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <SunHorizonIcon className={className} size={size} />
);

export const IconSoundproof: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <SpeakerHigh size={size} weight={weight} className={className} />
);

export const IconFamily: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Baby size={size} weight={weight} className={className} />
);

export const IconEntrance: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Door size={size} weight={weight} className={className} />
);

export const IconStar: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16, weight = "fill" }) => (
  <Star size={size} weight={weight} className={className} />
);

export const IconShield: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16, weight = "regular" }) => (
  <ShieldCheck size={size} weight={weight} className={className} />
);

export const IconCompass: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Compass size={size} weight={weight} className={className} />
);

export const IconArrowRight: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16, weight = "regular" }) => (
  <ArrowRight size={size} weight={weight} className={className} />
);

export const IconSparkle: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16, weight = "regular" }) => (
  <Sparkle size={size} weight={weight} className={className} />
);

export const IconClose: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <X size={size} weight={weight} className={className} />
);

export const IconCheck: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16, weight = "bold" }) => (
  <Check size={size} weight={weight} className={className} />
);

export const IconView: React.FC<IconProps> = ({ className = "w-5 h-5", size = 20, weight = "regular" }) => (
  <Eye size={size} weight={weight} className={className} />
);

// Fallback terrace/sun icon using Waves + Compass or custom clean Phosphor
function SunHorizonIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return <Waves size={size} weight="regular" className={className} />;
}
