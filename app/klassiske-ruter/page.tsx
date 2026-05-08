import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klassiske hytteruter – Friluftskompis",
  description:
    "Utforsk Norges mest kjente hytteruter: Jotunheim-runden, Besseggen, Hardangervidda og mer.",
};

// ─── Static data (D4 — klassiske hytteruter) ────────────────────────────────

interface Stage {
  from: string;
  to: string;
  km: number;
  hm: number;
  hours: number;
}

interface ClassicRoute {
  id: string;
  name: string;
  region: string;
  description: string;
  days: number;
  totalKm: number;
  totalHm: number;
  difficulty: "Lett" | "Middels" | "Krevende";
  season: string;
  emoji: string;
  stages: Stage[];
  lat: number;
  lon: number;
}

const CLASSIC_ROUTES: ClassicRoute[] = [
  {
    id: "besseggen",
    name: "Besseggen",
    region: "Jotunheimen",
    description:
      "Norges mest populære fjelltur. Eggeryggen mellom Gjende og Bessvatnet gir dramatisk utsikt over to innsjøer i helt ulike blåtoner. Dagsturen starter fra Gjendesheim.",
    days: 1,
    totalKm: 18,
    totalHm: 900,
    difficulty: "Middels",
    season: "Juli–september",
    emoji: "🏔️",
    stages: [
      { from: "Gjendesheim", to: "Memurubu (båt)", km: 0, hm: 0, hours: 1 },
      { from: "Memurubu", to: "Besshøe (1743 m)", km: 5, hm: 750, hours: 3 },
      { from: "Besshøe", to: "Gjendesheim", km: 13, hm: 150, hours: 4 },
    ],
    lat: 61.4926,
    lon: 8.8603,
  },
  {
    id: "jotunheim-runden",
    name: "Jotunheim-runden",
    region: "Jotunheimen",
    description:
      "En av Norges fineste hyttevandringer. Runden tar deg gjennom hjertet av Jotunheimen med stopp ved Gjendesheim, Memurubu, Glitterheim, Spiterstulen og Leirvassbu.",
    days: 5,
    totalKm: 75,
    totalHm: 4200,
    difficulty: "Krevende",
    season: "Juli–september",
    emoji: "🗻",
    stages: [
      { from: "Gjendesheim", to: "Memurubu", km: 8, hm: 450, hours: 4 },
      { from: "Memurubu", to: "Glitterheim", km: 18, hm: 1100, hours: 7 },
      { from: "Glitterheim", to: "Spiterstulen", km: 15, hm: 900, hours: 6 },
      { from: "Spiterstulen", to: "Leirvassbu", km: 16, hm: 950, hours: 6 },
      { from: "Leirvassbu", to: "Gjendesheim", km: 18, hm: 800, hours: 7 },
    ],
    lat: 61.5042,
    lon: 8.5312,
  },
  {
    id: "hardangervidda-traversen",
    name: "Hardangervidda-traversen",
    region: "Hardangervidda",
    description:
      "Tvers over Europas største høyfjellsplatå fra Haukeliseter til Finse. Åpne vidder, reinsdyr og norsk høgfjellsstemning på sitt beste.",
    days: 6,
    totalKm: 95,
    totalHm: 2800,
    difficulty: "Middels",
    season: "Juli–september",
    emoji: "🌄",
    stages: [
      { from: "Haukeliseter", to: "Haukeliseter hst.", km: 12, hm: 400, hours: 4 },
      { from: "Haukeliseter hst.", to: "Sandhaug", km: 18, hm: 350, hours: 6 },
      { from: "Sandhaug", to: "Hadlaskard", km: 16, hm: 500, hours: 5 },
      { from: "Hadlaskard", to: "Litlos", km: 17, hm: 600, hours: 6 },
      { from: "Litlos", to: "Krækkja", km: 15, hm: 500, hours: 5 },
      { from: "Krækkja", to: "Finse", km: 17, hm: 450, hours: 5 },
    ],
    lat: 60.2167,
    lon: 7.2167,
  },
  {
    id: "rondane-kryssing",
    name: "Rondane-kryssingen",
    region: "Rondane",
    description:
      "Vandring gjennom Norges første nasjonalpark med de karakteristiske runde toppene. Ruten byr på storslått utsikt og lett tilgjengelighet fra Oslo.",
    days: 4,
    totalKm: 55,
    totalHm: 2500,
    difficulty: "Middels",
    season: "Juli–oktober",
    emoji: "🦌",
    stages: [
      { from: "Rondvassbu", to: "Bjørnhollia", km: 14, hm: 600, hours: 5 },
      { from: "Bjørnhollia", to: "Eldåbu", km: 12, hm: 700, hours: 5 },
      { from: "Eldåbu", to: "Dørålseter", km: 15, hm: 700, hours: 6 },
      { from: "Dørålseter", to: "Rondvassbu", km: 14, hm: 500, hours: 5 },
    ],
    lat: 61.9022,
    lon: 9.7311,
  },
  {
    id: "trollheimen-runden",
    name: "Trollheimen-runden",
    region: "Trollheimen",
    description:
      "Stille og vakker fjellvandring nord for Dovre med godt utbygd hyttenettet. Perfekt for de som vil oppleve norsk høyfjell uten Jotunheimens folkemengder.",
    days: 4,
    totalKm: 52,
    totalHm: 2200,
    difficulty: "Middels",
    season: "Juli–september",
    emoji: "🌲",
    stages: [
      { from: "Fale", to: "Gjevilvasshytta", km: 14, hm: 600, hours: 5 },
      { from: "Gjevilvasshytta", to: "Trollheimshytta", km: 12, hm: 650, hours: 5 },
      { from: "Trollheimshytta", to: "Jøldalshytta", km: 14, hm: 500, hours: 5 },
      { from: "Jøldalshytta", to: "Fale", km: 12, hm: 450, hours: 4 },
    ],
    lat: 62.7800,
    lon: 9.1200,
  },
  {
    id: "breheimen-runden",
    name: "Breheimen-runden",
    region: "Breheimen",
    description:
      "En naturopplevelse med alt: isbreer, dype daler og rolige vann. Ruten tar deg nær Jostedalsbreen og gjennom Norges nyeste nasjonalpark.",
    days: 5,
    totalKm: 68,
    totalHm: 3100,
    difficulty: "Krevende",
    season: "Juli–august",
    emoji: "🧊",
    stages: [
      { from: "Bøvertun", to: "Sognefjellshytta", km: 14, hm: 800, hours: 6 },
      { from: "Sognefjellshytta", to: "Skjolden", km: 12, hm: 700, hours: 5 },
      { from: "Skjolden", to: "Fortundalshytta", km: 15, hm: 650, hours: 6 },
      { from: "Fortundalshytta", to: "Feigedalen", km: 14, hm: 500, hours: 5 },
      { from: "Feigedalen", to: "Bøvertun", km: 13, hm: 450, hours: 5 },
    ],
    lat: 61.5833,
    lon: 7.5167,
  },
];

