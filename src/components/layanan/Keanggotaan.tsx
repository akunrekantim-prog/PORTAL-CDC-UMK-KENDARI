import React, { useState, useEffect } from 'react';
import { getAnggotaTim } from '../../data';
import { AnggotaTim } from '../../types';
import { Users, ZoomIn, X } from 'lucide-react';

export default function Keanggotaan() {
  const [anggotaList, setAnggotaList] = useState<AnggotaTim[]>([]);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);

  useEffect(() => {
    setAnggotaList(getAnggotaTim());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12 min-w-0" id="layanan-keanggotaan">

      {/* ── HEADER TITLE & SUBTITLE ── */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
          Struktur Organisasi &amp; Keanggotaan Tim CDC
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base">
          Profil pengelola, ketua tim kerja, dan asisten program Career Development Center Universitas Muhammadiyah Kendari.
        </p>
      </div>

      {/* ── 4-COLUMN MEMBER GRID (MATCHING SAMPLE IMAGES) ── */}
      {anggotaList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 font-medium">
          Belum ada data anggota tim CDC yang dimasukkan oleh Admin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10">
          {anggotaList.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col items-center text-center space-y-3.5 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Photo Frame */}
              <div
                onClick={() => setZoomFoto(item.fotoUrl)}
                className="w-full aspect-square relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm cursor-pointer group-hover:shadow-md transition-all"
              >
                {item.fotoUrl ? (
                  <img
                    src={item.fotoUrl}
                    alt={item.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Users className="w-16 h-16" />
                  </div>
                )}

                {/* Hover overlay zoom */}
                {item.fotoUrl && (
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-2.5 rounded-full bg-white/90 text-slate-900 shadow-md">
                      <ZoomIn className="w-4 h-4 text-[#F26522]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Name & Jabatan */}
              <div className="space-y-1 max-w-[90%]">
                <h3 className="font-extrabold text-[#1E3A8A] text-sm sm:text-base leading-snug group-hover:text-[#F26522] transition-colors">
                  {item.nama}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {item.jabatan}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ZOOM MODAL FOR PHOTO ── */}
      {zoomFoto && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center" onClick={() => setZoomFoto(null)}>
          <button
            onClick={() => setZoomFoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <img src={zoomFoto} alt="Zoom Profil Anggota" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
}
