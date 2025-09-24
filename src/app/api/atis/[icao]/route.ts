import { NextRequest } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

async function fetchAtis(icao: string) {
  const url = `https://atis.guru/atis/${icao.toUpperCase()}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const blocks = $("div.atis")
    .map((_, el) => $(el).text().trim())
    .get();

  // 最初が ARR、次が DEP → 割当を修正
  const dep = blocks[1] || null;
  const arr = blocks[0] || null;

  return {
    icao: icao.toUpperCase(),
    dep,
    arr,
    source: url,
  };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ icao: string }> }
) {
  const { icao } = await ctx.params;
  if (!icao) {
    return new Response(JSON.stringify({ error: "Missing ICAO" }), {
      status: 400,
    });
  }

  try {
    const data = await fetchAtis(icao);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch ATIS",
        details: String(err?.message || err),
      }),
      { status: 500 }
    );
  }
}
