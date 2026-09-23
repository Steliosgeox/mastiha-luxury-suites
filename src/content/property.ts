export interface PropertyData {
  name: string;
  tagline: string;
  propertyType: string;
  areaM2: number;
  areaSqFt: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  distanceToSeaMeters: number;
  licenseNumber: string;
  location: {
    village: string;
    island: string;
    country: string;
    address: string;
    postalCode: string;
    addressConfirmationRequired: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
    googlePlaceId: string;
    googleMapsUrl: string;
    googleDirectionsUrl: string;
  };
  bedArrangement: Array<{
    room: string;
    bedType: string;
  }>;
  amenities: Array<{
    id: string;
    title: string;
    category: "essentials" | "comfort" | "dining" | "outdoor" | "tech";
    highlight?: boolean;
    description?: string;
  }>;
  policies: {
    checkIn: string;
    checkOut: string;
    checkInConfirmationRequired: boolean;
    smoking: boolean;
    parties: boolean;
    pets: boolean;
    quietHours: string;
    children: string;
    cribs: string;
  };
  bookingLinks: {
    airbnb: string;
    booking: string;
  };
  contact: {
    phone: string;
    phoneConfirmed: boolean;
  };
  lastVerified: string;
}

export const propertyData: PropertyData = {
  name: "Mastiha Luxury Suites",
  tagline: "A quieter side of Chios",
  propertyType: "Entire private vacation home",
  areaM2: 75,
  areaSqFt: 807,
  maxGuests: 4,
  bedrooms: 2,
  beds: 3,
  bathrooms: 1,
  distanceToSeaMeters: 40,
  licenseNumber: "00003302833",
  location: {
    village: "Vrontados",
    island: "Chios",
    country: "Greece",
    address: "Ethnikis Antistaseos / G Parodos 18",
    postalCode: "822 00",
    addressConfirmationRequired: true,
    // Verified Google Maps place for Mastiha Luxury Suites in Vrontados.
    googlePlaceId: "ChIJC2Y7IgBmuxQRQN6ormboZOk",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Mastiha%20Luxury%20Suites&query_place_id=ChIJC2Y7IgBmuxQRQN6ormboZOk",
    googleDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Mastiha%20Luxury%20Suites&destination_place_id=ChIJC2Y7IgBmuxQRQN6ormboZOk",
  },
  bedArrangement: [
    { room: "Bedroom 1", bedType: "1 King bed" },
    { room: "Bedroom 2", bedType: "1 Single bed" },
    { room: "Living room", bedType: "1 Sofa bed" },
  ],
  amenities: [
    { id: "beach-access", title: "Beach Access", category: "outdoor", highlight: true, description: "Approximately 40 metres from the shoreline" },
    { id: "sea-view", title: "Near the Aegean shoreline", category: "outdoor", highlight: true, description: "See the real photographs; neighbourhood views are labelled separately" },
    { id: "parking", title: "Free Private Parking", category: "essentials", highlight: true, description: "Dedicated private on-site parking space" },
    { id: "wifi", title: "High-Speed Wi-Fi", category: "tech", highlight: true, description: "Airbnb lists an 85 Mbps test; actual speeds vary" },
    { id: "air-conditioning", title: "Climate Control", category: "comfort", highlight: true, description: "Air conditioning and heating throughout" },
    { id: "kitchen", title: "Fully Equipped Kitchen", category: "dining", highlight: true, description: "Oven, stovetop, refrigerator, and cookware" },
    { id: "espresso", title: "Espresso Coffee Machine", category: "dining", highlight: true, description: "Fresh morning brew ready" },
    { id: "washing-machine", title: "Washing Machine", category: "essentials", highlight: true, description: "In-unit laundry amenities" },
    { id: "smart-tvs", title: "Dual Smart LED TVs", category: "tech", highlight: true, description: "Streaming entertainment services available" },
    { id: "terrace", title: "Front Balcony", category: "outdoor", highlight: true, description: "Front balcony with table and chairs" },
    { id: "soundproof", title: "Soundproof Space", category: "comfort", highlight: true, description: "Quiet acoustic insulation for restful sleep" },
    { id: "family", title: "Family Friendly", category: "comfort", highlight: true, description: "Crib available for ages 0-3 upon request" },
  ],
  policies: {
    checkIn: "15:00 - 16:00",
    checkOut: "10:30 - 11:00",
    checkInConfirmationRequired: true, // OWNER_CONFIRMATION needed
    smoking: false,
    parties: false,
    pets: false,
    quietHours: "22:00 - 08:00",
    children: "Children welcome of all ages",
    cribs: "Free crib for ages 0-3 subject to availability",
  },
  bookingLinks: {
    airbnb: "https://www.airbnb.com/rooms/1368953469779774276",
    booking: "https://www.booking.com/hotel/gr/mastiha-luxury-suites.html",
  },
  contact: {
    phone: "+30 694 820 5588",
    phoneConfirmed: false, // OWNER_CONFIRMATION required before publishing live
  },
  lastVerified: "2026-09-18",
};
