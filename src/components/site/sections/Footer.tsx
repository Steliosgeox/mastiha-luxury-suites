import Link from "next/link";
import { ChatCircleDots, FacebookLogo, InstagramLogo, WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { propertyData as property } from "@/content/property";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { ASSISTANT_COPY } from "@/content/assistant-copy";
import type { ContactChannels } from "@/lib/contact";
import { ChatButton } from "../SiteShell";
import ui from "../ui.module.css";
import s from "./footer.module.css";

export function Footer({ locale, contact }: { locale: StayLocale; contact: ContactChannels }) {
  const c = getStayCopy(locale).footer;
  const links = [
    contact.facebook && { href: contact.facebook, label: "Facebook", Icon: FacebookLogo },
    contact.instagram && { href: contact.instagram, label: "Instagram", Icon: InstagramLogo },
    contact.whatsapp && { href: contact.whatsapp, label: "WhatsApp", Icon: WhatsappLogo },
    contact.email && { href: `mailto:${contact.email}`, label: contact.email, Icon: EnvelopeSimple },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof FacebookLogo }[];

  return <footer className={`${ui.container} ${s.footer}`}>
    <p className={s.wordmark}>{property.name}</p>
    <nav className={s.contact} aria-label={c.contact}>
      <ChatButton className={s.link}><ChatCircleDots weight="light" aria-hidden="true" />{ASSISTANT_COPY[locale].contactButton}</ChatButton>
      {links.map(({ href, label, Icon }) => <a key={href} className={s.link} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer"><Icon weight="light" aria-hidden="true" />{label}</a>)}
    </nav>
    <div className={s.meta}>
      <span>{c.place}</span>
      <span>{c.registration} {property.licenseNumber}</span>
      <Link href={`/${locale}/privacy`}>{c.privacy}</Link>
      <a href="#home">{c.top} ↑</a>
    </div>
  </footer>;
}
