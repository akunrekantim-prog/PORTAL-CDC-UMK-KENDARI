import React, { useState, useMemo, useEffect } from 'react';
import {
  User as UserType,
  Mahasiswa,
  Lowongan,
  PengajuanMagang
} from '../types';
import { getFromDB, DEFAULT_SAMPLE_PDF_DATA_URL } from '../data';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Video,
  Search,
  FileText,
  XCircle,
  ArrowRight,
  Filter,
  Eye,
  Download,
  X
} from 'lucide-react';

interface StudentApplicationsViewProps {
  user: UserType;
  mahasiswaData: Mahasiswa | null;
  allLowongan: Lowongan[];
  onSelectJob?: (job: Lowongan) => void;
  onNavigateToSearch?: () => void;
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

const getStatusBadge = (status?: string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'accepted':
    case 'diterima':
    case 'completed':
      return {
        label: 'Diterima',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        icon: CheckCircle2
      };
    case 'rejected':
    case 'ditolak':
      return {
        label: 'Ditolak',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        dotColor: 'bg-rose-500',
        icon: XCircle
      };
    case 'interview':
      return {
        label: 'Interview',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        dotColor: 'bg-purple-500',
        icon: Video
      };
    case 'seleksi_administrasi':
      return {
        label: 'Seleksi Administrasi',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        dotColor: 'bg-blue-500',
        icon: Clock
      };
    case 'under_review':
    case 'menunggu_review':
    case 'submitted':
    case 'draft':
    default:
      return {
        label: 'Menunggu Review',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
        icon: Clock
      };
  }
};

// Safe helper to create Blob URL from base64 data URI
const createBlobUrl = (dataUri?: string, defaultMime = 'application/pdf'): string => {
  if (!dataUri || dataUri === '#') return '';
  if (!dataUri.startsWith('data:')) return dataUri;

  try {
    const parts = dataUri.split(',');
    let mime = defaultMime;
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) mime = mimeMatch[1];
    
    // Auto-detect image signatures in base64 if mistakenly marked as PDF
    const b64Data = parts[1] || '';
    if (b64Data.startsWith('iVBORw0KGgo')) {
      mime = 'image/png';
    } else if (b64Data.startsWith('/9j/')) {
      mime = 'image/jpeg';
    }

    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error creating Blob URL:', err);
    return dataUri;
  }
};

