// Site copy. Greek is written first and is the reference; English and Turkish follow it.
// Keep it plain and factual, in the host's own voice: no slogans, no invented claims.
// Facts (sizes, distances, beds) come from property.ts and are interpolated where possible.

export type StayLocale = "en" | "el" | "tr";

const el = {
  // Used by the dock (PremiumDock) and the top navigation.
  home: "Αρχή",
  suite: "Το διαμέρισμα",
  gallery: "Φωτογραφίες",
  location: "Τοποθεσία",
  bookShort: "Κράτηση",

  common: {
    skip: "Μετάβαση στο περιεχόμενο",
    nav: "Κύρια πλοήγηση",
    language: "Γλώσσα",
    openPhoto: "Άνοιγμα φωτογραφίας",
    close: "Κλείσιμο",
    loading: "Φόρτωση…",
  },
  hero: {
    place: "Βροντάδος · Χίος",
    toSea: "{distance} μ. από τη θάλασσα",
    kicker: "Ολόκληρο διαμέρισμα στον Βροντάδο Χίου",
    facts: "{area} τ.μ. · {bedrooms} υπνοδωμάτια · έως {guests} άτομα",
    cta: "Διαθεσιμότητα",
    scroll: "Δείτε το σπίτι",
  },
  tour: {
    label: "Περιήγηση στο σπίτι",
    skip: "Παράλειψη",
  },
  intro: {
    eyebrow: "Το διαμέρισμα",
    title: "Καλώς ήρθατε στο Mastiha",
    body: "Ένα διαμέρισμα {area} τ.μ. στον Βροντάδο, {distance} μέτρα από τη θάλασσα. Έχει δύο υπνοδωμάτια, σαλόνι με τραπεζαρία, κουζίνα με όλα τα απαραίτητα, μπάνιο και μπαλκόνι. Χωράει έως τέσσερα άτομα και το έχετε ολόκληρο δικό σας.",
    area: "τ.μ.",
    bedrooms: "υπνοδωμάτια",
    guests: "άτομα",
    toSea: "μ. από τη θάλασσα",
  },
  bedrooms: {
    eyebrow: "Υπνοδωμάτια",
    title: "Δύο υπνοδωμάτια και καναπές-κρεβάτι",
    body: "Στο κύριο υπνοδωμάτιο υπάρχει διπλό κρεβάτι king size, τηλεόραση και μπουντουάρ. Στο δεύτερο υπάρχει μονό κρεβάτι και ντουλάπα. Ο καναπές στο σαλόνι ανοίγει σε κρεβάτι για τέταρτο άτομο.",
  },
  family: {
    eyebrow: "Για οικογένειες",
    title: "Ταξιδεύετε με παιδιά;",
    body: "Τα παιδιά κάθε ηλικίας είναι ευπρόσδεκτα. Για τα μωρά έχουμε κούνια (δωρεάν, για 0–3 ετών), παρκοκρέβατο και καρεκλάκι φαγητού. Για τα μεγαλύτερα υπάρχει παιδικό τραπεζάκι με παζλ και παιχνίδια. Πείτε μας τι θα χρειαστείτε όταν κάνετε την κράτηση, για να τα έχουμε έτοιμα.",
    items: ["Κούνια μωρού · δωρεάν, 0–3 ετών", "Παρκοκρέβατο", "Καρεκλάκι φαγητού", "Παιχνίδια και παζλ"],
    drag: "Σύρετε για περισσότερες",
  },
  balcony: {
    eyebrow: "Μπαλκόνι",
    title: "Το μπαλκόνι",
    body: "Με τραπέζι και καρέκλες, για τον πρωινό καφέ ή για να κάτσετε λίγο το βράδυ.",
    action: "Δείτε φωτογραφίες",
  },
  kitchen: {
    eyebrow: "Κουζίνα",
    title: "Κουζίνα με όλα τα απαραίτητα",
    body: "Φούρνος, εστίες, ψυγείο, μηχανή espresso, ηλεκτρικό μπρίκι για ελληνικό καφέ, βραστήρας και τοστιέρα, μαζί με όλα τα σκεύη για να μαγειρέψετε. Στο σαλόνι υπάρχει και γραφείο, αν χρειαστεί να δουλέψετε.",
  },
  photos: {
    eyebrow: "Φωτογραφίες",
    title: "Δείτε όλο το σπίτι",
    body: "Όλες οι φωτογραφίες είναι από το σπίτι και τη γειτονιά μας.",
    filters: { all: "Όλες", living: "Σαλόνι", kitchen: "Κουζίνα", bedrooms: "Υπνοδωμάτια", family: "Για παιδιά", bathroom: "Μπάνιο", outdoors: "Εξωτερικά", neighbourhood: "Περιοχή" },
    count: "φωτογραφίες",
    more: "Περισσότερες φωτογραφίες",
    less: "Λιγότερες φωτογραφίες",
    viewAll: "Προβολή όλων",
  },
  amenities: {
    eyebrow: "Παροχές",
    title: "Τι θα βρείτε στο σπίτι",
    items: {
      parking: "Δωρεάν ιδιωτικό πάρκινγκ",
      wifi: "Wi-Fi",
      climate: "Κλιματισμός και θέρμανση",
      kitchen: "Κουζίνα με φούρνο και εστίες",
      laundry: "Πλυντήριο ρούχων",
      tv: "Smart TV 55\" με Netflix και Prime Video",
      iron: "Σίδερο, πιστολάκι και πρέσα μαλλιών",
      balcony: "Μπαλκόνι με τραπέζι",
      desk: "Γραφείο για δουλειά",
      quiet: "Ηχομόνωση",
    },
  },
  reviews: {
    eyebrow: "Κριτικές",
    title: "Τι λένε οι επισκέπτες μας",
    note: "Βαθμολογίες στις {date}. Τις πιο πρόσφατες κριτικές θα τις βρείτε στο Airbnb και στο Booking.com.",
    reviews: "κριτικές",
    read: "Διαβάστε τις κριτικές",
    airbnbBadge: "Αγαπημένο επισκεπτών",
    airbnbDetail: "Στο κορυφαίο 1% των καταλυμάτων",
    bookingLabel: "Εξαιρετικό",
    bookingLocation: "Τοποθεσία",
  },
  where: {
    eyebrow: "Τοποθεσία",
    title: "Πού θα μας βρείτε",
    body: "Στον Βροντάδο, {distance} μέτρα από τη θάλασσα και περίπου 4,5 χλμ. από το λιμάνι της Χίου. Πριν έρθετε, στείλτε μας μήνυμα και θα σας πούμε πώς να μας βρείτε.",
    maps: "Άνοιγμα στο Google Maps",
    directions: "Οδηγίες διαδρομής",
    mapShow: "Εμφάνιση χάρτη",
    mapHide: "Κλείσιμο χάρτη",
    mapNote: "Ο χάρτης της Google φορτώνει μόνο όταν τον ανοίξετε.",
    mapTitle: "Το Mastiha Luxury Suites στον χάρτη",
  },
  vrontados: {
    eyebrow: "Βροντάδος",
    title: "Τι άλλο έχει ο Βροντάδος",
    body: "Με τα πόδια φτάνετε στους ανεμόμυλους και στο άγαλμα του Άγνωστου Ναύτη. Λίγο πιο πέρα είναι η Δασκαλόπετρα, και το Πάσχα γίνεται ο γνωστός ρουκετοπόλεμος. Για μπάνιο, το Μερσινίδι είναι λίγο πιο βόρεια.",
  },
  host: {
    eyebrow: "Η οικοδέσποινά σας",
    title: "Γεια σας, είμαι η Αθηνά",
    body: "Είμαι εδώ για ό,τι χρειαστείτε, πριν έρθετε και όσο μένετε στο σπίτι. Για οποιαδήποτε ερώτηση, γράψτε μου εδώ στο chat ή στείλτε μου μήνυμα στο Airbnb.",
    chat: "Στείλτε μου μήνυμα",
    airbnb: "Το προφίλ μου στο Airbnb",
  },
  faq: {
    title: "Συχνές ερωτήσεις",
    items: [
      { q: "Πόσα άτομα χωράει το σπίτι;", a: "Έως {guests} άτομα: διπλό κρεβάτι king size στο κύριο υπνοδωμάτιο, μονό κρεβάτι στο δεύτερο και καναπές-κρεβάτι στο σαλόνι. Υπάρχει ένα μπάνιο." },
      { q: "Πώς κάνω κράτηση;", a: "Μέσω Airbnb ή Booking.com. Εκεί θα δείτε τις ελεύθερες ημερομηνίες, την τελική τιμή και τους όρους ακύρωσης." },
      { q: "Τι ώρα είναι το check-in και το check-out;", a: "Οι ώρες αναγράφονται στην κράτησή σας. Αν χρειάζεστε κάτι διαφορετικό, στείλτε μας μήνυμα και θα το κανονίσουμε αν γίνεται." },
      { q: "Υπάρχει πάρκινγκ;", a: "Ναι, δωρεάν ιδιωτικό πάρκινγκ. Υπάρχει και δημόσιο πάρκινγκ περίπου 90 μέτρα μακριά." },
      { q: "Τι υπάρχει για παιδιά;", a: "Κούνια μωρού (δωρεάν, για 0–3 ετών), παρκοκρέβατο, καρεκλάκι φαγητού και παιχνίδια. Πείτε μας τι χρειάζεστε όταν κάνετε την κράτηση." },
      { q: "Μπορώ να δουλέψω από το σπίτι;", a: "Ναι, υπάρχει Wi-Fi και γραφείο στο σαλόνι." },
      { q: "Πόσο απέχει η θάλασσα;", a: "Περίπου {distance} μέτρα. Σούπερ μάρκετ, φούρνοι, καφέ και φαρμακεία είναι επίσης σε κοντινή απόσταση." },
      { q: "Επιτρέπονται κατοικίδια;", a: "Δυστυχώς όχι." },
    ],
  },
  closing: {
    title: "Σας περιμένουμε στη Χίο",
    body: "Δείτε διαθεσιμότητα και τιμές στο Airbnb ή στο Booking.com.",
    action: "Κράτηση",
  },
  booking: {
    title: "Κράτηση",
    body: "Επιλέξτε πλατφόρμα. Εκεί θα δείτε τις ελεύθερες ημερομηνίες, την τελική τιμή και τους όρους ακύρωσης.",
  },
  footer: {
    place: "Βροντάδος, Χίος",
    registration: "ΑΜΑ",
    privacy: "Απόρρητο",
    contact: "Επικοινωνία",
    top: "Επιστροφή επάνω",
  },
  lightbox: {
    previous: "Προηγούμενη φωτογραφία",
    next: "Επόμενη φωτογραφία",
    zoomIn: "Μεγέθυνση",
    zoomOut: "Σμίκρυνση",
    fullscreen: "Πλήρης οθόνη",
    exitFullscreen: "Έξοδος από πλήρη οθόνη",
    hideThumbs: "Απόκρυψη μικρογραφιών",
    showThumbs: "Εμφάνιση μικρογραφιών",
  },
};

