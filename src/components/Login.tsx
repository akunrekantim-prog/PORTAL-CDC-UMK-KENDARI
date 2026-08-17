/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Login Component — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Clean, professional, institutional login page styled to match
 * the Register page and top-tier university portal standards.
 */

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { getFromDB, saveToDB } from '../data';
import { User as UserType } from '../types';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      await new Promise(r => setTimeout(r, 500));

      const users = getFromDB<UserType>('users');
      const matched = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!matched) {
        setErrorMessage('Kredensial salah atau akun tidak ditemukan.');
        return;
      }

      if (matched.status === 'pending') {
        setErrorMessage('Akun Anda masih ditinjau oleh administrator (Status: Pending).');
        return;
      }

      if (matched.status === 'inactive' || matched.status === 'rejected') {
        setErrorMessage('Akun dinonaktifkan atau ditolak oleh operator CDC.');
        return;
      }

      // Success Authentication
      const updatedMatched = { ...matched, lastLoginAt: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === matched.id ? updatedMatched : u);
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
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans flex flex-col justify-between" id="login-page-root">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Official CDC Brand Logo */}
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

          {/* Right link: Daftar Akun */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigateToRegister('alumni')}
              className="text-sm font-bold text-[#00186B] hover:text-[#000E3D] hover:underline transition cursor-pointer"
            >
              Daftar Akun
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-lg w-full mx-auto space-y-6">

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Login ke Portal
            </h1>
            <p className="text-sm text-slate-500">
              Masukkan email dan kata sandi Anda untuk mengakses akun Portal CDC Universitas Muhammadiyah Kendari.
            </p>
          </div>

          {/* Main White Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6">

            {/* Error Alert Box */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3" id="login-error-alert">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              
              {/* Field: Email */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-semibold text-slate-700">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@umkendari.ac.id / email terdaftar"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00186B] focus:outline-none focus:ring-1 focus:ring-[#00186B] transition"
                  />
                </div>
              </div>

              {/* Field: Password */}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#00186B] hover:bg-[#000E3D] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-lg text-sm transition duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses Login...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>

              {/* Under-Card Link to Register */}
              <div className="pt-2 text-center text-xs text-slate-600 space-y-2">
                <div>
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigateToRegister('alumni')}
                    className="font-bold text-[#00186B] hover:underline cursor-pointer"
                  >
                    Daftar Sekarang
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    ← Kembali ke Beranda
                  </button>
                </div>
              </div>

            </form>
          </div>

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
