import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geologica, Inter } from "next/font/google";
import "../globals.css";

const display = Geologica({ subsets: ["latin", "greek"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin", "greek"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Συνομιλίες · Mastiha",
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Mastiha", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = { themeColor: "#f6f5f1", viewportFit: "cover" };

/** The host's inbox. A separate root layout: no public site chrome, never indexed. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="el" className={`${display.variable} ${sans.variable}`}>
    <body className="antialiased">{children}</body>
  </html>;
}
