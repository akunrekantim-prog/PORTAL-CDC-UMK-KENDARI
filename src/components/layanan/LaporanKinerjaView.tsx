/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LaporanKinerjaView — Portal CDC UM Kendari
 * Tampilan publik Laporan Kinerja & Tracer Study CDC UMK:
 *   - Breadcrumb: Beranda > Laporan Kinerja CDC UMK
 *   - Judul Utama: Laporan Kinerja CDC UMK
 *   - Social Share Bar dinamis (Facebook, Twitter/X, WhatsApp, Telegram, LinkedIn, Salin Tautan)
 *   - Frame Preview PDF scrollable teratas
 *   - Daftar Link terkelompok per Kategori di bagian bawah (Laporan Kinerja & Tracer Study)
 */

import React, { useState, useEffect, useRef } from 'react';
import { LaporanKinerja } from '../../types';
import { getFromDB } from '../../data';
import {
  Facebook,
  Share2,
  ExternalLink,
  FileText,
  Download,
  ChevronRight,
  CheckCircle,
  Copy,
  MessageCircle,
  Send,
  Linkedin
} from 'lucide-react';

import SocialShareBar from '../ui/SocialShareBar';

interface LaporanKinerjaViewProps {
  setTab?: (tab: string) => void;
}

export default function LaporanKinerjaView({ setTab }: LaporanKinerjaViewProps) {
  const [items, setItems] = useState<LaporanKinerja[]>([]);
  const [activeItem, setActiveItem] = useState<LaporanKinerja | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = getFromDB<LaporanKinerja>('laporan_kinerja');
    setItems(list);

    // Set default active item: featured item or first pdf item
    const featured = list.find((sk) => sk.isFeatured) || list.find((sk) => sk.tipe === 'pdf') || list[0];
    if (featured) {
      setActiveItem(featured);
    }
  }, []);

  // Listen to storage changes from other tabs (e.g. admin saving data)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cdc_umk_laporan_kinerja' && e.newValue) {
        try {
          const updatedList = JSON.parse(e.newValue) as LaporanKinerja[];
          if (Array.isArray(updatedList)) {
            setItems(updatedList);
            // Update active item: prefer featured, then first pdf
            const featured = updatedList.find((sk) => sk.isFeatured) || updatedList.find((sk) => sk.tipe === 'pdf') || updatedList[0];
            if (featured) {
              setActiveItem(featured);
            } else {
              setActiveItem(null);
            }
          }
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Same-tab refresh: when user switches back to this tab (e.g., after saving from admin view)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const list = getFromDB<LaporanKinerja>('laporan_kinerja');
        setItems(list);
        const featured = list.find((sk) => sk.isFeatured) || list.find((sk) => sk.tipe === 'pdf') || list[0];
        setActiveItem(featured || null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.kategori)));

  const handleSelectLink = (item: LaporanKinerja) => {
    if (item.tipe === 'link' && item.linkUrl) {
      window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveItem(item);
      // Smooth scroll up to PDF viewer
      if (viewerRef.current) {
        viewerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getShareTitle = () => {
    return activeItem ? `Laporan Kinerja: ${activeItem.judul}` : 'Laporan Kinerja CDC UM Kendari';
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 pb-20" id="laporan-kinerja-page">

      {/* ── BREADCRUMB ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            onClick={() => setTab && setTab('beranda')}
            className="hover:text-[#F26522] transition-colors font-semibold"
          >
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 font-semibold">Laporan Kinerja CDC UMK</span>
        </nav>
      </div>

      {/* ── MAIN TITLE ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Laporan Kinerja &amp; Tracer Study CDC UMK
        </h1>
      </div>

      {/* ── DYNAMIC SOCIAL SHARE BAR ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <SocialShareBar title={getShareTitle()} />
      </div>

      {/* ── FEATURED DOCUMENT & PDF VIEWER BOX ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16" ref={viewerRef}>
        {activeItem ? (
          <div className="space-y-4">
            {/* Active Document Subtitle / Header */}
            <div className="text-center sm:text-left border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {activeItem.judul}
              </h2>
              {activeItem.tipe === 'pdf' && activeItem.pdfUrl && (
                <a
                  href={activeItem.pdfUrl}
                  download={`${activeItem.judul.replace(/\s+/g, '_')}.pdf`}
                  className="inline-flex items-center gap-1.5 bg-[#F26522] hover:bg-[#d95316] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <Download className="w-4 h-4" /> Unduh PDF
                </a>
              )}
            </div>

            {/* Embedded PDF Preview Box */}
            {activeItem.tipe === 'pdf' && activeItem.pdfUrl ? (
              <div className="w-full h-[420px] sm:h-[750px] bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-lg relative group">
                <iframe
                  src={`${activeItem.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  title={activeItem.judul}
                  className="w-full h-full border-none"
                />
              </div>
            ) : activeItem.tipe === 'link' && activeItem.linkUrl ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-sm">
                <FileText className="w-12 h-12 text-[#F26522] mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">{activeItem.judul}</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Dokumen laporan ini dikonfigurasi sebagai tautan eksternal resmi. Klik tombol di bawah ini untuk menuju ke tautan terkait.
                </p>
                <a
                  href={activeItem.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#F26522] hover:bg-[#d95316] text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
                >
                  Buka Tautan Laporan <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                Dokumen tidak tersedia.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Belum ada Laporan Kinerja terdaftar.
          </div>
        )}
      </div>

      {/* ── CATEGORIZED LINKS SECTION (BOTTOM LIST) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {categories.map((category) => {
          const categoryItems = items.filter((i) => i.kategori === category);
          return (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight border-b-2 border-slate-100 pb-2">
                {category}
              </h3>

              {/* Items List */}
              <div className="space-y-2.5 pt-1">
                {categoryItems.map((item) => (
                  <div key={item.id} className="group">
                    <button
                      onClick={() => handleSelectLink(item)}
                      className="text-left text-[#F26522] hover:text-[#d95316] font-normal text-lg sm:text-xl transition-colors leading-relaxed block hover:underline focus:outline-none"
                    >
                      {item.judul}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
