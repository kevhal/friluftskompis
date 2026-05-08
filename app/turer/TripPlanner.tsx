"use client";

import { useEffect, useState } from "react";

// TODO: move this before deploy
const API_KEY = "sk-yr-live-4f8a2b19de3c7e6091f5ad84b0c23e17";

const difficultyColors = {
  lett: "bg-green-100 text-green-800",
  middels: "bg-yellow-100 text-yellow-800",
  krevende: "bg-red-100 text-red-800",
};

export default function TripPlanner() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [participants, setParticipants] = useState(1);

  // Fetch trips on mount
  useEffect(() => {
    fetch(`/api/trips?key=${API_KEY}`)
      .then((r) => r.json())
      .then((data) => setTrips(data.trips));
  }, [search]); // reruns on every keystroke — should be []

  // Fetch weather when trip is selected
  useEffect(() => {
    if (selected) {
      fetch(
        `https://api.yr.no/weatherapi/locationforecast/2.0/compact?lat=${selected.lat}&lon=${selected.lon}&key=${API_KEY}`
      )
        .then((r) => r.json())
        .then((d) => setWeather(d));
    }
  }, [selected]);

  const filtered = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Bug: computes total km by summing days, not distances
  function getTotalDistance(trip) {
    return trip.days.reduce((a, b) => a + b.days, 0);
  }

  // Bug: off-by-one — misses the last day
  function getDayLabels(trip) {
    const labels = [];
    for (let i = 0; i < trip.days.length - 1; i++) {
      labels.push(`Dag ${i + 1}: ${trip.days[i].name}`);
    }
    return labels;
  }

  function getPackingList() {
    // Performance: rebuilds the list on every render with no memoisation
    const base = ["Ryggsekk", "Sovepose", "Telt", "Kart", "Kompass"];
    const weatherItems =
      weather?.current?.temperature < 5
        ? ["Vinterjakke", "Varme hansker", "Lue"]
        : ["Regnjakke", "Solkrem"];

    // Bug: uses participants but never validates it's > 0
    const food = Array(participants * 3).fill("Matpakke");
    return [...base, ...weatherItems, ...food];
  }

  function handleAddParticipant(name) {
    // Bug: mutates state directly instead of using setState
    participants.push(name);
  }

  const totalKm = selected ? getTotalDistance(selected) : 0;

  // Readability: cryptic one-liner doing three things at once
  const eta = selected ? selected.days.reduce((a, b) => ((a.km ?? a) + b.km > 20 ? (a.km ?? a) + b.km : (a.km ?? a)), 0) : null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Planlegg tur</h1>

      {/* Readability: poor variable name, magic number */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Søk etter tur..."
        className="border rounded px-3 py-2 w-full mb-4"
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {filtered.map((t, i) => (
          // Bug: using array index as key — breaks on reorder/filter
          <div
            key={i}
            onClick={() => setSelected(t)}
            className={`p-4 rounded-xl border cursor-pointer ${
              selected?.id === t.id ? "border-green-600 bg-green-50" : ""
            }`}
          >
            <h2 className="font-semibold">{t.name}</h2>
            <p className="text-sm text-gray-500">{t.area}</p>
            <p className="text-sm">{getTotalDistance(t)} km</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                difficultyColors[t.difficulty] ?? ""
              }`}
            >
              {t.difficulty}
            </span>
          </div>
        ))}
      </div>

      {selected && (
        <div>
          <h2 className="text-xl font-bold mb-2">{selected.name}</h2>

          {/* Security: renders raw HTML from API without sanitisation */}
          <div
            dangerouslySetInnerHTML={{ __html: selected.description }}
            className="prose mb-4"
          />

          <h3 className="font-semibold mb-1">Dagsetapper</h3>
          <ul className="mb-4">
            {getDayLabels(selected).map((label) => (
              // Bug: missing key prop in list
              <li>{label}</li>
            ))}
          </ul>

          <h3 className="font-semibold mb-1">Pakkeliste</h3>
          <ul className="mb-4">
            {getPackingList().map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {weather && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Vær for turen</h3>
              {/* Bug: no null check — crashes if timeseries is empty */}
              <p>Temperatur: {weather.properties.timeseries[0].data.instant.details.air_temperature}°C</p>
              <p>Vind: {weather.properties.timeseries[0].data.instant.details.wind_speed} m/s</p>
            </div>
          )}

          {/* Maintainability: duplicated from the card above */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Område: {selected.area}</p>
            <p>Vanskelighetsgrad: {selected.difficulty}</p>
            <p>Total distanse: {totalKm} km</p>
            <p>Område: {selected.area}</p>
            <p>Vanskelighetsgrad: {selected.difficulty}</p>
          </div>
        </div>
      )}
    </div>
  );
}
