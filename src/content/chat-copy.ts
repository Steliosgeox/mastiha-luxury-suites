import type { StayLocale } from "./stay-copy";

// The guest chat widget. Greek first; English and Turkish follow it.

const el = {
  open: "Άνοιγμα συνομιλίας",
  close: "Κλείσιμο συνομιλίας",
  title: "Mastiha",
  status: {
    bot: "Αυτόματος βοηθός",
    hostOnline: "Η Αθηνά είναι συνδεδεμένη",
    hostAway: "Η Αθηνά θα λάβει ειδοποίηση",
    typing: "Η Αθηνά γράφει…",
    closed: "Η συζήτηση έκλεισε",
  },
  welcome: {
    title: "Γεια σας! Πώς μπορούμε να βοηθήσουμε;",
    body: "Ρωτήστε ό,τι θέλετε για το σπίτι και τη γειτονιά. Ο αυτόματος βοηθός απαντά αμέσως.",
    suggestions: ["Τι υπάρχει κοντά;", "Έχετε κούνια για μωρό;", "Υπάρχει πάρκινγκ;", "Πώς κάνω κράτηση;"],
  },
  talkToHost: "Μιλήστε με την Αθηνά",
  talkToHostBody: "Η συζήτηση πηγαίνει απευθείας σε εκείνη.",
  placeholder: { bot: "Γράψτε την ερώτησή σας…", live: "Γράψτε στην Αθηνά…", closed: "Γράψτε για να ανοίξει ξανά η συζήτηση…" },
  send: "Αποστολή",
  names: { bot: "Αυτόματος βοηθός", host: "Αθηνά" },
  error: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
  failed: "Δεν στάλθηκε · πατήστε για επανάληψη",
  handoff: {
    title: "Μιλήστε με την Αθηνά",
    body: "Θα λάβει ειδοποίηση και θα δει και τις ερωτήσεις που κάνατε εδώ. Αν θέλετε να σας απαντήσει και με email, αφήστε το παρακάτω.",
    name: "Όνομα",
    email: "Email",
    optional: "προαιρετικό",
    privacy: "Κρατάμε τη συζήτηση μόνο για να σας απαντήσουμε και τη σβήνουμε μετά από 90 ημέρες. Μη γράφετε στοιχεία κάρτας ή διαβατηρίου.",
    privacyLink: "Απόρρητο",
    start: "Συνέχεια",
    starting: "Σύνδεση…",
    back: "Πίσω",
    unavailable: "Γράψτε στην Αθηνά από την κράτησή σας στο Airbnb ή στο Booking.com. Εκεί απαντά σε όλα τα μηνύματα.",
  },
  system: {
    handoff: "Η συζήτηση μεταφέρθηκε στην Αθηνά",
    closed: "Η Αθηνά έκλεισε τη συζήτηση",
    reopened: "Η συζήτηση άνοιξε ξανά",
  },
  newChat: "Νέα συζήτηση",
};

export type ChatCopy = typeof el;

const en: ChatCopy = {
  open: "Open chat",
  close: "Close chat",
  title: "Mastiha",
  status: {
    bot: "Automated assistant",
    hostOnline: "Athina is online",
    hostAway: "Athina will be notified",
    typing: "Athina is typing…",
    closed: "Conversation closed",
  },
  welcome: {
    title: "Hello! How can we help?",
    body: "Ask anything about the apartment and the area. The automated assistant replies straight away.",
    suggestions: ["What’s nearby?", "Do you have a baby cot?", "Is there parking?", "How do I book?"],
  },
  talkToHost: "Talk to Athina",
  talkToHostBody: "The conversation goes straight to her.",
  placeholder: { bot: "Type your question…", live: "Write to Athina…", closed: "Write to reopen the conversation…" },
  send: "Send",
  names: { bot: "Automated assistant", host: "Athina" },
  error: "Something went wrong. Please try again.",
  failed: "Not sent · tap to retry",
  handoff: {
    title: "Talk to Athina",
    body: "She’ll get a notification and see the questions you asked here. If you’d like a reply by email too, leave it below.",
    name: "Name",
    email: "Email",
    optional: "optional",
    privacy: "We keep the conversation only to reply to you and delete it after 90 days. Please don’t share card or passport details.",
    privacyLink: "Privacy",
    start: "Continue",
    starting: "Connecting…",
    back: "Back",
    unavailable: "Write to Athina from your Airbnb or Booking.com booking. She answers every message there.",
  },
  system: {
    handoff: "Conversation passed to Athina",
    closed: "Athina closed the conversation",
    reopened: "Conversation reopened",
  },
  newChat: "New conversation",
};

const tr: ChatCopy = {
  open: "Sohbeti aç",
  close: "Sohbeti kapat",
  title: "Mastiha",
  status: {
    bot: "Otomatik asistan",
    hostOnline: "Athina çevrimiçi",
    hostAway: "Athina’ya bildirim gidecek",
    typing: "Athina yazıyor…",
    closed: "Sohbet kapandı",
  },
  welcome: {
    title: "Merhaba! Nasıl yardımcı olabiliriz?",
    body: "Daire ve çevre hakkında istediğinizi sorun. Otomatik asistan hemen yanıtlar.",
    suggestions: ["Yakında neler var?", "Bebek yatağınız var mı?", "Otopark var mı?", "Nasıl rezervasyon yaparım?"],
  },
  talkToHost: "Athina ile konuşun",
  talkToHostBody: "Sohbet doğrudan ona gider.",
  placeholder: { bot: "Sorunuzu yazın…", live: "Athina’ya yazın…", closed: "Sohbeti yeniden açmak için yazın…" },
  send: "Gönder",
  names: { bot: "Otomatik asistan", host: "Athina" },
  error: "Bir sorun oluştu. Lütfen tekrar deneyin.",
  failed: "Gönderilemedi · tekrar denemek için dokunun",
  handoff: {
    title: "Athina ile konuşun",
    body: "Bir bildirim alacak ve burada sorduğunuz soruları da görecek. E-postayla da yanıt almak isterseniz aşağıya yazın.",
    name: "Ad",
    email: "E-posta",
    optional: "isteğe bağlı",
    privacy: "Sohbeti yalnızca size yanıt vermek için saklar, 90 gün sonra sileriz. Lütfen kart veya pasaport bilgisi paylaşmayın.",
    privacyLink: "Gizlilik",
    start: "Devam",
    starting: "Bağlanıyor…",
    back: "Geri",
    unavailable: "Athina’ya Airbnb veya Booking.com rezervasyonunuz üzerinden yazın. Oradaki tüm mesajları yanıtlar.",
  },
  system: {
    handoff: "Sohbet Athina’ya aktarıldı",
    closed: "Athina sohbeti kapattı",
    reopened: "Sohbet yeniden açıldı",
  },
  newChat: "Yeni sohbet",
};

export const CHAT_COPY: Record<StayLocale, ChatCopy> = { el, en, tr };
