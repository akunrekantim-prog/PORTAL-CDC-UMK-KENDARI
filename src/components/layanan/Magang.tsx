import React from 'react';
import { CheckCircle, FileText, Users, Award } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider, InfoRow } from './ui';

export default function Magang() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-magang">
      <PageHeader
        badge="Alur CDC"
        title="Magang"
        description="Program magang terstruktur yang menghubungkan mahasiswa UM Kendari dengan instansi mitra. Proses pengajuan dilakukan secara digital, terverifikasi oleh tim CDC, dan diakui secara akademis oleh kampus."
        accent="teal"
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Menghubungkan mahasiswa dengan instansi mitra untuk mendapatkan pengalaman kerja nyata yang diakui secara akademis.' },
                { label: 'Pihak Yang Terlibat', text: 'Mahasiswa UM Kendari, dosen pembimbing akademik, dan instansi mitra magang yang bekerja sama dengan CDC.' },
                { label: 'Waktu dan Tempat', text: 'Dilaksanakan sesuai kesepakatan dengan instansi mitra dan jadwal akademik mahasiswa.' },
                { label: 'Alat', text: 'Formulir pengajuan digital, surat pengantar dekan, CV, transkrip nilai, dan dokumen pendukung magang.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {[
                  'Mahasiswa memilih lowongan magang dari daftar mitra resmi CDC.',
                  'Melengkapi form dan mengunggah berkas pendukung.',
                  'Tim CDC memverifikasi kelengkapan dan kesesuaian kualifikasi.',
                  'Hasil verifikasi dan penempatan diumumkan melalui portal CDC.',
                  'Mahasiswa menjalankan magang dengan pendampingan CDC dan mengumpulkan laporan akhir.',
                ].map((step, idx) => (
                  <InfoRow key={idx} label={`Langkah ${idx + 1}`}>
                    {step}
                  </InfoRow>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-teal-50/60 border-teal-100">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Catatan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pastikan berkas Anda dilengkapi sebelum pengajuan. Tim CDC hanya memproses pengajuan yang memenuhi syarat administrasi dan jadwal.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
