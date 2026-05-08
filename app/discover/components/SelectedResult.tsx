"use client";

import type { SearchResult } from "@/app/api/search/route";

const TYPE_META = {
  område:    { icon: "🗺", color: "bg-blue-50 text-blue-700 border-blue-200" },
  hytte:     { icon: "🏕", color: "bg-green-50 text-green-700 border-green-200" },
  fjelltopp: { icon: "⛰", color: "bg-orange-50 text-orange-700 border-orange-200" },
};

export default function SelectedResult({ result }: { result: SearchResult }) {
  const meta = TYPE_META[result.type];

  return (
    <div className="w-full rounded-2xl border border-[#e0e8d8] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1a2e1a]">{result.name}</h2>
          <p className="text-sm text-[#5a6e50] mt-0.5">{result.description}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.color}`}
        >
          {meta.icon} {result.type}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#6a8a5a] mb-5">
        <span>📍</span>
        <span>
          {result.lat.toFixed(4)}° N, {result.lon.toFixed(4)}° Ø
        </span>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 rounded-xl bg-[#2d4a2d] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3d6b3d] transition-colors">
          Planlegg tur her
        </button>
        <button className="flex-1 rounded-xl border border-[#c8d8b8] px-4 py-2.5 text-sm font-medium text-[#2d4a2d] hover:bg-[#eaf3e0] transition-colors">
          Vis på kart
        </button>
      </div>
    </div>
  );
}
