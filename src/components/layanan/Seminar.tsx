import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Award, CheckCircle2, Ticket } from 'lucide-react';

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

    // Deduct quota, generate random ticket number
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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12" id="layanan-seminar">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Agenda Terdekat
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Seminar Sukses Berkarir</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Ikuti seminar rutin pembekalan karir pasca-kampus bersama narasumber handal, praktisi industri, dan alumni sukses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Seminar Detail Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-rose-500 pl-3">
              Informasi Acara
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-650 text-slate-700">
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
                  <span className="text-[#10B981] font-bold">Gratis &amp; Bersertifikat Resmi CDC</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Kuota Peserta Tersedia:</span>
              <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                {quota} Kursi
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Registration / E-Ticket */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
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

                {/* Printable E-Ticket Widget */}
                <div className="border border-slate-200 rounded-3xl bg-slate-50/50 p-6 max-w-sm mx-auto relative overflow-hidden font-sans shadow-xs text-left text-xs">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
                  <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-350 border-slate-300">
                    <div>
                      <span className="text-[10px] font-extrabold text-rose-600 tracking-wider">E-TICKET ACARA</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">SEMINAR CDC UMK</h4>
                    </div>
                    <Ticket className="w-6 h-6 text-slate-400" />
                  </div>

                  <div className="py-4 space-y-2.5 font-medium text-slate-650">
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
                    <span className="text-[9px] text-slate-450 font-mono">Scan Barcode untuk Presensi</span>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
                >
                  Registrasi Acara Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="seminar-form">
                <h3 className="font-extrabold text-slate-900 text-lg">Formulir Peserta Seminar</h3>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Nama sesuai KTM"
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

                  {/* Prodi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Program Studi</label>
                    <input
                      type="text"
                      required
                      value={formData.prodi}
                      onChange={e => handleInputChange('prodi', e.target.value)}
                      placeholder="Contoh: Teknik Informatika"
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                        errors.prodi ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                      }`}
                    />
                    {errors.prodi && <p className="text-red-500 text-[10px] font-bold">{errors.prodi}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="Contoh: 085241009988"
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                      errors.phone ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] font-bold">{errors.phone}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#10B981] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                >
                  Kirim Pendaftaran Seminar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
