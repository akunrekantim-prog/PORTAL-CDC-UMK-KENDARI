import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Video,
  Clock
} from 'lucide-react';
import { formatDateDisplay } from '../../data';
import { Section } from './ui';
import Pagination from './ui/Pagination';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { useLayanan } from './LayananContainer';
import { getCampusHiring, saveCampusHiring } from '../../data';
import { CampusHiringItem } from '../../types';

export default function CampusHiring() {
  const [items, setItems] = useState<CampusHiringItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusHiringItem | null>(null);
  const [activeDetailStep, setActiveDetailStep] = useState<'detail' | 'form'>('detail');

  // Form states pendaftaran peserta
  const [regNama, setRegNama] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regHp, setRegHp] = useState('');
  const [regProdi, setRegProdi] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { setIsDetailActive } = useLayanan();

  useEffect(() => {
    setItems(getCampusHiring());
  }, []);

  // Sinkronkan status detail agar header container disembunyikan saat detail terbuka
  useEffect(() => {
    setIsDetailActive(selectedEvent !== null);
  }, [selectedEvent, setIsDetailActive]);

  const handleOpenEventDetail = (event: CampusHiringItem) => {
    setSelectedEvent(event);
    setActiveDetailStep('detail');
    setRegSuccess(false);
    setRegNama('');
    setRegNim('');
    setRegEmail('');
    setRegHp('');
    setRegProdi('');
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    window.scrollTo(0, 0);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama.trim() || !regEmail.trim() || !regHp.trim()) {
      alert('Nama Lengkap, Email, dan No WhatsApp wajib diisi.');
      return;
    }

    if (selectedEvent) {
      const updatedItems = items.map((item) => {
        if (item.id === selectedEvent.id) {
          return {
            ...item,
            terdaftarCount: (item.terdaftarCount || 0) + 1
          };
        }
        return item;
      });
      saveCampusHiring(updatedItems);
      setItems(updatedItems);
    }

    setRegSuccess(true);
  };

  // ===== HALAMAN DETAIL (pamflet + judul + deskripsi) =====
  if (selectedEvent) {
    return (
      <div id="layanan-campus-hiring-detail">
        <ShareableDetailPage
          title={selectedEvent.judul}
          categoryLabel="Campus Hiring - Recruitment"
          imageUrl={selectedEvent.bannerUrl || selectedEvent.logoPerusahaan || '/poster-cdc-web-umk-1.svg'}
          posterAspect={selectedEvent.posterAspect || '16:9'}
          uploadDateLabel={formatDateDisplay(selectedEvent.createdAt)}
          onBack={handleBackToList}
          metaItems={[]}
        >
          {selectedEvent.deskripsi && (
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6 pt-2">
              <div className="space-y-4 text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {selectedEvent.deskripsi}
              </div>
            </div>
          )}
        </ShareableDetailPage>
      </div>
    );
  }

  // ===== DAFTAR CARD =====
  // ===== PAGINATION: maksimal 6 card per halaman =====
  const CARDS_PER_PAGE = 6;
  const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pagedItems = items.slice((safePage - 1) * CARDS_PER_PAGE, safePage * CARDS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('layanan-list-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10" id="layanan-campus-hiring">
      {/* Deskripsi flat — judul sudah ditampilkan LayananContainer di atas */}
      <div className="-mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Recruitment &amp; Interview
        </p>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          Daftar rekrutmen &amp; wawancara kerja langsung di kampus kerja sama CDC UM Kendari dengan perusahaan mitra resmi.
        </p>
      </div>

      <Section title="Daftar Agenda Campus Hiring">
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
            Belum ada agenda Campus Hiring yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedItems.map((event, idx) => (
              <motion.div
                key={event.id}
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
                onClick={() => handleOpenEventDetail(event)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenEventDetail(event); } }}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
              >
                {/* Thumbnail / Poster (Selalu 16:9 di tampilan daftar, 9:16 tampil penuh di detail saat diklik) */}
                <div className="relative overflow-hidden border-b border-slate-100 bg-slate-950 flex items-center justify-center aspect-[16/9]">
                  {event.bannerUrl || event.logoPerusahaan ? (
                    <img
                      src={event.bannerUrl || event.logoPerusahaan}
                      alt={event.judul}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Card Body — judul + footer keterangan */}
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-3 leading-snug group-hover:text-[#0077C6] transition-colors flex-1">
                    {event.judul}
                  </h3>

                  {/* Meta Footer: source + tanggal upload admin */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                    <span className="whitespace-nowrap font-medium text-slate-400">by Admin Website</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {formatDateDisplay(event.createdAt)}
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
        )}
      </Section>
    </div>
  );
}
