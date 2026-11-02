/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DokumenAkreditasiView — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Card layout dokumen akreditasi program studi per fakultas
 * dengan identitas warna resmi CDC UM Kendari (Navy, Orange, Emerald).
 * 
 * Fitur:
 *   - Proteksi otentikasi (khusus civitas akademika & mitra login)
 *   - Stats strip (Total Fakultas & Total Program Studi)
 *   - Filter jenjang (S1, S2, D4, Profesi) & Status Akreditasi (Unggul, Baik Sekali, Baik)
 *   - Pencarian real-time nama prodi atau fakultas
 *   - Expand / Collapse accordion kartu fakultas
 *   - Modal Pratinjau SK Akreditasi & unduh PDF
 */

import React, { useState, useMemo, useEffect } from 'react';
import DokumenAkreditasiLogin from './DokumenAkreditasiLogin';
import { DokumenAkreditasi, User as UserType } from '../../types';
import { getFromDB, FAKULTAS_LOGO_MAP } from '../../data';
import {
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  FileText,
  Download,
  Lock,
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
  X,
  Eye,
  SlidersHorizontal,
  Zap
} from 'lucide-react';

interface DokumenAkreditasiViewProps {
  currentUser?: UserType | null;
  setTab: (tab: string) => void;
  onNavigateToLogin?: () => void;
  onLoginSuccess?: (user: UserType) => void;
}

