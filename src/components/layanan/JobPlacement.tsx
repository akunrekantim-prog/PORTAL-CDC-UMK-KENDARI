import React, { useState } from 'react';
import { Award, ShieldAlert, CheckCircle2, ChevronRight, Calculator, FileText } from 'lucide-react';
import { PageHeader, Card, CtaBlock, TwoColumn } from './ui';

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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-job-placement">
      <PageHeader
        badge="Penyaluran Kerja"
        title="Job Placement Program"
        description="Program akselerasi penyaluran kerja langsung dengan instansi BUMN, kementerian, dan perusahaan mitra premium CDC UM Kendari."
        accent="blue"
      />

      {isApplied ? (
        <Card>
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
        </Card>
      ) : checked ? (
        <div className="space-y-6" id="placement-checked-state">
          {isEligible ? (
            <div className="space-y-6" id="eligible-view">
              <Card>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                  <div>
                    <span className="font-bold">Selamat! Anda Layak Mengikuti Program.</span> Kualifikasi akademik dan TOEFL Anda memenuhi standar minimum program akselerasi penyaluran kerja langsung.
                  </div>
                </div>

                <div className="border border-slate-200 rounded-3xl bg-slate-50 p-6 relative overflow-hidden font-mono text-xs space-y-4">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                  <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400">SURAT REKOMENDASI KELAYAKAN</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">JOB PLACEMENT CDC</h4>
                    </div>
                    <Award className="w-6 h-6 text-emerald-500" />
                  </div>

                  <div className="space-y-2 font-medium text-slate-700">
                    <div>Nama: <span className="font-bold text-slate-800">{formData.name}</span></div>
                    <div>NIM: <span className="font-bold text-slate-800">{formData.nim}</span></div>
                    <div>IPK / TOEFL: <span className="font-bold text-slate-800">{formData.gpa} / {formData.toefl}</span></div>
                    <div className="text-[9px] text-slate-400">
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                  >
                    Daftar Program Sekarang
                  </button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6" id="not-eligible-view">
              <Card>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3 text-rose-800 text-xs">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                  <div>
                    <span className="font-bold">Maaf, Kriteria Kelayakan Belum Terpenuhi.</span> Nilai IPK atau skor TOEFL Anda saat ini belum memenuhi kriteria minimum penempatan langsung CDC.
                  </div>
                </div>

                <CtaBlock>
                  <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-800 block">Rekomendasi Kami:</span>
                    1. Silakan hubungi konselor karir CDC melalui menu <strong>Bimbingan Karir</strong> untuk melakukan review CV dan optimasi kemampuan wawancara Anda.<br />
                    2. Anda dapat mengikuti pelatihan peningkatan softskill di menu <strong>Pelatihan Softskill</strong> secara gratis.<br />
                    3. Silakan ajukan program peningkatan kemampuan TOEFL gratis di Pusat Bahasa Universitas Muhammadiyah Kendari.
                  </div>
                </CtaBlock>

                <button
                  onClick={handleReset}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition active:scale-95"
                >
                  Periksa Ulang Form
                </button>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <TwoColumn
          left={
            <Card>
              <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3">
                Kriteria Kelayakan Program
              </h3>

              <ul className="space-y-3.5 text-xs font-semibold text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Indeks Prestasi Kumulatif (IPK) minimal 3.00.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Skor TOEFL minimal 450 (atau sertifikat setara dari Pusat Bahasa).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Maksimal 1 tahun setelah tanggal kelulusan resmi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Memiliki portofolio digital / CV terverifikasi oleh CDC.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase text-slate-400">Instansi Mitra Utama:</h4>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-600">
                  {['Bank Sultra', 'Kalla Group', 'PT Telkom Indonesia', 'BPJS Kesehatan', 'Perum BULOG'].map(p => (
                    <span key={p} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          }
          right={
            <Card>
              <form onSubmit={handleCheck} className="space-y-6" id="placement-form">
                <h3 className="font-extrabold text-slate-900 text-lg">Kalkulator Kelayakan Penyaluran</h3>

                <Field label="Nama Lengkap" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nama Lengkap Lulusan" error={errors.name} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="NIM / NIDN" name="nim" value={formData.nim} onChange={handleInputChange} placeholder="Contoh: 202201001" error={errors.nim} />
                  <SelectField label="Tahun Kelulusan" name="gradYear" value={formData.gradYear} onChange={handleInputChange} error={errors.gradYear}>
                    <option value="">-- Pilih Tahun --</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="sebelumnya">Sebelum 2024</option>
                  </SelectField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Indeks Prestasi Kumulatif (IPK)" name="gpa" value={formData.gpa} onChange={handleInputChange} placeholder="Contoh: 3.25" error={errors.gpa} />
                  <Field label="Skor TOEFL Terakhir" name="toefl" value={formData.toefl} onChange={handleInputChange} placeholder="Contoh: 480" error={errors.toefl} />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Calculator className="w-4 h-4" /> Hitung Kelayakan Program
                </button>
              </form>
            </Card>
          }
        />
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, error }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input
        type="text"
        required
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${error ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
      />
      {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, error, children }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        className={`w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none ${error ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
    </div>
  );
}
