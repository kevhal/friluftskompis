import { NextResponse } from "next/server";

// ─── Public types ─────────────────────────────────────────────────────────────

export type SearchResult = {
  id: string;
  name: string;
  description: string;
  type: "område" | "hytte" | "fjelltopp";
  lat: number;
  lon: number;
};

// ─── Kartverket stedsnavn ─────────────────────────────────────────────────────

const KARTVERKET_URL = "https://api.kartverket.no/stedsnavn/v1/navn";

// The API ignores the navneobjekttype filter, so we fetch broadly and classify
// client-side based on the navneobjekttype field in each returned record.
const PEAK_NAVNOBJTYPE = new Set(["Topp", "Toppunkt", "Fjelltopp"]);
const AREA_NAVNOBJTYPE = new Set([
  "Nasjonalpark",
  "Naturreservat",
  "Fjellområde",
  "Fjellkjede",
  "Statsallmenning",
  "Vidde",
  "Dal",
  "Dalføre",
  "Fjord",
  "Halvøy",
  "Øy",
  "Landskapsområde",
]);
const CABIN_NAVNOBJTYPE = new Set(["Seter"]);

interface KartverketNavn {
  skrivemåte: string;
  navneobjekttype: string;
  representasjonspunkt: { nord: number; øst: number };
  kommuner?: { kommunenavn: string }[];
  stedsnummer?: number;
}

interface KartverketResponse {
  navn: KartverketNavn[];
}

async function searchKartverket(q: string): Promise<KartverketNavn[]> {
  const params = new URLSearchParams({
    sok: `${q}*`, // Trailing wildcard for partial matching
    utkoordsys: "4258", // ETRS89 geographic (lat/lon)
    treffPerSide: "20", // Fetch more so we have enough after filtering by type
    side: "1",
  });

  const res = await fetch(`${KARTVERKET_URL}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(2500),
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const data: KartverketResponse = await res.json();
  return data.navn ?? [];
}

function kartverketToResult(
  item: KartverketNavn,
  type: SearchResult["type"],
): SearchResult {
  const name = item.skrivemåte || "Ukjent";
  const kommuner = item.kommuner?.map((k) => k.kommunenavn).join(", ") ?? "";
  const description = kommuner
    ? `${item.navneobjekttype} · ${kommuner}`
    : item.navneobjekttype;

  return {
    id: `kartverket-${item.stedsnummer ?? `${item.navneobjekttype}-${name}`}`,
    name,
    description,
    type,
    lat: item.representasjonspunkt.nord,
    lon: item.representasjonspunkt.øst,
  };
}

// ─── ut.no GraphQL (cabin search) ────────────────────────────────────────────

const GRAPHQL_URL =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

const GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  Origin: "https://ut.no",
};

const CABIN_SEARCH_QUERY = `
  query SearchCabins($filter: CabinFilter) {
    cabins(paging: { first: 5 }, filter: $filter) {
      edges {
        node {
          id
          name
          serviceLevel
          geojson
        }
      }
    }
  }
`;

interface CabinNode {
  id: number;
  name: string;
  serviceLevel: string;
  geojson?: string | null;
}

const SERVICE_LEVEL_LABELS: Record<string, string> = {
  STAFFED: "Betjent DNT-hytte",
  SELF_SERVICE: "Selvbetjent DNT-hytte",
  NO_SERVICE: "Ubetjent DNT-hytte",
  RENTAL: "Utleie-hytte",
};

function parseCabinCoords(geojson: string | null | undefined): [number, number] | null {
  if (!geojson) return null;
  try {
    const parsed = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    const coords = parsed?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return [coords[0] as number, coords[1] as number];
    }
    return null;
  } catch {
    return null;
  }
}

async function searchCabins(q: string): Promise<SearchResult[]> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: GRAPHQL_HEADERS,
    body: JSON.stringify({
      query: CABIN_SEARCH_QUERY,
      variables: {
        filter: { name: { iLike: `%${q}%` } },
      },
    }),
    signal: AbortSignal.timeout(2500),
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const json = await res.json();
  if (json.errors) return [];

  const edges: { node: CabinNode }[] = json.data?.cabins?.edges ?? [];

  return edges
    .map(({ node }) => {
      const coords = parseCabinCoords(node.geojson);
      if (!coords) return null;
      const [lon, lat] = coords;
      const typeLabel = SERVICE_LEVEL_LABELS[node.serviceLevel] ?? "DNT-hytte";
      const result: SearchResult = {
        id: `cabin-${node.id}`,
        name: node.name,
        description: typeLabel,
        type: "hytte",
        lat,
        lon,
      };
      return result;
    })
    .filter((r): r is SearchResult => r !== null);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Run Kartverket and cabin search in parallel
  const [kartverketResult, cabinsFromGraphQL] = await Promise.allSettled([
    searchKartverket(q),
    searchCabins(q),
  ]);

  // Classify Kartverket records by navneobjekttype, deduplicating by id
  const areas: SearchResult[] = [];
  const peaks: SearchResult[] = [];
  const kartverketCabins: SearchResult[] = [];
  const seenIds = new Set<string>();

  if (kartverketResult.status === "fulfilled") {
    for (const item of kartverketResult.value) {
      const result = kartverketToResult(
        item,
        AREA_NAVNOBJTYPE.has(item.navneobjekttype)
          ? "område"
          : PEAK_NAVNOBJTYPE.has(item.navneobjekttype)
          ? "fjelltopp"
          : "hytte",
      );
      if (seenIds.has(result.id)) continue;
      seenIds.add(result.id);

      if (AREA_NAVNOBJTYPE.has(item.navneobjekttype)) {
        if (areas.length < 5) areas.push(result);
      } else if (PEAK_NAVNOBJTYPE.has(item.navneobjekttype)) {
        if (peaks.length < 5) peaks.push(result);
      } else if (CABIN_NAVNOBJTYPE.has(item.navneobjekttype)) {
        if (kartverketCabins.length < 5) kartverketCabins.push(result);
      }
    }
  }

  // Prefer GraphQL cabins (richer data); fall back to Kartverket Seter results
  const cabins =
    cabinsFromGraphQL.status === "fulfilled" &&
    cabinsFromGraphQL.value.length > 0
      ? cabinsFromGraphQL.value
      : kartverketCabins;

  // Order: areas → cabins → peaks (matches SearchBar grouping order)
  return NextResponse.json({ results: [...areas, ...cabins, ...peaks] });
}
