from pathlib import Path
import json, re, hashlib

# Applies only to the reviewed integration source recovered by the workflow.
def change(path, old, new):
    p = Path(path); text = p.read_text()
    if old not in text:
        raise RuntimeError('Missing patch anchor in ' + path + ': ' + old[:90])
    p.write_text(text.replace(old, new))

def fields(path, values):
    p = Path(path); text = p.read_text()
    for key, translations in values.items():
        pattern = r'\b' + re.escape(key) + r'\s*:\s*(?:\'(?:\\.|[^\'\\])*\'|"(?:\\.|[^"\\])*")'
        matches = list(re.finditer(pattern, text))
        assert len(matches) == 3, (path, key, len(matches))
        for match, value in reversed(list(zip(matches, translations))):
            text = text[:match.start()] + key + ': ' + json.dumps(value, ensure_ascii=False) + text[match.end():]
    p.write_text(text)

# Next can reconstruct request.url using an internal localhost origin. Check the
# actual HTTP Host (not an arbitrary forwarded-host) while retaining strict
# origin, scheme and Fetch Metadata checks. Vercel's public routes are HTTPS.
change('src/lib/assistant/http.ts',
    "  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) throw new RequestFailure(403, 'Cross-origin requests are not accepted.');",
    """  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const protocol = process.env.VERCEL === '1' ? 'https:' : url.protocol;
  let expectedOrigin = '';
  try {
    const publicUrl = new URL(`${protocol}//${host}`);
    if (publicUrl.host !== host || publicUrl.username || publicUrl.password || publicUrl.pathname !== '/') throw new Error('Invalid host');
    expectedOrigin = publicUrl.origin;
  } catch { throw new RequestFailure(403, 'Invalid request origin.'); }
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== expectedOrigin)) throw new RequestFailure(403, 'Cross-origin requests are not accepted.');""")

# Capture the opener before React unmounts the closed-state toggle. Do not
# overwrite it with document.body after the dialog has already opened.
change('src/components/assistant/FloatingAssistant.tsx',
    '  useEffect(() => { if (openSignal > 0) setIsOpen(true); }, [openSignal]);',
    """  useEffect(() => {
    if (openSignal > 0) {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      setIsOpen(true);
    }
  }, [openSignal]);""")
change('src/components/assistant/FloatingAssistant.tsx',
    '    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;\n', '')
change('src/components/assistant/FloatingAssistant.tsx',
    '          onClick={() => setIsOpen(true)}',
    '          onClick={(event) => { openerRef.current = event.currentTarget; setIsOpen(true); }}')
change('src/components/assistant/FloatingAssistant.tsx',
    '        if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });',
    "        if (openerRef.current?.isConnected && !openerRef.current.closest('[inert]')) openerRef.current.focus({ preventScroll: true });")

# A neighbourhood reply is longer than a user question. Keep turn-specific
# limits and trim old context to a UTF-8 byte budget before submitting again.
change('src/app/api/assistant/chat/route.ts',
    'm.content.length > 1600', "m.content.length > (m.role === 'user' ? 1600 : 6000)")
change('src/components/assistant/FloatingAssistant.tsx',
    "    const abort = new AbortController(); abortRef.current = abort;\n    const timer = setTimeout(() => abort.abort(), 15000);",
    """    const outbound = history.slice(-16).map(({ role, content }) => ({ role, content }));
    const encode = () => JSON.stringify({ messages: outbound, locale: language });
    while (outbound.length > 1 && new TextEncoder().encode(encode()).byteLength > 14000) outbound.shift();
    const abort = new AbortController(); abortRef.current = abort;
    const timer = setTimeout(() => abort.abort(), 15000);""")
change('src/components/assistant/FloatingAssistant.tsx',
    """        body: JSON.stringify({
          messages: history.slice(-16).map((turn) => ({ role: turn.role, content: turn.content })),
          // The page knows which language it is being read in; the concierge
          // was guessing, and guessing wrong for every locale but Greek.
          locale: language,
        }),""", '        body: encode(),')

