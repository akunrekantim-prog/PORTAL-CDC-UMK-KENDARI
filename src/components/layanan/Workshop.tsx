import React from 'react';
import EventCardLayout from './ui/EventCardLayout';
import { SEED_EVENT_LAYANAN } from '../../data';
import { KontenKarir } from '../../types';

export default function Workshop({ konten = [] }: { konten?: KontenKarir[] }) {
  return (
    <div id="layanan-workshop">
      <EventCardLayout
        category="workshop"
        pageTitle="Workshop Pengembangan Karir"
        subtitle="Pelajari keterampilan teknis dan praktis langsung dari praktisi industri untuk meningkatkan daya saing karir Anda."
        events={SEED_EVENT_LAYANAN}
        kontenEvents={konten}
      />
    </div>
  );
}
