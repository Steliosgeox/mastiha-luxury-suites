import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Manual import from the visually inspected, owner-authorized Airbnb audit artifact.
// No network requests, generative edits, perspective changes or upscaling.
const root = process.argv[2];
if (!root) throw new Error('Usage: node scripts/import-reviewed-photos.mjs /path/to/review');
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, 'utf8'));
const selections = [
  [23,'living','living','Living and dining room','Καθιστικό και τραπεζαρία','Oturma ve yemek alanı'],
  [32,'master','bedrooms','Main bedroom · king bed','Κύριο υπνοδωμάτιο · king-size κρεβάτι','Ana yatak odası · king yatak'],
  [6,'kitchen','kitchen','The equipped kitchen','Η εξοπλισμένη κουζίνα','Donanımlı mutfak'],
  [56,'bathroom','bathroom','Bathroom with shower','Μπάνιο με ντους','Duşlu banyo'],
  [58,'terrace','outdoors','The apartment’s front balcony','Το μπροστινό μπαλκόνι του διαμερίσματος','Dairenin ön balkonu'],
  [46,'second','bedrooms','Second bedroom · single bed','Δεύτερο υπνοδωμάτιο · μονό κρεβάτι','İkinci yatak odası · tek kişilik yatak'],
  [2,'lounge','living','Sofa and living space','Καναπές και καθιστικό','Kanepe ve yaşam alanı'],
  [25,'table','living','The dining table','Η τραπεζαρία','Yemek masası'],
  [14,'kitchen-wide','kitchen','Kitchen and appliances','Κουζίνα και ηλεκτρικές συσκευές','Mutfak ve ev aletleri'],
  [12,'espresso','kitchen','Espresso corner','Η γωνιά του espresso','Espresso köşesi'],
  [30,'desk','living','A place to work','Χώρος για εργασία','Çalışma alanı'],
  [35,'master-wide','bedrooms','A second look at the main bedroom','Μια δεύτερη ματιά στο κύριο υπνοδωμάτιο','Ana yatak odasına başka bir bakış'],
  [44,'crib','family','Cot shown in the listing · request availability','Βρεφική κούνια · κατόπιν διαθεσιμότητας','İlanda gösterilen bebek yatağı · müsaitliği sorun'],
  [51,'second-wide','bedrooms','Second bedroom and storage','Δεύτερο υπνοδωμάτιο και αποθηκευτικός χώρος','İkinci yatak odası ve dolap'],
  [54,'basin','bathroom','Basin and bathroom detail','Νιπτήρας και λεπτομέρεια μπάνιου','Lavabo ve banyo detayı'],
  [57,'shower','bathroom','Shower details','Λεπτομέρειες του ντους','Duş detayları'],
  [68,'laundry','bathroom','In-apartment washing machine','Πλυντήριο ρούχων στο διαμέρισμα','Dairede çamaşır makinesi'],
  [64,'balcony','outdoors','Front balcony, viewed from outside','Το μπροστινό μπαλκόνι από έξω','Ön balkonun dışarıdan görünümü'],
  [66,'arrival','outdoors','Arriving at Mastiha','Άφιξη στο Mastiha','Mastiha’ya varış'],
  [71,'coast','neighbourhood','The neighbourhood seafront · not a room view','Παραλιακό μέτωπο της γειτονιάς · όχι θέα δωματίου','Mahallenin sahili · oda manzarası değildir'],
  [69,'sunrise','neighbourhood','Morning light on the nearby coast','Πρωινό φως στην κοντινή ακτή','Yakındaki sahilde sabah ışığı'],
  [70,'windmills','neighbourhood','Vrontados windmills · neighbourhood photograph','Ανεμόμυλοι Βροντάδου · φωτογραφία γειτονιάς','Vrontados yel değirmenleri · mahalle fotoğrafı'],
  [73,'beach','neighbourhood','Mersinidi beach · an island outing','Παραλία Μερσινίδι · μια εξόρμηση στο νησί','Mersinidi plajı · adada bir gezi'],
  [76,'keys','outdoors','Mastiha keys by the sea','Τα κλειδιά του Mastiha δίπλα στη θάλασσα','Deniz kenarında Mastiha anahtarları'],
  [5,'sofa-bed','living','Sofa bed prepared for an additional guest','Καναπές-κρεβάτι για επιπλέον επισκέπτη','Ek misafir için hazırlanmış çekyat'],
  [26,'smart-tv','living','55-inch Smart TV','Smart TV 55 ιντσών','55 inç Smart TV'],
  [28,'kids-corner','family','A little corner for children','Μια μικρή γωνιά για παιδιά','Çocuklar için küçük bir köşe'],
  [29,'toys','family','Toys for little guests','Παιχνίδια για τους μικρούς επισκέπτες','Küçük misafirler için oyuncaklar'],
  [31,'high-chair','family','High chair shown in the listing','Καρεκλάκι φαγητού στην καταχώριση','İlanda gösterilen mama sandalyesi'],
  [41,'playpen','family','Playpen beside the main bedroom','Παρκοκρέβατο δίπλα στο κύριο υπνοδωμάτιο','Ana yatak odasının yanında park yatak'],
  [43,'vanity','bedrooms','Bedroom vanity and illuminated mirror','Μπουντουάρ και φωτιζόμενος καθρέφτης','Yatak odası makyaj masası ve aydınlatmalı ayna'],
  [55,'bathroom-wide','bathroom','A wider view of the bathroom','Ευρύτερη άποψη του μπάνιου','Banyonun geniş görünümü'],
  [61,'balcony-wide','outdoors','Front balcony seating','Καθιστικό στο μπροστινό μπαλκόνι','Ön balkon oturma alanı'],
];
const dest = 'public/photography/airbnb';
await mkdir(dest, {recursive:true});
const photos = [];
for (const [n,id,category,en,el,tr] of selections) {
  const original = manifest.images.find(i => i.id === `photo-${String(n).padStart(2,'0')}`);
  if (!original || original.error || !original.url.includes('a0.muscache.com/')) throw new Error(`Missing validated source ${n}`);
  const bytes = await readFile(`${root}/${original.id}.webp`);
  const meta = await sharp(bytes).metadata();
  const filename = `${id}.webp`;
  await copyFile(`${root}/${original.id}.webp`, `${dest}/${filename}`);
  await sharp(bytes).resize({width:320,height:240,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toFile(`${dest}/${id}-thumb.webp`);
  const srcSet=[];
  for (const width of [640,1280]) {
    const info = await sharp(bytes).resize({width,withoutEnlargement:true}).webp({quality:84}).toFile(`${dest}/${id}-${width}.webp`);
    srcSet.push({src:`/photography/airbnb/${id}-${width}.webp`,width:info.width,height:info.height});
  }
  srcSet.push({src:`/photography/airbnb/${filename}`,width:meta.width,height:meta.height});
  photos.push({id,category,src:`/photography/airbnb/${filename}`,thumbnail:`/photography/airbnb/${id}-thumb.webp`,width:meta.width,height:meta.height,position:'50% 50%',captions:{en,el,tr},srcSet,source:{platform:'Airbnb',listingId:'1368953469779774276',page:original.source,url:original.url,sourceLabel:original.label,retrievedAt:manifest.retrievedAt,originalSha256:original.sha256,webpSha256:createHash('sha256').update(bytes).digest('hex')}});
}
await writeFile('src/content/stay-media.generated.json',JSON.stringify(photos,null,2)+'\n');
console.log(`Imported ${photos.length} real listing photographs with local responsive files and source hashes.`);
