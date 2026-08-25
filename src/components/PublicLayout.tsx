/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Building2, MapPin, Briefcase, Search, BookOpen,
  FileText, Mail, Phone, Clock, ArrowRight, Globe, Megaphone,
  Info, GraduationCap, ChevronRight, ChevronDown, X, Facebook, Instagram, Youtube,
  Users, Building, Shield, Award, Star, TrendingUp, Zap, Target,
  ExternalLink, Calendar, ShieldCheck, Trophy, Eye,
  MessageCircle, Send, Linkedin, Copy
} from 'lucide-react';

import { Lowongan, Berita, Pengumuman, KontenKarir, CdcClubConfig, HelpdeskConfig } from '../types';
import { sortJobsByNewest, formatDateDisplay, isJobDeadlinePassed, getFromDB, trackAndGetVisitorCount, getAdminWaPrestasi, getVisiMisiConfig, getCdcClubConfig, getHelpdeskConfig } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import Header from './Header';
import { Footer } from './Footer';
import { useLanguage } from '../i18n';
import BimbinganKarir from './layanan/BimbinganKarir';
import TesMinat from './layanan/TesMinat';
import Workshop from './layanan/Workshop';
import Softskill from './layanan/Softskill';
import Seminar from './layanan/Seminar';
import CareerFair from './layanan/CareerFair';
import CampusHiring from './layanan/CampusHiring';
import Magang from './layanan/Magang';
import SuratKeputusanView from './layanan/SuratKeputusanView';
import KalenderKegiatanView from './layanan/KalenderKegiatanView';
import LaporanKinerjaView from './layanan/LaporanKinerjaView';
import MouStakeholderView from './layanan/MouStakeholderView';
import GaleriView from './layanan/GaleriView';
import Keanggotaan from './layanan/Keanggotaan';
import LayananContainer from './layanan/LayananContainer';
import HeroSlider from './HeroSlider';
import {
  JobSearchMasterDetail,
  INDONESIAN_PROVINCES,
  isIndonesianLocation,
  JOB_SPECIALIZATIONS,
  getCompanyBadgeColor,
  getCompanyInitials
} from './JobSearchMasterDetail';
import Dropdown from './Dropdown';
import SocialShareBar from './ui/SocialShareBar';
import { stripHtmlTags } from '../markdown';

/* ─── Types ─────────────────────────────────── */
interface PublicLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lowongan: Lowongan[];
  berita: Berita[];
  pengumuman: Pengumuman[];
  program?: KontenKarir[];
  konten?: KontenKarir[];
  onSelectLowongan: (id: string) => void;
  onSelectBerita: (slug: string) => void;
  onSelectProgram?: (id: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
}

/* ─── Dot-pattern SVG background ─────────────── */
const DOT_BG =
  "url(\"data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%231E3A8A' fill-opacity='0.07'/%3E%3C/svg%3E\")";

/* ─── Fade-in wrapper ─────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Credibility badges data ─────────────────── */
const CRED_BADGES = [
  { icon: Shield, label: 'Akreditasi', sub: 'UNGGUL', color: 'text-emerald-600' },
  { icon: Zap, label: 'Diktisaintek', sub: 'BERDAMPAK', color: 'text-blue-600' },
  { icon: Award, label: 'MQA', sub: 'Certified', color: 'text-amber-600' },
  { icon: Star, label: 'AppliedHE', sub: 'Ranked', color: 'text-violet-600' },
  { icon: TrendingUp, label: 'THE Impact', sub: 'Rankings', color: 'text-rose-600' },
];

/* ─── Stat counters ───────────────────────────── */
const START_YEAR_CDC = 2016; // Tahun acuan dasar CDC (2026 -> 10+, 2027 -> 11+, dst)
const expYears = Math.max(10, new Date().getFullYear() - START_YEAR_CDC);

const STATS = [
  { value: '20.000+', label: 'Alumni' },
  { value: '10', label: 'Mitra Perusahaan' },
  { value: trackAndGetVisitorCount(), label: 'Total Pengunjung' },
  { value: `${expYears}+`, label: 'Tahun Pengalaman' },
];

/* ─── Helper Animasi Counter Angka Beranda ─────────────────── */
function parseStatValue(raw: string) {
  const suffix = raw.endsWith('+') ? '+' : '';
  const cleanStr = raw.replace(/\+/g, '').replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseInt(cleanStr, 10) || 0;
  return { num, suffix };
}

function AnimatedCounterStat({ rawValue }: { rawValue: string }) {
  const [count, setCount] = useState(0);
  const { num: targetNum, suffix } = useMemo(() => parseStatValue(rawValue), [rawValue]);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1800; // 1.8 detik animasi count-up

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentCount = Math.floor(easeProgress * targetNum);
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetNum);
      }
    };

    const handle = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(handle);
  }, [targetNum]);

  return (
    <span>
      {count.toLocaleString('id-ID')}{suffix}
    </span>
  );
}

