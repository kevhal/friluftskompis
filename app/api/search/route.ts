import { NextRequest, NextResponse } from "next/server";

export type ResultType = "område" | "hytte" | "fjelltopp";

export interface SearchResult {
  id: string;
  name: string;
  type: ResultType;
  description: string;
  lat: number;
  lon: number;
}

const MOCK_DATA: SearchResult[] = [
  // Områder
  { id: "o1", name: "Jotunheimen", type: "område", description: "Nasjonalpark, Innlandet", lat: 61.6, lon: 8.3 },
  { id: "o2", name: "Rondane", type: "område", description: "Nasjonalpark, Innlandet", lat: 62.0, lon: 9.9 },
  { id: "o3", name: "Hardangervidda", type: "område", description: "Nasjonalpark, Vestland", lat: 60.1, lon: 7.5 },
  { id: "o4", name: "Dovrefjell", type: "område", description: "Nasjonalpark, Trøndelag", lat: 62.3, lon: 9.5 },
  { id: "o5", name: "Breheimen", type: "område", description: "Nasjonalpark, Vestland", lat: 61.6, lon: 7.5 },

  // DNT-hytter
  { id: "h1", name: "Gjendesheim", type: "hytte", description: "DNT-hytte, Jotunheimen", lat: 61.48, lon: 8.85 },
  { id: "h2", name: "Spiterstulen", type: "hytte", description: "DNT-hytte, Jotunheimen", lat: 61.63, lon: 8.41 },
  { id: "h3", name: "Rondvassbu", type: "hytte", description: "DNT-hytte, Rondane", lat: 61.93, lon: 9.81 },
  { id: "h4", name: "Finse 1222", type: "hytte", description: "DNT-hytte, Hardangervidda", lat: 60.59, lon: 7.51 },
  { id: "h5", name: "Bessheim", type: "hytte", description: "DNT-hytte, Jotunheimen", lat: 61.57, lon: 8.75 },
  { id: "h6", name: "Hjerkinn fjellstue", type: "hytte", description: "DNT-hytte, Dovrefjell", lat: 62.22, lon: 9.55 },

  // Fjelltopper
  { id: "f1", name: "Galdhøpiggen", type: "fjelltopp", description: "2469 moh · Jotunheimen", lat: 61.63, lon: 8.31 },
  { id: "f2", name: "Glittertind", type: "fjelltopp", description: "2465 moh · Jotunheimen", lat: 61.65, lon: 8.55 },
  { id: "f3", name: "Snøhetta", type: "fjelltopp", description: "2286 moh · Dovrefjell", lat: 62.32, lon: 9.27 },
  { id: "f4", name: "Storebjørn", type: "fjelltopp", description: "2222 moh · Jotunheimen", lat: 61.53, lon: 8.12 },
  { id: "f5", name: "Hårteigen", type: "fjelltopp", description: "1690 moh · Hardangervidda", lat: 60.18, lon: 7.17 },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o");
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const nq = normalize(q);
  const results = MOCK_DATA.filter((r) =>
    normalize(r.name).includes(nq) || normalize(r.description).includes(nq)
  );

  // Simulate slight network latency so debounce behaviour is visible in dev
  await new Promise((res) => setTimeout(res, 80));

  return NextResponse.json({ results });
}
