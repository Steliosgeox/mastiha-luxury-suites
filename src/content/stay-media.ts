import catalogue from './stay-media.generated.json';
import type { StayLocale } from './stay-copy';

export type PhotoId = 'living' | 'master' | 'second' | 'bathroom' | 'terrace' | 'kitchen' | 'lounge' | 'table' | 'kitchen-wide' | 'espresso' | 'desk' | 'master-wide' | 'crib' | 'second-wide' | 'basin' | 'shower' | 'laundry' | 'balcony' | 'arrival' | 'coast' | 'sunrise' | 'windmills' | 'beach' | 'keys';
export type PhotoCategory = 'living' | 'kitchen' | 'bedrooms' | 'bathroom' | 'outdoors' | 'neighbourhood';
export type StayMedia = Omit<(typeof catalogue)[number], 'id' | 'category'> & { id: PhotoId; category: PhotoCategory };
// Local files are visually reviewed exports of the owner's public Airbnb listing.
// Source URLs, original and output hashes are retained; no runtime scraping/hotlinking.
export const stayPhotos = catalogue as StayMedia[];
export function stayPhoto(id: PhotoId): StayMedia {
  const photo = stayPhotos.find(item => item.id === id);
  if (!photo) throw new Error(`Unknown photograph: ${id}`);
  return photo;
}
export function photoCaption(id: PhotoId, locale: StayLocale): string {
  return stayPhoto(id).captions[locale];
}
export const tourPhotos = (['kitchen-wide','master-wide','second-wide','shower','terrace'] as const).map(stayPhoto);
