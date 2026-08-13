/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User as UserType,
  Lowongan,
  Berita,
  Pengumuman,
  KontenKarir
} from './types';
import {
  initializeDB,
  getFromDB,
  saveToDB,
  sortJobsByNewest
} from './data';
import PublicLayout from './components/PublicLayout';
import Register from './components/Register';
import { JobDetail } from './components/JobDetail';
import MahasiswaDashboard from './components/MahasiswaDashboard';
import MitraDashboard from './components/MitraDashboard';
import AdminDashboard from './components/AdminDashboard';
import {
  Briefcase,
  Clock,
  MapPin,
  Building2,
  Calendar,
  ChevronLeft,
  Shield,
  ArrowRight,
  UserCheck2,
  Lock,
  Mail,
  Info,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { renderContentMarkdown } from './markdown';

export default function App() {
  // Routes States
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'register' | 'dashboard'>('public');
  const [publicTab, setPublicTab] = useState('beranda');
  const [registerTab, setRegisterTab] = useState<'alumni' | 'perusahaan'>('alumni');

  // Detail States 
  const [viewingLowonganId, setViewingLowonganId] = useState<string | null>(null);
  const [viewingBeritaSlug, setViewingBeritaSlug] = useState<string | null>(null);
  const [viewingProgramId, setViewingProgramId] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local database States for passing to sub-components
  const [allLowongan, setAllLowongan] = useState<Lowongan[]>([]);
  const [allBerita, setAllBerita] = useState<Berita[]>([]);
  const [allProgram, setAllProgram] = useState<KontenKarir[]>([]);
  const [allPengumuman, setAllPengumuman] = useState<Pengumuman[]>([]);

  // Map KontenKarir jenis 'berita' (input admin) -> model Berita agar
  // bisa langsung tampil di beranda & tab Berita tanpa duplikasi UI.
  const mapKontenBeritaToBerita = (k: KontenKarir): Berita => ({
    id: k.id,
    title: k.judul,
    slug: `kk-${k.id}`,
    excerpt: (k.body || '').replace(/[#>*_`~\-]/g, '').slice(0, 160).trim(),
    content: k.body || '',
    coverImageUrl: k.thumbnail,
    status: k.status,
    authorId: k.createdBy || 'usr_admin',
    publishedAt: k.createdAt,
    createdAt: k.createdAt,
    // field ekstra untuk tampilan scope & penulis
    scope: k.scope,
    penulis: k.penulis
  });

  // Seed baseline database on mounting
  useEffect(() => {
    initializeDB();
    reloadDatabase();
  }, []);

  const reloadDatabase = () => {
    setAllLowongan(sortJobsByNewest(getFromDB<Lowongan>('lowongan')));
    // Gabungkan seed berita lama + berita hasil input admin (konten_karir)
    const beritaSeed = getFromDB<Berita>('berita');
    const kontenBerita = getFromDB<KontenKarir>('konten_karir')
      .filter((k) => k.jenis === 'berita' && k.status === 'published')
      .map(mapKontenBeritaToBerita);
    setAllBerita([...kontenBerita, ...beritaSeed]);
    setAllPengumuman(getFromDB<Pengumuman>('pengumuman'));
    // Program & Pengumuman (input admin, jenis 'program', published)
    const programList = getFromDB<KontenKarir>('konten_karir')
      .filter((k) => k.jenis === 'program' && k.status === 'published')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setAllProgram(programList);
  };

  // Login handler using simulated bcrypt/SQL
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Email dan Password wajib diisi.');
      return;
    }

    const users = getFromDB<UserType>('users');
    const matched = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!matched) {
      setLoginError('Kredensial salah atau akun tidak ditemukan.');
      return;
    }

    if (matched.status === 'pending') {
      setLoginError('Akun Anda masih ditinjau administrator (Status: Pending).');
      return;
    }

    if (matched.status === 'inactive' || matched.status === 'rejected') {
      setLoginError('Akun dinonaktifkan atau ditolak oleh operator CDC.');
      return;
    }

    // Success Authentication
    const updatedMatched = { ...matched, lastLoginAt: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === matched.id ? updatedMatched : u);
    saveToDB('users', updatedUsers);

    setCurrentUser(updatedMatched);
    setCurrentView('dashboard');
    reloadDatabase();
    // Save to session tracking
    localStorage.setItem('cdc_session_id', matched.id);
  };

  // Development Direct-Switch tool (very powerful for multi-role testing in AI Studio iframe!)
  const handleFastRoleSwitch = (role: 'admin' | 'user' | 'mitra' | 'viewer') => {
    const users = getFromDB<UserType>('users');
    let target = users.find(u => (u.role === role || (role === 'user' && (u.role === 'mahasiswa' || u.role === 'alumni' || u.role === 'user'))) && u.status === 'active');

    if (target) {
      setCurrentUser(target);
      setCurrentView('dashboard');
      reloadDatabase();
      localStorage.setItem('cdc_session_id', target.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('public');
    setPublicTab('beranda');
    reloadDatabase();
    localStorage.removeItem('cdc_session_id');
  };

  // Navigation callbacks
  const handleNavigateToLogin = () => {
    setLoginError('');
    setCurrentView('login');
  };

  const handleNavigateToRegister = (type: 'alumni' | 'perusahaan' = 'alumni') => {
    setLoginError('');
    setRegisterTab(type);
    setCurrentView('register');
  };

  const handleSelectLowongan = (id: string) => {
    setViewingLowonganId(id);
    setViewingBeritaSlug(null);
  };

  const handleSelectBerita = (slug: string) => {
    setViewingBeritaSlug(slug);
    setViewingLowonganId(null);
    setViewingProgramId(null);
  };

  const handleSelectProgram = (id: string) => {
    setViewingProgramId(id);
    setViewingLowonganId(null);
    setViewingBeritaSlug(null);
  };

  // Find detailed models
  const selectedLowongan = allLowongan.find(l => l.id === viewingLowonganId);
  const selectedBerita = allBerita.find(b => b.slug === viewingBeritaSlug);
  const selectedProgram = allProgram.find(p => p.id === viewingProgramId);

  return (
    <div className="bg-white min-h-screen font-sans" id="app-root">

      {/* QUICK ROLE SWITCH TESTING UTILITY */}
      <div
        id="aistudio-role-switcher"
        className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-white"
      >
        <div id="switcher-lbl" className="flex items-center gap-1.5 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">Fast-Role Tester:</span>
          <span>Pilih role di bawah untuk instan menguji UI dashboard</span>
        </div>

        <div className="flex flex-wrap gap-2" id="switcher-buttons">
          {[
            { id: 'admin', label: 'Admin CDC', color: 'bg-indigo-650 hover:bg-slate-800 hover:text-white border-slate-700 font-bold' },
            { id: 'mahasiswa', label: 'USER', color: 'bg-emerald-650 hover:bg-slate-800 border-slate-700 font-bold' },
            { id: 'mitra', label: 'Mitra', color: 'bg-teal-650 hover:bg-slate-800 border-slate-700 font-bold' }
          ].map((item) => (
            <button
              key={item.id}
              id={`fast-auth-${item.id}`}
              onClick={() => handleFastRoleSwitch(item.id as any)}
              className={`px-3 py-1 rounded text-xs border transition-colors uppercase font-mono ${item.color}`}
            >
              {item.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 rounded text-xs bg-rose-950 text-rose-450 border border-rose-900 font-bold font-mono transition uppercase"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* CORE VIEWPORT RESOLVER */}
      <div id="core-viewport">

        {/* VIEW 1: PUBLIC GENERAL CHANNELS */}
        {currentView === 'public' && !viewingLowonganId && !viewingBeritaSlug && !viewingProgramId && (
          <PublicLayout
            currentTab={publicTab}
            setTab={(tab) => {
              setPublicTab(tab);
              reloadDatabase();
            }}
            lowongan={allLowongan}
            berita={allBerita}
            program={allProgram}
            pengumuman={allPengumuman}
            onSelectLowongan={handleSelectLowongan}
            onSelectBerita={handleSelectBerita}
            onSelectProgram={handleSelectProgram}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )}

        {/* VIEW 2: JOB VACANCY PROFILE BLOCK */}
        {currentView === 'public' && viewingLowonganId && selectedLowongan && (
          <JobDetail
            job={selectedLowongan}
            onBack={() => setViewingLowonganId(null)}
            onSelectJob={(id) => handleSelectLowongan(id)}
            setTab={(tab) => {
              setViewingLowonganId(null);
              setPublicTab(tab);
              reloadDatabase();
            }}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
            isLoggedIn={false}
            onApply={() => {
              setViewingLowonganId(null);
              setPublicTab('beranda');
              handleNavigateToLogin();
              reloadDatabase();
            }}
          />
        )}

        {/* VIEW 3: NEWS ARTICLE BLOCK */}
        {currentView === 'public' && viewingBeritaSlug && selectedBerita && (
          <div className="max-w-3xl mx-auto px-4 py-16 space-y-6" id="berita-detail-panel">
            <button
              onClick={() => setViewingBeritaSlug(null)}
              className="inline-flex items-center gap-1.5 text-slate-550 hover:text-slate-800 font-bold text-sm bg-white border border-slate-150 px-4 py-2 rounded-xl shadow-xs transition"
              id="berita-back-btn"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali Rilis
            </button>

            <article className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm" id="berita-detail-doc">
              {selectedBerita.coverImageUrl && (
                <div className="aspect-[21/9]" id="berita-detail-cover">
                  <img
                    src={selectedBerita.coverImageUrl}
                    alt={selectedBerita.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="p-8 sm:p-10 space-y-6" id="berita-detail-body">
                <div className="space-y-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedBerita.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedBerita.scope || 'LOKAL'}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                    {selectedBerita.title}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Dipublikasikan oleh: {selectedBerita.penulis || 'Admin CDC'} · {new Date(selectedBerita.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-6 text-slate-700 text-sm sm:text-base space-y-4">
                  {renderContentMarkdown(selectedBerita.content)}
                </div>
              </div>
            </article>
          </div>
        )}

        {/* VIEW 3.5: PROGRAM & PENGUMUMAN DETAIL BLOCK */}
        {currentView === 'public' && viewingProgramId && selectedProgram && (
          <div className="max-w-3xl mx-auto px-4 py-16 space-y-6" id="program-detail-panel">
            <button
              onClick={() => setViewingProgramId(null)}
              className="inline-flex items-center gap-1.5 text-slate-550 hover:text-slate-800 font-bold text-sm bg-white border border-slate-150 px-4 py-2 rounded-xl shadow-xs transition"
              id="program-back-btn"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>

            <article className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm" id="program-detail-doc">
              {selectedProgram.thumbnail && (
                <div className="aspect-[21/9]" id="program-detail-cover">
                  <img
                    src={selectedProgram.thumbnail}
                    alt={selectedProgram.judul}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="p-8 sm:p-10 space-y-6" id="program-detail-body">
                <div className="space-y-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${(selectedProgram.kategori || 'PROGRAM') ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedProgram.kategori || 'PROGRAM & PENGUMUMAN'}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                    {selectedProgram.judul}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Dipublikasikan oleh: {selectedProgram.createdByName || 'Admin CDC'} · {new Date(selectedProgram.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>

                {selectedProgram.body && selectedProgram.body.trim() ? (
                  <div className="border-t border-slate-100 pt-6 text-slate-700 text-sm sm:text-base space-y-4">
                    {renderContentMarkdown(selectedProgram.body)}
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-400 italic">
                      Tidak ada detail konten. {selectedProgram.linkCta ? 'Buka tautan di bawah untuk informasi lengkap.' : 'Silakan cek pengumuman terkait di beranda.'}
                    </p>
                  </div>
                )}

                {selectedProgram.linkCta && (
                  <a
                    href={selectedProgram.linkCta}
                    target={selectedProgram.linkCta.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0077C6] hover:bg-[#1E3A8A] text-white font-bold text-sm px-5 py-3 rounded-xl transition"
                  >
                    Buka Tautan <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </article>
          </div>
        )}

        {/* VIEW 4: LOGIN FORM ROUTE */}
        {currentView === 'login' && (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" id="login-screen">
            {/* Ambient Lighting FX */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-10 animate-fadeIn">
              <div className="bg-slate-900 text-white p-8 relative border-b border-slate-800">
                <button
                  onClick={() => setCurrentView('public')}
                  className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">Masuk Ke Sistem Portal</h2>
                <p className="text-slate-400 text-xs mt-1">Sistem Otentikasi Terpadu CDC Universitas Muhammadiyah Kendari</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="p-8 space-y-5" id="login-form">
                {loginError && (
                  <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl border border-rose-200 text-xs flex items-center gap-2" id="login-error-msg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5" id="login-email-box">
                  <label className="text-xs font-bold text-slate-700">Alamat Surat Elektronik (Email)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Mail className="w-4 h-4" /></span>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Contoh: mhs@umkendari.ac.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-205 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5" id="login-pass-box">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi (Password)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password Anda"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-205 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                  id="login-btn-start"
                >
                  Masuk Ke Database Portal
                </button>

                <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500" id="login-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('public');
                      reloadDatabase();
                    }}
                    className="hover:underline font-bold text-slate-750"
                  >
                    ← Kembali ke Beranda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToRegister('alumni')}
                    className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    Belum punya akun? Daftar Sekarang →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 4.5: REGISTER FORM ROUTE */}
        {currentView === 'register' && (
          <Register
            initialTab={registerTab}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateHome={() => {
              setCurrentView('public');
              reloadDatabase();
            }}
            onRegisterSuccess={(user) => {
              reloadDatabase();
            }}
          />
        )}

        {/* VIEW 5: DISPATCH DASHBOARDS TO ROLE-SPECIFIC PANELS */}
        {currentView === 'dashboard' && currentUser && (
          <div id="dashboard-panel-resolver">
            {(currentUser.role === 'user' || currentUser.role === 'mahasiswa' || currentUser.role === 'alumni') && (
              <MahasiswaDashboard
                user={currentUser}
                onLogout={handleLogout}
                allLowongan={allLowongan}
              />
            )}
            {currentUser.role === 'mitra' && (
              <MitraDashboard
                user={currentUser}
                onLogout={handleLogout}
                onReloadData={reloadDatabase}
              />
            )}
            {currentUser.role === 'admin' && (
              <AdminDashboard
                user={currentUser}
                onLogout={handleLogout}
                onReloadData={reloadDatabase}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
