import React from 'react';
import { Building2, FileText, CheckCircle } from 'lucide-react';
import { FlatHeader, Card, MetaList, Divider } from './ui';

export default function CaraPasang() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-cara-pasang">
      <FlatHeader
        eyebrow="Mitra Perusahaan"
        title="Pemasangan Informasi Lowongan Kerja"
        description="Temukan lulusan terbaik Universitas Muhammadiyah Kendari dengan mempublikasikan lowongan perusahaan Anda di Portal CDC."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Memfasilitasi perusahaan mitra mendapatkan kandidat lulusan UM Kendari yang kompeten melalui pemasangan informasi lowongan kerja resmi di portal CDC.' },
                { label: 'Pihak Yang Terlibat', text: 'Tim CDC UM Kendari dan perusahaan mitra yang mengajukan pemasangan lowongan kerja.' },
                { label: 'Waktu dan Tempat', text: 'Pengajuan dapat dilakukan kapan saja secara daring. Verifikasi tim CDC maksimal 1x24 jam kerja.' },
                { label: 'Alat', text: 'Formulir pengajuan digital dan sistem verifikasi legalitas info lowongan.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {['Perusahaan mengisi formulir pengajuan dengan data lengkap serta detail lowongan.', 'Tim CDC melakukan verifikasi berkas dan legalitas info lowongan dalam 1x24 jam.', 'Setelah disetujui, lowongan akan tampil di portal utama dan aplikasi dashboard mahasiswa/alumni.'].map((step, idx) => (
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
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Layanan Gratis</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pemasangan lowongan kerja di Portal CDC tidak dipungut biaya apapun bagi seluruh perusahaan mitra resmi.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
