import React, { useState } from 'react';
import { Search, MapPin, Building, Briefcase, FileText, UploadCloud, X, CheckCircle } from 'lucide-react';

interface LocalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  category: 'Teknologi' | 'Finansial' | 'Administrasi' | 'Edukasi';
  type: string;
  salaryRange: string;
}

const LOCAL_JOBS: LocalJob[] = [
  { id: 'j1', title: 'IT Support & Network Engineer', company: 'PT Sultra Computindo', location: 'Kendari, Sultra', category: 'Teknologi', type: 'Full-time', salaryRange: 'Rp 3.5M - 5M' },
  { id: 'j2', title: 'Accounting Staff', company: 'BPD Sultra (Bank Sultra)', location: 'Kendari, Sultra', category: 'Finansial', type: 'Full-time', salaryRange: 'Rp 4M - 6.5M' },
  { id: 'j3', title: 'Customer Relation Officer', company: 'Kalla Toyota Kendari', location: 'Kendari, Sultra', category: 'Administrasi', type: 'Full-time', salaryRange: 'Rp 3M - 4.5M' },
  { id: 'j4', title: 'Tutor / Guru Komputer', company: 'LKP Kendari Cerdas', location: 'Kendari, Sultra', category: 'Edukasi', type: 'Part-time', salaryRange: 'Rp 1.5M - 2.5M' },
];

export default function BursaKerja() {
  const [jobs] = useState<LocalJob[]>(LOCAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Teknologi' | 'Finansial' | 'Administrasi' | 'Edukasi'>('Semua');
  const [applyingJob, setApplyingJob] = useState<LocalJob | null>(null);
  
  // Apply form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [applyComplete, setApplyComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenApply = (job: LocalJob) => {
    setApplyingJob(job);
    setName('');
    setEmail('');
    setUploadedFile(null);
    setApplyComplete(false);
    setErrors({});
  };

  const handleFileSelect = () => {
    setUploadedFile('CV_Resume_' + name.replace(/\s+/g, '_') + '.pdf');
    if (errors.file) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.file;
        return copy;
      });
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email tidak valid';
    }
    if (!uploadedFile) newErrors.file = 'Silakan unggah dokumen CV/Resume Anda';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setApplyComplete(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12" id="layanan-bursa-kerja">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Bursa Kerja
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Bursa Kerja Lokal (Kendari & Sultra)</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Temukan lowongan kerja di area Kendari dan Sulawesi Tenggara yang bekerja sama secara eksklusif dengan universitas.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari lowongan lokal atau nama instansi..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#10B981]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['Semua', 'Teknologi', 'Finansial', 'Administrasi', 'Edukasi'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
          <Briefcase className="w-10 h-10 text-slate-350 mx-auto mb-2" />
          <h3 className="font-bold text-slate-600">Tidak Ada Lowongan</h3>
          <p className="text-slate-400 text-xs mt-1">Coba kata kunci pencarian atau kategori filter lainnya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full uppercase border border-blue-100">
                    {job.category}
                  </span>
                  <span className="text-xs font-bold text-[#10B981]">{job.salaryRange}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">{job.title}</h3>
                
                <div className="space-y-1 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                  {job.type}
                </span>
                <button
                  onClick={() => handleOpenApply(job)}
                  className="bg-[#10B981] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase transition shadow-sm active:scale-95"
                >
                  Lamar Cepat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]" id="bursa-kerja-apply-modal">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-8 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setApplyingJob(null)}
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {applyComplete ? (
              <div className="text-center py-6 space-y-4" id="apply-success-state">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Lamaran Berhasil Dikirim!</h3>
                <p className="text-slate-550 text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                  Lamaran kerja Anda untuk posisi <strong>{applyingJob.title}</strong> di <strong>{applyingJob.company}</strong> telah diteruskan ke HRD mitra.
                </p>
                <button
                  onClick={() => setApplyingJob(null)}
                  className="mt-2 px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Kirim Lamaran Cepat</h3>
                  <p className="text-slate-500 text-xs mt-1 truncate">Posisi: {applyingJob.title} - {applyingJob.company}</p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#10B981]"
                    placeholder="Contoh: Rian Hidayat"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Aktif</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#10B981]"
                    placeholder="rian@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
                </div>

                {/* File Upload Zone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Dokumen CV/Resume (PDF)</label>
                  <div
                    onClick={handleFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      uploadedFile
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                    }`}
                  >
                    <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${uploadedFile ? 'text-emerald-555 text-emerald-600' : 'text-slate-400'}`} />
                    {uploadedFile ? (
                      <div className="text-xs font-semibold flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{uploadedFile}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Klik untuk simulasi unggah file</span>
                        <span className="text-[10px] text-slate-400">PDF maksimal 2MB</span>
                      </div>
                    )}
                  </div>
                  {errors.file && <p className="text-red-500 text-[10px] font-bold">{errors.file}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#10B981] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                >
                  Kirim Lamaran Kerja
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
