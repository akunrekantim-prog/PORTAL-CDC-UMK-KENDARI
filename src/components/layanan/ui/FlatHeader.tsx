import React from 'react';

interface FlatHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

// Header editorial flat: judul menyatu dengan background putih tanpa box/wadah
export function FlatHeader({ eyebrow, title, description }: FlatHeaderProps) {
  return (
    <div className="space-y-2">
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {eyebrow}
        </p>
      )}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
