import { NextRequest, NextResponse } from "next/server";
import { getForecast } from "@/lib/yr";

/** Default test coordinates: Galdhøpiggen, Norway's highest peak */
const DEFAULT_LAT = 61.6363;
const DEFAULT_LON = 8.3128;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const lat = parseFloat(searchParams.get("lat") ?? String(DEFAULT_LAT));
  const lon = parseFloat(searchParams.get("lon") ?? String(DEFAULT_LON));

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Ugyldig lat/lon-parameter" },
      { status: 400 }
    );
  }

  try {
    const forecast = await getForecast({ lat, lon });
    return NextResponse.json(forecast);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
