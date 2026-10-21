import React, { useState, useEffect } from 'react';
import {
  Search,
  Info,
  Building2,
  Clock,
  MapPin,
  Briefcase,
  Layers,
  Banknote,
  Users,
  Calendar,
  Bookmark,
  Send,
  CheckCircle2,
  Check,
  Award
} from 'lucide-react';
import { Lowongan } from '../../types';
import {
  sortJobsByNewest,
  formatDateDisplay,
  applyForJob,
  getSavedJobIds,
  toggleSaveJob,
  isJobDeadlinePassed
} from '../../data';
import Pagination from './ui/Pagination';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { useLayanan } from './LayananContainer';
import { JobApplicationModal } from '../JobApplicationModal';

interface MagangProps {
  lowongan?: Lowongan[];
  onSelectLowongan?: (id: string) => void;
}

// Helper to safely parse strings / arrays
const toCleanStringArray = (val: unknown): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter((item) => item.length > 0);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
            .filter((item) => item.length > 0);
        }
      } catch {
        // Fallback to newline split
      }
    }
    return trimmed
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
};

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200&auto=format&fit=crop';

export default function Magang({ lowongan = [], onSelectLowongan }: MagangProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMagang, setSelectedMagang] = useState<Lowongan | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { setIsDetailActive } = useLayanan();
  const itemsPerPage = 6;

  // Active student user lookup for saved jobs
  const activeUserId = typeof window !== 'undefined' ? localStorage.getItem('cdc_session_id') || '' : '';
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => getSavedJobIds(activeUserId || undefined));

  // Sinkronkan status detail ke LayananContainer agar header disembunyikan persis Campus Hiring
  useEffect(() => {
    setIsDetailActive(selectedMagang !== null);
  }, [selectedMagang, setIsDetailActive]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenDetail = (item: Lowongan) => {
    setSelectedMagang(item);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedMagang(null);
    window.scrollTo(0, 0);
  };

  const handleToggleSave = (jobId: string) => {
    const isNowSaved = toggleSaveJob(jobId, activeUserId || undefined);
    setSavedJobIds(getSavedJobIds(activeUserId || undefined));
    if (isNowSaved) {
      showToast('Lowongan magang berhasil disimpan ke daftar favorit.');
    } else {
      showToast('Lowongan magang dihapus dari daftar simpanan.');
    }
  };

  const handleApplySubmit = (formData: any) => {
    if (!selectedMagang) return;
    applyForJob(selectedMagang.id, {
      ...formData,
      userId: activeUserId || 'guest',
      namaMahasiswa: formData.applicantName || 'Mahasiswa UMK'
    });
    showToast('Lamaran magang berhasil dikirim!');
  };

  // Safe poster banner
  const getBannerImage = (item: Lowongan): string => {
    if (item.bannerImage) return item.bannerImage;
    if (item.imageUrl) return item.imageUrl;
    if (item.flyer) return item.flyer;
    const flyers = item.flyers as unknown;
    if (Array.isArray(flyers) && flyers.length > 0 && flyers[0]) return flyers[0];
    if (typeof flyers === 'string' && flyers.trim()) {
      try {
        const parsed = JSON.parse(flyers);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {
        return flyers;
      }
    }
    return DEFAULT_POSTER;
  };

  // Filter published magang lowongan
  const publishedMagang = sortJobsByNewest(
    lowongan.filter((l) => l.status === 'published' && l.tipe === 'magang')
  );

  const filteredLowongan = publishedMagang.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.judul || '').toLowerCase().includes(q) ||
      (item.namaInstansi || '').toLowerCase().includes(q) ||
      (item.lokasi || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredLowongan.length / itemsPerPage);
  const paginatedLowongan = filteredLowongan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.max(1, totalPages)) {
      setCurrentPage(newPage);
    }
  };

  // ===== TAMPILAN DETAIL EDITORIAL BERGAYA CAMPUS HIRING =====
  if (selectedMagang) {
    const isDeadlinePassed = isJobDeadlinePassed(selectedMagang.deadline);
    const isSaved = savedJobIds.includes(selectedMagang.id);
    const rawPersyaratan = (selectedMagang as any).persyaratan;
    const requirements = [
      ...(rawPersyaratan ? toCleanStringArray(rawPersyaratan) : []),
      ...toCleanStringArray(selectedMagang.kualifikasi)
    ];
    const skills = toCleanStringArray(selectedMagang.keahlian);
    const benefits = toCleanStringArray(selectedMagang.benefit);

    return (
      <div id="layanan-magang-detail" className="relative">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-24 right-5 z-50 bg-[#1E3A8A] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-800 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-semibold max-w-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        <ShareableDetailPage
          title={selectedMagang.judul}
          categoryLabel="Internship"
          imageUrl={getBannerImage(selectedMagang)}
          posterAspect={(selectedMagang as any).posterAspect || '16:9'}
          uploadDateLabel={formatDateDisplay(selectedMagang.createdAt)}
          onBack={handleBackToList}
          metaItems={[
            <span key="instansi" className="font-semibold text-slate-800">
              {selectedMagang.namaInstansi}
            </span>,
            ...(selectedMagang.lokasi
              ? [<span key="lokasi">{selectedMagang.lokasi}</span>]
              : []),
            ...(selectedMagang.deadline
              ? [<span key="deadline">Batas: {formatDateDisplay(selectedMagang.deadline)}</span>]
              : [])
          ]}
        >
          <div className="space-y-8 pt-2">
            {/* Action buttons (Lamar Magang & Simpan) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  disabled={isDeadlinePassed}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isDeadlinePassed
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0077C6] text-white hover:bg-[#005fa0] active:scale-[0.98] cursor-pointer shadow-xs'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isDeadlinePassed ? 'Pendaftaran Ditutup' : 'Lamar Magang'}
                </button>

                <button
                  onClick={() => handleToggleSave(selectedMagang.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition cursor-pointer ${
                    isSaved
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  {isSaved ? 'Tersimpan' : 'Simpan'}
                </button>
              </div>

              <span className="text-xs text-slate-400">
                {selectedMagang.namaInstansi}{selectedMagang.lokasi ? ` · ${selectedMagang.lokasi}` : ''}
              </span>
            </div>

            {/* 2. DESKRIPSI PROGRAM MAGANG */}
            {selectedMagang.deskripsi && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Deskripsi Pekerjaan
                </h3>
                <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {selectedMagang.deskripsi}
                </div>
              </div>
            )}

            {/* 3. PERSYARATAN & KUALIFIKASI */}
            {requirements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Persyaratan &amp; Kualifikasi
                </h3>
                <ul className="space-y-2.5">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. KEAHLIAN YANG DIBUTUHKAN */}
            {skills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Keahlian yang Dibutuhkan
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 5. BENEFIT & FASILITAS KOMPENSASI */}
            {benefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Benefit &amp; Fasilitas Kompensasi
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 text-sm font-medium"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. CTA BANNER BAWAH */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md min-w-0">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-base sm:text-lg">
                  Tertarik Magang di {selectedMagang.namaInstansi}?
                </h4>
                <p className="text-blue-200 text-xs sm:text-sm max-w-xl">
                  Segera siapkan CV &amp; portofolio Anda, kemudian ajukan lamaran sebelum batas waktu{' '}
                  {selectedMagang.deadline ? formatDateDisplay(selectedMagang.deadline) : 'berakhir'}.
                </p>
              </div>

              <button
                onClick={() => setIsApplyModalOpen(true)}
                disabled={isDeadlinePassed}
                className={`px-6 py-3 rounded-xl font-extrabold text-sm shadow-md transition-all shrink-0 cursor-pointer ${
                  isDeadlinePassed
                    ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                    : 'bg-white text-blue-900 hover:bg-blue-50 active:scale-95'
                }`}
              >
                {isDeadlinePassed ? 'Ditutup' : 'Lamar Sekarang'}
              </button>
            </div>
          </div>
        </ShareableDetailPage>

        {/* Modal Lamaran Magang Resmi */}
        <JobApplicationModal
          job={selectedMagang}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={handleApplySubmit}
        />
      </div>
    );
  }

  // ===== DAFTAR CARD (LIST MAGANG) =====
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 min-w-0" id="layanan-magang">
      {/* Keterangan Pengantar */}
      <div>
        <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
          Temukan berbagai kesempatan magang industri resmi dari perusahaan dan instansi mitra terpercaya CDC UM Kendari untuk mengasah keterampilan praktis, memperluas wawasan kerja nyata, serta mengakselerasi kesiapan karir profesional Anda.
        </p>
      </div>

      {/* Controls Bar: Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari lowongan magang, instansi, atau lokasi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D] shadow-2xs"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredLowongan.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">Tidak Ada Lowongan Magang Ditemukan</h3>
          <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau cari posisi magang lainnya.</p>
        </div>
      ) : (
        /* 3-Column Card Grid */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLowongan.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenDetail(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenDetail(item);
                  }
                }}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
              >
                {item.sumber === 'admin' ? (
                  /* Poster admin: full-bleed 16:9 sejajar card Campus Hiring */
                  <div className="relative overflow-hidden border-b border-slate-100 bg-slate-900 aspect-[16/9] shrink-0">
                    <img
                      src={getBannerImage(item)}
                      alt={item.namaInstansi}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  /* Logo mitra: contain + padding agar tidak gepeng */
                  <div className="relative overflow-hidden border-b border-slate-100 bg-white flex items-center justify-center aspect-[16/9] p-6 shrink-0">
                    {item.companyLogo ? (
                      <img
                        src={item.companyLogo}
                        alt={item.namaInstansi}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 space-y-1">
                        <Building2 className="w-10 h-10 text-slate-400" />
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                          {item.namaInstansi}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="text-xs font-bold text-orange-600 tracking-wide uppercase truncate">
                      {item.namaInstansi}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2 mt-1">
                      {item.judul}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-auto">
                    {item.sumber === 'admin' ? (
                      <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
                    ) : (
                      <span className="whitespace-nowrap font-medium text-slate-400">by Mitra</span>
                    )}
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {formatDateDisplay(item.createdAt || item.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
