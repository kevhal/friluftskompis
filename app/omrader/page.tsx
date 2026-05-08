"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const API_URL =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

interface Area {
  id: number;
  name: string;
  description?: string | null;
  areaType: string;
  provider?: string | null;
  area?: number | null;
  centerPointGeojson?: {
    type: string;
    coordinates: [number, number];
  } | null;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatArea(sqMeters: number): string {
  const sqKm = sqMeters / 1_000_000;
  if (sqKm >= 1) return `${Math.round(sqKm)} km²`;
  return `${(sqKm).toFixed(1)} km²`;
}

const AREAS_QUERY = `
  query Areas($first: Int!, $after: ConnectionCursor) {
    areas(
      paging: { first: $first, after: $after }
      filter: { areaType: { eq: DNT_AREA } }
    ) {
      totalCount
      edges {
        node {
          id
          name
          description
          areaType
          provider
          area
          centerPointGeojson
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchAreas(cursor?: string | null): Promise<{
  areas: Area[];
  totalCount: number;
  pageInfo: PageInfo;
}> {
  const variables: Record<string, unknown> = { first: 40 };
  if (cursor) variables.after = cursor;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://ut.no",
      "apollo-require-preflight": "true",
    },
    body: JSON.stringify({ query: AREAS_QUERY, variables }),
  });

  if (!res.ok) throw new Error(`API-feil: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL-feil");

  const data = json.data?.areas;
  if (!data) throw new Error("Uventet API-respons");

  return {
    areas: data.edges.map((e: { node: Area }) => e.node),
    totalCount: data.totalCount,
    pageInfo: data.pageInfo,
  };
}

function AreaCard({ area }: { area: Area }) {
  const desc = area.description ? stripHtml(area.description) : null;
  const truncatedDesc =
    desc && desc.length > 200 ? desc.slice(0, 200) + "…" : desc;

  return (
    <div className="group rounded-2xl border border-[#e0e8d8] bg-white p-6 hover:shadow-lg hover:border-[#b8d4a0] transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="font-semibold text-[#1a2e1a] text-lg leading-snug">
          {area.name}
        </h2>
      </div>

      {truncatedDesc && (
        <p className="text-sm text-[#5a6e50] leading-relaxed mb-4 line-clamp-3">
          {truncatedDesc}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#7a9a6a]">
        {area.area != null && area.area > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f5eb] px-2.5 py-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            {formatArea(area.area)}
          </span>
        )}
        {area.centerPointGeojson && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f5eb] px-2.5 py-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {area.centerPointGeojson.coordinates[1].toFixed(2)}°N,{" "}
            {area.centerPointGeojson.coordinates[0].toFixed(2)}°E
          </span>
        )}
      </div>
    </div>
  );
}

export default function OmraderPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    hasNextPage: false,
    endCursor: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAreas()
      .then((data) => {
        setAreas(data.areas);
        setTotalCount(data.totalCount);
        setPageInfo(data.pageInfo);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ukjent feil")
      )
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (!pageInfo.hasNextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchAreas(pageInfo.endCursor);
      setAreas((prev) => [...prev, ...data.areas]);
      setPageInfo(data.pageInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return areas;
    const q = search.toLowerCase();
    return areas.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description && stripHtml(a.description).toLowerCase().includes(q))
    );
  }, [areas, search]);

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
            href="/omrader"
            className="font-medium text-[#2d4a2d] underline underline-offset-4"
          >
            Omrader
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#d4e8c2] px-4 py-1.5 text-sm text-[#2d4a2d] mb-6">
          <span>DNT turområder</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1a2e1a]">
          Turområder
        </h1>
        <p className="mt-3 text-lg text-[#4a5e3a] max-w-lg mx-auto">
          Utforsk {totalCount > 0 ? `${totalCount} ` : ""}turområder fra DNT og
          ut.no — fra Oslomarka til Lofoten.
        </p>
      </header>

      {/* Search */}
      <div className="px-6 pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a9e7a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk i områder…"
              className="w-full rounded-xl border border-[#d4dcc8] bg-white py-3 pl-12 pr-4 text-sm text-[#1a2e1a] placeholder:text-[#a0b090] focus:outline-none focus:ring-2 focus:ring-[#8ab870] focus:border-transparent transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2d4a2d] border-t-transparent" />
              <span className="ml-3 text-[#4a5e3a]">
                Henter turområder…
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="font-medium">Noe gikk galt</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-center text-[#4a5e3a] py-20">
              {search.trim()
                ? `Ingen områder matcher «${search}».`
                : "Ingen områder funnet."}
            </p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((area) => (
                  <AreaCard key={area.id} area={area} />
                ))}
              </div>

              {pageInfo.hasNextPage && !search.trim() && (
                <div className="mt-10 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full bg-[#2d4a2d] px-8 py-3 text-sm font-medium text-white hover:bg-[#3d6b3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore
                      ? "Henter flere…"
                      : "Last inn flere områder"}
                  </button>
                </div>
              )}

              <p className="mt-6 text-center text-sm text-[#8a9e7a]">
                Viser {filtered.length}
                {search.trim()
                  ? ` treff av ${areas.length} lastede områder`
                  : ` av ${totalCount} turområder`}
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        © 2025 Friluftskompis
      </footer>
    </div>
  );
}
