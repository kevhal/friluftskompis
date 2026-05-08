"use client";

import { useEffect, useState } from "react";
import { API_URL, API_HEADERS, stripHtml } from "../shared";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TripMedia {
  id: number;
}

interface Trip {
  id: number;
  name: string;
  description: string | null;
  grading: "EASY" | "MODERATE" | "TOUGH" | "VERY_TOUGH" | null;
  primaryActivityType: string | null;
  season: number[];
  distance: number | null;
  durationHours: number | null;
  durationMinutes: number | null;
  elevationGain: number | null;
  direction: "AA" | "AB" | "ABA" | null;
  media: TripMedia[];
}

/* ------------------------------------------------------------------ */
/*  Season helpers                                                     */
/* ------------------------------------------------------------------ */

type Season = "vinter" | "vår" | "sommer" | "høst";

const SEASON_MONTHS: Record<Season, number[]> = {
  vinter: [12, 1, 2],
  vår: [3, 4, 5],
  sommer: [6, 7, 8],
  høst: [9, 10, 11],
};

const SEASON_META: Record<Season, { icon: string; label: string }> = {
  vinter: { icon: "❄️", label: "Vinter" },
  vår: { icon: "🌱", label: "Vår" },
  sommer: { icon: "☀️", label: "Sommer" },
  høst: { icon: "🍂", label: "Høst" },
};

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if ([12, 1, 2].includes(month)) return "vinter";
  if ([3, 4, 5].includes(month)) return "vår";
  if ([6, 7, 8].includes(month)) return "sommer";
  return "høst";
}

function tripMatchesSeason(trip: Trip, season: Season): boolean {
  const months = SEASON_MONTHS[season];
  return trip.season?.some((m) => months.includes(m));
}

/* ------------------------------------------------------------------ */
/*  Display helpers                                                    */
/* ------------------------------------------------------------------ */

const GRADING_MAP: Record<string, { label: string; color: string }> = {
  EASY: { label: "Enkel", color: "bg-emerald-100 text-emerald-800" },
  MODERATE: { label: "Middels", color: "bg-amber-100 text-amber-800" },
  TOUGH: { label: "Krevende", color: "bg-orange-100 text-orange-800" },
  VERY_TOUGH: { label: "Svært krevende", color: "bg-red-100 text-red-800" },
};

const ACTIVITY_MAP: Record<string, string> = {
  HIKING: "Fottur",
  CYCLING: "Sykkeltur",
  SKI_TOURING: "Skitur",
  PADLING: "Padletur",
  CLIMBING: "Klatring",
  GLACIER_TRIP: "Bretur",
  BERRY_PICKING: "Bærtur",
};

const DIRECTION_MAP: Record<string, string> = {
  AA: "Rundtur",
  AB: "Én vei",
  ABA: "Tur-retur",
};

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

function formatDuration(hours: number | null, minutes: number | null): string {
  const h = hours ?? 0;
  const m = minutes ?? 0;
  if (h === 0 && m === 0) return "";
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} t`;
  return `${h} t ${m} min`;
}

/** Trips with 3+ media are considered "popular" */
const POPULAR_MEDIA_THRESHOLD = 3;

/* ------------------------------------------------------------------ */
/*  GraphQL query                                                      */
/* ------------------------------------------------------------------ */

const TRIPS_QUERY = `
  query TripsForArea($areaId: Int!, $first: Int!) {
    trips(
      paging: { first: $first }
      filter: { areas: { id: { eq: $areaId } } }
      sorting: { field: updatedAt, direction: DESC }
    ) {
      totalCount
      edges {
        node {
          id
          name
          description
          grading
          primaryActivityType
          season
          distance
          durationHours
          durationMinutes
          elevationGain
          direction
          media { id }
        }
      }
    }
  }
