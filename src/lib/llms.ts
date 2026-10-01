import { faqItems } from "@/content/faq";
import { nearbyPlaces, neighbourhoodCopy, nearbyCategories } from "@/content/neighbourhood";
import { propertyData as property } from "@/content/property";
import { reviewStats } from "@/content/reviews";
import { fillCopy, getStayCopy } from "@/content/stay-copy";
import { SITE_URL } from "./site";

/*
  /llms.txt (https://llmstxt.org): the plain facts an AI assistant needs to answer questions
  about the apartment and point people to the right page. Built from the same content files
  as the website, so it says exactly what the page says.
*/
export function llmsText(): string {
  const en = getStayCopy("en");
  const el = getStayCopy("el");
  const values = { area: property.areaM2, distance: property.distanceToSeaMeters, guests: property.maxGuests, bedrooms: property.bedrooms };
  const list = (items: string[]) => items.map(item => `- ${item}`).join("\n");
  const checked = new Date(reviewStats.lastVerified).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const nearby = nearbyCategories.map(category => {
    const places = nearbyPlaces.filter(item => item.category === category).toSorted((a, b) => a.distanceMeters - b.distanceMeters);
    return `${neighbourhoodCopy.en.categories[category]}: ${places.map(item => `${item.id === "public-parking" ? neighbourhoodCopy.en.publicParking : item.name} (about ${item.distanceMeters} m)`).join(", ")}`;
  });

  return `# ${property.name}

> ${property.name} (Greek: Μαστίχα) is a whole ${property.areaM2} m² apartment for up to ${property.maxGuests} guests in Vrontados (Βροντάδος) on the island of Chios (Χίος), Greece, about ${property.distanceToSeaMeters} metres from the sea and about 4.5 km from Chios port. It has ${property.bedrooms} bedrooms, ${property.bathrooms} bathroom, a full kitchen, a balcony and free private parking. It is booked through Airbnb and Booking.com; the host is Athina.

The website is in Greek, English and Turkish. Prices, available dates and cancellation terms are only on the booking platforms, so send people there for anything about cost or availability.

## Pages

- [${property.name} in English](${SITE_URL}/en): the apartment, photos, amenities, reviews, location, neighbourhood and questions
- [${property.name} στα ελληνικά](${SITE_URL}/el): the same page in Greek
- [${property.name} Türkçe](${SITE_URL}/tr): the same page in Turkish
- [Privacy](${SITE_URL}/en/privacy): how the website's chat handles messages

## Booking

- [Airbnb listing](${property.bookingLinks.airbnb}): dates, prices, house rules and reviews
- [Booking.com listing](${property.bookingLinks.booking}): dates, prices, policies and reviews
- [Google Maps](${property.location.googleMapsUrl}): where the apartment is

## The apartment

${list([
    fillCopy(en.intro.body, values),
    en.bedrooms.body,
    `Kitchen: ${en.kitchen.body}`,
    `Balcony: ${en.balcony.body}`,
    `Amenities: ${Object.values(en.amenities.items).join("; ")}.`,
    `Greek short-term rental registration (ΑΜΑ): ${property.licenseNumber}.`,
  ])}

## Families

${list([en.family.body, `Available: ${en.family.items.join("; ")}.`])}

## Location

${list([
    fillCopy(en.where.body, values),
    `Postal address: Vrontados ${property.location.postalCode}, Chios, Greece. The street address is shared with guests before arrival.`,
    en.vrontados.body,
  ])}

## Nearby (approximate walking distances from the apartment)

${list(nearby)}

## Reviews

${list([
    `Airbnb: ${reviewStats.airbnb.score.toFixed(1)} out of 5 from ${reviewStats.airbnb.count} reviews, a Guest favourite (top 1% of homes).`,
    `Booking.com: ${reviewStats.booking.score} out of 10 (“${en.reviews.bookingLabel}”) from ${reviewStats.booking.count} reviews; location ${reviewStats.booking.subScores.location}.`,
    `Scores as of ${checked}. The platforms show the current figures.`,
  ])}

## Questions guests ask

${faqItems("en").map(item => `### ${item.q}\n${item.a}`).join("\n\n")}

## House rules and contact

${list([
    "Check-in and check-out times are shown in each booking; the host can sometimes arrange other times.",
    "Pets are not allowed. Smoking is not allowed inside.",
    "The host, Athina, answers questions before and during the stay: in the chat on the website, or through Airbnb or Booking.com messages.",
  ])}

## In Greek (στα ελληνικά)

${list([fillCopy(el.intro.body, values), fillCopy(el.where.body, values), el.vrontados.body, el.family.body])}
`;
}