# Guest-facing copy speaks for Mastiha. Source evidence stays in metadata/docs.
fields('src/content/listing-copy.ts', {
    'familyTitle': ['A stay for\nthe whole family.', 'Διαμονή για\nόλη την οικογένεια.', 'Tüm aile için\nbir konaklama.'],
    'familyBody': [
        'We welcome children of all ages. A cot for ages 0–3 is available free of charge, on request and subject to availability. Tell us what you need before you arrive so we can help you plan your stay.',
        'Στο Mastiha υποδεχόμαστε παιδιά κάθε ηλικίας. Διαθέτουμε δωρεάν βρεφική κούνια για ηλικίες 0–3 ετών, κατόπιν αιτήματος και διαθεσιμότητας. Πείτε μας πριν φτάσετε τι θα χρειαστείτε, για να σας βοηθήσουμε να οργανώσετε τη διαμονή σας.',
        'Her yaştan çocuğu ağırlıyoruz. 0–3 yaş için bebek yatağını talep üzerine ve müsaitliğe bağlı olarak ücretsiz sağlıyoruz. Konaklamanızı birlikte planlayabilmemiz için gelmeden önce ihtiyaçlarınızı bize bildirin.'
    ],
    'tourNote': ['Scroll to explore our home', 'Γνωρίστε τους χώρους μας', 'Evimizi keşfetmek için kaydırın'],
    'hostBody': [
        'I’m Athina, your host. Have a question about arriving or staying with the children? Send me a message through Airbnb and we’ll arrange the details together.',
        'Είμαι η Αθηνά, η οικοδέσποινά σας. Έχετε κάποια ερώτηση για την άφιξη ή τη διαμονή με τα παιδιά; Στείλτε μου μήνυμα στο Airbnb για να συνεννοηθούμε πριν φτάσετε.',
        'Ben Athina, ev sahibiniz. Varışınız veya çocuklarla konaklamanız hakkında bir sorunuz mu var? Airbnb üzerinden bana yazın, ayrıntıları birlikte planlayalım.'
    ],
    'neighbourhoodBody': [
        'A few places we love around Vrontados and Chios. These photographs show the surrounding area, not the view from the apartment.',
        'Μερικά από τα αγαπημένα μας μέρη στον Βροντάδο και στη Χίο. Οι φωτογραφίες δείχνουν τη γύρω περιοχή, όχι τη θέα από το διαμέρισμα.',
        'Vrontados ve Sakız çevresinde sevdiğimiz birkaç yer. Fotoğraflar dairenin manzarasını değil, çevredeki yerleri gösterir.'
    ]
})
faq_changes = {
    'Wi-Fi and a small work desk are shown in the listing. Internet performance varies; check any specific work requirements with the host.': 'We provide Wi-Fi and a small desk. For a stay with particular work or connection requirements, get in touch before booking.',
    'Στην καταχώριση αναφέρονται Wi-Fi και μικρό γραφείο εργασίας. Η απόδοση της σύνδεσης μεταβάλλεται· συζητήστε τυχόν ειδικές απαιτήσεις με την οικοδέσποινα.': 'Διαθέτουμε Wi-Fi και μικρό γραφείο. Αν έχετε συγκεκριμένες ανάγκες για τη δουλειά ή τη σύνδεσή σας, μιλήστε μαζί μας πριν από την κράτηση.',
    'İlanda Wi-Fi ve küçük bir çalışma masası gösterilir. İnternet performansı değişebilir; özel iş gereksinimlerinizi ev sahibinizle görüşün.': 'Wi-Fi ve küçük bir çalışma masası sunuyoruz. İşiniz için özel bağlantı gereksinimleriniz varsa rezervasyondan önce bize yazın.',
    'Στην καταχώριση παρουσιάζονται βρεφικό κρεβάτι, παρκοκρέβατο, καρεκλάκι και παιχνίδια. Ζητήστε τον εξοπλισμό που χρειάζεστε κατά την κράτηση, ώστε να επιβεβαιωθεί η διαθεσιμότητά του.': 'Διαθέτουμε βρεφική κούνια, παρκοκρέβατο, καρεκλάκι φαγητού και παιχνίδια. Πείτε μας τι χρειάζεστε όταν κάνετε κράτηση, για να επιβεβαιώσουμε τη διαθεσιμότητα.',
    'İlanda bebek yatağı, park yatak, mama sandalyesi ve oyuncaklar gösterilir. Müsaitliği onaylamak için gereken ekipmanı rezervasyon sırasında isteyin.': 'Bebek yatağı, park yatak, mama sandalyesi ve oyuncaklarımız var. Müsaitliği teyit edebilmemiz için rezervasyon sırasında ihtiyaçlarınızı bize bildirin.',
    'Η οικοδέσποινα αναφέρει ότι η ακτή απέχει περίπου 40 μέτρα και ότι υπάρχουν κοντά σούπερ μάρκετ, καφέ και τοπικά καταστήματα. Η πόλη της Χίου αναφέρεται σε απόσταση περίπου οκτώ λεπτών με αυτοκίνητο, ανάλογα με την κίνηση.': 'Η ακτή απέχει περίπου 40 μέτρα. Στη γειτονιά μας θα βρείτε σούπερ μάρκετ, καφέ, φούρνους και φαρμακεία. Δείτε την ενότητα «Στη γειτονιά μας» για αποστάσεις και οδηγίες.',
    'Ev sahibi sahilin yaklaşık 40 metre uzakta olduğunu, yakınlarda marketler, kafeler ve yerel dükkânlar bulunduğunu belirtiyor. Sakız şehir merkezine trafik durumuna göre arabayla yaklaşık sekiz dakika mesafe belirtiliyor.': 'Sahil yaklaşık 40 metre uzaklıkta. Mahallemizde marketler, kafeler, fırınlar ve eczaneler var. Mesafeler ve yol tarifleri için mahalle bölümüne bakın.'
}
p = Path('src/content/listing-copy.ts'); text = p.read_text()
for old, new in faq_changes.items():
    assert old in text, old
    text = text.replace(old, new)
