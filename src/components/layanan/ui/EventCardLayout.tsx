import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, Clock } from 'lucide-react';
import { formatDateDisplay, getFromDB } from '../../../data';
import { EventLayananItem, KontenKarir } from '../../../types';
import EventDetailView from '../EventDetailView';
import { useLayanan } from '../LayananContainer';
import Pagination from './Pagination';
import { stripHtmlTags } from '../../../markdown';
import { slugify } from '../../../utils/shareUtils';

// --- Type ---
type DateFilterType = 'year' | 'month' | 'day' | 'day_month' | 'full';

interface DateFilter {
  type: DateFilterType;
  year?: number;
  month?: number;
  day?: number;
  pattern: string;
}

export interface EventCategoryTab {
  id: string;
  label: string;
}

interface EventCardLayoutProps {
  category: 'workshop' | 'softskill' | 'seminar' | 'campus-hiring' | 'career-fair' | 'job-fair' | string;
  pageTitle: string;
  subtitle: string;
  events: EventLayananItem[];
  kontenEvents?: KontenKarir[];
  initialEventId?: string | null;
  onDetailStateChange?: (isDetail: boolean) => void;
  setTab?: (tab: string) => void;
  sidebarRight?: React.ReactNode;
  mobileTopContent?: React.ReactNode;
  mobileBottomContent?: React.ReactNode;
  categoryFilterTabs?: EventCategoryTab[];
  activeCategoryFilter?: string;
  onCategoryFilterChange?: (categoryId: string) => void;
  searchPlaceholder?: string;
}

// --- Constants ---
const MONTH_LABELS: string[] = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'Nopember', 'Desember'
];

// --- Helpers ---
const cleanText = (s: string = ''): string => stripHtmlTags(s);

