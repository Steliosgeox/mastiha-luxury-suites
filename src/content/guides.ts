import type { StayLocale } from "./stay-copy";
import type { PhotoId } from "./stay-media";

/*
  Guides to the island, written by the host. Facts are deliberately modest and checked against
  Wikipedia (October 2026): no opening hours, prices or travel times that go out of date.
  Distances from the apartment come from the property and neighbourhood data via {placeholders}.
*/

export const guideIds = ["chios", "vrontados", "mastiha"] as const;
export type GuideId = (typeof guideIds)[number];
export const isGuideId = (value: string): value is GuideId => (guideIds as readonly string[]).includes(value);

export type GuideSection = {
  heading: string;
  body: string[];
  photo?: PhotoId;
  /** Ends the section with a link to another guide. */
  link?: GuideId;
  /** Shows the walking-distance list of nearby shops. */
  nearby?: true;
};

export type Guide = {
  /** Short name in navigation and links. */
  label: string;
  kicker: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: GuideSection[];
};

/** The page's lead photograph (one of our own) and its link-preview image. */
export const guideMedia: Record<GuideId, { photo: PhotoId | null; share: string | null }> = {
  chios: { photo: "coast", share: "/og/chios.jpg" },
  vrontados: { photo: "windmills", share: "/og/vrontados.jpg" },
  mastiha: { photo: null, share: null },
};

/** What each guide is about, for search engines: the matching Wikipedia article. */
export const guideSubject: Record<GuideId, { type: string; name: string; sameAs: string }> = {
  chios: { type: "TouristDestination", name: "Chios", sameAs: "https://en.wikipedia.org/wiki/Chios" },
  vrontados: { type: "Place", name: "Vrontados", sameAs: "https://en.wikipedia.org/wiki/Vrontados" },
  mastiha: { type: "Thing", name: "Chios mastic", sameAs: "https://en.wikipedia.org/wiki/Mastic_(plant_resin)" },
};

/** Places a guide names, linked to their Wikipedia articles. */
export const guideMentions: Record<GuideId, { name: string; sameAs: string }[]> = {
  chios: [
    { name: "Nea Moni", sameAs: "https://en.wikipedia.org/wiki/Nea_Moni_of_Chios" },
    { name: "Anavatos", sameAs: "https://en.wikipedia.org/wiki/Anavatos" },
    { name: "Pyrgi", sameAs: "https://en.wikipedia.org/wiki/Pyrgi,_Greece" },
    { name: "Mesta", sameAs: "https://en.wikipedia.org/wiki/Mesta,_Greece" },
    { name: "Karfas", sameAs: "https://en.wikipedia.org/wiki/Karfas" },
    { name: "Kardamyla", sameAs: "https://en.wikipedia.org/wiki/Kardamyla" },
    { name: "Volissos", sameAs: "https://en.wikipedia.org/wiki/Volissos" },
    { name: "Chios Island National Airport", sameAs: "https://en.wikipedia.org/wiki/Chios_Island_National_Airport" },
  ],
  vrontados: [
    { name: "Rouketopolemos", sameAs: "https://en.wikipedia.org/wiki/Rouketopolemos" },
    { name: "Chios", sameAs: "https://en.wikipedia.org/wiki/Chios" },
  ],
  mastiha: [
    { name: "Pyrgi", sameAs: "https://en.wikipedia.org/wiki/Pyrgi,_Greece" },
    { name: "Mesta", sameAs: "https://en.wikipedia.org/wiki/Mesta,_Greece" },
    { name: "Chios", sameAs: "https://en.wikipedia.org/wiki/Chios" },
  ],
};

/** When the guides' text last changed. */
export const GUIDES_UPDATED = "2026-10-01";

