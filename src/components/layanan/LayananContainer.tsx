import React from 'react';
import {
  MessageSquare, Puzzle, Wrench, GraduationCap,
  Mic, Briefcase, Sparkles, Rocket, ChevronRight, Home, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayananContainerProps {
  currentTab: string;
  setTab: (tab: string) => void;
  children: React.ReactNode;
}

export interface LayananMenuOption {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

export const LAYANAN_MENU: LayananMenuOption[] = [
  { id: 'campus-hiring', label: 'Campus Hiring - Recruitment', shortLabel: 'Campus Hiring', icon: Rocket, badge: 'Recruitment', color: 'from-blue-700 to-sky-600' },
  { id: 'konseling', label: 'Konseling Karir', shortLabel: 'Konseling', icon: MessageSquare, badge: 'Reservasi', color: 'from-emerald-500 to-teal-600' },
  { id: 'tes-minat', label: 'Tes Potensi Minat Kerja', shortLabel: 'Tes Minat', icon: Brain, badge: 'Klob Meter', color: 'from-blue-600 to-indigo-600' },
  { id: 'workshop', label: 'Workshop Pengembangan Karir', shortLabel: 'Workshop', icon: Wrench, color: 'from-rose-500 to-pink-600' },
  { id: 'softskill', label: 'Softskill & Kewirausahaan', shortLabel: 'Softskill', icon: GraduationCap, badge: 'Sertifikat', color: 'from-cyan-500 to-blue-600' },
  { id: 'seminar', label: 'Seminar Sukses Karir', shortLabel: 'Seminar', icon: Mic, badge: 'E-Ticket', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'career-fair', label: 'Job Fair & Bursa Kerja', shortLabel: 'Job Fair', icon: Sparkles, badge: 'Annual Event', color: 'from-amber-400 to-yellow-600' },
  { id: 'magang', label: 'Magang', shortLabel: 'Magang', icon: Briefcase, badge: 'Alur CDC', color: 'from-teal-600 to-emerald-700' },
];

export default function LayananContainer({ currentTab, setTab, children }: LayananContainerProps) {
  const activeOption = LAYANAN_MENU.find(m => m.id === currentTab) || LAYANAN_MENU[0];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ── Top Hero Banner ── */}
      <div className="bg-gradient-to-r from-[#0F1F4B] via-[#1E3A8A] to-[#1e293b] text-white pt-10 pb-14 px-4 relative overflow-hidden shadow-md">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-blue-200/80 font-medium overflow-x-auto pb-1">
            <button
              onClick={() => setTab('beranda')}
              className="flex items-center gap-1 hover:text-white transition cursor-pointer shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <ChevronRight className="w-3 h-3 text-blue-300/40 shrink-0" />
            <span className="text-blue-200/80 shrink-0">Layanan CDC</span>
            <ChevronRight className="w-3 h-3 text-blue-300/40 shrink-0" />
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
              {activeOption.label}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Pusat Layanan Mahasiswa &amp; Alumni
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-2 tracking-tight text-white">
                {activeOption.label}
              </h1>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
              Akses ekosistem layanan karir terpadu Universitas Muhammadiyah Kendari secara mandiri, interaktif, dan terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content Area with Motion Fade Transition ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
