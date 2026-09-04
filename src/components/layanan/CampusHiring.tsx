import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Video
} from 'lucide-react';
import { Section } from './ui';
import Pagination from './ui/Pagination';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { useLayanan } from './LayananContainer';
import { getCampusHiring, saveCampusHiring } from '../../data';
import { CampusHiringItem } from '../../types';

const formatDateDisplay = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

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

  // ===== HALAMAN DETAIL (ringkas: pamflet + judul + tombol daftar) =====
  if (selectedEvent) {
    return (
      <div id="layanan-campus-hiring-detail">
        <ShareableDetailPage
          title={selectedEvent.judul}
          categoryLabel="Campus Hiring - Recruitment"
          imageUrl={selectedEvent.bannerUrl || selectedEvent.logoPerusahaan || '/poster-cdc-web-umk-1.svg'}
          posterAspect={selectedEvent.posterAspect || '16:9'}
          onBack={handleBackToList}
          metaItems={[]}
        >
          {/* Detail ringkas: hanya pamflet & judul besar sesuai arahan PM */}
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

                {/* Card Body — cukup judul besar saja sesuai arahan PM */}
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-3 leading-snug group-hover:text-[#0077C6] transition-colors">
                    {event.judul}
                  </h3>
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
