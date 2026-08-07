import React from 'react';
import { Calendar, User, Clock, FileText, CheckCircle2, Video, MapPin } from 'lucide-react';
import { PageHeader, Card, InfoRow, MetaList, PillRow, Divider } from './ui';

const SCHEDULE = [
  'Senin, 14.00 - 15.00 WIB',
  'Selasa, 11.00 - 12.00 WIB',
  'Rabu, 14.00 - 15.00 WIB',
  'Kamis, 11.00 - 12.00 WIB',
  'Jumat, 14.00 - 15.00 WIB',
];

const TOOLS = [
  'Formulir reservasi konseling',
  'Jadwal konseling terstruktur',
  'Media telekonferensi untuk sesi daring',
];

export default function KonselingKarir() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-konseling-karir">
      <PageHeader
        badge="Konseling Karir"
        title="Konseling Karir"
        description="Layanan konseling karir personal untuk membantu mahasiswa dan alumni UM Kendari merencanakan dan mempersiapkan karir di dunia kerja profesional."
        accent="blue"
        icon={User}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Konseling karir membantu mahasiswa dan alumni merencanakan serta mempersiapkan diri memasuki dunia karir melalui sesi bimbingan personal dengan konselor profesional CDC.
              </p>
            </div>

            <Divider />

            <MetaList
              items={[
                {
                  label: 'Tujuan',
                  text: 'Membantu mahasiswa dan alumni merencanakan dan mempersiapkan diri memasuki dunia karir dengan lebih percaya diri, jelas arah, dan siap menghadapi dunia kerja profesional.',
                },
                {
                  label: 'Pihak Yang Terlibat',
                  text: 'Mahasiswa, dosen penasehat akademik, dan pembimbing karir yang ditetapkan oleh CDC UM Kendari.',
                },
                {
                  label: 'Waktu dan Tempat',
                  text: (
                    <div className="space-y-2">
                      <PillRow items={SCHEDULE} />
                      <span className="text-slate-500">Tempat: Kantor CDC UM Kendari atau daring via Zoom.</span>
                    </div>
                  ),
                },
                {
                  label: 'Alat',
                  text: <PillRow items={TOOLS} />,
                },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {[
                  'Mahasiswa melakukan reservasi konseling dengan mengisi formulir yang tersedia.',
                  'Konseling dilakukan secara luring di kantor CDC atau daring via Zoom.',
                  'Sesi konseling berlangsung selama 45 menit sesuai jadwal yang dipilih.',
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
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Informasi Sesi</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesi konseling berdurasi 45 menit per sesi dan dapat dilaksanakan secara Luring (di kantor CDC) maupun Daring (via Zoom).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
