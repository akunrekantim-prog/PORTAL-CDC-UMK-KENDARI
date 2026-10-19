import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Users, 
  Facebook, 
  Instagram, 
  Youtube, 
  Globe,
  Twitter,
  Linkedin,
  ShieldCheck,
  FileText,
  Map,
  X,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { getFromDB, getCdcClubConfig } from '../data';
import { Lowongan, Berita, Pengumuman, KontenKarir, SocialMediaItem, CdcClubConfig } from '../types';
import { useLanguage } from '../i18n';

const PLATFORM_ICONS: Record<string, { icon: React.ElementType; defaultColor: string }> = {
  facebook: { icon: Facebook, defaultColor: 'hover:bg-blue-600' },
  instagram: { icon: Instagram, defaultColor: 'hover:bg-pink-600' },
  youtube: { icon: Youtube, defaultColor: 'hover:bg-red-600' },
  website: { icon: Globe, defaultColor: 'hover:bg-[#10B981]' },
  twitter: { icon: Twitter, defaultColor: 'hover:bg-sky-500' },
  linkedin: { icon: Linkedin, defaultColor: 'hover:bg-blue-700' },
  tiktok: { icon: Globe, defaultColor: 'hover:bg-slate-900' },
};

interface FooterProps {
  onSelectLowongan?: (id: string) => void;
  onSelectBerita?: (slug: string) => void;
  onSelectProgram?: (id: string) => void;
  onSelectPrestasi?: (k: KontenKarir) => void;
  onSelectEvent?: (id: string) => void;
  setTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectLowongan,
  onSelectBerita,
  onSelectProgram,
  onSelectPrestasi,
  onSelectEvent,
  setTab
}) => {
  const { t, translateContent } = useLanguage();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'sitemap' | null>(null);

  const publishedLowongan = getFromDB<Lowongan>('lowongan')
    .filter(l => l.status === 'published')
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const socialMediaList = getFromDB<SocialMediaItem>('social_media').filter(
    (item) => item.isActive && item.url && item.url.trim() !== ''
  );

  // 1. Data kandidat Popular Info dinamis (5 rilis/pinned terbaru)
  const publishedBerita = getFromDB<Berita>('berita').filter(b => b.status === 'published');
  const publishedPengumuman = getFromDB<Pengumuman>('pengumuman').filter(p => p.status === 'published');
  const publishedNonLowonganKonten = getFromDB<KontenKarir>('konten_karir').filter(
    k => k.status === 'published' && (k.jenis as string) !== 'lowongan' && (k.jenis as string) !== 'magang'
  );

  const handleKontenDetailClick = (k: KontenKarir) => {
    window.scrollTo(0, 0);
    if (k.jenis === 'berita') {
      if (onSelectBerita) onSelectBerita(`kk-${k.id}`);
      else if (setTab) setTab('berita');
    } else if (k.jenis === 'workshop' || k.jenis === 'softskill' || k.jenis === 'seminar') {
      if (onSelectEvent) onSelectEvent(k.id);
      if (setTab) setTab(k.jenis);
    } else if (k.jenis === 'presentasi') {
      if (onSelectPrestasi) onSelectPrestasi(k);
      if (setTab) setTab(`presentasi-${k.kategori || 'internasional'}-${k.subKategori || 'akademik'}`);
    } else if (k.jenis === 'program') {
      if (onSelectProgram) onSelectProgram(k.id);
      else if (setTab) setTab('beranda');
    } else if (onSelectProgram) {
      onSelectProgram(k.id);
    } else if (setTab) {
      setTab('beranda');
    }
  };

  const pinnedItems = publishedNonLowonganKonten
    .filter(k => k.isPinned)
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime());

  const unpinnedCandidates = [
    ...publishedBerita.map(b => ({
      label: b.title,
      createdAt: b.createdAt,
      action: () => {
        window.scrollTo(0, 0);
        if (onSelectBerita) onSelectBerita(b.slug);
        else if (setTab) setTab('berita');
      }
    })),
    ...publishedPengumuman.map(p => ({
      label: p.title,
      createdAt: p.createdAt,
      action: () => {
        window.scrollTo(0, 0);
        if (onSelectProgram) onSelectProgram(p.id);
        else if (setTab) setTab('beranda');
      }
    })),
    ...publishedNonLowonganKonten.filter(k => !k.isPinned).map(k => ({
      label: k.judul,
      createdAt: k.createdAt || k.updatedAt,
      action: () => handleKontenDetailClick(k)
    }))
  ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const allPopularCandidates = [
    ...pinnedItems.map(k => ({
      label: k.judul,
      createdAt: k.createdAt || k.updatedAt,
      action: () => handleKontenDetailClick(k)
    })),
    ...unpinnedCandidates
  ];

  const uniquePopularCandidates: { label: string; action: () => void }[] = [];
  const seenLabels = new Set<string>();
  for (const item of allPopularCandidates) {
    if (!seenLabels.has(item.label)) {
      seenLabels.add(item.label);
      uniquePopularCandidates.push(item);
    }
  }

  const footerPopularItems = uniquePopularCandidates.slice(0, 5);

  const handleLinkClick = (id?: string) => {
    window.scrollTo(0, 0);
    if (id && onSelectLowongan) {
      onSelectLowongan(id);
    } else if (setTab) {
      setTab('lowongan');
    }
  };

  const handleSitemapNavigate = (tab?: string, href?: string) => {
    setActiveModal(null);
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (tab && setTab) {
      window.scrollTo(0, 0);
      setTab(tab);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const SITEMAP_GROUPS = [
    {
      title: 'Navigasi Utama & Profil',
      items: [
        { label: 'Beranda Portal', tab: 'beranda' },
        { label: 'Visi – Misi CDC UMK', tab: 'visi-misi' },
        { label: 'Keanggotaan & Struktur', tab: 'keanggotaan' },
        { label: 'Surat Keputusan (SK) CDC', tab: 'sk-cdc' },
        { label: 'Kalender Kegiatan Karir', tab: 'kalender' },
        { label: 'Laporan Kinerja CDC', tab: 'laporan' },
        { label: 'MOU Stakeholder & Mitra', tab: 'mou' },
        { label: 'Galeri & Dokumentasi', tab: 'galeri' }
      ]
    },
    {
      title: 'Layanan Pengembangan Karir',
      items: [
        { label: 'Berita & Artikel Karir', tab: 'berita' },
        { label: 'Konseling Karir Mahasiswa', tab: 'konseling' },
        { label: 'Event Pengembangan Karir', tab: 'event' }
      ]
    },
    {
      title: 'Tracer Study & Portal Diktisaintek',
      items: [
        { label: 'Portal Tracer Study UM Kendari', href: 'https://tracerstudy.umkendari.ac.id/' },
        { label: 'Form Kuesioner Survey Tracer', href: 'https://tracerstudy.umkendari.ac.id/page/survey' },
        { label: 'PKM (Program Kreativitas Mahasiswa)', href: 'https://simbelmawa.kemdiktisaintek.go.id/pkm' },
        { label: 'PPK ORMAWA', href: 'https://ppkormawa.kemdiktisaintek.go.id/' },
        { label: 'P2MW (Program Pembinaan Mahasiswa Wirausaha)', href: 'https://p2mw.kemdiktisaintek.go.id/' },
        { label: 'KMI EXPO Kemdiktisaintek', href: 'https://simbelmawa.kemdiktisaintek.go.id/' },
        { label: 'PILMAPRES Diktisaintek', href: 'https://pilmapres.kemdiktisaintek.go.id/' }
      ]
    },
    {
      title: 'Prestasi Mahasiswa & Alumni',
      items: [
        { label: 'Prestasi Internasional Akademik', tab: 'presentasi-internasional-akademik' },
        { label: 'Prestasi Internasional Non-Akademik', tab: 'presentasi-internasional-non-akademik' },
        { label: 'Prestasi Nasional Akademik', tab: 'presentasi-nasional-akademik' },
        { label: 'Prestasi Nasional Non-Akademik', tab: 'presentasi-nasional-non-akademik' },
        { label: 'Prestasi Wilayah Akademik', tab: 'presentasi-wilayah-akademik' },
        { label: 'Prestasi Wilayah Non-Akademik', tab: 'presentasi-wilayah-non-akademik' }
      ]
    },
    {
      title: 'Pendaftaran Akun & Info Lowongan',
      items: [
        { label: 'Daftar Akun Mahasiswa / Alumni', tab: 'register-alumni' },
        { label: 'Daftar Akun Mitra Industri', tab: 'register-perusahaan' },
        { label: 'Portal Lowongan Kerja Terbaru', tab: 'lowongan' },
        { label: 'Program Internship / Magang', tab: 'magang' },
        { label: 'Tes Potensi Minat (Klob Meter)', href: 'https://www.klob.id/klob-journey/klob-meter' },
        { label: 'APSKAR PTMA Indonesia', href: 'https://apskarptma.or.id/' }
      ]
    }
  ];

  return (
    <footer className="bg-[#0F1F4B] text-slate-400 pt-16 pb-8" id="pub-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand col */}
          <div className="md:col-span-5 space-y-6">
            <button
              onClick={() => { window.scrollTo(0, 0); setTab?.('beranda'); }}
              className="flex items-center cursor-pointer group focus-visible:outline-none text-left"
              title="Kembali ke Beranda"
            >
              <img
                src="/logo-cdc-branding-light.png"
                alt="CDC Career Development Center Universitas Muhammadiyah Kendari"
                className="h-20 md:h-24 lg:h-28 w-auto object-contain group-hover:scale-105 transition-transform cursor-pointer"
              />
            </button>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {t('footer.tentang', 'Pusat Pengembangan Karir dan Alumni, Universitas Muhammadiyah Kendari. Berkomitmen menjembatani lulusan dengan dunia kerja profesional.')}
            </p>

            {/* CDC Club mini-badge (1 toggle dgn card beranda) */}
            {(() => {
              const club = getCdcClubConfig();
              if (!club.published) return null;
              const openClub = () => { if (club.buttonUrl) window.open(club.buttonUrl, '_blank', 'noopener,noreferrer'); };
              return (
                <button
                  onClick={openClub}
                  className="flex items-center gap-3 bg-rose-900/30 border border-rose-800/40 rounded-xl px-4 py-3 w-full text-left hover:bg-rose-900/50 transition-colors"
                >
                  <div className="bg-rose-600 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-xs whitespace-pre-line">{translateContent(club.title)}</div>
                    <div className="text-rose-400 text-[10px]">{translateContent(club.subtitle)}</div>
                  </div>
                </button>
              );
            })()}

            {/* Dynamic Social icons */}
            {socialMediaList.length > 0 && (
              <div className="flex gap-3">
                {socialMediaList.map((item) => {
                  const config = PLATFORM_ICONS[item.platform] || { icon: Globe, defaultColor: 'hover:bg-[#10B981]' };
                  const IconComponent = config.icon;
                  const colorClass = item.hoverColor || config.defaultColor;

                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.label}
                      className={`bg-slate-800 p-2.5 rounded-full ${colorClass} hover:text-white transition-colors cursor-pointer`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Popular Info col */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 uppercase tracking-wider">
              Popular Info
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerPopularItems.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={item.action}
                    className="hover:text-[#10B981] transition-colors flex items-start gap-2 text-left cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#10B981]" />
                    <span className="line-clamp-2">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <span>Jl. K.H. Ahmad Dahlan No. 10, Kendari, Sulawesi Tenggara</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#10B981] shrink-0" />
                <span>0852-4100-9988</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#10B981] shrink-0" />
                <span>cdc@umkendari.ac.id</span>
              </li>
            </ul>

            {/* Info Loker Terkini (5 Data Terbaru) */}
            <div className="mt-6 space-y-2.5">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-1">
                INFO LOKER TERKINI
              </div>
              {publishedLowongan.slice(0, 5).map(l => (
                <button 
                  key={l.id} 
                  onClick={() => handleLinkClick(l.id)}
                  className="w-full text-left text-xs hover:text-[#10B981] transition-colors flex items-start gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-[#10B981]" />
                  <span className="line-clamp-1 font-medium">{l.judul}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Portal CDC Universitas Muhammadiyah Kendari. All rights reserved.</p>
          <div className="flex gap-5 font-medium">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModal('sitemap')}
              className="hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. MODAL: PRIVACY POLICY (KEBIJAKAN PRIVASI)
      ───────────────────────────────────────────────────────────── */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-100 space-y-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Kebijakan Privasi (Privacy Policy)</h3>
                <p className="text-xs text-slate-500 font-medium">Portal Career Development Center — Universitas Muhammadiyah Kendari</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Selamat datang di Portal Career Development Center (CDC) Universitas Muhammadiyah Kendari. Kebijakan Privasi ini menjelaskan komitmen kami dalam mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi milik Mahasiswa, Alumni, serta Mitra Industri.
              </p>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  1. Pengumpulan Data Pribadi
                </h4>
                <p className="text-xs">
                  Kami mengumpulkan informasi penting untuk keperluan layanan karir, verifikasi akademik, serta pengisian Tracer Study, mencakup: NIM, Nama Lengkap, Fakultas, Program Studi, Nomor Telepon/WhatsApp, Alamat Email, Berkas Curriculum Vitae (CV), Transkrip Akademik, dan Profil Instansi Mitra.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  2. Penggunaan Informasi
                </h4>
                <p className="text-xs">
                  Informasi yang Anda berikan hanya digunakan secara resmi untuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs pl-2">
                  <li>Proses penyaluran kerja, lamaran rekrutmen, dan internship ke Mitra Perusahaan terverifikasi.</li>
                  <li>Pelaporan resmi Tracer Study ke Kemdiktisaintek Republik Indonesia.</li>
                  <li>Pengiriman informasi lowongan terbaru, workshop, dan pelatihan softskill CDC UMK.</li>
                </ul>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  3. Keamanan Data & Kerahasiaan (UU PDP)
                </h4>
                <p className="text-xs">
                  Portal CDC UMK tunduk pada Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi. Data Anda disimpan dalam server terenkripsi dengan protokol keamanan tinggi dan tidak akan pernah diperjualbelikan kepada pihak ketiga manapun untuk kepentingan komersial di luar layanan CDC.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  4. Hak Pengguna & Pembaruan Data
                </h4>
                <p className="text-xs">
                  Pengguna berhak memperbarui data diri, mengubah profil karir, serta mengajukan permohonan penutupan akun dengan menghubungi Helpdesk Layanan CDC UMK melalui email resmi <strong>cdc@umkendari.ac.id</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#0F1F4B] hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Saya Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MODAL: TERMS OF SERVICE (SYARAT & KETENTUAN)
      ───────────────────────────────────────────────────────────── */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-100 space-y-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Syarat & Ketentuan Layanan (Terms of Service)</h3>
                <p className="text-xs text-slate-500 font-medium">Ketentuan Etika Penggunaan Portal CDC Universitas Muhammadiyah Kendari</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Dengan mengakses dan mendaftar pada Portal CDC Universitas Muhammadiyah Kendari, Anda menyetujui seluruh ketentuan etika dan aturan operasional berikut:
              </p>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  1. Ketentuan Akun Mahasiswa & Alumni
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs pl-2">
                  <li>Wajib memasukkan NIM, nama lengkap, dan berkas akademik yang valid dan jujur.</li>
                  <li>Dilarang memalsukan identitas, dokumen ijazah, atau CV saat melamar lowongan kerja.</li>
                  <li>Menjaga kerahasiaan password dan bertanggung jawab atas seluruh aktivitas yang terjadi di bawah akun pribadi Anda.</li>
                </ul>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  2. Ketentuan Mitra Industri / Recruiter
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs pl-2">
                  <li>Mitra wajib mempublikasikan lowongan kerja/magang yang sah, jelas, dan non-fiktif.</li>
                  <li><strong>DILARANG KERAS memungut biaya pendaftaran/travel (travel agent fraud)</strong> kepada pelamar mahasiswa/alumni.</li>
                  <li>Mitra berhak menyeleksi kandidat secara profesional sesuai kualifikasi instansi.</li>
                </ul>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  3. Hak Cipta & Pembatasan Tanggung Jawab
                </h4>
                <p className="text-xs">
                  Seluruh materi, logo, dan sistem portal merupakan milik resmi CDC UM Kendari. Pengelola berhak menangguhkan atau menghapus akun (banned) yang terbukti melanggar etika, menyebarkan spam, atau melakukan tindakan penipuan.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#0F1F4B] hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Setuju & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MODAL: SITEMAP (PETA SITUS INTERAKTIF)
      ───────────────────────────────────────────────────────────── */}
      {activeModal === 'sitemap' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-100 space-y-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Peta Situs (Interactive Sitemap)</h3>
                <p className="text-xs text-slate-500 font-medium">Struktur Lengkap & Navigasi Cepat Portal CDC UM Kendari</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SITEMAP_GROUPS.map((group, idx) => (
                <div key={idx} className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 text-[#0F1F4B]">
                    {group.title}
                  </h4>
                  <ul className="space-y-1.5">
                    {group.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <button
                          onClick={() => handleSitemapNavigate(item.tab, item.href)}
                          className="w-full text-left text-xs font-semibold text-slate-700 hover:text-[#10B981] hover:bg-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate">{item.label}</span>
                          {item.href ? (
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#10B981] shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-transform shrink-0" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Klik pada menu di atas untuk langsung menuju ke halaman yang diinginkan.</span>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#0F1F4B] hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                Tutup Sitemap
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};