// Safe helper to download document
const downloadDocument = (url?: string, filename?: string) => {
  const targetUrl = url && url !== '#' ? url : DEFAULT_SAMPLE_PDF_DATA_URL;
  const name = filename || 'CV_Pelamar.pdf';

  try {
    if (targetUrl.startsWith('data:')) {
      const parts = targetUrl.split(',');
      let mime = 'application/pdf';
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mime = mimeMatch[1];
      const b64Data = parts[1] || '';
      if (b64Data.startsWith('iVBORw0KGgo')) mime = 'image/png';
      else if (b64Data.startsWith('/9j/')) mime = 'image/jpeg';

      const byteCharacters = atob(b64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
    } else {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    window.open(targetUrl, '_blank');
  }
};

export const StudentApplicationsView: React.FC<StudentApplicationsViewProps> = ({
  user,
  mahasiswaData,
  allLowongan,
  onSelectJob,
  onNavigateToSearch
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDetailModal, setSelectedDetailModal] = useState<PengajuanMagang | null>(null);
  
  // In-app Document Viewer Modal state
  const [viewingDocModal, setViewingDocModal] = useState<{
    url: string;
    fileName: string;
    studentName?: string;
  } | null>(null);

  // Active Blob URL for the viewer
  const [activeViewerBlobUrl, setActiveViewerBlobUrl] = useState<string>('');

  useEffect(() => {
    if (viewingDocModal) {
      const bUrl = createBlobUrl(viewingDocModal.url || DEFAULT_SAMPLE_PDF_DATA_URL);
      setActiveViewerBlobUrl(bUrl);

      return () => {
        if (bUrl && bUrl.startsWith('blob:')) {
          URL.revokeObjectURL(bUrl);
        }
      };
    } else {
      setActiveViewerBlobUrl('');
    }
  }, [viewingDocModal]);

  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setSyncTick(t => t + 1);
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Fetch applications for this logged-in student
  const allApplications = getFromDB<PengajuanMagang>('pengajuan_magang');
  const myApplications = useMemo(() => {
    const apps = allApplications.filter(a =>
      a.userId === user.id ||
      (mahasiswaData && a.nim && a.nim === mahasiswaData.nim) ||
      a.mahasiswaId === `mhs_${user.id}` ||
      (mahasiswaData && a.mahasiswaId === mahasiswaData.id) ||
      a.namaMahasiswa === user.name
    );
    return apps.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.tanggalMulai || 0).getTime();
      const timeB = new Date(b.createdAt || b.tanggalMulai || 0).getTime();
      return timeB - timeA;
    });
  }, [allApplications, user.id, user.name, mahasiswaData, syncTick]);

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

  // Filtered applications for the full history section
  const filteredApplications = useMemo(() => {
    return myApplications.filter(appl => {
      // Status Filter
      if (statusFilter !== 'all') {
        const s = (appl.status || '').toLowerCase();
        if (statusFilter === 'review' && !(s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'seleksi_administrasi' || s === 'draft')) return false;
        if (statusFilter === 'interview' && s !== 'interview') return false;
        if (statusFilter === 'accepted' && !(s === 'accepted' || s === 'diterima' || s === 'completed')) return false;
        if (statusFilter === 'rejected' && !(s === 'rejected' || s === 'ditolak')) return false;
      }

      // Keyword Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const posMatch = (appl.tujuanMagang || '').toLowerCase().includes(query);
        const compMatch = (appl.namaInstansi || '').toLowerCase().includes(query);
        if (!posMatch && !compMatch) return false;
      }

      return true;
    });
  }, [myApplications, statusFilter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 font-sans animate-fadeIn">

      {/* 1. HEADER & SUMMARY STATISTICS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 border border-slate-200 shadow-xs space-y-4 sm:space-y-6">
        <div className="border-b border-slate-100 pb-3 sm:pb-5">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Status Lamaran &amp; Wawancara Saya
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 font-medium leading-relaxed">
            Pantau perkembangan status berkas lamaran dan jadwal interview lowongan Anda secara realtime.
          </p>
        </div>

        {/* KARTU STATISTIK SAYA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider truncate">Total</div>
              <div className="text-base sm:text-xl font-black text-slate-900 leading-tight">{statTotal}</div>
            </div>
          </div>

          <div className="bg-amber-50/60 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200/80 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-amber-700/70 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider truncate">Review</div>
              <div className="text-base sm:text-xl font-black text-amber-900 leading-tight">{statReview}</div>
            </div>
          </div>

          <div className="bg-purple-50/60 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-200/80 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-purple-700/70 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider truncate">Interview</div>
              <div className="text-base sm:text-xl font-black text-purple-900 leading-tight">{statInterview}</div>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200/80 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-emerald-700/70 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider truncate">Diterima</div>
              <div className="text-base sm:text-xl font-black text-emerald-900 leading-tight">{statAccepted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UNDANGAN INTERVIEW AKTIF (JIKA ADA) */}
      {activeInterviewApps.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
            <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Undangan Wawancara / Interview Aktif ({activeInterviewApps.length})
            </h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {activeInterviewApps.map((appl) => {
              const matchingJob = allLowongan.find(j => j.id === appl.lowonganId || j.judul.toLowerCase() === appl.tujuanMagang.toLowerCase());
              const companyName = matchingJob?.namaInstansi || appl.namaInstansi || 'Mitra Industri UMK';

              return (
                <div
                  key={appl.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-purple-200 shadow-xs space-y-4 animate-fadeIn"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-purple-600 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider block mb-0.5">
                          JADWAL WAWANCARA RESMI MITRA
                        </span>
                        <h4 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug truncate">
                          {appl.tujuanMagang}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#0077C6] shrink-0" />
                          <span className="font-bold text-slate-700 truncate">{companyName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase w-fit self-start sm:self-auto">
                      Status: INTERVIEW
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tanggal &amp; Waktu Interview</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm sm:text-base font-mono">
                        {formatDateDisplay(appl.interviewDate || '2026-08-15')} • {appl.interviewTime || '10:00 WITA'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                        {appl.interviewMethod === 'online' ? <Video className="w-3.5 h-3.5 text-slate-400" /> : <MapPin className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Metode &amp; Akses</span>
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
                              Buka Link Interview <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            'Online (Video Conference)'
                          )
                        ) : (
                          appl.interviewLocation || 'Kantor Perusahaan HRD (Offline)'
                        )}
                      </div>
                    </div>
                  </div>

                  {appl.interviewNote && (
                    <div className="bg-purple-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-100 text-xs text-purple-900 font-medium leading-relaxed">
                      <span className="font-bold text-purple-950 block mb-0.5 uppercase tracking-wider text-[9px] sm:text-[10px]">Catatan &amp; Instruksi HRD:</span>
                      &quot;{appl.interviewNote}&quot;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAFTAR SELURUH RIWAYAT LAMARAN */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 border border-slate-200 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 sm:pb-5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                Semua Riwayat Pengajuan Lamaran ({myApplications.length})
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Daftar seluruh lowongan kerja dan magang yang telah Anda lamar melalui portal CDC.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari posisi atau instansi..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-slate-50 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1 mr-0.5">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'review', label: 'Menunggu / Review' },
            { id: 'interview', label: 'Interview' },
            { id: 'accepted', label: 'Diterima' },
            { id: 'rejected', label: 'Ditolak' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#0077C6] text-white border-[#0077C6] shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List of Applications */}
        {filteredApplications.length === 0 ? (
          <div className="py-10 sm:py-14 px-3 text-center space-y-3 bg-slate-50/60 rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            {myApplications.length === 0 ? (
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">Belum Ada Lamaran yang Diajukan</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mx-auto">
                  Anda belum pernah mengajukan lamaran ke lowongan pekerjaan atau magang manapun.
                </p>
                {onNavigateToSearch && (
                  <button
                    onClick={onNavigateToSearch}
                    className="mt-2 inline-flex items-center gap-1.5 bg-[#0077C6] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition"
                  >
                    <span>Cari &amp; Lamar Lowongan</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">Tidak Ditemukan Lamaran yang Sesuai</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mx-auto">
                  Silakan ubah filter status atau kata kunci pencarian Anda.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-1 text-xs font-bold text-[#0077C6] hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((appl) => {
              const matchingJob = allLowongan.find(
                j => j.id === appl.lowonganId || j.judul.toLowerCase() === appl.tujuanMagang.toLowerCase()
              );
              const companyName = matchingJob?.namaInstansi || appl.namaInstansi || 'Mitra Industri CDC UMK';
              const badge = getStatusBadge(appl.status);

              return (
                <div
                  key={appl.id}
                  className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-[#0077C6]/40 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-orange-600 uppercase tracking-wide truncate max-w-[200px] sm:max-w-none">
                        {companyName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">
                        Diajukan: {formatDateDisplay(appl.createdAt || appl.tanggalMulai)}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {appl.tujuanMagang}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500">
                      {appl.lokasiMagang && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {appl.lokasiMagang}
                        </span>
                      )}
                      {appl.berkasNama && (
                        <span className="flex items-center gap-1 text-slate-600 truncate max-w-[200px] sm:max-w-none">
                          <FileText className="w-3 h-3 text-[#0077C6] shrink-0" /> {appl.berkasNama}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer - Responsive Wrap for mobile */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                    <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold border shadow-2xs flex items-center gap-1.5 ${badge.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                      <span>{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailModal(appl)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Lihat Detail Lamaran"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Detail</span>
                      </button>

                      {matchingJob && onSelectJob && (
                        <button
                          type="button"
                          onClick={() => onSelectJob(matchingJob)}
                          className="bg-blue-50 hover:bg-blue-100 text-[#0077C6] border border-blue-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Buka Halaman Lowongan Ini"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Lowongan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL DETAIL STATUS LAMARAN */}
      {selectedDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 relative my-4 sm:my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center font-bold">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    Detail Pengajuan Lamaran
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {selectedDetailModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 font-medium">Posisi:</span>
                  <span className="font-extrabold text-slate-900 text-right truncate">{selectedDetailModal.tujuanMagang}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 font-medium">Mitra Industri:</span>
                  <span className="font-bold text-[#0077C6] text-right truncate">{selectedDetailModal.namaInstansi || 'Mitra Industri UMK'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 font-medium">Tanggal Melamar:</span>
                  <span className="font-medium text-slate-700">{formatDateDisplay(selectedDetailModal.createdAt || selectedDetailModal.tanggalMulai)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/70">
                  <span className="text-slate-500 font-medium">Status Terkini:</span>
                  {(() => {
                    const badge = getStatusBadge(selectedDetailModal.status);
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] sm:text-[11px] ${badge.color}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {selectedDetailModal.catatan && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Surat Pengantar / Catatan Pelamar:</span>
                  <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 text-slate-600 leading-relaxed italic text-[11px]">
                    &quot;{selectedDetailModal.catatan}&quot;
                  </div>
                </div>
              )}

              {selectedDetailModal.catatanAdmin && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Catatan Tim Penyeleksi / HRD:</span>
                  <div className="bg-blue-50/70 p-2.5 sm:p-3 rounded-xl border border-blue-200 text-blue-900 leading-relaxed font-medium text-[11px]">
                    {selectedDetailModal.catatanAdmin}
                  </div>
                </div>
              )}

              {/* BERKAS CV ATTACHMENT ACTION BAR */}
              <div className="pt-0.5 flex flex-wrap items-center justify-between bg-slate-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 gap-2">
                <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
                  <FileText className="w-4 h-4 text-[#0077C6] shrink-0" />
                  <span className="font-bold text-slate-800 text-[11px] truncate">
                    {selectedDetailModal.berkasNama || 'CV_Pelamar.pdf'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingDocModal({
                        url: selectedDetailModal.berkasUrl || DEFAULT_SAMPLE_PDF_DATA_URL,
                        fileName: selectedDetailModal.berkasNama || 'CV_Pelamar.pdf',
                        studentName: selectedDetailModal.namaMahasiswa
                      });
                    }}
                    className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat CV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadDocument(
                        selectedDetailModal.berkasUrl || DEFAULT_SAMPLE_PDF_DATA_URL,
                        selectedDetailModal.berkasNama || 'CV_Pelamar.pdf'
                      );
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                    title="Unduh Berkas CV"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. IN-APP INTERACTIVE CV / DOKUMEN PREVIEW MODAL */}
      {viewingDocModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-3xl w-full rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden my-2 sm:my-6 max-h-[92vh]">
            
            {/* Header */}
            <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#0077C6] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Dokumen CV &amp; Portofolio Pelamar
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {viewingDocModal.fileName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadDocument(viewingDocModal.url, viewingDocModal.fileName)}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Unduh Berkas"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeViewerBlobUrl) {
                      window.open(activeViewerBlobUrl, '_blank');
                    } else {
                      window.open(viewingDocModal.url, '_blank');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Buka di Tab Baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tab Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDocModal(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="p-3 sm:p-5 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[50vh] max-h-[70vh]">
              {(() => {
                const url = viewingDocModal.url || '';
                const isImage = url.startsWith('data:image/') || 
                  url.includes('iVBORw0KGgo') || 
                  url.includes('/9j/') || 
                  viewingDocModal.fileName.toLowerCase().endsWith('.png') || 
                  viewingDocModal.fileName.toLowerCase().endsWith('.jpg') || 
                  viewingDocModal.fileName.toLowerCase().endsWith('.jpeg');

                if (isImage) {
                  return (
                    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xs max-h-full overflow-auto flex items-center justify-center w-full">
                      <img
                        src={activeViewerBlobUrl || url}
                        alt={viewingDocModal.fileName}
                        className="max-h-[62vh] max-w-full object-contain rounded-lg shadow-2xs"
                      />
                    </div>
                  );
                }

                // If PDF
                if (activeViewerBlobUrl) {
                  return (
                    <div className="w-full h-full min-h-[60vh] bg-white rounded-xl shadow-xs overflow-hidden flex flex-col">
                      <iframe
                        src={`${activeViewerBlobUrl}#toolbar=1`}
                        className="w-full flex-1 border-0 rounded-xl"
                        title="PDF Viewer"
                      />
                    </div>
                  );
                }

                return (
                  <div className="bg-white p-8 rounded-2xl shadow-sm text-center space-y-4 max-w-md mx-auto">
                    <div className="w-12 h-12 bg-blue-50 text-[#0077C6] rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-sm">Berkas Siap Ditinjau</h4>
                      <p className="text-xs text-slate-500">
                        {viewingDocModal.fileName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDocument(viewingDocModal.url, viewingDocModal.fileName)}
                      className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Unduh Dokumen CV
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                {viewingDocModal.studentName ? `Pemilik Berkas: ${viewingDocModal.studentName}` : 'CV Pelamar Resmi UMK'}
              </span>
              <button
                type="button"
                onClick={() => setViewingDocModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer ml-auto"
              >
                Tutup Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
