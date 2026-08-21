import React, { useState, useEffect } from 'react';
import { getKonselingConfig } from '../../data';
import { KonselingConfig } from '../../types';
import { ZoomIn, ArrowUpRight, X } from 'lucide-react';

const WA_MSG_DEFAULT =
  'Halo Admin CDC UM Kendari, saya ingin berkonsultasi dan mendaftar Layanan Konseling Karir.';

export default function KonselingKarir() {
  const [config, setConfig] = useState<KonselingConfig>(getKonselingConfig());
  const [zoomPoster, setZoomPoster] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getKonselingConfig());
  }, []);

  // Respek flag publikasi dari admin (Draft → tidak tampil di publik)
  if (config.published === false) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4" id="layanan-konseling-karir">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Layanan Konseling Karir Sedang Dalam Penyusunan</h2>
        <p className="text-sm text-slate-500">Halaman ini masih berstatus Draft dan belum dipublikasikan oleh admin CDC UM Kendari.</p>
      </div>
    );
  }

  const cleanWaNumber = (config.adminWaNumber || '6285299887766').replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    config.adminWaDefaultMessage || WA_MSG_DEFAULT
  )}`;

  const hasInfoItems = Array.isArray(config.infoItems) && config.infoItems.length > 0;
  const hasJadwalItems = Array.isArray(config.jadwalItems) && config.jadwalItems.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16" id="layanan-konseling-karir">
      {/* ── 1. HEADER ── */}
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Layanan CDC UM Kendari
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {config.title || 'Layanan Konseling Karir'}
        </h2>
        <p className="text-base text-slate-500 leading-relaxed">
          {config.subtitle ||
            'Sesi konsultasi karir personal & pendampingan profesional untuk mahasiswa dan alumni Universitas Muhammadiyah Kendari.'}
        </p>
      </div>

      {/* ── 2. POSTER (hanya jika admin mengisi posterUrl) ── */}
      {config.posterUrl && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Poster &amp; Pamflet
              </h3>
              <p className="text-sm text-slate-400">
                Informasi visual resmi layanan bimbingan &amp; konseling karir CDC UM Kendari
              </p>
            </div>
            <button
              onClick={() => setZoomPoster(config.posterUrl)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shrink-0"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              Perbesar
            </button>
          </div>
          <button
            onClick={() => setZoomPoster(config.posterUrl)}
            className="block w-full bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-zoom-in hover:border-slate-300 transition-colors"
          >
            <img
              src={config.posterUrl}
              alt={config.posterAlt || 'Poster Layanan Konseling Karir'}
              className="w-full h-auto max-h-[650px] object-contain rounded-lg"
            />
          </button>
        </section>
      )}

      {/* ── 3. TOPIK KONSELING (hanya jika ada infoItems) ── */}
      {hasInfoItems && (
        <section className="max-w-4xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3">
            Penjelasan &amp; Topik Konseling
          </h3>
          <div className="divide-y divide-slate-100">
            {config.infoItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="py-6 grid grid-cols-1 sm:grid-cols-[64px_1fr] gap-2 sm:gap-6"
              >
                <span className="text-sm font-semibold text-slate-300 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900 leading-snug">
                    {item.judul}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.deskripsi}</p>
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#F26522] hover:text-orange-700 transition-colors"
                    >
                      {item.linkLabel || 'Buka Tautan Terkait'}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. JADWAL (hanya jika ada jadwalItems) ── */}
      {hasJadwalItems && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Jadwal &amp; Pelaksanaan
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Jadwal operasional tatap muka &amp; daring untuk sesi konseling karir CDC UM Kendari
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-semibold">Hari</th>
                  <th className="px-5 py-3 font-semibold">Waktu</th>
                  <th className="px-5 py-3 font-semibold">Lokasi</th>
                  <th className="px-5 py-3 font-semibold">Kuota</th>
                  <th className="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.jadwalItems.map((jdw, idx) => (
                  <tr key={jdw.id || idx} className="bg-white hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {jdw.hari}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{jdw.jam}</td>
                    <td className="px-5 py-4 text-slate-600">{jdw.lokasi}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {jdw.kuotaPerHari || '-'}
                    </td>
                    <td className="px-5 py-4 flex items-center justify-end gap-2 whitespace-nowrap">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          jdw.status === 'buka'
                            ? 'bg-emerald-500'
                            : jdw.status === 'penuh'
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                        }`}
                      />
                      <span className="text-slate-600 font-medium">
                        {jdw.status === 'buka'
                          ? 'Sesi Buka'
                          : jdw.status === 'penuh'
                            ? 'Sesi Penuh'
                            : 'Sesi Tutup'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── 5. KONTAK WHATSAPP (hanya jika ada nomor WA) ── */}
      {cleanWaNumber && (
        <section className="bg-slate-900 rounded-xl px-6 py-10 sm:px-12 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Konsultasi &amp; Pendaftaran Konseling
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {config.narasiWa ||
                'Ingin menjadwalkan sesi konseling karir atau mengajukan pertanyaan lebih lanjut? Silakan hubungi Admin Konseling Karir CDC UM Kendari melalui WhatsApp.'}
            </p>
            <p className="text-xs text-slate-400">
              Gratis — pesan otomatis siap terisi saat WhatsApp terbuka
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            Hubungi Admin via WhatsApp
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </section>
      )}

      {/* ── ZOOM MODAL POSTER ── */}
      {zoomPoster && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center">
          <button
            onClick={() => setZoomPoster(null)}
            aria-label="Tutup"
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-auto rounded-xl bg-white p-2">
            <img
              src={zoomPoster}
              alt="Zoom Poster Konseling"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}