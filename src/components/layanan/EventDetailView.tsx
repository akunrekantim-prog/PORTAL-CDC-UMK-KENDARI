import React from 'react';
import { EventLayananItem } from '../../types';
import { renderContentMarkdown } from '../../markdown';
import ShareableDetailPage from './ui/ShareableDetailPage';

interface EventDetailViewProps {
  event: EventLayananItem;
  categoryLabel?: string;
  onBack: () => void;
  setTab?: (tab: string) => void;
}

export default function EventDetailView({
  event,
  categoryLabel = 'Layanan',
  onBack
}: EventDetailViewProps) {
  if (!event) return null;

  return (
    <div id="event-layanan-detail">
      <ShareableDetailPage
        title={event.title}
        categoryLabel={categoryLabel}
        imageUrl={event.image}
        posterAspect="16:9"
        onBack={onBack}
        metaItems={[]}
      >
        {/* Pamflet + judul + deskripsi (tanpa status/kuota/penyelenggara/pembicara/lokasi/daftar) */}
        {event.description && (
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6 pt-2">
            <div className="space-y-4 text-slate-700 leading-relaxed font-normal">
              {renderContentMarkdown(event.description)}
            </div>
          </div>
        )}
      </ShareableDetailPage>
    </div>
  );
}
