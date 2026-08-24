import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Video,
  ArrowRight,
  Send,
  X,
  Briefcase,
  Eye,
  Maximize2,
  ChevronRight,
  FileText
} from 'lucide-react';
import { PageHeader, Section } from './ui';
import { getCampusHiring, saveCampusHiring } from '../../data';
import { CampusHiringItem } from '../../types';

export default function CampusHiring() {
  const [items, setItems] = useState<CampusHiringItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusHiringItem | null>(null);
  const [activeModalStep, setActiveModalStep] = useState<'detail' | 'form'>('detail');
  const [lightboxPoster, setLightboxPoster] = useState<string | null>(null);

  // Form states pendaftaran peserta
  const [regNama, setRegNama] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regHp, setRegHp] = useState('');
  const [regProdi, setRegProdi] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    setItems(getCampusHiring());
  }, []);

  const handleOpenEventModal = (event: CampusHiringItem) => {
    setSelectedEvent(event);
    setActiveModalStep('detail');
    setRegSuccess(false);
    setRegNama('');
    setRegNim('');
    setRegEmail('');
    setRegHp('');
    setRegProdi('');
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10" id="layanan-campus-hiring">
      <PageHeader
        badge="Recruitment & Interview"
        title="Campus Hiring CDC UM Kendari"
        description="Daftar rekrutmen & wawancara kerja langsung di kampus kerja sama CDC UM Kendari dengan perusahaan mitra resmi."
        accent="blue"
        icon={Building2}
      />

      {/* MODEL CARD LOWONGAN GRID LIST */}
      <Section title="Daftar Agenda Campus Hiring">
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada agenda Campus Hiring yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((event) => (
              <div
                key={event.id}
                onClick={() => handleOpenEventModal(event)}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between space-y-5 group cursor-pointer"
              >
                {/* Top Bar: Company Logo & Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        {event.logoPerusahaan ? (
                          <img src={event.logoPerusahaan} alt={event.namaPerusahaan} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0077C6] uppercase tracking-wider block">{event.namaPerusahaan}</span>
                        <span className="text-[11px] text-slate-400 font-medium">Rekrutmen Resmi CDC UMK</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${event.tipe === 'virtual' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {event.tipe === 'virtual' ? 'Virtual Zoom' : 'On-Campus'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {event.status === 'buka' ? 'Pendaftaran Dibuka' : event.status}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {event.judul}
                  </h3>

                  {/* Metadata List Badges */}
                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{formatDateDisplay(event.tanggal)} {event.waktu ? `(${event.waktu})` : ''}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{event.lokasi}</span>
                    </div>
                  </div>

                  {/* Open Position Tags */}
                  {event.posisiBuka && event.posisiBuka.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {event.posisiBuka.slice(0, 3).map((pos, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                          {pos}
                        </span>
                      ))}
                      {event.posisiBuka.length > 3 && (
                        <span className="text-[11px] text-slate-400 font-semibold px-2 py-1">
                          +{event.posisiBuka.length - 3} posisi lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terdaftar: <strong>{event.terdaftarCount || 0} Mahasiswa</strong></span>
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEventModal(event); }}
                    className="bg-[#0077C6] group-hover:bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
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

      {/* DETAIL KONTEN & REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[92vh] relative">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-20 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Poster (if uploaded, supports 9:16) */}
            <div className="md:w-5/12 bg-slate-950 relative min-h-[250px] md:min-h-full flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
              <img
                src={selectedEvent.bannerUrl || selectedEvent.logoPerusahaan || '/poster-cdc-web-umk-1.svg'}
                alt={selectedEvent.judul}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
              
              {selectedEvent.bannerUrl && (
                <button
                  onClick={() => setLightboxPoster(selectedEvent.bannerUrl || '')}
                  className="absolute bottom-4 left-4 bg-black/60 hover:bg-black text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Perbesar Poster
                </button>
              )}
            </div>

            {/* Right Side: Detail Content & Form Tab */}
            <div className="md:w-7/12 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] md:max-h-[92vh]">
              
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                    {selectedEvent.namaPerusahaan}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedEvent.tipe === 'virtual' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {selectedEvent.tipe === 'virtual' ? 'Virtual Zoom' : 'On-Campus Direct Interview'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {selectedEvent.judul}
                </h2>
              </div>

              {/* Tab Navigation inside Modal */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveModalStep('detail')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeModalStep === 'detail' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Detail Konten &amp; Persyaratan
                </button>
                <button
                  onClick={() => { setActiveModalStep('form'); setRegSuccess(false); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeModalStep === 'form' ? 'bg-[#0077C6] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Form Pendaftaran Wawancara
                </button>
              </div>

              {activeModalStep === 'detail' ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Tanggal:</strong> {formatDateDisplay(selectedEvent.tanggal)}</span>
                    </div>
                    {selectedEvent.waktu && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span><strong>Jam:</strong> {selectedEvent.waktu}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Lokasi:</strong> {selectedEvent.lokasi}</span>
                    </div>
                  </div>

                  {selectedEvent.deskripsi && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Deskripsi Konten</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {selectedEvent.deskripsi}
                      </p>
                    </div>
                  )}

                  {selectedEvent.posisiBuka && selectedEvent.posisiBuka.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Posisi Lowongan Dibuka
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.posisiBuka.map((pos, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200">
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.persyaratan && selectedEvent.persyaratan.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Kualifikasi &amp; Berkas
                      </h4>
                      <ul className="space-y-1.5 pl-1">
                        {selectedEvent.persyaratan.map((req, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    {selectedEvent.tipe === 'virtual' && selectedEvent.linkVirtual && (
                      <a
                        href={selectedEvent.linkVirtual}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200 transition"
                      >
                        <Video className="w-4 h-4" /> Link Zoom Meeting
                      </a>
                    )}

                    <button
                      onClick={() => { setActiveModalStep('form'); setRegSuccess(false); }}
                      className="ml-auto bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <span>Daftar Wawancara Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Step */
                <div>
                  {regSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-extrabold text-slate-900">Pendaftaran Berhasil!</h3>
                        <p className="text-xs text-slate-600 max-w-sm mx-auto">
                          Terima kasih <strong>{regNama}</strong>. Data pendaftaran Anda untuk <strong>{selectedEvent.judul}</strong> telah tercatat.
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Selesai &amp; Tutup
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRegistration} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900">Form Konfirmasi Peserta</h4>
                        <p className="text-xs text-slate-500">Isi data singkat untuk konfirmasi wawancara.</p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                          <input
                            type="text"
                            required
                            value={regNama}
                            onChange={(e) => setRegNama(e.target.value)}
                            placeholder="nama sesuai Ijazah"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">NIM</label>
                            <input
                              type="text"
                              value={regNim}
                              onChange={(e) => setRegNim(e.target.value)}
                              placeholder="202201..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Program Studi</label>
                            <input
                              type="text"
                              value={regProdi}
                              onChange={(e) => setRegProdi(e.target.value)}
                              placeholder="Teknik Informatika"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Email Aktif *</label>
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="nama@email.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">No. WhatsApp *</label>
                            <input
                              type="tel"
                              required
                              value={regHp}
                              onChange={(e) => setRegHp(e.target.value)}
                              placeholder="08123456789"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                          className="bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" /> Konfirmasi Pendaftaran
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
