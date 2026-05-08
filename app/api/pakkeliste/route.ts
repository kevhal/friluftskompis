import { NextRequest, NextResponse } from "next/server";

export interface PakkelisteItem {
  kategori: string;
  item: string;
  aiGenerert: boolean;
  viktig?: boolean;
}

export interface PakkelisteResponse {
  items: PakkelisteItem[];
  sammendrag: string;
  aiGenerert: true;
}

interface RequestBody {
  stedsnavn: string;
  dager: number;
  deltakere: number;
  vaer?: {
    tempMin?: number | null;
    tempMax?: number | null;
    nedbor?: number | null;
    vind?: number | null;
  };
}

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

function buildPrompt(body: RequestBody): string {
  const { stedsnavn, dager, deltakere, vaer } = body;

  const vaerInfo = vaer
    ? [
        vaer.tempMin != null && vaer.tempMax != null
          ? `Temperatur: ${vaer.tempMin}–${vaer.tempMax}°C`
          : "",
        vaer.nedbor != null && vaer.nedbor > 0
          ? `Nedbør: ca. ${vaer.nedbor} mm`
          : "Lite nedbør forventet",
        vaer.vind != null ? `Vind: opptil ${vaer.vind} m/s` : "",
      ]
        .filter(Boolean)
        .join(", ")
    : "Ukjent vær";

  return `Du er en erfaren norsk fjellvandrer. Lag en praktisk pakkeliste for følgende tur:

Sted: ${stedsnavn}
Varighet: ${dager} ${dager === 1 ? "dag" : "dager"}
Antall deltakere: ${deltakere}
Værforhold: ${vaerInfo}

Svar KUN med JSON i dette formatet (ingen annen tekst):
{
  "sammendrag": "Kort setning om listen (maks 80 tegn)",
  "items": [
    { "kategori": "Bekledning", "item": "Regnjakke", "viktig": true },
    { "kategori": "Utstyr", "item": "Kart og kompass" },
    ...
  ]
}

Kategorier å bruke: Bekledning, Utstyr, Mat og drikke, Sikkerhet, Hygiene, Annet.
Inkluder 15–25 relevante punkter. Merk de aller viktigste med "viktig": true.
Tilpass listen til vær og varighet. Ikke ta med åpenbare ting som mobiltelefon.`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY ikke konfigurert" },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }

  const { stedsnavn, dager = 1, deltakere = 1 } = body;
  if (!stedsnavn) {
    return NextResponse.json({ error: "stedsnavn er påkrevd" }, { status: 400 });
  }

  const prompt = buildPrompt({ stedsnavn, dager, deltakere, vaer: body.vaer });

  let aiText: string;
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("[/api/pakkeliste] Anthropic error:", response.status, errText.slice(0, 200));
      return NextResponse.json(
        { error: "AI-tjenesten svarte ikke som forventet" },
        { status: 502 }
      );
    }

    const data = await response.json();
    aiText = data.content?.[0]?.text ?? "";
  } catch (err) {
    console.error("[/api/pakkeliste] fetch error:", err);
    return NextResponse.json({ error: "Kunne ikke nå AI-tjenesten" }, { status: 502 });
  }

  // Parse JSON from AI response
  let parsed: { sammendrag: string; items: { kategori: string; item: string; viktig?: boolean }[] };
  try {
    // Strip any markdown code fences if present
    const cleaned = aiText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[/api/pakkeliste] Could not parse AI JSON:", aiText.slice(0, 300));
    return NextResponse.json({ error: "Kunne ikke tolke AI-svar" }, { status: 502 });
  }

  const result: PakkelisteResponse = {
    sammendrag: parsed.sammendrag ?? "",
    aiGenerert: true,
    items: (parsed.items ?? []).map((i) => ({
      kategori: i.kategori ?? "Annet",
      item: i.item,
      aiGenerert: true,
      viktig: i.viktig ?? false,
    })),
  };

  return NextResponse.json(result);
}
