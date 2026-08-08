/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserType, 
  Mahasiswa, 
  Alumni, 
  Mitra, 
  Lowongan, 
  PengajuanMagang, 
  TracerStudy 
} from '../types';
import { getFromDB } from '../data';
import { 
  Layers, 
  BookOpen, 
  Users, 
  Building2, 
  FileText, 
  Search, 
  Clock, 
  Info, 
  Sparkles,
  Award
} from 'lucide-react';

interface ViewerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function ViewerDashboard({ user, onLogout }: ViewerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'tracer' | 'magang' | 'mitra'>('ringkasan');
  
  // Data States
  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [mitra, setMitra] = useState<Mitra[]>([]);
  const [appls, setAppls] = useState<PengajuanMagang[]>([]);
  const [tracers, setTracers] = useState<TracerStudy[]>([]);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);

  // Filter selection
  const [prodiFilter, setProdiFilter] = useState<'all' | 'Teknik Informatika' | 'Sistem Informasi' | 'Manajemen' | 'Hukum'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setStudents(getFromDB<Mahasiswa>('mahasiswa'));
    setAlumni(getFromDB<Alumni>('alumni'));
    setMitra(getFromDB<Mitra>('mitra'));
    setAppls(getFromDB<PengajuanMagang>('pengajuan_magang'));
    setTracers(getFromDB<TracerStudy>('tracer_studies'));
    setLowongan(getFromDB<Lowongan>('lowongan'));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tracer studies dynamically
  const filteredTracers = tracers.filter(t => {
    const matchesProdi = prodiFilter === 'all' ? true : t.programStudi === prodiFilter;
    const matchesSearch = t.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.namaInstansi && t.namaInstansi.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.jabatan && t.jabatan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProdi && matchesSearch;
  });

  // Filter mahasiswa magang dynamically
  const filteredAppls = appls.filter(a => {
    const matchesProdi = prodiFilter === 'all' ? true : a.programStudi === prodiFilter;
    const matchesSearch = a.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.nim.includes(searchQuery) ||
                          a.tujuanMagang.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProdi && matchesSearch;
  });

  // Analytics
  const countWorking = tracers.filter(t => t.statusPekerjaan === 'bekerja').length;
  const countEntre = tracers.filter(t => t.statusPekerjaan === 'wirausaha').length;
  const countStudy = tracers.filter(t => t.statusPekerjaan === 'lanjut_studi').length;
  const countUnemployed = tracers.filter(t => t.statusPekerjaan === 'belum_bekerja').length;
  const totalTracerCount = tracers.length || 1;

  const pctWorking = Math.round((countWorking / totalTracerCount) * 100);
  const pctEntre = Math.round((countEntre / totalTracerCount) * 100);
  const pctStudy = Math.round((countStudy / totalTracerCount) * 100);
  const pctUnemployed = Math.round((countUnemployed / totalTracerCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-xs sm:text-sm" id="vw-dashboard">
      
      {/* HEADER NAVBAR */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 h-18 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white">MONITORING PORTAL MONITOR (VIEWER)</div>
            <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Universitas Muhammadiyah Kendari</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold font-mono text-[10px]">HEAD OF ACADEMIC AFFAIRS</span>
          <button 
            onClick={onLogout}
            className="bg-slate-800 hover:bg-slate-705 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* BODY CORES CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8" id="vw-body-grid">
        
        {/* SIDEBAR NAVIGATION TAB */}
        <aside className="lg:col-span-3 space-y-6" id="vw-sidebar">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="font-bold text-slate-900 border-b border-slate-50 pb-2 text-[10px] uppercase tracking-wider text-slate-400">MONITORING INTERN</div>
            
            <nav className="flex flex-col gap-1.5" id="vw-nav-menu">
              {[
                { id: 'ringkasan', label: 'Ringkasan Eksekutif', icon: Layers },
                { id: 'tracer', label: 'Tracer Study Audit', icon: FileText },
                { id: 'magang', label: 'Penempatan Magang', icon: Users },
                { id: 'mitra', label: 'Lembaga Kerja Sama', icon: Building2 }
              ].map((menu) => {
                const Icon = menu.icon;
                return (
                  <button
                    key={menu.id}
                    id={`vw-tab-${menu.id}`}
                    onClick={() => setActiveTab(menu.id as any)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-semibold text-xs sm:text-sm transition ${
                      activeTab === menu.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 font-bold'
                        : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {menu.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* CORE DISPOSABLE GRID MAIN PANEL */}
        <main className="lg:col-span-9" id="vw-main">
          
          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div id="vw-panel-ringkasan" className="space-y-6">
              
              {/* SHINY WELCOME HEADER */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white relative flex items-center justify-between" id="vw-welcome">
                <div className="space-y-2 max-w-lg z-14">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/10">Read Only Viewer</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Selamat Datang, {user.name}</h3>
                  <p className="text-slate-305 text-xs sm:text-sm leading-relaxed">
                    Sistem portal CDC memfasilitasi Anda melacak serapan lulusan, diagram proporsi alumni, and evaluasi kemitraan demi kredibilitas asrama akreditasi program studi.
                  </p>
                </div>
                <div className="hidden md:block opacity-10">
                  <Award className="w-20 h-20 text-emerald-400 animate-spin-slow" />
                </div>
              </div>

              {/* READ-ONLY CORE COUNTERS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="vw-summary-counter">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Rasio Tracer Resmi</div>
                  <div className="text-xl font-extrabold text-slate-800">{pctWorking + pctEntre}% Bekerja</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Sensus Ter-Submit</div>
                  <div className="text-xl font-extrabold text-blue-600">{tracers.length} Respon</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Mahasiswa Magang</div>
                  <div className="text-xl font-extrabold text-emerald-600">{appls.length} Orang</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Masa Tunggu Unggul</div>
                  <div className="text-xl font-extrabold text-teal-600">{"< 3 Bulan"}</div>
                </div>
              </div>

              {/* READ ONLY GRAPH BLOCK */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="vw-tracer-graphs">
                <div>
                  <h4 className="font-extrabold text-slate-850 text-sm">Visual Pola Penyerapan Alumni (Tracer Study metrics)</h4>
                  <p className="text-slate-400 text-xs">Proporsi diagram lapangan pekerjaan terkini yang dilaporkan alumni secara mandiri.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center pt-2" id="vw-metric-visual">
                  <div className="space-y-3.5">
                    {[
                      { label: 'Bekerja Sektor Swasta / BUMN', pct: pctWorking, color: 'bg-blue-600' },
                      { label: 'Berwirausaha Mandiri / Startup', pct: pctEntre, color: 'bg-emerald-500' },
                      { label: 'Studi Lanjut S2 / S3', pct: pctStudy, color: 'bg-teal-500' },
                      { label: 'Mencari Peluang / Mengabdi', pct: pctUnemployed, color: 'bg-rose-450' }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700">{stat.label}</span>
                          <span className="font-extrabold text-slate-900">{stat.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`${stat.color} h-full rounded-full`} style={{ width: `${stat.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 border border-slate-50 bg-slate-50/50 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-700">Audit Penyerapan Lulusan</div>
                    <div className="font-mono text-4xl font-extrabold text-blue-600">{pctWorking + pctEntre} %</div>
                    <p className="text-[10px] text-slate-450 text-center">Komposisi alumni yang sukses berkegiatan paska kelulusan (bekerja/wirausaha).</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TRACER AUDIT (dashboard/viewer/tracer-study) */}
          {activeTab === 'tracer' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="vw-panel-tracer">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-905 text-lg">Audit Sensus Kelayakan Tracer Study</h3>
                  <p className="text-xs text-slate-400 font-medium">Rekapitulasi read-only respon survei alumni untuk monitoring akreditasi BAN-PT.</p>
                </div>

                {/* FILTERS DROPDOWN */}
                <div className="flex items-center gap-3" id="vw-tracer-filters">
                  <select 
                    value={prodiFilter}
                    onChange={(e: any) => setProdiFilter(e.target.value)}
                    className="px-3.5 py-1.5 bg-white border border-slate-205 text-xs font-bold rounded-xl"
                  >
                    <option value="all">Semua Prodi</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Manajemen">Manajemen</option>
                  </select>
                </div>
              </div>

              {/* SEARCH BOX FOR EASY FILTERING */}
              <div className="relative w-full max-w-sm" id="vw-tracer-search">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 select-none pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama alumni atau instansi..."
                  className="w-full pl-8.5 pr-4 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Nama Alumni</th>
                      <th className="py-3 px-4">Prodi/Tahun Lulus</th>
                      <th className="py-3 px-4">Sektor Pekerjaan / Instansi</th>
                      <th className="py-3 px-4 text-center">Gaji</th>
                      <th className="py-3 px-4 text-right">Kesesuaian Sektor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-705">
                    {filteredTracers.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-4 font-bold text-slate-900">{tr.nama}</td>
                        <td className="py-4 px-4 font-medium">{tr.programStudi} • {tr.tahunLulus}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold">{tr.statusPekerjaan}</span>
                          <span className="text-[10px] text-slate-450 block truncate max-w-[150px]">{tr.namaInstansi || '-'}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-650 font-mono text-[11px] text-center">{tr.rangePenghasilan ? tr.rangePenghasilan.replace('_', ' ') : '-'}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tr.kesesuaianBidang === 'sangat_sesuai' || tr.kesesuaianBidang === 'sesuai'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {tr.kesesuaianBidang ? tr.kesesuaianBidang.replace('_', ' ') : 'Belum Kerja'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REKAP MAGANG (dashboard/viewer/magang) */}
          {activeTab === 'magang' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="vw-panel-magang">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-905 text-lg">Pemantauan & Rekapitulasi Penempatan Magang</h3>
                  <p className="text-xs text-slate-400 font-medium font-sans">Data read-only rekapitulasi penempatan magang mahasiswa aktif terintegrasi CDC.</p>
                </div>

                <div className="flex items-center gap-3">
                  <select 
                    value={prodiFilter}
                    onChange={(e: any) => setProdiFilter(e.target.value)}
                    className="px-3.5 py-1.5 bg-white border border-slate-205 text-xs font-bold rounded-xl"
                  >
                    <option value="all">Semua Prodi</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Informasi">Sistem Informasi</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto text-slate-700">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Nama Mahasiswa</th>
                      <th className="py-3 px-4">Instansi Tempat Magang</th>
                      <th className="py-3 px-4">Periode Tanggal</th>
                      <th className="py-3 px-4 text-right">Status Selesai Magang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAppls.map((ap) => (
                      <tr key={ap.id}>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {ap.namaMahasiswa}
                          <span className="text-[10px] text-slate-450 block font-mono">NIM: {ap.nim} • {ap.programStudi}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800">{ap.tujuanMagang}</td>
                        <td className="py-4 px-4 text-slate-450 font-mono text-[11px] font-sans">
                          {ap.tanggalMulai} s/d {ap.tanggalSelesai}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            ap.status === 'accepted' || ap.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          }`}>
                            {ap.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE KEMITRAAN (dashboard/viewer/laporan) */}
          {activeTab === 'mitra' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="vw-panel-mitra">
              <div>
                <h3 className="font-bold text-slate-905 text-lg">Daftar Lembaga & Mitra Industri Terkait</h3>
                <p className="text-xs text-slate-400 font-medium">Audit data lembaga atau instansi formal daerah Sultra yang menampung magang kerja sama.</p>
              </div>

              <div className="overflow-x-auto text-slate-700">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Nama Instansi Kemitraan</th>
                      <th className="py-3 px-4">Sektor Industri</th>
                      <th className="py-3 px-4">Alamat Lembaga</th>
                      <th className="py-3 px-4 text-right">No. Hotline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mitra.map((mr) => (
                      <tr key={mr.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-4 font-extrabold text-slate-900">{mr.namaInstansi}</td>
                        <td className="py-4 px-4 font-medium">{mr.bidangIndustri || '-'}</td>
                        <td className="py-4 px-4 text-slate-500 text-xs truncate max-w-[200px]">{mr.alamat || '-'}</td>
                        <td className="py-4 px-4 text-right font-mono text-[11px] text-slate-500">{mr.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
