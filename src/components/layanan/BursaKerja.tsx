import React from 'react';
import { Building2, MapPin, Search, FileText, CheckCircle } from 'lucide-react';
import { FlatHeader, Card, MetaList, Divider, InfoRow, PillRow } from './ui';

const TOOLS = [
  'Formulir pengajuan digital',
  'Sistem verifikasi legalitas info lowongan',
];

const MECHANISMS = [
  'Perusahaan mengisi formulir pengajuan dengan data lengkap serta detail lowongan.',
  'Tim CDC melakukan verifikasi berkas dan legalitas info lowongan dalam 1x24 jam.',
  'Setelah disetujui, lowongan akan tampil di portal utama dan aplikasi dashboard mahasiswa/alumni.',
];

export default function BursaKerja() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-bursa-kerja">
      <FlatHeader
        eyebrow="Bursa Kerja"
        title="Bursa Kerja"
        description="Kegiatan event karir yang mempertemukan lulusan dengan perusahaan, meliputi Campus Hiring setiap bulan dan Job Fair UMK."/>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Memberikan kesempatan yang luas bagi lulusan UM Kendari berinteraksi dengan perusahaan yang sedang membutuhkan tenaga kerja.' },
                { label: 'Pihak Yang Terlibat', text: 'Lulusan UM Kendari dan perusahaan-perusahaan regional, nasional maupun internasional.' },
                { label: 'Waktu dan Tempat', text: 'Kegiatan ini dilaksanakan sesuai kebutuhan perusahaan dan kesepakatan pihak perusahaan dan CDC UM Kendari.' },
                { label: 'Alat', text: <PillRow items={TOOLS} /> },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {MECHANISMS.map((step, idx) => (
                  <InfoRow key={idx} label={`Langkah ${idx + 1}`}>
                    {step}
                  </InfoRow>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900 text-white">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-200" />
                <h3 className="font-bold text-white text-sm">Info untuk Perusahaan</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Perusahaan mitra dapat mengajukan campus hiring atau pasang lowongan melalui CDC UM Kendari.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
