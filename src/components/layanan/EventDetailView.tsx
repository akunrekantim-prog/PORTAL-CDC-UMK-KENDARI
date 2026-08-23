import React from 'react';
import {
  ChevronLeft,
  Tag,
  Clock,
  User,
  Facebook,
  MessageCircle,
  Linkedin
} from 'lucide-react';
import { EventLayananItem } from '../../types';
import { renderContentMarkdown } from '../../markdown';

interface EventDetailViewProps {
  event: EventLayananItem;
  categoryLabel?: string;
  onBack: () => void;
  setTab?: (tab: string) => void;
}

export default function EventDetailView({
  event,
  categoryLabel = 'Layanan',
  onBack,
  setTab
}: EventDetailViewProps) {
  if (!event) return null;

  const formatDateDisplayFull = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const formattedDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
      return timeStr ? `${formattedDate}, ${timeStr}` : formattedDate;
    } catch {
      return dateStr;
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(event.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${event.title}\n\nBaca selengkapnya: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(event.title);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <div className="w-full bg-white text-slate-800" id="event-layanan-detail">
      <div className="space-y-6">

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
              <span className="hover:text-[#0077C6] cursor-pointer" onClick={onBack}>{categoryLabel}</span>
              <span>&gt;</span>
              <span className="text-[#0077C6] font-semibold line-clamp-1 max-w-md">{event.title}</span>
            </nav>

            {/* ARTICLE MAIN TITLE */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {event.title}
            </h1>

            {/* METADATA STRIP WITH GOLD ICONS */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium pt-1 pb-3 border-b border-slate-100">
              {/* Category Tag */}
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{categoryLabel}</span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{formatDateDisplayFull(event.date, event.time)}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Oleh: <strong className="font-bold text-slate-800">Admin Website</strong></span>
              </div>
            </div>

            {/* FEATURED MAIN COVER IMAGE / POSTER */}
            {event.image && (
              <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-sm relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* ARTICLE BODY */}
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6 pt-2">
              <div className="space-y-4 text-slate-700 leading-relaxed font-normal">
                {renderContentMarkdown(event.description)}
              </div>
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

          </div>
        </div>
      </div>
    </div>
  );
}
