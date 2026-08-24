import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Ticket,
  CheckCircle,
  QrCode,
  ArrowRight,
  Send,
  X,
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { PageHeader, Section } from './ui';
import { getJobFair } from '../../data';
import { JobFairItem } from '../../types';

export default function CareerFair() {
  const [items, setItems] = useState<JobFairItem[]>([]);
  const [selectedFair, setSelectedFair] = useState<JobFairItem | null>(null);
  const [activeModalStep, setActiveModalStep] = useState<'detail' | 'ticket'>('detail');
  const [lightboxPoster, setLightboxPoster] = useState<string | null>(null);

  // Ticket registration states
  const [ticketNama, setTicketNama] = useState('');
  const [ticketNim, setTicketNim] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketHp, setTicketHp] = useState('');
  const [ticketInstansi, setTicketInstansi] = useState('Universitas Muhammadiyah Kendari');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  useEffect(() => {
    setItems(getJobFair());
  }, []);

  const handleOpenFairModal = (fair: JobFairItem) => {
    setSelectedFair(fair);
    setActiveModalStep('detail');
    setTicketSuccess(false);
    setTicketNama('');
    setTicketNim('');
    setTicketEmail('');
    setTicketHp('');
    setTicketInstansi('Universitas Muhammadiyah Kendari');
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10" id="layanan-career-fair">
      <PageHeader
        badge="Bursa Kerja & Expo"
        title="Job Fair & Career Expo CDC UM Kendari"
        description="Daftar pameran bursa kerja akbar menghadirkan puluhan perusahaan BUMN & Swasta Nasional."
        accent="emerald"
        icon={Megaphone}
      />

      {/* MODEL CARD LOWONGAN GRID LIST */}
      <Section title="Daftar Event Job Fair">
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada agenda Job Fair yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((fair) => (
              <div
                key={fair.id}
                onClick={() => handleOpenFairModal(fair)}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between space-y-5 group cursor-pointer"
              >
                {/* Top Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-900 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs text-white">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <div>
                        {fair.tagline && <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">{fair.tagline}</span>}
                        <span className="text-xs text-slate-400 font-medium">Job Fair Resmi CDC UMK</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      {fair.status === 'berlangsung' ? '🔥 Berlangsung' : 'Pendaftaran Tiket'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                    {fair.judul}
                  </h3>

                  {/* Metadata List Badges */}
                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{formatDateDisplay(fair.tanggalMulai, fair.tanggalSelesai)} {fair.waktu ? `(${fair.waktu})` : ''}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{fair.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>HTM: {fair.htm}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Perusahaan Peserta: <strong>{fair.perusahaanPeserta?.length || 0}+ Booth</strong></span>
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenFairModal(fair); }}
                    className="bg-emerald-600 group-hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <span>Lihat Detail Konten</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* JOB FAIR DETAIL & TICKET MODAL */}
      {selectedFair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[92vh] relative">
            
            <button
              onClick={() => setSelectedFair(null)}
              className="absolute top-4 right-4 z-20 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Poster (supports 9:16) */}
            <div className="md:w-5/12 bg-slate-950 relative min-h-[250px] md:min-h-full flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
              <img
                src={selectedFair.bannerUrl || '/poster-cdc-web-umk-2.svg'}
                alt={selectedFair.judul}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
              
              {selectedFair.bannerUrl && (
                <button
                  onClick={() => setLightboxPoster(selectedFair.bannerUrl || '')}
                  className="absolute bottom-4 left-4 bg-black/60 hover:bg-black text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Perbesar Poster
                </button>
              )}
            </div>

            {/* Right Side: Detail Content & Ticket Switch */}
            <div className="md:w-7/12 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] md:max-h-[92vh]">
              
              <div className="space-y-2 border-b border-slate-100 pb-4">
                {selectedFair.tagline && (
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">{selectedFair.tagline}</span>
                )}
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {selectedFair.judul}
                </h2>
              </div>

              {/* Tab Navigation inside Modal */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveModalStep('detail')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeModalStep === 'detail' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Detail Konten &amp; Perusahaan
                </button>
                <button
                  onClick={() => { setActiveModalStep('ticket'); setTicketSuccess(false); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeModalStep === 'ticket' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Klaim E-Pass Tiket Masuk
                </button>
              </div>

              {activeModalStep === 'detail' ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Tanggal:</strong> {formatDateDisplay(selectedFair.tanggalMulai, selectedFair.tanggalSelesai)}</span>
                    </div>
                    {selectedFair.waktu && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Jam:</strong> {selectedFair.waktu}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Lokasi:</strong> {selectedFair.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2 text-emerald-700 font-bold">
                      <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>HTM: {selectedFair.htm}</span>
                    </div>
                  </div>

                  {selectedFair.deskripsi && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Deskripsi Konten</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {selectedFair.deskripsi}
                      </p>
                    </div>
                  )}

                  {selectedFair.perusahaanPeserta && selectedFair.perusahaanPeserta.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Perusahaan Peserta ({selectedFair.perusahaanPeserta.length}+ Perusahaan)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedFair.perusahaanPeserta.map((comp) => (
                          <div key={comp.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 text-center truncate">
                            {comp.nama}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => { setActiveModalStep('ticket'); setTicketSuccess(false); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Lanjut Dapatkan E-Pass Masuk</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Ticket Step */
                <div>
                  {ticketSuccess ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <QrCode className="w-8 h-8" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">E-Pass Pengunjung Terbit</span>
                        <h3 className="text-xl font-extrabold text-slate-900">Tiket Masuk Job Fair</h3>
                        <div className="text-2xl font-black font-mono tracking-wider text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                          {ticketCode}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-200 text-xs text-slate-600 space-y-1">
                        <div>👤 <strong>Nama:</strong> {ticketNama}</div>
                        <div>🏛️ <strong>Instansi/Prodi:</strong> {ticketInstansi}</div>
                        <div>📅 <strong>Event:</strong> {selectedFair.judul}</div>
                        <div>📍 <strong>Lokasi:</strong> {selectedFair.lokasi}</div>
                      </div>

                      <button
                        onClick={() => setSelectedFair(null)}
                        className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Selesai &amp; Simpan E-Pass
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900">Form Penerbitan E-Pass Masuk</h4>
                        <p className="text-xs text-slate-500">Lengkapi data singkat untuk klaim tiket masuk.</p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                          <input
                            type="text"
                            required
                            value={ticketNama}
                            onChange={(e) => setTicketNama(e.target.value)}
                            placeholder="nama anda"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Instansi / Prodi</label>
                          <input
                            type="text"
                            value={ticketInstansi}
                            onChange={(e) => setTicketInstansi(e.target.value)}
                            placeholder="Universitas Muhammadiyah Kendari"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Email *</label>
                            <input
                              type="email"
                              required
                              value={ticketEmail}
                              onChange={(e) => setTicketEmail(e.target.value)}
                              placeholder="nama@email.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">No. WhatsApp *</label>
                            <input
                              type="tel"
                              required
                              value={ticketHp}
                              onChange={(e) => setTicketHp(e.target.value)}
                              placeholder="08123456789"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setActiveModalStep('detail')}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800"
                        >
                          &larr; Kembali ke Detail
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" /> Terbitkan E-Pass Saya
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* LIGHTBOX POSTER PREVIEW */}
      {lightboxPoster && (
        <div
          onClick={() => setLightboxPoster(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <img src={lightboxPoster} alt="Poster Perbesar" className="w-full h-full object-contain" />
            <button
              onClick={() => setLightboxPoster(null)}
              className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
