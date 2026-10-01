import { guideChrome, guides, type Guide, type GuideId } from "@/content/guides";
import { nearbyPlaces } from "@/content/neighbourhood";
import { propertyData as property } from "@/content/property";
import { fillCopy, type StayLocale } from "@/content/stay-copy";

function distanceTo(id: string): number {
  const place = nearbyPlaces.find(item => item.id === id);
  if (!place) throw new Error(`A guide quotes a nearby place that no longer exists: ${id}`);
  return place.distanceMeters;
}

/** Numbers the guides quote, from the property and neighbourhood data. */
const values = {
  distance: property.distanceToSeaMeters,
  area: property.areaM2,
  guests: property.maxGuests,
  carHire: distanceTo("eko"),
};

/** A guide with every {placeholder} filled in, as the page and its metadata show it. */
export function guide(id: GuideId, locale: StayLocale): Guide {
  const raw = guides[id][locale];
  const fill = (text: string) => fillCopy(text, values);
  return {
    ...raw,
    title: fill(raw.title),
    description: fill(raw.description),
    intro: fill(raw.intro),
    sections: raw.sections.map(section => ({ ...section, heading: fill(section.heading), body: section.body.map(fill) })),
  };
}

export function chrome(locale: StayLocale) {
  const c = guideChrome[locale];
  return { ...c, stayTitle: fillCopy(c.stayTitle, values), stayBody: fillCopy(c.stayBody, values) };
}
