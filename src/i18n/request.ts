import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// next-intl handles locale routing only. Copy lives in typed modules under src/content.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as (typeof routing.locales)[number]) ? requested! : routing.defaultLocale;
  return { locale, messages: {} };
});
