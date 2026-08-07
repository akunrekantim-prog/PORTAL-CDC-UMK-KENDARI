import React from 'react';
import { FileText, Clock, CheckCircle, Users, Award } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider } from './ui';

export default function ExitSurvey() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-exit-survey">
      <PageHeader
        badge="Tracer Kuesioner"
        title="Data Exit Survey Lulusan"
        description="Kuisioner wajib bagi calon wisudawan UM Kendari untuk pemetaan penyerapan lulusan di dunia kerja."
        accent="emerald"
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Mengumpulkan data evaluasi kurikulum serta akreditasi instansi dari alumni untuk pemetaan penyerapan lulusan di dunia kerja.' },
                { label: 'Pihak Yang Terlibat', text: 'Calon wisudawan, alumni, dan tim CDC UM Kendari yang menangani data tracer study.' },
                { label: 'Waktu dan Tempat', text: 'Pengisian dilakukan secara daring melalui portal CDC sebelum pelaksanaan wisuda.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {['Mahasiswa login ke portal CDC dan mengakses menu Exit Survey.', 'Mengisi biodata, evaluasi akademik, dan status karir.', 'Submit form dan mendapatkan bukti bebas tracer CDC.'].map((step, idx) => (
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
          <Card className="bg-emerald-50/60 border-emerald-100">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Catatan Penting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengisian Exit Survey adalah syarat kelulusan dan pengambilan ijazah. Pastikan data yang dimasukkan sudah benar.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
