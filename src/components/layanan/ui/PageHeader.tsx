import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'teal' | 'fuchsia';
}

const ACCENT_MAP = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  blue: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  teal: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  fuchsia: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25',
};

export function PageHeader({ badge, title, description, accent = 'emerald' }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {badge && (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${ACCENT_MAP[accent]}`}>
          {badge}
        </span>
      )}
      <div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-3xl">{description}</p>
      </div>
    </div>
  );
}
