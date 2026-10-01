import Link from "next/link";
import { ArrowUp, EnvelopeSimple, FacebookLogo, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { guideIds } from "@/content/guides";
import { propertyData as property } from "@/content/property";
import { reviewStats } from "@/content/reviews";
import { fillCopy, formatScore, getStayCopy, type StayLocale } from "@/content/stay-copy";
import type { ContactChannels } from "@/lib/contact";
import { guide } from "@/lib/guides";
import { AirbnbMark, BookingMark, StarMark } from "../icons";
import { ChatButton } from "../SiteShell";
import { LocalTime } from "./LocalTime";
import ui from "../ui.module.css";
import s from "./footer.module.css";

const locales = ["el", "en", "tr"] as const;

export function Footer({ locale, contact }: { locale: StayLocale; contact: ContactChannels }) {
  const copy = getStayCopy(locale);
  const c = copy.footer;
  const channels = [
    contact.whatsapp && { href: contact.whatsapp, label: "WhatsApp", Icon: WhatsappLogo },
    contact.email && { href: `mailto:${contact.email}`, label: contact.email, Icon: EnvelopeSimple },
    contact.instagram && { href: contact.instagram, label: "Instagram", Icon: InstagramLogo },
    contact.facebook && { href: contact.facebook, label: "Facebook", Icon: FacebookLogo },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof WhatsappLogo }[];
  const sections = [
    { href: "#suite", label: copy.suite },
    { href: "#family", label: copy.family.eyebrow },
    { href: "#gallery", label: copy.gallery },
    { href: "#location", label: copy.location },
    { href: "#information", label: copy.faq.title },
  ];

  return <footer className={s.footer}>
    <div className={`${ui.container} ${s.inner}`}>
      <div className={s.top}>
        <p>{property.name} · {copy.hero.place}</p>
        <LocalTime locale={locale} label={c.localTime} />
      </div>

      <div className={s.columns} data-stagger>
        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact">{c.contact}</h2>
          <ChatButton mode="host" className={s.chat}>{c.chat}<span aria-hidden="true">→</span></ChatButton>
          <p className={s.note}>{c.platformMessage}</p>
          {channels.length > 0 && <ul className={s.links}>
            {channels.map(({ href, label, Icon }) => <li key={href}>
              <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer"><Icon weight="light" aria-hidden="true" />{label}</a>
            </li>)}
          </ul>}
        </section>

        <section aria-labelledby="footer-book">
          <h2 id="footer-book">{c.book}</h2>
          <ul className={s.platforms}>
            <li><a href={property.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer">
              <AirbnbMark className={s.brand} style={{ color: "#ff385c" }} /><span>Airbnb</span>
              <span className={s.score}><StarMark className={s.star} />{formatScore(reviewStats.airbnb.score, locale)}</span>
            </a></li>
            <li><a href={property.bookingLinks.booking} target="_blank" rel="noopener noreferrer">
              <BookingMark className={s.brand} style={{ color: "#003b95" }} /><span>Booking.com</span>
              <span className={s.score}><StarMark className={s.star} />{formatScore(reviewStats.booking.score, locale)}</span>
            </a></li>
          </ul>
        </section>

        <section aria-labelledby="footer-find">
          <h2 id="footer-find">{c.find}</h2>
          <address className={s.address}>
            {fillCopy(c.address, { postal: property.location.postalCode })}<br />
            {fillCopy(c.toSea, { distance: property.distanceToSeaMeters })}
          </address>
          <a className={ui.textLink} href={property.location.googleMapsUrl} target="_blank" rel="noopener noreferrer">{c.maps} <span aria-hidden="true">↗</span></a>
          <ul className={s.guides}>
            {guideIds.map(id => <li key={id}><Link href={`/${locale}/${id}`}>{guide(id, locale).label}</Link></li>)}
          </ul>
        </section>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore">{c.explore}</h2>
          <ul className={s.sections}>
            {sections.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
          </ul>
        </nav>
      </div>

      <div className={s.bar}>
        <span>© {new Date().getFullYear()} {property.name}. {c.rights}.</span>
        <span>{c.registration} {property.licenseNumber}</span>
        <Link href={`/${locale}/privacy`}>{c.privacy}</Link>
        <nav className={s.locales} aria-label={copy.common.language}>
          {locales.map(code => <Link key={code} href={`/${code}`} lang={code} hrefLang={code} aria-current={code === locale ? "page" : undefined}>{code.toUpperCase()}</Link>)}
        </nav>
        <a href="#home" className={s.toTop} aria-label={c.top}><ArrowUp weight="light" aria-hidden="true" /></a>
      </div>
    </div>

    <p className={s.wordmark} aria-hidden="true" data-split-chars>Mastiha</p>
  </footer>;
}
