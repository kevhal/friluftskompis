import Link from "next/link";
import DiscoverClient from "./discover/components/DiscoverClient";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0eb] font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-lg font-semibold tracking-tight text-[#2d4a2d]">
          🏔 Friluftskompis
        </span>
        <div className="flex items-center gap-6 text-sm text-[#4a6741]">
          <Link href="/omrader" className="hover:text-[#2d4a2d] transition-colors">
            Områder
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#1a2e1a]">
          Finn ditt neste eventyr
        </h1>
        <p className="mt-3 text-lg text-[#4a5e3a] max-w-lg mx-auto">
          Søk etter turområder, DNT-hytter og fjelltoppar — og se værvarsel for stedet.
        </p>
      </header>

      {/* Search + results */}
      <main className="flex-1 flex flex-col items-center px-6 pb-16">
        <DiscoverClient />
      </main>

      {/* Footer */}
      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        © {new Date().getFullYear()} Friluftskompis
      </footer>
    </div>
  );
}
