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
import { motion } from 'motion/react';
import Header from './Header';
import CaraPasang from './layanan/CaraPasang';
import Keanggotaan from './layanan/Keanggotaan';
import BimbinganKarir from './layanan/BimbinganKarir';
import TesMinat from './layanan/TesMinat';
import Workshop from './layanan/Workshop';
import Softskill from './layanan/Softskill';
import Seminar from './layanan/Seminar';
import BursaKerja from './layanan/BursaKerja';
import CareerFair from './layanan/CareerFair';
import ExitSurvey from './layanan/ExitSurvey';
import JobPlacement from './layanan/JobPlacement';
import LayananContainer from './layanan/LayananContainer';
import HeroSlider from './HeroSlider';

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

  /* Data helpers */
  const publishedLowongan = lowongan.filter(l => l.status === 'published');
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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-800" id="pub-root">

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
            <section id="job-search-engine" className="py-14 bg-[#F9FAFB]">
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
                    Powered by <span className="font-extrabold text-[#1E3A8A]">prosple</span> &amp; CDC UM Kendari
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
                      placeholder="Mesin Pencari Lowongan Kerja Terkini..."
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
                      className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${filterType === f
                        ? f === 'all'
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md'
                          : f === 'kerja'
                            ? 'bg-[#10B981] text-white border-[#10B981] shadow-md'
                            : 'bg-violet-600 text-white border-violet-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                    >
                      {f === 'all' ? 'Semua Lowongan' : f === 'kerja' ? 'Kerja' : 'Magang'}
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-medium ml-2">
                    {filteredLowongan.length} lowongan tersedia
                  </span>
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
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                      <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <div className="font-bold text-slate-600">Belum ada lowongan tersedia</div>
                      <div className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau hapus filter</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredLowongan.slice(0, 6).map(loker => (
                        <motion.div
                          key={loker.id}
                          whileHover={{ y: -4, boxShadow: '0 12px 40px -8px rgba(30,58,138,0.15)' }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          onClick={() => onSelectLowongan(loker.id)}
                          className="bg-white rounded-2xl border border-slate-200 p-5
                                     shadow-sm cursor-pointer flex flex-col justify-between group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide ${loker.tipe === 'magang'
                                ? 'bg-violet-50 text-violet-700 border border-violet-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}>
                                {loker.tipe === 'magang' ? 'Magang' : 'Kerja'}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {loker.deadline}
                              </span>
                            </div>

                            <div className="flex items-start gap-3 pt-1">
                              <img
                                src={loker.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'}
                                alt={loker.namaInstansi}
                                className="w-12 h-12 rounded-xl border border-slate-200/80 shadow-xs object-cover shrink-0 bg-slate-50"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                                  {loker.judul}
                                </h4>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium mt-1 line-clamp-1">
                                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{loker.namaInstansi}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {loker.lokasi}
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                              {loker.deskripsi}
                            </p>
                          </div>
                          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">by Admin Website</span>
                            <span className="text-[10px] font-bold text-[#1E3A8A] flex items-center gap-1
                                             group-hover:gap-2 transition-all">
                              Detail <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
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
                              Admin CDC · {new Date(item.createdAt).toLocaleDateString('id-ID')}
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
                          src={loker.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'}
                          alt={loker.namaInstansi}
                          className="w-10 h-10 rounded-xl border border-slate-200/80 shadow-2xs object-cover shrink-0 mt-0.5 bg-slate-50"
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
                <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                  <h4 className="font-extrabold text-sm text-[#1E3A8A] uppercase tracking-wider">Layanan Cepat</h4>
                  {[
                    { label: 'Konseling Karier', tab: 'konseling' },
                    { label: 'CV Review', tab: 'cv-review' },
                    { label: 'Mock Interview', tab: 'mock-interview' },
                    { label: 'Tes Minat Bakat', tab: 'tes-minat' },
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
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-10" id="tab-profil">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Profil Career Development Center</h2>
              <div className="text-[#10B981] font-bold text-sm">Universitas Muhammadiyah Kendari</div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6 text-slate-600 text-sm leading-relaxed">
              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Tentang CDC</h3>
              <p>Career Development Center (CDC) Universitas Muhammadiyah Kendari adalah unit kerja penjamin mutu yang didirikan untuk menjalin kerja sama profesional, mendampingi pengembangan karir mahasiswa sejak dini, serta menjejaki kualitas kerja para alumni.</p>
              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Visi Utama</h3>
              <p className="italic bg-slate-50 p-4 rounded-2xl text-slate-700 font-medium">
                "Menjadi pusat bimbingan karir, integrasi magang, dan tracer studi alumni terpadu berbasis moral islami yang unggul dan diakui secara nasional pada tahun 2028."
              </p>
              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Misi Unggulan</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Menyelenggarakan pelatihan kesiapan kerja dan bimbingan konseling karir mahasiswa secara berkala.</li>
                <li>Membangun kemitraan strategis dengan BUMN, lembaga swasta, kementerian, dan startup terpercaya daerah.</li>
                <li>Menjalankan survei berkala Tracer Study alumni sebagai instrumen vital akreditasi program studi.</li>
                <li>Memfasilitasi penempatan magang terstruktur yang diakui penuh secara akademis.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ─── MAGANG TAB ──────────────────────────────────────────── */}
        {currentTab === 'magang' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-10" id="tab-magang">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Sistem & Alur Informasi Magang</h2>
              <p className="text-slate-500 text-sm">Alur administrasi pengajuan magang di Universitas Muhammadiyah Kendari</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Persyaratan Umum</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
                  <li>Mahasiswa aktif Universitas Muhammadiyah Kendari</li>
                  <li>Telah menempuh minimal 90 SKS</li>
                  <li>Mendapatkan surat pengantar tanda tangan Dekanat Fakultas</li>
                  <li>Melampirkan CV dan Transkrip Nilai Sementara</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-[#10B981] pl-3">Langkah Pengajuan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { n: '1', t: 'Pilih Lowongan', d: 'Pilih lowongan magang mitra di daftar menu Portal CDC.' },
                    { n: '2', t: 'Lengkapi & Upload', d: 'Isi form pengajuan magang dan upload surat pengantar dekan & CV.' },
                    { n: '3', t: 'Approval Admin', d: 'Operator CDC serta HRD Mitra memverifikasi berkas lamaran Anda.' },
                  ].map(s => (
                    <div key={s.n} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-[#10B981] text-white font-bold text-xs flex items-center justify-center">{s.n}</div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.t}</h4>
                      <p className="text-slate-500 text-xs">{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ─── LOWONGAN TAB ────────────────────────────────────────── */}
        {currentTab === 'lowongan' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" id="tab-lowongan">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Daftar Lowongan Kerja &amp; Magang</h2>
                <p className="text-slate-500 text-sm mt-1">Cari peluang karir terbaik hasil jalinan kerja sama Universitas Muhammadiyah Kendari</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
                {(['all', 'magang', 'kerja'] as const).map(f => (
                  <button key={f} onClick={() => setFilterType(f)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === f
                      ? f === 'all' ? 'bg-[#1E3A8A] text-white' : f === 'magang' ? 'bg-violet-600 text-white' : 'bg-[#10B981] text-white'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}>
                    {f === 'all' ? 'Semua' : f === 'magang' ? 'Magang' : 'Kerja'}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci, instansi, atau lokasi..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981]" />
            </div>
            {filteredLowongan.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-600">Tidak Ada Lowongan</h3>
                <p className="text-slate-400 text-sm">Tidak dapat menemukan lowongan dengan kata kunci "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLowongan.map(item => (
                  <div key={item.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between cursor-pointer group"
                    onClick={() => onSelectLowongan(item.id)}>
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${item.tipe === 'magang' ? 'bg-violet-50 text-violet-700 border border-violet-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>{item.tipe === 'magang' ? 'Magang' : 'Kerja'}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-rose-500" /> {item.deadline}</span>
                      </div>

                      <div className="flex items-start gap-3.5 pt-1">
                        <img
                          src={item.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'}
                          alt={item.namaInstansi}
                          className="w-14 h-14 rounded-2xl border border-slate-200 shadow-sm object-cover shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-slate-900 text-base line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">{item.judul}</h4>
                          <div className="text-slate-600 font-bold text-xs flex items-center gap-1.5 mt-1 text-emerald-700"><Building2 className="w-4 h-4 text-emerald-600 shrink-0" /> <span className="truncate">{item.namaInstansi}</span></div>
                        </div>
                      </div>

                      <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium pt-1"><MapPin className="w-4 h-4 text-rose-500 shrink-0" /> {item.lokasi}</div>
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">{item.deskripsi}</p>
                    </div>
                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-5">
                      {item.kuota ? <div className="text-xs text-slate-500">Kuota: <span className="font-extrabold text-slate-800">{item.kuota} Orang</span></div> : <div />}
                      <button className="bg-slate-50 group-hover:bg-[#10B981] group-hover:text-white text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto shadow-2xs group-hover:shadow-md">
                        Detail &amp; Daftar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
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
                    <div className="text-xs text-slate-400 font-medium">Admin CDC · {new Date(item.createdAt).toLocaleDateString('id-ID')}</div>
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
        {['cara-pasang', 'keanggotaan', 'konseling', 'tes-minat', 'workshop', 'softskill', 'seminar', 'bursa-kerja', 'career-fair', 'exit-survey', 'job-placement'].includes(currentTab) && (
          <LayananContainer currentTab={currentTab} setTab={setTab}>
            {currentTab === 'cara-pasang' && <CaraPasang />}
            {currentTab === 'keanggotaan' && <Keanggotaan />}
            {currentTab === 'konseling' && <BimbinganKarir />}
            {currentTab === 'tes-minat' && <TesMinat />}
            {currentTab === 'workshop' && <Workshop />}
            {currentTab === 'softskill' && <Softskill />}
            {currentTab === 'seminar' && <Seminar />}
            {currentTab === 'bursa-kerja' && <BursaKerja />}
            {currentTab === 'career-fair' && <CareerFair />}
            {currentTab === 'exit-survey' && <ExitSurvey />}
            {currentTab === 'job-placement' && <JobPlacement />}
          </LayananContainer>
        )}

      </main>


      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#0F1F4B] text-slate-400 pt-16 pb-8" id="pub-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

            {/* Brand col */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center">
                <img
                  src="/logo-cdc-branding-light.png"
                  alt="CDC Career Development Center Universitas Muhammadiyah Kendari"
                  className="h-20 md:h-24 lg:h-28 w-auto object-contain"
                />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Pusat Pengembangan Karir dan Alumni, Universitas Muhammadiyah Kendari.
                Berkomitmen menjembatani lulusan dengan dunia kerja profesional.
              </p>

              {/* CDC Club mini-badge */}
              <div className="flex items-center gap-3 bg-rose-900/30 border border-rose-800/40
                              rounded-xl px-4 py-3">
                <div className="bg-rose-600 p-2 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-extrabold text-xs">CDC UM KENDARI CLUB</div>
                  <div className="text-rose-400 text-[10px]">Komunitas alumni aktif & berkembang</div>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex gap-3">
                {[
                  { icon: Facebook, color: 'hover:bg-blue-600' },
                  { icon: Instagram, color: 'hover:bg-pink-600' },
                  { icon: Youtube, color: 'hover:bg-red-600' },
                  { icon: Globe, color: 'hover:bg-[#10B981]' },
                ].map(({ icon: Icon, color }, i) => (
                  <a key={i} href="#"
                    className={`bg-slate-800 p-2.5 rounded-full ${color} hover:text-white transition-colors`}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Popular Info col */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 uppercase tracking-wider">
                Popular Info
              </h4>
              <ul className="space-y-2.5 text-sm">
                {POPULAR_LINKS.slice(0, 5).map(link => (
                  <li key={link}>
                    <button
                      onClick={() => setTab('lowongan')}
                      className="hover:text-[#10B981] transition-colors flex items-start gap-2 text-left"
                    >
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#10B981]" />
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact col */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 uppercase tracking-wider">
                Hubungi Kami
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Jl. K.H. Ahmad Dahlan No. 10, Kendari, Sulawesi Tenggara</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#10B981] shrink-0" />
                  <span>0852-4100-9988</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#10B981] shrink-0" />
                  <span>cdc@umkendari.ac.id</span>
                </li>
              </ul>

              {/* Info Terkini mini */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-extrabold text-white uppercase tracking-wider">Info Terkini</div>
                {publishedLowongan.slice(0, 3).map(l => (
                  <button key={l.id} onClick={() => onSelectLowongan(l.id)}
                    className="w-full text-left text-xs hover:text-[#10B981] transition-colors flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-[#10B981]" />
                    <span className="line-clamp-1">{l.judul}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} Portal CDC Universitas Muhammadiyah Kendari. All rights reserved.</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
