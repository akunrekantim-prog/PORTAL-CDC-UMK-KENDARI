import React from 'react';
import { EventLayananItem } from '../../types';
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
        {/* Detail ringkas: hanya pamflet & judul besar seperti Campus Hiring */}
      </ShareableDetailPage>
    </div>
  );
}
