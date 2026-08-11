/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Building2,
  Target,
  Users,
  ClipboardList,
  Handshake,
  ImageIcon,
  Phone,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Brain,
  Sparkles,
  Presentation,
  CalendarDays,
  FileText,
  MessageSquare,
  Shuffle,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   MENU DATA
───────────────────────────────────────────── */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  description: string;
  tab?: string;
  href?: string;
}

interface MegaMenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

const TENTANG_KAMI_ITEMS: MenuItem[] = [
  {
    icon: Building2,
    label: 'Profil CDC',
    description: 'Sejarah, latar belakang, dan identitas Career Development Center UM Kendari',
    tab: 'profil',
  },
  {
    icon: Target,
    label: 'Visi & Misi',
    description: 'Arah tujuan strategis dan komitmen layanan karir mahasiswa UM Kendari',
    tab: 'visi-misi',
  },
  {
    icon: Users,
    label: 'Struktur Organisasi',
    description: 'Tim pengelola, staf, dan pembagian tugas di lingkungan CDC',
    tab: 'struktur',
  },
  {
    icon: ClipboardList,
    label: 'Program Kerja',
    description: 'Rencana kegiatan tahunan dan agenda pengembangan karir mahasiswa',
    tab: 'program-kerja',
  },
  {
    icon: Handshake,
    label: 'Mitra Kerjasama',
    description: 'Daftar perusahaan dan instansi mitra resmi kolaborasi CDC UM Kendari',
    tab: 'mitra',
  },
  {
    icon: ImageIcon,
    label: 'Galeri',
    description: 'Dokumentasi foto dan video kegiatan CDC, seminar, dan career fair',
    tab: 'galeri',
  },
  {
    icon: Phone,
    label: 'Kontak',
    description: 'Alamat kantor, nomor telepon, dan media sosial resmi CDC',
    tab: 'kontak',
  },
];

const LAYANAN_ITEMS: MenuItem[] = [
  {
    icon: Briefcase,
    label: 'Lowongan Kerja',
    description: 'Info lowongan kerja terkini dari mitra resmi CDC UM Kendari',
    tab: 'lowongan',
  },
  {
    icon: GraduationCap,
    label: 'Magang',
    description: 'Program magang bersertifikat di perusahaan dan instansi mitra terpercaya',
    tab: 'magang',
  },
  {
    icon: HeartHandshake,
    label: 'Konseling Karier',
    description: 'Sesi konseling karir personal dengan konselor profesional CDC',
    tab: 'konseling',
  },
  {
    icon: Brain,
    label: 'Tes Potensi Minat Kerja',
    description: 'Tes potensi dan minat kerja online secara komprehensif via Klob Meter',
    href: 'https://www.klob.id/klob-journey/klob-meter',
  },
  {
    icon: Sparkles,
    label: 'Pelatihan Softskill',
    description: 'Pelatihan kepemimpinan, komunikasi, dan kemampuan interpersonal',
    tab: 'softskill',
  },
  {
    icon: Presentation,
    label: 'Workshop Pengembangan Karir',
    description: 'Workshop industri dan seminar karir bersama praktisi profesional',
    tab: 'workshop',
  },
  {
    icon: CalendarDays,
    label: 'Job Fair & Bursa Kerja',
    description: 'Pameran karir tahunan UM Kendari dengan puluhan perusahaan rekruter',
    tab: 'career-fair',
  },
];

const MEGA_MENUS: MegaMenuSection[] = [
  { id: 'tentang', label: 'Tentang Kami', items: TENTANG_KAMI_ITEMS },
  { id: 'layanan', label: 'Layanan', items: LAYANAN_ITEMS },
];

/* ─────────────────────────────────────────────
   ICON COLOUR MAP  (dark-green palette)
───────────────────────────────────────────── */
const ICON_BG = [
  'bg-emerald-700',
  'bg-emerald-600',
  'bg-blue-700',
  'bg-teal-700',
  'bg-emerald-800',
  'bg-blue-800',
  'bg-teal-600',
  'bg-emerald-500',
  'bg-blue-600',
  'bg-teal-800',
];

