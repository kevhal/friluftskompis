"use client";

import { useState } from "react";
import type { SearchResult } from "@/app/api/search/route";
import SearchBar from "./SearchBar";
import SelectedResult from "./SelectedResult";
import WeatherWidget from "@/app/components/WeatherWidget";

export default function DiscoverClient() {
  const [selected, setSelected] = useState<SearchResult | null>(null);

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6">
      <SearchBar onSelect={setSelected} />
      {selected && <SelectedResult result={selected} />}
      {selected && (
        <WeatherWidget
          coords={{ lat: selected.lat, lon: selected.lon }}
          label={selected.name}
        />
      )}
    </div>
  );
}
