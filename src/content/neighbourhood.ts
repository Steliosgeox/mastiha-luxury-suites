import type { StayLocale } from './stay-copy';

export type NearbyCategory = 'groceries' | 'coffee' | 'bakery' | 'food' | 'pharmacy' | 'transport';
export type NearbyPlace = { id: string; name: string; category: NearbyCategory; distanceMeters: number; mapsUrl?: string };
/** Owner-supplied distances: approximate proximity, not measured walking routes. */
export const nearbyPlaces: readonly NearbyPlace[] = [
  { id: 'market-mou', name: 'Market mou · coffee & Market point', category: 'groceries', distanceMeters: 80, mapsUrl: 'https://maps.app.goo.gl/a9XJkEhRbPwUGbNR6' },
  { id: 'ab', name: 'ΑΒ Βασιλόπουλος', category: 'groceries', distanceMeters: 220, mapsUrl: 'https://maps.app.goo.gl/bqQ9m7JJrfbufoPJ6' },
  { id: 'market-in', name: 'Market in', category: 'groceries', distanceMeters: 300, mapsUrl: 'https://maps.app.goo.gl/bKru8hth7cpZvdVs7' },
  { id: 'kloura', name: 'Κλούρα Ε. Βασιλική', category: 'bakery', distanceMeters: 270 },
  { id: 'zefyros', name: 'ZEFYROS all time cafe', category: 'coffee', distanceMeters: 250, mapsUrl: 'https://maps.app.goo.gl/FCvEAodAn165qUnF7' },
  { id: 'verykoko', name: 'Βερύκοκο · cafe & beach bar', category: 'coffee', distanceMeters: 600, mapsUrl: 'https://maps.app.goo.gl/BjWpw3KZ79yo1Zmk7' },
  { id: 'syrris', name: 'Συρρής Bakery · bakery & cafe', category: 'bakery', distanceMeters: 650 },
  { id: 'anastasis', name: 'Στάση στου Αναστάση', category: 'food', distanceMeters: 80, mapsUrl: 'https://maps.app.goo.gl/rycYGm3VB2DzkMSbA' },
  { id: 'psistiri', name: 'Ψηστήρι', category: 'food', distanceMeters: 250, mapsUrl: 'https://maps.app.goo.gl/V9gj68GfKaK8rsq97' },
  { id: 'kavoura', name: 'Κάβουρα Ειρήνη', category: 'pharmacy', distanceMeters: 50, mapsUrl: 'https://maps.app.goo.gl/xdgfKRNyAuCaU9cm7' },
  { id: 'kypriadis', name: 'Κυπριάδης Ευστράτιος', category: 'pharmacy', distanceMeters: 50, mapsUrl: 'https://maps.app.goo.gl/ZPGKQtFLrjfPsqTA9' },
  { id: 'eko', name: 'Ζιγλής Νικόλαος EKO · Rent a car', category: 'transport', distanceMeters: 200, mapsUrl: 'https://maps.app.goo.gl/vB3XYPLcuSkB7sLbA' },
  { id: 'public-parking', name: 'Δημόσιο Parking', category: 'transport', distanceMeters: 90 },
];
export const neighbourhoodCopy: Record<StayLocale, {
  eyebrow: string; title: string; intro: string; all: string; count: string; map: string; note: string;
  noMap: string; publicParking: string; categories: Record<NearbyCategory, string>;
}> = {
  el: { eyebrow: 'Κοντά στο σπίτι', title: 'Η γειτονιά μας', intro: 'Σούπερ μάρκετ, φούρνοι, καφέ, φαρμακεία και φαγητό, όλα σε κοντινή απόσταση με τα πόδια.', all: 'Όλα', count: 'μέρη', map: 'Χάρτης', noMap: 'Ρωτήστε μας πώς θα πάτε', publicParking: 'Δημόσιο πάρκινγκ', note: 'Οι αποστάσεις είναι κατά προσέγγιση. Ελέγξτε το ωράριο πριν πάτε. Το δημόσιο πάρκινγκ δεν είναι το ιδιωτικό μας.', categories: { groceries: 'Σούπερ μάρκετ', coffee: 'Καφές', bakery: 'Φούρνοι', food: 'Φαγητό', pharmacy: 'Φαρμακεία', transport: 'Αυτοκίνητο & πάρκινγκ' } },
  en: { eyebrow: 'Close to the apartment', title: 'Our neighbourhood', intro: 'Supermarkets, bakeries, cafés, pharmacies and places to eat, all within walking distance.', all: 'All', count: 'places', map: 'Map', noMap: 'Ask us for directions', publicParking: 'Public car park', note: 'Distances are approximate. Check opening hours before you go. The public car park is separate from our private parking.', categories: { groceries: 'Supermarkets', coffee: 'Coffee', bakery: 'Bakeries', food: 'Food', pharmacy: 'Pharmacies', transport: 'Car & parking' } },
  tr: { eyebrow: 'Dairenin yakınında', title: 'Mahallemiz', intro: 'Market, fırın, kafe, eczane ve yemek yerleri; hepsi yürüme mesafesinde.', all: 'Tümü', count: 'yer', map: 'Harita', noMap: 'Yol tarifi için bize sorun', publicParking: 'Halka açık otopark', note: 'Mesafeler yaklaşıktır. Gitmeden önce çalışma saatlerini kontrol edin. Halka açık otopark bizim özel otoparkımızdan ayrıdır.', categories: { groceries: 'Marketler', coffee: 'Kahve', bakery: 'Fırınlar', food: 'Yemek', pharmacy: 'Eczaneler', transport: 'Araç & otopark' } },
};
export const nearbyCategories = ['groceries', 'coffee', 'bakery', 'food', 'pharmacy', 'transport'] as const;
