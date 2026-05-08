"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { SearchResult } from "@/app/api/search/route";

interface Props {
  onSelect: (result: SearchResult) => void;
}

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  område: "Turområde",
  hytte: "DNT-hytte",
  fjelltopp: "Fjelltopp",
};

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data: { results: SearchResult[] }) => {
        setResults(data.results);
        setOpen(data.results.length > 0);
        setActiveIndex(-1);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  function handleSelect(result: SearchResult) {
    setQuery(result.name);
    setOpen(false);
    setResults([]);
    onSelect(result);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Group by type for rendering
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const group = acc[r.type] ?? [];
    group.push(r);
    acc[r.type] = group;
    return acc;
  }, {});

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a9e7a] pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `search-item-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Søk etter sted, hytte eller topp…"
          className="w-full rounded-2xl border border-[#d4dcc8] bg-white py-3.5 pl-12 pr-10 text-sm text-[#1a2e1a] placeholder:text-[#a0b090] focus:outline-none focus:ring-2 focus:ring-[#4f59fb] focus:border-transparent transition-shadow shadow-sm"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4f59fb] border-t-transparent" />
          </div>
        )}
      </div>

      {open && (
        <ul
          id="search-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full rounded-2xl border border-[#d4dcc8] bg-white shadow-xl overflow-hidden"
        >
          {(["område", "hytte", "fjelltopp"] as const).map((type) => {
            const group = grouped[type];
            if (!group?.length) return null;
            return (
              <li key={type} role="presentation">
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#8a9e7a]">
                  {TYPE_LABELS[type]}
                </p>
                <ul role="group">
                  {group.map((result) => {
                    const idx = results.indexOf(result);
                    return (
                      <li
                        key={result.id}
                        id={`search-item-${idx}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                        onMouseDown={() => handleSelect(result)}
                        className={`px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                          activeIndex === idx
                            ? "bg-[#f0f5eb] text-[#1a2e1a]"
                            : "text-[#1a2e1a] hover:bg-[#f7faf4]"
                        }`}
                      >
                        <span className="font-medium">{result.name}</span>
                        <span className="ml-2 text-[#5a6e50] text-xs line-clamp-1">
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
    </div>
  );
}
