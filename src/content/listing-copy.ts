import type { StayLocale } from './stay-copy';
const en = {
  kitchen: 'Kitchen', living: 'Living', bathroom: 'Bathroom', neighbourhood: 'Around Mastiha', familyFilter: 'Family',
  tour: 'A photographic tour', tourNote: 'Real listing photographs · scroll to explore', skip: 'Skip the photo tour', more: 'Show more photographs', less: 'Show fewer photographs',
  kitchenEyebrow: 'Settle into your own routine', kitchenTitle: 'Coffee first.\nThe day is yours.', kitchenBody: 'An oven, hob, fridge and cookware for meals at home. An espresso machine for the morning. The dining table and the small work desk share the living space.',
  neighbourhoodTitle: 'Beyond the front door.', neighbourhoodBody: 'Photographs of Vrontados and the surrounding island from our listing. These are places to explore, not views promised from the apartment.',
  bedroomBody: 'A king bed in the main bedroom, a single bed in the second, and a sofa bed in the living room. The home sleeps up to four guests in total.',
  familyEyebrow: 'For little travellers', familyTitle: 'Small guests.\nThought through.', familyBody: 'Booking.com currently lists a free cot for ages 0–3 and welcomes children of all ages. Ask Athina before arrival so the family setup can be ready when you get there.', familyItems: ['Free cot · ages 0–3','Children of all ages welcome','Family-friendly stay'],
  hostEyebrow: 'Your host', hostTitle: 'Hosted by Athina.', hostBody: 'Ask about arrival, the cot or high chair, and the details that matter for your stay. Contact Athina through the Airbnb listing; availability and arrangements are confirmed with your reservation.', hostAction: 'Meet your host on Airbnb',
  faqs: [
    {q:'Can I work from the apartment?',a:'Wi-Fi and a small work desk are shown in the listing. Internet performance varies; check any specific work requirements with the host.'},
    {q:'What is available for children?',a:'The listing shows a cot, playpen, high chair and toys. Request the equipment you need when booking, as availability must be confirmed.'},
    {q:'What is nearby?',a:'The host describes the sea as approximately 40 metres away, with supermarkets, cafés and other local shops nearby. Chios town is described as about eight minutes by car, depending on traffic.'},
  ],
};
type Copy = typeof en;
const el: Copy = {
  kitchen:'Κουζίνα', living:'Καθιστικό', bathroom:'Μπάνιο', neighbourhood:'Γύρω από το Mastiha', familyFilter:'Οικογένεια',
  tour:'Φωτογραφική περιήγηση', tourNote:'Πραγματικές φωτογραφίες · κυλήστε για περιήγηση', skip:'Παράλειψη φωτογραφικής περιήγησης', more:'Περισσότερες φωτογραφίες', less:'Λιγότερες φωτογραφίες',
  kitchenEyebrow:'Ο δικός σας καθημερινός ρυθμός', kitchenTitle:'Πρώτα ο καφές.\nΜετά, η μέρα σας.', kitchenBody:'Φούρνος, εστίες, ψυγείο και μαγειρικά σκεύη για τα γεύματά σας. Μηχανή espresso για το πρωί. Η τραπεζαρία και το μικρό γραφείο βρίσκονται στον χώρο του καθιστικού.',
  neighbourhoodTitle:'Πέρα από την πόρτα.', neighbourhoodBody:'Φωτογραφίες του Βροντάδου και του νησιού από την καταχώρισή μας. Πρόκειται για μέρη που μπορείτε να εξερευνήσετε, όχι για θέα από το διαμέρισμα.',
  bedroomBody:'King-size κρεβάτι στο κύριο υπνοδωμάτιο, μονό στο δεύτερο και καναπές-κρεβάτι στο καθιστικό. Το σπίτι φιλοξενεί έως τέσσερις επισκέπτες συνολικά.',
  familyEyebrow:'Για τους μικρούς επισκέπτες', familyTitle:'Μικροί επισκέπτες.\nΜεγάλη φροντίδα.', familyBody:'Το Booking.com αναφέρει δωρεάν βρεφική κούνια για ηλικίες 0–3 ετών και δέχεται παιδιά όλων των ηλικιών. Ενημερώστε την Αθηνά πριν την άφιξη ώστε η οικογενειακή διαμόρφωση να είναι έτοιμη.', familyItems:['Δωρεάν κούνια · 0–3 ετών','Παιδιά όλων των ηλικιών','Οικογενειακή διαμονή'],
  hostEyebrow:'Η οικοδέσποινά σας', hostTitle:'Η Αθηνά σάς υποδέχεται.', hostBody:'Ρωτήστε για την άφιξη, το βρεφικό κρεβάτι ή το καρεκλάκι και όσα χρειάζεστε για τη διαμονή σας. Επικοινωνήστε με την Αθηνά από την καταχώριση του Airbnb· οι παροχές και οι συνεννοήσεις επιβεβαιώνονται με την κράτησή σας.', hostAction:'Γνωρίστε την οικοδέσποινα στο Airbnb',
  faqs:[
    {q:'Μπορώ να εργαστώ από το διαμέρισμα;',a:'Στην καταχώριση αναφέρονται Wi-Fi και μικρό γραφείο εργασίας. Η απόδοση της σύνδεσης μεταβάλλεται· συζητήστε τυχόν ειδικές απαιτήσεις με την οικοδέσποινα.'},
    {q:'Τι υπάρχει για παιδιά;',a:'Στην καταχώριση παρουσιάζονται βρεφικό κρεβάτι, παρκοκρέβατο, καρεκλάκι και παιχνίδια. Ζητήστε τον εξοπλισμό που χρειάζεστε κατά την κράτηση, ώστε να επιβεβαιωθεί η διαθεσιμότητά του.'},
    {q:'Τι βρίσκεται κοντά;',a:'Η οικοδέσποινα αναφέρει ότι η ακτή απέχει περίπου 40 μέτρα και ότι υπάρχουν κοντά σούπερ μάρκετ, καφέ και τοπικά καταστήματα. Η πόλη της Χίου αναφέρεται σε απόσταση περίπου οκτώ λεπτών με αυτοκίνητο, ανάλογα με την κίνηση.'},
  ],
};
const tr: Copy = {
  kitchen:'Mutfak', living:'Yaşam alanı', bathroom:'Banyo', neighbourhood:'Mastiha çevresi', familyFilter:'Aile',
  tour:'Fotoğraflarla bir gezinti', tourNote:'Gerçek ilan fotoğrafları · keşfetmek için kaydırın', skip:'Fotoğraf gezintisini atla', more:'Daha fazla fotoğraf', less:'Daha az fotoğraf',
  kitchenEyebrow:'Kendi günlük ritminiz', kitchenTitle:'Önce kahve.\nSonra gün sizin.', kitchenBody:'Evde yemek hazırlamak için fırın, ocak, buzdolabı ve mutfak gereçleri. Sabah için espresso makinesi. Yemek masası ve küçük çalışma masası yaşam alanında yer alır.',
  neighbourhoodTitle:'Kapının ötesinde.', neighbourhoodBody:'İlanımızdan Vrontados ve ada çevresinin fotoğrafları. Bunlar keşfedilecek yerlerdir; daireden görülen manzaralar olarak sunulmaz.',
  bedroomBody:'Ana odada king yatak, ikinci odada tek kişilik yatak ve oturma odasında çekyat bulunur. Ev toplam en fazla dört misafir ağırlayabilir.',
  familyEyebrow:'Küçük misafirler için', familyTitle:'Küçük misafirler.\nÖzenle düşünülmüş.', familyBody:'Booking.com şu anda 0–3 yaş için ücretsiz bebek yatağı listeliyor ve her yaştan çocuğu kabul ediyor. Aile düzeninin hazır olması için varıştan önce Athina’ya haber verin.', familyItems:['Ücretsiz bebek yatağı · 0–3 yaş','Her yaştan çocuk kabul edilir','Aile dostu konaklama'],
  hostEyebrow:'Ev sahibiniz', hostTitle:'Ev sahibiniz Athina.', hostBody:'Varış, bebek yatağı veya mama sandalyesi gibi ihtiyaçlarınızı Airbnb ilanı üzerinden Athina ile görüşün. Müsaitlik ve düzenlemeler rezervasyonunuzla birlikte onaylanır.', hostAction:'Airbnb’de ev sahibinizle tanışın',
  faqs:[
    {q:'Daireden çalışabilir miyim?',a:'İlanda Wi-Fi ve küçük bir çalışma masası gösterilir. İnternet performansı değişebilir; özel iş gereksinimlerinizi ev sahibinizle görüşün.'},
    {q:'Çocuklar için neler mevcut?',a:'İlanda bebek yatağı, park yatak, mama sandalyesi ve oyuncaklar gösterilir. Müsaitliği onaylamak için gereken ekipmanı rezervasyon sırasında isteyin.'},
    {q:'Yakınlarda neler var?',a:'Ev sahibi sahilin yaklaşık 40 metre uzakta olduğunu, yakınlarda marketler, kafeler ve yerel dükkânlar bulunduğunu belirtiyor. Sakız şehir merkezine trafik durumuna göre arabayla yaklaşık sekiz dakika mesafe belirtiliyor.'},
  ],
};
export function listingCopy(locale: StayLocale): Copy { return {en,el,tr}[locale]; }