# English FAQ wording varies slightly across the recovered revisions: replace
# the two answers by their stable question rather than silently missing one.
for question, answer in [
    ('What is available for children?', 'We have a cot, playpen, high chair and toys. Tell us what you need when booking so we can confirm availability.'),
    ('What is nearby?', 'The shoreline is about 40 metres away, with supermarkets, cafes, bakeries and pharmacies nearby. Our neighbourhood guide has the distances and directions.')
]:
    pattern = r"(\{q:'" + re.escape(question) + r"',a:)'(?:\\.|[^'\\])*'"
    text, n = re.subn(pattern, lambda m: m.group(1) + json.dumps(answer), text)
    assert n == 1, question
p.write_text(text)

fields('src/content/stay-copy.ts', {
    'mapNote': ['Google Maps loads when you open the map.', 'Ο χάρτης Google Maps φορτώνεται όταν τον ανοίξετε.', 'Google Maps, haritayı açtığınızda yüklenir.'],
    'locationBody': [
        'The shoreline is approximately {distance} metres away. Use the map for directions, and message us before arriving if you need a hand.',
        'Η ακτή απέχει περίπου {distance} μέτρα. Δείτε τη διαδρομή στον χάρτη και στείλτε μας μήνυμα αν χρειάζεστε βοήθεια με την άφιξή σας.',
        'Sahil yaklaşık {distance} metre uzaklıkta. Yol tarifi için haritayı kullanın; varışınız için yardıma ihtiyacınız varsa bize yazın.'
    ],
    'outsideTitle': ['Step out\nand slow down.', 'Λίγη ξεκούραση\nστη βεράντα.', 'Dışarı çıkın,\nsoluklanın.'],
    'amenitiesBody': [
        'Wi-Fi, air conditioning, a washing machine and a well-equipped kitchen for a comfortable stay.',
        'Wi-Fi, κλιματισμός, πλυντήριο ρούχων και εξοπλισμένη κουζίνα για μια άνετη διαμονή.',
        'Rahat bir konaklama için Wi-Fi, klima, çamaşır makinesi ve donanımlı bir mutfak.'
    ]
})
for old, new in [
    ('Free private parking is listed for the property. Ask your host for the arrival instructions.', 'We offer free private parking. Message us before you arrive for directions.'),
    ('Στις παροχές αναφέρεται δωρεάν ιδιωτικό πάρκινγκ. Ζητήστε οδηγίες άφιξης από τον οικοδεσπότη.', 'Διαθέτουμε δωρεάν ιδιωτικό πάρκινγκ. Στείλτε μας μήνυμα πριν φτάσετε για οδηγίες.'),
    ('Confirm check-in and check-out with the host through your reservation. This website does not override the terms of your booking.', 'Please confirm your arrival and departure times with us through your reservation.'),
    ('Επιβεβαιώστε τις ώρες με τον οικοδεσπότη μέσα από την κράτησή σας. Ο ιστότοπος δεν αντικαθιστά τους όρους της κράτησης.', 'Επικοινωνήστε μαζί μας από την κράτησή σας για να συνεννοηθούμε για τις ώρες άφιξης και αναχώρησης.')
]: change('src/content/stay-copy.ts', old, new)

