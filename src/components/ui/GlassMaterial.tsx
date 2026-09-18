"use client";

import React from "react";

interface GlassMaterialProps {
  children: React.ReactNode;
  className?: string;
  variant?: "dock" | "card" | "modal" | "tag" | "header";
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassMaterial: React.FC<GlassMaterialProps> = ({
  children,
  className = "",
  variant = "card",
  onClick,
  style,
}) => {
  const variantStyles = {
    header:
      "bg-stone-950/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20",
    dock:
      "bg-stone-900/90 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] rounded-full px-4 py-2",
    card:
      "bg-stone-900/40 backdrop-blur-md border border-white/10 shadow-xl shadow-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-white/20 transition-all duration-300",
    modal:
      "bg-stone-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] rounded-3xl p-8",
    tag:
      "bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-full px-3 py-1 text-xs",
  };

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
