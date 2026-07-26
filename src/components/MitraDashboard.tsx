/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserType, 
  Mitra, 
  Lowongan, 
  PengajuanMagang, 
  SurveiLulusan 
} from '../types';
import { 
  getFromDB, 
  saveToDB, 
  insertToDB, 
  updateInDB,
  deleteInDB
} from '../data';
import { 
  Building2, 
  Briefcase, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Globe, 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  ArrowRight,
  Info,
  Upload
} from 'lucide-react';

interface MitraDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function MitraDashboard({ user, onLogout }: MitraDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'profil' | 'lowongan' | 'pelamar' | 'survei'>('ringkasan');
  
  // Data States
  const [mitraData, setMitraData] = useState<Mitra | null>(null);
  const [myJobs, setMyJobs] = useState<Lowongan[]>([]);
  const [myApplicants, setMyApplicants] = useState<PengajuanMagang[]>([]);
  const [mySurveys, setMySurveys] = useState<SurveiLulusan[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form States
  const [namaInstansi, setNamaInstansi] = useState('');
  const [bidangIndustri, setBidangIndustri] = useState('Teknologi Informasi & Software');
  const [alamat, setAlamat] = useState('');
  const [kontakPerson, setKontakPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Add Job Form States
  const [showAddJob, setShowAddJob] = useState(false);
  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState<'magang' | 'kerja'>('magang');
  const [lokasi, setLokasi] = useState('Kendari (On-site)');
  const [deskripsi, setDeskripsi] = useState('');
  const [kualifikasi, setKualifikasi] = useState('');
  const [benefit, setBenefit] = useState('');
  const [kuota, setKuota] = useState(3);
  const [deadline, setDeadline] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');

  // Survey Form States
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [kualitasLulusan, setKualitasLulusan] = useState(5);
  const [kemampuanTeknis, setKemampuanTeknis] = useState(5);
  const [kemampuanKomunikasi, setKemampuanKomunikasi] = useState(4);
  const [etikaKerja, setEtikaKerja] = useState(5);
  const [kemampuanKerjaTim, setKemampuanKerjaTim] = useState(5);
  const [surveiSaran, setSurveiSaran] = useState('');

  // Load specific Partner record
  const loadMitraData = () => {
    const list = getFromDB<Mitra>('mitra');
    let mit = list.find(m => m.userId === user.id);

    if (!mit) {
      // Auto seed blank partner item
      const newMit: Mitra = {
        id: `mtr_${Date.now()}`,
        userId: user.id,
        namaInstansi: user.name.split('(')[0].trim() || 'Instansi Kemitraan Baru',
        bidangIndustri: 'Teknologi Informasi & Software',
        alamat: '',
        kontakPerson: user.name,
        email: user.email,
        phone: user.phone || '',
        website: '',
        statusKerjaSama: 'aktif'
      };
      insertToDB<Mitra>('mitra', newMit);
      mit = newMit;
    }

    setMitraData(mit);
    setNamaInstansi(mit.namaInstansi || '');
    setBidangIndustri(mit.bidangIndustri || 'Teknologi Informasi & Software');
    setAlamat(mit.alamat || '');
    setKontakPerson(mit.kontakPerson || '');
    setPhone(mit.phone || '');
    setWebsite(mit.website || '');

    // Load related postings
    const lowongans = getFromDB<Lowongan>('lowongan');
    const partnerPostings = lowongans.filter(l => l.mitraId === mit.id);
    setMyJobs(partnerPostings);

    // Load related candidates/applicants
    const candidates = getFromDB<PengajuanMagang>('pengajuan_magang');
    const jobIds = partnerPostings.map(p => p.id);
    const partnerCandidates = candidates.filter(c => c.lowonganId && jobIds.includes(c.lowonganId));
    setMyApplicants(partnerCandidates);

    // Load surveys
    const surveys = getFromDB<SurveiLulusan>('survei_lulusan');
    const partnerSurveys = surveys.filter(s => s.mitraId === mit.id);
    setMySurveys(partnerSurveys);
  };

  useEffect(() => {
    loadMitraData();
  }, [user.id]);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Profile Save (FR-MTR-02)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraData) return;

    if (!namaInstansi) {
      triggerToast('error', 'Nama instansi wajib diisi');
      return;
    }

    const updatedMitra: Mitra = {
      ...mitraData,
      namaInstansi,
      bidangIndustri,
      alamat,
      kontakPerson,
      phone,
      website
    };

    updateInDB<Mitra>('mitra', updatedMitra);
    setMitraData(updatedMitra);

    // Update lowongan instance names for consistency
    const allJobs = getFromDB<Lowongan>('lowongan');
    const recalculatedJobs = allJobs.map(j => {
      if (j.mitraId === mitraData.id) {
        return { ...j, namaInstansi };
      }
      return j;
    });
    saveToDB('lowongan', recalculatedJobs);

    triggerToast('success', 'Profil mitra berhasil disimpan ke database SQL server kampus.');
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      triggerToast('error', 'Ukuran file foto maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add job posting (FR-MTR-03)
  const handleAddJobPosting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraData) return;

    if (!judul || !deadline) {
      triggerToast('error', 'Semua field wajib bintang wajib diisi');
      return;
    }

    const newJob: Lowongan = {
      id: `low_${Date.now()}`,
      mitraId: mitraData.id,
      createdBy: user.id,
      judul,
      tipe,
      namaInstansi: mitraData.namaInstansi,
      imageUrl: imageUrl || undefined,
      flyer: imageUrl || undefined,
      bannerImage: imageUrl || undefined,
      flyers: imageUrl ? [imageUrl] : undefined,
      lokasi,
      deskripsi,
      kualifikasi: kualifikasi.split('\n').filter(k => k.trim() !== ''),
      benefit: benefit.split('\n').filter(b => b.trim() !== ''),
      kuota,
      deadline,
      status: 'published', // standard published immediately in demo for easy testing
      createdAt: new Date().toISOString()
    };

    insertToDB<Lowongan>('lowongan', newJob);

    // Reset fields
    setJudul('');
    setDeskripsi('');
    setKualifikasi('');
    setBenefit('');
    setKuota(3);
    setDeadline('');
    setImageUrl('');
    setShowAddJob(false);

    loadMitraData();
    triggerToast('success', 'Lowongan baru berhasil diposting aktif ke halaman publik.');
  };

  // Change job status draft/closed (FR-MTR-04)
  const handleToggleJobStatus = (jobId: string, currentStatus: any) => {
    const allJobs = getFromDB<Lowongan>('lowongan');
    const target = allJobs.find(j => j.id === jobId);
    if (target) {
      target.status = currentStatus === 'published' ? 'closed' : 'published';
      updateInDB<Lowongan>('lowongan', target);
      loadMitraData();
      triggerToast('success', `Status lowongan berhasil diubah menjadi ${target.status === 'published' ? 'AKTIF/PUBLISHED' : 'DITUTUP'}.`);
    }
  };

  // Delete Job Posting safely
  const handleDeleteJob = (jobId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus lowongan ini dari server? Semua histori pelamar akan diarsipkan.')) {
      deleteInDB('lowongan', jobId);
      loadMitraData();
      triggerToast('success', 'Lowongan berhasil dihapus dari database.');
    }
  };

  // Handle Candidate Status Accept/Reject (FR-MTR-05)
  const handleUpdateApplicantStatus = (applId: string, decision: 'accepted' | 'rejected' | 'revision') => {
    const allAppls = getFromDB<PengajuanMagang>('pengajuan_magang');
    const target = allAppls.find(a => a.id === applId);
    if (target) {
      target.status = decision;
      target.catatanAdmin = `Diproses langsung oleh HRD Mitra (${mitraData?.namaInstansi}) : ${
        decision === 'accepted' ? 'Diterima magang.' : decision === 'rejected' ? 'Maaf, berkas ditolak.' : 'Harap revisi kelengkapan transkrip.'
      }`;
      updateInDB<PengajuanMagang>('pengajuan_magang', target);
      loadMitraData();
      triggerToast('success', `Status pelamar berhasil diperbarui menjadi ${decision.toUpperCase()}.`);
    }
  };

  // Submit survey (FR-MTR-06)
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraData) return;

    const surveyId = `sv_${Date.now()}`;
    const newSurvey: SurveiLulusan = {
      id: surveyId,
      mitraId: mitraData.id,
      namaInstansi: mitraData.namaInstansi,
      alumniId: selectedAlumniId || undefined,
      kualitasLulusan,
      kemampuanTeknis,
      kemampuanKomunikasi,
      etikaKerja,
      kemampuanKerjaTim,
      saran: surveiSaran || undefined,
      submittedAt: new Date().toISOString()
    };

    insertToDB<SurveiLulusan>('survei_lulusan', newSurvey);
    setSelectedAlumniId('');
    setSurveiSaran('');
    loadMitraData();
    triggerToast('success', 'Kuesioner survei kepuasan mitra berhasil di-upload dan disimpan di rekap admin.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="mtr-dashboard">
      {/* LOCAL TOAST NOTIFIER */}
      {message && (
        <div 
          id="mtr-toast"
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm max-w-sm flex items-center gap-2.5 transition-all ${
            message.type === 'success' 
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 bg-white font-semibold shadow-md' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#10B981]" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />}
          <div>{message.text}</div>
        </div>
      )}

      {/* HEADER BANNER */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm" id="mtr-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#1E3A8A] text-white p-2 rounded-xl border border-blue-800/50">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                <span>PORTAL MITRA INDUSTRI & CDC</span>
                <span className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">VERIFIED</span>
              </div>
              <div className="text-slate-400 text-[11px]">CDC Universitas Muhammadiyah Kendari</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-xs text-white leading-none">{namaInstansi || user.name}</div>
              <div className="text-[#10B981] text-[11px] font-medium leading-tight mt-0.5">PIC: {kontakPerson || user.name}</div>
            </div>
            <button 
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
              id="mtr-btn-logout"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD WEB CORE GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8" id="mtr-grid-layout">
        
        {/* SIDEBAR NAVIGATION CONTROLS */}
        <aside className="lg:col-span-3 space-y-6" id="mtr-sidebar">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 border border-[#1E3A8A]/20">
                {namaInstansi ? namaInstansi.charAt(0) : 'M'}
              </div>
              <div className="truncate min-w-0">
                <div className="font-extrabold text-slate-900 text-sm truncate">{namaInstansi || 'Instansi Mitra'}</div>
                <div className="text-slate-400 text-xs truncate font-medium">{user.email}</div>
                <div className="inline-flex items-center gap-1 text-[#10B981] text-[10px] font-bold mt-1">
                  <CheckCircle className="w-3 h-3 fill-[#10B981] text-white shrink-0" />
                  <span>Mitra Resmi</span>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5" id="mtr-nav-menu">
              {[
                { id: 'ringkasan', label: 'Ringkasan Kerja', icon: Building2 },
                { id: 'profil', label: 'Profil Instansi', icon: FileText },
                { id: 'lowongan', label: 'Kelola Lowongan', icon: Briefcase },
                { id: 'pelamar', label: 'Pelamar & Seleksi', icon: Users },
                { id: 'survei', label: 'Survei Mutu Lulusan', icon: Star }
              ].map((menu) => {
                const Icon = menu.icon;
                const isActive = activeTab === menu.id;
                return (
                  <button
                    key={menu.id}
                    id={`mtr-tab-${menu.id}`}
                    onClick={() => {
                      setActiveTab(menu.id as any);
                      setShowAddJob(false);
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-[#1E3A8A] text-white font-bold shadow-md shadow-blue-900/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {menu.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3" id="mtr-side-status">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              Status Kemitraan
            </h4>
            <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Kerja Sama:</span>
                <span className="font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/20 text-[11px]">VERIFIED / AKTIF</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Lowongan Aktif:</span>
                <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">{myJobs.filter(j => j.status === 'published').length} Posisi</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CORE CONTENT DISPLAY BOARD */}
        <main className="lg:col-span-9 space-y-8" id="mtr-dashboard-main">
          
          {/* POLISHED VERIFIED PARTNER HEADER BANNER CARD (VISIBLE IN RINGKASAN & LOWONGAN) */}
          {(activeTab === 'ringkasan' || activeTab === 'lowongan') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6" id="mtr-welcome-banner">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-2xl flex items-center justify-center font-extrabold text-2xl sm:text-3xl shrink-0 border border-[#1E3A8A]/20 shadow-xs">
                    {namaInstansi ? namaInstansi.charAt(0) : 'M'}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="inline-flex items-center gap-1.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-3 py-1 rounded-full font-bold text-xs">
                      <CheckCircle className="w-3.5 h-3.5 fill-[#10B981] text-white shrink-0" />
                      <span>MITRA RESMI CDC UM KENDARI</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">{namaInstansi || 'Instansi Mitra Kampus'}</h2>
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs font-medium text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /> PIC: <strong className="text-slate-700">{kontakPerson || user.name}</strong></span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Sektor: <strong className="text-slate-700">{bidangIndustri}</strong></span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kontak: <strong className="text-slate-700">{phone || user.phone || '-'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <button 
                    onClick={() => setActiveTab('profil')} 
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-slate-500" /> Edit Profil
                  </button>
                  <button 
                    onClick={() => { setActiveTab('lowongan'); setShowAddJob(true); }} 
                    className="bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Posting Lowongan
                  </button>
                </div>
              </div>

              {/* QUICK STAT COUNTERS WITH CLEAN ICON CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-slate-300 transition group">
                  <div className="w-12 h-12 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Lowongan Aktif</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{myJobs.filter(j => j.status === 'published').length} <span className="text-xs font-semibold text-slate-500">Posisi</span></div>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-slate-300 transition group">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Total Pelamar</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{myApplicants.length} <span className="text-xs font-semibold text-slate-500">Mahasiswa</span></div>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-slate-300 transition group">
                  <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Status Approval</div>
                    <div className="text-base font-extrabold text-[#10B981] mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      Aktif / Terverifikasi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div id="mtr-panel-ringkasan" className="space-y-6">
              {/* LATEST APPLICANTS PREVIEW (FR-MTR-05) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4" id="latest-applicants-sec">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Pelamar Magang Terbaru</h4>
                    <p className="text-xs text-slate-400">Daftar mahasiswa yang baru saja melamar ke lowongan instansi Anda</p>
                  </div>
                  <button onClick={() => setActiveTab('pelamar')} className="text-[#1E3A8A] hover:underline text-xs font-bold flex items-center gap-1">
                    Semua Pelamar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {myApplicants.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <Users className="w-10 h-10 text-slate-200 mx-auto" />
                    <p>Belum ada mahasiswa yang melamar pada postingan lowongan Anda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myApplicants.slice(0, 3).map((appl) => (
                      <div key={appl.id} className="bg-slate-50/80 hover:bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-slate-900 text-sm">{appl.namaMahasiswa}</h5>
                          <div className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">NIM: {appl.nim}</span>
                            <span>• {appl.programStudi}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 pt-0.5">Posisi: <strong className="text-slate-800">{appl.tujuanMagang}</strong></div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => triggerToast('success', `Mengunduh CV & Berkas ${appl.namaMahasiswa} (Simulasi)...`)}
                            className="bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" /> Unduh Berkas
                          </button>
                          <button 
                            onClick={() => setActiveTab('pelamar')}
                            className="bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Tinjau & Verifikasi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL INSTANSI (FR-MTR-02) */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6" id="mtr-panel-profil">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Kelola Identitas Profil Instansi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Informasi ini akan ditampilkan pada lembar detail lowongan di halaman publik CDC.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5" id="profile-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="profile-inputs">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap Instansi / Perusahaan *</label>
                    <input 
                      type="text" 
                      required
                      value={namaInstansi}
                      onChange={(e) => setNamaInstansi(e.target.value)}
                      placeholder="Contoh: PT Go Digital Kendari"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sektor Industri Kemitraan</label>
                    <input 
                      type="text" 
                      value={bidangIndustri}
                      onChange={(e) => setBidangIndustri(e.target.value)}
                      placeholder="Contoh: Teknologi Informasi & Software"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Petugas Penghubung / PIC *</label>
                    <input 
                      type="text" 
                      required
                      value={kontakPerson}
                      onChange={(e) => setKontakPerson(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon / Hotline *</label>
                    <input 
                      type="text" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Situs Web Resmi (Website URL)</label>
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Alamat Lengkap Kantor Pusat / Regional *</label>
                  <textarea 
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Jl. Ahmad Dahlan, Kendari"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition font-normal"
                  ></textarea>
                </div>

                <div className="pt-5 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#10B981] hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: KELOLA LOWONGAN (FR-MTR-03 & FR-MTR-04) */}
          {activeTab === 'lowongan' && (
            <div className="space-y-6" id="mtr-panel-lowongan">
              
              {/* TOP BAR ACTION TRIGGER */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Manajemen Database Lowongan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kelola kuota, batas tanggal pendaftaran, serta publikasi lowongan magang atau kerja.</p>
                </div>
                <button 
                  onClick={() => setShowAddJob(!showAddJob)}
                  className="bg-[#10B981] hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {showAddJob ? "Sembunyikan Form" : "Posting Lowongan Baru"}
                </button>
              </div>

              {/* ADD VACANCY FORM SCREEN */}
              {showAddJob && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn" id="add-vacancy-panel">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#10B981]" /> Form Input Lowongan Kerja / Magang Baru
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Isi detail lengkap lowongan kerja atau program magang yang akan dibuka.</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddJobPosting} className="space-y-6 text-xs" id="add-job-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Judul Rekrutmen Karir *</label>
                        <input 
                          type="text" 
                          required
                          value={judul}
                          onChange={(e) => setJudul(e.target.value)}
                          placeholder="Contoh: Digital Marketer Intern"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Lokasi Penempatan Kerja *</label>
                        <input 
                          type="text" 
                          required
                          value={lokasi}
                          onChange={(e) => setLokasi(e.target.value)}
                          placeholder="Contoh: Kendari (Hybrid)"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Tipe Lowongan *</label>
                        <select 
                          value={tipe}
                          onChange={(e) => setTipe(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm bg-white font-normal transition"
                        >
                          <option value="magang">Magang (Mahasiswa Aktif)</option>
                          <option value="kerja">Kerja (Lulusan Baru / Alumni)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Rencana Kuota Penerimaan (Orang)</label>
                        <input 
                          type="number" 
                          value={kuota}
                          onChange={(e) => setKuota(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Batas Tanggal Pendaftaran (Deadline) *</label>
                        <input 
                          type="date" 
                          required
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                        />
                      </div>
                    </div>

                    {/* Upload Poster / Foto Lowongan (Dashed Dropzone with Clean Preview) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-[#10B981]" /> Upload Poster / Foto Lowongan
                        </label>
                        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 self-start sm:self-auto text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setImageUploadType('file')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              imageUploadType === 'file' 
                                ? 'bg-white text-slate-900 shadow-xs' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Upload File (PNG/JPG)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUploadType('url')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              imageUploadType === 'url' 
                                ? 'bg-white text-slate-900 shadow-xs' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Input URL Gambar
                          </button>
                        </div>
                      </div>

                      {!imageUrl ? (
                        <div 
                          onClick={() => {
                            if (imageUploadType === 'file') {
                              document.getElementById('poster-file-input-mitra')?.click();
                            }
                          }}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-[#10B981] transition cursor-pointer bg-slate-50/50 flex flex-col items-center justify-center text-center group"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#10B981] group-hover:scale-110 transition mb-3">
                            <Upload className="w-6 h-6" />
                          </div>
                          {imageUploadType === 'file' ? (
                            <>
                              <p className="text-sm font-bold text-slate-700">Klik untuk mengunggah poster brosur (PNG, JPG, JPEG)</p>
                              <p className="text-xs text-slate-400 mt-1">Maksimal ukuran file 2MB. Foto akan disimpan dan ditampilkan pada katalog lowongan.</p>
                              <input 
                                id="poster-file-input-mitra"
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </>
                          ) : (
                            <div className="w-full max-w-md space-y-2" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="url" 
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal bg-white shadow-xs transition"
                              />
                              <p className="text-xs text-slate-400">Tempelkan tautan langsung (URL) ke gambar poster/brosur lowongan.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-[#10B981]/40 rounded-2xl p-5 bg-[#10B981]/5 flex flex-col sm:flex-row items-center justify-between gap-6 transition animate-fadeIn">
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md shrink-0">
                              <img src={imageUrl} alt="Pratinjau Poster" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1 text-left">
                              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#10B981]">
                                <CheckCircle className="w-4 h-4 fill-[#10B981] text-white" />
                                <span>Poster Lowongan Terlampir</span>
                              </div>
                              <p className="text-xs text-slate-600 max-w-md leading-relaxed">Foto poster ini siap dipublikasikan ke halaman publik CDC UMK bersama rincian rekrutmen Anda.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 hover:border-rose-200 shrink-0 shadow-2xs"
                          >
                            <Trash2 className="w-4 h-4" /> Hapus / Ganti Foto
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Deskripsi Ringkas Pekerjaan *</label>
                      <textarea 
                        required
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        rows={3}
                        placeholder="Uraikan gambaran umum, lingkup tugas, dan teknologi yang dipakai..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                      ></textarea>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Kualifikasi Persyaratan (Satu baris untuk setiap poin kualifikasi)</label>
                      <textarea 
                        value={kualifikasi}
                        onChange={(e) => setKualifikasi(e.target.value)}
                        rows={3}
                        placeholder="Contoh:&#10;Mahasiswa Teknik Informatika semester 6&#10;Menguasai bahasa pemrograman Javascript"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                      ></textarea>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Benefit Kompensasi (Satu baris untuk setiap poin benefit)</label>
                      <textarea 
                        value={benefit}
                        onChange={(e) => setBenefit(e.target.value)}
                        rows={3}
                        placeholder="Contoh:&#10;Uang saku bulanan&#10;Sertifikat industri dari mitra"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                      ></textarea>
                    </div>

                    <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowAddJob(false)}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="bg-[#10B981] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Posting Lowongan ke Publik
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LISTING VACANCIES WITH MODERN CARDS & STATUS PILLS */}
              {myJobs.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl py-14 text-center text-xs text-slate-400 space-y-2 shadow-sm">
                  <Briefcase className="w-10 h-10 text-slate-200 mx-auto" />
                  <p>Instansi Anda belum memiliki postingan lowongan karir aktif.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="mitra-job-list">
                  {myJobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group" id={`job-box-${job.id}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                            job.tipe === 'magang' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {job.tipe === 'magang' ? 'Program Magang' : 'Lowongan Kerja'}
                          </span>

                          {/* Status Pills */}
                          {job.status === 'published' ? (
                            <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                              Aktif
                            </span>
                          ) : job.status === 'closed' ? (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                              Tutup
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                              In Review
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          {(job.imageUrl || job.flyer || (job.flyers && job.flyers[0]) || job.bannerImage) ? (
                            <img 
                              src={job.imageUrl || job.flyer || (job.flyers && job.flyers[0]) || job.bannerImage} 
                              alt={job.judul}
                              className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100 shadow-xs" 
                            />
                          ) : (
                            <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Briefcase className="w-6 h-6" />
                            </div>
                          )}
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-900 group-hover:text-[#10B981] transition-colors text-base sm:text-lg truncate">{job.judul}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.lokasi}</span>
                              <span className="flex items-center gap-1 shrink-0"><Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kuota: {job.kuota || 3}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" /> Deadline: <strong className="text-slate-600 font-mono">{job.deadline}</strong>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed pt-3 border-t border-slate-100">{job.deskripsi}</p>
                      </div>

                      {/* ACTIONS BAR */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5">
                        <button 
                          onClick={() => handleToggleJobStatus(job.id, job.status)}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-2 rounded-xl font-semibold text-xs transition"
                        >
                          {job.status === 'published' ? 'Tutup Lowongan' : 'Aktifkan Kembali'}
                        </button>

                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DAFTAR PELAMAR (FR-MTR-05) */}
          {activeTab === 'pelamar' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6" id="mtr-panel-pelamar">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Pelamar & Berkas Calon Peserta Magang</h3>
                <p className="text-xs text-slate-500 mt-0.5">Verifikasi berkas, tinjau CV, serta kelola status kelayakan pelamar untuk penempatan magang industri.</p>
              </div>

              {myApplicants.length === 0 ? (
                <div className="text-center py-14 space-y-2" id="applicants-empty">
                  <Users className="w-10 h-10 text-slate-200 mx-auto" />
                  <div className="text-xs text-slate-400">Belum ada pelamar yang mendaftar pada lowongan Anda.</div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100" id="applicants-table-container">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-4">Nama Pelamar</th>
                        <th className="py-3.5 px-4">Posisi Tujuan</th>
                        <th className="py-3.5 px-4">Periode Tanggal</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Tindakan Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700" id="applicants-table-body">
                      {myApplicants.map((appl) => (
                        <tr key={appl.id} className="hover:bg-slate-50/70 transition duration-150">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            <div>{appl.namaMahasiswa}</div>
                            <span className="text-[11px] text-slate-400 block font-normal mt-0.5 font-mono">NIM: {appl.nim} • {appl.programStudi}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">{appl.tujuanMagang}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {appl.tanggalMulai} <span className="text-slate-300">s/d</span> {appl.tanggalSelesai}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider inline-flex items-center gap-1.5 ${
                              appl.status === 'accepted' 
                                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' 
                                : appl.status === 'rejected' 
                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {appl.status === 'under_review' ? 'In Review' : appl.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                            <button 
                              onClick={() => triggerToast('success', `Simulasi download berkas lamaran ${appl.namaMahasiswa}...`)}
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-semibold text-xs transition inline-flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" /> Berkas
                            </button>
                            <button 
                              onClick={() => handleUpdateApplicantStatus(appl.id, 'accepted')}
                              className="bg-[#10B981] hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs"
                            >
                              Terima
                            </button>
                            <button 
                              onClick={() => handleUpdateApplicantStatus(appl.id, 'rejected')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-bold text-xs transition border border-rose-200/50"
                            >
                              Tolak
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SURVEI PENGGUNA LULUSAN (FR-MTR-06) */}
          {activeTab === 'survei' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6" id="mtr-panel-survei">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Survei Kepuasan Mutu Pengguna Lulusan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tanggapan evaluasi Anda sangat penting bagi monitoring akreditasi serta penyempurnaan kurikulum fakultas.</p>
              </div>

              <form onSubmit={handleSubmitSurvey} className="space-y-6" id="survey-feedback-form">
                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-slate-700 text-xs">Pilih Alumni Terkait (Karyawan/Magang) *</label>
                  <select 
                    required
                    value={selectedAlumniId}
                    onChange={(e) => setSelectedAlumniId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal bg-white transition"
                  >
                    <option value="">-- Silakan Pilih Lulusan / Alumni --</option>
                    <option value="alm_1_fadly">Muhammad Fadly Alamsyah (Teknik Informatika)</option>
                    <option value="alm_2_faisal">Fachrul Alam Prasetyo, S.Kom. (Teknik Informatika)</option>
                    <option value="alm_3_mega">Andi Megawati, S.E. (Manajemen)</option>
                  </select>
                </div>

                {/* FIVE CORE DIMENSIONS RATING FOR SURVEI_LULUSAN */}
                <div className="space-y-3 border-t border-slate-100 pt-5" id="survei-ratings">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Skor Evaluasi (Skala 1 - 5)</h4>
                  
                  {[
                    { label: 'Kualitas Umum Kinerja Lulusan', state: kualitasLulusan, setter: setKualitasLulusan },
                    { label: 'Kemampuan Teknis Keilmuan', state: kemampuanTeknis, setter: setKemampuanTeknis },
                    { label: 'Cakupan Kemampuan Komunikasi', state: kemampuanKomunikasi, setter: setKemampuanKomunikasi },
                    { label: 'Etika, Kedisiplinan & Sikap', state: etikaKerja, setter: setEtikaKerja },
                    { label: 'Kolaborasi & Kemampuan Kerja Tim', state: kemampuanKerjaTim, setter: setKemampuanKerjaTim }
                  ].map((dim, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-100 transition" id={`dim-row-${i}`}>
                      <span className="text-xs font-semibold text-slate-800">{dim.label}</span>
                      
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={dim.state}
                          onChange={(e) => dim.setter(Number(e.target.value))}
                          className="w-36 accent-[#10B981] rounded-lg cursor-pointer"
                        />
                        <span className="font-extrabold text-[#10B981] text-xs border border-[#10B981]/20 bg-emerald-50/50 px-2.5 py-1 rounded-lg min-w-[36px] text-center font-mono">{dim.state} ★</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700">Tanggapan, Kesan & Saran Perbaikan Akademis</label>
                  <textarea 
                    value={surveiSaran}
                    onChange={(e) => setSurveiSaran(e.target.value)}
                    rows={4}
                    placeholder="Uraikan kelebihan lulusan serta kritik saran untuk penyelarasan kurikulum ke depannya..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm transition font-normal"
                  ></textarea>
                </div>

                <div className="pt-5 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#10B981] hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Kirim Hasil Evaluasi Mutu
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

