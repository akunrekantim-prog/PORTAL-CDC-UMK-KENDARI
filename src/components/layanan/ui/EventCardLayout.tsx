import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, Clock } from 'lucide-react';
import { formatDateDisplay } from '../../../data';
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
  category: (k.jenis as string) || 'workshop',
  title: k.judul,
  organizer: k.namaInstansi || 'CDC UM Kendari',
  date: k.tanggal || (k.createdAt ? k.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
  time: k.waktu,
  location: k.lokasiEvent || '-',
  image: k.thumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
  description: k.body || '',
  speaker: k.pembicara,
  quota: k.kuotaEvent,
  registeredCount: k.terdaftar,
  registrationLink: k.linkDaftar,
  status: k.statusEvent || 'buka',
  uploadedAt: k.createdAt
});

const findMatchedEvent = (targetId: string | null | undefined, list: EventLayananItem[]): EventLayananItem | null => {
  if (!targetId) return null;
  const rawId = targetId.toLowerCase().trim();
  const cleanId = rawId.replace(/^kk_/, '').replace(/^kk-/, '');
  return list.find(e => {
    const eid = e.id.toLowerCase().trim();
    const eClean = eid.replace(/^kk_/, '').replace(/^kk-/, '');
    const titleSlug = slugify(e.title);
    return (
      eid === rawId ||
      eClean === cleanId ||
      eid === cleanId ||
      rawId === eClean ||
      (titleSlug && titleSlug === rawId) ||
      (titleSlug && titleSlug === cleanId) ||
      (e.title && e.title.toLowerCase().trim() === cleanId) ||
      (e.title && cleanId.length > 3 && e.title.toLowerCase().includes(cleanId))
    );
  }) || null;
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
  mobileBottomContent
}: EventCardLayoutProps) {
  const navigate = useNavigate();
  const { setIsDetailActive } = useLayanan();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy] = useState<'terbaru' | 'terlama' | 'az' | 'za'>('terbaru');

  // Gabungkan seed dummy + hasil input admin yang sudah published
  const allEvents = useMemo(() => {
    const fromKonten = (kontenEvents || [])
      .filter(k => {
        if (k.status !== 'published') return false;
        const kj = (k.jenis || '').toLowerCase().trim();
        const cat = category.toLowerCase().trim();
        if (kj === cat) return true;
        if ((cat === 'campus-hiring' || cat === 'campus_hiring') && (kj === 'campus-hiring' || kj === 'campus_hiring')) return true;
        if ((cat === 'career-fair' || cat === 'job-fair' || cat === 'job_fair') && (kj === 'career-fair' || kj === 'job-fair' || kj === 'job_fair')) return true;
        return false;
      })
      .map(mapKontenToEvent);
    return [...fromKonten, ...events];
  }, [events, kontenEvents, category]);

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
      if ((cat === 'campus-hiring' || cat === 'campus_hiring') && (itemCat === 'campus-hiring' || itemCat === 'campus_hiring')) isCategoryMatch = true;
      if ((cat === 'career-fair' || cat === 'job-fair' || cat === 'job_fair') && (itemCat === 'career-fair' || itemCat === 'job-fair' || itemCat === 'job_fair')) isCategoryMatch = true;
      if (!isCategoryMatch && events.includes(item)) isCategoryMatch = true;

      if (!isCategoryMatch) return false;

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

    // Sorting logic: tanggal kegiatan utama; tie-breaker = waktu upload
    // terbaru (yang baru diupload admin selalu tampil paling atas)
    list = [...list].sort((a, b) => {
      if (sortBy === 'terbaru') {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (
          new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
        );
      }
      if (sortBy === 'terlama') {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (
          new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime()
        );
      }
      if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'za') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return list;
  }, [allEvents, category, searchQuery, sortBy]);

  // Reset ke halaman 1 saat hasil filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        categoryLabel={pageTitle}
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

            {/* Search Bar */}
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
                  onClick={() => setSearchQuery('')}
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
          {/* Search Bar (full-width, tanpa Dropdown Periode) */}
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
