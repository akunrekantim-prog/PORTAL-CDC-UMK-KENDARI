import React, { useState, useEffect } from 'react';
import { Lowongan } from '../types';
import { 
  ChevronLeft, 
  ChevronRight,
  Building2, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  Users, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X
} from 'lucide-react';

interface JobDetailProps {
  job: Lowongan;
  onBack: () => void;
  onApply: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job, onBack, onApply }) => {
  const defaultPoster = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop';
  const defaultLogo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop';

  // Determine flyer list: use job.flyers if available, fallback to imageUrl, flyer, bannerImage, or defaultPoster
  const flyersList = (job.flyers && job.flyers.length > 0) 
    ? job.flyers 
    : [job.imageUrl || job.flyer || job.bannerImage || defaultPoster];

  // The hero cover image is the first flyer or poster image
  const coverImage = flyersList[0];
  const logoUrl = job.companyLogo || defaultLogo;
  const isMagang = job.tipe === 'magang';

  // Slider state for Lightbox modal
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % flyersList.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + flyersList.length) % flyersList.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, flyersList.length]);

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % flyersList.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + flyersList.length) % flyersList.length);
  };

  const openLightbox = (index: number = 0) => {
    setCurrentSlide(index);
    setZoomLevel(1);
    setIsLightboxOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12" id="job-detail-panel">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-2xs active:scale-95 group"
            id="job-back-btn"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" /> 
            Kembali ke Daftar Lowongan
          </button>
        </div>

        {/* Responsive 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Vertical Image Container */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            <div 
              onClick={() => openLightbox(0)}
              className="relative w-full aspect-[3/4] sm:max-h-[600px] lg:max-h-[680px] rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-slate-950 cursor-pointer group flex items-center justify-center"
            >
              {/* Ambient blurred background */}
              <img 
                src={coverImage} 
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none transition-transform duration-700 group-hover:scale-150"
              />
              {/* Main crisp poster/flyer image */}
              <img 
                src={coverImage} 
                alt={job.judul}
                className="relative w-full h-full object-contain z-10 group-hover:scale-[1.03] transition-transform duration-500 ease-out drop-shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
              
              {/* Hover zoom indicator pill */}
              <div className="absolute bottom-4 right-4 z-20 bg-white/95 hover:bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg border border-slate-200 flex items-center gap-2 backdrop-blur-xs transition transform translate-y-1 group-hover:translate-y-0">
                <Maximize2 className="w-4 h-4 text-[#10B981]" /> Klik untuk Memperbesar
              </div>
            </div>

            {/* Thumbnail selector if multiple flyers exist */}
            {flyersList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {flyersList.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className="h-16 aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-200 hover:border-[#10B981] transition shrink-0 bg-slate-900 shadow-xs"
                  >
                    <img src={thumb} alt={`Brosur ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Job Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Box & Info Cards */}
            <div className="space-y-6">
              
              {/* Top Row: Company Icon Box + Badges */}
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F2ED] border border-[#E5DFD7] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden p-2">
                  <img 
                    src={logoUrl} 
                    alt={job.namaInstansi} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultLogo;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#EAF3EC] text-[#2D7A4D] border border-[#D5E8D9] rounded-full font-bold text-[11px] px-3.5 py-1 inline-flex items-center gap-1.5 uppercase tracking-wider shadow-2xs">
                      <Briefcase className="w-3.5 h-3.5 text-[#2D7A4D]" />
                      {isMagang ? 'PROGRAM MAGANG' : 'PEKERJAAN PENUH WAKTU'}
                    </span>

                    <span className="bg-[#F3EFEA] text-[#6B5E53] border border-[#E5DFD7] rounded-full font-bold text-[11px] px-3.5 py-1 inline-flex items-center gap-1.5 uppercase tracking-wider shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-[#8C7B6B]" />
                      DITUTUP: {job.deadline}
                    </span>
                  </div>

                  {/* Bold Job Title + Company Name */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B365D] tracking-tight leading-tight">
                      {job.judul}
                    </h1>

                    <div className="flex items-center gap-2 text-stone-700 font-bold text-sm sm:text-base pt-1.5">
                      <Building2 className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>{job.namaInstansi}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards: Two side-by-side soft boxes for "LOKASI PENEMPATAN" and "KUOTA PENERIMAAN" */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#F6F4F0] border border-[#ECE8E1] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="w-5 h-5 text-stone-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-extrabold text-[#8C7B6B] uppercase tracking-wider">LOKASI PENEMPATAN</span>
                    <span className="font-extrabold text-slate-800 text-sm sm:text-base truncate block" title={job.lokasi}>{job.lokasi}</span>
                  </div>
                </div>

                <div className="bg-[#F6F4F0] border border-[#ECE8E1] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                    <Users className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#8C7B6B] uppercase tracking-wider">KUOTA PENERIMAAN</span>
                    <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                      {job.kuota ? `${job.kuota} Orang` : 'Tidak Dibatasi'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Content Sections Stacked Neatly (No White Cards, Clean Flow) */}
            <div className="space-y-8 pt-4 border-t border-slate-200/60">
              
              {/* 1. Uraian Umum Pekerjaan */}
              <div className="space-y-3" id="job-detail-desc-box">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-[#2D7A4D] rounded-full inline-block shrink-0" />
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1B365D]">Uraian Umum Pekerjaan</h3>
                </div>
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-3 font-normal">
                  {job.deskripsi.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* 2. Persyaratan & Kualifikasi Pelamar */}
              {job.kualifikasi && job.kualifikasi.length > 0 && (
                <div className="space-y-3" id="job-detail-qual-box">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-5 bg-[#2D7A4D] rounded-full inline-block shrink-0" />
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1B365D]">Persyaratan & Kualifikasi Pelamar</h3>
                  </div>
                  <ul className="space-y-2.5 pt-1" id="job-qual-list">
                    {job.kualifikasi.map((k, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A89888] inline-block mt-2 shrink-0" />
                        <span className="font-normal text-slate-700">{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. Kompensasi & Benefit Penempatan */}
              {job.benefit && job.benefit.length > 0 && (
                <div className="space-y-3" id="job-detail-benefit-box">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-5 bg-[#2D7A4D] rounded-full inline-block shrink-0" />
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1B365D]">Kompensasi & Benefit Penempatan</h3>
                  </div>
                  <ul className="space-y-2.5 pt-1" id="job-benefit-list">
                    {job.benefit.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A89888] inline-block mt-2 shrink-0" />
                        <span className="font-normal text-slate-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom CTA: Primary Green Button ("Ajukan Lamaran Sekarang ->") aligned at bottom right */}
              <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-xs text-slate-400">Batas Akhir Pendaftaran</span>
                  <div className="text-sm font-bold text-slate-700">{job.deadline}</div>
                </div>
                <button 
                  onClick={onApply}
                  className="w-full sm:w-auto bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center gap-3 active:scale-95 group"
                  id="job-apply-cta"
                >
                  <span>Ajukan Lamaran Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Footer Metadata */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-200/60">
          <span>ID Lowongan: <strong className="font-mono text-slate-500">{job.id}</strong> · Mitra ID: <strong className="font-mono text-slate-500">{job.mitraId || 'Internal'}</strong></span>
          <span>Hak Cipta © 2026 CDC Universitas Muhammadiyah Kendari</span>
        </div>

      </div>

      {/* 5. Fullscreen Image Modal (Lightbox) */}
      {isLightboxOpen && (
        <div 
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomLevel(1);
          }}
          className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
        >
          {/* Lightbox Top Control Bar with Close (X) at top right */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center justify-between bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 rounded-2xl text-white max-w-5xl mx-auto w-full shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm text-white">
                {flyersList.length > 1 ? `Brosur ${currentSlide + 1} dari ${flyersList.length}` : 'Pratinjau Resolusi Penuh'}
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline truncate max-w-xs">
                ({job.judul})
              </span>
            </div>

            {/* Zoom & Close Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition"
                title="Perbesar (Zoom In)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition"
                title="Perkecil (Zoom Out)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition text-xs font-mono font-bold"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <div className="h-5 w-px bg-white/20 mx-1" />

              <button 
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-lg"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" /> <span className="hidden sm:inline">Tutup</span>
              </button>
            </div>
          </div>

          {/* Lightbox Main Viewport */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex-1 overflow-auto flex items-center justify-center my-4 relative"
          >
            {/* Previous Arrow */}
            {flyersList.length > 1 && (
              <button 
                onClick={prevSlide}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xl backdrop-blur-md transition transform hover:scale-105 z-20"
                title="Slide Sebelumnya (Arrow Left)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Transform Zoomable Image */}
            <div className="max-h-[80vh] max-w-[90vw] overflow-auto flex items-center justify-center p-2">
              <img 
                src={flyersList[currentSlide]} 
                alt={`Zoom Brosur ${currentSlide + 1}`}
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                className="max-h-[75vh] max-w-[85vw] object-contain rounded-xl shadow-2xl origin-center cursor-grab active:cursor-grabbing bg-white/5"
              />
            </div>

            {/* Next Arrow */}
            {flyersList.length > 1 && (
              <button 
                onClick={nextSlide}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xl backdrop-blur-md transition transform hover:scale-105 z-20"
                title="Slide Berikutnya (Arrow Right)"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails Bar */}
          {flyersList.length > 1 ? (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 rounded-2xl max-w-3xl mx-auto overflow-x-auto shadow-2xl"
            >
              {flyersList.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setZoomLevel(1);
                  }}
                  className={`h-14 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 ${
                    currentSlide === idx 
                      ? 'border-[#10B981] scale-105 shadow-md ring-2 ring-emerald-500/50' 
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt={`Modal Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}

    </div>
  );
};
