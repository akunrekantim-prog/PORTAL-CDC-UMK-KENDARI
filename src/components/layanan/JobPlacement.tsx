import React from 'react';
import { Award, Building2, Users, FileText, CheckCircle } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider } from './ui';

const MITRA = ['Bank Sultra', 'Kalla Group', 'PT Telkom Indonesia', 'BPJS Kesehatan', 'Perum BULOG', 'dan mitra lainnya'];

export default function JobPlacement() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-job-placement">
      <PageHeader
        badge="Penyaluran Kerja"
        title="Job Placement Program"
        description="Program akselerasi penyaluran kerja langsung dengan instansi BUMN, kementerian, dan perusahaan mitra premium CDC UM Kendari."
        accent="blue"
        icon={Award}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Program akselerasi penyaluran kerja langsung dengan instansi BUMN, kementerian, dan perusahaan mitra premium CDC UM Kendari.' },
                { label: 'Pihak Yang Terlibat', text: 'Lulusan UM Kendari, tim CDC, dan instansi mitra penyaluran kerja.' },
                { label: 'Waktu dan Tempat', text: 'Proses seleksi dan penyaluran dilakukan secara bertahap sesuai kebutuhan mitra.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {['Mahasiswa/alumni melakukan pendaftaran program penyaluran kerja.', 'Tim CDC melakukan screening profil dan kualifikasi.', 'Kandidat yang lolos diusulkan ke mitra penyaluran kerja.'].map((step, idx) => (
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
              <h3 className="font-bold text-slate-900 text-sm">Instansi Mitra Utama:</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {MITRA.join(', ')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
