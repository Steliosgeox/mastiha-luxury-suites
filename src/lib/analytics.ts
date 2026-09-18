export type AnalyticsEvent =
  | "hero_book_click"
  | "dock_book_click"
  | "header_book_click"
  | "booking_outbound_click"
  | "gallery_open"
  | "gallery_image_view"
  | "map_open"
  | "directions_click"
  | "scroll_film_started"
  | "scroll_film_completed"
  | "language_change";

export function trackEvent(eventName: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  // Development logger
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics Event] ${eventName}:`, properties || {});
  }

  // Window custom event dispatcher for integration with privacy-first analytics (e.g. Plausible, Vercel)
  try {
    const customEvent = new CustomEvent("mastiha_analytics", {
      detail: { event: eventName, ...properties, timestamp: new Date().toISOString() },
    });
    window.dispatchEvent(customEvent);
  } catch {
    // Fail silently in non-browser environments
  }
}
