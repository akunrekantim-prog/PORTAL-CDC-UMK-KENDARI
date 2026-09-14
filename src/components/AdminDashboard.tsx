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
import DOMPurify from 'isomorphic-dompurify';
import { motion, AnimatePresence } from 'motion/react';
import ChartArea from './ChartArea';
import Dropdown from './Dropdown';
import LocationPicker from './ui/LocationPicker';
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
  CdcClubConfig,
  HeroSlideItem,
  CampusHiringItem,
  JobFairItem,
  StatistikConfig
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
  saveCdcClubConfig,
  getHeroSlides,
  saveHeroSlides,
  getCampusHiring,
  saveCampusHiring,
  getJobFair,
  saveJobFair,
  getStatistikConfig,
  saveStatistikConfig,
  trackAndGetVisitorCount
} from '../data';
import { registerToBackend } from '../services/dbService';
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
  Phone,
  PhoneCall,
  Sparkles,
  Menu,
  CheckCircle,
  Command,
  Ticket,
  ArrowUpRight,
  Zap,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  onReloadData?: () => void;
}

type AdminTab = 'ringkasan' | 'konten' | 'mitra' | 'admin' | 'keanggotaan' | 'visi-misi' | 'sk-cdc' | 'kalender' | 'laporan' | 'mou' | 'galeri' | 'media-sosial' | 'komentar' | 'konseling' | 'hero-slider' | 'campus-hiring' | 'job-fair' | 'statistik-beranda';
type KontenSubTab = 'riwayat' | 'pembuatan';
type MitraSubTab = 'approval' | 'list';

const JENIS_LABEL: Record<JenisKonten, string> = {
  berita: 'Berita & Artikel',
  lowongan: 'Lowongan',
  program: 'Program & Pengumuman',
  pengumuman: 'Pengumuman Penting',
  workshop: 'Workshop & Pelatihan Karir',
  softskill: 'Pelatihan Softskill & Kewirausahaan',
  seminar: 'Seminar Sukses Berkarir',
  presentasi: 'Prestasi',
  job_fair: 'Job Fair & Expo',
  campus_hiring: 'Campus Hiring'
};

const JENIS_ICON: Record<JenisKonten, React.ReactNode> = {
  berita: <Newspaper className="w-4 h-4" />,
  lowongan: <Briefcase className="w-4 h-4" />,
  program: <Megaphone className="w-4 h-4" />,
  pengumuman: <Megaphone className="w-4 h-4" />,
  workshop: <GraduationCap className="w-4 h-4" />,
  softskill: <Award className="w-4 h-4" />,
  seminar: <GraduationCap className="w-4 h-4" />,
  presentasi: <Trophy className="w-4 h-4" />,
  job_fair: <Ticket className="w-4 h-4" />,
  campus_hiring: <Building2 className="w-4 h-4" />
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
  presentasi: true,  // wajib upload poster/dokumentasi
  job_fair: true,   // poster job fair (16:9 / 9:16)
  campus_hiring: true // poster campus hiring (16:9 / 9:16)
};

