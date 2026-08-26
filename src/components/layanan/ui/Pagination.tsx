import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Kontrol navigasi halaman gaya editorial:
 * kotak persegi bersambung — halaman aktif gelap, lainnya putih,
 * ellipsis jika banyak halaman, tombol panah untuk lanjut.
 * Sembunyikan tombol Kiri (Prev) saat di halaman 1, dan Kanan (Next) saat di halaman terakhir.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Susun daftar nomor halaman dengan ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, Math.min(currentPage - 1, totalPages - 2));
    const end = Math.min(totalPages - 1, Math.max(currentPage + 1, 3));
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const base =
    'w-10 h-10 flex items-center justify-center text-sm font-bold border transition-colors cursor-pointer select-none';
  const boxStyle = '-ml-px first:ml-0';

  return (
    <nav className="flex items-center justify-center pt-4" aria-label="Navigasi halaman">
      <div className="flex items-stretch">
        {/* Tombol prev (Kiri) - Disembunyikan saat di Halaman 1 */}
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-label="Halaman sebelumnya"
            className={`${base} ${boxStyle} bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {pages.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className={`${base} ${boxStyle} border-slate-200 bg-white text-slate-400 cursor-default`}
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`${base} ${boxStyle} ${
                p === currentPage
                  ? 'bg-[#000066] border-[#000066] text-white hover:bg-[#000066]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Tombol next (Kanan) - Disembunyikan saat di Halaman Terakhir */}
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            aria-label="Halaman berikutnya"
            className={`${base} ${boxStyle} bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  );
}
