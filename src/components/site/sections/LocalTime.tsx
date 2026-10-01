"use client";

import { useEffect, useState } from "react";
import type { StayLocale } from "@/content/stay-copy";
import s from "./footer.module.css";

const formats = { el: "el-GR", en: "en-GB", tr: "tr-TR" } as const;

/** The current time on Chios, so guests abroad can tell when they'll get a reply. */
export function LocalTime({ locale, label }: { locale: StayLocale; label: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat(formats[locale], { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Athens" });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 15_000);
    return () => clearInterval(timer);
  }, [locale]);
  return <p className={s.clock}>
    <span className={s.pulse} aria-hidden="true" />
    {label} <time suppressHydrationWarning>{time ?? "--:--"}</time>
  </p>;
}
