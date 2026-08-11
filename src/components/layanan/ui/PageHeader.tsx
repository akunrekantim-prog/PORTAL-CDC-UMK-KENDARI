import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'teal' | 'fuchsia' | 'slate';
  icon?: LucideIcon;
}

const ACCENT_STYLES: Record<string, { gradient: string; badgeBg: string; badgeText: string; descText: string }> = {
  emerald: { gradient: 'from-emerald-600 to-teal-700', badgeBg: 'bg-white', badgeText: 'text-emerald-700', descText: 'text-emerald-100' },
  blue: { gradient: 'from-[#1E3A8A] to-blue-700', badgeBg: 'bg-[#10B981]', badgeText: 'text-white', descText: 'text-blue-200' },
  amber: { gradient: 'from-amber-500 to-orange-600', badgeBg: 'bg-white', badgeText: 'text-amber-700', descText: 'text-amber-100' },
  violet: { gradient: 'from-violet-600 to-purple-700', badgeBg: 'bg-white', badgeText: 'text-violet-700', descText: 'text-violet-200' },
  rose: { gradient: 'from-rose-500 to-pink-600', badgeBg: 'bg-white', badgeText: 'text-rose-700', descText: 'text-rose-100' },
  teal: { gradient: 'from-teal-600 to-emerald-700', badgeBg: 'bg-white', badgeText: 'text-teal-700', descText: 'text-teal-100' },
  fuchsia: { gradient: 'from-fuchsia-500 to-purple-600', badgeBg: 'bg-white', badgeText: 'text-fuchsia-700', descText: 'text-fuchsia-100' },
  slate: { gradient: 'from-slate-700 to-gray-800', badgeBg: 'bg-white', badgeText: 'text-slate-700', descText: 'text-slate-300' },
};

export function PageHeader({ badge, title, description, accent = 'emerald', icon: Icon }: PageHeaderProps) {
  const style = ACCENT_STYLES[accent] || ACCENT_STYLES.emerald;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg`}
      style={{ minHeight: 200 }}
    >
      {Icon && (
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Icon className="w-40 h-40 translate-x-10 translate-y-10" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end h-full space-y-3" style={{ minHeight: 200 }}>
        {badge && (
          <span className={`inline-flex items-center gap-1.5 ${style.badgeBg} ${style.badgeText} text-[10px] font-extrabold px-2.5 py-0.5 rounded-sm uppercase tracking-wider w-fit`}>
            {Icon && <Icon className="w-3 h-3" />}
            {badge}
          </span>
        )}
        <h1 className="font-extrabold text-xl md:text-2xl leading-tight">{title}</h1>
        <p className={`${style.descText} text-sm leading-relaxed max-w-2xl`}>{description}</p>
      </div>
    </div>
  );
}