export type StayCopy = typeof el;

const en: StayCopy = {
  home: "Home",
  suite: "The apartment",
  gallery: "Photos",
  location: "Location",
  bookShort: "Book your stay",

  common: {
    skip: "Skip to content",
    nav: "Main navigation",
    language: "Language",
    openPhoto: "Open photo",
    close: "Close",
    loading: "Loading…",
  },
  hero: {
    place: "Vrontados · Chios",
    toSea: "{distance} m from the sea",
    kicker: "A whole apartment in Vrontados, Chios",
    facts: "{area} m² · {bedrooms} bedrooms · sleeps {guests}",
    cta: "Availability",
    scroll: "See the apartment",
  },
  tour: {
    label: "Around the apartment",
    skip: "Skip",
  },
  intro: {
    eyebrow: "The apartment",
    title: "Welcome to Mastiha",
    body: "A {area} m² apartment in Vrontados, {distance} metres from the sea. Two bedrooms, a living room with a dining table, a well-equipped kitchen, a bathroom and a balcony. It sleeps up to four, and the whole place is yours.",
    area: "m²",
    bedrooms: "bedrooms",
    guests: "guests",
    toSea: "m to the sea",
  },
  bedrooms: {
    eyebrow: "Bedrooms",
    title: "Two bedrooms and a sofa bed",
    body: "The main bedroom has a king-size bed, a TV and a dressing table. The second has a single bed and a wardrobe. The living-room sofa opens into a bed for a fourth guest.",
  },
  family: {
    eyebrow: "Families",
    title: "Travelling with children?",
    body: "Children of all ages are welcome. For babies we have a cot (free, ages 0–3), a travel cot and a booster seat. For older children there’s a small table with puzzles and toys. Tell us what you need when you book and we’ll have it ready.",
    items: ["Baby cot · free, ages 0–3", "Travel cot", "Booster seat", "Toys and puzzles"],
    drag: "Swipe for more",
  },
  balcony: {
    eyebrow: "Balcony",
    title: "The balcony",
    body: "A table and chairs for your morning coffee or a quiet evening outside.",
    action: "See photos",
  },
  kitchen: {
    eyebrow: "Kitchen",
    title: "A kitchen with everything you need",
    body: "Oven, hob, fridge, an espresso machine, an electric pot for Greek coffee, a kettle and a sandwich toaster, plus all the cookware you need. There’s also a desk in the living room if you need to work.",
  },
  photos: {
    eyebrow: "Photos",
    title: "See the whole apartment",
    body: "Every photo here is of our apartment and our neighbourhood.",
    filters: { all: "All", living: "Living room", kitchen: "Kitchen", bedrooms: "Bedrooms", family: "For children", bathroom: "Bathroom", outdoors: "Outside", neighbourhood: "The area" },
    count: "photos",
    more: "More photos",
    less: "Fewer photos",
    viewAll: "View all",
  },
  amenities: {
    eyebrow: "Amenities",
    title: "What you’ll find",
    items: {
      parking: "Free private parking",
      wifi: "Wi-Fi",
      climate: "Air conditioning and heating",
      kitchen: "Kitchen with oven and hob",
      laundry: "Washing machine",
      tv: "55\" smart TV with Netflix and Prime Video",
      iron: "Iron, hair dryer and straightener",
      balcony: "Balcony with a table",
      desk: "Desk for work",
      quiet: "Soundproofing",
    },
  },
  reviews: {
    eyebrow: "Reviews",
    title: "What our guests say",
    note: "Scores as of {date}. For the latest reviews, see Airbnb and Booking.com.",
    reviews: "reviews",
    read: "Read reviews",
    airbnbBadge: "Guest favourite",
    airbnbDetail: "Top 1% of homes",
    bookingLabel: "Exceptional",
    bookingLocation: "Location",
  },
  where: {
    eyebrow: "Location",
    title: "Where to find us",
    body: "In Vrontados, {distance} metres from the sea and about 4.5 km from Chios port. Message us before you arrive and we’ll tell you how to find us.",
    maps: "Open in Google Maps",
    directions: "Directions",
    mapShow: "Show map",
    mapHide: "Hide map",
    mapNote: "The Google map only loads when you open it.",
    mapTitle: "Mastiha Luxury Suites on the map",
  },
  vrontados: {
    eyebrow: "Vrontados",
    title: "More of Vrontados",
    body: "The windmills and the Unknown Sailor statue are a short walk away. A little further is Daskalopetra, and at Easter the village holds its famous rocket war. For a swim, Mersinidi beach is a short way north.",
  },
  host: {
    eyebrow: "Your host",
    title: "Hi, I’m Athina",
    body: "I’m here for anything you need, before you arrive and while you stay. If you have a question, write to me here in the chat or message me on Airbnb.",
    chat: "Message me",
    airbnb: "My Airbnb profile",
  },
  faq: {
    title: "Questions",
    items: [
      { q: "How many people can stay?", a: "Up to {guests}: a king-size bed in the main bedroom, a single bed in the second and a sofa bed in the living room. There is one bathroom." },
      { q: "How do I book?", a: "Through Airbnb or Booking.com. You’ll see available dates, the final price and cancellation terms there." },
      { q: "What are the check-in and check-out times?", a: "They’re shown in your booking. If you need a different time, message us and we’ll arrange it if we can." },
      { q: "Is there parking?", a: "Yes, free private parking. There’s also a public car park about 90 metres away." },
      { q: "What do you have for children?", a: "A baby cot (free, ages 0–3), a travel cot, a booster seat and toys. Let us know what you need when you book." },
      { q: "Can I work from the apartment?", a: "Yes, there’s Wi-Fi and a desk in the living room." },
      { q: "How far is the sea?", a: "About {distance} metres. Supermarkets, bakeries, cafés and pharmacies are close by too." },
      { q: "Are pets allowed?", a: "Sorry, no." },
    ],
  },
  closing: {
    title: "See you in Chios",
    body: "Check dates and prices on Airbnb or Booking.com.",
    action: "Book",
  },
  booking: {
    title: "Book your stay",
    body: "Choose a platform to see available dates, the final price and cancellation terms.",
  },
  footer: {
    place: "Vrontados, Chios, Greece",
    registration: "Registration no.",
    privacy: "Privacy",
    contact: "Contact",
    top: "Back to top",
  },
  lightbox: {
    previous: "Previous photo",
    next: "Next photo",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    hideThumbs: "Hide thumbnails",
    showThumbs: "Show thumbnails",
  },
};

