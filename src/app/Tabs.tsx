'use client';

import React from 'react';

type TabItem = { key: string; label: string };

export default function Tabs({
  items,
  activeKey,
  onChange,
  rightControls,
}: {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  rightControls?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b">
      {/* 左：タブ */}
      <div className="flex">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeKey === item.key
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 右：IP入力＋モード切替＋Charts */}
      <div className="flex items-center gap-3 pr-2">
        {rightControls}
        <a
          href="https://charts.navigraph.com/flights"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Charts
        </a>
      </div>
    </div>
  );
}
