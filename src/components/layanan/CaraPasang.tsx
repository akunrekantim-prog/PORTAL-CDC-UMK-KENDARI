import React, { useState } from 'react';
import { FileText, Send, Building2, User, Mail, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { PageHeader, Card, CtaBlock, TwoColumn } from './ui';

export default function CaraPasang() {
  const [formData, setFormData] = useState({
    companyName: '',
    picName: '',
    email: '',
    jobTitle: '',
    description: '',
    requirements: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Nama Perusahaan wajib diisi';
    if (!formData.picName.trim()) newErrors.picName = 'Nama PIC wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Judul Lowongan wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi pekerjaan wajib diisi';
    if (!formData.requirements.trim()) newErrors.requirements = 'Kualifikasi pekerjaan wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      picName: '',
      email: '',
      jobTitle: '',
      description: '',
      requirements: '',
    });
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-cara-pasang">
      <PageHeader
        badge="Mitra Perusahaan"
        title="Pemasangan Informasi Lowongan Kerja"
        description="Temukan lulusan terbaik Universitas Muhammadiyah Kendari yang siap kerja dengan mempublikasikan lowongan perusahaan Anda di Portal CDC."
        accent="emerald"
      />

      <TwoColumn
        left={
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3">
              Alur & Prosedur Pemasangan
            </h3>
            
            <div className="space-y-4">
              {[
                { step: '1', title: 'Isi Formulir Pengajuan', desc: 'Isi formulir pengajuan dengan data lengkap perusahaan serta detail lowongan yang dibuka.' },
                { step: '2', title: 'Verifikasi Tim CDC', desc: 'Tim CDC UM Kendari akan melakukan verifikasi berkas dan legalitas info lowongan dalam 1x24 jam.' },
                { step: '3', title: 'Lowongan Tayang', desc: 'Setelah disetujui, lowongan akan tampil di portal utama dan aplikasi dashboard mahasiswa/alumni.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-slate-900 text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-xs text-amber-800">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Layanan Gratis:</span> Pemasangan lowongan kerja di Portal CDC tidak dipungut biaya apapun bagi seluruh perusahaan mitra resmi.
              </div>
            </div>
          </Card>
        }
        right={
          <Card>
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4" id="form-success-state">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xl">Pengajuan Berhasil Dikirim!</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Terima kasih telah mengajukan info lowongan kerja. Tim CDC UM Kendari akan memproses pengajuan Anda dalam waktu maksimal 24 jam. Notifikasi akan dikirimkan ke email Anda.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
                >
                  Ajukan Loker Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="cara-pasang-form">
                <h3 className="font-extrabold text-slate-900 text-lg">Formulir Pengajuan Loker</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWithIcon label="Nama Perusahaan / Instansi" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Contoh: PT Teknologi Bangsa" error={errors.companyName} icon={<Building2 className="w-4 h-4" />} />
                  <FieldWithIcon label="Nama PIC Perusahaan" name="picName" value={formData.picName} onChange={handleInputChange} placeholder="Nama Narahubung" error={errors.picName} icon={<User className="w-4 h-4" />} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWithIcon label="Email Perusahaan" name="email" value={formData.email} onChange={handleInputChange} placeholder="hrd@perusahaan.com" error={errors.email} icon={<Mail className="w-4 h-4" />} />
                  <FieldWithIcon label="Judul Posisi Lowongan" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Contoh: Staff Keuangan" error={errors.jobTitle} icon={<FileText className="w-4 h-4" />} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Uraian Tugas & Deskripsi Pekerjaan</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Jelaskan uraian pekerjaan secara singkat dan jelas..."
                    className={`w-full p-3 rounded-xl border text-sm focus:outline-none ${errors.description ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
                  />
                  {errors.description && <p className="text-red-500 text-[10px] font-bold">{errors.description}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kualifikasi Pelamar</label>
                  <textarea
                    name="requirements"
                    rows={3}
                    value={formData.requirements}
                    onChange={e => handleInputChange('requirements', e.target.value)}
                    placeholder="Contoh: Lulusan S1 Ekonomi, IPK minimal 3.00, Mampu berkomunikasi dengan baik..."
                    className={`w-full p-3 rounded-xl border text-sm focus:outline-none ${errors.requirements ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
                  />
                  {errors.requirements && <p className="text-red-500 text-[10px] font-bold">{errors.requirements}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses Pengajuan...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Kirim Pengajuan Loker
                    </>
                  )}
                </button>
              </form>
            )}
          </Card>
        }
      />
    </div>
  );
}

function FieldWithIcon({ label, name, value, onChange, placeholder, error, icon }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">{icon}</span>
        <input
          type="text"
          name={name}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:outline-none ${error ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
        />
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
    </div>
  );
}
