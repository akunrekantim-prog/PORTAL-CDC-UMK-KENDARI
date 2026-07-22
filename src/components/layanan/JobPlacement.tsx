import React, { useState } from 'react';
import { Award, ShieldAlert, CheckCircle2, ChevronRight, Calculator, FileText } from 'lucide-react';

export default function JobPlacement() {
  const [formData, setFormData] = useState({ name: '', nim: '', gpa: '', toefl: '', gradYear: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.nim.trim()) newErrors.nim = 'NIM wajib diisi';
    if (!formData.gpa.trim()) {
      newErrors.gpa = 'IPK wajib diisi';
    } else {
      const gpa = parseFloat(formData.gpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 4.0) newErrors.gpa = 'IPK tidak valid (0.00 - 4.00)';
    }
    if (!formData.toefl.trim()) {
      newErrors.toefl = 'Skor TOEFL wajib diisi';
    } else {
      const toefl = parseInt(formData.toefl);
      if (isNaN(toefl) || toefl < 310 || toefl > 677) newErrors.toefl = 'Skor TOEFL tidak valid (Rentang 310 - 677)';
    }
    if (!formData.gradYear) newErrors.gradYear = 'Tahun Kelulusan wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Eligibility check logic
    const gpaVal = parseFloat(formData.gpa);
    const toeflVal = parseInt(formData.toefl);
    
    if (gpaVal >= 3.0 && toeflVal >= 450) {
      setIsEligible(true);
    } else {
      setIsEligible(false);
    }
    
    setChecked(true);
  };

  const handleApplyPlacement = () => {
    setIsApplied(true);
  };

  const handleReset = () => {
    setFormData({ name: '', nim: '', gpa: '', toefl: '', gradYear: '' });
    setChecked(false);
    setIsEligible(false);
    setIsApplied(false);
    setErrors({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12" id="layanan-job-placement">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Penyaluran Kerja
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Job Placement Program</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Program akselerasi penyaluran kerja langsung dengan instansi BUMN, kementerian, dan perusahaan mitra premium CDC UM Kendari.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Requirements and Partners */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-[#10B981] pl-3">
              Kriteria Kelayakan Program
            </h3>

            <ul className="space-y-3.5 text-xs font-semibold text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Indeks Prestasi Kumulatif (IPK) minimal 3.00.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Skor TOEFL minimal 450 (atau sertifikat setara dari Pusat Bahasa).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Maksimal 1 tahun setelah tanggal kelulusan resmi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Memiliki portofolio digital / CV terverifikasi oleh CDC.</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase text-slate-400">Instansi Mitra Utama:</h4>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-655 text-slate-600">
                {['Bank Sultra', 'Kalla Group', 'PT Telkom Indonesia', 'BPJS Kesehatan', 'Perum BULOG'].map(p => (
                  <span key={p} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Check Form & Result */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            {isApplied ? (
              <div className="text-center py-8 space-y-4" id="placement-applied-state">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xl">Pendaftaran Penyaluran Sukses!</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Profil Anda telah didaftarkan dalam database akselerasi karir CDC. Rekomendasi resume Anda akan diprioritaskan saat ada lowongan mitra yang cocok.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
                >
                  Cek Kelayakan Lagi
                </button>
              </div>
            ) : checked ? (
              <div className="space-y-6" id="placement-checked-state">
                {isEligible ? (
                  <div className="space-y-6" id="eligible-view">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-emerald-800 text-xs">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                      <div>
                        <span className="font-bold">Selamat! Anda Layak Mengikuti Program.</span> Kualifikasi akademik dan TOEFL Anda memenuhi standar minimum program akselerasi penyaluran kerja langsung.
                      </div>
                    </div>

                    {/* Certificate Widget */}
                    <div className="border border-slate-200 rounded-3xl bg-slate-50 p-6 relative overflow-hidden font-sans shadow-xs text-left text-xs space-y-4">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#10B981]" />
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400">SURAT REKOMENDASI KELAYAKAN</span>
                          <h4 className="font-extrabold text-slate-900 text-sm">JOB PLACEMENT CDC</h4>
                        </div>
                        <Award className="w-6 h-6 text-[#10B981]" />
                      </div>

                      <div className="space-y-2 font-medium text-slate-650">
                        <div>Nama: <span className="font-bold text-slate-800">{formData.name}</span></div>
                        <div>NIM: <span className="font-bold text-slate-800">{formData.nim}</span></div>
                        <div>IPK / TOEFL: <span className="font-bold text-slate-850">{formData.gpa} / {formData.toefl}</span></div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          Nomor Referensi: CDC-REC-{Math.floor(100000 + Math.random() * 900000)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleReset}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase transition"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleApplyPlacement}
                        className="flex-1 bg-[#10B981] hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                      >
                        Daftar Program Sekarang
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6" id="not-eligible-view">
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3 text-rose-800 text-xs">
                      <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                      <div>
                        <span className="font-bold">Maaf, Kriteria Kelayakan Belum Terpenuhi.</span> Nilai IPK atau skor TOEFL Anda saat ini belum memenuhi kriteria minimum penempatan langsung CDC.
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-1">Rekomendasi Kami:</span>
                      1. Silakan hubungi konselor karir CDC melalui menu <strong>Bimbingan Karir</strong> untuk melakukan review CV dan optimasi kemampuan wawancara Anda.<br />
                      2. Anda dapat mengikuti pelatihan peningkatan softskill di menu <strong>Pelatihan Softskill</strong> secara gratis.<br />
                      3. Silakan ajukan program peningkatan kemampuan TOEFL gratis di Pusat Bahasa Universitas Muhammadiyah Kendari.
                    </div>

                    <button
                      onClick={handleReset}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition active:scale-95"
                    >
                      Periksa Ulang Form
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCheck} className="space-y-6" id="placement-form">
                <h3 className="font-extrabold text-slate-900 text-lg">Kalkulator Kelayakan Penyaluran</h3>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Nama Lengkap Lulusan"
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                      errors.name ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NIM */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NIM / NIDN</label>
                    <input
                      type="text"
                      required
                      value={formData.nim}
                      onChange={e => handleInputChange('nim', e.target.value)}
                      placeholder="Contoh: 202201001"
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                        errors.nim ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                      }`}
                    />
                    {errors.nim && <p className="text-red-500 text-[10px] font-bold">{errors.nim}</p>}
                  </div>

                  {/* Tahun Lulus */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tahun Kelulusan</label>
                    <select
                      required
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
                      <option value="sebelumnya">Sebelum 2024</option>
                    </select>
                    {errors.gradYear && <p className="text-red-500 text-[10px] font-bold">{errors.gradYear}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* IPK */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Indeks Prestasi Kumulatif (IPK)</label>
                    <input
                      type="text"
                      required
                      value={formData.gpa}
                      onChange={e => handleInputChange('gpa', e.target.value)}
                      placeholder="Contoh: 3.25"
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                        errors.gpa ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                      }`}
                    />
                    {errors.gpa && <p className="text-red-500 text-[10px] font-bold">{errors.gpa}</p>}
                  </div>

                  {/* TOEFL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Skor TOEFL Terakhir</label>
                    <input
                      type="text"
                      required
                      value={formData.toefl}
                      onChange={e => handleInputChange('toefl', e.target.value)}
                      placeholder="Contoh: 480"
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                        errors.toefl ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                      }`}
                    />
                    {errors.toefl && <p className="text-red-500 text-[10px] font-bold">{errors.toefl}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Calculator className="w-4 h-4" /> Hitung Kelayakan Program
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
