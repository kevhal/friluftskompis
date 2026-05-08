import { NextResponse } from "next/server";

// ─── Public types ─────────────────────────────────────────────────────────────

export type Cabin = {
  id: string;
  name: string;
  serviceLevel: string;
  typeLabel: string;
  capacity: number | null;
  lat: number;
  lon: number;
};

// ─── ut.no GraphQL ────────────────────────────────────────────────────────────

const GRAPHQL_URL =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

const GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  Origin: "https://ut.no",
};

const CABINS_QUERY = `
  query Cabins($first: Int!, $after: ConnectionCursor) {
    cabins(paging: { first: $first, after: $after }) {
      edges {
        node {
          id
          name
          serviceLevel
          bedsStaffed
          bedsSelfService
          bedsNoService
          geojson
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface CabinNode {
  id: number;
  name: string;
  serviceLevel: string;
  bedsStaffed?: number | null;
  bedsSelfService?: number | null;
  bedsNoService?: number | null;
  geojson?: string | null;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

const SERVICE_LEVEL_LABELS: Record<string, string> = {
  STAFFED: "Betjent",
  SELF_SERVICE: "Selvbetjent",
  NO_SERVICE: "Ubetjent",
  RENTAL: "Utleie",
};

function parseCoords(geojson: string | null | undefined): [number, number] | null {
  if (!geojson) return null;
  try {
    const parsed = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    const coords = parsed?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return [coords[0] as number, coords[1] as number]; // [lon, lat]
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchCabinsPage(cursor?: string | null): Promise<{
  nodes: CabinNode[];
  pageInfo: PageInfo;
}> {
  const variables: Record<string, unknown> = { first: 100 };
  if (cursor) variables.after = cursor;

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: GRAPHQL_HEADERS,
    body: JSON.stringify({ query: CABINS_QUERY, variables }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[/api/cabins] HTTP", res.status, body.slice(0, 300));
    throw new Error(`GraphQL request failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error("[/api/cabins] GraphQL errors:", JSON.stringify(json.errors).slice(0, 300));
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  const data = json.data?.cabins;
  if (!data) throw new Error("Unexpected API response");

  return {
    nodes: data.edges.map((e: { node: CabinNode }) => e.node),
    pageInfo: data.pageInfo,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const allNodes: CabinNode[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;
    const MAX_PAGES = 20; // up to 2000 cabins
    let page = 0;

    while (hasNextPage && page < MAX_PAGES) {
      const { nodes, pageInfo } = await fetchCabinsPage(cursor);
      allNodes.push(...nodes);
      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;
      page++;
    }

    const cabins: Cabin[] = allNodes
      .map((node) => {
        const coords = parseCoords(node.geojson);
        if (!coords) return null;
        const [lon, lat] = coords;
        const capacity =
          (node.bedsStaffed ?? 0) +
          (node.bedsSelfService ?? 0) +
          (node.bedsNoService ?? 0) || null;
        return {
          id: `cabin-${node.id}`,
          name: node.name,
          serviceLevel: node.serviceLevel,
          typeLabel: SERVICE_LEVEL_LABELS[node.serviceLevel] ?? node.serviceLevel,
          capacity,
          lat,
          lon,
        };
      })
      .filter((c): c is Cabin => c !== null);

    return NextResponse.json({ cabins });
  } catch (err) {
    console.error("[/api/cabins] Failed to fetch cabins:", err);
    return NextResponse.json({ cabins: [] });
  }
}
