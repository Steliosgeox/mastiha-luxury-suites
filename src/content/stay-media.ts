import catalogue from './stay-media.generated.json';
import type { StayLocale } from './stay-copy';

export type PhotoId = 'living' | 'lounge' | 'sofa-bed' | 'desk' | 'kitchen' | 'kitchen-wide' | 'cookware' | 'appliances' | 'master' | 'master-wide' | 'vanity' | 'second' | 'second-wide' | 'bathroom-wide' | 'shower' | 'basin' | 'hairdryer' | 'laundry' | 'kids-corner' | 'toys' | 'playpen' | 'cot' | 'high-chair' | 'terrace' | 'balcony-wide' | 'balcony' | 'arrival' | 'keys' | 'coast' | 'sunrise' | 'windmills' | 'sailor' | 'rocket-war' | 'beach' | 'crib';
export type PhotoCategory = 'living' | 'kitchen' | 'bedrooms' | 'bathroom' | 'outdoors' | 'neighbourhood' | 'family';
export type StayMedia = Omit<(typeof catalogue)[number], 'id' | 'category'> & { id: PhotoId; category: PhotoCategory };
// Local files are reviewed exports of the owner's public Airbnb and Booking.com listings.
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
export const tourPhotos = (['kitchen-wide','master','second-wide','bathroom-wide','balcony-wide'] as const).map(stayPhoto);
