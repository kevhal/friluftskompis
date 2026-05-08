import type { SearchResult } from "@/app/api/search/route";
import { Button, Badge } from "@/app/components/ui";

interface Props {
  result: SearchResult;
}

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  område: "Turområde",
  hytte: "DNT-hytte",
  fjelltopp: "Fjelltopp",
};

export default function SelectedResult({ result }: Props) {
  return (
    <div className="w-full rounded-2xl border border-[#e0e8d8] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-lg font-semibold text-[#1a2e1a]">{result.name}</h2>
        <Badge label={TYPE_LABELS[result.type]} />
      </div>

      <p className="text-sm text-[#5a6e50] leading-relaxed mb-4">
        {result.description}
      </p>

      <div className="flex items-center gap-2 mb-4 text-xs text-[#7a9a6a]">
        <svg
          className="h-3.5 w-3.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>
          {result.lat.toFixed(4)}°N, {result.lon.toFixed(4)}°E
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Planlegg tur her</Button>
        <Button variant="secondary">Vis på kart</Button>
      </div>
    </div>
  );
}
