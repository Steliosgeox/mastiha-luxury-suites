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
  el: { eyebrow: 'Ο Βροντάδος, από κοντά', title: 'Στη γειτονιά μας…', intro: 'Για τον πρώτο καφέ, τα καθημερινά ψώνια ή κάτι νόστιμο στο τέλος της μέρας.', all: 'Όλα', count: 'σημεία', map: 'Άνοιγμα στο Google Maps', noMap: "Ρωτήστε μας για οδηγίες", publicParking: 'Δημόσιος χώρος στάθμευσης', note: "Ενδεικτικές αποστάσεις από το Mastiha. Ελέγξτε το ωράριο πριν από την επίσκεψή σας. Το δημόσιο πάρκινγκ είναι ξεχωριστό από το ιδιωτικό μας.", categories: { groceries: 'Αγορές', coffee: 'Καφές & παραλία', bakery: 'Αρτοποιεία', food: 'Φαγητό', pharmacy: 'Φαρμακεία', transport: 'Μετακίνηση & πάρκινγκ' } },
  en: { eyebrow: 'Vrontados, close by', title: 'In our neighbourhood.', intro: 'Your first coffee, everyday essentials, or something good to eat at the end of the day.', all: 'All', count: 'places', map: 'Open in Google Maps', noMap: "Ask us for directions", publicParking: 'Public parking', note: "Approximate distances from Mastiha. Check opening hours before visiting. The public parking area is separate from our private parking.", categories: { groceries: 'Groceries', coffee: 'Coffee & beach', bakery: 'Bakeries', food: 'Food', pharmacy: 'Pharmacies', transport: 'Transport & parking' } },
  tr: { eyebrow: 'Yakınınızdaki Vrontados', title: 'Mahallemizde…', intro: 'İlk kahveniz, günlük alışverişiniz veya günün sonunda güzel bir yemek için.', all: 'Tümü', count: 'yer', map: 'Google Maps’te aç', noMap: "Yol tarifi için bize sorun", publicParking: 'Halka açık otopark', note: "Mastiha’dan yaklaşık mesafeler. Gitmeden önce çalışma saatlerini kontrol edin. Halka açık otopark, özel otoparkımızdan ayrıdır.", categories: { groceries: 'Marketler', coffee: 'Kahve & plaj', bakery: 'Fırınlar', food: 'Yemek', pharmacy: 'Eczaneler', transport: 'Ulaşım & otopark' } },
};
export const nearbyCategories = ['groceries', 'coffee', 'bakery', 'food', 'pharmacy', 'transport'] as const;
