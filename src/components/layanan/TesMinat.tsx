import React from 'react';
import { PageHeader, Section, Card } from './ui';

export default function TesMinat() {
  return (
    <div className="space-y-10" id="layanan-tes-minat">
      <PageHeader
        badge="Psikologi Karir"
        title="Tes Potensi Minat Kerja"
        description="Tes Potensi Minat Kerja adalah sarana untuk mengidentifikasi preferensi kerja alami Anda berdasarkan psikologi minat untuk arah karier yang lebih sesuai."
        accent="blue"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mb-3">Tujuan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengidentifikasi preferensi kerja alami Anda berdasarkan psikologi minat untuk arah karier yang lebih sesuai.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Pihak Yang Terlibat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Psikolog karir dan konselor CDC yang telah tersertifikasi untuk menafsirkan hasil tes minat kerja.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Waktu dan Tempat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tes dapat dilakukan secara daring melalui portal CDC atau ketikaadak kunjungan konseling karir.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Alat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modul tes online berbasis skala preferensi, panduan interpretasi hasil, dan ringkasan rekomendasi peran karir.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Mekanisme</h3>
            <ol className="space-y-2 text-xs text-slate-600 font-medium list-decimal list-inside">
              <li>Mahasiswa mengakses modul tes minat kerja di portal CDC.</li>
              <li>Menjawab serangkaian pernyataan sesuai preferensi alami.</li>
              <li>Sistem menghasilkan profil minat dominan dan rekomendasi peran karir.</li>
            </ol>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-blue-50 border border-blue-100">
            <h3 className="font-extrabold text-slate-900 text-sm mb-2">Informasi Tes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin akan memasukkan jadwal pelaksanaan tes dan panduan interpretasi hasil di halaman ini.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
