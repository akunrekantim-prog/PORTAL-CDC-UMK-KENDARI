import React, { useState } from 'react';
import { Award, CheckSquare, Square, CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  duration: string;
  category: 'Softskill' | 'Kewirausahaan';
  desc: string;
}

const MODULES: Module[] = [
  { id: 'm1', title: 'Komunikasi Efektif & Public Speaking', duration: '2 Jam', category: 'Softskill', desc: 'Melatih kemampuan berbicara di depan umum, presentasi kerja, dan mendengarkan secara aktif.' },
  { id: 'm2', title: 'Kepemimpinan & Kerja Sama Tim (Teamwork)', duration: '2.5 Jam', category: 'Softskill', desc: 'Memahami dinamika kelompok, kepemimpinan kolaboratif, dan teknik pemecahan masalah.' },
  { id: 'm3', title: 'Berpikir Kritis & Manajemen Waktu', duration: '2 Jam', category: 'Softskill', desc: 'Mengasah kemampuan analisis keputusan taktis serta cara memprioritaskan tugas kerja.' },
  { id: 'm4', title: 'Dasar Kewirausahaan & Ideasi Bisnis', duration: '3 Jam', category: 'Kewirausahaan', desc: 'Mempelajari cara merancang ide bisnis kreatif yang sesuai dengan kebutuhan pasar modern.' },
  { id: 'm5', title: 'Business Model Canvas (BMC) & Pitching', duration: '3 Jam', category: 'Kewirausahaan', desc: 'Menyusun kerangka rencana bisnis kanvas dan teknik presentasi di hadapan investor.' },
];

export default function Softskill() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [certClaimed, setCertClaimed] = useState(false);

  const toggleModule = (id: string) => {
    if (certClaimed) return; // Prevent change after claiming
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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12" id="layanan-softskill">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-violet-50 text-violet-600 border border-violet-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Kurikulum Mandiri
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Pelatihan Softskill & Kewirausahaan</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Asah keterampilan interpersonal dan jiwa wirausaha Anda melalui kurikulum mandiri terstruktur CDC UM Kendari.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Progress Tracker */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
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
                        ? 'bg-emerald-50/40 border-emerald-250 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-350'
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
                            ? 'bg-blue-150 bg-blue-100 text-blue-700'
                            : 'bg-amber-150 bg-amber-100 text-amber-700'
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
          </div>
        </div>

        {/* Right Column: Dynamic Certificate Widget */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg">Progres Pelatihan</h3>

            {/* Circular or Bar Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Persentase Selesai</span>
                <span className="text-violet-600">{progressPercent}%</span>
              </div>
              <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-650 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent > 15 && (
                    <span className="text-[9px] font-extrabold text-white">{progressPercent}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Certificate Status Widget */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
              {certClaimed ? (
                <div className="space-y-3" id="cert-claimed-widget">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <Award className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Sertifikat Berhasil Diklaim!</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    E-Certificate pelatihan Anda telah dikirimkan ke alamat email terdaftar di Portal CDC. Silakan periksa kotak masuk atau spam email Anda.
                  </p>
                </div>
              ) : allCompleted ? (
                <div className="space-y-4" id="cert-claim-ready">
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Pelatihan Mandiri Selesai!</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Selamat! Anda telah menyelesaikan seluruh modul pelatihan. Klik tombol di bawah untuk mengklaim sertifikat kelulusan Anda.
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
          </div>
        </div>
      </div>
    </div>
  );
}
