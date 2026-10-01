/** Lets the host add the inbox to the phone's home screen (required for push on iPhone). */
export function GET() {
  return Response.json({
    name: "Mastiha · Συζητήσεις",
    short_name: "Mastiha",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#f2f5f8",
    theme_color: "#f2f5f8",
    icons: [
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } });
}
