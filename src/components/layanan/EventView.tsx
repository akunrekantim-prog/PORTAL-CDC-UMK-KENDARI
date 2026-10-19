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
  ChevronRight,
  Filter
} from 'lucide-react';
import { slugify } from '../../utils/shareUtils';

interface EventViewProps {
  konten?: KontenKarir[];
  initialEventId?: string | null;
  initialCategory?: string;
  setTab?: (tab: string) => void;
}

const EVENT_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'seminar', label: 'Seminar' },
  { id: 'pelatihan', label: 'Pelatihan' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'campus-hiring', label: 'Campus Hiring' },
  { id: 'career-fair', label: 'Job Fair' },
  { id: 'lainnya', label: 'Lainnya' },
];

const normalizeCategory = (cat?: string): string => {
  if (!cat) return 'all';
  const c = cat.toLowerCase().trim();
  if (c === 'softskill') return 'pelatihan';
  if (c === 'job-fair' || c === 'job_fair') return 'career-fair';
  if (EVENT_CATEGORIES.some((ec) => ec.id === c)) return c;
  return 'all';
};

export default function EventView({
  konten = [],
  initialEventId,
  initialCategory = 'all',
  setTab
}: EventViewProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>(() => normalizeCategory(initialCategory));
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPoster, setZoomPoster] = useState(false);

  // Sync category if initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(normalizeCategory(initialCategory));
    }
  }, [initialCategory]);

  // Data infografis dinamis dari database / localStorage (semua infografis aktif)
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
      filename: item.namaFile || `Event-CDC-${idx + 1}.png`
    }));
  }, [infografisItems]);

  const hasSlides = slides.length > 0;
  const currentSlideData = hasSlides ? slides[activeSlide % slides.length] : null;

  // Touch swipe handling untuk mobile
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

  // Auto-slide carousel dengan interval 7 detik (7000ms)
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

  // Keyboard navigation untuk modal zoom
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

  // ── GABUNGKAN SEMUA SEED EVENTS (CAMPUS HIRING + DUMMY SEED) ──
  const allSeedEvents = useMemo(() => {
    const rawCampusHiring = getCampusHiring();
    const chEvents: EventLayananItem[] = rawCampusHiring.map((ch) => ({
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

    return [...chEvents, ...SEED_EVENT_LAYANAN];
  }, []);

  // ── DATA AGENDA TERBARU UNTUK WIDGET SIDEBAR ──
  const upcomingEvents = useMemo(() => {
    const fromKonten = (konten || []).filter((k) => {
      if (k.status !== 'published') return false;
      const j = (k.jenis || '').toLowerCase().trim();
      return ['workshop', 'seminar', 'softskill', 'job_fair', 'career-fair', 'campus-hiring', 'campus_hiring'].includes(j);
    });

    const formatCategory = (cat: string) => {
      const c = cat.toLowerCase();
      if (c === 'campus-hiring' || c === 'campus_hiring') return { label: 'Campus Hiring', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      if (c === 'workshop') return { label: 'Workshop', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      if (c === 'seminar') return { label: 'Seminar', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' };
      if (c === 'softskill') return { label: 'Softskill', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      if (c === 'career-fair' || c === 'job_fair' || c === 'job-fair') return { label: 'Job Fair', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      return { label: 'Event', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    };

    const combined = [
      ...fromKonten.map((k) => {
        const catInfo = formatCategory(k.jenis as string);
        return {
          id: k.id,
          title: k.judul,
          categoryLabel: catInfo.label,
          badgeColor: catInfo.color,
          date: k.tanggal || k.createdAt?.slice(0, 10) || '',
          image: k.thumbnail || '/poster-cdc-web-umk-1.svg',
          organizer: k.namaInstansi || 'CDC UM Kendari'
        };
      }),
      ...allSeedEvents.map((s) => {
        const catInfo = formatCategory(s.category);
        return {
          id: s.id,
          title: s.title,
          categoryLabel: catInfo.label,
          badgeColor: catInfo.color,
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

    return unique.slice(0, 5);
  }, [konten, allSeedEvents]);

  // ── 1. RENDER CAROUSEL INFOGRAFIS ──
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
          isMobile ? 'w-full max-w-sm sm:max-w-md mx-auto mb-3' : 'w-full'
        }`}
        title="Klik untuk memperbesar gambar poster"
      >
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

        <div className="absolute top-3 right-3 bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/15 z-10">
          {activeSlide + 1} / {slides.length}
        </div>

        {isMobile && (
          <div className="absolute top-3 left-3 bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-white/15 z-10 flex items-center gap-1 shadow-xs">
            <span>Geser gambar (7s)</span>
          </div>
        )}

        <div className="absolute inset-0 rounded-2xl bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
            <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
            Klik untuk Zoom
          </span>
        </div>
      </div>
    );
  };

  // ── 2. RENDER WIDGET SIDEBAR: AGENDA MENDATANG & FILTER CEPAT ──
  const renderSidebarWidget = () => (
    <div className="space-y-6">
      {/* Box Agenda Terkini */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0077C6]" />
            Agenda Terkini
          </h4>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Terbaru
          </span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                const slug = slugify(item.title);
                navigate(`/layanan/event/${slug}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group/item flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/60"
            >
              <div className="w-14 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${item.badgeColor}`}>
                    {item.categoryLabel}
                  </span>
                  {item.date && (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
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
      </div>

      {/* Filter Cepat Kategori Event */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Kategori Agenda
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div id="layanan-event-view" className="space-y-6">
      {/* ── EVENT CARD LAYOUT (CORE MASTER-DETAIL DENGAN SEARCH & KATEGORI SEPERTI BERITA) ── */}
      <EventCardLayout
        category="event"
        pageTitle="Event Pengembangan Karir"
        subtitle="Pusat informasi dan pendaftaran seluruh agenda karir, campus hiring, workshop teknis, pelatihan softskill, seminar, hingga job fair CDC UM Kendari."
        events={allSeedEvents}
        kontenEvents={konten}
        initialEventId={initialEventId}
        categoryFilterTabs={EVENT_CATEGORIES}
        activeCategoryFilter={selectedCategory}
        onCategoryFilterChange={setSelectedCategory}
        searchPlaceholder="Cari judul event, topik, atau pembicara..."
        sidebarRight={
          <div className="space-y-6">
            {renderInfografis(false)}
            {renderSidebarWidget()}
          </div>
        }
        mobileTopContent={renderInfografis(true)}
        mobileBottomContent={renderSidebarWidget()}
      />

      {/* ── LIGHTBOX MODAL ZOOM (INFOGRAFIS FULLSCREEN) ── */}
      {zoomPoster && hasSlides && currentSlideData && (
        <div
          className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fadeIn"
          onClick={() => setZoomPoster(false)}
        >
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

          <div
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentSlideData.src}
              alt={currentSlideData.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
