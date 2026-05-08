"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SearchBar from "@/app/discover/components/SearchBar";
import WeatherWidget from "@/app/components/WeatherWidget";
import type { SearchResult } from "@/app/api/search/route";
import type { Cabin } from "@/app/api/cabins/route";

// ─── Minimal Leaflet types ────────────────────────────────────────────────────

interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  flyTo(center: [number, number], zoom: number): LMap;
  remove(): void;
  on(event: string, handler: () => void): LMap;
}

interface LMarker {
  addTo(map: LMap): LMarker;
  on(event: string, handler: () => void): LMarker;
  remove(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LDivIcon = Record<string, any>;

interface LTileLayer {
  addTo(map: LMap): LTileLayer;
}

interface LStatic {
  map(element: HTMLElement, options?: Record<string, unknown>): LMap;
  tileLayer(url: string, options: { attribution: string; maxZoom: number }): LTileLayer;
  marker(latlng: [number, number], options?: { icon?: LDivIcon }): LMarker;
  divIcon(options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
    popupAnchor: [number, number];
  }): LDivIcon;
}

// ─── Cabin type colours ───────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  DNT_STAFFED: "#4f59fb",
  DNT_SELF_SERVICE: "#0f8402",
  DNT_UNSTAFFED: "#e15b02",
  PRIVATE_STAFFED: "#808080",
  PRIVATE_SELF_SERVICE: "#a6a6a6",
};

function cabinIconHtml(facilityType: string): string {
  const bg = TYPE_COLOR[facilityType] ?? "#666666";
  return `<div style="
    background:${bg};
    width:30px;height:30px;
    border-radius:50%;
    border:3px solid #fff;
    display:flex;align-items:center;justify-content:center;
    font-size:14px;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
    cursor:pointer;
  ">🏠</div>`;
}

// ─── Selected item (search result or cabin) ───────────────────────────────────

type Selected =
  | { kind: "search"; result: SearchResult }
  | { kind: "cabin"; cabin: Cabin };

// ─── Component ────────────────────────────────────────────────────────────────

