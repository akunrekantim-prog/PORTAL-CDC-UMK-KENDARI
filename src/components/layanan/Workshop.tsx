import React, { useState } from 'react';
import { Calendar, Users, MapPin, CheckCircle, ArrowRight, Clock } from 'lucide-react';

interface WorkshopItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  location: string;
  quotaLeft: number;
  status: 'active' | 'completed';
}

const INITIAL_WORKSHOPS: WorkshopItem[] = [
  {
    id: 'w1',
    title: 'Sukses Menulis CV ATS-Friendly & Portofolio Menarik',
    speaker: 'Nita Rahayu, S.Psi., CHRP (HR Practitioner)',
    date: '2026-08-10',
    time: '09:00 - 12:00 WITA',
    location: 'Aula Gdg. Rektorat Lt. 3',
    quotaLeft: 25,
    status: 'active',
  },
  {
    id: 'w2',
    title: 'Menguasai Teknik Interview Kerja & Negosiasi Gaji',
    speaker: 'Rahmat Hidayat, M.Si. (Career Advisor)',
    date: '2026-08-15',
    time: '13:30 - 16:30 WITA',
    location: 'Lab. Bahasa, Kampus Utama',
    quotaLeft: 12,
    status: 'active',
  },
  {
    id: 'w3',
    title: 'Strategi Membangun Personal Branding di LinkedIn',
    speaker: 'Alumni Sukses (Software Engineer)',
    date: '2026-07-05',
    time: '09:00 - 11:30 WITA',
    location: 'Online via Zoom Meeting',
    quotaLeft: 0,
    status: 'completed',
  },
];

export default function Workshop() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [formData, setFormData] = useState({ name: '', nim: '', email: '' });
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenRegister = (workshop: WorkshopItem) => {
    setSelectedWorkshop(workshop);
    setFormData({ name: '', nim: '', email: '' });
    setErrors({});
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.nim.trim()) newErrors.nim = 'NIM wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedWorkshop) {
      // Deduct quota
      setWorkshops(prev =>
        prev.map(w => (w.id === selectedWorkshop.id ? { ...w, quotaLeft: w.quotaLeft - 1 } : w))
      );
      setRegisteredIds(prev => [...prev, selectedWorkshop.id]);
      setSelectedWorkshop(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12" id="layanan-workshop">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-bold text-xs uppercase tracking-wider">
          Pelatihan Karir
        </span>
        <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Workshop & Pelatihan Karir</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Tingkatkan kesiapan kerja Anda melalui berbagai program workshop interaktif terstruktur bersama para pemateri andal.
        </p>
      </div>

      {/* Workshop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workshops.map(item => {
          const isRegistered = registeredIds.includes(item.id);
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-6 ${
                isCompleted ? 'opacity-70' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-500'
                        : isRegistered
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-blue-50 text-[#1E3A8A] border border-blue-100'
                    }`}
                  >
                    {isCompleted ? 'Selesai' : isRegistered ? 'Terdaftar' : 'Pendaftaran Buka'}
                  </span>
                  {!isCompleted && (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" /> Sisa Kuota: {item.quotaLeft}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{item.title}</h3>
                <div className="text-xs font-bold text-[#10B981]">Pemateri: {item.speaker}</div>

                {/* Details list */}
                <div className="pt-2 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Tanggal:{' '}
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Waktu: {item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Lokasi: {item.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                {isCompleted ? (
                  <span className="text-xs text-slate-400 font-medium font-mono">
                    Materi & Sertifikat telah dikirim ke peserta.
                  </span>
                ) : isRegistered ? (
                  <div className="text-emerald-600 font-bold text-xs flex items-center gap-1 animate-pulse">
                    <CheckCircle className="w-4 h-4" /> Anda terdaftar untuk workshop ini!
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenRegister(item)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    Daftar Sekarang <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal Overlay */}
      {selectedWorkshop && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]"
          id="workshop-register-modal"
        >
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Registrasi Workshop</h3>
              <p className="text-slate-500 text-xs mt-1 truncate">Workshop: {selectedWorkshop.title}</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                    errors.name ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                  }`}
                  placeholder="Contoh: Ahmad Faisal"
                />
                {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
              </div>

              {/* NIM */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nomor Induk Mahasiswa (NIM)</label>
                <input
                  type="text"
                  required
                  value={formData.nim}
                  onChange={e => handleInputChange('nim', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                    errors.nim ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                  }`}
                  placeholder="Contoh: 202201001"
                />
                {errors.nim && <p className="text-red-500 text-[10px] font-bold">{errors.nim}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Aktif</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                    errors.email ? 'border-red-500' : 'border-slate-200 focus:border-[#10B981]'
                  }`}
                  placeholder="mhs@umkendari.ac.id"
                />
                {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkshop(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#10B981] hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                >
                  Kirim Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
