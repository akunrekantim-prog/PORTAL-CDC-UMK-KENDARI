import React, { useState } from 'react';
import { Search, Info, Building2, Clock } from 'lucide-react';
import { Lowongan } from '../../types';
import { sortJobsByNewest, formatDateDisplay } from '../../data';
import Pagination from './ui/Pagination';

interface MagangProps {
  lowongan?: Lowongan[];
  onSelectLowongan?: (id: string) => void;
}

export default function Magang({ lowongan = [], onSelectLowongan }: MagangProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter published magang lowongan
  const publishedMagang = sortJobsByNewest(
    lowongan.filter(l => l.status === 'published' && l.tipe === 'magang')
  );

  const filteredLowongan = publishedMagang.filter(item => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="layanan-magang">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
          Daftar Program Magang / Internship
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base">
          Temukan kesempatan magang industri resmi dari mitra terpercaya CDC UM Kendari.
        </p>
      </div>

      {/* Controls Bar: Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
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
            {paginatedLowongan.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectLowongan && onSelectLowongan(item.id)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Company Logo Image Container (Background Putih Bersih) */}
                  <div className="w-full h-44 relative overflow-hidden bg-white flex items-center justify-center p-3 border-b border-slate-100">
                    {item.companyLogo ? (
                      <img
                        src={item.companyLogo}
                        alt={item.namaInstansi}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 space-y-1">
                        <Building2 className="w-10 h-10 text-slate-400" />
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{item.namaInstansi}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <div className="text-xs font-bold text-orange-600 tracking-wide uppercase truncate">
                      {item.namaInstansi}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2">
                      {item.judul}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
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