/* ─── Popular links ───────────────────────────── */
const POPULAR_LINKS = [
  { label: 'Loker BPJS Kesehatan 2026', kategori: 'Lowongan', thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=300&auto=format&fit=crop' },
  { label: 'Loker Bank Mandiri 2026', kategori: 'Lowongan', thumbnail: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?q=80&w=300&auto=format&fit=crop' },
  { label: 'JOB PREPARATION 2026', kategori: 'Program', thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=300&auto=format&fit=crop' },
  { label: 'UM Kendari Career Fair', kategori: 'Event', thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=300&auto=format&fit=crop' },
  { label: 'Selamat & Sukses Pimpinan UM Kendari 2026', kategori: 'Pengumuman', thumbnail: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=300&auto=format&fit=crop' },
  { label: 'Loker Pertamina 2026', kategori: 'Lowongan', thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=300&auto=format&fit=crop' },
  { label: 'Magang BUMN Terbuka 2026', kategori: 'Magang', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop' },
];



export default function PublicLayout({
  currentTab,
  setTab,
  lowongan,
  berita,
  pengumuman,
  program,
  konten,
  onSelectLowongan,
  onSelectBerita,
  onSelectProgram,
  onNavigateToLogin,
  onNavigateToRegister,
}: PublicLayoutProps) {
  const { t, translateContent } = useLanguage();
  // Gambar Visi & Misi (bisa diubah admin via Manajemen Web → Visi & Misi)
  const [visiMisiUrl, setVisiMisiUrl] = useState<string>(() => getVisiMisiConfig().imageUrl);

  // Event Detail Direct Access State
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Job Info Search & Filter States
  const [jobKeyword, setJobKeyword] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [jobSortOrder, setJobSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [locationSearch, setLocationSearch] = useState('');
  const [specializationSearch, setSpecializationSearch] = useState('');
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  const [jobInfoPage, setJobInfoPage] = useState(1);
  const itemsPerPage = 9;
  const jobPopupRef = useRef<HTMLDivElement>(null);

  // Click outside listener for Job Info Popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobPopupRef.current && !jobPopupRef.current.contains(event.target as Node)) {
        setOpenPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to page 1 on filter or sort changes
  useEffect(() => {
    setJobInfoPage(1);
  }, [jobKeyword, selectedLocations, selectedSpecializations, jobSortOrder]);

  const toggleCheckboxOption = (setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setList(prev => prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]);
  };

  const clearAllJobFilters = () => {
    setSelectedLocations([]);
    setSelectedSpecializations([]);
    setJobKeyword('');
    setLocationSearch('');
    setSpecializationSearch('');
  };

  const hasActiveJobFilters = selectedLocations.length > 0 || selectedSpecializations.length > 0 || jobKeyword !== '';

  // Berita & Artikel Filter & Pagination States
  const [beritaSearchQuery, setBeritaSearchQuery] = useState('');
  const [beritaScopeFilter, setBeritaScopeFilter] = useState<'Semua' | 'LOKAL' | 'REGIONAL' | 'NASIONAL' | 'GLOBAL'>('Semua');
  const [beritaPage, setBeritaPage] = useState(1);
  const beritaItemsPerPage = 6;
  const [selectedPosterModal, setSelectedPosterModal] = useState<string | null>(null);

  // Prestasi Search State
  const [prestasiSearchQuery, setPrestasiSearchQuery] = useState('');

  /* Data helpers: Lowongan kerja & magang terbaru (newest created) selalu di atas */
  const publishedLowongan = sortJobsByNewest(lowongan.filter(l => l.status === 'published'));
  const publishedBerita = berita.filter(b => b.status === 'published');
  const publishedPengumuman = pengumuman.filter(p => p.status === 'published');

  // Prestasi publikasi yang diberi opsi tampil di Beranda Utama
  const homePrestasiItems = getFromDB<KontenKarir>('konten_karir').filter(
    (k) => k.jenis === 'presentasi' && k.status !== 'draft' && k.showOnHome === true
  );

  // Gabungan Berita & Prestasi yang siap tampil di Section Berita Beranda (4 item terbaru)
  const homeUnifiedNews = [
    ...publishedBerita.map((b) => ({
      id: b.id,
      title: b.title,
      excerpt: b.excerpt,
      coverImageUrl: b.coverImageUrl,
      badge: b.scope || 'LOKAL',
      badgeBg: 'bg-[#1E3A8A] text-white',
      penulis: b.penulis && !b.penulis.toLowerCase().includes('admin') ? b.penulis : 'Admin Website',
      createdAt: b.createdAt,
      onClick: () => onSelectBerita(b.slug),
    })),
    ...homePrestasiItems.map((p) => ({
      id: p.id,
      title: p.judul,
      excerpt: `${p.namaMahasiswa || ''} — ${p.peringkat || 'Prestasi'} (${p.prodi || 'UMK'})`,
      coverImageUrl: p.thumbnail,
      badge: p.peringkat || 'PRESTASI',
      badgeBg: 'bg-amber-400 text-slate-950',
      penulis: p.penulis && !p.penulis.toLowerCase().includes('admin') ? p.penulis : 'Admin Website',
      createdAt: p.createdAt,
      onClick: () => setTab(`presentasi-${p.kategori || 'internasional'}-${p.subKategori || 'akademik'}`),
    })),
  ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const filteredLowongan = publishedLowongan.filter(job => {
    // 1 Textbox: Kata Kunci, Jabatan, Perusahaan
    if (jobKeyword) {
      const kw = jobKeyword.toLowerCase();
      const matchTitle = job.judul.toLowerCase().includes(kw);
      const matchCompany = job.namaInstansi.toLowerCase().includes(kw);
      const matchCategory = (job.kategori || '').toLowerCase().includes(kw);
      const matchDesc = (job.deskripsi || '').toLowerCase().includes(kw);
      const matchLoc = (job.lokasi || '').toLowerCase().includes(kw);
      if (!matchTitle && !matchCompany && !matchCategory && !matchDesc && !matchLoc) {
        return false;
      }
    }

    // Checkbox 1: Location Filter
    if (selectedLocations.length > 0) {
      const matchLoc = selectedLocations.some(loc => {
        const l = loc.toLowerCase().trim();
        const jobLoc = (job.lokasi || '').toLowerCase().trim();

        if (l.includes('lainnya') || l.includes('luar negeri')) {
          if (!isIndonesianLocation(jobLoc)) return true;
        }

        if (jobLoc.includes(l) || l.includes(jobLoc)) return true;

        const matchedProv = INDONESIAN_PROVINCES.find(
          p => p.province.toLowerCase() === l
        );
        if (matchedProv) {
          if (jobLoc.includes(matchedProv.province.toLowerCase())) return true;
          if (matchedProv.cities.some(city => jobLoc.includes(city.toLowerCase()))) return true;
        }

        const jobProv = INDONESIAN_PROVINCES.find(
          p => p.province.toLowerCase() === jobLoc || p.cities.some(c => c.toLowerCase() === jobLoc)
        );
        if (jobProv) {
          if (jobProv.province.toLowerCase().includes(l) || l.includes(jobProv.province.toLowerCase())) return true;
        }

        return false;
      });
      if (!matchLoc) return false;
    }

    // Checkbox 2: Specialization Filter
    if (selectedSpecializations.length > 0) {
      const matchSpec = selectedSpecializations.some(spec => {
        const s = spec.toLowerCase().trim();
        const cat = (job.kategori || '').toLowerCase();
        const title = job.judul.toLowerCase();
        const desc = (job.deskripsi || '').toLowerCase();

        if (cat.includes(s) || title.includes(s) || desc.includes(s)) return true;

        const jobCatItems = cat.split(',').map(c => c.trim()).filter(Boolean);
        if (jobCatItems.some(ci => ci.includes(s) || s.includes(ci))) return true;

        const sWords = s.split(/[\s/&,]+/).filter(w => w.length > 2);
        if (sWords.length > 0 && sWords.some(w => cat.includes(w) || title.includes(w))) return true;

        if (s.includes('it') || s.includes('komputer') || s.includes('teknologi')) {
          if (cat.includes('it') || cat.includes('ti') || cat.includes('komputer') || cat.includes('teknologi') || title.includes('developer') || title.includes('engineer') || title.includes('ui/ux') || title.includes('software')) return true;
        }
        if (s.includes('akuntansi') || s.includes('keuangan')) {
          if (cat.includes('keuangan') || cat.includes('akuntansi') || title.includes('accountant') || title.includes('finance') || title.includes('akuntan')) return true;
        }
        if (s.includes('pemasaran') || s.includes('digital')) {
          if (cat.includes('pemasaran') || cat.includes('marketing') || title.includes('marketing') || title.includes('exim') || title.includes('promosi')) return true;
        }
        if (s.includes('teknik') || s.includes('rekayasa') || s.includes('manufaktur')) {
          if (cat.includes('teknik') || cat.includes('rekayasa') || cat.includes('manufaktur') || title.includes('engineer') || title.includes('project')) return true;
        }
        return false;
      });
      if (!matchSpec) return false;
    }

    return true;
  });

  const sortedLowongan = [...filteredLowongan].sort((a, b) => {
    if (jobSortOrder === 'oldest') {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    }
    if (jobSortOrder === 'alphabetical') {
      return a.judul.localeCompare(b.judul);
    }
    // Default: newest first
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id.localeCompare(a.id, undefined, { numeric: true });
  });

  const totalLowonganCount = sortedLowongan.length;
  const totalJobInfoPages = Math.max(1, Math.ceil(totalLowonganCount / itemsPerPage));
  const jobStartIndex = (jobInfoPage - 1) * itemsPerPage;
  const paginatedLowongan = sortedLowongan.slice(
    jobStartIndex,
    jobStartIndex + itemsPerPage
  );
  const jobEndIndex = Math.min(jobStartIndex + paginatedLowongan.length, totalLowonganCount);

  // Filtered & Paginated Berita List
  const filteredBeritaList = publishedBerita.filter((b) => {
    const q = beritaSearchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      (b.penulis && b.penulis.toLowerCase().includes(q));
    const matchScope = beritaScopeFilter === 'Semua' || (b.scope || 'LOKAL') === beritaScopeFilter;
    return matchQ && matchScope;
  });

  const totalBeritaPages = Math.ceil(filteredBeritaList.length / beritaItemsPerPage);
  const paginatedBeritaList = filteredBeritaList.slice(
    (beritaPage - 1) * beritaItemsPerPage,
    beritaPage * beritaItemsPerPage
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800" id="pub-root">


      {/* ══════════════════════════════════════════
          HEADER (Top Bar + Main Navbar)
      ══════════════════════════════════════════ */}
      <Header
        currentTab={currentTab}
        setTab={setTab}
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToRegister={onNavigateToRegister}
      />


      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="flex-grow" id="pub-main">

        {/* ─── BERANDA TAB ─────────────────────── */}
        {currentTab === 'beranda' && (
          <div id="tab-beranda">

            {/* ══ HERO SLIDER SECTION ══════════════════════════════════════════════ */}
            <HeroSlider
              setTab={setTab}
              onNavigateToLogin={onNavigateToLogin}
              onNavigateToRegister={onNavigateToRegister}
            />


            {/* ══ STATS STRIP ══════════════════════════════════════════════ */}
            <div className="bg-[#1E3A8A] py-7">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                              grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#10B981]">
                      <AnimatedCounterStat rawValue={value} />
                    </div>
                    <div className="text-blue-200 text-xs sm:text-sm font-semibold uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ PENGUMUMAN KHUSUS / SANGAT PENTING (FULL WIDTH BANNER) ════════ */}
            {(() => {
              const importantAnn = publishedPengumuman.find(p => p.isImportant) || publishedPengumuman[0];
              if (!importantAnn || importantAnn.isImportant === false) return null;

              const isPosterMode = importantAnn.displayType === 'poster' && !!importantAnn.posterUrl;

              return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl border border-emerald-200/80 shadow-md bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 relative"
                  >
                    {isPosterMode ? (
                      /* Mode Poster / Gambar Visual */
                      <div className="relative group overflow-hidden bg-slate-950">
                        <img
                          src={importantAnn.posterUrl}
                          alt={importantAnn.title}
                          className="w-full max-h-[380px] object-cover object-center group-hover:scale-102 transition-transform duration-500 cursor-pointer"
                          onClick={() => setSelectedPosterModal(importantAnn.posterUrl!)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-1">
                              <Megaphone className="w-3.5 h-3.5 text-slate-950 animate-pulse" /> PENGUMUMAN SANGAT PENTING
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black leading-snug text-white drop-shadow-xs">
                            {importantAnn.title}
                          </h3>
                          {importantAnn.content && (
                            <p className="text-slate-200 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed max-w-3xl">
                              {stripHtmlTags(importantAnn.content)}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-4 flex-wrap">
                            <button
                              onClick={() => setSelectedPosterModal(importantAnn.posterUrl!)}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-2 rounded-xl border border-white/30 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Perbesar Poster
                            </button>
                            {importantAnn.linkUrl && (
                              <a
                                href={importantAnn.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#10B981] hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                {importantAnn.linkLabel || 'Buka Tautan'} <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Mode Badge / Banner Teks */
                      <div className="p-6 sm:p-7 flex flex-col sm:flex-row items-start gap-5 relative">
                        <div className="bg-emerald-500 text-slate-950 p-3.5 rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
                          <Megaphone className="w-7 h-7 animate-pulse text-slate-950" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              PENGUMUMAN PENTING
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                            {importantAnn.title}
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                            {stripHtmlTags(importantAnn.content)}
                          </p>
                          {importantAnn.linkUrl && (
                            <div className="pt-2">
                              <a
                                href={importantAnn.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                              >
                                {importantAnn.linkLabel || 'Buka Tautan'} <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })()}

            {/* ══ MAIN CONTENT + SIDEBAR ══════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20
                            grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* ── LEFT / MAIN COLUMN ────────────────────────────────── */}
              <div className="lg:col-span-8 space-y-14">

                {/* ── JOB LISTINGS ───────────────────────────────────── */}
                <section id="job-listings">
                  <div className="flex items-center justify-between mb-7">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A]
                                   flex items-center gap-2 before:block before:w-1.5 before:h-6
                                   before:rounded-full before:bg-[#10B981]">
                      INFO KARIR CDC TERKINI
                    </h3>
                  </div>

                  {filteredLowongan.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <div className="font-bold text-slate-600">Belum ada lowongan tersedia</div>
                      <div className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau hapus filter</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredLowongan.slice(0, 6).map(item => (
                        <div
                          key={item.id}
                          onClick={() => onSelectLowongan(item.id)}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                        >
                          <div>
                            {item.sumber === 'admin' ? (
                              /* Poster Image Container (Khusus Input Admin: Full-bleed, Zoom-in Center Crop + animasi reveal) */
                              <div className="w-full h-48 sm:h-52 relative overflow-hidden bg-slate-900 border-b border-slate-100">
                                {(() => {
                                  const posterSrc = item.flyer || item.imageUrl || (item.flyers && item.flyers.length > 0 ? item.flyers[0] : null) || item.bannerImage;
                                  if (posterSrc) {
                                    return (
                                      <>
                                        <img
                                          src={posterSrc}
                                          alt={item.judul || item.namaInstansi}
                                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                                      </>
                                    );
                                  }
                                  return (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 space-y-1">
                                      <Building2 className="w-10 h-10 text-slate-400" />
                                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{item.namaInstansi}</span>
                                    </div>
                                  );
                                })()}
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                  {item.tipe === 'magang' ? (
                                    <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-emerald-600 text-white uppercase tracking-wider">
                                      INTERNSHIP
                                    </span>
                                  ) : item.jenisPekerjaan ? (
                                    <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-slate-800/90 backdrop-blur-xs text-white">
                                      {item.jenisPekerjaan === 'full-time' ? 'Full-Time' : 'Part-Time'}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ) : (
                              /* Company Logo Container (Khusus Input Mitra: Style Original contain p-4) */
                              <div className="w-full h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
                                {item.companyLogo ? (
                                  <img
                                    src={item.companyLogo}
                                    alt={item.namaInstansi}
                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-slate-300 space-y-1">
                                    <Building2 className="w-10 h-10 text-slate-400" />
                                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{item.namaInstansi}</span>
                                  </div>
                                )}
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                  {item.tipe === 'magang' ? (
                                    <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-emerald-600 text-white uppercase tracking-wider">
                                      INTERNSHIP
                                    </span>
                                  ) : item.jenisPekerjaan ? (
                                    <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-slate-700 text-white">
                                      {item.jenisPekerjaan === 'full-time' ? 'Full-Time' : 'Part-Time'}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            )}

                            {/* Card Content */}
                            <div className="p-5 space-y-2">
                              {/* Instansi Subheading in Accent Orange */}
                              <div className="text-xs font-bold text-orange-600 tracking-wide uppercase truncate">
                                {item.namaInstansi}
                              </div>

                              {/* Main Title */}
                              <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2">
                                {item.judul}
                              </h3>

                              {/* Meta Footer: source + Upload Date */}
                              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                                {item.sumber === 'admin' ? (
                                  <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
                                ) : (
                                  <span className="whitespace-nowrap font-medium text-slate-400">by Mitra</span>
                                )}
                                <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  {formatDateDisplay(item.createdAt || item.deadline)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>


                {/* ── PROMO BANNERS — ROW 1 ─────────────────────────── */}
                <section id="promo-banners">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A] mb-7
                                 flex items-center gap-2 before:block before:w-1.5 before:h-6
                                 before:rounded-full before:bg-[#10B981]">
                    PROGRAM &amp; PENGUMUMAN
                  </h3>
                  {(() => {
                    const dbPrograms = getFromDB<KontenKarir>('konten_karir')
                      .filter(k => ['program', 'pengumuman', 'workshop', 'softskill', 'seminar'].includes(k.jenis) && k.status === 'published')
                      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime());

                    // Combine default/demo items with published DB items if any
                    const itemsToRender = dbPrograms.length > 0 ? dbPrograms : [
                      {
                        id: 'evt_ws_001',
                        jenis: 'workshop' as const,
                        judul: 'Workshop UI/UX Design & Prototyping Figma 2026',
                        body: 'Pelatihan praktis pembuatan wireframe, Design System, hingga Interactive Prototype aplikasi berbasis industri bersama praktisi.',
                        kategori: 'Workshop',
                        thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
                        layoutType: 'card' as const,
                        status: 'published' as const,
                        createdAt: '2026-08-18T09:00:00Z',
                        createdByName: 'Admin Website'
                      },
                      {
                        id: 'evt_ss_001',
                        jenis: 'softskill' as const,
                        judul: 'Pelatihan Softskill Public Speaking & Persuasi Komunikasi Karir',
                        body: 'Membangun kepercayaan diri saat presentasi, wawancara kerja, dan komunikasi profesional di dunia industri modern.',
                        kategori: 'Softskill',
                        thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
                        layoutType: 'card' as const,
                        status: 'published' as const,
                        createdAt: '2026-08-19T10:00:00Z',
                        createdByName: 'Admin Website'
                      },
                      {
                        id: 'evt_sm_001',
                        jenis: 'seminar' as const,
                        judul: 'Seminar Nasional Strategi Menembus BUMN & Perusahaan Multinasional',
                        body: 'Pemaparan komprehensif mengenai alur seleksi Rekrutmen Bersama BUMN, psikotes, dan tips wawancara langsung bersama HR.',
                        kategori: 'Seminar',
                        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
                        layoutType: 'card' as const,
                        status: 'published' as const,
                        createdAt: '2026-08-20T11:00:00Z',
                        createdByName: 'Admin Website'
                      },
                      {
                        id: 'demo_prog_1',
                        jenis: 'program' as const,
                        judul: 'JOB PREPARATION 2026',
                        body: 'Persiapkan dirimu menghadapi dunia kerja dengan program intensif bersama praktisi HR terbaik.',
                        kategori: 'Program Unggulan',
                        thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
                        layoutType: 'card' as const,
                        status: 'published' as const,
                        createdAt: '2026-05-10T08:00:00Z',
                        createdByName: 'Admin Website'
                      }
                    ];

                    const getDisplayBadge = (item: KontenKarir) => {
                      if (item.jenis === 'workshop') return 'WORKSHOP';
                      if (item.jenis === 'softskill') return 'SOFTSKILL';
                      if (item.jenis === 'seminar') return 'SEMINAR';
                      if (item.jenis === 'program') return 'PROGRAM';
                      if (item.jenis === 'pengumuman') return 'PENGUMUMAN';
                      return (item.kategori || 'PROGRAM').toUpperCase();
                    };

                    const handleCardItemClick = (item: KontenKarir) => {
                      window.scrollTo(0, 0);
                      if (item.jenis === 'workshop' || item.jenis === 'softskill' || item.jenis === 'seminar') {
                        setSelectedEventId(item.id);
                        setTab(item.jenis);
                      } else if (onSelectProgram) {
                        onSelectProgram(item.id);
                      } else if (onNavigateToRegister) {
                        onNavigateToRegister('alumni');
                      } else if (onNavigateToLogin) {
                        onNavigateToLogin();
                      }
                    };

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {itemsToRender.map(item => {
                          const isBadgeLayout = item.layoutType === 'badge';
                          const badgeLabel = getDisplayBadge(item);

                          if (isBadgeLayout) {
                            if (item.thumbnail) {
                              /* Mode Banner Poster Full-Visual */
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleCardItemClick(item)}
                                  className="w-full h-64 sm:h-72 rounded-3xl relative overflow-hidden shadow-md hover:shadow-xl border border-slate-200/80 group cursor-pointer flex flex-col justify-between p-6 sm:p-7 transition-all"
                                >
                                  {/* Background Poster Image */}
                                  <img
                                    src={item.thumbnail}
                                    alt={item.judul}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />

                                  {/* Dark Gradient Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-950/20" />

                                  {/* Header Badge */}
                                  <div className="relative z-10 flex items-center justify-between gap-2">
                                    <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                                      <Megaphone className="w-3.5 h-3.5 text-slate-950" />
                                      {badgeLabel}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-amber-300 tracking-wider uppercase drop-shadow-xs">
                                      {item.namaInstansi || 'CDC UM KENDARI'}
                                    </span>
                                  </div>

                                  {/* Content Box at Bottom */}
                                  <div className="relative z-10 space-y-2 mt-auto">
                                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                                      {item.judul}
                                    </h3>

                                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed line-clamp-2">
                                      {stripHtmlTags(item.body)}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/15 mt-3 flex-wrap gap-2">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-xs font-semibold text-slate-200/90 whitespace-nowrap">
                                          by {(!item.createdByName || item.createdByName.toLowerCase().includes('admin')) ? 'Admin Website' : item.createdByName}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPosterModal(item.thumbnail!);
                                          }}
                                          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                                        >
                                          <Eye className="w-3.5 h-3.5" /> Perbesar Poster
                                        </button>
                                      </div>

                                      <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                                        <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                        {formatDateDisplay(item.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            /* Fallback Mode Badge Teks Hijau */
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleCardItemClick(item)}
                                className="bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 rounded-3xl border border-emerald-200/80 p-6 sm:p-7 shadow-md hover:shadow-lg transition-all cursor-pointer group flex flex-col sm:flex-row items-start gap-5 relative overflow-hidden"
                              >
                                <div className="bg-emerald-500 text-slate-950 p-3.5 rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
                                  <Award className="w-7 h-7 text-slate-950" />
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                      {badgeLabel}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-orange-600 tracking-wider uppercase">
                                      {item.namaInstansi || 'CDC UM KENDARI'}
                                    </span>
                                  </div>
                                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-[#1E3A8A] transition-colors">
                                    {item.judul}
                                  </h3>
                                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                    {stripHtmlTags(item.body)}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-3 border-t border-slate-100 mt-3">
                                    <span className="whitespace-nowrap font-medium text-slate-400">by {(!item.createdByName || item.createdByName.toLowerCase().includes('admin')) ? 'Admin Website' : item.createdByName}</span>
                                    <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      {formatDateDisplay(item.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          /* Mode Card Gambar / Poster */
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleCardItemClick(item)}
                              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                            >
                              <div>
                                <div className="w-full h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center border-b border-slate-100">
                                  {item.thumbnail ? (
                                    <img
                                      src={item.thumbnail}
                                      alt={item.judul}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                      <Megaphone className="w-10 h-10 text-[#10B981]" />
                                    </div>
                                  )}
                                  <div className="absolute top-3 left-3 flex items-center gap-2">
                                    <span className="px-2.5 py-1 text-[11px] font-black rounded-md shadow-xs bg-emerald-700 text-white uppercase tracking-wider">
                                      {badgeLabel}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-5 space-y-2">
                                  <div className="text-xs font-bold text-orange-600 tracking-wide uppercase truncate">
                                    {item.namaInstansi || 'CDC UM KENDARI'}
                                  </div>

                                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2">
                                    {item.judul}
                                  </h3>

                                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                                    {stripHtmlTags(item.body)}
                                  </p>

                                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                                    <span className="whitespace-nowrap font-medium text-slate-400">by {(!item.createdByName || item.createdByName.toLowerCase().includes('admin')) ? 'Admin Website' : item.createdByName}</span>
                                    <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      {formatDateDisplay(item.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </section>





                {/* ── BERITA / ARTIKEL ──────────────────────────────── */}
                {homeUnifiedNews.length > 0 && (
                  <section id="berita-home">
                    <div className="flex items-center justify-between mb-7">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A]
                                     flex items-center gap-2 before:block before:w-1.5 before:h-6
                                     before:rounded-full before:bg-[#10B981]">
                        BERITA &amp; ARTIKEL TERKINI
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {homeUnifiedNews.slice(0, 4).map(item => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -3 }}
                          onClick={item.onClick}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-200
                                     shadow-sm cursor-pointer group"
                        >
                          <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                            {item.coverImageUrl ? (
                              <img
                                src={item.coverImageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-slate-300" />
                              </div>
                            )}
                            <div className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs ${item.badgeBg}`}>
                              {item.badge}
                            </div>
                          </div>
                          <div className="p-5 space-y-2">
                            <h4 className="font-bold text-slate-900 leading-snug line-clamp-2
                                           group-hover:text-[#1E3A8A] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{stripHtmlTags(item.excerpt)}</p>
                            <div className="text-xs text-slate-400 font-medium pt-1">
                              Oleh {item.penulis} · {formatDateDisplay(item.createdAt)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}



              </div> {/* END left col */}


              {/* ── RIGHT SIDEBAR ────────────────────────────────────── */}
              <aside className="lg:col-span-4 space-y-6 lg:pt-0">

                {/* CDC Club banner */}
                {(() => {
                  const club = getCdcClubConfig();
                  if (!club.published) return null;
                  const openClub = () => { if (club.buttonUrl) window.open(club.buttonUrl, '_blank', 'noopener,noreferrer'); };
                  return (
                    <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-2xl p-6 text-white
                                  shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <Users className="w-48 h-48" />
                      </div>
                      <div className="relative z-10 text-center space-y-3">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="font-extrabold text-lg leading-tight whitespace-pre-line">
                          {translateContent(club.title)}
                        </h4>
                        <p className="text-rose-100 text-xs leading-relaxed">
                          {translateContent(club.subtitle)}
                        </p>
                        <button
                          onClick={openClub}
                          className="bg-white text-rose-700 font-extrabold text-xs
                                   px-5 py-2 rounded-full hover:bg-rose-50 transition-colors"
                        >
                          {translateContent(club.buttonText)}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Popular Info widget (Dinamis dari info terpin & terpublikasi, KHUSUS non-lowongan/non-internship) */}
                {(() => {
                  interface PopularDisplayItem {
                    label: string;
                    thumbnail?: string;
                    isPinned?: boolean;
                    kategori?: string;
                    action: () => void;
                  }

                  const pinnedKonten = getFromDB<KontenKarir>('konten_karir').filter(k => k.status === 'published' && k.isPinned && k.jenis !== 'lowongan');
                  const publishedNonLowonganKonten = getFromDB<KontenKarir>('konten_karir').filter(k => k.status === 'published' && k.jenis !== 'lowongan');

                  const dynamicPopularItems: PopularDisplayItem[] = [
                    ...pinnedKonten.map(k => ({
                      label: k.judul,
                      thumbnail: k.thumbnail,
                      isPinned: true,
                      kategori: k.kategori || k.jenis,
                      action: () => {
                        if (k.jenis === 'berita') setTab('berita');
                        else if (k.jenis === 'presentasi') setTab('presentasi-internasional-akademik');
                        else setTab('beranda');
                      }
                    })),
                    ...publishedBerita.slice(0, 3).map(b => ({
                      label: b.title,
                      thumbnail: b.coverImageUrl,
                      kategori: b.scope || 'Berita',
                      action: () => onSelectBerita(b.slug)
                    })),
                    ...publishedPengumuman.slice(0, 2).map(p => ({
                      label: p.title,
                      thumbnail: p.posterUrl,
                      kategori: 'Pengumuman',
                      action: () => setTab('beranda')
                    })),
                    ...publishedNonLowonganKonten.filter(k => !k.isPinned).slice(0, 3).map(k => ({
                      label: k.judul,
                      thumbnail: k.thumbnail,
                      kategori: k.kategori || k.jenis,
                      action: () => {
                        if (k.jenis === 'berita') setTab('berita');
                        else if (k.jenis === 'presentasi') setTab('presentasi-internasional-akademik');
                        else setTab('beranda');
                      }
                    }))
                  ];

                  const popularDisplayList: PopularDisplayItem[] = dynamicPopularItems.length > 0
                    ? dynamicPopularItems.slice(0, 7)
                    : POPULAR_LINKS.map(link => ({
                      label: link.label,
                      thumbnail: link.thumbnail,
                      kategori: link.kategori,
                      action: () => setTab('lowongan')
                    }));

                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-[#1E3A8A] px-5 py-3.5 flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-white uppercase tracking-wider
                                       flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" /> Popular Info
                        </h4>
                      </div>
                      <ul className="divide-y divide-slate-100">
                        {popularDisplayList.map((item, idx) => (
                          <li key={idx}>
                            <button
                              onClick={item.action}
                              className="w-full text-left p-3 sm:p-3.5 hover:bg-blue-50/60 transition-colors
                                         flex items-center gap-3 group cursor-pointer"
                            >
                              {/* Mini Card Thumbnail Image */}
                              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl border border-slate-200/80 bg-slate-100 shrink-0 overflow-hidden relative flex items-center justify-center shadow-2xs">
                                {item.thumbnail ? (
                                  <img
                                    src={item.thumbnail}
                                    alt={item.label}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                      const fallbackEl = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallbackEl) fallbackEl.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-[#1E3A8A] ${item.thumbnail ? 'hidden' : 'flex'
                                    }`}
                                >
                                  <FileText className="w-5 h-5 text-[#1E3A8A]" />
                                </div>
                              </div>

                              {/* Text & Meta info */}
                              <div className="min-w-0 flex-1 space-y-0.5">
                                {(item.isPinned || item.kategori) && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {item.isPinned && (
                                      <span className="text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 uppercase tracking-wider">
                                        📌 Pinned
                                      </span>
                                    )}
                                    {item.kategori && !item.isPinned && (
                                      <span className="text-[10px] font-extrabold text-[#10B981] uppercase tracking-wider truncate max-w-[120px]">
                                        {item.kategori}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <h5 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                                  {item.label}
                                </h5>
                              </div>

                              {/* Subtle Chevron indicator */}
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Info Terkini Loker widget */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider
                                   flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#10B981]" /> Info Terkini Loker
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {publishedLowongan.slice(0, 5).map(loker => (
                      <button
                        key={loker.id}
                        onClick={() => onSelectLowongan(loker.id)}
                        className="w-full text-left group border-b border-slate-100 last:border-0 pb-3 last:pb-0 flex items-start gap-3"
                      >
                        <img
                          src={
                            loker.flyer ||
                            loker.imageUrl ||
                            (loker.flyers && loker.flyers.length > 0 ? loker.flyers[0] : null) ||
                            loker.bannerImage ||
                            loker.companyLogo ||
                            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop'
                          }
                          alt={loker.namaInstansi}
                          className="w-12 h-12 rounded-xl border border-slate-200 object-cover shrink-0 mt-0.5 bg-slate-50"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                            {loker.judul}
                          </h5>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                            <Building className="w-3 h-3 shrink-0" /> <span className="truncate">{loker.namaInstansi}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                    {publishedLowongan.length === 0 && (
                      <p className="text-slate-400 text-xs text-center py-4">Belum ada lowongan</p>
                    )}
                  </div>
                </div>

                {/* Quick CTA box (Layanan Cepat) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">

                  <h4 className="font-extrabold text-sm text-[#1E3A8A] uppercase tracking-wider">Layanan Cepat</h4>
                  {[
                    { label: 'Konseling Karir', tab: 'konseling' },
                    { label: 'Campus Hiring - Recruitment', tab: 'campus-hiring' },
                    { label: 'Tes Potensi Minat Kerja', href: 'https://www.klob.id/klob-journey/klob-meter' },
                  ].map(s => (
                    s.href ? (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                                   bg-white border border-slate-200 hover:border-[#1E3A8A]
                                   hover:bg-blue-50 transition-all text-sm font-semibold text-slate-700 group"
                      >
                        <span>{s.label}</span>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#1E3A8A]
                                                 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </a>
                    ) : (
                      <button
                        key={s.label}
                        onClick={() => s.tab && setTab(s.tab)}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                                   bg-white border border-slate-200 hover:border-[#1E3A8A]
                                   hover:bg-blue-50 transition-all text-sm font-semibold text-slate-700 group cursor-pointer"
                      >
                        <span>{s.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E3A8A]
                                                 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    )
                  ))}
                </div>

              </aside>
            </div> {/* END grid */}

          </div> /* END tab-beranda */
        )}


        {/* ─── PROFIL TAB ──────────────────────────────────────────── */}
        {currentTab === 'profil' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="tab-profil">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Profil Career Development Center</h2>
              <div className="text-[#10B981] font-bold text-sm">Universitas Muhammadiyah Kendari</div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6 text-slate-600 text-sm leading-relaxed">
              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Tentang CDC</h3>
              <p>Career Development Center (CDC) Universitas Muhammadiyah Kendari adalah unit kerja penjamin mutu yang didirikan untuk menjalin kerja sama profesional, mendampingi pengembangan karir mahasiswa sejak dini, serta menjejaki kualitas kerja para alumni.</p>

              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Visi &amp; Misi</h3>
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm mt-4 bg-slate-50 p-2 sm:p-4">
                <img
                  src={visiMisiUrl}
                  alt="Visi & Misi UPT. Pusat Pengembangan Kreativitas, Inovasi dan Konseling Mahasiswa Universitas Muhammadiyah Kendari"
                  className="w-full h-auto object-contain rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/visi-misi-cdc.svg'; }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── VISI & MISI TAB ──────────────────────────────────────────── */}
        {currentTab === 'visi-misi' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-8" id="tab-visi-misi">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Visi &amp; Misi CDC</h2>
              <div className="text-[#10B981] font-bold text-sm">Universitas Muhammadiyah Kendari</div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-lg overflow-hidden">
              <img
                src={visiMisiUrl}
                alt="Visi & Misi UPT. Pusat Pengembangan Kreativitas, Inovasi dan Konseling Mahasiswa Universitas Muhammadiyah Kendari"
                className="w-full h-auto rounded-2xl object-contain shadow-sm"
                onError={(e) => { (e.target as HTMLImageElement).src = '/visi-misi-cdc.svg'; }}
              />
            </div>
          </div>
        )}

        {/* ─── KEANGGOTAAN TIM CDC TAB ──────────────────────────────────── */}
        {currentTab === 'keanggotaan' && <Keanggotaan />}

        {/* ─── LOWONGAN TAB (JOB INFO) ──────────────── */}
        {currentTab === 'lowongan' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" id="tab-lowongan">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
                Daftar Lowongan Kerja
              </h2>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                Cari peluang karir terbaik hasil jalinan kerja sama Universitas.
              </p>
            </div>

            {/* WHITE SEARCH & FILTER BAR CONTAINER */}
            <div className="bg-white relative" ref={jobPopupRef}>
              <div className="flex flex-col md:flex-row items-stretch gap-2.5 md:gap-3">

                {/* TEXTBOX: Kata kunci, jabatan, atau perusahaan */}
                <div className="flex-1 bg-white text-slate-900 rounded-xl flex items-center px-3.5 py-2.5 border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 hover:border-blue-300 transition shadow-2xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    placeholder="Kata kunci, jabatan, atau perusahaan"
                    value={jobKeyword}
                    onChange={(e) => setJobKeyword(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  {jobKeyword && (
                    <button onClick={() => setJobKeyword('')} className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* FILTER 1: Semua Lokasi */}
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => setOpenPopup(openPopup === 'location' ? null : 'location')}
                    className={`w-full bg-white rounded-xl flex items-center justify-between px-3.5 py-2.5 border transition text-xs md:text-sm font-medium text-left shadow-2xs cursor-pointer ${openPopup === 'location' || selectedLocations.length > 0
                      ? 'border-blue-400 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/30'
                      : 'border-slate-300 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                  >
                    <div className="flex items-center min-w-0 pr-2">
                      <MapPin className={`w-4 h-4 shrink-0 mr-2.5 transition-colors ${selectedLocations.length > 0 ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <span className={`truncate ${selectedLocations.length > 0 ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                        {selectedLocations.length === 0
                          ? 'Semua Lokasi'
                          : `${selectedLocations.length} Lokasi Terpilih (${selectedLocations.slice(0, 2).join(', ')}${selectedLocations.length > 2 ? '...' : ''})`}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openPopup === 'location' ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {/* POPOVER MENU FOR LOCATION CHECKBOXES WITH ANIMATION */}
                  <AnimatePresence>
                    {openPopup === 'location' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1.5 z-50 w-80 sm:w-96 max-w-[92vw] bg-white border border-slate-100 shadow-xl shadow-slate-900/10 rounded-2xl overflow-hidden text-slate-800 text-xs"
                      >
                        <div className="bg-slate-50/90 backdrop-blur-xs border-b border-slate-100 px-4 py-2.5 font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#0077C6]" /> Lokasi Pekerjaan
                          </span>
                          {selectedLocations.length > 0 && (
                            <button
                              onClick={() => setSelectedLocations([])}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition cursor-pointer"
                            >
                              Reset ({selectedLocations.length})
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 border-b border-slate-100 bg-white">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Cari provinsi, kota, atau luar negeri..."
                              value={locationSearch}
                              onChange={(e) => setLocationSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                            />
                            {locationSearch && (
                              <button onClick={() => setLocationSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto nice-scrollbar p-2.5 space-y-2.5">
                          {(!locationSearch || 'lainnya (luar negeri)'.includes(locationSearch.toLowerCase()) || 'luar negeri'.includes(locationSearch.toLowerCase()) || 'lainnya'.includes(locationSearch.toLowerCase())) && (
                            <div className="pb-2.5 border-b border-slate-200 mb-2">
                              <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition">
                                <input
                                  type="checkbox"
                                  checked={selectedLocations.includes('LAINNYA (LUAR NEGERI)')}
                                  onChange={() => toggleCheckboxOption(setSelectedLocations, 'LAINNYA (LUAR NEGERI)')}
                                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span className="flex items-center gap-1.5 text-blue-700 font-extrabold">
                                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>LAINNYA (LUAR NEGERI)</span>
                                </span>
                              </label>
                              <p className="text-[10px] text-slate-400 pl-7 font-normal">Lokasi pekerjaan luar negeri (Jepang, Jerman, Tokyo, dll.)</p>
                            </div>
                          )}
                          {INDONESIAN_PROVINCES.map((prov) => {
                            const filteredCities = prov.cities.filter(c =>
                              c.toLowerCase().includes(locationSearch.toLowerCase()) ||
                              prov.province.toLowerCase().includes(locationSearch.toLowerCase())
                            );

                            if (locationSearch && !prov.province.toLowerCase().includes(locationSearch.toLowerCase()) && filteredCities.length === 0) {
                              return null;
                            }

                            const isProvChecked = selectedLocations.includes(prov.province);

                            return (
                              <div key={prov.province} className="space-y-1">
                                <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                  <input
                                    type="checkbox"
                                    checked={isProvChecked}
                                    onChange={() => toggleCheckboxOption(setSelectedLocations, prov.province)}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                  />
                                  <span>{prov.province}</span>
                                </label>

                                <div className="pl-5 space-y-1 border-l border-slate-100 ml-2">
                                  {filteredCities.map((city) => {
                                    const isCityChecked = selectedLocations.includes(city);
                                    return (
                                      <label key={city} className="flex items-center gap-2 font-normal text-slate-700 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                                        <input
                                          type="checkbox"
                                          checked={isCityChecked}
                                          onChange={() => toggleCheckboxOption(setSelectedLocations, city)}
                                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                        />
                                        <span>{city}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* FILTER 2: Semua Spesialisasi */}
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => setOpenPopup(openPopup === 'specialization' ? null : 'specialization')}
                    className={`w-full bg-white rounded-xl flex items-center justify-between px-3.5 py-2.5 border transition text-xs md:text-sm font-medium text-left shadow-2xs cursor-pointer ${openPopup === 'specialization' || selectedSpecializations.length > 0
                      ? 'border-blue-400 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/30'
                      : 'border-slate-300 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                  >
                    <div className="flex items-center min-w-0 pr-2">
                      <Users className={`w-4 h-4 shrink-0 mr-2.5 transition-colors ${selectedSpecializations.length > 0 ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      <span className={`truncate ${selectedSpecializations.length > 0 ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                        {selectedSpecializations.length === 0
                          ? 'Semua Spesialisasi'
                          : `${selectedSpecializations.length} Spesialisasi Terpilih`}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openPopup === 'specialization' ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {/* POPOVER MENU FOR SPECIALIZATION CHECKBOXES WITH ANIMATION */}
                  <AnimatePresence>
                    {openPopup === 'specialization' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1.5 z-50 w-80 sm:w-96 max-w-[92vw] bg-white border border-slate-100 shadow-xl shadow-slate-900/10 rounded-2xl overflow-hidden text-slate-800 text-xs"
                      >
                        <div className="bg-slate-50/90 backdrop-blur-xs border-b border-slate-100 px-4 py-2.5 font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs">
                            <Briefcase className="w-3.5 h-3.5 text-[#0077C6]" /> Spesialisasi Pekerjaan
                          </span>
                          {selectedSpecializations.length > 0 && (
                            <button
                              onClick={() => setSelectedSpecializations([])}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition cursor-pointer"
                            >
                              Reset ({selectedSpecializations.length})
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 border-b border-slate-100 bg-white">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Cari bidang spesialisasi..."
                              value={specializationSearch}
                              onChange={(e) => setSpecializationSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                            />
                            {specializationSearch && (
                              <button onClick={() => setSpecializationSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto nice-scrollbar p-2.5 space-y-1">
                          {JOB_SPECIALIZATIONS.filter(spec =>
                            spec.toLowerCase().includes(specializationSearch.toLowerCase())
                          ).map((spec) => {
                            const isChecked = selectedSpecializations.includes(spec);
                            return (
                              <label key={spec} className="flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer hover:bg-blue-50/60 hover:text-blue-700 p-2 rounded-xl transition">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCheckboxOption(setSelectedSpecializations, spec)}
                                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="truncate">{spec}</span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BUTTON: Cari */}
                <button
                  type="button"
                  onClick={() => setOpenPopup(null)}
                  className="bg-[#0B1E48] hover:bg-[#071533] active:scale-95 text-white px-7 py-2.5 rounded-xl font-bold text-xs md:text-sm transition shrink-0 shadow-sm cursor-pointer"
                >
                  Cari
                </button>

              </div>
            </div>

            {/* ACTIVE FILTERS SUMMARY & COUNTER & SORTING */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-600 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Menampilkan {totalLowonganCount > 0 ? jobStartIndex + 1 : 0}-{jobEndIndex} dari <strong className="text-[#0055D4] font-extrabold">{totalLowonganCount} lowongan</strong></span>

                {hasActiveJobFilters && (
                  <button
                    onClick={clearAllJobFilters}
                    className="text-red-600 hover:underline text-[11px] font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg ml-2 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Bersihkan Filter
                  </button>
                )}
              </div>

              {/* Sorting Select Dropdown with Dropdown component */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-slate-500 font-medium text-xs">Urutkan:</span>
                <Dropdown
                  value={jobSortOrder}
                  onChange={(v) => setJobSortOrder(v as any)}
                  size="sm"
                  className="w-36"
                  options={[
                    { value: 'newest', label: 'Terbaru' },
                    { value: 'oldest', label: 'Terlama' },
                    { value: 'alphabetical', label: 'Abjad (A-Z)' }
                  ]}
                />
              </div>
            </div>

            {/* Empty State */}
            {sortedLowongan.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700">Tidak Ada Lowongan Ditemukan</h3>
                <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau pilih filter lokasi/spesialisasi yang berbeda.</p>
              </div>
            ) : (
              /* 3-Column Card Grid & Pagination */
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedLowongan.map(item => {
                    const hasLogo = Boolean(item.companyLogo);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectLowongan(item.id)}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          {item.sumber === 'admin' ? (
                            /* Poster Image Container (Khusus Input Admin: Full-bleed, Zoom-in Center Crop + animasi reveal) */
                            <div className="w-full h-48 sm:h-52 relative overflow-hidden bg-slate-900 border-b border-slate-100">
                              {(() => {
                                const posterSrc = item.flyer || item.imageUrl || (item.flyers && item.flyers.length > 0 ? item.flyers[0] : null) || item.bannerImage;
                                if (posterSrc) {
                                  return (
                                    <>
                                      <img
                                        src={posterSrc}
                                        alt={item.judul || item.namaInstansi}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                                    </>
                                  );
                                }
                                return (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 space-y-1">
                                    <Building2 className="w-10 h-10 text-slate-400" />
                                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{item.namaInstansi}</span>
                                  </div>
                                );
                              })()}
                              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                {item.tipe === 'magang' ? (
                                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-emerald-600 text-white uppercase tracking-wider">
                                    INTERNSHIP
                                  </span>
                                ) : item.jenisPekerjaan ? (
                                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-slate-800/90 backdrop-blur-xs text-white">
                                    {item.jenisPekerjaan === 'full-time' ? 'Full-Time' : 'Part-Time'}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            /* Company Logo Container (Khusus Input Mitra) */
                            <div className="w-full h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
                              {hasLogo ? (
                                <img
                                  src={item.companyLogo}
                                  alt={item.namaInstansi}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className={`w-32 h-24 rounded-2xl ${getCompanyBadgeColor(item.namaInstansi)} flex flex-col items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform duration-300 text-center`}>
                                  <span className="font-extrabold text-xl tracking-wider leading-none">{getCompanyInitials(item.namaInstansi)}</span>
                                  <span className="text-[9px] font-extrabold tracking-wider uppercase mt-1 line-clamp-1 px-1">{item.namaInstansi.replace(/^PT\s+/i, '').split(' ')[0]}</span>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                {item.tipe === 'magang' ? (
                                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-emerald-600 text-white uppercase tracking-wider">
                                    INTERNSHIP
                                  </span>
                                ) : item.jenisPekerjaan ? (
                                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-slate-700 text-white">
                                    {item.jenisPekerjaan === 'full-time' ? 'Full-Time' : 'Part-Time'}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          )}

                          {/* Card Content */}
                          <div className="p-5 space-y-2">
                            {/* Category / Instansi Subheading in Accent Orange */}
                            <div className="text-xs font-bold text-orange-600 tracking-wide uppercase truncate">
                              {item.namaInstansi}
                            </div>

                            {/* Main Title */}
                            <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2">
                              {item.judul}
                            </h3>

                            {/* Meta Footer: source + Upload Date */}
                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                              {item.sumber === 'admin' ? (
                                <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
                              ) : (
                                <span className="whitespace-nowrap font-medium text-slate-400">by Mitra</span>
                              )}
                              <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {formatDateDisplay(item.createdAt || item.deadline)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION (9 items per page) */}
                {totalJobInfoPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-4">
                    <button
                      onClick={() => setJobInfoPage(p => Math.max(1, p - 1))}
                      disabled={jobInfoPage === 1}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      &lt;
                    </button>

                    {Array.from({ length: totalJobInfoPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setJobInfoPage(pageNum)}
                        className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${pageNum === jobInfoPage
                          ? 'bg-[#1B365D] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setJobInfoPage(p => Math.min(totalJobInfoPages, p + 1))}
                      disabled={jobInfoPage === totalJobInfoPages}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}




        {/* ─── BERITA TAB ──────────────────────────────────────────── */}
        {currentTab === 'berita' && (
          <div className="bg-white min-h-screen font-sans text-slate-800 pb-20" id="tab-berita">

            {/* ── BREADCRUMB ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
              <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <button
                  onClick={() => setTab('beranda')}
                  className="hover:text-[#F26522] transition-colors font-semibold cursor-pointer"
                >
                  Beranda
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 font-semibold">Berita &amp; Artikel</span>
              </nav>
            </div>

            {/* ── MAIN TITLE ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Berita &amp; Artikel
              </h1>
            </div>

            {/* ── DYNAMIC SOCIAL SHARE BAR ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
              <SocialShareBar title="Berita & Artikel CDC UM Kendari" />
            </div>

            {/* ── CONTROLS BAR: SEARCH & SCOPE FILTER ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-2xs">

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={beritaSearchQuery}
                    onChange={(e) => {
                      setBeritaSearchQuery(e.target.value);
                      setBeritaPage(1);
                    }}
                    placeholder="Cari judul berita, topik, atau penulis..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition"
                  />
                </div>

                {/* Scope Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                  {(['Semua', 'LOKAL', 'REGIONAL', 'NASIONAL', 'GLOBAL'] as const).map((scope) => (
                    <button
                      key={scope}
                      onClick={() => {
                        setBeritaScopeFilter(scope);
                        setBeritaPage(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${beritaScopeFilter === scope
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                        }`}
                    >
                      {scope === 'Semua' ? 'Semua Berita' : scope}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ARTICLES GRID ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredBeritaList.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 text-lg">Tidak Ada Berita Ditemukan</h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
                    Coba kata kunci pencarian lain atau ubah filter kategori scope berita.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {paginatedBeritaList.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -4 }}
                        onClick={() => onSelectBerita(item.slug)}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Cover */}
                          <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                            {item.coverImageUrl ? (
                              <img
                                src={item.coverImageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <BookOpen className="w-10 h-10 text-slate-300" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-[#1E3A8A] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs">
                              {item.scope || 'LOKAL'}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>{formatDateDisplay(item.createdAt)}</span>
                            </div>

                            <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2">
                              {item.title}
                            </h3>

                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                              {stripHtmlTags(item.excerpt)}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-xs text-slate-400 font-medium">
                          <span>Oleh {(!item.penulis || item.penulis.toLowerCase().includes('admin')) ? 'Admin Website' : item.penulis}</span>
                          <span className="text-[#0077C6] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Baca <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalBeritaPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4">
                      <button
                        onClick={() => setBeritaPage((p) => Math.max(1, p - 1))}
                        disabled={beritaPage === 1}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        &lt;
                      </button>

                      {Array.from({ length: totalBeritaPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setBeritaPage(pageNum)}
                          className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${pageNum === beritaPage
                            ? 'bg-[#1E3A8A] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => setBeritaPage((p) => Math.min(totalBeritaPages, p + 1))}
                        disabled={beritaPage === totalBeritaPages}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── KONTAK TAB ──────────────────────────────────────────── */}
        {currentTab === 'kontak' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-10" id="tab-kontak">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Hubungi Pusat Karir (CDC)</h2>
              <p className="text-slate-500 text-sm">Ada pertanyaan mengenai magang atau pengisian tracer? Silakan sampaikan keluhan Anda.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Saluran Komunikasi Resmi</h3>
                {[
                  { icon: MapPin, title: 'Alamat Kantor', text: 'Gedung Rektorat Lt. 1, Universitas Muhammadiyah Kendari, Jl. K.H. Ahmad Dahlan No. 10, Kendari, Sultra.' },
                  { icon: Mail, title: 'Email', text: 'cdc@umkendari.ac.id' },
                  { icon: Phone, title: 'WhatsApp / Telepon', text: '0852-4100-9988 (Hotline CDC)' },
                  { icon: Clock, title: 'Waktu Pelayanan', text: 'Senin — Jumat (08:00 – 16:00 WITA)' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3.5">
                    <Icon className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 text-xs uppercase tracking-wide">{title}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#1E3A8A] text-slate-300 p-8 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="font-bold text-white text-base flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#10B981]" /> Kampus UM Kendari Sultra
                  </div>
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Sistem database CDC dipusatkan di Server Utama Universitas Muhammadiyah Kendari serta disinkronkan berkala untuk evaluasi kementerian dan akreditasi BAN-PT.
                  </p>
                </div>
                <div className="bg-blue-800/60 border border-blue-700/40 p-4 rounded-2xl flex items-center gap-3 text-xs">
                  <Megaphone className="w-4 h-4 text-[#10B981]" />
                  <span>Survei Kepuasan Lulusan diselenggarakan setiap akhir tahun.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SURAT KEPUTUSAN CDC TAB ────────────────────────────── */}
        {currentTab === 'sk-cdc' && <SuratKeputusanView setTab={setTab} />}

        {/* ─── KALENDER KEGIATAN CDC TAB ──────────────────────────── */}
        {currentTab === 'kalender' && <KalenderKegiatanView setTab={setTab} />}

        {/* ─── LAPORAN KINERJA & TRACER STUDY TAB ─────────────────── */}
        {currentTab === 'laporan' && <LaporanKinerjaView setTab={setTab} />}

        {/* ─── MOU DENGAN STAKEHOLDER TAB ──────────────────────────── */}
        {currentTab === 'mou' && <MouStakeholderView setTab={setTab} />}

        {/* ─── GALERI KEGIATAN CDC TAB ────────────────────────────── */}
        {currentTab === 'galeri' && <GaleriView setTab={setTab} />}

        {/* ─── LAYANAN SUB-TABS ───────────────────────────────────── */}
        {['konseling', 'tes-minat', 'workshop', 'softskill', 'seminar', 'career-fair', 'campus-hiring', 'magang'].includes(currentTab) && (
          <LayananContainer currentTab={currentTab} setTab={setTab}>
            {currentTab === 'konseling' && <BimbinganKarir />}
            {currentTab === 'tes-minat' && <TesMinat />}
            {currentTab === 'workshop' && <Workshop konten={konten} initialEventId={selectedEventId} />}
            {currentTab === 'softskill' && <Softskill konten={konten} initialEventId={selectedEventId} />}
            {currentTab === 'seminar' && <Seminar konten={konten} initialEventId={selectedEventId} />}
            {currentTab === 'career-fair' && <CareerFair />}
            {currentTab === 'campus-hiring' && <CampusHiring />}
            {currentTab === 'magang' && <Magang lowongan={lowongan} onSelectLowongan={onSelectLowongan} />}
          </LayananContainer>
        )}

        {/* ─── PRESTASI TAB PAGE ─────────────────────────────────── */}
        {currentTab.startsWith('presentasi') && (() => {
          const currentScope = currentTab.includes('internasional')
            ? 'internasional'
            : currentTab.includes('nasional')
              ? 'nasional'
              : 'wilayah';
          const currentKategori = currentTab.includes('non-akademik') ? 'non-akademik' : 'akademik';

          const allPresentasi = getFromDB<KontenKarir>('konten_karir').filter(
            (k) => k.jenis === 'presentasi' && k.status !== 'draft'
          );
          const publishedPresentasi = allPresentasi.filter(
            (p) => p.kategori === currentScope && p.subKategori === currentKategori
          );

          const filteredItems = publishedPresentasi.filter(item => {
            const q = prestasiSearchQuery.toLowerCase();
            const matchQ = !q || item.judul.toLowerCase().includes(q) || (item.namaMahasiswa || '').toLowerCase().includes(q);
            return matchQ;
          });

          const pageTitle = `Prestasi ${currentScope.charAt(0).toUpperCase() + currentScope.slice(1)} (${currentKategori === 'non-akademik' ? 'Non-Akademik' : 'Akademik'})`;

          return (
            <div className="bg-white min-h-screen font-sans text-slate-800 pb-20" id="tab-presentasi">
              {/* ── BREADCRUMB ── */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
                <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <button
                    onClick={() => setTab('beranda')}
                    className="hover:text-[#F26522] transition-colors font-semibold"
                  >
                    Beranda
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-semibold">{pageTitle}</span>
                </nav>
              </div>

              {/* ── MAIN TITLE ── */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {pageTitle}
                </h1>
              </div>

              {/* ── DYNAMIC SOCIAL SHARE BAR ── */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <SocialShareBar title={pageTitle} />
              </div>

              {/* Content Section */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8">
                  {/* Section Header & CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                        Daftar Capaian Prestasi Unggulan
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Menampilkan data prestasi mahasiswa peraih kejuaraan di tingkat {currentScope} ({currentKategori}).
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const waNum = getAdminWaPrestasi();
                        const msg = encodeURIComponent(`Halo Admin CDC UM Kendari, saya ingin melaporkan pencapaian prestasi mahasiswa tingkat ${currentScope} (${currentKategori}).`);
                        window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition shrink-0 cursor-pointer"
                      title="Laporkan Prestasi via WhatsApp Admin"
                    >
                      <Award className="w-4 h-4" /> Laporkan Prestasi
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={prestasiSearchQuery}
                      onChange={(e) => setPrestasiSearchQuery(e.target.value)}
                      placeholder="Cari kata kunci prestasi, capaian, atau nama mahasiswa..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Achievement cards grid */}
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                      <Award className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="font-bold text-slate-700 text-base">Belum Ada Data Prestasi untuk Kategori Ini</h3>
                      <p className="text-slate-400 text-xs max-w-md mx-auto">
                        Belum terdapat postingan prestasi terpublikasi untuk {currentScope} ({currentKategori}). Admin dapat memposting prestasi baru dari Admin Dashboard.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Image documentation header */}
                            <div className="w-full h-48 relative overflow-hidden bg-slate-100 border-b border-slate-100">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt={item.judul}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 space-y-1">
                                  <Award className="w-10 h-10 text-amber-400" />
                                  <span className="text-xs font-bold text-slate-400 uppercase">Dokumentasi</span>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5 text-slate-950" /> {item.peringkat}
                                </span>
                              </div>
                              <div className="absolute top-3 right-3">
                                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-xs font-bold">
                                  {item.tahun}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-3">
                              <div className="text-xs font-extrabold text-amber-600 uppercase tracking-wide truncate">
                                {item.prodi || 'UM KENDARI'}
                              </div>

                              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                                {item.judul}
                              </h3>

                              <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                                {item.body}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="font-bold text-slate-800 truncate max-w-[170px]" title={item.namaMahasiswa}>
                              {item.namaMahasiswa}
                            </div>
                            {item.terverifikasi !== false && (
                              <span className="text-emerald-600 font-extrabold text-[11px] flex items-center gap-1 shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi CDC
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </main>


      {/* Modal Lightbox Perbesar Poster Pengumuman */}
      {selectedPosterModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPosterModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPosterModal(null)}
              className="absolute top-4 right-4 bg-slate-950/80 text-white hover:bg-red-600 p-2 rounded-full transition z-10 cursor-pointer"
            >
              ✕
            </button>
            <img src={selectedPosterModal} alt="Poster Full" className="w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          FLOATING WHATSAPP CHAT BUTTON (PUBLIC)
      ══════════════════════════════════════════ */}
      {(() => {
        const hConfig = getHelpdeskConfig();
        if (hConfig.isFloatingActive === false) return null;
        const cleanWa = (hConfig.whatsappNumber || '0852-4100-9988').replace(/\D/g, '').replace(/^0/, '62');
        const defaultMsg = hConfig.defaultMessage || 'Halo Admin CDC UM Kendari, saya ingin bertanya mengenai...';
        const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(defaultMsg)}`;

        return (
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group animate-fade-in">
            <div className="hidden sm:flex items-center bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold border border-slate-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
              <span>Chat WhatsApp CDC UMK</span>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white relative group cursor-pointer"
              title="Hubungi Admin CDC via WhatsApp"
            >
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
              <MessageCircle className="w-7 h-7 text-white" />
            </a>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <Footer onSelectLowongan={onSelectLowongan} setTab={setTab} />
    </div>
  );
}
