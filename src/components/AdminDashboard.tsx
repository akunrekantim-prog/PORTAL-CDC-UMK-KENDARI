/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminDashboard — Portal CDC UM Kendari
 * Restrukturisasi penuh: 5 menu utama + internal tab.
 *   1. Dashboard Awal (Ringkasan Laporan)
 *   2. Konten Karir (Riwayat + Pembuatan, editor gaya Medium)
 *   3. Manajemen Mitra (Approval + List)
 *   4. Manajemen Admin (Kelola Admin)
 */

import React, { useState, useEffect, useRef } from 'react';
import ChartArea from './ChartArea';
import Dropdown from './Dropdown';
import {
  User as UserType,
  Mahasiswa,
  Alumni,
  Mitra,
  Lowongan,
  PengajuanMagang,
  KontenKarir,
  JenisKonten
} from '../types';
import {
  getFromDB,
  insertToDB,
  updateInDB,
  deleteInDB
} from '../data';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Briefcase,
  Megaphone,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Activity,
  Trophy,
  CalendarDays,
  Layers,
  Building2,
  UserCog,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Check,
  X,
  Ban,
  MapPin,
  Calendar,
  Clock,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Highlighter as HighlighterIcon,
  Type as TypeIcon,
  Baseline as BaselineIcon,
  CaseSensitive as CaseIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronUp,
  ChevronDown,
  Eraser as EraserIcon,
  Pilcrow as PilcrowIcon,
  Heading1,
  Heading2,
  Quote,
  Minus,
  List,
  ListOrdered,
  Image as ImageIcon,
  Users,
  Download,
  AlertCircle,
  ZoomIn,
  LogOut,
  Save,
  ExternalLink,
  MousePointerClick
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  onReloadData?: () => void;
}

type AdminTab = 'ringkasan' | 'konten' | 'mitra' | 'admin';
type KontenSubTab = 'riwayat' | 'pembuatan';
type MitraSubTab = 'approval' | 'list';

const JENIS_LABEL: Record<JenisKonten, string> = {
  berita: 'Berita & Artikel',
  lowongan: 'Lowongan (Magang/Kerja)',
  program: 'Program & Pengumuman',
  workshop: 'Workshop & Pelatihan Karir',
  softskill: 'Pelatihan Softskill & Kewirausahaan',
  seminar: 'Seminar Sukses Berkarir'
};

const JENIS_ICON: Record<JenisKonten, React.ReactNode> = {
  berita: <Newspaper className="w-4 h-4" />,
  lowongan: <Briefcase className="w-4 h-4" />,
  program: <Megaphone className="w-4 h-4" />,
  workshop: <GraduationCap className="w-4 h-4" />,
  softskill: <Sparkles className="w-4 h-4" />,
  seminar: <GraduationCap className="w-4 h-4" />
};

// Rasio thumbnail wajib per jenis
const THUMB_REQUIRED: Record<JenisKonten, boolean> = {
  berita: true,    // 16:9
  lowongan: true,  // 9:16
  program: true,     // thumbnail wajib (header kartu)
  workshop: true,  // 16:9
  softskill: true, // 16:9
  seminar: true    // 16:9
};