export default function KartPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const searchMarkerRef = useRef<LMarker | null>(null);
  const cabinMarkersRef = useRef<LMarker[]>([]);

  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Load Leaflet + init map ──────────────────────────────────────────────
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const win = window as Window & { L?: LStatic };

    // Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Leaflet JS
    const L = await new Promise<LStatic>((resolve) => {
      if (win.L) { resolve(win.L); return; }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(win.L!);
      document.head.appendChild(script);
    });

    // Wait one tick for Leaflet CSS to apply
    await new Promise((r) => setTimeout(r, 50));

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([62.0, 10.0], 6);

    L.tileLayer(
      "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
      { attribution: "© Kartverket", maxZoom: 18 }
    ).addTo(map);

    mapRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, [initMap]);

  // ── Fetch cabins ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/cabins")
      .then((r) => r.json())
      .then((data: { cabins: Cabin[] }) => setCabins(data.cabins))
      .catch(() => {/* silently ignore — map still works without cabins */});
  }, []);

  // ── Place cabin markers once map + cabins are ready ───────────────────────
  useEffect(() => {
    if (!mapReady || cabins.length === 0) return;

    const win = window as Window & { L?: LStatic };
    const L = win.L;
    if (!L || !mapRef.current) return;

    // Remove existing cabin markers
    cabinMarkersRef.current.forEach((m) => m.remove());
    cabinMarkersRef.current = [];

    for (const cabin of cabins) {
      const icon = L.divIcon({
        className: "",
        html: cabinIconHtml(cabin.facilityType),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([cabin.lat, cabin.lon], { icon })
        .addTo(mapRef.current);

      marker.on("click", () => setSelected({ kind: "cabin", cabin }));
      cabinMarkersRef.current.push(marker);
    }

    return () => {
      cabinMarkersRef.current.forEach((m) => m.remove());
      cabinMarkersRef.current = [];
    };
  }, [mapReady, cabins]);

  // ── Handle search selection ───────────────────────────────────────────────
  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      setSelected({ kind: "search", result });

      if (!mapRef.current) return;
      mapRef.current.flyTo([result.lat, result.lon], 12);

      const win = window as Window & { L?: LStatic };
      const L = win.L;
      if (!L) return;

      // Remove previous search marker
      searchMarkerRef.current?.remove();

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background:#bf0000;
          width:30px;height:30px;
          border-radius:50%;
          border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
        ">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -18],
      });

      searchMarkerRef.current = L.marker([result.lat, result.lon], { icon })
        .addTo(mapRef.current!);
    },
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const coords =
    selected?.kind === "cabin"
      ? { lat: selected.cabin.lat, lon: selected.cabin.lon }
      : selected?.kind === "search"
      ? { lat: selected.result.lat, lon: selected.result.lon }
      : null;

  const panelName =
    selected?.kind === "cabin"
      ? selected.cabin.name
      : selected?.kind === "search"
      ? selected.result.name
      : null;

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#e0e8d8] z-20 flex-shrink-0">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[#2d4a2d]"
        >
          Friluftskompis
        </Link>
        <div className="flex items-center gap-6 text-sm text-[#4a6741]">
          <Link href="/" className="hover:text-[#2d4a2d] transition-colors">
            Hjem
          </Link>
          <Link
            href="/kart"
            className="font-medium text-[#2d4a2d] underline underline-offset-4"
          >
            Kart
          </Link>
          <Link href="/discover" className="hover:text-[#2d4a2d] transition-colors">
            Utforsk
          </Link>
          <Link href="/omrader" className="hover:text-[#2d4a2d] transition-colors">
            Områder
          </Link>
        </div>
      </nav>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Map canvas */}
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Search overlay — top-left */}
        <div className="absolute top-4 left-4 z-[1000] w-80">
          <SearchBar onSelect={handleSearchSelect} />
        </div>

        {/* Legend — bottom-left */}
        <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-2xl border border-[#e0e8d8] px-4 py-3 shadow-md text-xs text-[#4a5e3a] space-y-1.5">
          <p className="font-semibold text-[10px] uppercase tracking-widest text-[#7a9a6a] mb-2">
            Hyttetype
          </p>
          {[
            { color: "#4f59fb", label: "Betjent" },
            { color: "#0f8402", label: "Selvbetjent" },
            { color: "#e15b02", label: "Ubetjent" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="inline-block rounded-full border-2 border-white shadow"
                style={{ background: color, width: 14, height: 14 }}
              />
              {label}
            </div>
          ))}
        </div>

        {/* Detail panel — right side */}
        {selected && coords && (
          <div className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col gap-4">
            {/* Cabin / location card */}
            <div className="bg-white rounded-2xl border border-[#e0e8d8] shadow-lg p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-base font-semibold text-[#1a2e1a] leading-snug">
                  {selected.kind === "cabin"
                    ? selected.cabin.name
                    : selected.result.name}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-shrink-0 text-[#a0b090] hover:text-[#4a5e3a] transition-colors mt-0.5"
                  aria-label="Lukk"
                >
                  ✕
                </button>
              </div>

              {selected.kind === "cabin" ? (
                <>
                  {/* Type badge */}
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white mb-3"
                    style={{
                      background:
                        TYPE_COLOR[selected.cabin.facilityType] ?? "#666",
                    }}
                  >
                    {selected.cabin.typeLabel}
                  </span>

                  <dl className="text-sm text-[#4a5e3a] space-y-1 mb-3">
                    {selected.cabin.capacity != null && (
                      <div className="flex items-center gap-2">
                        <dt className="text-[#7a9a6a]">Kapasitet</dt>
                        <dd className="font-medium text-[#1a2e1a]">
                          {selected.cabin.capacity} senger
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <dt className="text-[#7a9a6a]">Koordinater</dt>
                      <dd className="font-mono text-xs text-[#1a2e1a]">
                        {selected.cabin.lat.toFixed(4)}°N,{" "}
                        {selected.cabin.lon.toFixed(4)}°E
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <span className="inline-block rounded-full bg-[#e8f0df] px-2.5 py-0.5 text-xs font-medium text-[#2d4a2d] mb-3">
                    {selected.result.type === "område"
                      ? "Turområde"
                      : selected.result.type === "hytte"
                      ? "DNT-hytte"
                      : "Fjelltopp"}
                  </span>
                  <p className="text-sm text-[#4a5e3a] leading-relaxed mb-3">
                    {selected.result.description}
                  </p>
                </>
              )}
            </div>

            {/* Weather widget */}
            <WeatherWidget coords={coords} label={panelName ?? undefined} />
          </div>
        )}

        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] z-[1000]">
            <div className="flex items-center gap-3 text-[#4a5e3a]">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#2d4a2d] border-t-transparent" />
              Laster kart…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
