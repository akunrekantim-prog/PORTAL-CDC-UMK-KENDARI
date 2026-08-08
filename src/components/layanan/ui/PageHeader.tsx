import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'teal' | 'fuchsia' | 'slate';
  icon?: LucideIcon;
}

const ACCENT_GRADIENTS = {
  emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
  amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
  violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
  rose: 'from-rose-500/10 to-pink-500/10 border-rose-500/20',
  teal: 'from-teal-500/10 to-cyan-500/10 border-teal-500/20',
  fuchsia: 'from-fuchsia-500/10 to-purple-500/10 border-fuchsia-500/20',
  slate: 'from-slate-500/10 to-gray-500/10 border-slate-500/20',
};

const ACCENT_TEXT = {
  emerald: 'text-emerald-700',
  blue: 'text-blue-700',
  amber: 'text-amber-700',
  violet: 'text-violet-700',
  rose: 'text-rose-700',
  teal: 'text-teal-700',
  fuchsia: 'text-fuchsia-700',
  slate: 'text-slate-700',
};

export function PageHeader({ badge, title, description, accent = 'emerald', icon: Icon }: PageHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${ACCENT_GRADIENTS[accent]} border backdrop-blur-sm p-8 md:p-10`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
      <div className="relative space-y-4">
        {badge && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 ${ACCENT_TEXT[accent]} border border-current/10`}>
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {badge}
          </span>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">{title}</h1>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed max-w-3xl">{description}</p>
        </div>
      </div>
    </div>
  );
}