const mapKontenToEvent = (k: KontenKarir): EventLayananItem => ({
  id: `kk_${k.id}`,
  slug: k.slug || slugify(k.judul),
  category: (k.jenis === 'event' && k.kategori ? k.kategori : (k.jenis as string)) || 'workshop',
  title: k.judul,
  organizer: k.namaInstansi || 'CDC UM Kendari',
  date: k.tanggal || (k.createdAt ? k.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
  time: k.waktu,
  location: k.lokasiEvent || '-',
  fee: k.gaji || 'Gratis',
  image: k.thumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
  posterImage: k.gambarPoster || k.thumbnail,
  description: k.body || '',
  speaker: k.pembicara,
  quota: k.kuotaEvent || k.kuota,
  registrationLink: (k.ctaEnabled !== false && (k.linkDaftar || k.linkLamar || k.linkCta)) ? (k.linkDaftar || k.linkLamar || k.linkCta) : undefined,
  ctaEnabled: k.ctaEnabled !== false && Boolean(k.linkDaftar || k.linkLamar || k.linkCta),
  ctaLabel: k.ctaLabel || 'Daftar Sekarang',
  status: k.statusEvent || 'buka',
  uploadedAt: k.createdAt,
  isPinned: k.isPinned,
  isDraft: String(k.status || '').toLowerCase() === 'draft',
  postStatus: k.status
});

const findMatchedEvent = (targetId: string | null | undefined, list: EventLayananItem[]): EventLayananItem | null => {
  if (!targetId) return null;
  const decoded = decodeURIComponent(targetId).toLowerCase().trim();
  const rawId = decoded;
  const cleanId = rawId.replace(/^kk_/, '').replace(/^kk-/, '');
  return list.find(e => {
    const eid = (e.id || '').toLowerCase().trim();
    const eClean = eid.replace(/^kk_/, '').replace(/^kk-/, '');
    const titleSlug = (e.slug || slugify(e.title) || '').toLowerCase().trim();
    return (
      eid === rawId ||
      eClean === cleanId ||
      eid === cleanId ||
      rawId === eClean ||
      (titleSlug && (titleSlug === rawId || titleSlug === cleanId)) ||
      (e.title && e.title.toLowerCase().trim() === cleanId) ||
      (e.title && cleanId.length > 3 && e.title.toLowerCase().includes(cleanId))
    );
  }) || null;
};

// --- Helper format badge kategori event (Seminar, Pelatihan, Workshop, Campus Hiring, Job Fair, Lainnya) ---
export const formatCategoryBadge = (cat?: string): string => {
  if (!cat) return 'EVENT';
  const c = cat.toLowerCase().trim();
  if (c === 'campus-hiring' || c === 'campus_hiring' || c === 'recruitment') return 'CAMPUS HIRING';
  if (c === 'career-fair' || c === 'job-fair' || c === 'job_fair' || c === 'bursa-kerja') return 'JOB FAIR';
  if (c === 'softskill' || c === 'pelatihan' || c === 'training' || c === 'kewirausahaan') return 'PELATIHAN';
  if (c === 'workshop' || c === 'bootcamp') return 'WORKSHOP';
  if (c === 'seminar') return 'SEMINAR';
  if (c === 'webinar') return 'WEBINAR';
  if (c === 'lainnya') return 'LAINNYA';
  if (c === 'event') return 'EVENT';
  return cat.trim().toUpperCase();
};

// --- Helper pencocokan kategori event (Seminar, Pelatihan, Workshop, Campus Hiring, Job Fair, Lainnya) ---
export const matchEventCategory = (itemCat: string = '', targetFilter: string = ''): boolean => {
  const c = itemCat.toLowerCase().trim();
  const t = targetFilter.toLowerCase().trim();

  if (t === 'all' || t === 'semua' || !t) return true;

  if (t === 'seminar') {
    return c === 'seminar' || c === 'webinar';
  }
  if (t === 'pelatihan') {
    return c === 'softskill' || c === 'pelatihan' || c === 'training' || c === 'kewirausahaan';
  }
  if (t === 'workshop') {
    return c === 'workshop' || c === 'bootcamp';
  }
  if (t === 'campus-hiring' || t === 'campus_hiring') {
    return c === 'campus-hiring' || c === 'campus_hiring' || c === 'recruitment';
  }
  if (t === 'career-fair' || t === 'job-fair' || t === 'job_fair') {
    return c === 'career-fair' || c === 'job-fair' || c === 'job_fair' || c === 'bursa-kerja';
  }
  if (t === 'lainnya') {
    const known = [
      'seminar', 'webinar',
      'softskill', 'pelatihan', 'training', 'kewirausahaan',
      'workshop', 'bootcamp',
      'campus-hiring', 'campus_hiring', 'recruitment',
      'career-fair', 'job-fair', 'job_fair', 'bursa-kerja'
    ];
    return !known.includes(c);
  }

  return c === t;
};

// --- Parse search query → deteksi intent tanggal vs teks ---
// Supported format tanggal:
//   - angka 1-2 digit → harfiah hari dalam bulan (misal "25" = tanggal 25)
//   - DD/MM, DD/MM/YY, DD-MM-YYYY, YYYY-MM-DD, DD Mon (YYYY)
//   - Nama bulan saja → filter bulan tersebut
const parseSearchQuery = (raw: string): {
  dateFilter: DateFilter | null;
  textQuery: string;
} => {
  const q = raw.trim();
  if (!q) return { dateFilter: null, textQuery: '' };

  const dateFilter = extractDateFilter(q);
  if (dateFilter) {
    // Sisakan teks query untuk pencarian tambahan (misal "25 workshop" → tanggal 25 + kata kunci workshop)
    const remaining = q.replace(dateFilter.pattern, '').trim();
    return { dateFilter, textQuery: remaining };
  }

  return { dateFilter: null, textQuery: q };
};

const extractDateFilter = (q: string): DateFilter | null => {
  const lower = q.toLowerCase();

  // 1) Pola DD/MM atau DD-MM (hari & bulan)
  const slashDash = q.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (slashDash) {
    const day = Number(slashDash[1]);
    const month = Number(slashDash[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { type: 'day_month', day, month, pattern: slashDash[0] };
    }
  }

  // 2) Pola DD/MM/YY / DD-MM-YY / DD/MM/YYYY / DD-MM-YYYY
  const fullDate = q.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (fullDate) {
    let year = Number(fullDate[3]);
    if (year < 100) year += 2000;
    const day = Number(fullDate[1]);
    const month = Number(fullDate[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
      return { type: 'full', year, month, day, pattern: fullDate[0] };
    }
  }

  // 3) Pola YYYY-MM-DD (ISO)
  const iso = q.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { type: 'full', year, month, day, pattern: iso[0] };
    }
  }

  // 4) Nama bulan → filter bulan tersebut
  for (const m of MONTH_LABELS) {
    if (lower.includes(m.toLowerCase())) {
      const monthNum = MONTH_LABELS.indexOf(m) + 1;
      return { type: 'month', month: monthNum, pattern: m };
    }
  }

  // 5) Hanya angka 1-2 digit → filter hari
  const digitsOnly = q.match(/^(\d{1,2})$/);
  if (digitsOnly) {
    const day = Number(digitsOnly[1]);
    if (day >= 1 && day <= 31) {
      return { type: 'day', day, pattern: digitsOnly[0] };
    }
  }

  // 6) Tahun 4 digit
  const yearOnly = q.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    if (year >= 2000 && year <= 2100) {
      return { type: 'year', year, pattern: yearOnly[0] };
    }
  }

  return null;
};

