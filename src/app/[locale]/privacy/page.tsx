import React from "react";
import { Link } from "@/i18n/routing";

export const metadata = {
  title: "Privacy Policy | Mastiha Luxury Suites",
  description: "Privacy policy and EU GDPR disclosures for Mastiha Luxury Suites, Vrontados, Chios, Greece.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-24 sm:py-32 px-6 sm:px-10">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans text-stone-300 hover:text-white"
          >
            ← Return to Mastiha Luxury Suites
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-white">
            Privacy Policy & Data Protection
          </h1>
          <p className="font-sans text-xs text-stone-400 uppercase tracking-wider">
            Last Updated: September 2026 · General Data Protection Regulation (GDPR) Compliance
          </p>
        </div>

        <div className="space-y-8 font-sans text-sm text-stone-400 leading-relaxed font-light divide-y divide-white/10">
          <section className="space-y-3 pt-6">
            <h2 className="font-serif text-xl text-white font-normal">1. Data Controller</h2>
            <p>
              Mastiha Luxury Suites, operating at Ethnikis Antistaseos / G Parodos 18, Vrontados, Chios 822 00, Greece (Registration License: 00003302833), acts as the data controller for information processed through this website.
            </p>
          </section>

          <section className="space-y-3 pt-6">
            <h2 className="font-serif text-xl text-white font-normal">2. Non-Invasive Browsing & Cookie Policy</h2>
            <p>
              This marketing website does not deploy advertising trackers, third-party profiling cookies, or invasive behavioral monitoring technologies. We prioritize visitor privacy by utilizing anonymous performance diagnostics and deferring third-party resource loading (such as interactive maps) until direct user activation.
            </p>
          </section>

          <section className="space-y-3 pt-6">
            <h2 className="font-serif text-xl text-white font-normal">3. Direct Booking & Third-Party Platforms</h2>
            <p>
              When initiating a reservation via our booking chooser, you are directed to verified partner listings on Airbnb or Booking.com. Your interactions on those external platforms are governed by their respective privacy disclosures and terms of service.
            </p>
          </section>

          <section className="space-y-3 pt-6">
            <h2 className="font-serif text-xl text-white font-normal">4. Your Rights Under EU GDPR</h2>
            <p>
              Under Articles 15-22 of the EU GDPR, visitors possess the right to access, rectify, or request erasure of any personal data processed, as well as the right to lodge a complaint with the Hellenic Data Protection Authority (HDPA).
            </p>
          </section>

          <section className="space-y-3 pt-6">
            <h2 className="font-serif text-xl text-white font-normal">5. Inquiries & Verification</h2>
            <p>
              For privacy-related inquiries regarding property reservations, please refer to the verified host contact channel provided upon reservation confirmation.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
