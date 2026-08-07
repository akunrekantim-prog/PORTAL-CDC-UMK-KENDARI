import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'teal' | 'fuchsia' | 'slate';
  onClick?: () => void;
}

const ACCENT_BORDERS = {
  emerald: 'hover:border-emerald-200',
  blue: 'hover:border-blue-200',
  amber: 'hover:border-amber-200',
  violet: 'hover:border-violet-200',
  rose: 'hover:border-rose-200',
  teal: 'hover:border-teal-200',
  fuchsia: 'hover:border-fuchsia-200',
  slate: 'hover:border-slate-300',
};

export function Card({ children, className, hover, accent, onClick }: CardProps) {
  const hoverClass = hover ? `transition-all duration-200 hover:shadow-md ${ACCENT_BORDERS[accent || 'slate']}` : '';
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-6 md:p-8 shadow-sm ${hoverClass} ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
