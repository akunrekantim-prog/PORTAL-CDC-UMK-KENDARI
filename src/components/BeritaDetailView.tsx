import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Calendar
} from 'lucide-react';
import { Berita, KontenKarir } from '../types';
import Header from './Header';
import { Footer } from './Footer';
import { renderContentMarkdown } from '../markdown';
import { WhatsAppWaIcon } from './ui/SocialShareBar';
import {
  getApprovedKomentarBerita,
  insertKomentarBerita
} from '../data';
import {
  shareToFacebook,
  shareToTwitter,
  shareToWhatsApp,
  shareToTelegram,
  shareToLinkedIn
} from '../utils/shareUtils';

interface BeritaDetailViewProps {
  berita: Berita;
  allBeritaList?: Berita[];
  onSelectBerita?: (berita: Berita) => void;
  onBack: () => void;
  setTab?: (tab: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
  onSelectLowongan?: (id: string) => void;
  onSelectProgram?: (id: string) => void;
  onSelectPrestasi?: (item: KontenKarir) => void;
  onSelectEvent?: (id: string) => void;
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
  allBeritaList,
  onSelectBerita,
  onBack,
  setTab,
  onNavigateToLogin,
  onNavigateToRegister,
  onSelectLowongan,
  onSelectProgram,
  onSelectPrestasi,
  onSelectEvent,
}: BeritaDetailViewProps) {
  // Komentar yang SUDAH DISETUJUI ADMIN (dari DB, persisten per berita)
  const [comments, setComments] = useState<CommentItem[]>(() =>
    getApprovedKomentarBerita(berita.slug).map(k => ({
      id: k.id,
      nama: k.nama,
      email: k.email,
      komentar: k.komentar,
      date: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(new Date(k.createdAt))
    }))
  );
  // ID komentar yang USER ini kirim di sesi ini (status pending) —
  // hanya untuk soft-notice "menunggu persetujuan", tidak tampil ke user lain.
  const [myPendingIds, setMyPendingIds] = useState<string[]>([]);
  const [myPendingNotice, setMyPendingNotice] = useState(false);
  const [inputKomentar, setInputKomentar] = useState('');
  const [inputNama, setInputNama] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Komputasi Berita Terkait (Maksimal 3 Card berdasarkan relevansi Scope & Judul)
  const relatedBeritaList = useMemo(() => {
    if (!allBeritaList || allBeritaList.length === 0) return [];

    const candidateNews = allBeritaList.filter((b) => b.id !== berita.id && b.slug !== berita.slug);
    if (candidateNews.length === 0) return [];

    const currentTitleWords = berita.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    const scored = candidateNews.map((candidate) => {
      let score = 0;
      if (candidate.scope && berita.scope && candidate.scope === berita.scope) {
        score += 10;
      }
      const candTitleLower = candidate.title.toLowerCase();
      currentTitleWords.forEach((word) => {
        if (candTitleLower.includes(word)) {
          score += 5;
        }
      });
      return { candidate, score };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.candidate.createdAt).getTime() - new Date(a.candidate.createdAt).getTime();
    });

    return scored.slice(0, 3).map((s) => s.candidate);
  }, [allBeritaList, berita]);

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

  const getShareOpts = () => ({
    type: 'berita' as const,
    title: berita.title,
    scope: berita.scope,
    summary: berita.excerpt,
    url: typeof window !== 'undefined' ? window.location.href : ''
  });

  const handleShareFacebook = () => {
    shareToFacebook(getShareOpts());
  };

  const handleShareX = () => {
    shareToTwitter(getShareOpts());
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(getShareOpts());
  };

  const handleShareTelegram = () => {
    shareToTelegram(getShareOpts());
  };

  const handleShareLinkedIn = () => {
    shareToLinkedIn(getShareOpts(), (msg) => showToast(msg));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKomentar.trim() || !inputNama.trim() || !inputEmail.trim()) {
      showToast('Mohon lengkapi Ruas yang Wajib Ditandai (*) terlebih dahulu.');
      return;
    }

    // Simpan ke DB dengan status PENDING — baru tayang setelah admin menyetujui.
    const newId = `kmt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    try {
      await insertKomentarBerita({
        id: newId,
        beritaSlug: berita.slug,
        beritaJudul: berita.title,
        nama: inputNama.trim(),
        email: inputEmail.trim(),
        komentar: inputKomentar.trim(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengirim komentar. Silakan coba lagi.');
      return;
    }

    // Soft-notice di sesi ini: user lihat sendiri bahwa komentarnya menunggu moderasi.
    setMyPendingIds(prev => [newId, ...prev]);
    setMyPendingNotice(true);
    setInputKomentar('');
    if (!rememberMe) {
      setInputNama('');
      setInputEmail('');
    }
    showToast('Komentar Anda berhasil dikirim dan menunggu persetujuan admin sebelum tayang.');
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
        <div className="fixed top-24 right-5 z-50 bg-[#1E3A8A] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-800 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-semibold max-w-md">
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
                <WhatsAppWaIcon className="w-5 h-5" />
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

              {/* SECTION BERITA TERKAIT (3 CARD LAYOUT BERDAMPINGAN) */}
              {relatedBeritaList.length > 0 && (
                <div className="pt-8 border-t border-slate-200/80 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-5 bg-[#0077C6] rounded-full inline-block" />
                      Berita Terkait
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {relatedBeritaList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onSelectBerita) {
                            onSelectBerita(item);
                            window.scrollTo(0, 0);
                          }
                        }}
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col cursor-pointer hover:border-blue-300"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.coverImageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          {item.scope && (
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase">
                              {item.scope}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0077C6] transition line-clamp-2 leading-snug">
                            {item.title}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-auto">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#EBA300]" />
                              {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="font-semibold text-slate-600">
                              by Admin Website
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  <WhatsAppWaIcon className="w-5 h-5" />
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

                {/* Notice: komentar user ini sedang menunggu moderasi admin */}
                {myPendingNotice && (
                  <div className="pt-4 flex items-start gap-2 text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Komentar Anda berhasil dikirim dan sedang <strong>menunggu persetujuan admin</strong> sebelum ditampilkan di halaman ini. Terima kasih atas partisipasinya.
                    </span>
                  </div>
                )}

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
      <Footer
        onSelectLowongan={onSelectLowongan}
        onSelectBerita={(slug) => {
          const matched = allBeritaList?.find(b => b.slug === slug || `kk-${b.id}` === slug || b.id === slug);
          if (matched && onSelectBerita) {
            onSelectBerita(matched);
            window.scrollTo(0, 0);
          } else if (setTab) {
            setTab('berita');
          }
        }}
        onSelectProgram={onSelectProgram}
        onSelectPrestasi={onSelectPrestasi}
        onSelectEvent={onSelectEvent}
        setTab={setTab}
      />
    </div>
  );
}
