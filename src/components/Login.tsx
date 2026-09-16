/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Login Component — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Clean Split Authentication Layout (Inspired by UMK / SIMASTER):
 * - Left Side: Full-height building background + 75% dark overlay with official branding
 * - Right Side: Clean floating white panel with direct options:
 *   - "Masuk dengan Akun Mahasiswa / Alumni"
 *   - "Masuk dengan Akun Mitra"
 *   - "Lupa Kata Sandi"
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  X,
  Phone
} from 'lucide-react';
import { getHelpdeskConfig } from '../data';
import { loginToBackend } from '../services/dbService';
import { User as UserType, HelpdeskConfig } from '../types';
import { promptGoogleLogin, GoogleLogo } from '../utils/googleAuth';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  onNavigateToRegister: (type?: 'alumni' | 'perusahaan') => void;
  onNavigateHome: () => void;
}

type LoginRole = 'mahasiswa' | 'mitra';

export default function Login({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateHome
}: LoginProps) {
  const [isEnteringCredentials, setIsEnteringCredentials] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('mahasiswa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [helpdeskConfig, setHelpdeskConfig] = useState<HelpdeskConfig>(() => getHelpdeskConfig());

  const handleGoogleLogin = () => {
    setErrorMessage('');
    promptGoogleLogin({
      onSuccess: (user) => {
        onLoginSuccess(user);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onLoading: (loading) => {
        setIsGoogleLoading(loading);
      }
    });
  };

  // Reload config when modal is opened
  useEffect(() => {
    if (showForgotModal) {
      setHelpdeskConfig(getHelpdeskConfig());
    }
  }, [showForgotModal]);

  const handleSelectRole = (role: LoginRole) => {
    setSelectedRole(role);
    setIsEnteringCredentials(true);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Alamat email dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      // Login via backend Express jika aktif; jika offline (Failed to fetch), fallback ke verifikasi database lokal browser
      let user: UserType;
      try {
        const result = await loginToBackend(email.trim(), password);
        user = result.user as UserType;
      } catch (backendErr: any) {
        const isNetworkErr = backendErr && (
          backendErr.name === 'TypeError' ||
          String(backendErr.message).toLowerCase().includes('fetch') ||
          String(backendErr.message).includes('Failed') ||
          String(backendErr.message).includes('5000')
        );
        if (isNetworkErr) {
          console.warn('[Login] Backend tidak terjangkau. Login lokal dinonaktifkan demi keamanan.');
          setErrorMessage('Server autentikasi tidak terjangkau. Pastikan backend aktif dan coba lagi — login offline tidak diperbolehkan.');
          return;
        } else {
          throw backendErr;
        }
      }

      // Role check advisory (berdasar role resmi dari server/db, sudah lowercase-normalized)
      if (selectedRole === 'mitra' && user.role !== 'mitra' && user.role !== 'admin') {
        setErrorMessage('Akun ini terdaftar sebagai akun Mahasiswa / Alumni. Silakan gunakan pilihan Masuk dengan Akun Mahasiswa / Alumni.');
        return;
      }

      if (selectedRole === 'mahasiswa' && user.role === 'mitra') {
        setErrorMessage('Akun ini terdaftar sebagai akun Mitra Perusahaan. Silakan gunakan pilihan Masuk dengan Akun Mitra.');
        return;
      }

      if (user.status === 'pending') {
        setErrorMessage('Akun Anda masih dalam proses verifikasi oleh administrator (Status: Pending).');
        return;
      }

      if (user.status === 'inactive' || user.status === 'rejected') {
        setErrorMessage('Akun dinonaktifkan atau ditolak oleh operator CDC.');
        return;
      }

      // Success: login berhasil
      onLoginSuccess(user as UserType);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col lg:flex-row font-sans bg-slate-950 text-slate-800 overflow-x-hidden"
      id="login-page-root"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. FULL-SCREEN BACKGROUND WITH 75% DARK OVERLAY
      ───────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────
          2. LEFT COLUMN: HERO BRANDING SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white min-h-[40vh] lg:min-h-screen">

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-xs"
            id="login-back-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Main Branding Content */}
        <div className="my-auto py-8 space-y-6 max-w-xl mx-auto w-full px-2 sm:px-6 flex flex-col items-start text-left">
          {/* Official Logos Group */}
          <div className="flex items-center gap-3 sm:gap-4 w-fit">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group text-left focus-visible:outline-none"
              title="Kembali ke Beranda"
            >
              <img
                src="/logo-umk.png"
                alt="Logo Universitas Muhammadiyah Kendari"
                className="h-14 sm:h-18 lg:h-22 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform cursor-pointer"
              />
              <div className="h-10 sm:h-12 w-px bg-white/40"></div>
              <img
                src="/logo-cdc-branding-blue.png"
                alt="Logo Career Development Center UMK"
                className="h-16 sm:h-20 lg:h-24 w-auto object-contain group-hover:scale-105 transition-transform cursor-pointer"
              />
            </button>
          </div>

          {/* Typography: Title & Subtitle */}
          <div className="space-y-3 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              LOGIN <span className="text-amber-400">CDC UMK</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal">
              Sistem informasi <strong className="text-amber-300 font-semibold">Akademik Karir, Pelatihan, Magang, dan Tracer Study</strong> untuk Mendukung Tercapainya Lulusan Universitas Muhammadiyah Kendari yang Unggul, Berdaya Saing, dan Menjulang Tinggi.
            </p>
          </div>
        </div>

        <div className="hidden lg:block text-xs text-slate-400">
          Career Development Center &bull; Universitas Muhammadiyah Kendari
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RIGHT COLUMN: FLOATING WHITE AUTHENTICATION PANEL
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full lg:w-[480px] xl:w-[520px] bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-10 lg:p-12 lg:m-6 xl:m-8 lg:my-auto rounded-none lg:rounded-3xl border border-slate-100 my-auto min-h-screen lg:min-h-0">

        {/* Top Header / Back Trigger */}
        <div className="w-full">
          {isEnteringCredentials ? (
            <button
              onClick={() => {
                setIsEnteringCredentials(false);
                setErrorMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077C6] hover:text-[#005FA0] hover:underline cursor-pointer mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan Masuk
            </button>
          ) : (
            <div className="h-6"></div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="my-auto py-2 space-y-6">

          {/* Header Title & Branding Logo */}
          <div className="text-center space-y-2">
            <button
              onClick={onNavigateHome}
              className="cursor-pointer group inline-block focus-visible:outline-none"
              title="Kembali ke Beranda"
            >
              <img
                src="/logo-cdc-branding-transparent.png"
                alt="Logo Career Development Center UMK"
                className={`w-auto object-contain mx-auto transition-all group-hover:scale-105 cursor-pointer ${
                  isEnteringCredentials
                    ? 'h-12 sm:h-14 mt-3 sm:mt-4 mb-2'
                    : 'h-16 sm:h-20 -mt-3 sm:-mt-5 mb-2'
                }`}
              />
            </button>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              LOGIN
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isEnteringCredentials
                ? selectedRole === 'mitra'
                  ? 'Akun Mitra Industri / Perusahaan'
                  : 'Akun Mahasiswa / Alumni'
                : 'Akun Portal CDC Anda'}
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div
              className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5"
              id="login-error-alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-rose-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW A: PILIHAN MASUK DENGAN TOMBOL BERSIH (STYLE SEBELUMNYA)
          ───────────────────────────────────────────────────────────── */}
          {!isEnteringCredentials ? (
            <div className="space-y-3.5 pt-1" id="login-hero-view">

              {/* Button 1: Masuk dengan Akun Mahasiswa / Alumni */}
              <button
                type="button"
                onClick={() => handleSelectRole('mahasiswa')}
                className="w-full bg-[#0077C6] hover:bg-[#005FA0] active:bg-[#004C80] text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl text-sm sm:text-base transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
                id="login-mahasiswa-btn"
              >
                <span>Masuk dengan Akun Mahasiswa / Alumni</span>
              </button>

              {/* Button 2: Masuk dengan Akun Mitra */}
              <button
                type="button"
                onClick={() => handleSelectRole('mitra')}
                className="w-full bg-[#1B365D] hover:bg-[#142845] active:bg-[#0E1D33] text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl text-sm sm:text-base transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
                id="login-mitra-btn"
              >
                <span>Masuk dengan Akun Mitra</span>
              </button>

            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                VIEW B: FORM PENGISIAN EMAIL & PASSWORD
            ───────────────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 animate-fade-in" id="login-form">

              {/* Field: Email */}
              <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-[#0077C6] focus-within:ring-2 focus-within:ring-[#0077C6]/15 transition-all">
                <input
                  type="email"
                  id="login-input-email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full rounded-xl bg-transparent px-4 pt-5 pb-2 text-sm text-slate-800 placeholder-transparent focus:outline-none"
                />
                <label
                  htmlFor="login-input-email"
                  className={`pointer-events-none absolute left-4 transition-all duration-150 origin-left select-none ${email
                    ? 'top-1.5 text-[11px] font-medium text-slate-500'
                    : 'top-3.5 text-sm text-slate-400 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#0077C6] peer-focus:font-medium'
                    }`}
                >
                  {selectedRole === 'mitra' ? 'Email Resmi Instansi / Perusahaan' : 'Alamat Email Mahasiswa / Alumni'}
                </label>
              </div>

              {/* Field: Password */}
              <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-[#0077C6] focus-within:ring-2 focus-within:ring-[#0077C6]/15 transition-all">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-input-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full rounded-xl bg-transparent px-4 pr-11 pt-5 pb-2 text-sm text-slate-800 placeholder-transparent focus:outline-none"
                />
                <label
                  htmlFor="login-input-password"
                  className={`pointer-events-none absolute left-4 transition-all duration-150 origin-left select-none ${password
                    ? 'top-1.5 text-[11px] font-medium text-slate-500'
                    : 'top-3.5 text-sm text-slate-400 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#0077C6] peer-focus:font-medium'
                    }`}
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white font-bold py-3.5 px-6 rounded-xl text-sm transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer ${selectedRole === 'mitra'
                    ? 'bg-[#1B365D] hover:bg-[#142845] active:bg-[#0E1D33]'
                    : 'bg-[#0077C6] hover:bg-[#005FA0] active:bg-[#004C80]'
                    }`}
                  id="login-submit-button"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses Login...
                    </span>
                  ) : (
                    <span>
                      {selectedRole === 'mitra' ? 'Masuk sebagai Mitra' : 'Masuk sebagai Mahasiswa'}
                    </span>
                  )}
                </button>
              </div>

              {/* Google Sign-In Button (Only for Mahasiswa / Alumni) */}
              {selectedRole !== 'mitra' && (
                <>
                  <div className="relative flex items-center justify-center py-1">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-xs text-slate-400 font-medium lowercase">
                      or
                    </span>
                    <div className="border-t border-slate-200 w-full"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl border border-slate-900 transition duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
                    id="login-form-google-btn"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                    ) : (
                      <GoogleLogo className="w-5 h-5" />
                    )}
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {isGoogleLoading ? 'Menghubungkan ke Google...' : 'Log In with Google'}
                    </span>
                  </button>
                </>
              )}

              {/* Divider: ATAU */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  ATAU
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Alternative Action: Lupa Kata Sandi */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-[#F5F1EB] hover:bg-[#EAE5DE] border border-slate-200/60 transition cursor-pointer flex items-center justify-center"
                  id="login-forgot-password-btn"
                >
                  <span>Lupa Kata Sandi</span>
                </button>
              </div>

              {/* Under-Form Registration Links */}
              <div className="pt-3 text-center text-xs text-slate-600 space-y-2 border-t border-slate-100">
                <div>
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigateToRegister(selectedRole === 'mitra' ? 'perusahaan' : 'alumni')}
                    className="font-bold text-[#0077C6] hover:text-[#005FA0] hover:underline cursor-pointer"
                    id="login-goto-register-btn"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Bottom Footer Info */}
        <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
          © {new Date().getFullYear()} Career Development Center — Universitas Muhammadiyah Kendari
        </div>

      </div>



      {/* ─────────────────────────────────────────────────────────────
          5. MODAL: LUPA KATA SANDI / BANTUAN PEMULIHAN AKUN
      ───────────────────────────────────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 text-slate-800 relative animate-fade-in">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0077C6] flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">
                Bantuan Pemulihan Kata Sandi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Untuk menjaga keamanan akun Anda, reset kata sandi dapat dilakukan melalui bantuan Operator CDC UMK:
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#0077C6] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Email Helpdesk:</div>
                  <a
                    href={`mailto:${helpdeskConfig.email}`}
                    className="text-[#0077C6] hover:underline font-medium break-all"
                  >
                    {helpdeskConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">WhatsApp / Layanan Mahasiswa:</div>
                  <a
                    href={`https://wa.me/${helpdeskConfig.whatsappNumber.replace(/\D/g, '').replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 hover:text-emerald-700 hover:underline font-medium inline-flex items-center gap-1.5"
                  >
                    <span>{helpdeskConfig.whatsappNumber}</span>
                    {helpdeskConfig.whatsappNote && (
                      <span className="text-slate-500 font-normal">{helpdeskConfig.whatsappNote}</span>
                    )}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-[#0077C6] hover:bg-[#005FA0] text-white font-bold py-2.5 px-5 rounded-xl text-sm transition cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