export default function EventCardLayout({
  category,
  pageTitle,
  subtitle,
  events,
  kontenEvents,
  initialEventId,
  onDetailStateChange,
  setTab,
  sidebarRight,
  mobileTopContent,
  mobileBottomContent,
  categoryFilterTabs,
  activeCategoryFilter,
  onCategoryFilterChange,
  searchPlaceholder
}: EventCardLayoutProps) {
  const navigate = useNavigate();
  const { setIsDetailActive } = useLayanan();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy] = useState<'terbaru' | 'terlama' | 'az' | 'za'>('terbaru');

  // Gabungkan seed dummy + hasil input admin yang sudah published
  const allEvents = useMemo(() => {
    const sourceKonten = (kontenEvents && kontenEvents.length > 0)
      ? kontenEvents
      : getFromDB<KontenKarir>('konten_karir');

    const fromKonten = (sourceKonten || [])
      .filter(k => {
        const isPublished = String(k.status || '').toLowerCase() === 'published';
        if (!isPublished) {
          const normTarget = initialEventId ? decodeURIComponent(initialEventId).toLowerCase().trim() : '';
          const match = normTarget && (
            (k.id && k.id.toLowerCase() === normTarget) ||
            (k.slug && k.slug.toLowerCase() === normTarget) ||
            (k.judul && slugify(k.judul).toLowerCase() === normTarget) ||
            (`kk_${k.id}`.toLowerCase() === normTarget)
          );
          if (!match) return false;
        }
        const kj = (k.jenis || '').toLowerCase().trim();
        const cat = category.toLowerCase().trim();
        if (cat === 'event' || cat === 'all') {
          return ['event', 'workshop', 'seminar', 'softskill', 'campus-hiring', 'campus_hiring', 'career-fair', 'job-fair', 'job_fair'].includes(kj);
        }
        if (kj === cat) return true;
        if ((cat === 'campus-hiring' || cat === 'campus_hiring') && (kj === 'campus-hiring' || kj === 'campus_hiring')) return true;
        if ((cat === 'career-fair' || cat === 'job-fair' || cat === 'job_fair') && (kj === 'career-fair' || kj === 'job-fair' || kj === 'job_fair')) return true;
        return false;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .map(mapKontenToEvent);
    return [...fromKonten, ...events];
  }, [events, kontenEvents, category, initialEventId]);

  // Inisialisasi awal secara sinkron agar tidak berkedip ke Card Layout grid pada render pertama
  const [selectedEvent, setSelectedEvent] = useState<EventLayananItem | null>(() =>
    findMatchedEvent(initialEventId, allEvents)
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Sync detail state to LayananContainer & optional prop callback
  useEffect(() => {
    const isDetail = selectedEvent !== null;
    if (setIsDetailActive) {
      setIsDetailActive(isDetail);
    }
    if (onDetailStateChange) {
      onDetailStateChange(isDetail);
    }
    if (selectedEvent) {
      document.title = `${selectedEvent.title} | CDC UM Kendari`;
    }
  }, [selectedEvent, setIsDetailActive, onDetailStateChange]);

  // Auto-select event jika initialEventId berubah (misal dari Popular Info)
  useEffect(() => {
    const matched = findMatchedEvent(initialEventId, allEvents);
    setSelectedEvent(matched);
    if (matched) {
      window.scrollTo(0, 0);
    }
  }, [initialEventId, allEvents]);

  const handleSelectEvent = (item: EventLayananItem) => {
    setSelectedEvent(item);
    window.scrollTo(0, 0);
    const titleSlug = slugify(item.title) || item.id;
    navigate(`/layanan/${category}/${titleSlug}`);
  };

  // Filter logic: Pencarian teks, filter tanggal (day/month/year), & pengurutan
  const filteredEvents = useMemo(() => {
    const parsed = parseSearchQuery(searchQuery);
    const textQuery = parsed.textQuery.toLowerCase();

    // Filter utama: category, text, dan tanggal (jika ada dateFilter)
    let list = allEvents.filter(item => {
      // Category match
      const itemCat = (item.category || '').toLowerCase().trim();
      const cat = category.toLowerCase().trim();
      let isCategoryMatch = itemCat === cat;
      if (cat === 'event' || cat === 'all') isCategoryMatch = true;
      if ((cat === 'campus-hiring' || cat === 'campus_hiring') && (itemCat === 'campus-hiring' || itemCat === 'campus_hiring')) isCategoryMatch = true;
      if ((cat === 'career-fair' || cat === 'job-fair' || cat === 'job_fair') && (itemCat === 'career-fair' || itemCat === 'job-fair' || itemCat === 'job_fair')) isCategoryMatch = true;
      if (!isCategoryMatch && events.includes(item)) isCategoryMatch = true;

      if (!isCategoryMatch) return false;

      // Sub-kategori filter tabs (Seminar, Pelatihan, Workshop, Campus Hiring, Job Fair, Lainnya)
      if (activeCategoryFilter && activeCategoryFilter !== 'all' && activeCategoryFilter !== 'semua') {
        if (!matchEventCategory(item.category, activeCategoryFilter)) {
          return false;
        }
      }

      // Text search match
      const matchesSearch =
        !textQuery ||
        item.title.toLowerCase().includes(textQuery) ||
        item.organizer.toLowerCase().includes(textQuery) ||
        cleanText(item.description).toLowerCase().includes(textQuery);

      if (!matchesSearch) return false;

      // Date filter (jika user memasukkan tanggal)
      if (parsed.dateFilter) {
        const df = parsed.dateFilter;
        const itemDate = item.date;
        if (!itemDate) return false;

        const itemYear = itemDate.slice(0, 4);
        const itemMonth = itemDate.slice(5, 7);
        const itemDay = itemDate.slice(8, 10);

        switch (df.type) {
          case 'year':
            if (itemYear !== String(df.year)) return false;
            break;
          case 'month':
            if (itemMonth !== String(df.month).padStart(2, '0')) return false;
            break;
          case 'day':
            if (itemDay !== String(df.day).padStart(2, '0')) return false;
            break;
          case 'day_month':
            if (itemMonth !== String(df.month).padStart(2, '0')) return false;
            if (itemDay !== String(df.day).padStart(2, '0')) return false;
            break;
          case 'full':
            if (itemYear !== String(df.year)) return false;
            if (itemMonth !== String(df.month).padStart(2, '0')) return false;
            if (itemDay !== String(df.day).padStart(2, '0')) return false;
            break;
        }
      }

      return true;
    });

    // Sorting logic:
    // 1. Pinned items selalu di paling atas jika disematkan oleh admin
    // 2. Default (terbaru): Konten terbaru yang di-upload oleh admin selalu tampil di awal
    list = [...list].sort((a, b) => {
      // 1. Sematan khusus Admin (isPinned)
      const aPinned = Boolean((a as any).isPinned);
      const bPinned = Boolean((b as any).isPinned);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      if (sortBy === 'terbaru') {
        const aIsAdmin = a.id.startsWith('kk_');
        const bIsAdmin = b.id.startsWith('kk_');

        // Konten yang di-upload oleh admin selalu tampil di awal mendahului template seed
        if (aIsAdmin !== bIsAdmin) {
          return aIsAdmin ? -1 : 1;
        }

        // Jika keduanya konten admin: urutkan waktu upload terbaru
        if (aIsAdmin && bIsAdmin) {
          const aUpload = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const bUpload = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          if (bUpload !== aUpload) return bUpload - aUpload;
        }

        // Untuk item seed atau jika waktu upload identik: urutkan berdasarkan tanggal kegiatan
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        if (bDate !== aDate) return bDate - aDate;
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'terlama') {
        const aIsAdmin = a.id.startsWith('kk_');
        const bIsAdmin = b.id.startsWith('kk_');
        if (aIsAdmin && bIsAdmin) {
          const aUpload = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const bUpload = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          if (aUpload !== bUpload) return aUpload - bUpload;
        }
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        if (aDate !== bDate) return aDate - bDate;
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

    return list;
  }, [allEvents, category, searchQuery, sortBy, activeCategoryFilter]);

  // Reset ke halaman 1 saat hasil filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategoryFilter]);

  // ===== PAGINATION: 8 card per halaman jika ada sidebar agar sejajar rapi dengan dasar sidebar, atau 6 card jika 3 kolom =====
  const CARDS_PER_PAGE = sidebarRight ? 8 : 6;
  const totalPages = Math.ceil(filteredEvents.length / CARDS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pagedEvents = filteredEvents.slice((safePage - 1) * CARDS_PER_PAGE, safePage * CARDS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('event-card-layout-root')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedEvent(null);
    window.scrollTo(0, 0);
    navigate(`/layanan/${category}`);
  };

  if (selectedEvent) {
    return (
      <EventDetailView
        event={selectedEvent}
        categoryLabel={formatCategoryBadge(selectedEvent.category)}
        onBack={handleBackFromDetail}
        setTab={setTab}
      />
    );
  }



  return (
    <div className="w-full space-y-8" id="event-card-layout-root">
      {/* Penjelasan Sub-Menu (flat, tanpa wadah) */}
      {subtitle && (
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl -mt-2">
          {subtitle}
        </p>
      )}

      {/* ── CONTROLS BAR: SEARCH & CATEGORY FILTER TABS (PERSIS MENU BERITA & ARTIKEL) ── */}
      {categoryFilterTabs && categoryFilterTabs.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder || "Cari judul event, topik, atau materi..."}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categoryFilterTabs.map((cat) => {
              const isActive = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategoryFilterChange?.(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Layout: Jika ada sidebarRight, bagi jadi lg:grid-cols-12 */}
      {sidebarRight ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Mobile Top Content (Tampil duluan sebelum Search Bar & Card di Handphone/Mobile) */}
            {mobileTopContent && (
              <div className="block lg:hidden">
                {mobileTopContent}
              </div>
            )}

            {/* Search Bar biasa (hanya jika TIDAK ada categoryFilterTabs) */}
            {!categoryFilterTabs && (
              <div className="space-y-4">
                <div className="relative w-full max-w-2xl">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul kegiatan, materi, atau tanggal..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-[#0077C6] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Grid List Event Cards (2 kolom di area col-span-8) */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pagedEvents.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: (idx % 2) * 0.08,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    onClick={() => handleSelectEvent(item)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectEvent(item); } }}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
                  >
                    {/* Thumbnail / Poster (Selalu 16:9 di tampilan daftar, tampil penuh di detail saat diklik) */}
                    <div className="relative overflow-hidden border-b border-slate-100 bg-slate-950 flex items-center justify-center aspect-[16/9]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Badge Kategori di Pojok Kiri Atas (Sesuai Desain Berita / Editorial) */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center pointer-events-none z-10">
                        <span className="bg-[#1E3A8A] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs tracking-wider">
                          {formatCategoryBadge(item.category)}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-2 flex-1 flex flex-col">
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-3 leading-snug group-hover:text-[#0077C6] transition-colors flex-1">
                        {item.title}
                      </h3>

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                        <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDateDisplay(item.uploadedAt || item.date)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Navigasi Halaman */}
                <div className="col-span-full">
                  <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-800 text-base">Tidak ada kegiatan ditemukan</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Coba ganti kata kunci pencarian atau tanggal kegiatan, lalu atur ulang filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onCategoryFilterChange?.('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}

            {/* Mobile Bottom Content (Tampil setelah Card & Pagination di Handphone/Mobile) */}
            {mobileBottomContent && (
              <div className="block lg:hidden pt-4">
                {mobileBottomContent}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Sidebar (Hanya tampil di Desktop jika mobileTopContent aktif) */}
          <aside className={`lg:col-span-4 space-y-6 lg:sticky lg:top-24 ${mobileTopContent ? 'hidden lg:block' : ''}`}>
            {sidebarRight}
          </aside>
        </div>
      ) : (
        <>
          {/* Search Bar biasa jika TIDAK ada categoryFilterTabs */}
          {!categoryFilterTabs && (
            <div className="space-y-4">
              <div className="relative max-w-2xl">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul kegiatan, materi, atau tanggal..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-[#0077C6] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grid List Event Cards */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedEvents.map((item, idx) => (
                <motion.div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: (idx % 3) * 0.08,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  onClick={() => handleSelectEvent(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectEvent(item); } }}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
                >
                  {/* Thumbnail / Poster (Selalu 16:9 di tampilan daftar, tampil penuh di detail saat diklik) */}
                  <div className="relative overflow-hidden border-b border-slate-100 bg-slate-950 flex items-center justify-center aspect-[16/9]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Badge Kategori di Pojok Kiri Atas (Sesuai Desain Berita / Editorial) */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center pointer-events-none z-10">
                      <span className="bg-[#1E3A8A] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs tracking-wider">
                        {formatCategoryBadge(item.category)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body — judul + footer keterangan */}
                  <div className="p-5 space-y-2 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-3 leading-snug group-hover:text-[#0077C6] transition-colors flex-1">
                      {item.title}
                    </h3>

                    {/* Meta Footer: source + tanggal upload admin */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                      <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatDateDisplay(item.uploadedAt || item.date)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Navigasi Halaman */}
              <div className="col-span-full">
                <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-800 text-base">Tidak ada kegiatan ditemukan</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Coba ganti kata kunci pencarian atau tanggal kegiatan, lalu atur ulang filter.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
