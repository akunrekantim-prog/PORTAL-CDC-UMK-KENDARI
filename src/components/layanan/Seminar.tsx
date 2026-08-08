import React from 'react';
import { Video, Users, Calendar, FileText, CheckCircle } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider } from './ui';

export default function Seminar() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-seminar">
      <PageHeader
        badge="Agenda Terdekat"
        title="Seminar Sukses Berkarir"
        description="Seminar dengan topik pola rekrutmen tenaga kerja di perusahaan dan kisah tokoh atau alumni yang telah sukses di dunia karir."
        accent="violet"
        icon={Video}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Memberikan informasi tentang pola rekrutmen tenaga kerja di perusahaan dan belajar pengalaman sukses berkarir.' },
                { label: 'Pihak Yang Terlibat', text: 'Narasumber dari praktisi HR dan perwakilan HRD perusahaan serta alumni yang telah sukses.' },
                { label: 'Waktu dan Tempat', text: 'Seminar ini dilaksanakan bertempat di kampus UM Kendari 1 kali setiap semester.' },
                { label: 'Alat', text: 'Alat presentasi, seminar kit, dan fasilitas bangunan tempat penyelenggaraan yang nyaman.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {['Calon peserta seminar mendaftar ke kantor CDC UM Kendari setiap jam kerja.', 'Menghadiri dan berinteraksi aktif dalam pelaksanaan seminar pada waktu dan tempat yang telah ditetapkan.'].map((step, idx) => (
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
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Informasi Acara</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Admin akan memasukkan topik seminar, narasumber, tanggal, dan lokasi terbaru di halaman ini.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
