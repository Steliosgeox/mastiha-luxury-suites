import type { AssistantProvider, AssistantRequest } from './contracts';
import { nearbyPlaces, neighbourhoodCopy, type NearbyCategory } from '@/content/neighbourhood';
import { propertyData } from '@/content/property';
import { listingCopy } from '@/content/listing-copy';
import { getContactChannels } from '@/lib/contact';

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/ı/g, 'i').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const copy = {
  en: { intro: "Welcome to Mastiha. I’m the automated property guide. Ask me about the apartment, staying with children, nearby places or how to book.", booking: 'Live availability, prices and booking changes are handled by the booking platforms. I cannot confirm a reservation or a rate.', home: 'Mastiha Luxury Suites is a private 75 m² home in Vrontados, Chios, for up to four guests, with two bedrooms and one bathroom. There is a king bed, a single bed and a sofa bed.', human: 'To reach the host now, use your Airbnb or Booking.com reservation conversation. The Representative button shows the available contact options. Nothing has been sent by this chat.', unknown: 'I don’t have confirmed information for that question. Please ask the host through your booking platform, or choose Representative. I cannot check live availability, make bookings or promise an answer time.', parking: "We offer private parking. There is also a separate public parking area approximately 90 m away. Ask us for directions; spaces cannot be reserved through this guide.", social: 'The property’s direct social accounts and WhatsApp number have not been connected yet. Please use the Airbnb or Booking.com listing to contact the host.', end: "Approximate distances from Mastiha. Check opening hours before you visit." },
  el: { intro: "Καλώς ήρθατε στο Mastiha. Είμαι ο αυτόματος οδηγός διαμονής. Ρωτήστε με για το διαμέρισμα, τις παροχές για παιδιά, τη γειτονιά ή την κράτησή σας.", booking: 'Η διαθεσιμότητα, οι τιμές και οι αλλαγές κρατήσεων επιβεβαιώνονται στις πλατφόρμες κράτησης. Δεν μπορώ να επιβεβαιώσω κράτηση ή τιμή.', home: 'Το Mastiha Luxury Suites είναι ιδιωτικό σπίτι 75 τ.μ. στον Βροντάδο της Χίου για έως τέσσερις επισκέπτες, με δύο υπνοδωμάτια και ένα μπάνιο. Διαθέτει king-size κρεβάτι, μονό κρεβάτι και καναπέ-κρεβάτι.', human: 'Για επικοινωνία με την οικοδέσποινα τώρα, χρησιμοποιήστε τη συνομιλία της κράτησής σας στο Airbnb ή το Booking.com. Το κουμπί Εκπρόσωπος εμφανίζει τους διαθέσιμους τρόπους επικοινωνίας. Δεν έχει σταλεί κάποιο μήνυμα από αυτή τη συνομιλία.', unknown: 'Δεν έχω επιβεβαιωμένη πληροφορία γι’ αυτή την ερώτηση. Ρωτήστε την οικοδέσποινα από την πλατφόρμα κράτησης ή επιλέξτε Εκπρόσωπος. Δεν ελέγχω ζωντανή διαθεσιμότητα, δεν κάνω κρατήσεις και δεν υπόσχομαι χρόνο απάντησης.', parking: "Διαθέτουμε ιδιωτικό πάρκινγκ. Υπάρχει επίσης ξεχωριστός δημόσιος χώρος στάθμευσης περίπου 90 μ. μακριά. Ρωτήστε μας για οδηγίες. Δεν γίνεται κράτηση θέσης από τον οδηγό.", social: 'Δεν έχουν συνδεθεί ακόμη τα επίσημα social accounts και το WhatsApp του καταλύματος. Επικοινωνήστε με την οικοδέσποινα από το Airbnb ή το Booking.com.', end: "Ενδεικτικές αποστάσεις από το Mastiha. Ελέγξτε το ωράριο πριν από την επίσκεψή σας." },
  tr: { intro: "Mastiha’ya hoş geldiniz. Otomatik konaklama rehberiyim. Daire, çocuklarla konaklama, yakındaki yerler veya rezervasyon hakkında sorabilirsiniz.", booking: 'Güncel müsaitlik, fiyatlar ve rezervasyon değişiklikleri rezervasyon platformlarında doğrulanır. Rezervasyon veya fiyat onaylayamam.', home: 'Mastiha Luxury Suites, Sakız adasının Vrontados bölgesinde, en fazla dört misafir için iki yatak odası ve bir banyosu olan 75 m² özel bir evdir. King yatak, tek kişilik yatak ve çekyat bulunur.', human: 'Ev sahibine şimdi ulaşmak için Airbnb veya Booking.com rezervasyon görüşmenizi kullanın. Temsilci düğmesi mevcut iletişim seçeneklerini gösterir. Bu sohbetten hiçbir mesaj gönderilmedi.', unknown: 'Bu soru için doğrulanmış bilgim yok. Ev sahibine rezervasyon platformundan sorun veya Temsilci’yi seçin. Güncel müsaitliği kontrol edemem, rezervasyon yapamam veya yanıt süresi vaat edemem.', parking: "Özel otoparkımız var. Yaklaşık 90 m uzakta ayrı bir halka açık otopark da bulunur. Yol tarifi için bize sorun; bu rehberden park yeri ayırtılamaz.", social: 'Tesisin resmi sosyal hesapları ve WhatsApp numarası henüz bağlanmadı. Ev sahibiyle Airbnb veya Booking.com üzerinden iletişime geçin.', end: "Mastiha’dan yaklaşık mesafeler. Gitmeden önce çalışma saatlerini kontrol edin." },
};
const categories: Array<[NearbyCategory, RegExp]> = [
  ['groceries', /market|supermarket|grocer|σουπερ|μαρκετ|ψων|αγορε/], ['coffee', /coffee|cafe|καφε|kahve|beach bar/],
  ['bakery', /baker|bread|αρτοποι|ψωμι|φουρν|fırın|firin/], ['food', /food|grill|eat|φαγη|ψητο|σουβλ|yemek/],
  ['pharmacy', /pharmac|φαρμακ|eczane/], ['transport', /rent|fuel|petrol|βενζιν|ενοικια|araba|benzin/],
];
/** No model, external tools or inferred facts. A future provider must retain this source contract. */
export const propertyGuide: AssistantProvider = {
  async answer(input: AssistantRequest) {
    const lang = input.locale; const c = copy[lang]; const q = normalize(input.messages.at(-1)!.content);
    const links = `[Airbnb](${propertyData.bookingLinks.airbnb}) · [Booking.com](${propertyData.bookingLinks.booking})`;
    let reply = c.unknown; let sources = ['property:owner-confirmed'];
    if (/representative|human|host|contact|εκπροσωπ|ανθρωπ|επικοινων|οικοδεσπ|temsilci|iletisim/.test(q)) reply = `${c.human}\n\n${links}`;
    else if (/facebook|instagram|whatsapp|social/.test(q)) {
      const channels = getContactChannels();
      const active = [['Facebook', channels.facebook], ['Instagram', channels.instagram], ['WhatsApp', channels.whatsapp]].filter(([, url]) => url);
      reply = active.length ? active.map(([label, url]) => `[${label}](${url})`).join(' · ') : `${c.social}\n\n${links}`;
    } else if (/price|availability|available|book|reserv|τιμ|διαθεσ|κρατησ|fiyat|rezerv|musait/.test(q) && !/cot|crib|baby|child|family|playpen|high chair|μωρ|κουν|παιδ|οικογεν|bebek|cocuk|aile/.test(q)) reply = `${c.booking}\n\n${links}`;
    else if (/baby|child|cot|crib|playpen|high chair|family|μωρ|παιδ|κουν|παρκοκρεβ|οικογεν|bebek|cocuk|aile/.test(q)) {
      reply = `${listingCopy(lang).familyBody}\n\n${listingCopy(lang).faqs.find(f => /children|παιδιά|Çocuklar/.test(f.q))?.a ?? ''}`;
      sources = ['booking:family-policy', 'listing:family-photographs'];
    } else if (/parking|park|παρκ|σταθμε/.test(q)) reply = c.parking;
    else {
      const exact = nearbyPlaces.filter(p => normalize(p.name).split(' ').some(word => word.length > 4 && !['coffee','market','bakery','point','beach'].includes(word) && q.includes(word)));
      const category = categories.find(([, pattern]) => pattern.test(q))?.[0];
      const all = /nearby|neighbo|around|γειτον|κοντα|mahall|yakin/.test(q);
      const places = exact.length ? exact : category ? nearbyPlaces.filter(p => p.category === category) : all ? nearbyPlaces : [];
      if (places.length) {
        reply = places.slice().sort((a, b) => a.distanceMeters - b.distanceMeters).map(p => `- ${p.mapsUrl ? `[${p.name}](${p.mapsUrl})` : p.name} — ≈ ${p.distanceMeters} m`).join('\n') + `\n\n${c.end}`;
        sources = places.map(p => `owner-neighbourhood:${p.id}`);
      } else if (/guest|bedroom|bathroom|home|suite|space|ατομ|επισκεπ|υπνοδωμ|σπιτι|διαμερισ|misafir|yatak|oda/.test(q)) reply = c.home;
      else if (/^(hi|hello|hey|γεια|καλημερα|merhaba|selam)$/.test(q)) reply = c.intro;
    }
    return { reply, mode: 'guide', sources };
  },
};
