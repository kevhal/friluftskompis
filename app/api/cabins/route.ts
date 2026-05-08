import { NextResponse } from "next/server";
import { API_URL, API_HEADERS } from "@/app/omrader/shared";

export interface Cabin {
  id: string;
  name: string;
  /** DNT type code, e.g. DNT_STAFFED */
  facilityType: string;
  /** Human-readable Norwegian label */
  typeLabel: string;
  capacity: number | null;
  lat: number;
  lon: number;
}

const TYPE_LABELS: Record<string, string> = {
  DNT_STAFFED: "Betjent",
  DNT_SELF_SERVICE: "Selvbetjent",
  DNT_UNSTAFFED: "Ubetjent",
  DNT_NO_SERVICE: "Uten service",
  PRIVATE_STAFFED: "Privat betjent",
  PRIVATE_SELF_SERVICE: "Privat selvbetjent",
};

// ─── GraphQL query ────────────────────────────────────────────────────────────

const FACILITIES_QUERY = `
  query Facilities($first: Int!, $after: ConnectionCursor) {
    facilities(
      paging: { first: $first, after: $after }
      filter: {
        facilityType: { in: [DNT_STAFFED, DNT_SELF_SERVICE, DNT_UNSTAFFED] }
      }
    ) {
      edges {
        node {
          id
          name
          facilityType
          capacity
          centerPointGeojson {
            type
            coordinates
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchFromApi(): Promise<Cabin[]> {
  const cabins: Cabin[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 5; page++) {
    const variables: Record<string, unknown> = { first: 200 };
    if (cursor) variables.after = cursor;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify({ query: FACILITIES_QUERY, variables }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`API request to DNT GraphQL (page ${page}) failed with status ${res.status}`);
    }

    const json = await res.json();
    if (json.errors) {
      const errMsg = json.errors[0]?.message;
      throw new Error(errMsg ?? `GraphQL error without message (page ${page}): ${JSON.stringify(json.errors)}`);
    }
    if (!json.data?.facilities) {
      throw new Error("Missing facilities data in GraphQL response");
    }

    const { edges, pageInfo } = json.data.facilities;

    for (const { node } of edges) {
      const coords = node.centerPointGeojson?.coordinates;
      if (!coords) continue;
      const facilityType = node.facilityType ?? "DNT_STAFFED";
      cabins.push({
        id: String(node.id),
        name: node.name,
        facilityType,
        typeLabel: TYPE_LABELS[facilityType] ?? facilityType,
        capacity: node.capacity ?? null,
        lat: coords[1],
        lon: coords[0],
      });
    }

    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  return cabins;
}

// ─── Fallback mock data (well-known DNT cabins with real coordinates) ─────────

const MOCK_CABINS: Cabin[] = [
  // Betjente hytter — Jotunheimen
  { id: "m-1",  name: "Gjendesheim",     facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 114, lat: 61.4944, lon: 8.8558 },
  { id: "m-2",  name: "Memurubu",        facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 100, lat: 61.5190, lon: 8.9360 },
  { id: "m-3",  name: "Glitterheim",     facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 90,  lat: 61.6510, lon: 8.6790 },
  { id: "m-4",  name: "Leirvassbu",      facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 80,  lat: 61.5983, lon: 8.1650 },
  { id: "m-5",  name: "Olavsbu",         facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 70,  lat: 61.5700, lon: 8.1000 },
  { id: "m-6",  name: "Fondsbu",         facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 90,  lat: 61.3667, lon: 8.7000 },
  { id: "m-7",  name: "Torfinnsbu",      facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 70,  lat: 61.3470, lon: 7.8400 },
  { id: "m-8",  name: "Gjendebu",        facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 84,  lat: 61.5090, lon: 8.2600 },
  { id: "m-9",  name: "Eidsbugarden",    facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 60,  lat: 61.2510, lon: 8.6830 },
  { id: "m-10", name: "Spiterstulen",    facilityType: "PRIVATE_STAFFED",  typeLabel: "Privat betjent", capacity: 150, lat: 61.6351, lon: 8.3923 },
  // Betjente hytter — Rondane
  { id: "m-11", name: "Rondvassbu",      facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 70,  lat: 61.9233, lon: 9.8750 },
  { id: "m-12", name: "Bjørnhollia",     facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 60,  lat: 62.0400, lon: 9.7600 },
  { id: "m-13", name: "Dørålseter",      facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 80,  lat: 61.9600, lon: 9.6700 },
  // Betjente hytter — Hardangervidda
  { id: "m-14", name: "Finse 1222",      facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 200, lat: 60.5954, lon: 7.5086 },
  { id: "m-15", name: "Kjeldebu",        facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 50,  lat: 60.2900, lon: 8.8100 },
  { id: "m-16", name: "Sandhaug",        facilityType: "DNT_STAFFED",      typeLabel: "Betjent",      capacity: 45,  lat: 60.2400, lon: 7.8700 },
  // Selvbetjente hytter
  { id: "m-17", name: "Nørdstedalseter", facilityType: "DNT_SELF_SERVICE", typeLabel: "Selvbetjent",  capacity: 30,  lat: 61.5500, lon: 8.0500 },
  { id: "m-18", name: "Stavali",         facilityType: "DNT_SELF_SERVICE", typeLabel: "Selvbetjent",  capacity: 28,  lat: 60.1970, lon: 7.4500 },
  { id: "m-19", name: "Lågaros",         facilityType: "DNT_SELF_SERVICE", typeLabel: "Selvbetjent",  capacity: 26,  lat: 60.2700, lon: 7.3800 },
  { id: "m-20", name: "Geiterygghytta",  facilityType: "DNT_SELF_SERVICE", typeLabel: "Selvbetjent",  capacity: 24,  lat: 60.3500, lon: 8.0000 },
  { id: "m-21", name: "Rauddalsbu",      facilityType: "DNT_SELF_SERVICE", typeLabel: "Selvbetjent",  capacity: 20,  lat: 61.6800, lon: 8.2500 },
  // Ubetjente hytter
  { id: "m-22", name: "Kollungstølen",   facilityType: "DNT_UNSTAFFED",    typeLabel: "Ubetjent",     capacity: 15,  lat: 61.5200, lon: 7.9800 },
  { id: "m-23", name: "Stasjonsstua",    facilityType: "DNT_UNSTAFFED",    typeLabel: "Ubetjent",     capacity: 12,  lat: 60.5954, lon: 7.5086 },
];

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  let cabins: Cabin[] = [];

  try {
    cabins = await fetchFromApi();
  } catch {
    // API unavailable — fall through to mock data
  }

  if (cabins.length === 0) {
    cabins = MOCK_CABINS;
  }

  return NextResponse.json({ cabins, source: cabins === MOCK_CABINS ? "mock" : "api" });
}
