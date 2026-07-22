import React, { useState } from 'react';
import { Award, CheckCircle, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Aktivitas apa yang paling membuat Anda bersemangat atau nyaman?',
    options: [
      { label: 'Memperbaiki barang elektronik atau merakit mesin mekanis', type: 'R' },
      { label: 'Memecahkan teka-teki logika atau menganalisis data riset ilmiah', type: 'I' },
      { label: 'Melukis, menulis cerita fiksi, atau mendesain elemen grafis', type: 'A' },
      { label: 'Mendengarkan curhatan teman atau mengajar anak-anak belajar', type: 'S' },
      { label: 'Mengatur strategi bisnis atau mempromosikan produk ke orang lain', type: 'E' },
      { label: 'Mengelompokkan file secara teratur atau meneliti keakuratan angka-angka', type: 'C' },
    ],
  },
  {
    id: 2,
    text: 'Bagaimana cara Anda menyelesaikan sebuah masalah di tempat kerja/sekolah?',
    options: [
      { label: 'Langsung mencoba menyelesaikannya secara manual menggunakan alat', type: 'R' },
      { label: 'Membaca literatur pendukung atau mengumpulkan teori terkait terlebih dahulu', type: 'I' },
      { label: 'Mencari cara baru yang unik dan belum pernah dicoba sebelumnya', type: 'A' },
      { label: 'Mengajak tim berdiskusi dan mencari jalan keluar bersama', type: 'S' },
      { label: 'Mengambil kendali kepemimpinan dan membagi tugas secara tegas', type: 'E' },
      { label: 'Membuat ceklis alur kerja yang logis sesuai peraturan tertulis', type: 'C' },
    ],
  },
  {
    id: 3,
    text: 'Jenis lingkungan kerja seperti apa yang paling Anda sukai?',
    options: [
      { label: 'Di luar ruangan, bengkel kerja, atau laboratorium praktik', type: 'R' },
      { label: 'Ruang tenang untuk fokus meneliti fenomena alam/teknologi', type: 'I' },
      { label: 'Studio seni, agensi kreatif, atau teater pertunjukan bebas', type: 'A' },
      { label: 'Yayasan sosial, pusat layanan kesehatan, atau sekolah/kampus', type: 'S' },
      { label: 'Ruang rapat bisnis, panggung presentasi, atau kantor startup dinamis', type: 'E' },
      { label: 'Lembaga keuangan, bank, atau administrasi kantor pemerintahan yang teratur', type: 'C' },
    ],
  },
  {
    id: 4,
    text: 'Di waktu luang, hobi apa yang paling sering Anda lakukan?',
    options: [
      { label: 'Berkebun, memasak, atau mengotak-atik dekorasi rumah', type: 'R' },
      { label: 'Membaca artikel sains, belajar coding, atau menonton film dokumenter', type: 'I' },
      { label: 'Bermain musik, fotografi, menulis blog, atau menjahit baju', type: 'A' },
      { label: 'Ikut kegiatan sukarelawan, mentoring, atau ngobrol mendalam bersama kerabat', type: 'S' },
      { label: 'Mengikuti berita investasi, berjualan online, atau berjejaring networking', type: 'E' },
      { label: 'Menyusun koleksi barang hobi secara rapi, atau membuat rencana anggaran keuangan', type: 'C' },
    ],
  },
  {
    id: 5,
    text: 'Kemampuan apa yang paling ingin Anda asah ke depannya?',
    options: [
      { label: 'Keterampilan menggunakan instrumen teknik atau alat konstruksi fisik', type: 'R' },
      { label: 'Kemampuan analisis kuantitatif atau riset laboratorium lanjutan', type: 'I' },
      { label: 'Keterampilan bercerita kreatif (storytelling) atau ekspresi artistik seni', type: 'A' },
      { label: 'Keterampilan komunikasi empati dan penyelesaian konflik sosial', type: 'S' },
      { label: 'Teknik negosiasi bisnis, publik speaking, dan kepemimpinan tim', type: 'E' },
      { label: 'Sistem manajemen database perkantoran dan ketelitian administrasi keuangan', type: 'C' },
    ],
  },
];

interface ResultDetail {
  title: string;
  desc: string;
  careers: string[];
  majors: string[];
}

