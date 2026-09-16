import React, { useMemo } from 'react';
import EventCardLayout from './ui/EventCardLayout';
import { getJobFair } from '../../data';
import { KontenKarir, EventLayananItem } from '../../types';

export default function CareerFair({ konten = [], initialEventId }: { konten?: KontenKarir[]; initialEventId?: string | null }) {
  const seedEvents = useMemo(() => {
    const raw = getJobFair();
    return raw.map((fair): EventLayananItem => ({
      id: fair.id,
      category: 'career-fair',
      title: fair.judul,
      organizer: 'CDC UM Kendari',
      date: fair.createdAt ? fair.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      location: fair.lokasi || 'Gedung UMK Kendari',
      image: fair.bannerUrl || '/poster-cdc-web-umk-2.svg',
      description: fair.deskripsi || '',
      status: 'buka',
      uploadedAt: fair.createdAt
    }));
  }, []);

  return (
    <div id="layanan-career-fair">
      <EventCardLayout
        category="career-fair"
        pageTitle="Job Fair"
        subtitle="Bursa kerja tahunan yang mempertemukan mahasiswa dan alumni UMK dengan puluhan perusahaan BUMN & Swasta Nasional."
        events={seedEvents}
        kontenEvents={konten}
        initialEventId={initialEventId}
      />
    </div>
  );
}
