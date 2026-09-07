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

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  // Login handler using simulated bcrypt/SQL
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Email dan Password wajib diisi.');
      return;
    }

    // Call backend API for authentication
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail.toLowerCase(), 
          password: loginPassword 
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setLoginError(result.message || 'Login gagal. Periksa kredensial Anda.');
        return;
      }

      // Store JWT token with expiry
      localStorage.setItem('cdc_auth_token', result.token);
      localStorage.setItem('cdc_token_expiry', (Date.now() + result.expiresIn * 1000).toString());
      localStorage.setItem('cdc_session_id', result.user.id);

      // Update local state
      setCurrentUser(result.user);
      setCurrentView('dashboard');
      reloadDatabase();
    } catch (error) {
      console.error('[Login Error]:', error);
      setLoginError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.');
    }
  };

  // Development Direct-Switch tool (very powerful for multi-role testing in AI Studio iframe!)
  const handleFastRoleSwitch = (role: 'admin' | 'user' | 'mitra' | 'viewer' | 'mahasiswa') => {
    let users = getFromDB<UserType>('users');
    if (!users || users.length === 0) {
      initializeDB();
      users = getFromDB<UserType>('users');
    }

    const searchRole = role === 'mahasiswa' ? 'user' : role;
    let target = users.find(
      u => (u.role === searchRole || u.role === role || (searchRole === 'user' && (u.role === 'mahasiswa' || u.role === 'alumni' || u.role === 'user'))) && (u.status === 'active' || u.status === 'pending')
    );

    // Fallback jika user tidak ditemukan di memory DB
    if (!target) {
      if (role === 'admin') {
        target = {
          id: 'usr_admin',
          name: 'Operator CDC UM Kendari',
          email: 'admin@umkendari.ac.id',
          phone: '081234567890',
          role: 'admin',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
          createdAt: new Date().toISOString()
        };
      } else if (role === 'mitra') {
        target = {
          id: 'usr_mitra1',
          name: 'Budi Setiawan (HRD PT Go Digital)',
          email: 'mitra@umkendari.ac.id',
          phone: '081299998888',
          role: 'mitra',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
          createdAt: new Date().toISOString()
        };
      } else {
        target = {
          id: 'usr_mhs1',
          name: 'Muhammad Fadly Alamsyah',
          email: 'mhs@umkendari.ac.id',
          phone: '085241009988',
          role: 'user',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
          createdAt: new Date().toISOString()
        };
      }
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
  const selectedLowongan = allLowongan.find(l => l.id === viewingLowonganId);
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
            onSelectBerita={(slug) => {
              setViewingLowonganId(null);
              handleSelectBerita(slug);
            }}
            onSelectProgram={(id) => {
              setViewingLowonganId(null);
              handleSelectProgram(id);
            }}
          />
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
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
              reloadDatabase();
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

        {/* VIEW 5: DISPATCH DASHBOARDS TO ROLE-SPECIFIC PANELS */}
        {currentView === 'dashboard' && currentUser && (
          <div id="dashboard-panel-resolver">
            {currentUser.role === 'user' && (
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