/* ─────────────────────────────────────────────
   PROPS
───────────────────────────────────────────── */
interface MegaMenuProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onNavigateToLogin: () => void;
  /** Extra simple nav items (Beranda, Tracer Study, etc.) */
  simpleNavItems?: { id: string; label: string; isAction?: boolean }[];
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function MegaMenu({
  currentTab,
  setTab,
  onNavigateToLogin,
  simpleNavItems = [],
}: MegaMenuProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile on resize */
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const openDelayed = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(id);
  }, []);

  const closeDelayed = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handleSimpleNav = (item: { id: string; isAction?: boolean }) => {
    setIsMobileOpen(false);
    setMobileExpanded(null);
    if (item.isAction) {
      onNavigateToLogin();
    } else {
      setTab(item.id);
    }
  };

  const handleMegaItemClick = (tab?: string, href?: string) => {
    setOpenMenu(null);
    setIsMobileOpen(false);
    setMobileExpanded(null);
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (tab) {
      setTab(tab);
    }
  };

  /* ── MEGA DROP PANEL ── */
  const renderMegaPanel = (section: MegaMenuSection) => {
    const cols = section.id === 'layanan' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2';
    return (
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[200]
                   rounded-2xl overflow-hidden shadow-2xl border border-emerald-900/40
                   backdrop-blur-xl bg-[rgba(10,28,12,0.92)]
                   min-w-[520px] max-w-[680px] w-max"
        onMouseEnter={cancelClose}
        onMouseLeave={closeDelayed}
        style={{
          boxShadow:
            '0 8px 40px 0 rgba(10,40,15,0.55), 0 1.5px 0 0 rgba(74,222,128,0.12) inset',
        }}
      >
        {/* Panel header */}
        <div className="px-5 pt-4 pb-3 border-b border-emerald-900/50 flex items-center gap-2">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">
            {section.label}
          </span>
          <span className="flex-1 h-px bg-emerald-900/60" />
          <span className="text-[9px] text-emerald-700 font-semibold">
            {section.items.length} sub-menu
          </span>
        </div>

        {/* Items grid */}
        <div className={`grid ${cols} gap-0.5 p-3`}>
          {section.items.map((item, idx) => {
            const Icon = item.icon;
            const bg = ICON_BG[idx % ICON_BG.length];
            return (
              <button
                key={item.label}
                onClick={() => handleMegaItemClick(item.tab, item.href)}
                className="group flex items-start gap-3 px-3 py-3 rounded-xl
                           text-left transition-all duration-150
                           hover:bg-emerald-900/50 focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div
                  className={`${bg} shrink-0 p-2 rounded-lg shadow-sm
                               group-hover:scale-110 transition-transform duration-150`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-emerald-50 leading-snug group-hover:text-emerald-300 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-emerald-600/80 leading-relaxed mt-0.5 line-clamp-2">
                    {item.description}
                  </div>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-1 opacity-0
                             group-hover:opacity-100 group-hover:translate-x-0.5
                             transition-all duration-150"
                />
              </button>
            );
          })}
        </div>

        {/* Panel footer cta */}
        <div className="px-5 py-3 border-t border-emerald-900/50 flex justify-between items-center bg-emerald-950/50">
          <span className="text-[10px] text-emerald-700 font-semibold">
            CDC Universitas Muhammadiyah Kendari
          </span>
          <button
            onClick={onNavigateToLogin}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300
                       flex items-center gap-1 transition-colors"
          >
            Login Portal <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  /* ── MOBILE ACCORDION ITEM ── */
  const renderMobileAccordion = (section: MegaMenuSection) => {
    const isOpen = mobileExpanded === section.id;
    return (
      <div key={section.id} className="border-b border-emerald-900/40 last:border-0">
        <button
          onClick={() => setMobileExpanded(isOpen ? null : section.id)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold
                     text-emerald-100 hover:bg-emerald-900/40 transition-colors"
        >
          {section.label}
          <ChevronDown
            className={`w-4 h-4 text-emerald-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        {isOpen && (
          <div className="px-3 pb-3 space-y-0.5 bg-emerald-950/30">
            {section.items.map((item, idx) => {
              const Icon = item.icon;
              const bg = ICON_BG[idx % ICON_BG.length];
              return (
                <button
                  key={item.label}
                  onClick={() => handleMegaItemClick(item.tab, item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                             text-left hover:bg-emerald-900/50 transition-colors"
                >
                  <div className={`${bg} p-1.5 rounded-md shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[13px] font-semibold text-emerald-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <div ref={menuRef} className="relative" id="mega-menu-root">

      {/* ─── DESKTOP NAV ─── */}
      <nav className="hidden lg:flex items-center gap-0.5" id="mega-nav-desktop">

        {/* Mega-menu triggers */}
        {MEGA_MENUS.map((section) => (
          <div key={section.id} className="relative">
            <button
              onMouseEnter={() => openDelayed(section.id)}
              onMouseLeave={closeDelayed}
              onClick={() => setOpenMenu(openMenu === section.id ? null : section.id)}
              aria-expanded={openMenu === section.id}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px]
                         font-bold tracking-wide transition-all duration-150 select-none
                         ${openMenu === section.id
                  ? 'bg-emerald-800 text-emerald-100 shadow-inner'
                  : 'text-emerald-50 hover:bg-emerald-800/60 hover:text-white'
                }`}
            >
              {section.label}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === section.id ? 'rotate-180 text-emerald-300' : 'text-emerald-500'
                  }`}
              />
            </button>

            {openMenu === section.id && renderMegaPanel(section)}
          </div>
        ))}

        {/* Separator */}
        <span className="w-px h-5 bg-emerald-800 mx-1 rounded-full" />

        {/* Simple nav items */}
        {simpleNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSimpleNav(item)}
            className={`px-3.5 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-150
                       tracking-wide
                       ${currentTab === item.id && !item.isAction
                ? 'bg-emerald-600 text-white shadow-md'
                : item.isAction
                  ? 'text-emerald-300 hover:text-white hover:bg-emerald-800/60 border border-emerald-700/50'
                  : 'text-emerald-50 hover:text-white hover:bg-emerald-800/60'
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* ─── MOBILE HAMBURGER ─── */}
      <button
        className="lg:hidden p-2 text-emerald-200 bg-emerald-900/60 rounded-lg border border-emerald-800/50
                   hover:bg-emerald-800 transition-colors"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ─── MOBILE DRAWER ─── */}
      {isMobileOpen && (
        <div
          className="lg:hidden absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)]
                     rounded-2xl overflow-hidden shadow-2xl border border-emerald-900/50
                     backdrop-blur-xl bg-[rgba(6,20,8,0.97)] z-[200]"
          style={{
            boxShadow: '0 12px 48px 0 rgba(5,30,8,0.7)',
          }}
        >
          {/* Mega accordion sections */}
          {MEGA_MENUS.map((section) => renderMobileAccordion(section))}

          {/* Simple nav items */}
          {simpleNavItems.length > 0 && (
            <div className="border-t border-emerald-900/40 p-3 space-y-0.5">
              {simpleNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSimpleNav(item)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors
                             ${currentTab === item.id && !item.isAction
                      ? 'bg-emerald-700 text-white'
                      : item.isAction
                        ? 'text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/40'
                        : 'text-emerald-100 hover:bg-emerald-900/50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-emerald-900/40 px-5 py-3 bg-emerald-950/60 flex items-center justify-between">
            <span className="text-[10px] text-emerald-700 font-semibold">Portal CDC UM Kendari</span>
            <button
              onClick={() => { setIsMobileOpen(false); onNavigateToLogin(); }}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Login <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
