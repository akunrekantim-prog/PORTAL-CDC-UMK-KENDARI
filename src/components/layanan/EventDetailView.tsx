import React from 'react';
import { EventLayananItem } from '../../types';
import { renderContentMarkdown } from '../../markdown';
import { formatDateDisplay } from '../../data';
import ShareableDetailPage from './ui/ShareableDetailPage';
import { Send, ArrowUpRight, MapPin, Calendar, Clock, DollarSign, Users, Layers } from 'lucide-react';

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
  const displayOrganizer = event.organizer?.trim() || 'CDC UM Kendari';
  const displayDate = event.date ? formatDateDisplay(event.date) : 'Sesuai Jadwal';
  const displayTime = event.time?.trim() || 'Sesuai Jadwal';
  const displayLocation = event.location?.trim() || 'Kampus UM Kendari';
  const displayFee = event.fee?.trim() || 'Gratis';
  const cleanQuota = (event.quota !== undefined && event.quota !== null) ? Math.max(0, Math.abs(Number(event.quota) || 0)) : null;
  const displayQuota = (cleanQuota && cleanQuota > 0) ? `${cleanQuota} Orang` : 'Terbuka';

  return (
    <div id="event-layanan-detail">
      <ShareableDetailPage
        title={event.title}
        categoryLabel={displayCategory}
        imageUrl={event.posterImage || event.image}
        posterAspect="16:9"
        uploadDateLabel={formatDateDisplay(event.uploadedAt || event.date)}
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
          {/* ── 1. RINGKASAN DETAIL & PENGATURAN AGENDA EVENT (PERSIS MODEL INTERNSHIP / MAGANG) ── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {/* Info row — flat grid style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-px bg-slate-200 border-b border-slate-200 text-sm overflow-hidden">
              {/* Kategori Event */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0">
                <div className="text-[11px] text-slate-400 mb-0.5">Kategori Event</div>
                <div className="font-semibold text-slate-800 truncate" title={displayCategory}>
                  {displayCategory}
                </div>
              </div>

              {/* Penyelenggara */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0">
                <div className="text-[11px] text-slate-400 mb-0.5">Penyelenggara</div>
                <div className="font-semibold text-slate-800 truncate" title={displayOrganizer}>
                  {displayOrganizer}
                </div>
              </div>

              {/* Tanggal Pelaksanaan */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0">
                <div className="text-[11px] text-slate-400 mb-0.5">Tanggal Pelaksanaan</div>
                <div className="font-semibold text-slate-800 truncate" title={displayDate}>
                  {displayDate}
                </div>
              </div>

              {/* Waktu Pelaksanaan */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0">
                <div className="text-[11px] text-slate-400 mb-0.5">Waktu Pelaksanaan</div>
                <div className="font-semibold text-slate-800 truncate" title={displayTime}>
                  {displayTime}
                </div>
              </div>

              {/* Lokasi Pertemuan */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0">
                <div className="text-[11px] text-slate-400 mb-0.5">Lokasi Pertemuan</div>
                <div className="font-semibold text-slate-800 truncate" title={displayLocation}>
                  {displayLocation}
                </div>
              </div>

              {/* Biaya / HTM */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0">
                <div className="text-[11px] text-slate-400 mb-0.5">Biaya / HTM</div>
                <div className="font-semibold text-emerald-700 truncate" title={displayFee}>
                  {displayFee}
                </div>
              </div>

              {/* Kuota Peserta */}
              <div className="px-3 sm:px-4 py-3 bg-slate-50/70 min-w-0 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-slate-400 mb-0.5">Kuota Peserta</div>
                <div className="font-semibold text-slate-800 truncate" title={displayQuota}>
                  {displayQuota}
                </div>
              </div>
            </div>

            {/* Action row — Tombol CTA di bawah gambar detail konten */}
            <div className="px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                {hasCta ? (
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#0077C6] text-white hover:bg-[#005fa0] active:scale-[0.98] transition cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{event.ctaLabel || 'Daftar Sekarang'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Agenda Terbuka
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{displayLocation}</span>
                <span className="text-slate-300">•</span>
                <span className="truncate font-medium text-slate-700">{displayOrganizer}</span>
              </div>
            </div>
          </div>

          {/* ── 2. DESKRIPSI KEGIATAN ── */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Deskripsi Kegiatan
            </h2>

            {event.description && event.description.trim() ? (
              <div className="prose prose-slate max-w-full min-w-0 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 overflow-x-clip [overflow-wrap:anywhere] layanan-detail-body">
                {renderContentMarkdown(event.description)}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Belum ada keterangan deskripsi tambahan untuk kegiatan ini.
              </p>
            )}
          </div>
        </div>
      </ShareableDetailPage>
    </div>
  );
}
