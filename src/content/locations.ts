export interface Landmark {
  id: string;
  name: string;
  distance: string;
  category: "coast" | "cultural" | "transit" | "dining";
  description: string;
  source: string;
}

export const locationData = {
  headline: "Close to Chios. Closer to the sea.",
  description:
    "Set in the coastal town of Vrontados on the eastern shore of Chios, Mastiha Luxury Suites offers a calm seaside retreat just 40 metres from the Aegean water, with rapid 8-minute vehicular access to Chios town and its historic harbour.",
  landmarks: [
    {
      id: "sea",
      name: "Aegean Shoreline & Beach",
      distance: "40 m",
      category: "coast",
      description: "Moments from the front door to the Aegean shore for morning swims and sea breezes.",
      source: "Airbnb listing verification",
    },
    {
      id: "afanis-naftis",
      name: "Afanis Naftis (Unknown Sailor Monument)",
      distance: "600 m",
      category: "cultural",
      description: "Iconic maritime memorial square commemorating Vrontados naval heritage.",
      source: "Booking.com listing verification",
    },
    {
      id: "chios-town",
      name: "Chios Town Centre",
      distance: "8 min drive",
      category: "transit",
      description: "Vibrant island capital, dining, boutique shops, and pedestrian promenade.",
      source: "Airbnb listing verification",
    },
    {
      id: "chios-port",
      name: "Port of Chios",
      distance: "4.5 km",
      category: "transit",
      description: "Main ferry hub connecting Athens (Piraeus), Lesvos, and Çeşme (Turkey).",
      source: "Booking.com listing verification",
    },
    {
      id: "byzantine-museum",
      name: "Byzantine Museum of Chios",
      distance: "4.4 km",
      category: "cultural",
      description: "Historic 19th-century Mecidiye Mosque housing Byzantine artifacts.",
      source: "Booking.com listing verification",
    },
    {
      id: "archaeological-museum",
      name: "Archaeological Museum of Chios",
      distance: "5.1 km",
      category: "cultural",
      description: "Exhibiting antiquities spanning Neolithic to Roman Chian history.",
      source: "Booking.com listing verification",
    },
    {
      id: "airport",
      name: "Chios Island National Airport (JKH)",
      distance: "7 km",
      category: "transit",
      description: "Daily direct flights connecting Athens and Thessaloniki.",
      source: "Booking.com listing verification",
    },
  ] as Landmark[],
  amenitiesNearby: [
    "Local Supermarket",
    "Traditional Tavernas & Restaurants",
    "Seaside Cafés",
    "Pharmacy",
    "Petrol Station",
    "Public Bus Line toward Chios Town",
  ],
};
