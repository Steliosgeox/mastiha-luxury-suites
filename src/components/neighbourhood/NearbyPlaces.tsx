'use client';
import { useId, useState } from 'react';
import { ArrowUpRight, ShoppingBasket, Coffee, Croissant, Utensils, Cross, Car } from 'lucide-react';
import { nearbyPlaces, nearbyCategories, neighbourhoodCopy, type NearbyCategory } from '@/content/neighbourhood';
import type { StayLocale } from '@/content/stay-copy';
import s from './NearbyPlaces.module.css';

const icons = { groceries: ShoppingBasket, coffee: Coffee, bakery: Croissant, food: Utensils, pharmacy: Cross, transport: Car };
export function NearbyPlaces({ locale }: { locale: StayLocale }) {
  const [category, setCategory] = useState<NearbyCategory | 'all'>('all');
  const c = neighbourhoodCopy[locale];
  const listId = useId();
  const places = nearbyPlaces.filter(p => category === 'all' || p.category === category);
  return <section id="nearby" className={s.section} aria-labelledby="nearby-title" data-testid="nearby-places">
    <header className={s.heading}>
      <div><p className={s.eyebrow}>{c.eyebrow}</p><h2 id="nearby-title">{c.title}</h2></div>
      <p className={s.intro}>{c.intro}</p>
    </header>
    <div className={s.filters} role="group" aria-label={c.title}>
      {(['all', ...nearbyCategories] as const).map(id => <button type="button" key={id} onClick={() => setCategory(id)} aria-pressed={category === id} aria-controls={listId}>{id === 'all' ? c.all : c.categories[id]}</button>)}
    </div>
    <p className={s.count} role="status" aria-live="polite">{places.length} {c.count}</p>
    <ul id={listId} className={s.list}>
      {places.map(place => {
        const Icon = icons[place.category];
        const name = place.id === 'public-parking' ? c.publicParking : place.name;
        const content = <><Icon className={s.icon} aria-hidden="true" strokeWidth={1.45}/><span className={s.identity}><small>{c.categories[place.category]}</small><strong>{name}</strong></span><span className={s.distance}>≈ {place.distanceMeters}<small> m</small></span>{place.mapsUrl ? <ArrowUpRight className={s.arrow} aria-hidden="true" size={18}/> : <span className={s.emptyArrow} aria-hidden="true"/>}</>;
        return <li key={place.id} data-place-id={place.id}>{place.mapsUrl ? <a className={s.row} href={place.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`${name}, ${place.distanceMeters} m · ${c.map}`}>{content}</a> : <div className={s.row} title={c.noMap}>{content}</div>}</li>;
      })}
    </ul>
    <p className={s.note}>{c.note}</p>
  </section>;
}