fields('src/content/neighbourhood.ts', {
    'noMap': ['Ρωτήστε μας για οδηγίες', 'Ask us for directions', 'Yol tarifi için bize sorun'],
    'note': [
        'Ενδεικτικές αποστάσεις από το Mastiha. Ελέγξτε το ωράριο πριν από την επίσκεψή σας. Το δημόσιο πάρκινγκ είναι ξεχωριστό από το ιδιωτικό μας.',
        'Approximate distances from Mastiha. Check opening hours before visiting. The public parking area is separate from our private parking.',
        'Mastiha’dan yaklaşık mesafeler. Gitmeden önce çalışma saatlerini kontrol edin. Halka açık otopark, özel otoparkımızdan ayrıdır.'
    ]
})
fields('src/content/assistant-copy.ts', {
    'status': ['Automated property guide', 'Αυτόματος οδηγός διαμονής', 'Otomatik konaklama rehberi'],
    'handoffUnavailable': [
        'Send us a message through your Airbnb or Booking.com reservation. We’ll get back to you as soon as we can. This guide does not send messages to our team.',
        'Στείλτε μας μήνυμα από την κράτησή σας στο Airbnb ή το Booking.com. Θα σας απαντήσουμε το συντομότερο δυνατό. Ο οδηγός δεν στέλνει μηνύματα στην ομάδα μας.',
        'Airbnb veya Booking.com rezervasyonunuz üzerinden bize mesaj gönderin. En kısa sürede yanıtlayacağız. Bu rehber ekibimize mesaj göndermez.'
    ],
    'handoffInfo': [
        'Leave your name, email and message. We’ll reply as soon as we can. Please don’t include payment, passport or other sensitive details.',
        'Αφήστε το όνομα, το email και το μήνυμά σας. Θα σας απαντήσουμε το συντομότερο δυνατό. Μην συμπεριλάβετε στοιχεία πληρωμής, διαβατηρίου ή άλλα ευαίσθητα δεδομένα.',
        'Adınızı, e-postanızı ve mesajınızı bırakın. En kısa sürede yanıtlayacağız. Ödeme, pasaport veya diğer hassas bilgileri eklemeyin.'
    ]
})
fields('src/lib/assistant/guide.ts', {
    'intro': [
        'Welcome to Mastiha. I’m the automated property guide. Ask me about the apartment, staying with children, nearby places or how to book.',
        'Καλώς ήρθατε στο Mastiha. Είμαι ο αυτόματος οδηγός διαμονής. Ρωτήστε με για το διαμέρισμα, τις παροχές για παιδιά, τη γειτονιά ή την κράτησή σας.',
        'Mastiha’ya hoş geldiniz. Otomatik konaklama rehberiyim. Daire, çocuklarla konaklama, yakındaki yerler veya rezervasyon hakkında sorabilirsiniz.'
    ],
    'parking': [
        'We offer private parking. There is also a separate public parking area approximately 90 m away. Ask us for directions; spaces cannot be reserved through this guide.',
        'Διαθέτουμε ιδιωτικό πάρκινγκ. Υπάρχει επίσης ξεχωριστός δημόσιος χώρος στάθμευσης περίπου 90 μ. μακριά. Ρωτήστε μας για οδηγίες. Δεν γίνεται κράτηση θέσης από τον οδηγό.',
        'Özel otoparkımız var. Yaklaşık 90 m uzakta ayrı bir halka açık otopark da bulunur. Yol tarifi için bize sorun; bu rehberden park yeri ayırtılamaz.'
    ],
    'end': [
        'Approximate distances from Mastiha. Check opening hours before you visit.',
        'Ενδεικτικές αποστάσεις από το Mastiha. Ελέγξτε το ωράριο πριν από την επίσκεψή σας.',
        'Mastiha’dan yaklaşık mesafeler. Gitmeden önce çalışma saatlerini kontrol edin.'
    ]
})

# Clean visible captions without modifying source attribution or image hashes.
p = Path('src/content/stay-media.generated.json'); photos = json.loads(p.read_text())
for photo in photos:
    if photo['id'] == 'crib': photo['captions'] = {'en':'Cot · on request','el':'Βρεφική κούνια · κατόπιν αιτήματος','tr':'Bebek yatağı · talep üzerine'}
    if photo['id'] == 'high-chair': photo['captions'] = {'en':'High chair','el':'Καρεκλάκι φαγητού','tr':'Mama sandalyesi'}
p.write_text(json.dumps(photos, ensure_ascii=False, indent=2) + '\n')

change('tests/neighbourhood-assistant.spec.ts', "await expect(human).toContainText('not connected yet');", "await expect(human).toContainText('This guide does not send messages to our team.');")
change('tests/photo-tour.spec.ts', "'not views promised from the apartment'", "'not the view from the apartment'")

# Reject any accidental alteration of the owner's original chat presentation.
provenance = json.loads(Path('src/components/assistant/PROVENANCE.json').read_text())
assert hashlib.sha256(Path('src/components/assistant/chatbot.css').read_bytes()).hexdigest() == provenance['stylesheetSha256']
print('Assistant origin/focus fixes and three-language host copy applied; original chat stylesheet unchanged.')
