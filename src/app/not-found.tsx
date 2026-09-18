import React from "react";
import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="bg-[#F6F2E8] text-[#0B202B] min-h-screen flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-serif">Mastiha Luxury Suites</h1>
          <p className="text-sm text-[#7A6F60]">Page not found.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-[#1A5268] text-[#FBFAF6] text-xs uppercase tracking-wider font-medium"
          >
            Return to Homepage
          </Link>
        </div>
      </body>
    </html>
  );
}
