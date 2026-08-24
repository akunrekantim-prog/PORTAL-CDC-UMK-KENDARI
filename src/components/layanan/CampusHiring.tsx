import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Video
} from 'lucide-react';
import { Section } from './ui';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { useLayanan } from './LayananContainer';
import { getCampusHiring, saveCampusHiring } from '../../data';
import { CampusHiringItem } from '../../types';

const formatDateDisplay = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export default function CampusHiring() {
  const [items, setItems] = useState<CampusHiringItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusHiringItem | null>(null);
  const [activeDetailStep, setActiveDetailStep] = useState<'detail' | 'form'>('detail');

  // Form states pendaftaran peserta
  const [regNama, setRegNama] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regHp, setRegHp] = useState('');
  const [regProdi, setRegProdi] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const { setIsDetailActive } = useLayanan();

  useEffect(() => {
    setItems(getCampusHiring());
  }, []);

  // Sinkronkan status detail agar header container disembunyikan saat detail terbuka
  useEffect(() => {
    setIsDetailActive(selectedEvent !== null);
  }, [selectedEvent, setIsDetailActive]);

  const handleOpenEventDetail = (event: CampusHiringItem) => {
    setSelectedEvent(event);
    setActiveDetailStep('detail');
    setRegSuccess(false);
    setRegNama('');
    setRegNim('');
    setRegEmail('');
    setRegHp('');
    setRegProdi('');
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    window.scrollTo(0, 0);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama.trim() || !regEmail.trim() || !regHp.trim()) {
      alert('Nama Lengkap, Email, dan No WhatsApp wajib diisi.');
      return;
    }

    if (selectedEvent) {
      const updatedItems = items.map((item) => {
        if (item.id === selectedEvent.id) {
          return {
            ...item,
            terdaftarCount: (item.terdaftarCount || 0) + 1
          };
        }
        return item;
      });
      saveCampusHiring(updatedItems);
      setItems(updatedItems);
    }

    setRegSuccess(true);
  };

  // ===== HALAMAN DETAIL PENUH (gaya editorial Berita & Artikel) =====
  if (selectedEvent) {
    const metaRows: { label: string; value: string }[] = [
      { label: 'Perusahaan', value: selectedEvent.namaPerusahaan },
      { label: 'Tanggal', value: formatDateDisplay(selectedEvent.tanggal) },
      ...(selectedEvent.waktu ? [{ label: 'Waktu', value: selectedEvent.waktu }] : []),
      { label: 'Lokasi', value: selectedEvent.lokasi },
      { label: 'Tipe', value: selectedEvent.tipe === 'virtual' ? 'Virtual — Zoom Meeting' : 'On-Campus — Wawancara Langsung' }
    ];

    return (
      <div id="layanan-campus-hiring-detail">
        <ShareableDetailPage
          title={selectedEvent.judul}
          categoryLabel="Campus Hiring - Recruitment"
          imageUrl={selectedEvent.bannerUrl || selectedEvent.logoPerusahaan || '/poster-cdc-web-umk-1.svg'}
          onBack={handleBackToList}
          metaItems={[
            <span key="tgl">{formatDateDisplay(selectedEvent.tanggal)}</span>,
            <span key="perusahaan">{selectedEvent.namaPerusahaan}</span>
          ]}
        >
          <div className="space-y-8">

            {/* Tab Navigasi — teks biasa dengan underline aktif */}
            <div className="flex items-center gap-6 border-b border-slate-200 flex-wrap">
              <button
                onClick={() => setActiveDetailStep('detail')}
                className={`pb-3 -mb-px text-xs font-bold tracking-wide border-b-2 transition-colors cursor-pointer ${
                  activeDetailStep === 'detail'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                DETAIL &amp; PERSYARATAN
              </button>
              <button
                onClick={() => { setActiveDetailStep('form'); setRegSuccess(false); }}
                className={`pb-3 -mb-px text-xs font-bold tracking-wide border-b-2 transition-colors cursor-pointer ${
                  activeDetailStep === 'form'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                FORM PENDAFTARAN
              </button>
            </div>

            {activeDetailStep === 'detail' ? (
              <div className="space-y-10">
                {/* Metadata sebagai tabel definisi */}
                <dl className="divide-y divide-slate-100 border-y border-slate-100">
                  {metaRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] py-3 text-sm">
                      <dt className="font-bold text-slate-900">{row.label}</dt>
                      <dd className="text-slate-600 leading-relaxed">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                {selectedEvent.deskripsi && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Deskripsi</h4>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedEvent.deskripsi}
                    </p>
                  </div>
                )}

                {selectedEvent.posisiBuka && selectedEvent.posisiBuka.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Posisi Dibuka</h4>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100">
                      {selectedEvent.posisiBuka.map((pos, idx) => (
                        <li key={idx} className="flex items-baseline gap-4 py-3">
                          <span className="text-xs text-slate-300 font-bold tabular-nums w-7 shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEvent.persyaratan && selectedEvent.persyaratan.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Kualifikasi &amp; Berkas</h4>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100">
                      {selectedEvent.persyaratan.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-4 py-3">
                          <span className="text-xs text-slate-300 font-bold tabular-nums w-7 shrink-0 pt-0.5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm text-slate-700 leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                  {selectedEvent.tipe === 'virtual' && selectedEvent.linkVirtual && (
                    <a
                      href={selectedEvent.linkVirtual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-900 transition-colors"
                    >
                      <Video className="w-4 h-4" /> Tautan Zoom Meeting
                    </a>
                  )}

                  <button
                    onClick={() => { setActiveDetailStep('form'); setRegSuccess(false); }}
                    className="ml-auto inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Daftar Wawancara</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Langkah Form */
              <div className="max-w-lg">
                {regSuccess ? (
                  <div className="space-y-5">
                    <div className="border-y border-slate-200 py-8 text-center space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">Pendaftaran Tercatat</p>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Terima kasih, {regNama}.</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Data Anda untuk <strong className="text-slate-700">{selectedEvent.judul}</strong> telah kami terima.
                        Informasi selanjutnya dikirim via email.
                      </p>
                    </div>
                    <button
                      onClick={handleBackToList}
                      className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRegistration} className="space-y-5">
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Form Konfirmasi Peserta</h4>
                      <p className="text-xs text-slate-500">Isi data singkat untuk konfirmasi wawancara.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="ch-nama" className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                        <input
                          id="ch-nama"
                          type="text"
                          required
                          value={regNama}
                          onChange={(e) => setRegNama(e.target.value)}
                          placeholder="nama sesuai ijazah"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="ch-nim" className="text-xs font-bold text-slate-700">NIM</label>
                          <input
                            id="ch-nim"
                            type="text"
                            value={regNim}
                            onChange={(e) => setRegNim(e.target.value)}
                            placeholder="202201..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="ch-prodi" className="text-xs font-bold text-slate-700">Program Studi</label>
                          <input
                            id="ch-prodi"
                            type="text"
                            value={regProdi}
                            onChange={(e) => setRegProdi(e.target.value)}
                            placeholder="Teknik Informatika"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="ch-email" className="text-xs font-bold text-slate-700">Email Aktif *</label>
                          <input
                            id="ch-email"
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="ch-hp" className="text-xs font-bold text-slate-700">No. WhatsApp *</label>
                          <input
                            id="ch-hp"
                            type="tel"
                            required
                            value={regHp}
                            onChange={(e) => setRegHp(e.target.value)}
                            placeholder="08123456789"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveDetailStep('detail')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        Konfirmasi Pendaftaran
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </ShareableDetailPage>
      </div>
    );
  }

  // ===== DAFTAR CARD =====
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10" id="layanan-campus-hiring">
      {/* Deskripsi flat — judul sudah ditampilkan LayananContainer di atas */}
      <div className="-mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Recruitment &amp; Interview
        </p>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          Daftar rekrutmen &amp; wawancara kerja langsung di kampus kerja sama CDC UM Kendari dengan perusahaan mitra resmi.
        </p>
      </div>

      <Section title="Daftar Agenda Campus Hiring">
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
            Belum ada agenda Campus Hiring yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((event, idx) => (
              <motion.div
                key={event.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: (idx % 3) * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onClick={() => handleOpenEventDetail(event)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenEventDetail(event); } }}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
              >
                {/* Thumbnail / Logo Perusahaan */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-100">
                  {event.bannerUrl || event.logoPerusahaan ? (
                    <img
                      src={event.bannerUrl || event.logoPerusahaan}
                      alt={event.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {event.namaPerusahaan}
                    </p>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-[#0077C6] transition-colors">
                      {event.judul}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {formatDateDisplay(event.tanggal)}{event.waktu ? ` · ${event.waktu}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                      {event.lokasi}
                    </p>
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-end gap-2">
                    <span className="text-slate-400 font-medium whitespace-nowrap">
                      by Admin Website
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
