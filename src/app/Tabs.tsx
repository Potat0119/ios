'use client';

import React from 'react';

type TabItem = {
  key: string;
  label: string;
};

export default function Tabs({
  items,
  activeKey,
  onChange,
}: {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b">
      {/* 左側: タブ */}
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

      {/* 右側: Charts ボタン */}
      <div className="mr-2">
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
