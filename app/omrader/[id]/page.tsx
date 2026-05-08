/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL, API_HEADERS, type Area, stripHtml, formatArea } from "../shared";

const AREA_QUERY = `
  query Areas($filter: AreaFilter!) {
    areas(filter: $filter, paging: { first: 1 }) {
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
    }
  }
`;

async function fetchArea(id: number): Promise<Area | null> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      query: AREA_QUERY,
      variables: { filter: { id: { eq: id }, areaType: { eq: "DNT_AREA" } } },
    }),
  });

  if (!res.ok) throw new Error(`API-feil: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL-feil");

  const edges = json.data?.areas?.edges;
  return edges?.[0]?.node ?? null;
}

function LeafletMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const L = await new Promise<typeof import("leaflet")>((resolve) => {
      if ((window as Record<string, unknown>).L) {
        resolve((window as Record<string, unknown>).L as typeof import("leaflet"));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () =>
        resolve((window as Record<string, unknown>).L as typeof import("leaflet"));
      document.head.appendChild(script);
    });

    // Wait a tick for CSS to apply
    await new Promise((r) => setTimeout(r, 100));

    const map = L.map(mapRef.current).setView([lat, lng], 11);

    L.tileLayer(
      "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
      {
        attribution: "© Kartverket",
        maxZoom: 18,
      }
    ).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();

    mapInstanceRef.current = map;
  }, [lat, lng, name]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden border border-[#e0e8d8]"
      style={{ height: 400 }}
    />
  );
}

export default function AreaDetailPage() {
  const params = useParams();
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(params.id);
  const isValidId = !isNaN(id);

  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;

    fetchArea(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) setError("Området ble ikke funnet");
        else setArea(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Ukjent feil");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isValidId]);

  const description = area?.description ? stripHtml(area.description) : null;
  const coords = area?.centerPointGeojson?.coordinates;

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
            Områder
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Tilbake-lenke */}
          <Link
            href="/omrader"
            className="inline-flex items-center gap-2 text-sm text-[#4a6741] hover:text-[#2d4a2d] transition-colors mb-8"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Tilbake til alle områder
          </Link>

          {!isValidId && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="font-medium">Ugyldig område-ID</p>
            </div>
          )}

          {isValidId && loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2d4a2d] border-t-transparent" />
              <span className="ml-3 text-[#4a5e3a]">Henter område…</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="font-medium">Noe gikk galt</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {area && (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-[#1a2e1a] mb-4">
                {area.name}
              </h1>

              {/* Meta-info badges */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#7a9a6a] mb-8">
                {area.area != null && area.area > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5">
                    <svg
                      className="h-4 w-4"
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
                {coords && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5">
                    <svg
                      className="h-4 w-4"
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
                    {coords[1].toFixed(4)}°N, {coords[0].toFixed(4)}°E
                  </span>
                )}
                {area.provider && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5">
                    {area.provider}
                  </span>
                )}
              </div>

              {/* Kart */}
              {coords && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
                    Kart
                  </h2>
                  <LeafletMap
                    lat={coords[1]}
                    lng={coords[0]}
                    name={area.name}
                  />
                  <p className="mt-2 text-xs text-[#8a9e7a]">
                    Kartdata © Kartverket
                  </p>
                </div>
              )}

              {/* Beskrivelse */}
              {description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
                    Om området
                  </h2>
                  <p className="text-[#4a5e3a] leading-relaxed">
                    {description}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        © 2025 Friluftskompis
      </footer>
    </div>
  );
}
