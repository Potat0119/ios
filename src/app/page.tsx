'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tabs from './Tabs';
import AtisSearch from './components/AtisSearch';
import Calculator from './components/Calculator';

type TabKey =
  | 'simbrief'
  | 'atis'
  | 'calculator'
  | 'efb'
  | 'mcdu';

type Mode = 'fenix' | 'fslabs';

// ---- 小型ユーティリティ：セッション保存 ----
function useSessionSetting<T extends string>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const v = sessionStorage.getItem(key);
    return (v as T) ?? initial;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

// ========================
//   IP 整形（3桁で自動 '.' ）
// ========================
function formatIpInput(raw: string): string {
  // 数字と . のみ許可
  let cleaned = raw.replace(/[^\d.]/g, '');

  // 連続 .. を防止
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  // 4ブロックまで、各ブロックは最大3桁
  const parts = cleaned.split('.').map(p => p.slice(0, 3));
  let formatted = parts.slice(0, 4).join('.');

  // 直近ブロックがちょうど3桁なら、自動で次セグメントへ
  const blocks = formatted.split('.');
  const last = blocks[blocks.length - 1] ?? '';
  if (last.length === 3 && blocks.length < 4 && !formatted.endsWith('.')) {
    formatted += '.';
  }
  return formatted;
}

function PageContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const active = (sp.get('tab') as TabKey) ?? 'simbrief';

  const setActive = (k: TabKey) => {
    const qs = new URLSearchParams(sp.toString());
    qs.set('tab', k);
    router.replace(`/?${qs.toString()}`);
  };

  // ===== モード（Fenix / FSLabs） =====
  const [mode, setMode] = useSessionSetting<Mode>('airliner_mode', 'fenix');

  // ===== IP（SEL/DEL 仕様）=====
  const [activeIp, setActiveIp] = useSessionSetting<string>('efb_ip_active', 'localhost');
  const [locked, setLocked] = useSessionSetting<'0' | '1'>('efb_ip_locked', '0');
  const [ipInput, setIpInput] = useState<string>('');

  const shownIp = locked === '1' ? activeIp : ipInput;

  // ===== 通知（256超時） =====
  const [showIpNotice, setShowIpNotice] = useState(false);

  // ---- Space / Enter キー処理 ----
  const handleIpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked === '1') return;

    // Space → dot
    if (e.key === ' ') {
      e.preventDefault();
      setIpInput(v => (v.endsWith('.') ? v : v + '.'));
      return;
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault();

      const dotCount = (ipInput.match(/\./g) || []).length;

      if (dotCount < 3) {
        // セグメントが揃っていない → '.' を追加
        setIpInput(v => (v.endsWith('.') ? v : v + '.'));
        return;
      }

      // セグメントが揃っている → SEL と同じ動作（確定 & ロック）
      const trimmed = (ipInput || '').trim();
      setActiveIp(trimmed === '' ? 'localhost' : trimmed);
      setLocked('1');
    }
  };

  // ---- onChange：3桁自動 '.' + 256超なら通知＆差し戻し ----
  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked === '1') return;

    const candidate = formatIpInput(e.target.value);

    // 各セグメントが 0〜255 以内か確認
    const parts = candidate.split('.');
    for (const p of parts) {
      if (p === '') continue; // 入力途中は許す
      const n = Number(p);
      if (Number.isFinite(n) && n > 255) {
        // 通知 → 反映しない（直前値を維持）
        setShowIpNotice(true);
        setTimeout(() => setShowIpNotice(false), 2000);
        return;
      }
    }

    setIpInput(candidate);
  };

  // ---- SEL：確定 & ロック（空なら localhost） ----
  const handleSEL = () => {
    const trimmed = (ipInput || '').trim();
    setActiveIp(trimmed === '' ? 'localhost' : trimmed);
    setLocked('1');
  };

  // ---- DEL：解除 & localhost に戻し、入力欄は空へ ----
  const handleDEL = () => {
    setActiveIp('localhost');
    setLocked('0');
    setIpInput('');
  };

  // ===== EFB / MCDU URL =====
  const efbUrl = useMemo(() => {
    const host = activeIp || 'localhost';
    return mode === 'fenix'
      ? `http://${host}:8083`
      : `http://${host}:23032`;
  }, [activeIp, mode]);

  const mcduUrl = useMemo(() => {
    const host = activeIp || 'localhost';
    return mode === 'fenix'
      ? `http://${host}:8083`
      : `http://${host}:8080/mcdu/mcdu.html`;
  }, [activeIp, mode]);

  // ===== 全タブ =====
  const panes = [
    { key: 'simbrief',   label: 'SimBrief',   url: 'https://dispatch.simbrief.com/briefing/latest', mode: 'iframe' as const },
    { key: 'atis',       label: 'ATIS',       mode: 'component' as const },
    { key: 'calculator', label: 'Calculator', mode: 'component' as const },
    { key: 'efb',        label: 'EFB',        url: efbUrl,  mode: 'iframe' as const },
    { key: 'mcdu',       label: 'MCDU',       url: mcduUrl, mode: 'iframe' as const },
  ] as const;

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ '--tab-h': '44px' } as React.CSSProperties}
    >
      <Tabs
        items={panes.map(p => ({ key: p.key, label: p.label }))}
        activeKey={active}
        onChange={k => setActive(k as TabKey)}
        rightControls={
          <div className="flex items-center gap-3">
            {/* モード切替 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="airliner-mode"
                  value="fenix"
                  checked={mode === 'fenix'}
                  onChange={() => setMode('fenix')}
                />
                <span>Fenix</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="airliner-mode"
                  value="fslabs"
                  checked={mode === 'fslabs'}
                  onChange={() => setMode('fslabs')}
                />
                <span>FSLabs</span>
              </label>
            </div>

            {/* IP 入力 + SEL/DEL */}
            <div className="flex items-center gap-1">
              <input
                value={shownIp}
                onChange={handleIpChange}
                onKeyDown={handleIpKeyDown}
                placeholder="IP (default: localhost)"
                className="border px-2 py-1 w-[200px]"
                disabled={locked === '1'}
              />
              {locked === '1' ? (
                <button
                  onClick={handleDEL}
                  className="px-2 py-1 border rounded text-red-600 bg-white hover:bg-gray-50"
                  title="使用中IPをlocalhostに戻し、再入力可能にします"
                >
                  DEL
                </button>
              ) : (
                <button
                  onClick={handleSEL}
                  className="px-2 py-1 border rounded bg-white hover:bg-gray-50"
                  title="入力値でロック（空ならlocalhost）"
                >
                  SEL
                </button>
              )}
            </div>
          </div>
        }
      />

      {/* タブ内容 */}
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

      {/* 256超 通知 */}
      {showIpNotice && (
        <div className="fixed top-3 right-3 bg-black/80 text-white px-4 py-2 rounded shadow-lg text-sm z-[9999]">
          PRESS SPACE TO NEXT SEGMENT
        </div>
      )}
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
