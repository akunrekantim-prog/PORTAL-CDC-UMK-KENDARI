import React, { useState } from 'react';
import { FileSpreadsheet, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export default function ExitSurvey() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    prodi: '',
    gradYear: '',
    gpa: '',
    curriculumSatisfaction: '',
    facilitySatisfaction: '',
    careerStatus: '',
    feedback: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
      if (!formData.nim.trim()) newErrors.nim = 'NIM wajib diisi';
      if (!formData.prodi.trim()) newErrors.prodi = 'Program Studi wajib diisi';
      if (!formData.gradYear) newErrors.gradYear = 'Tahun Kelulusan wajib diisi';
      if (!formData.gpa.trim()) {
        newErrors.gpa = 'IPK wajib diisi';
      } else {
        const parsedGpa = parseFloat(formData.gpa);
        if (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4.0) {
          newErrors.gpa = 'IPK tidak valid (Format desimal 0.00 - 4.00)';
        }
      }
    } else if (step === 2) {
      if (!formData.curriculumSatisfaction) newErrors.curriculumSatisfaction = 'Silakan pilih tingkat kepuasan kurikulum';
      if (!formData.facilitySatisfaction) newErrors.facilitySatisfaction = 'Silakan pilih tingkat kepuasan fasilitas';
    } else if (step === 3) {
      if (!formData.careerStatus) newErrors.careerStatus = 'Silakan pilih status karir saat ini';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      nim: '',
      prodi: '',
      gradYear: '',
      gpa: '',
      curriculumSatisfaction: '',
      facilitySatisfaction: '',
      careerStatus: '',
      feedback: '',
    });
    setStep(1);
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12" id="layanan-exit-survey">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Tracer Kuesioner
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Data Exit Survey Lulusan</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Kuisioner wajib bagi calon wisudawan Universitas Muhammadiyah Kendari untuk pemetaan penyerapan lulusan di dunia kerja.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isSubmitted ? (
          <div className="p-8 sm:p-10 text-center space-y-4" id="survey-success-state">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl">Exit Survey Berhasil Disimpan!</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Terima kasih telah berpartisipasi. Pengisian Exit Survey Anda telah tercatat secara resmi sebagai syarat kelulusan dan pengambilan ijazah.
            </p>

            <div className="p-5 bg-slate-55 bg-slate-50 rounded-2xl border border-slate-150 text-left space-y-3 font-mono text-xs text-slate-700 max-w-md mx-auto">
              <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-center">
                <span className="font-bold text-slate-900 font-sans">BUKTI BEBAS TRACER CDC</span>
                <span className="text-emerald-600 font-extrabold font-sans">ACTIVE</span>
              </div>
              <div className="space-y-1 font-sans">
                <div>Nama: <span className="font-bold text-slate-800">{formData.name}</span></div>
                <div>NIM: <span className="font-bold text-slate-800">{formData.nim}</span></div>
                <div>Program Studi: <span className="font-bold text-slate-800">{formData.prodi}</span></div>
                <div className="text-[10px] text-slate-400 pt-2 font-mono">
                  ID Verifikasi: CDC-EXS-{Math.floor(100000 + Math.random() * 900000)}
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
            >
              Isi Kuisioner Baru
            </button>
          </div>
        ) : (
          <div className="p-8 sm:p-10 space-y-8">
            {/* Steps indicator */}
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[
                { s: 1, label: 'Biodata' },
                { s: 2, label: 'Akademik' },
                { s: 3, label: 'Karir' },
              ].map((item, idx) => (
                <React.Fragment key={item.s}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                        step === item.s
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md scale-105'
                          : step > item.s
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {item.s}
                    </div>
                    <span className={`text-[10px] font-bold ${step === item.s ? 'text-slate-800' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-0.5 flex-grow mx-2 rounded ${
                        step > item.s ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Steps contents */}
            <form onSubmit={e => e.preventDefault()} className="space-y-6" id="exit-survey-steps-form">
              {/* STEP 1: Biodata */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in" id="survey-step-1">
                  <h3 className="font-extrabold text-slate-900 text-base border-l-4 border-[#1E3A8A] pl-3">
                    Langkah 1: Informasi Biodata Lulusan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        placeholder="Nama Lengkap & Gelar"
                        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                          errors.name ? 'border-red-500 animate-shake' : 'border-slate-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nomor Induk Mahasiswa (NIM)</label>
                      <input
                        type="text"
                        value={formData.nim}
                        onChange={e => handleInputChange('nim', e.target.value)}
                        placeholder="Contoh: 202201001"
                        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                          errors.nim ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.nim && <p className="text-red-500 text-[10px] font-bold">{errors.nim}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Program Studi</label>
                      <input
                        type="text"
                        value={formData.prodi}
                        onChange={e => handleInputChange('prodi', e.target.value)}
                        placeholder="Teknik Informatika"
                        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                          errors.prodi ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.prodi && <p className="text-red-500 text-[10px] font-bold">{errors.prodi}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Tahun Lulus</label>
                      <select
                        value={formData.gradYear}
                        onChange={e => handleInputChange('gradYear', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none ${
                          errors.gradYear ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                        }`}
                      >
                        <option value="">-- Pilih Tahun --</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                      {errors.gradYear && <p className="text-red-500 text-[10px] font-bold">{errors.gradYear}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">IPK Terakhir</label>
                      <input
                        type="text"
                        value={formData.gpa}
                        onChange={e => handleInputChange('gpa', e.target.value)}
                        placeholder="Contoh: 3.50"
                        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                          errors.gpa ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.gpa && <p className="text-red-500 text-[10px] font-bold">{errors.gpa}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Akademik */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in" id="survey-step-2">
                  <h3 className="font-extrabold text-slate-900 text-base border-l-4 border-[#1E3A8A] pl-3">
                    Langkah 2: Evaluasi Layanan Akademik
                  </h3>

                  {/* Curriculum Satisfaction */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Tingkat Kepuasan Relevansi Kurikulum Perkuliahan dengan Dunia Kerja:
                    </label>
                    <div className="flex gap-2">
                      {['Sangat Puas', 'Puas', 'Cukup', 'Tidak Puas'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleInputChange('curriculumSatisfaction', val)}
                          className={`flex-grow px-3 py-2 rounded-xl text-xs font-bold border transition ${
                            formData.curriculumSatisfaction === val
                              ? 'bg-blue-50 border-[#1E3A8A] text-[#1E3A8A]'
                              : 'bg-slate-50 border-slate-200 text-slate-655'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {errors.curriculumSatisfaction && (
                      <p className="text-red-500 text-[10px] font-bold">{errors.curriculumSatisfaction}</p>
                    )}
                  </div>

                  {/* Facility Satisfaction */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Tingkat Kepuasan Fasilitas Penunjang Softskill di Kampus:
                    </label>
                    <div className="flex gap-2">
                      {['Sangat Puas', 'Puas', 'Cukup', 'Tidak Puas'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleInputChange('facilitySatisfaction', val)}
                          className={`flex-grow px-3 py-2 rounded-xl text-xs font-bold border transition ${
                            formData.facilitySatisfaction === val
                              ? 'bg-blue-50 border-[#1E3A8A] text-[#1E3A8A]'
                              : 'bg-slate-50 border-slate-200 text-slate-655'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {errors.facilitySatisfaction && (
                      <p className="text-red-500 text-[10px] font-bold">{errors.facilitySatisfaction}</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Karir */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in" id="survey-step-3">
                  <h3 className="font-extrabold text-slate-900 text-base border-l-4 border-[#1E3A8A] pl-3">
                    Langkah 3: Status Karir Saat Ini & Masukan
                  </h3>

                  {/* Career Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Status Aktivitas Karir Anda Saat Ini:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { v: 'working', l: 'Sudah Mendapatkan Pekerjaan (Karyawan)' },
                        { v: 'entrepreneur', l: 'Membuka Usaha Mandiri (Wirausaha)' },
                        { v: 'studying', l: 'Melanjutkan Studi ke Jenjang S2' },
                        { v: 'unemployed', l: 'Belum Bekerja / Sedang Mencari Kerja' },
                      ].map(item => (
                        <button
                          key={item.v}
                          type="button"
                          onClick={() => handleInputChange('careerStatus', item.v)}
                          className={`p-4 rounded-2xl border text-left text-xs font-bold transition flex gap-3 items-center ${
                            formData.careerStatus === item.v
                              ? 'bg-blue-50 border-[#1E3A8A] text-[#1E3A8A]'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                              formData.careerStatus === item.v
                                ? 'border-[#1E3A8A] bg-[#1E3A8A]'
                                : 'border-slate-300'
                            }`}
                          />
                          <span>{item.l}</span>
                        </button>
                      ))}
                    </div>
                    {errors.careerStatus && <p className="text-red-500 text-[10px] font-bold">{errors.careerStatus}</p>}
                  </div>

                  {/* Feedback */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Masukan &amp; Saran Konstruktif untuk Almamater</label>
                    <textarea
                      rows={3}
                      value={formData.feedback}
                      onChange={e => handleInputChange('feedback', e.target.value)}
                      placeholder="Tuliskan masukan demi peningkatan kualitas kurikulum fakultas..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase transition flex items-center gap-1 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1 active:scale-95"
                  >
                    Lanjut <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="ml-auto bg-[#10B981] hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    Kirim Kuisioner <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
