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

interface SocialShareBarProps {
  title?: string;
  url?: string;
  className?: string;
}

export default function SocialShareBar({ title, url, className = '' }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getTargetUrl = () => url || (typeof window !== 'undefined' ? window.location.href : '');
  const getTargetTitle = () => title || 'Portal CDC UM Kendari';

  const handleShareFacebook = () => {
    const targetUrl = encodeURIComponent(getTargetUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${targetUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const targetUrl = encodeURIComponent(getTargetUrl());
    const targetTitle = encodeURIComponent(getTargetTitle());
    window.open(`https://twitter.com/intent/tweet?url=${targetUrl}&text=${targetTitle}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const targetUrl = encodeURIComponent(getTargetUrl());
    const targetTitle = encodeURIComponent(`${getTargetTitle()} - Portal CDC UM Kendari:\n`);
    window.open(`https://api.whatsapp.com/send?text=${targetTitle}${targetUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const targetUrl = encodeURIComponent(getTargetUrl());
    const targetTitle = encodeURIComponent(getTargetTitle());
    window.open(`https://t.me/share/url?url=${targetUrl}&text=${targetTitle}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const targetUrl = encodeURIComponent(getTargetUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${targetUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: getTargetTitle(),
      url: getTargetUrl()
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getTargetUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 1. Share on Facebook */}
      <button
        onClick={handleShareFacebook}
        className="flex items-center gap-2 bg-[#3b5998] hover:bg-[#324b81] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan ke Facebook"
      >
        <Facebook className="w-4 h-4 fill-white" />
        <span>Share on Facebook</span>
      </button>

      {/* 2. Share on Twitter / X */}
      <button
        onClick={handleShareTwitter}
        className="flex items-center gap-2 bg-black hover:bg-slate-900 text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan ke Twitter / X"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>Share on Twitter</span>
      </button>

      {/* 3. WhatsApp */}
      <button
        onClick={handleShareWhatsApp}
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan via WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
        <span>WhatsApp</span>
      </button>

      {/* 4. Telegram */}
      <button
        onClick={handleShareTelegram}
        className="flex items-center gap-2 bg-[#229ED9] hover:bg-[#1c88bd] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan via Telegram"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Telegram</span>
      </button>

      {/* 5. LinkedIn */}
      <button
        onClick={handleShareLinkedIn}
        className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan via LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5 fill-white" />
        <span>LinkedIn</span>
      </button>

      {/* 6. Native Share Icon Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center justify-center bg-[#4a403a] hover:bg-[#38302b] text-white p-2.5 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Bagikan Halaman"
      >
        <Share2 className="w-4 h-4 text-white" />
      </button>

      {/* 7. Salin Tautan */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 bg-[#8c8c8c] hover:bg-slate-600 text-white px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer"
        title="Salin Tautan Halaman"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>Salin Tautan</span>
      </button>

      {copied && (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 shadow-sm animate-fade-in flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> Tautan berhasil disalin!
        </span>
      )}
    </div>
  );
}
