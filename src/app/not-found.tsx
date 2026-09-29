import { Geologica, Inter } from "next/font/google";
import { NotFound } from "@/components/site/NotFound";
import "./globals.css";

const display = Geologica({ subsets: ["latin", "greek"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin", "greek"], variable: "--font-sans", display: "swap" });

export default function RootNotFound() {
  return <html lang="el" className={`${display.variable} ${sans.variable}`}>
    <body><NotFound /></body>
  </html>;
}
