import React from 'react';
import EventCardLayout from './ui/EventCardLayout';
import { SEED_EVENT_LAYANAN } from '../../data';
import { KontenKarir } from '../../types';

export default function Softskill({ konten = [] }: { konten?: KontenKarir[] }) {
  return (
    <div id="layanan-softskill">
      <EventCardLayout
        category="softskill"
        pageTitle="Pelatihan Softskill & Kewirausahaan"
        subtitle="Asah kemampuan kepemimpinan, komunikasi profesional, serta wawasan kewirausahaan berbasis potensi daerah."
        events={SEED_EVENT_LAYANAN}
        kontenEvents={konten}
      />
    </div>
  );
}
