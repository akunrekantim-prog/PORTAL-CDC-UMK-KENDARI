import React from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({ title, description, children, action }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
}
