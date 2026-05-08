"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCurrentConditions,
  groupForecastByDay,
  type ForecastResponse,
} from "@/lib/yr";

interface Coords {
  lat: number;
  lon: number;
}

interface Props {
  coords: Coords;
  label?: string;
}

interface DayGroup {
  date: string;
  label: string;
  symbolCode: string | null;
  tempMax: number | null;
  tempMin: number | null;
  precipitation: number | null;
}

type FetchResult =
  | { status: "error"; message: string }
  | { status: "ok"; forecast: ForecastResponse };

interface LoadedState {
  coords: Coords;
  result: FetchResult;
}

const DAY_NAMES = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrowStr = new Date(today.getTime() + 86_400_000)
    .toISOString()
    .slice(0, 10);
  if (dateStr === todayStr) return "I dag";
  if (dateStr === tomorrowStr) return "I morgen";
  return DAY_NAMES[d.getDay()];
}

function weatherEmoji(symbolCode: string | null): string {
  if (!symbolCode) return "🌡️";
  if (symbolCode.includes("clearsky")) return "☀️";
  if (symbolCode.includes("fair")) return "🌤️";
  if (symbolCode.includes("partlycloudy")) return "⛅";
  if (symbolCode.includes("cloudy")) return "☁️";
  if (symbolCode.includes("fog")) return "🌫️";
  if (
    symbolCode.includes("heavyrain") ||
    symbolCode.includes("heavysleet") ||
    symbolCode.includes("heavysnow")
  )
    return "🌧️";
  if (symbolCode.includes("rain") || symbolCode.includes("sleet")) return "🌦️";
  if (symbolCode.includes("snow")) return "❄️";
  if (symbolCode.includes("thunder")) return "⛈️";
  return "🌡️";
}

export default function WeatherWidget({ coords, label }: Props) {
  /**
   * We store the last completed fetch together with the coords it was for.
   * When coords change, `loaded` is stale — we derive `isLoading` from
   * the mismatch, avoiding a synchronous setState inside the effect body.
   */
  const [loaded, setLoaded] = useState<LoadedState | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Vær-API svarte ${res.status}`);
        return res.json() as Promise<ForecastResponse>;
      })
      .then((forecast) => {
        if (!cancelled) {
          setLoaded({ coords, result: { status: "ok", forecast } });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Ukjent feil";
          setLoaded({ coords, result: { status: "error", message } });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [coords.lat, coords.lon]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading =
    loaded === null ||
    loaded.coords.lat !== coords.lat ||
    loaded.coords.lon !== coords.lon;

  const days = useMemo<DayGroup[]>(() => {
    if (!loaded || loaded.result.status !== "ok") return [];
    const grouped = groupForecastByDay(loaded.result.forecast);
    return Object.entries(grouped)
      .slice(0, 5)
      .map(([date, entries]) => {
        const symbolCode =
          entries.find((e) => e.data.next_6_hours)?.data.next_6_hours?.summary
            .symbol_code ??
          entries[0]?.data.next_1_hours?.summary.symbol_code ??
          null;

        const temps = entries
          .map((e) => e.data.instant.details.air_temperature)
          .filter((t): t is number => t != null);
        const tempMax = temps.length ? Math.max(...temps) : null;
        const tempMin = temps.length ? Math.min(...temps) : null;

        const precipitation = entries.reduce<number>((sum, e) => {
          return (
            sum +
            (e.data.next_1_hours?.details.precipitation_amount ??
              e.data.next_6_hours?.details.precipitation_amount ??
              0)
          );
        }, 0);

        return {
          date,
          label: formatDay(date),
          symbolCode,
          tempMax: tempMax != null ? Math.round(tempMax) : null,
          tempMin: tempMin != null ? Math.round(tempMin) : null,
          precipitation: Math.round(precipitation * 10) / 10,
        };
      });
  }, [loaded]);

  const current = useMemo(() => {
    if (!loaded || loaded.result.status !== "ok") return null;
    return getCurrentConditions(loaded.result.forecast);
  }, [loaded]);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-[#e0e8d8] bg-white p-5">
        <div className="flex items-center gap-2 text-[#5a6e50] text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4f59fb] border-t-transparent" />
          Henter vær…
        </div>
      </div>
    );
  }

  if (loaded?.result.status === "error") {
    return (
      <div className="w-full rounded-2xl border border-[#ffcece] bg-[#fff5f5] p-5">
        <p className="text-sm text-[#bf0000]">
          Kunne ikke hente vær: {loaded.result.message}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-[#e0e8d8] bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#f0f5eb] px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7a9a6a]">
            Vær
          </p>
          {label && (
            <p className="text-sm font-medium text-[#1a2e1a] mt-0.5">
              {label}
            </p>
          )}
        </div>
        {current && (
          <div className="text-right">
            <span className="text-2xl font-bold text-[#1a2e1a]">
              {current.temperature != null
                ? `${Math.round(current.temperature)}°`
                : "–"}
            </span>
            <p className="text-xs text-[#5a6e50]">
              {weatherEmoji(current.symbolCode)}
            </p>
          </div>
        )}
      </div>

      {/* 5-day strip */}
      <div className="grid grid-cols-5 divide-x divide-[#e0e8d8]">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center py-3 px-1 gap-1"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7a9a6a]">
              {day.label}
            </span>
            <span className="text-xl leading-none">
              {weatherEmoji(day.symbolCode)}
            </span>
            <span className="text-xs font-semibold text-[#1a2e1a]">
              {day.tempMax != null ? `${day.tempMax}°` : "–"}
            </span>
            <span className="text-[10px] text-[#5a6e50]">
              {day.tempMin != null ? `${day.tempMin}°` : "–"}
            </span>
            {(day.precipitation ?? 0) > 0 && (
              <span className="text-[10px] text-[#1d4ed8]">
                {day.precipitation} mm
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-2 border-t border-[#e0e8d8]">
        <p className="text-[10px] text-[#a0b090]">Kilde: Yr / MET Norway</p>
      </div>
    </div>
  );
}
