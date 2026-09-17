/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MouStakeholderView — Portal CDC UM Kendari
 * Tampilan publik MOU Dengan Stakeholder CDC UMK:
 *   - Breadcrumb: Beranda > MOU Dengan Stakeholder
 *   - Judul Utama: MOU Dengan Stakeholder
 *   - Social Share Bar dinamis (Facebook, Twitter/X, WhatsApp, Telegram, LinkedIn, Salin Tautan)
 *   - Viewer Utama: Mendukung 2 Tampilan (Poster Gambar atau PDF Preview Scrollable)
 *   - Daftar Link terkelompok per Kategori Stakeholder di bagian bawah
 */

import React, { useState, useEffect, useRef } from 'react';
import { MouStakeholder } from '../../types';
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
  Linkedin,
  Maximize2,
  X
} from 'lucide-react';

import SocialShareBar from '../ui/SocialShareBar';

interface MouStakeholderViewProps {
  setTab?: (tab: string) => void;
}

export default function MouStakeholderView({ setTab }: MouStakeholderViewProps) {
  const [items, setItems] = useState<MouStakeholder[]>([]);
  const [activeItem, setActiveItem] = useState<MouStakeholder | null>(null);
  const [zoomPoster, setZoomPoster] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = getFromDB<MouStakeholder>('mou_stakeholder');
    setItems(list);

    // Set default active item: featured item or first item
    const featured = list.find((m) => m.isFeatured) || list[0];
    if (featured) {
      setActiveItem(featured);
    }
  }, []);

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.kategori)));

  const handleSelectLink = (item: MouStakeholder) => {
    setActiveItem(item);
    if (viewerRef.current) {
      viewerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.click();
    }
  };

  const getShareTitle = () => {
    return activeItem ? `MOU Stakeholder: ${activeItem.judul}` : 'MOU Dengan Stakeholder CDC UM Kendari';
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 pb-20" id="mou-stakeholder-page">

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
          <span className="text-slate-600 font-semibold">MOU Dengan Stakeholder</span>
        </nav>
      </div>

      {/* ── MAIN TITLE ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          MOU Dengan Stakeholder
        </h1>
      </div>

      {/* ── DYNAMIC SOCIAL SHARE BAR ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <SocialShareBar title={getShareTitle()} />
      </div>

      {/* ── FEATURED CONTENT VIEWER BOX (POSTER VS PDF) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16" ref={viewerRef}>
        {activeItem ? (
          <div className="space-y-4">
            {/* Header Judul MOU */}
            <div className="text-center sm:text-left border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  {activeItem.judul}
                </h2>
              </div>

              {/* Action buttons (Unduh Gambar/PDF) */}
              {activeItem.displayType === 'poster' && activeItem.posterUrl ? (
                <button
                  onClick={() => handleDownloadFile(activeItem.posterUrl!, `${activeItem.judul.replace(/\s+/g, '_')}_poster.jpg`)}
                  className="inline-flex items-center gap-1.5 bg-[#F26522] hover:bg-[#d95316] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                  title="Unduh gambar poster ukuran besar"
                >
                  <Download className="w-4 h-4" /> Unduh Gambar
                </button>
              ) : activeItem.displayType === 'pdf' && activeItem.pdfUrl ? (
                <button
                  onClick={() => handleDownloadFile(activeItem.pdfUrl!, `${activeItem.judul.replace(/\s+/g, '_')}.pdf`)}
                  className="inline-flex items-center gap-1.5 bg-[#F26522] hover:bg-[#d95316] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition self-start sm:self-auto shrink-0 shadow-xs cursor-pointer"
                  title="Unduh berkas PDF"
                >
                  <Download className="w-4 h-4" /> Unduh PDF
                </button>
              ) : null}
            </div>

            {/* DYNAMIC VIEWER CONTENT CONTAINER */}
            {activeItem.displayType === 'poster' && activeItem.posterUrl ? (
              /* MODE 1: POSTER GAMBAR VIEW */
              <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-lg p-2 sm:p-4 text-center relative group">
                <img
                  src={activeItem.posterUrl}
                  alt={activeItem.judul}
                  title="Tekan/klik gambar untuk memperbesar poster"
                  className="max-h-[800px] w-auto mx-auto object-contain rounded-xl cursor-pointer hover:opacity-95 hover:scale-[1.005] transition duration-200"
                  onClick={() => setZoomPoster(activeItem.posterUrl || null)}
                />
              </div>
            ) : activeItem.displayType === 'pdf' && activeItem.pdfUrl ? (
              /* MODE 2: PDF PREVIEW SCROLLABLE VIEW */
              <div className="w-full h-[420px] sm:h-[750px] bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-lg relative group">
                <iframe
                  src={`${activeItem.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  title={activeItem.judul}
                  className="w-full h-full border-none"
                />
              </div>
            ) : activeItem.linkUrl ? (
              /* FALLBACK MODE: LINK EXTERNAL */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-sm">
                <FileText className="w-12 h-12 text-[#F26522] mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">{activeItem.judul}</h3>
                <a
                  href={activeItem.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#F26522] hover:bg-[#d95316] text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
                >
                  Buka Tautan MOU <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                Dokumen MOU tidak tersedia.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Belum ada MOU Dengan Stakeholder terdaftar.
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
                  <div key={item.id} className="group flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {item.displayType === 'poster' ? 'POSTER' : 'PDF'}
                    </span>
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

      {/* ── MODAL FULL-RES ZOOM POSTER ── */}
      {zoomPoster && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomPoster(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <button
              onClick={() => setZoomPoster(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold flex items-center gap-1"
            >
              <X className="w-6 h-6" /> Tutup
            </button>
            <img
              src={zoomPoster}
              alt="Poster Zoom"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
