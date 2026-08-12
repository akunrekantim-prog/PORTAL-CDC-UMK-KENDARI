import React, { useState } from 'react';
import { 
  User as UserType, 
  Mahasiswa, 
  Lowongan, 
  PengajuanMagang,
  SelectionHistoryLog
} from '../types';
import { getFromDB } from '../data';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Video, 
  Info,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface StudentApplicationsViewProps {
  user: UserType;
  mahasiswaData: Mahasiswa | null;
  allLowongan: Lowongan[];
  onSelectJob?: (job: Lowongan) => void;
}

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return '10 Agustus 2026';
  if (dateStr.includes('Agustus') || dateStr.includes('Januari') || dateStr.includes('Februari')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const StudentApplicationsView: React.FC<StudentApplicationsViewProps> = ({
  user,
  mahasiswaData,
  allLowongan,
  onSelectJob
}) => {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // Fetch applications for this logged-in student
  const allApplications = getFromDB<PengajuanMagang>('pengajuan_magang');
  const myApplications = allApplications.filter(a => 
    a.userId === user.id || 
    a.namaMahasiswa === user.name || 
    (mahasiswaData && a.nim === mahasiswaData.nim) ||
    a.mahasiswaId === `mhs_${user.id}` ||
    a.mahasiswaId === mahasiswaData?.id ||
    (user.role === 'mahasiswa' && (a.userId === 'usr_mhs_demo' || a.userId === '2'))
  );

  // Calculate statistics
  const statTotal = myApplications.length;
  const statReview = myApplications.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'seleksi_administrasi' || s === 'draft';
  }).length;
  const statInterview = myApplications.filter(a => (a.status || '').toLowerCase() === 'interview').length;
  const statAccepted = myApplications.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'accepted' || s === 'diterima' || s === 'completed';
  }).length;

  // Active interview applications
  const activeInterviewApps = myApplications.filter(a => (a.status || '').toLowerCase() === 'interview');

  // Helper to render status badge
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Menunggu Review
        </span>
      );
    }
    if (s === 'seleksi_administrasi' || s === 'revision') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Seleksi Administrasi
        </span>
      );
    }
    if (s === 'interview') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-purple-50 text-purple-700 border-purple-200 inline-flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Interview / Wawancara
        </span>
      );
    }
    if (s === 'accepted' || s === 'diterima' || s === 'completed') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Diterima
        </span>
      );
    }
    if (s === 'rejected' || s === 'ditolak') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Ditolak
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-200">
        {status}
      </span>
    );
  };

  // Helper to compute/get history logs
  const getHistoryLogs = (appl: PengajuanMagang): SelectionHistoryLog[] => {
    if (appl.riwayatSeleksi && appl.riwayatSeleksi.length > 0) {
      return appl.riwayatSeleksi;
    }
    const logs: SelectionHistoryLog[] = [];
    const createdDate = formatDateDisplay(appl.createdAt || '2026-08-10');

    logs.push({
      status: 'submitted',
      label: 'Lamaran diterima sistem',
      date: createdDate
    });

    const s = (appl.status || '').toLowerCase();
    if (s !== 'submitted' && s !== 'under_review' && s !== 'draft') {
      logs.push({
        status: 'seleksi_administrasi',
        label: 'Masuk seleksi administrasi',
        date: createdDate
      });
    }

    if (s === 'interview' || appl.interviewDate) {
      logs.push({
        status: 'interview',
        label: `Interview dijadwalkan (${formatDateDisplay(appl.interviewDate || '2026-08-15')} jam ${appl.interviewTime || '10:00 WITA'})`,
        date: formatDateDisplay(appl.interviewDate || '2026-08-15'),
        note: appl.interviewNote
      });
    }

    if (s === 'accepted' || s === 'diterima' || s === 'completed') {
      logs.push({
        status: 'accepted',
        label: 'Lolos seleksi & Diterima sebagai peserta magang/kerja',
        date: '20 Agustus 2026'
      });
    } else if (s === 'rejected' || s === 'ditolak') {
      logs.push({
        status: 'rejected',
        label: 'Lamaran belum meloloskan Anda ke tahap selanjutnya',
        date: '20 Agustus 2026'
      });
    }

    return logs;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[#0077C6] font-extrabold text-xs uppercase tracking-wider block mb-1">
              Portal Karir CDC UM Kendari
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Status Lamaran & Wawancara Saya
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Pantau perkembangan status lamaran, jadwal interview, dan riwayat seleksi lowongan Anda secara realtime.
            </p>
          </div>
        </div>

        {/* KARTU STATISTIK SAYA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Lamaran</div>
              <div className="text-xl font-black text-slate-900">{statTotal}</div>
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-amber-700/70 font-bold text-[10px] uppercase tracking-wider">Review / Admin</div>
              <div className="text-xl font-black text-amber-900">{statReview}</div>
            </div>
          </div>

          <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-purple-700/70 font-bold text-[10px] uppercase tracking-wider">Interview</div>
              <div className="text-xl font-black text-purple-900">{statInterview}</div>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-emerald-700/70 font-bold text-[10px] uppercase tracking-wider">Diterima</div>
              <div className="text-xl font-black text-emerald-900">{statAccepted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFIKASI JADWAL INTERVIEW AKTIF (JIKA ADA) */}
      {activeInterviewApps.map((appl) => (
        <div 
          key={appl.id} 
          className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-purple-500/30 relative overflow-hidden space-y-4 animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-400/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300 shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <span className="text-purple-300 font-extrabold text-[10px] uppercase tracking-wider block mb-0.5">
                  UNDANGAN WAWANCARA / INTERVIEW AKTIF
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {appl.tujuanMagang}
                </h3>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-purple-500/30 border border-purple-300/40 text-purple-200 text-xs font-extrabold tracking-wider uppercase w-fit">
              Status: INTERVIEW
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-purple-200 font-bold">
                <Calendar className="w-4 h-4 text-purple-300" />
                <span>Tanggal & Waktu Interview</span>
              </div>
              <div className="font-black text-white text-base">
                {formatDateDisplay(appl.interviewDate || '2026-08-15')} • {appl.interviewTime || '10:00 WITA'}
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-purple-200 font-bold">
                {appl.interviewMethod === 'online' ? <Video className="w-4 h-4 text-purple-300" /> : <MapPin className="w-4 h-4 text-purple-300" />}
                <span>Metode & Akses Pertemuan</span>
              </div>
              <div className="font-bold text-white text-xs sm:text-sm truncate">
                {appl.interviewMethod === 'online' ? (
                  appl.interviewLink ? (
                    <a 
                      href={appl.interviewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-200 hover:text-white underline inline-flex items-center gap-1 font-semibold"
                    >
                      Google Meet Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    'Online (Link Video Conference via Meet/Zoom)'
                  )
                ) : (
                  appl.interviewLocation || 'Kantor Perusahaan HRD (Offline)'
                )}
              </div>
            </div>
          </div>

          {appl.interviewNote && (
            <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-400/20 text-xs text-purple-100 font-medium leading-relaxed">
              <span className="font-bold text-purple-300 block mb-1 uppercase tracking-wider text-[10px]">📌 Catatan & Instruksi HRD Mitra:</span>
              "{appl.interviewNote}"
            </div>
          )}
        </div>
      ))}

      {/* DAFTAR KARTU LAMARAN MAHASISWA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Riwayat Pengajuan Lamaran ({myApplications.length})
        </h3>

        {myApplications.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-base">Belum Ada Lamaran</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Anda belum pernah mengajukan lamaran ke lowongan mana pun. Silakan cari lowongan menarik di menu Cari Lowongan!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myApplications.map((appl) => {
              const isExpanded = expandedAppId === appl.id;
              const matchingJob = allLowongan.find(j => j.id === appl.lowonganId || j.judul.toLowerCase() === appl.tujuanMagang.toLowerCase());
              const companyName = matchingJob?.namaInstansi || 'Mitra Industri UMK';

              return (
                <div 
                  key={appl.id} 
                  className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden transition shadow-2xs hover:shadow-xs space-y-0"
                >
                  {/* Card Header Info */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#0077C6]" />
                        <span className="font-bold text-slate-700">{companyName}</span>
                        <span>•</span>
                        <span className="font-mono">{formatDateDisplay(appl.createdAt || appl.tanggalMulai)}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-base sm:text-lg">
                        {appl.tujuanMagang}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div>{renderStatusBadge(appl.status)}</div>
                      <button
                        type="button"
                        onClick={() => setExpandedAppId(isExpanded ? null : appl.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title={isExpanded ? 'Sembunyikan Detail' : 'Tampilkan Detail & History'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Expand Toggle Trigger */}
                  <div className="px-5 py-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-semibold border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      NIM Pelamar: <strong className="font-mono text-slate-800">{appl.nim}</strong> ({appl.programStudi})
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedAppId(isExpanded ? null : appl.id)}
                      className="text-[#0077C6] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? 'Tutup Detail' : 'Lihat Detail Status & History'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* EXPANDED CONTENT PANEL */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-5 animate-fadeIn">
                      
                      {/* 1. INFORMASI JADWAL WAWANCARA (JIKA STATUS INTERVIEW) */}
                      {(appl.status || '').toLowerCase() === 'interview' && (
                        <div className="bg-purple-900 text-white p-5 rounded-2xl border border-purple-700 shadow-md space-y-3">
                          <div className="flex items-center gap-2 border-b border-purple-700/60 pb-2.5">
                            <Calendar className="w-4 h-4 text-purple-300" />
                            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                              JADWAL & METODE INTERVIEW WAWANCARA
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-purple-300 font-medium block text-[11px]">Tanggal & Waktu:</span>
                              <span className="font-bold text-white text-sm font-mono">
                                {formatDateDisplay(appl.interviewDate || '2026-08-15')} • {appl.interviewTime || '10:00 WITA'}
                              </span>
                            </div>
                            <div>
                              <span className="text-purple-300 font-medium block text-[11px]">Metode / Lokasi:</span>
                              <span className="font-bold text-white text-sm">
                                {appl.interviewMethod === 'online' ? (
                                  appl.interviewLink ? (
                                    <a 
                                      href={appl.interviewLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-purple-200 hover:text-white underline inline-flex items-center gap-1"
                                    >
                                      Google Meet Link <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    'Online (Google Meet / Zoom)'
                                  )
                                ) : (
                                  appl.interviewLocation || 'Offline (Tatap Muka di Kantor HRD)'
                                )}
                              </span>
                            </div>
                          </div>

                          {appl.interviewNote && (
                            <div className="pt-2 border-t border-purple-800 text-xs text-purple-100 font-medium">
                              <span className="font-bold text-purple-300 block mb-0.5">Catatan Instruksi HRD Mitra:</span>
                              "{appl.interviewNote}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. BANNER HASIL AKHIR (DITERIMA / DITOLAK) */}
                      {((appl.status || '').toLowerCase() === 'accepted' || (appl.status || '').toLowerCase() === 'diterima') && (
                        <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-md space-y-1.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            <h4 className="font-black text-white text-base">Selamat! Anda Diterima</h4>
                          </div>
                          <p className="text-xs text-emerald-50 font-medium leading-relaxed">
                            Lamaran Anda telah disetujui oleh tim HRD <strong>{companyName}</strong>. Pihak perusahaan/admin CDC akan menghubungi Anda untuk tahap induksi dan pemberkasan program.
                          </p>
                        </div>
                      )}

                      {((appl.status || '').toLowerCase() === 'rejected' || (appl.status || '').toLowerCase() === 'ditolak') && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 sm:p-5 rounded-2xl space-y-1">
                          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Lamaran Belum Berhasil</span>
                          </div>
                          <p className="text-xs text-rose-600 font-medium leading-relaxed">
                            Terima kasih atas partisipasi Anda melamar di <strong>{companyName}</strong>. Saat ini kualifikasi Anda belum sesuai dengan posisi yang dibutuhkan. Tetap semangat melamar lowongan lain yang tersedia!
                          </p>
                        </div>
                      )}

                      {/* 3. TIMELINE RIWAYAT SELEKSI (HISTORY STATUS) */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#0077C6]" />
                            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                              TIMELINE RIWAYAT SELEKSI
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {getHistoryLogs(appl).length} Tahap
                          </span>
                        </div>

                        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
                          {getHistoryLogs(appl).map((log, idx) => (
                            <div key={idx} className="relative flex items-start justify-between gap-3">
                              {/* Circle Bullet */}
                              <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 bg-white transition-all ${
                                log.status === 'accepted' || log.status === 'diterima'
                                  ? 'border-emerald-500 bg-emerald-500 ring-4 ring-emerald-100'
                                  : log.status === 'rejected' || log.status === 'ditolak'
                                  ? 'border-rose-500 bg-rose-500 ring-4 ring-rose-100'
                                  : log.status === 'interview'
                                  ? 'border-purple-500 bg-purple-500 ring-4 ring-purple-100'
                                  : 'border-[#0077C6] bg-[#0077C6] ring-4 ring-blue-100'
                              }`} />

                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {log.label}
                                </div>
                                {log.note && (
                                  <p className="text-xs text-slate-500 italic mt-0.5 font-medium">
                                    "{log.note}"
                                  </p>
                                )}
                              </div>

                              <div className="text-[11px] font-mono text-slate-500 font-semibold shrink-0 whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                                {log.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. DETAIL BERKAS & SURAT PENGANTAR (PDF/LETTER) */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                        <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          Berkas & Surat Pengantar Pelamar
                        </div>
                        {appl.catatan && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 italic leading-relaxed">
                            "{appl.catatan}"
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500 font-medium">File CV Terunggah:</span>
                          <span className="font-bold text-emerald-700 font-mono">{appl.berkasNama || 'CV_Mahasiswa.pdf'}</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
