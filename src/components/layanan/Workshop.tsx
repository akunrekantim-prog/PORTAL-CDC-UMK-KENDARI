import React from 'react';
import { Users, Calendar, Video, FileText, CheckCircle } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider, InfoRow } from './ui';

export default function Workshop() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-workshop">
      <PageHeader
        badge="Workshop Pengembangan Karir"
        title="Workshop Pengembangan Karir"
        description="Program pelatihan praktik kompetensi melamar kerja, meliputi penulisan surat lamaran dan CV efektif, kiat sukses psikotes dan interview, personality development, serta pola rekrutmen di perusahaan."
        accent="emerald"
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Memberikan kompetensi dasar melamar kerja sehingga calon pelamar kerja sukses dalam mencari pekerjaan.' },
                { label: 'Pihak Yang Terlibat', text: 'Narasumber dari praktisi HR dan perwakilan HRD perusahaan, serta psikolog untuk memberikan pengetahuan tentang kesiapan psikologi dalam melamar kerja.' },
                { label: 'Waktu dan Tempat', text: 'Dilaksanakan bertempat di kampus UM Kendari paling lama 2 minggu setelah pelaksanaan wisuda.' },
                { label: 'Alat', text: 'Alat presentasi, workshop kit, dan fasilitas bangunan tempat penyelenggaraan yang nyaman.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                <InfoRow label="Pendaftaran">
                  Calon peserta mendaftar ke kantor CDC UM Kendari setiap jam kerja.
                </InfoRow>
                <InfoRow label="Pelaksanaan">
                  Menghadiri dan berinteraksi aktif dalam pelaksanaan workshop karir pada waktu dan tempat yang telah ditetapkan.
                </InfoRow>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-50/60">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Daftar Workshop</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Silakan hubungi admin CDC untuk informasi jadwal workshop terbaru dan pendaftaran peserta.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
