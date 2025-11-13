'use client';

import { useEffect, useMemo, useState } from 'react';
import ChinaRvsmEWTable from './ChinaRVSMTable';

type LastEdited =
  | 'kgWeight' | 'lbsWeight'
  | 'kgFuel' | 'liters' | 'density'
  | 'c' | 'f'
  | 'hpa' | 'inhg'
  | 'kt' | 'ms'
  | 'wind';

function LabeledInput({
  value,
  onChange,
  unit,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border px-3 py-2 w-32 text-right"
        inputMode="decimal"
      />
      <span className="text-gray-600">{unit}</span>
    </div>
  );
}

export default function Calculator() {
  const [kgWeight, setKgWeight] = useState('');
  const [lbsWeight, setLbsWeight] = useState('');

  const [kgFuel, setKgFuel] = useState('');
  const [liters, setLiters] = useState('');
  const [density, setDensity] = useState('0.8');

  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const [hpa, setHpa] = useState('');
  const [inhg, setInhg] = useState('');

  const [t, setT] = useState('');
  const [td, setTd] = useState('');

  const [kt, setKt] = useState('');
  const [ms, setMs] = useState('');

  const [hdg, setHdg] = useState('');
  const [wdir, setWdir] = useState('');
  const [wdirVar1, setWdirVar1] = useState('');
  const [wdirVar2, setWdirVar2] = useState('');
  const [wspd, setWspd] = useState('');
  const [gust, setGust] = useState('');

  const [rwyA, setRwyA] = useState('');
  const [rwyB, setRwyB] = useState('');
  const [rwyLen, setRwyLen] = useState('');

  const [lastEdited, setLastEdited] = useState<LastEdited | null>(null);

  const num = (v: string) => {
    const x = parseFloat(v);
    return Number.isFinite(x) ? x : NaN;
  };
  const fmt = (v: number, d = 2) => Number.isFinite(v) ? v.toFixed(d) : '';
  const normDeg = (a: number) => ((a % 360) + 360) % 360;

  useEffect(() => {
    if (lastEdited === 'kgWeight') {
      const kgNum = num(kgWeight);
      setLbsWeight(Number.isFinite(kgNum) ? fmt(kgNum * 2.20462, 2) : '');
    } else if (lastEdited === 'lbsWeight') {
      const lbsNum = num(lbsWeight);
      const kgNum = Number.isFinite(lbsNum) ? lbsNum / 2.20462 : NaN;
      setKgWeight(Number.isFinite(kgNum) ? fmt(kgNum, 2) : '');
    }
  }, [kgWeight, lbsWeight, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'kgFuel' || lastEdited === 'density') {
      const kgNum = num(kgFuel);
      const dens = num(density);
      setLiters(Number.isFinite(kgNum) && dens > 0 ? fmt(kgNum / dens, 2) : '');
    } else if (lastEdited === 'liters') {
      const L = num(liters);
      const dens = num(density);
      setKgFuel(Number.isFinite(L) && Number.isFinite(dens) ? fmt(L * dens, 2) : '');
    }
  }, [kgFuel, liters, density, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'c') {
      const cNum = num(c);
      setF(Number.isFinite(cNum) ? fmt((cNum * 9) / 5 + 32, 1) : '');
    } else if (lastEdited === 'f') {
      const fNum = num(f);
      setC(Number.isFinite(fNum) ? fmt(((fNum - 32) * 5) / 9, 1) : '');
    }
  }, [c, f, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'hpa') {
      const p = num(hpa);
      setInhg(Number.isFinite(p) ? fmt(p * 0.0295299830714, 2) : '');
    } else if (lastEdited === 'inhg') {
      const i = num(inhg);
      setHpa(Number.isFinite(i) ? fmt(i / 0.0295299830714, 1) : '');
    }
  }, [hpa, inhg, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'kt') {
      const k = num(kt);
      setMs(Number.isFinite(k) ? fmt(k * 0.514444, 2) : '');
    } else if (lastEdited === 'ms') {
      const m = num(ms);
      setKt(Number.isFinite(m) ? fmt(m / 0.514444, 2) : '');
    }
  }, [kt, ms, lastEdited]);

  const humidity = useMemo(() => {
    const T = num(t || c); // 温度は c か t のどちらか
    const TD = num(td);
    if (!Number.isFinite(T) || !Number.isFinite(TD)) return null;
    const es = 6.11 * Math.pow(10, (7.5 * T) / (237.3 + T));
    const e = 6.11 * Math.pow(10, (7.5 * TD) / (237.3 + TD));
    const rh = (e / es) * 100;
    return Math.min(100, Math.max(0, rh));
  }, [t, td, c]);

  const rwySlope = useMemo(() => {
    const A = num(rwyA);
    const B = num(rwyB);
    const L = num(rwyLen);
    if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(L) || L <= 0) return null;
    return ((B - A) / L) * 100;
  }, [rwyA, rwyB, rwyLen]);

  const windScenarios = useMemo(() => {
    const H = num(hdg);
    const D = num(wdir);
    const V1 = num(wdirVar1);
    const V2 = num(wdirVar2);
    const S = num(wspd);
    const G = num(gust);

    if (!Number.isFinite(H) || !Number.isFinite(D) || !Number.isFinite(S)) return null;

    const scenarios: {label: string, dir: number, spd: number}[] = [];
    scenarios.push({ label: `${D}° / ${S}kt`, dir: normDeg(D), spd: S });
    if (Number.isFinite(G)) {
      scenarios.push({ label: `${D}° / ${G}kt`, dir: normDeg(D), spd: G });
      scenarios.push({ label: `${D}° / ${((S + G) / 2).toFixed(1)}kt`, dir: normDeg(D), spd: (S + G) / 2 });
    }
    if (Number.isFinite(V1)) {
      scenarios.push({ label: `${V1}° / ${S}kt`, dir: normDeg(V1), spd: S });
      if (Number.isFinite(G)) scenarios.push({ label: `${V1}° / ${G}kt`, dir: normDeg(V1), spd: G });
    }
    if (Number.isFinite(V2)) {
      scenarios.push({ label: `${V2}° / ${S}kt`, dir: normDeg(V2), spd: S });
      if (Number.isFinite(G)) scenarios.push({ label: `${V2}° / ${G}kt`, dir: normDeg(V2), spd: G });
    }

    return scenarios.map(s => {
      const relDeg = ((s.dir - normDeg(H) + 540) % 360) - 180;
      const rel = (relDeg * Math.PI) / 180;
      const hw = s.spd * Math.cos(rel);
      const cw = s.spd * Math.sin(rel);
      return {
        label: s.label,
        headTail: hw >= 0 ? `Headwind ${hw.toFixed(1)} kt` : `Tailwind ${Math.abs(hw).toFixed(1)} kt`,
        cross: `${cw >= 0 ? 'Right' : 'Left'} ${Math.abs(cw).toFixed(1)} kt`
      };
    });
  }, [hdg, wdir, wdirVar1, wdirVar2, wspd, gust]);

  const ResetBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="border border-red-500 text-red-500 bg-white px-2 py-1 rounded font-bold"
      aria-label="Reset"
      title="Reset"
    >
      ✕
    </button>
  );

  return (
    <div className="flex gap-4">
    <div className="p-4 space-y-6 h-full overflow-y-auto w-1/2">
      <section>
        <h2 className="font-semibold text-lg">Kg ↔ Lbs</h2>
        <div className="flex gap-4 items-center">
          <ResetBtn onClick={() => { setKgWeight(''); setLbsWeight(''); }} />
          <LabeledInput value={kgWeight} onChange={(v)=>{setKgWeight(v); setLastEdited('kgWeight')}} unit="kg" />
          <LabeledInput value={lbsWeight} onChange={(v)=>{setLbsWeight(v); setLastEdited('lbsWeight')}} unit="lbs" />
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Fuel: Kg ↔ L（Density: Kg/L）</h2>
        <div className="flex gap-4 items-center">
          <ResetBtn onClick={() => { setDensity('0.8'); setKgFuel(''); setLiters(''); }} />
          <LabeledInput value={density} onChange={(v)=>{setDensity(v); setLastEdited('density')}} unit="kg/L" placeholder="Density" />
          <LabeledInput value={kgFuel} onChange={(v)=>{setKgFuel(v); setLastEdited('kgFuel')}} unit="kg" />
          <LabeledInput value={liters} onChange={(v)=>{setLiters(v); setLastEdited('liters')}} unit="L" />
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Temperature & Pressure</h2>
        <div className="flex gap-4 items-center mb-2 flex-wrap">
          <ResetBtn onClick={() => { setC(''); setF(''); setHpa(''); setInhg(''); setT(''); setTd(''); }} />
          <LabeledInput value={c} onChange={(v)=>{setC(v); setLastEdited('c')}} unit="°C" placeholder="T" />
          <LabeledInput value={td} onChange={setTd} unit="°C" placeholder="TD" />
          <LabeledInput value={f} onChange={(v)=>{setF(v); setLastEdited('f')}} unit="°F" />
          <LabeledInput value={hpa} onChange={(v)=>{setHpa(v); setLastEdited('hpa')}} unit="hPa" />
          <LabeledInput value={inhg} onChange={(v)=>{setInhg(v); setLastEdited('inhg')}} unit="inHg" />
        </div>
        {humidity !== null && (
          <div className="mt-2 flex items-center gap-2 text-lg">
            <span>Humidity: {humidity.toFixed(0)} %</span>
            {num(c || t) - num(td) < 3 && <span className="w-4 h-4 rounded-full bg-red-600 inline-block" />}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-lg">Kt ↔ m/s</h2>
        <div className="flex gap-4 items-center">
          <ResetBtn onClick={() => { setKt(''); setMs(''); }} />
          <LabeledInput value={kt} onChange={(v)=>{setKt(v); setLastEdited('kt')}} unit="kt" />
          <LabeledInput value={ms} onChange={(v)=>{setMs(v); setLastEdited('ms')}} unit="m/s" />
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Wind (Variable & Gust Scenarios)</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <ResetBtn onClick={() => { setHdg(''); setWdir(''); setWdirVar1(''); setWdirVar2(''); setWspd(''); setGust(''); }} />
          <LabeledInput value={hdg} onChange={(v)=>{setHdg(v); setLastEdited('wind')}} unit="°" placeholder="Aircraft HDG" />
          <LabeledInput value={wdir} onChange={(v)=>{setWdir(v); setLastEdited('wind')}} unit="°" placeholder="Base Dir" />
          <LabeledInput value={wdirVar1} onChange={(v)=>{setWdirVar1(v); setLastEdited('wind')}} unit="°" placeholder="Var Dir 1" />
          <LabeledInput value={wdirVar2} onChange={(v)=>{setWdirVar2(v); setLastEdited('wind')}} unit="°" placeholder="Var Dir 2" />
          <LabeledInput value={wspd} onChange={(v)=>{setWspd(v); setLastEdited('wind')}} unit="kt" placeholder="Speed (base)" />
          <LabeledInput value={gust} onChange={(v)=>{setGust(v); setLastEdited('wind')}} unit="kt" placeholder="Gust (max)" />
        </div>

        {windScenarios && (
          <div className="mt-4">
            <table className="border text-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Scenario (Dir / Spd)</th>
                  <th className="border px-2 py-1">H/T Wind</th>
                  <th className="border px-2 py-1">X Wind</th>
                </tr>
              </thead>
              <tbody>
                {windScenarios.map((r,i)=>(
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.label}</td>
                    <td className="border px-2 py-1">{r.headTail}</td>
                    <td className="border px-2 py-1">{r.cross}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-lg">Runway Slope</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <ResetBtn onClick={() => { setRwyA(''); setRwyB(''); setRwyLen(''); }} />
          <LabeledInput value={rwyA} onChange={setRwyA} unit="ft" placeholder="Threshold A" />
          <LabeledInput value={rwyB} onChange={setRwyB} unit="ft" placeholder="Threshold B" />
          <LabeledInput value={rwyLen} onChange={setRwyLen} unit="m" placeholder="Length" />
        </div>
        {rwySlope !== null && (
          <div className="mt-2 text-lg">
            Runway Slope: {Math.abs(rwySlope).toFixed(2)} % {rwySlope >= 0 ? 'UP' : 'DN'}
          </div>
        )}
      </section>
    </div>
    <div className="w-1/2">
      <ChinaRvsmEWTable />
    </div>
    </div>
  );
}