const formatTanggal = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('ringkasan');
  const [kontenSub, setKontenSub] = useState<KontenSubTab>('riwayat');
  const [mitraSub, setMitraSub] = useState<MitraSubTab>('approval');

  // DB states
  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [mitra, setMitra] = useState<Mitra[]>([]);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [appls, setAppls] = useState<PengajuanMagang[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [konten, setKonten] = useState<KontenKarir[]>([]);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const reloadAll = () => {
    setStudents(getFromDB<Mahasiswa>('mahasiswa'));
    setAlumni(getFromDB<Alumni>('alumni'));
    setMitra(getFromDB<Mitra>('mitra'));
    setLowongan(getFromDB<Lowongan>('lowongan'));
    setAppls(getFromDB<PengajuanMagang>('pengajuan_magang'));
    setAllUsers(getFromDB<UserType>('users'));
    setKonten(getFromDB<KontenKarir>('konten_karir'));
  };

  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  /* =========================================================
   *  SIDEBAR
   * =======================================================*/
  const MENU: { group: string; items: { id: AdminTab; label: string; icon: React.ReactNode }[] }[] = [
    { group: 'DASHBOARD', items: [{ id: 'ringkasan', label: 'Ringkasan Laporan', icon: <LayoutDashboard className="w-4 h-4" /> }] },
    {
      group: 'KONTEN KARIR',
      items: [
        { id: 'konten', label: 'Riwayat & Pembuatan Konten', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      group: 'MANAJEMEN MITRA',
      items: [
        { id: 'mitra', label: 'Approval & List Mitra', icon: <Building2 className="w-4 h-4" /> }
      ]
    },
    {
      group: 'MANAJEMEN ADMIN',
      items: [
        { id: 'admin', label: 'Kelola Admin', icon: <UserCog className="w-4 h-4" /> }
      ]
    }
  ];

  /* =========================================================
   *  DASHBOARD AWAL
   * =======================================================*/
  const pendingMitra = mitra.filter((m) => m.statusKerjaSama === 'pending');
  const totalMenunggu = pendingMitra.length;

  // Aktivitas terkini (gabungan, 8 terbaru)
  const aktivitas = [
    ...lowongan.map((l) => ({ date: l.createdAt, text: `Lowongan baru dipublikasikan: ${l.judul}` })),
    ...konten.map((k) => ({ date: k.createdAt, text: `Konten ${JENIS_LABEL[k.jenis]} dibuat: ${k.judul}` })),
    ...mitra.map((m) => ({ date: m.userId, text: `Mitra terdaftar: ${m.namaInstansi}` }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const topMitra = [...mitra]
    .map((m) => ({ m, count: lowongan.filter((l) => l.namaInstansi === m.namaInstansi).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Grafik frekuensi
  const [freqInterval, setFreqInterval] = useState<'harian' | 'mingguan' | 'bulanan'>('mingguan');
  const freqData = (() => {
    const sumber = [
      ...lowongan.map((l) => l.createdAt),
      ...konten.map((k) => k.createdAt)
    ].map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()));

    const buckets: { label: string; count: number }[] = [];
    const now = new Date();

    if (freqInterval === 'harian') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const c = sumber.filter((s) => s.toDateString() === d.toDateString()).length;
        buckets.push({ label, count: c });
      }
    } else if (freqInterval === 'mingguan') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now); start.setDate(start.getDate() - i * 7);
        const label = `Mg ${start.getDate()}/${start.getMonth() + 1}`;
        const c = sumber.filter((s) => {
          const diff = (now.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= i * 7 && diff < (i + 1) * 7;
        }).length;
        buckets.push({ label, count: c });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        const c = sumber.filter((s) => s.getMonth() === d.getMonth() && s.getFullYear() === d.getFullYear()).length;
        buckets.push({ label, count: c });
      }
    }
    return buckets;
  })();
  const freqMax = Math.max(1, ...freqData.map((b) => b.count));

  /* =========================================================
   *  MANAJEMEN MITRA
   * =======================================================*/
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [mitraQuery, setMitraQuery] = useState('');
  const [mitraStatusFilter, setMitraStatusFilter] = useState<'Semua' | 'aktif' | 'nonaktif' | 'pending'>('Semua');

  const handleApproveMitra = (m: Mitra, note: string) => {
    const updated = { ...m, statusKerjaSama: 'aktif' as const };
    updateInDB<Mitra>('mitra', updated);
    // juga aktifkan user-nya
    const users = getFromDB<UserType>('users');
    const u = users.find((x) => x.id === m.userId);
    if (u) {
      const u2 = { ...u, status: 'active' as const };
      updateInDB<UserType>('users', u2);
    }
    setApprovalNote('');
    setSelectedMitra(updated);
    reloadAll();
    triggerToast('success', `Mitra "${m.namaInstansi}" disetujui.${note ? ' Catatan: ' + note : ''}`);
  };

  const handleRejectMitra = (m: Mitra, note: string) => {
    const updated = { ...m, statusKerjaSama: 'nonaktif' as const };
    updateInDB<Mitra>('mitra', updated);
    const users = getFromDB<UserType>('users');
    const u = users.find((x) => x.id === m.userId);
    if (u) {
      const u2 = { ...u, status: 'rejected' as const };
      updateInDB<UserType>('users', u2);
    }
    setApprovalNote('');
    setSelectedMitra(updated);
    reloadAll();
    triggerToast('error', `Mitra "${m.namaInstansi}" ditolak.${note ? ' Catatan: ' + note : ''}`);
  };

  const handleBanMitra = (m: Mitra) => {
    const next = m.statusKerjaSama === 'aktif' ? 'nonaktif' : 'aktif';
    const updated = { ...m, statusKerjaSama: next as any };
    updateInDB<Mitra>('mitra', updated);
    setSelectedMitra(updated);
    reloadAll();
    triggerToast('success', `Status mitra "${m.namaInstansi}" -> ${next}.`);
  };

  const handleDeleteMitra = (m: Mitra) => {
    if (confirm(`Hapus mitra "${m.namaInstansi}" secara permanen?`)) {
      deleteInDB('mitra', m.id);
      setSelectedMitra(null);
      reloadAll();
      triggerToast('success', 'Mitra dihapus.');
    }
  };

  const filteredMitra = mitra.filter((m) => {
    const q = mitraQuery.trim().toLowerCase();
    const matchQ = !q || m.namaInstansi.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
    const matchS = mitraStatusFilter === 'Semua' || m.statusKerjaSama === mitraStatusFilter;
    return matchQ && matchS;
  });

  /* =========================================================
   *  MANAJEMEN ADMIN
   * =======================================================*/
  const adminUsers = allUsers.filter((u) => u.role === 'admin');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [aName, setAName] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aPass, setAPass] = useState('');
  const [aEmailError, setAEmailError] = useState('');

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aName || !aEmail) {
      triggerToast('error', 'Nama dan email wajib diisi.');
      return;
    }
    const existing = getFromDB<UserType>('users').find((u) => u.email.toLowerCase() === aEmail.toLowerCase());
    if (existing) {
      setAEmailError('Email sudah terdaftar.');
      return;
    }
    const newAdmin: UserType = {
      id: `usr_admin_${Date.now()}`,
      name: aName,
      email: aEmail,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    insertToDB<UserType>('users', newAdmin);
    setAName(''); setAEmail(''); setAPass(''); setShowAddAdmin(false);
    reloadAll();
    triggerToast('success', `Admin "${aName}" ditambahkan.`);
  };

  const handleDisableAdmin = (u: UserType) => {
    updateInDB<UserType>('users', { ...u, status: u.status === 'active' ? 'inactive' : 'active' });
    reloadAll();
    triggerToast('success', u.status === 'active' ? `Admin "${u.name}" dinonaktifkan.` : `Admin "${u.name}" diaktifkan.`);
  };

  const handleDeleteAdmin = (u: UserType) => {
    if (adminUsers.length <= 1) {
      triggerToast('error', 'Minimal harus ada 1 admin.');
      return;
    }
    if (confirm(`Hapus admin "${u.name}"?`)) {
      deleteInDB('users', u.id);
      reloadAll();
      triggerToast('success', 'Admin dihapus.');
    }
  };

  /* =========================================================
   *  KONTEN KARIR — EDITOR MEDIUM
   * =======================================================*/
  const [kontenQuery, setKontenQuery] = useState('');
  const [kontenJenisFilter, setKontenJenisFilter] = useState<'Semua' | JenisKonten>('Semua');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eJenis, setEJenis] = useState<JenisKonten>('berita');
  const [eJudul, setEJudul] = useState('');
  const [eBody, setEBody] = useState('');
  const [ePenulis, setEPenulis] = useState('');
  const [eThumbnail, setEThumbnail] = useState('');
  const [eNamaInstansi, setENamaInstansi] = useState('');
  const [eTipe, setETipe] = useState<'magang' | 'kerja'>('magang');
  const [eLinkLamar, setELinkLamar] = useState('');
  const [eKategori, setEKategori] = useState('');
  const [eScope, setEScope] = useState<'LOKAL' | 'REGIONAL' | 'NASIONAL' | 'GLOBAL'>('LOKAL');
  const [eGaji, setEGaji] = useState('');
  const [eKuota, setEKuota] = useState('');
  const [eDeadline, setEDeadline] = useState('');
  const [eLinkCta, setELinkCta] = useState('');
  const [eStatus, setEStatus] = useState<'draft' | 'published'>('published');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const openEditor = (item?: KontenKarir, jenis?: JenisKonten) => {
    if (item) {
      setEditId(item.id);
      setEJenis(item.jenis);
      setEJudul(item.judul);
      setEBody(item.body);
      setEPenulis(item.penulis || '');
      setEThumbnail(item.thumbnail || '');
      setENamaInstansi(item.namaInstansi || '');
      setETipe(item.tipe || 'magang');
      setELinkLamar(item.linkLamar || '');
      setEKategori(item.kategori || '');
      setEScope(item.scope || 'LOKAL');
      setEGaji(item.gaji || '');
      setEKuota(item.kuota != null ? String(item.kuota) : '');
      setEDeadline(item.deadline || '');
      setELinkCta(item.linkCta || '');
      setEStatus(item.status);
    } else {
      setEditId(null);
      setEJenis(jenis || 'berita');
      setEJudul(''); setEBody(''); setEPenulis(''); setEThumbnail('');
      setELinkLamar(''); setEKategori(''); setEScope('LOKAL');
      setEGaji(''); setEKuota(''); setEDeadline(''); setELinkCta(''); setEStatus('published');
    }
    setKontenSub('pembuatan');
    setEditorOpen(true);
  };

  const [kontenJenisBaru, setKontenJenisBaru] = useState<JenisKonten | null>(null);

  /* =========================================================
   *  LOWONGAN INFO KARIR — INPUT ADMIN (BY ADMIN CDC)
   *  Menyimpan ke tabel `lowongan` (sama seperti input Mitra)
   *  dengan penanda sumber: 'admin'.
   * =======================================================*/
  const adminLowongan = lowongan.filter((l) => l.sumber === 'admin');
  const [showLowonganForm, setShowLowonganForm] = useState(false);
  const [editLowonganId, setEditLowonganId] = useState<string | null>(null);
  const [lJudul, setLJudul] = useState('');
  const [lTipe, setLTipe] = useState<'magang' | 'kerja'>('magang');
  const [lNamaInstansi, setLNamaInstansi] = useState('');
  const [lKategori, setLKategori] = useState('');
  const [lLokasi, setLLokasi] = useState('');
  const [lGaji, setLGaji] = useState('');
  const [lKuota, setLKuota] = useState('');
  const [lDeadline, setLDeadline] = useState('');
  const [lDeskripsi, setLDeskripsi] = useState('');
  const [lTanggungJawab, setLTanggungJawab] = useState('');
  const [lKualifikasi, setLKualifikasi] = useState('');
  const [lKeahlian, setLKeahlian] = useState('');
  const [lBenefit, setLBenefit] = useState('');
  const [lLogoUrl, setLLogoUrl] = useState('');
  const [lPosterUrl, setLPosterUrl] = useState('');
  const [lLogoUploadType, setLLogoUploadType] = useState<'file' | 'url'>('file');
  const [lPosterUploadType, setLPosterUploadType] = useState<'file' | 'url'>('file');
  const [lLinkEksternal, setLLinkEksternal] = useState('');
  const [lCtaEnabled, setLCtaEnabled] = useState(false);
  const [lCtaLabel, setLCtaLabel] = useState('Daftar Sekarang');
  const [lJenisPekerjaan, setLJenisPekerjaan] = useState<'full-time' | 'part-time'>('full-time');
  const [lStatus, setLStatus] = useState<'published' | 'closed'>('published');

  const openLowonganForm = (item?: Lowongan) => {
    if (item) {
      setEditLowonganId(item.id);
      setLJudul(item.judul);
      setLTipe(item.tipe);
      setLNamaInstansi(item.namaInstansi);
      setLKategori(item.kategori || '');
      setLLokasi(item.lokasi);
      setLGaji(item.gaji || '');
      setLKuota(item.kuota != null ? String(item.kuota) : '');
      setLDeadline(item.deadline);
      setLDeskripsi(item.deskripsi);
      setLTanggungJawab(Array.isArray(item.tanggungJawab) ? item.tanggungJawab.join('\n') : (item.tanggungJawab || ''));
      setLKualifikasi(Array.isArray(item.kualifikasi) ? item.kualifikasi.join('\n') : '');
      setLKeahlian(Array.isArray(item.keahlian) ? item.keahlian.join('\n') : '');
      setLBenefit(Array.isArray(item.benefit) ? item.benefit.join('\n') : '');
      setLLogoUrl(item.companyLogo || '');
      setLPosterUrl(item.flyer || item.imageUrl || item.bannerImage || (item.flyers && item.flyers[0]) || '');
      setLLinkEksternal(item.linkEksternal || '');
      setLCtaEnabled(item.ctaEnabled === true);
      setLCtaLabel(item.ctaLabel && item.ctaLabel.trim() ? item.ctaLabel : 'Daftar Sekarang');
      setLJenisPekerjaan(item.jenisPekerjaan || 'full-time');
      setLStatus(item.status === 'closed' ? 'closed' : 'published');
    } else {
      setEditLowonganId(null);
      setLJudul(''); setLTipe('magang'); setLNamaInstansi(''); setLKategori('');
      setLLokasi(''); setLGaji('Kompetitif'); setLKuota(''); setLDeadline('');
      setLDeskripsi(''); setLTanggungJawab(''); setLKualifikasi(''); setLKeahlian(''); setLBenefit('');
      setLLogoUrl(''); setLPosterUrl(''); setLLinkEksternal(''); setLCtaEnabled(false); setLCtaLabel('Daftar Sekarang'); setLJenisPekerjaan('full-time'); setLStatus('published');
    }
    setLLogoUploadType('file');
    setLPosterUploadType('file');
    setEditorOpen(false);
    setKontenSub('pembuatan');
    setShowLowonganForm(true);
  };

  const resetLowonganForm = () => {
    setShowLowonganForm(false);
    setEditLowonganId(null);
    setKontenSub('riwayat');
  };

  const handleLowonganLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLLogoUrl(await readFileAsDataUrl(file));
  };
  const handleLowonganPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLPosterUrl(await readFileAsDataUrl(file));
  };

  const handleSaveLowongan = () => {
    if (!lJudul.trim() || !lNamaInstansi.trim() || !lLokasi.trim() || !lDeadline.trim() || !lDeskripsi.trim()) {
      triggerToast('error', 'Field bertanda * wajib diisi (Judul, Instansi, Lokasi, Deadline, Deskripsi).');
      return;
    }
    if (lCtaEnabled && !lLinkEksternal.trim()) {
      triggerToast('error', 'Tombol CTA diaktifkan — Link tujuan wajib diisi.');
      return;
    }
    const parseLines = (txt: string): string[] =>
      txt.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);

    const logoTarget = lLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop';
    const existing = editLowonganId ? lowongan.find((j) => j.id === editLowonganId) : null;

    const newLow: Lowongan = {
      id: editLowonganId || `low_admin_${Date.now()}`,
      mitraId: editLowonganId ? (existing?.mitraId || 'admin_cdc') : 'admin_cdc',
      createdBy: user.id,
      judul: lJudul.trim(),
      tipe: lTipe,
      namaInstansi: lNamaInstansi.trim(),
      companyLogo: logoTarget,
      imageUrl: lPosterUrl || undefined,
      flyer: lPosterUrl || undefined,
      bannerImage: lPosterUrl || undefined,
      flyers: lPosterUrl ? [lPosterUrl] : undefined,
      sumber: 'admin',
      linkEksternal: lLinkEksternal.trim() || undefined,
      ctaEnabled: lCtaEnabled,
      ctaLabel: lCtaEnabled ? (lCtaLabel.trim() || 'Daftar Sekarang') : undefined,
      jenisPekerjaan: lJenisPekerjaan,
      lokasi: lLokasi.trim(),
      kategori: lKategori.trim() || undefined,
      gaji: lGaji.trim() || 'Kompetitif',
      kuota: lKuota ? Number(lKuota) : 1,
      deadline: lDeadline,
      deskripsi: lDeskripsi,
      tanggungJawab: parseLines(lTanggungJawab),
      kualifikasi: parseLines(lKualifikasi),
      keahlian: parseLines(lKeahlian),
      benefit: parseLines(lBenefit),
      status: lStatus,
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    if (editLowonganId) {
      updateInDB<Lowongan>('lowongan', newLow);
      triggerToast('success', 'Lowongan By Admin diperbarui.');
    } else {
      insertToDB<Lowongan>('lowongan', newLow);
      triggerToast('success', 'Lowongan By Admin diposting ke Info Karir.');
    }
    resetLowonganForm();
    reloadAll();
  };

  const handleDeleteLowonganAdmin = (l: Lowongan) => {
    if (confirm(`Hapus lowongan \"${l.judul}\" (By Admin)?`)) {
      deleteInDB('lowongan', l.id);
      reloadAll();
      triggerToast('success', 'Lowongan By Admin dihapus.');
    }
  };

  // ── Helper seleksi textarea ──────────────────────────────
  const setCaret = (pos: number) => {
    const ta = bodyRef.current;
    if (!ta) return;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };
  const applyEdit = (next: string, caret: number) => {
    setEBody(next);
    setCaret(caret);
  };

  // Sisip token pembungkus (inline) pada seleksi
  const wrapInline = (token: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const selected = eBody.substring(s, e) || 'teks';
    const before = eBody.substring(0, s);
    const after = eBody.substring(e);
    const inserted = `${token}${selected}${token}`;
    applyEdit(before + inserted + after, s + inserted.length);
  };

  // Sisip token pembungkus dengan argumen, misal [hl:#fff176]..[/hl]
  const wrapInlineArg = (open: string, close: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const selected = eBody.substring(s, e) || 'teks';
    const before = eBody.substring(0, s);
    const after = eBody.substring(e);
    const inserted = `${open}${selected}${close}`;
    applyEdit(before + inserted + after, s + inserted.length);
  };

  // Token baris baru di awal baris (block-level: H1/H2/quote/divider)
  const insertLineToken = (token: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const before = eBody.substring(0, s);
    const needNl = before.length > 0 && !before.endsWith('\n');
    const inserted = `${needNl ? '\n' : ''}${token}`;
    applyEdit(before + inserted + eBody.substring(s), s + inserted.length);
  };

  // Toggle awalan baris (bullet / nomor / block align)
  const toggleLinePrefix = (prefix: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const lineStart = eBody.lastIndexOf('\n', s - 1) + 1;
    const lineEnd = eBody.indexOf('\n', s);
    const le = lineEnd === -1 ? eBody.length : lineEnd;
    const line = eBody.substring(lineStart, le);
    let nextLine: string;
    if (line.startsWith(prefix)) {
      nextLine = line.slice(prefix.length);
    } else {
      nextLine = `${prefix}${line}`;
    }
    applyEdit(eBody.substring(0, lineStart) + nextLine + eBody.substring(le), s);
  };

  // Ubah case teks terpilih
  const changeCase = (mode: 'upper' | 'lower' | 'title') => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    if (s === e) return;
    const sel = eBody.substring(s, e);
    let out: string;
    if (mode === 'upper') out = sel.toUpperCase();
    else if (mode === 'lower') out = sel.toLowerCase();
    else out = sel.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    applyEdit(eBody.substring(0, s) + out + eBody.substring(e), e);
  };

  // Bersihkan semua format token pada seleksi
  const clearFormatting = () => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    let sel = eBody.substring(s, e) || eBody;
    sel = sel
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[sub\](.+?)\[\/sub\]/g, '$1')
      .replace(/\[sup\](.+?)\[\/sup\]/g, '$1')
      .replace(/\[hl(?::#[0-9a-fA-F]{6})?\](.+?)\[\/hl\]/g, '$1')
      .replace(/\[c:#[0-9a-fA-F]{6}\](.+?)\[\/c\]/g, '$1')
      .replace(/\[fs:\d+\](.+?)\[\/fs\]/g, '$1');
    const ss = s === e ? 0 : s;
    const ee = s === e ? eBody.length : e;
    applyEdit(eBody.substring(0, ss) + sel + eBody.substring(ee), ss + sel.length);
  };

  // Font size +/- pada seleksi
  const fontSizeAdjust = (delta: number) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = eBody.substring(s, e) || 'teks';
    const m = sel.match(/^\[fs:(\d+)\]/);
    const cur = m ? Number(m[1]) : 16;
    const next = Math.min(96, Math.max(10, cur + delta));
    const inner = m ? sel.replace(/^\[fs:\d+\]/, '') : sel;
    const inserted = `[fs:${next}]${inner}[/fs]`;
    applyEdit(eBody.substring(0, s) + inserted + eBody.substring(e), s + inserted.length);
  };

  // Bungkus baris (block) dengan align + spacing
  const wrapBlock = (align: 'left' | 'center' | 'right' | 'justify', spacing: number) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = eBody.substring(s, e) || 'teks';
    // buang block lama
    const cleaned = sel.replace(/^\[block[^\]]*\]\n?|\n?\[\/block\]$/g, '');
    const inserted = `[block align=${align} spacing=${spacing}]\n${cleaned}\n[/block]`;
    applyEdit(eBody.substring(0, s) + inserted + eBody.substring(e), s + inserted.length);
  };

  // Ikon pendukung cepat (lokasi/kalender/jam)
  const insertIconLine = (kind: 'lokasi' | 'kalender' | 'jam') => {
    insertLineToken(`[${kind}: `);
  };

  // State perataan & spasi paragraf (dipakai Align + Spacing)
  const [blockAlign, setBlockAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [blockSpacing, setBlockSpacing] = useState(1);
  const applyBlock = (align?: 'left' | 'center' | 'right' | 'justify', spacing?: number) => {
    const a = align || blockAlign;
    const sp = spacing !== undefined ? spacing : blockSpacing;
    wrapBlock(a, sp);
  };

  const handleThumbChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await readFileAsDataUrl(file);
      setEThumbnail(url);
    }
  };

  const handleSaveKonten = () => {
    if (!eJudul.trim()) {
      triggerToast('error', 'Judul wajib diisi.');
      return;
    }
    if (eJenis !== 'program' && !eBody.trim()) {
      triggerToast('error', 'Judul dan isi konten wajib diisi.');
      return;
    }
    if (THUMB_REQUIRED[eJenis] && !eThumbnail) {
      triggerToast('error', `Thumbnail wajib untuk ${JENIS_LABEL[eJenis]}.`);
      return;
    }
    const now = new Date().toISOString();
    const base: KontenKarir = {
      id: editId || `kk_${Date.now()}`,
      jenis: eJenis,
      judul: eJudul.trim(),
      body: eBody,
      penulis: eJenis === 'berita' ? (ePenulis.trim() || user.name) : undefined,
      namaInstansi: eJenis === 'lowongan' ? eNamaInstansi.trim() : undefined,
      tipe: eJenis === 'lowongan' ? eTipe : undefined,
      linkLamar: eJenis === 'lowongan' ? eLinkLamar.trim() : undefined,
      kategori: (eJenis === 'lowongan' || eJenis === 'program') ? eKategori.trim() : undefined,
      gaji: eJenis === 'lowongan' ? eGaji.trim() : undefined,
      kuota: eJenis === 'lowongan' && eKuota ? Number(eKuota) : undefined,
      deadline: eJenis === 'lowongan' ? eDeadline : undefined,
      linkCta: (eJenis === 'program' || eJenis === 'workshop' || eJenis === 'softskill') ? eLinkCta.trim() : undefined,
      thumbnail: THUMB_REQUIRED[eJenis] ? eThumbnail : undefined,
      scope: eJenis === 'berita' ? eScope : undefined,
      status: eStatus,
      createdAt: editId ? (konten.find((k) => k.id === editId)?.createdAt || now) : now,
      updatedAt: now,
      createdBy: 'usr_admin',
      createdByName: 'Admin CDC'
    };
    if (editId) {
      updateInDB<KontenKarir>('konten_karir', base);
      triggerToast('success', 'Konten diperbarui.');
    } else {
      insertToDB<KontenKarir>('konten_karir', base);
      triggerToast('success', 'Konten diterbitkan.');
    }
    setEditorOpen(false);
    setKontenJenisBaru(null);
    reloadAll();
  };

  const handleDeleteKonten = (k: KontenKarir) => {
    if (confirm(`Hapus konten "${k.judul}"?`)) {
      deleteInDB('konten_karir', k.id);
      reloadAll();
      triggerToast('success', 'Konten dihapus.');
    }
  };

  const filteredKonten = konten.filter((k) => {
    const q = kontenQuery.trim().toLowerCase();
    const matchQ = !q || k.judul.toLowerCase().includes(q);
    const matchJ = kontenJenisFilter === 'Semua' || k.jenis === kontenJenisFilter;
    return matchQ && matchJ;
  });

  /* =========================================================
   *  RENDER — STATUS BADGE
   * =======================================================*/
  const statusBadge = (status: string, map: Record<string, { bg: string; text: string; label: string }>) => {
    const item = map[status] || { bg: 'bg-slate-50', text: 'text-slate-700', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.bg} ${item.text}`}>
        {item.label}
      </span>
    );
  };

  /* =========================================================
   *  MEDIUM PREVIEW RENDERER
   * =======================================================*/
  const renderInline = (text: string): React.ReactNode => {
    // Urutan token: **bold**, __underline__, ~~strike~~, *italic*, [sub], [sup], [hl], [c], [fs]
    const regex = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|\[sub\][^[]*?\[\/sub\]|\[sup\][^[]*?\[\/sup\]|\[hl(?::#[0-9a-fA-F]{6})?\][^[]*?\[\/hl\]|\[c:#[0-9a-fA-F]{6}\][^[]*?\[\/c\]|\[fs:\d+\][^[]*?\[\/fs\])/g;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const tok = m[0];
      let node: React.ReactNode;
      if (tok.startsWith('**')) node = <strong key={i++}>{renderInline(tok.slice(2, -2))}</strong>;
      else if (tok.startsWith('__')) node = <u key={i++}>{renderInline(tok.slice(2, -2))}</u>;
      else if (tok.startsWith('~~')) node = <span key={i++} className="line-through">{tok.slice(2, -2)}</span>;
      else if (tok.startsWith('*')) node = <em key={i++}>{renderInline(tok.slice(1, -1))}</em>;
      else if (tok.startsWith('[sub]')) node = <sub key={i++}>{renderInline(tok.slice(5, -6))}</sub>;
      else if (tok.startsWith('[sup]')) node = <sup key={i++}>{renderInline(tok.slice(5, -6))}</sup>;
      else if (tok.startsWith('[hl')) {
        const cm = tok.match(/^\[hl(?::#([0-9a-fA-F]{6}))?\]([\s\S]*?)\[\/hl\]$/);
        const bg = cm && cm[1] ? `#${cm[1]}` : '#fef08a';
        node = <mark key={i++} style={{ backgroundColor: bg }} className="rounded px-0.5">{renderInline(cm ? cm[2] : tok)}</mark>;
      } else if (tok.startsWith('[c:')) {
        const cm = tok.match(/^\[c:#([0-9a-fA-F]{6})\]([\s\S]*?)\[\/c\]$/);
        const col = cm ? `#${cm[1]}` : 'inherit';
        node = <span key={i++} style={{ color: col }}>{renderInline(cm ? cm[2] : tok)}</span>;
      } else { // [fs:..]
        const cm = tok.match(/^\[fs:(\d+)\]([\s\S]*?)\[\/fs\]$/);
        const sz = cm ? Number(cm[1]) : 16;
        node = <span key={i++} style={{ fontSize: `${sz}px` }}>{renderInline(cm ? cm[2] : tok)}</span>;
      }
      parts.push(node);
      last = m.index + tok.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  const renderMedium = (raw: string) => {
    const out: React.ReactNode[] = [];
    const blockRegex = /\[block\s+align=(left|center|right|justify)\s+spacing=(\d+)\]([\s\S]*?)\[\/block\]/g;
    let last = 0;
    let bm: RegExpExecArray | null;
    let bi = 0;
    const pushPlain = (chunk: string, keyBase: string) => {
      const lines = chunk.split('\n');
      lines.forEach((line, idx) => {
        const key = `${keyBase}-${idx}`;
        if (line.trim() === '---') {
          out.push(<hr key={key} className="my-4 border-slate-200" />);
        } else if (line.startsWith('## ')) {
          out.push(<h2 key={key} className="text-xl font-extrabold text-slate-900 mt-4 mb-2">{renderInline(line.slice(3))}</h2>);
        } else if (line.startsWith('# ')) {
          out.push(<h1 key={key} className="text-2xl font-extrabold text-slate-900 mt-4 mb-2">{renderInline(line.slice(2))}</h1>);
        } else if (line.startsWith('> ')) {
          out.push(<blockquote key={key} className="border-l-4 border-blue-400 pl-3 my-2 text-slate-600 italic">{renderInline(line.slice(2))}</blockquote>);
        } else {
          const iconMatch = line.match(/^\[(lokasi|kalender|jam):\s*(.*)\]$/);
          if (iconMatch) {
            const kind = iconMatch[1];
            const Icon = kind === 'lokasi' ? MapPin : kind === 'kalender' ? Calendar : Clock;
            out.push(<div key={key} className="flex items-center gap-2 text-slate-600 my-1"><Icon className="w-4 h-4 text-blue-600" /><span>{iconMatch[2]}</span></div>);
          } else if (/^[-*]\s+/.test(line)) {
            out.push(<li key={key} className="ml-5 list-disc text-slate-700">{renderInline(line.replace(/^[-*]\s+/, ''))}</li>);
          } else if (/^\d+\.\s+/.test(line)) {
            out.push(<li key={key} className="ml-5 list-decimal text-slate-700">{renderInline(line.replace(/^\d+\.\s+/, ''))}</li>);
          } else if (line.trim() === '') {
            out.push(<div key={key} className="h-2" />);
          } else {
            out.push(<p key={key} className="text-slate-700 leading-relaxed my-1">{renderInline(line)}</p>);
          }
        }
      });
    };
    while ((bm = blockRegex.exec(raw)) !== null) {
      if (bm.index > last) pushPlain(raw.slice(last, bm.index), `p${bi}`);
      const align = bm[1] as 'left' | 'center' | 'right' | 'justify';
      const spacing = Number(bm[2]);
      const inner: React.ReactNode[] = [];
      const lines = bm[3].split('\n');
      lines.forEach((line, idx) => {
        const key = `b${bi}-${idx}`;
        if (line.trim() === '---') inner.push(<hr key={key} className="my-4 border-slate-200" />);
        else if (line.startsWith('## ')) inner.push(<h2 key={key} className="text-xl font-extrabold text-slate-900 mt-4 mb-2">{renderInline(line.slice(3))}</h2>);
        else if (line.startsWith('# ')) inner.push(<h1 key={key} className="text-2xl font-extrabold text-slate-900 mt-4 mb-2">{renderInline(line.slice(2))}</h1>);
        else if (line.startsWith('> ')) inner.push(<blockquote key={key} className="border-l-4 border-blue-400 pl-3 my-2 text-slate-600 italic">{renderInline(line.slice(2))}</blockquote>);
        else {
          const iconMatch = line.match(/^\[(lokasi|kalender|jam):\s*(.*)\]$/);
          if (iconMatch) {
            const kind = iconMatch[1];
            const Icon = kind === 'lokasi' ? MapPin : kind === 'kalender' ? Calendar : Clock;
            inner.push(<div key={key} className="flex items-center gap-2 text-slate-600 my-1"><Icon className="w-4 h-4 text-blue-600" /><span>{iconMatch[2]}</span></div>);
          } else if (/^[-*]\s+/.test(line)) inner.push(<li key={key} className="ml-5 list-disc text-slate-700">{renderInline(line.replace(/^[-*]\s+/, ''))}</li>);
          else if (/^\d+\.\s+/.test(line)) inner.push(<li key={key} className="ml-5 list-decimal text-slate-700">{renderInline(line.replace(/^\d+\.\s+/, ''))}</li>);
          else if (line.trim() === '') inner.push(<div key={key} className="h-2" />);
          else inner.push(<p key={key} className="text-slate-700 leading-relaxed my-1">{renderInline(line)}</p>);
        }
      });
      out.push(
        <div key={`block-${bi}`} style={{ textAlign: align, marginBottom: `${spacing * 0.5}rem`, lineHeight: 1 + spacing * 0.15 }}>
          {inner}
        </div>
      );
      last = bm.index + bm[0].length;
      bi++;
    }
    if (last < raw.length) pushPlain(raw.slice(last), `p${bi}`);
    return out;
  };

  const formatInline = (text: string) => renderInline(text);

  /* =========================================================
   *  LAYOUT
   * =======================================================*/
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" id="admin-dashboard">
      {/* Header */}
      <header className="sticky top-0 z-30 text-white shadow-sm border-b border-slate-800" style={{ background: '#0F172A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#1E3A8A] text-white p-2 rounded-xl border border-blue-800/50">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="font-extrabold tracking-tight">CDC Admin · UM Kendari</div>
            <span className="hidden md:inline-flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400">Panel Administrator</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-3" id="adm-sidebar">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#1E3A8A] text-white p-2 rounded-xl border border-blue-800/50"><FileText className="w-4 h-4" /></div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">Menu Admin</div>
            </div>
          <nav className="flex flex-col gap-1">
            {MENU.map((section, idx) => (
              <div key={section.group} className={idx > 0 ? 'mt-4 pt-3 border-t border-slate-100' : ''}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">{section.group}</div>
                <div className="flex flex-col gap-1">
                  {section.items.map((menu) => {
                    const active = activeTab === menu.id;
                    return (
                      <button
                        key={menu.id}
                        id={`adm-tab-${menu.id}`}
                        onClick={() => setActiveTab(menu.id)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${active ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                        <span className={`transition-transform duration-200 ${active ? 'text-white scale-110' : 'text-slate-400 group-hover:text-[#0077C6]'}`}>{menu.icon}</span>
                        <span className="text-[13px] font-semibold">{menu.label}</span>
                        {active
                          ? <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                          : <span className="ml-auto w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-blue-300 transition" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-9 space-y-6" id="adm-main">

          {/* ============== DASHBOARD AWAL ============== */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6" id="adm-ringkasan">
              <div className="anim-fade-up">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu {user.name.split(' ')[0]} </h1>
                <p className="text-sm text-slate-500 mt-0.5">Ringkasan aktivitas Portal CDC UM Kendari — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="adm-stat-cards">
                {[
                  { label: 'Mitra', value: mitra.length, sub: 'terdaftar', color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', Icon: Users, goto: () => { setActiveTab('mitra'); setMitraSub('daftar'); } },
                  { label: 'Pengajuan Mitra', value: totalMenunggu, sub: 'menunggu approval', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', Icon: Clock, goto: () => { setActiveTab('mitra'); setMitraSub('approval'); } },
                  { label: 'Total Konten', value: konten.length, sub: 'postingan', color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', Icon: Layers, goto: () => { setActiveTab('konten'); setKontenSub('riwayat'); } }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={s.goto}
                    className={`anim-fade-up ${(s as any).stagger || ''} text-left hover-lift bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer transition hover:border-blue-300 hover:shadow-md`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.ring} ring-1 flex items-center justify-center`}>
                        <s.Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</div>
                    </div>
                    <div className={`mt-3 text-3xl font-extrabold tracking-tight tabular-nums ${s.color}`}>{s.value}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.sub}</div>
                  </button>
                ))}
              </div>

              {/* Grafik frekuensi */}
              <div className="anim-fade-up bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover-lift">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0077C6]" /> Grafik Frekuensi Publikasi
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { id: 'harian', label: '1 Hari' },
                      { id: 'mingguan', label: '1 Minggu' },
                      { id: 'bulanan', label: '1 Bulan' }
                    ] as const).map((iv) => (
                      <button
                        key={iv.id}
                        onClick={() => setFreqInterval(iv.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${freqInterval === iv.id ? 'bg-[#0077C6] text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#0077C6]'}`}
                      >
                        {iv.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area chart ala saham/investasi */}
                <div className="mt-4">
                  <ChartArea data={freqData.map((b) => b.count)} labels={freqData.map((b) => b.label)} color="#0077C6" />
                </div>
              </div>

              <div className="anim-fade-up bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover-lift" id="adm-aktivitas">
                <h2 className="font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0077C6]" /> Aktivitas Terkini
                </h2>
                  <div className="space-y-2 max-h-72 overflow-auto no-scrollbar">
                    {aktivitas.length === 0 ? (
                      <div className="text-sm text-slate-400 py-6 text-center">Belum ada aktivitas.</div>
                    ) : aktivitas.map((a, i) => (
                      <div key={i} className="flex gap-2 items-start text-sm hover:translate-x-0.5 transition">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0077C6] flex-shrink-0" />
                        <div>
                          <div className="text-slate-700">{a.text}</div>
                          <div className="text-[10px] text-slate-400">{formatTanggal(a.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              {/* Top 5 mitra + Berita terbaru */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="anim-fade-up bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover-lift">
                  <h2 className="font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Top 5 Mitra (Lowongan)
                  </h2>
                  {topMitra.length === 0 ? (
                    <div className="text-sm text-slate-400 py-6 text-center">Belum ada data.</div>
                  ) : topMitra.map((t, i) => (
                    <div key={t.m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition rounded-lg px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-900'}`}>{i + 1}</span>
                        <span className="text-sm text-slate-700">{t.m.namaInstansi}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{t.count} lowongan</span>
                    </div>
                  ))}
                </div>
                <div className="anim-fade-up bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover-lift">
                  <h2 className="font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2"><Newspaper className="w-4 h-4 text-[#0077C6]" /> Berita Terbaru</h2>
                  {konten.filter((k) => k.jenis === 'berita').length === 0 ? (
                    <div className="text-sm text-slate-400 py-6 text-center">Belum ada berita.</div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-auto no-scrollbar">
                      {[...konten].filter((k) => k.jenis === 'berita').sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6).map((k) => (
                        <div key={k.id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-2 hover:border-blue-200 hover:bg-blue-50/40 transition">
                          {k.thumbnail ? <img src={k.thumbnail} alt="" className="w-12 h-9 object-cover rounded" /> : <div className="w-12 h-9 bg-slate-100 rounded flex items-center justify-center"><Newspaper className="w-4 h-4 text-slate-400" /></div>}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800 truncate">{k.judul}</div>
                            <div className="text-[10px] text-slate-400">{formatTanggal(k.createdAt)} · {k.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============== KONTEN KARIR ============== */}
          {activeTab === 'konten' && (
            <div className="space-y-6" id="adm-konten">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900">Konten Karir</h1>
              </div>

              {/* internal tab */}
              <div className="flex gap-2 border-b border-slate-200">
                {([
                  { id: 'riwayat', label: 'Riwayat Konten Karir' },
                  { id: 'pembuatan', label: 'Pembuatan Konten' }
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setKontenSub(t.id)}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${kontenSub === t.id ? 'border-slate-950 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {kontenSub === 'riwayat' && (
                <div className="space-y-4" id="adm-konten-riwayat">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={kontenQuery} onChange={(e) => setKontenQuery(e.target.value)} placeholder="Cari judul..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm" />
                    </div>
                    <Dropdown
                      value={kontenJenisFilter}
                      onChange={(v) => setKontenJenisFilter(v as any)}
                      className="w-48 flex-shrink-0"
                      options={[{ value: 'Semua', label: 'Semua Jenis' }, ...Object.entries(JENIS_LABEL).map(([k, v]) => ({ value: k, label: v }))]}
                    />
                    <button onClick={() => { setKontenSub('pembuatan'); setEditorOpen(false); }} className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Tambah Baru
                    </button>
                  </div>

                  {/* List lowongan By Admin */}
                  {adminLowongan.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Lowongan By Admin ({adminLowongan.length})</div>
                      {adminLowongan.map((l) => (
                        <div key={l.id} className="bg-blue-50/40 rounded-xl border border-blue-200 shadow-sm p-4 flex items-center gap-4">
                          {l.flyer || l.imageUrl ? (
                            <img src={l.flyer || l.imageUrl} alt="" className="w-16 h-20 object-cover rounded-xl flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-20 flex-shrink-0 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Briefcase className="w-5 h-5" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">By Admin</span>
                              <span className="text-[11px] text-slate-400">{l.tipe === 'magang' ? 'Magang' : 'Kerja'}</span>
                            </div>
                            <div className="font-bold text-slate-800 truncate">{l.judul}</div>
                            <div className="text-[11px] text-slate-400">{l.namaInstansi} · {formatTanggal(l.createdAt)}</div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => openLowonganForm(l)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                            <button onClick={() => handleDeleteLowonganAdmin(l)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {filteredKonten.map((k) => (
                        <div key={k.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                          {THUMB_REQUIRED[k.jenis] && k.thumbnail ? (
                            <button onClick={() => setZoomImage(k.thumbnail!)} className="flex-shrink-0 relative group">
                              <img src={k.thumbnail} alt="" className={`w-20 object-cover rounded-xl ${k.jenis === 'lowongan' ? 'h-28' : 'h-14'}`} />
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ZoomIn className="w-5 h-5 text-white" /></span>
                            </button>
                          ) : (
                            <div className="w-20 h-14 flex-shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">{JENIS_ICON[k.jenis]}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {statusBadge(k.status, { draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' }, published: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Published' } })}
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">{JENIS_ICON[k.jenis]} {JENIS_LABEL[k.jenis]}</span>
                            </div>
                            <div className="font-bold text-slate-800 truncate">{k.judul}</div>
                            <div className="text-[11px] text-slate-400">{formatTanggal(k.createdAt)}{k.penulis ? ' · ' + k.penulis : ''}</div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => openEditor(k)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                            <button onClick={() => handleDeleteKonten(k)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              )}

              {kontenSub === 'pembuatan' && !editorOpen && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5" id="adm-konten-pilih">
                  <h2 className="font-bold text-slate-900 tracking-tight mb-1">Pilih Jenis Konten</h2>
                  <p className="text-xs text-slate-400 mb-4">Klik salah satu untuk mulai membuat.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(Object.keys(JENIS_LABEL) as JenisKonten[]).map((j) => (
                      <button
                        key={j}
                        onClick={() => { if (j === 'lowongan') { openLowonganForm(); } else { openEditor(undefined, j); } }}
                        className="text-left border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm rounded-xl p-4 transition group"
                      >
                        <div className="text-blue-600 group-hover:scale-110 transition"><span className="inline-flex w-9 h-9 rounded-lg bg-blue-50 ring-1 ring-blue-100 items-center justify-center">{JENIS_ICON[j]}</span></div>
                        <div className="font-bold text-slate-800 mt-3 tracking-tight">{JENIS_LABEL[j]}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{j === 'lowongan' ? '→ Buka form lowongan Info Karir' : '→ Buka editor konten'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {kontenSub === 'pembuatan' && showLowonganForm && (
                <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 space-y-6" id="adm-lowongan-admin-form">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        {editLowonganId ? 'Edit Lowongan Info Karir' : 'Input Lowongan Info Karir (By Admin CDC)'}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Lowongan ini akan tampil di <b>INFO KARIR CDC TERKINI</b> publik dengan label <b>By Admin CDC</b>.</p>
                    </div>
                    <button onClick={resetLowonganForm} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveLowongan(); }} className="space-y-6 text-sm">
                    {/* 1. Info Utama */}
                    <div className="space-y-4">
                      <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">1. Informasi Utama</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-medium text-slate-500">Judul Lowongan / Posisi *</label>
                          <input value={lJudul} onChange={(e) => setLJudul(e.target.value)} placeholder="Contoh: Fullstack Web Developer Intern" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Tipe *</label>
                          <Dropdown value={lTipe} onChange={(v) => setLTipe(v as any)} className="w-full" options={[{ value: 'magang', label: 'Magang' }, { value: 'kerja', label: 'Kerja' }]} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Jenis Pekerjaan</label>
                          <Dropdown value={lJenisPekerjaan} onChange={(v) => setLJenisPekerjaan(v as any)} className="w-full" options={[{ value: 'full-time', label: 'Full-Time' }, { value: 'part-time', label: 'Part-Time' }]} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Nama Instansi / Penyelenggara *</label>
                          <input value={lNamaInstansi} onChange={(e) => setLNamaInstansi(e.target.value)} placeholder="PT / Instansi / CDC UM Kendari" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kategori / Spesialisasi</label>
                          <input value={lKategori} onChange={(e) => setLKategori(e.target.value)} placeholder="TI / Perangkat Lunak" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Lokasi Penempatan *</label>
                          <input value={lLokasi} onChange={(e) => setLLokasi(e.target.value)} placeholder="Kendari (Hybrid)" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kisaran Gaji / Insentif</label>
                          <input value={lGaji} onChange={(e) => setLGaji(e.target.value)} placeholder="Kompetitif / Rp 4.000.000" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kuota (Orang)</label>
                          <input value={lKuota} onChange={(e) => setLKuota(e.target.value)} type="number" min="1" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Deadline Pendaftaran *</label>
                          <input value={lDeadline} onChange={(e) => setLDeadline(e.target.value)} type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-2 sm:col-span-2 bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <MousePointerClick className="w-4 h-4 text-blue-600" /> Tombol Daftar (CTA) — Opsional
                            </label>
                            <button
                              type="button"
                              onClick={() => setLCtaEnabled((v) => !v)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${lCtaEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                              aria-pressed={lCtaEnabled}
                            >
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${lCtaEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">Aktifkan untuk menampilkan tombol daftar di halaman detail lowongan ini (khusus input Admin). Jika aktif, link tujuan wajib diisi.</p>

                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${lCtaEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500">Teks Tombol</label>
                              <input
                                value={lCtaLabel}
                                onChange={(e) => setLCtaLabel(e.target.value)}
                                placeholder="Daftar Sekarang"
                                disabled={!lCtaEnabled}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500">Link Tujuan {lCtaEnabled && <span className="text-rose-500">*</span>}</label>
                              <input
                                value={lLinkEksternal}
                                onChange={(e) => setLLinkEksternal(e.target.value)}
                                placeholder="https://forms.gle/...  (wajib jika CTA aktif)"
                                disabled={!lCtaEnabled}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Media Visual */}
                    <div className="space-y-4 pt-2">
                      <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">2. Visual Media</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-blue-600" /> Logo Instansi</label>
                            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold">
                              <button type="button" onClick={() => setLLogoUploadType('file')} className={`px-2 py-1 rounded transition ${lLogoUploadType === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>File</button>
                              <button type="button" onClick={() => setLLogoUploadType('url')} className={`px-2 py-1 rounded transition ${lLogoUploadType === 'url' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>URL</button>
                            </div>
                          </div>
                          {lLogoUploadType === 'file' ? (
                            <input type="file" accept="image/*" onChange={handleLowonganLogo} className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                          ) : (
                            <input type="url" value={lLogoUrl} onChange={(e) => setLLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                          )}
                          {lLogoUrl && <img src={lLogoUrl} alt="" className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1" />}
                        </div>

                        <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-blue-600" /> Poster / Flyer (9:16)</label>
                            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold">
                              <button type="button" onClick={() => setLPosterUploadType('file')} className={`px-2 py-1 rounded transition ${lPosterUploadType === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>File</button>
                              <button type="button" onClick={() => setLPosterUploadType('url')} className={`px-2 py-1 rounded transition ${lPosterUploadType === 'url' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>URL</button>
                            </div>
                          </div>
                          {lPosterUploadType === 'file' ? (
                            <input type="file" accept="image/*" onChange={handleLowonganPoster} className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                          ) : (
                            <input type="url" value={lPosterUrl} onChange={(e) => setLPosterUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                          )}
                          {lPosterUrl && <img src={lPosterUrl} alt="" className="w-10 h-14 object-cover rounded-lg border border-slate-200 bg-white" />}
                        </div>
                      </div>
                    </div>

                    {/* 3. Detail Isi */}
                    <div className="space-y-4 pt-2">
                      <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">3. Detail Konten & Kriteria</h5>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Deskripsi Ringkas *</label>
                          <textarea required value={lDeskripsi} onChange={(e) => setLDeskripsi(e.target.value)} rows={3} placeholder="Gambaran umum, lingkup tugas..." className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Tanggung Jawab (1 baris per poin)</label>
                          <textarea value={lTanggungJawab} onChange={(e) => setLTanggungJawab(e.target.value)} rows={3} placeholder={'Membantu pengembangan aplikasi web\nBerkolaborasi dengan tim'} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kualifikasi & Persyaratan (1 baris per poin)</label>
                          <textarea value={lKualifikasi} onChange={(e) => setLKualifikasi(e.target.value)} rows={3} placeholder={'Mahasiswa semester 6\nMenguasai React'} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Keahlian (1 baris per poin)</label>
                          <textarea value={lKeahlian} onChange={(e) => setLKeahlian(e.target.value)} rows={2} placeholder={'Javascript\nReact.js'} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Benefit & Fasilitas (1 baris per poin)</label>
                          <textarea value={lBenefit} onChange={(e) => setLBenefit(e.target.value)} rows={3} placeholder={'Uang saku bulanan\nSertifikat resmi'} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Aksi */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Status:</span>
                        <Dropdown value={lStatus} onChange={(v) => setLStatus(v as any)} size="sm" className="w-full" options={[{ value: 'published', label: 'Published' }, { value: 'closed', label: 'Closed' }]} />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={resetLowonganForm} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Batal</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"><Save className="w-4 h-4" /> {editLowonganId ? 'Simpan Perubahan' : 'Posting ke Info Karir'}</button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {kontenSub === 'pembuatan' && editorOpen && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5" id="adm-konten-editor">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">{editId ? 'Edit Konten' : 'Buat Konten'} — <span className="text-blue-600">{JENIS_LABEL[eJenis]}</span></h2>
                    <button onClick={() => { setEditorOpen(false); setKontenSub('riwayat'); }} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Judul</label>
                      <input value={eJudul} onChange={(e) => setEJudul(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Judul konten" />
                    </div>

                    {eJenis === 'berita' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Penulis</label>
                          <input value={ePenulis} onChange={(e) => setEPenulis(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder={user.name} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Skala / Cakupan</label>
                          <Dropdown value={eScope} onChange={(v) => setEScope(v as any)} className="w-full" options={[
                            { value: 'LOKAL', label: 'Lokal' },
                            { value: 'REGIONAL', label: 'Regional' },
                            { value: 'NASIONAL', label: 'Nasional' },
                            { value: 'GLOBAL', label: 'Global' }
                          ]} />
                        </div>
                      </>
                    )}

                    {eJenis === 'lowongan' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Nama Instansi</label>
                          <input value={eNamaInstansi} onChange={(e) => setENamaInstansi(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="PT / Instansi" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Tipe</label>
                          <Dropdown value={eTipe} onChange={(v) => setETipe(v as any)} className="w-full" options={[{ value: 'magang', label: 'Magang' }, { value: 'kerja', label: 'Kerja' }]} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Link Lamar (URL)</label>
                          <input value={eLinkLamar} onChange={(e) => setELinkLamar(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="https://..." />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kategori</label>
                          <input value={eKategori} onChange={(e) => setEKategori(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Gaji</label>
                          <input value={eGaji} onChange={(e) => setEGaji(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kuota</label>
                          <input value={eKuota} onChange={(e) => setEKuota(e.target.value)} type="number" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Deadline</label>
                          <input value={eDeadline} onChange={(e) => setEDeadline(e.target.value)} type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                        </div>
                      </>
                    )}

                    {(eJenis === 'program' || eJenis === 'workshop' || eJenis === 'softskill') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">
                          {eJenis === 'program' ? 'Kategori Pengumuman (bebas, mis. KERJA / MAGANG / UMUM)' : 'Link CTA / Eksternal (Daftar/Register/Kontak)'}
                        </label>
                        {eJenis === 'program' ? (
                          <input value={eKategori} onChange={(e) => setEKategori(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="KERJA / MAGANG / UMUM / DLL" />
                        ) : (
                          <input value={eLinkCta} onChange={(e) => setELinkCta(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="https://forms.gle/..." />
                        )}
                      </div>
                    )}

                    {eJenis === 'program' && (
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-xs font-medium text-slate-500">Link Tujuan (arahkan klik ke web/menu tertentu)</label>
                        <input value={eLinkCta} onChange={(e) => setELinkCta(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="https://... atau #nama-tab" />
                        <p className="text-[11px] text-slate-400">Kosongkan jika ingin klik membuka halaman detail. Awali dengan # untuk arahkan ke menu beranda.</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  {THUMB_REQUIRED[eJenis] && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        {eJenis === 'program' ? 'Thumbnail / Poster (wajib — header kartu)' : (eJenis === 'lowongan' ? '(Poster 9:16 wajib)' : '(16:9 wajib)')}
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" /> Upload Gambar
                          <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                        </label>
                        {eThumbnail && <img src={eThumbnail} alt="" className={`w-16 object-cover rounded-lg ${eJenis === 'lowongan' ? 'h-24' : 'h-10'}`} />}
                      </div>
                    </div>
                  )}

                  {eJenis === 'program' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Isi Konten (opsional — kosongkan jika hanya ingin mengarahkan klik kartu ke link)</label>
                      <textarea
                        ref={bodyRef}
                        value={eBody}
                        onChange={(e) => setEBody(e.target.value)}
                        rows={10}
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Tulis detail program & pengumuman di sini (opsional). Kosongkan jika klik kartu langsung diarahkan ke link di atas."
                      />
                      {eBody.trim() && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-500">Pratinjau</label>
                          <div className="border border-slate-200 rounded-xl p-4 bg-white max-h-80 overflow-auto no-scrollbar">
                            {renderMedium(eBody)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                  <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Isi Konten (Gaya Medium + Format Word)</label>
                    <div className="flex flex-wrap items-center gap-1.5 border border-slate-200 rounded-t-xl p-2 bg-slate-50">
                      {/* Font Color */}
                      <label title="Warna Teks" className="relative flex items-center justify-center px-2 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 cursor-pointer text-slate-600 transition">
                        <BaselineIcon className="w-4 h-4" />
                        <input type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => wrapInlineArg(`[c:${e.target.value}]`, '[/c]')} />
                      </label>
                      {/* Highlight */}
                      <label title="Sorot (Highlight)" className="relative flex items-center justify-center px-2 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 cursor-pointer text-slate-600 transition">
                        <HighlighterIcon className="w-4 h-4" />
                        <input type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => wrapInlineArg(`[hl:${e.target.value}]`, '[/hl]')} />
                      </label>
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Basic format */}
                      <ToolbarBtn icon={<Bold className="w-4 h-4" />} label="Bold" onClick={() => wrapInline('**')} />
                      <ToolbarBtn icon={<Italic className="w-4 h-4" />} label="Italic" onClick={() => wrapInline('*')} />
                      <ToolbarBtn icon={<UnderlineIcon className="w-4 h-4" />} label="Underline" onClick={() => wrapInline('__')} />
                      <ToolbarBtn icon={<StrikethroughIcon className="w-4 h-4" />} label="Strikethrough" onClick={() => wrapInline('~~')} />
                      <ToolbarBtn icon={<SubscriptIcon className="w-4 h-4" />} label="Subscript" onClick={() => wrapInlineArg('[sub]', '[/sub]')} />
                      <ToolbarBtn icon={<SuperscriptIcon className="w-4 h-4" />} label="Superscript" onClick={() => wrapInlineArg('[sup]', '[/sup]')} />
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Change Case */}
                      <ToolbarBtn icon={<CaseIcon className="w-4 h-4" />} label="Upper Case" onClick={() => changeCase('upper')} />
                      <ToolbarBtn icon={<CaseIcon className="w-4 h-4 scale-x-[-1]" />} label="Lower Case" onClick={() => changeCase('lower')} />
                      <ToolbarBtn icon={<CaseIcon className="w-4 h-4" />} label="Title Case" onClick={() => changeCase('title')} />
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Font Size */}
                      <ToolbarBtn icon={<ChevronDown className="w-4 h-4" />} label="Font Size -" onClick={() => fontSizeAdjust(-2)} />
                      <ToolbarBtn icon={<ChevronUp className="w-4 h-4" />} label="Font Size +" onClick={() => fontSizeAdjust(2)} />
                      <ToolbarBtn icon={<TypeIcon className="w-4 h-4" />} label="Clear All Formatting" onClick={() => clearFormatting()} />
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Lists */}
                      <ToolbarBtn icon={<List className="w-4 h-4" />} label="Bullets" onClick={() => toggleLinePrefix('- ')} />
                      <ToolbarBtn icon={<ListOrdered className="w-4 h-4" />} label="Numbering" onClick={() => toggleLinePrefix('1. ')} />
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Align */}
                      <ToolbarBtn icon={<AlignLeft className="w-4 h-4" />} label="Align Left" onClick={() => { setBlockAlign('left'); applyBlock('left'); }} />
                      <ToolbarBtn icon={<AlignCenter className="w-4 h-4" />} label="Align Center" onClick={() => { setBlockAlign('center'); applyBlock('center'); }} />
                      <ToolbarBtn icon={<AlignRight className="w-4 h-4" />} label="Align Right" onClick={() => { setBlockAlign('right'); applyBlock('right'); }} />
                      <ToolbarBtn icon={<AlignJustify className="w-4 h-4" />} label="Justify" onClick={() => { setBlockAlign('justify'); applyBlock('justify'); }} />
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Line & Paragraph Spacing */}
                      <div className="flex items-center gap-1" title="Line & Paragraph Spacing">
                        <PilcrowIcon className="w-4 h-4 text-slate-500" />
                        <button type="button" onClick={() => { setBlockSpacing(Math.max(0, blockSpacing - 1)); applyBlock(undefined, Math.max(0, blockSpacing - 1)); }} className="px-1.5 py-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 text-slate-600 text-xs font-bold">-</button>
                        <span className="text-xs font-bold text-slate-600 w-4 text-center">{blockSpacing}</span>
                        <button type="button" onClick={() => { setBlockSpacing(Math.min(6, blockSpacing + 1)); applyBlock(undefined, Math.min(6, blockSpacing + 1)); }} className="px-1.5 py-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 text-slate-600 text-xs font-bold">+</button>
                      </div>
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Heading / Quote / Divider */}
                      <ToolbarBtn icon={<Heading1 className="w-4 h-4" />} label="H1" onClick={() => insertLineToken('# ')} />
                      <ToolbarBtn icon={<Heading2 className="w-4 h-4" />} label="H2" onClick={() => insertLineToken('## ')} />
                      <ToolbarBtn icon={<Quote className="w-4 h-4" />} label="Quote" onClick={() => insertLineToken('> ')} />
                      <ToolbarBtn icon={<Minus className="w-4 h-4" />} label="Garis" onClick={() => insertLineToken('---')} />
                      <span className="w-px h-6 bg-slate-300 mx-0.5" />
                      {/* Icons */}
                      <ToolbarBtn icon={<MapPin className="w-4 h-4" />} label="Lokasi" onClick={() => insertIconLine('lokasi')} />
                      <ToolbarBtn icon={<Calendar className="w-4 h-4" />} label="Kalender" onClick={() => insertIconLine('kalender')} />
                      <ToolbarBtn icon={<Clock className="w-4 h-4" />} label="Jam" onClick={() => insertIconLine('jam')} />
                    </div>
                    <textarea
                      ref={bodyRef}
                      value={eBody}
                      onChange={(e) => setEBody(e.target.value)}
                      rows={12}
                      className="w-full border border-slate-300 rounded-b-xl p-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder={'# Judul Besar\n## Sub Judul\nTulis **tebal**, *miring*, __garis bawah__, ~~coret~~.\n[sub]sub[/sub] [sup]sup[/sup] [hl]sorot[/hl] [c:#e11d48]warna[/c] [fs:20]besar[/fs]\n- poin satu\n1. nomor satu\n[block align=center spacing=2]\nTeks rata tengah spasi 2\n[/block]\n> kutipan\n[lokasi: Kampus UMK]\n---'}
                    />
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Pratinjau</label>
                    <div className="border border-slate-200 rounded-xl p-4 bg-white max-h-80 overflow-auto no-scrollbar">
                      {eBody.trim() ? renderMedium(eBody) : <div className="text-sm text-slate-400">Belum ada isi.</div>}
                    </div>
                  </div>
                  </>)}

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Status:</span>
                      <Dropdown value={eStatus} onChange={(v) => setEStatus(v as any)} size="sm" className="w-full" options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditorOpen(false); setKontenSub('riwayat'); }} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Batal</button>
                      <button onClick={handleSaveKonten} className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"><Save className="w-4 h-4" /> Simpan</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============== MANAJEMEN MITRA ============== */}
          {activeTab === 'mitra' && (
            <div className="space-y-6" id="adm-mitra">
              <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Mitra</h1>

              <div className="flex gap-2 border-b border-slate-200">
                {([
                  { id: 'approval', label: 'Approval Mitra' },
                  { id: 'list', label: 'List Mitra' }
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMitraSub(t.id)}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${mitraSub === t.id ? 'border-slate-950 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {t.label}
                    {t.id === 'approval' && pendingMitra.length > 0 && <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingMitra.length}</span>}
                  </button>
                ))}
              </div>

              {mitraSub === 'approval' && (
                <div className="space-y-3" id="adm-mitra-approval">
                  {pendingMitra.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">Tidak ada mitra menunggu approval.</div>
                  ) : pendingMitra.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-800">{m.namaInstansi}</div>
                          <div className="text-[11px] text-slate-400">{m.email} · {m.kontakPerson} · {m.bidangIndustri || '-'}</div>
                          <div className="text-[11px] text-slate-400">{m.alamat || '-'}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveMitra(m, approvalNote)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"><Check className="w-4 h-4" /> Terima</button>
                          <button onClick={() => handleRejectMitra(m, approvalNote)} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"><X className="w-4 h-4" /> Tolak</button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <input value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} placeholder="Catatan internal (opsional)" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {mitraSub === 'list' && (
                <div className="space-y-3" id="adm-mitra-list">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={mitraQuery} onChange={(e) => setMitraQuery(e.target.value)} placeholder="Cari mitra..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm" />
                    </div>
                    <Dropdown
                      value={mitraStatusFilter}
                      onChange={(v) => setMitraStatusFilter(v as any)}
                      className="w-48 flex-shrink-0"
                      options={[
                        { value: 'Semua', label: 'Semua Status' },
                        { value: 'aktif', label: 'Aktif' },
                        { value: 'nonaktif', label: 'Nonaktif / Ditolak' },
                        { value: 'pending', label: 'Pending' }
                      ]}
                    />
                  </div>

                  {filteredMitra.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">Tidak ada mitra.</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMitra.map((m) => (
                        <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {statusBadge(m.statusKerjaSama, { aktif: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Aktif' }, nonaktif: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Nonaktif' }, pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' } })}
                              <span className="font-bold text-slate-800 truncate">{m.namaInstansi}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{m.email} · {m.bidangIndustri || '-'}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><Layers className="w-3 h-3 text-[#0077C6]" /> {konten.filter((k) => k.createdBy === m.userId).length} konten</div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => setSelectedMitra(m)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Detail</button>
                            <button onClick={() => handleBanMitra(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${m.statusKerjaSama === 'aktif' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}>
                              {m.statusKerjaSama === 'aktif' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />} {m.statusKerjaSama === 'aktif' ? 'Ban' : 'Unban'}
                            </button>
                            <button onClick={() => handleDeleteMitra(m)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal detail mitra */}
              {selectedMitra && (() => {
                const mitraKonten = konten.filter((k) => k.createdBy === selectedMitra.userId);
                const mitraLowongan = lowongan.filter((l) => l.namaInstansi === selectedMitra.namaInstansi);
                const init = (selectedMitra.namaInstansi || '?').trim().charAt(0).toUpperCase();
                return (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMitra(null)}>
                  <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-auto no-scrollbar shadow-xl" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center gap-3 p-5 border-b border-slate-100 sticky top-0 bg-white">
                      <div className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-extrabold text-lg">{init}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight truncate">{selectedMitra.namaInstansi}</h3>
                        <div className="text-[11px] text-slate-400">{selectedMitra.bidangIndustri || 'Mitra'} · {statusBadge(selectedMitra.statusKerjaSama, { aktif: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Aktif' }, nonaktif: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Nonaktif' }, pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' } })}</div>
                      </div>
                      <button onClick={() => setSelectedMitra(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Info grid */}
                    <div className="p-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div><div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email</div><div className="text-slate-700 truncate">{selectedMitra.email}</div></div>
                      <div><div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Kontak</div><div className="text-slate-700 truncate">{selectedMitra.kontakPerson}</div></div>
                      <div><div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Alamat</div><div className="text-slate-700 truncate">{selectedMitra.alamat || '-'}</div></div>
                      <div><div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Website</div><div className="text-slate-700 truncate">{selectedMitra.website || '-'}</div></div>
                      <div><div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lowongan</div><div className="text-slate-700">{mitraLowongan.length} posting</div></div>
                      <div><div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Konten Karir</div><div className="text-slate-700">{mitraKonten.length} posting</div></div>
                    </div>

                    {/* Riwayat konten buatan mitra */}
                    <div className="px-5 pb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-[#0077C6]" />
                        <h4 className="font-bold text-slate-900 tracking-tight text-sm">Riwayat Konten ({mitraKonten.length})</h4>
                      </div>
                      {mitraKonten.length === 0 ? (
                        <div className="text-[12px] text-slate-400 bg-slate-50 rounded-lg p-3 text-center">Mitra ini belum membuat konten.</div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-auto no-scrollbar">
                          {mitraKonten.map((k) => (
                            <div key={k.id} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-700 truncate">{k.judul}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wide">{JENIS_LABEL[k.jenis]} · {formatTanggal(k.createdAt)}</div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.status === 'published' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{k.status === 'published' ? 'Live' : 'Draft'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 p-5 border-t border-slate-100">
                      <button onClick={() => handleBanMitra(selectedMitra)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold">{selectedMitra.statusKerjaSama === 'aktif' ? 'Ban Mitra' : 'Unban Mitra'}</button>
                      <button onClick={() => handleDeleteMitra(selectedMitra)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-bold">Hapus Mitra</button>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          )}

          {/* ============== MANAJEMEN ADMIN ============== */}
          {activeTab === 'admin' && (
            <div className="space-y-6" id="adm-admin">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">Kelola Admin</h1>
                <button onClick={() => setShowAddAdmin(!showAddAdmin)} className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Tambah Admin
                </button>
              </div>

              {showAddAdmin && (
                <form onSubmit={handleAddAdmin} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Nama</label>
                    <input value={aName} onChange={(e) => setAName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Nama admin" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Email</label>
                    <input value={aEmail} onChange={(e) => { setAEmail(e.target.value); setAEmailError(''); }} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="email@umkendari.ac.id" />
                    {aEmailError && <div className="text-rose-500 text-[11px]">{aEmailError}</div>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Password (opsional)</label>
                    <input value={aPass} onChange={(e) => setAPass(e.target.value)} type="password" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="default: password" />
                  </div>
                  <div className="flex items-end gap-2">
                    <button type="submit" className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold">Simpan Admin</button>
                    <button type="button" onClick={() => setShowAddAdmin(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Batal</button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <div className="col-span-5">Nama / Email</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-4 text-right">Aksi</div>
                </div>
                {adminUsers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">Tidak ada admin.</div>
                ) : adminUsers.map((u) => (
                  <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-slate-100 items-center">
                    <div className="col-span-5 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{u.name}{u.id === user.id && <span className="ml-1 text-[10px] text-blue-600">(anda)</span>}</div>
                      <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                    </div>
                    <div className="col-span-3">{statusBadge(u.status, { active: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Active' }, inactive: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Inactive' }, pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' }, rejected: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Rejected' } })}</div>
                    <div className="col-span-4 flex justify-end gap-1.5">
                      <button onClick={() => handleDisableAdmin(u)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">{u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</button>
                      <button onClick={() => handleDeleteAdmin(u)} disabled={u.id === user.id} className="bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-40 px-2.5 py-1 rounded-lg text-xs font-bold">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold ${toast.type === 'success' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      {/* Modal zoom thumbnail */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}

/* =========================================================
 *  HELPER COMPONENTS
 * =======================================================*/
function ToolbarBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="px-2 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 text-slate-600 transition flex items-center"
    >
      {icon}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}
