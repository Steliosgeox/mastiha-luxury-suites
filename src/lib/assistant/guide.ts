import type { AssistantProvider, AssistantRequest } from "./contracts";
import { nearbyPlaces, neighbourhoodCopy, type NearbyCategory } from "@/content/neighbourhood";
import { propertyData as property } from "@/content/property";
import { fillCopy, getStayCopy, type StayLocale } from "@/content/stay-copy";

/*
  The automated guide. It answers only from the property and neighbourhood data on this
  site: no model, no guessing. Anything it cannot answer is handed to the host.
*/

type Topic = "greeting" | "host" | "booking" | "family" | "parking" | "wifi" | "times" | "pets" | "smoking" | "sea" | "kitchen" | "climate" | "laundry" | "tv" | "home" | "location";

const answers: Record<StayLocale, Record<Topic | "unknown", string>> = {
  el: {
    greeting: "Γεια σας! Είμαι ο αυτόματος βοηθός του Mastiha. Ρωτήστε με για το σπίτι, τα παιδιά, τη γειτονιά ή την κράτηση. Αν θέλετε να μιλήσετε με την Αθηνά, πατήστε «Μιλήστε με την Αθηνά».",
    host: "Φυσικά. Πατήστε «Μιλήστε με την Αθηνά» και η συζήτηση θα πάει απευθείας σε εκείνη.",
    booking: "Κρατήσεις γίνονται μέσω Airbnb ή Booking.com. Εκεί θα δείτε τις ελεύθερες ημερομηνίες και τις τιμές, γιατί εγώ δεν βλέπω τη διαθεσιμότητα.",
    family: "{family}\n\nΘέλετε να κρατήσει η Αθηνά κάτι από αυτά για τις ημερομηνίες σας; Γράψτε της απευθείας.",
    parking: "Ναι, υπάρχει δωρεάν ιδιωτικό πάρκινγκ. Υπάρχει και δημόσιο πάρκινγκ περίπου 90 μέτρα μακριά.",
    wifi: "Ναι, υπάρχει Wi-Fi και γραφείο στο σαλόνι, αν χρειαστεί να δουλέψετε.",
    times: "Οι ώρες check-in και check-out αναγράφονται στην κράτησή σας. Αν χρειάζεστε κάτι διαφορετικό, πείτε το στην Αθηνά και θα το κανονίσει αν γίνεται.",
    pets: "Δυστυχώς δεν επιτρέπονται κατοικίδια.",
    smoking: "Δεν επιτρέπεται το κάπνισμα στο σπίτι.",
    sea: "Η θάλασσα είναι περίπου {distance} μέτρα από το σπίτι. Για μπάνιο, το Μερσινίδι είναι λίγο πιο βόρεια.",
    kitchen: "{kitchen}",
    climate: "Ναι, υπάρχει κλιματισμός και θέρμανση.",
    laundry: "Ναι, υπάρχει πλυντήριο ρούχων, σίδερο και σιδερώστρα.",
    tv: "Στο σαλόνι υπάρχει Smart TV 55 ιντσών με Netflix και Prime Video, και στο κύριο υπνοδωμάτιο μια τηλεόραση 32 ιντσών.",
    home: "Είναι διαμέρισμα {area} τ.μ. για έως {guests} άτομα: διπλό κρεβάτι king size στο κύριο υπνοδωμάτιο, μονό στο δεύτερο και καναπές-κρεβάτι στο σαλόνι. Υπάρχει ένα μπάνιο, κουζίνα και μπαλκόνι.",
    location: "Είμαστε στον Βροντάδο, {distance} μέτρα από τη θάλασσα και περίπου 4,5 χλμ. από το λιμάνι της Χίου.\n\n[Άνοιγμα στο Google Maps]({maps})",
    unknown: "Δεν έχω σίγουρη απάντηση γι’ αυτό. Η Αθηνά μπορεί να σας απαντήσει. Θέλετε να της γράψετε;",
  },
  en: {
    greeting: "Hello! I’m Mastiha’s automated assistant. Ask me about the apartment, children, the neighbourhood or booking. To talk to Athina, tap “Talk to Athina”.",
    host: "Of course. Tap “Talk to Athina” and the conversation goes straight to her.",
    booking: "Bookings are made through Airbnb or Booking.com. You’ll see available dates and prices there, since I can’t see availability myself.",
    family: "{family}\n\nWould you like Athina to set any of this aside for your dates? Write to her directly.",
    parking: "Yes, there’s free private parking. There’s also a public car park about 90 metres away.",
    wifi: "Yes, there’s Wi-Fi and a desk in the living room if you need to work.",
    times: "Check-in and check-out times are shown in your booking. If you need something different, ask Athina and she’ll arrange it if she can.",
    pets: "Sorry, pets aren’t allowed.",
    smoking: "Smoking isn’t allowed in the apartment.",
    sea: "The sea is about {distance} metres from the apartment. For a swim, Mersinidi beach is a short way north.",
    kitchen: "{kitchen}",
    climate: "Yes, there’s air conditioning and heating.",
    laundry: "Yes, there’s a washing machine, an iron and an ironing board.",
    tv: "There’s a 55-inch smart TV with Netflix and Prime Video in the living room, and a 32-inch TV in the main bedroom.",
    home: "It’s a {area} m² apartment for up to {guests}: a king-size bed in the main bedroom, a single bed in the second and a sofa bed in the living room. There’s one bathroom, a kitchen and a balcony.",
    location: "We’re in Vrontados, {distance} metres from the sea and about 4.5 km from Chios port.\n\n[Open in Google Maps]({maps})",
    unknown: "I don’t have a reliable answer for that. Athina can help. Would you like to write to her?",
  },
  tr: {
    greeting: "Merhaba! Ben Mastiha’nın otomatik asistanıyım. Daire, çocuklar, mahalle veya rezervasyon hakkında sorabilirsiniz. Athina ile konuşmak için “Athina ile konuşun”a dokunun.",
    host: "Elbette. “Athina ile konuşun”a dokunun, sohbet doğrudan ona gider.",
    booking: "Rezervasyonlar Airbnb veya Booking.com üzerinden yapılır. Müsait tarihleri ve fiyatları orada görürsünüz; ben müsaitliği göremiyorum.",
    family: "{family}\n\nBunlardan birini tarihleriniz için ayırmasını ister misiniz? Athina’ya doğrudan yazın.",
    parking: "Evet, ücretsiz özel otopark var. Yaklaşık 90 metre uzakta halka açık bir otopark da bulunur.",
    wifi: "Evet, Wi-Fi ve oturma odasında bir çalışma masası var.",
    times: "Giriş ve çıkış saatleri rezervasyonunuzda yazar. Farklı bir saate ihtiyacınız olursa Athina’ya sorun, mümkünse ayarlar.",
    pets: "Maalesef evcil hayvan kabul edilmiyor.",
    smoking: "Dairede sigara içilmez.",
    sea: "Deniz daireden yaklaşık {distance} metre uzakta. Denize girmek için Mersinidi plajı biraz kuzeyde.",
    kitchen: "{kitchen}",
    climate: "Evet, klima ve ısıtma var.",
    laundry: "Evet, çamaşır makinesi, ütü ve ütü masası var.",
    tv: "Oturma odasında Netflix ve Prime Video’lu 55 inç Smart TV, ana yatak odasında ise 32 inç bir televizyon var.",
    home: "{area} m², {guests} kişiye kadar bir daire: ana yatak odasında king yatak, ikincisinde tek kişilik yatak ve oturma odasında çekyat. Bir banyo, mutfak ve balkon var.",
    location: "Vrontados’tayız; denize {distance} metre, Sakız limanına yaklaşık 4,5 km mesafede.\n\n[Google Maps’te aç]({maps})",
    unknown: "Bu konuda kesin bir cevabım yok. Athina yardımcı olabilir. Ona yazmak ister misiniz?",
  },
};

