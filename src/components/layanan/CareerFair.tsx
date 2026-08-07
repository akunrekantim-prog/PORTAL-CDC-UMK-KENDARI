import React from 'react';
import { MapPin, Calendar, Users, Building2, Briefcase, Award } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider } from './ui';

export default function CareerFair() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-career-fair">
      <PageHeader
        badge="Annual Event"
        title="Job Fair & Bursa Kerja"
        description="Acara tahunan bursa kerja akbar mempertemukan mahasiswa tingkat akhir dan alumni UM Kendari dengan lebih dari 30+ mitra perusahaan berskala nasional."
        accent="amber"
        icon={Calendar}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Menjadi wadah pertemuan langsung antara pencari kerja dan perusahaan dalam satu tempat untuk meningkatkan efektivitas rekrutmen.' },
                { label: 'Pihak Yang Terlibat', text: 'Mahasiswa dan alumni UM Kendari serta perusahaan nasional dan multinasional sebagai mitra rekruter.' },
                { label: 'Waktu dan Tempat', text: '22 - 24 November 2026, Auditorium Utama Kampus Utama' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {['Peserta mendaftarkan kehadiran melalui portal CDC.', 'Menghadiri booth mitra sesuai lowongan yang diminati.', 'Melakukan seleksi langsung dengan HRD perusahaan mitra.'].map((step, idx) => (
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
          <Card className="bg-gradient-to-br from-[#0F172A] to-slate-800 text-white">
            <div className="space-y-4">
              <span className="inline-flex px-2.5 py-0.5 bg-amber-500 text-slate-900 text-[10px] font-extrabold rounded uppercase tracking-wider">
                Coming Soon 2026
              </span>
              <h3 className="font-extrabold text-xl leading-tight">Job Fair & Bursa Kerja 2026</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Acara tahunan bursa kerja akbar mempertemukan langsung mahasiswa tingkat akhir dan alumni UM Kendari dengan lebih dari 30+ mitra perusahaan berskala nasional.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
