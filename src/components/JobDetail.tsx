import React, { useState } from 'react';
import { Lowongan } from '../types';
import { getFromDB, applyForJob, getSavedJobIds, toggleSaveJob } from '../data';
import Header from './Header';
import { Footer } from './Footer';
import { 
  ChevronLeft, 
  Building2, 
  MapPin, 
  Briefcase, 
  Clock, 
  Users, 
  Calendar,
  Bookmark,
  Check,
  Share2,
  Link2,
  Mail,
  Search,
  X,
  UploadCloud,
  CheckCircle2,
  Layers,
  Banknote,
  Maximize2
} from 'lucide-react';
import { JobApplicationModal } from './JobApplicationModal';


interface JobDetailProps {
  job: Lowongan;
  onBack: () => void;
  onApply?: () => void;
  onSelectJob?: (id: string) => void;
  setTab?: (tab: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
  isLoggedIn?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const JobDetail: React.FC<JobDetailProps> = ({ 
  job, 
  onBack, 
  onApply, 
  onSelectJob,
  setTab,
  onNavigateToLogin,
  onNavigateToRegister,
  isLoggedIn = false,
  hideHeader = false,
  hideFooter = false
}) => {
  const defaultPoster = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop';
  const defaultLogo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop';

  // Determine cover banner image
  const flyersList = (job.flyers && job.flyers.length > 0) 
    ? job.flyers 
    : [job.imageUrl || job.flyer || job.bannerImage || defaultPoster];
  const coverImage = flyersList[0];
  const logoUrl = job.companyLogo || defaultLogo;

  // React States for Interactivity
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    return getSavedJobIds().includes(job.id);
  });
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);


  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sidebar Recent Postings Search Filter
  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Fetch all jobs for "Postingan Terbaru" widget
  const allLowongan = getFromDB<Lowongan>('lowongan');
  const recentJobs = allLowongan
    .filter(l => l.id !== job.id && l.status === 'published')
    .filter(l => 
      l.judul.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      l.namaInstansi.toLowerCase().includes(sidebarSearch.toLowerCase())
    )
    .slice(0, 3);

  // Handlers
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleToggleSave = () => {
    const nextState = toggleSaveJob(job.id);
    setIsSaved(nextState);
    triggerToast(nextState ? 'Lowongan berhasil disimpan ke favorit!' : 'Lowongan dihapus dari favorit.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('Tautan lowongan berhasil disalin ke clipboard!');
  };

  const resetModal = () => {
    setIsApplyModalOpen(false);
  };


  return (
    <div className="bg-white min-h-screen flex flex-col justify-between text-slate-800 font-sans" id="job-detail-root">

      
      {/* 1. Global Header Component */}
      {!hideHeader && (
        <Header
          currentTab="lowongan"
          setTab={setTab || (() => {})}
          onNavigateToLogin={onNavigateToLogin || (() => {})}
          onNavigateToRegister={onNavigateToRegister}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-24 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[#0077C6] hover:text-blue-800 font-bold text-sm transition group"
              id="job-back-link"
            >
              <ChevronLeft className="w-4 h-4 text-[#0077C6] group-hover:-translate-x-0.5 transition-transform" /> 
              <span>Kembali ke Lowongan</span>
            </button>
          </div>

          {/* 2-Column Grid Layout (Main Content: 8 cols, Sidebar: 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            
            {/* LEFT COLUMN: Main Job Details (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top Large Banner Image Container (9:16 Portrait Aspect Ratio, Full Width) */}
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs group cursor-pointer flex items-center justify-center"
              >
                <img 
                  src={coverImage} 
                  alt={job.judul}
                  className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/95 backdrop-blur-xs text-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" /> Perbesar Poster (9:16)
                  </span>
                </div>
              </div>

              {/* Header Box: Job Title, Instansi, Location, Posted Date & Lamar Sekarang CTA */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  <div className="space-y-2 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {job.judul}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{job.namaInstansi}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{job.lokasi}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Diposting: <strong className="font-mono text-slate-700">{job.createdAt ? job.createdAt.split('T')[0] : '2026-08-04'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Lamar Sekarang Button */}
                  <button
                    onClick={() => {
                      if (!isLoggedIn && onNavigateToRegister) {
                        onNavigateToRegister('alumni');
                      } else {
                        setIsApplyModalOpen(true);
                      }
                    }}

                    className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs transition shrink-0 self-start active:scale-95"
                    id="btn-lamar-sekarang-top"
                  >
                    Lamar Sekarang
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-4" />

                {/* Section 1: Deskripsi Pekerjaan */}
                <div className="space-y-2">
                  <h2 className="text-lg font-extrabold text-slate-900">Deskripsi Pekerjaan</h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {job.deskripsi}
                  </p>
                </div>

                {/* Section 2: Tanggung Jawab */}
                {job.tanggungJawab && job.tanggungJawab.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Tanggung Jawab</h2>
                    <ul className="space-y-1.5 text-slate-600 text-sm list-disc pl-5">
                      {job.tanggungJawab.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 3: Persyaratan & Kualifikasi */}
                {job.kualifikasi && job.kualifikasi.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Persyaratan &amp; Kualifikasi</h2>
                    <ul className="space-y-1.5 text-slate-600 text-sm list-disc pl-5">
                      {job.kualifikasi.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 4: Keahlian yang Dibutuhkan */}
                <div className="space-y-2 pt-2">
                  <h2 className="text-lg font-extrabold text-slate-900">Keahlian yang Dibutuhkan</h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(job.keahlian && job.keahlian.length > 0
                      ? job.keahlian 
                      : ['JavaScript', 'React.js', 'Node.js', 'Git', 'Problem Solving']
                    ).map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar Summary Table & Widgets (lg:col-span-4) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start transition-all duration-300">
              
              {/* Widget 1: Ringkasan Pekerjaan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Ringkasan Pekerjaan
                </h3>

                {/* Interactive Key-Value Table */}
                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Jenis Pekerjaan */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Jenis Pekerjaan</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right min-w-0">
                      {job.tipe === 'magang' ? 'Magang' : 'Full Time'}
                    </span>
                  </div>

                  {/* Kategori */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
                      <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Kategori</span>
                    </div>
                    {(() => {
                      const cats = (job.kategori || 'TI / Perangkat Lunak').split(',').map(c => c.trim()).filter(Boolean);
                      const primary = cats[0] || 'TI / Perangkat Lunak';
                      const extra = cats.length - 1;
                      return (
                        <div className="flex items-center justify-end gap-1.5 min-w-0 text-right">
                          <span className="font-extrabold text-slate-800 text-xs sm:text-sm truncate" title={job.kategori}>
                            {primary}
                          </span>
                          {extra > 0 && (
                            <span 
                              className="bg-blue-50 text-[#0077C6] font-bold px-2 py-0.5 rounded-md text-[10px] shrink-0 border border-blue-100" 
                              title={`Kategori lainnya: ${cats.slice(1).join(', ')}`}
                            >
                              +{extra}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Gaji */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
                      <Banknote className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Gaji</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right min-w-0">
                      {job.gaji || 'Kompetitif'}
                    </span>
                  </div>

                  {/* Kuota */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Kuota</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right min-w-0">
                      {job.kuota ? `${job.kuota} Orang` : 'Terbuka'}
                    </span>
                  </div>

                  {/* Batas Waktu */}
                  <div className="flex items-center justify-between py-2 gap-3">
                    <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Batas Waktu</span>
                    </div>
                    <span className="font-extrabold text-rose-600 font-mono text-right min-w-0">
                      {job.deadline}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Stack */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (!isLoggedIn && onNavigateToRegister) {
                        onNavigateToRegister('alumni');
                      } else {
                        setIsApplyModalOpen(true);
                      }
                    }}

                    className="w-full bg-[#0077C6] hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition text-sm text-center active:scale-95"
                    id="btn-lamar-pekerjaan-ini"
                  >
                    Lamar Pekerjaan Ini
                  </button>

                  <button
                    onClick={handleToggleSave}
                    className={`w-full py-2.5 rounded-xl border font-bold text-sm transition flex items-center justify-center gap-2 ${
                      isSaved
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-[#0077C6] text-[#0077C6] hover:bg-blue-50'
                    }`}
                    id="btn-simpan-lowongan"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>Simpan Lowongan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Social Share Section */}
                <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                  <span className="text-xs text-slate-500 font-medium block">Bagikan lowongan ini</span>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={handleCopyLink}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Bagikan"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCopyLink}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Salin Tautan"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <a 
                      href={`mailto:?subject=Lowongan%20${encodeURIComponent(job.judul)}&body=Lihat%20lowongan%20kerja%20di%20${encodeURIComponent(job.namaInstansi)}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Kirim via Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Widget 2: Search Sidebar Input Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Cari lowongan lainnya..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6]"
                  />
                </div>
              </div>

              {/* Widget 3: Postingan Terbaru */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Postingan Terbaru
                </h3>

                <div className="space-y-4">
                  {recentJobs.map((item) => {
                    const itemPoster = item.flyer || item.imageUrl || (item.flyers && item.flyers.length > 0 ? item.flyers[0] : null) || item.bannerImage || item.companyLogo || defaultLogo;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectJob && onSelectJob(item.id)}
                        className="flex items-start gap-3.5 group cursor-pointer border-b border-slate-50 last:border-0 pb-3 last:pb-0"
                      >
                        <img
                          src={itemPoster}
                          alt={item.judul}
                          className="w-12 h-12 rounded-xl border border-slate-200 object-cover shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-[#0077C6] transition-colors truncate">
                            {item.judul}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {item.namaInstansi}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.deadline}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {recentJobs.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">Tidak ada postingan terbaru</p>
                  )}
                </div>
              </div>

            </aside>

          </div>

        </div>
      </main>

      {/* 2. Global Footer Component */}
      {!hideFooter && <Footer onSelectLowongan={onSelectJob} setTab={setTab} />}

      {/* INTERACTIVE FORM MODAL: Lamar Pekerjaan Ini */}
      {isApplyModalOpen && (
        <JobApplicationModal
          isOpen={isApplyModalOpen}
          job={job}
          onClose={resetModal}
          onSubmit={(data) => {
            const current = JSON.parse(localStorage.getItem('user') || '{}');
            applyForJob(current.id || 'usr_mhs_demo', job, data);
            triggerToast(`Lamaran untuk ${job.judul} di ${job.namaInstansi} berhasil terkirim ke Mitra!`);
            if (onApply) onApply();
          }}
          defaultName="Muhammad Fadly Alamsyah"
          defaultEmail="mhs@umkendari.ac.id"
          defaultProdi="Teknik Informatika"
        />
      )}


      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
        >
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1 transition"
          >
            <X className="w-5 h-5" /> Tutup
          </button>

          <img 
            src={coverImage} 
            alt={job.judul} 
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl bg-white"
          />
        </div>
      )}

    </div>
  );
};
