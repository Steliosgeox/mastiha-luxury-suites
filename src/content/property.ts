/**
 * Facts about the apartment, taken from our Airbnb and Booking.com listings.
 * Copy interpolates these, so a change here updates every language at once.
 */
export const propertyData = {
  name: "Mastiha Luxury Suites",
  areaM2: 75,
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 1,
  distanceToSeaMeters: 40,
  /** Greek short-term rental registration (ΑΜΑ). */
  licenseNumber: "00003302833",
  location: {
    postalCode: "822 00",
    // Google Maps place for Mastiha Luxury Suites in Vrontados. The street address is not
    // published until the owner confirms its format; guests get directions by message.
    googlePlaceId: "ChIJC2Y7IgBmuxQRQN6ormboZOk",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Mastiha%20Luxury%20Suites&query_place_id=ChIJC2Y7IgBmuxQRQN6ormboZOk",
    googleDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Mastiha%20Luxury%20Suites&destination_place_id=ChIJC2Y7IgBmuxQRQN6ormboZOk",
    /** Opens the "write a review" box for our Google listing (sent to guests after their stay). */
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJC2Y7IgBmuxQRQN6ormboZOk",
  },
  bookingLinks: {
    airbnb: "https://www.airbnb.com/rooms/1368953469779774276",
    booking: "https://www.booking.com/hotel/gr/mastiha-luxury-suites.html",
  },
} as const;
