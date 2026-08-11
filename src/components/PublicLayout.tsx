/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2, MapPin, Briefcase, Search, BookOpen,
  FileText, Mail, Phone, Clock, ArrowRight, Globe, Megaphone,
  Info, GraduationCap, ChevronRight, Facebook, Instagram, Youtube,
  Users, Building, Shield, Award, Star, TrendingUp, Zap, Target,
  ExternalLink, Calendar,
} from 'lucide-react';
import { Lowongan, Berita, Pengumuman } from '../types';
import { sortJobsByNewest, formatDateDisplay } from '../data';
import { motion } from 'motion/react';
import Header from './Header';
import { Footer } from './Footer';
import BimbinganKarir from './layanan/BimbinganKarir';
import TesMinat from './layanan/TesMinat';
import Workshop from './layanan/Workshop';
import Softskill from './layanan/Softskill';
import Seminar from './layanan/Seminar';
import CareerFair from './layanan/CareerFair';
import CampusHiring from './layanan/CampusHiring';
import Magang from './layanan/Magang';
import LayananContainer from './layanan/LayananContainer';
import HeroSlider from './HeroSlider';
import { JobSearchMasterDetail } from './JobSearchMasterDetail';

/* ─── Types ─────────────────────────────────── */
interface PublicLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lowongan: Lowongan[];
  berita: Berita[];
  pengumuman: Pengumuman[];
  onSelectLowongan: (id: string) => void;
  onSelectBerita: (slug: string) => void;
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
const STATS = [
  { value: '20.000+', label: 'Alumni' },
  { value: '5', label: 'Mitra Perusahaan' },
  { value: '98%', label: 'Tingkat Penempatan' },
  { value: '10+', label: 'Tahun Pengalaman' },
];

/* ─── Popular links ───────────────────────────── */
const POPULAR_LINKS = [
  'Loker BPJS Kesehatan 2026',
  'Loker Bank Mandiri 2026',
  'JOB PREPARATION 2026',
  'UM Kendari Career Fair',
  'Selamat & Sukses Pimpinan UM Kendari 2026',
  'Loker Pertamina 2026',
  'Magang BUMN Terbuka 2026',
];


