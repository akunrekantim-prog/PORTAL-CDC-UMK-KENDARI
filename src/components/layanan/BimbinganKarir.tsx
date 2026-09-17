import React, { useState, useEffect } from 'react';
import { getKonselingConfig } from '../../data';
import { KonselingConfig } from '../../types';
import { ArrowUpRight, X } from 'lucide-react';
import { useLanguage } from '../../i18n';

const WA_MSG_DEFAULT =
  'Halo Admin CDC UM Kendari, saya ingin berkonsultasi dan mendaftar Layanan Konseling Karir.';

export default function KonselingKarir() {
  const { t, translateContent } = useLanguage();
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
        <h2 className="text-2xl font-bold text-slate-700">{translateContent('Layanan Konseling Karir Sedang Dalam Penyusunan')}</h2>
        <p className="text-sm text-slate-500">{translateContent('Halaman ini masih berstatus Draft dan belum dipublikasikan oleh admin CDC UM Kendari.')}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-16 min-w-0" id="layanan-konseling-karir">
      {/* ── 1. HEADER ── */}
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Layanan CDC UM Kendari
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {translateContent(config.title || t('layanan.konselingtitle', 'Layanan Bimbingan & Konseling Karir'))}
        </h2>
        <p className="text-base text-slate-500 leading-relaxed">
          {translateContent(config.subtitle || t('layanan.konselingdesc', 'Sesi konsultasi karir personal & pendampingan profesional untuk mahasiswa dan alumni Universitas Muhammadiyah Kendari.'))}
        </p>
      </div>

      {/* ── 2. POSTER (hanya jika admin mengisi posterUrl) ── */}
      {config.posterUrl && (
        <section className="space-y-4">
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
            {translateContent('Penjelasan & Topik Konseling')}
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
                    {translateContent(item.judul)}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{translateContent(item.deskripsi)}</p>
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#F26522] hover:text-orange-700 transition-colors"
                    >
                      {translateContent(item.linkLabel || 'Buka Tautan Terkait')}
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
              {translateContent('Jadwal & Pelaksanaan')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {translateContent('Jadwal operasional tatap muka & daring untuk sesi konseling karir CDC UM Kendari')}
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#000066] text-left text-xs uppercase tracking-wider text-white">
                    <th className="px-5 py-3 font-semibold">{translateContent('Hari')}</th>
                    <th className="px-5 py-3 font-semibold">{translateContent('Waktu')}</th>
                    <th className="px-5 py-3 font-semibold">{translateContent('Lokasi')}</th>
                    <th className="px-5 py-3 font-semibold">{translateContent('Kuota')}</th>
                    <th className="px-5 py-3 font-semibold text-right">{translateContent('Status')}</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {config.jadwalItems.map((jdw, idx) => (
                  <tr key={jdw.id || idx} className="bg-white hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {translateContent(jdw.hari)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{jdw.jam}</td>
                    <td className="px-5 py-4 text-slate-600">{translateContent(jdw.lokasi)}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {jdw.kuotaPerHari || '-'}
                    </td>
                    <td className="px-5 py-4 flex items-center justify-end gap-2 whitespace-nowrap">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${jdw.status === 'buka'
                            ? 'bg-emerald-500'
                            : jdw.status === 'penuh'
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                      />
                      <span className="text-slate-600 font-medium">
                        {jdw.status === 'buka'
                          ? translateContent('Sesi Buka')
                          : jdw.status === 'penuh'
                            ? translateContent('Sesi Penuh')
                            : translateContent('Sesi Tutup')}
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
        <section className="bg-[#000066] rounded-xl px-6 py-10 sm:px-12 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {translateContent('Konsultasi & Pendaftaran Konseling')}
            </h3>
            <p className="text-sm text-blue-200 leading-relaxed">
              {translateContent(
                config.narasiWa ||
                'Ingin menjadwalkan sesi konseling karir atau mengajukan pertanyaan lebih lanjut? Silakan hubungi Admin Konseling Karir CDC UM Kendari melalui WhatsApp.'
              )}
            </p>
            <p className="text-xs text-blue-300/70">
              {translateContent('Gratis — pesan otomatis siap terisi saat WhatsApp terbuka')}
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#1ebe5d] transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {translateContent('Hubungi Admin via WhatsApp')}
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