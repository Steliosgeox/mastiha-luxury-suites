"use client";

import React, { useState } from "react";
import { propertyData } from "@/content/property";

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: "What are the arrival and departure times?",
      a: `Check-in is scheduled between ${propertyData.policies.checkIn}, and check-out between ${propertyData.policies.checkOut}. Exact check-in hours are coordinated upon reservation confirmation. Early arrival or luggage drop-off may be accommodated upon advance request.`,
    },
    {
      q: "What is the bed configuration for four guests?",
      a: "The suite features two bedrooms with three beds total: Bedroom 1 has a King-size bed, Bedroom 2 has a Single bed, and the living area features a quality Sofa bed. A free crib is also available upon advance request for children aged 0-3.",
    },
    {
      q: "Is dedicated private parking available?",
      a: "Yes. Guests have access to complimentary private parking directly on the property premises, ensuring effortless arrivals and peace of mind when exploring Chios by car.",
    },
    {
      q: "How close is the nearest beach and sea access?",
      a: "The Aegean sea is approximately 40 metres from the property, allowing you to walk to the coast in less than one minute.",
    },
    {
      q: "What internet speed is available for remote work?",
      a: "The suite is equipped with dedicated high-speed Wi-Fi, measured at approximately 92 Mbps, fully supporting high-definition video conferencing and remote work needs.",
    },
    {
      q: "What are the house rules regarding smoking, pets, and quiet hours?",
      a: "To ensure a clean and quiet sanctuary for all guests, smoking and pets are not permitted inside the suite. Parties and events are prohibited. Quiet hours are observed between 22:00 and 08:00.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-24 sm:py-32 bg-stone-950 text-stone-100 border-t border-white/10" aria-label="Essential Information">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 space-y-12">
        <div className="space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
            Essential Stay Information
          </h2>
          <p className="font-sans text-sm text-stone-400 font-light">
            Verified property policies and answers to common inquiries before your arrival.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-6">
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-300 rounded"
                >
                  <h3 className="font-serif text-lg sm:text-xl text-stone-100 font-normal group-hover:text-white transition-colors">
                    {item.q}
                  </h3>
                  <span className="p-1.5 rounded-full bg-white/5 border border-white/10 text-stone-400 group-hover:text-white shrink-0 transition-transform duration-200">
                    <svg
                      className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-4 font-sans text-sm text-stone-400 font-light leading-relaxed pr-8">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