const RESULT_DETAILS: Record<string, ResultDetail> = {
  R: {
    title: 'Realistic (Praktikal & Fisik)',
    desc: 'Anda menyukai aktivitas praktis yang melibatkan pengerjaan fisik, penggunaan mesin, atau pembuatan peralatan. Anda cenderung fokus pada kenyataan dan menyukai hasil kerja nyata daripada teori abstrak.',
    careers: ['Insinyur Mesin/Elektro', 'Ahli Jaringan Komputer', 'Teknisi Sistem', 'Petani Modern', 'Arsitek'],
    majors: ['Teknik Mesin', 'Teknik Elektro', 'Teknik Informatika', 'Arsitektur', 'Pertanian'],
  },
  I: {
    title: 'Investigative (Analitis & Riset)',
    desc: 'Anda adalah pemikir yang sangat analitis, logis, dan penuh rasa ingin tahu. Anda sangat menyukai aktivitas investigasi ilmiah, pengumpulan fakta, analisis data, dan penyelesaian masalah rumit.',
    careers: ['Peneliti/Ilmuwan', 'Analis Data', 'Programmer/Software Engineer', 'Ahli Statistika', 'Psikolog Klinis'],
    majors: ['Sains/Biologi/Fisika', 'Teknik Informatika', 'Matematika/Statistika', 'Psikologi'],
  },
  A: {
    title: 'Artistic (Kreatif & Ekspresif)',
    desc: 'Anda adalah individu yang imajinatif, ekspresif, dan tidak konvensional. Anda menyukai orisinalitas dalam bekerja, mengekspresikan diri lewat karya seni, musik, tulisan, maupun desain visual.',
    careers: ['Desainer Grafis', 'Copywriter/Content Writer', 'Sutradara/Kreator Konten', 'Ilustrator', 'Perencana Acara (Event Planner)'],
    majors: ['Desain Komunikasi Visual (DKV)', 'Sastra/Bahasa', 'Arsitektur', 'Seni Rupa/Musik'],
  },
  S: {
    title: 'Social (Peduli & Pembimbing)',
    desc: 'Anda memiliki empati yang tinggi dan menyukai interaksi yang bertujuan untuk membantu, mendidik, menyembuhkan, atau melatih orang lain. Anda adalah pendengar yang baik dan komunikator sosial.',
    careers: ['Guru/Dosen', 'Konselor/Psikolog Karir', 'Pekerja Sosial', 'Tenaga Medis/Perawat', 'Hubungan Masyarakat (PR)'],
    majors: ['Pendidikan Guru', 'Psikologi', 'Keperawatan', 'Ilmu Komunikasi'],
  },
  E: {
    title: 'Enterprising (Bisnis & Pemimpin)',
    desc: 'Anda adalah seorang pemimpin alami yang persuasif, ambisius, dan berorientasi pada hasil. Anda menyukai tantangan mengambil keputusan taktis, berbisnis, bernegosiasi, dan mengelola banyak orang.',
    careers: ['Wirausahawan', 'Manajer Pemasaran', 'Analisis Bisnis', 'Konsultan Manajemen', 'Pengacara/Politisi'],
    majors: ['Manajemen Bisnis', 'Ekonomi Pembangunan', 'Ilmu Hukum', 'Ilmu Pemerintahan'],
  },
  C: {
    title: 'Conventional (Teratur & Detail)',
    desc: 'Dan Anda adalah orang yang sangat teratur, teliti, dan menyukai struktur kerja yang jelas. Anda ahli dalam mengolah data, mengorganisasi arsip, memantau detail kepatuhan regulasi, dan menjaga ketepatan angka.',
    careers: ['Akuntan/Auditor', 'Staff Administrasi Database', 'Sekretaris Eksekutif', 'Analis Finansial', 'Arsiparis'],
    majors: ['Akuntansi', 'Manajemen Administrasi', 'Ilmu Perpustakaan/Kearsipan', 'Perpajakan'],
  },
};

export default function TesMinat() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const [testComplete, setTestComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const handleAnswerSelect = (type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C', optionIdx: number) => {
    // Save scores
    setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setUserAnswers(prev => [...prev, optionIdx]);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setTestComplete(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
    setUserAnswers([]);
    setTestComplete(false);
  };

  // Find dominant personality
  const getDominantType = (): string => {
    let maxVal = -1;
    let dominant = 'R';
    Object.entries(scores).forEach(([key, value]) => {
      const val = value as number;
      if (val > maxVal) {
        maxVal = val;
        dominant = key;
      }
    });
    return dominant;
  };

  const dominantType = getDominantType();
  const resultData = RESULT_DETAILS[dominantType];
  const progressPercent = Math.round(((currentIdx) / QUESTIONS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12" id="layanan-tes-minat">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-violet-50 text-violet-600 border border-violet-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Tes Potensi Minat
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Tes Potensi Minat Kerja</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Temukan tipe kepribadian kerja dominan Anda menggunakan kuesioner mini adaptif berbasis model RIASEC standar industri.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {!testComplete ? (
          <div className="p-8 sm:p-10 space-y-8" id="test-quiz-state">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Soal {currentIdx + 1} dari {QUESTIONS.length}</span>
                <span>Progres: {progressPercent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-snug">
                {QUESTIONS[currentIdx].text}
              </h3>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 gap-3">
              {QUESTIONS[currentIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(opt.type, idx)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 transition duration-150 text-sm font-semibold text-slate-700 flex justify-between items-center group"
                >
                  <span>{opt.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 space-y-8 animate-fade-in" id="test-result-state">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-2xl">Analisis Hasil Tes Minat</h3>
              <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Tipe Dominan Kepribadian Kerja Anda:</p>
              <div className="inline-block px-5 py-2 bg-violet-100 border border-violet-200 rounded-2xl font-extrabold text-violet-700 text-lg tracking-wide shadow-sm">
                {resultData.title}
              </div>
            </div>

            {/* Chart scores summary */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-violet-600" /> Distribusi Skor Kategori RIASEC
              </h4>
              <div className="grid grid-cols-6 gap-2 pt-2 items-end h-28 max-w-xs mx-auto border-b border-slate-200">
                {Object.entries(scores).map(([key, value]) => {
                  const val = value as number;
                  const maxPossible = 5;
                  const scorePercent = Math.max(10, (val / maxPossible) * 100);
                  const isDom = key === dominantType;
                  return (
                    <div key={key} className="flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        className={`w-4 rounded-t transition-all duration-550 ${
                          isDom ? 'bg-violet-600' : 'bg-slate-300'
                        }`}
                        style={{ height: `${scorePercent}%` }}
                      />
                      <span className={`text-[10px] font-bold ${isDom ? 'text-violet-700' : 'text-slate-500'}`}>
                        {key} ({val})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-l-4 border-violet-500 pl-3">Ulasan Karakteristik</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{resultData.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs uppercase text-violet-600">Rekomendasi Karir:</h5>
                  <ul className="text-slate-700 text-xs font-semibold space-y-1">
                    {resultData.careers.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs uppercase text-violet-600">Rekomendasi Prodi:</h5>
                  <ul className="text-slate-700 text-xs font-semibold space-y-1">
                    {resultData.majors.map((m, i) => <li key={i}>• {m}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ulangi Tes Kuis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
