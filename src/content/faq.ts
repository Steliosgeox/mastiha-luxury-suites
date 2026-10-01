import { nearbyPlaces } from "./neighbourhood";
import { propertyData as property } from "./property";
import { fillCopy, getStayCopy, type StayLocale } from "./stay-copy";

function distanceTo(id: string): number {
  const place = nearbyPlaces.find(item => item.id === id);
  if (!place) throw new Error(`The FAQ quotes a nearby place that no longer exists: ${id}`);
  return place.distanceMeters;
}

/** Numbers the answers quote, from the same data the page shows elsewhere. */
const values = {
  guests: property.maxGuests,
  distance: property.distanceToSeaMeters,
  market: distanceTo("market-mou"),
  ab: distanceTo("ab"),
  pharmacy: distanceTo("kavoura"),
  bakery: distanceTo("kloura"),
};

/**
 * The questions and answers exactly as the page shows them. The structured data, the
 * assistant's facts and llms.txt use this too, so every reader gets the same answers.
 */
export function faqItems(locale: StayLocale): { q: string; a: string }[] {
  return getStayCopy(locale).faq.items.map(item => ({ q: item.q, a: fillCopy(item.a, values) }));
}
