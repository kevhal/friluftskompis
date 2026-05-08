// Hidden design system showcase — not linked from anywhere
// Access at /design-system in dev

import Link from "next/link";
import ComponentsClient from "./ComponentsClient";

export const metadata = {
  title: "Design System – Friluftskompis",
  robots: "noindex",
};

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-gray-900">Design System</span>
            <span className="ml-3 text-xs text-gray-400 font-mono">Friluftskompis · Team 8</span>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Tilbake til app
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 pt-12">
        <ComponentsClient />
      </main>
    </div>
  );
}
