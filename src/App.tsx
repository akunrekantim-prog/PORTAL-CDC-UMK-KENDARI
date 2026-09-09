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
  insertToDB,
  updateInDB,
  sortJobsByNewest
} from './data';
import EventDetailView from './components/layanan/EventDetailView';
// ...
import PublicLayout from './components/PublicLayout';
import BeritaDetailView from './components/BeritaDetailView';
import Register from './components/Register';
import Login from './components/Login';
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
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { renderContentMarkdown, stripHtmlTags } from './markdown';

export default function App() {
  // Routes States
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'register' | 'dashboard'>('public');
  const [publicTab, setPublicTab] = useState('beranda');
  const [registerTab, setRegisterTab] = useState<'alumni' | 'perusahaan'>('alumni');

  // Detail States 
  const [viewingLowonganId, setViewingLowonganId] = useState<string | null>(null);
  const [viewingBeritaSlug, setViewingBeritaSlug] = useState<string | null>(null);
  const [viewingProgramId, setViewingProgramId] = useState<string | null>(null);

  // Authentication State (user login via backend; handleFastRoleSwitch HANYA dev)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Local database States for passing to sub-components
  const [allLowongan, setAllLowongan] = useState<Lowongan[]>([]);
  const [allBerita, setAllBerita] = useState<Berita[]>([]);
  const [allProgram, setAllProgram] = useState<KontenKarir[]>([]);
  const [allKonten, setAllKonten] = useState<KontenKarir[]>([]);
  const [allPengumuman, setAllPengumuman] = useState<Pengumuman[]>([]);

  // Map KontenKarir jenis 'berita' (input admin) -> model Berita agar
  // bisa langsung tampil di beranda & tab Berita tanpa duplikasi UI.
  const mapKontenBeritaToBerita = (k: KontenKarir): Berita => ({
    id: k.id,
    title: k.judul,
    slug: `kk-${k.id}`,
    excerpt: stripHtmlTags(k.body || '').slice(0, 160),
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

  // Load baseline database langsung dari Supabase PostgreSQL saat mounting
  useEffect(() => {
    async function loadData() {
      await initializeDB();
      reloadDatabase();
    }
    loadData();
  }, []);

  const reloadDatabase = () => {
    setAllLowongan(sortJobsByNewest(getFromDB<Lowongan>('lowongan').filter(l => l.status === 'published')));
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
    // Seluruh konten_karir (termasuk event layanan: workshop/softskill/seminar)
    setAllKonten(getFromDB<KontenKarir>('konten_karir'));
  };

  // Login resmi lewat komponen Login (POST /api/login backend, bcrypt + JWT).
  // handleLoginSubmit lama (inline App.tsx) DIHAPUS — sumber ganda = celah auth.
  // Development Direct-Switch tool — HANYA aktif bila DEV build + VITE_ENABLE_FAST_AUTH=true.
  // Di production tombol disembunyikan agar tidak jadi backdoor.
  const FAST_AUTH_ENABLED =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env &&
      (import.meta as any).env.DEV === true &&
      (import.meta as any).env.VITE_ENABLE_FAST_AUTH === 'true') ||
    (typeof process !== 'undefined' && (process as any).env && (process as any).env.VITE_ENABLE_FAST_AUTH === 'true' && (process as any).env.NODE_ENV !== 'production');

  // SECURITY: Direct-switch hanya aktif di development.
  // Di production, fallback admin sintetis DINONAKTIFKAN — akses admin wajib via /api/login + JWT.
  const handleFastRoleSwitch = (role: 'admin' | 'user' | 'mitra' | 'viewer' | 'mahasiswa') => {
    if (!FAST_AUTH_ENABLED) {
      console.warn('[Security] Fast role switch dinonaktifkan di production.');
      return;
    }
    let users = getFromDB<UserType>('users');
    if (!users || users.length === 0) {
      initializeDB();
      users = getFromDB<UserType>('users');
    }

    const searchRole = role === 'mahasiswa' ? 'user' : role;
    const target = users.find(
      (u) => (u.role === searchRole || u.role === role || (searchRole === 'user' && (u.role === 'mahasiswa' || u.role === 'alumni' || u.role === 'user'))) && (u.status === 'active' || u.status === 'pending')
    );

    if (!target) {
      console.warn(`[DevSwitch] User role "${role}" tidak ditemukan di DB. Login via backend diperlukan.`);
      return;
    }

    setCurrentUser(target);
    setCurrentView('dashboard');
    reloadDatabase();
    localStorage.setItem('cdc_session_id', target.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('public');
    setPublicTab('beranda');
    reloadDatabase();
    try {
      localStorage.removeItem('cdc_auth_token');
      localStorage.removeItem('cdc_token_expiry');
      localStorage.removeItem('cdc_session_id');
    } catch { /* abaikan */ }
    // Bersihkan httpOnly auth cookie sisi server (fire-and-forget)
    try { fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch { /* abaikan */ }
    // Fallback langsung (kalau proxy): panggil origin API
    try {
      const base = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:5000/api';
      fetch(`${base}/logout`, { method: 'POST', credentials: 'include' }).catch(()=>{});
    } catch { /* abaikan */ }
  };

  // Navigation callbacks
  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleNavigateToRegister = (type: 'alumni' | 'perusahaan' = 'alumni') => {
    setRegisterTab(type);
    setCurrentView('register');
  };

  const handleSelectLowongan = (id: string) => {
    window.scrollTo(0, 0);
    setViewingLowonganId(id);
    setViewingBeritaSlug(null);
  };

  const handleSelectBerita = (slug: string) => {
    window.scrollTo(0, 0);
    setViewingBeritaSlug(slug);
    setViewingLowonganId(null);
    setViewingProgramId(null);
  };

  const handleSelectProgram = (id: string) => {
    window.scrollTo(0, 0);
    setViewingProgramId(id);
    setViewingLowonganId(null);
    setViewingBeritaSlug(null);
  };

  // Find detailed models
  const selectedLowongan =
    allLowongan.find(l => l.id === viewingLowonganId) ||
    (viewingLowonganId ? getFromDB<Lowongan>('lowongan').find(l => l.id === viewingLowonganId) : undefined);
  const selectedBerita = allBerita.find(b => b.slug === viewingBeritaSlug);
  const selectedProgram = allProgram.find(p => p.id === viewingProgramId) || allKonten.find(p => p.id === viewingProgramId) || (viewingProgramId ? {
    id: viewingProgramId,
    jenis: 'program' as const,
    judul: 'JOB PREPARATION 2026',
    body: 'Persiapkan dirimu menghadapi dunia kerja dengan program intensif bersama praktisi HR terbaik.',
    kategori: 'Program Unggulan',
    thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
    layoutType: 'card' as const,
    status: 'published' as const,
    createdAt: '2026-05-10T08:00:00Z',
    createdByName: 'Admin Website'
  } : undefined);

  return (
    <div className="bg-white min-h-screen font-sans" id="app-root">

      {/* SECURITY: Fast-Role switcher hanya aktif di dev (DEV build + VITE_ENABLE_FAST_AUTH).
          Di production build blok ini TIDAK dirender sama sekali. */}
      {FAST_AUTH_ENABLED && (
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
            { id: 'admin', label: 'Admin CDC', color: 'bg-indigo-650 hover:bg-slate-800 hover:text-white border-slate-700 font-bold cursor-pointer' },
            { id: 'user', label: 'USER', color: 'bg-emerald-650 hover:bg-slate-800 hover:text-white border-slate-700 font-bold cursor-pointer' },
            { id: 'mitra', label: 'Mitra', color: 'bg-teal-650 hover:bg-slate-800 hover:text-white border-slate-700 font-bold cursor-pointer' }
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
              className="px-2.5 py-1 rounded text-xs bg-rose-950 text-rose-450 border border-rose-900 font-bold font-mono transition uppercase cursor-pointer hover:bg-rose-900"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      )}

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
            konten={allKonten}
            pengumuman={allPengumuman}
            onSelectLowongan={handleSelectLowongan}
            onSelectBerita={handleSelectBerita}
            onSelectProgram={handleSelectProgram}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )}

        {/* VIEW 2: JOB VACANCY PROFILE BLOCK */}
        {currentView === 'public' && viewingLowonganId && (
          selectedLowongan ? (
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
              onSelectBerita={(slug) => {
                setViewingLowonganId(null);
                handleSelectBerita(slug);
              }}
              onSelectProgram={(id) => {
                setViewingLowonganId(null);
                handleSelectProgram(id);
              }}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Lowongan Tidak Ditemukan</h2>
              <p className="text-slate-600 text-sm">
                Lowongan yang Anda pilih mungkin telah berakhir, dihapus, atau belum dipublikasikan.
              </p>
              <button
                onClick={() => {
                  setViewingLowonganId(null);
                  setPublicTab('lowongan');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0077C6] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Lowongan
              </button>
            </div>
          )
        )}

        {/* VIEW 3: NEWS ARTICLE BLOCK */}
        {currentView === 'public' && viewingBeritaSlug && selectedBerita && (
          <BeritaDetailView
            berita={selectedBerita}
            allBeritaList={allBerita}
            onSelectBerita={(b) => setViewingBeritaSlug(b.slug)}
            onBack={() => setViewingBeritaSlug(null)}
            setTab={(tab) => {
              setViewingBeritaSlug(null);
              setPublicTab(tab);
              reloadDatabase();
            }}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
            onSelectLowongan={(id) => {
              setViewingBeritaSlug(null);
              handleSelectLowongan(id);
            }}
            onSelectProgram={(id) => {
              setViewingBeritaSlug(null);
              handleSelectProgram(id);
            }}
          />
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
                    Dipublikasikan oleh: {(!selectedProgram.createdByName || selectedProgram.createdByName.toLowerCase().includes('admin')) ? 'Admin Website' : selectedProgram.createdByName} · {new Date(selectedProgram.createdAt).toLocaleDateString('id-ID')}
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
          <Login
            onLoginSuccess={async (user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
              // Tarik ulang dataset privat (/all-data) dengan token baru agar dashboard tidak hanya lihat data publik.
              const { fetchInitialDatabaseFromSupabase } = await import('./services/dbService');
              const full = await fetchInitialDatabaseFromSupabase();
              if (full) {
                const { initializeDB: _reinit } = await import('./data');
                // MEMORY_DB sudah tertimpa fetchInitial..., reloadDatabase sinkronkan state React.
                reloadDatabase();
              } else {
                reloadDatabase();
              }
            }}
            onNavigateToRegister={handleNavigateToRegister}
            onNavigateHome={() => {
              setCurrentView('public');
              reloadDatabase();
            }}
          />
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
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
              reloadDatabase();
            }}
          />
        )}

        {/* VIEW 5: DISPATCH DASHBOARDS TO ROLE-SPECIFIC PANELS
            Role backend dinormalisasi dbService: admin / mitra / mahasiswa / alumni / user. */}
        {currentView === 'dashboard' && currentUser && (
          <div id="dashboard-panel-resolver">
            {['user', 'mahasiswa', 'alumni', 'job_seeker'].includes(currentUser.role) && (
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
