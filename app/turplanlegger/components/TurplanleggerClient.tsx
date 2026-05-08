"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ForecastResponse, TimeseriesEntry } from "@/lib/yr";
import { groupForecastByDay } from "@/lib/yr";
import { API_URL, API_HEADERS } from "@/app/omrader/shared";

/* ------------------------------------------------------------------ */
/*  Weather symbol → emoji mapping                                     */
/* ------------------------------------------------------------------ */

const SYMBOL_EMOJI: Record<string, string> = {
  clearsky: "☀️",
  fair: "🌤️",
  partlycloudy: "⛅",
  cloudy: "☁️",
  fog: "🌫️",
  rain: "🌧️",
  lightrain: "🌦️",
  heavyrain: "🌧️",
  sleet: "🌨️",
  snow: "❄️",
  lightsnow: "🌨️",
  heavysnow: "❄️",
  thunder: "⛈️",
  rainandthunder: "⛈️",
};

function symbolToEmoji(symbolCode: string | null): string {
  if (!symbolCode) return "🌤️";
  // Strip _day / _night / _polartwilight suffix
  const base = symbolCode.replace(/_(day|night|polartwilight)$/, "");
  return SYMBOL_EMOJI[base] ?? "🌤️";
}

/* ------------------------------------------------------------------ */
/*  Summarise a day's timeseries into a single weather summary         */
/* ------------------------------------------------------------------ */

interface DaySummary {
  date: string;
  minTemp: number;
  maxTemp: number;
  symbolCode: string | null;
  totalPrecipitation: number;
  maxWind: number;
}

function summariseDay(
  date: string,
  entries: TimeseriesEntry[]
): DaySummary {
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  let totalPrecipitation = 0;
  let maxWind = 0;
  let symbolCode: string | null = null;

  for (const entry of entries) {
    const temp = entry.data.instant.details.air_temperature;
    if (temp != null) {
      minTemp = Math.min(minTemp, temp);
      maxTemp = Math.max(maxTemp, temp);
    }

    const wind = entry.data.instant.details.wind_speed;
    if (wind != null) maxWind = Math.max(maxWind, wind);

    const precip =
      entry.data.next_1_hours?.details.precipitation_amount ??
      entry.data.next_6_hours?.details.precipitation_amount;
    if (precip != null) totalPrecipitation += precip;

    // Pick symbol from middle-of-day entry (~12:00) if possible
    const hour = new Date(entry.time).getHours();
    if (hour >= 11 && hour <= 13) {
      symbolCode =
        entry.data.next_1_hours?.summary.symbol_code ??
        entry.data.next_6_hours?.summary.symbol_code ??
        symbolCode;
    }
  }

  // Fallback: use first entry's symbol if none found at noon
  if (!symbolCode && entries.length > 0) {
    symbolCode =
      entries[0].data.next_1_hours?.summary.symbol_code ??
      entries[0].data.next_6_hours?.summary.symbol_code ??
      null;
  }

  return {
    date,
    minTemp: minTemp === Infinity ? 0 : Math.round(minTemp),
    maxTemp: maxTemp === -Infinity ? 0 : Math.round(maxTemp),
    symbolCode,
    totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
    maxWind: Math.round(maxWind * 10) / 10,
  };
}

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
  const [weather, setWeather] = useState<DaySummary[]>([]);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(hasCoords);
  const [weatherError, setWeatherError] = useState<string | null>(
    hasCoords ? null : "Ingen koordinater tilgjengelig for denne turen."
  );

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

  /* Fetch weather */
  useEffect(() => {
    if (!lat || !lon) return;

    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Feil fra vær-API: ${res.status}`);
        return res.json() as Promise<ForecastResponse>;
      })
      .then((forecast) => {
        const byDay = groupForecastByDay(forecast);
        const summaries: DaySummary[] = [];

        // Filter to only the selected date range
        for (const [date, entries] of Object.entries(byDay)) {
          if (fra && til && date >= fra && date <= til) {
            summaries.push(summariseDay(date, entries));
          }
        }

        summaries.sort((a, b) => a.date.localeCompare(b.date));
        setWeather(summaries);

        if (summaries.length === 0) {
          setWeatherError(
            "Værmelding er kun tilgjengelig ~9 dager frem i tid. De valgte datoene har ikke værdata ennå."
          );
        }
      })
      .catch((err) => {
        setWeatherError(
          err instanceof Error ? err.message : "Kunne ikke hente værdata."
        );
      })
      .finally(() => setLoadingWeather(false));
  }, [lat, lon, fra, til]);

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

        {loadingWeather && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2d4a2d] border-t-transparent" />
            <span className="ml-3 text-[#4a5e3a]">Henter værdata…</span>
          </div>
        )}

        {weatherError && !loadingWeather && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 text-sm">
            {weatherError}
          </div>
        )}

        {!loadingWeather && weather.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {weather.map((day) => (
              <div
                key={day.date}
                className="rounded-2xl border border-[#e0e8d8] bg-[#f8fbf5] p-5"
              >
                <p className="text-sm font-medium text-[#4a6741] mb-1">
                  {formatNorwegianDate(day.date)}
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">
                    {symbolToEmoji(day.symbolCode)}
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-[#1a2e1a]">
                      {day.maxTemp}°
                      <span className="text-base font-normal text-[#5a6e50]">
                        /{day.minTemp}°
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5a6e50]">
                  <span className="inline-flex items-center gap-1">
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
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.002 5.002 0 0012 4a5 5 0 00-4.546 2.916A4.001 4.001 0 003 11v0"
                      />
                    </svg>
                    {day.maxWind} m/s
                  </span>
                  <span className="inline-flex items-center gap-1">
                    💧 {day.totalPrecipitation} mm
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
