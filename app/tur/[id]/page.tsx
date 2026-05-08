"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL, API_HEADERS, stripHtml } from "@/app/omrader/shared";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TripMedia {
  id: number;
  uri: string | null;
  description: string | null;
}

interface TripDetail {
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
  elevationLoss: number | null;
  direction: "AA" | "AB" | "ABA" | null;
  media: TripMedia[];
  areas: { id: number; name: string }[];
}

/* ------------------------------------------------------------------ */
/*  Display maps                                                       */
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

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Des",
];

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

/* ------------------------------------------------------------------ */
/*  Media URL helper                                                   */
/* ------------------------------------------------------------------ */

function mediaUrl(media: TripMedia, width = 800): string {
  if (media.uri) return media.uri;
  return `https://res.cloudinary.com/ntb/image/upload/w_${width},q_auto,f_auto/v1/ut_media/${media.id}`;
}

/* ------------------------------------------------------------------ */
/*  GraphQL                                                            */
/* ------------------------------------------------------------------ */

const TRIP_QUERY = `
  query TripById($tripId: Int!) {
    trips(
      paging: { first: 1 }
      filter: { id: { eq: $tripId } }
    ) {
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
          elevationLoss
          direction
          media {
            id
            uri
            description
          }
          areas {
            id
            name
          }
        }
      }
    }
  }
`;

async function fetchTrip(tripId: number): Promise<TripDetail | null> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      query: TRIP_QUERY,
      variables: { tripId },
    }),
  });

  if (!res.ok) throw new Error(`API-feil: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL-feil");

  const node = json.data?.trips?.edges?.[0]?.node;
  return node ?? null;
}

/* ------------------------------------------------------------------ */
/*  Image gallery                                                      */
/* ------------------------------------------------------------------ */

function ImageGallery({ media }: { media: TripMedia[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loadErrors, setLoadErrors] = useState<Set<number>>(new Set());

  const validMedia = media.filter((m) => !loadErrors.has(m.id));

  if (validMedia.length === 0) return null;

  const selected = validMedia[Math.min(selectedIdx, validMedia.length - 1)];

  return (
    <div className="mb-8">
      {/* Main image */}
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#e8f0df] border border-[#e0e8d8]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(selected, 1200)}
          alt={selected.description || "Turbilde"}
          className="w-full h-full object-cover"
          onError={() =>
            setLoadErrors((prev) => new Set(prev).add(selected.id))
          }
        />
      </div>

      {/* Caption */}
      {selected.description && (
        <p className="mt-2 text-sm text-[#5a6e50] italic">
          {stripHtml(selected.description)}
        </p>
      )}

      {/* Thumbnails */}
      {validMedia.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {validMedia.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedIdx
                  ? "border-[#2d4a2d] shadow-md"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(m, 200)}
                alt={m.description || `Bilde ${i + 1}`}
                className="w-full h-full object-cover"
                onError={() =>
                  setLoadErrors((prev) => new Set(prev).add(m.id))
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function TripDetailPage() {
  const params = useParams();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(params.id);
  const isValidId = !isNaN(id);

  useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;

    fetchTrip(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) setError("Turen ble ikke funnet");
        else setTrip(data);
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

  const description = trip?.description ? stripHtml(trip.description) : null;
  const grading = trip?.grading ? GRADING_MAP[trip.grading] : null;
  const activity = trip?.primaryActivityType
    ? ACTIVITY_MAP[trip.primaryActivityType] ?? trip.primaryActivityType
    : null;
  const direction = trip?.direction ? DIRECTION_MAP[trip.direction] : null;
  const duration = trip
    ? formatDuration(trip.durationHours, trip.durationMinutes)
    : "";

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
            href="/kart"
            className="hover:text-[#2d4a2d] transition-colors"
          >
            Kart
          </Link>
          <Link
            href="/omrader"
            className="hover:text-[#2d4a2d] transition-colors"
          >
            Områder
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <button
            onClick={() => window.history.back()}
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
            Tilbake
          </button>

          {/* Invalid ID */}
          {!isValidId && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="font-medium">Ugyldig tur-ID</p>
            </div>
          )}

          {/* Loading */}
          {isValidId && loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2d4a2d] border-t-transparent" />
              <span className="ml-3 text-[#4a5e3a]">Henter turinfo…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="font-medium">Noe gikk galt</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* Trip content */}
          {trip && (
            <>
              {/* Activity type label */}
              {activity && (
                <p className="text-sm font-medium uppercase tracking-wide text-[#8a9e7a] mb-2">
                  {activity}
                </p>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-[#1a2e1a] mb-4">
                {trip.name}
              </h1>

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-8">
                {grading && (
                  <span
                    className={`rounded-full px-3 py-1.5 font-medium ${grading.color}`}
                  >
                    {grading.label}
                  </span>
                )}

                {trip.distance != null && trip.distance > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5 text-[#4a6741]">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    {formatDistance(trip.distance)}
                  </span>
                )}

                {duration && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5 text-[#4a6741]">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" d="M12 6v6l4 2" />
                    </svg>
                    {duration}
                  </span>
                )}

                {trip.elevationGain != null && trip.elevationGain > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5 text-[#4a6741]">
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    {trip.elevationGain} m opp
                  </span>
                )}

                {trip.elevationLoss != null && trip.elevationLoss > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5 text-[#4a6741]">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    {trip.elevationLoss} m ned
                  </span>
                )}

                {direction && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3 py-1.5 text-[#4a6741]">
                    {direction}
                  </span>
                )}
              </div>

              {/* Image gallery */}
              {trip.media.length > 0 && <ImageGallery media={trip.media} />}

              {/* Description */}
              {description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
                    Om turen
                  </h2>
                  <p className="text-[#4a5e3a] leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              )}

              {/* Season info */}
              {trip.season && trip.season.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
                    Sesong
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {trip.season.sort((a, b) => a - b).map((month) => (
                      <span
                        key={month}
                        className="rounded-full bg-[#e8f0df] px-3 py-1.5 text-sm text-[#4a6741] font-medium"
                      >
                        {MONTH_NAMES[month - 1]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas this trip belongs to */}
              {trip.areas && trip.areas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#1a2e1a] mb-3">
                    Områder
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {trip.areas.map((area) => (
                      <Link
                        key={area.id}
                        href={`/omrader/${area.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#d4e8c2] px-3 py-1.5 text-sm font-medium text-[#2d4a2d] hover:bg-[#c4ddb0] transition-colors"
                      >
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
                        {area.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* External link */}
              <div className="mb-8">
                <a
                  href={`https://ut.no/turforslag/${trip.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2d4a2d] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3d6b3d] transition-colors"
                >
                  Se på ut.no
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        &copy; {new Date().getFullYear()} Friluftskompis
      </footer>
    </div>
  );
}
