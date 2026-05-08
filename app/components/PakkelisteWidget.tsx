"use client";

import { useState, useCallback } from "react";
import type { PakkelisteItem, PakkelisteResponse } from "@/app/api/pakkeliste/route";

interface WeatherContext {
  tempMin?: number | null;
  tempMax?: number | null;
  nedbor?: number | null;
  vind?: number | null;
}

interface Props {
  stedsnavn: string;
  vaer?: WeatherContext;
}

const KATEGORI_EMOJI: Record<string, string> = {
  Bekledning: "👕",
  Utstyr: "🎒",
  "Mat og drikke": "🍫",
  Sikkerhet: "🚨",
  Hygiene: "🧼",
  Annet: "📦",
};

export default function PakkelisteWidget({ stedsnavn, vaer }: Props) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "done"; data: PakkelisteResponse; checked: Set<string> }
  >({ status: "idle" });

  const [dager, setDager] = useState(2);
  const [deltakere, setDeltakere] = useState(2);

  const generate = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/pakkeliste", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stedsnavn, dager, deltakere, vaer }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Ukjent feil" }));
        setState({ status: "error", message: err.error ?? "Ukjent feil" });
        return;
      }
      const data: PakkelisteResponse = await res.json();
      setState({ status: "done", data, checked: new Set() });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Nettverksfeil",
      });
    }
  }, [stedsnavn, dager, deltakere, vaer]);

  function toggleItem(key: string) {
    if (state.status !== "done") return;
    const next = new Set(state.checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setState({ ...state, checked: next });
  }

  // Group items by category
  function groupByKategori(items: PakkelisteItem[]) {
    const groups: Record<string, PakkelisteItem[]> = {};
    for (const item of items) {
      if (!groups[item.kategori]) groups[item.kategori] = [];
      groups[item.kategori].push(item);
    }
    return groups;
  }

  return (
    <div className="w-full rounded-2xl border border-[#e0e8d8] bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#f0f5eb] px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7a9a6a]">
            AI-pakkeliste
          </p>
          <p className="text-sm font-medium text-[#1a2e1a] mt-0.5">{stedsnavn}</p>
        </div>
        {/* AI badge — S3 transparency */}
        <span className="inline-flex items-center gap-1 rounded-full bg-[#ede9fe] px-2.5 py-1 text-xs font-medium text-[#5b21b6]">
          ✨ AI-generert
        </span>
      </div>

      <div className="px-5 py-4">
        {state.status === "idle" && (
          <>
            {/* Config row */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-[#4a5e3a]">
              <label className="flex items-center gap-2">
                <span>📅 Dager:</span>
                <select
                  value={dager}
                  onChange={(e) => setDager(Number(e.target.value))}
                  className="rounded-lg border border-[#d4dcc8] px-2 py-1 text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#8ab870]"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span>👥 Deltakere:</span>
                <select
                  value={deltakere}
                  onChange={(e) => setDeltakere(Number(e.target.value))}
                  className="rounded-lg border border-[#d4dcc8] px-2 py-1 text-sm text-[#1a2e1a] focus:outline-none focus:ring-2 focus:ring-[#8ab870]"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              onClick={generate}
              className="w-full rounded-xl bg-[#2d4a2d] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3d6b3d] transition-colors"
            >
              Generer pakkeliste
            </button>
            <p className="mt-2 text-[10px] text-[#a0b090] text-center">
              Basert på vær, varighet og antall deltakere · Generert av AI
            </p>
          </>
        )}

        {state.status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-6 text-[#5a6e50] text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2d4a2d] border-t-transparent" />
            Genererer pakkeliste…
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-xl border border-[#ffcece] bg-[#fff5f5] p-4">
            <p className="text-sm text-[#bf0000]">{state.message}</p>
            <button
              onClick={() => setState({ status: "idle" })}
              className="mt-2 text-xs text-[#2d4a2d] underline"
            >
              Prøv igjen
            </button>
          </div>
        )}

        {state.status === "done" && (
          <>
            {/* Summary */}
            <p className="text-sm text-[#4a5e3a] mb-4 italic">{state.data.sammendrag}</p>

            {/* Grouped items */}
            {Object.entries(groupByKategori(state.data.items)).map(([kategori, items]) => (
              <div key={kategori} className="mb-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#7a9a6a] mb-1.5">
                  {KATEGORI_EMOJI[kategori] ?? "📦"} {kategori}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const key = `${item.kategori}:${item.item}`;
                    const isChecked = state.checked.has(key);
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggleItem(key)}
                          className={`w-full flex items-center gap-2.5 text-left text-sm rounded-lg px-2 py-1 transition-colors ${
                            isChecked
                              ? "text-[#a0b090] line-through"
                              : "text-[#1a2e1a] hover:bg-[#f5f0eb]"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                              isChecked
                                ? "border-[#a0b090] bg-[#a0b090] text-white"
                                : "border-[#d4dcc8]"
                            }`}
                          >
                            {isChecked ? "✓" : ""}
                          </span>
                          <span className="flex-1">{item.item}</span>
                          {item.viktig && !isChecked && (
                            <span className="text-[10px] rounded-full bg-[#fff0c8] text-[#7a4a00] px-1.5 py-0.5 font-medium">
                              viktig
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-[#e0e8d8] flex items-center justify-between">
              <p className="text-[10px] text-[#a0b090]">
                ✨ AI-generert · Verifiser alltid mot lokale forhold
              </p>
              <button
                onClick={() => setState({ status: "idle" })}
                className="text-xs text-[#2d4a2d] hover:underline"
              >
                Ny liste
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
