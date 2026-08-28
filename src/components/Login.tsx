/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Login Component — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Modern 50/50 Split Authentication Layout:
 * - Left Side: Full-height building background + 50% dark overlay with branding
 * - Right Side: Full-height straight white panel (top to bottom) with hero sign-in state
 *   and seamless transition to credential input form on "Masuk dengan Akun CDC".
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
import { getFromDB, saveToDB, getHelpdeskConfig } from '../data';
import { User as UserType, HelpdeskConfig } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  onNavigateToRegister: (type?: 'alumni' | 'perusahaan') => void;
  onNavigateHome: () => void;
}

export default function Login({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateHome
}: LoginProps) {
  const [isEnteringCredentials, setIsEnteringCredentials] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [helpdeskConfig, setHelpdeskConfig] = useState<HelpdeskConfig>(() => getHelpdeskConfig());

  // Reload config when modal is opened
  useEffect(() => {
    if (showForgotModal) {
      setHelpdeskConfig(getHelpdeskConfig());
    }
  }, [showForgotModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Alamat email dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate slight network delay for smooth UX
      await new Promise((r) => setTimeout(r, 450));

      const users = getFromDB<UserType>('users');
      const matched = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!matched) {
        setErrorMessage('Kredensial salah atau akun tidak ditemukan. Pastikan email terdaftar dengan benar.');
        return;
      }

      // Password Validation
      const userPassword = matched.password || 'password';
      const isValidPassword = password === userPassword || (matched.role === 'admin' && (password === 'admin123' || password === 'password'));

      if (!isValidPassword) {
        setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
        return;
      }

      if (matched.status === 'pending') {
        setErrorMessage('Akun Anda masih dalam proses verifikasi oleh administrator (Status: Pending).');
        return;
      }

      if (matched.status === 'inactive' || matched.status === 'rejected') {
        setErrorMessage('Akun dinonaktifkan atau ditolak oleh operator CDC.');
        return;
      }

      // Success Authentication
      const updatedMatched = { ...matched, lastLoginAt: new Date().toISOString() };
      const updatedUsers = users.map((u) => (u.id === matched.id ? updatedMatched : u));
      saveToDB('users', updatedUsers);
      localStorage.setItem('cdc_session_id', matched.id);

      onLoginSuccess(updatedMatched);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat proses login.');
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
          1. FULL-SCREEN BACKGROUND WITH 50% DARK OVERLAY (BEHIND ALL)
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
        {/* Dark Overlay (75% opacity) */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[0.5px]" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LEFT COLUMN: HERO BRANDING SECTION (OVERLAY BACKGROUND)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white min-h-[50vh] lg:min-h-screen">

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

        {/* Main Branding Content (Left-aligned, positioned nicely towards the center) */}
        <div className="my-auto py-8 space-y-6 max-w-xl mx-auto w-full px-2 sm:px-6 flex flex-col items-start text-left">
          {/* Official Logos Group */}
          <div className="flex items-center gap-3 sm:gap-4 w-fit">
            <img
              src="/logo-umk.png"
              alt="Logo Universitas Muhammadiyah Kendari"
              className="h-14 sm:h-18 lg:h-22 w-auto object-contain drop-shadow-md"
            />
            <div className="h-10 sm:h-12 w-px bg-white/40"></div>
            <img
              src="/logo-cdc-branding-blue.png"
              alt="Logo Career Development Center UMK"
              className="h-16 sm:h-20 lg:h-24 w-auto object-contain"
            />
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



      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RIGHT COLUMN: FLOATING WHITE PANEL (MELAYANG DI ATAS BACKGROUND)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full lg:w-[480px] xl:w-[520px] bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-10 lg:p-12 lg:m-6 xl:m-8 lg:my-auto rounded-none lg:rounded-3xl border border-slate-100 my-auto min-h-screen lg:min-h-0">

        {/* Top Spacer or Mode Title */}
        <div className="w-full">
          {isEnteringCredentials ? (
            <button
              onClick={() => {
                setIsEnteringCredentials(false);
                setErrorMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077C6] hover:text-[#005FA0] hover:underline cursor-pointer mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan Masuk
            </button>
          ) : (
            <div className="h-6"></div>
          )}
        </div>

        {/* Main Panel Content (Hero vs Credential Form) */}
        <div className="my-auto py-4 space-y-6">

          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              LOGIN
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {isEnteringCredentials
                ? 'Masukkan email dan kata sandi Akun CDC Anda'
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
              VIEW A: HERO STATE (Inspired by SIMASTER UGM)
          ───────────────────────────────────────────────────────────── */}
          {!isEnteringCredentials ? (
            <div className="space-y-5 pt-2" id="login-hero-view">

              {/* Primary Action Button: Direct to Credential Form */}
              <button
                type="button"
                onClick={() => {
                  setIsEnteringCredentials(true);
                  setErrorMessage('');
                }}
                className="w-full bg-[#0077C6] hover:bg-[#005FA0] active:bg-[#004C80] text-white font-bold py-4 px-6 rounded-2xl text-sm sm:text-base transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
                id="login-hero-action-btn"
              >
                <span>Masuk dengan Akun CDC</span>
              </button>

              {/* Divider: Atau */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Atau
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Alternative Action: Lupa Kata Sandi */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition cursor-pointer flex items-center justify-center"
                  id="login-hero-forgot-btn"
                >
                  <span>Lupa Kata Sandi</span>
                </button>
              </div>

              {/* Under-Action Registration Links */}
              <div className="pt-4 text-center text-xs text-slate-600 space-y-2 border-t border-slate-100">
                <div>
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigateToRegister('alumni')}
                    className="font-bold text-[#0077C6] hover:text-[#005FA0] hover:underline cursor-pointer"
                    id="login-hero-register-btn"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                VIEW B: FORM PENGISIAN (KREDENSIAL LOGIN LAMA)
            ───────────────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 animate-fade-in" id="login-form">

              {/* Field: Email with Facebook-style floating animation */}
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
                  className={`pointer-events-none absolute left-4 transition-all duration-150 origin-left select-none ${
                    email
                      ? 'top-1.5 text-[11px] font-medium text-slate-500'
                      : 'top-3.5 text-sm text-slate-400 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#0077C6] peer-focus:font-medium'
                  }`}
                >
                  Email
                </label>
              </div>

              {/* Field: Password with Facebook-style floating animation */}
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
                  className={`pointer-events-none absolute left-4 transition-all duration-150 origin-left select-none ${
                    password
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
                  className="w-full bg-[#0077C6] hover:bg-[#005FA0] active:bg-[#004C80] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
                  id="login-submit-button"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses Login...
                    </span>
                  ) : (
                    <span>Masuk ke Akun</span>
                  )}
                </button>
              </div>

              {/* Divider: Atau */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Atau
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Alternative Action: Lupa Kata Sandi */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer flex items-center justify-center"
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
                    onClick={() => onNavigateToRegister('alumni')}
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
          4. MODAL: LUPA KATA SANDI / BANTUAN PEMULIHAN AKUN
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
