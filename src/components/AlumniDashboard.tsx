/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserType, 
  Alumni, 
  Lowongan, 
  TracerStudy 
} from '../types';
import { 
  getFromDB, 
  saveToDB, 
  insertToDB, 
  updateInDB 
} from '../data';
import { 
  FileText, 
  User as UserIcon, 
  Briefcase, 
  Clock, 
  History, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Building2, 
  DollarSign, 
  ArrowRight,
  GraduationCap,
  Sparkles,
  Info 
} from 'lucide-react';

interface AlumniDashboardProps {
  user: UserType;
  onLogout: () => void;
  allLowongan: Lowongan[];
}

export default function AlumniDashboard({ user, onLogout, allLowongan }: AlumniDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'profil' | 'tracer' | 'riwayat' | 'jobboard'>('ringkasan');
  
  // States
  const [alumniData, setAlumniData] = useState<Alumni | null>(null);
  const [myTracerHistory, setMyTracerHistory] = useState<TracerStudy[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form States
  const [nim, setNim] = useState('');
  const [phone, setPhone] = useState('');
  const [programStudi, setProgramStudi] = useState('Teknik Informatika');
  const [fakultas, setFakultas] = useState('Fakultas Teknik');
  const [tahunLulus, setTahunLulus] = useState('2024');
  const [statusPekerjaan, setStatusPekerjaan] = useState<'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja'>('bekerja');
  const [instansiKerja, setInstansiKerja] = useState('');
  const [jabatan, setJabatan] = useState('');

  // Tracer Study Form States
  const [tracerStatusJob, setTracerStatusJob] = useState<'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja'>('bekerja');
  const [masaTunggu, setMasaTunggu] = useState<'kurang_3_bulan' | '3_6_bulan' | '6_12_bulan' | 'lebih_12_bulan'>('kurang_3_bulan');
  const [tracerInstansi, setTracerInstansi] = useState('');
  const [tracerJabatan, setTracerJabatan] = useState('');
  const [tracerBidang, setTracerBidang] = useState('');
  const [kesesuaian, setKesesuaian] = useState<'sangat_sesuai' | 'sesuai' | 'kurang_sesuai' | 'tidak_sesuai'>('sangat_sesuai');
  const [penghasilan, setPenghasilan] = useState<'kurang_2jt' | '2_5jt' | '5_10jt' | 'lebih_10jt'>('2_5jt');
  const [saranKampus, setSaranKampus] = useState('');

  // Load alumni profiles
  const loadAlumniData = () => {
    const alumniList = getFromDB<Alumni>('alumni');
    let alum = alumniList.find(a => a.userId === user.id);

    if (!alum) {
      // Create alumni record on the fly
      const newAlum: Alumni = {
        id: `alm_${Date.now()}`,
        userId: user.id,
        nim: '',
        nama: user.name,
        email: user.email,
        phone: user.phone || '',
        programStudi: 'Teknik Informatika',
        fakultas: 'Fakultas Teknik',
        tahunLulus: '2024',
        statusPekerjaan: 'bekerja',
        instansiKerja: '',
        jabatan: ''
      };
      insertToDB<Alumni>('alumni', newAlum);
      alum = newAlum;
    }

    setAlumniData(alum);
    setNim(alum.nim || '');
    setPhone(alum.phone || '');
    setProgramStudi(alum.programStudi || 'Teknik Informatika');
    setFakultas(alum.fakultas || 'Fakultas Teknik');
    setTahunLulus(alum.tahunLulus || '2024');
    setStatusPekerjaan(alum.statusPekerjaan || 'bekerja');
    setInstansiKerja(alum.instansiKerja || '');
    setJabatan(alum.jabatan || '');

    // Set tracer form initial synced items
    setTracerStatusJob(alum.statusPekerjaan || 'bekerja');
    setTracerInstansi(alum.instansiKerja || '');
    setTracerJabatan(alum.jabatan || '');

    // Load History
    const tracers = getFromDB<TracerStudy>('tracer_studies');
    const myHistory = tracers.filter(t => t.userId === user.id);
    setMyTracerHistory(myHistory);
  };

  useEffect(() => {
    loadAlumniData();
  }, [user.id]);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Profile update (FR-ALM-02)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniData) return;

    const updatedAlumni: Alumni = {
      ...alumniData,
      nim,
      phone,
      programStudi,
      fakultas,
      tahunLulus,
      statusPekerjaan,
      instansiKerja: statusPekerjaan === 'bekerja' || statusPekerjaan === 'wirausaha' ? instansiKerja : undefined,
      jabatan: statusPekerjaan === 'bekerja' || statusPekerjaan === 'wirausaha' ? jabatan : undefined
    };

    updateInDB<Alumni>('alumni', updatedAlumni);
    
    // Simulating updates to users list
    const users = getFromDB<UserType>('users');
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, phone };
      }
      return u;
    });
    saveToDB('users', updatedUsers);

    setAlumniData(updatedAlumni);
    triggerToast('success', 'Profil alumni berhasil diperbarui di database SQL.');
  };

  // Submit Tracer Study Form (FR-ALM-03)
  const handleSubmitTracer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniData) return;

    if (!tahunLulus) {
      triggerToast('error', 'Lengkapi profil (tahun lulus) Anda terlebih dahulu.');
      return;
    }

    const newTracer: TracerStudy = {
      id: `tr_${Date.now()}`,
      alumniId: alumniData.id,
      userId: user.id,
      nama: user.name,
      programStudi: programStudi,
      tahunLulus: tahunLulus,
      statusPekerjaan: tracerStatusJob,
      masaTungguKerja: tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha' ? masaTunggu : undefined,
      namaInstansi: tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha' ? tracerInstansi : undefined,
      jabatan: tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha' ? tracerJabatan : undefined,
      bidangPekerjaan: tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha' ? tracerBidang : undefined,
      kesesuaianBidang: tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha' ? kesesuaian : undefined,
      rangePenghasilan: tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha' ? penghasilan : undefined,
      saranUntukKampus: saranKampus || undefined,
      submittedAt: new Date().toISOString()
    };

    insertToDB<TracerStudy>('tracer_studies', newTracer);

    // Also update student job status globally for consistency
    const updatedAlum: Alumni = {
      ...alumniData,
      statusPekerjaan: tracerStatusJob,
      instansiKerja: tracerInstansi,
      jabatan: tracerJabatan
    };
    updateInDB<Alumni>('alumni', updatedAlum);
    setAlumniData(updatedAlum);

    // Clean tracer fields
    setSaranKampus('');
    
    // Refresh History
    loadAlumniData();
    setActiveTab('ringkasan');
    triggerToast('success', 'Tracer Study berhasil disimpan dan direkap di dashboard operator CDC.');
  };

  const alreadySubmitted = myTracerHistory.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="alm-dashboard">
      {/* LOCAL TOAST NOTIFIER */}
      {message && (
        <div 
          id="alm-toast"
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm max-w-sm flex items-center gap-2.5 transition-all ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <div>{message.text}</div>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40" id="alm-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight">PORTAL ALUMNI</div>
              <div className="text-slate-400 text-xs text-[10px] sm:text-xs">CDC Universitas Muhammadiyah Kendari</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-xs text-white leading-none">{user.name}</div>
              <div className="text-emerald-400 text-[10px] font-medium leading-tight mt-0.5">Lulusan: {tahunLulus}</div>
            </div>
            <button 
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition"
              id="alm-btn-logout"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* BODY GRID CORE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8" id="alm-grid-layout">
        
        {/* SIDEBAR NAVIGATION CONTROL */}
        <aside className="lg:col-span-3 space-y-6" id="alm-sidebar">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center font-bold text-base">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-900 text-sm truncate">{user.name}</div>
                <div className="text-slate-400 text-xs truncate">{user.email}</div>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5" id="alm-nav-menu">
              {[
                { id: 'ringkasan', label: 'Ringkasan Karir', icon: GraduationCap },
                { id: 'profil', label: 'Profil Sensus', icon: UserIcon },
                { id: 'tracer', label: 'Isi Tracer Study', icon: FileText },
                { id: 'riwayat', label: 'Riwayat Pengisian', icon: History },
                { id: 'jobboard', label: 'Lowongan Kerja Terbuka', icon: Briefcase }
              ].map((menu) => {
                const Icon = menu.icon;
                return (
                  <button
                    key={menu.id}
                    id={`alm-tab-${menu.id}`}
                    onClick={() => setActiveTab(menu.id as any)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === menu.id
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {menu.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-slate-900 text-slate-400 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-3" id="alm-side-status">
            <h4 className="font-bold text-white text-xs uppercase tracking-wide">Status Sensus Alumni</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Tahun Lulus:</span>
                <span className="font-bold text-blue-400">{tahunLulus}</span>
              </div>
              <div className="flex justify-between">
                <span>Tracer Stat:</span>
                <span className={`font-bold ${alreadySubmitted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {alreadySubmitted ? 'Selesai Sensus' : 'Belum Sensus'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* CORE CONTENT DISPLAY BOARD */}
        <main className="lg:col-span-9" id="alm-dashboard-main">
          
          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div id="alm-panel-ringkasan" className="space-y-6">
              
              {/* WELCOME BLOCK */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex items-center justify-between" id="alm-welcome">
                <div className="space-y-2 max-w-lg z-14">
                  <span className="bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-blue-505/10">Ikatan Alumni</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Halo, Rekan Alumni UMK!</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Terima kasih telah bergabung di simfoni portal CDC. Partisipasi Anda merespons Tracer Study sangat berharga bagi peningkatan mutu kelayakan akreditasi kampus.
                  </p>
                </div>
                <div className="hidden md:block opacity-10">
                  <GraduationCap className="w-20 h-20 text-blue-400" />
                </div>
              </div>

              {/* TRACER FILLING ALERT/STATUS PANEL */}
              {alreadySubmitted ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4" id="alm-alert-completed">
                  <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
                    <CheckCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Terima Kasih, Anda Telah Berpartisipasi</h4>
                    <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">
                      Kuesioner Tracer Study Anda telah berhasil direkam di database kampus pada {new Date(myTracerHistory[myTracerHistory.length-1].submittedAt).toLocaleDateString('id-ID')}. Anda dapat memperbaruinya sewaktu-waktu jika memiliki perubahan instansi kerja.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4" id="alm-alert-pending">
                  <div className="bg-amber-550 text-amber-800 bg-amber-500/20 p-2.5 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-700 animate-bounce" />
                  </div>
                  <div className="space-y-3 flex-grow">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Himbauan Khusus: Pengisian Tracer Study</h4>
                      <p className="text-slate-650 text-xs leading-relaxed">
                        Anda belum mengisi formulir pelacakan mutu lulusan (Tracer Study). Mohon bersedia meluangkan waktu 2 menit saja untuk melengkapi instrumen survei akreditasi.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('tracer')}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      Buka Lembar Tracer Study <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CAREER RECRUITMENTS OPPORTUNITY FOR ALUMNI */}
              <div className="space-y-4" id="hiring-opportunities">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Peluang Lowongan Kerja Alumni</h4>
                  <button onClick={() => setActiveTab('jobboard')} className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1">
                    Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allLowongan.filter(l => l.tipe === 'kerja' && l.status === 'published').slice(0, 2).map((job) => (
                    <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between" id={`job-recom-${job.id}`}>
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] border border-blue-100">Karier Alumni</span>
                        <h5 className="font-bold text-slate-850 text-sm line-clamp-1">{job.judul}</h5>
                        <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5" /> {job.namaInstansi}
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('jobboard')}
                        className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 mt-4"
                      >
                        Detail & Kualifikasi <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROFIL ALUMNI (FR-ALM-02) */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="alm-panel-profil">
              <div>
                <h3 className="font-bold text-slate-905 text-lg">Kelola Profil Karir Alumni</h3>
                <p className="text-xs text-slate-400">Hubungkan data kelulusan serta kontak valid Anda dengan CDC Universitas Muhammadiyah Kendari.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5" id="profile-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="profile-inputs">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-705">Nomor Induk Mahasiswa / Alumni</label>
                    <input 
                      type="text" 
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="Contoh: 202001045"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-705">Nomor Telepon / WhatsApp</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0811xxxx"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-750">Program Studi Kelulusan</label>
                    <select 
                      value={programStudi}
                      onChange={(e) => setProgramStudi(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                      <option value="Manajemen">Manajemen</option>
                      <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris</option>
                      <option value="Agribisnis">Agribisnis</option>
                      <option value="Hukum">Hukum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-750">Fakultas</label>
                    <select 
                      value={fakultas}
                      onChange={(e) => setFakultas(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="Fakultas Teknik">Fakultas Teknik</option>
                      <option value="Fakultas Ekonomi dan Bisnis Islam">Fakultas Ekonomi dan Bisnis Islam</option>
                      <option value="Fakultas Hukum">Fakultas Hukum</option>
                      <option value="Fakultas Keguruan dan Ilmu Pendidikan">Fakultas Keguruan dan Ilmu Pendidikan</option>
                      <option value="Fakultas Pertanian">Fakultas Pertanian</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-755">Tahun Kelulusan *</label>
                    <input 
                      type="text" 
                      required
                      value={tahunLulus}
                      onChange={(e) => setTahunLulus(e.target.value)}
                      placeholder="2024"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-755">Status Pekerjaan Sekarang *</label>
                    <select 
                      value={statusPekerjaan}
                      onChange={(e) => setStatusPekerjaan(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="bekerja">Bekerja (Karyawan / Instansi)</option>
                      <option value="wirausaha">Berwirausaha (Mandiri)</option>
                      <option value="lanjut_studi">Lanjut Studi Pascasarjana</option>
                      <option value="belum_bekerja">Belum Bekerja / Mencari Peluang</option>
                    </select>
                  </div>
                </div>

                {/* VISIBLE ONLY IF BEKERJA/WIRAUSAHA */}
                {(statusPekerjaan === 'bekerja' || statusPekerjaan === 'wirausaha') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-50" id="employment-meta">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Instansi / Usaha *</label>
                      <input 
                        type="text" 
                        required
                        value={instansiKerja}
                        onChange={(e) => setInstansiKerja(e.target.value)}
                        placeholder="Contoh: PT Go Digital Kendari"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Jabatan / Posisi *</label>
                      <input 
                        type="text" 
                        required
                        value={jabatan}
                        onChange={(e) => setJabatan(e.target.value)}
                        placeholder="Contoh: Web Developer"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Simpan Perubahan Database
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: TRACER STUDY FORM (FR-ALM-03) */}
          {activeTab === 'tracer' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="alm-panel-tracer">
              <div>
                <h3 className="font-bold text-slate-905 text-lg">Instrumen Kuisioner Tracer Study</h3>
                <p className="text-xs text-slate-400">Lembar pelacakan masa tunggu lulusan serta keselarasan kurikulum akademis UM Kendari dengan ekosistem kerja.</p>
              </div>

              <form onSubmit={handleSubmitTracer} className="space-y-6" id="tracer-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="tracer-survey-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status Pekerjaan *</label>
                    <select 
                      value={tracerStatusJob}
                      onChange={(e) => setTracerStatusJob(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="bekerja">Bekerja</option>
                      <option value="wirausaha">Wirausaha</option>
                      <option value="lanjut_studi">Lanjut Studi</option>
                      <option value="belum_bekerja">Belum Bekerja</option>
                    </select>
                  </div>

                  {/* VISIBLE ONLY IF BEKERJA/WIRAUSAHA */}
                  {(tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Masa Tunggu Mendapat Pekerjaan *</label>
                      <select 
                        value={masaTunggu}
                        onChange={(e) => setMasaTunggu(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      >
                        <option value="kurang_3_bulan">Kurang dari 3 Bulan</option>
                        <option value="3_6_bulan">3 - 6 Bulan</option>
                        <option value="6_12_bulan">6 - 12 Bulan</option>
                        <option value="lebih_12_bulan">Lebih dari 12 Bulan</option>
                      </select>
                    </div>
                  )}
                </div>

                {(tracerStatusJob === 'bekerja' || tracerStatusJob === 'wirausaha') && (
                  <div className="space-y-5 pt-4 border-t border-slate-50" id="tracer-survey-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Nama Instansi / Perusahaan *</label>
                        <input 
                          type="text" 
                          required
                          value={tracerInstansi}
                          onChange={(e) => setTracerInstansi(e.target.value)}
                          placeholder="Contoh: PT Go Digital Kendari"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Nama Jabatan *</label>
                        <input 
                          type="text" 
                          required
                          value={tracerJabatan}
                          onChange={(e) => setTracerJabatan(e.target.value)}
                          placeholder="Contoh: Officer IT"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Bidang Kerjaan *</label>
                        <input 
                          type="text" 
                          required
                          value={tracerBidang}
                          onChange={(e) => setTracerBidang(e.target.value)}
                          placeholder="Contoh: Perbankan / Teknologi / Layanan"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Kesesuaian Bidang Keilmuan / Prodi *</label>
                        <select 
                          value={kesesuaian}
                          onChange={(e) => setKesesuaian(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                        >
                          <option value="sangat_sesuai">Sangat Sesuai</option>
                          <option value="sesuai">Sesuai</option>
                          <option value="kurang_sesuai">Kurang Sesuai</option>
                          <option value="tidak_sesuai">Tidak Sesuai / Bergeser</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Range Pendapatan / Gaji Bulanan *</label>
                        <select 
                          value={penghasilan}
                          onChange={(e) => setPenghasilan(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                        >
                          <option value="kurang_2jt">Kurang dari Rp 2.000.000</option>
                          <option value="2_5jt">Rp 2.000.000 - Rp 5.000.000</option>
                          <option value="5_10jt">Rp 5.000.000 - Rp 10.000.000</option>
                          <option value="lebih_10jt">Lebih dari Rp 10.000.000</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-4 border-t border-slate-50">
                  <label className="text-xs font-bold text-slate-700">Saran / Rekomendasi Kritik Untuk Perbaikan Kurikulum Kampus</label>
                  <textarea 
                    value={saranKampus}
                    onChange={(e) => setSaranKampus(e.target.value)}
                    rows={4}
                    placeholder="Contoh: Pembelajaran soft-skills komunikasi and praktik lab basis data nyata diperbanyak."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Kirim Lembar Survei Sensus
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: RIWAYAT TRACER STUDY */}
          {activeTab === 'riwayat' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="alm-panel-riwayat">
              <div>
                <h3 className="font-bold text-slate-905 text-lg">Riwayat Sensus Tracer Study Anda</h3>
                <p className="text-xs text-slate-400">Lembar audit digital kepesertaan sensus alumni di server kampusnya.</p>
              </div>

              {myTracerHistory.length === 0 ? (
                <div className="text-center py-12" id="riwayat-empty">
                  <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs text-slate-500">Belum ada riwayat pengisian kuesioner.</div>
                </div>
              ) : (
                <div className="space-y-4" id="riwayat-list-cards">
                  {myTracerHistory.map((tr) => (
                    <div key={tr.id} className="border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs" id={`history-card-${tr.id}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-3">
                        <div>
                          <div className="text-xs text-slate-400 font-medium">No. Laporan: {tr.id}</div>
                          <h4 className="font-bold text-slate-800 text-sm">Status Laporan: {tr.statusPekerjaan.toUpperCase()}</h4>
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-sans font-mono whitespace-nowrap">
                          Diajukan: {new Date(tr.submittedAt).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans text-slate-500">
                        {tr.namaInstansi && (
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Tempat Kerja</span>
                            <span className="font-semibold text-slate-800 block truncate">{tr.namaInstansi}</span>
                          </div>
                        )}
                        {tr.jabatan && (
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Jabatan</span>
                            <span className="font-semibold text-slate-800 block truncate">{tr.jabatan}</span>
                          </div>
                        )}
                        {tr.kesesuaianBidang && (
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Keselarasan</span>
                            <span className="font-semibold text-slate-800 block truncate">{tr.kesesuaianBidang.replace('_', ' ')}</span>
                          </div>
                        )}
                        {tr.rangePenghasilan && (
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Estimasi Gaji</span>
                            <span className="font-semibold text-slate-800 block truncate">{tr.rangePenghasilan.replace('_', ' ')}</span>
                          </div>
                        )}
                      </div>

                      {tr.saranUntukKampus && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="text-xs font-bold text-slate-700 mb-1">Masukan dan Saran Dekanat:</div>
                          <p className="text-xs text-slate-650 italic">"{tr.saranUntukKampus}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LOWONGAN KERJA ALUMNI */}
          {activeTab === 'jobboard' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="alm-panel-jobboard">
              <div>
                <h3 className="font-bold text-slate-905 text-lg">Papan Lowongan Kerja khusus Alumni</h3>
                <p className="text-xs text-slate-400">Dua langkah praktis: pelajari kualifikasi and langsung kirim CV lamaran Anda ke institusi mitra.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="job-grid">
                {allLowongan.filter(l => l.tipe === 'kerja' && l.status === 'published').map((job) => (
                  <div key={job.id} className="border border-slate-100 rounded-2xl p-6 space-y-4 hover:shadow-md transition flex flex-col justify-between" id={`job-card-${job.id}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold text-[10px] uppercase">
                          Hiring Lulusan
                        </span>
                        <span className="text-[10px] text-slate-450 font-mono">Deadline: {job.deadline}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{job.judul}</h4>
                        <div className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.namaInstansi}
                        </div>
                        <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.lokasi}
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {job.deskripsi}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                        <div className="font-bold text-slate-700">Persyaratan Utama:</div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {job.kualifikasi.slice(0, 2).map((kua, idx) => (
                            <li key={idx} className="truncate">{kua}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button 
                      onClick={() => triggerToast('success', `Simulasi Pengiriman CV & Lamaran ke "${job.namaInstansi}" berhasil!`)}
                      className="w-full bg-blue-650 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 mt-4"
                      id={`job-apply-btn-${job.id}`}
                    >
                      Kirim Lamaran Karir <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
