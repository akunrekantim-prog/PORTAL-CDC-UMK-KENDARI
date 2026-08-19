/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Register Component — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Clean, professional, institutional registration page matching
 * top-tier university portal standards.
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  Globe,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap
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
  'Fakultas Perikanan dan Ilmu Kelautan',
  'Fakultas Agama Islam',
  'Program Pascasarjana (S2)',
  'Lainnya'
];

const PRODI_MAP: Record<string, string[]> = {
  'Fakultas Teknik': [
    'Teknik Informatika',
    'Sistem Informasi',
    'Teknik Sipil',
    'Teknik Arsitektur',
    'Teknik Lingkungan',
    'Lainnya'
  ],
  'Fakultas Ekonomi dan Bisnis Islam': [
    'Manajemen',
    'Akuntansi',
    'Bisnis Digital',
    'Perbankan Syariah',
    'Ekonomi Islam',
    'Lainnya'
  ],
  'Fakultas Keguruan dan Ilmu Pendidikan': [
    'Pendidikan Bahasa Inggris',
    'Pendidikan Guru Pendidikan Anak Usia Dini (PG-PAUD)',
    'Pendidikan Guru Sekolah Dasar (PGSD)',
    'Pendidikan Teknologi Informasi',
    'Administrasi Pendidikan',
    'Pendidikan Luar Sekolah (Pendidikan Masyarakat)',
    'Lainnya'
  ],
  'Fakultas Hukum': [
    'Ilmu Hukum',
    'Lainnya'
  ],
  'Fakultas Ilmu Sosial dan Ilmu Politik': [
    'Ilmu Pemerintahan',
    'Ilmu Komunikasi',
    'Lainnya'
  ],
  'Fakultas Pertanian': [
    'Agribisnis',
    'Kehutanan',
    'Teknologi Hasil Pertanian',
    'Lainnya'
  ],
  'Fakultas Perikanan dan Ilmu Kelautan': [
    'Pemanfaatan Sumberdaya Perikanan',
    'Akuakultur',
    'Lainnya'
  ],
  'Fakultas Agama Islam': [
    'Pendidikan Agama Islam',
    'Hukum Ekonomi Syariah (Muamalah)',
    'Pendidikan Islam Anak Usia Dini',
    'Komunikasi dan Penyiaran Islam',
    'Lainnya'
  ],
  'Program Pascasarjana (S2)': [
    'Magister Manajemen (MM)',
    'Magister Pendidikan Agama Islam',
    'Magister Hukum',
    'Lainnya'
  ],
  'Lainnya': [
    'Program Studi Lainnya'
  ]
};

const INDUSTRI_LIST = [
  'Teknologi Informasi, Software & Telekomunikasi',
  'Perbankan, Keuangan & Asuransi',
  'Pertambangan, Energi & Sumber Daya Mineral',
  'Pendidikan, Riset, Akademi & Pelatihan',
  'Kesehatan, Rumah Sakit & Farmasi',
  'Retail, FMCG, Perdagangan & E-Commerce',
  'Manufaktur, Otomotif, Logistik & Distribusi',
  'Konstruksi, Properti & Real Estate',
  'Pertanian, Kehutanan & Perikanan',
  'Media, Kreatif, Advertising & Broadcasting',
  'Pemerintahan / BUMN / BUMD / Lembaga Publik',
  'Lembaga Nirlaba, NGO & Yayasan Sosial',
  'Lainnya'
];

