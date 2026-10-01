import { faqItems } from "@/content/faq";
import { propertyData as property } from "@/content/property";
import { getStayCopy, normalizeStayLocale, type StayLocale } from "@/content/stay-copy";
import { stayPhotos } from "@/content/stay-media";
import { getContactChannels } from "./contact";
import { SITE_URL, descriptions } from "./site";

const place: Record<StayLocale, { locality: string; region: string; vrontados: string; chios: string; greece: string }> = {
  el: { locality: "Βροντάδος", region: "Χίος", vrontados: "Βροντάδος", chios: "Χίος", greece: "Ελλάδα" },
  en: { locality: "Vrontados", region: "Chios", vrontados: "Vrontados", chios: "Chios", greece: "Greece" },
  tr: { locality: "Vrontados", region: "Sakız Adası", vrontados: "Vrontados", chios: "Sakız Adası", greece: "Yunanistan" },
};

/** Amenities the page lists, under the names Google's vacation-rental markup uses. */
const amenities = ["ac", "heating", "wifi", "kitchen", "ovenStove", "washerDryer", "tv", "balcony", "ironingBoard", "crib", "childFriendly"];

/**
 * Schema.org data for the home page: the rental, where it is, and the answers on the page.
 * Deliberately conservative: everything here is visible on the page; no guessed coordinates,
 * no unconfirmed street address, and no review scores from other sites presented as markup.
 */
export function getStructuredData(locale = "en") {
  const lang = normalizeStayLocale(locale);
  const c = getStayCopy(lang);
  const names = place[lang];
  const page = `${SITE_URL}/${lang}`;
  const rental = `${SITE_URL}/#rental`;
  const images = stayPhotos.filter(photo => photo.category !== "neighbourhood").map(photo => ({
    "@type": "ImageObject",
    url: SITE_URL + photo.src,
    width: photo.width,
    height: photo.height,
    caption: photo.captions[lang],
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: property.name,
        alternateName: "Mastiha",
        inLanguage: ["el", "en", "tr"],
      },
      {
        "@type": "WebPage",
        "@id": `${page}#page`,
        url: page,
        name: `${property.name} · ${c.hero.kicker}`,
        description: descriptions[lang],
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": rental },
        mainEntity: { "@id": rental },
        primaryImageOfPage: images[0],
      },
      {
        "@type": "VacationRental",
        "@id": rental,
        name: property.name,
        description: descriptions[lang],
        url: page,
        image: images,
        identifier: { "@type": "PropertyValue", propertyID: "ΑΜΑ", name: "Αριθμός Μητρώου Ακινήτου", value: property.licenseNumber },
        address: {
          "@type": "PostalAddress",
          addressLocality: names.locality,
          addressRegion: names.region,
          postalCode: property.location.postalCode,
          addressCountry: "GR",
        },
        containedInPlace: {
          "@type": "Place",
          name: names.vrontados,
          sameAs: "https://en.wikipedia.org/wiki/Vrontados",
          containedInPlace: {
            "@type": "Place",
            name: names.chios,
            sameAs: "https://en.wikipedia.org/wiki/Chios",
            containedInPlace: { "@type": "Country", name: names.greece, identifier: "GR" },
          },
        },
        hasMap: property.location.googleMapsUrl,
        // The same place elsewhere: the listings, and the social profiles once they're set.
        sameAs: [property.bookingLinks.airbnb, property.bookingLinks.booking, getContactChannels().facebook, getContactChannels().instagram].filter(Boolean),
        petsAllowed: false,
        containsPlace: {
          "@type": "Apartment",
          additionalType: "EntirePlace",
          name: property.name,
          occupancy: { "@type": "QuantitativeValue", maxValue: property.maxGuests },
          floorSize: { "@type": "QuantitativeValue", value: property.areaM2, unitCode: "MTK" },
          numberOfBedrooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          bed: [
            { "@type": "BedDetails", numberOfBeds: 1, typeOfBed: "King" },
            { "@type": "BedDetails", numberOfBeds: 1, typeOfBed: "Single" },
            { "@type": "BedDetails", numberOfBeds: 1, typeOfBed: "SofaBed" },
          ],
          amenityFeature: [
            ...amenities.map(name => ({ "@type": "LocationFeatureSpecification", name, value: true })),
            { "@type": "LocationFeatureSpecification", name: c.amenities.items.parking, value: true },
          ],
          petsAllowed: false,
        },
        potentialAction: {
          "@type": "ReserveAction",
          target: [property.bookingLinks.airbnb, property.bookingLinks.booking].map(urlTemplate => ({ "@type": "EntryPoint", urlTemplate })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${page}#faq`,
        url: `${page}#information`,
        inLanguage: lang,
        isPartOf: { "@id": `${page}#page` },
        about: { "@id": rental },
        mainEntity: faqItems(lang).map(item => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}
