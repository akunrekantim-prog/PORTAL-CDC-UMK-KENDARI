import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Award, CheckCircle2, Ticket } from 'lucide-react';
import { PageHeader, Card, CtaBlock } from './ui';

export default function Seminar() {
  const [formData, setFormData] = useState({ name: '', nim: '', prodi: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [quota, setQuota] = useState(150);
  const [ticketNum, setTicketNum] = useState('');

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.nim.trim()) newErrors.nim = 'NIM wajib diisi';
    if (!formData.prodi.trim()) newErrors.prodi = 'Program Studi wajib diisi';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor WhatsApp wajib diisi';
    } else if (!/^\d{9,14}$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor HP tidak valid (9-14 digit)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setQuota(q => q - 1);
    setTicketNum('SEM-' + Math.floor(100000 + Math.random() * 900000));
    setIsRegistered(true);
  };

  const handleReset = () => {
    setFormData({ name: '', nim: '', prodi: '', phone: '' });
    setIsRegistered(false);
    setErrors({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-seminar">
      <PageHeader
        badge="Agenda Terdekat"
        title="Seminar Sukses Berkarir"
        description="Ikuti seminar rutin pembekalan karir pasca-kampus bersama narasumber handal, praktisi industri, dan alumni sukses."
        accent="fuchsia"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-fuchsia-500 pl-3">
              Informasi Acara
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <h4 className="font-extrabold text-slate-900 text-sm">
                Seminar Nasional: "Menavigasi Karir di Era Kecerdasan Buatan (AI) 2026"
              </h4>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Bagaimana AI mengubah lansekap dunia kerja dan taktik lulusan perguruan tinggi beradaptasi agar tetap kompetitif.
              </p>

              <div className="pt-2 space-y-3 font-medium text-slate-500">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Kamis, 20 Agustus 2026</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>08:30 - 11:30 WITA</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Auditorium Gdg. Ahmad Dahlan, Lantai 4</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span className="text-emerald-600 font-bold">Gratis & Bersertifikat Resmi CDC</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Kuota Peserta Tersedia:</span>
              <span className="text-fuchsia-600 bg-fuchsia-50 px-2.5 py-1 rounded-full border border-fuchsia-100">
                {quota} Kursi
              </span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card>
            {isRegistered ? (
              <div className="text-center py-6 space-y-6" id="seminar-success-state">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xl">Pendaftaran Seminar Berhasil!</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Anda terdaftar sebagai peserta seminar. Silakan tunjukkan E-Ticket di bawah pada meja registrasi di hari H.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-3xl bg-slate-50/50 p-6 max-w-sm mx-auto relative overflow-hidden font-sans shadow-xs text-left text-xs">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-fuchsia-500" />
                  <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-300">
                    <div>
                      <span className="text-[10px] font-extrabold text-fuchsia-600 tracking-wider">E-TICKET ACARA</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">SEMINAR CDC UMK</h4>
                    </div>
                    <Ticket className="w-6 h-6 text-slate-400" />
                  </div>

                  <div className="py-4 space-y-2.5 font-medium text-slate-700">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400">Kode Tiket:</span>
                      <span className="col-span-2 font-bold text-slate-900 font-mono text-sm">{ticketNum}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400">Peserta:</span>
                      <span className="col-span-2 font-bold text-slate-800">{formData.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400">NIM:</span>
                      <span className="col-span-2 font-bold text-slate-800">{formData.nim}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400">Lokal Sesi:</span>
                      <span className="col-span-2 font-bold text-slate-800">Auditorium / 08:30 WITA</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-col items-center gap-1">
                    <div className="h-6 w-48 bg-slate-300 rounded animate-pulse" />
                    <span className="text-[9px] text-slate-400 font-mono">Scan Barcode untuk Presensi</span>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
                >
                  Registrasi Acara Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="seminar-form">
                <h3 className="font-extrabold text-slate-900 text-lg">Formulir Peserta Seminar</h3>

                <Field label="Nama Lengkap" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nama sesuai KTM" error={errors.name} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="NIM / NIDN" name="nim" value={formData.nim} onChange={handleInputChange} placeholder="Contoh: 202201001" error={errors.nim} />
                  <Field label="Program Studi" name="prodi" value={formData.prodi} onChange={handleInputChange} placeholder="Contoh: Teknik Informatika" error={errors.prodi} />
                </div>
                <Field label="Nomor WhatsApp Aktif" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Contoh: 085241009988" error={errors.phone} />

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                >
                  Kirim Pendaftaran Seminar
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
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
