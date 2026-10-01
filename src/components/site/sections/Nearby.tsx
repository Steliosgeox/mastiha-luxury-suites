"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Basket, Bread, Car, Coffee, ForkKnife, Pill } from "@phosphor-icons/react";
import { nearbyCategories, nearbyPlaces, neighbourhoodCopy, type NearbyCategory } from "@/content/neighbourhood";
import type { StayLocale } from "@/content/stay-copy";
import ui from "../ui.module.css";
import s from "./nearby.module.css";

const icons = { groceries: Basket, coffee: Coffee, bakery: Bread, food: ForkKnife, pharmacy: Pill, transport: Car };

/** Owner-supplied places around the apartment, with approximate walking distances. */
export function Nearby({ locale }: { locale: StayLocale }) {
  const [category, setCategory] = useState<NearbyCategory | "all">("all");
  const c = neighbourhoodCopy[locale];
  const listId = useId();
  const places = nearbyPlaces
    .filter(place => category === "all" || place.category === category)
    .slice().sort((a, b) => a.distanceMeters - b.distanceMeters);

  return <section id="nearby" className={`${ui.container} ${s.nearby}`} aria-labelledby="nearby-title" data-testid="nearby-places">
    <header className={s.header}>
      <div>
        <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
        <h2 id="nearby-title" className={ui.heading} data-split>{c.title}</h2>
      </div>
      <p className={ui.body}>{c.intro}</p>
    </header>

    <div className={s.filters} role="group" aria-label={c.title}>
      {(["all", ...nearbyCategories] as const).map(id => <button type="button" key={id} aria-pressed={category === id} aria-controls={listId} onClick={() => setCategory(id)}>
        {id === "all" ? c.all : c.categories[id]}
      </button>)}
    </div>
    <p className={s.count} role="status">{places.length} {c.count}</p>

    <ul id={listId} className={s.list}>
      {places.map(place => {
        const Icon = icons[place.category];
        const name = place.id === "public-parking" ? c.publicParking : place.name;
        const row = <>
          <Icon className={s.icon} weight="light" aria-hidden="true" />
          <span className={s.identity}><small>{c.categories[place.category]}</small><strong>{name}</strong></span>
          <span className={s.distance}>≈ {place.distanceMeters}<small> m</small></span>
          {place.mapsUrl ? <ArrowUpRight className={s.arrow} aria-hidden="true" /> : <span className={s.arrow} aria-hidden="true" />}
        </>;
        return <li key={place.id} data-place-id={place.id}>
          {place.mapsUrl
            ? <a className={s.row} href={place.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`${name}, ${place.distanceMeters} m · ${c.map}`}>{row}</a>
            : <div className={s.row} title={c.noMap}>{row}</div>}
        </li>;
      })}
    </ul>
    <p className={s.note}>{c.note}</p>
  </section>;
}