const CATEGORY_DESCS: Record<JenisKonten, string> = {
  berita: 'Artikel berita terbaru, pers rilis, dan liputan kegiatan kampus.',
  lowongan: 'Poster & informasi lowongan kerja, magang, serta karir alumni.',
  program: 'Program unggulan CDC UMK, pelatihan intensif, & informasi karir.',
  pengumuman: 'Pengumuman resmi, banner mendesak, & notifikasi kampus.',
  workshop: 'Workshop pengembangan keterampilan teknis & persiapan karir.',
  softskill: 'Pelatihan karakter, pembinaan softskill, & kewirausahaan.',
  seminar: 'Seminar nasional, talkshow karir, & webinar alumni.',
  presentasi: 'Publikasi piagam & pencapaian prestasi mahasiswa/alumni.',
  job_fair: 'Upload poster event Bursa Kerja Akbar (Job Fair & Expo).',
  campus_hiring: 'Upload poster rekrutmen & wawancara langsung (Campus Hiring).'
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
  const [selectedCategory, setSelectedCategory] = useState<JenisKonten | null>(null);
  const [mitraSub, setMitraSub] = useState<MitraSubTab>('approval');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState('');

  // Keyboard shortcut listener Ctrl + K / Cmd + K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Form states Hero Slider Beranda
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => getHeroSlides());
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [editSlideId, setEditSlideId] = useState<string | null>(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideTargetUrl, setSlideTargetUrl] = useState('lowongan');
  const [slideAlt, setSlideAlt] = useState('');
  const [slideIsActive, setSlideIsActive] = useState(true);

  // Form states Campus Hiring — permanen: hanya judul + poster
  const [campusHiringItems, setCampusHiringItems] = useState<CampusHiringItem[]>(() => getCampusHiring());
  const [showChForm, setShowChForm] = useState(false);
  const [editChId, setEditChId] = useState<string | null>(null);
  const [chJudul, setChJudul] = useState('');
  const [chLogoUrl, setChLogoUrl] = useState('');
  const [chBannerUrl, setChBannerUrl] = useState('');
  const [chPosterAspect, setChPosterAspect] = useState<'16:9' | '9:16'>('16:9');
  const [chDeskripsi, setChDeskripsi] = useState('');

  // Form states Job Fair — permanen: hanya judul + poster
  const [jobFairItems, setJobFairItems] = useState<JobFairItem[]>(() => getJobFair());
  const [showJfForm, setShowJfForm] = useState(false);
  const [editJfId, setEditJfId] = useState<string | null>(null);
  const [jfJudul, setJfJudul] = useState('');
  const [jfBannerUrl, setJfBannerUrl] = useState('');
  const [jfPosterAspect, setJfPosterAspect] = useState<'16:9' | '9:16'>('16:9');
  const [jfDeskripsi, setJfDeskripsi] = useState('');

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

  // Form states Pengumuman Khusus / Utama Beranda
  const [annIsImportant, setAnnIsImportant] = useState<boolean>(true);
  const [annDisplayType, setAnnDisplayType] = useState<'badge' | 'poster'>('badge');
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annContent, setAnnContent] = useState<string>('');
  const [annPosterUrl, setAnnPosterUrl] = useState<string>('');
  const [annLinkUrl, setAnnLinkUrl] = useState<string>('');
  const [annLinkLabel, setAnnLinkLabel] = useState<string>('');
  const [annShowBadge, setAnnShowBadge] = useState<boolean>(true);
  const [annBadgeText, setAnnBadgeText] = useState<string>('PENGUMUMAN SANGAT PENTING');
  const [annShowBadgeIcon, setAnnShowBadgeIcon] = useState<boolean>(true);

  // Form states Statistik Beranda (Alumni & Mitra Perusahaan)
  const [statAlumni, setStatAlumni] = useState(() => getStatistikConfig().jumlahAlumni);
  const [statMitra, setStatMitra] = useState(() => getStatistikConfig().jumlahMitra);

  const handleSaveStatistik = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!statAlumni.trim() || !statMitra.trim()) {
      triggerToast('error', 'Jumlah Alumni dan Jumlah Mitra Perusahaan wajib diisi!');
      return;
    }
    saveStatistikConfig({
      jumlahAlumni: statAlumni.trim(),
      jumlahMitra: statMitra.trim(),
    });
    reloadAll();
    if (onReloadData) onReloadData();
    triggerToast('success', 'Statistik Beranda (Alumni & Mitra Perusahaan) berhasil disimpan!');
  };

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
      setAnnShowBadge(imp.showBadge !== false);
      setAnnBadgeText(imp.badgeText || 'PENGUMUMAN SANGAT PENTING');
      setAnnShowBadgeIcon(imp.showBadgeIcon !== false);
    }
  };

  const handleSavePengumumanPenting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!annTitle.trim()) {
      triggerToast('error', 'Judul Pengumuman Penting wajib diisi!');
      return;
    }

    try {
      const list = getFromDB<Pengumuman>('pengumuman');
      const imp = list.find((a) => a.isImportant) || list[0];

      const newImpAnn: Pengumuman = {
        id: imp?.id || `ann_${Date.now()}`,
        title: annTitle.trim(),
        content: annContent.trim(),
        category: 'umum',
        status: 'published',
        publishedAt: new Date().toISOString(),
        createdAt: imp?.createdAt || new Date().toISOString(),
        isImportant: annIsImportant,
        displayType: annDisplayType,
        posterUrl: annPosterUrl || undefined,
        linkUrl: annLinkUrl.trim() || undefined,
        linkLabel: annLinkLabel.trim() || 'Buka Tautan',
        showBadge: annShowBadge,
        badgeText: annBadgeText.trim() || 'PENGUMUMAN SANGAT PENTING',
        showBadgeIcon: annShowBadgeIcon
      };

      let updatedList: Pengumuman[];
      const existsIndex = list.findIndex((a) => a.id === newImpAnn.id);
      if (existsIndex >= 0) {
        updatedList = list.map((a, i) => (i === existsIndex ? newImpAnn : a));
      } else {
        updatedList = [newImpAnn, ...list];
      }

      if (annIsImportant) {
        updatedList = updatedList.map((a) => {
          if (a.id === newImpAnn.id) return { ...a, isImportant: true };
          return { ...a, isImportant: false };
        });
      }

      saveToDB('pengumuman', updatedList);
      reloadAll();
      if (onReloadData) onReloadData();
      triggerToast('success', 'Pengumuman Penting Beranda berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      triggerToast('error', 'Gagal menyimpan pengumuman penting: ' + (err?.message || err));
    }
  };

  const handleUploadAnnPoster = async (file: File) => {
    try {
      const dataUrl = await compressImageAdaptive(file);
      setAnnPosterUrl(dataUrl);
      triggerToast('success', 'Foto/Poster Pengumuman berhasil diunggah!');
    } catch (err: any) {
      triggerToast('error', 'Gagal mengunggah foto poster: ' + (err?.message || err));
    }
  };

  // Form states Kontak Helpdesk / Pemulihan Kata Sandi / WhatsApp CS
  const [helpdeskEmail, setHelpdeskEmail] = useState(() => getHelpdeskConfig().email);
  const [helpdeskWa, setHelpdeskWa] = useState(() => getHelpdeskConfig().whatsappNumber);
  const [helpdeskNote, setHelpdeskNote] = useState(() => getHelpdeskConfig().whatsappNote);
  const [helpdeskJam, setHelpdeskJam] = useState(() => getHelpdeskConfig().jamLayanan || 'Senin - Jumat: 08.00 - 16.00 WITA');
  const [helpdeskMsg, setHelpdeskMsg] = useState(() => getHelpdeskConfig().defaultMessage || 'Halo Admin CDC UM Kendari, saya ingin berkonsultasi mengenai...');
  const [helpdeskFloating, setHelpdeskFloating] = useState(() => getHelpdeskConfig().isFloatingActive !== false);

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
    setHeroSlides(getHeroSlides());
    setCampusHiringItems(getCampusHiring());
    setJobFairItems(getJobFair());
    syncAnnState();

    const hConfig = getHelpdeskConfig();
    setHelpdeskEmail(hConfig.email);
    setHelpdeskWa(hConfig.whatsappNumber);
    setHelpdeskNote(hConfig.whatsappNote);
    setHelpdeskJam(hConfig.jamLayanan || 'Senin - Jumat: 08.00 - 16.00 WITA');
    setHelpdeskMsg(hConfig.defaultMessage || 'Halo Admin CDC UM Kendari, saya ingin berkonsultasi mengenai...');
    setHelpdeskFloating(hConfig.isFloatingActive !== false);

    const cfg = getKonselingConfig();
    setKonselingCfg(cfg);
    setKPosterUrl(cfg.posterUrl || '');
    setKTitle(cfg.title || '');
    setKSubtitle(cfg.subtitle || '');
    setKNarasiWa(cfg.narasiWa || '');
    setKAdminWaNum(cfg.adminWaNumber || '');
    setKAdminWaMsg(cfg.adminWaDefaultMessage || '');

    const statCfg = getStatistikConfig();
    setStatAlumni(statCfg.jumlahAlumni);
    setStatMitra(statCfg.jumlahMitra);
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
    { group: 'KONTEN KARIR', items: [{ id: 'konten', label: 'Konten Karir', icon: <FileText className="w-4 h-4" /> }] },
    {
      group: 'MANAJEMEN MITRA',
      items: [
        { id: 'mitra', label: 'Approval & List Mitra', icon: <Building2 className="w-4 h-4" /> }
      ]
    },
    {
      group: 'INTERAKSI PUBLIK',
      items: [
        { id: 'media-sosial', label: 'Media Sosial & WA CS', icon: <Globe className="w-4 h-4" /> },
        { id: 'komentar', label: 'Moderasi Komentar Berita', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'statistik-beranda', label: 'Statistik Beranda', icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      group: 'MANAJEMEN WEB',
      collapsible: true,
      items: [
        { id: 'hero-slider', label: 'Slider Beranda', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'keanggotaan', label: 'Keanggotaan & Tim', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'visi-misi', label: 'Visi & Misi', icon: <Target className="w-4 h-4" /> },
        { id: 'sk-cdc', label: 'Surat Keputusan CDC', icon: <FileText className="w-4 h-4" /> },
        { id: 'kalender', label: 'Kalender Kegiatan', icon: <Calendar className="w-4 h-4" /> },
        { id: 'laporan', label: 'Laporan Kinerja', icon: <FileText className="w-4 h-4" /> },
        { id: 'mou', label: 'MOU Stakeholder', icon: <FileText className="w-4 h-4" /> },
        { id: 'galeri', label: 'Galeri Kegiatan', icon: <Film className="w-4 h-4" /> },
        { id: 'konseling', label: 'Bimbingan & Konseling', icon: <HeartHandshake className="w-4 h-4" /> },
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
    ...mitra.map((m) => {
      const u = allUsers.find((usr) => usr.id === m.userId);
      return { date: u?.createdAt || new Date().toISOString(), text: `Mitra terdaftar: ${m.namaInstansi}` };
    })
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const topMitra = [...mitra]
    .map((m) => ({
      m,
      count: lowongan.filter(
        (l) => l.mitraId === m.id || (l.namaInstansi && m.namaInstansi && l.namaInstansi.trim().toLowerCase() === m.namaInstansi.trim().toLowerCase())
      ).length
    }))
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
    const users = getFromDB<UserType>('users');
    const u = users.find((x) => x.id === m.userId || x.email.toLowerCase() === (m.email || '').toLowerCase());
    if (u) {
      updateInDB<UserType>('users', { ...u, status: next === 'aktif' ? 'active' : 'inactive' });
    }
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
    if (!aPass || aPass.length < 8 || !/[A-Z]/.test(aPass) || !/[a-z]/.test(aPass) || !/[0-9]/.test(aPass)) {
      triggerToast('error', 'Password wajib min. 8 karakter, mengandung huruf besar, huruf kecil, dan angka.');
      return;
    }
    const existing = getFromDB<UserType>('users').find((u) => u.email.toLowerCase() === aEmail.toLowerCase());
    if (existing) {
      setAEmailError('Email sudah terdaftar.');
      return;
    }
    // SECURITY: password TIDAK disimpan di browser/localStorage — kirim ke backend agar di-hash bcrypt.
    registerToBackend({ name: aName, email: aEmail, password: aPass, role: 'ADMIN' as any })
      .then((created) => {
        const createdAny = created as any;
        const createdUser = createdAny?.user ?? createdAny;
        const newAdmin: UserType = {
          id: createdUser?.id ?? `usr_admin_${Date.now()}`,
          name: createdUser?.name ?? aName,
          email: createdUser?.email ?? aEmail,
          role: 'admin',
          status: createdUser?.status ? String(createdUser.status).toLowerCase() : 'active',
          createdAt: createdUser?.createdAt ?? new Date().toISOString()
        } as UserType;
        insertToDB<UserType>('users', newAdmin);
        setAName(''); setAEmail(''); setAPass(''); setShowAddAdmin(false);
        reloadAll();
        triggerToast('success', `Admin "${aName}" ditambahkan.`);
      })
      .catch((err: any) => {
        triggerToast('error', err?.message || 'Gagal menambahkan admin via server.');
      });
  };

  const handleDisableAdmin = (u: UserType) => {
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    updateInDB<UserType>('users', { ...u, status: nextStatus });
    if (u.role === 'mitra') {
      const allM = getFromDB<Mitra>('mitra');
      const targetM = allM.find((m) => m.userId === u.id || m.email.toLowerCase() === u.email.toLowerCase());
      if (targetM) {
        updateInDB<Mitra>('mitra', { ...targetM, statusKerjaSama: nextStatus === 'active' ? 'aktif' : 'nonaktif' });
      }
    }
    reloadAll();
    triggerToast('success', nextStatus === 'active' ? `Akun "${u.name}" diaktifkan.` : `Akun "${u.name}" dinonaktifkan.`);
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
    if (jenis === 'lowongan' || (item && item.jenis === 'lowongan')) {
      openLowonganForm();
      return;
    }
    if (jenis === 'job_fair' || (item && item.jenis === 'job_fair')) {
      openJfModal();
      return;
    }
    if (jenis === 'campus_hiring' || (item && item.jenis === 'campus_hiring')) {
      openChModal();
      return;
    }
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
      setESubKategori(item.subKategori === 'non-akademik' ? 'non-akademik' : 'akademik');
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
      setENamaInstansi((jenis === 'workshop' || jenis === 'softskill' || jenis === 'seminar') ? 'CDC UM Kendari' : '');
      setELinkLamar(''); setEKategori((jenis || 'berita') === 'presentasi' ? 'internasional' : ''); setEScope('LOKAL');
      setEGaji(''); setEKuota(''); setEDeadline(''); setELinkCta(''); setEStatus('published');
      setETanggal('');
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
        beritaEditRef.current.innerHTML = DOMPurify.sanitize(eBody || '', {
          ALLOWED_TAGS: ['p','br','strong','em','u','s','sub','sup','mark','span','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','hr','code','pre','img','figure','figcaption','div'],
          ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','id'],
          ALLOW_DATA_ATTR: false,
          FORBID_TAGS: ['script','style','iframe','object','embed','form','input','button','link','meta'],
          FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','oninput','onsubmit'],
        });
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
  const [lCtaLabel, setLCtaLabel] = useState('Lamar Pekerjaan');
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
      setLCtaLabel(item.ctaLabel && item.ctaLabel.trim() ? item.ctaLabel : 'Lamar Pekerjaan');
      setLJenisPekerjaan(item.jenisPekerjaan || 'full-time');
      setLStatus(item.status === 'draft' ? 'draft' : (item.status === 'closed' ? 'closed' : 'published'));
      setLIsPinned(item.isPinned === true);
    } else {
      setEditLowonganId(null);
      setLJudul(''); setLTipe('magang'); setLNamaInstansi(''); setLKategori('');
      setLLokasi(''); setLGaji('Kompetitif'); setLKuota(''); setLDeadline('');
      setLDeskripsi(''); setLTanggungJawab(''); setLKualifikasi(''); setLKeahlian(''); setLBenefit('');
      setLPosterUrl(''); setLLinkEksternal(''); setLCtaEnabled(false); setLCtaLabel('Lamar Pekerjaan'); setLJenisPekerjaan('full-time'); setLStatus('draft');
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
      mitraId: editLowonganId ? (existing?.mitraId && existing.mitraId !== 'admin_cdc' ? existing.mitraId : undefined) : undefined,
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
      ctaLabel: lCtaEnabled ? (lCtaLabel.trim() || 'Lamar Pekerjaan') : undefined,
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
    const isWysiwyg = eJenis === 'berita';
    const rawBody = (isWysiwyg && beritaEditRef.current)
      ? (beritaEditRef.current.innerHTML || '')
      : eBody;
    // Sanitasi tag list kosong (ul/ol tanpa isi teks) agar tidak meninggalkan titik liar
    const sanitizedBody = rawBody.replace(/<(ul|ol)[^>]*>\s*(<li>\s*(<br\s*\/?>)?\s*<\/li>\s*)*<\/\1>/gi, '').trim();

    // Periksa apakah ada konten teks atau gambar
    const hasContent = isWysiwyg
      ? (sanitizedBody.replace(/<[^>]*>/g, '').trim().length > 0 || /<img/i.test(sanitizedBody))
      : eBody.trim().length > 0;

    const isBodyRequired = eJenis === 'berita';
    if (isBodyRequired && !hasContent) {
      setSaveError('Isi konten berita wajib diisi. Tambahkan teks atau gambar di editor di atas.');
      triggerToast('error', 'Berita harus memiliki isi konten (teks atau gambar).');
      return;
    }
    if (THUMB_REQUIRED[eJenis] && !eThumbnail) {
      setSaveError(`Thumbnail / Poster wajib diunggah untuk ${JENIS_LABEL[eJenis]}. Gunakan panel upload gambar di atas.`);
      triggerToast('error', `${JENIS_LABEL[eJenis]} wajib upload thumbnail. ` + (eJenis === 'berita' ? 'Tanpa thumbnail, berita tidak akan muncul di beranda.' : ''));
      return;
    }
    if ((eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') && !eTanggal) {
      setSaveError('Tanggal Pelaksanaan wajib diisi untuk konten event layanan. Klik ikon kalender dan pilih tanggal.');
      triggerToast('error', 'Tanggal Pelaksanaan wajib diisi untuk konten event layanan.');
      return;
    }
    // Validasi tambahan: judul tidak boleh kosong (sudah di baris 1577, tapi beri pesan lebih jelas)
    if (!eJudul.trim()) {
      setSaveError('Judul konten wajib diisi.');
      triggerToast('error', 'Judul konten tidak boleh kosong.');
      return;
    }
    const now = new Date().toISOString();
    const finalBody = isWysiwyg
      ? DOMPurify.sanitize(sanitizedBody, {
          ALLOWED_TAGS: ['p','br','strong','em','u','s','sub','sup','mark','span','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','hr','code','pre','img','figure','figcaption','div'],
          ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','id'],
          ALLOW_DATA_ATTR: false,
          FORBID_TAGS: ['script','style','iframe','object','embed','form','input','button','link','meta'],
          FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','oninput','onsubmit'],
        })
      : eBody;
    const base: KontenKarir = {
      id: editId || `kk_${Date.now()}`,
      jenis: eJenis,
      judul: eJudul.trim(),
      body: finalBody,
      penulis: eJenis === 'berita' ? (ePenulis.trim() || user.name) : undefined,
      namaInstansi: (eJenis === 'lowongan' || eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? (eNamaInstansi.trim() || 'CDC UM Kendari') : undefined,
      tipe: eJenis === 'lowongan' ? eTipe : undefined,
      linkLamar: eJenis === 'lowongan' ? eLinkLamar.trim() : undefined,
      kategori: (eJenis === 'lowongan' || eJenis === 'program' || eJenis === 'presentasi') ? eKategori.trim() : undefined,
      gaji: eJenis === 'lowongan' ? eGaji.trim() : undefined,
      kuota: eJenis === 'lowongan' && eKuota ? Number(eKuota) : undefined,
      deadline: eJenis === 'lowongan' ? eDeadline : undefined,
      linkCta: eJenis === 'program' ? (eLinkCta.trim() || undefined) : undefined,
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
      // Field khusus event layanan (workshop / softskill / seminar) — permanen: hanya tanggal, sisanya dihapus
      tanggal: (eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar') ? eTanggal : undefined,
      waktu: undefined,
      lokasiEvent: undefined,
      pembicara: undefined,
      kuotaEvent: undefined,
      terdaftar: undefined,
      linkDaftar: undefined,
      statusEvent: undefined,
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
    setKontenSub('riwayat');
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
    // Jika isi sudah berupa HTML (berita yang diedit via WYSIWYG), sanitize ketat via DOMPurify.
    // Berita lama (markdown) tetap diparse seperti biasa.
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      const clean = DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: ['p','br','strong','em','u','s','sub','sup','mark','span','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','hr','code','pre','img','figure','figcaption','div'],
        ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','id'],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script','style','iframe','object','embed','form','input','button','link','meta'],
        FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','oninput','onsubmit'],
      });
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
  // Output disanitasi DOMPurify — jangan pernah assign innerHTML mentah dari data tersimpan.
  function markdownToHtml(md: string): string {
    if (!md) return '';
    if (/<[a-z][\s\S]*>/i.test(md)) {
      return DOMPurify.sanitize(md, {
        ALLOWED_TAGS: ['p','br','strong','em','u','s','sub','sup','mark','span','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','hr','code','pre','img','figure','figcaption','div'],
        ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','id'],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script','style','iframe','object','embed','form','input','button','link','meta'],
        FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','oninput','onsubmit'],
      });
    }
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

  // ===== CAMPUS HIRING HELPERS =====
  const openChModal = (item?: CampusHiringItem) => {
    if (item) {
      setEditChId(item.id);
      setChJudul(item.judul);
      setChLogoUrl(item.logoPerusahaan || '');
      setChBannerUrl(item.bannerUrl || '');
      setChPosterAspect(item.posterAspect || '16:9');
      setChDeskripsi(item.deskripsi || '');
    } else {
      setEditChId(null);
      setChJudul('');
      setChLogoUrl('');
      setChBannerUrl('');
      setChPosterAspect('16:9');
      setChDeskripsi('');
    }
    setShowChForm(true);
    setKontenSub('pembuatan');
  };

  const handleSaveCh = (e: React.FormEvent) => {
    e.preventDefault();
    const posterUrl = chBannerUrl.trim() || chLogoUrl.trim();
    if (!posterUrl) {
      triggerToast('error', 'Poster (Gambar) Campus Hiring wajib diunggah atau diisi URL-nya.');
      return;
    }

    let currentList = getCampusHiring();
    const now = new Date().toISOString();
    const finalJudul = chJudul.trim() || 'Agenda Campus Hiring CDC UM Kendari';

    if (editChId) {
      currentList = currentList.map((item) =>
        item.id === editChId
          ? {
            ...item,
            judul: finalJudul,
            bannerUrl: posterUrl,
            posterAspect: chPosterAspect,
            deskripsi: chDeskripsi.trim() || undefined
          }
          : item
      );
    } else {
      const newItem: CampusHiringItem = {
        id: `ch_${Date.now()}`,
        judul: finalJudul,
        namaPerusahaan: 'Mitra Perusahaan CDC',
        bannerUrl: posterUrl,
        posterAspect: chPosterAspect,
        tanggal: formatTanggal(now),
        lokasi: 'Aula Gedung Rektorat Lt. 2 UM Kendari',
        tipe: 'on-campus',
        persyaratan: [],
        posisiBuka: [],
        deskripsi: chDeskripsi.trim() || undefined,
        status: 'buka',
        createdAt: now
      };
      currentList.unshift(newItem);
    }

    saveCampusHiring(currentList);
    setCampusHiringItems(currentList);
    reloadAll();
    if (onReloadData) onReloadData();
    setShowChForm(false);
    setKontenSub('riwayat');
    triggerToast('success', editChId ? 'Agenda Campus Hiring diperbarui.' : 'Poster Campus Hiring berhasil dipublikasikan.');
  };

  const handleDeleteCh = (item: CampusHiringItem) => {
    if (confirm(`Hapus agenda Campus Hiring "${item.judul}"?`)) {
      const currentList = getCampusHiring().filter((i) => i.id !== item.id);
      saveCampusHiring(currentList);
      setCampusHiringItems(currentList);
      reloadAll();
      if (onReloadData) onReloadData();
      triggerToast('success', 'Agenda berhasil dihapus.');
    }
  };

  const handleChBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        triggerToast('error', 'Ukuran file gambar maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setChBannerUrl(ev.target?.result as string);
        triggerToast('success', 'Banner berhasil dimuat.');
      };
      reader.readAsDataURL(file);
    }
  };

  // ===== JOB FAIR HELPERS =====
  const openJfModal = (item?: JobFairItem) => {
    if (item) {
      setEditJfId(item.id);
      setJfJudul(item.judul);
      setJfBannerUrl(item.bannerUrl || '');
      setJfPosterAspect(item.posterAspect || '16:9');
      setJfDeskripsi(item.deskripsi || '');
    } else {
      setEditJfId(null);
      setJfJudul('');
      setJfBannerUrl('');
      setJfPosterAspect('16:9');
      setJfDeskripsi('');
    }
    setShowJfForm(true);
    setKontenSub('pembuatan');
  };

  const handleSaveJf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jfBannerUrl.trim()) {
      triggerToast('error', 'Poster (Gambar) Job Fair wajib diunggah atau diisi URL-nya.');
      return;
    }

    let currentList = getJobFair();
    const now = new Date().toISOString();
    const finalJudul = jfJudul.trim() || 'Job Fair & Career Expo CDC UM Kendari';

    if (editJfId) {
      currentList = currentList.map((item) =>
        item.id === editJfId
          ? {
            ...item,
            judul: finalJudul,
            bannerUrl: jfBannerUrl.trim(),
            posterAspect: jfPosterAspect,
            deskripsi: jfDeskripsi.trim() || undefined
          }
          : item
      );
    } else {
      const newItem: JobFairItem = {
        id: `jf_${Date.now()}`,
        judul: finalJudul,
        bannerUrl: jfBannerUrl.trim(),
        posterAspect: jfPosterAspect,
        tanggalMulai: formatTanggal(now),
        tanggalSelesai: formatTanggal(now),
        lokasi: 'Auditorium Utama UM Kendari',
        htm: 'Gratis Khusus Mahasiswa & Alumni UM Kendari',
        perusahaanPeserta: [],
        deskripsi: jfDeskripsi.trim() || undefined,
        status: 'buka',
        createdAt: now
      };
      currentList.unshift(newItem);
    }

    saveJobFair(currentList);
    setJobFairItems(currentList);
    reloadAll();
    if (onReloadData) onReloadData();
    setShowJfForm(false);
    setKontenSub('riwayat');
    triggerToast('success', editJfId ? 'Job Fair diperbarui.' : 'Poster Job Fair berhasil dipublikasikan.');
  };

  const handleDeleteJf = (item: JobFairItem) => {
    if (confirm(`Hapus Job Fair "${item.judul}"?`)) {
      const currentList = getJobFair().filter((i) => i.id !== item.id);
      saveJobFair(currentList);
      setJobFairItems(currentList);
      reloadAll();
      if (onReloadData) onReloadData();
      triggerToast('success', 'Job Fair berhasil dihapus.');
    }
  };

  const handleJfBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        triggerToast('error', 'Ukuran file gambar maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setJfBannerUrl(ev.target?.result as string);
        triggerToast('success', 'Banner berhasil dimuat.');
      };
      reader.readAsDataURL(file);
    }
  };

  /* =========================================================
   *  LAYOUT
   * =======================================================*/
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans" id="admin-dashboard">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* 1. SideNavBar (Fixed Left Full-Height Drawer - 250px) Sesuai Referensi Google Stitch */}
      <aside className={`fixed left-0 top-0 h-full w-[250px] bg-[#1B365D] text-white border-r border-slate-800 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Branding Sidebar (Logo CDC Terpusat / Centered & Lebih Besar Proporsional - h-20) */}
          <div className="h-20 px-4 border-b border-slate-800/60 flex items-center justify-center relative shrink-0">
            <img
              src="/logo-cdc-sidebar-clean.png"
              alt="Logo CDC UM Kendari"
              className="h-11 sm:h-12 max-w-[200px] w-auto object-contain block shrink-0 transition-all"
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo-cdc-branding-light.png'; }}
            />
            <button className="absolute right-4 md:hidden text-slate-400 hover:text-white p-1 shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vertical Menu Scrollable List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
            {MENU.map((section, idx) => {
              const isCollapsible = !!section.collapsible;
              const isOpen = expandedGroups[section.group] ?? true;
              return (
                <div key={section.group} className={idx > 0 ? 'pt-3 border-t border-slate-800/50' : ''}>
                  {isCollapsible ? (
                    <button
                      type="button"
                      onClick={() => setExpandedGroups((g) => ({ ...g, [section.group]: !isOpen }))}
                      className="w-full flex items-center justify-between px-3 py-1 mb-1 group cursor-pointer"
                    >
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition">{section.group}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </button>
                  ) : (
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 px-3">{section.group}</div>
                  )}
                  {isOpen && (
                    <div className="flex flex-col gap-1">
                      {section.items.map((menu) => {
                        const active = activeTab === menu.id;
                        return (
                          <button
                            key={menu.id}
                            id={`adm-tab-${menu.id}`}
                            onClick={() => { setActiveTab(menu.id); setIsMobileMenuOpen(false); }}
                            className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${active
                                ? 'bg-[#0077C6] text-white font-extrabold shadow-md shadow-blue-950/20 border-l-4 border-amber-400'
                                : 'text-slate-300 hover:text-white hover:bg-white/5 font-semibold'
                              }`}
                          >
                            <span className={`transition-transform duration-200 ${active ? 'text-amber-400 scale-110' : 'text-slate-400 group-hover:text-white'}`}>{menu.icon}</span>
                            <span className="text-xs truncate">{menu.label}</span>
                            {menu.id === 'komentar' && pendingKomentarCount > 0 && (
                              <span className="ml-auto bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">{pendingKomentarCount}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Sidebar Profile Info & Logout */}
          <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 truncate">{user.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Super Admin</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* 2. TopNavBar Header (Fixed Top Navbar: height h-20) */}
      <header className="fixed top-0 right-0 left-0 md:left-[250px] h-20 bg-white border-b border-slate-200/80 z-30 px-6 sm:px-8 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <button
            className="md:hidden text-slate-700 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar (Berada tepat di posisi kiri dekat sidebar) */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => setIsCmdPaletteOpen(true)}
              placeholder="Cari modul atau aksi cepat... (Ctrl+K)"
              className="w-full pl-10 pr-14 py-2.5 bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 shadow-2xs">Ctrl K</kbd>
          </div>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-extrabold text-slate-900 leading-tight">{user.name}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Super Administrator</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* 3. Main Workspace Canvas Area (pt-[60px] untuk menggeser isi ke atas dekat Search Bar) */}
      <main className="flex-1 md:ml-[250px] pt-[60px] px-4 sm:px-8 pb-12 overflow-y-auto max-w-[1600px] w-full" id="adm-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 pt-0"
          >
            {activeTab === 'ringkasan' && (
              <div className="space-y-6" id="adm-ringkasan">
                <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ringkasan Laporan</h1>
                    <p className="text-xs text-slate-500 mt-1">Ringkasan statistik operasional portal karir CDC UM Kendari secara real-time.</p>
                  </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" id="adm-stat-cards">
                  {[
                    { label: 'Mitra Industri Aktif', value: mitra.length, sub: 'Mitra terverifikasi &amp; bekerja sama', Icon: Users, goto: () => { setActiveTab('mitra'); setMitraSub('list'); } },
                    { label: 'Approval Pengajuan Mitra', value: totalMenunggu, sub: 'Menunggu peninjauan admin', Icon: Clock, goto: () => { setActiveTab('mitra'); setMitraSub('approval'); } },
                    { label: 'Total Konten & Loker', value: konten.length, sub: 'Postingan terbit di publik', Icon: Layers, goto: () => { setActiveTab('konten'); setKontenSub('riwayat'); } }
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={s.goto}
                      className="text-left bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer space-y-4 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0055A5] flex items-center justify-center font-bold shadow-2xs border border-blue-100 group-hover:scale-105 transition-transform">
                          <s.Icon className="w-5 h-5 text-[#0055A5]" />
                        </div>
                        <span className="text-[11px] font-extrabold text-[#0055A5] uppercase tracking-wider group-hover:underline">KELOLA →</span>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">{s.value}</div>
                        <div className="text-xs font-extrabold text-slate-800 mt-1">{s.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Grafik frekuensi & Aktivitas Terkini */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#0055A5]" /> Frekuensi Publikasi Konten &amp; Lowongan
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Tren intensitas publikasi informasi karir CDC UM Kendari</p>
                      </div>
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                        {([
                          { id: 'harian', label: '14 Hari' },
                          { id: 'mingguan', label: '12 Minggu' },
                          { id: 'bulanan', label: '6 Bulan' }
                        ] as const).map((iv) => (
                          <button
                            key={iv.id}
                            onClick={() => setFreqInterval(iv.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${freqInterval === iv.id ? 'bg-[#0055A5] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            {iv.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <ChartArea data={freqData.map((b) => b.count)} labels={freqData.map((b) => b.label)} color="#0055A5" />
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between" id="adm-aktivitas">
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <Activity className="w-5 h-5 text-[#0055A5]" /> Timeline Aktivitas
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Log riwayat aksi sistem terbaru</p>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-auto no-scrollbar">
                        {aktivitas.length === 0 ? (
                          <div className="text-xs text-slate-400 py-8 text-center">Belum ada catatan aktivitas.</div>
                        ) : aktivitas.map((a, i) => (
                          <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-[#0055A5] shrink-0" />
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-xs font-bold text-slate-800 line-clamp-2">{a.text}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{formatTanggal(a.date)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setActiveTab('konten'); setKontenSub('riwayat'); }}
                      className="w-full border border-blue-200 text-[#0055A5] hover:bg-blue-50 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>Lihat Semua Aktivitas</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Top 5 Mitra & Berita Terbaru */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" /> Top 5 Mitra Paling Aktif Lowongan
                      </h2>
                    </div>
                    {topMitra.length === 0 ? (
                      <div className="text-xs text-slate-400 py-8 text-center">Belum ada data mitra aktif.</div>
                    ) : topMitra.map((t, i) => (
                      <div key={t.m.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl text-white text-xs font-extrabold flex items-center justify-center ${i === 0 ? 'bg-amber-500 shadow-xs' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-[#1B365D]'}`}>{i + 1}</span>
                          <span className="text-xs font-bold text-slate-800 truncate">{t.m.namaInstansi}</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#1B365D] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{t.count} lowongan</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-[#1B365D]" /> Publikasi Berita Terbaru
                      </h2>
                    </div>
                    {konten.filter((k) => k.jenis === 'berita').length === 0 ? (
                      <div className="text-xs text-slate-400 py-8 text-center">Belum ada publikasi berita.</div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-auto no-scrollbar">
                        {[...konten].filter((k) => k.jenis === 'berita').sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6).map((k) => (
                          <div key={k.id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-2.5 hover:border-blue-200 hover:bg-blue-50/40 transition">
                            {k.thumbnail ? <img src={k.thumbnail} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0" /> : <div className="w-14 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><Newspaper className="w-4 h-4 text-slate-400" /></div>}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 truncate">{k.judul}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{formatTanggal(k.createdAt)} · <span className="text-emerald-600 font-bold uppercase">{k.status}</span></div>
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
                {/* Header Title & Breadcrumb Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0077C6] uppercase tracking-wider mb-1">
                      <span>Konten Karir</span>
                      {selectedCategory && (
                        <>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-700">{JENIS_LABEL[selectedCategory]}</span>
                        </>
                      )}
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {kontenSub === 'pembuatan'
                        ? `Form Pembuatan ${selectedCategory ? JENIS_LABEL[selectedCategory] : 'Konten'}`
                        : selectedCategory
                          ? `Riwayat ${JENIS_LABEL[selectedCategory]}`
                          : 'Kategori Konten Karir'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      {kontenSub === 'pembuatan'
                        ? 'Lengkapi form dan isi editor di bawah untuk mempublikasikan konten.'
                        : selectedCategory
                          ? `Kelola daftar postingan dan riwayat publikasi ${JENIS_LABEL[selectedCategory]} CDC UM Kendari.`
                          : 'Pilih salah satu kategori konten karir di bawah ini untuk melihat riwayat atau membuat postingan baru.'}
                    </p>
                  </div>

                  {/* Right Header Navigation Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    {(kontenSub === 'pembuatan' || editorOpen || showLowonganForm || showJfForm || showChForm || selectedCategory !== null) && (
                      <button
                        onClick={() => {
                          if (kontenSub === 'pembuatan' || editorOpen || showLowonganForm || showJfForm || showChForm) {
                            setKontenSub('riwayat');
                            setEditorOpen(false);
                            setShowLowonganForm(false);
                            setShowJfForm(false);
                            setShowChForm(false);
                          } else if (selectedCategory !== null) {
                            setSelectedCategory(null);
                          }
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-2 cursor-pointer shadow-2xs"
                      >
                        ← Kembali
                      </button>
                    )}
                  </div>
                </div>

                {/* MODE 1: GRID KARTU KATEGORI KONTEN (Saat belum memilih kategori & di tab riwayat) */}
                {kontenSub === 'riwayat' && selectedCategory === null && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="adm-konten-kategori-grid">
                    {(Object.keys(JENIS_LABEL) as JenisKonten[]).map((jenis) => {
                      const count = (konten.filter((k) => k.jenis === jenis).length) 
                        + (jenis === 'lowongan' ? adminLowongan.length : 0)
                        + (jenis === 'job_fair' ? getJobFair().length : 0)
                        + (jenis === 'campus_hiring' ? getCampusHiring().length : 0);
                      return (
                        <button
                          key={jenis}
                          onClick={() => {
                            setSelectedCategory(jenis);
                            setKontenJenisFilter(jenis);
                            setKontenSub('riwayat');
                            setShowJfForm(false);
                            setShowChForm(false);
                          }}
                          className="text-left bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-400/80 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                        >
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-50/40 rounded-full blur-2xl group-hover:bg-blue-100/60 transition-colors pointer-events-none" />
                          <div className="flex items-center justify-between relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#0077C6] flex items-center justify-center font-bold border border-slate-200/60 group-hover:bg-[#0077C6] group-hover:text-white group-hover:border-[#0077C6] transition-all shadow-2xs">
                              {JENIS_ICON[jenis]}
                            </div>
                            <span className="bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#0077C6] text-[11px] font-extrabold px-3 py-1 rounded-full transition-colors border border-slate-200/60 group-hover:border-blue-200">
                              {count} Postingan
                            </span>
                          </div>
                          <div className="relative z-10">
                            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0077C6] transition-colors flex items-center justify-between">
                              <span>{JENIS_LABEL[jenis]}</span>
                            </h3>
                            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-normal">
                              {CATEGORY_DESCS[jenis]}
                            </p>
                          </div>
                          <div className="pt-3 flex items-center justify-between border-t border-slate-100 relative z-10">
                            <span className="text-xs font-extrabold text-[#0077C6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                              Lihat Riwayat &amp; Kelola →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MODE 2: RIWAYAT KONTEN KATEGORI SPESIFIK */}
                {kontenSub === 'riwayat' && selectedCategory !== null && (
                  <div className="space-y-4" id="adm-konten-riwayat">
                    {/* Khusus Kategori Prestasi: Pengaturan Nomor WA Admin */}
                    {selectedCategory === 'presentasi' && (
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
                    )}

                    {/* Khusus Kategori Pengumuman: Form Pengaturan Pengumuman Penting Beranda (Foto + Teks & Blue Theme) */}
                    {selectedCategory === 'pengumuman' && (
                      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1e293b] to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-blue-400/40 shadow-2xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-400/30">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
                              <Megaphone className="w-6 h-6 animate-pulse text-blue-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-md border border-blue-400/40 shadow-2xs">
                                  Konfigurasi Beranda Utama
                                </span>
                                <span className="text-xs text-blue-200/80">Database: 'pengumuman'</span>
                              </div>
                              <h3 className="text-lg font-black text-white mt-0.5">
                                Form Pengumuman Penting Beranda (Foto + Teks)
                              </h3>
                              <p className="text-xs text-blue-100/90">
                                Atur notifikasi mendesak, banner poster, teks badge header, serta logo Megaphone di bagian atas Beranda Publik.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSavePengumumanPenting()}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-blue-400/30"
                          >
                            <Save className="w-4 h-4 text-white" />
                            Simpan Pengumuman Penting
                          </button>
                        </div>

                        {/* GRID FORM INPUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* SISI KIRI: INPUT FORM */}
                          <div className="lg:col-span-7 space-y-5">
                            
                            {/* 1. TOGGLE SAKELAR STATUS PUBLIKASI (isImportant) */}
                            <div className="bg-slate-800/80 border border-blue-900/50 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                              <div className="space-y-0.5">
                                <label className="text-xs font-extrabold text-white flex items-center gap-2 cursor-pointer">
                                  <Sliders className="w-4 h-4 text-blue-400" />
                                  Tampilkan Banner Pengumuman Penting di Beranda Utama
                                </label>
                                <p className="text-[11px] text-slate-300">
                                  Aktifkan notifikasi mendesak di bagian paling atas beranda publik.
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={annIsImportant}
                                  onChange={(e) => setAnnIsImportant(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            {/* 2. KONTROL BADGE HEADER (TAMPIL BADGE, TEKS BADGE, IKON MEGAPHONE) */}
                            <div className="bg-slate-800/80 border border-blue-900/50 p-4 rounded-2xl space-y-3.5 shadow-sm">
                              <div className="text-xs font-bold text-blue-200 border-b border-slate-700 pb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                Pengaturan Badge Header & Logo Megaphone
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Toggle Sakelar Tampilkan Badge Header */}
                                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <label className="text-xs font-bold text-white block cursor-pointer">
                                      Badge Header
                                    </label>
                                    <span className="text-[10px] text-slate-400 block">Tampilkan badge teks di atas pengumuman</span>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={annShowBadge}
                                      onChange={(e) => setAnnShowBadge(e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                  </label>
                                </div>

                                {/* Toggle Sakelar Logo / Ikon Megaphone */}
                                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <label className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                                      Logo Megaphone
                                    </label>
                                    <span className="text-[10px] text-slate-400 block">Aktifkan/nonaktifkan ikon Megaphone</span>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={annShowBadgeIcon}
                                      onChange={(e) => setAnnShowBadgeIcon(e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                  </label>
                                </div>
                              </div>

                              {/* Input Teks Narasi Badge Kustom */}
                              {annShowBadge && (
                                <div className="space-y-1 pt-1">
                                  <label className="text-[11px] font-bold text-blue-200 block">
                                    Teks Narasi Badge Header (mis. "PENGUMUMAN SANGAT PENTING" / "NOTIFIKASI MENDESAK")
                                  </label>
                                  <input
                                    type="text"
                                    value={annBadgeText}
                                    onChange={(e) => setAnnBadgeText(e.target.value)}
                                    placeholder="PENGUMUMAN SANGAT PENTING"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                  />
                                </div>
                              )}
                            </div>

                            {/* 3. PILIHAN LAYOUT PENAYANGAN (displayType) */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-blue-200 block">
                                Pilihan Layout Penayangan Banner (displayType)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setAnnDisplayType('poster')}
                                  className={`p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-3 border text-left cursor-pointer ${
                                    annDisplayType === 'poster'
                                      ? 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-md'
                                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${annDisplayType === 'poster' ? 'border-blue-400 bg-blue-500' : 'border-slate-600'}`}>
                                    {annDisplayType === 'poster' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-xs text-white">Model Poster / Visual ('poster')</div>
                                    <div className="text-[10px] text-slate-300 font-normal">Banner foto utama berukuran besar/proporsional + judul + teks</div>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAnnDisplayType('badge')}
                                  className={`p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-3 border text-left cursor-pointer ${
                                    annDisplayType === 'badge'
                                      ? 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-md'
                                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${annDisplayType === 'badge' ? 'border-blue-400 bg-blue-500' : 'border-slate-600'}`}>
                                    {annDisplayType === 'badge' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-xs text-white">Model Badge Khusus ('badge')</div>
                                    <div className="text-[10px] text-slate-300 font-normal">Banner hijau ringkas dengan ikon Megaphone + judul + teks singkat</div>
                                  </div>
                                </button>
                              </div>
                            </div>

                            {/* 4. MODUL UPLOAD FOTO BANNER / POSTER (posterUrl) */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-blue-200 flex items-center justify-between">
                                <span>Foto Banner / Poster Pengumuman (posterUrl)</span>
                                <span className="text-[10px] text-slate-300 font-normal">Wajib diisi jika memilih Model Poster</span>
                              </label>
                              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <label className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-xs border border-blue-400/30">
                                    <Upload className="w-4 h-4" />
                                    Upload Foto/Poster Pengumuman
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadAnnPoster(file);
                                      }}
                                    />
                                  </label>
                                  {annPosterUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setAnnPosterUrl('')}
                                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-300">Atau Teks URL Gambar Eksternal:</label>
                                  <input
                                    type="text"
                                    value={annPosterUrl}
                                    onChange={(e) => setAnnPosterUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/... atau Data URL"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 5. INPUT TEKS PENGUMUMAN */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-blue-200 block">
                                  Judul Pengumuman Penting (annTitle) <span className="text-rose-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={annTitle}
                                  onChange={(e) => setAnnTitle(e.target.value)}
                                  placeholder="PENGUMUMAN PENDAFTARAN JOB FAIR & RECRUITMENT DAY 2027"
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-blue-200 block">
                                  Isi Deskripsi Pengumuman Detail (annContent)
                                </label>
                                <textarea
                                  rows={4}
                                  value={annContent}
                                  onChange={(e) => setAnnContent(e.target.value)}
                                  placeholder="Tuliskan detail informasi pengumuman resmi di sini..."
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              </div>
                            </div>

                            {/* 6. INPUT TAUTAN TUJUAN / CALL TO ACTION */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-blue-200 block">
                                  URL Tautan / Pendaftaran (annLinkUrl)
                                </label>
                                <input
                                  type="text"
                                  value={annLinkUrl}
                                  onChange={(e) => setAnnLinkUrl(e.target.value)}
                                  placeholder="https://forms.gle/..."
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-blue-200 block">
                                  Label Tombol CTA (annLinkLabel)
                                </label>
                                <input
                                  type="text"
                                  value={annLinkLabel}
                                  onChange={(e) => setAnnLinkLabel(e.target.value)}
                                  placeholder="Daftar Sekarang / Buka Tautan Resmi"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              </div>
                            </div>

                          </div>

                          {/* SISI KANAN: PRATINJAU LANGSUNG (LIVE PREVIEW) */}
                          <div className="lg:col-span-5 space-y-3">
                            <label className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-blue-400" />
                              Pratinjau Tampilan Beranda Utama (Live Preview)
                            </label>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2">
                                <span>Simulasi Tampilan Publik</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${annIsImportant ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'}`}>
                                  {annIsImportant ? 'STATUS: AKTIF DIBERANDA' : 'STATUS: NONAKTIF'}
                                </span>
                              </div>

                              {annDisplayType === 'poster' && annPosterUrl ? (
                                <div className="rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-900 group">
                                  <img
                                    src={annPosterUrl}
                                    alt="Poster Preview"
                                    className="w-full h-44 object-cover object-center"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-3.5 text-white">
                                    {annShowBadge && (
                                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded w-max uppercase tracking-wider mb-1 flex items-center gap-1">
                                        {annShowBadgeIcon && <Megaphone className="w-3 h-3 text-slate-950 animate-pulse" />}
                                        {annBadgeText || 'PENGUMUMAN SANGAT PENTING'}
                                      </span>
                                    )}
                                    <h4 className="text-xs font-extrabold text-white line-clamp-1">
                                      {annTitle || 'Judul Pengumuman...'}
                                    </h4>
                                    <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                                      {annContent || 'Isi deskripsi pengumuman...'}
                                    </p>
                                    {annLinkUrl && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                                          {annLinkLabel || 'Buka Tautan'} <ExternalLink className="w-3 h-3" />
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 rounded-2xl border border-emerald-200 p-4 text-slate-900 space-y-2">
                                  <div className="flex items-center gap-2">
                                    {annShowBadgeIcon && (
                                      <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                                        <Megaphone className="w-4 h-4 animate-pulse text-slate-950" />
                                      </div>
                                    )}
                                    {annShowBadge && (
                                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                        {annBadgeText || 'PENGUMUMAN PENTING'}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                                    {annTitle || 'Judul Pengumuman...'}
                                  </h4>
                                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                    {annContent || 'Isi deskripsi pengumuman...'}
                                  </p>
                                  {annLinkUrl && (
                                    <div className="pt-1">
                                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-lg shadow-2xs">
                                        {annLinkLabel || 'Buka Tautan'} <ExternalLink className="w-3 h-3" />
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSavePengumumanPenting()}
                                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
                                >
                                  <Save className="w-4 h-4 text-white" />
                                  Simpan Pengumuman Penting
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Filter Search Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          value={kontenQuery}
                          onChange={(e) => setKontenQuery(e.target.value)}
                          placeholder={`Cari postingan ${JENIS_LABEL[selectedCategory]}...`}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
                        />
                      </div>
                    </div>

                    {/* List Lowongan By Admin jika Kategori Lowongan */}
                    {selectedCategory === 'lowongan' && adminLowongan.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Lowongan By Admin ({adminLowongan.length})</div>
                        {adminLowongan.map((l) => (
                          <div key={l.id} className="bg-blue-50/40 rounded-xl border border-blue-200 shadow-sm p-4 flex items-center gap-4">
                            {l.flyer || l.imageUrl ? (
                              <img src={l.flyer || l.imageUrl} alt="" className="w-16 h-20 object-cover object-center rounded-xl flex-shrink-0" />
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

                    {/* List Job Fair jika Kategori Job Fair */}
                    {selectedCategory === 'job_fair' && (() => {
                      const jfList = getJobFair().filter(item => !kontenQuery || item.judul.toLowerCase().includes(kontenQuery.toLowerCase()));
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Postingan Job Fair &amp; Expo ({jfList.length})</span>
                          </div>
                          {jfList.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-2">
                              <Ticket className="w-10 h-10 text-emerald-600 mx-auto" />
                              <h4 className="text-sm font-bold text-slate-800">Belum ada poster Job Fair</h4>
                              <p className="text-xs text-slate-500">Klik tombol (+) di sudut kanan bawah untuk membuat poster Job Fair baru.</p>
                            </div>
                          ) : (
                            jfList.map((item) => (
                              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                                {item.bannerUrl ? (
                                  <button onClick={() => setZoomImage(item.bannerUrl!)} className="flex-shrink-0 relative group">
                                    <img src={item.bannerUrl} alt="" className={`w-20 object-cover rounded-xl bg-slate-950 ${item.posterAspect === '9:16' ? 'h-28 object-contain' : 'h-14 object-cover'}`} />
                                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ZoomIn className="w-5 h-5 text-white" /></span>
                                  </button>
                                ) : (
                                  <div className="w-20 h-14 flex-shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Ticket className="w-5 h-5" /></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Job Fair</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Rasio: {item.posterAspect || '16:9'}</span>
                                  </div>
                                  <div className="font-bold text-slate-800 truncate">{item.judul}</div>
                                  <div className="text-[11px] text-slate-400">{item.tanggalMulai} · {item.lokasi}</div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button onClick={() => openJfModal(item)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                                  <button onClick={() => handleDeleteJf(item)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}

                    {/* List Campus Hiring jika Kategori Campus Hiring */}
                    {selectedCategory === 'campus_hiring' && (() => {
                      const chList = getCampusHiring().filter(item => !kontenQuery || item.judul.toLowerCase().includes(kontenQuery.toLowerCase()) || item.namaPerusahaan.toLowerCase().includes(kontenQuery.toLowerCase()));
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Postingan Campus Hiring ({chList.length})</span>
                          </div>
                          {chList.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-2">
                              <Building2 className="w-10 h-10 text-blue-600 mx-auto" />
                              <h4 className="text-sm font-bold text-slate-800">Belum ada poster Campus Hiring</h4>
                              <p className="text-xs text-slate-500">Klik tombol (+) di sudut kanan bawah untuk membuat poster Campus Hiring baru.</p>
                            </div>
                          ) : (
                            chList.map((item) => (
                              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                                {item.bannerUrl || item.logoPerusahaan ? (
                                  <button onClick={() => setZoomImage(item.bannerUrl || item.logoPerusahaan!)} className="flex-shrink-0 relative group">
                                    <img src={item.bannerUrl || item.logoPerusahaan} alt="" className={`w-20 object-cover rounded-xl bg-slate-950 ${item.posterAspect === '9:16' ? 'h-28 object-contain' : 'h-14 object-cover'}`} />
                                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ZoomIn className="w-5 h-5 text-white" /></span>
                                  </button>
                                ) : (
                                  <div className="w-20 h-14 flex-shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Building2 className="w-5 h-5" /></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">Campus Hiring</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Rasio: {item.posterAspect || '16:9'}</span>
                                  </div>
                                  <div className="font-bold text-slate-800 truncate">{item.judul}</div>
                                  <div className="text-[11px] text-slate-400">{item.namaPerusahaan} · {item.tanggal}</div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button onClick={() => openChModal(item)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                                  <button onClick={() => handleDeleteCh(item)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}

                    {/* List Postingan Filtered By selectedCategory */}
                    <div className="space-y-3">
                      {konten.filter(k => k.jenis === selectedCategory && (!kontenQuery || k.judul.toLowerCase().includes(kontenQuery.toLowerCase()))).length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0077C6] flex items-center justify-center mx-auto font-bold border border-blue-100">
                            {JENIS_ICON[selectedCategory]}
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Belum ada postingan {JENIS_LABEL[selectedCategory]}</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">Klik tombol FAB (+) di kanan bawah untuk membuat postingan {JENIS_LABEL[selectedCategory]} pertama Anda.</p>
                        </div>
                      ) : (
                        konten.filter(k => k.jenis === selectedCategory && (!kontenQuery || k.judul.toLowerCase().includes(kontenQuery.toLowerCase()))).map((k) => (
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
                        ))
                      )}
                    </div>

                    {/* FLOATING ACTION BUTTON (FAB) + UNTUK PEMBUATAN KONTEN KATEGORI */}
                    <button
                      onClick={() => {
                        if (selectedCategory === 'lowongan') {
                          openLowonganForm();
                        } else if (selectedCategory === 'job_fair') {
                          openJfModal();
                        } else if (selectedCategory === 'campus_hiring') {
                          openChModal();
                        } else {
                          setEJenis(selectedCategory);
                          setKontenSub('pembuatan');
                          setEditId(null);
                          setEditorOpen(true);
                        }
                      }}
                      title={`Buat ${JENIS_LABEL[selectedCategory]} Baru`}
                      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#0077C6] hover:bg-blue-600 active:scale-95 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center cursor-pointer group border-2 border-white/20"
                    >
                      <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-slate-800">
                        + Buat {JENIS_LABEL[selectedCategory]} Baru
                      </span>
                    </button>
                  </div>
                )}

                {kontenSub === 'pembuatan' && showJfForm && (
                  <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 space-y-6" id="adm-jf-admin-form">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-emerald-600" />
                          {editJfId ? 'Edit Job Fair & Career Expo' : 'Input Job Fair & Career Expo Baru'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Event Job Fair ini akan tampil di bagian <b>Layanan Job Fair & Expo</b> publik dengan poster rasio 16:9 atau 9:16.</p>
                      </div>
                      <button type="button" onClick={() => { setShowJfForm(false); setKontenSub('riwayat'); }} className="text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveJf} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Judul Event Job Fair <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <input
                            type="text"
                            value={jfJudul}
                            onChange={(e) => setJfJudul(e.target.value)}
                            placeholder="misal: UMK Mega Career Expo & Job Fair Nasional 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Banner / Poster Utama Event * <span className="text-emerald-600 font-bold">(Wajib)</span></label>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <input
                              type="text"
                              value={jfBannerUrl}
                              onChange={(e) => setJfBannerUrl(e.target.value)}
                              placeholder="/poster-cdc-web-umk-2.svg atau https://..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                              <Upload className="w-4 h-4 text-emerald-600" /> Upload Poster
                              <input type="file" accept="image/*" onChange={handleJfBannerUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Format / Rasio Poster *</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setJfPosterAspect('16:9')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                jfPosterAspect === '16:9'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {jfPosterAspect === '16:9' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                              </span>
                              <span>16:9 (Landscape / Horisontal)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setJfPosterAspect('9:16')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                jfPosterAspect === '9:16'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {jfPosterAspect === '9:16' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                              </span>
                              <span>9:16 (Portrait / Pamflet Berdiri)</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Deskripsi Event <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <textarea
                            value={jfDeskripsi}
                            onChange={(e) => setJfDeskripsi(e.target.value)}
                            rows={3}
                            placeholder="Penjelasan deskripsi pameran bursa kerja..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => { setShowJfForm(false); setKontenSub('riwayat'); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" /> Simpan Job Fair
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {kontenSub === 'pembuatan' && showChForm && (
                  <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 space-y-6" id="adm-ch-admin-form">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          {editChId ? 'Edit Agenda Campus Hiring' : 'Input Agenda Campus Hiring Baru'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Event Campus Hiring ini akan tampil di bagian <b>Layanan Campus Hiring</b> publik dengan poster rasio 16:9 atau 9:16.</p>
                      </div>
                      <button type="button" onClick={() => { setShowChForm(false); setKontenSub('riwayat'); }} className="text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCh} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Judul Rekrutmen / Event <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <input
                            type="text"
                            value={chJudul}
                            onChange={(e) => setChJudul(e.target.value)}
                            placeholder="misal: On-Campus Recruitment PT Bank Central Asia Tbk 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Banner / Poster Utama Event * <span className="text-blue-600 font-bold">(Wajib)</span></label>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <input
                              type="text"
                              value={chBannerUrl}
                              onChange={(e) => setChBannerUrl(e.target.value)}
                              placeholder="/poster-cdc-web-umk-1.png atau https://..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                              <Upload className="w-4 h-4 text-blue-600" /> Upload Poster
                              <input type="file" accept="image/*" onChange={handleChBannerUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Format / Rasio Poster *</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setChPosterAspect('16:9')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                chPosterAspect === '16:9'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {chPosterAspect === '16:9' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                              </span>
                              <span>16:9 (Landscape / Horisontal)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setChPosterAspect('9:16')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                chPosterAspect === '9:16'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {chPosterAspect === '9:16' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                              </span>
                              <span>9:16 (Portrait / Pamflet Berdiri)</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Deskripsi Ringkas & Syarat Rekrutmen <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <textarea
                            value={chDeskripsi}
                            onChange={(e) => setChDeskripsi(e.target.value)}
                            rows={3}
                            placeholder="Persyaratan peserta, kualifikasi jurusan, berkas yang wajib dibawa..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => { setShowChForm(false); setKontenSub('riwayat'); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" /> Simpan Campus Hiring
                        </button>
                      </div>
                    </form>
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
                          <div className="space-y-1.5 sm:col-span-2">
                            <LocationPicker value={lLokasi} onChange={setLLokasi} label="Lokasi Penempatan Kerja / Wilayah *" accentColor="blue" />
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
                            <p className="text-[11px] text-slate-500">Aktifkan untuk menampilkan tombol daftar/ajukan lamaran di halaman detail lowongan ini. Jika link tujuan diisi, pelamar akan diarahkan ke tautan tersebut. Jika dikosongkan, pelamar akan diarahkan ke form pengajuan lamaran portal (ke Mitra).</p>

                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${lCtaEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Teks Tombol</label>
                                <input
                                  value={lCtaLabel}
                                  onChange={(e) => setLCtaLabel(e.target.value)}
                                  placeholder="Lamar Pekerjaan"
                                  disabled={!lCtaEnabled}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Link Tujuan (Opsional)</label>
                                <input
                                  value={lLinkEksternal}
                                  onChange={(e) => setLLinkEksternal(e.target.value)}
                                  placeholder="https://forms.gle/... (opsional - kosongkan jika form mitra)"
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
                                className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-start gap-2.5 border cursor-pointer ${eLayoutType === 'card'
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
                                className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 border cursor-pointer ${eLayoutType === 'badge'
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
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 bg-slate-50/60 p-4 rounded-2xl">
                          <div className="sm:col-span-2 text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            Tanggal Kegiatan ({JENIS_LABEL[eJenis]})
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-medium text-slate-700">Tanggal Pelaksanaan *</label>
                            <input value={eTanggal} onChange={(e) => setETanggal(e.target.value)} type="date" required className={`w-full px-3 py-2 rounded-xl border text-sm bg-white ${!eTanggal ? 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-300'}`} />
                            {!eTanggal && <p className="text-[11px] text-rose-500 font-medium">Wajib diisi — pilih tanggal kegiatan.</p>}
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
                        <label className="text-xs font-bold text-rose-700">
                          Thumbnail / Poster <span className="text-rose-600">*WAJIB</span>
                          {eJenis === 'berita' && (
                            <span className="text-slate-500 font-normal ml-1.5">— poster 16:9 berita (tampil di card beranda)</span>
                          )}
                          {eJenis === 'program' && (
                            <span className="text-slate-500 font-normal ml-1.5">— header kartu program (wajib ditampilkan)</span>
                          )}
                          {eJenis === 'lowongan' && (
                            <span className="text-slate-500 font-normal ml-1.5">— poster 9:16 lowongan (tampil di card info karir)</span>
                          )}
                          {eJenis !== 'berita' && eJenis !== 'program' && eJenis !== 'lowongan' && (
                            <span className="text-slate-500 font-normal ml-1.5">— poster kegiatan event (wajib)</span>
                          )}
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4" /> Upload Gambar
                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                          </label>
                          {eThumbnail ? (
                            <img src={eThumbnail} alt="" className={`w-16 object-cover rounded-lg ${eJenis === 'lowongan' ? 'h-24' : 'h-10'}`} />
                          ) : (
                            <div className="w-16 h-10 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
                              Kosong
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 italic">
                            {eJenis === 'berita' ? 'Recomendasikan: 1200x675px (16:9)' :
                             eJenis === 'lowongan' ? 'Recomendasikan: 450x800px (9:16)' :
                             'Gambar kartu beranda'}
                          </span>
                        </div>
                        {!eThumbnail && (
                          <p className="text-[10px] text-rose-500 font-medium mt-0.5">Thumbnail wajib diunggah sebelum disimpan.</p>
                        )}
                      </div>
                    )}

                    {eJenis === 'program' || eJenis === 'presentasi' || eJenis === 'workshop' || eJenis === 'softskill' || eJenis === 'seminar' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">
                          Deskripsi &amp; Detail Kegiatan / Pokok Materi (opsional)
                        </label>
                        <textarea
                          ref={bodyRef}
                          value={eBody}
                          onChange={(e) => setEBody(e.target.value)}
                          rows={10}
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder={
                            eJenis === 'presentasi'
                              ? "Tulis deskripsi singkat capaian presentasi ini..."
                              : "Tulis detail program & pengumuman di sini (opsional). Kosongkan jika klik kartu langsung diarahkan ke link di atas."
                          }
                        />
                        {eBody.trim() && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500">Pratinjau Teks</label>
                            <div className="border border-slate-200 rounded-xl p-4 bg-white max-h-80 overflow-auto no-scrollbar">
                              {renderMedium(eBody)}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-500">
                            Isi Konten (Gaya Medium + Format Word) {eJenis !== 'berita' && '(Opsional — kosongkan jika hanya ingin mengunggah flyer/poster event)'}
                          </label>
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
                          <Dropdown value={eStatus} onChange={(v) => setEStatus(v as any)} size="sm" className="w-32" options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
                          {eJenis === 'berita' && (
                            <span className="text-[10px] text-slate-400 italic">
                              Published = tampil di Beranda
                            </span>
                          )}
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
                <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Mitra</h1>
                    <p className="text-xs text-slate-500 mt-1">Verifikasi pengajuan registrasi mitra industri dan kelola daftar instansi terdaftar.</p>
                  </div>
                </div>

                {/* internal tab */}
                <div className="flex gap-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
                  {([
                    { id: 'approval', label: 'Approval Mitra Baru' },
                    { id: 'list', label: 'Daftar Mitra Terdaftar' }
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMitraSub(t.id)}
                      className={`px-4 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 ${mitraSub === t.id
                          ? 'bg-[#1B365D] text-white shadow-md shadow-blue-950/20 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                        }`}
                    >
                      <span>{t.label}</span>
                      {t.id === 'approval' && pendingMitra.length > 0 && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{pendingMitra.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {mitraSub === 'approval' && (
                  <div className="space-y-4" id="adm-mitra-approval">
                    {pendingMitra.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-2">
                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                        <div className="text-sm font-bold text-slate-700">Semua Pendaftaran Mitra Telah Di-review</div>
                        <div className="text-xs text-slate-400">Tidak ada pengajuan mitra baru yang menunggu approval saat ini.</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Pending Application Cards List */}
                        <div className="lg:col-span-5 space-y-3">
                          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Menunggu Persetujuan ({pendingMitra.length})</span>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">Pending Review</span>
                          </div>
                          {pendingMitra.map((m, idx) => (
                            <div
                              key={m.id}
                              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-[#0077C6] transition cursor-pointer space-y-3 border-l-4 border-l-[#0077C6]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm">{m.namaInstansi}</div>
                                  <div className="text-xs text-[#0077C6] font-semibold mt-0.5">{m.bidangIndustri || 'Industri / Software'}</div>
                                </div>
                                <span className="bg-amber-500/15 text-amber-700 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">Pengajuan Baru</span>
                              </div>
                              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div><strong className="text-slate-700">PIC:</strong> {m.kontakPerson} ({m.phone || '-'})</div>
                                <div><strong className="text-slate-700">Email:</strong> {m.email}</div>
                                <div className="truncate"><strong className="text-slate-700">Alamat:</strong> {m.alamat || '-'}</div>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleApproveMitra(m, approvalNote)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Terima (Approve)
                                </button>
                                <button
                                  onClick={() => handleRejectMitra(m, approvalNote)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" /> Tolak
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Right Column: Detailed Document Verification & Approval Panel */}
                        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-extrabold text-slate-900">Panel Verifikasi Berkas & Legalitas Mitra</h3>
                              <p className="text-xs text-slate-400 mt-0.5">Peninjauan detail profil dan catatan persetujuan admin</p>
                            </div>
                            <span className="bg-blue-50 text-[#0077C6] text-xs font-extrabold px-3 py-1 rounded-xl border border-blue-100">Dokumen Verifikasi</span>
                          </div>

                          {pendingMitra[0] && (
                            <div className="space-y-5">
                              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Identitas Instansi</span>
                                  <span className="text-xs font-mono font-bold text-slate-500">ID: {pendingMitra[0].id}</span>
                                </div>
                                <div className="text-lg font-black text-slate-900">{pendingMitra[0].namaInstansi}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                    <div className="text-slate-400 font-medium">Bidang Industri</div>
                                    <div className="font-bold text-slate-800 mt-0.5">{pendingMitra[0].bidangIndustri || '-'}</div>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                    <div className="text-slate-400 font-medium">Email Resmi</div>
                                    <div className="font-bold text-slate-800 mt-0.5">{pendingMitra[0].email}</div>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                    <div className="text-slate-400 font-medium">Kontak Person (PIC)</div>
                                    <div className="font-bold text-slate-800 mt-0.5">{pendingMitra[0].kontakPerson}</div>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                    <div className="text-slate-400 font-medium">No. Telepon / WA</div>
                                    <div className="font-bold text-slate-800 mt-0.5">{pendingMitra[0].phone || '-'}</div>
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-xs">
                                  <div className="text-slate-400 font-medium">Alamat Lengkap Instansi</div>
                                  <div className="font-bold text-slate-800 mt-0.5">{pendingMitra[0].alamat || '-'}</div>
                                </div>
                              </div>

                              {/* Legalities & Document Viewer */}
                              <div className="space-y-2">
                                <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                                  <span>Dokumen Legalitas Perusahaan (NIB / SIUP)</span>
                                  <span className="text-emerald-600 text-[11px] font-bold">PDF / Gambar Terlampir</span>
                                </label>
                                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-white">NIB_SIUP_Legality_Document.pdf</div>
                                      <div className="text-[10px] text-slate-400">Berkas pendaftaran resmi instansi</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => window.open('/visi-misi-cdc.svg', '_blank')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" /> Pratinjau Berkas
                                  </button>
                                </div>
                              </div>

                              {/* Catatan Approval Admin */}
                              <div className="space-y-2">
                                <label className="text-xs font-extrabold text-slate-700">Catatan Persetujuan / Penolakan Admin (Opsional)</label>
                                <textarea
                                  value={approvalNote}
                                  onChange={(e) => setApprovalNote(e.target.value)}
                                  rows={3}
                                  placeholder="Masukkan catatan resmi persetujuan atau alasan penolakan untuk mitra ini..."
                                  className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] bg-white"
                                />
                              </div>

                              {/* Main Action Buttons */}
                              <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                  onClick={() => handleRejectMitra(pendingMitra[0], approvalNote)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
                                >
                                  <X className="w-4 h-4" /> Tolak Pengajuan Mitra
                                </button>
                                <button
                                  onClick={() => handleApproveMitra(pendingMitra[0], approvalNote)}
                                  className="bg-[#1B365D] hover:bg-[#0077C6] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
                                >
                                  <Check className="w-4 h-4 text-emerald-400" /> Setujui &amp; Aktifkan Akun Mitra
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200/80 pb-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <UserCog className="w-6 h-6 text-[#1B365D]" /> Kelola Akun Administrator
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Pengelolaan akun pengelola portal dan hak akses admin CDC UM Kendari</p>
                  </div>
                  <button
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    className="bg-[#1B365D] hover:bg-[#0077C6] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah Admin Baru
                  </button>
                </div>

                {showAddAdmin && (
                  <form onSubmit={handleAddAdmin} className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap Admin *</label>
                      <input value={aName} onChange={(e) => setAName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]" placeholder="Nama admin" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Resmi *</label>
                      <input value={aEmail} onChange={(e) => { setAEmail(e.target.value); setAEmailError(''); }} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]" placeholder="email@umkendari.ac.id" />
                      {aEmailError && <div className="text-rose-500 text-[11px] font-bold">{aEmailError}</div>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Password (Wajib, min 8 + besar/kecil/angka)</label>
                      <input value={aPass} onChange={(e) => setAPass(e.target.value)} type="password" required minLength={8} autoComplete="new-password" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]" placeholder="Min. 8 karakter, huruf besar + kecil + angka" />
                    </div>
                    <div className="flex items-end gap-2">
                      <button type="submit" className="bg-[#1B365D] hover:bg-[#0077C6] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer">Simpan Admin Baru</button>
                      <button type="button" onClick={() => setShowAddAdmin(false)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">Batal</button>
                    </div>
                  </form>
                )}

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Nama / Email Admin</div>
                    <div className="col-span-3">Status Akun</div>
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
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Surat Keputusan CDC</h1>
                      <p className="text-xs text-slate-500 mt-1">Upload PDF (dengan preview scrollable) atau input tautan link eksternal.</p>
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
              KELOLA HERO SLIDER BERANDA UTAMA
          ══════════════════════════════════════════ */}
            {activeTab === 'hero-slider' && (() => {
              const openSlideModal = (item?: HeroSlideItem) => {
                if (item) {
                  setEditSlideId(item.id);
                  setSlideTitle(item.title);
                  setSlideImageUrl(item.imageUrl);
                  setSlideTargetUrl(item.targetUrl || 'lowongan');
                  setSlideAlt(item.alt || '');
                  setSlideIsActive(item.isActive !== false);
                } else {
                  setEditSlideId(null);
                  setSlideTitle('');
                  setSlideImageUrl('');
                  setSlideTargetUrl('lowongan');
                  setSlideAlt('');
                  setSlideIsActive(true);
                }
                setShowSlideForm(true);
              };

              const handleSaveSlide = (e: React.FormEvent) => {
                e.preventDefault();
                if (!slideTitle.trim()) {
                  triggerToast('error', 'Judul / Label slide wajib diisi.');
                  return;
                }
                if (!slideImageUrl.trim()) {
                  triggerToast('error', 'URL Gambar / Poster wajib diisi atau diunggah.');
                  return;
                }

                let currentList = getHeroSlides();
                const now = new Date().toISOString();

                if (editSlideId) {
                  currentList = currentList.map((item) =>
                    item.id === editSlideId
                      ? {
                        ...item,
                        title: slideTitle.trim(),
                        imageUrl: slideImageUrl.trim(),
                        targetUrl: slideTargetUrl.trim(),
                        alt: slideAlt.trim() || slideTitle.trim(),
                        isActive: slideIsActive
                      }
                      : item
                  );
                } else {
                  const maxOrder = currentList.reduce((max, i) => Math.max(max, i.order || 0), 0);
                  const newSlide: HeroSlideItem = {
                    id: `slide_${Date.now()}`,
                    title: slideTitle.trim(),
                    imageUrl: slideImageUrl.trim(),
                    targetUrl: slideTargetUrl.trim(),
                    alt: slideAlt.trim() || slideTitle.trim(),
                    isActive: slideIsActive,
                    order: maxOrder + 1,
                    createdAt: now
                  };
                  currentList.push(newSlide);
                }

                saveHeroSlides(currentList);
                reloadAll();
                if (onReloadData) onReloadData();
                setShowSlideForm(false);
                triggerToast('success', editSlideId ? 'Slide diperbarui.' : 'Slide baru berhasil ditambahkan.');
              };

              const handleDeleteSlide = (item: HeroSlideItem) => {
                if (confirm(`Hapus slide "${item.title}"?`)) {
                  const currentList = getHeroSlides().filter((i) => i.id !== item.id);
                  saveHeroSlides(currentList);
                  reloadAll();
                  if (onReloadData) onReloadData();
                  triggerToast('success', 'Slide berhasil dihapus.');
                }
              };

              const handleToggleActive = (item: HeroSlideItem) => {
                const currentList = getHeroSlides().map((i) =>
                  i.id === item.id ? { ...i, isActive: !i.isActive } : i
                );
                saveHeroSlides(currentList);
                reloadAll();
                if (onReloadData) onReloadData();
                triggerToast('success', `Status slide "${item.title}" diubah.`);
              };

              const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
                const currentList = [...getHeroSlides()];
                const targetIndex = direction === 'up' ? index - 1 : index + 1;
                if (targetIndex < 0 || targetIndex >= currentList.length) return;

                // Swap order values
                const tempOrder = currentList[index].order;
                currentList[index].order = currentList[targetIndex].order;
                currentList[targetIndex].order = tempOrder;

                // Sort array
                currentList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                saveHeroSlides(currentList);
                reloadAll();
                if (onReloadData) onReloadData();
                triggerToast('success', 'Urutan slide diperbarui.');
              };

              const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 3 * 1024 * 1024) {
                    triggerToast('error', 'Ukuran file gambar maksimal 3MB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setSlideImageUrl(ev.target?.result as string);
                    triggerToast('success', 'File gambar berhasil dimuat.');
                  };
                  reader.readAsDataURL(file);
                }
              };

              return (
                <div className="space-y-6" id="adm-hero-slider">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-[#0077C6]" /> Kelola Hero Slider Beranda Utama
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Atur poster promo, urutan slide, status tampil, dan link tujuan saat slide diklik.
                      </p>
                    </div>
                    <button
                      onClick={() => openSlideModal()}
                      className="bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Banner Slide
                    </button>
                  </div>

                  {/* Form Modal */}
                  {showSlideForm && (
                    <form onSubmit={handleSaveSlide} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-800 text-lg">
                          {editSlideId ? 'Edit Banner Slide' : 'Tambah Banner Slide Baru'}
                        </h3>
                        <button type="button" onClick={() => setShowSlideForm(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Judul / Label Slide *</label>
                          <input
                            type="text"
                            value={slideTitle}
                            onChange={(e) => setSlideTitle(e.target.value)}
                            placeholder="misal: Banner Job Fair CDC 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Target Navigasi / Link Tujuan *</label>
                          <select
                            value={slideTargetUrl}
                            onChange={(e) => setSlideTargetUrl(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            <option value="lowongan">Halaman Katalog Lowongan Kerja &amp; Magang</option>
                            <option value="berita">Halaman Berita &amp; Artikel</option>
                            <option value="tracer-study">Halaman Tracer Study</option>
                            <option value="layanan-bimbingan-karir">Layanan Bimbingan Karir</option>
                            <option value="layanan-magang">Layanan Magang &amp; Kerja</option>
                            <option value="konseling">Bimbingan &amp; Konseling Karir</option>
                            <option value="campus-hiring">Campus Hiring</option>
                            <option value="mou">MoU &amp; Kerjasama</option>
                            <option value="custom">Link Eksternal Kustom (URL HTTP/HTTPS)</option>
                          </select>
                        </div>
                      </div>

                      {slideTargetUrl === 'custom' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">URL Eksternal Kustom *</label>
                          <input
                            type="url"
                            value={slideTargetUrl}
                            onChange={(e) => setSlideTargetUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Gambar Banner Slide (Upload File / Input URL) *</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <input
                            type="text"
                            value={slideImageUrl}
                            onChange={(e) => setSlideImageUrl(e.target.value)}
                            placeholder="/poster-cdc-web-umk-1.svg atau https://..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                            <Upload className="w-4 h-4 text-blue-600" /> Upload File
                            <input type="file" accept="image/*" onChange={handleSlideImageUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {slideImageUrl && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Pratinjau Banner</label>
                          <div className="w-full aspect-[21/9] max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                            <img src={slideImageUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={slideIsActive}
                            onChange={(e) => setSlideIsActive(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-bold text-slate-700">Aktif &amp; Tampilkan di Slider Beranda</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSlideForm(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Save className="w-4 h-4" /> Simpan Slide
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* List Slide Cards */}
                  <div className="space-y-3">
                    {heroSlides.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                        Belum ada slide hero terdaftar. Klik "+ Tambah Banner Slide" untuk membuat banner slider beranda.
                      </div>
                    ) : (
                      heroSlides.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl border ${item.isActive !== false ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'} p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-blue-300`}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-24 h-14 sm:w-32 sm:h-18 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                  {item.isActive !== false ? 'Aktif' : 'Sembunyi'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">Urutan: #{item.order}</span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                Target: <strong className="text-slate-700">{item.targetUrl || 'lowongan'}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => handleMoveOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 rounded-lg transition"
                              title="Naikkan Urutan"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(idx, 'down')}
                              disabled={idx === heroSlides.length - 1}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 rounded-lg transition"
                              title="Turunkan Urutan"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(item)}
                              className={`p-1.5 rounded-lg transition ${item.isActive !== false ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                              title={item.isActive !== false ? 'Sembunyikan' : 'Tampilkan'}
                            >
                              {item.isActive !== false ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openSlideModal(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              title="Edit Slide"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlide(item)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Hapus Slide"
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
              KELOLA CAMPUS HIRING
          ══════════════════════════════════════════ */}
            {activeTab === 'campus-hiring' && (() => {
              const openChModal = (item?: CampusHiringItem) => {
                if (item) {
                  setEditChId(item.id);
                  setChJudul(item.judul);
                  setChLogoUrl(item.logoPerusahaan || '');
                  setChBannerUrl(item.bannerUrl || '');
                  setChPosterAspect(item.posterAspect || '16:9');
                  setChDeskripsi(item.deskripsi || '');
                } else {
                  setEditChId(null);
                  setChJudul('');
                  setChLogoUrl('');
                  setChBannerUrl('');
                  setChPosterAspect('16:9');
                  setChDeskripsi('');
                }
                setShowChForm(true);
              };

              const handleSaveCh = (e: React.FormEvent) => {
                e.preventDefault();
                const posterUrl = chBannerUrl.trim() || chLogoUrl.trim();
                if (!posterUrl) {
                  triggerToast('error', 'Poster (Gambar) Campus Hiring wajib diunggah atau diisi URL-nya.');
                  return;
                }

                let currentList = getCampusHiring();
                const now = new Date().toISOString();
                const finalJudul = chJudul.trim() || 'Agenda Campus Hiring CDC UM Kendari';

                if (editChId) {
                  currentList = currentList.map((item) =>
                    item.id === editChId
                      ? {
                        ...item,
                        judul: finalJudul,
                        bannerUrl: posterUrl,
                        posterAspect: chPosterAspect,
                        deskripsi: chDeskripsi.trim() || undefined
                      }
                      : item
                  );
                } else {
                  const newItem: CampusHiringItem = {
                    id: `ch_${Date.now()}`,
                    judul: finalJudul,
                    namaPerusahaan: 'Mitra Perusahaan CDC',
                    bannerUrl: posterUrl,
                    posterAspect: chPosterAspect,
                    tanggal: formatTanggal(now),
                    lokasi: 'Aula Gedung Rektorat Lt. 2 UM Kendari',
                    tipe: 'on-campus',
                    persyaratan: [],
                    posisiBuka: [],
                    deskripsi: chDeskripsi.trim() || undefined,
                    status: 'buka',
                    createdAt: now
                  };
                  currentList.unshift(newItem);
                }

                saveCampusHiring(currentList);
                reloadAll();
                if (onReloadData) onReloadData();
                setShowChForm(false);
                triggerToast('success', editChId ? 'Agenda Campus Hiring diperbarui.' : 'Agenda Campus Hiring baru berhasil dipublikasikan.');
              };

              const handleDeleteCh = (item: CampusHiringItem) => {
                if (confirm(`Hapus agenda Campus Hiring "${item.judul}"?`)) {
                  const currentList = getCampusHiring().filter((i) => i.id !== item.id);
                  saveCampusHiring(currentList);
                  reloadAll();
                  if (onReloadData) onReloadData();
                  triggerToast('success', 'Agenda berhasil dihapus.');
                }
              };

              const handleChBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 3 * 1024 * 1024) {
                    triggerToast('error', 'Ukuran file gambar maksimal 3MB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setChBannerUrl(ev.target?.result as string);
                    triggerToast('success', 'Banner berhasil dimuat.');
                  };
                  reader.readAsDataURL(file);
                }
              };

              return (
                <div className="space-y-6" id="adm-campus-hiring">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-[#0077C6]" /> Kelola Campus Hiring CDC UMK
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Publikasikan jadwal rekrutmen &amp; wawancara langsung perusahaan mitra di kampus UM Kendari.
                      </p>
                    </div>
                    <button
                      onClick={() => openChModal()}
                      className="bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Campus Hiring
                    </button>
                  </div>

                  {/* Form Modal */}
                  {showChForm && (
                    <form onSubmit={handleSaveCh} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-800 text-lg">
                          {editChId ? 'Edit Agenda Campus Hiring' : 'Tambah Agenda Campus Hiring Baru'}
                        </h3>
                        <button type="button" onClick={() => setShowChForm(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Judul Rekrutmen / Event <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <input
                            type="text"
                            value={chJudul}
                            onChange={(e) => setChJudul(e.target.value)}
                            placeholder="misal: On-Campus Recruitment PT Bank Central Asia Tbk 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Banner / Poster Promo * <span className="text-blue-600 font-bold">(Wajib)</span></label>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <input
                              type="text"
                              value={chBannerUrl}
                              onChange={(e) => setChBannerUrl(e.target.value)}
                              placeholder="/poster-cdc-web-umk-1.svg atau https://..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                              <Upload className="w-4 h-4 text-blue-600" /> Upload Poster
                              <input type="file" accept="image/*" onChange={handleChBannerUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Format / Rasio Poster *</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setChPosterAspect('16:9')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                chPosterAspect === '16:9'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {chPosterAspect === '16:9' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                              </span>
                              <span>16:9 (Landscape / Horisontal)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setChPosterAspect('9:16')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                chPosterAspect === '9:16'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {chPosterAspect === '9:16' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                              </span>
                              <span>9:16 (Portrait / Pamflet Berdiri)</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Deskripsi Singkat Event <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <textarea
                            value={chDeskripsi}
                            onChange={(e) => setChDeskripsi(e.target.value)}
                            rows={3}
                            placeholder="Penjelasan singkat alur seleksi & rekrutmen..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowChForm(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" /> Simpan Campus Hiring
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List Campus Hiring Cards */}
                  <div className="space-y-3">
                    {campusHiringItems.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                        Belum ada agenda Campus Hiring terdaftar. Klik "+ Tambah Campus Hiring" untuk membuat agenda rekrutmen kampus.
                      </div>
                    ) : (
                      campusHiringItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-blue-300"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {item.bannerUrl && (
                              <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                                <img src={item.bannerUrl} alt={item.judul} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 truncate">{item.judul}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                                  {item.namaPerusahaan}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'buka' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                📅 {item.tanggal} ({item.waktu}) · 📍 {item.lokasi}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => openChModal(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCh(item)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
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
              KELOLA JOB FAIR & BURSA KERJA
          ══════════════════════════════════════════ */}
            {activeTab === 'job-fair' && (() => {
              const openJfModal = (item?: JobFairItem) => {
                if (item) {
                  setEditJfId(item.id);
                  setJfJudul(item.judul);
                  setJfBannerUrl(item.bannerUrl || '');
                  setJfPosterAspect(item.posterAspect || '16:9');
                  setJfDeskripsi(item.deskripsi || '');
                } else {
                  setEditJfId(null);
                  setJfJudul('');
                  setJfBannerUrl('');
                  setJfPosterAspect('16:9');
                  setJfDeskripsi('');
                }
                setShowJfForm(true);
              };

              const handleSaveJf = (e: React.FormEvent) => {
                e.preventDefault();
                if (!jfBannerUrl.trim()) {
                  triggerToast('error', 'Poster (Gambar) Job Fair wajib diunggah atau diisi URL-nya.');
                  return;
                }

                let currentList = getJobFair();
                const now = new Date().toISOString();
                const finalJudul = jfJudul.trim() || 'Job Fair & Career Expo CDC UM Kendari';

                if (editJfId) {
                  currentList = currentList.map((item) =>
                    item.id === editJfId
                      ? {
                        ...item,
                        judul: finalJudul,
                        bannerUrl: jfBannerUrl.trim(),
                        posterAspect: jfPosterAspect,
                        deskripsi: jfDeskripsi.trim() || undefined
                      }
                      : item
                  );
                } else {
                  const newItem: JobFairItem = {
                    id: `jf_${Date.now()}`,
                    judul: finalJudul,
                    bannerUrl: jfBannerUrl.trim(),
                    posterAspect: jfPosterAspect,
                    tanggalMulai: formatTanggal(now),
                    tanggalSelesai: formatTanggal(now),
                    lokasi: 'Auditorium Utama UM Kendari',
                    htm: 'Gratis Khusus Mahasiswa & Alumni UM Kendari',
                    perusahaanPeserta: [],
                    deskripsi: jfDeskripsi.trim() || undefined,
                    status: 'buka',
                    createdAt: now
                  };
                  currentList.unshift(newItem);
                }

                saveJobFair(currentList);
                reloadAll();
                if (onReloadData) onReloadData();
                setShowJfForm(false);
                triggerToast('success', editJfId ? 'Job Fair diperbarui.' : 'Job Fair baru berhasil dipublikasikan.');
              };

              const handleDeleteJf = (item: JobFairItem) => {
                if (confirm(`Hapus Job Fair "${item.judul}"?`)) {
                  const currentList = getJobFair().filter((i) => i.id !== item.id);
                  saveJobFair(currentList);
                  reloadAll();
                  if (onReloadData) onReloadData();
                  triggerToast('success', 'Job Fair berhasil dihapus.');
                }
              };

              const handleJfBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 3 * 1024 * 1024) {
                    triggerToast('error', 'Ukuran file gambar maksimal 3MB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setJfBannerUrl(ev.target?.result as string);
                    triggerToast('success', 'Banner berhasil dimuat.');
                  };
                  reader.readAsDataURL(file);
                }
              };

              return (
                <div className="space-y-6" id="adm-job-fair">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-emerald-600" /> Kelola Job Fair &amp; Bursa Kerja CDC UMK
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Publikasikan pameran bursa kerja akbar (Career Expo) beserta daftar perusahaan mitra peserta.
                      </p>
                    </div>
                    <button
                      onClick={() => openJfModal()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Job Fair
                    </button>
                  </div>

                  {/* Form Modal */}
                  {showJfForm && (
                    <form onSubmit={handleSaveJf} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-800 text-lg">
                          {editJfId ? 'Edit Job Fair & Career Expo' : 'Tambah Job Fair & Career Expo Baru'}
                        </h3>
                        <button type="button" onClick={() => setShowJfForm(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Judul Event Job Fair <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <input
                            type="text"
                            value={jfJudul}
                            onChange={(e) => setJfJudul(e.target.value)}
                            placeholder="misal: UMK Mega Career Expo & Job Fair Nasional 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Banner / Poster Utama Event * <span className="text-emerald-600 font-bold">(Wajib)</span></label>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <input
                              type="text"
                              value={jfBannerUrl}
                              onChange={(e) => setJfBannerUrl(e.target.value)}
                              placeholder="/poster-cdc-web-umk-2.svg atau https://..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                              <Upload className="w-4 h-4 text-emerald-600" /> Upload Poster
                              <input type="file" accept="image/*" onChange={handleJfBannerUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Format / Rasio Poster *</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setJfPosterAspect('16:9')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                jfPosterAspect === '16:9'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {jfPosterAspect === '16:9' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                              </span>
                              <span>16:9 (Landscape / Horisontal)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setJfPosterAspect('9:16')}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                jfPosterAspect === '9:16'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                                {jfPosterAspect === '9:16' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                              </span>
                              <span>9:16 (Portrait / Pamflet Berdiri)</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Deskripsi Event <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <textarea
                            value={jfDeskripsi}
                            onChange={(e) => setJfDeskripsi(e.target.value)}
                            rows={3}
                            placeholder="Penjelasan deskripsi pameran bursa kerja..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowJfForm(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" /> Simpan Job Fair
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List Job Fair Cards */}
                  <div className="space-y-3">
                    {jobFairItems.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                        Belum ada agenda Job Fair terdaftar. Klik "+ Tambah Job Fair" untuk membuat event bursa kerja.
                      </div>
                    ) : (
                      jobFairItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-emerald-300"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {item.bannerUrl && (
                              <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                                <img src={item.bannerUrl} alt={item.judul} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 truncate">{item.judul}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                📅 {item.tanggalMulai} – {item.tanggalSelesai} · 📍 {item.lokasi} · 🏢 {item.perusahaanPeserta?.length || 0} Perusahaan
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => openJfModal(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJf(item)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
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
                    SECTION: KONTAK HELPDESK & WHATSAPP CS (FLOATING WA)
                ───────────────────────────────────────────────────────────── */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-emerald-600" />
                          Kontak Helpdesk, WA CS &amp; Pemulihan Kata Sandi
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Atur nomor WhatsApp CS, email pengaduan, pesan otomatis, dan tombol WhatsApp melayang di halaman publik &amp; login.
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
                            whatsappNote: helpdeskNote.trim(),
                            jamLayanan: helpdeskJam.trim(),
                            defaultMessage: helpdeskMsg.trim(),
                            isFloatingActive: helpdeskFloating
                          });
                          reloadAll();
                          if (onReloadData) onReloadData();
                          triggerToast('success', 'Pengaturan Kontak Helpdesk & WA CS berhasil disimpan!');
                        }}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer shrink-0"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Pengaturan Helpdesk</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#0077C6]" />
                          <span>Email Helpdesk CS <span className="text-red-500">*</span></span>
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
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nomor WhatsApp CS Admin <span className="text-red-500">*</span></span>
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

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                      <div className="md:col-span-8 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Pesan Pembuka Otomatis (Default Chat Greeting WA)</label>
                        <input
                          type="text"
                          value={helpdeskMsg}
                          onChange={(e) => setHelpdeskMsg(e.target.value)}
                          placeholder="Halo Admin CDC UM Kendari, saya ingin berkonsultasi mengenai..."
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#0077C6] focus:outline-none focus:ring-1 focus:ring-[#0077C6] transition"
                        />
                      </div>
                      <div className="md:col-span-4 flex items-center pt-5">
                        <label className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 cursor-pointer select-none w-full">
                          <input
                            type="checkbox"
                            checked={helpdeskFloating}
                            onChange={(e) => setHelpdeskFloating(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block">Floating WA Button</span>
                            <span className="text-[11px] text-slate-500">Tampilkan di publik</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Pratinjau Integrasi WhatsApp Helpdesk:
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
                            <div className="font-semibold text-slate-800">WhatsApp CS Admin CDC:</div>
                            <span className="text-slate-800 font-medium">{helpdeskWa || '0852-4100-9988'}</span>{' '}
                            {helpdeskNote && <span className="text-slate-500 font-normal">{helpdeskNote}</span>}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Tombol WA Melayang Publik:</span>
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${helpdeskFloating ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {helpdeskFloating ? '● Aktif' : '○ Nonaktif'}
                          </span>
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

            {/* ============== STATISTIK BERANDA (ALUMNI & MITRA) ============== */}
            {activeTab === 'statistik-beranda' && (
              <div className="space-y-6" id="adm-statistik-beranda">
                <div className="border-b border-slate-200 pb-5">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#0077C6]" /> Kelola Statistik Beranda
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Atur jumlah Alumni dan Mitra Perusahaan yang ditampilkan pada strip statistik halaman depan publik.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* FORM EDITABLE FIELDS */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-600" /> Data Statistik Utama
                    </h2>

                    {/* Input Alumni */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Jumlah Alumni <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={statAlumni}
                        onChange={(e) => setStatAlumni(e.target.value)}
                        placeholder="Contoh: 20.000+"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0077C6] focus:border-[#0077C6] text-sm font-semibold text-slate-900"
                      />
                      <p className="text-xs text-slate-400">
                        * Format teks bebas (misal: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">20.000+</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">25.500+</code>).
                      </p>
                    </div>

                    {/* Input Mitra */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Jumlah Mitra Perusahaan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={statMitra}
                        onChange={(e) => setStatMitra(e.target.value)}
                        placeholder="Contoh: 10"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0077C6] focus:border-[#0077C6] text-sm font-semibold text-slate-900"
                      />
                      <p className="text-xs text-slate-400">
                        * Format teks bebas (misal: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">10</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">50+</code>, atau <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">100+ Perusahaan</code>).
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={handleSaveStatistik}
                        className="w-full bg-[#0077C6] hover:bg-[#1E3A8A] text-white py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Simpan Perubahan Statistik
                      </button>
                    </div>
                  </div>

                  {/* INFORMASI OTOMATIS & PREVIEW */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Read-only Automated System Info */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" /> Data Terhitung Otomatis Oleh Sistem
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="text-slate-400 font-medium">Total Pengunjung</div>
                          <div className="text-lg font-extrabold text-blue-900 mt-1 font-mono">{trackAndGetVisitorCount()}</div>
                          <div className="text-[11px] text-slate-400 mt-1 italic">Di-track otomatis via peramban</div>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="text-slate-400 font-medium">Tahun Pengalaman</div>
                          <div className="text-lg font-extrabold text-blue-900 mt-1 font-mono">10+ Tahun</div>
                          <div className="text-[11px] text-slate-400 mt-1 italic">Dihitung dari tahun dasar 2016</div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE PREVIEW BANNER */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-emerald-600" /> Pratinjau Tampilan Beranda Publik
                        </h2>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Live Preview</span>
                      </div>

                      {/* Mockup strip */}
                      <div className="bg-[#1E3A8A] p-5 rounded-2xl text-center grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-inner">
                        <div className="space-y-0.5">
                          <div className="text-xl sm:text-2xl font-black text-[#10B981]">{statAlumni || '20.000+'}</div>
                          <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Alumni</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xl sm:text-2xl font-black text-[#10B981]">{statMitra || '10'}</div>
                          <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Mitra Perusahaan</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xl sm:text-2xl font-black text-[#10B981]">{trackAndGetVisitorCount()}</div>
                          <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Total Pengunjung</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xl sm:text-2xl font-black text-[#10B981]">10+</div>
                          <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Tahun Pengalaman</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold ${toast.type === 'success' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      {/* Command Palette Spotlight Modal (Ctrl + K / Cmd + K) */}
      <AnimatePresence>
        {isCmdPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              onClick={() => setIsCmdPaletteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 space-y-0"
            >
              {/* Command Search Header */}
              <div className="flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={cmdSearchQuery}
                  onChange={(e) => setCmdSearchQuery(e.target.value)}
                  placeholder="Ketik navigasi atau tindakan (misal: Loker, Mitra, SK CDC, Logout)..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none"
                />
                <div className="flex items-center gap-1.5 ml-2">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-extrabold text-slate-500 bg-white rounded-md border border-slate-200 shadow-xs">ESC</kbd>
                </div>
              </div>

              {/* Command Items List */}
              <div className="p-3 max-h-96 overflow-y-auto space-y-1">
                {[
                  { id: 'ringkasan', group: 'Navigasi Ringkasan', label: 'Dashboard Overview & Activity', icon: LayoutDashboard, action: () => { setActiveTab('ringkasan'); setIsCmdPaletteOpen(false); } },
                  { id: 'konten-buat', group: 'Aksi Cepat', label: '+ Buat Konten & Lowongan Karir Baru', icon: Plus, action: () => { setActiveTab('konten'); setKontenSub('pembuatan'); setIsCmdPaletteOpen(false); } },
                  { id: 'mitra-approval', group: 'Manajemen Mitra', label: 'Approval Pendaftaran Mitra Baru', icon: Clock, badge: totalMenunggu > 0 ? `${totalMenunggu} Pending` : undefined, action: () => { setActiveTab('mitra'); setMitraSub('approval'); setIsCmdPaletteOpen(false); } },
                  { id: 'mitra-list', group: 'Manajemen Mitra', label: 'Daftar Mitra Terdaftar & Kerjasama', icon: Building2, action: () => { setActiveTab('mitra'); setMitraSub('list'); setIsCmdPaletteOpen(false); } },
                  { id: 'konten-riwayat', group: 'Konten Karir', label: 'Riwayat Konten & Lowongan Publikasi', icon: Layers, action: () => { setActiveTab('konten'); setKontenSub('riwayat'); setIsCmdPaletteOpen(false); } },
                  { id: 'sk-cdc', group: 'Dokumen Resmi', label: 'Surat Keputusan (SK) CDC UMK', icon: FileText, action: () => { setActiveTab('sk-cdc'); setIsCmdPaletteOpen(false); } },
                  { id: 'kalender', group: 'Dokumen Resmi', label: 'Kalender Kegiatan CDC UMK', icon: CalendarDays, action: () => { setActiveTab('kalender'); setIsCmdPaletteOpen(false); } },
                  { id: 'laporan', group: 'Dokumen Resmi', label: 'Laporan Kinerja & Tracer Study', icon: TrendingUp, action: () => { setActiveTab('laporan'); setIsCmdPaletteOpen(false); } },
                  { id: 'mou', group: 'Kerjasama', label: 'MOU & Kerja Sama Stakeholder', icon: HeartHandshake, action: () => { setActiveTab('mou'); setIsCmdPaletteOpen(false); } },
                  { id: 'komentar', group: 'Interaksi Publik', label: 'Moderasi Komentar & Diskusi Berita', icon: MessageSquare, badge: pendingKomentarCount > 0 ? `${pendingKomentarCount} Baru` : undefined, action: () => { setActiveTab('komentar'); setIsCmdPaletteOpen(false); } },
                  { id: 'media-sosial', group: 'Interaksi Publik', label: 'Pengaturan Link & Widget Media Sosial', icon: Globe, action: () => { setActiveTab('media-sosial'); setIsCmdPaletteOpen(false); } },
                  { id: 'admin', group: 'Sistem Admin', label: 'Kelola Hak Akses Super Admin', icon: UserCog, action: () => { setActiveTab('admin'); setIsCmdPaletteOpen(false); } },
                  { id: 'logout', group: 'Sistem', label: 'Keluar Akun Admin (Sign Out)', icon: LogOut, action: () => { setIsCmdPaletteOpen(false); onLogout(); } }
                ]
                  .filter((item) => item.label.toLowerCase().includes(cmdSearchQuery.toLowerCase()) || item.group.toLowerCase().includes(cmdSearchQuery.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-blue-50/80 hover:text-[#1B365D] transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-[#1B365D] group-hover:text-white flex items-center justify-center transition">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-[#1B365D]">{item.label}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{item.group}</div>
                        </div>
                      </div>
                      {item.badge ? (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">{item.badge}</span>
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B365D] transition" />
                      )}
                    </button>
                  ))}
              </div>

              {/* Command Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Pilih item untuk navigasi cepat</span>
                <span className="flex items-center gap-1.5"><Command className="w-3.5 h-3.5 text-slate-400" /> Command Palette</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
