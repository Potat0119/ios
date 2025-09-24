'use client';
import { useState } from 'react';

export default function Navigraph() {
  const [count, setCount] = useState(0);
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Navigraph</h2>
      <p className="mb-2">このカウンタはタブを切り替えても保持されます：{count}</p>
      <button className="border px-2 py-1" onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
