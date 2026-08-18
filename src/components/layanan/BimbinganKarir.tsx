import React, { useState, useEffect } from 'react';
import { getKonselingConfig } from '../../data';
import { KonselingConfig } from '../../types';
import {
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Info,
  ZoomIn,
  X,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function KonselingKarir() {
  const [config, setConfig] = useState<KonselingConfig>(getKonselingConfig());
  const [zoomPoster, setZoomPoster] = useState<string | null>(null);

  useEffect(() => {
    // Reload config in case admin modified it
    setConfig(getKonselingConfig());
  }, []);

  // Format WhatsApp Link dengan template pesan otomatis
  const cleanWaNumber = (config.adminWaNumber || '6285299887766').replace(/\D/g, '');
  const waDefaultMsg = config.adminWaDefaultMessage || 'Halo Admin CDC UM Kendari, saya ingin berkonsultasi dan mendaftar Layanan Konseling Karir.';
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waDefaultMsg)}`;

  const hasInfoItems = Array.isArray(config.infoItems) && config.infoItems.length > 0;
  const hasJadwalItems = Array.isArray(config.jadwalItems) && config.jadwalItems.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="layanan-konseling-karir">

      {/* ── 1. HEADER TITLE & SUBTITLE ── */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
          {config.title || 'Layanan Konseling Karir UPT CDC UM Kendari'}
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base">
          {config.subtitle || 'Sesi konsultasi karir personal & pendampingan profesional untuk mahasiswa dan alumni Universitas Muhammadiyah Kendari.'}
        </p>
      </div>

      {/* ── 2. TEMPLATE POSTER SECTION (Hanya tampil jika posterUrl diisi Admin) ── */}
      {config.posterUrl && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F26522]" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Poster & Pamflet Layanan Konseling
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Informasi visual resmi mengenai program bimbingan & konseling karir mahasiswa CDC UM Kendari
              </p>
            </div>
            <button
              onClick={() => setZoomPoster(config.posterUrl)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors shrink-0"
            >
              <ZoomIn className="w-4 h-4 text-slate-500" />
              Perbesar Poster
            </button>
          </div>

          {/* Poster Image Display */}
          <div className="relative group rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-lg flex items-center justify-center min-h-[300px] max-h-[650px]">
            <img
              src={config.posterUrl}
              alt={config.posterAlt || 'Poster Layanan Konseling Karir'}
              className="w-full h-auto max-h-[650px] object-contain transition-transform duration-500 group-hover:scale-[1.01]"
            />

            {/* Overlay Hover Trigger */}
            <div
              onClick={() => setZoomPoster(config.posterUrl)}
              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
            >
              <div className="px-5 py-2.5 rounded-full bg-white/90 text-slate-900 font-bold text-xs shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <ZoomIn className="w-4 h-4 text-[#F26522]" /> Klik untuk Memperbesar Poster
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. PENJELASAN & TOPIK KONSELING (Hanya tampil jika ada infoItems dari Admin) ── */}
      {hasInfoItems && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Info className="w-6 h-6 text-[#000066]" />
              Penjelasan & Topik Konseling Karir
            </h2>
            <p className="text-sm text-slate-500">
              Berbagai cakupan pembahasan layanan konseling yang dapat Anda konsultasikan dengan tim CDC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.infoItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F26522] flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-[#F26522] group-hover:text-white transition-colors">
                    0{idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#000066] transition-colors leading-snug">
                    {item.judul}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>

                {item.linkUrl && (
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F26522] hover:text-orange-700 transition-colors group/link"
                    >
                      <span>{item.linkLabel || 'Buka Tautan Terkait'}</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. JADWAL KONSELING KARIR (Hanya tampil jika ada jadwalItems dari Admin) ── */}
      {hasJadwalItems && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-emerald-600" />
              Jadwal & Pelaksanaan Konseling
            </h2>
            <p className="text-sm text-slate-500">
              Jadwal operasional tatap muka & daring untuk sesi konseling karir CDC UM Kendari
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.jadwalItems.map((jdw, idx) => (
              <div
                key={jdw.id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-base">{jdw.hari}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      jdw.status === 'buka'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : jdw.status === 'penuh'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {jdw.status === 'buka' ? 'Sesi Buka' : jdw.status === 'penuh' ? 'Sesi Penuh' : 'Sesi Tutup'}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong className="text-slate-800">Waktu:</strong> {jdw.jam}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-800">Lokasi:</strong> {jdw.lokasi}</span>
                  </div>
                  {jdw.kuotaPerHari && (
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span><strong className="text-slate-800">Kuota:</strong> {jdw.kuotaPerHari}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. NARASI & TOMBOL DIRECT WHATSAPP ADMIN (Hanya tampil jika ada nomor WA/narasi) ── */}
      {cleanWaNumber && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              Layanan Bebas Biaya (Gratis)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Konsultasi & Pendaftaran Konseling
            </h2>
            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
              {config.narasiWa || 'Ingin menjadwalkan sesi konseling karir atau mengajukan pertanyaan lebih lanjut? Silakan hubungi Admin Konseling Karir CDC UM Kendari melalui WhatsApp.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm sm:text-base shadow-xl transition-all hover:scale-105 active:scale-95 group"
            >
              <MessageCircle className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
              Hubungi Admin Konseling via WhatsApp
              <ExternalLink className="w-4 h-4 text-emerald-600" />
            </a>
            <div className="text-xs text-emerald-100 flex items-center gap-1.5 px-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Pesan otomatis siap terisi saat WhatsApp terbuka</span>
            </div>
          </div>
        </div>
      )}

      {/* ── ZOOM MODAL FOR POSTER ── */}
      {zoomPoster && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center">
          <button
            onClick={() => setZoomPoster(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-auto rounded-2xl bg-white p-2">
            <img src={zoomPoster} alt="Zoom Poster Konseling" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
}
