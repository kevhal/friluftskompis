import DiscoverClient from "./components/DiscoverClient";

export const metadata = {
  title: "Finn tur – Friluftskompis",
};

// Server component shell — interactive bits live in DiscoverClient
export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col">
      <header className="flex items-center justify-between px-8 py-5">
        <a href="/" className="text-lg font-semibold tracking-tight text-[#2d4a2d]">
          🏔 Friluftskompis
        </a>
      </header>

      <main className="flex flex-col items-center px-6 pt-16 pb-24 gap-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1a2e1a] mb-3">Finn din neste tur</h1>
          <p className="text-[#4a5e3a] text-lg">
            Søk på område, hytte eller fjelltopp
          </p>
        </div>

        <DiscoverClient />
      </main>
    </div>
  );
}
