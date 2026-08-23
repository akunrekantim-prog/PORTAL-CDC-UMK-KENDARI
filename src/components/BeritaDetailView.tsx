import React, { useState } from 'react';
import {
  ChevronLeft,
  Tag,
  Clock,
  User,
  MessageSquare,
  Facebook,
  MessageCircle,
  Linkedin,
  Share2,
  CheckCircle2,
  Send,
  CornerDownRight,
  Sparkles
} from 'lucide-react';
import { Berita } from '../types';
import Header from './Header';
import { Footer } from './Footer';
import { renderContentMarkdown } from '../markdown';

interface BeritaDetailViewProps {
  berita: Berita;
  onBack: () => void;
  setTab?: (tab: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
}

interface CommentItem {
  id: string;
  nama: string;
  email: string;
  komentar: string;
  date: string;
}

export default function BeritaDetailView({
  berita,
  onBack,
  setTab,
  onNavigateToLogin,
  onNavigateToRegister,
}: BeritaDetailViewProps) {
  // Form Komentar State
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      nama: 'Ahmad Fauzi',
      email: 'ahmad@example.com',
      komentar: 'Sangat menginspirasi! Edukasi keuangan seperti ini sangat dibutuhkan oleh calon alumni dan mahasiswa tingkat akhir sebelum memasuki dunia kerja.',
      date: '12 Agustus 2026, 14.30'
    }
  ]);
  const [inputKomentar, setInputKomentar] = useState('');
  const [inputNama, setInputNama] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const formatDateDisplayFull = (dateStr?: string) => {
    if (!dateStr) return '12 Agustus 2026, 13.15';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '12 Agustus 2026, 13.15';
      const formattedDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${formattedDate}, ${hours}.${mins}`;
    } catch {
      return '12 Agustus 2026, 13.15';
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(berita.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${berita.title}\n\nBaca selengkapnya: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(berita.title);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKomentar.trim() || !inputNama.trim() || !inputEmail.trim()) {
      setToastMsg('Mohon lengkapi Ruas yang Wajib Ditandai (*) terlebih dahulu.');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }

    const newComm: CommentItem = {
      id: `comm_${Date.now()}`,
      nama: inputNama.trim(),
      email: inputEmail.trim(),
      komentar: inputKomentar.trim(),
      date: 'Baru saja'
    };

    setComments(prev => [newComm, ...prev]);
    setInputKomentar('');
    if (!rememberMe) {
      setInputNama('');
      setInputEmail('');
    }
    setToastMsg('Komentar Anda berhasil dikirim dan ditambahkan!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const authorName = (!berita.penulis || berita.penulis.toLowerCase().includes('admin'))
    ? 'Admin Website'
    : berita.penulis;

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-slate-800" id="berita-detail-page">
      {/* 1. Global Header */}
      <Header
        currentTab="berita"
        setTab={setTab || (() => {})}
        onNavigateToLogin={onNavigateToLogin || (() => {})}
        onNavigateToRegister={onNavigateToRegister}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-5 z-50 bg-[#1E3A8A] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-800 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Top Navigation Back Button */}
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[#0077C6] hover:text-[#1E3A8A] font-bold text-xs sm:text-sm transition group cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Berita &amp; Artikel</span>
            </button>
          </div>

          {/* Main Grid: Left Floating Share Bar + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

            {/* STICKY FLOATING SHARE SIDEBAR (DESKTOP - SISI KIRI) */}
            <aside className="hidden lg:flex lg:col-span-1 flex-col items-center gap-3 sticky top-28 self-start pt-2">
              <button
                onClick={handleShareFacebook}
                className="w-10 h-10 rounded-xl bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke Facebook"
              >
                <Facebook className="w-5 h-5 fill-white" />
              </button>
              <button
                onClick={handleShareX}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke X"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="w-10 h-10 rounded-xl bg-[#25d366] hover:bg-[#1ebd56] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
              </button>
              <button
                onClick={handleShareTelegram}
                className="w-10 h-10 rounded-xl bg-[#229ED9] hover:bg-[#1d87ba] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke Telegram"
              >
                <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="w-10 h-10 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Bagikan ke LinkedIn"
              >
                <Linkedin className="w-5 h-5 fill-white text-transparent" />
              </button>
            </aside>

            {/* MAIN ARTICLE CONTENT (lg:col-span-11) */}
            <div className="lg:col-span-11 space-y-6">

              {/* BREADCRUMB BAR */}
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap" aria-label="Breadcrumb">
                <span className="hover:text-[#0077C6] cursor-pointer" onClick={() => setTab && setTab('beranda')}>Beranda</span>
                <span>&gt;</span>
                <span className="hover:text-[#0077C6] cursor-pointer" onClick={() => setTab && setTab('berita')}>Berita &amp; Artikel</span>
                <span>&gt;</span>
                <span className="text-[#0077C6] font-semibold line-clamp-1 max-w-md">{berita.title}</span>
              </nav>

              {/* ARTICLE MAIN TITLE */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {berita.title}
              </h1>

              {/* METADATA STRIP WITH GOLD ICONS */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium pt-1 pb-3 border-b border-slate-100">
                {/* Categories / Tags */}
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Berita &amp; Artikel, {berita.scope || 'LOKAL'}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{formatDateDisplayFull(berita.createdAt)}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Oleh: <strong className="font-bold text-slate-800">{authorName}</strong></span>
                </div>

                {/* Comments Count */}
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{comments.length}</span>
                </div>
              </div>

              {/* FEATURED MAIN COVER IMAGE (Sesuai Screenshot 2) */}
              {berita.coverImageUrl ? (
                <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-sm relative">
                  <img
                    src={berita.coverImageUrl}
                    alt={berita.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400">
                  <Sparkles className="w-12 h-12 text-[#10B981]" />
                </div>
              )}

              {/* ARTICLE BODY & RICH TEXT FORMATTING WITH FLOATING MEDIA */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6 pt-2">
                {/* Main Body Content (Render 1 kali dari input Admin / Database) */}
                <div className="space-y-4 text-slate-700 leading-relaxed font-normal">
                  {renderContentMarkdown(berita.content)}
                </div>
              </div>

              {/* TAGS SECTION (CYAN / TEAL PILLS — Sesuai Screenshot 3) */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">TAGS:</span>
                {[
                  'CDC UM KENDARI',
                  'SDG 17 - KEMITRAAN UNTUK MENCAPAI TUJUAN',
                  'SDG 4 - PENDIDIKAN BERKUALITAS',
                  'SDG 8'
                ].map((tagText, idx) => (
                  <span
                    key={idx}
                    className="bg-[#0097a7] hover:bg-[#00838f] text-white text-xs font-bold px-3 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
                  >
                    {tagText}
                  </span>
                ))}
              </div>

              {/* BOTTOM HORIZONTAL SOCIAL SHARE BAR */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100">
                <button
                  onClick={handleShareFacebook}
                  className="w-12 h-10 rounded-xl bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke Facebook"
                >
                  <Facebook className="w-5 h-5 fill-white" />
                </button>
                <button
                  onClick={handleShareX}
                  className="w-12 h-10 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke X"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-12 h-10 rounded-xl bg-[#25d366] hover:bg-[#1ebd56] text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                </button>
                <button
                  onClick={handleShareTelegram}
                  className="w-12 h-10 rounded-xl bg-[#229ED9] hover:bg-[#1d87ba] text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke Telegram"
                >
                  <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  className="w-12 h-10 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                  title="Bagikan ke LinkedIn"
                >
                  <Linkedin className="w-5 h-5 fill-white text-transparent" />
                </button>
              </div>

              {/* SECTION: TINGGALKAN KOMENTAR (Sesuai Screenshot 4) */}
              <div className="pt-10 border-t border-slate-200/90 space-y-6">
                {/* Heading with Yellow Accent Underline */}
                <div className="relative pb-3 border-b border-slate-200">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A]">
                    Tinggalkan Komentar
                  </h3>
                  <div className="absolute bottom-0 left-0 w-28 h-1 bg-amber-400 rounded-full" />
                </div>

                <p className="text-xs sm:text-sm text-slate-500">
                  Alamat email Anda tidak akan dipublikasikan. Ruas yang wajib ditandai <span className="text-rose-600 font-bold">*</span>
                </p>

                {/* Form Inputs */}
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  {/* Textarea Komentar */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Komentar <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={inputKomentar}
                      onChange={(e) => setInputKomentar(e.target.value)}
                      placeholder="Tuliskan komentar atau tanggapan Anda..."
                      className="w-full border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition shadow-2xs"
                    />
                  </div>

                  {/* Side-by-Side Nama & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        Nama <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={inputNama}
                        onChange={(e) => setInputNama(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        Email <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Checkbox Save Info */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mt-0.5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
                      />
                      <span>Simpan nama, email, dan situs web saya pada peramban ini untuk komentar saya berikutnya.</span>
                    </label>
                  </div>

                  {/* Submit Button (Dark Navy Blue) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#0B1E48] hover:bg-[#071533] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-md transition shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> KIRIM KOMENTAR
                    </button>
                  </div>
                </form>

                {/* Submitted Comments List */}
                {comments.length > 0 && (
                  <div className="pt-6 space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#1E3A8A]" /> Komentar Terkirim ({comments.length})
                    </h4>
                    <div className="space-y-3">
                      {comments.map((c) => (
                        <div key={c.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs">
                                {c.nama.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{c.nama}</h5>
                                <p className="text-[10px] text-slate-400">{c.date}</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed pl-10">
                            {c.komentar}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* 2. Global Footer */}
      <Footer onSelectLowongan={() => {}} setTab={setTab} />
    </div>
  );
}
