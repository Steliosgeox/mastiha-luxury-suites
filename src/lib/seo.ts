import { propertyData as property } from "@/content/property";
import { normalizeStayLocale } from "@/content/stay-copy";
import { stayPhotos } from "@/content/stay-media";
import { SITE_URL, descriptions } from "./site";

/**
 * Schema.org data for the home page. Deliberately conservative: no guessed coordinates,
 * no unconfirmed street address, and no third-party review scores presented as our own.
 */
export function getStructuredData(locale = "en") {
  const lang = normalizeStayLocale(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: property.name, inLanguage: ["el", "en", "tr"] },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${lang}#page`,
        url: `${SITE_URL}/${lang}`,
        name: property.name,
        description: descriptions[lang],
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: {
          "@type": "Accommodation",
          name: property.name,
          numberOfBedrooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          occupancy: { "@type": "QuantitativeValue", value: property.maxGuests },
          floorSize: { "@type": "QuantitativeValue", value: property.areaM2, unitCode: "MTK" },
          image: stayPhotos.filter(photo => photo.category !== "neighbourhood").slice(0, 6).map(photo => SITE_URL + photo.src),
          containedInPlace: { "@type": "Place", name: "Vrontados, Chios, Greece" },
        },
      },
    ],
  };
}