export default function Register({
  initialTab = 'alumni',
  onNavigateToLogin,
  onNavigateHome,
  onRegisterSuccess
}: RegisterProps) {
  const [isEnteringForm, setIsEnteringForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'alumni' | 'perusahaan'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successUser, setSuccessUser] = useState<any | null>(null);

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Terms Agreement State
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    fakultas: '',
    programStudi: '',
    tahunLulus: '',
    statusPekerjaan: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Mitra Form State
  const [mitraForm, setMitraForm] = useState({
    namaInstansi: '',
    kontakPerson: '',
    bidangIndustri: '',
    jabatanKontak: '',
    email: '',
    phone: '',
    website: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });

  // Handle Faculty change to reset prodi
  const handleFakultasChange = (fakultas: string) => {
    setAlumniForm(prev => ({
      ...prev,
      fakultas,
      programStudi: ''
    }));
  };

  const validateAlumni = (): boolean => {
    if (
      !alumniForm.name.trim() ||
      !alumniForm.nim.trim() ||
      !alumniForm.fakultas ||
      !alumniForm.programStudi ||
      !alumniForm.tahunLulus ||
      !alumniForm.statusPekerjaan ||
      !alumniForm.email.trim() ||
      !alumniForm.phone.trim() ||
      !alumniForm.password
    ) {
      setErrorMsg('Harap lengkapi seluruh kolom yang bertanda bintang (*).');
      return false;
    }
    if (!alumniForm.email.includes('@') || !alumniForm.email.includes('.')) {
      setErrorMsg('Format alamat email tidak valid.');
      return false;
    }
    if (alumniForm.password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
      return false;
    }
    if (alumniForm.password !== alumniForm.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.');
      return false;
    }
    if (!agreedToTerms) {
      setErrorMsg('Anda wajib menyetujui Ketentuan Layanan dan Kebijakan Privasi sebelum mendaftar.');
      return false;
    }
    return true;
  };

  const validateMitra = (): boolean => {
    if (
      !mitraForm.namaInstansi.trim() ||
      !mitraForm.kontakPerson.trim() ||
      !mitraForm.bidangIndustri ||
      !mitraForm.jabatanKontak.trim() ||
      !mitraForm.email.trim() ||
      !mitraForm.phone.trim() ||
      !mitraForm.alamat.trim() ||
      !mitraForm.password
    ) {
      setErrorMsg('Harap lengkapi seluruh kolom yang bertanda bintang (*).');
      return false;
    }
    if (!mitraForm.email.includes('@') || !mitraForm.email.includes('.')) {
      setErrorMsg('Format email instansi/perusahaan tidak valid.');
      return false;
    }
    if (mitraForm.password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
      return false;
    }
    if (mitraForm.password !== mitraForm.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.');
      return false;
    }
    if (!agreedToTerms) {
      setErrorMsg('Anda wajib menyetujui Ketentuan Layanan dan Kebijakan Privasi sebelum mendaftar.');
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
      await new Promise(r => setTimeout(r, 600));

      const payload: RegisterAlumniPayload = {
        name: alumniForm.name.trim(),
        nim: alumniForm.nim.trim().toUpperCase(),
        email: alumniForm.email.trim(),
        phone: alumniForm.phone.trim(),
        fakultas: alumniForm.fakultas,
        programStudi: alumniForm.programStudi,
        tahunLulus: alumniForm.tahunLulus,
        statusPekerjaan: alumniForm.statusPekerjaan as any
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
        kontakPerson: mitraForm.jabatanKontak
          ? `${mitraForm.kontakPerson.trim()} (${mitraForm.jabatanKontak.trim()})`
          : mitraForm.kontakPerson.trim(),
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

  // ═════════════════════════════════════════════════════════════════════════
  // 1. HERO VIEW (SPLIT 50/50 BEFORE USER CLICKS REGISTER BUTTON)
  // ═════════════════════════════════════════════════════════════════════════
  if (!isEnteringForm && !successUser) {
    return (
      <div
        className="relative min-h-screen w-full flex flex-col lg:flex-row font-sans bg-slate-950 text-slate-800 overflow-x-hidden"
        id="register-hero-root"
      >
        {/* Fullscreen Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/bg-gedung-umk.jpg"
            alt="Gedung Rektorat Universitas Muhammadiyah Kendari"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/bg-gedung-umk.png';
            }}
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[0.5px]" />
        </div>

        {/* Left Column: Branding Section */}
        <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white min-h-[50vh] lg:min-h-screen">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-xs"
              id="register-back-home-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>

          {/* Main Branding Content (Left-aligned, positioned nicely towards the center) */}
          <div className="my-auto py-8 space-y-6 max-w-xl mx-auto w-full px-2 sm:px-6 flex flex-col items-start text-left">
            {/* Official Logos Group */}
            <div className="flex items-center gap-3 sm:gap-4 w-fit">
              <img
                src="/logo-umk.png"
                alt="Logo Universitas Muhammadiyah Kendari"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
              />
              <div className="h-8 w-px bg-white/40"></div>
              <img
                src="/logo-cdc-transparent.png"
                alt="Logo Career Development Center UMK"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
              />
            </div>

            <div className="space-y-3 text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                REGISTRASI <span className="text-amber-400">CDC UMK</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal">
                Daftarkan diri Anda untuk mengakses <strong className="text-amber-300 font-semibold">Peluang Karir, Program Magang Bersertifikat, Pelatihan Karir, dan Pengisian Tracer Study</strong> Universitas Muhammadiyah Kendari.
              </p>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-300/80 space-y-2 border-t border-white/10 max-w-xl mx-auto w-full px-2 sm:px-6 text-left">
            <p>
              Made with ❤️ and ☕ by <span className="text-amber-300 font-semibold">Direktorat & Tim CDC Universitas Muhammadiyah Kendari</span>
            </p>
            <div className="flex flex-wrap items-center justify-start gap-4 text-slate-300 text-xs">
              <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-white underline transition">
                Terms & Conditions
              </a>
              <span>•</span>
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-white underline transition">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="mailto:helpdesk@umkendari.ac.id" className="hover:text-white transition flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> helpdesk@umkendari.ac.id
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Straight White Panel */}
        <div className="relative z-10 w-full lg:w-[480px] xl:w-[540px] bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen lg:rounded-l-3xl border-l border-slate-100">
          <div className="h-6"></div>

          <div className="my-auto py-6 space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                REGISTER
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pilih Tipe Pendaftaran Akun Portal CDC
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Option 1: Register Alumni / Mahasiswa */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('alumni');
                  setIsEnteringForm(true);
                }}
                className="w-full bg-[#0077C6] hover:bg-[#005FA0] active:bg-[#004C80] text-white font-bold py-4 px-6 rounded-2xl text-sm sm:text-base transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer text-center"
                id="register-hero-alumni-btn"
              >
                <span>Daftar Mahasiswa / Alumni</span>
              </button>

              {/* Option 2: Register Mitra Perusahaan */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('perusahaan');
                  setIsEnteringForm(true);
                }}
                className="w-full py-4 px-6 rounded-2xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-sm sm:text-base transition duration-150 shadow-xs hover:shadow-md flex items-center justify-center cursor-pointer text-center"
                id="register-hero-mitra-btn"
              >
                <span>Daftar Mitra Perusahaan</span>
              </button>

              {/* Divider: Atau */}
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Atau
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Under-Action Login Link */}
              <div className="text-center text-xs text-slate-600 space-y-3">
                <div>
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="font-bold text-[#0077C6] hover:text-[#005FA0] hover:underline cursor-pointer"
                    id="register-hero-goto-login-btn"
                  >
                    Login Sekarang
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="text-slate-400 hover:text-slate-700 hover:underline cursor-pointer transition text-[11px]"
                  >
                    &larr; Kembali ke Beranda Portal
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
            © {new Date().getFullYear()} Career Development Center — Universitas Muhammadiyah Kendari
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. FULL REGISTRATION FORM VIEW (WHEN REGISTER BUTTON IS CLICKED)
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans flex flex-col justify-between" id="register-page-root">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Official CDC Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              aria-label="Beranda CDC UM Kendari"
            >
              <img
                src="/logo-cdc-branding-transparent.png"
                alt="Career Development Center - Universitas Muhammadiyah Kendari"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </button>
          </div>

          {/* Right link: Back to Hero / Login */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEnteringForm(false)}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Pilihan Akun</span>
            </button>
            <span className="text-slate-200">|</span>
            <button
              onClick={onNavigateToLogin}
              className="text-sm font-bold text-[#00186B] hover:text-[#000E3D] hover:underline transition cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full mx-auto space-y-6">



          <AnimatePresence mode="wait">
            {/* ═════════════════════════════════════════════════════════
                VIEW STATE: REGISTRATION SUCCESS
            ═════════════════════════════════════════════════════════ */}
            {successUser ? (
              <motion.div
                key="success-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto"
                id="register-success-view"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Registrasi Berhasil!
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Selamat datang di Portal CDC UM Kendari, <strong className="text-slate-900 font-bold">{successUser.name}</strong>.
                    Akun Anda telah terdaftar dan siap digunakan.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 divide-y divide-slate-100 text-left">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Email Akun:</span>
                    <span className="font-bold text-slate-900 font-mono">{successUser.email}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Tipe Akun:</span>
                    <span className="font-bold text-blue-900 uppercase">
                      {successUser.role === 'alumni' ? 'Mahasiswa / Alumni' : 'Mitra Perusahaan'}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Status Akun:</span>
                    <span className="font-bold text-emerald-600">AKTIF (Siap Digunakan)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="flex-1 bg-[#00186B] hover:bg-[#000E3D] text-white font-bold py-3.5 px-6 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Login Sekarang <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-lg text-sm border border-slate-200 transition text-center cursor-pointer"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                {/* Title & Subtitle */}
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {activeTab === 'alumni' ? 'Daftar Akun' : 'Registrasi Mitra Perusahaan'}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {activeTab === 'alumni'
                      ? 'Lengkapi data berikut untuk membuat akun Portal CDC Universitas Muhammadiyah Kendari.'
                      : 'Daftarkan akun perusahaan, instansi, atau recruiter Anda untuk mempublikasikan informasi lowongan kerja dan menemukan talenta lulusan terbaik.'}
                  </p>
                </div>

                {/* Main White Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6">

                  {/* Error Alert Box */}
                  {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{errorMsg}</div>
                    </div>
                  )}

                  {/* ───────────────────────────────────────────────────
                      FORM 1: MAHASISWA & ALUMNI
                  ─────────────────────────────────────────────────── */}
                  {activeTab === 'alumni' && (
                    <form onSubmit={handleSubmitAlumni} className="space-y-5" id="form-register-user">
                      
                      {/* Row 1: Nama Lengkap & NIM */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Nama Lengkap (beserta gelar jika ada) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={alumniForm.name}
                            onChange={(e) => setAlumniForm({ ...alumniForm, name: e.target.value })}
                            placeholder="Contoh: Muhammad Fadly, S.Kom."
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            NIM <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={alumniForm.nim}
                            onChange={(e) => setAlumniForm({ ...alumniForm, nim: e.target.value })}
                            placeholder="Contoh: 202101001"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] font-mono transition"
                          />
                        </div>
                      </div>

                      {/* Row 2: Fakultas, Program Studi, Tahun Angkatan */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Fakultas <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={alumniForm.fakultas}
                            onChange={(e) => handleFakultasChange(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition cursor-pointer"
                          >
                            <option value="" disabled>Pilih Fakultas</option>
                            {FAKULTAS_LIST.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Program Studi <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={alumniForm.programStudi}
                            onChange={(e) => setAlumniForm({ ...alumniForm, programStudi: e.target.value })}
                            disabled={!alumniForm.fakultas}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                          >
                            <option value="" disabled>Pilih Program Studi</option>
                            {(PRODI_MAP[alumniForm.fakultas] || ['Lainnya']).map(prodi => (
                              <option key={prodi} value={prodi}>{prodi}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Tahun Angkatan / Kelulusan <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={alumniForm.tahunLulus}
                            onChange={(e) => setAlumniForm({ ...alumniForm, tahunLulus: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition cursor-pointer"
                          >
                            <option value="" disabled>Pilih Tahun</option>
                            {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                              <option key={year} value={year.toString()}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Status Karir Saat Ini */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Status Karir Saat Ini <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={alumniForm.statusPekerjaan}
                            onChange={(e) => setAlumniForm({ ...alumniForm, statusPekerjaan: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition cursor-pointer"
                          >
                            <option value="" disabled>Pilih Status</option>
                            <option value="belum_bekerja">Belum Bekerja / Sedang Mencari Kerja</option>
                            <option value="bekerja">Bekerja (Karyawan Swasta / BUMN / PNS)</option>
                            <option value="wirausaha">Wirausaha / Membuka Usaha Mandiri</option>
                            <option value="lanjut_studi">Melanjutkan Studi (S2 / Profesi)</option>
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-2"></div>

                      {/* Row 4: Email Aktif & Nomor WhatsApp */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Email Aktif <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Mail className="w-4 h-4" />
                            </span>
                            <input
                              type="email"
                              required
                              value={alumniForm.email}
                              onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })}
                              placeholder="nama@umkendari.ac.id"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Phone className="w-4 h-4" />
                            </span>
                            <input
                              type="tel"
                              required
                              value={alumniForm.phone}
                              onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })}
                              placeholder="0852-XXXX-XXXX"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] font-mono transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 5: Kata Sandi & Konfirmasi Kata Sandi */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Kata Sandi <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={alumniForm.password}
                              onChange={(e) => setAlumniForm({ ...alumniForm, password: e.target.value })}
                              placeholder="Minimal 6 karakter"
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={alumniForm.confirmPassword}
                              onChange={(e) => setAlumniForm({ ...alumniForm, confirmPassword: e.target.value })}
                              placeholder="Ulangi kata sandi"
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Agreement Checkbox */}
                      <div className="pt-2">
                        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00186B] focus:ring-[#00186B] cursor-pointer"
                          />
                          <span>
                            Saya menyetujui <span className="text-blue-600 hover:underline font-medium">Ketentuan Layanan</span> dan <span className="text-blue-600 hover:underline font-medium">Kebijakan Privasi</span> Portal CDC Universitas Muhammadiyah Kendari.
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#00186B] hover:bg-[#000E3D] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-lg text-sm transition duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Memproses Pendaftaran...
                            </>
                          ) : (
                            'Daftar Akun'
                          )}
                        </button>
                      </div>

                      {/* Under-Card Link */}
                      <div className="pt-2 text-center text-xs text-slate-600">
                        Sudah memiliki akun?{' '}
                        <button
                          type="button"
                          onClick={onNavigateToLogin}
                          className="font-bold text-[#00186B] hover:underline cursor-pointer"
                        >
                          Login
                        </button>
                      </div>

                    </form>
                  )}

                  {/* ───────────────────────────────────────────────────
                      FORM 2: MITRA PERUSAHAAN
                  ─────────────────────────────────────────────────── */}
                  {activeTab === 'perusahaan' && (
                    <form onSubmit={handleSubmitMitra} className="space-y-5" id="form-register-mitra">
                      
                      {/* Top Info Banner */}
                      <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900 flex items-center gap-2.5">
                        <Info className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Diperuntukkan bagi HRD, Recruiter, atau Perusahaan yang ingin memasang lowongan di UM Kendari.</span>
                      </div>

                      {/* Row 1: Nama Perusahaan & Nama HR */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Nama Perusahaan / Instansi <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Building2 className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              value={mitraForm.namaInstansi}
                              onChange={(e) => setMitraForm({ ...mitraForm, namaInstansi: e.target.value })}
                              placeholder="Contoh: PT Go Digital Indonesia"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Nama HR / Penanggung Jawab <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              value={mitraForm.kontakPerson}
                              onChange={(e) => setMitraForm({ ...mitraForm, kontakPerson: e.target.value })}
                              placeholder="Contoh: Budi Setiawan (HR Manager)"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Sektor Industri & Jabatan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Sektor Industri <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={mitraForm.bidangIndustri}
                            onChange={(e) => setMitraForm({ ...mitraForm, bidangIndustri: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition cursor-pointer"
                          >
                            <option value="" disabled>Pilih Sektor Industri</option>
                            {INDUSTRI_LIST.map(ind => (
                              <option key={ind} value={ind}>{ind}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Jabatan <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              value={mitraForm.jabatanKontak}
                              onChange={(e) => setMitraForm({ ...mitraForm, jabatanKontak: e.target.value })}
                              placeholder="Contoh: HR Manager / Talent Acquisition"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Email Perusahaan & No. WhatsApp / Telepon */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Email Perusahaan / HR <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Mail className="w-4 h-4" />
                            </span>
                            <input
                              type="email"
                              required
                              value={mitraForm.email}
                              onChange={(e) => setMitraForm({ ...mitraForm, email: e.target.value })}
                              placeholder="Contoh: hrd@perusahaan.co.id"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            No. WhatsApp / Telepon HR <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Phone className="w-4 h-4" />
                            </span>
                            <input
                              type="tel"
                              required
                              value={mitraForm.phone}
                              onChange={(e) => setMitraForm({ ...mitraForm, phone: e.target.value })}
                              placeholder="Contoh: 0812 9999 XXXX"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] font-mono transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 4: Website & Alamat */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Website Perusahaan (Opsional)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Globe className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              value={mitraForm.website}
                              onChange={(e) => setMitraForm({ ...mitraForm, website: e.target.value })}
                              placeholder="Contoh: https://www.perusahaan.com"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Alamat Kantor Perusahaan / Cabang <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <MapPin className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              value={mitraForm.alamat}
                              onChange={(e) => setMitraForm({ ...mitraForm, alamat: e.target.value })}
                              placeholder="Contoh: Jl. Jenderal Sudirman No. X, Kendari, Sultra"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 5: Kata Sandi & Konfirmasi Kata Sandi for Mitra */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Kata Sandi <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={mitraForm.password}
                              onChange={(e) => setMitraForm({ ...mitraForm, password: e.target.value })}
                              placeholder="Minimal 6 karakter"
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={mitraForm.confirmPassword}
                              onChange={(e) => setMitraForm({ ...mitraForm, confirmPassword: e.target.value })}
                              placeholder="Ulangi kata sandi"
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Agreement Checkbox */}
                      <div className="pt-2">
                        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00186B] focus:ring-[#00186B] cursor-pointer"
                          />
                          <span>
                            Saya menyetujui <span className="text-blue-600 hover:underline font-medium">Ketentuan Layanan</span> dan <span className="text-blue-600 hover:underline font-medium">Kebijakan Privasi</span> Portal CDC Universitas Muhammadiyah Kendari.
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#00186B] hover:bg-[#000E3D] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-lg text-sm transition duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Memproses Pendaftaran Mitra...
                            </>
                          ) : (
                            'Daftar Akun Mitra'
                          )}
                        </button>
                      </div>

                      {/* Under-Card Link */}
                      <div className="pt-2 text-center text-xs text-slate-600">
                        Sudah memiliki akun?{' '}
                        <button
                          type="button"
                          onClick={onNavigateToLogin}
                          className="font-bold text-[#00186B] hover:underline cursor-pointer"
                        >
                          Login
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. INSTITUTIONAL FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Career Development Center — Universitas Muhammadiyah Kendari
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Butuh bantuan?
            </span>
            <a
              href="mailto:helpdesk@umkendari.ac.id"
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              helpdesk@umkendari.ac.id
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              0852-XXXX-XXXX
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
