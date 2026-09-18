import React from "react";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-plaster text-ink flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <span className="text-xs uppercase tracking-widest text-aegean font-sans font-medium">
          404 · Page Not Found
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-ink">
          Lost by the Aegean
        </h1>
        <p className="font-sans text-sm text-muted font-light leading-relaxed">
          The requested sanctuary page could not be located.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-aegean text-plaster text-xs uppercase tracking-wider font-sans font-medium hover:bg-aegean-dark transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
