import React from 'react';
import { PageHeader, Section, Card, StepList, CtaBlock } from './ui';

const STEPS = [
  { title: 'Pilih Lowongan Magang Mitra', desc: 'Pilih lowongan magang dari daftar perusahaan mitra resmi CDC UM Kendari yang sesuai dengan program studi dan minat Anda.' },
  { title: 'Lengkapi Form & Upload Berkas', desc: 'Isi form pengajuan magang dan unggah surat pengantar dekan, CV, transkrip nilai, dan dokumen pendukung lainnya.' },
  { title: 'Verifikasi Tim CDC', desc: 'Tim CDC memverifikasi kelengkapan berkas dan kesesuaian kualifikasi dalam waktu 1x24 jam kerja.' },
  { title: 'Pengumuman Hasil & Penempatan', desc: 'Hasil verifikasi dan penetapan lokasi magang diumumkan melalui portal, email, dan grup resmi mahasiswa.' },
  { title: 'Pelaksanaan Magang & Akreditasi', desc: 'Mahasiswa menjalankan magang dengan pendampingan CDC, mengumpulkan laporan, dan mendapatkan sertifikat magang resmi kampus.' },
];

export default function Magang() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-magang">
      <PageHeader
        badge="Alur CDC"
        title="Magang"
        description="Program magang terstruktur yang menghubungkan mahasiswa UM Kendari dengan instansi mitra. Proses pengajuan dilakukan secara digital, terverifikasi oleh tim CDC, dan diakui secara akademis oleh kampus."
        accent="teal"
      />

      <Section title="Alur Pengajuan Magang">
        <Card>
          <StepList steps={STEPS} />
        </Card>
      </Section>

      <Section title="Informasi Penting">
        <CtaBlock>
          Pastikan Anda membaca syarat dan ketentuan lowongan sebelum mengajukan magang. Tim CDC hanya memproses pengajuan yang dilengkapi berkas sesuai ketentuan dan dalam timeline yang masih terbuka.
        </CtaBlock>
      </Section>
    </div>
  );
}
