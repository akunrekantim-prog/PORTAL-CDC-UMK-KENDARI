import React, { useState } from 'react';
import { Lowongan, Mahasiswa } from '../types';
import { getFromDB, applyForJob, getSavedJobIds, toggleSaveJob, formatDateDisplay, isJobDeadlinePassed } from '../data';
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
  ShieldCheck,
  ExternalLink,
  Mail,
  Search,
  X,
  UploadCloud,
  CheckCircle2,
  Layers,
  Banknote,
  Maximize2,
  Facebook,
  MessageCircle,
  Send,
  Linkedin,
  Copy
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
  const isExpired = isJobDeadlinePassed(job.deadline);
  const defaultPoster = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop';
  const defaultLogo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop';

  // Determine cover banner image
  const flyersList = (job.flyers && job.flyers.length > 0)
    ? job.flyers
    : [job.imageUrl || job.flyer || job.bannerImage || defaultPoster];
  const coverImage = flyersList[0];
  const logoUrl = job.companyLogo || defaultLogo;

  // Active student user lookup
  const activeUserId = localStorage.getItem('cdc_session_id') || '';
  const studentsList = getFromDB<Mahasiswa>('mahasiswa');
  const activeStudent = studentsList.find(s => s.userId === activeUserId) || (activeUserId ? studentsList.find(s => s.userId === '2') : undefined);

  // React States for Interactivity
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    return getSavedJobIds(activeUserId || undefined).includes(job.id);
  });
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);


  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sidebar Recent Postings Search Filter
  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Kategori Popover State & Touch Hold Handlers
  const [showCategoryPopover, setShowCategoryPopover] = useState<boolean>(false);
  const categoryHoldTimer = React.useRef<any>(null);

  const handleCategoryTouchStart = () => {
    categoryHoldTimer.current = setTimeout(() => {
      setShowCategoryPopover(true);
    }, 250);
  };

  const handleCategoryTouchEnd = () => {
    if (categoryHoldTimer.current) {
      clearTimeout(categoryHoldTimer.current);
    }
  };

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
    const nextState = toggleSaveJob(job.id, activeUserId || undefined);
    setIsSaved(nextState);
    triggerToast(nextState ? 'Lowongan berhasil disimpan ke favorit!' : 'Lowongan dihapus dari favorit.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('Tautan lowongan berhasil disalin ke clipboard!');
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const handleShareFacebook = () => {
    const targetUrl = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${targetUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const targetUrl = encodeURIComponent(window.location.href);
    const targetTitle = encodeURIComponent(`Lowongan Kerja: ${job.judul} di ${job.namaInstansi}`);
    window.open(`https://twitter.com/intent/tweet?url=${targetUrl}&text=${targetTitle}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const text = `Lowongan Kerja: ${job.judul} di ${job.namaInstansi}. Cek selengkapnya di: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const targetUrl = encodeURIComponent(window.location.href);
    const targetTitle = encodeURIComponent(`Lowongan Kerja: ${job.judul} di ${job.namaInstansi}`);
    window.open(`https://t.me/share/url?url=${targetUrl}&text=${targetTitle}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const targetUrl = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${targetUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Lowongan Kerja: ${job.judul}`);
    const body = encodeURIComponent(`Halo,\n\nAda lowongan menarik: ${job.judul} di ${job.namaInstansi}.\nCek selengkapnya di: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lowongan Kerja: ${job.judul}`,
          text: `${job.judul} di ${job.namaInstansi}`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
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
          setTab={setTab || (() => { })}
          onNavigateToLogin={onNavigateToLogin || (() => { })}
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
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" /> Perbesar Poster
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
                        <span>Diposting: <strong className="font-semibold text-slate-700">{job.createdAt ? job.createdAt.split('T')[0] : '2026-08-04'}</strong></span>
                      </div>

                      {job.sumber === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                          <ShieldCheck className="w-3.5 h-3.5" /> by Admin Website
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lamar Sekarang / CTA Admin Button */}
                  {isExpired ? (
                    <div className="bg-rose-50 border border-rose-200/80 text-rose-700 font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 self-start shadow-2xs">
                      <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Pendaftaran Ditutup</span>
                    </div>
                  ) : job.sumber === 'admin' && job.ctaEnabled && job.linkEksternal ? (
                    <a
                      href={job.linkEksternal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl shadow-xs hover:shadow-md transition-all shrink-0 self-start active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                      id="btn-cta-admin"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {job.ctaLabel && job.ctaLabel.trim() ? job.ctaLabel : 'Daftar Sekarang'}
                    </a>
                  ) : job.sumber === 'admin' && !job.ctaEnabled ? null : (
                    <button
                      onClick={() => {
                        if (!isLoggedIn && onNavigateToRegister) {
                          onNavigateToRegister('alumni');
                        } else {
                          setIsApplyModalOpen(true);
                        }
                      }}
                      className="bg-[#0077C6] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl shadow-xs hover:shadow-md transition-all shrink-0 self-start active:scale-95 flex items-center gap-2 cursor-pointer"
                      id="btn-lamar-sekarang-top"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Lamar Sekarang
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4" />

                {/* Section 1: Deskripsi Pekerjaan */}
                {job.deskripsi && job.deskripsi.trim().length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Deskripsi Pekerjaan</h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {job.deskripsi}
                    </p>
                  </div>
                )}

                {/* Section 2: Tanggung Jawab */}
                {job.tanggungJawab && job.tanggungJawab.length > 0 && job.tanggungJawab.some(item => item && item.trim().length > 0) && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Tanggung Jawab Pekerjaan</h2>
                    <ul className="space-y-1.5 text-slate-600 text-sm list-disc pl-5">
                      {job.tanggungJawab.filter(item => item && item.trim().length > 0).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 3: Persyaratan & Kualifikasi */}
                {job.kualifikasi && job.kualifikasi.length > 0 && job.kualifikasi.some(item => item && item.trim().length > 0) && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Persyaratan &amp; Kualifikasi</h2>
                    <ul className="space-y-1.5 text-slate-600 text-sm list-disc pl-5">
                      {job.kualifikasi.filter(item => item && item.trim().length > 0).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 4: Keahlian yang Dibutuhkan */}
                {job.keahlian && job.keahlian.length > 0 && job.keahlian.some(tag => tag && tag.trim().length > 0) && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Keahlian yang Dibutuhkan</h2>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {job.keahlian.filter(tag => tag && tag.trim().length > 0).map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 5: Benefit & Fasilitas Kompensasi */}
                {job.benefit && job.benefit.length > 0 && job.benefit.some(item => item && item.trim().length > 0) && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-lg font-extrabold text-slate-900">Benefit &amp; Fasilitas Kompensasi</h2>
                    <ul className="space-y-1.5 text-slate-600 text-sm list-disc pl-5">
                      {job.benefit.filter(item => item && item.trim().length > 0).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar Summary Table & Widgets (lg:col-span-4) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start transition-all duration-300">

              {/* Widget 1: Ringkasan Pekerjaan (Senior Programmer Grade Design) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-6 space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ringkasan Pekerjaan
                  </h3>
                </div>

                {/* Key-Value Rows */}
                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Jenis Pekerjaan */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 gap-3">
                    <div className="flex items-center gap-2.5 text-slate-600 font-medium shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="text-slate-600">Jenis Pekerjaan</span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-right min-w-0">
                      {job.jenisPekerjaan ? (job.jenisPekerjaan === 'full-time' ? 'Full-Time' : 'Part-Time') : (job.tipe === 'magang' ? 'Magang' : 'Full-Time')}
                    </span>
                  </div>

                  {/* Kategori */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 gap-3 relative">
                    <div className="flex items-center gap-2.5 text-slate-600 font-medium shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-slate-600">Kategori</span>
                    </div>
                    {(() => {
                      const cats = (job.kategori || 'TI / Perangkat Lunak').split(',').map(c => c.trim()).filter(Boolean);
                      const primary = cats[0] || 'TI / Perangkat Lunak';
                      const extra = cats.length - 1;
                      const hasMultipleOrLong = extra > 0 || (job.kategori || '').length > 20;

                      return (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasMultipleOrLong) {
                                setShowCategoryPopover(prev => !prev);
                              }
                            }}
                            onMouseEnter={() => {
                              if (hasMultipleOrLong) setShowCategoryPopover(true);
                            }}
                            onMouseLeave={() => {
                              if (hasMultipleOrLong) setShowCategoryPopover(false);
                            }}
                            onTouchStart={handleCategoryTouchStart}
                            onTouchEnd={handleCategoryTouchEnd}
                            className={`flex items-center justify-end gap-1.5 min-w-0 text-right group cursor-pointer focus:outline-none transition ${hasMultipleOrLong ? 'hover:opacity-80 active:scale-95' : ''
                              }`}
                          >
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[160px]">
                              {primary}
                            </span>
                            {extra > 0 && (
                              <span className="bg-[#0077C6] text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] shrink-0 shadow-2xs group-hover:bg-blue-700 transition">
                                +{extra}
                              </span>
                            )}
                          </button>

                          {/* Interactive Glassmorphism Popover Card */}
                          {hasMultipleOrLong && showCategoryPopover && (
                            <div
                              className="absolute right-0 top-full mt-2 z-50 w-72 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-fadeIn space-y-2.5"
                              onMouseEnter={() => setShowCategoryPopover(true)}
                              onMouseLeave={() => setShowCategoryPopover(false)}
                            >
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-1.5 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>Daftar Kategori ({cats.length})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCategoryPopover(false);
                                  }}
                                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
                                {cats.map((cat, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold leading-tight ${idx === 0
                                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700/90'
                                      }`}
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>

                              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                <span>💡 Tekan &amp; tahan / klik untuk info</span>
                                <span className="text-blue-400 font-bold">{cats.length} Kategori</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Gaji */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 gap-3">
                    <div className="flex items-center gap-2.5 text-slate-600 font-medium shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="text-slate-600">Gaji</span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-right min-w-0">
                      {job.gaji || 'Kompetitif'}
                    </span>
                  </div>

                  {/* Kuota */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 gap-3">
                    <div className="flex items-center gap-2.5 text-slate-600 font-medium shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-slate-600">Kuota</span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-right min-w-0">
                      {job.kuota ? `${job.kuota} Orang` : 'Terbuka'}
                    </span>
                  </div>

                  {/* Batas Waktu */}
                  <div className="flex items-center justify-between py-1.5 gap-3">
                    <div className="flex items-center gap-2.5 text-slate-600 font-medium shrink-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${isExpired ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-slate-600">Batas Waktu</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-extrabold text-xs sm:text-sm ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatDateDisplay(job.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Stack */}
                <div className="space-y-3 pt-2">
                  {isExpired ? (
                    <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
                      <div className="flex items-center justify-center gap-1.5 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-rose-500 shrink-0" /> Pendaftaran Ditutup
                      </div>
                      <p className="text-[11px] text-rose-700 font-medium">Batas waktu lamaran telah berakhir.</p>
                    </div>
                  ) : job.sumber === 'admin' && job.ctaEnabled && job.linkEksternal ? (
                    <a
                      href={job.linkEksternal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl shadow-xs hover:shadow-md transition-all text-xs uppercase tracking-wider text-center active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      id="btn-cta-admin-side"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {job.ctaLabel && job.ctaLabel.trim() ? job.ctaLabel : 'Daftar Sekarang'}
                    </a>
                  ) : job.sumber === 'admin' && !job.ctaEnabled ? null : (
                    <button
                      onClick={() => {
                        if (!isLoggedIn && onNavigateToRegister) {
                          onNavigateToRegister('alumni');
                        } else {
                          setIsApplyModalOpen(true);
                        }
                      }}
                      className="w-full bg-[#0077C6] hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-xs hover:shadow-md transition-all text-xs uppercase tracking-wider text-center active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      id="btn-lamar-pekerjaan-ini"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Lamar Pekerjaan Ini
                    </button>
                  )}

                  <button
                    onClick={handleToggleSave}
                    className={`w-full py-3 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${isSaved
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    id="btn-simpan-lowongan"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Lowongan Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Simpan Lowongan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Social Share Section */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-2.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Bagikan Lowongan Ini</span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0077C6] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
                      title="Pilihan Bagikan Lengkap"
                      id="btn-open-share-modal"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                      <span>Bagikan Lowongan</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#0077C6] border border-slate-200 flex items-center justify-center transition cursor-pointer"
                      title="Salin Tautan"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 flex items-center justify-center transition cursor-pointer"
                      title="Bagikan via WhatsApp Direct"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    </button>
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
                            {formatDateDisplay(item.createdAt || item.deadline)}
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
            applyForJob(activeUserId, job, data);
            window.dispatchEvent(new Event('storage'));
            triggerToast(`Lamaran untuk ${job.judul} di ${job.namaInstansi} berhasil terkirim ke Mitra!`);
          }}
        />
      )}


      {/* Interactive Multi-Social Media Share Modal */}
      {isShareModalOpen && (
        <div
          onClick={() => setIsShareModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0077C6] flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Bagikan Lowongan Kerja</h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-[260px]">{job.judul}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Social Media Grid */}
            <div className="grid grid-cols-4 gap-3 pt-1">
              {/* 1. WhatsApp */}
              <button
                type="button"
                onClick={() => { handleShareWhatsApp(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Bagikan ke WhatsApp"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">WhatsApp</span>
              </button>

              {/* 2. Facebook */}
              <button
                type="button"
                onClick={() => { handleShareFacebook(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Bagikan ke Facebook"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#3b5998] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Facebook className="w-5 h-5 fill-white" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">Facebook</span>
              </button>

              {/* 3. Twitter / X */}
              <button
                type="button"
                onClick={() => { handleShareTwitter(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/90 border border-slate-300/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Bagikan ke Twitter / X"
              >
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">Twitter / X</span>
              </button>

              {/* 4. Telegram */}
              <button
                type="button"
                onClick={() => { handleShareTelegram(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Bagikan ke Telegram"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">Telegram</span>
              </button>

              {/* 5. LinkedIn */}
              <button
                type="button"
                onClick={() => { handleShareLinkedIn(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Bagikan ke LinkedIn"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Linkedin className="w-4 h-4 fill-white" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">LinkedIn</span>
              </button>

              {/* 6. Email */}
              <button
                type="button"
                onClick={() => { handleShareEmail(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Kirim via Email"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">Email</span>
              </button>

              {/* 7. Native Share / Aplikasi HP */}
              <button
                type="button"
                onClick={() => { handleNativeShare(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Bagikan via Fitur Ponsel"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">Lainnya</span>
              </button>

              {/* 8. Salin Tautan */}
              <button
                type="button"
                onClick={() => { handleCopyLink(); setIsShareModalOpen(false); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/90 border border-slate-200 transition active:scale-95 cursor-pointer space-y-1.5 group"
                title="Salin Tautan Lowongan"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Copy className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800">Salin Link</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
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
