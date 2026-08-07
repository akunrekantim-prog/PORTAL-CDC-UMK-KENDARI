import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  key?: React.Key;
}

export function InfoRow({ label, children, icon: Icon, key }: InfoRowProps) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        {Icon ? (
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-extrabold">
            1
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1.5">
        <h3 className="font-extrabold text-[#0F172A] text-base">{label}</h3>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
