/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GaleriView — Portal CDC UM Kendari
 * Tampilan publik Galeri Kegiatan CDC UMK:
 *   - Breadcrumb: Beranda > Galeri
 *   - Judul Utama: Galeri
 *   - Social Share Bar dinamis (Facebook, Twitter/X, WhatsApp, Telegram, LinkedIn, Salin Tautan)
 *   - 3 Media Tampilan (Player Video Youtube, Poster Gambar Zoomable, & File PDF / Link)
 *   - Pengelompokan Seksi Kategori Kegiatan
 */

import React, { useState, useEffect } from 'react';
import { GaleriItem } from '../../types';
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
  X,
  Play,
  Film
} from 'lucide-react';
import SocialShareBar from '../ui/SocialShareBar';

interface GaleriViewProps {
  setTab?: (tab: string) => void;
}

// Helper to convert Youtube URL into Embed ID
function getYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  let videoId = '';
  try {
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
  } catch (e) {
    return null;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default function GaleriView({ setTab }: GaleriViewProps) {
  const [items, setItems] = useState<GaleriItem[]>([]);
  const [zoomPoster, setZoomPoster] = useState<string | null>(null);

  useEffect(() => {
    const list = getFromDB<GaleriItem>('galeri_items');
    setItems(list);
  }, []);

  // Group items by kategoriSection
  const sections = Array.from(new Set(items.map((i) => i.kategoriSection)));

  const getShareTitle = () => 'Galeri Kegiatan CDC UM Kendari';

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 pb-20" id="galeri-kegiatan-page">
      
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
          <span className="text-slate-600 font-semibold">Galeri</span>
        </nav>
      </div>

      {/* ── MAIN TITLE ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Galeri
        </h1>
      </div>

      {/* ── DYNAMIC SOCIAL SHARE BAR ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <SocialShareBar title={getShareTitle()} />
      </div>

      {/* ── MAIN SUB-TITLE ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Galeri Kegiatan CDC UMK
        </h2>
      </div>

      {/* ── SECTIONS & MEDIA CONTENT GRID ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {sections.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Belum ada item Galeri Kegiatan yang diunggah.
          </div>
        ) : (
          sections.map((sectionName) => {
            const sectionItems = items.filter((i) => i.kategoriSection === sectionName);
            return (
              <div key={sectionName} className="space-y-6 bg-slate-50/60 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                {/* Section Header */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3 flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#F26522]" />
                  {sectionName}
                </h3>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectionItems.map((item) => {
                    const embedUrl = getYoutubeEmbedUrl(item.youtubeUrl);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
                      >
                        {/* MEDIA DISPLAY */}
                        {item.tipeMedia === 'youtube' && embedUrl ? (
                          /* YOUTUBE EMBED PLAYER */
                          <div className="aspect-[16/9] bg-black relative">
                            <iframe
                              src={embedUrl}
                              title={item.judul}
                              className="w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : item.tipeMedia === 'poster' && item.posterUrl ? (
                          /* POSTER IMAGE WITH ZOOM BUTTON */
                          <div className="aspect-[16/9] bg-slate-900 relative group overflow-hidden">
                            <img
                              src={item.posterUrl}
                              alt={item.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                              onClick={() => setZoomPoster(item.posterUrl || null)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => setZoomPoster(item.posterUrl || null)}
                                className="bg-white text-slate-900 p-2 rounded-full font-bold text-xs shadow-lg hover:scale-110 transition"
                                title="Perbesar Gambar"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : item.tipeMedia === 'pdf' && item.pdfUrl ? (
                          /* PDF DOCUMENT PREVIEW THUMBNAIL */
                          <div className="aspect-[16/9] bg-slate-100 p-6 flex flex-col items-center justify-center text-center space-y-2 border-b border-slate-100">
                            <FileText className="w-10 h-10 text-[#F26522]" />
                            <span className="text-xs font-extrabold text-slate-700 uppercase">Dokumen PDF</span>
                          </div>
                        ) : (
                          /* FALLBACK PLACEHOLDER */
                          <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center text-slate-400">
                            Media tidak tersedia
                          </div>
                        )}

                        {/* CARD CONTENT BODY */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                item.tipeMedia === 'youtube' ? 'bg-red-100 text-red-700' :
                                item.tipeMedia === 'poster' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.tipeMedia === 'youtube' ? 'Video Youtube' : item.tipeMedia === 'poster' ? 'Poster Gambar' : 'Dokumen PDF'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-base leading-snug">
                              {item.judul}
                            </h4>
                            {item.deskripsi && (
                              <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                {item.deskripsi}
                              </p>
                            )}
                          </div>

                          {/* Action Links */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            {item.linkUrl && (
                              <a
                                href={item.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#F26522] hover:text-[#d95316] font-bold hover:underline"
                              >
                                Cek di SINI <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {item.tipeMedia === 'pdf' && item.pdfUrl && (
                              <a
                                href={item.pdfUrl}
                                download={`${item.judul.replace(/\s+/g, '_')}.pdf`}
                                className="inline-flex items-center gap-1 bg-[#F26522] text-white px-3 py-1.5 rounded-md font-bold hover:bg-[#d95316] transition ml-auto"
                              >
                                <Download className="w-3.5 h-3.5" /> Unduh PDF
                              </a>
                            )}
                            {item.tipeMedia === 'poster' && item.posterUrl && (
                              <button
                                onClick={() => setZoomPoster(item.posterUrl || null)}
                                className="inline-flex items-center gap-1 bg-slate-800 text-white px-3 py-1.5 rounded-md font-bold hover:bg-slate-900 transition ml-auto"
                              >
                                <Maximize2 className="w-3.5 h-3.5" /> Lihat Gambar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
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
