import { NextRequest, NextResponse } from "next/server";

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: "område" | "hytte" | "fjelltopp";
  lat: number;
  lon: number;
}

const LOCATIONS: SearchResult[] = [
  // Turområder
  {
    id: "omr-1",
    name: "Jotunheimen",
    description: "Norges høyeste fjellmassiv med over 200 topper over 1900 moh.",
    type: "område",
    lat: 61.6363,
    lon: 8.3128,
  },
  {
    id: "omr-2",
    name: "Hardangervidda",
    description: "Europas største høyfjellsplatå — ideelt for langtur og ski.",
    type: "område",
    lat: 60.1122,
    lon: 7.5000,
  },
  {
    id: "omr-3",
    name: "Rondane",
    description: "Norges første nasjonalpark med ti topper over 2000 moh.",
    type: "område",
    lat: 62.0000,
    lon: 9.9000,
  },
  {
    id: "omr-4",
    name: "Lofoten",
    description: "Dramatisk kystlandskap med fjorder, fjell og hvite strender.",
    type: "område",
    lat: 68.1500,
    lon: 13.9000,
  },
  {
    id: "omr-5",
    name: "Oslomarka",
    description: "Storbynært friluftsområde med 2700 km merkede stier og løyper.",
    type: "område",
    lat: 60.0000,
    lon: 10.7200,
  },

  // DNT-hytter
  {
    id: "hyt-1",
    name: "Gjendesheim",
    description: "Stor turisthytte ved Gjende i Jotunheimen, utgangspunkt for Besseggen.",
    type: "hytte",
    lat: 61.4944,
    lon: 8.8558,
  },
  {
    id: "hyt-2",
    name: "Fondsbu",
    description: "Betjent DNT-hytte ved Bygdin i Jotunheimen.",
    type: "hytte",
    lat: 61.3667,
    lon: 8.7000,
  },
  {
    id: "hyt-3",
    name: "Finse 1222",
    description: "Høyfjellshotell på Hardangervidda ved Finse stasjon.",
    type: "hytte",
    lat: 60.5954,
    lon: 7.5086,
  },
  {
    id: "hyt-4",
    name: "Spiterstulen",
    description: "Privat fjellstue i Leirvassbu, populær base for Galdhøpiggen.",
    type: "hytte",
    lat: 61.6351,
    lon: 8.3923,
  },
  {
    id: "hyt-5",
    name: "Rondvassbu",
    description: "Betjent DNT-hytte ved Rondvatnet i Rondane nasjonalpark.",
    type: "hytte",
    lat: 61.9233,
    lon: 9.8750,
  },
  {
    id: "hyt-6",
    name: "Nørdstedalseter",
    description: "Ubetjent DNT-hytte sentralt i Jotunheimen.",
    type: "hytte",
    lat: 61.5500,
    lon: 8.0500,
  },

  // Fjelltoppar
  {
    id: "top-1",
    name: "Galdhøpiggen",
    description: "Norges og Nordeuropas høyeste topp — 2469 moh.",
    type: "fjelltopp",
    lat: 61.6363,
    lon: 8.3128,
  },
  {
    id: "top-2",
    name: "Glittertind",
    description: "Norges nest høyeste topp — 2452 moh. i Jotunheimen.",
    type: "fjelltopp",
    lat: 61.6590,
    lon: 8.5490,
  },
  {
    id: "top-3",
    name: "Besseggen",
    description: "Berømt egg-rygg mellom Gjende og Bessvatnet i Jotunheimen.",
    type: "fjelltopp",
    lat: 61.5100,
    lon: 8.8600,
  },
  {
    id: "top-4",
    name: "Snøhetta",
    description: "Høyeste topp i Dovrefjell — 2286 moh. med utsikt til havet.",
    type: "fjelltopp",
    lat: 62.3408,
    lon: 9.2766,
  },
];

/** Normalise Norwegian characters for fuzzy matching */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a");
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const nq = normalise(q);
  const results = LOCATIONS.filter(
    (loc) =>
      normalise(loc.name).includes(nq) ||
      normalise(loc.description).includes(nq)
  );

  return NextResponse.json({ results });
}
