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
  JenisKonten,
  SuratKeputusan,
  KalenderKegiatan,
  LaporanKinerja,
  MouStakeholder,
  GaleriItem,
  KonselingConfig,
  KonselingInfoItem,
  KonselingJadwalItem,
  VisiMisiConfig,
  AnggotaTim,
  SocialMediaItem,
  Pengumuman,
  HelpdeskConfig,
  KomentarBerita,
  CdcClubConfig
} from '../types';
import {
  getFromDB,
  saveToDB,
  insertToDB,
  updateInDB,
  deleteInDB,
  getAdminWaPrestasi,
  saveAdminWaPrestasi,
  getKonselingConfig,
  saveKonselingConfig,
  getVisiMisiConfig,
  saveVisiMisiConfig,
  getAnggotaTim,
  saveAnggotaTim,
  getHelpdeskConfig,
  saveHelpdeskConfig,
  getKomentarBerita,
  updateKomentarBeritaStatus,
  deleteKomentarBerita,
  getCdcClubConfig,
  saveCdcClubConfig
} from '../data';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Briefcase,
  Megaphone,
  GraduationCap,
  Target,
  TrendingUp,
  Activity,
  Trophy,
  CalendarDays,
  Layers,
  Building2,
  MessageSquare,
  UserCog,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Check,
  X,
  Upload,
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
  Link as LinkIcon,
  Users,
  Download,
  AlertCircle,
  ZoomIn,
  LogOut,
  Save,
  ExternalLink,
  MousePointerClick,
  Award,
  Pin,
  MessageCircle,
  Film,
  HeartHandshake,
  Info,
  UserCheck,
  Globe,
  KeyRound,
  Mail,
  Phone
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  onReloadData?: () => void;
}

type AdminTab = 'ringkasan' | 'konten' | 'mitra' | 'admin' | 'keanggotaan' | 'visi-misi' | 'sk-cdc' | 'kalender' | 'laporan' | 'mou' | 'galeri' | 'media-sosial' | 'komentar' | 'konseling';
type KontenSubTab = 'riwayat' | 'pembuatan';
type MitraSubTab = 'approval' | 'list';

const JENIS_LABEL: Record<JenisKonten, string> = {
  berita: 'Berita & Artikel',
  lowongan: 'Lowongan (Magang/Kerja)',
  program: 'Program & Pengumuman',
  pengumuman: 'Pengumuman Penting',
  workshop: 'Workshop & Pelatihan Karir',
  softskill: 'Pelatihan Softskill & Kewirausahaan',
  seminar: 'Seminar Sukses Berkarir',
  presentasi: 'Prestasi'
};

const JENIS_ICON: Record<JenisKonten, React.ReactNode> = {
  berita: <Newspaper className="w-4 h-4" />,
  lowongan: <Briefcase className="w-4 h-4" />,
  program: <Megaphone className="w-4 h-4" />,
  pengumuman: <Megaphone className="w-4 h-4" />,
  workshop: <GraduationCap className="w-4 h-4" />,
  softskill: <Award className="w-4 h-4" />,
  seminar: <GraduationCap className="w-4 h-4" />,
  presentasi: <Trophy className="w-4 h-4" />
};

