'use client';

type Row = { m: number; ft: number; fl: string };

function makeRows(meters: number[]): Row[] {
  return meters.map((m) => {
    const ft = Math.round((m * 3.28084) / 100) * 100;
    const fl = `FL${Math.round(ft / 100)}`;
    return { m, ft, fl };
  });
}

export default function ChinaRvsmEWTable() {
  const eastMeters = [
    3000, 3900, 4500, 5100, 5700, 6300, 6900, 7500,
    8100, 8700, 9300, 9900, 10500, 11100, 11700, 12300
  ];

  const westMeters = [
    3400, 4000, 4600, 5200, 5800, 6400, 7000, 7600,
    8200, 8800, 9400, 10000, 10600, 11200, 11800, 12400
  ];

  const east = makeRows(eastMeters);
  const west = makeRows(westMeters);

  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-3">
        China Metric RVSM Altitude Conversion Table
      </h2>

      <div className="grid grid-cols-2">
        {/* Eastbound */}
        <div className="overflow-x-auto border">
          <table className="min-w-[420px] w-full border-collapse">
            <caption className="text-left p-3 font-semibold">Eastbound</caption>
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Meters</th>
                <th className="border px-3 py-2 text-left">FL</th>
              </tr>
            </thead>
            <tbody>
              {east.map(r => (
                <tr key={r.m} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{r.m.toLocaleString()}</td>
                  <td className="border px-3 py-2">{r.fl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Westbound */}
        <div className="overflow-x-auto border">
          <table className="min-w-[420px] w-full border-collapse">
            <caption className="text-left p-3 font-semibold">Westbound</caption>
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Meters</th>
                <th className="border px-3 py-2 text-left">FL</th>
              </tr>
            </thead>
            <tbody>
              {west.map(r => (
                <tr key={r.m} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{r.m.toLocaleString()}</td>
                  <td className="border px-3 py-2">{r.fl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
