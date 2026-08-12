import React from 'react';
import EventCardLayout from './ui/EventCardLayout';
import { SEED_EVENT_LAYANAN } from '../../data';

export default function Softskill() {
  return (
    <div id="layanan-softskill">
      <EventCardLayout
        category="softskill"
        pageTitle="Pelatihan Softskill & Kewirausahaan"
        subtitle="Asah kemampuan kepemimpinan, komunikasi profesional, serta wawasan kewirausahaan berbasis potensi daerah."
        events={SEED_EVENT_LAYANAN}
      />
    </div>
  );
}
