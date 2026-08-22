import React from 'react';
import { 
  User as UserType, 
  Mahasiswa, 
  Lowongan, 
  PengajuanMagang
} from '../types';
import { getFromDB } from '../data';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  MapPin, 
  Video
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
  allLowongan
}) => {
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
              Status Lamaran &amp; Wawancara Saya
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Pantau perkembangan status lamaran dan jadwal interview lowongan Anda secara realtime.
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

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0077C6]/10 text-[#0077C6] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-blue-700/70 font-bold text-[10px] uppercase tracking-wider">Interview</div>
              <div className="text-xl font-black text-blue-900">{statInterview}</div>
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

      {/* NOTIFIKASI JADWAL INTERVIEW AKTIF (WARNA POLOS / CLEAN INSTITUTIONAL CARD) */}
      {activeInterviewApps.length > 0 ? (
        activeInterviewApps.map((appl) => {
          const matchingJob = allLowongan.find(j => j.id === appl.lowonganId || j.judul.toLowerCase() === appl.tujuanMagang.toLowerCase());
          const companyName = matchingJob?.namaInstansi || 'Mitra Industri UMK';

          return (
            <div 
              key={appl.id} 
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5 animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0077C6] shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block mb-0.5">
                      UNDANGAN WAWANCARA / INTERVIEW AKTIF
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {appl.tujuanMagang}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-[#0077C6]" />
                      <span className="font-bold text-slate-700">{companyName}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0077C6] text-xs font-extrabold tracking-wider uppercase w-fit">
                  Status: INTERVIEW
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Tanggal &amp; Waktu Interview</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-base font-mono">
                    {formatDateDisplay(appl.interviewDate || '2026-08-15')} • {appl.interviewTime || '10:00 WITA'}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    {appl.interviewMethod === 'online' ? <Video className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                    <span>Metode &amp; Akses Pertemuan</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {appl.interviewMethod === 'online' ? (
                      appl.interviewLink ? (
                        <a 
                          href={appl.interviewLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0077C6] hover:underline inline-flex items-center gap-1 font-semibold"
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px]">Catatan &amp; Instruksi HRD Mitra:</span>
                  "{appl.interviewNote}"
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-base">Belum Ada Undangan Wawancara</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
            Saat mitra industri menjadwalkan sesi interview untuk lamaran Anda, informasi detail jadwal dan akses wawancara akan tampil di sini.
          </p>
        </div>
      )}

    </div>
  );
};
