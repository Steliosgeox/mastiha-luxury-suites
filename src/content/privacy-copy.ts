import type { StayLocale } from "./stay-copy";

type Privacy = { title: string; updated: string; back: string; sections: { heading: string; body: string }[] };

export const PRIVACY_UPDATED = "2026-10-01";

export const PRIVACY_COPY: Record<StayLocale, Privacy> = {
  el: {
    title: "Απόρρητο",
    updated: "Τελευταία ενημέρωση: {date}",
    back: "Επιστροφή στην αρχική",
    sections: [
      { heading: "Ποιοι είμαστε", body: "Ο ιστότοπος ανήκει στο Mastiha Luxury Suites στον Βροντάδο Χίου (ΑΜΑ {license}). Για οτιδήποτε αφορά τα δεδομένα σας, γράψτε μας στο chat του ιστότοπου ή μέσω Airbnb." },
      { heading: "Κρατήσεις", body: "Σε αυτόν τον ιστότοπο δεν γίνονται κρατήσεις ούτε πληρωμές. Όταν κλείνετε μέσω Airbnb ή Booking.com, ισχύουν οι δικοί τους όροι απορρήτου." },
      { heading: "Αυτόματος βοηθός", body: "Τις απαντήσεις του αυτόματου βοηθού τις γράφει ένα μοντέλο τεχνητής νοημοσύνης, μόνο με όσα αναφέρει αυτός ο ιστότοπος για το σπίτι και τη γειτονιά. Για να απαντήσει, η ερώτησή σας και η συζήτηση μέχρι εκείνη τη στιγμή στέλνονται στο OpenRouter ή στο Cloudflare Workers AI, μόνο σε παρόχους που δεν κρατούν τα μηνύματα και δεν τα χρησιμοποιούν για εκπαίδευση. Αν δεν απαντήσουν, ο βοηθός απαντά με έτοιμες απαντήσεις του ιστότοπου." },
      { heading: "Συνομιλίες", body: "Κρατάμε κάθε συζήτηση στο chat, με τον βοηθό ή με την Αθηνά, και το όνομα και το email σας αν τα δώσετε, για να μπορεί η Αθηνά να τη διαβάσει και να σας απαντήσει. Αν πατήσετε «Μιλήστε με την Αθηνά», λαμβάνει ειδοποίηση. Κάθε συζήτηση διαγράφεται αυτόματα 30 ημέρες μετά το τελευταίο μήνυμα, ή νωρίτερα αν μας το ζητήσετε. Τα δεδομένα φυλάσσονται στην Ευρώπη (Φρανκφούρτη). Στον browser σας κρατάμε έναν κωδικό, ώστε η συζήτηση να συνεχίζεται αν ανανεώσετε τη σελίδα. Μη στέλνετε στοιχεία κάρτας ή διαβατηρίου στο chat." },
      { heading: "Χάρτης", body: "Ο χάρτης της Google φορτώνει μόνο αν πατήσετε «Εμφάνιση χάρτη». Από εκείνη τη στιγμή ισχύουν οι όροι της Google." },
      { heading: "Cookies και στατιστικά", body: "Δεν χρησιμοποιούμε διαφημιστικά cookies ούτε υπηρεσίες στατιστικών. Ο πάροχος φιλοξενίας (Vercel) καταγράφει τεχνικά στοιχεία, όπως τη διεύθυνση IP, για τη λειτουργία και την ασφάλεια του ιστότοπου." },
      { heading: "Τα δικαιώματά σας", body: "Μπορείτε οποιαδήποτε στιγμή να ζητήσετε αντίγραφο ή διαγραφή των μηνυμάτων σας. Γράψτε μας στο chat ή μέσω Airbnb." },
    ],
  },
  en: {
    title: "Privacy",
    updated: "Last updated: {date}",
    back: "Back to the home page",
    sections: [
      { heading: "Who we are", body: "This website belongs to Mastiha Luxury Suites in Vrontados, Chios (registration no. {license}). For anything about your data, write to us in the website chat or through Airbnb." },
      { heading: "Bookings", body: "No bookings or payments are made on this website. When you book through Airbnb or Booking.com, their privacy terms apply." },
      { heading: "Automated assistant", body: "The automated assistant’s replies are written by an AI model, using only what this website says about the apartment and the neighbourhood. To answer, your question and the conversation so far are sent to OpenRouter or Cloudflare Workers AI, only to providers that neither keep messages nor use them for training. If they don’t answer, the assistant replies with the website’s ready-made answers." },
      { heading: "Conversations", body: "We keep every chat conversation, with the assistant or with Athina, and your name and email if you give them, so that Athina can read it and reply to you. If you tap “Talk to Athina”, she gets a notification. Each conversation is deleted automatically 30 days after its last message, or sooner if you ask. The data is stored in Europe (Frankfurt). Your browser keeps a code so the conversation continues if you reload the page. Please don’t send card or passport details in the chat." },
      { heading: "Map", body: "The Google map only loads if you tap “Show map”. From then on, Google’s terms apply." },
      { heading: "Cookies and analytics", body: "We don’t use advertising cookies or analytics services. Our hosting provider (Vercel) records technical data such as IP addresses to run and secure the website." },
      { heading: "Your rights", body: "You can ask for a copy of your messages, or for them to be deleted, at any time. Write to us in the chat or through Airbnb." },
    ],
  },
  tr: {
    title: "Gizlilik",
    updated: "Son güncelleme: {date}",
    back: "Ana sayfaya dön",
    sections: [
      { heading: "Biz kimiz", body: "Bu site, Sakız Adası Vrontados’taki Mastiha Luxury Suites’e aittir (kayıt no. {license}). Verilerinizle ilgili her konuda bize sitedeki sohbetten veya Airbnb üzerinden yazın." },
      { heading: "Rezervasyonlar", body: "Bu sitede rezervasyon veya ödeme yapılmaz. Airbnb veya Booking.com üzerinden rezervasyon yaptığınızda onların gizlilik koşulları geçerlidir." },
      { heading: "Otomatik asistan", body: "Otomatik asistanın yanıtlarını, yalnızca bu sitenin daire ve çevre hakkında söylediklerini kullanan bir yapay zekâ modeli yazar. Yanıt için sorunuz ve o ana kadarki sohbet OpenRouter’a veya Cloudflare Workers AI’a, yalnızca mesajları saklamayan ve eğitim için kullanmayan sağlayıcılara gönderilir. Yanıt vermezlerse asistan sitenin hazır yanıtlarıyla cevap verir." },
      { heading: "Sohbetler", body: "Athina’nın okuyup size yanıt verebilmesi için asistanla veya Athina’yla yapılan her sohbeti ve verirseniz adınızı ve e-postanızı saklarız. “Athina ile konuşun”a dokunursanız ona bildirim gider. Her sohbet, son mesajdan 30 gün sonra ya da isterseniz daha önce otomatik olarak silinir. Veriler Avrupa’da (Frankfurt) tutulur. Sayfayı yenilediğinizde sohbet devam etsin diye tarayıcınızda bir kod tutulur. Lütfen sohbette kart veya pasaport bilgisi paylaşmayın." },
      { heading: "Harita", body: "Google haritası yalnızca “Haritayı göster”e dokunursanız yüklenir. O andan itibaren Google’ın koşulları geçerlidir." },
      { heading: "Çerezler ve istatistik", body: "Reklam çerezleri veya istatistik hizmetleri kullanmıyoruz. Barındırma sağlayıcımız (Vercel), siteyi çalıştırmak ve korumak için IP adresi gibi teknik verileri kaydeder." },
      { heading: "Haklarınız", body: "Mesajlarınızın bir kopyasını veya silinmesini istediğiniz zaman isteyebilirsiniz. Bize sohbetten veya Airbnb üzerinden yazın." },
    ],
  },
};