const tr: StayCopy = {
  home: "Ana sayfa",
  suite: "Daire",
  gallery: "Fotoğraflar",
  location: "Konum",
  bookShort: "Rezervasyon yapın",

  common: {
    skip: "İçeriğe geç",
    nav: "Ana menü",
    language: "Dil",
    openPhoto: "Fotoğrafı aç",
    close: "Kapat",
    loading: "Yükleniyor…",
  },
  hero: {
    place: "Vrontados · Sakız Adası",
    toSea: "Denize {distance} m",
    kicker: "Vrontados’ta, Sakız Adası’nda bir dairenin tamamı",
    facts: "{area} m² · {bedrooms} yatak odası · {guests} kişiye kadar",
    cta: "Müsaitlik",
    scroll: "Daireyi görün",
  },
  tour: {
    label: "Dairede bir tur",
    skip: "Geç",
  },
  intro: {
    eyebrow: "Daire",
    title: "Mastiha’ya hoş geldiniz",
    body: "Vrontados’ta, denize {distance} metre mesafede {area} m² bir daire. İki yatak odası, yemek masalı oturma odası, donanımlı mutfak, banyo ve balkon. Dört kişiye kadar konaklama; dairenin tamamı sizin.",
    area: "m²",
    bedrooms: "yatak odası",
    guests: "kişi",
    toSea: "m denize",
  },
  bedrooms: {
    eyebrow: "Yatak odaları",
    title: "İki yatak odası ve bir çekyat",
    body: "Ana yatak odasında king yatak, televizyon ve makyaj masası var. İkinci odada tek kişilik yatak ve gardırop bulunur. Oturma odasındaki kanepe dördüncü misafir için yatağa dönüşür.",
  },
  family: {
    eyebrow: "Aileler",
    title: "Çocuklarla mı geliyorsunuz?",
    body: "Her yaştan çocuk ağırlıyoruz. Bebekler için bebek yatağı (ücretsiz, 0–3 yaş), park yatak ve mama sandalyesi var. Büyük çocuklar için yapboz ve oyuncaklı küçük bir masa bulunur. Rezervasyon sırasında neye ihtiyacınız olduğunu yazın, hazır edelim.",
    items: ["Bebek yatağı · ücretsiz, 0–3 yaş", "Park yatak", "Mama sandalyesi", "Oyuncaklar ve yapbozlar"],
    drag: "Daha fazlası için kaydırın",
  },
  balcony: {
    eyebrow: "Balkon",
    title: "Balkon",
    body: "Sabah kahvesi ya da akşam oturmak için masa ve sandalyeler.",
    action: "Fotoğraflara bakın",
  },
  kitchen: {
    eyebrow: "Mutfak",
    title: "İhtiyacınız olan her şey mutfakta",
    body: "Fırın, ocak, buzdolabı, espresso makinesi, Türk kahvesi makinesi, su ısıtıcı ve tost makinesi; yemek pişirmek için tüm mutfak gereçleri. Çalışmanız gerekirse oturma odasında bir çalışma masası da var.",
  },
  photos: {
    eyebrow: "Fotoğraflar",
    title: "Dairenin tamamını görün",
    body: "Buradaki tüm fotoğraflar dairemizden ve mahallemizden.",
    filters: { all: "Tümü", living: "Oturma odası", kitchen: "Mutfak", bedrooms: "Yatak odaları", family: "Çocuklar için", bathroom: "Banyo", outdoors: "Dış mekân", neighbourhood: "Çevre" },
    count: "fotoğraf",
    more: "Daha fazla fotoğraf",
    less: "Daha az fotoğraf",
    viewAll: "Tümünü görüntüle",
  },
  amenities: {
    eyebrow: "Olanaklar",
    title: "Dairede neler var",
    items: {
      parking: "Ücretsiz özel otopark",
      wifi: "Wi-Fi",
      climate: "Klima ve ısıtma",
      kitchen: "Fırınlı ve ocaklı mutfak",
      laundry: "Çamaşır makinesi",
      tv: "Netflix ve Prime Video’lu 55\" Smart TV",
      iron: "Ütü, saç kurutma makinesi ve düzleştirici",
      balcony: "Masalı balkon",
      desk: "Çalışma masası",
      quiet: "Ses yalıtımı",
    },
  },
  reviews: {
    eyebrow: "Yorumlar",
    title: "Misafirlerimiz ne diyor",
    note: "Puanlar {date} tarihli. En güncel yorumlar için Airbnb ve Booking.com’a bakın.",
    reviews: "yorum",
    read: "Yorumları okuyun",
    airbnbBadge: "Misafirlerin favorisi",
    airbnbDetail: "Evlerin en iyi %1’i",
    bookingLabel: "Olağanüstü",
    bookingLocation: "Konum",
  },
  where: {
    eyebrow: "Konum",
    title: "Bizi nerede bulursunuz",
    body: "Vrontados’ta, denize {distance} metre ve Sakız limanına yaklaşık 4,5 km mesafedeyiz. Gelmeden önce bize yazın, nasıl bulacağınızı anlatalım.",
    maps: "Google Maps’te aç",
    directions: "Yol tarifi",
    mapShow: "Haritayı göster",
    mapHide: "Haritayı kapat",
    mapNote: "Google haritası yalnızca açtığınızda yüklenir.",
    mapTitle: "Haritada Mastiha Luxury Suites",
  },
  vrontados: {
    eyebrow: "Vrontados",
    title: "Vrontados’ta başka neler var",
    body: "Yel değirmenleri ve Meçhul Denizci heykeli yürüme mesafesinde. Biraz ileride Daskalopetra var; Paskalya’da ise ünlü roket savaşı yapılır. Denize girmek için Mersinidi plajı biraz kuzeyde.",
  },
  host: {
    eyebrow: "Ev sahibiniz",
    title: "Merhaba, ben Athina",
    body: "Gelmeden önce de, konaklamanız boyunca da ihtiyacınız olan her şey için buradayım. Sorunuz varsa bana buradan sohbetle ya da Airbnb üzerinden yazın.",
    chat: "Bana yazın",
    airbnb: "Airbnb profilim",
  },
  faq: {
    title: "Sık sorulan sorular",
    items: [
      { q: "Kaç kişi kalabilir?", a: "{guests} kişiye kadar: ana yatak odasında king yatak, ikinci odada tek kişilik yatak ve oturma odasında çekyat. Bir banyo vardır." },
      { q: "Nasıl rezervasyon yaparım?", a: "Airbnb veya Booking.com üzerinden. Müsait tarihleri, toplam fiyatı ve iptal koşullarını orada görürsünüz." },
      { q: "Giriş ve çıkış saatleri nedir?", a: "Saatler rezervasyonunuzda yazar. Farklı bir saate ihtiyacınız olursa bize yazın, mümkünse ayarlayalım." },
      { q: "Otopark var mı?", a: "Evet, ücretsiz özel otopark. Yaklaşık 90 metre uzakta halka açık bir otopark da var." },
      { q: "Çocuklar için neler var?", a: "Bebek yatağı (ücretsiz, 0–3 yaş), park yatak, mama sandalyesi ve oyuncaklar. Rezervasyon sırasında ihtiyacınızı bize bildirin." },
      { q: "Daireden çalışabilir miyim?", a: "Evet, Wi-Fi ve oturma odasında bir çalışma masası var." },
      { q: "Deniz ne kadar uzakta?", a: "Yaklaşık {distance} metre. Market, fırın, kafe ve eczaneler de yakında." },
      { q: "Evcil hayvan kabul ediyor musunuz?", a: "Maalesef hayır." },
    ],
  },
  closing: {
    title: "Sakız’da görüşmek üzere",
    body: "Tarihleri ve fiyatları Airbnb veya Booking.com’da görün.",
    action: "Rezervasyon",
  },
  booking: {
    title: "Rezervasyon",
    body: "Müsait tarihleri, toplam fiyatı ve iptal koşullarını görmek için bir platform seçin.",
  },
  footer: {
    place: "Vrontados, Sakız Adası, Yunanistan",
    registration: "Kayıt no.",
    privacy: "Gizlilik",
    contact: "İletişim",
    top: "Başa dön",
  },
  lightbox: {
    previous: "Önceki fotoğraf",
    next: "Sonraki fotoğraf",
    zoomIn: "Yakınlaştır",
    zoomOut: "Uzaklaştır",
    fullscreen: "Tam ekran",
    exitFullscreen: "Tam ekrandan çık",
    hideThumbs: "Küçük resimleri gizle",
    showThumbs: "Küçük resimleri göster",
  },
};

const copies: Record<StayLocale, StayCopy> = { el, en, tr };

export function getStayCopy(locale: string): StayCopy {
  return copies[normalizeStayLocale(locale)];
}

export function normalizeStayLocale(locale: string): StayLocale {
  return locale === "el" || locale === "tr" ? locale : "en";
}

export function fillCopy(value: string, values: Record<string, string | number>): string {
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

/** Locale-aware decimals: Greek and Turkish use a decimal comma (9,9 not 9.9). */
export function formatScore(value: number, locale: StayLocale): string {
  return value.toLocaleString({ el: "el-GR", en: "en-GB", tr: "tr-TR" }[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDate(isoDate: string, locale: StayLocale): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString({ el: "el-GR", en: "en-GB", tr: "tr-TR" }[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