export default function DokumenAkreditasiView({
  currentUser,
  setTab,
  onNavigateToLogin,
  onLoginSuccess
}: DokumenAkreditasiViewProps) {
  const [items, setItems] = useState<DokumenAkreditasi[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [expandedFaculties, setExpandedFaculties] = useState<Record<string, boolean>>({});
  const [selectedDoc, setSelectedDoc] = useState<DokumenAkreditasi | null>(null);
  const [devPreview, setDevPreview] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('cdc_akreditasi_preview_bypass') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const list = getFromDB<DokumenAkreditasi>('dokumen_akreditasi');
    setItems(list);

    // Buka semua fakultas secara default
    const initialExpanded: Record<string, boolean> = {};
    list.forEach((item) => {
      initialExpanded[item.fakultas] = true;
    });
    setExpandedFaculties(initialExpanded);
  }, []);

  // Filter items berdasarkan search query, jenjang, dan status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const qNorm = q.replace(/&/g, 'dan');
      const itemFakultasNorm = (item.fakultas || '').toLowerCase().replace(/&/g, 'dan');
      const itemProdiNorm = (item.prodi || '').toLowerCase().replace(/&/g, 'dan');

      const matchSearch =
        !q ||
        (item.prodi || '').toLowerCase().includes(q) ||
        itemProdiNorm.includes(qNorm) ||
        (item.fakultas || '').toLowerCase().includes(q) ||
        itemFakultasNorm.includes(qNorm) ||
        (item.nomorSk || '').toLowerCase().includes(q) ||
        (item.kodeFakultas || '').toLowerCase().includes(q) ||
        (q.includes('ekonomi') && itemFakultasNorm.includes('ekonomi')) ||
        (q.includes('hukum') && itemFakultasNorm.includes('hukum')) ||
        (q.includes('keguruan') && itemFakultasNorm.includes('keguruan'));

      const matchJenjang =
        selectedJenjang === 'semua' ||
        item.jenjang.toLowerCase() === selectedJenjang.toLowerCase();

      const matchStatus =
        selectedStatus === 'semua' ||
        item.statusAkreditasi.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchJenjang && matchStatus;
    });
  }, [items, searchQuery, selectedJenjang, selectedStatus]);

  // Kelompokkan per fakultas
  const groupedFaculties = useMemo(() => {
    const groups: Record<
      string,
      {
        kode: string;
        fakultas: string;
        website?: string;
        logoUrl?: string;
        prodiList: DokumenAkreditasi[];
      }
    > = {};

    filteredItems.forEach((item) => {
      // Normalisasi alias nama fakultas jika varian singkatan digunakan
      const normFakultas =
        item.fakultas === 'Fakultas Ekonomi'
          ? 'Fakultas Ekonomi dan Bisnis Islam'
          : item.fakultas === 'Fakultas Keguruan & Ilmu Pendidikan'
          ? 'Fakultas Keguruan dan Ilmu Pendidikan'
          : item.fakultas;

      if (!groups[normFakultas]) {
        const mappedLogo = FAKULTAS_LOGO_MAP[normFakultas] || FAKULTAS_LOGO_MAP[item.fakultas];
        const foundLogo =
          item.logoFakultasUrl && item.logoFakultasUrl !== '/logo-umk.png'
            ? item.logoFakultasUrl
            : mappedLogo || item.logoFakultasUrl || '/logo-umk.png';
        groups[normFakultas] = {
          kode: item.kodeFakultas || (normFakultas.includes('Ekonomi') ? 'FEBI' : normFakultas.includes('Keguruan') ? 'FKIP' : 'UMK'),
          fakultas: normFakultas,
          website: item.websiteFakultas || 'https://umkendari.ac.id/',
          logoUrl: foundLogo,
          prodiList: []
        };
      } else if (
        (!groups[normFakultas].logoUrl || groups[normFakultas].logoUrl === '/logo-umk.png') &&
        item.logoFakultasUrl &&
        item.logoFakultasUrl !== '/logo-umk.png'
      ) {
        groups[normFakultas].logoUrl = item.logoFakultasUrl;
      }
      groups[normFakultas].prodiList.push(item);
    });

    return Object.values(groups);
  }, [filteredItems]);

  // Toggle satu fakultas
  const toggleFaculty = (fakultas: string) => {
    setExpandedFaculties((prev) => ({
      ...prev,
      [fakultas]: !prev[fakultas]
    }));
  };

  // Toggle semua fakultas
  const toggleAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    items.forEach((item) => {
      updated[item.fakultas] = expand;
    });
    setExpandedFaculties(updated);
  };

  // Hitung metrik keseluruhan
  const totalFakultasCount = useMemo(() => {
    return new Set(items.map((i) => i.fakultas)).size;
  }, [items]);

  const totalProdiCount = items.length;
  const totalUnggulCount = items.filter(
    (i) => i.statusAkreditasi.toUpperCase() === 'UNGGUL'
  ).length;

  // Format label status akreditasi
  const formatStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UNGGUL':
        return 'Unggul';
      case 'BAIK_SEKALI':
        return 'Baik Sekali';
      case 'BAIK':
        return 'Baik';
      default:
        return status;
    }
  };

  // Helper badge warna status akreditasi dengan palet CDC
  const renderStatusBadge = (status: string) => {
    const upper = status.toUpperCase();
    if (upper === 'UNGGUL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold text-[11px] shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Unggul
        </span>
      );
    }
    if (upper === 'BAIK_SEKALI') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-sky-50 text-[#1E3A8A] border border-sky-300 font-bold text-[11px] shadow-2xs">
          Baik Sekali
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[11px]">
        {formatStatusLabel(status)}
      </span>
    );
  };

  // Jika belum login dan tidak sedang dalam mode preview desain, tampilkan login khusus
  if (!currentUser && !devPreview) {
    return (
      <DokumenAkreditasiLogin
        onLoginSuccess={(user) => {
          if (onLoginSuccess) {
            onLoginSuccess(user);
          }
        }}
        onBypassPreview={() => {
          try { sessionStorage.setItem('cdc_akreditasi_preview_bypass', 'true'); } catch {}
          setDevPreview(true);
        }}
        onNavigateHome={() => setTab('beranda')}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 pb-24" id="dokumen-akreditasi-root">
      {/* ── BANNER SEMENTARA AKSES CEPAT PREVIEW DESAIN ── */}
      {devPreview && !currentUser && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-4 py-2.5 text-xs font-bold shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2 z-30 sticky top-0 border-b border-amber-600/30">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-slate-950 text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
            </span>
            <span>
              <strong>Mode Preview Desain Aktif:</strong> Anda sedang melihat langsung tata letak Dokumen Akreditasi tanpa login. (Akses cepat sementara untuk meninjau desain).
            </span>
          </div>
          <button
            onClick={() => {
              try { sessionStorage.removeItem('cdc_akreditasi_preview_bypass'); } catch {}
              setDevPreview(false);
            }}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
          >
            Kembali ke Form Login
          </button>
        </div>
      )}

      {/* ── BREADCRUMB & SECURITY STRIP ── */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
          <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
            <button
              onClick={() => setTab('beranda')}
              className="hover:text-[#F26522] transition-colors font-semibold"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium">Tracer Study</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#000066] font-bold">Dokumen Akreditasi</span>
          </nav>

          {/* User Session Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Terverifikasi:{' '}
              <strong className="font-bold">
                {currentUser ? currentUser.name : 'Mode Pratinjau Desain'}
              </strong>{' '}
              ({(currentUser ? currentUser.role : 'PREVIEW').toUpperCase()})
            </span>
          </div>
        </div>
      </div>

      {/* ── HERO / TITLE SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-blue-100/70 text-[#000066]">
          <GraduationCap className="w-4 h-4 text-[#F26522]" />
          Universitas Muhammadiyah Kendari
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-[#000066] tracking-tight">
          PROGRAM SARJANA & PASCASARJANA
        </h1>
        {/* Decorative underline (CDC Orange) */}
        <div className="h-1.5 w-24 bg-[#F26522] rounded-full mx-auto" />
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Daftar Surat Keputusan (SK) Akreditasi Badan Akreditasi Nasional Perguruan Tinggi (BAN-PT) dan Lembaga Akreditasi Mandiri (LAM) Program Studi di lingkungan Universitas Muhammadiyah Kendari.
        </p>

        {/* ── COUNTER STATS (Identik dengan Gambar Referensi) ── */}
        <div className="pt-6 pb-2 flex items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#000066]">
              {totalFakultasCount}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Fakultas
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#000066]">
              {totalProdiCount}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Program Studi
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#10B981]">
              {totalUnggulCount}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Akreditasi Unggul
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari program studi atau fakultas..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filter Jenjang */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Jenjang:</span>
              <select
                value={selectedJenjang}
                onChange={(e) => setSelectedJenjang(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="semua">Semua Jenjang</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="D4">Sarjana Terapan (D4)</option>
                <option value="Profesi">Profesi</option>
              </select>
            </div>

            {/* Filter Status Akreditasi */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Akreditasi:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="semua">Semua Peringkat</option>
                <option value="UNGGUL">Unggul</option>
                <option value="BAIK_SEKALI">Baik Sekali</option>
                <option value="BAIK">Baik</option>
              </select>
            </div>

            {/* Accordion Expand/Collapse All */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-2">
              <button
                onClick={() => toggleAll(true)}
                className="px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition"
              >
                Buka Semua
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => toggleAll(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition"
              >
                Tutup Semua
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD GRID SECTION (Sesuai Layout Gambar, Warna CDC) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {groupedFaculties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-4">
            <Building className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              Tidak Ada Program Studi Ditemukan
            </h3>
            <p className="text-xs text-slate-500">
              Coba sesuaikan kata kunci pencarian atau reset filter di atas.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedJenjang('semua');
                setSelectedStatus('semua');
              }}
              className="px-4 py-2 bg-[#000066] text-white text-xs font-bold rounded-xl hover:bg-[#1E3A8A] transition cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {groupedFaculties.map((fac) => {
              const isExpanded = expandedFaculties[fac.fakultas] ?? true;
              const hasS2 = fac.prodiList.some((p) => p.jenjang === 'S2');

              return (
                <div
                  key={fac.fakultas}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* ── CARD HEADER (CDC Deep Navy Gradient) ── */}
                  <div
                    onClick={() => toggleFaculty(fac.fakultas)}
                    className="bg-gradient-to-r from-[#000066] via-[#1E3A8A] to-[#1E3A8A] text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {/* Faculty Code Badge (FT, FP, FPIK, dll) */}
                      <span className="w-9 h-7 rounded-md bg-white/20 text-white font-black text-xs flex items-center justify-center shrink-0 border border-white/20 tracking-wider">
                        {fac.kode}
                      </span>
                      {/* Faculty Title */}
                      <h2 className="font-bold text-sm sm:text-base text-white truncate tracking-tight">
                        {fac.fakultas}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Total Prodi Badge */}
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-100 font-bold text-xs border border-blue-300/30">
                        {fac.prodiList.length} Prodi
                      </span>
                      {hasS2 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#F26522] text-white font-extrabold text-[10px]">
                          S2
                        </span>
                      )}
                      {/* Accordion Toggle Icon */}
                      <div className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/90 transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── CARD BODY (Expanded Content) ── */}
                  {isExpanded && (
                    <div className="flex flex-col">
                      {/* ── RUANG GAMBAR LOGO FAKULTAS (DI TENGAH-TENGAH) ── */}
                      <div className="bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 p-5 border-b border-slate-100 flex flex-col items-center justify-center text-center relative group">
                        {/* Container Logo Box */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-xs border border-slate-200/90 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                          <img
                            src={fac.logoUrl || '/logo-umk.png'}
                            alt={`Logo ${fac.fakultas}`}
                            className="max-h-full max-w-full object-contain filter drop-shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo-umk.png';
                            }}
                          />
                        </div>

                        {/* Nama Fakultas & Tautan Website */}
                        <div className="mt-2.5 text-center">
                          <span className="text-xs font-black text-[#000066] tracking-tight block">
                            {fac.fakultas}
                          </span>
                          <a
                            href={fac.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A8A] hover:text-[#F26522] mt-0.5 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-[#1E3A8A] group-hover:text-[#F26522] transition-colors" />
                            <span>Kunjungi Website Fakultas</span>
                          </a>
                        </div>
                      </div>

                      {/* List of Study Programs */}
                      <div className="divide-y divide-slate-100">
                        {fac.prodiList.map((prodi) => (
                          <div
                            key={prodi.id}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group"
                          >
                            {/* Left: Indicator & Title */}
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#F26522] transition-colors shrink-0" />
                              <button
                                onClick={() => setSelectedDoc(prodi)}
                                className="text-left font-medium text-xs sm:text-sm text-slate-700 hover:text-[#000066] transition-colors truncate focus:outline-none cursor-pointer"
                                title={`Lihat SK ${prodi.prodi}`}
                              >
                                {prodi.prodi}
                              </button>
                            </div>

                            {/* Right: Jenjang, Status, & Action */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Jenjang Pill (S1, S2, D4) */}
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A] font-black text-[10px] border border-blue-200">
                                {prodi.jenjang}
                              </span>

                              {/* Status Akreditasi Pill */}
                              {renderStatusBadge(prodi.statusAkreditasi)}

                              {/* Action: View / Download Button */}
                              <button
                                onClick={() => setSelectedDoc(prodi)}
                                className="p-1 rounded-md text-slate-400 hover:text-[#000066] hover:bg-blue-50 transition cursor-pointer"
                                title="Lihat Detail SK & Dokumen PDF"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL PRATINJAU DOKUMEN SK AKREDITASI ── */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#000066] via-[#1E3A8A] to-[#1E3A8A] text-white p-5 sm:p-6 flex items-start justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/20 text-white font-bold text-xs">
                    {selectedDoc.jenjang}
                  </span>
                  <span className="text-blue-200 text-xs font-semibold">
                    {selectedDoc.fakultas}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {selectedDoc.prodi}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Info Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Status Akreditasi</div>
                  <div className="font-extrabold text-sm text-slate-800 mt-0.5">
                    {formatStatusLabel(selectedDoc.statusAkreditasi)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Lembaga</div>
                  <div className="font-bold text-sm text-[#000066] mt-0.5">
                    {selectedDoc.lembaga || 'BAN-PT'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Masa Berlaku</div>
                  <div className="font-bold text-sm text-slate-800 mt-0.5">
                    {selectedDoc.masaBerlaku || '-'}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/80">
                  <div className="text-slate-400 font-medium">Nomor Surat Keputusan (SK)</div>
                  <div className="font-mono font-bold text-xs sm:text-sm text-slate-800 mt-0.5">
                    {selectedDoc.nomorSk || 'Dalam proses penerbitan'}
                  </div>
                </div>
              </div>

              {/* PDF Preview Frame / Information */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 p-4 text-center space-y-3">
                <FileText className="w-12 h-12 text-[#1E3A8A] mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    Dokumen SK & Sertifikat Akreditasi Resmi
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Dokumen ini merupakan salinan digital resmi SK Akreditasi dari {selectedDoc.lembaga || 'BAN-PT'} yang terverifikasi di server Universitas Muhammadiyah Kendari.
                  </p>
                </div>

                {/* PDF Viewer Frame if data URL */}
                {selectedDoc.fileUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-300 shadow-inner h-64 bg-white">
                    <iframe
                      src={selectedDoc.fileUrl}
                      title={`SK Akreditasi ${selectedDoc.prodi}`}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
              {selectedDoc.fileUrl && (
                <a
                  href={selectedDoc.fileUrl}
                  download={`SK_Akreditasi_${selectedDoc.prodi.replace(/\s+/g, '_')}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#000066] hover:bg-[#1E3A8A] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Unduh Dokumen PDF
                </a>
              )}
              {selectedDoc.websiteFakultas && (
                <a
                  href={selectedDoc.websiteFakultas}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Website Fakultas
                </a>
              )}
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

