import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  MessageSquare, Wrench, GraduationCap,
  Mic, CalendarDays, Rocket, Briefcase, Brain,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SocialShareBar from '../ui/SocialShareBar';

interface LayananContextType {
  isDetailActive: boolean;
  setIsDetailActive: (val: boolean) => void;
}

export const LayananContext = createContext<LayananContextType>({
  isDetailActive: false,
  setIsDetailActive: () => {},
});

export const useLayanan = () => useContext(LayananContext);

interface LayananContainerProps {
  currentTab: string;
  setTab: (tab: string) => void;
  children: React.ReactNode;
}

export interface LayananMenuOption {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

export const LAYANAN_MENU: LayananMenuOption[] = [
  {
    id: 'campus-hiring',
    label: 'Campus Hiring - Recruitment',
    shortLabel: 'Campus Hiring',
    description: 'Program rekrutmen langsung di kampus oleh perusahaan mitra untuk mahasiswa dan alumni UMK.',
    icon: Rocket,
    badge: 'Recruitment',
    color: 'from-blue-700 to-sky-600'
  },
  {
    id: 'konseling',
    label: 'Konseling Karir',
    shortLabel: 'Konseling',
    description: 'Konsultasi dan bimbingan karir tatap muka maupun daring bersama konselor profesional CDC UM Kendari.',
    icon: MessageSquare,
    badge: 'Reservasi',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'tes-minat',
    label: 'Tes Potensi Minat Kerja',
    shortLabel: 'Tes Minat',
    description: 'Uji potensi, bakat, dan minat karir Anda secara ilmiah via Klob Meter.',
    icon: Brain,
    badge: 'Klob Meter',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'workshop',
    label: 'Workshop Pengembangan Karir',
    shortLabel: 'Workshop',
    description: 'Pelajari keterampilan teknis dan praktis langsung dari praktisi industri untuk meningkatkan daya saing karir Anda.',
    icon: Wrench,
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'softskill',
    label: 'Pelatihan Softskill & Kewirausahaan',
    shortLabel: 'Softskill',
    description: 'Program pelatihan pengembangan keterampilan interpersonal, kepemimpinan, dan mentalitas kewirausahaan.',
    icon: GraduationCap,
    badge: 'Sertifikat',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'seminar',
    label: 'Seminar Sukses Berkarir',
    shortLabel: 'Seminar',
    description: 'Seminar dan webinar karir berkala menghadirkan narasumber profesional dan praktisi dunia kerja.',
    icon: Mic,
    badge: 'E-Ticket',
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    id: 'career-fair',
    label: 'Job Fair',
    shortLabel: 'Job Fair',
    description: 'Bursa kerja tahunan yang mempertemukan mahasiswa dan alumni UMK dengan puluhan perusahaan mitra.',
    icon: CalendarDays,
    badge: 'Annual Event',
    color: 'from-amber-400 to-yellow-600'
  },
  {
    id: 'magang',
    label: 'Internship',
    shortLabel: 'Magang',
    description: 'Informasi lowongan magang industri dan alur pendaftaran magang bersertifikat resmi.',
    icon: Briefcase,
    badge: 'Alur CDC',
    color: 'from-teal-600 to-emerald-700'
  },
];

export default function LayananContainer({ currentTab, setTab, children }: LayananContainerProps) {
  const [isDetailActive, setIsDetailActive] = useState(false);
  const activeOption = LAYANAN_MENU.find(m => m.id === currentTab) || LAYANAN_MENU[0];

  // Reset status detail ketika berganti sub-tab
  useEffect(() => {
    setIsDetailActive(false);
  }, [currentTab]);

  const getShareTitle = () => {
    return `${activeOption.label} - CDC UM Kendari`;
  };

  return (
    <LayananContext.Provider value={{ isDetailActive, setIsDetailActive }}>
      <div className="min-h-screen bg-white pb-20">
        
        {/* HANYA TAMPILKAN HEADER SUB-MENU JIKA TIDAK SEDANG MEMBUKA DETAIL ARTIKEL */}
        {!isDetailActive && (
          <>
            {/* ── BREADCRUMB (BERANDA > SUB MENU) ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
              <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <button
                  onClick={() => setTab('beranda')}
                  className="hover:text-[#F26522] transition-colors font-semibold"
                >
                  Beranda
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 font-semibold">{activeOption.label}</span>
              </nav>
            </div>

            {/* ── MAIN TITLE (LARGE BOLD BLACK TITLE) ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {activeOption.label}
              </h1>
            </div>

            {/* ── DYNAMIC SOCIAL SHARE BAR (PERSIS SK CDC) ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
              <SocialShareBar title={getShareTitle()} />
            </div>
          </>
        )}

        {/* ── MAIN CONTENT AREA ── */}
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDetailActive ? 'pt-8' : ''}`}>
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
    </LayananContext.Provider>
  );
}