export default function PublicLayout({
  currentTab,
  setTab,
  lowongan,
  berita,
  pengumuman,
  onSelectLowongan,
  onSelectBerita,
  onNavigateToLogin,
  onNavigateToRegister,
}: PublicLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'magang' | 'kerja'>('all');

  /* Data helpers: Lowongan terbaru (newest created) selalu di atas */
  const publishedLowongan = sortJobsByNewest(lowongan.filter(l => l.status === 'published'));
  const publishedBerita = berita.filter(b => b.status === 'published');
  const publishedPengumuman = pengumuman.filter(p => p.status === 'published');

  const filteredLowongan = publishedLowongan.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      item.judul.toLowerCase().includes(q) ||
      item.namaInstansi.toLowerCase().includes(q) ||
      item.lokasi.toLowerCase().includes(q);
    const matchT = filterType === 'all' ? true : item.tipe === filterType;
    return matchQ && matchT;
  });

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
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#10B981]">{value}</div>
                    <div className="text-blue-200 text-xs sm:text-sm font-semibold uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>


            {/* ══ JOB SEARCH ENGINE ═══════════════════════════════════════ */}
            <section id="job-search-engine" className="py-14 bg-white">

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Section header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100
                                  text-[#1E3A8A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5" /> Portal Karir
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
                    UM Kendari <span className="text-[#10B981]">CAREER FAIR</span>
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                  </p>
                </div>

                {/* Search bar */}
                <div className="max-w-3xl mx-auto">
                  <div className="relative group shadow-lg rounded-2xl bg-white border-2 border-slate-200
                                  focus-within:border-[#1E3A8A] transition-all">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none
                                    text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Mesin Pencari..."
                      className="w-full pl-14 pr-4 py-4 rounded-2xl bg-transparent text-base
                                 font-medium focus:outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      onClick={() => setTab('lowongan')}
                      className="absolute inset-y-2 right-2 bg-[#1E3A8A] hover:bg-blue-800
                                 text-white px-6 rounded-xl font-bold text-sm transition-colors"
                    >
                      Cari
                    </button>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(['all', 'kerja', 'magang'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                    >
                    </button>
                  ))}
                </div>
              </div>
            </section>


            {/* ══ MAIN CONTENT + SIDEBAR ══════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20
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
                    <button
                      onClick={() => setTab('lowongan')}
                      className="text-[#10B981] hover:text-emerald-700 font-bold text-sm
                                 flex items-center gap-1 transition-colors"
                    >
                      Lihat Semua <ChevronRight className="w-4 h-4" />
                    </button>
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
                            {/* Company Logo Image Container (1:1 matching Job Info card layout) */}
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
                              <div className="absolute top-3 left-3 flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs ${item.tipe === 'magang'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-emerald-600 text-white'
                                    }`}
                                >
                                  {item.tipe === 'magang' ? 'Magang' : 'Kerja'}
                                </span>
                              </div>
                            </div>

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

                              {/* Meta Footer: by Admin Website + Upload Date */}
                              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                                <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
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
                    PROGRAM & PENGUMUMAN
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Job Preparation card */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-gradient-to-br from-[#1E3A8A] to-blue-700
                                 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Target className="w-40 h-40 translate-x-10 translate-y-10" />
                      </div>
                      <div className="relative z-10 space-y-3">
                        <span className="bg-[#10B981] text-white text-[10px] font-extrabold
                                          px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                          Program Unggulan
                        </span>
                        <h4 className="font-extrabold text-xl leading-tight">JOB PREPARATION 2026</h4>
                        <p className="text-blue-200 text-sm leading-relaxed">
                          Persiapkan dirimu menghadapi dunia kerja dengan program intensif bersama praktisi HR terbaik.
                        </p>
                        <button
                          onClick={() => (onNavigateToRegister ? onNavigateToRegister('alumni') : onNavigateToLogin())}
                          className="mt-2 inline-flex items-center gap-1.5 bg-white text-[#1E3A8A]
                                     text-xs font-extrabold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Daftar Sekarang <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>

                    {/* Congratulations card */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-gradient-to-br from-amber-500 to-orange-600
                                 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Award className="w-40 h-40 translate-x-10 translate-y-10" />
                      </div>
                      <div className="relative z-10 space-y-3">
                        <span className="bg-white text-amber-700 text-[10px] font-extrabold
                                          px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                          Pengumuman
                        </span>
                        <h4 className="font-extrabold text-xl leading-tight">Selamat &amp; Sukses</h4>
                        <p className="text-amber-100 text-sm leading-relaxed">
                          Pimpinan Universitas Muhammadiyah Kendari Periode 2026–2030. Semoga amanah &amp; membawa kemajuan.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/80 mt-2">
                          <Calendar className="w-3.5 h-3.5" /> 2026 · Kendari, Sultra
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </section>


                {/* ── VISUAL BANNERS — ROW 2 ────────────────────────── */}
                <section id="visual-banners">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Certificate banner */}
                    <div
                      className="rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer"
                      style={{ minHeight: 200 }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop"
                        alt="Student Career Certificate"
                        className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/90 via-[#1E3A8A]/40 to-transparent" />
                      <div className="relative z-10 p-6 flex flex-col justify-end h-full" style={{ minHeight: 200 }}>
                        <span className="bg-[#10B981] text-white text-[10px] font-extrabold
                                          px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block mb-2">
                          Certification
                        </span>
                        <h4 className="text-white font-extrabold text-lg leading-tight">
                          Student Career Development<br />Certificate
                        </h4>
                        <p className="text-blue-200 text-xs mt-1">
                          Universitas Muhammadiyah Kendari — Pintu Gerbang Sukses Berkarir
                        </p>
                      </div>
                    </div>

                    {/* B2B Employer banner */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      onClick={() => (onNavigateToRegister ? onNavigateToRegister('perusahaan') : onNavigateToLogin())}
                      className="bg-[#1E3A8A] rounded-2xl p-6 shadow-lg relative overflow-hidden cursor-pointer"
                      style={{ minHeight: 200 }}
                    >
                      <div className="absolute right-0 top-0 w-32 h-32 bg-[#10B981]/20 rounded-full
                                      blur-2xl pointer-events-none -translate-y-8 translate-x-8" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/20 rounded-full
                                      blur-2xl pointer-events-none translate-y-8 -translate-x-6" />
                      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                        <div>
                          <span className="bg-amber-400 text-amber-900 text-[10px] font-extrabold
                                            px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block mb-3">
                            Iklan Mitra
                          </span>
                          <h4 className="text-white font-extrabold text-xl leading-tight">
                            PEMASANGAN INFO LOKER
                          </h4>
                          <p className="text-[#10B981] font-bold text-sm mt-1">
                            Temukan Kandidat Terbaik Perusahaan Anda
                          </p>
                          <p className="text-blue-300 text-xs mt-2 leading-relaxed">
                            Gratis pasang lowongan. Akses ribuan kandidat lulusan UM Kendari yang siap kerja.
                          </p>
                        </div>
                        <button className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-500
                                           text-white text-xs font-extrabold px-4 py-2.5 rounded-lg
                                           transition-colors w-fit">
                          Daftar Sebagai Mitra <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </section>


                {/* ── BERITA / ARTIKEL ──────────────────────────────── */}
                {publishedBerita.length > 0 && (
                  <section id="berita-home">
                    <div className="flex items-center justify-between mb-7">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A]
                                     flex items-center gap-2 before:block before:w-1.5 before:h-6
                                     before:rounded-full before:bg-[#10B981]">
                        BERITA &amp; ARTIKEL TERKINI
                      </h3>
                      <button
                        onClick={() => setTab('berita')}
                        className="text-[#10B981] hover:text-emerald-700 font-bold text-sm flex items-center gap-1"
                      >
                        Lihat Semua <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {publishedBerita.slice(0, 2).map(item => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -3 }}
                          onClick={() => onSelectBerita(item.slug)}
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
                            <div className="absolute top-3 left-3 bg-[#1E3A8A] text-white
                                            text-[10px] font-bold px-2 py-1 rounded">
                              BLOG &amp; INFO
                            </div>
                          </div>
                          <div className="p-5 space-y-2">
                            <h4 className="font-bold text-slate-900 leading-snug line-clamp-2
                                           group-hover:text-[#1E3A8A] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{item.excerpt}</p>
                            <div className="text-xs text-slate-400 font-medium pt-1">
                              Admin CDC · {formatDateDisplay(item.createdAt)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── PENGUMUMAN ────────────────────────────────────── */}
                {publishedPengumuman.length > 0 && (
                  <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100 shrink-0">
                        <Megaphone className="w-6 h-6 text-[#10B981] animate-pulse" />
                      </div>
                      <div>
                        <div className="text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-1">
                          Pengumuman Khusus
                        </div>
                        <h4 className="font-bold text-slate-900">{publishedPengumuman[0].title}</h4>
                        <p className="text-slate-600 text-sm mt-1">{publishedPengumuman[0].content}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div> {/* END left col */}


              {/* ── RIGHT SIDEBAR ────────────────────────────────────── */}
              <aside className="lg:col-span-4 space-y-6 lg:pt-0">

                {/* CDC Club banner */}
                <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-2xl p-6 text-white
                                shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Users className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-extrabold text-lg leading-tight">
                      CDC UM KENDARI<br />CLUB
                    </h4>
                    <p className="text-rose-100 text-xs leading-relaxed">
                      Bergabunglah dengan komunitas alumni tangguh yang tersebar di seluruh nusantara.
                    </p>
                    <button
                      onClick={() => (onNavigateToRegister ? onNavigateToRegister('alumni') : onNavigateToLogin())}
                      className="bg-white text-rose-700 font-extrabold text-xs
                                 px-5 py-2 rounded-full hover:bg-rose-50 transition-colors"
                    >
                      Gabung Komunitas
                    </button>
                  </div>
                </div>

                {/* Popular Info widget */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-[#1E3A8A] px-5 py-3.5">
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider
                                   flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" /> Popular Info
                    </h4>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {POPULAR_LINKS.map(link => (
                      <li key={link}>
                        <button
                          onClick={() => setTab('lowongan')}
                          className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700
                                     hover:bg-blue-50 hover:text-[#1E3A8A] transition-colors
                                     flex items-start gap-2 group"
                        >
                          <ChevronRight className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5
                                                   group-hover:translate-x-0.5 transition-transform" />
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

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

                {/* Quick CTA box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">

                  <h4 className="font-extrabold text-sm text-[#1E3A8A] uppercase tracking-wider">Layanan Cepat</h4>
                  {[
                    { label: 'Konseling Karier', tab: 'konseling' },
                    { label: 'CV Review', tab: 'cv-review' },
                    { label: 'Mock Interview', tab: 'mock-interview' },
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => setTab(s.tab)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                                 bg-white border border-slate-200 hover:border-[#1E3A8A]
                                 hover:bg-blue-50 transition-all text-sm font-semibold text-slate-700 group"
                    >
                      {s.label}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E3A8A]
                                               group-hover:translate-x-0.5 transition-all" />
                    </button>
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
                  src="/visi-misi-cdc.svg"
                  alt="Visi & Misi UPT. Pusat Pengembangan Kreativitas, Inovasi dan Konseling Mahasiswa Universitas Muhammadiyah Kendari"
                  className="w-full h-auto object-contain rounded-xl"
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
                src="/visi-misi-cdc.svg"
                alt="Visi & Misi UPT. Pusat Pengembangan Kreativitas, Inovasi dan Konseling Mahasiswa Universitas Muhammadiyah Kendari"
                className="w-full h-auto rounded-2xl object-contain shadow-sm"
              />
            </div>
          </div>
        )}

        {/* ─── LOWONGAN TAB (JOB INFO - GOOGLE STITCH REPLICA) ──────────────── */}
        {currentTab === 'lowongan' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="tab-lowongan">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
                Daftar Lowongan Kerja &amp; Magang
              </h2>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                Cari peluang karir terbaik hasil jalinan kerja sama Universitas.
              </p>
            </div>

            {/* Controls Bar: Search Input (Left) & Filter Tabs (Right) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari kata kunci, instansi, atau lokasi..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D] shadow-2xs"
                />
              </div>

              {/* Filter Tabs: Semua | Magang | Kerja */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                {(['all', 'magang', 'kerja'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === f
                      ? 'bg-[#1B365D] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    {f === 'all' ? 'Semua' : f === 'magang' ? 'Magang' : 'Kerja'}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredLowongan.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700">Tidak Ada Lowongan Ditemukan</h3>
                <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau pilih filter kategori yang berbeda.</p>
              </div>
            ) : (
              /* 3-Column Card Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLowongan.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectLowongan(item.id)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Company Logo Image Container */}
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
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs ${item.tipe === 'magang'
                              ? 'bg-purple-600 text-white'
                              : 'bg-emerald-600 text-white'
                              }`}
                          >
                            {item.tipe === 'magang' ? 'Magang' : 'Kerja'}
                          </span>
                        </div>
                      </div>

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

                        {/* Meta Footer: by Admin Website + Upload Date */}
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                          <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
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
          </div>
        )}




        {/* ─── BERITA TAB ──────────────────────────────────────────── */}
        {currentTab === 'berita' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" id="tab-berita">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Berita, Publikasi &amp; Tips Karir</h2>
              <p className="text-slate-500 text-sm mt-1">Informasi terkini mengenai agenda kampus, info bursa kerja, dan panduan karir alumni.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {publishedBerita.map(item => (
                <div key={item.id} onClick={() => onSelectBerita(item.slug)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col md:flex-row">
                  {item.coverImageUrl && (
                    <div className="md:w-2/5 aspect-[4/3] md:aspect-auto">
                      <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs text-[#10B981] font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Berita Kampus
                      </div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-[#10B981] transition-colors">{item.title}</h4>
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{item.excerpt}</p>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Admin CDC · {formatDateDisplay(item.createdAt)}</div>
                  </div>
                </div>
              ))}
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

        {/* ─── LAYANAN SUB-TABS ───────────────────────────────────── */}
        {['konseling', 'tes-minat', 'workshop', 'softskill', 'seminar', 'career-fair', 'campus-hiring', 'magang'].includes(currentTab) && (
          <LayananContainer currentTab={currentTab} setTab={setTab}>
            {currentTab === 'konseling' && <BimbinganKarir />}
            {currentTab === 'tes-minat' && <TesMinat />}
            {currentTab === 'workshop' && <Workshop />}
            {currentTab === 'softskill' && <Softskill />}
            {currentTab === 'seminar' && <Seminar />}
            {currentTab === 'career-fair' && <CareerFair />}
            {currentTab === 'campus-hiring' && <CampusHiring />}
            {currentTab === 'magang' && <Magang />}
          </LayananContainer>
        )}

      </main>


      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <Footer onSelectLowongan={onSelectLowongan} setTab={setTab} />
    </div>
  );
}
