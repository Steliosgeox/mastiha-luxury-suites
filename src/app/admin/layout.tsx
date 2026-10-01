import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Commissioner } from "next/font/google";
import "../globals.css";
import "@/components/admin/workroom.css";

// Elite Memoriz's workroom typeface.
const admin = Commissioner({ subsets: ["latin", "greek"], variable: "--font-admin", display: "swap" });

export const metadata: Metadata = {
  title: "Συζητήσεις · Mastiha",
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Mastiha", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = { themeColor: "#f2f5f8", viewportFit: "cover" };

/** The host's portal. A separate root layout: no public site chrome, never indexed. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="el" className={admin.variable}>
    <body className="mls-admin-body">{children}</body>
  </html>;
}
