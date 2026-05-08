"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_URL, API_HEADERS } from "@/app/omrader/shared";
import WeatherWidget from "@/app/components/WeatherWidget";

/* ------------------------------------------------------------------ */
/*  Norwegian day name                                                 */
/* ------------------------------------------------------------------ */

const DAY_NAMES = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
];

function formatNorwegianDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayName = DAY_NAMES[d.getDay()];
  return `${dayName} ${d.getDate()}.${d.getMonth() + 1}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TurplanleggerClient() {
  const searchParams = useSearchParams();
  const turId = searchParams.get("turId");
  const fra = searchParams.get("fra");
  const til = searchParams.get("til");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const hasCoords = Boolean(lat && lon);
  const [tripName, setTripName] = useState<string | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);

  const missingParams = !turId || !fra || !til;

  /* Fetch trip name */
  useEffect(() => {
    if (!turId) return;

    const query = `
      query TripById($tripId: Int!) {
        trips(paging: { first: 1 }, filter: { id: { eq: $tripId } }) {
          edges { node { name } }
        }
      }
    `;

    fetch(API_URL, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify({
        query,
        variables: { tripId: Number(turId) },
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        const name = json.data?.trips?.edges?.[0]?.node?.name;
        setTripName(name ?? "Ukjent tur");
      })
      .catch(() => setTripName("Ukjent tur"))
      .finally(() => setLoadingTrip(false));
  }, [turId]);


  if (missingParams) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Manglende parametre</p>
        <p className="mt-1 text-sm">
          Gå til en turside og velg datoer for å bruke turplanleggeren.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip info card */}
      <div className="rounded-2xl border border-[#e0e8d8] bg-[#f8fbf5] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {loadingTrip ? (
              <div className="h-6 w-48 animate-pulse rounded bg-[#e0e8d8]" />
            ) : (
              <Link
                href={`/tur/${turId}`}
                className="text-xl font-bold text-[#2d4a2d] hover:underline"
              >
                {tripName}
              </Link>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#4a6741]">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatNorwegianDate(fra)} – {formatNorwegianDate(til)}
              </span>
            </div>
          </div>
          <Link
            href={`/tur/${turId}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#2d4a2d] px-4 py-2 text-sm font-medium text-[#2d4a2d] hover:bg-[#2d4a2d] hover:text-white transition-colors"
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
            Tilbake til turen
          </Link>
        </div>
      </div>

      {/* Weather section */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a2e1a] mb-4">
          Værmelding
        </h2>

        {hasCoords ? (
          <WeatherWidget
            coords={{ lat: Number(lat), lon: Number(lon) }}
            label={tripName ?? undefined}
            fromDate={fra ?? undefined}
            toDate={til ?? undefined}
          />
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 text-sm">
            Ingen koordinater tilgjengelig for denne turen.
          </div>
        )}
      </div>
    </div>
  );
}
