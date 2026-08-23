import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Filter, X, Layers, ArrowUpDown } from 'lucide-react';
import { EventLayananItem, KontenKarir } from '../../../types';
import EventDetailView from '../EventDetailView';
import { useLayanan } from '../LayananContainer';
import Dropdown from '../../Dropdown';

interface EventCardLayoutProps {
  category: 'workshop' | 'softskill' | 'seminar';
  pageTitle: string;
  subtitle: string;
  events: EventLayananItem[];
  kontenEvents?: KontenKarir[]; // hasil input admin (jenis workshop/softskill/seminar)
  onDetailStateChange?: (isDetail: boolean) => void;
  setTab?: (tab: string) => void;
}

// Bersihkan teks markdown sederhana dari body konten admin agar tampil
// rapi di kartu preview
const cleanText = (s: string = ''): string =>
  s
    .replace(/\n/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\[\/[a-z]+\]/gi, '')
    .replace(/\[[a-z]+(?::[^\]]*)?\]/gi, '')
    .replace(/[#>*_`~\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const mapKontenToEvent = (k: KontenKarir): EventLayananItem => ({
  id: `kk_${k.id}`,
  category: (k.jenis === 'workshop' || k.jenis === 'softskill' || k.jenis === 'seminar')
    ? k.jenis
    : 'workshop',
  title: k.judul,
  organizer: k.namaInstansi || 'CDC UM Kendari',
  date: k.tanggal || k.createdAt.slice(0, 10),
  time: k.waktu,
  location: k.lokasiEvent || '-',
  image: k.thumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
  description: k.body || '',
  speaker: k.pembicara,
  quota: k.kuotaEvent,
  registeredCount: k.terdaftar,
  registrationLink: k.linkDaftar,
  status: k.statusEvent || 'buka'
});

export default function EventCardLayout({
  category,
  pageTitle,
  subtitle,
  events,
  kontenEvents,
  onDetailStateChange,
  setTab
}: EventCardLayoutProps) {
  const { setIsDetailActive } = useLayanan();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'az' | 'za'>('terbaru');
  const [selectedEvent, setSelectedEvent] = useState<EventLayananItem | null>(null);

  // Sync detail state to LayananContainer & optional prop callback
  useEffect(() => {
    const isDetail = selectedEvent !== null;
    if (setIsDetailActive) {
      setIsDetailActive(isDetail);
    }
    if (onDetailStateChange) {
      onDetailStateChange(isDetail);
    }
  }, [selectedEvent, setIsDetailActive, onDetailStateChange]);

  // Gabungkan seed dummy + hasil input admin yang sudah published
  const allEvents = useMemo(() => {
    const fromKonten = (kontenEvents || [])
      .filter(k => k.status === 'published' && k.jenis === category)
      .map(mapKontenToEvent);
    return [...fromKonten, ...events];
  }, [events, kontenEvents, category]);

  // Ekstrak daftar tahun kegiatan yang tersedia secara dinamis
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allEvents.forEach((item) => {
      if (item.category === category && item.date) {
        const y = item.date.slice(0, 4);
        if (y && !isNaN(Number(y))) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [allEvents, category]);

  // Filter logic: Pencarian teks, filter tahun, & pengurutan (HARUS SEBELUM CONDITIONAL RETURN)
  const filteredEvents = useMemo(() => {
    let list = allEvents.filter(item => {
      // Category match
      if (item.category !== category) return false;

      // Text search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.organizer.toLowerCase().includes(query) ||
        cleanText(item.description).toLowerCase().includes(query);

      // Year match
      let matchesYear = true;
      if (selectedYear !== 'semua') {
        matchesYear = item.date?.startsWith(selectedYear) || false;
      }

      return matchesSearch && matchesYear;
    });

    // Sorting logic
    list = [...list].sort((a, b) => {
      if (sortBy === 'terbaru') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'terlama') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
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
  }, [allEvents, category, searchQuery, selectedYear, sortBy]);

  const handleSelectEvent = (item: EventLayananItem) => {
    setSelectedEvent(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedEvent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedYear('semua');
    setSortBy('terbaru');
  };

  const hasActiveFilters = searchQuery !== '' || selectedYear !== 'semua' || sortBy !== 'terbaru';

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Jika sedang melihat detail, tampilkan EventDetailView penuh
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
      {/* Penjelasan Sub-Menu */}
      {subtitle && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>
      )}

      {/* Control Panel: Search Bar + Filter Periode + Dropdown Urutkan + Badge Total */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* 1. Main Search Input (Lebih Luas & Modern) */}
          <div className="md:col-span-6 lg:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kegiatan atau materi..."
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

          {/* 2. Filter Periode / Tahun */}
          <div className="md:col-span-3 lg:col-span-3 min-w-0">
            <Dropdown
              value={selectedYear}
              onChange={(v) => setSelectedYear(v)}
              className="w-full"
              options={[
                { value: 'semua', label: 'Semua Periode' },
                ...availableYears.map(y => ({ value: y, label: `Tahun ${y}` }))
              ]}
            />
          </div>

          {/* 3. Dropdown Pengurutan (Sort By) */}
          <div className="md:col-span-3 lg:col-span-3 min-w-0">
            <Dropdown
              value={sortBy}
              onChange={(v) => setSortBy(v as any)}
              className="w-full"
              options={[
                { value: 'terbaru', label: '📅 Terbaru' },
                { value: 'terlama', label: '⏳ Terlama' },
                { value: 'az', label: '🔤 Judul (A - Z)' },
                { value: 'za', label: '🔡 Judul (Z - A)' }
              ]}
            />
          </div>
        </div>

        {/* 4. Total Kegiatan Badge & Reset Filter */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-[#0077C6] font-bold border border-blue-100">
              <Layers className="w-3.5 h-3.5 text-[#0077C6]" />
              Menampilkan {filteredEvents.length} Kegiatan
            </span>
            {hasActiveFilters && (
              <span className="text-slate-400 font-medium">
                (dari total {allEvents.filter(e => e.category === category).length} kegiatan)
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-[#0077C6] hover:text-[#1E3A8A] font-bold hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Grid List Event Cards */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectEvent(item)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectEvent(item); } }}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
            >
              {/* Thumbnail Header Poster / Image */}
              <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-[#0077C6] transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Card Footer: Tanggal di kiri & By Admin Website di kanan */}
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{formatDateIndo(item.date)}</span>
                  </div>
                  <span className="text-slate-400 font-medium whitespace-nowrap">
                    by Admin Website
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-base">Tidak ada kegiatan ditemukan</h4>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Coba ganti kata kunci pencarian, ubah periode tahun, atau atur ulang filter.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
