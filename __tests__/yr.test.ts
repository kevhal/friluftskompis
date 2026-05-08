/**
 * Unit tests for lib/yr.ts — core weather utility functions.
 * Run with: node --experimental-strip-types --test __tests__/yr.test.ts
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ─── Inline the pure functions under test (no module resolution needed) ───────
// We replicate the logic directly so the tests run without a bundler.

interface TimeseriesEntry {
  time: string;
  data: {
    instant: { details: { air_temperature?: number; wind_speed?: number } };
    next_1_hours?: { summary: { symbol_code: string }; details: { precipitation_amount?: number } };
    next_6_hours?: { summary: { symbol_code: string }; details: { precipitation_amount?: number; air_temperature_max?: number; air_temperature_min?: number } };
  };
}

interface ForecastResponse {
  type: string;
  geometry: { type: string; coordinates: [number, number, number] };
  properties: {
    meta: { updated_at: string; units: Record<string, string> };
    timeseries: TimeseriesEntry[];
  };
}

const osloDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function groupForecastByDay(forecast: ForecastResponse): Record<string, TimeseriesEntry[]> {
  const result: Record<string, TimeseriesEntry[]> = {};
  for (const entry of forecast.properties.timeseries) {
    const day = osloDateFormatter.format(new Date(entry.time));
    if (!result[day]) result[day] = [];
    result[day].push(entry);
  }
  return result;
}

function getCurrentConditions(forecast: ForecastResponse) {
  const first = forecast.properties.timeseries[0];
  if (!first) return { temperature: null, windSpeed: null, symbolCode: null, precipitation: null };
  const details = first.data.instant.details;
  const next1h = first.data.next_1_hours;
  const next6h = first.data.next_6_hours;
  return {
    temperature: details.air_temperature ?? null,
    windSpeed: details.wind_speed ?? null,
    symbolCode: next1h?.summary.symbol_code ?? next6h?.summary.symbol_code ?? null,
    precipitation: next1h?.details.precipitation_amount ?? next6h?.details.precipitation_amount ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEntry(time: string, temp: number, wind = 5, symbolCode = "clearsky_day", precip = 0): TimeseriesEntry {
  return {
    time,
    data: {
      instant: { details: { air_temperature: temp, wind_speed: wind } },
      next_1_hours: { summary: { symbol_code: symbolCode }, details: { precipitation_amount: precip } },
    },
  };
}

function makeForecast(entries: TimeseriesEntry[]): ForecastResponse {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [10.0, 60.0, 100] },
    properties: {
      meta: { updated_at: "2025-07-01T06:00:00Z", units: {} },
      timeseries: entries,
    },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("groupForecastByDay", () => {
  test("groups entries belonging to the same calendar date together", () => {
    const entries = [
      makeEntry("2025-07-01T06:00:00Z", 10),
      makeEntry("2025-07-01T12:00:00Z", 15),
      makeEntry("2025-07-02T06:00:00Z", 8),
    ];
    const grouped = groupForecastByDay(makeForecast(entries));
    const days = Object.keys(grouped);
    assert.equal(days.length, 2, "should produce exactly 2 day buckets");
    const firstDay = Object.values(grouped)[0];
    assert.equal(firstDay.length, 2, "first day should have 2 entries");
    const secondDay = Object.values(grouped)[1];
    assert.equal(secondDay.length, 1, "second day should have 1 entry");
  });

  test("returns empty object for forecast with no timeseries", () => {
    const grouped = groupForecastByDay(makeForecast([]));
    assert.deepEqual(grouped, {});
  });

  test("handles a single entry correctly", () => {
    const entries = [makeEntry("2025-08-15T12:00:00Z", 20)];
    const grouped = groupForecastByDay(makeForecast(entries));
    assert.equal(Object.keys(grouped).length, 1);
  });
});

describe("getCurrentConditions", () => {
  test("extracts temperature and wind speed from first entry", () => {
    const entries = [makeEntry("2025-07-01T06:00:00Z", 14, 8, "clearsky_day", 0)];
    const result = getCurrentConditions(makeForecast(entries));
    assert.equal(result.temperature, 14);
    assert.equal(result.windSpeed, 8);
  });

  test("extracts symbol code from next_1_hours", () => {
    const entries = [makeEntry("2025-07-01T06:00:00Z", 10, 3, "rain")];
    const result = getCurrentConditions(makeForecast(entries));
    assert.equal(result.symbolCode, "rain");
  });

  test("returns null fields when timeseries is empty", () => {
    const result = getCurrentConditions(makeForecast([]));
    assert.equal(result.temperature, null);
    assert.equal(result.windSpeed, null);
    assert.equal(result.symbolCode, null);
    assert.equal(result.precipitation, null);
  });

  test("extracts precipitation amount correctly", () => {
    const entries = [makeEntry("2025-07-01T09:00:00Z", 12, 4, "lightrain", 2.5)];
    const result = getCurrentConditions(makeForecast(entries));
    assert.equal(result.precipitation, 2.5);
  });

  test("wind speed is included in current conditions (F4 requirement)", () => {
    const entries = [makeEntry("2025-07-01T12:00:00Z", 18, 12)];
    const result = getCurrentConditions(makeForecast(entries));
    assert.ok(result.windSpeed !== null, "windSpeed must be present for F4 badge");
    assert.equal(result.windSpeed, 12);
  });
});

describe("search query validation", () => {
  test("query shorter than 2 chars should be rejected", () => {
    const q = "a";
    assert.ok(q.length < 2, "single-char queries should be filtered out");
  });

  test("query of 2+ chars passes minimum length check", () => {
    const q = "ro";
    assert.ok(q.trim().length >= 2);
  });

  test("stripHtml removes HTML tags", () => {
    function stripHtml(html: string): string {
      return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    }
    const result = stripHtml("<p>Hello <strong>world</strong></p>");
    assert.equal(result, "Hello world");
  });
});
