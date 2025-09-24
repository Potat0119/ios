// src/app/api/taf/[icao]/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { icao: string } }) {
  const { icao } = params;
  if (!icao) {
    return new Response(JSON.stringify({ error: "Missing ICAO" }), { status: 400 });
  }

  const url = `https://tgftp.nws.noaa.gov/data/forecasts/taf/stations/${icao.toUpperCase()}.TXT`;
  const res = await fetch(url);
  const text = await res.text();

  return new Response(JSON.stringify({ raw: text }), {
    headers: { "Content-Type": "application/json" },
  });
}