export const guideChrome: Record<StayLocale, {
  guides: string; home: string; apartment: string; updated: string;
  stayEyebrow: string; stayTitle: string; stayBody: string; seeApartment: string;
  readAlso: string; nearbyNote: string;
}> = {
  el: {
    guides: "Οδηγοί",
    home: "Αρχική",
    apartment: "Το διαμέρισμα",
    updated: "Ενημερώθηκε {date}",
    stayEyebrow: "Μείνετε μαζί μας",
    stayTitle: "Ένα διαμέρισμα {distance} μέτρα από τη θάλασσα, στον Βροντάδο",
    stayBody: "{area} τ.μ., δύο υπνοδωμάτια, έως {guests} άτομα και δωρεάν πάρκινγκ. Δείτε διαθεσιμότητα και τιμές στο Airbnb ή στο Booking.com.",
    seeApartment: "Δείτε το διαμέρισμα",
    readAlso: "Διαβάστε επίσης",
    nearbyNote: "Οι αποστάσεις είναι κατά προσέγγιση, από το διαμέρισμα.",
  },
  en: {
    guides: "Guides",
    home: "Home",
    apartment: "The apartment",
    updated: "Updated {date}",
    stayEyebrow: "Stay with us",
    stayTitle: "An apartment {distance} metres from the sea in Vrontados",
    stayBody: "{area} m², two bedrooms, sleeps {guests}, free parking. See dates and prices on Airbnb or Booking.com.",
    seeApartment: "See the apartment",
    readAlso: "Read also",
    nearbyNote: "Approximate walking distances from the apartment.",
  },
  tr: {
    guides: "Rehberler",
    home: "Ana sayfa",
    apartment: "Daire",
    updated: "Güncelleme: {date}",
    stayEyebrow: "Bizde kalın",
    stayTitle: "Vrontados’ta denize {distance} metre mesafede bir daire",
    stayBody: "{area} m², iki yatak odası, {guests} kişilik, ücretsiz otopark. Tarihleri ve fiyatları Airbnb veya Booking.com’da görün.",
    seeApartment: "Daireyi görün",
    readAlso: "Ayrıca okuyun",
    nearbyNote: "Daireden yaklaşık yürüme mesafeleri.",
  },
};

