/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Register Component — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Modern, responsive registration module supporting two account types:
 *   1. User (Mahasiswa / Lulusan UM Kendari)
 *   2. Perusahaan / Mitra (Employer / Recruiter)
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BookOpen,
  MapPin,
  Globe,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerUser, RegisterAlumniPayload, RegisterMitraPayload } from '../data';

interface RegisterProps {
  initialTab?: 'alumni' | 'perusahaan';
  onNavigateToLogin: () => void;
  onNavigateHome: () => void;
  onRegisterSuccess?: (user: any) => void;
}

const FAKULTAS_LIST = [
  'Fakultas Teknik',
  'Fakultas Ekonomi dan Bisnis Islam',
  'Fakultas Keguruan dan Ilmu Pendidikan',
  'Fakultas Hukum',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Pertanian',
  'Fakultas Agama Islam',
  'Lainnya'
];

const PRODI_MAP: Record<string, string[]> = {
  'Fakultas Teknik': ['Teknik Informatika', 'Sistem Informasi', 'Teknik Sipil', 'Teknik Arsitektur', 'Lainnya'],
  'Fakultas Ekonomi dan Bisnis Islam': ['Manajemen', 'Akuntansi', 'Bisnis Digital', 'Lainnya'],
  'Fakultas Keguruan dan Ilmu Pendidikan': ['Pendidikan Bahasa Inggris', 'Administrasi Pendidikan', 'Pendidikan Masyarakat', 'Lainnya'],
  'Fakultas Hukum': ['Ilmu Hukum', 'Lainnya'],
  'Fakultas Ilmu Sosial dan Ilmu Politik': ['Ilmu Pemerintahan', 'Lainnya'],
  'Fakultas Pertanian': ['Agribisnis', 'Kehutanan', 'Lainnya'],
  'Fakultas Agama Islam': ['Pendidikan Agama Islam', 'Hukum Ekonomi Syariah', 'Lainnya'],
  'Lainnya': ['Program Studi Lainnya']
};

const INDUSTRI_LIST = [
  'Teknologi Informasi & Komunikasi (TIK / Software)',
  'Perbankan, Keuangan & Asuransi',
  'Pertambangan, Energi & Sumber Daya Alam',
  'Pendidikan, Riset & Pelatihan',
  'Kesehatan, Rumah Sakit & Farmasi',
  'Retail, Perdagangan & E-Commerce',
  'Manufaktur, Transportasi & Logistik',
  'Pemerintahan / BUMN / BUMD / Instansi Publik',
  'NGO / Yayasan / Nirlaba',
  'Lainnya'
];

