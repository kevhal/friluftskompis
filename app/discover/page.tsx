import Link from "next/link";
import DiscoverClient from "./components/DiscoverClient";

export const metadata = {
  title: "Utforsk – Friluftskompis",
};

export default function DiscoverPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0eb] font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#2d4a2d]">
          Friluftskompis
        </Link>
        <div className="flex items-center gap-6 text-sm text-[#4a6741]">
          <Link href="/" className="hover:text-[#2d4a2d] transition-colors">
            Hjem
          </Link>
          <Link
            href="/discover"
            className="font-medium text-[#2d4a2d] underline underline-offset-4"
          >
            Utforsk
          </Link>
          <Link href="/omrader" className="hover:text-[#2d4a2d] transition-colors">
            Områder
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#d4e8c2] px-4 py-1.5 text-sm text-[#2d4a2d] mb-6">
          <span>Søk og oppdage</span>
        </div>
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
