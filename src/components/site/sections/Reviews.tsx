import { propertyData as property } from "@/content/property";
import { reviewStats } from "@/content/reviews";
import { fillCopy, formatDate, formatScore, getStayCopy, type StayLocale } from "@/content/stay-copy";
import { AirbnbMark, BookingMark, StarMark } from "../icons";
import ui from "../ui.module.css";
import s from "./reviews.module.css";

export function Reviews({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).reviews;
  const { airbnb, booking } = reviewStats;
  const cards = [
    { brand: "Airbnb", href: property.bookingLinks.airbnb, mark: <AirbnbMark className={s.mark} style={{ color: "#ff385c" }} />, score: airbnb.score, max: 5, label: c.airbnbBadge, count: airbnb.count, detail: c.airbnbDetail },
    { brand: "Booking.com", href: property.bookingLinks.booking, mark: <BookingMark className={s.mark} style={{ color: "#003b95" }} />, score: booking.score, max: 10, label: c.bookingLabel, count: booking.count, detail: `${c.bookingLocation} ${formatScore(booking.subScores.location, locale)}` },
  ];

  return <section id="reviews" className={s.reviews} aria-labelledby="reviews-title">
    <div className={`${ui.container} ${s.inner}`}>
      <div>
        <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
        <h2 id="reviews-title" className={ui.heading} data-split>{c.title}</h2>
        <p className={s.note}>{fillCopy(c.note, { date: formatDate(reviewStats.lastVerified, locale) })}</p>
      </div>
      <div className={s.cards} data-stagger>
        {cards.map(card => <a key={card.brand} className={s.card} href={card.href} target="_blank" rel="noopener noreferrer" aria-label={`${card.brand}: ${c.read}`}>
          <span className={s.brand}>{card.mark}{card.brand}<span aria-hidden="true">↗</span></span>
          <span className={s.score}>
            <StarMark className={s.star} />
            <strong data-testid="review-score" data-count={card.score} data-decimals="1">{formatScore(card.score, locale)}</strong>
            <small>/ {card.max}</small>
          </span>
          <span className={s.label}>{card.label}</span>
          <span className={s.meta}><span>{card.count} {c.reviews}</span><span>{card.detail}</span></span>
        </a>)}
      </div>
    </div>
  </section>;
}
