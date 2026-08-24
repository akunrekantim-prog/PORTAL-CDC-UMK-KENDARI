import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Section } from './ui';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { useLayanan } from './LayananContainer';
import { getJobFair } from '../../data';
import { JobFairItem } from '../../types';

const formatDateDisplay = (dateStart: string, dateEnd?: string) => {
  try {
    const d1 = new Date(dateStart);
    if (isNaN(d1.getTime())) return dateStart;
    const f1 = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d1);
    if (!dateEnd || dateEnd === dateStart) return f1;
    const d2 = new Date(dateEnd);
    const f2 = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d2);
    return `${f1} – ${f2}`;
  } catch {
    return dateStart;
  }
};

export default function CareerFair() {
  const [items, setItems] = useState<JobFairItem[]>([]);
  const [selectedFair, setSelectedFair] = useState<JobFairItem | null>(null);
  const [activeDetailStep, setActiveDetailStep] = useState<'detail' | 'ticket'>('detail');
  // Ticket registration states
  const [ticketNama, setTicketNama] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketHp, setTicketHp] = useState('');
  const [ticketInstansi, setTicketInstansi] = useState('Universitas Muhammadiyah Kendari');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const { setIsDetailActive } = useLayanan();

  useEffect(() => {
    setItems(getJobFair());
  }, []);

  // Sinkronkan status detail agar header container disembunyikan saat detail terbuka
  useEffect(() => {
    setIsDetailActive(selectedFair !== null);
  }, [selectedFair, setIsDetailActive]);

  const handleOpenFairDetail = (fair: JobFairItem) => {
    setSelectedFair(fair);
    setActiveDetailStep('detail');
    setTicketSuccess(false);
    setTicketNama('');
    setTicketEmail('');
    setTicketHp('');
    setTicketInstansi('Universitas Muhammadiyah Kendari');
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedFair(null);
    window.scrollTo(0, 0);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNama.trim() || !ticketEmail.trim() || !ticketHp.trim()) {
      alert('Nama Lengkap, Email, dan No WhatsApp wajib diisi.');
      return;
    }
    const generatedCode = `UMK-JF-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketCode(generatedCode);
    setTicketSuccess(true);
  };

  // ===== HALAMAN DETAIL PENUH (gaya editorial Berita & Artikel) =====
  if (selectedFair) {
    const metaRows: { label: string; value: string }[] = [
      { label: 'Tanggal', value: formatDateDisplay(selectedFair.tanggalMulai, selectedFair.tanggalSelesai) },
      ...(selectedFair.waktu ? [{ label: 'Waktu', value: selectedFair.waktu }] : []),
      { label: 'Lokasi', value: selectedFair.lokasi },
      { label: 'HTM', value: selectedFair.htm }
    ];

    return (
      <div id="layanan-career-fair-detail">
        <ShareableDetailPage
          title={selectedFair.judul}
          categoryLabel="Job Fair"
          imageUrl={selectedFair.bannerUrl || '/poster-cdc-web-umk-2.svg'}
          onBack={handleBackToList}
          metaItems={[
            <span key="tgl">{formatDateDisplay(selectedFair.tanggalMulai, selectedFair.tanggalSelesai)}</span>
          ]}
        >
          <div className="space-y-8">

            {/* Tab Navigasi — teks biasa dengan underline aktif */}
            <div className="flex items-center gap-6 border-b border-slate-200">
              <button
                onClick={() => setActiveDetailStep('detail')}
                className={`pb-3 -mb-px text-xs font-bold tracking-wide border-b-2 transition-colors cursor-pointer ${
                  activeDetailStep === 'detail'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                DETAIL KONTEN &amp; PERUSAHAAN
              </button>
              <button
                onClick={() => { setActiveDetailStep('ticket'); setTicketSuccess(false); }}
                className={`pb-3 -mb-px text-xs font-bold tracking-wide border-b-2 transition-colors cursor-pointer ${
                  activeDetailStep === 'ticket'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                E-PASS TIKET MASUK
              </button>
            </div>

            {activeDetailStep === 'detail' ? (
              <div className="space-y-10">
                {/* Metadata sebagai tabel definisi, bukan kartu-kartu */}
                <dl className="divide-y divide-slate-100 border-y border-slate-100">
                  {metaRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] py-3 text-sm">
                      <dt className="font-bold text-slate-900">{row.label}</dt>
                      <dd className="text-slate-600 leading-relaxed">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                {selectedFair.deskripsi && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Deskripsi</h4>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedFair.deskripsi}
                    </p>
                  </div>
                )}

                {selectedFair.perusahaanPeserta && selectedFair.perusahaanPeserta.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Perusahaan Peserta — {selectedFair.perusahaanPeserta.length}
                    </h4>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100">
                      {selectedFair.perusahaanPeserta.map((comp, idx) => (
                        <li key={comp.id} className="flex items-baseline gap-4 py-3">
                          <span className="text-xs text-slate-300 font-bold tabular-nums w-7 shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{comp.nama}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setActiveDetailStep('ticket'); setTicketSuccess(false); }}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Dapatkan E-Pass Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Langkah Tiket */
              <div className="max-w-lg">
                {ticketSuccess ? (
                  <div className="space-y-5">
                    <div className="border-y border-slate-200 py-6 text-center space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">E-Pass Terbit</p>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Tiket Masuk Job Fair</h3>
                      <p className="text-2xl font-black font-mono tracking-[0.08em] text-slate-900 tabular-nums">
                        {ticketCode}
                      </p>
                    </div>

                    <dl className="divide-y divide-slate-100 border-y border-slate-100 text-sm">
                      <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Nama</dt><dd className="font-semibold text-slate-800 text-right">{ticketNama}</dd></div>
                      <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Instansi</dt><dd className="font-semibold text-slate-800 text-right">{ticketInstansi}</dd></div>
                      <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Event</dt><dd className="font-semibold text-slate-800 text-right">{selectedFair.judul}</dd></div>
                      <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Lokasi</dt><dd className="font-semibold text-slate-800 text-right">{selectedFair.lokasi}</dd></div>
                    </dl>

                    <button
                      onClick={handleBackToList}
                      className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-5">
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Form Penerbitan E-Pass</h4>
                      <p className="text-xs text-slate-500">Lengkapi data singkat untuk klaim tiket masuk.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="jf-nama" className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                        <input
                          id="jf-nama"
                          type="text"
                          required
                          value={ticketNama}
                          onChange={(e) => setTicketNama(e.target.value)}
                          placeholder="nama anda"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="jf-instansi" className="text-xs font-bold text-slate-700">Instansi / Prodi</label>
                        <input
                          id="jf-instansi"
                          type="text"
                          value={ticketInstansi}
                          onChange={(e) => setTicketInstansi(e.target.value)}
                          placeholder="Universitas Muhammadiyah Kendari"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="jf-email" className="text-xs font-bold text-slate-700">Email *</label>
                          <input
                            id="jf-email"
                            type="email"
                            required
                            value={ticketEmail}
                            onChange={(e) => setTicketEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="jf-hp" className="text-xs font-bold text-slate-700">No. WhatsApp *</label>
                          <input
                            id="jf-hp"
                            type="tel"
                            required
                            value={ticketHp}
                            onChange={(e) => setTicketHp(e.target.value)}
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
                        Terbitkan E-Pass
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10" id="layanan-career-fair">
      {/* Deskripsi flat — judul sudah ditampilkan LayananContainer di atas */}
      <div className="-mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Job Fair &amp; Expo
        </p>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          Daftar pameran bursa kerja akbar menghadirkan puluhan perusahaan BUMN &amp; Swasta Nasional.
        </p>
      </div>

      <Section title="Daftar Event Job Fair">
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
            Belum ada agenda Job Fair yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((fair, idx) => (
              <motion.div
                key={fair.id}
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
                onClick={() => handleOpenFairDetail(fair)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenFairDetail(fair); } }}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
              >
                {/* Thumbnail / Poster */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={fair.bannerUrl || '/poster-cdc-web-umk-2.svg'}
                    alt={fair.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {fair.tagline && (
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 line-clamp-1">
                        {fair.tagline}
                      </p>
                    )}
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-[#0077C6] transition-colors">
                      {fair.judul}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {formatDateDisplay(fair.tanggalMulai, fair.tanggalSelesai)}{fair.waktu ? ` · ${fair.waktu}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                      {fair.lokasi}
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
