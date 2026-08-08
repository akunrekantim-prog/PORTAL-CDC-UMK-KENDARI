import React from 'react';
import { PageHeader, Section, Card, StepList, CtaBlock } from './ui';

const STEPS = [
  { title: 'Kebutuhan Rekrutmen Kampus', desc: 'Mitra perusahaan mengajukan kebutuhan tenaga kerja, preferensi kandidat, dan timeline hiring untuk alumni/civitas akademik UM Kendari.' },
  { title: 'Screening & Seleksi CDC', desc: 'Tim CDC menyaring kandidat berdasarkan profil lulusan, rekam jejak akademik, dan kesesuaian kompetensi lowongan.' },
  { title: 'Kampanye Rekrutmen', desc: 'Lowongan disebarkan melalui portal CDC, grup alumni, email blast mahasiswa tingkat akhir, dan event kampus hiring resmi.' },
  { title: 'Interview & Assessment', desc: 'Mitra melakukan interview, assessment, atau kerja praktek terpadu dengan pendampingan CDC untuk memastikan match yang tepat.' },
  { title: 'Onboarding & Penempatan', desc: 'Kandidat lolos mendapatkan penempatan kerja atau magang bersertifikat, dilengkapi laporan hasil rekrutmen kampus.' },
];

export default function CampusHiring() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-campus-hiring">
      <PageHeader
        badge="Recruitment"
        title="Campus Hiring - Recruitment"
        description="Program rekrutmen terpadu yang menghubungkan perusahaan mitra dengan talenta terbaik dari lingkungan kampus UM Kendari."
        accent="blue"
      />

      <Section title="Alur Rekrutmen">
        <Card>
          <StepList steps={STEPS} />
        </Card>
      </Section>

      <Section title="Informasi Pendaftaran">
        <CtaBlock>
          Perusahaan mitra dapat mengajukan permintaan campus hiring melalui platform ini. Tim CDC UM Kendari akan melakukan koordinasi kebutuhan rekrutmen, menyusun skema seleksi, dan menjalankan kampanye penyebaran lowongan secara terintegrasi.
        </CtaBlock>
      </Section>
    </div>
  );
}
