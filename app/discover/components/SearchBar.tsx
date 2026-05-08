"use client";

import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/app/api/search/route";

const TYPE_META: Record<SearchResult["type"], { label: string; icon: string }> = {
  område:    { label: "Område",    icon: "🗺" },
  hytte:     { label: "Hytte",     icon: "🏕" },
  fjelltopp: { label: "Fjelltopp", icon: "⛰" },
};

interface Props {
  onSelect: (result: SearchResult) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<SearchResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced fetch — fires 300 ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results ?? []);
        setOpen(true);
        setActiveIdx(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectResult(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function selectResult(result: SearchResult) {
    setQuery(result.name);
    setOpen(false);
    setResults([]);
    onSelect(result);
    inputRef.current?.blur();
  }

  // Group results by type in a stable order
  const grouped = (["område", "hytte", "fjelltopp"] as const).reduce<
    Record<SearchResult["type"], SearchResult[]>
  >(
    (acc, t) => ({ ...acc, [t]: results.filter((r) => r.type === t) }),
    { område: [], hytte: [], fjelltopp: [] }
  );

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a6741] text-lg pointer-events-none">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          // 150 ms gives onMouseDown on a result time to fire before the dropdown closes
      onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Søk på område, hytte eller fjelltopp…"
          autoComplete="off"
          aria-label="Søk etter tur"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
          className="w-full rounded-2xl border border-[#c8d8b8] bg-white pl-11 pr-4 py-3.5 text-base text-[#1a2e1a] placeholder-[#8aaa7a] shadow-sm outline-none focus:border-[#2d4a2d] focus:ring-2 focus:ring-[#2d4a2d]/20 transition"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#4a6741] animate-pulse">
            Søker…
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-2xl border border-[#e0e8d8] bg-white shadow-lg overflow-hidden"
        >
          {(["område", "hytte", "fjelltopp"] as const).map((type) => {
            const group = grouped[type];
            if (group.length === 0) return null;
            const { label, icon } = TYPE_META[type];
            return (
              <li key={type}>
                <div className="px-4 py-2 text-xs font-semibold text-[#4a6741] bg-[#f5f8f2] uppercase tracking-wide">
                  {icon} {label}
                </div>
                <ul>
                  {group.map((result, idx) => {
                    const globalIdx = results.indexOf(result);
                    return (
                      <li
                        key={result.id}
                        role="option"
                        aria-selected={globalIdx === activeIdx}
                        onMouseDown={() => selectResult(result)}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                          globalIdx === activeIdx
                            ? "bg-[#eaf3e0] text-[#1a2e1a]"
                            : "hover:bg-[#f5f8f2] text-[#2d3a2d]"
                        }`}
                      >
                        <span className="font-medium text-sm">{result.name}</span>
                        <span className="text-xs text-[#6a8a5a] ml-4 truncate max-w-[180px]">
                          {result.description}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      {open && results.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-[#e0e8d8] bg-white px-4 py-4 text-sm text-[#6a8a5a] shadow-lg">
          Ingen treff på «{query}»
        </div>
      )}
    </div>
  );
}