// Keywords are matched after lower-casing and stripping accents, so "κούνια" matches "κουνια".
const topics: [Topic, RegExp][] = [
  ["host", /\b(human|person|representative|agent|host|athina|owner)\b|ανθρωπ|εκπροσωπ|αθην|οικοδεσπ|ιδιοκτητ|temsilci|insan|ev sahib|athina/],
  ["family", /\b(baby|babies|child|children|kid|kids|cot|crib|playpen|high ?chair|booster|toys?|family)\b|μωρ|παιδ|κουνι|παρκοκρεβ|καρεκλακ|παιχνιδ|οικογεν|bebek|cocuk|aile|oyuncak|mama sandal/],
  ["booking", /\b(price|prices|cost|availab\w*|book|booking|reserv\w*|dates?|cancel\w*)\b|τιμ|κοστ|διαθεσιμ|κρατησ|ημερομην|ακυρω|fiyat|rezerv|musait|iptal|tarih/],
  ["parking", /\bpark\w*|\bcar\b|παρκ|σταθμευ|αυτοκινητ|otopark|park yeri|araba/],
  ["wifi", /wi.?fi|internet|\bwork\b|desk|laptop|ιντερνετ|γραφει|δουλει|δουλεψ|calis|masa/],
  ["times", /check.?in|check.?out|arriv\w*|depart\w*|\btime\b|αφιξ|αναχωρ|τι ωρα|ωρες|giris|cikis|saat/],
  ["pets", /\b(pets?|dogs?|cats?)\b|κατοικιδ|σκυλ|γατ|evcil|kopek|kedi/],
  ["smoking", /smok\w*|καπνι|τσιγαρ|sigara/],
  ["sea", /\b(sea|beach\w*|swim\w*)\b|θαλασσ|παραλ|μπανιο|κολυμπ|deniz|plaj|yuz/],
  ["kitchen", /kitchen|cook\w*|coffee|espresso|oven|fridge|κουζιν|μαγειρ|καφε|φουρν|ψυγει|mutfak|kahve|firin|yemek pis/],
  ["climate", /air ?con\w*|\bac\b|heating|κλιματισ|θερμανσ|κλιμα|klima|isitma/],
  ["laundry", /wash\w*|laundry|\biron\w*|πλυντηρ|σιδερ|camasir|utu/],
  ["tv", /\btv\b|television|netflix|prime|τηλεορασ|televizyon/],
  ["home", /bed\w*|sleep\w*|guests?|people|rooms?|bathroom|sofa|size|m2|υπνοδωμ|κρεβατ|ατομα|επισκεπτ|μπανιο|καναπ|τετραγων|yatak|kisi|misafir|oda|banyo/],
  ["location", /where|address|location|directions?|map|port|how (do i|to) get|που ειστε|διευθυνσ|τοποθεσ|χαρτη|λιμαν|πως θα ερθ|nerede|adres|konum|harita|liman/],
];

