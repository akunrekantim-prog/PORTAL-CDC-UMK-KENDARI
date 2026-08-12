import React from 'react';
import EventCardLayout from './ui/EventCardLayout';
import { SEED_EVENT_LAYANAN } from '../../data';

export default function Seminar() {
  return (
    <div id="layanan-seminar">
      <EventCardLayout
        category="seminar"
        pageTitle="Seminar Sukses Berkarir"
        subtitle="Ikuti seminar wawasan karir nasional, peluang Beasiswa, hingga persiapan Rekrutmen Bersama BUMN & Industri."
        events={SEED_EVENT_LAYANAN}
      />
    </div>
  );
}
