import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Tag,
  Clock,
  User,
  Facebook,
  MessageCircle,
  Linkedin,
  Award,
  Calendar,
  GraduationCap,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { KontenKarir } from '../types';
import Header from './Header';
import { Footer } from './Footer';
import { renderContentMarkdown } from '../markdown';
import { WhatsAppWaIcon } from './ui/SocialShareBar';
import {
  shareToFacebook,
  shareToTwitter,
  shareToWhatsApp,
  shareToTelegram,
  shareToLinkedIn
} from '../utils/shareUtils';

interface PrestasiDetailViewProps {
  prestasi: KontenKarir;
  allPrestasiList?: KontenKarir[];
  onSelectPrestasi?: (item: KontenKarir) => void;
  onBack: () => void;
  setTab?: (tab: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
  onSelectLowongan?: (id: string) => void;
  onSelectBerita?: (slug: string) => void;
  onSelectProgram?: (id: string) => void;
  onSelectEvent?: (id: string) => void;
}

export default function PrestasiDetailView({
  prestasi,
  allPrestasiList,
  onSelectPrestasi,
  onBack,
  setTab,
  onNavigateToLogin,
  onNavigateToRegister,
  onSelectLowongan,
  onSelectBerita,
  onSelectProgram,
  onSelectEvent,
}: PrestasiDetailViewProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Komputasi Prestasi Terkait (Maksimal 3 Card berdasarkan relevansi ketat Sub-Menu yang sedang dibuka)
  const relatedPrestasiList = useMemo(() => {
    if (!allPrestasiList || allPrestasiList.length === 0) return [];

    const candidatePrestasi = allPrestasiList.filter((p) => p.id !== prestasi.id);
    if (candidatePrestasi.length === 0) return [];

    const currentScope = (prestasi.kategori || 'internasional').toLowerCase();
    const currentSub = (prestasi.subKategori || 'akademik').toLowerCase();

    // Prioritas 1: Pencocokan persis sub-menu (kategori DAN subKategori)
    const exactMatches = candidatePrestasi.filter((p) => {
      const pScope = (p.kategori || 'internasional').toLowerCase();
      const pSub = (p.subKategori || 'akademik').toLowerCase();
      return pScope === currentScope && pSub === currentSub;
    });

    exactMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (exactMatches.length >= 3) {
      return exactMatches.slice(0, 3);
    }

    // Prioritas 2: Pencocokan scope kategori jika kurang dari 3
    const scopeMatches = candidatePrestasi.filter((p) => {
      const pScope = (p.kategori || 'internasional').toLowerCase();
      return pScope === currentScope && !exactMatches.some(e => e.id === p.id);
    });

    scopeMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const combined = [...exactMatches, ...scopeMatches];
    if (combined.length >= 3) {
      return combined.slice(0, 3);
    }

    // Prioritas 3: Pelengkap tambahan dari kandidat lainnya
    const remaining = candidatePrestasi.filter((p) => !combined.some(c => c.id === p.id));
    remaining.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return [...combined, ...remaining].slice(0, 3);
  }, [allPrestasiList, prestasi]);

  const formatDateDisplayFull = (dateStr?: string) => {
    if (!dateStr) return '12 Agustus 2026, 13.15';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '12 Agustus 2026, 13.15';
      const formattedDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${formattedDate}, ${hours}.${mins}`;
    } catch {
      return '12 Agustus 2026, 13.15';
    }
  };

  const getShareOpts = () => ({
    type: 'prestasi' as const,
    title: prestasi.judul,
    namaMahasiswa: prestasi.namaMahasiswa,
    prodi: prestasi.prodi,
    peringkat: prestasi.peringkat,
    tahun: prestasi.tahun,
    url: typeof window !== 'undefined' ? window.location.href : ''
  });

  const handleShareFacebook = () => {
    shareToFacebook(getShareOpts());
  };

  const handleShareX = () => {
    shareToTwitter(getShareOpts());
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(getShareOpts());
  };

  const handleShareTelegram = () => {
    shareToTelegram(getShareOpts());
  };

  const handleShareLinkedIn = () => {
    shareToLinkedIn(getShareOpts(), (msg) => showToast(msg));
  };

  const authorName = (!prestasi.createdByName || prestasi.createdByName.toLowerCase().includes('admin'))
    ? 'Admin Website'
    : prestasi.createdByName;

  const targetTab = useMemo(() => {
    const k = (prestasi.kategori || '').toLowerCase();
    const sk = (prestasi.subKategori || '').toLowerCase();

    if (k === 'olahraga' || sk === 'olahraga') return 'presentasi-olahraga';
    if (k === 'seni' || sk === 'seni') return 'presentasi-seni';

    const scope = k || 'internasional';
    const sub = sk || 'akademik';
    return `presentasi-${scope}-${sub}`;
  }, [prestasi.kategori, prestasi.subKategori]);

  const breadcrumbCategoryLabel = useMemo(() => {
    const k = (prestasi.kategori || '').toLowerCase();
    const sk = (prestasi.subKategori || '').toLowerCase();

    if (k === 'olahraga' || sk === 'olahraga') return 'Prestasi Olahraga';
    if (k === 'seni' || sk === 'seni') return 'Prestasi Seni';

    const scopeUpper = (prestasi.kategori || 'internasional').toUpperCase();
    const subDisplay = ({ akademik: 'Akademik', 'non-akademik': 'Non-Akademik' } as Record<string, string>)[sk] || 'Akademik';
    return `Prestasi ${scopeUpper} (${subDisplay})`;
  }, [prestasi.kategori, prestasi.subKategori]);

  const scopeDisplay = (prestasi.kategori || 'internasional').toUpperCase();
  const subCategoryDisplay = ({ akademik: 'Akademik', 'non-akademik': 'Non-Akademik', olahraga: 'Olahraga', seni: 'Seni' } as Record<string, string>)[(prestasi.subKategori || 'akademik').toLowerCase()] || 'Akademik';

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-slate-800" id="prestasi-detail-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-5 z-50 bg-[#1E3A8A] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-800 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-semibold max-w-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Global Header */}
      <Header
        currentTab={targetTab}
        setTab={setTab || (() => {})}
        onNavigateToLogin={onNavigateToLogin || (() => {})}
        onNavigateToRegister={onNavigateToRegister}
      />

      {/* Main Body */}
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Top Navigation Back Button */}
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[#0077C6] hover:text-[#1E3A8A] font-bold text-xs sm:text-sm transition group cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Daftar Prestasi</span>
            </button>
          </div>

          {/* Main Grid: Left Floating Share Bar + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

            {/* STICKY FLOATING SHARE SIDEBAR (DESKTOP - SISI KIRI) */}
            <aside className="hidden lg:flex lg:col-span-1 flex-col items-center gap-3 sticky top-28 self-start pt-2">
              <button
                onClick={handleShareFacebook}
                className="w-10 h-10 rounded-xl bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke Facebook"
              >
                <Facebook className="w-5 h-5 fill-white" />
              </button>
              <button
                onClick={handleShareX}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke X"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="w-10 h-10 rounded-xl bg-[#25d366] hover:bg-[#1ebd56] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke WhatsApp"
              >
                <WhatsAppWaIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleShareTelegram}
                className="w-10 h-10 rounded-xl bg-[#229ED9] hover:bg-[#1d87ba] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke Telegram"
              >
                <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="w-10 h-10 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke LinkedIn"
              >
                <Linkedin className="w-5 h-5 fill-white text-transparent" />
              </button>
            </aside>

            {/* MAIN ARTICLE CONTENT (lg:col-span-11) */}
            <div className="lg:col-span-11 space-y-6">

              {/* BREADCRUMB BAR */}
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap" aria-label="Breadcrumb">
                <span className="hover:text-[#0077C6] cursor-pointer" onClick={() => setTab && setTab('beranda')}>Beranda</span>
                <span>&gt;</span>
                <span
                  className="hover:text-[#0077C6] cursor-pointer"
                  onClick={() => setTab && setTab(targetTab)}
                >
                  {breadcrumbCategoryLabel}
                </span>
                <span>&gt;</span>
                <span className="text-[#0077C6] font-semibold line-clamp-1 max-w-md">{prestasi.judul}</span>
              </nav>

              {/* ARTICLE MAIN TITLE */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {prestasi.judul}
              </h1>

              {/* METADATA STRIP WITH GOLD ICONS */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium pt-1 pb-3 border-b border-slate-100">
                {/* Achievement Badge */}
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-amber-700">{prestasi.peringkat || 'Prestasi Unggulan'}</span>
                </div>

                {/* Scope & Kategori */}
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Tingkat {scopeDisplay} ({subCategoryDisplay})</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{formatDateDisplayFull(prestasi.createdAt)}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Oleh: <strong className="font-bold text-slate-800">{authorName}</strong></span>
                </div>
              </div>

              {/* HIGHLIGHT CARD INFORMATION: MAHASISWA & PRODI (PRESISI SESUAI GAMBAR ACUAN) */}
              <div className="bg-slate-50/70 rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="text-[#1B365D] font-extrabold text-sm sm:text-base uppercase tracking-wider border-b border-slate-200/80 pb-3">
                  DETAIL INFORMASI CAPAIAN PRESTASI MAHASISWA
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                  {/* 1. Nama Mahasiswa / Tim */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                    <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0077C6]" /> NAMA MAHASISWA / TIM
                    </div>
                    <div className="font-extrabold text-slate-900 leading-snug text-sm sm:text-base">
                      {prestasi.namaMahasiswa || 'Tim Inovator UMK'}
                    </div>
                  </div>

                  {/* 2. Program Studi / Fakultas */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                    <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#0077C6]" /> PROGRAM STUDI / FAKULTAS
                    </div>
                    <div className="font-extrabold text-slate-900 leading-snug text-sm sm:text-base">
                      {prestasi.prodi || 'UM Kendari'}
                    </div>
                  </div>

                  {/* 3. Peringkat / Medali */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                    <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" /> PERINGKAT / MEDALI
                    </div>
                    <div className="font-extrabold text-[#C2410C] leading-snug text-sm sm:text-base">
                      {prestasi.peringkat || 'Juara 1'}
                    </div>
                  </div>

                  {/* 4. Tahun Capaian */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                    <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0077C6]" /> TAHUN CAPAIAN
                    </div>
                    <div className="font-extrabold text-slate-900 leading-snug text-sm sm:text-base">
                      {prestasi.tahun || '2026'}
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURED MAIN COVER IMAGE (DOKUMENTASI DENGAN RASTER SHADOW SLATE) */}
              {prestasi.thumbnail ? (
                <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-sm relative group">
                  <img
                    src={prestasi.thumbnail}
                    alt={prestasi.judul}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Award className="w-12 h-12 text-amber-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Dokumentasi Foto Prestasi</span>
                </div>
              )}

              {/* ARTICLE BODY & RICH TEXT FORMATTING */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6 pt-2">
                <div className="space-y-4 text-slate-700 leading-relaxed font-normal">
                  {renderContentMarkdown(prestasi.body || 'Detail rincian capaian prestasi mahasiswa Universitas Muhammadiyah Kendari.')}
                </div>
              </div>

              {/* SECTION PRESTASI TERKAIT (3 CARD LAYOUT BERDAMPINGAN) */}
              {relatedPrestasiList.length > 0 && (
                <div className="pt-8 border-t border-slate-200/80 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-5 bg-[#0077C6] rounded-full inline-block" />
                      Capaian Prestasi Lainnya
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {relatedPrestasiList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onSelectPrestasi) {
                            onSelectPrestasi(item);
                            window.scrollTo(0, 0);
                          }
                        }}
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition duration-300 flex flex-col cursor-pointer hover:border-amber-400"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.thumbnail || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop'}
                            alt={item.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase">
                            {item.peringkat || 'Prestasi'}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0077C6] transition line-clamp-2 leading-snug">
                            {item.judul}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-auto">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#EBA300]" />
                              {item.tahun || '2026'}
                            </span>
                            <span className="font-semibold text-slate-600 truncate max-w-[110px]">
                              {item.namaMahasiswa || 'UMK'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTTOM HORIZONTAL SOCIAL SHARE BAR */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100">
                <button
                  onClick={handleShareFacebook}
                  className="w-12 h-10 rounded-xl bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke Facebook"
                >
                  <Facebook className="w-5 h-5 fill-white" />
                </button>
                <button
                  onClick={handleShareX}
                  className="w-12 h-10 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke X"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-12 h-10 rounded-xl bg-[#25d366] hover:bg-[#1ebd56] text-white flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke WhatsApp"
                >
                  <WhatsAppWaIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShareTelegram}
                  className="w-12 h-10 rounded-xl bg-[#229ED9] hover:bg-[#1d87ba] text-white flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke Telegram"
                >
                  <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  className="w-12 h-10 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke LinkedIn"
                >
                  <Linkedin className="w-5 h-5 fill-white text-transparent" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* 2. Global Footer */}
      <Footer
        onSelectLowongan={onSelectLowongan}
        onSelectBerita={onSelectBerita}
        onSelectProgram={onSelectProgram}
        onSelectPrestasi={(p) => {
          if (onSelectPrestasi) onSelectPrestasi(p);
          else onBack();
        }}
        onSelectEvent={onSelectEvent}
        setTab={setTab}
      />
    </div>
  );
}
