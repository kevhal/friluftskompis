export const API_URL =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

export interface Area {
  id: number;
  name: string;
  description?: string | null;
  areaType: string;
  provider?: string | null;
  area?: number | null;
  centerPointGeojson?: {
    type: string;
    coordinates: [number, number];
  } | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatArea(sqMeters: number): string {
  const sqKm = sqMeters / 1_000_000;
  if (sqKm >= 1) return `${Math.round(sqKm)} km²`;
  return `${sqKm.toFixed(1)} km²`;
}

export const API_HEADERS = {
  "Content-Type": "application/json",
  Origin: "https://ut.no",
  "apollo-require-preflight": "true",
};
