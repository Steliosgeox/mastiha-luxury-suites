import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// API routes are locale-independent JSON endpoints, never localized pages.
export const config = {
  matcher: ["/", "/(el|en|tr)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
