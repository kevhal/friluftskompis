"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Cabin } from "@/app/api/cabins/route";

// ─── Minimal Leaflet types ────────────────────────────────────────────────────

interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  flyTo(center: [number, number], zoom: number): LMap;
  remove(): void;
}

interface LMarker {
  addTo(map: LMap): LMarker;
  on(event: string, handler: () => void): LMarker;
  remove(): void;
}

interface LTileLayer {
  addTo(map: LMap): LTileLayer;
}

interface LStatic {
  map(element: HTMLElement, options?: Record<string, unknown>): LMap;
  tileLayer(url: string, options: { attribution: string; maxZoom: number }): LTileLayer;
  marker(latlng: [number, number], options?: { icon?: unknown }): LMarker;
  divIcon(options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }): unknown;
}

// ─── Cabin colours ────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  STAFFED: "#4f59fb",
  SELF_SERVICE: "#0f8402",
  NO_SERVICE: "#e15b02",
  RENTAL: "#a855f7",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function KartPage() {
  const searchParams = useSearchParams();
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const name = searchParams.get("name") ?? "";

  const hasLocation = !isNaN(lat) && !isNaN(lon);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const pinMarkerRef = useRef<LMarker | null>(null);
  const cabinMarkersRef = useRef<LMarker[]>([]);
  const leafletRef = useRef<LStatic | null>(null);

  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);

  // ── Load Leaflet + init map ───────────────────────────────────────────────
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const win = window as Window & { L?: LStatic };

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const L = await new Promise<LStatic>((resolve) => {
      if (win.L) { resolve(win.L); return; }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(win.L!);
      document.head.appendChild(script);
    });

    await new Promise((r) => setTimeout(r, 50));

    const center: [number, number] = hasLocation ? [lat, lon] : [62.0, 10.0];
    const zoom = hasLocation ? 12 : 6;

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer(
      "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
      { attribution: "© Kartverket", maxZoom: 18 }
    ).addTo(map);

    if (hasLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background:#2d4a2d;width:32px;height:32px;
          border-radius:50%;border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.35);
        ">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      pinMarkerRef.current = L.marker([lat, lon], { icon }).addTo(map);
    }

    mapRef.current = map;
    leafletRef.current = L;
    setMapReady(true);
  }, [hasLocation, lat, lon]);

  useEffect(() => {
    initMap();
    return () => {
      cabinMarkersRef.current.forEach((m) => m.remove());
      cabinMarkersRef.current = [];
      pinMarkerRef.current?.remove();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // ── Fetch cabins ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/cabins")
      .then((r) => r.json())
      .then((data: { cabins: Cabin[] }) => setCabins(data.cabins))
      .catch(() => {});
  }, []);

  // ── Place cabin markers once map + cabins are ready ───────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map || cabins.length === 0) return;

    cabinMarkersRef.current.forEach((m) => m.remove());
    cabinMarkersRef.current = [];

    for (const cabin of cabins) {
      const bg = TYPE_COLOR[cabin.serviceLevel] ?? "#666";
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background:${bg};width:22px;height:22px;
          border-radius:50%;border:2px solid #fff;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;
        ">🏠</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([cabin.lat, cabin.lon], { icon }).addTo(map);
      marker.on("click", () => setSelectedCabin(cabin));
      cabinMarkersRef.current.push(marker);
    }
  }, [mapReady, cabins]);

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e0e8d8] z-20 flex-shrink-0">
        <Link href="/" className="text-base font-semibold tracking-tight text-[#2d4a2d]">
          ← Friluftskompis
        </Link>
        {name && (
          <span className="text-sm font-medium text-[#1a2e1a] truncate max-w-xs">
            {name}
          </span>
        )}
      </nav>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Cabin detail panel */}
        {selectedCabin && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-80 bg-white rounded-2xl border border-[#e0e8d8] shadow-lg p-5">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-base font-semibold text-[#1a2e1a]">{selectedCabin.name}</h2>
              <button
                onClick={() => setSelectedCabin(null)}
                className="text-[#a0b090] hover:text-[#4a5e3a] flex-shrink-0"
                aria-label="Lukk"
              >✕</button>
            </div>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white mb-2"
              style={{ background: TYPE_COLOR[selectedCabin.serviceLevel] ?? "#666" }}
            >
              {selectedCabin.typeLabel}
            </span>
            {selectedCabin.capacity != null && (
              <p className="text-sm text-[#5a6e50]">{selectedCabin.capacity} senger</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-2xl border border-[#e0e8d8] px-4 py-3 shadow-md text-xs text-[#4a5e3a] space-y-1.5">
          <p className="font-semibold text-[10px] uppercase tracking-widest text-[#7a9a6a] mb-2">Hyttetype</p>
          {[
            { color: "#4f59fb", label: "Betjent" },
            { color: "#0f8402", label: "Selvbetjent" },
            { color: "#e15b02", label: "Ubetjent" },
            { color: "#a855f7", label: "Utleie" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="inline-block rounded-full border-2 border-white shadow" style={{ background: color, width: 12, height: 12 }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
