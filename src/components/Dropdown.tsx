import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // extra class untuk trigger (mis. lebar)
  size?: 'sm' | 'md';
}

export default function Dropdown({ value, options, onChange, placeholder = 'Pilih', className = '', size = 'md' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // keyboard
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); if (open) { onChange(options[active].value); setOpen(false); } else setOpen(true); }
  };

  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full ${pad} flex items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white text-left font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400`}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute z-30 mt-1.5 w-full max-h-60 overflow-auto nice-scrollbar rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-900/5"
          >
            {options.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`flex items-center justify-between gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm transition ${i === active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'} ${isSel ? 'font-semibold' : ''}`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && <Check className="w-4 h-4 text-[#0077C6] flex-shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
