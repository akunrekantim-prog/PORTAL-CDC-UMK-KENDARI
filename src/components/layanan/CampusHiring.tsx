import React, { useMemo } from 'react';
import EventCardLayout from './ui/EventCardLayout';
import { getCampusHiring } from '../../data';
import { KontenKarir, EventLayananItem } from '../../types';

export default function CampusHiring({ konten = [], initialEventId }: { konten?: KontenKarir[]; initialEventId?: string | null }) {
  const seedEvents = useMemo(() => {
    const raw = getCampusHiring();
    return raw.map((ch): EventLayananItem => ({
      id: ch.id,
      category: 'campus-hiring',
      title: ch.judul,
      organizer: ch.namaPerusahaan || 'CDC UM Kendari',
      date: ch.createdAt ? ch.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      location: ch.lokasi || 'Kampus UM Kendari',
      image: ch.bannerUrl || ch.logoPerusahaan || '/poster-cdc-web-umk-1.svg',
      description: ch.deskripsi || '',
      status: 'buka',
      uploadedAt: ch.createdAt
    }));
  }, []);

  return (
    <div id="layanan-campus-hiring">
      <EventCardLayout
        category="campus-hiring"
        pageTitle="Campus Hiring - Recruitment"
        subtitle="Program rekrutmen langsung di kampus oleh perusahaan mitra untuk mahasiswa dan alumni UM KENDARI."
        events={seedEvents}
        kontenEvents={konten}
        initialEventId={initialEventId}
      />
    </div>
  );
}
