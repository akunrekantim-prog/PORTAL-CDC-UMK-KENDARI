/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserType, 
  Lowongan, 
  Berita, 
  Pengumuman 
} from './types';
import { 
  initializeDB, 
  getFromDB, 
  saveToDB 
} from './data';
import PublicLayout from './components/PublicLayout';
import Register from './components/Register';
import { JobDetail } from './components/JobDetail';
import MahasiswaDashboard from './components/MahasiswaDashboard';
import AlumniDashboard from './components/AlumniDashboard';
import MitraDashboard from './components/MitraDashboard';
import AdminDashboard from './components/AdminDashboard';
import ViewerDashboard from './components/ViewerDashboard';
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

export default function App() {
  // Routes States
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'register' | 'dashboard'>('public');
  const [publicTab, setPublicTab] = useState('beranda');
  const [registerTab, setRegisterTab] = useState<'alumni' | 'perusahaan'>('alumni');

  // Detail States 
  const [viewingLowonganId, setViewingLowonganId] = useState<string | null>(null);
  const [viewingBeritaSlug, setViewingBeritaSlug] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local database States for passing to sub-components
  const [allLowongan, setAllLowongan] = useState<Lowongan[]>([]);
  const [allBerita, setAllBerita] = useState<Berita[]>([]);
  const [allPengumuman, setAllPengumuman] = useState<Pengumuman[]>([]);

  // Seed baseline database on mounting
  useEffect(() => {
    initializeDB();
    reloadDatabase();
  }, []);

  const reloadDatabase = () => {
    setAllLowongan(getFromDB<Lowongan>('lowongan'));
    setAllBerita(getFromDB<Berita>('berita'));
    setAllPengumuman(getFromDB<Pengumuman>('pengumuman'));
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
    // Save to session tracking
    localStorage.setItem('cdc_session_id', matched.id);
  };

  // Development Direct-Switch tool (very powerful for multi-role testing in AI Studio iframe!)
  const handleFastRoleSwitch = (role: 'admin' | 'mahasiswa' | 'alumni' | 'mitra' | 'viewer') => {
    const users = getFromDB<UserType>('users');
    let target = users.find(u => u.role === role && u.status === 'active');
    
    if (target) {
      setCurrentUser(target);
      setCurrentView('dashboard');
      localStorage.setItem('cdc_session_id', target.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('public');
    setPublicTab('beranda');
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
  };

  // Find detailed models
  const selectedLowongan = allLowongan.find(l => l.id === viewingLowonganId);
  const selectedBerita = allBerita.find(b => b.slug === viewingBeritaSlug);

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
            { id: 'mahasiswa', label: 'Mahasiswa', color: 'bg-emerald-650 hover:bg-slate-800 border-slate-700 font-bold' },
            { id: 'alumni', label: 'Alumni', color: 'bg-blue-650 hover:bg-slate-800 border-slate-700 font-bold' },
            { id: 'mitra', label: 'Mitra', color: 'bg-teal-650 hover:bg-slate-800 border-slate-700 font-bold' },
            { id: 'viewer', label: 'Viewer/Prodi', color: 'bg-slate-700 hover:bg-slate-800 border-slate-700' }
          ].map((item) => (
            <button
              key={item.id}
              id={`fast-auth-${item.id}`}
              onClick={() => handleFastRoleSwitch(item.id as any)}
              className={`px-3 py-1 rounded text-xs border bg-slate-800 text-slate-200 transition-colors uppercase font-mono ${item.color}`}
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
        {currentView === 'public' && !viewingLowonganId && !viewingBeritaSlug && (
          <PublicLayout
            currentTab={publicTab}
            setTab={(tab) => {
              setPublicTab(tab);
              reloadDatabase();
            }}
            lowongan={allLowongan}
            berita={allBerita}
            pengumuman={allPengumuman}
            onSelectLowongan={handleSelectLowongan}
            onSelectBerita={handleSelectBerita}
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
                <div className="space-y-2" id="berita-detail-hdr">
                  <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Rilis Akademik CDC
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{selectedBerita.title}</h2>
                  <div className="text-slate-400 text-[11px] font-medium pt-1">
                    Dipublikasikan oleh: Admin CDC • {new Date(selectedBerita.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>

                <div className="text-slate-650 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans" id="berita-detail-text">
                  {selectedBerita.content}
                </div>
              </div>
            </article>
          </div>
        )}

        {/* VIEW 4: LOGIN FORM ROUTE */}
        {currentView === 'login' && (
          <div className="min-h-[80vh] flex items-center justify-center p-4" id="login-sec">
            <div className="bg-white max-w-md w-full rounded-3xl border border-slate-150 shadow-xl overflow-hidden" id="login-card">
              <div className="bg-slate-900 p-8 text-white space-y-2 text-center relative" id="login-hdr">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                
                <h3 className="font-extrabold text-white text-xl">Sistem Autentikasi Kampus</h3>
                <p className="text-slate-400 text-xs">Akses Layanan CDC, Magang dan Tracer Universitas Muhammadiyah Kendari</p>
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
            {currentUser.role === 'mahasiswa' && (
              <MahasiswaDashboard 
                user={currentUser} 
                onLogout={handleLogout} 
                allLowongan={allLowongan}
              />
            )}
            {currentUser.role === 'alumni' && (
              <AlumniDashboard 
                user={currentUser} 
                onLogout={handleLogout} 
                allLowongan={allLowongan}
              />
            )}
            {currentUser.role === 'mitra' && (
              <MitraDashboard 
                user={currentUser} 
                onLogout={handleLogout}
              />
            )}
            {currentUser.role === 'admin' && (
              <AdminDashboard 
                user={currentUser} 
                onLogout={handleLogout}
              />
            )}
            {currentUser.role === 'viewer' && (
              <ViewerDashboard 
                user={currentUser} 
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
