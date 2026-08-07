import React from 'react';

interface MetaListProps {
  items: { label: string; text: React.ReactNode }[];
}

export function MetaList({ items }: MetaListProps) {
  return (
    <div className="space-y-0">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <div className="flex gap-5 py-5">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 ring-4 ring-slate-100 shrink-0" />
              {idx < items.length - 1 && <div className="w-px h-full bg-slate-200 mt-1" />}
            </div>
            <div className="space-y-1.5 pb-6">
              <h4 className="text-sm font-extrabold text-[#0F172A]">{item.label}</h4>
              <div className="text-xs text-slate-600 leading-relaxed">{item.text}</div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
