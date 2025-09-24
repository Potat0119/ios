'use client';

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Tabs from "./Tabs";
import AtisSearch from "./components/AtisSearch";
import Calculator from "./components/Calculator";

type TabKey = 'simbrief' | 'atis' | 'calculator' | 'List' | 'Schedule';

function PageContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const active = (sp.get('tab') as TabKey) ?? 'simbrief';

  const setActive = (k: TabKey) => {
    const qs = new URLSearchParams(sp.toString());
    qs.set('tab', k);
    router.replace(`/?${qs.toString()}`);
  };

  const panes = [
    { key: 'simbrief',   label: 'SimBrief',   url: 'https://dispatch.simbrief.com/briefing/latest', mode: 'iframe' },
    { key: 'atis',       label: 'ATIS',       mode: 'component' },
    { key: 'calculator', label: 'Calculator', mode: 'component' },
    { key: 'List',       label: 'List',       url: 'https://docs.google.com/spreadsheets/d/1NmRoZCWvGv-SM6JqpTLkbenMFHhOlVHDcEA327u7_6g/edit?gid=735616919#gid=735616919', mode: 'iframe' },
    { key: 'Schedule',   label: 'Schedule',   url: 'https://docs.google.com/spreadsheets/d/1i_SoLizLL0OlBTQgvm_LgK2QYpeOj7i8axjqXCt1Exc/edit?gid=1638369054#gid=1638369054', mode: 'iframe' },
  ] as const;

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ '--tab-h': '44px' } as React.CSSProperties}
    >
      <Tabs
        items={panes.map(p => ({ key: p.key, label: p.label }))}
        activeKey={active}
        onChange={(k) => setActive(k as TabKey)}
      />
      <div
        className="relative w-full"
        style={{ height: 'calc(100dvh - var(--tab-h))', overflow: 'hidden' }}
      >
        {panes.map(p => (
          <section
            key={p.key}
            className={
              p.key === active
                ? 'relative h-full'
                : 'absolute inset-0 h-full opacity-0 pointer-events-none -z-10'
            }
          >
            {p.mode === 'iframe' && (
              <iframe
                src={p.url}
                title={p.label}
                style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                loading="eager"
              />
            )}
            {p.mode === 'component' && p.key === 'atis' && <AtisSearch />}
            {p.mode === 'component' && p.key === 'calculator' && <Calculator />}
          </section>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
