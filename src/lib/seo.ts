import { propertyData } from "@/content/property";
import { reviewStats } from "@/content/reviews";

export function getStructuredData(locale: string = "en", siteUrl: string = "https://mastihasuites.gr") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VacationRental",
        "@id": `${siteUrl}/#property`,
        name: propertyData.name,
        description:
          "Private 75 m² entire vacation home in Vrontados, Chios, moments from the Aegean with two bedrooms, sea views, dedicated private parking, and modern amenities.",
        url: `${siteUrl}/${locale}`,
        containedInPlace: {
          "@type": "Place",
          name: "Vrontados, Chios Island, Greece",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: propertyData.location.address,
          addressLocality: "Vrontados, Chios",
          postalCode: propertyData.location.postalCode,
          addressCountry: "GR",
        },
        occupancy: {
          "@type": "QuantitativeValue",
          value: propertyData.maxGuests,
          unitText: "Guests",
        },
        numberOfBedrooms: propertyData.bedrooms,
        numberOfBathroomsTotal: propertyData.bathrooms,
        floorSize: {
          "@type": "QuantitativeValue",
          value: propertyData.areaM2,
          unitCode: "MTK",
        },
        amenityFeature: propertyData.amenities.map((amenity) => ({
          "@type": "LocationFeatureSpecification",
          name: amenity.title,
          value: true,
        })),
        image: [
          `${siteUrl}/photography/hero.webp`,
          `${siteUrl}/photography/master-bedroom.webp`,
          `${siteUrl}/photography/living-room.webp`,
          `${siteUrl}/photography/terrace.webp`,
          `${siteUrl}/photography/bathroom.webp`,
        ],
        // Verified snapshot ratings from official platforms
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: reviewStats.airbnb.score,
          bestRating: reviewStats.airbnb.maxScore,
          reviewCount: reviewStats.airbnb.count,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: propertyData.name,
        inLanguage: ["en", "el", "tr"],
      },
    ],
  };
}
