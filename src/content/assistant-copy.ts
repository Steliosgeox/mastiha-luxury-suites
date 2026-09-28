import type { StayLocale } from './stay-copy';
const en = {
  openLabel: 'Open Mastiha assistant', closeLabel: 'Close assistant', title: 'Mastiha assistant', status: "Automated property guide", welcomeHeading: 'How can we help with your stay?',
  quickActions: { packages: 'The suite', howItWorks: 'Nearby', contact: 'Representative' },
  welcomeSuggestions: ['What is nearby?', 'What is available for children?', 'How do I book?'], conversationSuggestions: ['Nearby places', 'Family stay', 'Contact the host'],
  inputLabel: 'Your question', messageLabel: 'Message', placeholder: 'Ask about Mastiha…', sendLabel: 'Send question', error: 'Could not load an answer. Please try again.',
  handoffTitle: 'Speak with the host', handoffUnavailable: "Send us a message through your Airbnb or Booking.com reservation. We’ll get back to you as soon as we can. This guide does not send messages to our team.",
  handoffInfo: "Leave your name, email and message. We’ll reply as soon as we can. Please don’t include payment, passport or other sensitive details.",
  name: 'Name', email: 'Email', message: 'Your message', consent: 'I agree to share these details with the host so they can reply.', privacy: 'Privacy', submit: 'Send to the team', sending: 'Sending…',
  sent: 'Your message was accepted by our contact service.', unconfirmed: 'Delivery could not be confirmed. Try again with the same message or contact the host through your booking platform.', back: 'Back to the guide', emailAction: 'Open email composer', whatsappAction: 'Open WhatsApp', contact: 'Contact & social', contactButton: 'Ask about your stay',
};
type Copy = typeof en;
const el: Copy = {
  openLabel: 'Άνοιγμα βοηθού Mastiha', closeLabel: 'Κλείσιμο βοηθού', title: 'Βοηθός Mastiha', status: "Αυτόματος οδηγός διαμονής", welcomeHeading: 'Πώς μπορούμε να βοηθήσουμε με τη διαμονή σας;',
  quickActions: { packages: 'Το κατάλυμα', howItWorks: 'Στη γειτονιά', contact: 'Εκπρόσωπος' },
  welcomeSuggestions: ['Τι υπάρχει στη γειτονιά;', 'Τι υπάρχει για παιδιά;', 'Πώς κάνω κράτηση;'], conversationSuggestions: ['Στη γειτονιά', 'Οικογενειακή διαμονή', 'Επικοινωνία με οικοδέσποινα'],
  inputLabel: 'Η ερώτησή σας', messageLabel: 'Μήνυμα', placeholder: 'Ρωτήστε για το Mastiha…', sendLabel: 'Αποστολή ερώτησης', error: 'Δεν φορτώθηκε η απάντηση. Δοκιμάστε ξανά.',
  handoffTitle: 'Μιλήστε με την οικοδέσποινα', handoffUnavailable: "Στείλτε μας μήνυμα από την κράτησή σας στο Airbnb ή το Booking.com. Θα σας απαντήσουμε το συντομότερο δυνατό. Ο οδηγός δεν στέλνει μηνύματα στην ομάδα μας.",
  handoffInfo: "Αφήστε το όνομα, το email και το μήνυμά σας. Θα σας απαντήσουμε το συντομότερο δυνατό. Μην συμπεριλάβετε στοιχεία πληρωμής, διαβατηρίου ή άλλα ευαίσθητα δεδομένα.",
  name: 'Όνομα', email: 'Email', message: 'Το μήνυμά σας', consent: 'Συμφωνώ να κοινοποιηθούν αυτά τα στοιχεία στην οικοδέσποινα για να μου απαντήσει.', privacy: 'Απόρρητο', submit: 'Αποστολή στην ομάδα', sending: 'Αποστολή…',
  sent: 'Το μήνυμά σας έγινε αποδεκτό από την υπηρεσία επικοινωνίας.', unconfirmed: 'Δεν επιβεβαιώθηκε η παράδοση. Δοκιμάστε ξανά με το ίδιο μήνυμα ή επικοινωνήστε από την πλατφόρμα κράτησης.', back: 'Επιστροφή στον οδηγό', emailAction: 'Άνοιγμα email', whatsappAction: 'Άνοιγμα WhatsApp', contact: 'Επικοινωνία & social', contactButton: 'Ρωτήστε για τη διαμονή σας',
};
const tr: Copy = {
  openLabel: 'Mastiha asistanını aç', closeLabel: 'Asistanı kapat', title: 'Mastiha asistanı', status: "Otomatik konaklama rehberi", welcomeHeading: 'Konaklamanız için nasıl yardımcı olabiliriz?',
  quickActions: { packages: 'Daire', howItWorks: 'Yakınlarda', contact: 'Temsilci' },
  welcomeSuggestions: ['Yakınlarda neler var?', 'Çocuklar için neler mevcut?', 'Nasıl rezervasyon yaparım?'], conversationSuggestions: ['Yakındaki yerler', 'Aile konaklaması', 'Ev sahibiyle iletişim'],
  inputLabel: 'Sorunuz', messageLabel: 'Mesaj', placeholder: 'Mastiha hakkında sorun…', sendLabel: 'Soruyu gönder', error: 'Yanıt yüklenemedi. Lütfen tekrar deneyin.',
  handoffTitle: 'Ev sahibiyle görüşün', handoffUnavailable: "Airbnb veya Booking.com rezervasyonunuz üzerinden bize mesaj gönderin. En kısa sürede yanıtlayacağız. Bu rehber ekibimize mesaj göndermez.",
  handoffInfo: "Adınızı, e-postanızı ve mesajınızı bırakın. En kısa sürede yanıtlayacağız. Ödeme, pasaport veya diğer hassas bilgileri eklemeyin.",
  name: 'Ad', email: 'E-posta', message: 'Mesajınız', consent: 'Yanıt alabilmek için bu bilgilerin ev sahibiyle paylaşılmasını kabul ediyorum.', privacy: 'Gizlilik', submit: 'Ekibe gönder', sending: 'Gönderiliyor…',
  sent: 'Mesajınız iletişim hizmeti tarafından kabul edildi.', unconfirmed: 'Teslimat doğrulanamadı. Aynı mesajla tekrar deneyin veya rezervasyon platformundan iletişime geçin.', back: 'Rehbere dön', emailAction: 'E-posta uygulamasını aç', whatsappAction: 'WhatsApp’ı aç', contact: 'İletişim & sosyal medya', contactButton: 'Konaklamanız hakkında sorun',
};
export const ASSISTANT_COPY: Record<StayLocale, Copy> = { en, el, tr };
