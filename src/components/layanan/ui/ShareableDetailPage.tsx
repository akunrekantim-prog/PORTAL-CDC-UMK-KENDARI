import React, { useState } from 'react';
import {
  ChevronLeft,
  Tag,
  Clock,
  User,
  Facebook,
  MessageCircle,
  Linkedin,
  Instagram,
  CheckCircle
} from 'lucide-react';
import { WhatsAppWaIcon } from '../../ui/SocialShareBar';
import {
  shareToFacebook,
  shareToTwitter,
  shareToWhatsApp,
  shareToTelegram,
  shareToLinkedIn,
  shareToInstagram
} from '../../../utils/shareUtils';

interface ShareableDetailPageProps {
  title: string;
  categoryLabel: string;
  imageUrl?: string;
  metaItems: React.ReactNode[];
  onBack: () => void;
  children?: React.ReactNode;
}

// Halaman detail editorial penuh bergaya sama dengan Detail Berita & Artikel
// (breadcrumb, judul besar, metadata strip ikon emas, cover banner, share bar)
export default function ShareableDetailPage({
  title,
  categoryLabel,
  imageUrl,
  metaItems,
  onBack,
  children
}: ShareableDetailPageProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getShareOpts = () => ({
    type: 'event' as const,
    title,
    summary: categoryLabel,
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

  const handleShareInstagram = () => {
    shareToInstagram(getShareOpts(), (msg) => showToast(msg));
  };

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12 font-sans text-slate-800 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-5 z-50 bg-[#1E3A8A] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-800 flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-semibold max-w-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Navigation Back Button */}
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[#0077C6] hover:text-[#1E3A8A] font-bold text-xs sm:text-sm transition group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke {categoryLabel}</span>
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
            <button
              onClick={handleShareInstagram}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Bagikan ke Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </button>
          </aside>

          {/* MAIN ARTICLE CONTENT (lg:col-span-11) */}
          <div className="lg:col-span-11 space-y-6">

            {/* BREADCRUMB BAR */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap" aria-label="Breadcrumb">
              <span>Portal CDC UM Kendari</span>
              <span>&gt;</span>
              <span className="hover:text-[#0077C6] cursor-pointer" onClick={onBack}>{categoryLabel}</span>
              <span>&gt;</span>
              <span className="text-[#0077C6] font-semibold line-clamp-1 max-w-md">{title}</span>
            </nav>

            {/* ARTICLE MAIN TITLE */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {title}
            </h1>

            {/* METADATA STRIP WITH GOLD ICONS */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium pt-1 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{categoryLabel}</span>
              </div>
              {metaItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 hidden" />
                  {item}
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Oleh: <strong className="font-bold text-slate-800">Admin Website</strong></span>
              </div>
            </div>

            {/* FEATURED MAIN COVER IMAGE / POSTER */}
            {imageUrl && (
              <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-sm relative">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* BODY CONTENT */}
            {children}

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
              <button
                onClick={handleShareInstagram}
                className="w-12 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                title="Bagikan ke Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
