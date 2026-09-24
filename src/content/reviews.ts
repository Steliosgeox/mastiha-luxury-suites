export interface ReviewStats {
  airbnb: {
    score: number;
    maxScore: number;
    count: number;
    badge: string;
    subBadge: string;
  };
  booking: {
    score: number;
    maxScore: number;
    count: number;
    label: string;
    subScores: {
      cleanliness: number;
      comfort: number;
      facilities: number;
      staff: number;
      valueForMoney: number;
      location: number;
    };
  };
  lastVerified: string;
  verifiedQuotes: Array<{
    quote: string;
    author: string;
    platform: "Airbnb" | "Booking.com";
    country?: string;
  }>;
}

export const reviewStats: ReviewStats = {
  airbnb: {
    score: 5.0,
    maxScore: 5.0,
    count: 27,
    badge: "Guest Favorite",
    subBadge: "Top 1% of eligible homes on Airbnb",
  },
  booking: {
    score: 9.9,
    maxScore: 10.0,
    count: 21,
    label: "Exceptional",
    subScores: {
      cleanliness: 10.0,
      comfort: 10.0,
      facilities: 10.0,
      staff: 10.0,
      valueForMoney: 10.0,
      location: 9.8,
    },
  },
  lastVerified: "2026-09-24",
  verifiedQuotes: [],
};
