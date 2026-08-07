import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider, InfoRow } from './ui';

const STEPS = [
  'Mitra perusahaan mengajukan kebutuhan tenaga kerja, preferensi kandidat, dan timeline hiring untuk alumni/civitas akademik UM Kendari.',
  'Tim CDC menyaring kandidat berdasarkan profil lulusan, rekam jejak akademik, dan kesesuaian kompetensi lowongan.',
  'Lowongan disebarkan melalui portal CDC, grup alumni, email blast mahasiswa tingkat akhir, dan event kampus hiring resmi.',
  'Mitra melakukan interview, assessment, atau kerja praktek terpadu dengan pendampingan CDC untuk memastikan match yang tepat.',
  'Kandidat lolos mendapatkan penempatan kerja atau magang bersertifikat, dilengkapi laporan hasil rekrutmen kampus.',
];

export default function CampusHiring() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-campus-hiring">
      <PageHeader
        badge="Recruitment"
        title="Campus Hiring - Recruitment"
        description="Kegiatan rekrutmen tenaga kerja di kampus UM Kendari yang melibatkan lulusan UM Kendari dan perusahaan-perusahaan regional, nasional maupun internasional."
        accent="blue"
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Memberikan kesempatan yang luas bagi lulusan UM Kendari berinteraksi dengan perusahaan yang sedang membutuhkan tenaga kerja.' },
                { label: 'Pihak Yang Terlibat', text: 'Lulusan UM Kendari dan perusahaan-perusahaan regional, nasional maupun internasional.' },
                { label: 'Waktu dan Tempat', text: 'Kegiatan ini dilaksanakan sesuai kebutuhan perusahaan dan kesepakatan pihak perusahaan dan CDC UM Kendari.' },
                { label: 'Alat', text: 'Alat presentasi, alat tes, dan fasilitas bangunan tempat penyelenggaraan yang nyaman.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {STEPS.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-extrabold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-50/60">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Alur Rekrutmen</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mitra mengajukan kebutuhan, CDC melakukan screening dan penyebaran lowongan, kemudian mitra melakukan interview dengan pendampingan CDC.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
