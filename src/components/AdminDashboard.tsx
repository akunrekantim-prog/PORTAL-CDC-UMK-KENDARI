/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User as UserType,
  UserRole,
  Mahasiswa,
  Alumni,
  Mitra,
  Lowongan,
  PengajuanMagang,
  TracerStudy,
  Berita,
  Pengumuman
} from '../types';
import {
  getFromDB,
  saveToDB,
  insertToDB,
  updateInDB,
  deleteInDB,
  DBKey
} from '../data';
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  BookOpen,
  Layers,
  Sparkles,
  Info,
  Image,
  MoreVertical,
  Eye,
  Save,
  Send,
  ChevronDown,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'mahasiswa' | 'alumni' | 'mitra' | 'pengajuan' | 'tracer' | 'konten' | 'laporan' | 'users' | 'approval'>('ringkasan');

  // Database States
  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [mitra, setMitra] = useState<Mitra[]>([]);
  const [appls, setAppls] = useState<PengajuanMagang[]>([]);
  const [tracers, setTracers] = useState<TracerStudy[]>([]);
  const [news, setNews] = useState<Berita[]>([]);
  const [newsletters, setNewsletters] = useState<Pengumuman[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);

  const [alumniQuery, setAlumniQuery] = useState('');
  const [alumniStatus, setAlumniStatus] = useState('Semua');
  const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<Alumni | null>(null);
  const [alumniCsvText, setAlumniCsvText] = useState('');
  const [showAlumniImport, setShowAlumniImport] = useState(false);

  const [mitraQuery, setMitraQuery] = useState('');
  const [mitraSektor, setMitraSektor] = useState('Semua');
  const [mitraStatus, setMitraStatus] = useState('Semua');
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
  const [mitraNotes, setMitraNotes] = useState<Record<string, string>>({});

  // Student management states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [mName, setMName] = useState('');
  const [mNim, setMNim] = useState('');
  const [mProdi, setMProdi] = useState('Teknik Informatika');
  const [mhsQuery, setMhsQuery] = useState('');
  const [mhsFakultas, setMhsFakultas] = useState('Semua');
  const [mhsProdi, setMhsProdi] = useState('Semua');
  const [mhsStatus, setMhsStatus] = useState('Semua');
  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(null);
  const [studentActivities, setStudentActivities] = useState<{ date: string; text: string }[]>([]);

  // News CMS states
  const [showAddNews, setShowAddNews] = useState(false);
  const [nTitle, setNTitle] = useState('');
  const [nContent, setNContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<string>('magang');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsCoverDataUrl, setNewsCoverDataUrl] = useState('');
  const [newsMode, setNewsMode] = useState<'create' | 'edit'>('create');
  const [editingNews, setEditingNews] = useState<Berita | null>(null);
  const [openNewsMenuId, setOpenNewsMenuId] = useState<string | null>(null);
  const [previewNews, setPreviewNews] = useState<Berita | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanMagang | null>(null);
  const [pengajuanNote, setPengajuanNote] = useState('');
  const [pengajuanStatusFilter, setPengajuanStatusFilter] = useState('Semua');
  const [pengajuanQuery, setPengajuanQuery] = useState('');
  const [selectedPengajuanIds, setSelectedPengajuanIds] = useState<string[]>([]);
  const [rejectionTemplate, setRejectionTemplate] = useState('');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('viewer');
  const [staffPassword, setStaffPassword] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffEmailError, setStaffEmailError] = useState('');
  const [selectedApprovalDetail, setSelectedApprovalDetail] = useState<UserType | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [tracerQuery, setTracerQuery] = useState('');
  const [tracerProdi, setTracerProdi] = useState('Semua');
  const [tracerTahun, setTracerTahun] = useState('Semua');
  const [tracerStatus, setTracerStatus] = useState('Semua');
  const [selectedTracer, setSelectedTracer] = useState<TracerStudy | null>(null);

  // Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tableQuery, setTableQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reload everything from local simulated DB
  const reloadAll = () => {
    setStudents(getFromDB<Mahasiswa>('mahasiswa'));
    setAlumni(getFromDB<Alumni>('alumni'));
    setMitra(getFromDB<Mitra>('mitra'));
    setAppls(getFromDB<PengajuanMagang>('pengajuan_magang'));
    setTracers(getFromDB<TracerStudy>('tracer_studies'));
    setNews(getFromDB<Berita>('berita'));
    setNewsletters(getFromDB<Pengumuman>('pengumuman'));
    setAllUsers(getFromDB<UserType>('users'));
    setLowongan(getFromDB<Lowongan>('lowongan'));
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Student manually
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !mNim) {
      triggerToast('error', 'Nama dan NIM wajib diisi.');
      return;
    }

    const mUserId = `usr_new_${Date.now()}`;
    const newUser: UserType = {
      id: mUserId,
      name: mName,
      email: `${mNim.toLowerCase()}@umkendari.ac.id`,
      role: 'mahasiswa',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    insertToDB<UserType>('users', newUser);

    const newMhs: Mahasiswa = {
      id: `mhs_new_${Date.now()}`,
      userId: mUserId,
      nim: mNim,
      nama: mName,
      email: newUser.email,
      programStudi: mProdi,
      fakultas: mProdi === 'Teknik Informatika' || mProdi === 'Sistem Informasi' ? 'Fakultas Teknik' : 'Fakultas Ekonomi',
      angkatan: '2022',
      semester: 6
    };
    insertToDB<Mahasiswa>('mahasiswa', newMhs);

    setMName('');
    setMNim('');
    setShowAddStudent(false);
    reloadAll();
    triggerToast('success', `Data Mahasiswa "${mName}" berhasil di-import & didaftarkan.`);
  };

  // Add News manually
  const handleAddNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle || !nContent) return;

    const newArticle: Berita = {
      id: `news_${Date.now()}`,
      title: nTitle,
      slug: nTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
      excerpt: newsExcerpt || nContent.substring(0, 100) + '...',
      content: nContent,
      coverImageUrl: newsCoverDataUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
      status: 'published',
      authorId: user.id,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    } as Berita;
    insertToDB<Berita>('berita', newArticle);

    setNTitle('');
    setNContent('');
    setNewsCategory('magang');
    setNewsExcerpt('');
    setNewsCoverDataUrl('');
    setShowAddNews(false);
    reloadAll();
    triggerToast('success', 'Berita/Pengumuman baru berhasil diterbitkan.');
  };

  const persistNewsFromForm = (status: 'draft' | 'published' | 'unpublished') => {
    if (!nTitle || !nContent) return;
    const normalizedStatus: 'draft' | 'published' = status === 'unpublished' ? 'draft' : status;
    const now = new Date().toISOString();
    const base = { title: nTitle, slug: nTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''), content: nContent, excerpt: newsExcerpt || nContent.substring(0, 100) + '...', coverImageUrl: newsCoverDataUrl || undefined, category: newsCategory };

    if (newsMode === 'edit' && editingNews) {
      const updated: Berita = {
        ...editingNews,
        ...base,
        status: normalizedStatus,
        publishedAt: normalizedStatus === 'published' ? now : editingNews.publishedAt,
      };
      updateInDB<Berita>('berita', updated);
      setEditingNews(null);
      setShowAddNews(false);
      reloadAll();
      triggerToast('success', normalizedStatus === 'draft' ? 'Draft berita disimpan.' : 'Perubahan berita disimpan.');
    } else {
      const newArticle: Berita = {
        id: `news_${Date.now()}`,
        ...base,
        status: normalizedStatus,
        authorId: user.id,
        publishedAt: normalizedStatus === 'published' ? now : undefined,
        createdAt: now,
      };
      insertToDB<Berita>('berita', newArticle);
      setNTitle('');
      setNContent('');
      setNewsCategory('magang');
      setNewsExcerpt('');
      setNewsCoverDataUrl('');
      setShowAddNews(false);
      reloadAll();
      triggerToast('success', status === 'draft' ? 'Draft berita disimpan.' : 'Berita/Pengumuman diterbitkan.');
    }
  };

  const openNewsEditor = (item?: Berita) => {
    if (item) {
      setEditingNews(item);
      setNTitle(item.title);
      setNContent(item.content);
      setNewsCategory((item as any).category || 'magang');
      setNewsExcerpt(item.excerpt || '');
      setNewsCoverDataUrl(item.coverImageUrl || '');
      setNewsMode('edit');
    } else {
      setEditingNews(null);
      setNTitle('');
      setNContent('');
      setNewsCategory('magang');
      setNewsExcerpt('');
      setNewsCoverDataUrl('');
      setNewsMode('create');
    }
    setShowAddNews(true);
  };

  // CSV import
  const handleCsvImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = csvText.trim();
    if (!raw) return;
    const lines = raw.split('\n');
    let imported = 0;
    lines.forEach((line) => {
      const parts = line.split(',');
      if (parts.length < 3) return;
      const nama = (parts[0] || '').trim();
      const nim = (parts[1] || '').trim();
      const prodi = (parts[2] || '').trim();
      if (!nama || !nim) return;
      const mUserId = `usr_csv_${Date.now()}_${imported}`;
      const newUser: UserType = {
        id: mUserId,
        name: nama,
        email: `${nim.toLowerCase()}@umkendari.ac.id`,
        role: 'mahasiswa',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      insertToDB<UserType>('users', newUser);
      const newMhs: Mahasiswa = {
        id: `mhs_csv_${Date.now()}_${imported}`,
        userId: mUserId,
        nim,
        nama,
        email: newUser.email,
        programStudi: prodi || 'Teknik Informatika',
        fakultas: prodi === 'Teknik Informatika' || prodi === 'Sistem Informasi' ? 'Fakultas Teknik' : 'Fakultas Ekonomi',
        angkatan: '2022',
        semester: 6
      };
      insertToDB<Mahasiswa>('mahasiswa', newMhs);
      imported++;
    });
    setCsvText('');
    setShowCsvImport(false);
    reloadAll();
    triggerToast('success', `Import CSV selesai. ${imported} mahasiswa berhasil ditambahkan.`);
  };

  const handleAlumniCsvImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = alumniCsvText.trim();
    if (!raw) return;
    const lines = raw.split('\n');
    let imported = 0;
    lines.forEach((line) => {
      const parts = line.split(',');
      if (parts.length < 6) return;
      const nama = (parts[0] || '').trim();
      const nim = (parts[1] || '').trim();
      const prodi = (parts[2] || '').trim();
      const tahunLulus = (parts[3] || '').trim();
      const statusPekerjaan = (parts[4] || '').trim() || 'belum_bekerja';
      const instansiKerja = (parts[5] || '').trim();
      const email = nim ? `${nim.toLowerCase()}@umkendari.ac.id` : '';
      if (!nama) return;
      const newAlumni: Alumni = {
        id: `alumni_${Date.now()}_${imported}`,
        nama,
        nim: nim || undefined,
        programStudi: prodi || '-',
        tahunLulus: tahunLulus || new Date().getFullYear().toString(),
        statusPekerjaan: statusPekerjaan as any,
        instansiKerja: instansiKerja || undefined,
        email: email || undefined,
        angkatan: tahunLulus || new Date().getFullYear().toString(),
        semester: undefined,
        fakultas: prodi === 'Teknik Informatika' || prodi === 'Sistem Informasi' ? 'Fakultas Teknik' : 'Fakultas Ekonomi',
        userId: '',
      } as any;
      insertToDB<Alumni>('alumni', newAlumni);
      imported++;
    });
    setAlumniCsvText('');
    setShowAlumniImport(false);
    reloadAll();
    triggerToast('success', `Import alumni CSV selesai. ${imported} data alumni berhasil ditambahkan.`);
  };

  const handleAlumniExport = () => {
    const filtered = alumni.filter((a) => {
      const q = alumniQuery.trim().toLowerCase();
      const matchesQuery = !q || a.nama.toLowerCase().includes(q) || (a.nim || '').toLowerCase().includes(q) || (a.programStudi || '').toLowerCase().includes(q) || (a.instansiKerja || '').toLowerCase().includes(q);
      const matchesStatus = alumniStatus === 'Semua' || a.statusPekerjaan === alumniStatus;
      return matchesQuery && matchesStatus;
    });
    const header = 'ID,Nama,NIM,Prodi,Tahun Lulus,Status Kerja,Instansi Kerja\n';
    const rows = filtered.map((a) => `"${a.id}","${a.nama}","${a.nim || ''}","${a.programStudi}","${a.tahunLulus}","${a.statusPekerjaan}","${a.instansiKerja || ''}"`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'rekap_alumni_umkendari.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('success', `Ekspor ${filtered.length} data alumni berhasil.`);
  };

  // Delete entity safely
  const handleDeleteEntity = (key: any, id: string, label: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${label}" dari server utama?`)) {
      deleteInDB(key, id);
      reloadAll();
      triggerToast('success', `Dokumen "${label}" berhasil dihapus dari database.`);
    }
  };

  // Verify Application Status
  const handleVerifyApplication = (id: string, decision: 'accepted' | 'rejected' | 'under_review') => {
    const target = appls.find(a => a.id === id);
    if (target) {
      target.status = decision;
      target.catatanAdmin = `Disetujui oleh Operator CDC Kampus (${user.name}) pada ${new Date().toLocaleDateString('id-ID')}. Berkas lengkap dan sah.`;
      target.verifiedBy = user.id;
      target.verifiedAt = new Date().toISOString();
      updateInDB<PengajuanMagang>('pengajuan_magang', target);
      reloadAll();
      triggerToast('success', `Status lamaran berhasil diverifikasi menjadi ${decision.toUpperCase()}.`);
    }
  };

  const rejectionTemplates = [
    'Syarat SKS belum terpenuhi',
    'CV kurang lengkap',
    'Berkas KHS belum divalidasi Prodi',
    'Data instansi/posisi tidak jelas',
    'Berkas tidak dapat dibuka',
  ];

  const savePengajuanNote = (id: string, note: string) => {
    const target = appls.find(a => a.id === id);
    if (target) {
      target.catatanAdmin = note;
      updateInDB<PengajuanMagang>('pengajuan_magang', target);
      reloadAll();
    }
  };

  const bulkVerify = (decision: 'accepted' | 'rejected') => {
    const ids = [...selectedPengajuanIds];
    selectedPengajuanIds.forEach((id) => {
      const target = appls.find(a => a.id === id);
      if (target) {
        target.status = decision;
        target.catatanAdmin = decision === 'accepted'
          ? `Disetujui oleh Operator CDC Kampus (${user.name}) pada ${new Date().toLocaleDateString('id-ID')}.`
          : `Ditolak oleh Operator CDC Kampus (${user.name}) pada ${new Date().toLocaleDateString('id-ID')}. Alasan: ${rejectionTemplate || 'Tidak memenuhi syarat'}`;
        target.verifiedBy = user.id;
        target.verifiedAt = new Date().toISOString();
        updateInDB<PengajuanMagang>('pengajuan_magang', target);
      }
    });
    setSelectedPengajuanIds([]);
    setRejectionTemplate('');
    reloadAll();
    triggerToast('success', `${ids.length} pengajuan berhasil diperbarui.`);
  };

  const filteredAppls = appls.filter((a) => {
    const q = pengajuanQuery.trim().toLowerCase();
    const matchesQuery = !q || a.namaMahasiswa.toLowerCase().includes(q) || a.tujuanMagang.toLowerCase().includes(q);
    const matchesStatus = pengajuanStatusFilter === 'Semua' || a.status === pengajuanStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Kampus' },
      under_review: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Sedang Ditinjau' },
      rejected: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Ditolak Kampus' },
      accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Diteruskan ke Mitra' },
      ongoing: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Diterima Mitra' },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Selesai' },
      revision: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Revisi' },
      draft: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Draft' },
      published: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Published' },
      unpublished: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Unpublished' },
    };
    const item = map[status] || { bg: 'bg-slate-50', text: 'text-slate-700', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.bg} ${item.text}`}>
        {item.label}
      </span>
    );
  };

  const tracerStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      bekerja: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Bekerja' },
      wirausaha: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Wirausaha' },
      lanjut_studi: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Lanjut Studi' },
      belum_bekerja: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Belum Bekerja' },
    };
    const item = map[status] || { bg: 'bg-slate-50', text: 'text-slate-700', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.bg} ${item.text}`}>
        {item.label}
      </span>
    );
  };

  const monthsFromMasaTunggu = (v?: string) => {
    if (!v) return 0;
    const map: Record<string, number> = { kurang_3_bulan: 2, '3_6_bulan': 4.5, '6_12_bulan': 9, lebih_12_bulan: 15 };
    return map[v] ?? 0;
  };

  const salaryFromRange = (v?: string) => {
    const map: Record<string, number> = { kurang_2jt: 1.5, '2_5jt': 3.5, '5_10jt': 7.5, lebih_10jt: 12 };
    return v ? map[v] ?? 0 : 0;
  };

  const UMR_PLACEHOLDER = 2500000; // placeholder UMR untuk perbandingan agregat

  const countTracer = (predicate: (t: TracerStudy) => boolean) => filteredTracers.filter(predicate).length;
  const responseRate = tracers.length ? Math.round((tracers.length / Math.max(alumni.length, 1)) * 100) : 0;
  const avgWaitMonths = (() => {
    const vals = tracers.map((t) => monthsFromMasaTunggu(t.masaTungguKerja)).filter((v) => v > 0);
    if (!vals.length) return 0;
    const s = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Number(s.toFixed(1));
  })();
  const avgSalaryJt = (() => {
    const vals = tracers.map((t) => salaryFromRange(t.rangePenghasilan)).filter((v) => v > 0);
    if (!vals.length) return 0;
    const s = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Number(s.toFixed(1));
  })();
  const relevanceRate = (() => {
    const vals = tracers.filter((t) => t.kesesuaianBidang === 'sangat_sesuai' || t.kesesuaianBidang === 'sesuai').length;
    return tracers.length ? Math.round((vals / tracers.length) * 100) : 0;
  })();

  const filteredTracers = tracers.filter((t) => {
    const q = tracerQuery.trim().toLowerCase();
    const matchesQuery = !q || t.nama.toLowerCase().includes(q) || String(t.tahunLulus).toLowerCase().includes(q);
    const matchesProdi = tracerProdi === 'Semua' || t.programStudi === tracerProdi;
    const matchesTahun = tracerTahun === 'Semua' || String(t.tahunLulus) === tracerTahun;
    const matchesStatus = tracerStatus === 'Semua' || t.statusPekerjaan === tracerStatus;
    return matchesQuery && matchesProdi && matchesTahun && matchesStatus;
  });

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Stats
  const countWorking = tracers.filter(t => t.statusPekerjaan === 'bekerja').length;
  const countEntre = tracers.filter(t => t.statusPekerjaan === 'wirausaha').length;
  const countStudy = tracers.filter(t => t.statusPekerjaan === 'lanjut_studi').length;
  const countUnemployed = tracers.filter(t => t.statusPekerjaan === 'belum_bekerja').length;
  const totalTracersCount = tracers.length || 1;

  const pctWorking = Math.round((countWorking / totalTracersCount) * 100);
  const pctEntre = Math.round((countEntre / totalTracersCount) * 100);
  const pctStudy = Math.round((countStudy / totalTracersCount) * 100);
  const pctUnemployed = Math.round((countUnemployed / totalTracersCount) * 105);

  const activeLowonganCount = (lowongan || []).filter((l) => l.status === 'published').length;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const applsThisMonth = appls.filter((a) => {
    const d = new Date(a.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const last7 = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const count = appls.filter((a) => {
      const ad = new Date(a.createdAt);
      return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    }).length;
    return { label, count };
  });
  const max7 = Math.max(...last7.map((x) => x.count), 1);

  const topMitraMap = new Map<string, { namaInstansi: string; count: number }>();
  appls.forEach((a) => {
    const k = a.tujuanMagang.trim();
    if (!k) return;
    const prev = topMitraMap.get(k) || { namaInstansi: k, count: 0 };
    prev.count += 1;
    topMitraMap.set(k, prev);
  });
  const top5Mitra = Array.from(topMitraMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const top5Max = Math.max(...top5Mitra.map((x) => x.count), 1);

  const triggerSpreadsheetDownload = (reportType: 'mahasiswa' | 'alumni' | 'tracer' | 'mitra' | 'pengajuan') => {
    let header = '';
    let rows = '';
    let filename = '';

    if (reportType === 'mahasiswa') {
      header = 'ID,NIM,Nama,Email,Prodi,Fakultas,Semester,Angkatan\n';
      rows = students.map(m => `"${m.id}","${m.nim}","${m.nama}","${m.email}","${m.programStudi}","${m.fakultas}","${m.semester}","${m.angkatan}"`).join('\n');
      filename = 'rekap_mahasiswa_magang_umkendari.csv';
    } else if (reportType === 'alumni') {
      header = 'ID,NIM,Nama,Email,Prodi,Tahun Lulus,Status Kerja,Tempat Kerja\n';
      rows = alumni.map(a => `"${a.id}","${a.nim || '-'}","${a.nama}","${a.email}","${a.programStudi}","${a.tahunLulus}","${a.statusPekerjaan}","${a.instansiKerja || '-'}"`).join('\n');
      filename = 'rekap_alumni_umkendari.csv';
    } else if (reportType === 'tracer') {
      header = 'ID,Nama Alumni,Prodi,Tahun Lulus,Status,Gaji,Kesesuaian Sektor\n';
      rows = tracers.map(t => `"${t.id}","${t.nama}","${t.programStudi}","${t.tahunLulus}","${t.statusPekerjaan}","${t.rangePenghasilan || '-'}","${t.kesesuaianBidang || '-'}"`).join('\n');
      filename = 'rekap_tracer_study_umkendari.csv';
    } else if (reportType === 'mitra') {
      header = 'ID,Nama Perusahaan,Sektor,PIC,Hotline,Situs Web\n';
      rows = mitra.map(m => `"${m.id}","${m.namaInstansi}","${m.bidangIndustri || '-'}","${m.kontakPerson}","${m.phone || '-'}","${m.website || '-'}"`).join('\n');
      filename = 'rekap_mitra_kerja_sama.csv';
    } else if (reportType === 'pengajuan') {
      header = 'ID,Nama Mahasiswa,Instansi/Posisi,Tanggal Pengajuan,Status,Verifik Oleh,Catatan Admin\n';
      rows = appls.map(a => `"${a.id}","${a.namaMahasiswa}","${a.tujuanMagang}","${new Date(a.createdAt).toISOString()}","${a.status}","${a.verifiedBy || '-'}","${(a.catatanAdmin || '-').replace(/"/g, '""')}"`).join('\n');
      filename = 'rekap_pengajuan_magang_umkendari.csv';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('success', `Laporan "${filename}" berhasil digenerate & diunduh (Format Tabel Excel).`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-xs sm:text-sm" id="adm-dashboard">
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border bg-slate-900 text-white flex items-center gap-2 max-w-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <div>{toast.text}</div>
        </div>
      )}

      <header className="bg-slate-950 text-white h-18 sticky top-0 z-40 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white">CDC OPERATOR CONTROL CENTER</div>
            <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Universitas Muhammadiyah Kendari</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px]">ROOT ADMINISTRATOR</span>
          <button
            onClick={onLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8" id="adm-body-grid">
        <aside className="lg:col-span-3 space-y-3" id="adm-sidebar">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">CDC Admin</div>
            </div>
            <nav className="flex flex-col gap-1" id="adm-nav-menu">
              {[
                { group: 'DASHBOARD', items: [{ id: 'ringkasan', label: 'Ringkasan Laporan', icon: Layers }] },
                { group: 'DATA MAHASISWA & ALUMNI', items: [
                  { id: 'mahasiswa', label: 'Kelola Mahasiswa', icon: Users },
                  { id: 'alumni', label: 'Database Alumni', icon: BookOpen },
                ]},
                { group: 'LAYANAN KARIR & OPERASIONAL', items: [
                  { id: 'mitra', label: 'Daftar Mitra', icon: Building2 },
                  { id: 'pengajuan', label: 'Verifikasi Magang', icon: CheckCircle },
                  { id: 'konten', label: 'CMS Berita', icon: BookOpen },
                ]},
                { group: 'TRACER STUDY & REKAPITULASI', items: [
                  { id: 'tracer', label: 'Rekap Tracer Study', icon: FileText },
                  { id: 'laporan', label: 'Export Spreads', icon: Download },
                ]},
                { group: 'PENGATURAN & AKSES', items: [
                  { id: 'users', label: 'Manajemen Hak Akses', icon: Users },
                  { id: 'approval', label: 'Approval Mitra & Entitas', icon: CheckCircle },
                ]},
              ].map((section, idx) => (
                <div key={section.group} className={idx > 0 ? 'mt-4 pt-3 border-t border-slate-200' : ''}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">{section.group}</div>
                  <div className="flex flex-col gap-1">
                    {section.items.map((menu) => {
                      const Icon = menu.icon;
                      const active = activeTab === menu.id;
                      return (
                        <button
                          key={menu.id}
                          id={`adm-tab-${menu.id}`}
                          onClick={() => setActiveTab(menu.id as any)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                            active ? 'bg-slate-950 text-white shadow-md shadow-slate-900/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`transition ${active ? 'scale-110 text-emerald-300' : 'text-slate-500 group-hover:text-slate-900'}`}><Icon className="w-4 h-4" /></span>
                          <span className="text-[13px] font-semibold">{menu.label}</span>
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-9" id="adm-main">
          {activeTab === 'ringkasan' && (
            <div id="adm-panel-ringkasan" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="adm-stat-cards">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Mahasiswa</div>
                  <div className="text-xl font-extrabold text-slate-800">{students.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Alumni</div>
                  <div className="text-xl font-extrabold text-blue-600">{alumni.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Mitra</div>
                  <div className="text-xl font-extrabold text-emerald-600">{mitra.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Menunggu Validasi</div>
                  <div className="text-xl font-extrabold text-amber-600 bg-amber-50 rounded-lg px-2 text-center py-0.5">{appls.filter(a => a.status === 'submitted').length}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Lowongan Aktif</div>
                  <div className="text-xl font-extrabold text-indigo-600">{activeLowonganCount}</div>
                  <div className="text-[11px] text-slate-400">Status published</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Pengajuan Bulan Ini</div>
                  <div className="text-xl font-extrabold text-rose-600">{applsThisMonth}</div>
                  <div className="text-[11px] text-slate-400">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Total Pengajuan</div>
                  <div className="text-xl font-extrabold text-slate-800">{appls.length}</div>
                  <div className="text-[11px] text-slate-400">Semua waktu</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:border-slate-200 hover:-translate-y-0.5 transition duration-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Total Berita</div>
                  <div className="text-xl font-extrabold text-emerald-600">{news.length}</div>
                  <div className="text-[11px] text-slate-400">Artikel CMS</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900 text-sm">Trens Pengajuan 7 Hari Terakhir</h4>
                    <span className="text-[11px] font-bold text-slate-500">Magang</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {last7.map((d, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-[11px] font-bold text-slate-700">{d.count}</div>
                        <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex items-end h-28">
                          <div className="w-full bg-slate-900 rounded-xl transition-all duration-300 ease-out" style={{ height: `${Math.max((d.count / max7) * 100, 6)}%` }}></div>
                        </div>
                        <div className="text-[10px] text-slate-400">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900 text-sm">Top 5 Mitra Paling Banyak Dilamar</h4>
                    <span className="text-[11px] font-bold text-slate-500">Berdasarkan pengajuan</span>
                  </div>
                  <div className="space-y-3">
                    {top5Mitra.length === 0 && <div className="text-xs text-slate-400">Belum ada data pengajuan.</div>}
                    {top5Mitra.map((row, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="truncate pr-2">{idx + 1}. {row.namaInstansi}</span>
                          <span className="text-slate-500">{row.count} pengajuan</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max((row.count / top5Max) * 100, 8)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900 text-sm">Menunggu Approval</h4>
                    <button onClick={() => setActiveTab('approval')} className="text-[11px] font-bold text-emerald-700 hover:underline underline-offset-4 transition">Lihat semua</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {allUsers.filter(u => u.status === 'pending').slice(0, 5).map(u => (
                      <div key={u.id} className="py-2.5 text-xs flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-slate-400 text-[11px]">{u.email} • {u.role}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { updateInDB<UserType>('users', { ...u, status: 'active' }); reloadAll(); triggerToast('success', `Akun ${u.name} disetujui.`); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition">Setujui</button>
                          <button onClick={() => { updateInDB<UserType>('users', { ...u, status: 'rejected' }); reloadAll(); triggerToast('success', `Akun ${u.name} ditolak.`); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition">Tolak</button>
                        </div>
                      </div>
                    ))}
                    {allUsers.filter(u => u.status === 'pending').length === 0 && (
                      <div className="text-xs text-slate-400 py-3">Tidak ada akun yang menunggu approval.</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900 text-sm">Aktivitas Terkini</h4>
                    <button onClick={() => setActiveTab('pengajuan')} className="text-[11px] font-bold text-emerald-700 hover:underline underline-offset-4 transition">Verifikasi magang</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {(() => {
                      const events: { date: string; text: string }[] = [
                        ...appls.slice(0, 3).map(a => ({ date: a.createdAt, text: `${a.namaMahasiswa} mengajukan magang ke ${a.tujuanMagang}` })),
                        ...news.slice(0, 2).map(b => ({ date: b.publishedAt || b.createdAt, text: `Berita diterbitkan: ${b.title}` })),
                        ...tracers.slice(0, 2).map(t => ({ date: t.submittedAt, text: `Tracer study masuk dari ${t.nama}` })),
                      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const shown = events.slice(0, 6);
                      if (!shown.length) return <div className="text-xs text-slate-400">Belum ada aktivitas.</div>;
                      return shown.map((ev, i) => (
                        <div key={i} className="py-2.5 text-xs">
                          <div className="font-bold text-slate-700">{ev.text}</div>
                          <div className="text-slate-400 text-[11px]">{new Date(ev.date).toLocaleString('id-ID')}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900 text-sm">Berita Terbaru</h4>
                    <button onClick={() => setActiveTab('konten')} className="text-[11px] font-bold text-emerald-700 hover:underline underline-offset-4 transition">Lihat semua</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {news.slice(0, 5).map(n => (
                      <div key={n.id} className="py-2.5 text-xs">
                        <div className="font-bold text-slate-800 line-clamp-1">{n.title}</div>
                        <div className="text-slate-400 text-[11px]">{new Date(n.publishedAt || n.createdAt).toLocaleString('id-ID')}</div>
                      </div>
                    ))}
                    {news.length === 0 && (
                      <div className="text-xs text-slate-400 py-3">Belum ada berita.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mahasiswa' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-5" id="adm-panel-mahasiswa">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Manajemen Database Mahasiswa</h3>
                  <p className="text-xs text-slate-400">Database sirkulasi mahasiswa aktif mendaftar atau sedang magang legal.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCsvImport(!showCsvImport)}
                    className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    {showCsvImport ? 'Sembunyikan CSV' : 'Import CSV'}
                  </button>
                  <button
                    onClick={() => setShowAddStudent(!showAddStudent)}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    {showAddStudent ? "Sembunyikan Form" : "Import Mahasiswa Baru"}
                  </button>
                </div>
              </div>

              {showCsvImport && (
                <form onSubmit={handleCsvImportSubmit} className="bg-white rounded-2xl border border-slate-150 p-6 space-y-3" id="csv-import-form">
                  <div>
                    <div className="text-xs font-bold text-slate-800">IMPORT MAHASISWA DARI CSV</div>
                    <div className="text-[11px] text-slate-500">Format: Nama,NIM,Prodi</div>
                  </div>
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={5}
                    placeholder={`Contoh:\nAl-Ayyubi,202201010,Teknik Informatika\nSiti Aisyah,202201020,Sistem Informasi`}
                    className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  ></textarea>
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => setShowCsvImport(false)} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Batal</button>
                    <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 text-xs font-bold rounded-xl shadow-sm active:scale-95 inline-flex items-center gap-1 active:scale-95">Import Sekarang</button>
                  </div>
                </form>
              )}

              {showAddStudent && (
                <form onSubmit={handleAddStudentSubmit} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4" id="add-student-form">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Manual Register Mahasiswa</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={mName}
                        onChange={(e) => setMName(e.target.value)}
                        placeholder="Contoh: Al-Ayyubi"
                        className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">NIM *</label>
                      <input
                        type="text"
                        required
                        value={mNim}
                        onChange={(e) => setMNim(e.target.value)}
                        placeholder="202201010"
                        className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Prodi *</label>
                      <div className="relative">
                        <select
                          value={mProdi}
                          onChange={(e) => setMProdi(e.target.value)}
                          className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="Teknik Informatika">Teknik Informatika</option>
                          <option value="Sistem Informasi">Sistem Informasi</option>
                          <option value="Manajemen">Manajemen</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => setShowAddStudent(false)} className="px-4 py-2 border text-xs rounded-xl hover:bg-slate-100">Batal</button>
                    <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 text-xs font-bold rounded-xl shadow-sm active:scale-95 inline-flex items-center gap-1">Simpan</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="relative">
                  <select
                    value={mhsFakultas}
                    onChange={(e) => { setMhsFakultas(e.target.value); setMhsProdi('Semua'); }}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full"
                  >
                    <option value="Semua">Semua Fakultas</option>
                    <option value="FKIP">FKIP</option>
                    <option value="Teknik">Teknik</option>
                    <option value="Pertanian">Pertanian</option>
                    <option value="FPIK">FPIK</option>
                    <option value="FISIP">FISIP</option>
                    <option value="FH">FH</option>
                    <option value="FEBI">FEBI</option>
                    <option value="FAI">FAI</option>
                    <option value="FKIK">FKIK</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={mhsProdi}
                    onChange={(e) => setMhsProdi(e.target.value)}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full"
                  >
                    <option value="Semua">Semua Prodi</option>
                    {mhsFakultas === 'Teknik' && <>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                    </>}
                    {mhsFakultas === 'FEBI' && <>
                      <option value="Manajemen">Manajemen</option>
                    </>}
                    {mhsFakultas === 'FPIK' && <>
                      <option value="Akuntansi">Akuntansi</option>
                    </>}
                    {mhsFakultas === 'FKIP' && <>
                      <option value="Pendidikan">Pendidikan</option>
                    </>}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={mhsStatus}
                    onChange={(e) => setMhsStatus(e.target.value)}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Magang">Magang</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={mhsQuery}
                    onChange={(e) => setMhsQuery(e.target.value)}
                    placeholder="Cari nama, NIM, email..."
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-bold">
                {(() => {
                  const q = mhsQuery.trim().toLowerCase();
                  let filtered = students;
                  if (mhsFakultas !== 'Semua') filtered = filtered.filter(s => s.fakultas.toLowerCase().includes(mhsFakultas.toLowerCase()));
                  if (mhsProdi !== 'Semua') filtered = filtered.filter(s => s.programStudi.toLowerCase().includes(mhsProdi.toLowerCase()));
                  if (mhsStatus !== 'Semua') filtered = filtered.filter(s => (s.angkatan || '').toLowerCase().includes(mhsStatus.toLowerCase()) || (s.semester || '').toString().includes(mhsStatus));
                  const count = q ? filtered.filter(s => s.nama.toLowerCase().includes(q) || s.nim.includes(q) || s.email.toLowerCase().includes(q)).length : filtered.length;
                  return `${count} mahasiswa ditemukan`;
                })()}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Mahasiswa</th>
                      <th className="py-3 px-4">Prodi/Fakultas</th>
                      <th className="py-3 px-4">Angkatan / Sem</th>
                      <th className="py-3 px-4">Email Kampus</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {(() => {
                      const q = mhsQuery.trim().toLowerCase();
                      let filtered = students;
                      if (mhsFakultas !== 'Semua') filtered = filtered.filter(s => s.fakultas.toLowerCase().includes(mhsFakultas.toLowerCase()));
                      if (mhsProdi !== 'Semua') filtered = filtered.filter(s => s.programStudi.toLowerCase().includes(mhsProdi.toLowerCase()));
                      if (mhsStatus !== 'Semua') filtered = filtered.filter(s => (s.angkatan || '').toLowerCase().includes(mhsStatus.toLowerCase()) || (s.semester || '').toString().includes(mhsStatus));
                      if (q) filtered = filtered.filter(s => s.nama.toLowerCase().includes(q) || s.nim.includes(q) || s.email.toLowerCase().includes(q));
                      if (!filtered.length) return <tr><td colSpan={5} className="py-6 text-center text-xs text-slate-400">Tidak ada mahasiswa yang cocok.</td></tr>;
                      return filtered.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {st.nama}
                            <span className="text-[10px] text-slate-400 font-normal font-mono block">NIM: {st.nim}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium">{st.programStudi} • <span className="text-slate-400 font-normal">{st.fakultas}</span></td>
                          <td className="py-3.5 px-4">{st.angkatan} / Sm {st.semester}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{st.email}</td>
                          <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => alert('Detail mahasiswa akan menampilkan profile, status akademik, dan riwayat CDC.')}
                              className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition active:scale-95"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => alert('History CDC akan menampilkan log magang, verifikasi, dan catatan CDC.')}
                              className="inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition active:scale-95"
                            >
                              History CDC
                            </button>
                            <button
                              onClick={() => { updateInDB<any>('mahasiswa', { ...st, status: st.status === 'Nonaktif' ? 'Aktif' : 'Nonaktif' }); reloadAll(); }}
                              className="inline-flex items-center px-2.5 py-1 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 text-[11px] font-bold transition active:scale-95"
                            >
                              {st.status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                            </button>
                            <button
                              onClick={() => alert('Reset passcode: untuk integrasi SSO/SIAKAD. Saat ini belum tersedia.')}
                              className="inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition active:scale-95"
                            >
                              Reset Passcode
                            </button>
                            <button
                              onClick={() => handleDeleteEntity('mahasiswa', st.id, st.nama)}
                              className="inline-flex items-center px-2.5 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition active:scale-95"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alumni' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-5" id="adm-panel-alumni">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Database Alumni</h3>
                  <p className="text-xs text-slate-400">Monitoring karir dan sinkronisasi persiapan tracer study.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAlumniImport(!showAlumniImport)}
                    className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    {showAlumniImport ? 'Sembunyikan Import' : 'Import CSV'}
                  </button>
                  <button
                    onClick={handleAlumniExport}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    Export Data
                  </button>
                </div>
              </div>

              {showAlumniImport && (
                <form onSubmit={handleAlumniCsvImportSubmit} className="bg-white rounded-2xl border border-slate-150 p-6 space-y-3" id="alumni-csv-import-form">
                  <div>
                    <div className="text-xs font-bold text-slate-800">IMPORT ALUMNI DARI CSV</div>
                    <div className="text-[11px] text-slate-500">Format: Nama, NIM, Prodi, TahunLulus, StatusKerja, InstansiKerja</div>
                  </div>
                  <textarea
                    value={alumniCsvText}
                    onChange={(e) => setAlumniCsvText(e.target.value)}
                    rows={5}
                    placeholder={`Contoh:\nAl-Ayyubi,202201010,Teknik Informatika,2023,bekerja,PT Contoh`}
                    className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  ></textarea>
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => setShowAlumniImport(false)} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Batal</button>
                    <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 text-xs font-bold rounded-xl shadow-sm active:scale-95 inline-flex items-center gap-1 active:scale-95">Import Sekarang</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={alumniQuery}
                    onChange={(e) => setAlumniQuery(e.target.value)}
                    placeholder="Cari nama, NIM, prodi, instansi..."
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="relative">
                  <select
                    value={alumniStatus}
                    onChange={(e) => setAlumniStatus(e.target.value)}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="bekerja">Bekerja</option>
                    <option value="wirausaha">Wirausaha</option>
                    <option value="lanjut_studi">Lanjut Studi</option>
                    <option value="belum_bekerja">Belum Bekerja</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 flex items-center px-2">
                  {(() => {
                    const q = alumniQuery.trim().toLowerCase();
                    const filtered = alumni.filter((a) => {
                      const matchesQuery = !q || a.nama.toLowerCase().includes(q) || (a.nim || '').toLowerCase().includes(q) || (a.programStudi || '').toLowerCase().includes(q) || (a.instansiKerja || '').toLowerCase().includes(q);
                      const matchesStatus = alumniStatus === 'Semua' || a.statusPekerjaan === alumniStatus;
                      return matchesQuery && matchesStatus;
                    });
                    return `${filtered.length} alumni ditemukan`;
                  })()}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Alumni</th>
                      <th className="py-3 px-4">NIM</th>
                      <th className="py-3 px-4">Prodi</th>
                      <th className="py-3 px-4">Tahun Lulus</th>
                      <th className="py-3 px-4">Status Kerja</th>
                      <th className="py-3 px-4">Instansi</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {(() => {
                      const q = alumniQuery.trim().toLowerCase();
                      const filtered = alumni.filter((a) => {
                        const matchesQuery = !q || a.nama.toLowerCase().includes(q) || (a.nim || '').toLowerCase().includes(q) || (a.programStudi || '').toLowerCase().includes(q) || (a.instansiKerja || '').toLowerCase().includes(q);
                        const matchesStatus = alumniStatus === 'Semua' || a.statusPekerjaan === alumniStatus;
                        return matchesQuery && matchesStatus;
                      });
                      if (!filtered.length) return <tr><td colSpan={7} className="py-6 text-center text-xs text-slate-400">Belum ada data alumni yang cocok.</td></tr>;
                      return filtered.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <button onClick={() => setSelectedAlumniDetail(a)} className="font-bold text-slate-900 hover:underline">{a.nama}</button>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">{a.nim || '-'}</td>
                          <td className="py-3.5 px-4 font-medium">{a.programStudi}</td>
                          <td className="py-3.5 px-4">{a.tahunLulus}</td>
                          <td className="py-3.5 px-4 capitalize">{a.statusPekerjaan.replace('_', ' ')}</td>
                          <td className="py-3.5 px-4">{a.instansiKerja || '-'}</td>
                          <td className="py-3.5 px-4 text-right text-slate-400 text-xs">Read-only</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {selectedAlumniDetail && (
                <div className="rounded-2xl border border-slate-150 p-6 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-base">Detail Alumni</h4>
                    <button onClick={() => setSelectedAlumniDetail(null)} className="text-xs text-slate-500 hover:text-slate-700">Tutup</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Nama</div>
                      <div className="font-bold">{selectedAlumniDetail.nama}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">NIM</div>
                      <div className="font-mono">{selectedAlumniDetail.nim || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Prodi</div>
                      <div>{selectedAlumniDetail.programStudi}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Tahun Lulus</div>
                      <div>{selectedAlumniDetail.tahunLulus}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Status Kerja</div>
                      <div className="capitalize">{selectedAlumniDetail.statusPekerjaan.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Instansi Kerja</div>
                      <div>{selectedAlumniDetail.instansiKerja || '-'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Catatan</div>
                      <div className="text-slate-500">Data ini ditampilkan read-only sesuai kebijakan CDC untuk menjaga validitas data tracer study.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mitra' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-5" id="adm-panel-mitra">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Daftar Mitra / Perusahaan</h3>
                  <p className="text-xs text-slate-400">Pengawasan profil mitra dan kontrol akses mitra.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMitra(null)}
                    className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    Reset Detail
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={mitraQuery}
                    onChange={(e) => setMitraQuery(e.target.value)}
                    placeholder="Cari instansi atau PIC..."
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="relative">
                  <select
                    value={mitraSektor}
                    onChange={(e) => setMitraSektor(e.target.value)}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Semua">Semua Sektor</option>
                    <option value="Teknologi">Teknologi</option>
                    <option value="Keuangan">Keuangan / Perbankan</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Pariwisata">Pariwisata</option>
                    <option value="Manufaktur">Manufaktur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={mitraStatus}
                    onChange={(e) => setMitraStatus(e.target.value)}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Suspended/Banned</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Instansi</th>
                      <th className="py-3 px-4">Bidang</th>
                      <th className="py-3 px-4">PIC</th>
                      <th className="py-3 px-4">Status Akses</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {(() => {
                      const q = mitraQuery.trim().toLowerCase();
                      const filtered = mitra.filter((m) => {
                        const matchesQuery = !q || m.namaInstansi.toLowerCase().includes(q) || m.kontakPerson.toLowerCase().includes(q);
                        const matchesSektor = mitraSektor === 'Semua' || (m.bidangIndustri || '').toLowerCase().includes(mitraSektor.toLowerCase());
                        const matchesStatus = mitraStatus === 'Semua' || m.statusKerjaSama === mitraStatus;
                        return matchesQuery && matchesSektor && matchesStatus;
                      });
                      if (!filtered.length) return <tr><td colSpan={5} className="py-6 text-center text-xs text-slate-400">Tidak ada data mitra yang cocok.</td></tr>;
                      return filtered.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <button onClick={() => setSelectedMitra(m)} className="font-bold text-slate-900 hover:underline">{m.namaInstansi}</button>
                          </td>
                          <td className="py-3.5 px-4 font-medium">{m.bidangIndustri || '-'}</td>
                          <td className="py-3.5 px-4">{m.kontakPerson}</td>
                          <td className="py-3.5 px-4 capitalize">{m.statusKerjaSama}</td>
                          <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                            <button onClick={() => setSelectedMitra(m)} className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition">Detail</button>
                            <button onClick={() => {
                              const newStatus = m.statusKerjaSama === 'aktif' ? 'nonaktif' : 'aktif';
                              updateInDB<Mitra>('mitra', { ...m, statusKerjaSama: newStatus });
                              setMitraNotes((prev) => ({ ...prev, [m.id]: `${prev[m.id] || ''}\n[${new Date().toLocaleString('id-ID')}] Status diubah menjadi ${newStatus}` }));
                              reloadAll();
                              triggerToast('success', `Status mitra ${m.namaInstansi} diubah menjadi ${newStatus}.`);
                            }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 text-[11px] font-bold transition">
                              {m.statusKerjaSama === 'aktif' ? 'Suspend' : 'Aktifkan'}
                            </button>
                            <button onClick={() => {
                              if (confirm(`Hapus permanen mitra "${m.namaInstansi}"?`)) {
                                handleDeleteEntity('mitra', m.id, m.namaInstansi);
                              }
                            }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition">Hapus</button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {selectedMitra && (
                <div className="rounded-2xl border border-slate-150 p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">Detail Profil Mitra</h4>
                    <button onClick={() => setSelectedMitra(null)} className="text-xs text-slate-500 hover:text-slate-700">Tutup</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Nama Instansi</div>
                      <div className="font-bold">{selectedMitra.namaInstansi}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Bidang</div>
                      <div>{selectedMitra.bidangIndustri || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">PIC</div>
                      <div>{selectedMitra.kontakPerson}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Email</div>
                      <div>{selectedMitra.email}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Phone</div>
                      <div>{selectedMitra.phone || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Website</div>
                      <div>{selectedMitra.website || '-'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Alamat</div>
                      <div>{selectedMitra.alamat || '-'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Catatan Internal CDC</div>
                      <textarea
                        value={mitraNotes[selectedMitra.id] || ''}
                        onChange={(e) => setMitraNotes((prev) => ({ ...prev, [selectedMitra.id]: e.target.value }))}
                        placeholder="Tulis catatan evaluasi mitra..."
                        className="w-full mt-1 appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                      ></textarea>
                      <div className="text-[11px] text-slate-400 mt-1">Catatan ini hanya terlihat oleh Admin CDC.</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">History Mitra</div>
                    <div className="text-xs text-slate-500">
                      {(() => {
                        const historyLowongan = lowongan.filter((l) => l.mitraId === selectedMitra.id);
                        const historyApps = appls.filter((a) => a.tujuanMagang === selectedMitra.namaInstansi);
                        if (!historyLowongan.length && !historyApps.length) {
                          return <div>Belum ada riwayat lowongan atau mahasiswa untuk mitra ini.</div>;
                        }
                        return (
                          <div className="space-y-1">
                            {historyLowongan.map((l) => (
                              <div key={l.id} className="flex justify-between border-b border-slate-50 pb-1">
                                <span className="font-bold text-slate-800">{l.judul}</span>
                                <span className="text-slate-500 capitalize">{l.status}</span>
                              </div>
                            ))}
                            {historyApps.slice(0, 50).map((a) => (
                              <div key={a.id} className="flex justify-between border-b border-slate-50 pb-1">
                                <span className="text-slate-800">{a.namaMahasiswa}</span>
                                <span className="text-slate-500">{a.tujuanMagang} • {new Date(a.createdAt).toLocaleDateString('id-ID')}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pengajuan' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-4" id="adm-panel-pengajuan">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Verifikasi Magang</h3>
                  <p className="text-xs text-slate-400">Validasi berkas mahasiswa sebelum diteruskan ke mitra.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => bulkVerify('accepted')}
                    disabled={!selectedPengajuanIds.length}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition"
                  >
                    Bulk Teruskan ke Mitra
                  </button>
                  <button
                    onClick={() => bulkVerify('rejected')}
                    disabled={!selectedPengajuanIds.length}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition"
                  >
                    Bulk Tolak
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={pengajuanQuery}
                    onChange={(e) => setPengajuanQuery(e.target.value)}
                    placeholder="Cari nama mahasiswa atau instansi..."
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="relative">
                  <select
                    value={pengajuanStatusFilter}
                    onChange={(e) => setPengajuanStatusFilter(e.target.value)}
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="submitted">Pending Kampus</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Ditolak Kampus</option>
                    <option value="accepted">Diteruskan ke Mitra</option>
                    <option value="ongoing">Diterima Mitra</option>
                    <option value="completed">Selesai</option>
                    <option value="revision">Revisi</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 flex items-center px-2">
                  {filteredAppls.length} pengajuan ditemukan
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={filteredAppls.length > 0 && selectedPengajuanIds.length === filteredAppls.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPengajuanIds(filteredAppls.map((a) => a.id));
                            } else {
                              setSelectedPengajuanIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="py-3 px-4">Nama Mahasiswa</th>
                      <th className="py-3 px-4">Instansi & Posisi</th>
                      <th className="py-3 px-4">Waktu Pengajuan</th>
                      <th className="py-3 px-4">Status Verifikasi</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {filteredAppls.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedPengajuanIds.includes(a.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPengajuanIds((prev) => [...prev, a.id]);
                              } else {
                                setSelectedPengajuanIds((prev) => prev.filter((id) => id !== a.id));
                              }
                            }}
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{a.namaMahasiswa}</td>
                        <td className="py-3.5 px-4 font-medium">{a.tujuanMagang}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">{new Date(a.createdAt).toLocaleString('id-ID')}</td>
                        <td className="py-3.5 px-4">{statusBadge(a.status)}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                          <button onClick={() => { setSelectedPengajuan(a); setPengajuanNote(a.catatanAdmin || ''); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition">Evaluasi/Detail</button>
                          {a.status !== 'accepted' && a.status !== 'ongoing' && a.status !== 'completed' && (
                            <button onClick={() => handleVerifyApplication(a.id, 'accepted')} className="inline-flex items-center px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition">Teruskan ke Mitra</button>
                          )}
                          {a.status !== 'rejected' && !['accepted','ongoing','completed'].includes(a.status) && (
                            <button onClick={() => handleVerifyApplication(a.id, 'rejected')} className="inline-flex items-center px-2.5 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition">Tolak</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filteredAppls.length && (
                      <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Tidak ada pengajuan yang cocok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedPengajuan && (
                <div className="rounded-2xl border border-slate-150 p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">Evaluasi Berkas Magang</h4>
                    <button onClick={() => setSelectedPengajuan(null)} className="text-xs text-slate-500 hover:text-slate-700">Tutup</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Nama Mahasiswa</div>
                      <div className="font-bold">{selectedPengajuan.namaMahasiswa}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Instansi / Posisi</div>
                      <div>{selectedPengajuan.tujuanMagang}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Periode</div>
                      <div>{selectedPengajuan.tanggalMulai || '-'} s/d {selectedPengajuan.tanggalSelesai || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Status Saat Ini</div>
                      <div>{statusBadge(selectedPengajuan.status)}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">IPK / SKS</div>
                      <div className="text-slate-500">IPK 3.75 / SKS 110.</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Dokumen Lampiran</div>
                      <div className="text-xs text-slate-400">Belum tersedia.</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Catatan Admin</div>
                      {selectedPengajuan.status === 'submitted' || selectedPengajuan.status === 'under_review' || selectedPengajuan.status === 'revision' ? (
                        <>
                          <textarea
                            value={pengajuanNote}
                            onChange={(e) => setPengajuanNote(e.target.value)}
                            placeholder="Tulis komentar evaluasi..."
                            className="w-full mt-1 appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                          ></textarea>
                          <div className="text-[11px] text-slate-400 mt-1 text-right">Disimpan otomatis saat tombol aksi ditekan.</div>
                        </>
                      ) : (
                        <div className="text-slate-500">{selectedPengajuan.catatanAdmin || '-'}</div>
                      )}
                    </div>
                    {(selectedPengajuan.status === 'submitted' || selectedPengajuan.status === 'under_review' || selectedPengajuan.status === 'revision') && (
                      <div className="sm:col-span-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Quick Replies</div>
                        <select
                          value={rejectionTemplate}
                          onChange={(e) => setRejectionTemplate(e.target.value)}
                          className="mt-1 appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Pilih template catatan...</option>
                          {rejectionTemplates.map((tpl) => (
                            <option key={tpl} value={tpl}>{tpl}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                    <button onClick={() => { setSelectedPengajuan(null); setRejectionTemplate(''); }} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Tutup</button>
                    {(selectedPengajuan.status === 'submitted' || selectedPengajuan.status === 'under_review' || selectedPengajuan.status === 'revision') && (
                      <>
                        <button onClick={() => { savePengajuanNote(selectedPengajuan.id, pengajuanNote || rejectionTemplate); handleVerifyApplication(selectedPengajuan.id, 'rejected'); setRejectionTemplate(''); setSelectedPengajuan(null); }} className="bg-rose-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm active:scale-95">Tolak</button>
                        <button onClick={() => { savePengajuanNote(selectedPengajuan.id, pengajuanNote); handleVerifyApplication(selectedPengajuan.id, 'accepted'); setSelectedPengajuan(null); }} className="bg-blue-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm">Teruskan ke Mitra</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracer' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-4" id="adm-panel-tracer">
              <h3 className="font-bold text-slate-900 text-base">Rekap Tracer Study</h3>
              <p className="text-xs text-slate-400">Laporan kuesioner dan responden tracer study - Read-Only untuk menjaga integritas statistik.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Responden</div>
                  <div className="text-xl font-extrabold text-slate-900">{tracers.length}</div>
                  <div className="text-[11px] text-slate-400">Response Rate {responseRate}%</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Bekerja</div>
                  <div className="text-xl font-extrabold text-blue-600">{countWorking}</div>
                  <div className="text-[11px] text-slate-400">{pctWorking}%</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Wirausaha</div>
                  <div className="text-xl font-extrabold text-emerald-600">{countEntre}</div>
                  <div className="text-[11px] text-slate-400">{pctEntre}%</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Lanjut Studi</div>
                  <div className="text-xl font-extrabold text-indigo-600">{countStudy}</div>
                  <div className="text-[11px] text-slate-400">{pctStudy}%</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Belum Bekerja</div>
                  <div className="text-xl font-extrabold text-rose-600">{countUnemployed}</div>
                  <div className="text-[11px] text-slate-400">{pctUnemployed}%</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">IKU 1</div>
                  <div className="text-[11px] font-bold text-slate-800">Rata-rata tunggu kerja<br/>{avgWaitMonths} bln</div>
                  <div className="text-[11px] font-bold text-slate-800">Gaji rata-rata<br/>{avgSalaryJt} jt vs UMR {Math.round(UMR_PLACEHOLDER/1e6)} jt</div>
                  <div className="text-[11px] font-bold text-slate-800">Relevansi<br/>{relevanceRate}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={tracerQuery}
                    onChange={(e) => setTracerQuery(e.target.value)}
                    placeholder="Cari nama alumni atau tahun lulus..."
                    className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <select value={tracerProdi} onChange={(e) => setTracerProdi(e.target.value)} className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full">
                      <option value="Semua">Semua Program Studi</option>
                      {[...new Set(tracers.map((t) => t.programStudi))].map((prodi) => (
                        <option key={prodi} value={prodi}>{prodi}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={tracerTahun} onChange={(e) => setTracerTahun(e.target.value)} className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full">
                      <option value="Semua">Semua Tahun Lulus (Cohort)</option>
                      {[...new Set(tracers.map((t) => t.tahunLulus))].sort().map((th) => (
                        <option key={th} value={th}>{th}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={tracerStatus} onChange={(e) => setTracerStatus(e.target.value)} className="appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 w-full">
                      <option value="Semua">Semua Status Kerja</option>
                      <option value="bekerja">Bekerja</option>
                      <option value="wirausaha">Wirausaha</option>
                      <option value="lanjut_studi">Lanjut Studi</option>
                      <option value="belum_bekerja">Belum Bekerja</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mt-3"></div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama</th>
                      <th className="py-3 px-4">Prodi</th>
                      <th className="py-3 px-4">Tahun Lulus</th>
                      <th className="py-3 px-4">Status Kerja</th>
                      <th className="py-3 px-4">Masa Tunggu</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {filteredTracers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{t.nama}</td>
                        <td className="py-3.5 px-4 font-medium">{t.programStudi}</td>
                        <td className="py-3.5 px-4">{t.tahunLulus}</td>
                        <td className="py-3.5 px-4">{tracerStatusBadge(t.statusPekerjaan)}</td>
                        <td className="py-3.5 px-4 text-[11px]">{t.masaTungguKerja?.replace('_', ' ') || '-'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => setSelectedTracer(t)} className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition">Detail Kuesioner</button>
                        </td>
                      </tr>
                    ))}
                    {!filteredTracers.length && (
                      <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Tidak ada data tracer study yang cocok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedTracer && (
                <div className="rounded-2xl border border-slate-150 p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">Detail Kuesioner Tracer Study</h4>
                    <button onClick={() => setSelectedTracer(null)} className="text-xs text-slate-500 hover:text-slate-700">Tutup</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Nama Alumni</div>
                      <div className="font-bold">{selectedTracer.nama}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Program Studi / Tahun Lulus</div>
                      <div>{selectedTracer.programStudi} - {selectedTracer.tahunLulus}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Status Kerja</div>
                      <div>{tracerStatusBadge(selectedTracer.statusPekerjaan)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Masa Tunggu Kerja</div>
                      <div>{selectedTracer.masaTungguKerja?.replace('_', ' ') || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Instansi / Posisi</div>
                      <div>{selectedTracer.namaInstansi || '-'} {selectedTracer.jabatan ? `- ${selectedTracer.jabatan}` : ''}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Pendapatan</div>
                      <div>{selectedTracer.rangePenghasilan?.replace('_', ' ') || '-'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Bidang Pekerjaan</div>
                      <div>{selectedTracer.bidangPekerjaan || '-'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Kesesuaian Bidang</div>
                      <div className="capitalize">{selectedTracer.kesesuaianBidang?.replace('_', ' ') || '-'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Saran untuk Kampus</div>
                      <div className="text-slate-600">{selectedTracer.saranUntukKampus || '-'}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => triggerSpreadsheetDownload('tracer')} className="px-4 py-2 border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition active:scale-95">Export Excel</button>
              </div>
            </div>
          )}

          {activeTab === 'konten' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-4" id="adm-panel-konten">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">CMS Berita & Informasi Karir</h3>
                  <p className="text-xs text-slate-400">Publikasi artikel, tips, dan pengumuman kampus.</p>
                </div>
                <button onClick={() => openNewsEditor()} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95">
                  {showAddNews ? 'Sembunyikan Form' : 'Tambah Berita'}
                </button>
              </div>

              {showAddNews && (
                <form onSubmit={(e) => { e.preventDefault(); persistNewsFromForm('published'); }} className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4" id="add-news-form">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">{newsMode === 'edit' ? 'EDIT BERITA' : 'TERBITKAN ARTIKEL PENUNJANG KARIR'}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Judul Artikel Berita *</label>
                      <input
                        type="text"
                        required
                        value={nTitle}
                        onChange={(e) => setNTitle(e.target.value)}
                        placeholder="Contoh: Kunci Penulisan Curriculum Vitae Profesional"
                        className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Kategori / Jenis Konten *</label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value as any)}
                        className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="magang">Blog & Info</option>
                        <option value="tracer_study">Pengumuman</option>
                        <option value="lowongan">Tips Karir</option>
                        <option value="umum">Umum</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Ringkasan (Excerpt) *</label>
                    <textarea
                      required
                      value={newsExcerpt}
                      onChange={(e) => setNewsExcerpt(e.target.value.slice(0, 150))}
                      rows={2}
                      maxLength={150}
                      placeholder="Deskripsi singkat untuk kartu berita di halaman depan..."
                      className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    ></textarea>
                    <div className="text-[11px] text-slate-400 text-right">{newsExcerpt.length}/150</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Cover Image (Thumbnail)</label>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer text-xs font-bold">
                          <Image className="w-4 h-4" />
                          Upload Gambar
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setNewsCoverDataUrl(String(reader.result));
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                        <span className="text-[11px] text-slate-500">Rekomendasi rasio 16:9. Maksimal ukuran file sesuai kapasitas browser.</span>
                      </div>
                      {newsCoverDataUrl && (
                        <div className="mt-3">
                          <img src={newsCoverDataUrl} alt="Preview cover" className="w-full rounded-xl border border-slate-100" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Konten Artikel Berita *</label>
                    <textarea
                      required
                      value={nContent}
                      onChange={(e) => setNContent(e.target.value)}
                      rows={8}
                      placeholder="Isi rincian tips dan aktivitas..."
                      className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    ></textarea>
                    <div className="text-[11px] text-slate-400">Mode WYSIWYG placeholder: formatting dapat ditambahkan pada tahap integrasi editor lanjutan.</div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => { setShowAddNews(false); setEditingNews(null); }} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Batal</button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => { setPreviewNews({ id: 'preview', title: nTitle, content: nContent, excerpt: newsExcerpt, coverImageUrl: newsCoverDataUrl || undefined, status: 'draft', authorId: user.id, createdAt: new Date().toISOString() } as any); }} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Preview</button>
                      <button type="button" onClick={() => persistNewsFromForm('draft')} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Simpan sbg Draft</button>
                      <button type="submit" className="bg-emerald-500 text-slate-950 px-5 py-2 text-xs font-bold rounded-xl shadow-sm active:scale-95">Publish</button>
                    </div>
                  </div>
                </form>
              )}

              {previewNews && (
                <div className="rounded-2xl border border-slate-150 p-6 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-base">Preview Artikel</h4>
                    <button onClick={() => setPreviewNews(null)} className="text-xs text-slate-500 hover:text-slate-700">Tutup</button>
                  </div>
                  <div className="space-y-3 text-sm text-slate-700">
                    {previewNews.coverImageUrl && <img src={previewNews.coverImageUrl} alt="Cover preview" className="w-full rounded-xl" />}
                    <div className="font-bold text-base">{previewNews.title}</div>
                    <div className="text-xs text-slate-500">{previewNews.excerpt}</div>
                    <div className="whitespace-pre-wrap">{previewNews.content}</div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Judul</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Excerpt</th>
                      <th className="py-3 px-4">Cover</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {news.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-normal line-clamp-2">{n.title}</td>
                        <td className="py-3.5 px-4 capitalize text-[11px] whitespace-normal">{(n as any).category || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-normal line-clamp-3">{n.excerpt}</td>
                        <td className="py-3.5 px-4">
                          {n.coverImageUrl ? <img src={n.coverImageUrl} alt="cover" className="h-10 w-16 object-cover rounded-lg border border-slate-100" /> : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          {statusBadge(n.status)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-normal">{new Date(n.publishedAt || n.createdAt).toLocaleString('id-ID')}</td>
                        <td className="py-3.5 px-4 text-right relative">
                          <button onClick={() => setOpenNewsMenuId(openNewsMenuId === n.id ? null : n.id)} className="p-1 rounded hover:bg-slate-100">
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                          </button>
                          {openNewsMenuId === n.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-10">
                              <button onClick={() => { openNewsEditor(n); setOpenNewsMenuId(null); }} className="w-full text-left text-xs px-4 py-2 hover:bg-slate-50">Edit</button>
                              <button onClick={() => { updateInDB<Berita>('berita', { ...n, status: n.status === 'published' ? 'unpublished' : 'published' }); reloadAll(); setOpenNewsMenuId(null); triggerToast('success', 'Status berita diperbarui.'); }} className="w-full text-left text-xs px-4 py-2 hover:bg-slate-50">
                                {n.status === 'published' ? 'Unpublish/Draft' : 'Publish'}
                              </button>
                              <button onClick={() => { setPreviewNews(n); setOpenNewsMenuId(null); }} className="w-full text-left text-xs px-4 py-2 hover:bg-slate-50 flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Preview</button>
                              <button onClick={() => { handleDeleteEntity('berita', n.id, n.title); setOpenNewsMenuId(null); }} className="w-full text-left text-xs px-4 py-2 text-rose-600 hover:bg-rose-50">Hapus</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!news.length && (
                      <tr><td colSpan={7} className="py-6 text-center text-xs text-slate-400">Belum ada berita.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-4" id="adm-panel-laporan">
              <h3 className="font-bold text-slate-900 text-base">Export Data / Spreads</h3>
              <p className="text-xs text-slate-400">Download laporan administratif dalam format Excel (.xlsx).</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Rekap Data Mahasiswa', type: 'mahasiswa' },
                  { label: 'Rekap Data Alumni', type: 'alumni' },
                  { label: 'Rekap Tracer Study', type: 'tracer' },
                  { label: 'Rekap Mitra Kerja Sama', type: 'mitra' },
                  { label: 'Rekap Pengajuan Magang', type: 'pengajuan' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => triggerSpreadsheetDownload(item.type as any)}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-left hover:border-slate-300 transition"
                  >
                    <div className="text-xs font-bold text-slate-800">{item.label}</div>
                    <div className="text-[11px] text-slate-500">Download Excel</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-4" id="adm-panel-users">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Manajemen Hak Akses</h3>
                  <p className="text-xs text-slate-400">Kelola akun staf CDC internal, prodi, dan pimpinan.</p>
                </div>
                <button onClick={() => { setEditingStaffId(null); setStaffName(''); setStaffEmail(''); setStaffRole('viewer'); setStaffPassword(''); setStaffEmailError(''); setShowStaffForm(!showStaffForm); }} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95">
                  {showStaffForm ? 'Tutup Form' : '+ Tambah Staf'}
                </button>
              </div>

              {showStaffForm && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setStaffEmailError('');
                  if (!staffName || !staffEmail || !staffPassword) { triggerToast('error', 'Nama, Email, dan Password wajib diisi.'); return; }
                  if (!isValidEmail(staffEmail)) { setStaffEmailError('Format email tidak valid.'); return; }
                  const id = editingStaffId || `usr_staff_${Date.now()}`;
                  const base = { name: staffName, email: staffEmail, role: staffRole, status: 'active' as const };
                  if (editingStaffId) {
                    const existing = allUsers.find(u => u.id === editingStaffId);
                    updateInDB<UserType>('users', { ...(existing as UserType), ...base } as UserType);
                    triggerToast('success', 'Data staf berhasil diperbarui.');
                  } else {
                    insertToDB<UserType>('users', { id, ...base, password: staffPassword, createdAt: new Date().toISOString() } as any);
                    triggerToast('success', 'Staf baru berhasil ditambahkan.');
                  }
                  setShowStaffForm(false);
                  setEditingStaffId(null);
                  setStaffName('');
                  setStaffEmail('');
                  setStaffPassword('');
                  reloadAll();
                }} className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">{editingStaffId ? 'EDIT STAF' : 'TAMBAH STAF BARU'}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                      <input required value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Nama staf internal" className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email *</label>
                      <input required value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="email@umkendari.ac.id" className={`w-full px-4 py-2 rounded-xl border ${staffEmailError ? 'border-rose-300' : 'border-slate-200'} text-sm font-normal focus:outline-none`} />
                      {staffEmailError && <div className="text-[11px] text-rose-600">{staffEmailError}</div>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Hak Akses (Role) *</label>
                      <select value={staffRole} onChange={(e) => setStaffRole(e.target.value as UserRole)} className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                        <option value="viewer">Viewer / Prodi</option>
                        <option value="admin">Staf CDC</option>
                        <option value="admin">Root Administrator</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Password *</label>
                      <input required type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} placeholder="Password akun staf" className="w-full appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => { setShowStaffForm(false); setEditingStaffId(null); }} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Batal</button>
                    <button type="submit" className="bg-emerald-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm">{editingStaffId ? 'Simpan Perubahan' : 'Tambah Staf'}</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role/Divisi</th>
                      <th className="py-3 px-4">Status Aktif</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {allUsers.filter(u => u.role !== 'mahasiswa' && u.role !== 'alumni' && u.role !== 'mitra').map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-4">{u.email}</td>
                        <td className="py-3.5 px-4 capitalize">{u.role}</td>
                        <td className="py-3.5 px-4 capitalize">{u.status}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                          <button onClick={() => { setEditingStaffId(u.id); setStaffName(u.name); setStaffEmail(u.email); setStaffRole(u.role); setShowStaffForm(true); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition">Edit</button>
                            <button onClick={() => { updateInDB<UserType>('users', { ...u, status: 'inactive' }); reloadAll(); triggerToast('success', `Akses ${u.name} di-suspend.`); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 text-[11px] font-bold transition">Suspend</button>
                            <button onClick={() => { updateInDB<UserType>('users', { ...u, status: 'active' }); reloadAll(); triggerToast('success', `Akses ${u.name} diaktifkan.`); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition">Aktifkan</button>
                        </td>
                      </tr>
                    ))}
                    {!allUsers.filter(u => u.role !== 'mahasiswa' && u.role !== 'alumni' && u.role !== 'mitra').length && (
                      <tr><td colSpan={5} className="py-6 text-center text-xs text-slate-400">Belum ada staf internal.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approval' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200 space-y-4" id="adm-panel-approval">
              <h3 className="font-bold text-slate-900 text-base">Approval Mitra & Entitas</h3>
              <p className="text-xs text-slate-400">Validasi pendaftaran akun perusahaan/mitra baru dan dokumen legalitas.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Perusahaan</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Dokumen Legalitas</th>
                      <th className="py-3 px-4">Tanggal Daftar</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {allUsers.filter(u => u.role === 'mitra').map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-4">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-500">-</td>
                        <td className="py-3.5 px-4 text-[11px]">{new Date(u.createdAt).toLocaleString('id-ID')}</td>
                        <td className="py-3.5 px-4 capitalize">{u.status}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                          <button onClick={() => setSelectedApprovalDetail(u as UserType)} className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition">Validasi Dokumen</button>
                            {u.status !== 'active' && (
                              <button onClick={() => { updateInDB<UserType>('users', { ...u, status: 'active' }); reloadAll(); triggerToast('success', `Akun ${u.name} disetujui.`); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition">Terima</button>
                            )}
                            {u.status !== 'rejected' && (
                              <button onClick={() => { updateInDB<UserType>('users', { ...u, status: 'rejected' }); reloadAll(); triggerToast('success', `Akun ${u.name} ditolak.`); }} className="inline-flex items-center px-2.5 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition">Tolak</button>
                            )}
                        </td>
                      </tr>
                    ))}
                    {!allUsers.filter(u => u.role === 'mitra').length && (
                      <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Tidak ada entitas mitra yang perlu divalidasi.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedApprovalDetail && (
                <div className="rounded-2xl border border-slate-150 p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">Validasi Dokumen & Profil Mitra</h4>
                    <button onClick={() => setSelectedApprovalDetail(null)} className="text-xs text-slate-500 hover:text-slate-700">Tutup</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Nama Perusahaan</div>
                      <div className="font-bold">{selectedApprovalDetail.name}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Email Kontak</div>
                      <div>{selectedApprovalDetail.email}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Dokumen Legalitas</div>
                      <div className="text-xs text-slate-400">Belum tersedia.</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Catatan Validasi</div>
                      <textarea value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} placeholder="Catatan internal apabila perlu..." className="w-full mt-1 appearance-none bg-[#f3f2ef] border border-slate-800 text-slate-800 px-3.5 py-2 pr-9 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                    <button onClick={() => setSelectedApprovalDetail(null)} className="border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">Tutup</button>
                    <button onClick={() => { updateInDB<UserType>('users', { ...selectedApprovalDetail, status: 'active' }); reloadAll(); setSelectedApprovalDetail(null); setApprovalNote(''); triggerToast('success', 'Entitas mitra disetujui.'); }} className="bg-emerald-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm">Terima</button>
                    <button onClick={() => { updateInDB<UserType>('users', { ...selectedApprovalDetail, status: 'rejected' }); reloadAll(); setSelectedApprovalDetail(null); setApprovalNote(''); triggerToast('success', 'Entitas mitra ditolak.'); }} className="bg-rose-600 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm active:scale-95">Tolak</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}