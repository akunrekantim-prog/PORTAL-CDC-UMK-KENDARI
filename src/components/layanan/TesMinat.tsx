import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { PageHeader, Section, Card, StepList, CtaBlock } from './ui';

interface RiasecResult {
  code: string;
  label: string;
  description: string;
}

interface Question {
  id: number;
  text: string;
  dimension: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

const QUESTIONS: Question[] = [
  { id: 1, text: 'Saya suka merakit, memperbaiki, atau mengoperasikan perangkat/mesin.', dimension: 'R' },
  { id: 2, text: 'Saya menikmati mempelajari ilmu eksakti, sains, atau teknologi baru.', dimension: 'I' },
  { id: 3, text: 'Saya suka menggambar, menulis cerita, atau berekspresi secara visual.', dimension: 'A' },
  { id: 4, text: 'Saya nyaman membantu, mengajar, atau mendengar keluhan orang lain.', dimension: 'S' },
  { id: 5, text: 'Saya suka memimpin kegiatan, berbicara di depan umum, atau menjual ide.', dimension: 'E' },
  { id: 6, text: 'Saya lebih suka bekerja dengan angka, data, prosedur, atau administrasi yang terstruktur.', dimension: 'C' },
];

const DIMENSION_META: Record<string, { label: string; color: string; desc: string }> = {
  R: { label: 'Realistic', color: 'orange', desc: 'Praktis, teknis, dan suka aktivitas fisik/operasional.' },
  I: { label: 'Investigative', color: 'sky', desc: 'Analitis, riset, pemecah masalah berbasis data/penelitian.' },
  A: { label: 'Artistic', color: 'violet', desc: 'Kreatif, ekspresif, dan suka menghasilkan ide/artefak baru.' },
  S: { label: 'Social', color: 'emerald', desc: 'Empatik, komunikatif, dan suka membantu orang lain berkembang.' },
  E: { label: 'Enterprising', color: 'amber', desc: 'Berwibawa, persuasif, dan suka memimpin/mengambil risiko.' },
  C: { label: 'Conventional', color: 'slate', desc: 'Terstruktur, teliti, dan andal dalam prosedur/administrasi.' },
};

export default function TesMinat() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleAnswer = (id: number) => {
    setSubmitted(false);
    setError('');
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateResult = (): RiasecResult[] => {
    const scores: Record<string, number> = {};
    for (const q of QUESTIONS) {
      if (answers[q.id]) {
        scores[q.dimension] = (scores[q.dimension] || 0) + 1;
      }
    }

    const ranked = Object.keys(scores)
      .map(code => ({
        code,
        score: scores[code],
        meta: DIMENSION_META[code],
      }))
      .sort((a, b) => b.score - a.score);

    if (ranked.length === 0) {
      return [];
    }

    const topScore = ranked[0].score;
    const topCodes = ranked.filter(r => r.score === topScore).map(r => r.code);
    const code = topCodes.sort().join('');
    const label = topCodes.map(c => DIMENSION_META[c].label).join(' + ');
    const description = topCodes.map(c => DIMENSION_META[c].desc).join(' ');

    return [{ code, label, description }];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answered = Object.keys(answers).length;

    if (answered < QUESTIONS.length) {
      setError(`Jawab semua ${QUESTIONS.length} pertanyaan untuk mendapatkan hasil yang akurat.`);
      return;
    }

    setError('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  const results = calculateResult();

  return (
    <div className="space-y-10" id="layanan-tes-minat">
      <PageHeader
        badge="Psikologi Karir"
        title="Tes Potensi Minat Kerja"
        description="Identifikasi preferensi kerja alami Anda berdasarkan psikologi minat untuk arah karier yang lebih sesuai."
        accent="blue"
      />

      <Card className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Instruksi</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Baca setiap pernyataan dengan teliti, lalu pilih <strong>Ya</strong> jika sesuai dengan minat alami Anda, atau <strong>Tidak</strong> jika kurang sesuai. Tidak ada jawaban benar atau salah.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" id="riasec-form">
          <div className="space-y-3">
            {QUESTIONS.map(q => {
              const selected = Boolean(answers[q.id]);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition ${
                    selected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.id}. {q.text}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAnswer(q.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                          selected
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {selected ? 'Ya' : 'Tidak'}
                      </button>
                      <span className="text-[10px] text-slate-400 font-medium">Pilih sesuai minat alami Anda.</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
            >
              Lihat Hasil <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase transition"
            >
              Reset
            </button>
          </div>
        </form>
      </Card>

      {submitted && (
        <div className="space-y-4" id="riasec-result">
          <Card>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm">Profil Minat Anda</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hasil di bawah adalah preferensi dominan dari jawaban Anda. Gunakan sebagai acara awal untuk eksplorasi peran kerja.
                </p>
              </div>
            </div>
          </Card>

          {results.map((result, idx) => (
            <Card key={idx} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kode Minat Dominan</span>
                  <h3 className="font-extrabold text-slate-900 text-lg">{result.code}</h3>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-extrabold">
                  {result.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{result.description}</p>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900">Rekomendasi Peran Karir</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'UI/Product Designer',
                    'Content Strategist',
                    'Technical Writer',
                    'Fullstack Engineer',
                    'Data Analyst',
                    'QA / Automation Engineer',
                  ].map(role => (
                    <div key={role} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
            >
              Ulangi Tes
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase transition"
            >
              Kembali ke Atas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
