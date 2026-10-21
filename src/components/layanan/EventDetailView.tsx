import React from 'react';
import { EventLayananItem } from '../../types';
import { renderContentMarkdown } from '../../markdown';
import { formatDateDisplay } from '../../data';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { Send, ArrowUpRight } from 'lucide-react';

interface EventDetailViewProps {
  event: EventLayananItem;
  categoryLabel?: string;
  onBack: () => void;
  setTab?: (tab: string) => void;
}

export default function EventDetailView({
  event,
  categoryLabel = 'Event',
  onBack
}: EventDetailViewProps) {
  const hasCta = Boolean(event.ctaEnabled && event.registrationLink && event.registrationLink.trim());
  const ctaUrl = event.registrationLink
    ? (/^https?:\/\//i.test(event.registrationLink.trim())
        ? event.registrationLink.trim()
        : `https://${event.registrationLink.trim()}`)
    : '#';

  // Format Kategori / Jenis Event yang sesuai inputan Admin Dashboard
  const formatCategory = (cat?: string) => {
    if (!cat) return categoryLabel || 'Event';
    const c = cat.trim();
    if (c.toLowerCase() === 'campus-hiring' || c.toLowerCase() === 'campus_hiring') return 'Campus Hiring';
    if (c.toLowerCase() === 'career-fair' || c.toLowerCase() === 'job-fair' || c.toLowerCase() === 'job_fair') return 'Job Fair';
    if (c.toLowerCase() === 'softskill' || c.toLowerCase() === 'pelatihan') return 'Pelatihan';
    if (c.toLowerCase() === 'workshop') return 'Workshop';
    if (c.toLowerCase() === 'seminar') return 'Seminar';
    if (c.toLowerCase() === 'webinar') return 'Webinar';
    return c;
  };

  const displayCategory = formatCategory(event.category || categoryLabel);
  const displayDate = event.date
    ? (event.time ? `${formatDateDisplay(event.date)}, ${event.time}` : formatDateDisplay(event.date))
    : formatDateDisplay(event.uploadedAt);

  return (
    <div id="event-layanan-detail">
      <ShareableDetailPage
        title={event.title}
        categoryLabel={displayCategory}
        imageUrl={event.posterImage || event.image}
        posterAspect="16:9"
        uploadDateLabel={displayDate}
        onBack={onBack}
        metaItems={[]}
      >
        <div className="space-y-6 pt-1">
          {event.isDraft && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span><strong>Mode Pratinjau Admin:</strong> Konten event ini saat ini masih berstatus <u>Draft</u> (hanya Anda yang dapat melihat pratinjau ini).</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider shrink-0">
                Draft
              </span>
            </div>
          )}

          {/* Tombol CTA Pendaftaran (jika admin mengaktifkan link pendaftaran) */}
          {hasCta && (
            <div className="pt-1">
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0077C6] text-white hover:bg-[#005fa0] active:scale-[0.98] transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{event.ctaLabel || 'Daftar Sekarang'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Body Content / Deskripsi Kegiatan (Sama persis seperti menu Berita & Artikel) */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 pt-1 layanan-detail-body">
            {event.description && event.description.trim() ? (
              <div className="space-y-4 text-slate-700 leading-relaxed font-normal">
                {renderContentMarkdown(event.description)}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Belum ada keterangan deskripsi tambahan untuk kegiatan ini.
              </p>
            )}
          </div>

          {/* Tombol CTA Bawah jika deskripsi panjang & ada link pendaftaran */}
          {hasCta && (
            <div className="pt-4 border-t border-slate-100">
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0077C6] text-white hover:bg-[#005fa0] active:scale-[0.98] transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{event.ctaLabel || 'Daftar Sekarang'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </ShareableDetailPage>
    </div>
  );
}
