/**
 * Yr / MET Norway weather API client
 * Docs: https://api.met.no/weatherapi/locationforecast/2.0/documentation
 *       https://api.met.no/weatherapi/nowcast/2.0/documentation
 */

export interface Coords {
  lat: number;
  lon: number;
}

export interface TimeseriesEntry {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        wind_speed?: number;
        relative_humidity?: number;
        cloud_area_fraction?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount?: number };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: {
        precipitation_amount?: number;
        air_temperature_max?: number;
        air_temperature_min?: number;
      };
    };
    next_12_hours?: {
      summary: { symbol_code: string };
    };
  };
}

export interface ForecastResponse {
  type: string;
  geometry: { type: string; coordinates: [number, number, number] };
  properties: {
    meta: {
      updated_at: string;
      units: Record<string, string>;
    };
    timeseries: TimeseriesEntry[];
  };
}

export interface WaterTemperature {
  time: string;
  value: number;
  location: string;
}

export interface CurrentConditions {
  temperature: number | null;
  windSpeed: number | null;
  humidity: number | null;
  symbolCode: string | null;
  precipitation: number | null;
  updatedAt: string;
}

export interface FetchOptions {
  altitude?: number;
  signal?: AbortSignal;
}

const USER_AGENT = "Friluftskompis/1.0 team@blank.no";
const BASE = "https://api.met.no/weatherapi";

/** Truncate coordinates to 4 decimal places as required by the MET API */
function truncate(n: number): number {
  return Math.trunc(n * 10_000) / 10_000;
}

async function yrFetch(url: string, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal,
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Yr API error ${res.status}: ${url}`);
  }
  return res;
}

/**
 * Fetch a 9-day location forecast from Yr.
 */
export async function getForecast(
  coords: Coords,
  opts: FetchOptions = {}
): Promise<ForecastResponse> {
  const lat = truncate(coords.lat);
  const lon = truncate(coords.lon);
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  if (opts.altitude != null) params.set("altitude", String(opts.altitude));

  const url = `${BASE}/locationforecast/2.0/compact?${params}`;
  const res = await yrFetch(url, opts.signal);
  return res.json() as Promise<ForecastResponse>;
}

/**
 * Fetch a short-range nowcast (next 2 hours, radar-based) from Yr.
 * Only available for Norway and surrounding areas.
 */
export async function getNowcast(
  coords: Coords,
  opts: FetchOptions = {}
): Promise<ForecastResponse> {
  const lat = truncate(coords.lat);
  const lon = truncate(coords.lon);
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });

  const url = `${BASE}/nowcast/2.0/complete?${params}`;
  const res = await yrFetch(url, opts.signal);
  return res.json() as Promise<ForecastResponse>;
}

/**
 * Extract current conditions from the first timeseries entry.
 */
export function getCurrentConditions(
  forecast: ForecastResponse
): CurrentConditions {
  const first = forecast.properties.timeseries[0];
  if (!first) {
    return {
      temperature: null,
      windSpeed: null,
      humidity: null,
      symbolCode: null,
      precipitation: null,
      updatedAt: forecast.properties.meta.updated_at,
    };
  }

  const details = first.data.instant.details;
  const next1h = first.data.next_1_hours;
  const next6h = first.data.next_6_hours;
  const symbolCode =
    next1h?.summary.symbol_code ?? next6h?.summary.symbol_code ?? null;
  const precipitation =
    next1h?.details.precipitation_amount ??
    next6h?.details.precipitation_amount ??
    null;

  return {
    temperature: details.air_temperature ?? null,
    windSpeed: details.wind_speed ?? null,
    humidity: details.relative_humidity ?? null,
    symbolCode,
    precipitation,
    updatedAt: forecast.properties.meta.updated_at,
  };
}

/**
 * Group timeseries entries by calendar date (YYYY-MM-DD).
 */
export function groupForecastByDay(
  forecast: ForecastResponse
): Record<string, TimeseriesEntry[]> {
  const result: Record<string, TimeseriesEntry[]> = {};
  for (const entry of forecast.properties.timeseries) {
    const day = entry.time.slice(0, 10);
    if (!result[day]) result[day] = [];
    result[day].push(entry);
  }
  return result;
}