// Rasio thumbnail wajib per jenis
const THUMB_REQUIRED: Record<JenisKonten, boolean> = {
  berita: true,    // 16:9 — wajib upload poster
  lowongan: true,  // 9:16
  program: true,     // thumbnail wajib (header kartu)
  pengumuman: false, // opsional
  workshop: true,   // poster pamflet kegiatan
  softskill: true,  // poster pamflet kegiatan
  seminar: true,    // poster pamflet kegiatan
  presentasi: true   // wajib upload poster/dokumentasi
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

// Kompresi gambar (thumbnail/poster) agar tidak membanjiri localStorage.
// PENTING: SELALU output JPEG (bukan PNG). PNG itu lossless sehingga file 1280px
// bisa mencapai 2MB+, dan dengan cepat melewati kuota ~5MB localStorage browser
// (penyebab pesan "storage penuh"). JPEG q0.75 @1000px hanya ~90KB.
const compressImage = (file: File, maxW = 1000, quality = 0.75): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas tidak didukung')); return; }
        // Isi background putih supaya PNG transparan tidak jadi hitam saat di-JPEG.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

// Kompres beruntun: mulai kualitas tinggi, turunkan resolusi & quality kalau
// hasil masih terlalu besar, agar tidak mudah memicu QuotaExceededError.
async function compressImageAdaptive(file: File): Promise<string> {
  const steps = [
    { maxW: 1000, q: 0.72 },
    { maxW: 900, q: 0.62 },
    { maxW: 800, q: 0.5 },
    { maxW: 700, q: 0.4 },
  ];
  for (const s of steps) {
    const url = await compressImage(file, s.maxW, s.q);
    // Hentikan kalau hasil di bawah ~120KB (base64 ~ char count)
    if (url.length < 160_000) return url;
  }
  return compressImage(file, 640, 0.35);
}

// Simpan ke konten_karir dengan penanganan kuota: kalau localStorage penuh,
// hapus draft (konten belum dipublikasikan) tertua satu per satu dulu sebelum
// benar-benar gagal. Mengembalikan 'pruned' = jumlah draft yang dibuang.
async function saveKontenKarirWithQuota(item: KontenKarir, isEdit: boolean): Promise<number> {
  const tryWrite = () => {
    if (isEdit) updateInDB<KontenKarir>('konten_karir', item);
    else insertToDB<KontenKarir>('konten_karir', item);
  };
  try {
    tryWrite();
    return 0;
  } catch (err: any) {
    if (err && err.name === 'QuotaExceededError') {
      const all = getFromDB<KontenKarir>('konten_karir');
      const drafts = all
        .filter((k) => k.status !== 'published')
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
      let pruned = 0;
      for (const d of drafts) {
        deleteInDB('konten_karir', d.id);
        pruned++;
        try { tryWrite(); return pruned; } catch { /* coba lagi dengan draft lebih sedikit */ }
      }
      throw err; // masih penuh → biarkan caller tampilkan pesan
    }
    throw err;
  }
}

// Sama seperti di atas tapi untuk tabel 'lowongan' (poster/flyer cukup besar).
async function saveLowonganWithQuota(item: Lowongan, isEdit: boolean): Promise<number> {
  const tryWrite = () => {
    if (isEdit) updateInDB<Lowongan>('lowongan', item);
    else insertToDB<Lowongan>('lowongan', item);
  };
  try {
    tryWrite();
    return 0;
  } catch (err: any) {
    if (err && err.name === 'QuotaExceededError') {
      const all = getFromDB<Lowongan>('lowongan');
      const oldest = [...all].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
      let pruned = 0;
      for (const d of oldest) {
        deleteInDB('lowongan', d.id);
        pruned++;
        try { tryWrite(); return pruned; } catch { /* coba lagi */ }
      }
      throw err;
    }
    throw err;
  }
}

export default function AdminDashboard({ user, onLogout, onReloadData }: AdminDashboardProps) {
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
  const [skItems, setSkItems] = useState<SuratKeputusan[]>([]);
  const [kalItems, setKalItems] = useState<KalenderKegiatan[]>([]);
  const [lapItems, setLapItems] = useState<LaporanKinerja[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Form states SK CDC
  const [showSkForm, setShowSkForm] = useState(false);
  const [editSkId, setEditSkId] = useState<string | null>(null);
  const [skJudul, setSkJudul] = useState('');
  const [skKategori, setSkKategori] = useState('SK CDC UMK');
  const [skTipe, setSkTipe] = useState<'pdf' | 'link'>('pdf');
  const [skPdfUrl, setSkPdfUrl] = useState('');
  const [skLinkUrl, setSkLinkUrl] = useState('');
  const [skIsFeatured, setSkIsFeatured] = useState(false);

  // Form states Kalender Kegiatan
  const [showKalForm, setShowKalForm] = useState(false);
  const [editKalId, setEditKalId] = useState<string | null>(null);
  const [kalJudul, setKalJudul] = useState('');
  const [kalKategori, setKalKategori] = useState('Kalender Utama CDC');
  const [kalDisplayType, setKalDisplayType] = useState<'poster' | 'pdf'>('poster');
  const [kalPosterUrl, setKalPosterUrl] = useState('');
  const [kalPdfUrl, setKalPdfUrl] = useState('');
  const [kalLinkUrl, setKalLinkUrl] = useState('');
  const [kalIsFeatured, setKalIsFeatured] = useState(false);

  // Form states Laporan Kinerja & Tracer Study
  const [showLapForm, setShowLapForm] = useState(false);
  const [editLapId, setEditLapId] = useState<string | null>(null);
  const [lapJudul, setLapJudul] = useState('');
  const [lapKategori, setLapKategori] = useState('Laporan Kinerja CDC');
  const [lapTipe, setLapTipe] = useState<'pdf' | 'link'>('pdf');
  const [lapPdfUrl, setLapPdfUrl] = useState('');
  const [lapLinkUrl, setLapLinkUrl] = useState('');
  const [lapIsFeatured, setLapIsFeatured] = useState(false);

  // Form states MOU Dengan Stakeholder
  const [mouItems, setMouItems] = useState<MouStakeholder[]>([]);
  const [showMouForm, setShowMouForm] = useState(false);
  const [editMouId, setEditMouId] = useState<string | null>(null);
  const [mouJudul, setMouJudul] = useState('');
  const [mouKategori, setMouKategori] = useState('MOU Perusahaan BUMN & Swasta');
  const [mouDisplayType, setMouDisplayType] = useState<'poster' | 'pdf' | 'link'>('poster');
  const [mouPosterUrl, setMouPosterUrl] = useState('');
  const [mouPdfUrl, setMouPdfUrl] = useState('');
  const [mouLinkUrl, setMouLinkUrl] = useState('');
  const [mouIsFeatured, setMouIsFeatured] = useState(false);

  // Form states Galeri Kegiatan
  const [galeriItems, setGaleriItems] = useState<GaleriItem[]>([]);
  const [komentarList, setKomentarList] = useState<KomentarBerita[]>([]);
  const [komentarFilter, setKomentarFilter] = useState<'semua' | 'pending' | 'approved' | 'rejected'>('pending');
  const [cdcClubCfg, setCdcClubCfg] = useState<CdcClubConfig>(getCdcClubConfig());
  const [showGalForm, setShowGalForm] = useState(false);
  const [editGalId, setEditGalId] = useState<string | null>(null);
  const [galJudul, setGalJudul] = useState('');
  const [galSection, setGalSection] = useState('Kegiatan Terkini 2026');
  const [galTipeMedia, setGalTipeMedia] = useState<'youtube' | 'poster' | 'pdf'>('youtube');
  const [galYoutubeUrl, setGalYoutubeUrl] = useState('');
  const [galPosterUrl, setGalPosterUrl] = useState('');
  const [galPdfUrl, setGalPdfUrl] = useState('');
  const [galLinkUrl, setGalLinkUrl] = useState('');
  const [galDeskripsi, setGalDeskripsi] = useState('');
  const [galIsFeatured, setGalIsFeatured] = useState(false);

  // Form states Kelola Konseling Karir
  const [konselingCfg, setKonselingCfg] = useState<KonselingConfig>(getKonselingConfig());
  const [kPosterUrl, setKPosterUrl] = useState(konselingCfg.posterUrl || '');
  const [kTitle, setKTitle] = useState(konselingCfg.title || '');
  const [kSubtitle, setKSubtitle] = useState(konselingCfg.subtitle || '');
  const [kNarasiWa, setKNarasiWa] = useState(konselingCfg.narasiWa || '');
  const [kAdminWaNum, setKAdminWaNum] = useState(konselingCfg.adminWaNumber || '');
  const [kAdminWaMsg, setKAdminWaMsg] = useState(konselingCfg.adminWaDefaultMessage || '');
  const [kPublished, setKPublished] = useState<boolean>(konselingCfg.published !== false);

  // State collapsible grup sidebar + Visi & Misi
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [visiMisiCfg, setVisiMisiCfg] = useState<VisiMisiConfig>(getVisiMisiConfig());
  const [vmImageUrl, setVmImageUrl] = useState(visiMisiCfg.imageUrl || '');

  // Form states Info Items
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editInfoId, setEditInfoId] = useState<string | null>(null);
  const [infoJudul, setInfoJudul] = useState('');
  const [infoDeskripsi, setInfoDeskripsi] = useState('');
  const [infoLinkUrl, setInfoLinkUrl] = useState('');
  const [infoLinkLabel, setInfoLinkLabel] = useState('');

  // Form states Jadwal Items
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [editJadwalId, setEditJadwalId] = useState<string | null>(null);
  const [jdwHari, setJdwHari] = useState('');
  const [jdwJam, setJdwJam] = useState('');
  const [jdwLokasi, setJdwLokasi] = useState('');
  const [jdwKuota, setJdwKuota] = useState('');
  const [jdwStatus, setJdwStatus] = useState<'buka' | 'penuh' | 'tutup'>('buka');

  // State Nomor WA Admin Lapor Prestasi
  const [adminWaNum, setAdminWaNum] = useState(getAdminWaPrestasi());

  // Form states Keanggotaan & Tim CDC
  const [anggotaList, setAnggotaList] = useState<AnggotaTim[]>([]);
  const [showAnggotaModal, setShowAnggotaModal] = useState(false);
  const [editAnggotaId, setEditAnggotaId] = useState<string | null>(null);
  const [angNama, setAngNama] = useState('');
  const [angJabatan, setAngJabatan] = useState('');
  const [angFotoUrl, setAngFotoUrl] = useState('');

  // Form states Kelola Media Sosial
  const [socMedList, setSocMedList] = useState<SocialMediaItem[]>([]);
  const [showSocMedModal, setShowSocMedModal] = useState(false);
  const [editSocMedId, setEditSocMedId] = useState<string | null>(null);
  const [socPlatform, setSocPlatform] = useState<SocialMediaItem['platform']>('instagram');
  const [socLabel, setSocLabel] = useState('');
  const [socUrl, setSocUrl] = useState('');
  const [socIsActive, setSocIsActive] = useState(true);

  // State Pengumuman Khusus / Utama Beranda
  const [annIsImportant, setAnnIsImportant] = useState<boolean>(true);
  const [annDisplayType, setAnnDisplayType] = useState<'badge' | 'poster'>('badge');
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annContent, setAnnContent] = useState<string>('');
  const [annPosterUrl, setAnnPosterUrl] = useState<string>('');
  const [annLinkUrl, setAnnLinkUrl] = useState<string>('');
  const [annLinkLabel, setAnnLinkLabel] = useState<string>('');

  const syncAnnState = () => {
    const list = getFromDB<Pengumuman>('pengumuman');
    const imp = list.find((a) => a.isImportant) || list[0];
    if (imp) {
      setAnnIsImportant(imp.isImportant !== false);
      setAnnDisplayType(imp.displayType || 'badge');
      setAnnTitle(imp.title || '');
      setAnnContent(imp.content || '');
      setAnnPosterUrl(imp.posterUrl || '');
      setAnnLinkUrl(imp.linkUrl || '');
      setAnnLinkLabel(imp.linkLabel || '');
    }
  };

  // Form states Kontak Helpdesk / Pemulihan Kata Sandi
  const [helpdeskEmail, setHelpdeskEmail] = useState(() => getHelpdeskConfig().email);
  const [helpdeskWa, setHelpdeskWa] = useState(() => getHelpdeskConfig().whatsappNumber);
  const [helpdeskNote, setHelpdeskNote] = useState(() => getHelpdeskConfig().whatsappNote);

  const reloadAll = () => {
    setStudents(getFromDB<Mahasiswa>('mahasiswa'));
    setAlumni(getFromDB<Alumni>('alumni'));
    setMitra(getFromDB<Mitra>('mitra'));
    setLowongan(getFromDB<Lowongan>('lowongan'));
    setAppls(getFromDB<PengajuanMagang>('pengajuan_magang'));
    setAllUsers(getFromDB<UserType>('users'));
    setKonten(getFromDB<KontenKarir>('konten_karir'));
    setSkItems(getFromDB<SuratKeputusan>('surat_keputusan'));
    setKalItems(getFromDB<KalenderKegiatan>('kalender_kegiatan'));
    setLapItems(getFromDB<LaporanKinerja>('laporan_kinerja'));
    setMouItems(getFromDB<MouStakeholder>('mou_stakeholder'));
    setGaleriItems(getFromDB<GaleriItem>('galeri_items'));
    setKomentarList(getKomentarBerita());
    setCdcClubCfg(getCdcClubConfig());
    setAdminWaNum(getAdminWaPrestasi());
    setAnggotaList(getAnggotaTim());
    setSocMedList(getFromDB<SocialMediaItem>('social_media'));
    syncAnnState();

    const hConfig = getHelpdeskConfig();
    setHelpdeskEmail(hConfig.email);
    setHelpdeskWa(hConfig.whatsappNumber);
    setHelpdeskNote(hConfig.whatsappNote);

    const cfg = getKonselingConfig();
    setKonselingCfg(cfg);
    setKPosterUrl(cfg.posterUrl || '');
    setKTitle(cfg.title || '');
    setKSubtitle(cfg.subtitle || '');
    setKNarasiWa(cfg.narasiWa || '');
    setKAdminWaNum(cfg.adminWaNumber || '');
    setKAdminWaMsg(cfg.adminWaDefaultMessage || '');
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
  const MENU: { group: string; collapsible?: boolean; items: { id: AdminTab; label: string; icon: React.ReactNode }[] }[] = [
    { group: 'DASHBOARD', items: [{ id: 'ringkasan', label: 'Ringkasan Laporan', icon: <LayoutDashboard className="w-4 h-4" /> }] },
    { group: 'KONTEN KARIR', items: [{ id: 'konten', label: 'Riwayat & Pembuatan Konten', icon: <FileText className="w-4 h-4" /> }] },
    {
      group: 'MANAJEMEN MITRA',
      items: [
        { id: 'mitra', label: 'Approval & List Mitra', icon: <Building2 className="w-4 h-4" /> }
      ]
    },
    {
      group: 'INTERAKSI PUBLIK',
      items: [
        { id: 'komentar', label: 'Moderasi Komentar Berita', icon: <MessageSquare className="w-4 h-4" /> }
      ]
    },
    {
      group: 'MANAJEMEN WEB',
      collapsible: true,
      items: [
        { id: 'keanggotaan', label: 'Keanggotaan & Tim', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'visi-misi', label: 'Visi & Misi', icon: <Target className="w-4 h-4" /> },
        { id: 'sk-cdc', label: 'Surat Keputusan CDC', icon: <FileText className="w-4 h-4" /> },
        { id: 'kalender', label: 'Kalender Kegiatan', icon: <Calendar className="w-4 h-4" /> },
        { id: 'laporan', label: 'Laporan Kinerja', icon: <FileText className="w-4 h-4" /> },
        { id: 'mou', label: 'MOU Stakeholder', icon: <FileText className="w-4 h-4" /> },
        { id: 'galeri', label: 'Galeri Kegiatan', icon: <Film className="w-4 h-4" /> },
        { id: 'media-sosial', label: 'Media Sosial', icon: <Globe className="w-4 h-4" /> },
        { id: 'admin', label: 'Kelola Admin', icon: <UserCog className="w-4 h-4" /> }
      ]
    }
  ];

  /* =========================================================
   *  DASHBOARD AWAL
   * =======================================================*/
  const pendingMitra = mitra.filter((m) => m.statusKerjaSama === 'pending');
  const totalMenunggu = pendingMitra.length;
  const pendingKomentarCount = komentarList.filter((k) => k.status === 'pending').length;

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [eJenis, setEJenis] = useState<JenisKonten>('berita');
  const [eJudul, setEJudul] = useState('');
  const [eBody, setEBody] = useState('');
  // Init isi editor berita (WYSIWYG) saat editor terbuka — diletakkan SETELAH state terkait dideklarasikan.
  useEffect(() => {
    if (editorOpen && eJenis === 'berita' && beritaEditRef.current) {
      beritaEditRef.current.innerHTML = markdownToHtml(eBody);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorOpen, eJenis]);
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
  // Field khusus event layanan (workshop / softskill / seminar)
  const [eTanggal, setETanggal] = useState('');
  const [eWaktu, setEWaktu] = useState('');
  const [eLokasiEvent, setELokasiEvent] = useState('');
  const [ePembicara, setEPembicara] = useState('');
  const [eKuotaEvent, setEKuotaEvent] = useState('');
  const [eTerdaftar, setETerdaftar] = useState('');
  const [eLinkDaftar, setELinkDaftar] = useState('');
  const [eStatusEvent, setEStatusEvent] = useState<'buka' | 'segera' | 'selesai'>('buka');
  // Field khusus Presentasi (konversi dari Prestasi)
  const [eSubKategori, setESubKategori] = useState<'akademik' | 'non-akademik'>('akademik');
  const [eNamaMahasiswa, setENamaMahasiswa] = useState('');
  const [eProdi, setEProdi] = useState('');
  const [eTahunPres, setETahunPres] = useState(new Date().getFullYear().toString());
  const [ePeringkat, setEPeringkat] = useState('Juara 1');
  const [eTerverifikasi, setETerverifikasi] = useState(true);
  const [eIsPinned, setEIsPinned] = useState(false);
  const [eShowOnHome, setEShowOnHome] = useState(false);
  const [eLayoutType, setELayoutType] = useState<'card' | 'badge'>('card');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const beritaEditRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [beritaPop, setBeritaPop] = useState<null | 'bullets' | 'numbering' | 'image'>(null);
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgAlign, setInlineImgAlign] = useState<'left' | 'right' | 'center'>('left');

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (beritaEditRef.current && beritaEditRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const insertFormattedInlineImage = (srcUrl?: string, alignPos?: 'left' | 'right' | 'center') => {
    const ed = beritaEditRef.current;
    if (!ed) return;
    ed.focus();

    const targetUrl = srcUrl || inlineImgUrl;
    const targetAlign = alignPos || inlineImgAlign;
    if (!targetUrl || !targetUrl.trim()) {
      triggerToast('error', 'Masukkan URL foto atau unggah file foto terlebih dahulu.');
      return;
    }

    let styleStr = '';
    let classStr = '';

    if (targetAlign === 'left') {
      styleStr = 'float: left; margin-right: 1.25rem; margin-bottom: 1rem; margin-top: 0.5rem; width: 320px; max-width: 48%; height: 200px; object-fit: cover; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
      classStr = 'img-float-left float-left mr-5 mb-4 w-full sm:w-80 h-52 object-cover rounded-xl border border-slate-200 shadow-sm';
    } else if (targetAlign === 'right') {
      styleStr = 'float: right; margin-left: 1.25rem; margin-bottom: 1rem; margin-top: 0.5rem; width: 320px; max-width: 48%; height: 200px; object-fit: cover; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
      classStr = 'img-float-right float-right ml-5 mb-4 w-full sm:w-80 h-52 object-cover rounded-xl border border-slate-200 shadow-sm';
    } else {
      styleStr = 'display: block; margin: 1rem auto; max-width: 100%; height: 260px; object-fit: cover; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
      classStr = 'img-float-center block mx-auto my-4 w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm';
    }

    const imgTag = document.createElement('img');
    imgTag.src = targetUrl.trim();
    imgTag.setAttribute('style', styleStr);
    imgTag.setAttribute('class', classStr);

    const sel = window.getSelection();
    let range: Range | null = null;

    if (savedRangeRef.current && ed.contains(savedRangeRef.current.commonAncestorContainer)) {
      range = savedRangeRef.current;
    } else if (sel && sel.rangeCount > 0 && ed.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      range = sel.getRangeAt(0);
    }

    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
      range.deleteContents();
      range.insertNode(imgTag);

      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (imgTag.nextSibling) {
        ed.insertBefore(p, imgTag.nextSibling);
      } else {
        ed.appendChild(p);
      }

      const newRange = document.createRange();
      newRange.setStartAfter(imgTag);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      ed.appendChild(imgTag);
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      ed.appendChild(p);
    }

    savedRangeRef.current = null;
    setInlineImgUrl('');
    setBeritaPop(null);
    triggerToast('success', `Foto disisipkan di posisi kursor (${targetAlign === 'left' ? 'Rata Kiri' : targetAlign === 'right' ? 'Rata Kanan' : 'Tengah'}).`);
  };

  const handleInlineImageFile = async (e: React.ChangeEvent<HTMLInputElement>, alignPos: 'left' | 'right' | 'center') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageAdaptive(file);
        insertFormattedInlineImage(compressed, alignPos);
      } catch {
        triggerToast('error', 'Gagal memproses file gambar.');
      }
    }
  };

  const applyQuote = () => {
    const ed = beritaEditRef.current; if (!ed) return; ed.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const openQ = document.createTextNode('“');
    const closeQ = document.createTextNode('”');
    const frag = document.createDocumentFragment();
    frag.appendChild(openQ); frag.appendChild(closeQ);
    range.insertNode(frag);
    const r = document.createRange();
    r.setStart(openQ, 1); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
  };

  const BULLET_OPTIONS = [
    { ch: '•', css: 'disc', label: 'Titik lingkaran padat' },
    { ch: '◦', css: 'circle', label: 'Lingkaran kecil tanpa isi' },
    { ch: '■', css: 'square', label: 'Persegi padat' },
    { ch: '✓', css: '"✓ "', label: 'Ceklis (daftar tugas)' },
    { ch: '◆', css: '"◆ "', label: 'Wajik / berlian kecil' },
    { ch: '➔', css: '"➔ "', label: 'Panah ke kanan' },
  ];

  const applyBullet = (marker: string) => {
    const ed = beritaEditRef.current; if (!ed) return;
    ed.focus();

    const sel = window.getSelection();
    if (savedRangeRef.current && ed.contains(savedRangeRef.current.commonAncestorContainer)) {
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }

    const opt = BULLET_OPTIONS.find((b) => b.ch === marker);
    document.execCommand('insertUnorderedList', false);

    if (sel && sel.anchorNode) {
      const el = sel.anchorNode.nodeType === 1 ? (sel.anchorNode as HTMLElement) : sel.anchorNode.parentElement;
      const parentUl = el?.closest('ul');
      if (parentUl && opt?.css) {
        parentUl.style.listStyleType = opt.css;
      }
    }
    setBeritaPop(null);
  };

  const applyNumbering = (paren: boolean) => {
    const ed = beritaEditRef.current; if (!ed) return;
    ed.focus();

    const sel = window.getSelection();
    if (savedRangeRef.current && ed.contains(savedRangeRef.current.commonAncestorContainer)) {
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }

    document.execCommand('insertOrderedList', false);

    if (sel && sel.anchorNode) {
      const el = sel.anchorNode.nodeType === 1 ? (sel.anchorNode as HTMLElement) : sel.anchorNode.parentElement;
      const parentOl = el?.closest('ol');
      if (parentOl) {
        if (paren) {
          parentOl.classList.add('list-paren');
        } else {
          parentOl.classList.remove('list-paren');
        }
      }
    }
    setBeritaPop(null);
  };


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
      setETanggal(item.tanggal || '');
      setEWaktu(item.waktu || '');
      setELokasiEvent(item.lokasiEvent || '');
      setEPembicara(item.pembicara || '');
      setEKuotaEvent(item.kuotaEvent != null ? String(item.kuotaEvent) : '');
      setETerdaftar(item.terdaftar != null ? String(item.terdaftar) : '');
      setELinkDaftar(item.linkDaftar || '');
      setEStatusEvent(item.statusEvent || 'buka');
      setESubKategori(item.subKategori || 'akademik');
      setENamaMahasiswa(item.namaMahasiswa || '');
      setEProdi(item.prodi || '');
      setETahunPres(item.tahun || new Date().getFullYear().toString());
      setEPeringkat(item.peringkat || 'Juara 1');
      setETerverifikasi(item.terverifikasi !== false);
      setEIsPinned(item.isPinned === true);
      setEShowOnHome(item.showOnHome === true);
      setELayoutType(item.layoutType || 'card');
    } else {
      setEditId(null);
      setEJenis(jenis || 'berita');
      setEJudul(''); setEBody(''); setEPenulis(''); setEThumbnail('');
      setELinkLamar(''); setEKategori(''); setEScope('LOKAL');
      setEGaji(''); setEKuota(''); setEDeadline(''); setELinkCta(''); setEStatus('published');
      setETanggal(''); setEWaktu(''); setELokasiEvent(''); setEPembicara('');
      setELinkDaftar(''); setEStatusEvent('buka');
      setESubKategori('akademik'); setENamaMahasiswa(''); setEProdi('');
      setETahunPres(new Date().getFullYear().toString()); setEPeringkat('Juara 1'); setETerverifikasi(true);
      setEIsPinned(false);
      setEShowOnHome(false);
      setELayoutType('card');
    }
    setSaveError(null);
    setKontenSub('pembuatan');
    setEditorOpen(true);
  };

  // Sinkronisasi isi editor WYSIWYG saat mode edit dibuka
  useEffect(() => {
    if (editorOpen && beritaEditRef.current) {
      if (editId) {
        beritaEditRef.current.innerHTML = eBody || '';
      } else if (!eBody) {
        // Konten baru jika kosong
      }
    }
  }, [editorOpen, editId]);

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
  const [lPosterUrl, setLPosterUrl] = useState('');
  const [lPosterUploadType, setLPosterUploadType] = useState<'file' | 'url'>('file');
  const [lLinkEksternal, setLLinkEksternal] = useState('');
  const [lCtaEnabled, setLCtaEnabled] = useState(false);
  const [lCtaLabel, setLCtaLabel] = useState('Daftar Sekarang');
  const [lJenisPekerjaan, setLJenisPekerjaan] = useState<'full-time' | 'part-time'>('full-time');
  const [lStatus, setLStatus] = useState<'published' | 'draft' | 'closed'>('draft');
  const [lIsPinned, setLIsPinned] = useState(false);

  const handleTogglePinKonten = (k: KontenKarir) => {
    const updated = { ...k, isPinned: !k.isPinned };
    updateInDB<KontenKarir>('konten_karir', updated);
    reloadAll();
    if (onReloadData) onReloadData();
    triggerToast('success', updated.isPinned ? `Konten "${k.judul}" disematkan ke Popular Info.` : `Sematkan konten "${k.judul}" dibatalkan.`);
  };

  const handleTogglePinLowongan = (l: Lowongan) => {
    const updated = { ...l, isPinned: !l.isPinned };
    updateInDB<Lowongan>('lowongan', updated);
    reloadAll();
    if (onReloadData) onReloadData();
    triggerToast('success', updated.isPinned ? `Lowongan "${l.judul}" disematkan ke Popular Info.` : `Sematkan lowongan "${l.judul}" dibatalkan.`);
  };

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
      setLDeskripsi(item.deskripsi || '');
      setLTanggungJawab(Array.isArray(item.tanggungJawab) ? item.tanggungJawab.join('\n') : (item.tanggungJawab || ''));
      setLKualifikasi(Array.isArray(item.kualifikasi) ? item.kualifikasi.join('\n') : '');
      setLKeahlian(Array.isArray(item.keahlian) ? item.keahlian.join('\n') : '');
      setLBenefit(Array.isArray(item.benefit) ? item.benefit.join('\n') : '');
      setLPosterUrl(item.flyer || item.imageUrl || item.bannerImage || (item.flyers && item.flyers[0]) || '');
      setLLinkEksternal(item.linkEksternal || '');
      setLCtaEnabled(item.ctaEnabled === true);
      setLCtaLabel(item.ctaLabel && item.ctaLabel.trim() ? item.ctaLabel : 'Daftar Sekarang');
      setLJenisPekerjaan(item.jenisPekerjaan || 'full-time');
      setLStatus(item.status === 'draft' ? 'draft' : (item.status === 'closed' ? 'closed' : 'published'));
      setLIsPinned(item.isPinned === true);
    } else {
      setEditLowonganId(null);
      setLJudul(''); setLTipe('magang'); setLNamaInstansi(''); setLKategori('');
      setLLokasi(''); setLGaji('Kompetitif'); setLKuota(''); setLDeadline('');
      setLDeskripsi(''); setLTanggungJawab(''); setLKualifikasi(''); setLKeahlian(''); setLBenefit('');
      setLPosterUrl(''); setLLinkEksternal(''); setLCtaEnabled(false); setLCtaLabel('Daftar Sekarang'); setLJenisPekerjaan('full-time'); setLStatus('draft');
      setLIsPinned(false);
    }
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

  const handleLowonganPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Poster lowongan bisa sedikit lebih besar dari thumbnail konten.
        const url = await compressImageAdaptive(file);
        setLPosterUrl(url);
      } catch {
        triggerToast('error', 'Gagal memproses poster lowongan.');
      }
    }
  };

  const handleSaveLowongan = async () => {
    if (!lJudul.trim() || !lNamaInstansi.trim() || !lLokasi.trim() || !lDeadline.trim()) {
      triggerToast('error', 'Field bertanda * wajib diisi (Judul, Instansi, Lokasi, Deadline).');
      return;
    }
    if (lCtaEnabled && !lLinkEksternal.trim()) {
      triggerToast('error', 'Tombol CTA diaktifkan — Link tujuan wajib diisi.');
      return;
    }
    const parseLines = (txt: string): string[] =>
      txt.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);

    const existing = editLowonganId ? lowongan.find((j) => j.id === editLowonganId) : null;

    const newLow: Lowongan = {
      id: editLowonganId || `low_admin_${Date.now()}`,
      mitraId: editLowonganId ? (existing?.mitraId || 'admin_cdc') : 'admin_cdc',
      createdBy: user.id,
      judul: lJudul.trim(),
      tipe: lTipe,
      namaInstansi: lNamaInstansi.trim(),
      companyLogo: undefined,
      imageUrl: lPosterUrl || undefined,
      flyer: lPosterUrl || undefined,
      bannerImage: lPosterUrl || undefined,
      flyers: lPosterUrl ? [lPosterUrl] : undefined,
      sumber: 'admin',
      linkEksternal: lLinkEksternal.trim() || undefined,
      ctaEnabled: lCtaEnabled,
      ctaLabel: lCtaEnabled ? (lCtaLabel.trim() || 'Daftar Sekarang') : undefined,
      jenisPekerjaan: lJenisPekerjaan,
      isPinned: lIsPinned,
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

    try {
      const pruned = await saveLowonganWithQuota(newLow, !!editLowonganId);
      if (pruned > 0) {
        triggerToast('success', `Lowongan disimpan. ${pruned} lowongan lama dibuang otomatis untuk menghemat storage.`);
      } else {
        triggerToast('success', editLowonganId ? 'Lowongan By Admin diperbarui.' : 'Lowongan By Admin diposting ke Info Karir.');
      }
    } catch (err: any) {
      console.error('SAVE_LOWONGAN_FAIL', err);
      const msg = (err && err.name === 'QuotaExceededError')
        ? 'Gagal menyimpan: storage penyimpanan lokal penuh. Hapus beberapa lowongan lama atau gunakan poster lebih kecil.'
        : 'Gagal menyimpan lowongan ke penyimpanan lokal.';
      triggerToast('error', msg);
      return;
    }
    resetLowonganForm();
    reloadAll();
    if (onReloadData) onReloadData();
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
      try {
        const url = await compressImageAdaptive(file);
        setEThumbnail(url);
      } catch (err) {
        triggerToast('error', 'Gagal memproses gambar thumbnail.');
      }
    }
  };

  const handleSaveKonten = async () => {
    setSaveError(null);
    if (!eJudul.trim()) {
      setSaveError('Judul wajib diisi.');
      triggerToast('error', 'Judul wajib diisi.');
      return;
    }
    const isWysiwyg = eJenis === 'berita' || eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar';
    const rawBody = (isWysiwyg && beritaEditRef.current)
      ? (beritaEditRef.current.innerHTML || '')
      : eBody;
    // Sanitasi tag list kosong (ul/ol tanpa isi teks) agar tidak meninggalkan titik liar
    const sanitizedBody = rawBody.replace(/<(ul|ol)[^>]*>\s*(<li>\s*(<br\s*\/?>)?\s*<\/li>\s*)*<\/\1>/gi, '').trim();

    // Periksa apakah ada konten teks atau gambar
    const hasContent = isWysiwyg
      ? (sanitizedBody.replace(/<[^>]*>/g, '').trim().length > 0 || /<img/i.test(sanitizedBody))
      : eBody.trim().length > 0;

    if (eJenis !== 'program' && !hasContent) {
      setSaveError('Isi konten (body) wajib diisi.');
      triggerToast('error', 'Judul dan isi konten wajib diisi.');
      return;
    }
    if (THUMB_REQUIRED[eJenis] && !eThumbnail) {
      setSaveError(`Thumbnail wajib diunggah untuk ${JENIS_LABEL[eJenis]}.`);
      triggerToast('error', `Thumbnail wajib untuk ${JENIS_LABEL[eJenis]}.`);
      return;
    }
    if ((eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') && !eTanggal) {
      setSaveError('Tanggal Pelaksanaan wajib diisi untuk konten event layanan. Klik ikon kalender dan pilih tanggal.');
      triggerToast('error', 'Tanggal Pelaksanaan wajib diisi untuk konten event layanan.');
      return;
    }
    const now = new Date().toISOString();
    const finalBody = isWysiwyg ? sanitizedBody : eBody;
    const base: KontenKarir = {
      id: editId || `kk_${Date.now()}`,
      jenis: eJenis,
      judul: eJudul.trim(),
      body: finalBody,
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
      // Field khusus Presentasi
      subKategori: eJenis === 'presentasi' ? eSubKategori : undefined,
      namaMahasiswa: eJenis === 'presentasi' ? eNamaMahasiswa.trim() : undefined,
      prodi: eJenis === 'presentasi' ? eProdi.trim() : undefined,
      tahun: eJenis === 'presentasi' ? eTahunPres.trim() : undefined,
      peringkat: eJenis === 'presentasi' ? ePeringkat.trim() : undefined,
      terverifikasi: eJenis === 'presentasi' ? eTerverifikasi : undefined,
      status: eStatus,
      createdAt: editId ? (konten.find((k) => k.id === editId)?.createdAt || now) : now,
      updatedAt: now,
      createdBy: 'usr_admin',
      createdByName: 'Admin Website',
      // Field khusus event layanan
      tanggal: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? eTanggal : undefined,
      waktu: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? eWaktu.trim() : undefined,
      lokasiEvent: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? eLokasiEvent.trim() : undefined,
      pembicara: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? ePembicara.trim() : undefined,
      kuotaEvent: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') && eKuotaEvent ? Number(eKuotaEvent) : undefined,
      terdaftar: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') && eTerdaftar ? Number(eTerdaftar) : undefined,
      linkDaftar: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? eLinkDaftar.trim() : undefined,
      statusEvent: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? eStatusEvent : undefined,
      isPinned: eIsPinned,
      showOnHome: eJenis === 'presentasi' ? eShowOnHome : undefined,
      layoutType: eJenis === 'program' ? eLayoutType : undefined
    };
    try {
      const pruned = await saveKontenKarirWithQuota(base, !!editId);
      if (pruned > 0) {
        triggerToast('success', `Konten disimpan. ${pruned} draft lama dibuang otomatis untuk menghemat storage.`);
      } else {
        triggerToast('success', editId ? 'Konten diperbarui.' : 'Konten diterbitkan.');
      }
    } catch (err: any) {
      console.error('SAVE_KONTEN_FAIL', err);
      const msg = (err && err.name === 'QuotaExceededError')
        ? 'Gagal menyimpan: storage penyimpanan lokal penuh. Hapus beberapa konten lama (terutama yang ber-thumbnail besar) lalu coba lagi.'
        : 'Gagal menyimpan konten ke penyimpanan lokal.';
      setSaveError(msg);
      triggerToast('error', msg);
      return;
    }
    setSaveError(null);
    setEditorOpen(false);
    setKontenJenisBaru(null);
    reloadAll();
    if (onReloadData) onReloadData();
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
    // Jika isi sudah berupa HTML (berita yang diedit via WYSIWYG), render langsung.
    // Berita lama (markdown) tetap diparse seperti biasa.
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      const clean = raw
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/ on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
      return <div className="prose-berita" dangerouslySetInnerHTML={{ __html: clean }} />;
    }
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

  // Konversi markdown sederhana -> HTML untuk init contentEditable saat edit berita lama.
  function markdownToHtml(md: string): string {
    if (!md) return '';
    if (/<[a-z][\s\S]*>/i.test(md)) return md; // sudah HTML
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s: string) =>
      esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<u>$1</u>')
        .replace(/~~(.+?)~~/g, '<span class="line-through">$1</span>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
    return md.split('\n').map((line) => {
      if (line.trim() === '---') return '<hr/>';
      if (line.startsWith('## ')) return `<h2>${inline(line.slice(3))}</h2>`;
      if (line.startsWith('# ')) return `<h1>${inline(line.slice(2))}</h1>`;
      if (line.startsWith('> ')) return `<blockquote>${inline(line.slice(2))}</blockquote>`;
      if (/^[-*]\s+/.test(line)) return `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`;
      if (/^\d+\.\s+/.test(line)) return `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`;
      if (line.trim() === '') return '';
      return `<p>${inline(line)}</p>`;
    }).join('');
  }

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
              {MENU.map((section, idx) => {
                const isCollapsible = !!section.collapsible;
                const isOpen = expandedGroups[section.group] ?? true;
                return (
                <div key={section.group} className={idx > 0 ? 'mt-4 pt-3 border-t border-slate-100' : ''}>
                  {isCollapsible ? (
                    <button
                      type="button"
                      onClick={() => setExpandedGroups((g) => ({ ...g, [section.group]: !isOpen }))}
                      className="w-full flex items-center justify-between px-1 mb-1.5 group"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition">{section.group}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </button>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">{section.group}</div>
                  )}
                  {isOpen && (
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
                          {menu.id === 'komentar' && pendingKomentarCount > 0 && (
                            <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingKomentarCount}</span>
                          )}
                          {active
                            ? <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                            : <span className="ml-auto w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-blue-300 transition" />}
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>
                );
              })}
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
                  { label: 'Mitra', value: mitra.length, sub: 'terdaftar', color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', Icon: Users, goto: () => { setActiveTab('mitra'); setMitraSub('list'); } },
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

                  {/* Pengaturan Nomor WA Admin untuk Lapor Prestasi */}
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        Nomor WhatsApp Admin (Lapor Prestasi)
                      </h4>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Nomor ini akan langsung dibuka saat pengunjung/mahasiswa menekan tombol "Laporkan Prestasi".
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={adminWaNum}
                        onChange={(e) => setAdminWaNum(e.target.value)}
                        placeholder="081234567890 atau 6281234567890"
                        className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-48 sm:w-56"
                      />
                      <button
                        onClick={() => {
                          saveAdminWaPrestasi(adminWaNum);
                          triggerToast('success', 'Nomor WA Admin berhasil disimpan!');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>

                  {/* Pengaturan Pengumuman Utama Beranda (Pengumuman Sangat Penting) */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                          <Megaphone className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                            Pengumuman Utama Beranda (Pengumuman Sangat Penting)
                          </h4>
                          <p className="text-slate-400 text-xs">
                            Ditampilkan di posisi teratas beranda publik (tepat di atas Info Karir Terkini).
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <input
                          type="checkbox"
                          checked={annIsImportant}
                          onChange={(e) => setAnnIsImportant(e.target.checked)}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-200">Aktif di Beranda</span>
                      </label>
                    </div>

                    {/* Mode Tampilan Radio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Mode Tampilan Pengumuman</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAnnDisplayType('badge')}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${annDisplayType === 'badge'
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                          >
                            <span>Banner Teks & Badge</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnnDisplayType('poster')}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${annDisplayType === 'poster'
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                          >
                            <span>Poster Gambar</span>
                          </button>
                        </div>
                      </div>

                      {/* Judul Pengumuman */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Judul Pengumuman Khusus *</label>
                        <input
                          type="text"
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="Pengisian Tracer Study Alumni..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Isi Teks / Deskripsi */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Isi Pengumuman / Deskripsi Ringkas</label>
                      <textarea
                        rows={2}
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="Tulis uraian pengumuman di sini..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Jika Mode Poster: Upload / URL Poster */}
                    {annDisplayType === 'poster' && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-xs font-semibold text-emerald-400 block">Poster Gambar Pengumuman (Banner Visual)</label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                            <ImageIcon className="w-4 h-4 text-emerald-400" /> Upload Poster Gambar
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => setAnnPosterUrl(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            value={annPosterUrl}
                            onChange={(e) => setAnnPosterUrl(e.target.value)}
                            placeholder="atau tempel URL gambar poster (https://...)"
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        {annPosterUrl && (
                          <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                            <img src={annPosterUrl} alt="Preview Poster" className="w-full h-full object-contain max-h-48" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Link Aksi & Label Tombol */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Tautan / Link Aksi Opsional (URL)</label>
                        <input
                          type="text"
                          value={annLinkUrl}
                          onChange={(e) => setAnnLinkUrl(e.target.value)}
                          placeholder="https://tracerstudy.umkendari.ac.id"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Label Tombol Aksi</label>
                        <input
                          type="text"
                          value={annLinkLabel}
                          onChange={(e) => setAnnLinkLabel(e.target.value)}
                          placeholder="mis. Isi Tracer Study / Buka Link"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const list = getFromDB<Pengumuman>('pengumuman');
                          const activeAnn = list.find((a) => a.isImportant) || list[0];
                          const updatedAnn: Pengumuman = {
                            id: activeAnn?.id || `ann_${Date.now()}`,
                            title: annTitle.trim() || 'Pengumuman Penting CDC UMK',
                            content: annContent.trim(),
                            category: activeAnn?.category || 'tracer_study',
                            status: 'published',
                            createdAt: activeAnn?.createdAt || new Date().toISOString(),
                            publishedAt: new Date().toISOString(),
                            isImportant: annIsImportant,
                            displayType: annDisplayType,
                            posterUrl: annPosterUrl,
                            linkUrl: annLinkUrl.trim(),
                            linkLabel: annLinkLabel.trim()
                          };
                          let newList: Pengumuman[];
                          const idx = list.findIndex((a) => a.id === updatedAnn.id);
                          if (idx >= 0) {
                            newList = list.map((a, i) => (i === idx ? updatedAnn : { ...a, isImportant: false }));
                          } else {
                            newList = [updatedAnn, ...list.map(a => ({ ...a, isImportant: false }))];
                          }
                          saveToDB('pengumuman', newList);
                          triggerToast('success', 'Pengumuman Utama Beranda berhasil disimpan!');
                          reloadAll();
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Simpan Pengumuman Utama
                      </button>
                    </div>
                  </div>

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
                            <img src={l.flyer || l.imageUrl} alt="" className="w-16 h-20 poster-reveal rounded-xl flex-shrink-0" />
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
                    {/* Baris khusus Konseling Karir (bukan konten_karir biasa) */}
                    <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4 flex items-center gap-4">
                      <div className="w-20 h-14 flex-shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><HeartHandshake className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {statusBadge(konselingCfg.published === false ? 'draft' : 'published', { draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' }, published: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Published' } })}
                          <span className="text-[11px] text-slate-400 flex items-center gap-1"><HeartHandshake className="w-3 h-3" /> Konseling Karir</span>
                        </div>
                        <div className="font-bold text-slate-800 truncate">{konselingCfg.title || 'Layanan Konseling Karir'}</div>
                        <div className="text-[11px] text-slate-400">Konfigurasi layanan konseling · {konselingCfg.updatedAt ? formatTanggal(konselingCfg.updatedAt) : '—'}</div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setActiveTab('konseling')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                      </div>
                    </div>

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
                            {k.isPinned && k.jenis !== 'lowongan' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                <Pin className="w-3 h-3 fill-amber-600 text-amber-600" /> Ter-Pin
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-800 truncate">{k.judul}</div>
                          <div className="text-[11px] text-slate-400">{formatTanggal(k.createdAt)}{k.penulis ? ' · ' + k.penulis : ''}</div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {k.jenis !== 'lowongan' && (
                            <button
                              type="button"
                              title={k.isPinned ? "Lepas Sematan (Unpin)" : "Sematkan ke Popular Info (Pin)"}
                              onClick={() => handleTogglePinKonten(k)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${k.isPinned
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                                }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${k.isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
                              <span>{k.isPinned ? 'Ter-Pin' : 'Pin'}</span>
                            </button>
                          )}
                          <button onClick={() => openEditor(k)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                          <button onClick={() => handleDeleteKonten(k)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {kontenSub === 'pembuatan' && !editorOpen && !showLowonganForm && (
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

                    {/* Card khusus Konseling Karir (bukan jenis konten, tapi konfigurasi dedicated) */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('konseling')}
                      className="text-left border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm rounded-xl p-4 transition group"
                    >
                      <div className="text-emerald-600 group-hover:scale-110 transition"><span className="inline-flex w-9 h-9 rounded-lg bg-emerald-50 ring-1 ring-emerald-100 items-center justify-center"><HeartHandshake className="w-4 h-4" /></span></div>
                      <div className="font-bold text-slate-800 mt-3 tracking-tight">Konseling Karir</div>
                      <div className="text-[11px] text-slate-400 mt-1">→ Buka pengaturan layanan konseling</div>
                    </button>
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
                    <div className="space-y-4">
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
                          <label className="text-xs font-medium text-slate-500">Deskripsi Ringkas (Opsional)</label>
                          <textarea value={lDeskripsi} onChange={(e) => setLDeskripsi(e.target.value)} rows={3} placeholder="Gambaran umum, lingkup tugas... (opsional)" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
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
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Status:</span>
                        <Dropdown
                          value={lStatus}
                          onChange={(v) => setLStatus(v as any)}
                          size="sm"
                          className="w-full"
                          options={[
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Draft' },
                            ...(editLowonganId && lStatus === 'closed' ? [{ value: 'closed', label: 'Closed' }] : []),
                          ]}
                        />
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
                    <button onClick={() => { setEditorOpen(false); }} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                  </div>

                  {saveError && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm font-medium">
                      <span className="mt-0.5">⚠️</span>
                      <span>{saveError}</span>
                    </div>
                  )}

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

                    {eJenis === 'program' && (
                      <div className="space-y-3 sm:col-span-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kategori Pengumuman (bebas, mis. Program Unggulan / KERJA / MAGANG / UMUM)</label>
                          <input value={eKategori} onChange={(e) => setEKategori(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Program Unggulan / KERJA / MAGANG / UMUM / DLL" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Model Layout Tampilan (Penayangan Beranda)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setELayoutType('card')}
                              className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-start gap-2.5 border cursor-pointer ${
                                eLayoutType === 'card'
                                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${eLayoutType === 'card' ? 'border-white bg-white/20' : 'border-slate-400'}`}>
                                {eLayoutType === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="text-left">
                                <div className="font-extrabold text-xs">Card Gambar / Poster</div>
                                <div className="text-[10px] opacity-80">Header foto + badge + info instansi (seperti di screenshot)</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setELayoutType('badge')}
                              className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 border cursor-pointer ${
                                eLayoutType === 'badge'
                                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${eLayoutType === 'badge' ? 'border-white bg-white/20' : 'border-slate-400'}`}>
                                {eLayoutType === 'badge' && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="text-left">
                                <div className="font-extrabold text-xs">Model Badge Khusus</div>
                                <div className="text-[10px] opacity-80">Banner ringkas dengan badge berlatar & ikon khas</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') && (
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Tanggal Pelaksanaan *</label>
                          <input value={eTanggal} onChange={(e) => setETanggal(e.target.value)} type="date" required className={`w-full px-3 py-2 rounded-xl border text-sm ${!eTanggal ? 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-300'}`} />
                          {!eTanggal && <p className="text-[11px] text-rose-500 font-medium">Wajib diisi — klik ikon kalender di kanan input dan pilih tanggal.</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Waktu (mis. 09:00 - 14:00 WITA)</label>
                          <input value={eWaktu} onChange={(e) => setEWaktu(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="09:00 - 14:00 WITA" />
                        </div>
                      </div>
                    )}

                    {eJenis === 'program' && (
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-xs font-medium text-slate-500">Link Tujuan (arahkan klik ke web/menu tertentu)</label>
                        <input value={eLinkCta} onChange={(e) => setELinkCta(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="https://... atau #nama-tab" />
                        <p className="text-[11px] text-slate-400">Kosongkan jika ingin klik membuka halaman detail. Awali dengan # untuk arahkan ke menu beranda.</p>
                      </div>
                    )}

                    {eJenis === 'presentasi' && (
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Tingkat Prestasi *</label>
                          <Dropdown value={eKategori as any} onChange={(v) => setEKategori(v as string)} className="w-full" options={[
                            { value: 'internasional', label: 'Internasional' },
                            { value: 'nasional', label: 'Nasional' },
                            { value: 'wilayah', label: 'Wilayah' }
                          ]} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Kategori *</label>
                          <Dropdown value={eSubKategori} onChange={(v) => setESubKategori(v as any)} className="w-full" options={[
                            { value: 'akademik', label: 'Akademik' },
                            { value: 'non-akademik', label: 'Non-Akademik' }
                          ]} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Nama Mahasiswa / Tim *</label>
                          <input value={eNamaMahasiswa} onChange={(e) => setENamaMahasiswa(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Tim Inovator Informatika UMK" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Program Studi / Fakultas</label>
                          <input value={eProdi} onChange={(e) => setEProdi(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Teknik Informatika" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Tahun</label>
                          <input value={eTahunPres} onChange={(e) => setETahunPres(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="2026" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500">Peringkat / Capaian</label>
                          <input value={ePeringkat} onChange={(e) => setEPeringkat(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Juara 1 / Gold Medal" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2 flex flex-col gap-2 pt-1 border-t border-slate-100">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                            <input type="checkbox" checked={eTerverifikasi} onChange={(e) => setETerverifikasi(e.target.checked)} className="w-4 h-4 text-[#1E3A8A] rounded border-slate-300 focus:ring-[#1E3A8A] cursor-pointer" />
                            <span>Terverifikasi CDC</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A] cursor-pointer select-none">
                            <input type="checkbox" checked={eShowOnHome} onChange={(e) => setEShowOnHome(e.target.checked)} className="w-4 h-4 text-[#1E3A8A] rounded border-slate-300 focus:ring-[#1E3A8A] cursor-pointer" />
                            <span>Tampilkan di Beranda Utama (Section Berita &amp; Artikel Terkini)</span>
                          </label>
                        </div>
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

                  {eJenis === 'program' || eJenis === 'presentasi' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Deskripsi {eJenis === 'presentasi' ? 'Prestasi / Capaian' : 'Konten (opsional — kosongkan jika hanya ingin mengarahkan klik kartu ke link)'}</label>
                      <textarea
                        ref={bodyRef}
                        value={eBody}
                        onChange={(e) => setEBody(e.target.value)}
                        rows={10}
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder={eJenis === 'presentasi' ? "Tulis deskripsi singkat capaian presentasi ini..." : "Tulis detail program & pengumuman di sini (opsional). Kosongkan jika klik kartu langsung diarahkan ke link di atas."}
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
                        <div className="flex flex-wrap items-center gap-1.5 border border-slate-200 rounded-t-xl p-2 bg-slate-50 relative">
                          <ToolbarBtn icon={<Bold className="w-4 h-4" />} label="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} />
                          <ToolbarBtn icon={<Italic className="w-4 h-4" />} label="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} />
                          <ToolbarBtn icon={<UnderlineIcon className="w-4 h-4" />} label="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} />
                          <ToolbarBtn icon={<StrikethroughIcon className="w-4 h-4" />} label="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('strikeThrough')} />
                          <span className="w-px h-6 bg-slate-300 mx-0.5" />
                          <ToolbarBtn icon={<Heading1 className="w-4 h-4" />} label="H1" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('formatBlock', false, 'h1')} />
                          <ToolbarBtn icon={<Heading2 className="w-4 h-4" />} label="H2" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('formatBlock', false, 'h2')} />
                          <div className="relative">
                            <ToolbarBtn icon={<List className="w-4 h-4" />} label="Bullets" onClick={() => setBeritaPop(beritaPop === 'bullets' ? null : 'bullets')} />
                            {beritaPop === 'bullets' && (
                              <div className="absolute z-30 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5">
                                {BULLET_OPTIONS.map((b) => (
                                  <button key={b.ch} type="button" onClick={() => applyBullet(b.ch)} className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-left text-sm text-slate-700">
                                    <span className="w-6 text-center text-base leading-none">{b.ch}</span>
                                    <span>{b.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <ToolbarBtn icon={<ListOrdered className="w-4 h-4" />} label="Numbering" onClick={() => setBeritaPop(beritaPop === 'numbering' ? null : 'numbering')} />
                            {beritaPop === 'numbering' && (
                              <div className="absolute z-30 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5">
                                <button type="button" onClick={() => applyNumbering(false)} className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-left text-sm text-slate-700">
                                  <span className="w-8 text-center font-mono">1.</span><span>Penomoran standar (1, 2, 3, ...)</span>
                                </button>
                                <button type="button" onClick={() => applyNumbering(true)} className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-left text-sm text-slate-700">
                                  <span className="w-8 text-center font-mono">1)</span><span>Angka Arab + kurung tutup (1), 2), ...)</span>
                                </button>
                              </div>
                            )}
                          </div>
                          <ToolbarBtn icon={<Quote className="w-4 h-4" />} label="Quote" onMouseDown={(e) => e.preventDefault()} onClick={applyQuote} />
                          <span className="w-px h-6 bg-slate-300 mx-0.5" />
                          <ToolbarBtn icon={<LinkIcon className="w-4 h-4" />} label="Link" onMouseDown={(e) => e.preventDefault()} onClick={() => { const u = prompt('URL link:'); if (u) document.execCommand('createLink', false, u); }} />
                          <div className="relative">
                            <ToolbarBtn
                              icon={<ImageIcon className="w-4 h-4" />}
                              label="Gambar"
                              onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                              onClick={() => { saveSelection(); setBeritaPop(beritaPop === 'image' ? null : 'image'); }}
                            />
                            {beritaPop === 'image' && (
                              <div className="absolute z-30 mt-1 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 right-0 sm:right-auto animate-fadeIn text-left">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-[#0077C6]" /> Sisip Foto Inline Berita
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setBeritaPop(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* 1. Pilihan Posisi Tata Letak */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    1. Pilihan Posisi Tata Letak
                                  </label>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setInlineImgAlign('left')}
                                      className={`px-2 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border cursor-pointer ${inlineImgAlign === 'left' ? 'bg-blue-50 text-[#1E3A8A] border-blue-400 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                      <span>⬅️ Kiri</span>
                                      <span className="text-[9px] font-medium text-slate-400">(Float Left)</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineImgAlign('right')}
                                      className={`px-2 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border cursor-pointer ${inlineImgAlign === 'right' ? 'bg-blue-50 text-[#1E3A8A] border-blue-400 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                      <span>➡️ Kanan</span>
                                      <span className="text-[9px] font-medium text-slate-400">(Float Right)</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineImgAlign('center')}
                                      className={`px-2 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border cursor-pointer ${inlineImgAlign === 'center' ? 'bg-blue-50 text-[#1E3A8A] border-blue-400 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                      <span>↔️ Tengah</span>
                                      <span className="text-[9px] font-medium text-slate-400">(Full Width)</span>
                                    </button>
                                  </div>
                                </div>

                                {/* 2. Unggah File Foto dari Perangkat */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    2. Unggah File Foto dari Perangkat
                                  </label>
                                  <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1E3A8A] text-xs font-bold rounded-xl border border-dashed border-slate-300 hover:border-blue-300 cursor-pointer transition">
                                    <Upload className="w-3.5 h-3.5 text-[#0077C6]" />
                                    <span>Pilih File Foto...</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleInlineImageFile(e, inlineImgAlign)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {/* Atau 3. Masukkan Tautan URL Foto */}
                                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Atau Input URL Foto Online
                                  </label>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="url"
                                      value={inlineImgUrl}
                                      onChange={(e) => setInlineImgUrl(e.target.value)}
                                      placeholder="https://..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => insertFormattedInlineImage(undefined, inlineImgAlign)}
                                      className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
                                    >
                                      Sisip
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          ref={beritaEditRef}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(e) => setEBody((e.target as HTMLDivElement).innerHTML)}
                          onMouseDown={() => { saveSelection(); setBeritaPop(null); }}
                          onMouseUp={saveSelection}
                          onKeyUp={saveSelection}
                          onBlur={saveSelection}
                          className="w-full min-h-[360px] border border-slate-300 rounded-b-xl p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300 prose max-w-none flow-root overflow-auto"
                        />
                      </div>
                    </>)}

                  <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Status:</span>
                        <Dropdown value={eStatus} onChange={(v) => setEStatus(v as any)} size="sm" className="w-full" options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
                      </div>
                      {eJenis !== 'lowongan' && (
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-lg border border-slate-200 transition">
                          <input
                            type="checkbox"
                            checked={eIsPinned}
                            onChange={(e) => setEIsPinned(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <Pin className={`w-3.5 h-3.5 ${eIsPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                          <span>Sematkan ke Popular Info (Pin)</span>
                        </label>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditorOpen(false); }} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Batal</button>
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

          {/* ============== MANAJEMEN SURAT KEPUTUSAN CDC ============== */}
          {activeTab === 'sk-cdc' && (() => {
            const openSkFormModal = (item?: SuratKeputusan) => {
              if (item) {
                setEditSkId(item.id);
                setSkJudul(item.judul);
                setSkKategori(item.kategori);
                setSkTipe(item.tipe);
                setSkPdfUrl(item.pdfUrl || '');
                setSkLinkUrl(item.linkUrl || '');
                setSkIsFeatured(item.isFeatured === true);
              } else {
                setEditSkId(null);
                setSkJudul('');
                setSkKategori('SK CDC UMK');
                setSkTipe('pdf');
                setSkPdfUrl('');
                setSkLinkUrl('');
                setSkIsFeatured(false);
              }
              setShowSkForm(true);
            };

            const handleSkPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                  triggerToast('error', 'File harus berformat PDF (.pdf)');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  setSkPdfUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            };

            const handleSaveSk = (e: React.FormEvent) => {
              e.preventDefault();
              if (!skJudul.trim() || !skKategori.trim()) {
                triggerToast('error', 'Judul Dokumen dan Kategori wajib diisi.');
                return;
              }
              if (skTipe === 'pdf' && !skPdfUrl) {
                triggerToast('error', 'Harap unggah file PDF untuk dokumen ini.');
                return;
              }
              if (skTipe === 'link' && !skLinkUrl.trim()) {
                triggerToast('error', 'Harap masukkan Tautan Link URL.');
                return;
              }

              // If isFeatured is true, unset isFeatured on all existing items
              let currentList = getFromDB<SuratKeputusan>('surat_keputusan');
              if (skIsFeatured) {
                currentList = currentList.map((item) => ({ ...item, isFeatured: false }));
              }

              const existing = editSkId ? currentList.find((i) => i.id === editSkId) : null;
              const newItem: SuratKeputusan = {
                id: editSkId || `sk_${Date.now()}`,
                judul: skJudul.trim(),
                kategori: skKategori.trim(),
                tipe: skTipe,
                pdfUrl: skTipe === 'pdf' ? skPdfUrl : undefined,
                linkUrl: skTipe === 'link' ? skLinkUrl.trim() : undefined,
                isFeatured: skIsFeatured,
                createdAt: existing?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              if (editSkId) {
                const idx = currentList.findIndex((i) => i.id === editSkId);
                if (idx !== -1) currentList[idx] = newItem;
                else currentList.push(newItem);
              } else {
                currentList.unshift(newItem);
              }

              saveToDB('surat_keputusan', currentList);
              reloadAll();
              if (onReloadData) onReloadData();
              setShowSkForm(false);
              triggerToast('success', editSkId ? 'Surat Keputusan diperbarui.' : 'Surat Keputusan baru berhasil disimpan.');
            };

            const handleDeleteSk = (item: SuratKeputusan) => {
              if (confirm(`Hapus Surat Keputusan "${item.judul}"?`)) {
                deleteInDB('surat_keputusan', item.id);
                reloadAll();
                if (onReloadData) onReloadData();
                triggerToast('success', 'Dokumen berhasil dihapus.');
              }
            };

            const handleSetFeatured = (item: SuratKeputusan) => {
              const currentList = getFromDB<SuratKeputusan>('surat_keputusan').map((i) => ({
                ...i,
                isFeatured: i.id === item.id
              }));
              saveToDB('surat_keputusan', currentList);
              reloadAll();
              if (onReloadData) onReloadData();
              triggerToast('success', `"${item.judul}" diset sebagai Featured Preview utama.`);
            };

            return (
              <div className="space-y-6" id="adm-sk-cdc">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Kelola Surat Keputusan CDC</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Upload PDF (dengan preview scrollable) atau input tautan link eksternal.</p>
                  </div>
                  <button
                    onClick={() => openSkFormModal()}
                    className="bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Tambah SK CDC
                  </button>
                </div>

                {/* Form Modal / Panel */}
                {showSkForm && (
                  <form onSubmit={handleSaveSk} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-slate-800 text-lg">
                        {editSkId ? 'Edit Surat Keputusan' : 'Tambah Surat Keputusan Baru'}
                      </h3>
                      <button type="button" onClick={() => setShowSkForm(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Judul Dokumen / SK *</label>
                        <input
                          type="text"
                          value={skJudul}
                          onChange={(e) => setSkJudul(e.target.value)}
                          placeholder="misal: SK CDC UMK 2026 – 2027"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Kategori / Grup *</label>
                        <input
                          type="text"
                          value={skKategori}
                          onChange={(e) => setSkKategori(e.target.value)}
                          placeholder="misal: SK CDC UMK"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                          list="kategori-presets"
                        />
                        <datalist id="kategori-presets">
                          <option value="SK CDC UMK" />
                          <option value="SK PJK UMK 2017 & Perubahan Nama CDC" />
                          <option value="SK PJK UMK 2014" />
                        </datalist>
                      </div>
                    </div>

                    {/* Tipe Selector: PDF vs Link */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-slate-700 block">Tipe Dokumen & Unggahan *</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="skTipe"
                            value="pdf"
                            checked={skTipe === 'pdf'}
                            onChange={() => setSkTipe('pdf')}
                            className="text-[#F26522] focus:ring-[#F26522]"
                          />
                          Upload File PDF (Tampil Preview Scrollable)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="skTipe"
                            value="link"
                            checked={skTipe === 'link'}
                            onChange={() => setSkTipe('link')}
                            className="text-[#F26522] focus:ring-[#F26522]"
                          />
                          Input Link URL Eksternal
                        </label>
                      </div>
                    </div>

                    {/* Dynamic Field: File Upload PDF vs Link Input */}
                    {skTipe === 'pdf' ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Pilih File PDF (.pdf)</label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleSkPdfUpload}
                          className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F26522] file:text-white hover:file:bg-[#d95316] cursor-pointer"
                        />
                        {skPdfUrl && (
                          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 pt-1">
                            <Check className="w-4 h-4" /> File PDF berhasil diunggah / tersedia.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Tautan / URL Eksternal *</label>
                        <input
                          type="url"
                          value={skLinkUrl}
                          onChange={(e) => setSkLinkUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        />
                      </div>
                    )}

                    {/* Featured Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={skIsFeatured}
                          onChange={(e) => setSkIsFeatured(e.target.checked)}
                          className="rounded text-[#F26522] focus:ring-[#F26522]"
                        />
                        Jadikan Dokumen Utama (Tampil Pertama di Box Preview Scrollable Top)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="submit"
                        className="bg-[#F26522] hover:bg-[#d95316] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
                      >
                        Simpan SK CDC
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSkForm(false)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of SK Items */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-4">Judul Dokumen</div>
                    <div className="col-span-3">Kategori</div>
                    <div className="col-span-2">Tipe</div>
                    <div className="col-span-3 text-right">Aksi</div>
                  </div>

                  {skItems.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium">
                      Belum ada Surat Keputusan CDC yang diunggah.
                    </div>
                  ) : (
                    skItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-4 border-t border-slate-100 items-center hover:bg-slate-50/60 transition">
                        <div className="col-span-4 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                            {item.judul}
                            {item.isFeatured && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full shrink-0 uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 text-xs font-semibold text-slate-600 truncate">
                          {item.kategori}
                        </div>

                        <div className="col-span-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${item.tipe === 'pdf' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {item.tipe.toUpperCase()}
                          </span>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-2">
                          {!item.isFeatured && (
                            <button
                              onClick={() => handleSetFeatured(item)}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                              title="Set sebagai Featured Preview Utama"
                            >
                              Featured
                            </button>
                          )}
                          <button
                            onClick={() => openSkFormModal(item)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSk(item)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* ============== MANAJEMEN KALENDER KEGIATAN CDC ============== */}
          {activeTab === 'kalender' && (() => {
            const openKalFormModal = (item?: KalenderKegiatan) => {
              if (item) {
                setEditKalId(item.id);
                setKalJudul(item.judul);
                setKalKategori(item.kategori);
                setKalDisplayType(item.displayType || 'poster');
                setKalPosterUrl(item.posterUrl || '');
                setKalPdfUrl(item.pdfUrl || '');
                setKalLinkUrl(item.linkUrl || '');
                setKalIsFeatured(item.isFeatured === true);
              } else {
                setEditKalId(null);
                setKalJudul('');
                setKalKategori('Kalender Utama CDC');
                setKalDisplayType('poster');
                setKalPosterUrl('');
                setKalPdfUrl('');
                setKalLinkUrl('');
                setKalIsFeatured(false);
              }
              setShowKalForm(true);
            };

            const handleKalPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const dataUrl = await compressImageAdaptive(file);
                  setKalPosterUrl(dataUrl);
                } catch {
                  triggerToast('error', 'Gagal memproses file poster gambar.');
                }
              }
            };

            const handleKalPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                  triggerToast('error', 'File harus berformat PDF (.pdf)');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  setKalPdfUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            };

            const handleSaveKal = (e: React.FormEvent) => {
              e.preventDefault();
              if (!kalJudul.trim() || !kalKategori.trim()) {
                triggerToast('error', 'Judul Agenda dan Kategori wajib diisi.');
                return;
              }
              if (kalDisplayType === 'poster' && !kalPosterUrl.trim()) {
                triggerToast('error', 'Harap unggah atau masukkan URL Gambar Poster.');
                return;
              }
              if (kalDisplayType === 'pdf' && !kalPdfUrl) {
                triggerToast('error', 'Harap unggah file PDF untuk agenda ini.');
                return;
              }

              let currentList = getFromDB<KalenderKegiatan>('kalender_kegiatan');
              if (kalIsFeatured) {
                currentList = currentList.map((item) => ({ ...item, isFeatured: false }));
              }

              const existing = editKalId ? currentList.find((i) => i.id === editKalId) : null;
              const newItem: KalenderKegiatan = {
                id: editKalId || `kal_${Date.now()}`,
                judul: kalJudul.trim(),
                kategori: kalKategori.trim(),
                displayType: kalDisplayType,
                posterUrl: kalDisplayType === 'poster' ? kalPosterUrl : undefined,
                pdfUrl: kalDisplayType === 'pdf' ? kalPdfUrl : undefined,
                linkUrl: kalLinkUrl.trim() || undefined,
                isFeatured: kalIsFeatured,
                createdAt: existing?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              if (editKalId) {
                const idx = currentList.findIndex((i) => i.id === editKalId);
                if (idx !== -1) currentList[idx] = newItem;
                else currentList.push(newItem);
              } else {
                currentList.unshift(newItem);
              }

              saveToDB('kalender_kegiatan', currentList);
              reloadAll();
              if (onReloadData) onReloadData();
              setShowKalForm(false);
              triggerToast('success', editKalId ? 'Kalender Kegiatan diperbarui.' : 'Agenda Kalender Kegiatan baru berhasil disimpan.');
            };

            const handleDeleteKal = (item: KalenderKegiatan) => {
              if (confirm(`Hapus agenda Kalender Kegiatan "${item.judul}"?`)) {
                deleteInDB('kalender_kegiatan', item.id);
                reloadAll();
                if (onReloadData) onReloadData();
                triggerToast('success', 'Agenda berhasil dihapus.');
              }
            };

            const handleSetFeaturedKal = (item: KalenderKegiatan) => {
              const currentList = getFromDB<KalenderKegiatan>('kalender_kegiatan').map((i) => ({
                ...i,
                isFeatured: i.id === item.id
              }));
              saveToDB('kalender_kegiatan', currentList);
              reloadAll();
              if (onReloadData) onReloadData();
              triggerToast('success', `"${item.judul}" diset sebagai Featured Preview utama.`);
            };

            return (
              <div className="space-y-6" id="adm-kalender">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Kelola Kalender Kegiatan CDC</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Pilih tampilan: Upload Poster Gambar (JPG/PNG) atau Upload File PDF.</p>
                  </div>
                  <button
                    onClick={() => openKalFormModal()}
                    className="bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Tambah Agenda Kalender
                  </button>
                </div>

                {/* Form Modal / Panel */}
                {showKalForm && (
                  <form onSubmit={handleSaveKal} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-slate-800 text-lg">
                        {editKalId ? 'Edit Agenda Kalender Kegiatan' : 'Tambah Agenda Kalender Kegiatan Baru'}
                      </h3>
                      <button type="button" onClick={() => setShowKalForm(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Judul Agenda / Kegiatan *</label>
                        <input
                          type="text"
                          value={kalJudul}
                          onChange={(e) => setKalJudul(e.target.value)}
                          placeholder="misal: Kalender Kegiatan Akademik & Karir CDC UMK 2026"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Kategori / Klasifikasi *</label>
                        <input
                          type="text"
                          value={kalKategori}
                          onChange={(e) => setKalKategori(e.target.value)}
                          placeholder="misal: Kalender Utama CDC"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                          list="kategori-kalender-presets"
                        />
                        <datalist id="kategori-kalender-presets">
                          <option value="Kalender Utama CDC" />
                          <option value="Agenda Bursa Kerja" />
                          <option value="Pelatihan & Workshop" />
                        </datalist>
                      </div>
                    </div>

                    {/* 2 PILIHAN TAMPILAN ADMIN: POSTER GAMBAR VS PDF */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-slate-700 block">Pilihan Tampilan Utama di Web *</label>
                      <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
                          <input
                            type="radio"
                            name="kalDisplayType"
                            value="poster"
                            checked={kalDisplayType === 'poster'}
                            onChange={() => setKalDisplayType('poster')}
                            className="text-[#F26522] focus:ring-[#F26522]"
                          />
                          Mode 1: Tampilan Poster / Gambar (JPG / PNG)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
                          <input
                            type="radio"
                            name="kalDisplayType"
                            value="pdf"
                            checked={kalDisplayType === 'pdf'}
                            onChange={() => setKalDisplayType('pdf')}
                            className="text-[#F26522] focus:ring-[#F26522]"
                          />
                          Mode 2: Tampilan File PDF (Preview Scrollable)
                        </label>
                      </div>
                    </div>

                    {/* DYNAMIC FILE UPLOAD INPUT */}
                    {kalDisplayType === 'poster' ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Unggah Gambar Poster (JPG / PNG / WEBP)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleKalPosterUpload}
                          className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F26522] file:text-white hover:file:bg-[#d95316] cursor-pointer"
                        />
                        <div className="text-[11px] text-slate-400">Atau masukkan URL Gambar Poster:</div>
                        <input
                          type="url"
                          value={kalPosterUrl}
                          onChange={(e) => setKalPosterUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        {kalPosterUrl && (
                          <div className="mt-2 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                            <img src={kalPosterUrl} alt="Preview" className="h-16 w-24 object-cover rounded-md" />
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4" /> Poster Gambar Siap Ditampilkan
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Unggah File PDF (.pdf)</label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleKalPdfUpload}
                          className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F26522] file:text-white hover:file:bg-[#d95316] cursor-pointer"
                        />
                        {kalPdfUrl && (
                          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 pt-1">
                            <Check className="w-4 h-4" /> File PDF berhasil diunggah / tersedia.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Featured Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={kalIsFeatured}
                          onChange={(e) => setKalIsFeatured(e.target.checked)}
                          className="rounded text-[#F26522] focus:ring-[#F26522]"
                        />
                        Jadikan Agenda Utama (Tampil Pertama di Viewer Halaman Kalender)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="submit"
                        className="bg-[#F26522] hover:bg-[#d95316] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
                      >
                        Simpan Agenda Kalender
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowKalForm(false)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of Kalender Items */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-4">Judul Agenda</div>
                    <div className="col-span-3">Kategori</div>
                    <div className="col-span-2">Mode Tampilan</div>
                    <div className="col-span-3 text-right">Aksi</div>
                  </div>

                  {kalItems.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium">
                      Belum ada Kalender Kegiatan yang diunggah.
                    </div>
                  ) : (
                    kalItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-4 border-t border-slate-100 items-center hover:bg-slate-50/60 transition">
                        <div className="col-span-4 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                            {item.judul}
                            {item.isFeatured && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full shrink-0 uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 text-xs font-semibold text-slate-600 truncate">
                          {item.kategori}
                        </div>

                        <div className="col-span-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${item.displayType === 'poster' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {item.displayType === 'poster' ? 'POSTER' : 'PDF'}
                          </span>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-2">
                          {!item.isFeatured && (
                            <button
                              onClick={() => handleSetFeaturedKal(item)}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                              title="Set sebagai Featured Preview Utama"
                            >
                              Featured
                            </button>
                          )}
                          <button
                            onClick={() => openKalFormModal(item)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKal(item)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* ============== MANAJEMEN LAPORAN KINERJA & TRACER STUDY ============== */}
          {activeTab === 'laporan' && (() => {
            const openLapFormModal = (item?: LaporanKinerja) => {
              if (item) {
                setEditLapId(item.id);
                setLapJudul(item.judul);
                setLapKategori(item.kategori);
                setLapTipe(item.tipe);
                setLapPdfUrl(item.pdfUrl || '');
                setLapLinkUrl(item.linkUrl || '');
                setLapIsFeatured(item.isFeatured === true);
              } else {
                setEditLapId(null);
                setLapJudul('');
                setLapKategori('Laporan Kinerja CDC');
                setLapTipe('pdf');
                setLapPdfUrl('');
                setLapLinkUrl('');
                setLapIsFeatured(false);
              }
              setShowLapForm(true);
            };

            const handleLapPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                  triggerToast('error', 'File harus berformat PDF (.pdf)');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  setLapPdfUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            };

            const handleSaveLap = (e: React.FormEvent) => {
              e.preventDefault();
              if (!lapJudul.trim() || !lapKategori.trim()) {
                triggerToast('error', 'Judul Laporan dan Kategori wajib diisi.');
                return;
              }
              if (lapTipe === 'pdf' && !lapPdfUrl) {
                triggerToast('error', 'Harap unggah file PDF Laporan.');
                return;
              }
              if (lapTipe === 'link' && !lapLinkUrl.trim()) {
                triggerToast('error', 'Harap masukkan Tautan Link URL Laporan.');
                return;
              }

              let currentList = getFromDB<LaporanKinerja>('laporan_kinerja');
              if (lapIsFeatured) {
                currentList = currentList.map((item) => ({ ...item, isFeatured: false }));
              }

              const existing = editLapId ? currentList.find((i) => i.id === editLapId) : null;
              const newItem: LaporanKinerja = {
                id: editLapId || `lap_${Date.now()}`,
                judul: lapJudul.trim(),
                kategori: lapKategori.trim(),
                tipe: lapTipe,
                pdfUrl: lapTipe === 'pdf' ? lapPdfUrl : undefined,
                linkUrl: lapTipe === 'link' ? lapLinkUrl.trim() : undefined,
                isFeatured: lapIsFeatured,
                createdAt: existing?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              if (editLapId) {
                const idx = currentList.findIndex((i) => i.id === editLapId);
                if (idx !== -1) currentList[idx] = newItem;
                else currentList.push(newItem);
              } else {
                currentList.unshift(newItem);
              }

              saveToDB('laporan_kinerja', currentList);
              reloadAll();
              if (onReloadData) onReloadData();
              setShowLapForm(false);
              triggerToast('success', editLapId ? 'Laporan Kinerja diperbarui.' : 'Laporan Kinerja baru berhasil disimpan.');
            };

            const handleDeleteLap = (item: LaporanKinerja) => {
              if (confirm(`Hapus dokumen Laporan Kinerja "${item.judul}"?`)) {
                deleteInDB('laporan_kinerja', item.id);
                reloadAll();
                if (onReloadData) onReloadData();
                triggerToast('success', 'Dokumen laporan berhasil dihapus.');
              }
            };

            const handleSetFeaturedLap = (item: LaporanKinerja) => {
              const currentList = getFromDB<LaporanKinerja>('laporan_kinerja').map((i) => ({
                ...i,
                isFeatured: i.id === item.id
              }));
              saveToDB('laporan_kinerja', currentList);
              reloadAll();
              if (onReloadData) onReloadData();
              triggerToast('success', `"${item.judul}" diset sebagai Featured Preview utama.`);
            };

            return (
              <div className="space-y-6" id="adm-laporan">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Kelola Laporan Kinerja &amp; Tracer Study</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola dokumen Laporan Kinerja CDC &amp; Laporan Tracer Study Universitas Muhammadiyah Kendari.</p>
                  </div>
                  <button
                    onClick={() => openLapFormModal()}
                    className="bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Tambah Laporan Kinerja
                  </button>
                </div>

                {/* Form Modal / Panel */}
                {showLapForm && (
                  <form onSubmit={handleSaveLap} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-slate-800 text-lg">
                        {editLapId ? 'Edit Laporan Kinerja / Tracer Study' : 'Tambah Laporan Kinerja Baru'}
                      </h3>
                      <button type="button" onClick={() => setShowLapForm(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Judul Dokumen Laporan *</label>
                        <input
                          type="text"
                          value={lapJudul}
                          onChange={(e) => setLapJudul(e.target.value)}
                          placeholder="misal: Laporan Kinerja CDC UM Kendari Tahun 2025"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Kategori / Klasifikasi *</label>
                        <input
                          type="text"
                          value={lapKategori}
                          onChange={(e) => setLapKategori(e.target.value)}
                          placeholder="misal: Laporan Kinerja CDC"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                          list="kategori-laporan-presets"
                        />
                        <datalist id="kategori-laporan-presets">
                          <option value="Laporan Kinerja CDC" />
                          <option value="Laporan Tracer Study" />
                        </datalist>
                      </div>
                    </div>

                    {/* Radio Tipe Input (PDF / Link) */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-slate-700 block">Tipe Dokumen Laporan *</label>
                      <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
                          <input
                            type="radio"
                            name="lapTipe"
                            value="pdf"
                            checked={lapTipe === 'pdf'}
                            onChange={() => setLapTipe('pdf')}
                            className="text-[#F26522] focus:ring-[#F26522]"
                          />
                          Upload File PDF (Tampil Preview Scrollable)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
                          <input
                            type="radio"
                            name="lapTipe"
                            value="link"
                            checked={lapTipe === 'link'}
                            onChange={() => setLapTipe('link')}
                            className="text-[#F26522] focus:ring-[#F26522]"
                          />
                          Tautan Link URL Eksternal
                        </label>
                      </div>
                    </div>

                    {/* Dynamic Inputs based on tipe */}
                    {lapTipe === 'pdf' ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Unggah File PDF Laporan (.pdf)</label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleLapPdfUpload}
                          className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F26522] file:text-white hover:file:bg-[#d95316] cursor-pointer"
                        />
                        {lapPdfUrl && (
                          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 pt-1">
                            <Check className="w-4 h-4" /> File PDF Laporan berhasil diunggah / tersedia.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Tautan Link URL Eksternal *</label>
                        <input
                          type="url"
                          value={lapLinkUrl}
                          onChange={(e) => setLapLinkUrl(e.target.value)}
                          placeholder="https://drive.google.com/... atau https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        />
                      </div>
                    )}

                    {/* Featured Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={lapIsFeatured}
                          onChange={(e) => setLapIsFeatured(e.target.checked)}
                          className="rounded text-[#F26522] focus:ring-[#F26522]"
                        />
                        Jadikan Dokumen Utama (Tampil Pertama di Viewer Halaman Laporan Kinerja)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="submit"
                        className="bg-[#F26522] hover:bg-[#d95316] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
                      >
                        Simpan Dokumen Laporan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLapForm(false)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of Laporan Items */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-5">Judul Dokumen Laporan</div>
                    <div className="col-span-3">Kategori</div>
                    <div className="col-span-1">Tipe</div>
                    <div className="col-span-3 text-right">Aksi</div>
                  </div>

                  {lapItems.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium">
                      Belum ada dokumen Laporan Kinerja yang diunggah.
                    </div>
                  ) : (
                    lapItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-4 border-t border-slate-100 items-center hover:bg-slate-50/60 transition">
                        <div className="col-span-5 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                            {item.judul}
                            {item.isFeatured && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full shrink-0 uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 text-xs font-semibold text-slate-600 truncate">
                          {item.kategori}
                        </div>

                        <div className="col-span-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.tipe === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.tipe}
                          </span>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-2">
                          {!item.isFeatured && (
                            <button
                              onClick={() => handleSetFeaturedLap(item)}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                              title="Set sebagai Featured Preview Utama"
                            >
                              Featured
                            </button>
                          )}
                          <button
                            onClick={() => openLapFormModal(item)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLap(item)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* =========================================================
           *  TAB: KELOLA MOU STAKEHOLDER
           * =======================================================*/}
          {activeTab === 'mou' && (() => {
            const openMouFormModal = (item?: MouStakeholder) => {
              if (item) {
                setEditMouId(item.id);
                setMouJudul(item.judul);
                setMouKategori(item.kategori);
                setMouDisplayType(item.displayType || 'poster');
                setMouPosterUrl(item.posterUrl || '');
                setMouPdfUrl(item.pdfUrl || '');
                setMouLinkUrl(item.linkUrl || '');
                setMouIsFeatured(!!item.isFeatured);
              } else {
                setEditMouId(null);
                setMouJudul('');
                setMouKategori('MOU Perusahaan BUMN & Swasta');
                setMouDisplayType('poster');
                setMouPosterUrl('');
                setMouPdfUrl('');
                setMouLinkUrl('');
                setMouIsFeatured(false);
              }
              setShowMouForm(true);
            };

            const handleSaveMou = (e: React.FormEvent) => {
              e.preventDefault();
              if (!mouJudul.trim()) {
                triggerToast('error', 'Judul MOU wajib diisi!');
                return;
              }

              let currentList = getFromDB<MouStakeholder>('mou_stakeholder');

              if (mouIsFeatured) {
                currentList = currentList.map((i) => ({ ...i, isFeatured: false }));
              }

              if (editMouId) {
                const updatedItem: MouStakeholder = {
                  id: editMouId,
                  judul: mouJudul.trim(),
                  kategori: mouKategori.trim(),
                  displayType: mouDisplayType,
                  posterUrl: mouPosterUrl.trim() || undefined,
                  pdfUrl: mouPdfUrl.trim() || undefined,
                  linkUrl: mouLinkUrl.trim() || undefined,
                  isFeatured: mouIsFeatured,
                  createdAt: new Date().toISOString()
                };
                currentList = currentList.map((i) => (i.id === editMouId ? updatedItem : i));
                triggerToast('success', 'Dokumen MOU berhasil diperbarui!');
              } else {
                const newItem: MouStakeholder = {
                  id: `mou_${Date.now()}`,
                  judul: mouJudul.trim(),
                  kategori: mouKategori.trim(),
                  displayType: mouDisplayType,
                  posterUrl: mouPosterUrl.trim() || undefined,
                  pdfUrl: mouPdfUrl.trim() || undefined,
                  linkUrl: mouLinkUrl.trim() || undefined,
                  isFeatured: mouIsFeatured,
                  createdAt: new Date().toISOString()
                };
                currentList.unshift(newItem);
                triggerToast('success', 'Dokumen MOU baru berhasil ditambahkan!');
              }

              saveToDB('mou_stakeholder', currentList);
              setMouItems(currentList);
              setShowMouForm(false);
            };

            const handleDeleteMou = (item: MouStakeholder) => {
              if (window.confirm(`Hapus dokumen MOU "${item.judul}"?`)) {
                deleteInDB('mou_stakeholder', item.id);
                setMouItems(getFromDB<MouStakeholder>('mou_stakeholder'));
                triggerToast('success', 'Dokumen MOU berhasil dihapus!');
              }
            };

            const handleSetFeaturedMou = (item: MouStakeholder) => {
              const currentList = getFromDB<MouStakeholder>('mou_stakeholder').map((i) => ({
                ...i,
                isFeatured: i.id === item.id
              }));
              saveToDB('mou_stakeholder', currentList);
              setMouItems(currentList);
              triggerToast('success', `"${item.judul}" dijadikan tampilan featured utama!`);
            };

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Kelola MOU Dengan Stakeholder</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Unggah dokumen MOU & Nota Kesepahaman UMK dengan perusahaan mitra, instansi pemerintah, dan perguruan tinggi.
                    </p>
                  </div>
                  <button
                    onClick={() => openMouFormModal()}
                    className="flex items-center gap-2 bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Tambah MOU Stakeholder
                  </button>
                </div>

                {/* Form Input / Edit Modal Container */}
                {showMouForm && (
                  <form onSubmit={handleSaveMou} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 animate-fade-in">
                    <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
                      {editMouId ? 'Edit Dokumen MOU Stakeholder' : 'Tambah Dokumen MOU Stakeholder Baru'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Judul MOU / Perjanjian *</label>
                        <input
                          type="text"
                          required
                          value={mouJudul}
                          onChange={(e) => setMouJudul(e.target.value)}
                          placeholder="Misal: MOU Kerjasama Industri & Rekrutmen UMK dengan PT Pertamina"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Stakeholder *</label>
                        <select
                          value={mouKategori}
                          onChange={(e) => setMouKategori(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                        >
                          <option value="MOU Perusahaan BUMN & Swasta">MOU Perusahaan BUMN & Swasta</option>
                          <option value="MOU Instansi Pemerintah">MOU Instansi Pemerintah</option>
                          <option value="MOU Perguruan Tinggi & Akademi">MOU Perguruan Tinggi & Akademi</option>
                          <option value="MOU Organisasi & Yayasan">MOU Organisasi & Yayasan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan Mode Tampilan Halaman *</label>
                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                            <input
                              type="radio"
                              name="mouDisplayType"
                              value="poster"
                              checked={mouDisplayType === 'poster'}
                              onChange={() => setMouDisplayType('poster')}
                              className="text-[#F26522] focus:ring-[#F26522]"
                            />
                            Upload Poster / Gambar (JPG/PNG)
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                            <input
                              type="radio"
                              name="mouDisplayType"
                              value="pdf"
                              checked={mouDisplayType === 'pdf'}
                              onChange={() => setMouDisplayType('pdf')}
                              className="text-[#F26522] focus:ring-[#F26522]"
                            />
                            Upload File PDF (Preview Scrollable)
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Conditional Input based on displayType */}
                    {mouDisplayType === 'poster' ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Upload Poster / File Gambar MOU *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setMouPosterUrl(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F26522] file:text-white hover:file:bg-[#d95316] cursor-pointer"
                        />
                        {mouPosterUrl && (
                          <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Poster Gambar berhasil dipilih!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Upload File PDF MOU *</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setMouPdfUrl(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F26522] file:text-white hover:file:bg-[#d95316] cursor-pointer"
                        />
                        {mouPdfUrl && (
                          <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Berkas PDF berhasil diunggah!
                          </div>
                        )}
                      </div>
                    )}

                    {/* Featured Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={mouIsFeatured}
                          onChange={(e) => setMouIsFeatured(e.target.checked)}
                          className="rounded text-[#F26522] focus:ring-[#F26522]"
                        />
                        Jadikan Dokumen Utama (Tampil Pertama di Viewer Halaman MOU Stakeholder)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="submit"
                        className="bg-[#F26522] hover:bg-[#d95316] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
                      >
                        Simpan Dokumen MOU
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMouForm(false)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of MOU Items */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-5">Judul Dokumen MOU</div>
                    <div className="col-span-3">Kategori</div>
                    <div className="col-span-1">Mode Tampilan</div>
                    <div className="col-span-3 text-right">Aksi</div>
                  </div>

                  {mouItems.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium">
                      Belum ada dokumen MOU Dengan Stakeholder yang diunggah.
                    </div>
                  ) : (
                    mouItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-4 border-t border-slate-100 items-center hover:bg-slate-50/60 transition">
                        <div className="col-span-5 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                            {item.judul}
                            {item.isFeatured && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full shrink-0 uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 text-xs font-semibold text-slate-600 truncate">
                          {item.kategori}
                        </div>

                        <div className="col-span-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.displayType === 'poster' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {item.displayType === 'poster' ? 'Poster' : 'PDF'}
                          </span>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-2">
                          {!item.isFeatured && (
                            <button
                              onClick={() => handleSetFeaturedMou(item)}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                              title="Set sebagai Featured Preview Utama"
                            >
                              Featured
                            </button>
                          )}
                          <button
                            onClick={() => openMouFormModal(item)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMou(item)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* ============== MANAJEMEN GALERI KEGIATAN ============== */}
          {activeTab === 'galeri' && (() => {
            const openGalFormModal = (item?: GaleriItem) => {
              if (item) {
                setEditGalId(item.id);
                setGalJudul(item.judul);
                setGalSection(item.kategoriSection || 'Kegiatan Terkini 2026');
                setGalTipeMedia(item.tipeMedia || 'youtube');
                setGalYoutubeUrl(item.youtubeUrl || '');
                setGalPosterUrl(item.posterUrl || '');
                setGalPdfUrl(item.pdfUrl || '');
                setGalLinkUrl(item.linkUrl || '');
                setGalDeskripsi(item.deskripsi || '');
                setGalIsFeatured(!!item.isFeatured);
              } else {
                setEditGalId(null);
                setGalJudul('');
                setGalSection('Kegiatan Terkini 2026');
                setGalTipeMedia('youtube');
                setGalYoutubeUrl('');
                setGalPosterUrl('');
                setGalPdfUrl('');
                setGalLinkUrl('');
                setGalDeskripsi('');
                setGalIsFeatured(false);
              }
              setShowGalForm(true);
            };

            const handleSaveGaleri = (e: React.FormEvent) => {
              e.preventDefault();
              if (!galJudul.trim()) {
                triggerToast('error', 'Judul galeri kegiatan wajib diisi.');
                return;
              }

              const newItem: GaleriItem = {
                id: editGalId || `gal_${Date.now()}`,
                judul: galJudul.trim(),
                kategoriSection: galSection.trim() || 'Kegiatan Terkini 2026',
                tipeMedia: galTipeMedia,
                youtubeUrl: galYoutubeUrl.trim() || undefined,
                posterUrl: galPosterUrl || undefined,
                pdfUrl: galPdfUrl || undefined,
                linkUrl: galLinkUrl.trim() || undefined,
                deskripsi: galDeskripsi.trim() || undefined,
                isFeatured: galIsFeatured,
                createdAt: editGalId ? (galeriItems.find((g) => g.id === editGalId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              if (editGalId) {
                updateInDB<GaleriItem>('galeri_items', newItem);
                triggerToast('success', 'Galeri Kegiatan berhasil diperbarui!');
              } else {
                insertToDB<GaleriItem>('galeri_items', newItem);
                triggerToast('success', 'Galeri Kegiatan baru berhasil ditambahkan!');
              }

              setShowGalForm(false);
              reloadAll();
              if (onReloadData) onReloadData();
            };

            const handleDeleteGaleri = (item: GaleriItem) => {
              if (confirm(`Apakah Anda yakin ingin menghapus "${item.judul}"?`)) {
                deleteInDB('galeri_items', item.id);
                triggerToast('success', 'Item galeri kegiatan berhasil dihapus.');
                reloadAll();
                if (onReloadData) onReloadData();
              }
            };

            return (
              <div className="space-y-6" id="adm-galeri">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                      <Film className="w-6 h-6 text-[#F26522]" />
                      Kelola Galeri Kegiatan CDC
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Atur postingan galeri kegiatan publik dengan 3 pilihan tampilan media: Video Youtube, Poster Gambar, dan File PDF / Tautan Dokumen.
                    </p>
                  </div>

                  <button
                    onClick={() => openGalFormModal()}
                    className="bg-[#F26522] hover:bg-[#d95316] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Tambah Galeri Kegiatan
                  </button>
                </div>

                {/* Form Modal / Inline Form */}
                {showGalForm && (
                  <form onSubmit={handleSaveGaleri} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      {editGalId ? 'Edit Galeri Kegiatan' : 'Tambah Galeri Kegiatan Baru'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Judul */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Judul Kegiatan *</label>
                        <input
                          type="text"
                          value={galJudul}
                          onChange={(e) => setGalJudul(e.target.value)}
                          placeholder="misal: Bimbingan Karir Alumni 2025"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                          required
                        />
                      </div>

                      {/* Kategori Seksi */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Seksi / Kelompok Kegiatan *</label>
                        <input
                          type="text"
                          value={galSection}
                          onChange={(e) => setGalSection(e.target.value)}
                          placeholder="misal: Kegiatan Terkini 2026, Galeri 2025, Majalah Alumni"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                          required
                        />
                      </div>

                      {/* Tipe Media Radio */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Tipe Media Tampilan *</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                          {(['youtube', 'poster', 'pdf'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setGalTipeMedia(t)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold capitalize transition ${galTipeMedia === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              {t === 'youtube' ? 'Video Youtube' : t === 'poster' ? 'Poster Gambar' : 'Dokumen PDF'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Media Input */}
                      {galTipeMedia === 'youtube' && (
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700">URL Link Youtube *</label>
                          <input
                            type="url"
                            value={galYoutubeUrl}
                            onChange={(e) => setGalYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                          />
                        </div>
                      )}

                      {galTipeMedia === 'poster' && (
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Upload Poster / Gambar Flyer</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const url = await compressImageAdaptive(f);
                                setGalPosterUrl(url);
                              }
                            }}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 cursor-pointer"
                          />
                          {galPosterUrl && (
                            <img src={galPosterUrl} alt="Preview Poster" className="w-24 h-24 object-cover rounded-xl border border-slate-200 mt-2" />
                          )}
                        </div>
                      )}

                      {galTipeMedia === 'pdf' && (
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Upload File PDF Dokumen</label>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const url = await readFileAsDataUrl(f);
                                setGalPdfUrl(url);
                              }
                            }}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-800 cursor-pointer"
                          />
                          {galPdfUrl && (
                            <span className="text-xs font-bold text-emerald-600 block mt-1">File PDF Siap Diunggah</span>
                          )}
                        </div>
                      )}

                      {/* Link External Optional */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Tautan Opsional ("Cek di SINI")</label>
                        <input
                          type="url"
                          value={galLinkUrl}
                          onChange={(e) => setGalLinkUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      {/* Deskripsi */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
                        <textarea
                          rows={2}
                          value={galDeskripsi}
                          onChange={(e) => setGalDeskripsi(e.target.value)}
                          placeholder="Keterangan singkat tentang kegiatan galeri..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-[#F26522] hover:bg-[#d95316] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition"
                      >
                        Simpan Galeri Kegiatan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGalForm(false)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of Galeri Items */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-5">Judul Galeri Kegiatan</div>
                    <div className="col-span-3">Seksi / Kelompok</div>
                    <div className="col-span-2">Tipe Media</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>

                  {galeriItems.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium">
                      Belum ada galeri kegiatan yang diunggah.
                    </div>
                  ) : (
                    galeriItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-4 border-t border-slate-100 items-center hover:bg-slate-50/60 transition">
                        <div className="col-span-5 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                            {item.judul}
                          </div>
                        </div>

                        <div className="col-span-3 text-xs font-semibold text-slate-600 truncate">
                          {item.kategoriSection}
                        </div>

                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.tipeMedia === 'youtube' ? 'bg-red-100 text-red-700' :
                              item.tipeMedia === 'poster' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {item.tipeMedia === 'youtube' ? 'Youtube' : item.tipeMedia === 'poster' ? 'Poster' : 'PDF'}
                          </span>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => openGalFormModal(item)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGaleri(item)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════
              KELOLA KONSELING KARIR
          ══════════════════════════════════════════ */}
          {activeTab === 'konseling' && (() => {
            const handleSaveGeneralConfig = () => {
              const updated: KonselingConfig = {
                ...konselingCfg,
                title: kTitle,
                subtitle: kSubtitle,
                posterUrl: kPosterUrl,
                narasiWa: kNarasiWa,
                adminWaNumber: kAdminWaNum,
                adminWaDefaultMessage: kAdminWaMsg,
                published: kPublished
              };
              saveKonselingConfig(updated);
              setKonselingCfg(updated);
              triggerToast('success', `Pengaturan Konseling Karir berhasil disimpan! (${kPublished ? 'Published' : 'Draft'})`);
            };

            const handleSaveInfoItem = (e: React.FormEvent) => {
              e.preventDefault();
              if (!infoJudul.trim()) {
                triggerToast('error', 'Judul penjelasan wajib diisi.');
                return;
              }

              let updatedItems = [...(konselingCfg.infoItems || [])];
              if (editInfoId) {
                updatedItems = updatedItems.map((item) =>
                  item.id === editInfoId
                    ? { ...item, judul: infoJudul, deskripsi: infoDeskripsi, linkUrl: infoLinkUrl, linkLabel: infoLinkLabel }
                    : item
                );
              } else {
                const newItem: KonselingInfoItem = {
                  id: `info_${Date.now()}`,
                  judul: infoJudul,
                  deskripsi: infoDeskripsi,
                  linkUrl: infoLinkUrl,
                  linkLabel: infoLinkLabel
                };
                updatedItems.push(newItem);
              }

              const updatedConfig = { ...konselingCfg, infoItems: updatedItems };
              saveKonselingConfig(updatedConfig);
              setKonselingCfg(updatedConfig);
              setShowInfoModal(false);
              triggerToast('success', editInfoId ? 'Penjelasan topik berhasil diperbarui.' : 'Penjelasan topik baru ditambahkan.');
            };

            const handleDeleteInfoItem = (id: string) => {
              if (confirm('Hapus item penjelasan topik ini?')) {
                const updatedItems = (konselingCfg.infoItems || []).filter((item) => item.id !== id);
                const updatedConfig = { ...konselingCfg, infoItems: updatedItems };
                saveKonselingConfig(updatedConfig);
                setKonselingCfg(updatedConfig);
                triggerToast('success', 'Penjelasan topik telah dihapus.');
              }
            };

            const openAddInfoModal = () => {
              setEditInfoId(null);
              setInfoJudul('');
              setInfoDeskripsi('');
              setInfoLinkUrl('');
              setInfoLinkLabel('');
              setShowInfoModal(true);
            };

            const openEditInfoModal = (item: KonselingInfoItem) => {
              setEditInfoId(item.id);
              setInfoJudul(item.judul);
              setInfoDeskripsi(item.deskripsi);
              setInfoLinkUrl(item.linkUrl || '');
              setInfoLinkLabel(item.linkLabel || '');
              setShowInfoModal(true);
            };

            const handleSaveJadwalItem = (e: React.FormEvent) => {
              e.preventDefault();
              if (!jdwHari.trim() || !jdwJam.trim()) {
                triggerToast('error', 'Hari dan Jam wajib diisi.');
                return;
              }

              let updatedItems = [...(konselingCfg.jadwalItems || [])];
              if (editJadwalId) {
                updatedItems = updatedItems.map((item) =>
                  item.id === editJadwalId
                    ? { ...item, hari: jdwHari, jam: jdwJam, lokasi: jdwLokasi, kuotaPerHari: jdwKuota, status: jdwStatus }
                    : item
                );
              } else {
                const newItem: KonselingJadwalItem = {
                  id: `jdw_${Date.now()}`,
                  hari: jdwHari,
                  jam: jdwJam,
                  lokasi: jdwLokasi,
                  kuotaPerHari: jdwKuota,
                  status: jdwStatus
                };
                updatedItems.push(newItem);
              }

              const updatedConfig = { ...konselingCfg, jadwalItems: updatedItems };
              saveKonselingConfig(updatedConfig);
              setKonselingCfg(updatedConfig);
              setShowJadwalModal(false);
              triggerToast('success', editJadwalId ? 'Jadwal konseling berhasil diperbarui.' : 'Jadwal konseling baru ditambahkan.');
            };

            const handleDeleteJadwalItem = (id: string) => {
              if (confirm('Hapus entri jadwal konseling ini?')) {
                const updatedItems = (konselingCfg.jadwalItems || []).filter((item) => item.id !== id);
                const updatedConfig = { ...konselingCfg, jadwalItems: updatedItems };
                saveKonselingConfig(updatedConfig);
                setKonselingCfg(updatedConfig);
                triggerToast('success', 'Jadwal konseling telah dihapus.');
              }
            };

            const openAddJadwalModal = () => {
              setEditJadwalId(null);
              setJdwHari('');
              setJdwJam('');
              setJdwLokasi('');
              setJdwKuota('');
              setJdwStatus('buka');
              setShowJadwalModal(true);
            };

            const openEditJadwalModal = (item: KonselingJadwalItem) => {
              setEditJadwalId(item.id);
              setJdwHari(item.hari);
              setJdwJam(item.jam);
              setJdwLokasi(item.lokasi);
              setJdwKuota(item.kuotaPerHari || '');
              setJdwStatus(item.status);
              setShowJadwalModal(true);
            };

            const handlePosterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const compressed = await compressImageAdaptive(file);
                setKPosterUrl(compressed);
                triggerToast('success', 'Gambar poster berhasil diunggah & dikompres!');
              } catch (err: any) {
                triggerToast('error', 'Gagal memuat gambar poster.');
              }
            };

            return (
              <div className="space-y-8">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-emerald-600" />
                      Kelola Layanan Konseling Karir
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Atur poster template, penjelasan topik, jadwal operasional, dan tautan WhatsApp Admin CDC
                    </p>
                  </div>

                  <button
                    onClick={handleSaveGeneralConfig}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#000066] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md transition"
                  >
                    <Save className="w-4 h-4" /> Simpan Semua Pengaturan
                  </button>
                </div>

                {/* Status publikasi (Draft / Published) — seragam dgn Konten Karir */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" /> Status Publikasi Konseling Karir
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tentukan apakah halaman Konseling Karir tampil di publik (Published) atau disimpan sebagai Draft.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${!kPublished ? 'text-amber-600' : 'text-slate-400'}`}>Draft</span>
                    <button
                      type="button"
                      onClick={() => setKPublished((v) => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${kPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${kPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <span className={`text-xs font-bold ${kPublished ? 'text-emerald-600' : 'text-slate-400'}`}>Published</span>
                  </div>
                </div>

                {/* 1. POSTER TEMPLATE & BANNER TITLE */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600" /> 1. Poster Template & Banner Utama
                    </h3>
                    <p className="text-xs text-slate-500">Atur gambar poster template yang akan ditampilkan di halaman Konseling Karir</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Input fields */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Judul Banner Utama</label>
                        <input
                          type="text"
                          value={kTitle}
                          onChange={(e) => setKTitle(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                          placeholder="Layanan Konseling Karir UPT CDC UM Kendari"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul / Deskripsi Banner</label>
                        <textarea
                          rows={2}
                          value={kSubtitle}
                          onChange={(e) => setKSubtitle(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          placeholder="Sesi konsultasi karir personal & pendampingan profesional..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Unggah Gambar Poster (Berkas / URL)</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePosterFileChange}
                            className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={kPosterUrl}
                          onChange={(e) => setKPosterUrl(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          placeholder="Atau masukkan URL Gambar Poster (https://...)"
                        />
                      </div>
                    </div>

                    {/* Right: Poster Preview */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Pratinjau Poster</label>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 min-h-[180px] max-h-[220px] flex items-center justify-center p-2">
                        {kPosterUrl ? (
                          <img src={kPosterUrl} alt="Poster Pratinjau" className="max-h-[200px] w-auto object-contain rounded-lg" />
                        ) : (
                          <span className="text-xs text-slate-400">Belum ada gambar poster</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KELOLA PENJELASAN & TOPIK KONSELING */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Info className="w-4 h-4 text-emerald-600" /> 2. Penjelasan & Topik Konseling (Dynamic List)
                      </h3>
                      <p className="text-xs text-slate-500">Tambah, edit, atau hapus penjelasan topik layanan yang tersedia untuk mahasiswa</p>
                    </div>
                    <button
                      onClick={openAddInfoModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" /> Tambah Penjelasan Topik
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {(!konselingCfg.infoItems || konselingCfg.infoItems.length === 0) ? (
                      <div className="p-8 text-center text-xs text-slate-400 font-medium">
                        Belum ada topik penjelasan yang dibuat. Klik tombol di atas untuk menambah.
                      </div>
                    ) : (
                      konselingCfg.infoItems.map((item, idx) => (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F26522] font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 truncate">{item.judul}</h4>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 pl-7">{item.deskripsi}</p>
                            {item.linkUrl && (
                              <p className="text-[11px] text-[#F26522] font-semibold pl-7 flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> {item.linkLabel || item.linkUrl}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => openEditInfoModal(item)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Penjelasan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInfoItem(item.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Penjelasan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. KELOLA JADWAL KONSELING */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" /> 3. Jadwal Operasional Konseling Karir
                      </h3>
                      <p className="text-xs text-slate-500">Atur hari, jam, lokasi, dan status kuota layanan konseling</p>
                    </div>
                    <button
                      onClick={openAddJadwalModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" /> Tambah Entri Jadwal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(!konselingCfg.jadwalItems || konselingCfg.jadwalItems.length === 0) ? (
                      <div className="col-span-2 p-8 text-center text-xs text-slate-400 font-medium border border-slate-200 rounded-xl">
                        Belum ada jadwal operasional. Klik "+ Tambah Entri Jadwal".
                      </div>
                    ) : (
                      konselingCfg.jadwalItems.map((jdw) => (
                        <div key={jdw.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">{jdw.hari}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${jdw.status === 'buka' ? 'bg-emerald-100 text-emerald-700' : jdw.status === 'penuh' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                {jdw.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600"><strong>Jam:</strong> {jdw.jam}</p>
                            <p className="text-xs text-slate-600"><strong>Lokasi:</strong> {jdw.lokasi}</p>
                            {jdw.kuotaPerHari && <p className="text-xs text-slate-600"><strong>Kuota:</strong> {jdw.kuotaPerHari}</p>}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                            <button
                              onClick={() => openEditJadwalModal(jdw)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                              title="Edit Jadwal"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJadwalItem(jdw.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition"
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. PENGATURAN WA ADMIN & NARASI */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" /> 4. Pengaturan Kontak WhatsApp Admin & Narasi
                    </h3>
                    <p className="text-xs text-slate-500">Tentukan teks narasi ajakan serta nomor WA tujuan pendaftaran konseling</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Teks Narasi Hubungi Admin</label>
                      <textarea
                        rows={2}
                        value={kNarasiWa}
                        onChange={(e) => setKNarasiWa(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ingin menjadwalkan sesi konseling karir? Silakan hubungi Admin..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Admin (mis. 6285299887766)</label>
                        <input
                          type="text"
                          value={kAdminWaNum}
                          onChange={(e) => setKAdminWaNum(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                          placeholder="6285299887766"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Template Pesan Pembuka WA</label>
                        <input
                          type="text"
                          value={kAdminWaMsg}
                          onChange={(e) => setKAdminWaMsg(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          placeholder="Halo Admin CDC UM Kendari, saya ingin berkonsultasi..."
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleSaveGeneralConfig}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                      >
                        <Save className="w-4 h-4" /> Simpan Kontak & Narasi WA
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MODAL ADD / EDIT INFO ITEM ── */}
                {showInfoModal && (
                  <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-base font-bold text-slate-900">
                          {editInfoId ? 'Edit Penjelasan Topik' : 'Tambah Penjelasan Topik Baru'}
                        </h3>
                        <button onClick={() => setShowInfoModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveInfoItem} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Judul Topik / Penjelasan <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={infoJudul}
                            onChange={(e) => setInfoJudul(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                            placeholder="Contoh: Review CV & Portofolio"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Penjelasan</label>
                          <textarea
                            rows={4}
                            value={infoDeskripsi}
                            onChange={(e) => setInfoDeskripsi(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            placeholder="Uraian detail mengenai topik konseling..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tautan Terkait (Opsional)</label>
                            <input
                              type="text"
                              value={infoLinkUrl}
                              onChange={(e) => setInfoLinkUrl(e.target.value)}
                              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                              placeholder="https://..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Label Tombol Tautan</label>
                            <input
                              type="text"
                              value={infoLinkLabel}
                              onChange={(e) => setInfoLinkLabel(e.target.value)}
                              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                              placeholder="Contoh: Buka Panduan CV"
                            />
                          </div>
                        </div>

                        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowInfoModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                          >
                            Simpan Topik
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* ── MODAL ADD / EDIT JADWAL ITEM ── */}
                {showJadwalModal && (
                  <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-base font-bold text-slate-900">
                          {editJadwalId ? 'Edit Entri Jadwal' : 'Tambah Entri Jadwal Baru'}
                        </h3>
                        <button onClick={() => setShowJadwalModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveJadwalItem} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Hari Pelaksanaan <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={jdwHari}
                            onChange={(e) => setJdwHari(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                            placeholder="Contoh: Senin - Kamis"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Jam Pelaksanaan <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={jdwJam}
                            onChange={(e) => setJdwJam(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            placeholder="Contoh: 09.00 - 15.00 WITA"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Konseling</label>
                          <input
                            type="text"
                            value={jdwLokasi}
                            onChange={(e) => setJdwLokasi(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ruang Konseling CDC UMK, Gedung Rektorat Lt. 2"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kuota Per Hari</label>
                            <input
                              type="text"
                              value={jdwKuota}
                              onChange={(e) => setJdwKuota(e.target.value)}
                              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                              placeholder="Contoh: 5 Sesi / Hari"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Status Sesi</label>
                            <select
                              value={jdwStatus}
                              onChange={(e) => setJdwStatus(e.target.value as any)}
                              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                            >
                              <option value="buka">Buka (Tersedia)</option>
                              <option value="penuh">Penuh</option>
                              <option value="tutup">Tutup</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowJadwalModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                          >
                            Simpan Jadwal
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════
              KELOLA KEANGGOTAAN & TIM CDC
          ══════════════════════════════════════════ */}
          {activeTab === 'keanggotaan' && (() => {
            const handleSaveAnggota = (e: React.FormEvent) => {
              e.preventDefault();
              if (!angNama.trim() || !angJabatan.trim()) {
                triggerToast('error', 'Nama lengkap dan Jabatan/Posisi wajib diisi.');
                return;
              }

              let updatedList = [...anggotaList];
              if (editAnggotaId) {
                updatedList = updatedList.map((item) =>
                  item.id === editAnggotaId
                    ? { ...item, nama: angNama, jabatan: angJabatan, fotoUrl: angFotoUrl }
                    : item
                );
              } else {
                const newMember: AnggotaTim = {
                  id: `tim_${Date.now()}`,
                  nama: angNama,
                  jabatan: angJabatan,
                  fotoUrl: angFotoUrl,
                  urutan: updatedList.length + 1
                };
                updatedList.push(newMember);
              }

              saveAnggotaTim(updatedList);
              setAnggotaList(updatedList);
              setShowAnggotaModal(false);
              triggerToast('success', editAnggotaId ? 'Data anggota tim berhasil diperbarui.' : 'Anggota tim baru berhasil ditambahkan.');
            };

            const handleDeleteAnggota = (id: string) => {
              if (confirm('Hapus anggota tim ini dari struktur keanggotaan CDC?')) {
                const updatedList = anggotaList.filter((item) => item.id !== id);
                saveAnggotaTim(updatedList);
                setAnggotaList(updatedList);
                triggerToast('success', 'Anggota tim berhasil dihapus.');
              }
            };

            const openAddAnggotaModal = () => {
              setEditAnggotaId(null);
              setAngNama('');
              setAngJabatan('');
              setAngFotoUrl('');
              setShowAnggotaModal(true);
            };

            const openEditAnggotaModal = (item: AnggotaTim) => {
              setEditAnggotaId(item.id);
              setAngNama(item.nama);
              setAngJabatan(item.jabatan);
              setAngFotoUrl(item.fotoUrl || '');
              setShowAnggotaModal(true);
            };

            const handleAnggotaFotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const compressed = await compressImageAdaptive(file);
                setAngFotoUrl(compressed);
                triggerToast('success', 'Foto profil berhasil diunggah & dikompres!');
              } catch (err: any) {
                triggerToast('error', 'Gagal memuat foto profil.');
              }
            };

            return (
              <div className="space-y-8">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[#1E3A8A]" />
                      Kelola Keanggotaan &amp; Struktur Tim CDC
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Atur nama, jabatan/posisi, dan foto profil pengelola &amp; tim CDC UM Kendari
                    </p>
                  </div>

                  <button
                    onClick={openAddAnggotaModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md transition"
                  >
                    <Plus className="w-4 h-4" /> Tambah Anggota Tim Baru
                  </button>
                </div>

                {/* Grid list of members */}
                {anggotaList.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400 font-medium">
                    Belum ada anggota tim. Klik tombol "+ Tambah Anggota Tim Baru" di atas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {anggotaList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div className="space-y-3 text-center flex flex-col items-center">
                          <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            {item.fotoUrl ? (
                              <img src={item.fotoUrl} alt={item.nama} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Users className="w-12 h-12" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{item.nama}</h3>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2">{item.jabatan}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => openEditAnggotaModal(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAnggota(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── MODAL ADD / EDIT ANGGOTA TIM ── */}
                {showAnggotaModal && (
                  <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-base font-bold text-slate-900">
                          {editAnggotaId ? 'Edit Anggota Tim CDC' : 'Tambah Anggota Tim CDC Baru'}
                        </h3>
                        <button onClick={() => setShowAnggotaModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveAnggota} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={angNama}
                            onChange={(e) => setAngNama(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                            placeholder="Contoh: drh. Retno Murwanti, M.P., Ph.D."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Posisi <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={angJabatan}
                            onChange={(e) => setAngJabatan(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: Kepala Kantor Alumni / Asisten Program"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700">Foto Profil (Berkas / URL)</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAnggotaFotoFileChange}
                              className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                          </div>
                          <input
                            type="text"
                            value={angFotoUrl}
                            onChange={(e) => setAngFotoUrl(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="Atau masukkan URL foto (https://...)"
                          />
                        </div>

                        {/* Foto Preview */}
                        {angFotoUrl && (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <img src={angFotoUrl} alt="Pratinjau Foto" className="w-12 h-12 rounded-lg object-cover border border-slate-300" />
                            <span className="text-xs text-slate-600 font-medium">Pratinjau foto profil anggota tim</span>
                          </div>
                        )}

                        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAnggotaModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] hover:bg-blue-900 text-white shadow-md"
                          >
                            Simpan Anggota
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════
              KELOLA MEDIA SOSIAL & TAUTAN FOOTER
          ══════════════════════════════════════════ */}
          {activeTab === 'media-sosial' && (() => {
            const handleToggleStatus = (id: string) => {
              const updatedList = socMedList.map((item) =>
                item.id === id ? { ...item, isActive: !item.isActive } : item
              );
              saveToDB('social_media', updatedList);
              setSocMedList(updatedList);
              const target = updatedList.find((i) => i.id === id);
              triggerToast(
                'success',
                target?.isActive
                  ? `Ikon ${target.label} kini TAMPIL di footer website.`
                  : `Ikon ${target.label} kini TERSEMBUNYI dari footer website.`
              );
            };

            const handleSaveItemUrl = (id: string, newUrl: string) => {
              const updatedList = socMedList.map((item) =>
                item.id === id ? { ...item, url: newUrl } : item
              );
              saveToDB('social_media', updatedList);
              setSocMedList(updatedList);
              triggerToast('success', 'URL link media sosial berhasil diperbarui!');
            };

            const handleDeleteItem = (id: string) => {
              const target = socMedList.find((i) => i.id === id);
              if (confirm(`Hapus media sosial "${target?.label || 'ini'}"?`)) {
                const updatedList = socMedList.filter((item) => item.id !== id);
                saveToDB('social_media', updatedList);
                setSocMedList(updatedList);
                triggerToast('success', 'Media sosial berhasil dihapus.');
              }
            };

            const openAddModal = () => {
              setEditSocMedId(null);
              setSocPlatform('instagram');
              setSocLabel('');
              setSocUrl('');
              setSocIsActive(true);
              setShowSocMedModal(true);
            };

            const openEditModal = (item: SocialMediaItem) => {
              setEditSocMedId(item.id);
              setSocPlatform(item.platform);
              setSocLabel(item.label);
              setSocUrl(item.url);
              setSocIsActive(item.isActive);
              setShowSocMedModal(true);
            };

            const handleSaveModalForm = (e: React.FormEvent) => {
              e.preventDefault();
              if (!socLabel.trim() || !socUrl.trim()) {
                triggerToast('error', 'Label dan Link URL wajib diisi.');
                return;
              }

              let hoverColor = 'hover:bg-blue-600';
              if (socPlatform === 'instagram') hoverColor = 'hover:bg-pink-600';
              if (socPlatform === 'youtube') hoverColor = 'hover:bg-red-600';
              if (socPlatform === 'website') hoverColor = 'hover:bg-[#10B981]';
              if (socPlatform === 'twitter') hoverColor = 'hover:bg-sky-500';
              if (socPlatform === 'linkedin') hoverColor = 'hover:bg-blue-700';
              if (socPlatform === 'tiktok') hoverColor = 'hover:bg-slate-900';

              let updatedList = [...socMedList];
              if (editSocMedId) {
                updatedList = updatedList.map((item) =>
                  item.id === editSocMedId
                    ? {
                      ...item,
                      platform: socPlatform,
                      label: socLabel.trim(),
                      url: socUrl.trim(),
                      isActive: socIsActive,
                      hoverColor
                    }
                    : item
                );
              } else {
                const newItem: SocialMediaItem = {
                  id: `soc_${Date.now()}`,
                  platform: socPlatform,
                  label: socLabel.trim(),
                  url: socUrl.trim(),
                  isActive: socIsActive,
                  hoverColor
                };
                updatedList.push(newItem);
              }

              saveToDB('social_media', updatedList);
              setSocMedList(updatedList);
              setShowSocMedModal(false);
              triggerToast(
                'success',
                editSocMedId
                  ? 'Data media sosial berhasil diperbarui!'
                  : 'Media sosial baru berhasil ditambahkan!'
              );
            };

            return (
              <div className="space-y-8">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#1E3A8A]" />
                      Kelola Media Sosial &amp; Kontak Helpdesk
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Atur tautan media sosial footer publik serta kontak email &amp; WhatsApp untuk pemulihan kata sandi akun CDC
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Media Sosial</span>
                  </button>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    SECTION: KONTAK BANTUAN & PEMULIHAN KATA SANDI
                ───────────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-[#0077C6]" />
                        Kontak Bantuan &amp; Pemulihan Kata Sandi
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Atur email helpdesk dan nomor WhatsApp yang tampil pada popup <em>"Bantuan Pemulihan Kata Sandi"</em> di halaman Login
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!helpdeskEmail.trim() || !helpdeskWa.trim()) {
                          triggerToast('error', 'Email Helpdesk dan Nomor WhatsApp wajib diisi.');
                          return;
                        }
                        saveHelpdeskConfig({
                          email: helpdeskEmail.trim(),
                          whatsappNumber: helpdeskWa.trim(),
                          whatsappNote: helpdeskNote.trim()
                        });
                        triggerToast('success', 'Kontak bantuan pemulihan kata sandi berhasil disimpan!');
                      }}
                      className="inline-flex items-center gap-2 bg-[#0077C6] hover:bg-[#005FA0] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Kontak Pemulihan</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#0077C6]" />
                        <span>Email Helpdesk <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="email"
                        value={helpdeskEmail}
                        onChange={(e) => setHelpdeskEmail(e.target.value)}
                        placeholder="helpdesk@umkendari.ac.id"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#0077C6] focus:outline-none focus:ring-1 focus:ring-[#0077C6] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nomor WhatsApp / Layanan <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={helpdeskWa}
                        onChange={(e) => setHelpdeskWa(e.target.value)}
                        placeholder="0852-4100-9988"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#0077C6] focus:outline-none focus:ring-1 focus:ring-[#0077C6] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Keterangan Jam Kerja (Opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={helpdeskNote}
                        onChange={(e) => setHelpdeskNote(e.target.value)}
                        placeholder="(Jam Kerja 08.00 - 16.00 WITA)"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#0077C6] focus:outline-none focus:ring-1 focus:ring-[#0077C6] transition"
                      />
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      Pratinjau Tampilan Popup "Bantuan Pemulihan Kata Sandi" di Halaman Login:
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 max-w-md shadow-xs text-xs">
                      <div className="flex items-start gap-2.5">
                        <Mail className="w-4 h-4 text-[#0077C6] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800">Email Helpdesk:</div>
                          <span className="text-[#0077C6] font-medium break-all">{helpdeskEmail || 'helpdesk@umkendari.ac.id'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800">WhatsApp / Layanan Mahasiswa:</div>
                          <span className="text-slate-800 font-medium">{helpdeskWa || '0852-4100-9988'}</span>{' '}
                          {helpdeskNote && <span className="text-slate-500 font-normal">{helpdeskNote}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {socMedList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition"
                    >
                      {/* Top Row: Icon, Label & Status Badge */}
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {item.platform === 'facebook' && 'f'}
                            {item.platform === 'instagram' && 'IG'}
                            {item.platform === 'youtube' && 'YT'}
                            {item.platform === 'website' && 'WEB'}
                            {item.platform === 'twitter' && 'X'}
                            {item.platform === 'linkedin' && 'in'}
                            {item.platform === 'tiktok' && 'TT'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.label}</h3>
                            <div className="text-[11px] text-slate-400 capitalize">Platform: {item.platform}</div>
                          </div>
                        </div>

                        {/* Status Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${item.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                          >
                            {item.isActive ? '● Tampil di Footer' : '○ Tersembunyi'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item.id)}
                            title={item.isActive ? 'Klik untuk Sembunyikan' : 'Klik untuk Tampilkan'}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* URL Input Form */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>Link URL Tujuan</span>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-[11px] inline-flex items-center gap-1 font-normal"
                            >
                              Uji Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            defaultValue={item.url}
                            onBlur={(e) => {
                              if (e.target.value.trim() !== item.url) {
                                handleSaveItemUrl(item.id, e.target.value.trim());
                              }
                            }}
                            placeholder="https://..."
                            className="flex-1 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] font-mono transition"
                          />
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Form Tambah / Edit Media Sosial */}
                {showSocMedModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 relative animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <Globe className="w-5 h-5 text-[#1E3A8A]" />
                          {editSocMedId ? 'Edit Media Sosial' : 'Tambah Media Sosial Baru'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowSocMedModal(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveModalForm} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Platform Media Sosial</label>
                          <select
                            value={socPlatform}
                            onChange={(e) => {
                              const p = e.target.value as SocialMediaItem['platform'];
                              setSocPlatform(p);
                              if (!socLabel) {
                                if (p === 'facebook') setSocLabel('Facebook CDC UM Kendari');
                                else if (p === 'instagram') setSocLabel('Instagram CDC UM Kendari');
                                else if (p === 'youtube') setSocLabel('YouTube CDC UM Kendari');
                                else if (p === 'website') setSocLabel('Website UM Kendari');
                                else if (p === 'twitter') setSocLabel('Twitter / X CDC');
                                else if (p === 'linkedin') setSocLabel('LinkedIn CDC');
                                else if (p === 'tiktok') setSocLabel('TikTok CDC');
                              }
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition cursor-pointer"
                          >
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="website">Website / Portal</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="tiktok">TikTok</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Label Keterangan</label>
                          <input
                            type="text"
                            required
                            value={socLabel}
                            onChange={(e) => setSocLabel(e.target.value)}
                            placeholder="Contoh: Instagram CDC UM Kendari"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Link URL Tujuan</label>
                          <input
                            type="url"
                            required
                            value={socUrl}
                            onChange={(e) => setSocUrl(e.target.value)}
                            placeholder="https://instagram.com/cdc_umkendari"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 font-mono focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition"
                          />
                        </div>

                        <div className="pt-1">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={socIsActive}
                              onChange={(e) => setSocIsActive(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                            />
                            <span>Tampilkan langsung ikon ini di footer website publik</span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowSocMedModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] hover:bg-blue-900 text-white shadow-md cursor-pointer"
                          >
                            Simpan Media Sosial
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ============== MODERASI KOMENTAR BERITA ============== */}
          {activeTab === 'komentar' && (
            <div className="space-y-6" id="adm-komentar">
              {(() => {
            const fmt = (iso?: string) =>
              iso ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '-';
            const list = [...komentarList]
              .filter((k) => komentarFilter === 'semua' || k.status === komentarFilter)
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
            const counts = {
              semua: komentarList.length,
              pending: komentarList.filter((k) => k.status === 'pending').length,
              approved: komentarList.filter((k) => k.status === 'approved').length,
              rejected: komentarList.filter((k) => k.status === 'rejected').length,
            };
            const doApprove = (id: string) => { updateKomentarBeritaStatus(id, 'approved'); reloadAll(); triggerToast('success', 'Komentar disetujui & akan tayang di publik.'); };
            const doReject = (id: string) => { updateKomentarBeritaStatus(id, 'rejected'); reloadAll(); triggerToast('error', 'Komentar ditolak.'); };
            const doDelete = (id: string) => { deleteKomentarBerita(id); reloadAll(); triggerToast('error', 'Komentar dihapus.'); };
            const tabs: { id: typeof komentarFilter; label: string }[] = [
              { id: 'pending', label: `Menunggu (${counts.pending})` },
              { id: 'approved', label: `Disetujui (${counts.approved})` },
              { id: 'rejected', label: `Ditolak (${counts.rejected})` },
              { id: 'semua', label: `Semua (${counts.semua})` },
            ];
            return (
              <>
                <div className="anim-fade-up">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Moderasi Komentar Berita</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Komentar dari pengunjung akan tampil di halaman Berita &amp; Artikel hanya setelah Anda menyetujui.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setKomentarFilter(t.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${komentarFilter === t.id ? 'bg-[#1E3A8A] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {list.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400">Tidak ada komentar pada filter ini.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3 font-bold">Pengirim</th>
                            <th className="px-4 py-3 font-bold">Komentar</th>
                            <th className="px-4 py-3 font-bold">Berita</th>
                            <th className="px-4 py-3 font-bold">Tanggal</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 font-bold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {list.map((k) => (
                            <tr key={k.id} className="align-top hover:bg-slate-50/60">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-semibold text-slate-800 text-xs">{k.nama}</div>
                                <div className="text-[11px] text-slate-400">{k.email}</div>
                              </td>
                              <td className="px-4 py-3 max-w-xs">
                                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{k.komentar}</p>
                              </td>
                              <td className="px-4 py-3 max-w-[180px]">
                                <span className="text-xs text-slate-600 line-clamp-2">{k.beritaJudul}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-400">{fmt(k.createdAt)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {k.status === 'pending' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Menunggu</span>}
                                {k.status === 'approved' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Disetujui</span>}
                                {k.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">Ditolak</span>}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {k.status !== 'approved' && (
                                    <button onClick={() => doApprove(k.id)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition">Setujui</button>
                                  )}
                                  {k.status !== 'rejected' && (
                                    <button onClick={() => doReject(k.id)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition">Tolak</button>
                                  )}
                                  <button onClick={() => doDelete(k.id)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white transition">Hapus</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
              })()}
            </div>
          )}

          {/* ============== CDC UM KENDARI CLUB (1 toggle: card beranda + badge footer) ============== */}
          {activeTab === 'media-sosial' && (() => {
            const saveClub = () => {
              saveCdcClubConfig(cdcClubCfg);
              triggerToast('success', 'Pengaturan CDC UM Kendari Club tersimpan.');
            };
            return (
              <div className="space-y-4" id="adm-cdc-club">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-rose-600" /> CDC UM Kendari Club
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Satu pengaturan mengontrol card di beranda &amp; badge di footer sekaligus.
                        Nonaktifkan untuk menyembunyikan keduanya.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={cdcClubCfg.published}
                        onChange={(e) => setCdcClubCfg({ ...cdcClubCfg, published: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-sm font-bold text-slate-700">{cdcClubCfg.published ? 'Tampil' : 'Sembunyi'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Judul (baris 1 &amp; 2 dipisah Enter)</label>
                      <textarea
                        value={cdcClubCfg.title}
                        onChange={(e) => setCdcClubCfg({ ...cdcClubCfg, title: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        placeholder="CDC UM KENDARI CLUB"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Deskripsi</label>
                      <textarea
                        value={cdcClubCfg.subtitle}
                        onChange={(e) => setCdcClubCfg({ ...cdcClubCfg, subtitle: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Teks Tombol</label>
                      <input
                        value={cdcClubCfg.buttonText}
                        onChange={(e) => setCdcClubCfg({ ...cdcClubCfg, buttonText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        placeholder="Gabung Komunitas"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">URL Tujuan Tombol</label>
                      <input
                        value={cdcClubCfg.buttonUrl}
                        onChange={(e) => setCdcClubCfg({ ...cdcClubCfg, buttonUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={saveClub}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> Simpan CDC Club
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============== VISI & MISI ============== */}
          {activeTab === 'visi-misi' && (() => {
            const handleVmFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const compressed = await compressImageAdaptive(file);
                setVmImageUrl(compressed);
                triggerToast('success', 'Gambar Visi & Misi berhasil diunggah & dikompres!');
              } catch (err: any) {
                triggerToast('error', 'Gagal memuat gambar Visi & Misi.');
              }
            };

            const handleSaveVm = () => {
              if (!vmImageUrl.trim()) {
                triggerToast('error', 'Gambar Visi & Misi wajib diunggah.');
                return;
              }
              const updated: VisiMisiConfig = { ...visiMisiCfg, imageUrl: vmImageUrl, updatedAt: new Date().toISOString() };
              saveVisiMisiConfig(updated);
              setVisiMisiCfg(updated);
              triggerToast('success', 'Gambar Visi & Misi berhasil disimpan!');
            };

            return (
              <div className="space-y-6" id="adm-visi-misi">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#1E3A8A]" /> Pengaturan Gambar Visi &amp; Misi
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Unggah gambar Visi &amp; Misi yang akan tampil di beranda publik, section &quot;Tentang Kami&quot;.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Unggah Gambar Visi &amp; Misi</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:border-[#1E3A8A] transition relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleVmFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <span className="text-xs font-semibold text-[#1E3A8A]">Klik atau seret gambar ke sini</span>
                          <span className="text-[10px] text-slate-400 block mt-1">PNG / JPG • otomatis dikompres</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Atau tempel URL gambar</label>
                        <input
                          type="text"
                          value={vmImageUrl}
                          onChange={(e) => setVmImageUrl(e.target.value)}
                          placeholder="/visi-misi-cdc.svg atau https://..."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveVm}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold text-sm shadow-md transition"
                      >
                        <Save className="w-4 h-4" /> Simpan Gambar Visi &amp; Misi
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Preview Tampilan</label>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-2 sm:p-4">
                        <img
                          src={vmImageUrl || '/visi-misi-cdc.svg'}
                          alt="Preview Visi & Misi"
                          className="w-full h-auto object-contain rounded-xl"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/visi-misi-cdc.svg'; }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}


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
function ToolbarBtn({ icon, label, onClick, onMouseDown }: { icon: React.ReactNode; label: string; onClick: () => void; onMouseDown?: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onMouseDown}
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
