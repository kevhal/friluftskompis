import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import TurplanleggerClient from "./components/TurplanleggerClient";

export const metadata: Metadata = {
  title: "Turplanlegger — Friluftskompis",
  description: "Planlegg turen din med værmelding dag for dag.",
};

export default function TurplanleggerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0eb] font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[#2d4a2d]"
        >
          Friluftskompis
        </Link>
        <div className="flex items-center gap-6 text-sm text-[#4a6741]">
          <Link href="/" className="hover:text-[#2d4a2d] transition-colors">
            Hjem
          </Link>
          <Link
            href="/kart"
            className="hover:text-[#2d4a2d] transition-colors"
          >
            Kart
          </Link>
          <Link
            href="/omrader"
            className="hover:text-[#2d4a2d] transition-colors"
          >
            Områder
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-block rounded-full bg-[#d4e8c2] px-3 py-1 text-xs font-medium text-[#2d4a2d] mb-3">
              Turplanlegger
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#1a2e1a]">
              Din tur
            </h1>
            <p className="mt-2 text-[#5a6e50]">
              Se værmelding for de valgte dagene og planlegg turen din.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2d4a2d] border-t-transparent" />
                <span className="ml-3 text-[#4a5e3a]">Laster…</span>
              </div>
            }
          >
            <TurplanleggerClient />
          </Suspense>
        </div>
      </main>

      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        &copy; {new Date().getFullYear()} Friluftskompis
      </footer>
    </div>
  );
}
