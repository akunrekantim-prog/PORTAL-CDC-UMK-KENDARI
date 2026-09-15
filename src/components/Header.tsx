/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Header — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Two-layer header:
 *   1. Top bar  – deep navy (#000066), utility links + date
 *   2. Main nav – white, sticky, logo + dropdown navigation
 *
 * Constraints:
 *   • No external UI or icon libraries inside dropdowns (pure text)
 *   • Hover / active state: orange text + orange bottom border (#F26522)
 *   • Dropdown items: text only, divider lines, no icons
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../i18n';

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
interface NavChild {
  label: string;
  tab?: string;
  href?: string;
  children?: NavChild[];
}

interface NavItem {
  id: string;
  label: string;
  tab?: string;        // if set → navigates directly, no dropdown
  href?: string;       // if set → opens external URL in new tab
  isAction?: boolean;  // if true → calls onNavigateToLogin instead of setTab
  children?: NavChild[];
}

export interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
}

/* ─────────────────────────────────────────────────────────────────
   MENU DATA
───────────────────────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    tab: 'beranda',
  },
  {
    id: 'tentang',
    label: 'Tentang Kami',
    children: [
      {
        label: 'Profil',
        tab: 'profil',
        children: [
          { label: 'Visi – Misi', tab: 'visi-misi' },
          { label: 'Keanggotaan', tab: 'keanggotaan' },
        ],
      },
      { label: 'Surat Keputusan CDC', tab: 'sk-cdc' },
      { label: 'Kalender Kegiatan', tab: 'kalender' },
      { label: 'Laporan Kinerja & Tracer Study', tab: 'laporan' },
      { label: 'MOU Dengan Stakeholder', tab: 'mou' },
      { label: 'Galeri', tab: 'galeri' },
    ],
  },
  {
    id: 'layanan',
    label: 'Layanan',
    children: [
      { label: 'Berita & Artikel', tab: 'berita' },
      { label: 'Konseling Karir', tab: 'konseling' },
      { label: 'Tes Potensi Minat Kerja', href: 'https://www.klob.id/klob-journey/klob-meter' },
      { label: 'Workshop Pengembangan Karir', tab: 'workshop' },
      { label: 'Pelatihan Softskill & Kewirausahaan', tab: 'softskill' },
      { label: 'Seminar Sukses Berkarir', tab: 'seminar' },
      { label: 'Job Fair', tab: 'career-fair' },
      { label: 'Campus Hiring', tab: 'campus-hiring' },
      { label: 'Internship', tab: 'magang' },
    ],
  },
  {
    id: 'tracer',
    label: 'Tracer Study',
    children: [
      { label: 'Tracer Study', href: 'https://tracerstudy.umkendari.ac.id/' },
      { label: 'Form Kuesioner Tracer Study', href: 'https://tracerstudy.umkendari.ac.id/page/survey' },
    ],
  },
  {
    id: 'simbelmawa',
    label: 'Simbelmawa',
    children: [
      { label: 'PKM', href: 'https://simbelmawa.kemdiktisaintek.go.id/pkm' },
      { label: 'PPK ORMAWA', href: 'https://ppkormawa.kemdiktisaintek.go.id/' },
      { label: 'P2MW', href: 'https://p2mw.kemdiktisaintek.go.id/' },
      { label: 'KMI EXPO', href: 'https://simbelmawa.kemdiktisaintek.go.id/' },
      { label: 'PILMAPRES', href: 'https://pilmapres.kemdiktisaintek.go.id/' },
    ],
  },
  {
    id: 'presentasi',
    label: 'Prestasi',
    children: [
      {
        label: 'Internasional',
        children: [
          { label: 'Akademik', tab: 'presentasi-internasional-akademik' },
          { label: 'Non-Akademik', tab: 'presentasi-internasional-non-akademik' },
        ],
      },
      {
        label: 'Nasional',
        children: [
          { label: 'Akademik', tab: 'presentasi-nasional-akademik' },
          { label: 'Non-Akademik', tab: 'presentasi-nasional-non-akademik' },
        ],
      },
      {
        label: 'Wilayah',
        children: [
          { label: 'Akademik', tab: 'presentasi-wilayah-akademik' },
          { label: 'Non-Akademik', tab: 'presentasi-wilayah-non-akademik' },
        ],
      },
    ],
  },
  {
    id: 'register',
    label: 'Register',
    isAction: true,
    children: [
      { label: 'Register User', tab: 'register-alumni' },
      { label: 'Register Mitra', tab: 'register-perusahaan' },
    ],
  },
  {
    id: 'jobinfo',
    label: 'Job Info',
    children: [
      { label: 'Lowongan Terbaru', tab: 'lowongan' },
      { label: 'APSKAR PTMA', href: 'https://apskarptma.or.id/' },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   UTILITY LINKS (Top bar)
───────────────────────────────────────────────────────────────── */
const TOP_LINKS = [
  { label: 'ICCN', href: 'https://indonesiacareercenter.id/' },
  { label: 'Website UM Kendari', href: 'https://umkendari.ac.id/' },
  { label: 'SIMBELMAWA', href: 'https://simbelmawa.kemdiktisaintek.go.id/' },
  { label: 'SIMKATMAWA', href: 'https://simkatmawa.kemdikbud.go.id/' },
];

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
export default function Header({ currentTab, setTab, onNavigateToLogin, onNavigateToRegister }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [subMobileExpanded, setSubMobileExpanded] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>('Profil');

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  /* Current date */
  const formattedDate = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  /* Translation helper for menu labels */
  const getNavText = (label: string): string => {
    const keyMap: Record<string, string> = {
      'Beranda': 'nav.beranda',
      'Tentang Kami': 'nav.tentang',
      'Profil': 'nav.profil',
      'Visi – Misi': 'nav.visimisi',
      'Keanggotaan': 'nav.keanggotaan',
      'Surat Keputusan CDC': 'nav.skcdc',
      'Kalender Kegiatan': 'nav.kalender',
      'Laporan Kinerja & Tracer Study': 'nav.laporan',
      'MOU Dengan Stakeholder': 'nav.mou',
      'Galeri': 'nav.galeri',
      'Layanan': 'nav.layanan',
      'Berita & Artikel': 'nav.berita',
      'Konseling Karir': 'nav.konseling',
      'Tes Potensi Minat Kerja': 'nav.tesminat',
      'Workshop Pengembangan Karir': 'nav.workshop',
      'Pelatihan Softskill & Kewirausahaan': 'nav.softskill',
      'Seminar Sukses Berkarir': 'nav.seminar',
      'Job Fair': 'nav.jobfair',
      'Campus Hiring': 'nav.campushiring',
      'Internship': 'nav.magang',
      'Tracer Study': 'nav.tracer',
      'Form Kuesioner Tracer Study': 'nav.tracerform',
      'Simbelmawa': 'nav.simbelmawa',
      'Prestasi': 'nav.prestasi',
      'Internasional': 'nav.internasional',
      'Nasional': 'nav.nasional',
      'Wilayah': 'nav.wilayah',
      'Akademik': 'nav.akademik',
      'Non-Akademik': 'nav.nonakademik',
      'Olahraga': 'nav.olahraga',
      'Seni': 'nav.seni',
      'Register': 'nav.register',
      'Register User': 'nav.registeralumni',
      'Register Mitra': 'nav.registermitra',
      'Job Info': 'nav.jobinfo',
      'Lowongan Terbaru': 'nav.lowonganterbaru',
      'Website UM Kendari': 'top.website'
    };
    const k = keyMap[label];
    return k ? t(k, label) : label;
  };

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile drawer on resize to desktop */
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setIsMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* Hover open / close with small delay so crossing mouse gap doesn't flicker */
  const handleMouseEnter = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 100);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  /* Navigation action */
  const navigate = (tab: string, isAction = false) => {
    setOpenDropdown(null);
    setIsMobileOpen(false);
    setMobileExpanded(null);
    if (tab === 'login') {
      onNavigateToLogin();
    } else if (tab === 'register-alumni') {
      if (onNavigateToRegister) onNavigateToRegister('alumni');
      else onNavigateToLogin();
    } else if (tab === 'register-perusahaan') {
      if (onNavigateToRegister) onNavigateToRegister('perusahaan');
      else onNavigateToLogin();
    } else if (isAction && tab.startsWith('register')) {
      if (onNavigateToRegister) onNavigateToRegister('alumni');
      else onNavigateToLogin();
    } else if (isAction) {
      onNavigateToLogin();
    } else {
      setTab(tab);
    }
  };

  /* ── Is a nav item "active"? ── */
  const isActive = (item: NavItem): boolean => {
    if (item.tab) return currentTab === item.tab;
    if (item.children) {
      return item.children.some(c => {
        if (c.tab && c.tab === currentTab) return true;
        if (c.children) return c.children.some(sc => sc.tab && sc.tab === currentTab);
        return false;
      });
    }
    return false;
  };


  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div ref={navRef} id="site-header">

      {/* ══════════════════════════════════════════
          1. TOP BAR
      ══════════════════════════════════════════ */}
      <div
        className="block text-white text-xs font-medium"
        style={{ backgroundColor: '#10006bff' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          {/* Left: utility links */}
          <div className="hidden sm:flex items-center gap-0">
            {TOP_LINKS.map((link, i) => (
              <React.Fragment key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-300 transition-colors duration-150 whitespace-nowrap"
                >
                  {getNavText(link.label)}
                </a>
                {i < TOP_LINKS.length - 1 && (
                  <span className="mx-2.5 text-blue-400 select-none">•</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right: Date & Flag Language Switcher */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0">
            <span className="text-blue-200 font-semibold truncate text-[11px] sm:text-xs">{formattedDate}</span>

            {/* 🇮🇩 / 🇬🇧 DROPDOWN LANGUAGE SWITCHER */}
            <div className="relative shrink-0" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10006b] hover:bg-white border border-white/30 text-xs font-semibold cursor-pointer transition-all duration-200 shadow-xs group"
                aria-expanded={isLangDropdownOpen}
                aria-haspopup="true"
                title="Pilih Bahasa / Change Language"
              >
                <img
                  src={lang === 'en' ? '/logo bendera inggris.png' : '/logo bendera indo.png'}
                  alt={lang === 'en' ? 'EN' : 'ID'}
                  className="w-4.5 h-4.5 object-cover rounded-full shadow-2xs shrink-0"
                />
                <span className="text-amber-400 group-hover:text-[#10006b] font-extrabold tracking-wider transition-colors duration-200">
                  {lang === 'en' ? 'EN' : 'ID'}
                </span>
                <svg
                  className={`w-3 h-3 text-amber-400 group-hover:text-[#10006b] fill-current transition-all duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''
                    }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>

              {/* Dropdown Popup Menu */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-28 bg-white border border-gray-200 rounded-md shadow-xl py-1 z-[110] overflow-hidden text-xs divide-y divide-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left font-bold transition-colors ${lang === 'en'
                        ? 'bg-orange-50 text-[#10006b] font-extrabold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#10006b]'
                      }`}
                  >
                    <img
                      src="/logo bendera inggris.png"
                      alt="EN"
                      className="w-4.5 h-4.5 object-cover rounded-full shrink-0 shadow-2xs"
                    />
                    <span className={lang === 'en' ? 'text-[#10006b]' : 'text-gray-700'}>EN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLang('id');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left font-bold transition-colors ${lang === 'id'
                        ? 'bg-orange-50 text-[#10006b] font-extrabold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#10006b]'
                      }`}
                  >
                    <img
                      src="/logo bendera indo.png"
                      alt="ID"
                      className="w-4.5 h-4.5 object-cover rounded-full shrink-0 shadow-2xs"
                    />
                    <span className={lang === 'id' ? 'text-[#10006b]' : 'text-gray-700'}>ID</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          2. MAIN NAVBAR
      ══════════════════════════════════════════ */}
      <header className="bg-white shadow-sm sticky top-0 z-50" id="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── LOGO / BRANDING ── */}
            <button
              onClick={() => navigate('beranda')}
              className="flex items-center group focus-visible:outline-none shrink-0"
              aria-label="Portal CDC UM Kendari — Beranda"
            >
              <img
                src="/logo-cdc-branding-transparent.png"
                alt="CDC Career Development Center Universitas Muhammadiyah Kendari"
                className="h-10 sm:h-11 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </button>

            {/* ── DESKTOP NAVIGATION ── */}
            <nav className="hidden lg:flex items-center h-full" aria-label="Navigasi utama">
              {NAV_ITEMS.map(item => (
                <div
                  key={item.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => item.children ? handleMouseEnter(item.id) : undefined}
                  onMouseLeave={() => item.children ? handleMouseLeave() : undefined}
                >
                  {/* Nav trigger button */}
                  <button
                    onClick={() => {
                      if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
                      else if (item.tab) navigate(item.tab, item.isAction);
                      else if (item.children) setOpenDropdown(
                        openDropdown === item.id ? null : item.id
                      );
                    }}
                    className={[
                      'h-full px-4 text-sm font-semibold flex items-center gap-1 transition-colors duration-150',
                      'border-b-2 focus-visible:outline-none whitespace-nowrap',
                      isActive(item) || openDropdown === item.id
                        ? 'border-[#F26522] text-[#F26522]'
                        : 'border-transparent text-gray-700 hover:text-[#F26522] hover:border-[#F26522]',
                    ].join(' ')}
                    aria-expanded={item.children ? openDropdown === item.id : undefined}
                    aria-haspopup={item.children ? 'true' : undefined}
                  >
                    {getNavText(item.label)}
                    {item.children && (
                      <svg
                        className={[
                          'w-3.5 h-3.5 transition-transform duration-200 shrink-0',
                          openDropdown === item.id ? 'rotate-180 text-[#F26522]' : 'text-gray-400',
                        ].join(' ')}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* ── DROPDOWN PANEL ── */}
                  {item.children && openDropdown === item.id && (
                    <div
                      className="absolute top-full left-0 z-[100] flex items-start bg-transparent min-w-max"
                      onMouseEnter={cancelClose}
                      onMouseLeave={handleMouseLeave}
                      role="menu"
                    >
                      {/* Left Column: Main Dropdown List */}
                      <div className="min-w-[220px] bg-white py-1 divide-y divide-gray-100 border border-gray-200/80 shadow-xl rounded-b-lg overflow-hidden">
                        {item.children.map((child) => {
                          const hasSub = !!(child.children && child.children.length > 0);
                          const isSubActive = hasSub && activeSubMenu === child.label;

                          return (
                            <button
                              key={child.label}
                              onMouseEnter={() => {
                                if (hasSub) setActiveSubMenu(child.label);
                                else setActiveSubMenu(null);
                              }}
                              onClick={() => {
                                if (hasSub) {
                                  // BUG-005 fix: klik item bertab yang SUDAH terbuka
                                  // → navigasi (sebelumnya cuma expand, tab Profil
                                  // unreachable). Klik pertama tetap expand submenu.
                                  if (child.tab && activeSubMenu === child.label) {
                                    setOpenDropdown(null);
                                    if (child.href) window.open(child.href, '_blank', 'noopener,noreferrer');
                                    else navigate(child.tab, item.isAction);
                                  } else {
                                    setActiveSubMenu(child.label);
                                  }
                                } else {
                                  setOpenDropdown(null);
                                  if (child.href) window.open(child.href, '_blank', 'noopener,noreferrer');
                                  else if (child.tab) navigate(child.tab, item.isAction);
                                }
                              }}
                              role="menuitem"
                              className={[
                                'group w-full text-left px-5 py-3 text-sm font-medium flex items-center justify-between gap-4 transition-colors duration-150',
                                isSubActive
                                  ? 'bg-gray-100/90 text-gray-900 font-semibold'
                                  : child.tab && currentTab === child.tab
                                    ? 'text-[#F26522] bg-orange-50/60 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                              ].join(' ')}
                            >
                              <span>{getNavText(child.label)}</span>
                              {hasSub && (
                                <svg
                                  className={[
                                    'w-3.5 h-3.5 transition-all duration-300 ease-in-out shrink-0',
                                    isSubActive
                                      ? '-rotate-90 text-[#F26522] scale-110 translate-x-0.5'
                                      : 'rotate-0 text-gray-400 group-hover:-rotate-90 group-hover:text-[#F26522] group-hover:translate-x-0.5',
                                  ].join(' ')}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Column: Attached Side Sub-Menu (e.g. Visi - Misi & Keanggotaan) */}
                      {item.children.some(c => c.children && c.label === activeSubMenu) && (
                        <div className="min-w-[200px] bg-white py-1 divide-y divide-gray-100 border border-gray-200/80 shadow-xl rounded-r-lg rounded-b-lg overflow-hidden self-start ml-0.5">
                          {item.children
                            .find(c => c.label === activeSubMenu)
                            ?.children?.map((subChild) => (
                              <button
                                key={subChild.label}
                                onClick={() => {
                                  setOpenDropdown(null);
                                  if (subChild.href) {
                                    window.open(subChild.href, '_blank', 'noopener,noreferrer');
                                  } else if (subChild.tab) {
                                    navigate(subChild.tab, item.isAction);
                                  }
                                }}
                                role="menuitem"
                                className={[
                                  'w-full text-left px-5 py-3 text-sm font-medium transition-colors duration-150',
                                  subChild.tab && currentTab === subChild.tab
                                    ? 'text-[#F26522] bg-orange-50/60 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                ].join(' ')}
                              >
                                {getNavText(subChild.label)}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── BUG-003 fix: tombol Login publik (sebelumnya tidak ada jalan
                masuk dari header/homepage; satu-satunya via halaman Register).
                Desktop: tombol "Masuk Portal" di kanan navbar. */}
            <button
              onClick={() => { setOpenDropdown(null); onNavigateToLogin(); }}
              id="header-login-btn"
              className="hidden lg:flex items-center gap-1.5 bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-150 shrink-0 ml-2"
            >
              {t('nav.login', 'Masuk Portal')}
            </button>

            {/* ── MOBILE HAMBURGER ── */}
            <button
              className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg
                         gap-[5px] group focus-visible:outline-none"
              onClick={() => { setIsMobileOpen(o => !o); setMobileExpanded(null); }}
              aria-label={isMobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={isMobileOpen}
            >
              <span className={[
                'block w-5 h-0.5 bg-gray-700 transition-all duration-200',
                isMobileOpen ? 'translate-y-[6.5px] rotate-45' : '',
              ].join(' ')} />
              <span className={[
                'block w-5 h-0.5 bg-gray-700 transition-all duration-200',
                isMobileOpen ? 'opacity-0' : '',
              ].join(' ')} />
              <span className={[
                'block w-5 h-0.5 bg-gray-700 transition-all duration-200',
                isMobileOpen ? '-translate-y-[6.5px] -rotate-45' : '',
              ].join(' ')} />
            </button>
          </div>
        </div>


        {/* ── MOBILE DRAWER ── */}
        {isMobileOpen && (
          <div
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl
                       absolute w-full left-0 top-full z-[90] max-h-[80vh] overflow-y-auto"
            id="mobile-nav-drawer"
          >
            {NAV_ITEMS.map(item => {
              const active = isActive(item);
              const expanded = mobileExpanded === item.id;

              return (
                <div key={item.id} className="border-b border-gray-100 last:border-0">
                  {/* Row */}
                  <button
                    onClick={() => {
                      if (item.href) {
                        window.open(item.href, '_blank', 'noopener,noreferrer');
                        setIsMobileOpen(false);
                      } else if (item.tab) {
                        navigate(item.tab, item.isAction);
                      } else {
                        setMobileExpanded(expanded ? null : item.id);
                      }
                    }}
                    className={[
                      'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold',
                      'transition-colors duration-100 text-left',
                      active ? 'text-[#F26522]' : 'text-gray-800',
                    ].join(' ')}
                  >
                    <span className={[
                      'border-l-2 pl-3 transition-colors',
                      active ? 'border-[#F26522]' : 'border-transparent',
                    ].join(' ')}>
                      {getNavText(item.label)}
                    </span>
                    {item.children && (
                      <svg
                        className={[
                          'w-4 h-4 transition-transform duration-200 shrink-0',
                          expanded ? 'rotate-180 text-[#F26522]' : 'text-gray-400',
                        ].join(' ')}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Children accordion */}
                  {item.children && expanded && (
                    <div className="bg-gray-50 pb-1">
                      {item.children.map((child, idx) => (
                        <React.Fragment key={child.label}>
                          <button
                            onClick={() => {
                              if (!child.children) {
                                setIsMobileOpen(false);
                                setMobileExpanded(null);
                              }
                              if (child.href) {
                                window.open(child.href, '_blank', 'noopener,noreferrer');
                              } else if (child.tab) {
                                navigate(child.tab, item.isAction);
                              }
                            }}
                            className={[
                              'group w-full text-left px-10 py-2.5 text-sm font-semibold transition-colors duration-100 flex items-center justify-between',
                              child.tab && currentTab === child.tab
                                ? 'text-[#F26522]'
                                : 'text-gray-700 hover:text-[#F26522]',
                            ].join(' ')}
                          >
                            <span>{child.label}</span>
                            {child.children && (
                              <svg
                                className="w-3.5 h-3.5 transition-all duration-300 ease-in-out text-gray-400 group-hover:text-[#F26522] group-hover:-rotate-90 group-hover:translate-x-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {child.children && (
                            <div className="bg-gray-100/80 py-1 space-y-0.5 border-y border-gray-200/60">
                              {child.children.map((subChild) => (
                                <button
                                  key={subChild.label}
                                  onClick={() => {
                                    setIsMobileOpen(false);
                                    setMobileExpanded(null);
                                    if (subChild.href) {
                                      window.open(subChild.href, '_blank', 'noopener,noreferrer');
                                    } else if (subChild.tab) {
                                      navigate(subChild.tab, item.isAction);
                                    }
                                  }}
                                  className={[
                                    'w-full text-left pl-14 pr-6 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors duration-100',
                                    subChild.tab && currentTab === subChild.tab
                                      ? 'text-[#F26522]'
                                      : 'text-gray-600 hover:text-[#F26522]',
                                  ].join(' ')}
                                >
                                  <span className="text-[#F26522] font-bold text-[10px]">└</span>
                                  <span>{subChild.label}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {idx < item.children!.length - 1 && !child.children && (
                            <div className="h-px bg-gray-200 mx-10" aria-hidden="true" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {/* ── BUG-003 fix (mobile): tombol Login di bawah drawer ── */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => { setIsMobileOpen(false); setMobileExpanded(null); onNavigateToLogin(); }}
                id="header-login-btn-mobile"
                className="w-full flex items-center justify-center gap-2 bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors duration-150"
              >
                {t('nav.login', 'Masuk Portal')}
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