const DIFFICULTY_COLOR: Record<ClassicRoute["difficulty"], string> = {
  Lett: "bg-[#d4f0d4] text-[#1a5c1a]",
  Middels: "bg-[#fff0c8] text-[#7a4a00]",
  Krevende: "bg-[#ffe0e0] text-[#8b0000]",
};

function RouteCard({ route }: { route: ClassicRoute }) {
  return (
    <article className="rounded-2xl border border-[#e0e8d8] bg-white overflow-hidden hover:shadow-lg hover:border-[#b8d4a0] transition-all duration-200">
      {/* Header */}
      <div className="bg-[#f5f0eb] px-6 py-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{route.emoji}</span>
            <h2 className="font-bold text-xl text-[#1a2e1a]">{route.name}</h2>
          </div>
          <p className="text-sm text-[#4a6741]">{route.region}</p>
        </div>
        <Link
          href={`/kart?lat=${route.lat}&lon=${route.lon}&name=${encodeURIComponent(route.name)}`}
          className="flex-shrink-0 rounded-full bg-[#2d4a2d] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3d6b3d] transition-colors"
        >
          Vis på kart
        </Link>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm text-[#4a5e3a] leading-relaxed mb-4">
          {route.description}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f5eb] px-3 py-1 text-xs text-[#4a6741]">
            📅 {route.days} {route.days === 1 ? "dag" : "dager"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f5eb] px-3 py-1 text-xs text-[#4a6741]">
            📏 {route.totalKm} km
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f5eb] px-3 py-1 text-xs text-[#4a6741]">
            ⬆️ {route.totalHm} hm
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f5eb] px-3 py-1 text-xs text-[#4a6741]">
            🗓️ {route.season}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_COLOR[route.difficulty]}`}
          >
            {route.difficulty}
          </span>
        </div>

        {/* Stage breakdown */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7a9a6a] mb-2">
            Etapper
          </h3>
          <ol className="space-y-1.5">
            {route.stages.map((stage, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-[#3a5e3a]"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2d4a2d] text-white text-[10px] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="flex-1">
                  {stage.from} → {stage.to}
                </span>
                {stage.km > 0 && (
                  <span className="text-xs text-[#7a9a6a] whitespace-nowrap">
                    {stage.km} km · {stage.hm} hm · ~{stage.hours}t
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}

export default function KlassiskeRuterPage() {
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
          <Link href="/omrader" className="hover:text-[#2d4a2d] transition-colors">
            Områder
          </Link>
          <Link
            href="/klassiske-ruter"
            className="font-medium text-[#2d4a2d] underline underline-offset-4"
          >
            Klassiske ruter
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#d4e8c2] px-4 py-1.5 text-sm text-[#2d4a2d] mb-6">
          <span>🗻 Forhåndsdefinerte ruter</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1a2e1a]">
          Klassiske hytteruter
        </h1>
        <p className="mt-3 text-lg text-[#4a5e3a] max-w-2xl mx-auto">
          Norges {CLASSIC_ROUTES.length} mest kjente hyttevandringer — med
          etapper, høydemeter og kart.
        </p>
      </header>

      {/* Route grid */}
      <main className="flex-1 px-6 pb-16">
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLASSIC_ROUTES.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        © {new Date().getFullYear()} Friluftskompis
      </footer>
    </div>
  );
}
