import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ icao: string }> }
) {
  const { icao } = await context.params;
  if (!icao) {
    return NextResponse.json({ error: "Missing ICAO" }, { status: 400 });
  }

  try {
    // atis.guru の該当ページを取得
    const url = `https://atis.guru/${icao.toUpperCase()}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch ATIS for ${icao}` },
        { status: res.status }
      );
    }

    const html = await res.text();

    // --- Departure ATIS 抽出 ---
    const depMatch = html.match(/Departure ATIS[\s\S]*?<pre.*?>([\s\S]*?)<\/pre>/i);
    const dep = depMatch ? depMatch[1].trim() : null;

    // --- Arrival ATIS 抽出 ---
    const arrMatch = html.match(/Arrival ATIS[\s\S]*?<pre.*?>([\s\S]*?)<\/pre>/i);
    const arr = arrMatch ? arrMatch[1].trim() : null;

    return NextResponse.json({
      dep: dep || `No Departure ATIS found for ${icao}`,
      arr: arr || `No Arrival ATIS found for ${icao}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
