/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SocialShareBar — Portal CDC UM Kendari
 * Baris tombol bagikan terpusat (7 Tombol Lengkap):
 *   1. Share on Facebook (Biru #3b5998)
 *   2. Share on Twitter (Hitam #000000 dengan logo X)
 *   3. WhatsApp (Hijau #25D366)
 *   4. Telegram (Cyan #229ED9)
 *   5. LinkedIn (Biru #0A66C2)
 *   6. Tombol Ikon Bagikan / Native Share (#4a403a dengan ikon Share2)
 *   7. Salin Tautan (Abu-abu #8c8c8c)
 */

import React, { useState } from 'react';
import {
  Facebook,
  MessageCircle,
  Send,
  Linkedin,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react';
import {
  shareToFacebook,
  shareToTwitter,
  shareToWhatsApp,
  shareToTelegram,
  shareToLinkedIn
} from '../../utils/shareUtils';

interface SocialShareBarProps {
  title?: string;
  url?: string;
  className?: string;
  type?: 'prestasi' | 'berita' | 'event' | 'general';
  namaMahasiswa?: string;
  prodi?: string;
  peringkat?: string;
  tahun?: string;
  scope?: string;
  summary?: string;
}

export function WhatsAppWaIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 13.84 2.502 15.56 3.374 17.037L2 22L7.094 20.67C8.528 21.517 10.207 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
        fill="white"
      />
      <text
        x="12"
        y="14.8"
        textAnchor="middle"
        fill="#25D366"
        fontSize="8.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        letterSpacing="-0.5px"
      >
        WA
      </text>
    </svg>
  );
}

export default function SocialShareBar({
  title,
  url,
  className = '',
  type = 'general',
  namaMahasiswa,
  prodi,
  peringkat,
  tahun,
  scope,
  summary
}: SocialShareBarProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getContentOptions = () => ({
    title: title || 'Portal CDC UM Kendari',
    url: url || (typeof window !== 'undefined' ? window.location.href : ''),
    type,
    namaMahasiswa,
    prodi,
    peringkat,
    tahun,
    scope,
    summary
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShareFacebookAction = () => {
    shareToFacebook(getContentOptions());
  };

  const handleShareTwitterAction = () => {
    shareToTwitter(getContentOptions());
  };

  const handleShareWhatsAppAction = () => {
    shareToWhatsApp(getContentOptions());
  };

  const handleShareTelegramAction = () => {
    shareToTelegram(getContentOptions());
  };

  const handleShareLinkedInAction = () => {
    shareToLinkedIn(getContentOptions(), (msg) => showToast(msg));
  };

  const handleNativeShare = async () => {
    const opts = getContentOptions();
    if (navigator.share) {
      try {
        await navigator.share({
          title: opts.title,
          url: opts.url
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const opts = getContentOptions();
    navigator.clipboard.writeText(opts.url);
    showToast('Tautan berhasil disalin ke clipboard!');
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 1. Share on Facebook */}
      <button
        onClick={handleShareFacebookAction}
        className="flex items-center gap-2 bg-[#3b5998] hover:bg-[#324b81] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan ke Facebook"
      >
        <Facebook className="w-4 h-4 fill-white" />
        <span>Facebook</span>
      </button>

      {/* 2. Share on Twitter / X */}
      <button
        onClick={handleShareTwitterAction}
        className="flex items-center gap-2 bg-black hover:bg-slate-900 text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan ke Twitter / X"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X / Twitter</span>
      </button>

      {/* 3. WhatsApp */}
      <button
        onClick={handleShareWhatsAppAction}
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan via WhatsApp"
      >
        <WhatsAppWaIcon className="w-4.5 h-4.5" />
        <span>WhatsApp</span>
      </button>

      {/* 4. Telegram */}
      <button
        onClick={handleShareTelegramAction}
        className="flex items-center gap-2 bg-[#229ED9] hover:bg-[#1c88bd] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan via Telegram"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Telegram</span>
      </button>

      {/* 5. LinkedIn */}
      <button
        onClick={handleShareLinkedInAction}
        className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan via LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5 fill-white" />
        <span>LinkedIn</span>
      </button>

      {/* 7. Native Share Icon Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center justify-center bg-[#4a403a] hover:bg-[#38302b] text-white p-2.5 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan Halaman"
      >
        <Share2 className="w-4 h-4 text-white" />
      </button>

      {/* 8. Salin Tautan */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 bg-[#8c8c8c] hover:bg-slate-600 text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Salin Tautan Halaman"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>Salin Tautan</span>
      </button>

      {toastMessage && (
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-300 shadow-xs animate-fade-in flex items-center gap-1.5 max-w-full">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </span>
      )}
    </div>
  );
}
