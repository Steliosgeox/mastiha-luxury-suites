import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Photos ship pre-encoded in three widths; the loader picks one (no runtime re-encoding).
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
};

export default withNextIntl(nextConfig);
