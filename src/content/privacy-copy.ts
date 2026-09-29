import type { StayLocale } from "./stay-copy";

type Privacy = { title: string; updated: string; back: string; sections: { heading: string; body: string }[] };

export const PRIVACY_UPDATED = "2026-09-29";

export const PRIVACY_COPY: Record<StayLocale, Privacy> = {
  el: {
    title: "Απόρρητο",
    updated: "Τελευταία ενημέρωση: {date}",
    back: "Επιστροφή στην αρχική",
    sections: [
      { heading: "Ποιοι είμαστε", body: "Ο ιστότοπος ανήκει στο Mastiha Luxury Suites στον Βροντάδο Χίου (ΑΜΑ {license}). Για οτιδήποτε αφορά τα δεδομένα σας, γράψτε μας στο chat του ιστότοπου ή μέσω Airbnb." },
      { heading: "Κρατήσεις", body: "Σε αυτόν τον ιστότοπο δεν γίνονται κρατήσεις ούτε πληρωμές. Όταν κλείνετε μέσω Airbnb ή Booking.com, ισχύουν οι δικοί τους όροι απορρήτου." },
      { heading: "Αυτόματος βοηθός", body: "Οι ερωτήσεις που γράφετε στον αυτόματο βοηθό στέλνονται στον server μας μόνο για να βρεθεί η απάντηση από τα στοιχεία του σπιτιού και της γειτονιάς. Δεν αποθηκεύονται και δεν χρησιμοποιείται εξωτερική υπηρεσία τεχνητής νοημοσύνης." },
      { heading: "Συνομιλία με την Αθηνά", body: "Αν πατήσετε «Μιλήστε με την Αθηνά», αποθηκεύουμε τη συζήτηση, μαζί με τις ερωτήσεις που κάνατε ήδη στον βοηθό, και το όνομα και το email σας αν τα δώσετε. Τα χρησιμοποιούμε μόνο για να σας απαντήσουμε. Η συζήτηση διαγράφεται αυτόματα 90 ημέρες μετά το τελευταίο μήνυμα, ή νωρίτερα αν μας το ζητήσετε. Στον browser σας κρατάμε έναν κωδικό, ώστε η συζήτηση να συνεχίζεται αν ανανεώσετε τη σελίδα. Μη στέλνετε στοιχεία κάρτας ή διαβατηρίου στο chat." },
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
      { heading: "Automated assistant", body: "Questions you type into the automated assistant are sent to our server only to find the answer in the apartment and neighbourhood information. They are not stored, and no external AI service is used." },
      { heading: "Chatting with Athina", body: "If you tap “Talk to Athina”, we store the conversation, including the questions you already asked the assistant, and your name and email if you give them. We use them only to reply to you. The conversation is deleted automatically 90 days after the last message, or sooner if you ask. Your browser keeps a code so the conversation continues if you reload the page. Please don’t send card or passport details in the chat." },
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
      { heading: "Otomatik asistan", body: "Otomatik asistana yazdığınız sorular yalnızca daire ve çevre bilgilerinden yanıt bulmak için sunucumuza gönderilir. Saklanmaz ve harici bir yapay zekâ hizmeti kullanılmaz." },
      { heading: "Athina ile sohbet", body: "“Athina ile konuşun”a dokunursanız sohbeti, asistana daha önce sorduğunuz sorularla birlikte, ve verirseniz adınızı ve e-postanızı saklarız. Bunları yalnızca size yanıt vermek için kullanırız. Sohbet, son mesajdan 90 gün sonra ya da isterseniz daha önce otomatik olarak silinir. Sayfayı yenilediğinizde sohbet devam etsin diye tarayıcınızda bir kod tutulur. Lütfen sohbette kart veya pasaport bilgisi paylaşmayın." },
      { heading: "Harita", body: "Google haritası yalnızca “Haritayı göster”e dokunursanız yüklenir. O andan itibaren Google’ın koşulları geçerlidir." },
      { heading: "Çerezler ve istatistik", body: "Reklam çerezleri veya istatistik hizmetleri kullanmıyoruz. Barındırma sağlayıcımız (Vercel), siteyi çalıştırmak ve korumak için IP adresi gibi teknik verileri kaydeder." },
      { heading: "Haklarınız", body: "Mesajlarınızın bir kopyasını veya silinmesini istediğiniz zaman isteyebilirsiniz. Bize sohbetten veya Airbnb üzerinden yazın." },
    ],
  },
};
