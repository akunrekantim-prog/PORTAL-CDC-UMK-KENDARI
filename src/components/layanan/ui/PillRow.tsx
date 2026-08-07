import React from 'react';

interface PillRowProps {
  items: string[];
}

export function PillRow({ items }: PillRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
