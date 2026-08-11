import React from 'react';
import { PageHeader, Card } from './ui';
import { ExternalLink, Sparkles, Brain, CheckCircle, Target, ArrowUpRight } from 'lucide-react';

export default function TesMinat() {
  const klobUrl = "https://www.klob.id/klob-journey/klob-meter";

  return (
    <div className="space-y-8" id="layanan-tes-minat">
      <PageHeader
        badge="Psikologi & Minat Karir"
        title="Tes Potensi Minat Kerja"
        description="Tes Potensi Minat Kerja adalah sarana untuk mengidentifikasi preferensi kerja alami Anda berdasarkan psikologi minat untuk arah karier yang lebih sesuai."
        accent="blue"
      />

      {/* Main Klob Meter Call To Action Card */}
      <div className="bg-gradient-to-br from-[#0F1F4B] via-[#1E3A8A] to-[#1e293b] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Klob Meter
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ikuti Tes Potensi &amp; Minat Kerja Sekarang
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Temukan minat alami, gaya kerja, dan rekomendasi karir ideal Anda secara daring melalui platform terintegrasi Klob Meter.
            </p>
          </div>

          <a
            href={klobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#F26522] hover:bg-orange-600 text-white font-extrabold text-sm sm:text-base px-6 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <span>Akses Tes Klob Meter</span>
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mb-3">Tujuan</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengidentifikasi preferensi kerja alami Anda berdasarkan psikologi minat untuk arah karier yang lebih sesuai.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Pihak Yang Terlibat</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Psikolog karir dan konselor CDC yang telah tersertifikasi untuk menafsirkan hasil tes minat kerja.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Waktu dan Tempat</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tes dapat dilakukan secara daring kapan saja melalui portal Klob Meter atau ketika kunjungan konseling karir.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Alat &amp; Modul</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Modul tes online berbasis skala preferensi, panduan interpretasi hasil, dan ringkasan rekomendasi peran karir.
            </p>

            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mt-6 mb-2">Mekanisme</h3>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium list-decimal list-inside">
              <li>Klik tombol "Akses Tes Klob Meter" untuk menuju portal tes.</li>
              <li>Menjawab serangkaian pertanyaan sesuai preferensi alami Anda.</li>
              <li>Sistem menghasilkan profil minat dominan dan rekomendasi peran karir secara instan.</li>
            </ol>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-blue-50/80 border border-blue-100/80">
            <div className="flex items-center gap-2.5 text-[#1E3A8A] font-extrabold text-sm mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Mengapa Mengikuti Klob Meter?</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Analisis mendalam terhadap tipe kepribadian & preferensi lingkungan kerja.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Rekomendasi jenis profesi yang paling relevan dengan potensi Anda.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Hasil dapat dikonsultasikan langsung dengan Konselor Karir CDC.</span>
              </li>
            </ul>

            <a
              href={klobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs px-4 py-3 rounded-xl transition-colors"
            >
              <span>Buka Link Klob Meter</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