`;

async function fetchTrips(
  areaId: number,
  signal?: AbortSignal,
): Promise<Trip[]> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      query: TRIPS_QUERY,
      variables: { areaId, first: 50 },
    }),
    signal,
  });

  if (!res.ok) throw new Error(`API-feil: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL-feil");

  const edges: unknown[] = json.data?.trips?.edges ?? [];
  return edges
    .map((e) => (e as { node: Trip }).node)
    .filter(
      (node): node is Trip =>
        node != null && typeof node.id === "number" && Array.isArray(node.media),
    );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TripSuggestions({ areaId }: { areaId: number }) {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const season = getCurrentSeason();
  const meta = SEASON_META[season];

  useEffect(() => {
    const controller = new AbortController();

    fetchTrips(areaId, controller.signal)
      .then((trips) => {
        if (!controller.signal.aborted) setAllTrips(trips);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Ukjent feil");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [areaId]);

  /* Filter by current season, then sort: popular first, then by media count */
  const seasonTrips = allTrips
    .filter((t) => tripMatchesSeason(t, season))
    .sort((a, b) => b.media.length - a.media.length);

  const INITIAL_COUNT = 6;
  const visibleTrips = showAll
    ? seasonTrips
    : seasonTrips.slice(0, INITIAL_COUNT);
  const hasMore = seasonTrips.length > INITIAL_COUNT;

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
          Turforslag
        </h2>
        <div className="flex items-center gap-3 py-8 justify-center text-[#4a5e3a]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2d4a2d] border-t-transparent" />
          Henter turforslag…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
          Turforslag
        </h2>
        <p className="text-sm text-red-600">Kunne ikke hente turforslag: {error}</p>
      </div>
    );
  }

  if (seasonTrips.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
          Turforslag
        </h2>
        <p className="text-sm text-[#4a5e3a]">
          Ingen turforslag tilgjengelig for {meta.label.toLowerCase()} i dette
          området.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header with season badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1a2e1a]">Turforslag</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5 text-sm text-[#4a6741] font-medium">
          {meta.icon} {meta.label}sesong
          <span className="text-[#8a9e7a] font-normal">
            · {seasonTrips.length} turer
          </span>
        </span>
      </div>

      {/* Trip cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleTrips.map((trip) => {
          const grading = trip.grading
            ? GRADING_MAP[trip.grading]
            : null;
          const activity = trip.primaryActivityType
            ? ACTIVITY_MAP[trip.primaryActivityType] ?? trip.primaryActivityType
            : null;
          const direction = trip.direction
            ? DIRECTION_MAP[trip.direction]
            : null;
          const duration = formatDuration(
            trip.durationHours,
            trip.durationMinutes
          );
          const isPopular =
            trip.media.length >= POPULAR_MEDIA_THRESHOLD;
          const stripped = trip.description
            ? stripHtml(trip.description)
            : null;
          const snippet = stripped
            ? stripped.length > 120
              ? stripped.slice(0, 120) + "…"
              : stripped
            : null;

          return (
            <article
              key={trip.id}
              className="relative rounded-2xl border border-[#e0e8d8] bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Popular badge */}
              {isPopular && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 1l2.39 6.17H19l-5.3 4.08L15.78 18 10 13.82 4.22 18l2.08-6.75L1 7.17h6.61z" />
                  </svg>
                  Populært
                </span>
              )}

              {/* Activity type */}
              {activity && (
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a9e7a] mb-1">
                  {activity}
                </p>
              )}

              {/* Name */}
              <h3 className="text-base font-semibold text-[#1a2e1a] leading-snug pr-20 mb-2">
                {trip.name}
              </h3>

              {/* Snippet */}
              {snippet && (
                <p className="text-sm text-[#5a7a4a] leading-relaxed mb-3">
                  {snippet}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {grading && (
                  <span
                    className={`rounded-full px-2.5 py-1 font-medium ${grading.color}`}
                  >
                    {grading.label}
                  </span>
                )}

                {trip.distance != null && trip.distance > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#6a8a5a]">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    {formatDistance(trip.distance)}
                  </span>
                )}

                {duration && (
                  <span className="inline-flex items-center gap-1 text-[#6a8a5a]">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path
                        strokeLinecap="round"
                        d="M12 6v6l4 2"
                      />
                    </svg>
                    {duration}
                  </span>
                )}

                {trip.elevationGain != null && trip.elevationGain > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#6a8a5a]">
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    {trip.elevationGain} m
                  </span>
                )}

                {direction && (
                  <span className="text-[#8a9e7a]">{direction}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#4a6741] hover:text-[#2d4a2d] transition-colors"
          >
            {showAll
              ? "Vis færre"
              : `Vis alle ${seasonTrips.length} turer`}
            <svg
              className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
