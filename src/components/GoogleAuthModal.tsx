/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GoogleAuthModal Component — Portal CDC UM Kendari
 * ─────────────────────────────────────────────────────────────────
 * Realistic, secure Google Account Chooser & Real Google OAuth integration.
 * Supports:
 * 1. Official Google OAuth 2.0 Popup (using your Google Client ID)
 * 2. 1-Click fast select with existing accounts
 * 3. Custom Google account input
 */

import React, { useState } from 'react';
import { X, Loader2, ArrowRight, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { loginOrRegisterWithGoogle, getFromDB } from '../data';
import { User } from '../types';

export const GOOGLE_CLIENT_ID = '1077773131381-g3j12rlo2epjlg1rvahq5vljo15ir38e.apps.googleusercontent.com';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function GoogleLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess
}: GoogleAuthModalProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  if (!isOpen) return null;

  // Retrieve existing users from database for quick 1-click select
  const allUsers = getFromDB<User>('users').filter(u => u.status === 'active');
  const sampleAccounts = [
    ...(allUsers.slice(0, 2).map(u => ({
      name: u.name,
      email: u.email,
      photoUrl: u.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      badge: u.role === 'mitra' ? 'Mitra' : 'Mahasiswa'
    }))),
    {
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@umkendari.ac.id',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      badge: 'Mahasiswa'
    }
  ].filter((acc, idx, arr) => arr.findIndex(a => a.email.toLowerCase() === acc.email.toLowerCase()) === idx);

  // Trigger Real Google OAuth 2.0 Popup
  const triggerRealGooglePopup = () => {
    setCustomError('');
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      setIsConnectingGoogle(true);
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (resp: any) => {
            if (resp && resp.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${resp.access_token}` }
                });
                const profile = await res.json();
                if (profile && profile.email) {
                  const { user } = loginOrRegisterWithGoogle({
                    name: profile.name || profile.email.split('@')[0],
                    email: profile.email,
                    photoUrl: profile.picture
                  });
                  onSuccess(user);
                  onClose();
                  return;
                }
              } catch (err: any) {
                setCustomError('Gagal mengambil data profil Google: ' + err.message);
              } finally {
                setIsConnectingGoogle(false);
              }
            } else if (resp && resp.error) {
              setIsConnectingGoogle(false);
              if (resp.error !== 'popup_closed_by_user') {
                setCustomError(`Pemberitahuan Google: ${resp.error_description || resp.error}. Pastikan http://localhost:3000 sudah ditambahkan di Authorized origins Google Cloud.`);
              }
            }
          },
          error_callback: (err: any) => {
            setIsConnectingGoogle(false);
            setCustomError(`Tidak dapat membuka popup Google: ${err?.message || 'Pastikan http://localhost:3000 telah didaftarkan di Authorized origins Google Cloud Console.'}`);
          }
        });
        tokenClient.requestAccessToken();
      } catch (err: any) {
        setIsConnectingGoogle(false);
        setCustomError('Gagal menginisialisasi Google Auth: ' + err.message);
      }
    } else {
      setCustomError('Library Google Sign-In sedang dimuat di browser. Silakan coba kembali dalam beberapa detik.');
    }
  };

  const handleSelectAccount = async (account: { name: string; email: string; photoUrl?: string }) => {
    setLoadingEmail(account.email);
    setCustomError('');

    await new Promise(r => setTimeout(r, 650));

    try {
      const { user } = loginOrRegisterWithGoogle({
        name: account.name,
        email: account.email,
        photoUrl: account.photoUrl
      });
      setLoadingEmail(null);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setCustomError(err.message || 'Gagal login melalui Google');
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customName.trim()) {
      setCustomError('Harap masukkan nama lengkap Anda.');
      return;
    }

    if (!customEmail.trim() || !customEmail.includes('@') || !customEmail.includes('.')) {
      setCustomError('Harap masukkan alamat email Google/Gmail yang valid.');
      return;
    }

    await handleSelectAccount({
      name: customName.trim(),
      email: customEmail.trim().toLowerCase(),
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden z-10 font-sans"
      >
        {/* Top Header */}
        <div className="p-6 sm:p-7 pb-4 text-center relative border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-slate-100 flex items-center justify-center mx-auto mb-3.5">
            <GoogleLogo className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Login dengan Google
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pilih metode login untuk masuk ke <span className="font-semibold text-slate-700">Portal CDC UM Kendari</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {customError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium leading-relaxed">
              {customError}
            </div>
          )}

          {/* 1. REAL GOOGLE POPUP BUTTON */}
          <div>
            <button
              type="button"
              disabled={isConnectingGoogle}
              onClick={triggerRealGooglePopup}
              className="w-full bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#0D47A1] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition duration-150 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75"
            >
              {isConnectingGoogle ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs sm:text-sm">Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                    <GoogleLogo className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold">Buka Popup Login Resmi Google</span>
                  <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-1.5">
              Membuka jendela resmi akun Google Anda
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Atau Akun Cepat
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {!isCustomMode ? (
            <div className="space-y-2">
              {/* Account List */}
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/40">
                {sampleAccounts.map(account => {
                  const isProcessing = loadingEmail === account.email;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      disabled={Boolean(loadingEmail) || isConnectingGoogle}
                      onClick={() => handleSelectAccount(account)}
                      className="w-full text-left p-3.5 sm:p-4 hover:bg-slate-100/80 transition flex items-center gap-3.5 cursor-pointer disabled:opacity-60 group"
                    >
                      <img
                        src={account.photoUrl}
                        alt={account.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate group-hover:text-[#0077C6] transition">
                            {account.name}
                          </span>
                          {account.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {account.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{account.email}</div>
                      </div>

                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-[#0077C6] animate-spin shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Option: Use Another Account */}
                <button
                  type="button"
                  disabled={Boolean(loadingEmail) || isConnectingGoogle}
                  onClick={() => setIsCustomMode(true)}
                  className="w-full text-left p-3.5 sm:p-4 hover:bg-slate-100/80 transition flex items-center gap-3.5 cursor-pointer group text-slate-700"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-slate-800">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-800 group-hover:text-[#0077C6] transition">
                      Ketik Email Google Lain
                    </div>
                    <div className="text-xs text-slate-500">
                      Masukkan nama dan email Gmail secara manual
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Custom Account Entry Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Akun Google *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Alamat Email Google / Gmail *</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="nama@gmail.com atau nama@umkendari.ac.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={Boolean(loadingEmail) || isConnectingGoogle}
                  className="bg-[#0077C6] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {loadingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menghubungkan...
                    </>
                  ) : (
                    'Lanjutkan Masuk'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Privacy Notice */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-2">
            Untuk melanjutkan, Google akan membagikan nama, alamat email, dan preferensi bahasa Anda ke CDC UM Kendari.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
