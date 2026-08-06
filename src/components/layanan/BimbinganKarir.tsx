import React, { useState } from 'react';
import {
  Calendar, User, Clock, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PageHeader, Card, CtaBlock } from './ui';

interface Counselor {
  id: string;
  name: string;
  specialty: string;
  availableDays: string;
}

const COUNSELORS: Counselor[] = [
  { id: '1', name: 'Dr. Hardian, M.Psi.', specialty: 'Minat, Bakat, & Karir Akademik', availableDays: 'Senin, Rabu' },
  { id: '2', name: 'Nita Rahayu, S.Psi., CHRP', specialty: 'CV Review & Mock Interview', availableDays: 'Selasa, Kamis' },
  { id: '3', name: 'Rahmat Hidayat, M.Si.', specialty: 'Persiapan Mental & Dunia Kerja', availableDays: 'Rabu, Jumat' },
];

export default function BimbinganKarir() {
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    prodi: '',
    counselorId: '',
    topic: '',
    date: '',
    timeSlot: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.nim.trim()) newErrors.nim = 'NIM wajib diisi';
    if (!formData.prodi.trim()) newErrors.prodi = 'Program Studi wajib diisi';
    if (!formData.counselorId) newErrors.counselorId = 'Silakan pilih konselor';
    if (!formData.topic) newErrors.topic = 'Silakan pilih topik bimbingan';
    if (!formData.date) newErrors.date = 'Silakan tentukan tanggal';
    if (!formData.timeSlot) newErrors.timeSlot = 'Silakan pilih sesi waktu';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      nim: '',
      prodi: '',
      counselorId: '',
      topic: '',
      date: '',
      timeSlot: '',
    });
    setIsSubmitted(false);
    setErrors({});
  };

  const selectedCounselor = COUNSELORS.find(c => c.id === formData.counselorId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-bimbingan-karir">
      <PageHeader
        badge="Konseling Karir"
        title="Bimbingan & Konseling Karir"
        description="Rencanakan karir masa depan Anda. Konsultasikan CV, persiapan interview, atau minat karir dengan psikolog dan penasihat karir profesional CDC."
        accent="amber"
      />

      {isSubmitted ? (
        <Card>
          <div className="text-center py-8 space-y-4" id="booking-success-state">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl">Reservasi Konseling Berhasil!</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Jadwal konsultasi Anda telah dicatat oleh sistem. Silakan simpan detail tiket reservasi berikut:
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-3 font-mono text-xs text-slate-700 max-w-md mx-auto">
              <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-center">
                <span className="font-bold text-slate-900">TIKET KONSELING CDC</span>
                <span className="text-emerald-600 font-extrabold font-sans">CONFIRMED</span>
              </div>
              <div className="space-y-1.5 font-sans">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400">Nama:</span>
                  <span className="col-span-2 font-bold text-slate-800">{formData.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400">NIM:</span>
                  <span className="col-span-2 font-bold text-slate-800">{formData.nim}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400">Konselor:</span>
                  <span className="col-span-2 font-bold text-slate-800">{selectedCounselor?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400">Topik:</span>
                  <span className="col-span-2 font-bold text-slate-800">{formData.topic}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400">Waktu:</span>
                  <span className="col-span-2 font-bold text-slate-800">
                    {new Date(formData.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ({formData.timeSlot})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
            >
              Buat Jadwal Baru
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6" id="bimbingan-karir-form">
            <h3 className="font-extrabold text-slate-900 text-lg">Formulir Reservasi Konseling</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap Anda"
                error={errors.name}
                icon={<User className="w-4 h-4" />}
              />
              <Field
                label="NIM / NIDN"
                name="nim"
                value={formData.nim}
                onChange={handleInputChange}
                placeholder="Contoh: 202201001"
                error={errors.nim}
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Program Studi"
                name="prodi"
                value={formData.prodi}
                onChange={handleInputChange}
                placeholder="Contoh: Teknik Informatika"
                error={errors.prodi}
              />
              <SelectField
                label="Pilih Konselor Karir"
                name="counselorId"
                value={formData.counselorId}
                onChange={handleInputChange}
                error={errors.counselorId}
              >
                <option value="">-- Pilih Konselor --</option>
                {COUNSELORS.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.availableDays})</option>
                ))}
              </SelectField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                label="Topik Konseling"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                error={errors.topic}
              >
                <option value="">-- Pilih Topik --</option>
                <option value="CV & Resume Review">CV &amp; Resume Review</option>
                <option value="Persiapan Wawancara Kerja">Persiapan Wawancara Kerja</option>
                <option value="Pemilihan Karir & Minat">Pemilihan Karir &amp; Minat</option>
                <option value="Masalah & Hambatan Kerja">Masalah &amp; Hambatan Kerja</option>
              </SelectField>

              <Field
                label="Pilih Tanggal"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                error={errors.date}
                icon={<Calendar className="w-4 h-4" />}
              />

              <SelectField
                label="Pilih Sesi Waktu"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                error={errors.timeSlot}
                icon={<Clock className="w-4 h-4" />}
              >
                <option value="">-- Pilih Waktu --</option>
                <option value="Sesi I (09:00 - 09:45 WITA)">09:00 - 09:45 WITA</option>
                <option value="Sesi II (10:00 - 10:45 WITA)">10:00 - 10:45 WITA</option>
                <option value="Sesi III (13:30 - 14:15 WITA)">13:30 - 14:15 WITA</option>
                <option value="Sesi IV (14:30 - 15:15 WITA)">14:30 - 15:15 WITA</option>
              </SelectField>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
            >
              Konfirmasi Booking Jadwal
            </button>
          </form>
        </Card>
      )}

      <Card>
        <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3 mb-3">
          Konselor Kami
        </h3>
        <div className="space-y-4">
          {COUNSELORS.map(c => (
            <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-slate-900 font-bold">
                {c.name.split(' ')[0][0]}{c.name.split(' ').slice(-1)[0][0]}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                <p className="text-xs text-emerald-600 font-bold">{c.specialty}</p>
                <p className="text-slate-400 text-[10px]">Hari Praktik: {c.availableDays}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 text-xs text-blue-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Info Konseling:</span> Sesi konseling berdurasi 45 menit per sesi dan dapat dilaksanakan secara Luring (di kantor CDC) maupun Daring (via Zoom).
          </div>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label, name, value, onChange, placeholder, error, type = 'text', icon
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <div className="relative">
        {icon && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">{icon}</span>}
        <input
          type={type}
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

function SelectField({
  label, name, value, onChange, error, children, icon
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <div className="relative">
        {icon && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">{icon}</span>}
        <select
          name={name}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm bg-white focus:outline-none ${error ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
    </div>
  );
}
