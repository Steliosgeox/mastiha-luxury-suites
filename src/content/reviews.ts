/**
 * Review scores as shown on the booking platforms on `lastVerified`. They are a dated
 * snapshot, labelled as such on the page; the platforms hold the live figures.
 */
export const reviewStats = {
  lastVerified: "2026-09-24",
  airbnb: { score: 5.0, count: 27 },
  booking: { score: 9.9, count: 21, subScores: { location: 9.8 } },
} as const;
