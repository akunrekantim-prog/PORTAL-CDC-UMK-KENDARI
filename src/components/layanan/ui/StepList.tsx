import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StepListProps {
  steps: { title: string; desc: string }[];
  icon?: LucideIcon;
}

export function StepList({ steps, icon: Icon }: StepListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {steps.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
            {idx + 1}
          </span>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
