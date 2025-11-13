import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ icao: string }> }
) {
  const { icao } = await context.params;
  if (!icao) {
    return NextResponse.json({ error: 'Missing ICAO' }, { status: 400 });
  }

  const url = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${icao.toUpperCase()}.TXT`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
  const text = await res.text();

  return NextResponse.json({ raw: text });
}
