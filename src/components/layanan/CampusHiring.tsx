import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import EventCardLayout from './ui/EventCardLayout';
import { getCampusHiring, getInfografisLayanan, SEED_EVENT_LAYANAN, formatDateDisplay } from '../../data';
import { KontenKarir, EventLayananItem, InfografisLayananItem } from '../../types';
import {
  ZoomIn,
  Download,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { slugify } from '../../utils/shareUtils';

interface CampusHiringProps {
  konten?: KontenKarir[];
  initialEventId?: string | null;
  setTab?: (tab: string) => void;
}

export default function CampusHiring({ konten = [], initialEventId, setTab }: CampusHiringProps) {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPoster, setZoomPoster] = useState(false);

  // Data infografis dinamis dari database/localStorage
  const [infografisItems, setInfografisItems] = useState<InfografisLayananItem[]>(() =>
    getInfografisLayanan().filter((i) => i.isActive)
  );

  useEffect(() => {
    const handleUpdate = () => {
      const live = getInfografisLayanan().filter((i) => i.isActive);
      setInfografisItems(live);
      setActiveSlide((prev) => (live.length > 0 ? prev % live.length : 0));
    };
    window.addEventListener('cdc_infografis_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cdc_infografis_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const slides = useMemo(() => {
    return infografisItems.map((item, idx) => ({
      id: item.id || `slide-${idx}`,
      src: item.gambarUrl,
      alt: item.judul,
      title: item.judul,
      filename: item.namaFile || `Campus-Hiring-${idx + 1}.png`
    }));
  }, [infografisItems]);

  const hasSlides = slides.length > 0;
  const currentSlideData = hasSlides ? slides[activeSlide % slides.length] : null;

  // Touch swipe handling untuk mobile handphone
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [hasSwiped, setHasSwiped] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setHasSwiped(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Geser horizontal (swipe) minimal 40px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      setHasSwiped(true);
      if (diffX > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleClickPoster = () => {
    if (hasSwiped) {
      setHasSwiped(false);
      return;
    }
    setZoomPoster(true);
  };

  // Auto-slide carousel dengan interval 7 detik (7000ms), dijeda saat hover atau modal zoom aktif
  useEffect(() => {
    if (!hasSlides || isHovered || zoomPoster) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [hasSlides, isHovered, zoomPoster, slides.length]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasSlides) return;
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasSlides) return;
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  // Keyboard navigation untuk modal zoom (panah kiri/kanan & escape)
  useEffect(() => {
    if (!zoomPoster || !hasSlides) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === 'ArrowRight') {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'Escape') {
        setZoomPoster(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomPoster, hasSlides, slides.length]);

  // Data event Campus Hiring untuk list kolom kiri
  const seedEvents = useMemo(() => {
    const raw = getCampusHiring();
    return raw.map((ch): EventLayananItem => ({
      id: ch.id,
      category: 'campus-hiring',
      title: ch.judul,
      organizer: ch.namaPerusahaan || 'CDC UM Kendari',
      date: ch.createdAt ? ch.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      location: ch.lokasi || 'Kampus UM Kendari',
      image: ch.bannerUrl || ch.logoPerusahaan || '/poster-cdc-web-umk-1.svg',
      description: ch.deskripsi || '',
      status: 'buka',
      uploadedAt: ch.createdAt
    }));
  }, []);

  // ── DATA LAYANAN LAIN TERBARU (SELAIN CAMPUS HIRING) ──
  const otherLatestEvents = useMemo(() => {
    const fromKonten = (konten || []).filter((k) => {
      if (k.status !== 'published') return false;
      const j = (k.jenis || '').toLowerCase().trim();
      return (
        j !== 'campus_hiring' &&
        j !== 'campus-hiring' &&
        ['workshop', 'seminar', 'softskill', 'job_fair', 'career-fair'].includes(j)
      );
    });

    const fromSeed = SEED_EVENT_LAYANAN.filter((e) => e.category !== 'campus-hiring');

    const formatCategory = (cat: string) => {
      const c = cat.toLowerCase();
      if (c === 'workshop') return { label: 'Workshop', tab: 'workshop', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      if (c === 'seminar') return { label: 'Seminar', tab: 'seminar', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' };
      if (c === 'softskill') return { label: 'Softskill', tab: 'softskill', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      if (c === 'career-fair' || c === 'job_fair' || c === 'job-fair') return { label: 'Job Fair', tab: 'career-fair', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      return { label: 'Layanan', tab: 'workshop', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    };

    const combined = [
      ...fromKonten.map((k) => {
        const catInfo = formatCategory(k.jenis as string);
        return {
          id: k.id,
          title: k.judul,
          categoryLabel: catInfo.label,
          badgeColor: catInfo.color,
          tab: catInfo.tab,
          date: k.tanggal || k.createdAt?.slice(0, 10) || '',
          image: k.thumbnail || '/poster-cdc-web-umk-1.svg',
          organizer: k.namaInstansi || 'CDC UM Kendari'
        };
      }),
      ...fromSeed.map((s) => {
        const catInfo = formatCategory(s.category);
        return {
          id: s.id,
          title: s.title,
          categoryLabel: catInfo.label,
          badgeColor: catInfo.color,
          tab: catInfo.tab,
          date: s.date || '',
          image: s.image,
          organizer: s.organizer
        };
      })
    ];

    const seenTitles = new Set<string>();
    const unique = combined.filter((item) => {
      const normalizedTitle = item.title.toLowerCase().trim();
      if (seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });

    return unique.slice(0, 4);
  }, [konten]);

  // Handler navigasi ke layanan lain
  const handleNavigate = (tab: string, title?: string) => {
    if (setTab) {
      setTab(tab);
    }
    if (title) {
      const slug = slugify(title);
      navigate(`/layanan/${tab}/${slug}`);
    } else {
      navigate(`/layanan/${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 1. RENDER CAROUSEL INFOGRAFIS (BISA DIGUNAKAN DI SIDEBAR MAUPUN MOBILE TOP) ──
  const renderInfografis = (isMobile = false) => {
    if (!hasSlides || !currentSlideData) return null;

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClickPoster}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 bg-white select-none ${
          isMobile ? 'w-full max-w-sm sm:max-w-md mx-auto mb-2' : 'w-full'
        }`}
        title="Klik untuk memperbesar gambar"
      >
        {/* Container Gambar dengan Slide Animasi */}
        <div className="relative w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlideData.id}
              src={currentSlideData.src}
              alt={currentSlideData.alt}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full h-auto object-contain rounded-2xl"
              loading="lazy"
            />
          </AnimatePresence>
        </div>

        {/* Counter Badge Pojok Kanan Atas */}
        <div className="absolute top-3 right-3 bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/15 z-10">
          {activeSlide + 1} / {slides.length}
        </div>

        {/* Mobile Hint Pill (Hanya di mobile, beri tahu pengguna bisa digeser / disentuh) */}
        {isMobile && (
          <div className="absolute top-3 left-3 bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-white/15 z-10 flex items-center gap-1 shadow-xs">
            <span>Geser gambar (7s)</span>
          </div>
        )}

        {/* Hover Zoom Prompt Badge (Desktop) */}
        <div className="absolute inset-0 rounded-2xl bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
            <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
            Klik untuk Zoom
          </span>
        </div>

        {/* Tombol Navigasi Geser (Kiri & Kanan) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Slide infografis sebelumnya"
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20 cursor-pointer shadow-md ${
                isMobile ? 'opacity-85' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Slide infografis berikutnya"
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20 cursor-pointer shadow-md ${
                isMobile ? 'opacity-85' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Indikator Titik (Dots) di Bagian Bawah */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-slate-950/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(idx);
                }}
                aria-label={`Buka slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? 'w-5 h-1.5 bg-[#0077C6]'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── 2. INFO LAYANAN LAIN TERBARU (BEBAS DARI IKON BINTANG) ──
  const renderLayananLain = () => (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
      <div className="pb-3 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 leading-none">
          Layanan Lain Terbaru
        </h4>
        <p className="text-[11px] text-slate-500 mt-1">
          Program & pelatihan karir aktif di CDC UMK
        </p>
      </div>

      {/* List Kegiatan / Layanan Lain Terbaru */}
      <div className="space-y-3.5">
        {otherLatestEvents.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => handleNavigate(item.tab, item.title)}
            className="group/item flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/60"
          >
            {/* Thumbnail Kecil */}
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Teks & Kategori */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${item.badgeColor}`}
                >
                  {item.categoryLabel}
                </span>
                {item.date && (
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDateDisplay(item.date)}
                  </span>
                )}
              </div>

              <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover/item:text-[#0077C6] transition-colors">
                {item.title}
              </h5>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:text-[#0077C6] group-hover/item:translate-x-0.5 transition-all shrink-0 self-center" />
          </div>
        ))}
      </div>

      {/* Quick Shortcut Akses Layanan Populer */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Jelajahi Kategori Layanan
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleNavigate('konseling')}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0077C6] hover:text-white text-slate-700 transition-colors cursor-pointer"
          >
            Konseling Karir
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('workshop')}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0077C6] hover:text-white text-slate-700 transition-colors cursor-pointer"
          >
            Workshop
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('softskill')}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0077C6] hover:text-white text-slate-700 transition-colors cursor-pointer"
          >
            Softskill
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('seminar')}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0077C6] hover:text-white text-slate-700 transition-colors cursor-pointer"
          >
            Seminar Karir
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('career-fair')}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0077C6] hover:text-white text-slate-700 transition-colors cursor-pointer"
          >
            Job Fair
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('magang')}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0077C6] hover:text-white text-slate-700 transition-colors cursor-pointer"
          >
            Internship
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div id="layanan-campus-hiring">
      <EventCardLayout
        category="campus-hiring"
        pageTitle="Campus Hiring - Recruitment"
        subtitle="Program rekrutmen langsung di kampus oleh perusahaan mitra untuk mahasiswa dan alumni UM KENDARI."
        events={seedEvents}
        kontenEvents={konten}
        initialEventId={initialEventId}
        sidebarRight={
          <div className="space-y-6">
            {renderInfografis(false)}
            {renderLayananLain()}
          </div>
        }
        mobileTopContent={renderInfografis(true)}
        mobileBottomContent={renderLayananLain()}
      />

      {/* ── LIGHTBOX MODAL ZOOM (MENDUKUNG GESER ANTAR INFOGRAFIS DI FULLSCREEN) ── */}
      {zoomPoster && hasSlides && currentSlideData && (
        <div
          className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fadeIn"
          onClick={() => setZoomPoster(false)}
        >
          {/* Action Bar Floating Top */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-30">
            <span className="text-white text-xs font-semibold bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hidden sm:inline">
              Slide {activeSlide + 1} dari {slides.length}
            </span>
            <a
              href={currentSlideData.src}
              download={currentSlideData.filename}
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md border border-white/20"
              title="Unduh file gambar infografis yang sedang aktif"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </a>
            <button
              type="button"
              onClick={() => setZoomPoster(false)}
              aria-label="Tutup modal"
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer backdrop-blur-md border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tombol Geser di Dalam Modal Zoom */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Infografis sebelumnya"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 z-30 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Infografis berikutnya"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 z-30 cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Modal Container */}
          <div
            className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-2 sm:p-3 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentSlideData.src}
              alt={currentSlideData.alt}
              className="w-full h-auto max-h-[86vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
