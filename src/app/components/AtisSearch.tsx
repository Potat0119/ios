'use client';

import { useState } from "react";

function extractUtcTime(raw: string): string | null {
  const m = raw.match(/\b(\d{4})Z\b/);
  return m ? m[1] : null;
}

function diffMinutesFromNow(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const hours = parseInt(timeStr.slice(0, 2), 10);
  const minutes = parseInt(timeStr.slice(2, 4), 10);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const now = new Date();
  const utcNowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const reportMinutes = hours * 60 + minutes;

  let diff = utcNowMinutes - reportMinutes;
  if (diff < -720) diff += 1440; // 日跨ぎ補正
  if (diff > 720) diff -= 1440;

  return diff;
}

export default function AtisSearch() {
  const [icao, setIcao] = useState("");
  const [dep, setDep] = useState<string | null>(null);
  const [arr, setArr] = useState<string | null>(null);
  const [metar, setMetar] = useState<string | null>(null);
  const [taf, setTaf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!icao) return;
    setLoading(true);
    setDep(null);
    setArr(null);
    setMetar(null);
    setTaf(null);

    try {
      const resAtis = await fetch(`/api/atis/${icao}`);
      const dataAtis = await resAtis.json();
      setDep(dataAtis.dep);
      setArr(dataAtis.arr);

      const resMetar = await fetch(`/api/metar/${icao}`);
      const dataMetar = await resMetar.json();
      setMetar(dataMetar.raw);

      const resTaf = await fetch(`/api/taf/${icao}`);
      const dataTaf = await resTaf.json();
      setTaf(dataTaf.raw);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const depTime = extractUtcTime(dep || "");
  const arrTime = extractUtcTime(arr || "");
  const depDiff = diffMinutesFromNow(depTime);
  const arrDiff = diffMinutesFromNow(arrTime);

  const formatAgo = (diff: number | null) => {
    if (diff === null) return "";
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h > 0 ? `${h}時間` : ""}${m}分前`;
  };

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      <div className="flex gap-2">
        <input
          value={icao}
          onChange={(e) => setIcao(e.target.value.toUpperCase())}
          placeholder="ICAO code (e.g. VHHH)"
          className="border px-3 py-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Go
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {(dep || arr) && (
        <div>
          <h2 className="font-bold mb-2">ATIS</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Departure ATIS</h3>
                {depDiff !== null && (
                  <span className={depDiff >= 120 ? "text-red-600 font-bold" : ""}>
                    ({formatAgo(depDiff)})
                  </span>
                )}
              </div>
              <pre className="whitespace-pre-wrap border p-2 bg-gray-50">
                {dep || "N/A"}
              </pre>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Arrival ATIS</h3>
                {arrDiff !== null && (
                  <span className={arrDiff >= 120 ? "text-red-600 font-bold" : ""}>
                    ({formatAgo(arrDiff)})
                  </span>
                )}
              </div>
              <pre className="whitespace-pre-wrap border p-2 bg-gray-50">
                {arr || "N/A"}
              </pre>
            </div>
          </div>
        </div>
      )}

      {(metar || taf) && (
        <div>
          <h2 className="font-bold mb-2">METAR / TAF</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">METAR</h3>
              <pre className="whitespace-pre-wrap border p-2 bg-gray-50">
                {metar || "N/A"}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold">TAF</h3>
              <pre className="whitespace-pre-wrap border p-2 bg-gray-50">
                {taf || "N/A"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
