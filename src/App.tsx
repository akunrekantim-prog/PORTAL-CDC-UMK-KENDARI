/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  sortJobsByNewest
} from './data';
import { API_BASE_URL } from './config/api';
import { slugify } from './utils/shareUtils';
import PublicLayout from './components/PublicLayout';
import BeritaDetailView from './components/BeritaDetailView';
import Register from './components/Register';
import Login from './components/Login';
import { JobDetail } from './components/JobDetail';
import MahasiswaDashboard from './components/MahasiswaDashboard';
import MitraDashboard from './components/MitraDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
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
  const location = useLocation();
  const navigate = useNavigate();

  // Routes States
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'admin-login' | 'register' | 'dashboard'>('public');
  const [publicTab, setPublicTab] = useState('beranda');
  const [registerTab, setRegisterTab] = useState<'alumni' | 'perusahaan'>('alumni');

  // Dashboard active tab states
  const [adminActiveTab, setAdminActiveTab] = useState<any>('ringkasan');
  const [mitraActiveTab, setMitraActiveTab] = useState<any>('ringkasan');
  const [mahasiswaActiveTab, setMahasiswaActiveTab] = useState<any>('search');

  // Detail States 
  const [viewingLowonganId, setViewingLowonganId] = useState<string | null>(null);
  const [viewingBeritaSlug, setViewingBeritaSlug] = useState<string | null>(null);
  const [viewingProgramId, setViewingProgramId] = useState<string | null>(null);
  const [viewingLayananDetailId, setViewingLayananDetailId] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  // FIX #4-GUARD: Cegah URL watcher redirect ke login saat session restore sedang berjalan async.
  const [isSessionRestoring, setIsSessionRestoring] = useState<boolean>(() => {
    // Cek awal: jika ada token & session_id, kemungkinan ada sesi yang bisa di-restore
    try {
      const hasToken = !!localStorage.getItem('cdc_auth_token');
      const hasSession = !!localStorage.getItem('cdc_session_id');
      return hasToken && hasSession;
    } catch {
      return false;
    }
  });

  // Local database States for passing to sub-components
  const [allLowongan, setAllLowongan] = useState<Lowongan[]>([]);
  const [allBerita, setAllBerita] = useState<Berita[]>([]);
  const [allProgram, setAllProgram] = useState<KontenKarir[]>([]);
  const [allKonten, setAllKonten] = useState<KontenKarir[]>([]);
  const [allPengumuman, setAllPengumuman] = useState<Pengumuman[]>([]);

  // Map KontenKarir jenis 'berita' (input admin) -> model Berita
  const mapKontenBeritaToBerita = (k: KontenKarir): Berita => ({
    id: k.id,
    title: k.judul,
    slug: k.slug || `kk-${k.id}`,
    excerpt: stripHtmlTags(k.body || '').slice(0, 160),
    content: k.body || '',
    coverImageUrl: k.thumbnail,
    thumbnail: k.thumbnail,
    status: k.status,
    authorId: k.createdBy || 'usr_admin',
    publishedAt: k.createdAt,
    createdAt: k.createdAt,
    scope: k.scope || 'LOKAL',
    kategori: k.kategori || 'Umum',
    penulis: k.penulis
  });

  // Load baseline database + Session Restore
  // FIX #4: Jika token tersimpan di localStorage, restore currentUser dari MEMORY_DB
  // agar admin tidak dipaksa login ulang setelah refresh halaman.
  useEffect(() => {
    async function loadData() {
      await initializeDB();
      reloadDatabase();

      // Session Restore: cek token & session_id di localStorage
      try {
        const sessionId = localStorage.getItem('cdc_session_id');
        const token = localStorage.getItem('cdc_auth_token');
        const expiry = Number(localStorage.getItem('cdc_token_expiry') || '0');
        const isTokenValid = token && (!expiry || Date.now() < expiry);

        if (sessionId && isTokenValid) {
          const users = getFromDB<UserType>('users');
          const restoredUser = users.find((u) => u.id === sessionId);
          if (restoredUser && (restoredUser.status === 'active' || restoredUser.status === 'pending')) {
            setCurrentUser(restoredUser);
            // Setelah restore user, coba tarik data live penuh dari Supabase
            const { refreshLiveDatabase } = await import('./data');
            await refreshLiveDatabase();
            reloadDatabase();
          }
        }
      } catch {
        // abaikan — session restore gagal tidak fatal
      } finally {
        // Selalu matikan flag restoring agar URL watcher bisa berjalan normal
        setIsSessionRestoring(false);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadDatabase = () => {
    setAllLowongan(sortJobsByNewest(getFromDB<Lowongan>('lowongan').filter(l => l.status === 'published')));
    const beritaMap = new Map<string, Berita>();
    // Berita langsung dari tabel beritas
    getFromDB<Berita>('berita').forEach((b) => {
      if (b && b.id) {
        const thumb = b.coverImageUrl || (b as any).thumbnail || '';
        beritaMap.set(b.id, {
          ...b,
          title: b.title || (b as any).judul || '',
          content: b.content || (b as any).body || '',
          coverImageUrl: thumb,
          thumbnail: thumb,
          scope: b.scope || 'LOKAL',
          kategori: b.kategori || 'Umum',
        });
      }
    });
    // Berita dari konten_karir (jika ada yang belum ada di map)
    getFromDB<KontenKarir>('konten_karir')
      .filter((k) => k.jenis === 'berita' && k.status === 'published')
      .map(mapKontenBeritaToBerita)
      .forEach((b) => {
        if (b && b.id && !beritaMap.has(b.id)) {
          beritaMap.set(b.id, b);
        }
      });
    setAllBerita(Array.from(beritaMap.values()));
    setAllPengumuman(getFromDB<Pengumuman>('pengumuman'));
    const programList = getFromDB<KontenKarir>('konten_karir')
      .filter((k) => k.jenis === 'program' && k.status === 'published')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setAllProgram(programList);
    setAllKonten(getFromDB<KontenKarir>('konten_karir'));
  };

  // Login resmi lewat komponen Login (POST /api/login backend, bcrypt + JWT).
  // handleLoginSubmit lama (inline App.tsx) DIHAPUS — sumber ganda = celah auth.
  // SECURITY: role-switcher TANPA login hanya boleh aktif di DEV eksplisit.
  // Production bundle: tombol disembunyikan DAN handler no-op agar tidak jadi backdoor.
  const FAST_AUTH_ENABLED =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.DEV === true &&
    (import.meta as any).env?.VITE_ENABLE_FAST_AUTH === 'true';

  const redirectToLogin = useCallback((adminOnly = false) => {
    setCurrentUser(null);
    setCurrentView(adminOnly ? 'admin-login' : 'login');
    navigate(adminOnly ? '/admin/login' : '/login');
  }, [navigate]);

  // Sync URL Path to state
  useEffect(() => {
    const path = location.pathname;

    if (path === '/admin/login' || path === '/admin-login' || path === '/cdc-admin-portal') {
      setCurrentView('admin-login');
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path.startsWith('/admin')) {
      const parts = path.split('/').filter(Boolean);
      const subTab = parts[1] || 'ringkasan';
      setAdminActiveTab(subTab);
      if (!currentUser || currentUser.role !== 'admin') {
        // FIX #4-GUARD: Jangan redirect ke login jika session restore masih berjalan.
        // Redirect hanya dieksekusi setelah isSessionRestoring = false.
        if (isSessionRestoring) return;
        if (FAST_AUTH_ENABLED) {
          handleFastRoleSwitch('admin', false);
        } else {
          redirectToLogin(true);
          return;
        }
      } else {
        setCurrentView('dashboard');
      }
    } else if (path.startsWith('/mitra')) {
      const parts = path.split('/').filter(Boolean);
      const subTab = parts[1] || 'ringkasan';
      setMitraActiveTab(subTab);
      if (!currentUser || currentUser.role !== 'mitra') {
        // FIX #4-GUARD: Jangan redirect ke login jika session restore masih berjalan.
        if (isSessionRestoring) return;
        if (FAST_AUTH_ENABLED) {
          handleFastRoleSwitch('mitra', false);
        } else {
          redirectToLogin(false);
        }
        return;
      }
      setCurrentView('dashboard');
    } else if (path.startsWith('/mahasiswa')) {
      const parts = path.split('/').filter(Boolean);
      let subTab = parts[1] || 'search';
      if (subTab === 'lamaran') subTab = 'applications';
      if (subTab === 'profil') subTab = 'profile';
      if (subTab === 'lowongan') subTab = 'search';
      setMahasiswaActiveTab(subTab as any);
      if (!currentUser || !['user', 'mahasiswa', 'alumni', 'job_seeker'].includes(currentUser.role)) {
        // FIX #4-GUARD: Jangan redirect ke login jika session restore masih berjalan.
        if (isSessionRestoring) return;
        if (FAST_AUTH_ENABLED) {
          handleFastRoleSwitch('user', false);
        } else {
          redirectToLogin(false);
        }
        return;
      }
      setCurrentView('dashboard');
    } else if (path.startsWith('/lowongan/')) {
      const raw = path.replace('/lowongan/', '');
      const parts = raw.split('/').filter(Boolean);
      const targetParam = parts[parts.length - 1] || parts[0];
      setCurrentView('public');
      setViewingLowonganId(targetParam);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path === '/lowongan') {
      setCurrentView('public');
      setPublicTab('lowongan');
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path.startsWith('/berita/')) {
      const raw = path.replace('/berita/', '');
      const parts = raw.split('/').filter(Boolean);
      const targetParam = parts[parts.length - 1] || parts[0];
      setCurrentView('public');
      setViewingBeritaSlug(targetParam);
      setViewingLowonganId(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path === '/berita') {
      setCurrentView('public');
      setPublicTab('berita');
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path.startsWith('/program/')) {
      const raw = path.replace('/program/', '');
      const parts = raw.split('/').filter(Boolean);
      const targetParam = parts[parts.length - 1] || parts[0];
      setCurrentView('public');
      setViewingProgramId(targetParam);
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingLayananDetailId(null);
    } else if (path.startsWith('/layanan/')) {
      const raw = path.replace('/layanan/', '');
      const parts = raw.split('/').filter(Boolean);
      const categoryTab = parts[0] || 'workshop';
      const eventSlug = parts.length > 1 ? parts.slice(1).join('/') : null;
      setCurrentView('public');
      setPublicTab(categoryTab);
      setViewingLayananDetailId(eventSlug);
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
    } else if (path.startsWith('/prestasi/')) {
      const subPath = path.replace('/prestasi/', '');
      const parts = subPath.split('/').filter(Boolean);
      let formattedTab = 'presentasi-internasional-akademik';
      let prestasiSlug: string | null = null;

      if (parts.length >= 3) {
        formattedTab = `presentasi-${parts[0]}-${parts[1]}`;
        prestasiSlug = parts[2];
      } else if (parts.length === 2) {
        if (['akademik', 'non-akademik'].includes(parts[1])) {
          formattedTab = `presentasi-${parts[0]}-${parts[1]}`;
        } else {
          formattedTab = `presentasi-${parts[0]}-akademik`;
          prestasiSlug = parts[1];
        }
      } else if (parts.length === 1) {
        if (parts[0].includes('-')) {
          formattedTab = `presentasi-${parts[0]}`;
        } else {
          formattedTab = `presentasi-${parts[0]}-akademik`;
        }
      }

      setCurrentView('public');
      setPublicTab(formattedTab);
      setViewingLayananDetailId(prestasiSlug);
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
    } else if (path === '/login') {
      setCurrentView('login');
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path.startsWith('/register')) {
      setCurrentView('register');
      if (path === '/register/alumni' || path === '/register/mahasiswa') {
        navigate('/register/alumni-dan-mahasiswa', { replace: true });
        setRegisterTab('alumni');
      } else if (path.includes('perusahaan') || path.includes('mitra')) {
        setRegisterTab('perusahaan');
      } else {
        setRegisterTab('alumni');
      }
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    } else if (path === '/' || path === '/beranda') {
      setCurrentView('public');
      setPublicTab('beranda');
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      setViewingLayananDetailId(null);
    }
  }, [location.pathname, currentUser, isSessionRestoring, navigate, FAST_AUTH_ENABLED, redirectToLogin]);

  // Quick Access Role Switcher — DEV ONLY, tanpa synthetic fallback user.
  const handleFastRoleSwitch = (role: 'admin' | 'user' | 'mitra' | 'public' | 'mahasiswa', shouldNavigate = true) => {
    if (!FAST_AUTH_ENABLED) return;
    if (role === 'public') {
      setCurrentUser(null);
      setCurrentView('public');
      setViewingLowonganId(null);
      setViewingBeritaSlug(null);
      setViewingProgramId(null);
      if (shouldNavigate && location.pathname !== '/' && location.pathname !== '/beranda') {
        navigate('/beranda');
      }
      return;
    }

    let users = getFromDB<UserType>('users');
    if (!users || users.length === 0) {
      initializeDB();
      users = getFromDB<UserType>('users');
    }

    const searchRole = role === 'mahasiswa' ? 'user' : role;
    let target = users.find(
      (u) => (u.role === searchRole || u.role === role || (searchRole === 'user' && (u.role === 'mahasiswa' || u.role === 'alumni' || u.role === 'user'))) && (u.status === 'active' || u.status === 'pending')
    );

    // SECURITY: tidak ada synthetic fallback user.
    // Tanpa user asli di DB lokal = tolak, jangan buat sesi admin/mitra palsu.
    if (!target) {
      return;
    }

    setCurrentUser(target);
    setCurrentView('dashboard');
    setViewingLowonganId(null);
    setViewingBeritaSlug(null);
    setViewingProgramId(null);
    reloadDatabase();
    try { localStorage.setItem('cdc_session_id', target.id); } catch { /* ignore */ }

    if (shouldNavigate) {
      if (role === 'admin') navigate('/admin/ringkasan');
      else if (role === 'mitra') navigate('/mitra/ringkasan');
      else navigate('/mahasiswa/search');
    }
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
    try { fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {}); } catch { /* abaikan */ }
    navigate('/');
  };

  const handleSetPublicTab = (tab: string) => {
    if (tab === 'register-alumni' || tab === 'register-perusahaan') {
      handleNavigateToLogin();
      return;
    }
    setPublicTab(tab);
    reloadDatabase();
    if (tab === 'beranda') navigate('/');
    else if (tab === 'lowongan') navigate('/lowongan');
    else if (tab === 'berita') navigate('/berita');
    else if (tab.startsWith('presentasi-')) {
      const sub = tab.replace('presentasi-', '').replace('-', '/');
      navigate(`/prestasi/${sub}`);
    } else {
      navigate(`/layanan/${tab}`);
    }
  };

  // Navigation callbacks
  const handleNavigateToLogin = () => {
    setCurrentView('login');
    navigate('/login');
  };

  const handleNavigateToRegister = (type: 'alumni' | 'perusahaan' = 'alumni') => {
    setRegisterTab(type);
    setCurrentView('register');
    if (type === 'alumni') {
      navigate('/register/alumni-dan-mahasiswa');
    } else {
      navigate(`/register/${type}`);
    }
  };

  const handleSelectLowongan = (id: string, customJudul?: string) => {
    window.scrollTo(0, 0);
    const targetJob = allLowongan.find(l => l.id === id || l.slug === id || slugify(l.judul) === id) || getFromDB<Lowongan>('lowongan').find(l => l.id === id);
    const titleSlug = slugify(customJudul || targetJob?.judul || id);
    const targetId = targetJob?.id || id;
    setViewingLowonganId(titleSlug || targetId);
    setViewingBeritaSlug(null);
    setViewingProgramId(null);
    if (titleSlug) {
      navigate(`/lowongan/${titleSlug}`);
    } else {
      navigate(`/lowongan/${targetId}`);
    }
  };

  const handleSelectBerita = (slug: string) => {
    window.scrollTo(0, 0);
    const targetBerita = allBerita.find(b => b.slug === slug || slugify(b.title) === slug || b.id === slug);
    const titleSlug = slugify(targetBerita?.title || slug);
    const targetSlug = targetBerita?.slug || slug;
    setViewingBeritaSlug(titleSlug || targetSlug);
    setViewingLowonganId(null);
    setViewingProgramId(null);
    if (titleSlug) {
      navigate(`/berita/${titleSlug}`);
    } else {
      navigate(`/berita/${targetSlug}`);
    }
  };

  const handleSelectProgram = (id: string, customJudul?: string) => {
    window.scrollTo(0, 0);
    const targetProg = allProgram.find(p => p.id === id || p.slug === id || slugify(p.judul) === id) || allKonten.find(k => k.id === id);
    const titleSlug = slugify(customJudul || targetProg?.judul || id);
    const targetId = targetProg?.id || id;
    setViewingProgramId(titleSlug || targetId);
    setViewingLowonganId(null);
    setViewingBeritaSlug(null);
    if (titleSlug) {
      navigate(`/program/${titleSlug}`);
    } else {
      navigate(`/program/${targetId}`);
    }
  };

  // Find detailed models with robust slug & title matching
  const selectedLowongan =
    allLowongan.find(l => l.id === viewingLowonganId || (l.slug && l.slug === viewingLowonganId) || slugify(l.judul) === viewingLowonganId) ||
    (viewingLowonganId ? getFromDB<Lowongan>('lowongan').find(l => l.id === viewingLowonganId || (l.slug && l.slug === viewingLowonganId) || slugify(l.judul) === viewingLowonganId) : undefined);

  const selectedBerita =
    allBerita.find(b => b.slug === viewingBeritaSlug || slugify(b.title) === viewingBeritaSlug || b.id === viewingBeritaSlug);

  const selectedProgram =
    allProgram.find(p => p.id === viewingProgramId || (p.slug && p.slug === viewingProgramId) || slugify(p.judul) === viewingProgramId) ||
    allKonten.find(p => p.id === viewingProgramId || (p.slug && p.slug === viewingProgramId) || slugify(p.judul) === viewingProgramId) ||
    (viewingProgramId ? {
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

  // Dynamic Browser Tab Title & Header Synchronization
  useEffect(() => {
    if (viewingLowonganId && selectedLowongan) {
      const instansi = selectedLowongan.namaInstansi ? ` - ${selectedLowongan.namaInstansi}` : '';
      document.title = `${selectedLowongan.judul}${instansi} | CDC UM Kendari`;
    } else if (viewingBeritaSlug && selectedBerita) {
      document.title = `${selectedBerita.title} | CDC UM Kendari`;
    } else if (viewingProgramId && selectedProgram) {
      document.title = `${selectedProgram.judul} | CDC UM Kendari`;
    } else if (currentView === 'login') {
      document.title = 'Masuk Akun - CDC UM Kendari';
    } else if (currentView === 'register') {
      document.title = 'Pendaftaran Akun - CDC UM Kendari';
    } else if (currentView === 'admin-login') {
      document.title = 'Login Portal Admin CDC UM Kendari';
    } else if (currentView === 'dashboard') {
      if (currentUser?.role === 'admin') document.title = 'Dashboard Admin - CDC UM Kendari';
      else if (currentUser?.role === 'mitra') document.title = 'Dashboard Mitra Perusahaan - CDC UM Kendari';
      else if (currentUser?.userStatusType === 'Alumni') document.title = 'Dashboard Alumni - CDC UM Kendari';
      else document.title = 'Dashboard Mahasiswa - CDC UM Kendari';
    } else {
      if (publicTab === 'lowongan') document.title = 'Lowongan Kerja & Magang - CDC UM Kendari';
      else if (publicTab === 'berita') document.title = 'Berita & Artikel Karir - CDC UM Kendari';
      else if (publicTab.startsWith('presentasi')) document.title = 'Prestasi Mahasiswa UMK - CDC UM Kendari';
      else document.title = 'CDC UM Kendari - Pusat Karir & Alumni';
    }
  }, [viewingLowonganId, viewingBeritaSlug, viewingProgramId, selectedLowongan, selectedBerita, selectedProgram, currentView, publicTab, currentUser]);

  return (
    <div className="bg-white min-h-screen font-sans" id="app-root">

      {/* BAR AKSES CEPAT UI DASHBOARD — DEV ONLY (FAST_AUTH_ENABLED).
          Tidak dirender di production agar tidak bisa inspect/click-jack ke dashboard. */}
      {FAST_AUTH_ENABLED && (
      <div
        id="aistudio-role-switcher"
        className="bg-white border-b border-slate-200 sticky top-0 z-[120]"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div id="switcher-lbl" className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pratinjau peran</span>
          <span className="hidden md:inline text-slate-300">/</span>
          <span className="hidden md:inline text-slate-400">Beralih tampilan tanpa login ulang</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 rounded-lg p-1" id="switcher-buttons">
          {[
            {
              id: 'admin',
              label: 'Dashboard Admin',
              activeColor: 'bg-[#1E3A8A] text-white shadow-sm font-semibold',
              normalColor: 'text-slate-500 hover:text-slate-900 font-medium'
            },
            {
              id: 'mitra',
              label: 'Dashboard Mitra',
              activeColor: 'bg-[#1E3A8A] text-white shadow-sm font-semibold',
              normalColor: 'text-slate-500 hover:text-slate-900 font-medium'
            },
            {
              id: 'user',
              label: 'Mahasiswa / Alumni',
              activeColor: 'bg-[#1E3A8A] text-white shadow-sm font-semibold',
              normalColor: 'text-slate-500 hover:text-slate-900 font-medium'
            },
            {
              id: 'public',
              label: 'Tampilan Publik',
              activeColor: 'bg-[#1E3A8A] text-white shadow-sm font-semibold',
              normalColor: 'text-slate-500 hover:text-slate-900 font-medium'
            }
          ].map((item) => {
            const isActive =
              item.id === 'public'
                ? currentView === 'public'
                : currentView === 'dashboard' && currentUser && (
                    item.id === 'admin'
                      ? currentUser.role === 'admin'
                      : item.id === 'mitra'
                        ? currentUser.role === 'mitra'
                        : ['user', 'mahasiswa', 'alumni'].includes(currentUser.role)
                  );

            return (
              <button
                key={item.id}
                id={`fast-auth-${item.id}`}
                onClick={() => handleFastRoleSwitch(item.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  isActive ? item.activeColor : item.normalColor
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        </div>
      </div>
      )}

      {/* CORE VIEWPORT RESOLVER */}
      <div id="core-viewport">

        {/* VIEW 1: PUBLIC GENERAL CHANNELS */}
        {currentView === 'public' && !viewingLowonganId && !viewingBeritaSlug && !viewingProgramId && (
          <PublicLayout
            currentTab={publicTab}
            setTab={handleSetPublicTab}
            lowongan={allLowongan}
            berita={allBerita}
            program={allProgram}
            konten={allKonten}
            pengumuman={allPengumuman}
            initialEventId={viewingLayananDetailId}
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
              onBack={() => {
                setViewingLowonganId(null);
                navigate('/lowongan');
              }}
              onSelectJob={(id) => handleSelectLowongan(id)}
              setTab={(tab) => {
                setViewingLowonganId(null);
                handleSetPublicTab(tab);
              }}
              onNavigateToLogin={handleNavigateToLogin}
              onNavigateToRegister={handleNavigateToRegister}
              isLoggedIn={false}
              onApply={() => {
                setViewingLowonganId(null);
                handleNavigateToLogin();
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
                  handleSetPublicTab('lowongan');
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
            onSelectBerita={(b) => handleSelectBerita(b.slug)}
            onBack={() => {
              setViewingBeritaSlug(null);
              navigate('/berita');
            }}
            setTab={(tab) => {
              setViewingBeritaSlug(null);
              handleSetPublicTab(tab);
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
              onClick={() => {
                setViewingProgramId(null);
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 text-slate-550 hover:text-slate-800 font-bold text-sm bg-white border border-slate-150 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
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
              // BUG-004 FIX: Tunggu data live dari Supabase turun DULU sebelum merender Dashboard.
              // Sebelumnya setCurrentView('dashboard') dipanggil sebelum await, 
              // sehingga Device B merender Dashboard dengan data cache lama (race condition).
              const { refreshLiveDatabase } = await import('./data');
              await refreshLiveDatabase();
              reloadDatabase();
              
              setCurrentView('dashboard');
              if (user.role === 'admin') navigate('/admin/ringkasan');
              else if (user.role === 'mitra') navigate('/mitra/ringkasan');
              else navigate('/mahasiswa/search');
            }}
            onNavigateToRegister={handleNavigateToRegister}
            onNavigateHome={() => {
              setCurrentView('public');
              reloadDatabase();
              navigate('/');
            }}
          />
        )}

        {/* VIEW 4.1: ADMIN DEDICATED LOGIN ROUTE */}
        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={async (user) => {
              setCurrentUser(user);
              // FIX #1: Tunggu refreshLiveDatabase selesai DULU sebelum render Dashboard.
              // Sebelumnya setCurrentView('dashboard') dipanggil sebelum await sehingga
              // AdminDashboard di-mount & reloadAll() berjalan saat MEMORY_DB masih kosong.
              const { refreshLiveDatabase } = await import('./data');
              await refreshLiveDatabase();
              reloadDatabase();
              setCurrentView('dashboard');
              navigate('/admin/ringkasan');
            }}
            onNavigateHome={() => {
              setCurrentView('public');
              reloadDatabase();
              navigate('/');
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
              navigate('/');
            }}
            onRegisterSuccess={(_user) => {
              reloadDatabase();
            }}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
              import('./data').then(({ refreshLiveDatabase }) =>
                refreshLiveDatabase().then(() => {
                  reloadDatabase();
                  if (user.role === 'admin') navigate('/admin/ringkasan');
                  else if (user.role === 'mitra') navigate('/mitra/ringkasan');
                  else navigate('/mahasiswa/search');
                }),
              );
            }}
          />
        )}

        {/* VIEW 5: DISPATCH DASHBOARDS TO ROLE-SPECIFIC PANELS */}
        {currentView === 'dashboard' && currentUser && (
          <div id="dashboard-panel-resolver">
            {(() => {
              try {
                if (!localStorage.getItem('cdc_auth_token')) {
                  return (
                    <div id="preview-mode-banner" className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-800">
                      Mode pratinjau peran — tombol Simpan / Posting / Hapus tidak menyimpan data.
                      Login dengan akun asli untuk mengelola data.
                    </div>
                  );
                }
              } catch { /* abaikan */ }
              return null;
            })()}
            {['user', 'mahasiswa', 'alumni', 'job_seeker'].includes(currentUser.role) && (
              <MahasiswaDashboard
                user={currentUser}
                onLogout={handleLogout}
                allLowongan={allLowongan}
                activeTab={mahasiswaActiveTab}
                onTabChange={(tab) => {
                  setMahasiswaActiveTab(tab);
                  const sub = tab === 'applications' ? 'lamaran' : tab === 'profile' ? 'profil' : 'lowongan';
                  navigate(`/mahasiswa/${sub}`);
                }}
              />
            )}
            {currentUser.role === 'mitra' && (
              <MitraDashboard
                user={currentUser}
                onLogout={handleLogout}
                onReloadData={reloadDatabase}
                activeTab={mitraActiveTab}
                onTabChange={(tab) => {
                  setMitraActiveTab(tab);
                  navigate(`/mitra/${tab}`);
                }}
              />
            )}
            {currentUser.role === 'admin' && (
              <AdminDashboard
                user={currentUser}
                onLogout={handleLogout}
                onReloadData={reloadDatabase}
                activeTab={adminActiveTab}
                onTabChange={(tab) => {
                  setAdminActiveTab(tab);
                  navigate(`/admin/${tab}`);
                }}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