const categories: [NearbyCategory, RegExp][] = [
  ["groceries", /super ?market|grocer\w*|shop\w*|σουπερ|μαρκετ|ψωνι|market/],
  ["bakery", /baker\w*|bread|φουρνο|αρτοποι|ψωμι|firin|ekmek/],
  ["coffee", /\bcafes?\b|coffee shop|beach bar|καφετερ|καφε(?=\s|$)|kafe/],
  ["food", /restaurant|\beat\b|food|dinner|lunch|taverna|grill|φαγητ|φαι|εστιατορ|ταβερν|ψητοπωλ|σουβλακ|restoran|yemek/],
  ["pharmacy", /pharmac\w*|chemist|medicine|φαρμακ|eczane|ilac/],
  ["transport", /rent\w*|car hire|petrol|fuel|gas station|ενοικιασ|βενζιν|καυσιμ|kiralik|benzin/],
];

const normalize = (text: string) => text
  .normalize("NFD").replace(/\p{M}/gu, "")
  .toLocaleLowerCase("en").replace(/ı/g, "i")
  .replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();

function nearbyAnswer(locale: StayLocale, question: string) {
  const category = categories.find(([, pattern]) => pattern.test(question))?.[0];
  const general = /nearby|neighbou?rhood|around|close|γειτον|κοντα|γυρω|yakin|mahalle|cevre/.test(question);
  if (!category && !general) return null;
  const c = neighbourhoodCopy[locale];
  const places = nearbyPlaces
    .filter(place => !category || place.category === category)
    .toSorted((a, b) => a.distanceMeters - b.distanceMeters);
  const list = places.map(place => {
    const name = place.id === "public-parking" ? c.publicParking : place.name;
    return `- ${place.mapsUrl ? `[${name}](${place.mapsUrl})` : name} · ≈ ${place.distanceMeters} m`;
  }).join("\n");
  return { reply: `${list}\n\n${c.note}`, sources: places.map(place => `neighbourhood:${place.id}`) };
}

export const propertyGuide: AssistantProvider = {
  async answer({ locale, messages }: AssistantRequest) {
    const question = normalize(messages.at(-1)?.content ?? "");
    const copy = getStayCopy(locale);
    const values = {
      area: property.areaM2,
      guests: property.maxGuests,
      distance: property.distanceToSeaMeters,
      maps: property.location.googleMapsUrl,
      family: copy.family.body,
      kitchen: copy.kitchen.body,
    };
    const say = (topic: Topic | "unknown") => fillCopy(answers[locale][topic], values);

    // Note: \b only knows Latin letters, so Greek words end with a lookahead instead.
    if (/^(hi|hello|hey|good (morning|evening)|γεια|καλημερα|καλησπερα|merhaba|selam|iyi gunler)(?=\s|$)/.test(question) && question.split(" ").length <= 3) {
      return { reply: say("greeting"), mode: "guide", sources: [] };
    }
    const nearby = nearbyAnswer(locale, question);
    const topic = topics.find(([, pattern]) => pattern.test(question))?.[0];
    // Neighbourhood questions win over generic words like "coffee" or "car".
    if (nearby && (!topic || ["kitchen", "parking", "sea", "location"].includes(topic) && categories.some(([, pattern]) => pattern.test(question)))) {
      return { reply: nearby.reply, mode: "guide", sources: nearby.sources };
    }
    if (topic === "host") return { reply: say("host"), mode: "guide", sources: [], suggestHost: true };
    if (topic === "booking") {
      return { reply: `${say("booking")}\n\n[Airbnb](${property.bookingLinks.airbnb}) · [Booking.com](${property.bookingLinks.booking})`, mode: "guide", sources: ["booking-platforms"] };
    }
    if (topic) return { reply: say(topic), mode: "guide", sources: [`property:${topic}`], suggestHost: topic === "family" || topic === "times" };
    return { reply: say("unknown"), mode: "guide", sources: [], suggestHost: true };
  },
};
