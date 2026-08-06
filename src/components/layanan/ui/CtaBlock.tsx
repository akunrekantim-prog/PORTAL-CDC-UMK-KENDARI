import React from 'react';

interface CtaBlockProps {
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function CtaBlock({ children, action }: CtaBlockProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-600 leading-relaxed">{children}</p>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
