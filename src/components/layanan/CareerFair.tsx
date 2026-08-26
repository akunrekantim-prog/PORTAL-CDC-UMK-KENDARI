import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Section } from './ui';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { useLayanan } from './LayananContainer';
import { getJobFair } from '../../data';
import { JobFairItem } from '../../types';

const formatDateDisplay = (dateStart: string, dateEnd?: string) => {
  try {
    const d1 = new Date(dateStart);
    if (isNaN(d1.getTime())) return dateStart;
    const f1 = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d1);
    if (!dateEnd || dateEnd === dateStart) return f1;
    const d2 = new Date(dateEnd);
    const f2 = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d2);
    return `${f1} – ${f2}`;
  } catch {
    return dateStart;
  }
};

export default function CareerFair() {
  const [items, setItems] = useState<JobFairItem[]>([]);
  const [selectedFair, setSelectedFair] = useState<JobFairItem | null>(null);
  const [activeDetailStep, setActiveDetailStep] = useState<'detail' | 'ticket'>('detail');
  // Ticket registration states
  const [ticketNama, setTicketNama] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketHp, setTicketHp] = useState('');
  const [ticketInstansi, setTicketInstansi] = useState('Universitas Muhammadiyah Kendari');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const { setIsDetailActive } = useLayanan();

  useEffect(() => {
    setItems(getJobFair());
  }, []);

  // Sinkronkan status detail agar header container disembunyikan saat detail terbuka
  useEffect(() => {
    setIsDetailActive(selectedFair !== null);
  }, [selectedFair, setIsDetailActive]);

  const handleOpenFairDetail = (fair: JobFairItem) => {
    setSelectedFair(fair);
    setActiveDetailStep('detail');
    setTicketSuccess(false);
    setTicketNama('');
    setTicketEmail('');
    setTicketHp('');
    setTicketInstansi('Universitas Muhammadiyah Kendari');
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedFair(null);
    window.scrollTo(0, 0);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNama.trim() || !ticketEmail.trim() || !ticketHp.trim()) {
      alert('Nama Lengkap, Email, dan No WhatsApp wajib diisi.');
      return;
    }
    const generatedCode = `UMK-JF-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketCode(generatedCode);
    setTicketSuccess(true);
  };

  // ===== HALAMAN DETAIL (ringkas: pamflet + judul + tombol daftar) =====
  if (selectedFair) {
    return (
      <div id="layanan-career-fair-detail">
        <ShareableDetailPage
          title={selectedFair.judul}
          categoryLabel="Job Fair"
          imageUrl={selectedFair.bannerUrl || '/poster-cdc-web-umk-2.svg'}
          onBack={handleBackToList}
          metaItems={[]}
        >
          {/* Detail ringkas: hanya pamflet & judul besar sesuai arahan PM */}
        </ShareableDetailPage>
      </div>
    );
  }

  // ===== DAFTAR CARD =====
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10" id="layanan-career-fair">
      {/* Deskripsi flat — judul sudah ditampilkan LayananContainer di atas */}
      <div className="-mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Job Fair &amp; Expo
        </p>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          Daftar pameran bursa kerja akbar menghadirkan puluhan perusahaan BUMN &amp; Swasta Nasional.
        </p>
      </div>

      <Section title="Daftar Event Job Fair">
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
            Belum ada agenda Job Fair yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((fair, idx) => (
              <motion.div
                key={fair.id}
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
                onClick={() => handleOpenFairDetail(fair)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenFairDetail(fair); } }}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full cursor-pointer"
              >
                {/* Thumbnail / Poster */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={fair.bannerUrl || '/poster-cdc-web-umk-2.svg'}
                    alt={fair.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Card Body — cukup judul besar saja sesuai arahan PM */}
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-3 leading-snug group-hover:text-[#0077C6] transition-colors">
                    {fair.judul}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