export const guides: Record<GuideId, Record<StayLocale, Guide>> = {
  chios: {
    el: {
      label: "Οδηγός για τη Χίο",
      kicker: "Χίος",
      title: "Οδηγός για τη Χίο",
      metaTitle: "Οδηγός Χίου: χωριά, παραλίες και αξιοθέατα | Mastiha Luxury Suites",
      description: "Τι να δείτε στη Χίο ξεκινώντας από τον Βροντάδο: η πόλη και το Κάστρο, ο Κάμπος, η Νέα Μονή, το Ανάβατο, το Πυργί, τα Μεστά και οι πιο όμορφες παραλίες.",
      intro: "Η Χίος είναι το πέμπτο μεγαλύτερο νησί της Ελλάδας, στο βορειοανατολικό Αιγαίο, απέναντι από τα μικρασιατικά παράλια. Είναι το νησί της μαστίχας, των μεσαιωνικών χωριών και των ναυτικών. Το διαμέρισμά μας είναι στον Βροντάδο, λίγο βόρεια από την πόλη, οπότε με αυτοκίνητο φτάνετε σχεδόν παντού μέσα σε μια μέρα.",
      sections: [
        {
          heading: "Η πόλη της Χίου και ο Κάμπος",
          body: [
            "Η πόλη είναι χτισμένη γύρω από το λιμάνι και το μεσαιωνικό Κάστρο. Μέσα στα τείχη, η παλιά συνοικία είναι ιδανική για βόλτα με την ησυχία σας. Στην προκυμαία θα βρείτε καφέ, μαγαζιά και τα πλοία για τα άλλα νησιά.",
            "Νότια της πόλης απλώνεται ο Κάμπος, με πέτρινα αρχοντικά πίσω από ψηλούς μαντρότοιχους και παλιά περιβόλια με μανταρινιές και πορτοκαλιές. Εκεί είναι και το αεροδρόμιο.",
          ],
        },
        {
          heading: "Νέα Μονή και Ανάβατο",
          body: [
            "Στο κέντρο του νησιού, περίπου 15 χλμ. από την πόλη, βρίσκεται η Νέα Μονή, μοναστήρι του 11ου αιώνα με περίφημα ψηφιδωτά. Είναι μνημείο παγκόσμιας κληρονομιάς της UNESCO.",
            "Λίγο πιο πέρα είναι το Ανάβατο, μεσαιωνικό χωριό χτισμένο πάνω σε βράχο. Ερήμωσε μετά τη σφαγή του 1822 και είναι από τα πιο συγκινητικά μέρη του νησιού.",
          ],
        },
        {
          heading: "Τα Μαστιχοχώρια",
          body: [
            "Ο νότος της Χίου είναι ο τόπος της μαστίχας. Στο Πυργί, το «ζωγραφιστό χωριό», οι προσόψεις των σπιτιών είναι γεμάτες ασπρόμαυρα γεωμετρικά σχέδια, τα ξυστά. Τα Μεστά είναι χωριό-κάστρο, με μεσαιωνικά σοκάκια που μπλέκονται ανάμεσα στα σπίτια. Κοντά είναι και οι Ολύμποι.",
            "Για να δείτε πώς καλλιεργείται και μαζεύεται η μαστίχα, αξίζει μια επίσκεψη στο Μουσείο Μαστίχας Χίου, στο νότιο μέρος του νησιού.",
          ],
          link: "mastiha",
        },
        {
          heading: "Παραλίες",
          body: [
            "Η πιο κοντινή σε εμάς είναι το Μερσινίδι, λίγο βόρεια από τον Βροντάδο. Η θάλασσα μπροστά από το σπίτι είναι μόλις {distance} μέτρα.",
            "Ο Καρφάς, περίπου 7 χλμ. νότια της πόλης, έχει μεγάλη αμμουδιά με ταβέρνες και καφέ. Πιο νότια είναι η Κώμη, επίσης με άμμο, και στο νότιο άκρο του νησιού τα Μαύρα Βόλια, με μαύρα ηφαιστειακά βότσαλα. Στη δυτική ακτή, η παραλία Λιθί αγαπιέται για την άμμο και τις ταβέρνες της.",
          ],
          photo: "beach",
        },
        {
          heading: "Ο βορράς",
          body: [
            "Βόρεια από τον Βροντάδο, ο παραλιακός δρόμος οδηγεί στα Καρδάμυλα, στη βορειοανατολική άκρη του νησιού, χωριό ναυτικών γύρω από έναν μικρό κόλπο.",
            "Στα βορειοδυτικά, η Βολισσός είναι χτισμένη αμφιθεατρικά σε λόφο, κάτω από ένα βυζαντινό κάστρο. Είναι ένα από τα μέρη που θεωρούνται πατρίδα του Ομήρου.",
          ],
        },
        {
          heading: "Πώς θα έρθετε και πώς θα κινηθείτε",
          body: [
            "Στη Χίο έρχονται πλοία από τον Πειραιά και άλλα νησιά του Αιγαίου, και πτήσεις από την Αθήνα. Υπάρχει επίσης σύντομη ακτοπλοϊκή σύνδεση με τον Τσεσμέ· η Χίος και ο Τσεσμές είναι αδελφοποιημένες πόλεις.",
            "Το λιμάνι απέχει περίπου 4,5 χλμ. από το διαμέρισμα. Για να γυρίσετε το νησί, το πιο βολικό είναι το αυτοκίνητο· ενοικίαση αυτοκινήτων υπάρχει περίπου {carHire} μέτρα από εμάς. Πριν έρθετε, στείλτε μας μήνυμα και θα σας πούμε πώς να μας βρείτε.",
          ],
          link: "vrontados",
        },
      ],
    },
    en: {
      label: "Chios guide",
      kicker: "Chios",
      title: "A guide to Chios",
      metaTitle: "Chios travel guide: villages, beaches and sights | Mastiha Luxury Suites",
      description: "What to see on Chios from our apartment in Vrontados: Chios town and its castle, Kampos, Nea Moni, Anavatos, the mastic villages of Pyrgi and Mesta, and the best beaches.",
      intro: "Chios is the fifth-largest Greek island, in the north-eastern Aegean, just across the strait from the Turkish coast. It is an island of mastiha, medieval villages and seafarers. Our apartment is in Vrontados, just north of Chios town, so by car almost all of the island is within a day trip.",
      sections: [
        {
          heading: "Chios town and Kampos",
          body: [
            "Chios town is built around the main harbour and its medieval castle. Inside the walls, the old quarter is lovely for a slow walk. Along the harbour front you’ll find cafés, shops and the boats to the other islands.",
            "South of the town lies Kampos, with stone mansions behind high walls and old orchards of mandarin and orange trees. The island’s airport is there too.",
          ],
        },
        {
          heading: "Nea Moni and Anavatos",
          body: [
            "In the centre of the island, about 15 km from town, is Nea Moni, an 11th-century monastery famous for its mosaics and listed as a UNESCO World Heritage Site.",
            "Not far from it is Anavatos, a medieval village built on a rock. It was abandoned after the massacre of 1822 and is one of the most moving places on the island.",
          ],
        },
        {
          heading: "The mastic villages",
          body: [
            "The south of Chios is mastiha country. In Pyrgi, the “painted village”, the houses are covered in black-and-white geometric patterns called xysta. Mesta is a village-castle, with medieval lanes that wind between the houses. Olympi is close by.",
            "To see how mastiha is grown and harvested, visit the Chios Mastic Museum in the south of the island.",
          ],
          link: "mastiha",
        },
        {
          heading: "Beaches",
          body: [
            "The closest to us is Mersinidi, a short way north of Vrontados. The sea in front of the house is only {distance} metres away.",
            "Karfas, about 7 km south of Chios town, has a long sandy beach with tavernas and cafés. Further south is Komi, also sandy, and at the southern tip of the island Mavra Volia, a beach of black volcanic pebbles. On the west coast, Lithi beach is loved for its sand and its tavernas.",
          ],
          photo: "beach",
        },
        {
          heading: "The north",
          body: [
            "North of Vrontados the coast road leads to Kardamyla, in the north-eastern corner of the island, a village of seafarers around a small bay.",
            "In the north-west, Volissos rises like an amphitheatre on a hill below a Byzantine castle. It is one of the places said to be the birthplace of Homer.",
          ],
        },
        {
          heading: "Getting here and getting around",
          body: [
            "Chios has ferries from Piraeus and other Aegean islands, and flights from Athens. There is also a short ferry crossing from Çeşme in Turkey; Chios and Çeşme are twin towns.",
            "The port is about 4.5 km from the apartment. A car is the easiest way to see the island, and there is a car rental about {carHire} metres from us. Before you arrive, message us and we’ll tell you how to find us.",
          ],
          link: "vrontados",
        },
      ],
    },
    tr: {
      label: "Sakız Adası rehberi",
      kicker: "Sakız Adası",
      title: "Sakız Adası rehberi",
      metaTitle: "Sakız Adası rehberi: köyler, plajlar ve görülecek yerler | Mastiha Luxury Suites",
      description: "Vrontados’taki dairemizden Sakız Adası’nda neler görülür: Sakız kenti ve kalesi, Kampos, Nea Moni, Anavatos, Pyrgi ile Mesta’nın sakız köyleri ve en güzel plajlar.",
      intro: "Sakız Adası, Kuzeydoğu Ege’de, Türkiye kıyısının hemen karşısında, Yunanistan’ın beşinci büyük adasıdır. Sakızın, Orta Çağ köylerinin ve denizcilerin adasıdır. Dairemiz Sakız kentinin hemen kuzeyindeki Vrontados’ta; arabayla adanın neredeyse her yeri günübirlik gezi mesafesinde.",
      sections: [
        {
          heading: "Sakız kenti ve Kampos",
          body: [
            "Sakız kenti, ana liman ve Orta Çağ kalesinin çevresine kurulmuştur. Surların içindeki eski mahalle sakin bir yürüyüş için idealdir. Liman boyunca kafeler, dükkânlar ve diğer adalara giden gemiler bulunur.",
            "Kentin güneyinde, yüksek duvarların ardındaki taş konakları ve eski mandalina ve portakal bahçeleriyle Kampos uzanır. Havalimanı da buradadır.",
          ],
        },
        {
          heading: "Nea Moni ve Anavatos",
          body: [
            "Adanın ortasında, kente yaklaşık 15 km uzaklıkta, mozaikleriyle ünlü 11. yüzyıldan kalma Nea Moni manastırı bulunur; UNESCO Dünya Mirası Listesi’ndedir.",
            "Biraz ileride, bir kayanın üzerine kurulmuş Orta Çağ köyü Anavatos var. 1822 katliamından sonra terk edilen köy, adanın en etkileyici yerlerinden biridir.",
          ],
        },
        {
          heading: "Sakız köyleri",
          body: [
            "Adanın güneyi sakızın memleketidir. “Boyalı köy” Pyrgi’de evlerin cepheleri xysta denen siyah beyaz geometrik desenlerle kaplıdır. Mesta, evlerin arasında kıvrılan Orta Çağ sokaklarıyla bir kale-köydür. Olympi de yakındadır.",
            "Sakızın nasıl yetiştirilip toplandığını görmek için adanın güneyindeki Sakız Müzesi’ni ziyaret edin.",
          ],
          link: "mastiha",
        },
        {
          heading: "Plajlar",
          body: [
            "Bize en yakın plaj, Vrontados’un biraz kuzeyindeki Mersinidi. Evin önündeki deniz yalnızca {distance} metre uzakta.",
            "Sakız kentinin yaklaşık 7 km güneyindeki Karfas’ın uzun bir kumsalı, tavernaları ve kafeleri var. Daha güneyde yine kumsal olan Komi, adanın güney ucunda da siyah volkanik çakıllı Mavra Volia bulunur. Batı kıyısındaki Lithi plajı ise kumu ve tavernalarıyla sevilir.",
          ],
          photo: "beach",
        },
        {
          heading: "Kuzey",
          body: [
            "Vrontados’un kuzeyinde sahil yolu, adanın kuzeydoğu ucunda küçük bir koyun çevresine kurulmuş denizci köyü Kardamyla’ya gider.",
            "Kuzeybatıda Volissos, bir Bizans kalesinin altında, tepeye amfitiyatro gibi kurulmuştur. Homeros’un doğduğu söylenen yerlerden biridir.",
          ],
        },
        {
          heading: "Ulaşım",
          body: [
            "Sakız Adası’na Pire’den ve diğer Ege adalarından feribotlar, Atina’dan da uçuşlar var. Çeşme’den kısa bir feribot yolculuğuyla da gelebilirsiniz; Sakız ve Çeşme kardeş şehirdir.",
            "Liman daireye yaklaşık 4,5 km uzaklıkta. Adayı gezmenin en kolay yolu araba; bize yaklaşık {carHire} metre mesafede bir araç kiralama var. Gelmeden önce bize yazın, nasıl bulacağınızı anlatalım.",
          ],
          link: "vrontados",
        },
      ],
    },
  },

  vrontados: {
    el: {
      label: "Ο Βροντάδος",
      kicker: "Βροντάδος",
      title: "Ο Βροντάδος, η γειτονιά μας",
      metaTitle: "Βροντάδος Χίου: ανεμόμυλοι, Δασκαλόπετρα, ρουκετοπόλεμος | Mastiha Luxury Suites",
      description: "Ο Βροντάδος είναι παραθαλάσσια κωμόπολη λίγο βόρεια από την πόλη της Χίου: οι ανεμόμυλοι, η Δασκαλόπετρα, ο Άγνωστος Ναύτης, ο ρουκετοπόλεμος, το Μερσινίδι και μαγαζιά με τα πόδια.",
      intro: "Ο Βροντάδος είναι παραθαλάσσια κωμόπολη στην ανατολική ακτή της Χίου, λίγο βόρεια από την πόλη. Είναι τόπος ναυτικών και καπεταναίων και διεκδικεί τον τίτλο της πατρίδας του Ομήρου. Εδώ είναι και το διαμέρισμά μας, {distance} μέτρα από τη θάλασσα.",
      sections: [
        {
          heading: "Οι ανεμόμυλοι και ο Άγνωστος Ναύτης",
          body: [
            "Οι παλιοί ανεμόμυλοι στέκονται στη σειρά δίπλα στη θάλασσα, περίπου 60 μέτρα από το σπίτι.",
            "Στην παραλία θα δείτε και το άγαλμα του Άγνωστου Ναύτη, φόρο τιμής στους ναυτικούς του Βροντάδου.",
          ],
          photo: "sailor",
        },
        {
          heading: "Η Δασκαλόπετρα",
          body: [
            "Λίγο πιο πέρα στην ακτή είναι η Δασκαλόπετρα, ένας βράχος δίπλα στη θάλασσα όπου, όπως λέει η παράδοση, ο Όμηρος δίδασκε τους μαθητές του.",
          ],
        },
        {
          heading: "Ο ρουκετοπόλεμος",
          body: [
            "Το βράδυ της Ανάστασης, δύο ενορίες του Βροντάδου ρίχνουν η μία στην άλλη δεκάδες χιλιάδες χειροποίητες ρουκέτες, με στόχο το καμπαναριό της απέναντι εκκλησίας. Ο ρουκετοπόλεμος είναι γνωστός σε όλη την Ελλάδα· αν σκοπεύετε να έρθετε το Πάσχα, κλείστε νωρίς.",
          ],
          photo: "rocket-war",
        },
        {
          heading: "Για μπάνιο",
          body: [
            "Η θάλασσα είναι {distance} μέτρα από το διαμέρισμα. Για παραλία, το Μερσινίδι είναι λίγο πιο βόρεια.",
            "Ο Βροντάδος κοιτάζει ανατολικά, οπότε ο ήλιος ανατέλλει πάνω από τη θάλασσα και τα απέναντι παράλια.",
          ],
          photo: "sunrise",
        },
        {
          heading: "Μαγαζιά κοντά στο σπίτι",
          body: ["Σε λίγα λεπτά με τα πόδια θα βρείτε σούπερ μάρκετ, φούρνους, καφέ, φαρμακεία και φαγητό:"],
          nearby: true,
        },
        {
          heading: "Μέχρι την πόλη",
          body: ["Η πόλη της Χίου και το λιμάνι απέχουν περίπου 4,5 χλμ. Για τα υπόλοιπα μέρη του νησιού, δείτε τον οδηγό μας."],
          link: "chios",
        },
      ],
    },
    en: {
      label: "Vrontados",
      kicker: "Vrontados",
      title: "Vrontados, our neighbourhood",
      metaTitle: "Vrontados, Chios: windmills, Daskalopetra and the rocket war | Mastiha Luxury Suites",
      description: "Vrontados is a seaside town just north of Chios town: the windmills, Daskalopetra, the Unknown Sailor, the Easter rocket war, Mersinidi beach and shops within walking distance.",
      intro: "Vrontados is a seaside town on the east coast of Chios, just north of Chios town. It is a town of sailors and sea captains, and it claims to be the birthplace of Homer. Our apartment is here, {distance} metres from the sea.",
      sections: [
        {
          heading: "The windmills and the Unknown Sailor",
          body: [
            "A row of old windmills stands by the sea, about 60 metres from the house.",
            "On the seafront you’ll also find the statue of the Unknown Sailor, a tribute to the seafarers of Vrontados.",
          ],
          photo: "sailor",
        },
        {
          heading: "Daskalopetra",
          body: [
            "A little further along the coast is Daskalopetra, “the teacher’s stone”: a rock by the sea where, tradition says, Homer taught his students.",
          ],
        },
        {
          heading: "The Easter rocket war",
          body: [
            "On the night of the Easter Resurrection service, two parishes of Vrontados fire tens of thousands of home-made rockets at each other, aiming for the bell tower of the church opposite. The rouketopolemos is famous across Greece; if you plan to come at Easter, book early.",
          ],
          photo: "rocket-war",
        },
        {
          heading: "Swimming",
          body: [
            "The sea is {distance} metres from the apartment. For a beach, Mersinidi is a short way north.",
            "Vrontados faces east, so the sun rises over the sea and the coast across the strait.",
          ],
          photo: "sunrise",
        },
        {
          heading: "Shops near the house",
          body: ["Within a few minutes’ walk you’ll find supermarkets, bakeries, cafés, pharmacies and places to eat:"],
          nearby: true,
        },
        {
          heading: "Getting to town",
          body: ["Chios town and the port are about 4.5 km away. For the rest of the island, see our Chios guide."],
          link: "chios",
        },
      ],
    },
    tr: {
      label: "Vrontados",
      kicker: "Vrontados",
      title: "Vrontados, mahallemiz",
      metaTitle: "Vrontados, Sakız Adası: yel değirmenleri, Daskalopetra, roket savaşı | Mastiha Luxury Suites",
      description: "Vrontados, Sakız kentinin hemen kuzeyinde bir sahil kasabası: yel değirmenleri, Daskalopetra, Meçhul Denizci, Paskalya roket savaşı, Mersinidi plajı ve yürüme mesafesinde dükkânlar.",
      intro: "Vrontados, Sakız Adası’nın doğu kıyısında, Sakız kentinin hemen kuzeyinde bir sahil kasabasıdır. Denizcilerin ve kaptanların kasabasıdır ve Homeros’un doğum yeri olduğunu söyler. Dairemiz de burada, denize {distance} metre mesafede.",
      sections: [
        {
          heading: "Yel değirmenleri ve Meçhul Denizci",
          body: [
            "Eski yel değirmenleri, evden yaklaşık 60 metre uzakta, deniz kıyısında sıra hâlinde durur.",
            "Sahilde, Vrontados’un denizcilerine adanmış Meçhul Denizci heykelini de göreceksiniz.",
          ],
          photo: "sailor",
        },
        {
          heading: "Daskalopetra",
          body: [
            "Kıyı boyunca biraz ileride, “öğretmenin taşı” anlamına gelen Daskalopetra var: geleneğe göre Homeros’un öğrencilerine ders verdiği, deniz kenarındaki bir kaya.",
          ],
        },
        {
          heading: "Paskalya roket savaşı",
          body: [
            "Paskalya’da Diriliş ayini gecesi Vrontados’un iki kilise cemaati, karşı kilisenin çan kulesini hedef alarak birbirine on binlerce el yapımı roket atar. Rouketopolemos tüm Yunanistan’da ünlüdür; Paskalya’da gelmeyi düşünüyorsanız erken rezervasyon yapın.",
          ],
          photo: "rocket-war",
        },
        {
          heading: "Deniz",
          body: [
            "Deniz daireden {distance} metre uzakta. Plaj için Mersinidi biraz kuzeyde.",
            "Vrontados doğuya bakar; güneş denizin ve karşı kıyının üzerinden doğar.",
          ],
          photo: "sunrise",
        },
        {
          heading: "Evin yakınındaki dükkânlar",
          body: ["Birkaç dakikalık yürüyüşle market, fırın, kafe, eczane ve yemek yerleri bulabilirsiniz:"],
          nearby: true,
        },
        {
          heading: "Şehre ulaşım",
          body: ["Sakız kenti ve liman yaklaşık 4,5 km uzaklıkta. Adanın geri kalanı için Sakız Adası rehberimize bakın."],
          link: "chios",
        },
      ],
    },
  },

  mastiha: {
    el: {
      label: "Η μαστίχα της Χίου",
      kicker: "Μαστίχα",
      title: "Η μαστίχα, ο θησαυρός της Χίου",
      metaTitle: "Μαστίχα Χίου: τι είναι και πού θα τη δείτε | Mastiha Luxury Suites",
      description: "Η μαστίχα Χίου είναι φυσική ρητίνη από το μαστιχόδεντρο, τα «δάκρυα της Χίου». Πώς μαζεύεται, τα Μαστιχοχώρια, το Μουσείο Μαστίχας και γιατί το διαμέρισμά μας έχει το όνομά της.",
      intro: "Το διαμέρισμά μας πήρε το όνομά του από το πιο γνωστό προϊόν της Χίου. Η μαστίχα είναι φυσική ρητίνη από το μαστιχόδεντρο και καλλιεργείται στο νότιο μέρος του νησιού εδώ και αιώνες. Τη λένε και «δάκρυα της Χίου».",
      sections: [
        {
          heading: "Πώς βγαίνει η μαστίχα",
          body: [
            "Το καλοκαίρι οι μαστιχοπαραγωγοί κάνουν μικρές χαραγματιές στον κορμό των δέντρων, το λεγόμενο κέντημα. Η ρητίνη τρέχει σε σταγόνες, τα «δάκρυα», που στερεοποιούνται στον ήλιο. Μετά μαζεύονται και καθαρίζονται με το χέρι. Η συγκομιδή κρατά από τις αρχές Ιουλίου ως τις αρχές Οκτωβρίου.",
          ],
        },
        {
          heading: "Προστατευμένη και αναγνωρισμένη",
          body: [
            "Η «Μαστίχα Χίου» είναι προϊόν Προστατευόμενης Ονομασίας Προέλευσης (ΠΟΠ) στην Ευρωπαϊκή Ένωση, και η τεχνογνωσία της καλλιέργειάς της στη Χίο είναι γραμμένη στον κατάλογο της UNESCO για την Άυλη Πολιτιστική Κληρονομιά της Ανθρωπότητας.",
          ],
        },
        {
          heading: "Τα Μαστιχοχώρια",
          body: [
            "Η μαστίχα καλλιεργείται στα Μαστιχοχώρια, στο νότιο μέρος του νησιού. Τα πιο γνωστά είναι το Πυργί, το «ζωγραφιστό χωριό», και τα Μεστά, ένα μεσαιωνικό χωριό-κάστρο. Αξίζουν και τα δύο τη διαδρομή.",
          ],
          link: "chios",
        },
        {
          heading: "Το Μουσείο Μαστίχας Χίου",
          body: [
            "Το μουσείο, στο νότιο μέρος του νησιού, αφηγείται την ιστορία της μαστίχας: πώς καλλιεργούνται τα δέντρα, πώς μαζεύεται η ρητίνη και πού χρησιμοποιείται σήμερα.",
          ],
        },
        {
          heading: "Πού θα τη δοκιμάσετε",
          body: [
            "Η μαστίχα μασιέται σαν φυσική τσίχλα και αρωματίζει λικέρ, γλυκά, τσουρέκια και παγωτά. Θα τη βρείτε σε μαγαζιά σε όλο το νησί, και είναι ωραίο δώρο για να πάρετε μαζί σας.",
          ],
        },
        {
          heading: "Από τον Βροντάδο",
          body: [
            "Τα Μαστιχοχώρια είναι στο νότιο μέρος του νησιού, μια όμορφη ημερήσια εκδρομή με αυτοκίνητο από τον Βροντάδο. Ενοικίαση αυτοκινήτων υπάρχει περίπου {carHire} μέτρα από το διαμέρισμα.",
          ],
        },
      ],
    },
    en: {
      label: "Chios mastiha",
      kicker: "Mastiha",
      title: "Mastiha, the treasure of Chios",
      metaTitle: "Chios mastiha (mastic): what it is and where to see it | Mastiha Luxury Suites",
      description: "Chios mastiha is a natural resin from the mastic tree, the “tears of Chios”. How it is harvested, the mastic villages, the Mastic Museum, and why our apartment carries its name.",
      intro: "Our apartment takes its name from Chios’s best-known product. Mastiha (mastic) is a natural resin from the mastic tree, grown in the south of the island for centuries. It is also called the “tears of Chios”.",
      sections: [
        {
          heading: "How mastiha is made",
          body: [
            "In summer, growers make small cuts in the bark of the trees. The resin seeps out in drops, the “tears”, which harden in the sun and are then gathered and cleaned by hand. The harvest runs from early July to early October.",
          ],
        },
        {
          heading: "Protected and recognised",
          body: [
            "“Masticha Chiou” is a Protected Designation of Origin (PDO) in the European Union, and the know-how of growing mastic on Chios is on UNESCO’s list of the Intangible Cultural Heritage of Humanity.",
          ],
        },
        {
          heading: "The mastic villages",
          body: [
            "Mastiha is grown in the mastic villages, the Mastichochoria, in the south of the island. The best known are Pyrgi, the “painted village”, and Mesta, a medieval village-castle. Both are worth the drive.",
          ],
          link: "chios",
        },
        {
          heading: "The Chios Mastic Museum",
          body: [
            "The museum in the south of the island tells the story of mastiha: how the trees are grown, how the resin is harvested and how it is used today.",
          ],
        },
        {
          heading: "Where to taste it",
          body: [
            "Mastiha is chewed as a natural gum, and it flavours liqueurs, sweets, Easter bread and ice cream. You’ll find it in shops all over the island, and it makes a lovely gift to take home.",
          ],
        },
        {
          heading: "From Vrontados",
          body: [
            "The mastic villages are in the south of the island, a lovely day trip by car from Vrontados. There is a car rental about {carHire} metres from the apartment.",
          ],
        },
      ],
    },
    tr: {
      label: "Sakız Adası’nın mastihası",
      kicker: "Mastiha",
      title: "Mastiha, Sakız Adası’nın hazinesi",
      metaTitle: "Sakız Adası mastihası (damla sakızı): nedir, nerede görülür | Mastiha Luxury Suites",
      description: "Sakız Adası’nın mastihası, sakız ağacından elde edilen doğal bir reçinedir. Nasıl toplandığı, sakız köyleri, Sakız Müzesi ve dairemizin adını nereden aldığı.",
      intro: "Dairemiz adını Sakız Adası’nın en ünlü ürününden alır. Mastiha (damla sakızı), sakız ağacından elde edilen doğal bir reçinedir ve yüzyıllardır adanın güneyinde yetiştirilir. Adanın Türkçe adı da buradan gelir: Sakız Adası.",
      sections: [
        {
          heading: "Mastiha nasıl elde edilir",
          body: [
            "Yazın üreticiler ağaçların gövdesine küçük çizikler atar. Reçine damla damla sızar; bu “gözyaşları” güneşte sertleşir, sonra elle toplanıp temizlenir. Hasat temmuz başından ekim başına kadar sürer.",
          ],
        },
        {
          heading: "Koruma altında",
          body: [
            "“Masticha Chiou” Avrupa Birliği’nde Korunan Menşe Adı’na (PDO) sahiptir; Sakız Adası’nda sakız yetiştirme bilgisi de UNESCO’nun İnsanlığın Somut Olmayan Kültürel Mirası listesindedir.",
          ],
        },
        {
          heading: "Sakız köyleri",
          body: [
            "Mastiha, adanın güneyindeki sakız köylerinde, yani Mastichochoria’da yetişir. En bilinenleri “boyalı köy” Pyrgi ve Orta Çağ kale-köyü Mesta’dır; ikisi de yolculuğa değer.",
          ],
          link: "chios",
        },
        {
          heading: "Sakız Müzesi",
          body: [
            "Adanın güneyindeki müze, mastihanın hikâyesini anlatır: ağaçların nasıl yetiştirildiğini, reçinenin nasıl toplandığını ve bugün nerelerde kullanıldığını.",
          ],
        },
        {
          heading: "Nerede tadılır",
          body: [
            "Mastiha doğal sakız olarak çiğnenir; likörlere, tatlılara, Paskalya çöreğine ve dondurmaya tat verir. Adanın her yerindeki dükkânlarda bulabilirsiniz; eve götürmek için de güzel bir hediyedir.",
          ],
        },
        {
          heading: "Vrontados’tan",
          body: [
            "Sakız köyleri adanın güneyinde, Vrontados’tan arabayla güzel bir günübirlik gezi. Daireye yaklaşık {carHire} metre mesafede bir araç kiralama var.",
          ],
        },
      ],
    },
  },
};
