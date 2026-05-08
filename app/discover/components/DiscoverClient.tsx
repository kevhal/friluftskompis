"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import SelectedResult from "./SelectedResult";
import type { SearchResult } from "@/app/api/search/route";

export default function DiscoverClient() {
  const [selected, setSelected] = useState<SearchResult | null>(null);

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6">
      <SearchBar onSelect={setSelected} />
      {selected && <SelectedResult result={selected} />}
    </div>
  );
}
