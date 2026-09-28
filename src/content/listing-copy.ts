import type { StayLocale } from './stay-copy';
const en = {
  kitchen: 'Kitchen', living: 'Living', bathroom: 'Bathroom', neighbourhood: 'Around Mastiha', familyFilter: 'Family',
  tour: 'A photographic tour', tourNote: "Scroll to explore our home", skip: 'Skip the photo tour', more: 'Show more photographs', less: 'Show fewer photographs',
  kitchenEyebrow: 'Settle into your own routine', kitchenTitle: 'Coffee first.\nThe day is yours.', kitchenBody: 'An oven, hob, fridge and cookware for meals at home. An espresso machine for the morning. The dining table and the small work desk share the living space.',
  neighbourhoodTitle: 'Beyond the front door.', neighbourhoodBody: "A few places we love around Vrontados and Chios. These photographs show the surrounding area, not the view from the apartment.",
  bedroomBody: 'A king bed in the main bedroom, a single bed in the second, and a sofa bed in the living room. The home sleeps up to four guests in total.',
  familyEyebrow: 'For little travellers', familyTitle: "A stay for\nthe whole family.", familyBody: "We welcome children of all ages. A cot for ages 0–3 is available free of charge, on request and subject to availability. Tell us what you need before you arrive so we can help you plan your stay.", familyItems: ['Free cot · ages 0–3','Children of all ages welcome','Family-friendly stay'], familyMediaLabels: ['Playpen','Play corner','Cot · on request'],
  hostEyebrow: 'Your host', hostTitle: 'Hosted by Athina.', hostBody: "I’m Athina, your host. Have a question about arriving or staying with the children? Send me a message through Airbnb and we’ll arrange the details together.", hostAction: 'Meet your host on Airbnb',
  faqs: [
    {q:'Can I work from the apartment?',a:'We provide Wi-Fi and a small desk. For a stay with particular work or connection requirements, get in touch before booking.'},
    {q:'What is available for children?',a:"We have a cot, playpen, high chair and toys. Tell us what you need when booking so we can confirm availability."},
    {q:'What is nearby?',a:"The shoreline is about 40 metres away, with supermarkets, cafes, bakeries and pharmacies nearby. Our neighbourhood guide has the distances and directions."},
  ],
};
type Copy = typeof en;
const el: Copy = {
  kitchen:'Κουζίνα', living:'Καθιστικό', bathroom:'Μπάνιο', neighbourhood:'Γύρω από το Mastiha', familyFilter:'Οικογένεια',
  tour:'Φωτογραφική περιήγηση', tourNote: "Γνωρίστε τους χώρους μας", skip:'Παράλειψη φωτογραφικής περιήγησης', more:'Περισσότερες φωτογραφίες', less:'Λιγότερες φωτογραφίες',
  kitchenEyebrow:'Ο δικός σας καθημερινός ρυθμός', kitchenTitle:'Πρώτα ο καφές.\nΜετά, η μέρα σας.', kitchenBody:'Φούρνος, εστίες, ψυγείο και μαγειρικά σκεύη για τα γεύματά σας. Μηχανή espresso για το πρωί. Η τραπεζαρία και το μικρό γραφείο βρίσκονται στον χώρο του καθιστικού.',
  neighbourhoodTitle:'Πέρα από την πόρτα.', neighbourhoodBody: "Μερικά από τα αγαπημένα μας μέρη στον Βροντάδο και στη Χίο. Οι φωτογραφίες δείχνουν τη γύρω περιοχή, όχι τη θέα από το διαμέρισμα.",
  bedroomBody:'King-size κρεβάτι στο κύριο υπνοδωμάτιο, μονό στο δεύτερο και καναπές-κρεβάτι στο καθιστικό. Το σπίτι φιλοξενεί έως τέσσερις επισκέπτες συνολικά.',
  familyEyebrow:'Για τους μικρούς επισκέπτες', familyTitle: "Διαμονή για\nόλη την οικογένεια.", familyBody: "Στο Mastiha υποδεχόμαστε παιδιά κάθε ηλικίας. Διαθέτουμε δωρεάν βρεφική κούνια για ηλικίες 0–3 ετών, κατόπιν αιτήματος και διαθεσιμότητας. Πείτε μας πριν φτάσετε τι θα χρειαστείτε, για να σας βοηθήσουμε να οργανώσετε τη διαμονή σας.", familyItems:['Δωρεάν κούνια · 0–3 ετών','Παιδιά όλων των ηλικιών','Οικογενειακή διαμονή'], familyMediaLabels:['Παρκοκρέβατο','Γωνιά παιχνιδιού','Κούνια · κατόπιν αιτήματος'],
  hostEyebrow:'Η οικοδέσποινά σας', hostTitle:'Η Αθηνά σάς υποδέχεται.', hostBody: "Είμαι η Αθηνά, η οικοδέσποινά σας. Έχετε κάποια ερώτηση για την άφιξη ή τη διαμονή με τα παιδιά; Στείλτε μου μήνυμα στο Airbnb για να συνεννοηθούμε πριν φτάσετε.", hostAction:'Γνωρίστε την οικοδέσποινα στο Airbnb',
  faqs:[
    {q:'Μπορώ να εργαστώ από το διαμέρισμα;',a:'Διαθέτουμε Wi-Fi και μικρό γραφείο. Αν έχετε συγκεκριμένες ανάγκες για τη δουλειά ή τη σύνδεσή σας, μιλήστε μαζί μας πριν από την κράτηση.'},
    {q:'Τι υπάρχει για παιδιά;',a:'Διαθέτουμε βρεφική κούνια, παρκοκρέβατο, καρεκλάκι φαγητού και παιχνίδια. Πείτε μας τι χρειάζεστε όταν κάνετε κράτηση, για να επιβεβαιώσουμε τη διαθεσιμότητα.'},
    {q:'Τι βρίσκεται κοντά;',a:'Η ακτή απέχει περίπου 40 μέτρα. Στη γειτονιά μας θα βρείτε σούπερ μάρκετ, καφέ, φούρνους και φαρμακεία. Δείτε την ενότητα «Στη γειτονιά μας» για αποστάσεις και οδηγίες.'},
  ],
};
const tr: Copy = {
  kitchen:'Mutfak', living:'Yaşam alanı', bathroom:'Banyo', neighbourhood:'Mastiha çevresi', familyFilter:'Aile',
  tour:'Fotoğraflarla bir gezinti', tourNote: "Evimizi keşfetmek için kaydırın", skip:'Fotoğraf gezintisini atla', more:'Daha fazla fotoğraf', less:'Daha az fotoğraf',
  kitchenEyebrow:'Kendi günlük ritminiz', kitchenTitle:'Önce kahve.\nSonra gün sizin.', kitchenBody:'Evde yemek hazırlamak için fırın, ocak, buzdolabı ve mutfak gereçleri. Sabah için espresso makinesi. Yemek masası ve küçük çalışma masası yaşam alanında yer alır.',
  neighbourhoodTitle:'Kapının ötesinde.', neighbourhoodBody: "Vrontados ve Sakız çevresinde sevdiğimiz birkaç yer. Fotoğraflar dairenin manzarasını değil, çevredeki yerleri gösterir.",
  bedroomBody:'Ana odada king yatak, ikinci odada tek kişilik yatak ve oturma odasında çekyat bulunur. Ev toplam en fazla dört misafir ağırlayabilir.',
  familyEyebrow:'Küçük misafirler için', familyTitle: "Tüm aile için\nbir konaklama.", familyBody: "Her yaştan çocuğu ağırlıyoruz. 0–3 yaş için bebek yatağını talep üzerine ve müsaitliğe bağlı olarak ücretsiz sağlıyoruz. Konaklamanızı birlikte planlayabilmemiz için gelmeden önce ihtiyaçlarınızı bize bildirin.", familyItems:['Ücretsiz bebek yatağı · 0–3 yaş','Her yaştan çocuk kabul edilir','Aile dostu konaklama'], familyMediaLabels:['Park yatak','Oyun köşesi','Bebek yatağı · talep üzerine'],
  hostEyebrow:'Ev sahibiniz', hostTitle:'Ev sahibiniz Athina.', hostBody: "Ben Athina, ev sahibiniz. Varışınız veya çocuklarla konaklamanız hakkında bir sorunuz mu var? Airbnb üzerinden bana yazın, ayrıntıları birlikte planlayalım.", hostAction:'Airbnb’de ev sahibinizle tanışın',
  faqs:[
    {q:'Daireden çalışabilir miyim?',a:'Wi-Fi ve küçük bir çalışma masası sunuyoruz. İşiniz için özel bağlantı gereksinimleriniz varsa rezervasyondan önce bize yazın.'},
    {q:'Çocuklar için neler mevcut?',a:'Bebek yatağı, park yatak, mama sandalyesi ve oyuncaklarımız var. Müsaitliği teyit edebilmemiz için rezervasyon sırasında ihtiyaçlarınızı bize bildirin.'},
    {q:'Yakınlarda neler var?',a:'Sahil yaklaşık 40 metre uzaklıkta. Mahallemizde marketler, kafeler, fırınlar ve eczaneler var. Mesafeler ve yol tarifleri için mahalle bölümüne bakın.'},
  ],
};
export function listingCopy(locale: StayLocale): Copy { return {en,el,tr}[locale]; }
