import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, MapPin, User, Users, ExternalLink, Filter, X, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { EventLayananItem } from '../../../types';

interface EventCardLayoutProps {
  category: 'workshop' | 'softskill' | 'seminar';
  pageTitle: string;
  subtitle: string;
  events: EventLayananItem[];
}

export default function EventCardLayout({
  category,
  pageTitle,
  subtitle,
  events
}: EventCardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<EventLayananItem | null>(null);

  const handleSelectEvent = (item: EventLayananItem) => {
    setSelectedEvent(item);
  };

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(item => {
      // Category match
      if (item.category !== category) return false;

      // Text search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.organizer.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.speaker && item.speaker.toLowerCase().includes(query));

      // Status match
      const matchesStatus =
        selectedStatus === 'semua' || item.status === selectedStatus;

      // Date range match
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && item.date >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && item.date <= endDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [events, category, searchQuery, selectedStatus, startDate, endDate]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('semua');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery !== '' || selectedStatus !== 'semua' || startDate !== '' || endDate !== '';

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: EventLayananItem['status']) => {
    switch (status) {
      case 'buka':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Pendaftaran Dibuka
          </span>
        );
      case 'segera':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Segera Hadir
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <CheckCircle className="w-3 h-3 text-slate-400" />
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Title Section */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-slate-600 mt-2 text-base leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Control Panel: Search & Date Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kegiatan..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="buka">Pendaftaran Dibuka</option>
              <option value="segera">Segera Hadir</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          {/* Date Filter Range */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Tanggal Mulai"
                className="w-full px-2.5 py-2 bg-slate-50 text-slate-700 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:bg-white outline-none"
                title="Tanggal Mulai"
              />
            </div>
            <span className="text-slate-400 text-xs font-medium">s/d</span>
            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Tanggal Akhir"
                className="w-full px-2.5 py-2 bg-slate-50 text-slate-700 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:bg-white outline-none"
                title="Tanggal Akhir"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Menampilkan <strong className="text-slate-800 font-semibold">{filteredEvents.length}</strong> kegiatan dari total {events.filter(e => e.category === category).length}
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Grid List Event Cards */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full"
            >
              {/* Thumbnail Header Image */}
              <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(item.status)}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2.5 py-1 rounded bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium">
                    By Admin
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-semibold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Metadata List */}
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{formatDateIndo(item.date)}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2">
                  <button
                    onClick={() => handleSelectEvent(item)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Detail Kegiatan <ChevronRight className="w-3.5 h-3.5" />
                  </button>
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
            Coba ganti kata kunci pencarian, ubah filter status, atau atur ulang rentang tanggal.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Modal Detail Event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Image */}
            <div className="relative aspect-[9/16] bg-slate-900">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm text-xs">
                <p className="text-slate-400 font-medium">Tanggal</p>
                <p className="text-slate-800 font-semibold">{formatDateIndo(selectedEvent.date)}</p>
              </div>

              <div className="flex items-center justify-between mt-2">
                {getStatusBadge(selectedEvent.status)}
                <span className="text-slate-500 text-[10px] font-medium">
                  By Admin
                </span>
              </div>
              
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {selectedEvent.status === 'buka' && selectedEvent.registrationLink ? (
                  <a
                    href={selectedEvent.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[2] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                  >
                    Daftar Sekarang <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-[2] px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed"
                  >
                    {selectedEvent.status === 'segera' ? 'Pendaftaran Belum Dibuka' : 'Pendaftaran Ditutup'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
