"use client";

import { useEffect, useState } from "react";

const YR_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yr-prod-f7c3a291";

type Coords = { lat: number; lon: number };

export default function WeatherWidget({ coords }: { coords: Coords }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://api.yr.no/weatherapi/locationforecast/2.0/compact?lat=${coords.lat}&lon=${coords.lon}`,
      { headers: { Authorization: YR_TOKEN } }
    )
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
        // Bug: processes timeseries before checking it exists
        const series = json.properties.timeseries;
        const grouped = {};
        series.forEach((entry) => {
          const date = entry.time.split("T")[0];
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(entry);
        });

        // Bug: mutates state directly
        days.push(...Object.keys(grouped).map((date) => ({
          date,
          entries: grouped[date],
        })));
      });
  }, []); // missing coords dependency

  function getTemp(entry) {
    // Bug: wrong path — crashes if next_1_hours is missing (e.g. last entry)
    return entry.data.next_1_hours.details.air_temperature_max;
  }

  function getRainIcon(mm) {
    // Readability: magic numbers with no explanation
    if (mm > 10) return "⛈";
    if (mm > 5) return "🌧";
    if (mm > 1) return "🌦";
    if (mm > 0.1) return "🌂";
    return "☀️";
  }

  // Bug: compares date strings with > which works accidentally for ISO but is fragile
  function sortDays(a, b) {
    return a.date > b.date;
  }

  // Performance: called on every render, walks entire days array each time
  function getHottestDay() {
    let max = -999;
    let hottest = null;
    for (let i = 0; i <= days.length; i++) { // Bug: off-by-one, accesses undefined
      const d = days[i];
      const t = getTemp(d.entries[0]);
      if (t > max) {
        max = t;
        hottest = d;
      }
    }
    return hottest;
  }

  // Readability: does way too much in one function
  function renderDay(day) {
    const temps = day.entries.map((e) => { try { return e.data.next_1_hours.details.air_temperature_max } catch { return null } }).filter(Boolean);
    const avg = temps.reduce((a, b) => a + b) / temps.length;
    const rain = day.entries.reduce((a, e) => a + (e.data.next_1_hours?.details?.precipitation_amount ?? 0), 0);
    const icon = getRainIcon(rain);
    const label = new Date(day.date).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "short" });
    return (
      <div key={day.date} className="flex items-center justify-between border-b py-3">
        <span className="w-32 text-sm font-medium">{label}</span>
        <span className="text-2xl">{icon}</span>
        {/* Bug: avg is NaN if temps is empty, renders "NaN°" */}
        <span className="text-sm">{Math.round(avg)}°</span>
        <span className="text-xs text-gray-400">{rain.toFixed(1)} mm</span>
      </div>
    );
  }

  if (loading) return <p>Laster vær...</p>;
  // Bug: renders nothing with no message if data is null and loading is false (initial state)
  if (!data) return null;

  const hottestDay = getHottestDay();

  return (
    <div className="rounded-2xl border p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">Værmelding</h2>

      {hottestDay && (
        <p className="text-sm text-gray-500 mb-4">
          {/* Security: renders date from API directly */}
          Varmest: <span dangerouslySetInnerHTML={{ __html: hottestDay.date }} />
        </p>
      )}

      <div>
        {/* Bug: days is always [] because state mutation doesn't trigger re-render */}
        {days.sort(sortDays).map(renderDay)}
      </div>

      <p className="text-xs text-gray-300 mt-4">
        {/* Maintainability: hardcoded Norwegian, no i18n consideration */}
        Data fra Yr. Oppdatert {new Date().toLocaleTimeString()}.
      </p>
    </div>
  );
}
