/** Lets the host add the inbox to the phone's home screen (required for push on iPhone). */
export function GET() {
  return Response.json({
    name: "Mastiha · Συνομιλίες",
    short_name: "Mastiha",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#f6f5f1",
    theme_color: "#f6f5f1",
    icons: [
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } });
}