export default function Register({
  initialTab = 'alumni',
  onNavigateToLogin,
  onNavigateHome,
  onRegisterSuccess
}: RegisterProps) {
  const [activeTab, setActiveTab] = useState<'alumni' | 'perusahaan'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successUser, setSuccessUser] = useState<any | null>(null);

  // Sync state if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMsg('');
    setSuccessUser(null);
  }, [initialTab]);

  // Alumni Form State
  const [alumniForm, setAlumniForm] = useState({
    name: '',
    nim: '',
    email: '',
    phone: '',
    fakultas: 'Fakultas Teknik',
    programStudi: 'Teknik Informatika',
    tahunLulus: new Date().getFullYear().toString(),
    statusPekerjaan: 'belum_bekerja' as 'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja',
    password: '',
    confirmPassword: ''
  });

  // Mitra Form State
  const [mitraForm, setMitraForm] = useState({
    namaInstansi: '',
    kontakPerson: '',
    email: '',
    phone: '',
    bidangIndustri: 'Teknologi Informasi & Komunikasi (TIK / Software)',
    alamat: '',
    website: '',
    password: '',
    confirmPassword: ''
  });

  // Handle Faculty change to reset prodi to first item
  const handleFakultasChange = (fakultas: string) => {
    const prodis = PRODI_MAP[fakultas] || ['Lainnya'];
    setAlumniForm(prev => ({
      ...prev,
      fakultas,
      programStudi: prodis[0]
    }));
  };

  const validateAlumni = (): boolean => {
    if (!alumniForm.name.trim() || !alumniForm.nim.trim() || !alumniForm.email.trim() || !alumniForm.password) {
      setErrorMsg('Harap lengkapi seluruh kolom wajib (*).');
      return false;
    }
    if (!alumniForm.email.includes('@') || !alumniForm.email.includes('.')) {
      setErrorMsg('Format email tidak valid.');
      return false;
    }
    if (alumniForm.password !== alumniForm.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return false;
    }
    if (alumniForm.password.length < 6) {
      setErrorMsg('Password minimal terdiri dari 6 karakter.');
      return false;
    }
    return true;
  };

  const validateMitra = (): boolean => {
    if (!mitraForm.namaInstansi.trim() || !mitraForm.kontakPerson.trim() || !mitraForm.email.trim() || !mitraForm.password) {
      setErrorMsg('Harap lengkapi seluruh kolom wajib (*).');
      return false;
    }
    if (!mitraForm.email.includes('@') || !mitraForm.email.includes('.')) {
      setErrorMsg('Format email perusahaan tidak valid.');
      return false;
    }
    if (mitraForm.password !== mitraForm.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return false;
    }
    if (mitraForm.password.length < 6) {
      setErrorMsg('Password minimal terdiri dari 6 karakter.');
      return false;
    }
    return true;
  };

  const handleSubmitAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateAlumni()) return;

    setIsLoading(true);
    try {
      // Simulate slight network delay for realistic UX animation
      await new Promise(r => setTimeout(r, 600));

      const payload: RegisterAlumniPayload = {
        name: alumniForm.name.trim(),
        nim: alumniForm.nim.trim(),
        email: alumniForm.email.trim(),
        phone: alumniForm.phone.trim(),
        fakultas: alumniForm.fakultas,
        programStudi: alumniForm.programStudi,
        tahunLulus: alumniForm.tahunLulus,
        statusPekerjaan: alumniForm.statusPekerjaan
      };

      const user = registerUser('alumni', payload);
      setSuccessUser(user);
      if (onRegisterSuccess) onRegisterSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMitra = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateMitra()) return;

    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));

      const payload: RegisterMitraPayload = {
        namaInstansi: mitraForm.namaInstansi.trim(),
        kontakPerson: mitraForm.kontakPerson.trim(),
        email: mitraForm.email.trim(),
        phone: mitraForm.phone.trim(),
        bidangIndustri: mitraForm.bidangIndustri,
        alamat: mitraForm.alamat.trim(),
        website: mitraForm.website.trim()
      };

      const user = registerUser('mitra', payload);
      setSuccessUser(user);
      if (onRegisterSuccess) onRegisterSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran mitra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center items-center font-sans" id="register-module-root">

      {/* Top Breadcrumb / Home Button */}
      <div className="max-w-xl w-full mb-4 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition hover:border-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
        </button>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Portal Terintegrasi CDC
        </div>
      </div>

      <div className="bg-white max-w-xl w-full rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative" id="register-card-container">

        {/* Card Header Banner */}
        <div className="bg-[#0F1F4B] p-8 text-white relative overflow-hidden" id="register-header-banner">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-emerald-400 text-[11px] font-bold tracking-wider uppercase border border-white/10">
              <Sparkles className="w-3.5 h-3.5" /> Pendaftaran Akun Baru
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Sistem Registrasi CDC
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
              Bergabunglah dengan ekosistem karir & user Universitas Muhammadiyah Kendari untuk akses lowongan kerja, magang, dan tracer study.
            </p>
          </div>
        </div>

        {/* Success Screen (Rendered when registration succeeds) */}
        <AnimatePresence mode="wait">
          {successUser ? (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 sm:p-10 text-center space-y-6"
              id="register-success-view"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Registrasi Berhasil!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Selamat datang di Portal CDC UM Kendari, <strong className="text-slate-900 font-bold">{successUser.name}</strong>.
                  Akun Anda telah terdaftar sebagai <span className="uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{successUser.role}</span>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs text-slate-500 space-y-1.5 text-left max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5 font-mono">
                  <span>ID Pengguna:</span>
                  <span className="font-bold text-slate-800">{successUser.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 py-1.5 font-mono">
                  <span>Email Terdaftar:</span>
                  <span className="font-bold text-slate-800">{successUser.email}</span>
                </div>
                <div className="flex justify-between pt-1.5 font-mono">
                  <span>Status Akun:</span>
                  <span className="font-bold text-emerald-600">AKTIF (Siap Login)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  Masuk (Login) Ke Portal Now <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition"
                >
                  Kembali Ke Beranda
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 sm:p-8 space-y-6"
            >
              {/* Tab Selector Switcher */}
              <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-slate-200/70" id="register-tab-switcher">
                <button
                  type="button"
                  onClick={() => { setActiveTab('alumni'); setErrorMsg(''); }}
                  className={[
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all',
                    activeTab === 'alumni'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  ].join(' ')}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Register User</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('perusahaan'); setErrorMsg(''); }}
                  className={[
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all',
                    activeTab === 'perusahaan'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  ].join(' ')}
                >
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Register Perusahaan</span>
                </button>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 text-xs flex items-start gap-2.5 shadow-2xs animate-shake" id="register-error-msg">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMsg}</div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  FORM A: REGISTER USER
              ══════════════════════════════════════════════════════════ */}
              {activeTab === 'alumni' && (
                <form onSubmit={handleSubmitAlumni} className="space-y-4" id="form-register-user">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Diperuntukkan bagi mahasiswa aktif tingkat akhir atau lulusan (user) UM Kendari.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><User className="w-4 h-4" /></span>
                        <input
                          type="text"
                          required
                          value={alumniForm.name}
                          onChange={(e) => setAlumniForm({ ...alumniForm, name: e.target.value })}
                          placeholder="Contoh: Muhammad Fadly, S.Kom."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* NIM */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">NIM (Nomor Induk Mahasiswa) *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><BookOpen className="w-4 h-4" /></span>
                        <input
                          type="text"
                          required
                          value={alumniForm.nim}
                          onChange={(e) => setAlumniForm({ ...alumniForm, nim: e.target.value })}
                          placeholder="Contoh: 202101001"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fakultas */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Fakultas *</label>
                      <select
                        value={alumniForm.fakultas}
                        onChange={(e) => handleFakultasChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      >
                        {FAKULTAS_LIST.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Program Studi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Program Studi *</label>
                      <select
                        value={alumniForm.programStudi}
                        onChange={(e) => setAlumniForm({ ...alumniForm, programStudi: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      >
                        {(PRODI_MAP[alumniForm.fakultas] || ['Lainnya']).map(prodi => (
                          <option key={prodi} value={prodi}>{prodi}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tahun Lulus */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Tahun Lulus / Angkatan *</label>
                      <select
                        value={alumniForm.tahunLulus}
                        onChange={(e) => setAlumniForm({ ...alumniForm, tahunLulus: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      >
                        {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                          <option key={year} value={year.toString()}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Pekerjaan Awal */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Status Karir Saat Ini *</label>
                      <select
                        value={alumniForm.statusPekerjaan}
                        onChange={(e) => setAlumniForm({ ...alumniForm, statusPekerjaan: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      >
                        <option value="belum_bekerja">Belum Bekerja / Mencari Kerja</option>
                        <option value="bekerja">Bekerja (Karyawan/PNS/Swasta)</option>
                        <option value="wirausaha">Wirausaha / Entrepreneur</option>
                        <option value="lanjut_studi">Lanjut Studi (S2/Profesi)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Aktif *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Mail className="w-4 h-4" /></span>
                        <input
                          type="email"
                          required
                          value={alumniForm.email}
                          onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })}
                          placeholder="mhs@umkendari.ac.id"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Phone / WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Phone className="w-4 h-4" /></span>
                        <input
                          type="tel"
                          value={alumniForm.phone}
                          onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })}
                          placeholder="08524100XXXX"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Kata Sandi (Password) *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-4 h-4" /></span>
                        <input
                          type="password"
                          required
                          value={alumniForm.password}
                          onChange={(e) => setAlumniForm({ ...alumniForm, password: e.target.value })}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Konfirmasi Password *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-4 h-4" /></span>
                        <input
                          type="password"
                          required
                          value={alumniForm.confirmPassword}
                          onChange={(e) => setAlumniForm({ ...alumniForm, confirmPassword: e.target.value })}
                          placeholder="Ulangi password di atas"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Memproses Registrasi User...
                        </>
                      ) : (
                        <>
                          Daftarkan Akun User Sekarang <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ══════════════════════════════════════════════════════════
                  FORM B: REGISTER PERUSAHAAN / MITRA
              ══════════════════════════════════════════════════════════ */}
              {activeTab === 'perusahaan' && (
                <form onSubmit={handleSubmitMitra} className="space-y-4" id="form-register-mitra">
                  <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-2xl text-xs text-blue-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Diperuntukkan bagi HRD, Recruiter, atau Perusahaan yang ingin memasang lowongan di UM Kendari.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Perusahaan / Instansi *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Building2 className="w-4 h-4" /></span>
                        <input
                          type="text"
                          required
                          value={mitraForm.namaInstansi}
                          onChange={(e) => setMitraForm({ ...mitraForm, namaInstansi: e.target.value })}
                          placeholder="PT Go Digital Indonesia"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* HR Contact Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama HR / Penanggung Jawab *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><User className="w-4 h-4" /></span>
                        <input
                          type="text"
                          required
                          value={mitraForm.kontakPerson}
                          onChange={(e) => setMitraForm({ ...mitraForm, kontakPerson: e.target.value })}
                          placeholder="Budi Setiawan (HR Manager)"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bidang Industri */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Sektor Industri *</label>
                      <select
                        value={mitraForm.bidangIndustri}
                        onChange={(e) => setMitraForm({ ...mitraForm, bidangIndustri: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      >
                        {INDUSTRI_LIST.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    {/* Corporate Phone / WA */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">No. WhatsApp / Telepon HR</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Phone className="w-4 h-4" /></span>
                        <input
                          type="tel"
                          value={mitraForm.phone}
                          onChange={(e) => setMitraForm({ ...mitraForm, phone: e.target.value })}
                          placeholder="08129999XXXX / (0401) XXXX"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Corporate Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Perusahaan / HR *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Mail className="w-4 h-4" /></span>
                        <input
                          type="email"
                          required
                          value={mitraForm.email}
                          onChange={(e) => setMitraForm({ ...mitraForm, email: e.target.value })}
                          placeholder="hrd@perusahaan.co.id"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Website Perusahaan (Opsional)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Globe className="w-4 h-4" /></span>
                        <input
                          type="text"
                          value={mitraForm.website}
                          onChange={(e) => setMitraForm({ ...mitraForm, website: e.target.value })}
                          placeholder="https://www.perusahaan.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Kantor Perusahaan / Cabang</label>
                    <div className="relative">
                      <span className="absolute top-3 left-0 pl-3.5 flex items-center text-slate-400"><MapPin className="w-4 h-4" /></span>
                      <textarea
                        rows={2}
                        value={mitraForm.alamat}
                        onChange={(e) => setMitraForm({ ...mitraForm, alamat: e.target.value })}
                        placeholder="Jl. Jenderal Sudirman No. X, Kendari, Sultra"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Kata Sandi (Password) *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-4 h-4" /></span>
                        <input
                          type="password"
                          required
                          value={mitraForm.password}
                          onChange={(e) => setMitraForm({ ...mitraForm, password: e.target.value })}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Konfirmasi Password *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-4 h-4" /></span>
                        <input
                          type="password"
                          required
                          value={mitraForm.confirmPassword}
                          onChange={(e) => setMitraForm({ ...mitraForm, confirmPassword: e.target.value })}
                          placeholder="Ulangi password di atas"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Memproses Registrasi Mitra...
                        </>
                      ) : (
                        <>
                          Daftarkan Akun Mitra Karir <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Footer navigation link */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Sudah memiliki akun di Portal?</span>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                >
                  Masuk (Login) Sekarang →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Footer copyright note */}
      <div className="mt-6 text-center text-[11px] text-slate-400 font-mono">
        CDC UM Kendari · Hak Cipta Dilindungi Undang-Undang © 2026
      </div>
    </div>
  );
}
