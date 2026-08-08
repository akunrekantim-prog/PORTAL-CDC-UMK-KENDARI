import React, { useState } from 'react';
import { Award, CheckSquare, Square, CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { PageHeader, Card, CtaBlock } from './ui';

interface Module {
  id: string;
  title: string;
  duration: string;
  category: 'Softskill' | 'Kewirausahaan';
  desc: string;
}

const MODULES: Module[] = [
  { id: 'm1', title: 'Komunikasi Efektif & Public Speaking', duration: '2 Jam', category: 'Softskill', desc: 'Mampu menyampaikan ide dengan jelas, menulis pesan kerja profesional, dan berbicara di depan publik tanpa hambatan komunikasi.' },
  { id: 'm2', title: 'Kepemimpinan & Kerja Sama Tim', duration: '2.5 Jam', category: 'Softskill', desc: 'Mampu memimpin Diskusi kelompok, mendelegasi tugas, dan menyelesaikan konflik dalam tim kerja maupun organisasi kampus.' },
  { id: 'm3', title: 'Personal Branding & Pitching Karir', duration: '2 Jam', category: 'Softskill', desc: 'Mampu membentuk identitas profesional, menyusun profil LinkedIn, dan melakukan pitch 1 menit untuk lowongan atau proyek.' },
  { id: 'm4', title: 'Berpikir Kritis & Manajemen Waktu', duration: '2 Jam', category: 'Softskill', desc: 'Mampu memprioritaskan tugas, mengambil keputusan berbasis data, dan menghindari prokrastinasi dalam lingkungan kerja.' },
  { id: 'm5', title: 'Dasar Kewirausahaan & Ideasi Bisnis Lokal', duration: '3 Jam', category: 'Kewirausahaan', desc: 'Mampu mengidentifikasi peluang bisnis berbasis kebutuhan lokal Kendari/Sultra, menyusun nilai jual, dan memvalidasi ide pasar.' },
  { id: 'm6', title: 'Business Model Canvas & Pitching Investor', duration: '3 Jam', category: 'Kewirausahaan', desc: 'Mampu menyusun kerangka bisnis BMC dan mempresentasikan rencana bisnis dengan narasi yang meyakinkan di hadapan investor/panel.' },
];

export default function Softskill() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [certClaimed, setCertClaimed] = useState(false);

  const toggleModule = (id: string) => {
    if (certClaimed) return;
    setCompletedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((completedIds.length / MODULES.length) * 100);
  const allCompleted = completedIds.length === MODULES.length;

  const handleClaimCert = () => {
    if (allCompleted) {
      setCertClaimed(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-softskill">
      <PageHeader
        badge="Kurikulum Mandiri"
        title="Pelatihan Softskill & Kewirausahaan"
        description="Kembangkan kompetensi kerja dan jiwa wirausaha melalui modul terstruktur yang relevan dengan kebutuhan industri dan UMKM lokal Kendari."
        accent="violet"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Modul Kurikulum Mandiri</h3>
              <span className="text-xs text-slate-400 font-bold">{completedIds.length} dari {MODULES.length} Selesai</span>
            </div>

            <div className="space-y-4">
              {MODULES.map(mod => {
                const isDone = completedIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-5 rounded-2xl border transition duration-150 cursor-pointer flex gap-4 items-start ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button className="pt-0.5 text-slate-400 hover:text-emerald-500 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          mod.category === 'Softskill'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {mod.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> {mod.duration}
                        </span>
                      </div>
                      <h4 className={`font-bold text-sm ${isDone ? 'text-slate-800' : 'text-slate-900'}`}>{mod.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{mod.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg">Progres Pelatihan</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Persentase Selesai</span>
                <span className="text-violet-600">{progressPercent}%</span>
              </div>
              <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent > 15 && (
                    <span className="text-[9px] font-extrabold text-white">{progressPercent}%</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
              {certClaimed ? (
                <div className="space-y-3" id="cert-claimed-widget">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <Award className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Sertifikat Berhasil Diklaim</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    E-Sertifikat kompetensi CDC UM Kendari telah dikirim ke email terdaftar. Simpan bukti ini untuk portfolio karir Anda.
                  </p>
                </div>
              ) : allCompleted ? (
                <div className="space-y-4" id="cert-claim-ready">
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Pelatihan Mandiri Selesai</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Selamat! Anda telah menyelesaikan seluruh modul. Klik tombol di bawah untuk mengklaim e-sertifikat kompetensi CDC UM Kendari.
                  </p>
                  <button
                    onClick={handleClaimCert}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                  >
                    Klaim E-Certificate
                  </button>
                </div>
              ) : (
                <div className="space-y-3" id="cert-locked">
                  <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Sertifikat Terkunci</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Selesaikan seluruh checklist modul di samping (100% selesai) untuk membuka dan mengunduh E-Certificate pengembangan kompetensi Anda.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
