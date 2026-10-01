import { createHash } from "node:crypto";
import { faqItems } from "@/content/faq";
import { nearbyPlaces } from "@/content/neighbourhood";
import { propertyData as property } from "@/content/property";
import { reviewStats as reviewData } from "@/content/reviews";
import { fillCopy, getStayCopy } from "@/content/stay-copy";

/*
  What the concierge may say, generated from the same content files the website renders.
  Change a fact there and the model learns it on the next deploy; the hash below changes
  too, which retires every cached answer built on the old facts.
*/

const values = {
  area: property.areaM2,
  guests: property.maxGuests,
  bedrooms: property.bedrooms,
  distance: property.distanceToSeaMeters,
  postal: property.location.postalCode,
};

function section(title: string, lines: string[]) {
  return `## ${title}\n${lines.filter(Boolean).map(line => `- ${line}`).join("\n")}`;
}

function build(): string {
  const el = getStayCopy("el");
  const en = getStayCopy("en");
  const say = (text: string) => fillCopy(text, values);

  const apartment = section("The apartment", [
    `${property.name}: a whole apartment (not shared) in Vrontados, Chios, Greece. ${property.areaM2} m², ${property.bedrooms} bedrooms, ${property.bathrooms} bathroom, up to ${property.maxGuests} guests.`,
    `About ${property.distanceToSeaMeters} metres from the sea and about 4.5 km from Chios port.`,
    say(en.intro.body),
    en.bedrooms.body,
    en.kitchen.body,
    en.balcony.body,
    `Amenities: ${Object.values(en.amenities.items).join("; ")}.`,
    `Greek short-term rental registration (ΑΜΑ): ${property.licenseNumber}.`,
  ]);

  const family = section("Children and babies", [en.family.body, `Items: ${en.family.items.join("; ")}.`]);

  const faq = section("Answers the host has written (English)", faqItems("en").map(item => `${item.q} ${item.a}`));
  // The host's own Greek: the model borrows this phrasing instead of translating from English.
  const greek = section("Οι απαντήσεις της οικοδέσποινας στα ελληνικά (ύφος και λεξιλόγιο για ελληνικές απαντήσεις)", [
    ...faqItems("el").map(item => `${item.q} ${item.a}`),
    say(el.intro.body),
    el.family.body,
    el.kitchen.body,
    say(el.where.body),
    el.vrontados.body,
  ]);

  const kinds: Record<string, string> = { groceries: "Supermarkets", bakery: "Bakeries", coffee: "Cafés", food: "Places to eat", pharmacy: "Pharmacies", transport: "Car hire, fuel and parking" };
  const nearby = section("Nearby places (owner-supplied walking distances, approximate)", Object.entries(kinds).map(([category, label]) =>
    `${label}: ${nearbyPlaces.filter(place => place.category === category).toSorted((a, b) => a.distanceMeters - b.distanceMeters)
      .map(place => `${place.id === "public-parking" ? "public car park" : place.name} ≈ ${place.distanceMeters} m${place.mapsUrl ? ` (${place.mapsUrl})` : ""}`).join("; ")}`));

  const area = section("Vrontados and Chios", [
    en.vrontados.body,
    "Well-known places on Chios, with their Greek names (no distances, times or prices are known): Chios town and its castle (η πόλη της Χίου, το Κάστρο); Kampos with its old mansions and citrus orchards (ο Κάμπος); the mastic villages in the south (τα Μαστιχοχώρια): Pyrgi with its black-and-white patterned facades (το Πυργί, τα ξυστά) and Mesta, a walled medieval village (τα Μεστά); the Mastic Museum near Pyrgi (το Μουσείο Μαστίχας); Nea Moni, an 11th-century monastery on the UNESCO World Heritage list (η Νέα Μονή); Anavatos, an abandoned hilltop village (το Ανάβατο); Mavra Volia, a black pebble beach at Emporios (τα Μαύρα Βόλια, στο Εμποριό); Volissos in the north-west (η Βολισσός); Daskalopetra in Vrontados (η Δασκαλόπετρα).",
  ]);

  const practical = section("Booking, contact and directions", [
    `Prices, availability and cancellation terms are only on the booking platforms: Airbnb ${property.bookingLinks.airbnb} and Booking.com ${property.bookingLinks.booking}.`,
    `Map: ${property.location.googleMapsUrl}`,
    `Directions: ${property.location.googleDirectionsUrl}`,
    "The street address is not published. Before arrival the host sends directions by message.",
    say(en.where.body),
    `Reviews (checked ${reviewData.lastVerified}): Airbnb ${reviewData.airbnb.score.toFixed(1)}/5 from ${reviewData.airbnb.count} reviews, Guest Favourite; Booking.com ${reviewData.booking.score}/10 from ${reviewData.booking.count} reviews, location ${reviewData.booking.subScores.location}/10.`,
    "Check-in and check-out times are shown in the guest's booking; the host can sometimes arrange other times.",
    "Pets are not allowed. Smoking is not allowed inside.",
    `The host is Athina (in Greek: Αθηνά, η Αθηνά, την Αθηνά). ${en.host.body}`,
  ]);

  return [apartment, family, practical, nearby, area, faq, greek].join("\n\n");
}

export const FACTS = build();

/** Changes whenever the facts or the instructions that use them change. */
export function knowledgeVersion(extra: string): string {
  return createHash("sha256").update(FACTS).update(extra).digest("hex").slice(0, 12);
}

/** URLs the concierge may link to: the ones in the facts, nothing else. */
export const ALLOWED_LINKS: ReadonlySet<string> = new Set(FACTS.match(/https:\/\/[^\s)]+/g) ?? []);
