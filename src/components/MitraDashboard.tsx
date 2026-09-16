/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MitraDashboard — Portal CDC UM Kendari
 * Tampilan Dashboard Mitra yang diselaraskan 1:1 dengan Dashboard Admin.
 * Menggunakan arsitektur SideNavBar fixed navy (#1B365D), Top Navbar Sticky,
 * Command Palette (Ctrl+K), framer-motion transitions, dan card/table styling modern.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserType,
  Mitra,
  Mahasiswa,
  Lowongan,
  PengajuanMagang,
  SelectionHistoryLog
} from '../types';
import {
  getFromDB,
  saveToDB,
  insertToDB,
  updateInDB,
  deleteInDB,
  formatDateDisplay
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
  Upload,
  Edit3,
  Image as ImageIcon,
  Download,
  X,
  ExternalLink,
  Calendar,
  Search,
  Filter,
  Mail,
  GraduationCap,
  Award,
  Code,
  User,
  XCircle,
  LogOut,
  Lock,
  Menu,
  ChevronRight,
  ShieldCheck,
  MousePointerClick,
  LayoutDashboard,
  Command,
  ArrowUpRight,
  Check,
  Eye,
  ZoomIn,
  Pin,
  Sliders,
  Zap,
  ChevronDown
} from 'lucide-react';
import { JOB_SPECIALIZATIONS, getCompanyBadgeColor, getCompanyInitials } from './JobSearchMasterDetail';
import Dropdown from './Dropdown';
import LocationPicker from './ui/LocationPicker';

interface MitraDashboardProps {
  user: UserType;
  onLogout: () => void;
  onReloadData?: () => void;
  activeTab?: MitraTab;
  onTabChange?: (tab: MitraTab) => void;
}

type MitraTab = 'ringkasan' | 'lowongan' | 'pelamar' | 'profil';

const parseDateToTimestamp = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  if (!isNaN(t)) return t;

  const indonesianMonths: Record<string, string> = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
  };

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = indonesianMonths[parts[1].toLowerCase()];
    const year = parts[2];
    if (month && year) {
      const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`).getTime();
      if (!isNaN(parsed)) return parsed;
    }
  }

  return 0;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '10 Agustus 2026';
  if (dateStr.includes('Agustus') || dateStr.includes('Januari') || dateStr.includes('Februari')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const getJobTitle = (jobIdOrTitle?: string, fallbackInstansi?: string): string => {
  if (!jobIdOrTitle) return 'Program Magang Industri';
  const allLowongan = getFromDB<Lowongan>('lowongan');
  const targetLower = jobIdOrTitle.toLowerCase();
  const found = allLowongan.find(j => j.id === jobIdOrTitle || (j.judul && j.judul.toLowerCase() === targetLower));
  if (found) return found.judul;
  if (/^\d+$/.test(jobIdOrTitle) || jobIdOrTitle.length <= 2) {
    if (fallbackInstansi) {
      const fallbackLower = fallbackInstansi.toLowerCase();
      const companyJob = allLowongan.find(j => j.namaInstansi && j.namaInstansi.toLowerCase() === fallbackLower);
      if (companyJob) return companyJob.judul;
    }
    return allLowongan[0]?.judul || 'Pengembang Aplikasi Web / Software Engineer';
  }
  return jobIdOrTitle;
};

// Kompresi gambar adaptif agar penyimpanan LocalStorage tidak overload
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

async function compressImageAdaptive(file: File): Promise<string> {
  const steps = [
    { maxW: 1000, q: 0.72 },
    { maxW: 900, q: 0.62 },
    { maxW: 800, q: 0.5 },
    { maxW: 700, q: 0.4 },
  ];
  for (const s of steps) {
    const url = await compressImage(file, s.maxW, s.q);
    if (url.length < 160_000) return url;
  }
  return compressImage(file, 640, 0.35);
}

const DEFAULT_SAMPLE_PDF_DATA_URL = `data:application/pdf;base64,JVBERi0xLjQKJSC1tbW1CjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvQ291bnQgMSAvS2lkcyBbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA0IDAgUiAvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggMjA1Pj4Kc3RyZWFtCkJVCkJUMgogL0YxIDIyIFRmCiA1MCA3MzAgVGQKIChDVVJRQ0VMVU0gVklUQUUgKENWKSAtIFBFTEFNQVIgUkVTTUkpIFRqCiAwIC0zMCBUZgogL0YxIDE0IFRmCiAoUG9ydGFsIENEQyBVbml2ZXJzaXRhcyBNdWhhbW1hZGl5YWggS2VuZGFyaSkgVGoKIDAgLTMwIFRmCiAvRjEgMTIgVGYKIChEb2t1bWVuIENTIFBlbGFtYXIgVGVydmVyaWZpa2FzaSAmIExlbmdrYXApIFRqCkVUCgplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjM4IDAwMDAwIG4gCjAwMDAwMDA0OTQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYgL1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNTY1CiUlRU9GCg==`;

const handleOpenPdf = (url?: string) => {
  const pdfUrl = url && url !== '#' ? url : DEFAULT_SAMPLE_PDF_DATA_URL;
  try {
    if (pdfUrl.startsWith('data:')) {
      const arr = pdfUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      window.open(pdfUrl, '_blank');
    }
  } catch (err) {
    window.open(pdfUrl, '_blank');
  }
};

const handleDownloadPdf = (url?: string, filename?: string) => {
  const pdfUrl = url && url !== '#' ? url : DEFAULT_SAMPLE_PDF_DATA_URL;
  const name = filename || 'CV_Pelamar.pdf';
  try {
    if (pdfUrl.startsWith('data:')) {
      const arr = pdfUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
    } else {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    window.open(pdfUrl, '_blank');
  }
};

function PdfViewerPreview({
  berkasUrl,
  fileName,
  studentName = "Pelamar",
  prodi = "Teknik Informatika"
}: {
  berkasUrl?: string;
  fileName?: string;
  studentName?: string;
  prodi?: string;
}) {
  const activeUrl = berkasUrl && berkasUrl !== '#' ? berkasUrl : DEFAULT_SAMPLE_PDF_DATA_URL;
  const isImg = activeUrl.startsWith('data:image/');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [useFallback, setUseFallback] = useState<boolean>(false);

  useEffect(() => {
    if (isImg) return;
    let isCancelled = false;

    const renderPdfCanvas = async () => {
      setLoadingPdf(true);
      setUseFallback(false);

      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PDF.js"));
            document.head.appendChild(script);
          });
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF.js unavailable");
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        let pdfBytes: Uint8Array;
        if (activeUrl.startsWith('data:')) {
          const arr = activeUrl.split(',');
          const bstr = atob(arr[1]);
          pdfBytes = new Uint8Array(bstr.length);
          for (let i = 0; i < bstr.length; i++) {
            pdfBytes[i] = bstr.charCodeAt(i);
          }
        } else {
          const resp = await fetch(activeUrl);
          const buf = await resp.arrayBuffer();
          pdfBytes = new Uint8Array(buf);
        }

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages || 1);
        const page = await pdf.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (canvas) {
          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
          }
        }
        setLoadingPdf(false);
      } catch (err) {
        console.warn("PDF Canvas render fallback:", err);
        if (!isCancelled) {
          setUseFallback(true);
          setLoadingPdf(false);
        }
      }
    };

    renderPdfCanvas();

    return () => {
      isCancelled = true;
    };
  }, [activeUrl, currentPage, scale, isImg]);

  const openPdf = () => handleOpenPdf(activeUrl);
  const downloadPdf = () => handleDownloadPdf(activeUrl, fileName || `CV_${studentName.replace(/\s+/g, '_')}.pdf`);

  if (isImg) {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-4 flex items-center justify-center shadow-sm">
        <img src={activeUrl} alt={fileName || "Berkas CV"} className="max-h-[500px] object-contain mx-auto rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
            PDF
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-100 text-xs truncate block max-w-xs sm:max-w-sm">
              {fileName || `CV_${studentName}.pdf`}
            </span>
            <span className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-blue-300" /> Berkas Resmi Pelamar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {numPages > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono text-xs">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="hover:text-white cursor-pointer font-bold pr-1"
                >
                  &larr;
                </button>
              )}
              <span>{currentPage} / {numPages}</span>
              {currentPage < numPages && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                  className="hover:text-white cursor-pointer font-bold pl-1"
                >
                  &rarr;
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={openPdf}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Lihat
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      <div className="w-full min-h-[440px] max-h-[580px] overflow-auto bg-slate-200/80 p-4 flex items-center justify-center relative">
        {loadingPdf && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
            <div className="w-8 h-8 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Memuat pratinjau dokumen PDF...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`max-w-full bg-white shadow-lg rounded-lg transition-opacity duration-200 ${loadingPdf || useFallback ? 'hidden' : 'block'}`}
        />

        {useFallback && !loadingPdf && (
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-lg p-6 space-y-5 text-slate-800 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center border border-[#DBEAFE] mx-auto shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{fileName || `CV_${studentName}.pdf`}</h4>
              <p className="text-xs text-slate-500 font-medium">
                Pelamar: <span className="font-bold text-slate-700">{studentName}</span> ({prodi})
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={openPdf}
                className="bg-[#1E3A8A] hover:bg-[#142355] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Lihat Dokumen PDF
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MitraDashboard({ user, onLogout, onReloadData, activeTab: activeTabProp, onTabChange }: MitraDashboardProps) {
  const [activeTab, setActiveTabInternal] = useState<MitraTab>(activeTabProp || 'ringkasan');

  const setActiveTab = (tab: MitraTab) => {
    setActiveTabInternal(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTabInternal(activeTabProp);
    }
  }, [activeTabProp]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'DASHBOARD': true,
    'MANAJEMEN LOWONGAN': true,
    'PELAMAR & SELEKSI': true,
    'INSTANSI & AKUN': true
  });

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

  // Data States
  const [mitraData, setMitraData] = useState<Mitra | null>(null);
  const [myJobs, setMyJobs] = useState<Lowongan[]>([]);
  const [myApplicants, setMyApplicants] = useState<PengajuanMagang[]>([]);
  const [selectedApplicantDoc, setSelectedApplicantDoc] = useState<PengajuanMagang | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Profile Form States
  const [namaInstansi, setNamaInstansi] = useState('');
  const [bidangIndustri, setBidangIndustri] = useState('Teknologi Informasi & Software');
  const [alamat, setAlamat] = useState('');
  const [kontakPerson, setKontakPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Add & Edit Job Form States
  const [showAddJob, setShowAddJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Search, Filter & Pagination States for Kelola Lowongan
  const [jobSearchKeyword, setJobSearchKeyword] = useState('');
  const [jobTipeFilter, setJobTipeFilter] = useState<'all' | 'magang' | 'kerja'>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'published' | 'closed'>('all');
  const [jobSortOrder, setJobSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [jobCurrentPage, setJobCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState<'magang' | 'kerja'>('magang');
  const [selectedKategori, setSelectedKategori] = useState<string[]>(['IT/Komputer & Teknologi Informasi']);
  const [lokasi, setLokasi] = useState('Kendari (On-site)');

  const handleCategoryToggle = (spec: string) => {
    if (selectedKategori.includes(spec)) {
      if (selectedKategori.length > 1) {
        setSelectedKategori(selectedKategori.filter(c => c !== spec));
      }
    } else {
      setSelectedKategori([...selectedKategori, spec]);
    }
  };
  const [gaji, setGaji] = useState('Kompetitif');
  const [kuota, setKuota] = useState<string>('3');
  const [deadline, setDeadline] = useState('');
  const [ctaEnabled, setCtaEnabled] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('Lamar Pekerjaan');
  const [linkEksternal, setLinkEksternal] = useState('');

  // Media Visual Upload States
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // Text & Multiline Detail Fields
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggungJawab, setTanggungJawab] = useState('');
  const [kualifikasi, setKualifikasi] = useState('');
  const [keahlian, setKeahlian] = useState('');
  const [benefit, setBenefit] = useState('');

  // Filter & Search States for Pelamar & Seleksi
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset pagination to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJobFilter, selectedStatusFilter, searchQuery]);

  // Form Jadwal Interview Modal States
  const [schedulingApplicant, setSchedulingApplicant] = useState<PengajuanMagang | null>(null);
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [interviewTime, setInterviewTime] = useState<string>('');
  const [interviewMethod, setInterviewMethod] = useState<'online' | 'offline'>('online');
  const [interviewLink, setInterviewLink] = useState<string>('');
  const [interviewLocation, setInterviewLocation] = useState<string>('');
  const [interviewNote, setInterviewNote] = useState<string>('');

  // Confirmation Modal State (Terima / Tolak)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'accept' | 'reject';
    applicant: PengajuanMagang;
  } | null>(null);

  // Confirmation Modal State (Hapus Lowongan)
  const [deleteJobTarget, setDeleteJobTarget] = useState<Lowongan | null>(null);

  // Center Alert Popup Modal State
  const [alertPopup, setAlertPopup] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const triggerAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertPopup({ type, title, message });
  };

  // Internal Note State for Candidates
  const [internalNoteInput, setInternalNoteInput] = useState<string>('');

  // Load specific Partner record
  const loadMitraData = async () => {
    const list = getFromDB<Mitra>('mitra');
    let mit = list.find(m => m.userId === user.id);

    if (!mit) {
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
      try {
        await insertToDB<Mitra>('mitra', newMit);
      } catch (err: any) {
        triggerToast('error', 'Gagal menyimpan data mitra baru: ' + (err?.message || err));
      }
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
    const partnerPostings = lowongans.filter(l =>
      l.mitraId === mit.id ||
      (mit.namaInstansi && l.namaInstansi && l.namaInstansi.toLowerCase().trim() === mit.namaInstansi.toLowerCase().trim())
    );
    setMyJobs(partnerPostings);

    // Load related candidates/applicants
    const candidates = getFromDB<PengajuanMagang>('pengajuan_magang');
    const jobIds = new Set(partnerPostings.map(p => p.id));
    const jobTitles = partnerPostings.map(p => p.judul.toLowerCase().trim());
    const companyNameClean = (mit.namaInstansi || '').toLowerCase().trim();

    const partnerCandidates = candidates.filter(c => {
      if (c.lowonganId && jobIds.has(c.lowonganId)) return true;
      if (c.mitraId && c.mitraId === mit.id) return true;
      if (c.namaInstansi && companyNameClean && (c.namaInstansi.toLowerCase().trim().includes(companyNameClean) || companyNameClean.includes(c.namaInstansi.toLowerCase().trim()))) return true;

      const targetTitleClean = (c.tujuanMagang || '').toLowerCase().trim();
      if (targetTitleClean && jobTitles.some(t => t === targetTitleClean || targetTitleClean.includes(t) || t.includes(targetTitleClean))) {
        return true;
      }
      if (companyNameClean && companyNameClean.length > 2 && targetTitleClean.includes(companyNameClean)) {
        return true;
      }
      return false;
    });

    partnerCandidates.sort((a, b) => {
      const timeA = parseDateToTimestamp(a.createdAt) || parseDateToTimestamp(a.tanggalMulai) || 0;
      const timeB = parseDateToTimestamp(b.createdAt) || parseDateToTimestamp(b.tanggalMulai) || 0;
      return timeB - timeA;
    });

    setMyApplicants(partnerCandidates);
  };

  useEffect(() => {
    loadMitraData();

    const handleSync = () => {
      loadMitraData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [user.id, activeTab]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraData) return;

    if (!namaInstansi.trim()) {
      triggerToast('error', 'Nama instansi wajib diisi.');
      return;
    }

    const updatedMitra: Mitra = {
      ...mitraData,
      namaInstansi: namaInstansi.trim(),
      bidangIndustri: bidangIndustri.trim(),
      alamat: alamat.trim(),
      kontakPerson: kontakPerson.trim(),
      phone: phone.trim(),
      website: website.trim()
    };

    try {
      await updateInDB<Mitra>('mitra', updatedMitra);
      setMitraData(updatedMitra);

      const allJobs = getFromDB<Lowongan>('lowongan');
      const recalculatedJobs = allJobs.map(j => {
        if (j.mitraId === mitraData.id) {
          return { ...j, namaInstansi: namaInstansi.trim() };
        }
        return j;
      });
      await saveToDB('lowongan', recalculatedJobs);

      triggerToast('success', 'Profil instansi mitra berhasil diperbarui.');
      triggerAlert('success', 'Profil Berhasil Disimpan', 'Identitas dan informasi profil instansi mitra berhasil diperbarui dan disimpan ke sistem.');
    } catch (err: any) {
      triggerToast('error', 'Gagal menyimpan profil: ' + (err?.message || err));
      triggerAlert('error', 'Gagal Menyimpan Profil', err?.message || 'Terjadi kesalahan saat menyimpan ke database.');
    }
  };

  // Upload Logo Perusahaan
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageAdaptive(file);
      setCompanyLogoUrl(dataUrl);
      triggerToast('success', 'Logo instansi berhasil diunggah.');
    } catch (err: any) {
      triggerToast('error', 'Gagal memproses file logo: ' + (err?.message || err));
    }
  };

  // Upload Poster Lowongan
  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageAdaptive(file);
      setPosterUrl(dataUrl);
      triggerToast('success', 'Poster lowongan berhasil diunggah.');
    } catch (err: any) {
      triggerToast('error', 'Gagal memproses file poster: ' + (err?.message || err));
    }
  };

  // Reset Job Form
  const resetJobForm = () => {
    setShowAddJob(false);
    setEditingJobId(null);
    setJudul('');
    setTipe('magang');
    setSelectedKategori(['IT/Komputer & Teknologi Informasi']);
    setLokasi('Kendari (On-site)');
    setGaji('Kompetitif');
    setKuota('3');
    setDeadline('');
    setCompanyLogoUrl('');
    setPosterUrl('');
    setCtaEnabled(false);
    setCtaLabel('Lamar Pekerjaan');
    setLinkEksternal('');
    setDeskripsi('');
    setTanggungJawab('');
    setKualifikasi('');
    setKeahlian('');
    setBenefit('');
  };

  // Fill Form for Editing
  const handleEditJob = (job: Lowongan) => {
    setEditingJobId(job.id);
    setJudul(job.judul);
    setTipe(job.tipe);
    if (job.kategori) {
      const parts = job.kategori.split(',').map(s => s.trim()).filter(Boolean);
      setSelectedKategori(parts.length > 0 ? parts : ['IT/Komputer & Teknologi Informasi']);
    } else {
      setSelectedKategori(['IT/Komputer & Teknologi Informasi']);
    }
    setLokasi(job.lokasi);
    setGaji(job.gaji || 'Kompetitif');
    setKuota(job.kuota ? String(job.kuota) : '3');
    setDeadline(job.deadline);
    setCompanyLogoUrl(job.companyLogo || '');
    setPosterUrl(job.flyer || job.imageUrl || job.bannerImage || (job.flyers && job.flyers[0]) || '');
    setCtaEnabled(job.ctaEnabled === true || Boolean(job.linkEksternal) || Boolean(job.ctaLabel));
    setCtaLabel(job.ctaLabel && job.ctaLabel.trim() ? job.ctaLabel : 'Lamar Pekerjaan');
    setLinkEksternal(job.linkEksternal || '');
    setDeskripsi(job.deskripsi || '');
    setTanggungJawab(Array.isArray(job.tanggungJawab) ? job.tanggungJawab.join('\n') : job.tanggungJawab || '');
    setKualifikasi(Array.isArray(job.kualifikasi) ? job.kualifikasi.join('\n') : job.kualifikasi || '');
    setKeahlian(Array.isArray(job.keahlian) ? job.keahlian.join('\n') : job.keahlian || '');
    setBenefit(Array.isArray(job.benefit) ? job.benefit.join('\n') : job.benefit || '');
    setShowAddJob(true);
    setActiveTab('lowongan');
  };

  // Add / Update Job Posting
  const handleAddJobPosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraData) return;

    if (!judul.trim() || !deadline) {
      triggerToast('error', 'Bidang Judul Posisi dan Batas Waktu (Tanggal) wajib diisi.');
      return;
    }

    const parseLines = (txt: string): string[] => {
      return txt
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    };

    const logoTarget = companyLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop';
    const existingJob = editingJobId ? myJobs.find(j => j.id === editingJobId) : null;

    const newJob: Lowongan = {
      id: editingJobId || `low_${Date.now()}`,
      mitraId: mitraData.id,
      createdBy: user.id,
      judul: judul.trim(),
      tipe,
      namaInstansi: mitraData.namaInstansi,
      companyLogo: logoTarget,
      imageUrl: posterUrl || undefined,
      flyer: posterUrl || undefined,
      bannerImage: posterUrl || undefined,
      flyers: posterUrl ? [posterUrl] : undefined,
      sumber: 'mitra',
      linkEksternal: (ctaEnabled && linkEksternal.trim()) ? linkEksternal.trim() : undefined,
      ctaEnabled: true,
      ctaLabel: (ctaEnabled && ctaLabel.trim()) ? ctaLabel.trim() : undefined,
      lokasi: lokasi.trim() || mitraData.kota || mitraData.alamat || 'Kendari',
      kategori: selectedKategori.join(', '),
      gaji: gaji.trim() || 'Kompetitif',
      kuota: kuota ? (Number(kuota) || 1) : 1,
      deadline,
      deskripsi: deskripsi ? deskripsi.trim() : '',
      tanggungJawab: parseLines(tanggungJawab),
      kualifikasi: parseLines(kualifikasi),
      keahlian: parseLines(keahlian),
      benefit: parseLines(benefit),
      status: existingJob?.status || 'published',
      createdAt: existingJob?.createdAt || new Date().toISOString()
    };

    try {
      if (editingJobId) {
        await updateInDB<Lowongan>('lowongan', newJob);
        triggerToast('success', 'Lowongan pekerjaan berhasil diperbarui.');
      } else {
        await insertToDB<Lowongan>('lowongan', newJob);
        triggerToast('success', 'Lowongan baru berhasil diposting aktif.');
      }

      resetJobForm();
      await loadMitraData();
      if (onReloadData) onReloadData();
    } catch (err: any) {
      triggerToast('error', 'Gagal menyimpan lowongan: ' + (err?.message || err));
    }
  };

  // Change job status draft/closed
  const handleToggleJobStatus = async (jobId: string, currentStatus: any) => {
    const allJobs = getFromDB<Lowongan>('lowongan');
    const target = allJobs.find(j => j.id === jobId);
    if (target) {
      target.status = currentStatus === 'published' ? 'closed' : 'published';
      try {
        await updateInDB<Lowongan>('lowongan', target);
        await loadMitraData();
        if (onReloadData) onReloadData();
        triggerToast('success', `Status lowongan diubah menjadi ${target.status === 'published' ? 'Aktif' : 'Tutup'}.`);
      } catch (err: any) {
        triggerToast('error', 'Gagal mengubah status lowongan: ' + (err?.message || err));
      }
    }
  };

  // Delete Job Posting safely (via in-app confirm modal)
  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteInDB('lowongan', jobId);
      await loadMitraData();
      if (onReloadData) onReloadData();
      setDeleteJobTarget(null);
      triggerToast('success', 'Lowongan berhasil dihapus.');
    } catch (err: any) {
      triggerToast('error', 'Gagal menghapus lowongan: ' + (err?.message || err));
    }
  };

  // Helper to get or construct real applicant selection history logs
  const getApplicantHistoryLogs = (appl: PengajuanMagang): SelectionHistoryLog[] => {
    if (appl.riwayatSeleksi && appl.riwayatSeleksi.length > 0) {
      return appl.riwayatSeleksi;
    }
    const logs: SelectionHistoryLog[] = [];
    const createdDate = appl.createdAt ? formatDate(appl.createdAt) : '-';

    logs.push({
      status: 'submitted',
      label: 'Lamaran diterima sistem',
      date: createdDate
    });

    const s = (appl.status || '').toLowerCase();
    if (s !== 'submitted' && s !== 'under_review' && s !== 'draft') {
      logs.push({
        status: 'seleksi_administrasi',
        label: 'Masuk seleksi administrasi',
        date: createdDate
      });
    }

    if (s === 'interview' || appl.interviewDate) {
      logs.push({
        status: 'interview',
        label: appl.interviewDate
          ? `Interview dijadwalkan (${formatDate(appl.interviewDate)} jam ${appl.interviewTime || '10:00 WITA'})`
          : 'Interview dijadwalkan',
        date: appl.interviewDate ? formatDate(appl.interviewDate) : '-',
        note: appl.interviewNote
      });
    }

    if (s === 'accepted' || s === 'diterima' || s === 'completed') {
      logs.push({
        status: 'accepted',
        label: 'Lolos seleksi & Diterima sebagai peserta',
        date: '-'
      });
    } else if (s === 'rejected' || s === 'ditolak') {
      logs.push({
        status: 'rejected',
        label: 'Lamaran ditolak',
        date: '-'
      });
    }

    return logs;
  };

  // Handle Candidate Status Transition
  const handleUpdateApplicantStatus = async (applId: string, decision: string, customMessage?: string) => {
    const allAppls = getFromDB<PengajuanMagang>('pengajuan_magang');
    const target = allAppls.find(a => a.id === applId);
    if (target) {
      const todayFormatted = formatDate(new Date().toISOString().split('T')[0]);
      let label = `Status diubah menjadi ${decision.toUpperCase()}`;
      if (decision === 'seleksi_administrasi') label = 'Masuk seleksi administrasi';
      else if (decision === 'interview') label = 'Lolos ke tahap interview';
      else if (decision === 'accepted' || decision === 'diterima') label = 'Lolos seleksi & Diterima sebagai peserta';
      else if (decision === 'rejected' || decision === 'ditolak') label = 'Lamaran ditolak';

      const existingHistory = getApplicantHistoryLogs(target);
      const newLog: SelectionHistoryLog = {
        status: decision,
        label: label,
        date: todayFormatted
      };

      target.status = decision as any;
      target.riwayatSeleksi = [...existingHistory, newLog];
      target.catatanAdmin = `Diproses oleh HRD Mitra (${mitraData?.namaInstansi}) : status ${decision}`;

      try {
        await updateInDB<PengajuanMagang>('pengajuan_magang', target);
        await loadMitraData();
        if (onReloadData) onReloadData();
        const toastType = (decision === 'rejected' || decision === 'ditolak') ? 'error' : 'success';
        triggerToast(toastType, customMessage || `Status pelamar berhasil diperbarui menjadi ${decision.toUpperCase()}.`);

        if (decision === 'accepted' || decision === 'diterima') {
          triggerAlert('success', 'Pelamar Berhasil Diterima!', customMessage || `Pelamar ${target.namaMahasiswa} telah berhasil DITERIMA untuk posisi ${target.tujuanMagang}.`);
        } else if (decision === 'rejected' || decision === 'ditolak') {
          triggerAlert('error', 'Pelamar Ditolak', customMessage || `Pelamar ${target.namaMahasiswa} telah DITOLAK.`);
        } else if (decision === 'seleksi_administrasi') {
          triggerAlert('success', 'Status Diperbarui', `Status pelamar ${target.namaMahasiswa} berhasil diubah ke tahap Seleksi Administrasi.`);
        } else if (decision === 'interview') {
          triggerAlert('success', 'Lolos ke Interview', `Pelamar ${target.namaMahasiswa} berhasil diloloskan ke tahap interview.`);
        }
      } catch (err: any) {
        triggerToast('error', 'Gagal memperbarui status pelamar: ' + (err?.message || err));
        triggerAlert('error', 'Gagal', err?.message || 'Gagal menyimpan status ke database.');
      }
    } else {
      triggerToast('error', 'Data pelamar tidak ditemukan.');
      triggerAlert('error', 'Gagal', 'Data pelamar tidak ditemukan.');
    }
  };

  // Open Interview Scheduling Modal
  const handleOpenInterviewModal = (appl: PengajuanMagang) => {
    setSchedulingApplicant(appl);
    setInterviewDate(appl.interviewDate || '');
    setInterviewTime(appl.interviewTime || '');
    setInterviewMethod(appl.interviewMethod || 'online');
    setInterviewLink(appl.interviewLink || '');
    setInterviewLocation(appl.interviewLocation || '');
    setInterviewNote(appl.interviewNote || '');
  };

  // Submit & Save Interview Schedule
  const handleSaveInterviewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApplicant) return;

    const allAppls = getFromDB<PengajuanMagang>('pengajuan_magang');
    const target = allAppls.find(a => a.id === schedulingApplicant.id);
    if (target) {
      const existingHistory = getApplicantHistoryLogs(target);
      const newLog: SelectionHistoryLog = {
        status: 'interview',
        label: `Interview dijadwalkan (${formatDate(interviewDate)} jam ${interviewTime})`,
        date: formatDate(interviewDate),
        note: interviewNote
      };

      target.status = 'interview';
      target.interviewStatus = 'scheduled';
      target.interviewDate = interviewDate;
      target.interviewTime = interviewTime;
      target.interviewMethod = interviewMethod;
      target.interviewLink = interviewMethod === 'online' ? interviewLink : undefined;
      target.interviewLocation = interviewMethod === 'offline' ? interviewLocation : undefined;
      target.interviewNote = interviewNote;
      target.riwayatSeleksi = [...existingHistory, newLog];

      try {
        await updateInDB<PengajuanMagang>('pengajuan_magang', target);
        await loadMitraData();
        if (onReloadData) onReloadData();
        setSchedulingApplicant(null);
        setSelectedApplicantDoc(null);
        triggerToast('success', `Jadwal interview untuk ${target.namaMahasiswa} berhasil disimpan.`);
        triggerAlert('success', 'Jadwal Interview Tersimpan!', `Jadwal interview untuk ${target.namaMahasiswa} berhasil disimpan dan status diubah ke INTERVIEW.`);
      } catch (err: any) {
        triggerToast('error', 'Gagal menyimpan jadwal interview: ' + (err?.message || err));
        triggerAlert('error', 'Gagal', err?.message || 'Gagal menyimpan jadwal ke database.');
      }
    } else {
      triggerToast('error', 'Data pelamar tidak ditemukan.');
    }
  };

  // Open Applicant Detail Modal with internal note synced
  const handleOpenApplicantDetail = (appl: PengajuanMagang) => {
    setSelectedApplicantDoc(appl);
    setInternalNoteInput(appl.catatanAdmin || '');
  };

  // Save Internal Note for Applicant
  const handleSaveInternalNote = async (applicantId: string) => {
    const allAppls = getFromDB<PengajuanMagang>('pengajuan_magang');
    const target = allAppls.find(a => a.id === applicantId);
    if (target) {
      target.catatanAdmin = internalNoteInput;
      try {
        await updateInDB<PengajuanMagang>('pengajuan_magang', target);
        await loadMitraData();
        if (onReloadData) onReloadData();
        triggerToast('success', 'Catatan internal seleksi berhasil disimpan.');
      } catch (err: any) {
        triggerToast('error', 'Gagal menyimpan catatan: ' + (err?.message || err));
      }
    } else {
      triggerToast('error', 'Data pelamar tidak ditemukan.');
    }
  };

  /* =========================================================
   *  SIDEBAR & NAVIGATION CONFIG
   * =======================================================*/
  const MENU: { group: string; collapsible?: boolean; items: { id: MitraTab; label: string; icon: React.ReactNode; badge?: string }[] }[] = [
    {
      group: 'DASHBOARD',
      items: [
        { id: 'ringkasan', label: 'Ringkasan Laporan', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      group: 'MANAJEMEN LOWONGAN',
      items: [
        {
          id: 'lowongan',
          label: 'Kelola Lowongan',
          icon: <Briefcase className="w-4 h-4" />,
          badge: myJobs.length > 0 ? `${myJobs.length}` : undefined
        }
      ]
    },
    {
      group: 'PELAMAR & SELEKSI',
      items: [
        {
          id: 'pelamar',
          label: 'Database Pelamar',
          icon: <Users className="w-4 h-4" />,
          badge: myApplicants.length > 0 ? `${myApplicants.length}` : undefined
        }
      ]
    },
    {
      group: 'INSTANSI & AKUN',
      items: [
        { id: 'profil', label: 'Profil Instansi', icon: <Building2 className="w-4 h-4" /> }
      ]
    }
  ];

  const TAB_TITLES: Record<MitraTab, string> = {
    ringkasan: 'Ringkasan Laporan',
    lowongan: 'Kelola Lowongan',
    pelamar: 'Database Pelamar & Seleksi',
    profil: 'Profil Instansi Mitra'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans" id="mitra-dashboard">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. SideNavBar (Fixed Left Full-Height Drawer - 250px) Identik AdminDashboard */}
      <aside className={`fixed left-0 top-0 h-full w-[250px] bg-[#1B365D] text-white border-r border-slate-800 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Branding Sidebar */}
          <div className="h-20 px-4 border-b border-slate-800/60 flex items-center justify-center relative shrink-0">
            <button
              onClick={() => { setActiveTab('ringkasan'); setShowAddJob(false); }}
              className="cursor-pointer group flex items-center justify-center"
              title="Ke Ringkasan Dashboard"
            >
              <img
                src="/logo-cdc-sidebar-clean.png"
                alt="Logo CDC UM Kendari"
                className="h-11 sm:h-12 max-w-[200px] w-auto object-contain block shrink-0 transition-all group-hover:scale-105 cursor-pointer"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo-cdc-branding-light.png'; }}
              />
            </button>
            <button
              className="absolute right-4 md:hidden text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vertical Menu Scrollable List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
            {MENU.map((section, idx) => {
              const isOpen = expandedGroups[section.group] ?? true;

              return (
                <div key={idx} className={idx > 0 ? 'pt-3 border-t border-slate-800/50' : ''}>
                  {section.collapsible ? (
                    <button
                      type="button"
                      onClick={() => setExpandedGroups(prev => ({ ...prev, [section.group]: !isOpen }))}
                      className="w-full flex items-center justify-between px-3 py-1 mb-1 group cursor-pointer"
                    >
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition">{section.group}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </button>
                  ) : (
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 px-3">{section.group}</div>
                  )}

                  {isOpen && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setShowAddJob(false);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${isActive
                              ? 'bg-[#0077C6] text-white font-extrabold shadow-md shadow-blue-950/20 border-l-4 border-[#60A5FA]'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={isActive ? 'text-white scale-110 transition-transform duration-200' : 'text-slate-400'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                {item.badge}
                              </span>
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

          {/* User Profile & Logout Box Footer */}
          <div className="p-3 border-t border-slate-800/60 bg-slate-900/40 space-y-2 shrink-0">
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-9 h-9 rounded-lg bg-[#0077C6] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt="" className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  <span>{namaInstansi ? namaInstansi.charAt(0).toUpperCase() : 'M'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{namaInstansi || user.name}</div>
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> MITRA INDUSTRI
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-600/80 transition duration-150 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar Akun
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 md:ml-[250px] flex flex-col min-h-screen">
        {/* Top Navbar Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Dashboard Mitra</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900">{TAB_TITLES[activeTab]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Trigger Button */}
            <button
              onClick={() => setIsCmdPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 text-xs font-medium border border-slate-200 transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Pencarian Cepat...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[11px] font-bold text-slate-400 border border-slate-200 shadow-sm">Ctrl K</kbd>
            </button>

            {/* Quick Post Job Action */}
            <button
              onClick={() => {
                setActiveTab('lowongan');
                setShowAddJob(true);
              }}
              className="bg-[#1E3A8A] hover:bg-[#142355] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Posting Lowongan</span>
            </button>

            {/* Profile Avatar & Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div
                onClick={() => { setActiveTab('profil'); setShowAddJob(false); }}
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#1E3A8A]/30 transition"
              >
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt="" className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  <span>{namaInstansi ? namaInstansi.charAt(0).toUpperCase() : 'M'}</span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[150px]">
                  {namaInstansi || user.name}
                </div>
                <span className="text-[11px] font-bold text-[#1E3A8A] bg-[#EFF6FF] px-1.5 py-0.2 rounded mt-0.5 inline-block">
                  MITRA RESMI
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (showAddJob ? '-form' : '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >

              {/* =========================================================
               *  TAB 1: RINGKASAN LAPORAN
               * =======================================================*/}
              {activeTab === 'ringkasan' && (
                <div className="space-y-6">
                  {/* Welcome Summary Banner Card */}
                  <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-slate-50 text-[#1E3A8A] rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-sm border border-slate-200 overflow-hidden">
                          {companyLogoUrl ? (
                            <img src={companyLogoUrl} alt={namaInstansi} className="w-full h-full object-contain p-2 bg-white" />
                          ) : (
                            <span>{namaInstansi ? namaInstansi.charAt(0).toUpperCase() : 'M'}</span>
                          )}
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]/80 px-3 py-0.5 rounded-full font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                            <span>Mitra Terverifikasi CDC UM Kendari</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                            {namaInstansi || 'Instansi Mitra'}
                          </h2>
                          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs font-medium text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> PIC: <strong className="text-slate-700">{kontakPerson || user.name}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Sektor: <strong className="text-slate-700">{bidangIndustri || '-'}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kontak: <strong className="text-slate-700">{phone || user.phone || '-'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                        <button
                          onClick={() => setActiveTab('profil')}
                          className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer border border-slate-200 shadow-sm"
                        >
                          <FileText className="w-4 h-4 text-slate-500" /> Edit Profil
                        </button>
                        <button
                          onClick={() => { setActiveTab('lowongan'); setShowAddJob(true); }}
                          className="bg-[#1E3A8A] hover:bg-[#142355] text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4" /> Posting Lowongan
                        </button>
                      </div>
                    </div>

                    {/* Quick Metric Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500 block">Total Lowongan</span>
                          <div className="text-2xl font-bold text-slate-900 tracking-tight">
                            {myJobs.length} <span className="text-xs font-normal text-slate-500">Posisi</span>
                          </div>
                          <span className="text-xs text-slate-500 block pt-0.5">
                            Aktif di portal CDC
                          </span>
                        </div>
                        <div className="w-12 h-12 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-xl flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500 block">Pelamar Masuk</span>
                          <div className="text-2xl font-bold text-slate-900 tracking-tight">
                            {myApplicants.length} <span className="text-xs font-normal text-slate-500">Pelamar</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium block pt-0.5">
                            Perlu ditinjau
                          </span>
                        </div>
                        <div className="w-12 h-12 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-xl flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500 block">Tahap Wawancara</span>
                          <div className="text-2xl font-bold text-slate-900 tracking-tight">
                            {myApplicants.filter(a => (a.status || '').toLowerCase() === 'interview').length} <span className="text-xs font-normal text-slate-500">Kandidat</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium block pt-0.5">
                            Jadwal aktif
                          </span>
                        </div>
                        <div className="w-12 h-12 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-xl flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500 block">Lolos / Diterima</span>
                          <div className="text-2xl font-bold text-slate-900 tracking-tight">
                            {myApplicants.filter(a => {
                              const s = (a.status || '').toLowerCase();
                              return s === 'accepted' || s === 'diterima' || s === 'completed';
                            }).length} <span className="text-xs font-normal text-slate-500">Peserta</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium block pt-0.5">
                            Lolos seleksi
                          </span>
                        </div>
                        <div className="w-12 h-12 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-xl flex items-center justify-center shrink-0">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Grid: Pelamar Terbaru & Lowongan Terpopuler */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sisi Kiri: Pelamar Terbaru */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base tracking-tight">Pelamar Kerja Terbaru</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Daftar kandidat yang baru saja melamar ke instansi Anda</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('pelamar')}
                          className="text-[#1E3A8A] hover:text-[#142355] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Semua Pelamar <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {myApplicants.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400 space-y-2 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                          <Users className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-600">Belum ada mahasiswa yang melamar pada postingan lowongan Anda.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {myApplicants.slice(0, 4).map((appl) => {
                            const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(
                              s => s.userId === appl.userId || s.id === appl.mahasiswaId || (appl.nim && s.nim === appl.nim)
                            );
                            const roleBadgeText = studentRecord?.userStatusType || (appl.nim ? 'Mahasiswa' : 'Alumni');
                            const jobTitleText = getJobTitle(appl.tujuanMagang, namaInstansi);

                            return (
                              <div key={appl.id} className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 shrink-0">
                                    {studentRecord?.photoUrl ? (
                                      <img src={studentRecord.photoUrl} alt={appl.namaMahasiswa} className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                    ) : (
                                      <div className="w-10 h-10 bg-white text-[#1E3A8A] rounded-xl flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200">
                                        {appl.namaMahasiswa ? appl.namaMahasiswa.charAt(0).toUpperCase() : 'M'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-bold text-slate-900 text-xs leading-snug">{appl.namaMahasiswa}</h5>
                                      <span className="bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]/60 text-[11px] font-bold px-1.5 py-0.2 rounded">
                                        {roleBadgeText}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">
                                      {appl.programStudi || 'Teknik Informatika'} {appl.nim ? `• NIM: ${appl.nim}` : ''}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Posisi: <strong className="text-slate-800 font-bold">{jobTitleText}</strong>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    onClick={() => handleOpenApplicantDetail(appl)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition flex items-center gap-1 shadow-sm cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" /> Review
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Sisi Kanan: Lowongan Terkini & Status */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base tracking-tight">Status Lowongan</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Daftar lowongan kerja yang sedang tayang</p>
                        </div>
                        <button
                          onClick={() => { setActiveTab('lowongan'); setShowAddJob(false); }}
                          className="text-[#1E3A8A] hover:text-[#142355] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Kelola <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {myJobs.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400 space-y-2 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-600">Belum ada lowongan yang diposting.</p>
                          <button
                            onClick={() => { setActiveTab('lowongan'); setShowAddJob(true); }}
                            className="text-xs font-bold text-[#1E3A8A] underline cursor-pointer"
                          >
                            + Posting lowongan pertama Anda
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {myJobs.slice(0, 4).map((job) => {
                            const isMagang = job.tipe === 'magang';
                            const isActive = job.status === 'published';
                            const applicantCount = myApplicants.filter(a => a.lowonganId === job.id || (a.tujuanMagang && a.tujuanMagang.toLowerCase().includes(job.judul.toLowerCase()))).length;

                            return (
                              <div key={job.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition">
                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-bold uppercase px-1.5 py-0.5 rounded border ${isMagang ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                      {isMagang ? 'MAGANG' : 'KERJA'}
                                    </span>
                                    {isActive ? (
                                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tayang
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-bold text-slate-500">Tutup</span>
                                    )}
                                  </div>
                                  <h5 className="font-bold text-xs text-slate-900 truncate">{job.judul}</h5>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                    <span>Kuota: {job.kuota || 1}</span>
                                    <span>•</span>
                                    <span className="text-[#1E3A8A] font-bold">{applicantCount} Pelamar</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleEditJob(job)}
                                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
                                  title="Edit Lowongan"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
               *  TAB 2: KELOLA LOWONGAN & FORM PEMBUATAN
               * =======================================================*/}
              {activeTab === 'lowongan' && (() => {
                const filteredMyJobs = (myJobs || []).filter(j => {
                  if (!j) return false;
                  if (jobSearchKeyword) {
                    const kw = jobSearchKeyword.toLowerCase();
                    const matchTitle = (j.judul || '').toLowerCase().includes(kw);
                    const matchInstansi = (j.namaInstansi || '').toLowerCase().includes(kw);
                    const matchLoc = (j.lokasi || '').toLowerCase().includes(kw);
                    const matchDesc = (j.deskripsi || '').toLowerCase().includes(kw);
                    if (!matchTitle && !matchInstansi && !matchLoc && !matchDesc) return false;
                  }
                  if (jobTipeFilter !== 'all' && j.tipe !== jobTipeFilter) return false;
                  if (jobStatusFilter !== 'all' && j.status !== jobStatusFilter) return false;
                  return true;
                });

                const sortedMyJobs = [...filteredMyJobs].sort((a, b) => {
                  if (jobSortOrder === 'oldest') {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeA - timeB;
                  }
                  if (jobSortOrder === 'alphabetical') {
                    return (a.judul || '').localeCompare(b.judul || '');
                  }
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  if (timeA !== timeB) return timeB - timeA;
                  return (b.id || '').localeCompare(a.id || '', undefined, { numeric: true });
                });

                const totalJobPages = Math.max(1, Math.ceil(sortedMyJobs.length / jobsPerPage));
                const startJobIdx = (jobCurrentPage - 1) * jobsPerPage;
                const displayedMyJobs = sortedMyJobs.slice(startJobIdx, startJobIdx + jobsPerPage);

                return (
                  <div className="space-y-6" id="mtr-panel-lowongan">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-2xl tracking-tight">Manajemen Database Lowongan</h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                          Kelola kuota, batas tanggal pendaftaran, serta publikasi lowongan magang atau kerja.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (showAddJob) resetJobForm();
                          else {
                            resetJobForm();
                            setShowAddJob(true);
                          }
                        }}
                        className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        {showAddJob ? "Tutup Form Lowongan" : "Posting Lowongan Baru"}
                      </button>
                    </div>

                    {/* FORM PEMBUATAN / EDIT LOWONGAN */}
                    {showAddJob && (
                      <div className="bg-white rounded-xl border border-[#BFDBFE]/90 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn" id="job-form-container">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[#1E3A8A] font-semibold text-xs block mb-1">
                              {editingJobId ? "Mode Edit Lowongan" : "Formulir Lowongan Baru"}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900">
                              {editingJobId ? "Perbarui Informasi Lowongan" : "Publikasikan Lowongan Baru"}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={resetJobForm}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleAddJobPosting} className="space-y-6 text-xs sm:text-sm">
                          {/* Banner Petunjuk Input Mitra */}
                          <div className="p-3.5 rounded-xl bg-[#EFF6FF]/80 border border-[#BFDBFE]/80 flex items-start gap-2.5 text-xs text-[#172554]">
                            <Info className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                              <strong>Ketentuan Pengisian:</strong> Hanya <strong>Judul Posisi</strong> dan <strong>Batas Waktu Pendaftaran</strong> yang wajib diisi. Kolom deskripsi, kualifikasi, tanggung jawab, benefit, kuota, dan lokasi bersifat opsional (informasi dapat merujuk langsung pada poster pamflet yang diunggah).
                            </p>
                          </div>

                          {/* 1. INFORMASI UTAMA */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#1E3A8A]" /> 1. Informasi Pokok Posisi
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-700">Judul Posisi / Pekerjaan *</label>
                                <input
                                  type="text"
                                  required
                                  value={judul}
                                  onChange={(e) => setJudul(e.target.value)}
                                  placeholder="Contoh: Frontend React Engineer / Accounting Intern"
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Tipe Lowongan</label>
                                <Dropdown
                                  value={tipe}
                                  onChange={(v) => setTipe(v as any)}
                                  className="w-full"
                                  options={[
                                    { value: 'magang', label: 'Program Magang Industri' },
                                    { value: 'kerja', label: 'Lowongan Kerja (Full-time / Part-time)' }
                                  ]}
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Estimasi Gaji / Uang Saku (Opsional)</label>
                                <input
                                  type="text"
                                  value={gaji}
                                  onChange={(e) => setGaji(e.target.value)}
                                  placeholder="Contoh: Rp 2.500.000 / Bulan atau Kompetitif"
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Kuota Penerimaan (Orang) (Opsional)</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={kuota}
                                  onChange={(e) => setKuota(e.target.value)}
                                  placeholder="3 (Opsional)"
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Batas Waktu Pendaftaran (Deadline) *</label>
                                <input
                                  type="date"
                                  required
                                  value={deadline}
                                  onChange={(e) => setDeadline(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] font-semibold"
                                />
                              </div>

                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-700">Lokasi Penempatan Kerja / Magang (Opsional)</label>
                                <LocationPicker
                                  value={lokasi}
                                  onChange={(val) => setLokasi(val)}
                                />
                              </div>
                            </div>

                            {/* Multi-Kategori Spesialisasi */}
                            <div className="space-y-2 pt-2">
                              <label className="text-xs font-bold text-slate-700 block">Kategori Spesialisasi Pekerjaan (Bisa pilih lebih dari satu)</label>
                              <div className="flex flex-wrap gap-2">
                                {JOB_SPECIALIZATIONS.map((spec) => {
                                  const isChecked = selectedKategori.includes(spec);
                                  return (
                                    <button
                                      type="button"
                                      key={spec}
                                      onClick={() => handleCategoryToggle(spec)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${isChecked
                                        ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD] shadow-sm font-bold'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                      {isChecked && <Check className="w-3.5 h-3.5 text-[#1E3A8A]" />}
                                      <span>{spec}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 2. MEDIA VISUAL & BRANDING */}
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-[#1E3A8A]" /> 2. Media Visual &amp; Poster Lowongan
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              {/* Logo Perusahaan */}
                              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                                <label className="text-xs font-bold text-slate-800 block">Logo Instansi / Perusahaan</label>
                                <div className="flex items-center gap-3">
                                  <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                                    <Upload className="w-3.5 h-3.5" /> Upload File Logo
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileUpload} />
                                  </label>
                                  {companyLogoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setCompanyLogoUrl('')}
                                      className="text-rose-600 text-xs font-bold hover:underline"
                                    >
                                      Hapus
                                    </button>
                                  )}
                                </div>
                                {companyLogoUrl && (
                                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center">
                                    <img src={companyLogoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                  </div>
                                )}
                              </div>

                              {/* Poster Lowongan (Flyer) */}
                              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                                <label className="text-xs font-bold text-slate-800 block">Poster / Pamflet Lowongan (Rasio 9:16 atau 1:1)</label>
                                <div className="flex items-center gap-3">
                                  <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                                    <Upload className="w-3.5 h-3.5" /> Upload Poster Flyer
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePosterFileUpload} />
                                  </label>
                                  {posterUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPosterUrl('')}
                                      className="text-rose-600 text-xs font-bold hover:underline"
                                    >
                                      Hapus
                                    </button>
                                  )}
                                </div>
                                {posterUrl && (
                                  <div className="w-20 h-28 rounded-xl border border-slate-200 bg-white overflow-hidden">
                                    <img src={posterUrl} alt="Poster Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 3. CTA & TAUTAN EKSTERNAL */}
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-2">
                              <ExternalLink className="w-4 h-4 text-[#1E3A8A]" /> 3. Pengaturan Tombol Pendaftaran (CTA)
                            </h4>

                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={ctaEnabled}
                                  onChange={(e) => setCtaEnabled(e.target.checked)}
                                  className="w-4 h-4 text-[#1E3A8A] rounded border-slate-300 focus:ring-[#1E3A8A] cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-800">
                                  Kustomisasi Tombol Lamar / Gunakan Tautan Pendaftaran Eksternal
                                </span>
                              </label>

                              {ctaEnabled && (
                                <div className="space-y-3 pt-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold text-slate-600">Label Tombol CTA</label>
                                      <input
                                        type="text"
                                        value={ctaLabel}
                                        onChange={(e) => setCtaLabel(e.target.value)}
                                        placeholder="Lamar Pekerjaan / Lamar Sekarang"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                      />
                                      <p className="text-xs text-slate-400">Default: "Lamar Pekerjaan"</p>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold text-slate-600">URL Tautan Eksternal (Opsional)</label>
                                      <input
                                        type="url"
                                        value={linkEksternal}
                                        onChange={(e) => setLinkEksternal(e.target.value)}
                                        placeholder="https://forms.gle/... atau https://karir.perusahaan.com"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                      />
                                      <p className="text-xs text-slate-500">
                                        Kosongkan jika ingin pelamar melamar via sistem portal CDC.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Informative Guidance Banner */}
                                  <div className="p-3 rounded-xl bg-[#EFF6FF]/80 border border-[#BFDBFE]/80 flex items-start gap-2.5 text-xs text-[#1E3A8A]">
                                    <Info className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                                    <div className="space-y-0.5 text-xs leading-relaxed">
                                      <p className="font-semibold text-[#172554]">Ketentuan Logika Tombol Lamar:</p>
                                      <ul className="list-disc list-inside space-y-0.5 text-[#1E3A8A]/90">
                                        <li><strong>Jika URL tautan eksternal diisi:</strong> Tombol lamar akan mengarahkan pelamar langsung ke tautan eksternal (Google Forms / Website Karir).</li>
                                        <li><strong>Jika URL tautan dikosongkan:</strong> Pelamar akan melamar langsung melalui formulir sistem CDC, dan data otomatis masuk ke database pelamar Anda.</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 4. DESKRIPSI & RINCIAN PEKERJAAN */}
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#1E3A8A]" /> 4. Deskripsi, Persyaratan &amp; Benefit
                            </h4>

                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Ringkasan Deskripsi Pekerjaan (Opsional)</label>
                                <textarea
                                  value={deskripsi}
                                  onChange={(e) => setDeskripsi(e.target.value)}
                                  rows={4}
                                  placeholder="Jelaskan gambaran umum mengenai peran, proyek, dan lingkungan kerja..."
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Tanggung Jawab (Satu baris per poin) (Opsional)</label>
                                  <textarea
                                    value={tanggungJawab}
                                    onChange={(e) => setTanggungJawab(e.target.value)}
                                    rows={4}
                                    placeholder="Mengembangkan fitur aplikasi web&#10;Melakukan pengujian kode & bug fixing"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Kualifikasi Persyaratan (Satu baris per poin) (Opsional)</label>
                                  <textarea
                                    value={kualifikasi}
                                    onChange={(e) => setKualifikasi(e.target.value)}
                                    rows={4}
                                    placeholder="Mahasiswa semester 6 ke atas&#10;Memiliki laptop pribadi"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Keahlian Teknis (Satu baris per poin) (Opsional)</label>
                                  <textarea
                                    value={keahlian}
                                    onChange={(e) => setKeahlian(e.target.value)}
                                    rows={3}
                                    placeholder="React.js / TailwindCSS&#10;REST API Integration"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-700">Benefit &amp; Fasilitas (Satu baris per poin) (Opsional)</label>
                                  <textarea
                                    value={benefit}
                                    onChange={(e) => setBenefit(e.target.value)}
                                    rows={3}
                                    placeholder="Uang saku bulanan&#10;Sertifikat magang industri resmi"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tombol Simpan Form */}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={resetJobForm}
                              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#142355] text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {editingJobId ? "Simpan Perubahan Lowongan" : "Posting Lowongan ke Publik"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* SEARCH & FILTER CONTROLS TOOLBAR */}
                    {!showAddJob && (
                      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
                          {/* Search Bar */}
                          <div className="sm:col-span-2 md:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Cari judul lowongan, posisi, atau lokasi..."
                              value={jobSearchKeyword}
                              onChange={(e) => {
                                setJobSearchKeyword(e.target.value);
                                setJobCurrentPage(1);
                              }}
                              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#60A5FA] transition"
                            />
                            {jobSearchKeyword && (
                              <button onClick={() => setJobSearchKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Filter Tipe */}
                          <div className="md:col-span-3">
                            <Dropdown
                              value={jobTipeFilter}
                              onChange={(v) => {
                                setJobTipeFilter(v as any);
                                setJobCurrentPage(1);
                              }}
                              className="w-full"
                              options={[
                                { value: 'all', label: 'Semua Tipe' },
                                { value: 'magang', label: 'Program Magang' },
                                { value: 'kerja', label: 'Lowongan Kerja' }
                              ]}
                            />
                          </div>

                          {/* Filter Status */}
                          <div className="md:col-span-2">
                            <Dropdown
                              value={jobStatusFilter}
                              onChange={(v) => {
                                setJobStatusFilter(v as any);
                                setJobCurrentPage(1);
                              }}
                              className="w-full"
                              options={[
                                { value: 'all', label: 'Semua Status' },
                                { value: 'published', label: 'Aktif Tayang' },
                                { value: 'closed', label: 'Tutup' }
                              ]}
                            />
                          </div>

                          {/* Sorting */}
                          <div className="md:col-span-2">
                            <Dropdown
                              value={jobSortOrder}
                              onChange={(v) => {
                                setJobSortOrder(v as any);
                                setJobCurrentPage(1);
                              }}
                              className="w-full"
                              options={[
                                { value: 'newest', label: 'Urutkan Terbaru' },
                                { value: 'oldest', label: 'Urutkan Terlama' },
                                { value: 'alphabetical', label: 'Abjad (A-Z)' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LISTING VACANCIES CARDS GRID (2 COLUMNS) */}
                    {!showAddJob && (
                      <>
                        {displayedMyJobs.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded-xl py-14 text-center text-xs text-slate-400 space-y-2 shadow-sm">
                            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="font-bold text-slate-700 text-base">Tidak ada lowongan ditemukan.</p>
                            <p className="text-slate-400 text-xs">Coba ubah kata kunci pencarian atau filter status lowongan.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="mitra-job-list">
                            {displayedMyJobs.map((job) => {
                              const displayTitle = getJobTitle(job.judul, namaInstansi);
                              const isMagang = job.tipe === 'magang';
                              const isActive = job.status === 'published';
                              const applicantCount = myApplicants.filter(a => a.lowonganId === job.id || (a.tujuanMagang && a.tujuanMagang.toLowerCase().includes(job.judul.toLowerCase()))).length;

                              return (
                                <div
                                  key={job.id}
                                  className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between group relative"
                                  id={`job-box-${job.id}`}
                                >
                                  <div className="space-y-3.5">
                                    {/* Top Badges Row */}
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`px-2.5 py-1 rounded-lg font-semibold text-xs border ${isMagang
                                        ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]/80'
                                        : 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]/80'
                                        }`}>
                                        {isMagang ? 'Program Magang' : 'Lowongan Kerja'}
                                      </span>

                                      {isActive ? (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold text-xs inline-flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                          Aktif Tayang
                                        </span>
                                      ) : (
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold text-xs inline-flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                          Ditutup
                                        </span>
                                      )}
                                    </div>

                                    {/* Header & Logo */}
                                    <div className="flex items-start gap-3.5 pt-1">
                                      {job.companyLogo ? (
                                        <img
                                          src={job.companyLogo}
                                          alt={displayTitle}
                                          className="w-13 h-13 object-contain rounded-xl border border-slate-200 shrink-0 bg-slate-50 p-1.5 shadow-sm"
                                        />
                                      ) : (
                                        <div className={`w-13 h-13 rounded-xl ${getCompanyBadgeColor(job.namaInstansi || namaInstansi || 'Instansi')} flex items-center justify-center p-1 shrink-0 shadow-sm text-white font-bold text-base`}>
                                          {getCompanyInitials(job.namaInstansi || namaInstansi || 'Instansi')}
                                        </div>
                                      )}

                                      <div className="space-y-1 min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-900 group-hover:text-[#142355] transition-colors text-base sm:text-lg line-clamp-1">
                                          {displayTitle}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 font-medium">
                                          <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.lokasi || 'Kendari'}</span>
                                          <span className="flex items-center gap-1 shrink-0"><Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kuota: {job.kuota || 3}</span>
                                          <span className="flex items-center gap-1 shrink-0 font-bold text-[#1E3A8A]"><Users className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" /> {applicantCount} Pelamar</span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Deadline: <strong className="text-slate-700 font-semibold">{formatDateDisplay(job.deadline)}</strong>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed pt-2 border-t border-slate-100">
                                      {job.deskripsi || 'Tidak ada deskripsi rinci.'}
                                    </p>
                                  </div>

                                  {/* Actions Bar */}
                                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEditJob(job)}
                                        className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-[#1E3A8A]" /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleToggleJobStatus(job.id, job.status)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                                      >
                                        {job.status === 'published' ? 'Tutup Lowongan' : 'Aktifkan'}
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => setDeleteJobTarget(job)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl transition cursor-pointer"
                                      title="Hapus Lowongan"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Pagination Bar */}
                        {sortedMyJobs.length > 0 && (
                          <div className="flex items-center justify-center gap-1.5 pt-4">
                            <button
                              onClick={() => {
                                setJobCurrentPage(prev => Math.max(1, prev - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                const el = document.getElementById('mtr-panel-lowongan');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              disabled={jobCurrentPage === 1}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                            >
                              &lt;
                            </button>

                            {Array.from({ length: totalJobPages }, (_, i) => i + 1).map((pageNum) => {
                              const isActive = pageNum === jobCurrentPage;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => {
                                    setJobCurrentPage(pageNum);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    const el = document.getElementById('mtr-panel-lowongan');
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${isActive
                                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => {
                                setJobCurrentPage(prev => Math.min(totalJobPages, prev + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                const el = document.getElementById('mtr-panel-lowongan');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              disabled={jobCurrentPage === totalJobPages}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                            >
                              &gt;
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* =========================================================
               *  TAB 3: DATABASE PELAMAR & SELEKSI
               * =======================================================*/}
              {activeTab === 'pelamar' && (() => {
                const statTotal = myApplicants.length;
                const statReview = myApplicants.filter(a => {
                  const s = (a.status || '').toLowerCase();
                  return s === 'under_review' || s === 'submitted' || s === 'menunggu_review' || s === 'draft';
                }).length;
                const statInterview = myApplicants.filter(a => (a.status || '').toLowerCase() === 'interview').length;
                const statAccepted = myApplicants.filter(a => {
                  const s = (a.status || '').toLowerCase();
                  return s === 'accepted' || s === 'diterima' || s === 'completed';
                }).length;

                const normalizeStatusKey = (status: string) => {
                  const s = (status || '').toLowerCase();
                  if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') return 'menunggu_review';
                  if (s === 'seleksi_administrasi' || s === 'revision') return 'seleksi_administrasi';
                  if (s === 'interview') return 'interview';
                  if (s === 'accepted' || s === 'diterima' || s === 'completed' || s === 'report_submitted') return 'diterima';
                  if (s === 'rejected' || s === 'ditolak') return 'ditolak';
                  return 'menunggu_review';
                };

                const filteredAppls = myApplicants.filter((appl) => {
                  if (selectedJobFilter !== 'all') {
                    const matchId = appl.lowonganId === selectedJobFilter;
                    const matchJobObj = myJobs.find(j => j.id === selectedJobFilter);
                    const matchTitle = matchJobObj && (appl.tujuanMagang || '').toLowerCase().includes(matchJobObj.judul.toLowerCase());
                    if (!matchId && !matchTitle) return false;
                  }

                  if (selectedStatusFilter !== 'all') {
                    const normStatus = normalizeStatusKey(appl.status);
                    if (normStatus !== selectedStatusFilter) return false;
                  }

                  if (searchQuery.trim() !== '') {
                    const q = searchQuery.toLowerCase().trim();
                    const matchName = (appl.namaMahasiswa || '').toLowerCase().includes(q);
                    const matchNim = (appl.nim || '').toLowerCase().includes(q);
                    if (!matchName && !matchNim) return false;
                  }

                  return true;
                });

                const itemsPerPage = 10;
                const totalItems = filteredAppls.length;
                const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
                const safeCurrentPage = Math.min(currentPage, totalPages);
                const startIndex = (safeCurrentPage - 1) * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
                const paginatedAppls = filteredAppls.slice(startIndex, startIndex + itemsPerPage);

                const renderStatusBadge = (status: string) => {
                  const s = (status || '').toLowerCase();
                  if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') {
                    return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200/80 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Menunggu Review
                      </span>
                    );
                  }
                  if (s === 'seleksi_administrasi' || s === 'revision') {
                    return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]/80 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                        Seleksi Administrasi
                      </span>
                    );
                  }
                  if (s === 'interview') {
                    return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-orange-50 text-orange-700 border-orange-200/80 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Tahap Wawancara
                      </span>
                    );
                  }
                  if (s === 'accepted' || s === 'diterima' || s === 'completed' || s === 'report_submitted') {
                    return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Diterima
                      </span>
                    );
                  }
                  if (s === 'rejected' || s === 'ditolak') {
                    return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200/80 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Ditolak
                      </span>
                    );
                  }
                  return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200 inline-flex items-center gap-1.5">
                      {status}
                    </span>
                  );
                };

                return (
                  <div className="space-y-6" id="mtr-panel-pelamar">
                    {/* Header & Stats Banner */}
                    <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-bold text-slate-900 text-2xl tracking-tight">Database Pelamar &amp; Seleksi</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Evaluasi resume, berkas CV resmi, serta lakukan penjadwalan interview langsung dengan kandidat.
                        </p>
                      </div>

                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3.5 transition-colors hover:bg-slate-100/60">
                          <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-500 font-medium text-xs">Total Pelamar</div>
                            <div className="text-xl font-bold text-slate-900 mt-0.5">{statTotal}</div>
                          </div>
                        </div>

                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3.5 transition-colors hover:bg-slate-100/60">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-500 font-medium text-xs">Dalam Review</div>
                            <div className="text-xl font-bold text-slate-900 mt-0.5">{statReview}</div>
                          </div>
                        </div>

                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3.5 transition-colors hover:bg-slate-100/60">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-500 font-medium text-xs">Interview</div>
                            <div className="text-xl font-bold text-slate-900 mt-0.5">{statInterview}</div>
                          </div>
                        </div>

                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3.5 transition-colors hover:bg-slate-100/60">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-500 font-medium text-xs">Diterima</div>
                            <div className="text-xl font-bold text-slate-900 mt-0.5">{statAccepted}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                        <div className="md:col-span-4">
                          <Dropdown
                            value={selectedJobFilter}
                            onChange={(v) => setSelectedJobFilter(v)}
                            className="w-full"
                            options={[
                              { value: 'all', label: 'Semua Lowongan' },
                              ...myJobs.map((job) => ({ value: job.id, label: job.judul }))
                            ]}
                          />
                        </div>

                        <div className="md:col-span-4">
                          <Dropdown
                            value={selectedStatusFilter}
                            onChange={(v) => setSelectedStatusFilter(v)}
                            className="w-full"
                            options={[
                              { value: 'all', label: 'Semua Status Seleksi' },
                              { value: 'menunggu_review', label: 'Menunggu Review' },
                              { value: 'seleksi_administrasi', label: 'Seleksi Administrasi' },
                              { value: 'interview', label: 'Interview' },
                              { value: 'diterima', label: 'Diterima' },
                              { value: 'ditolak', label: 'Ditolak' }
                            ]}
                          />
                        </div>

                        <div className="md:col-span-4 relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama atau NIM pelamar..."
                            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#60A5FA] transition"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Table / Cards List of Applicants */}
                    <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                      {filteredAppls.length === 0 ? (
                        <div className="text-center py-16 px-4 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200" id="applicants-empty">
                          <Users className="w-12 h-12 text-slate-300 mx-auto" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-base">Tidak ada pelamar ditemukan</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                              Tidak ditemukan data pelamar yang cocok dengan kriteria pencarian atau status yang Anda pilih.
                            </p>
                          </div>
                          {(selectedJobFilter !== 'all' || selectedStatusFilter !== 'all' || searchQuery) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJobFilter('all');
                                setSelectedStatusFilter('all');
                                setSearchQuery('');
                                setCurrentPage(1);
                              }}
                              className="mt-2 text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                            >
                              Reset Semua Filter
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table View (>= lg) */}
                          <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200/90 shadow-sm">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                                  <th className="py-3.5 px-4">Kandidat Pelamar</th>
                                  <th className="py-3.5 px-4">Program Studi</th>
                                  <th className="py-3.5 px-4">Posisi Dilamar</th>
                                  <th className="py-3.5 px-4">Tanggal Melamar</th>
                                  <th className="py-3.5 px-4">Status Seleksi</th>
                                  <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedAppls.map((appl) => {
                                  const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(
                                    s => s.userId === appl.userId || s.id === appl.mahasiswaId || (appl.nim && s.nim === appl.nim)
                                  );
                                  const photoUrl = studentRecord?.photoUrl;
                                  const s = (appl.status || '').toLowerCase();

                                  return (
                                    <tr key={appl.id} className="hover:bg-slate-50/80 transition duration-150">
                                      <td className="py-4 px-4 text-slate-900">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 shrink-0">
                                            {photoUrl ? (
                                              <img src={photoUrl} alt={appl.namaMahasiswa} className="w-9 h-9 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                            ) : (
                                              <div className="w-9 h-9 bg-white text-[#1E3A8A] rounded-xl flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200">
                                                {appl.namaMahasiswa ? appl.namaMahasiswa.charAt(0).toUpperCase() : 'M'}
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <div className="font-semibold text-slate-900">{appl.namaMahasiswa}</div>
                                            <div className="text-xs text-slate-500">{appl.nim ? `NIM: ${appl.nim}` : 'Alumni'}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4 text-slate-600 font-medium">{appl.programStudi || '-'}</td>
                                      <td className="py-4 px-4 font-semibold text-slate-800">{getJobTitle(appl.tujuanMagang, namaInstansi)}</td>
                                      <td className="py-4 px-4 text-slate-500 font-medium text-xs whitespace-nowrap">
                                        {formatDate(appl.createdAt || appl.tanggalMulai)}
                                      </td>
                                      <td className="py-4 px-4 whitespace-nowrap">
                                        {renderStatusBadge(appl.status)}
                                      </td>
                                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                                        <button
                                          onClick={() => handleOpenApplicantDetail(appl)}
                                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer shadow-sm"
                                        >
                                          <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" /> Detail
                                        </button>

                                        {(s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') && (
                                          <button
                                            onClick={() => handleUpdateApplicantStatus(appl.id, 'seleksi_administrasi', `Status pelamar ${appl.namaMahasiswa} kini Seleksi Administrasi.`)}
                                            className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                                          >
                                            <ArrowRight className="w-3.5 h-3.5" /> Review
                                          </button>
                                        )}

                                        {(s === 'seleksi_administrasi' || s === 'revision') && (
                                          <>
                                            <button
                                              onClick={() => handleOpenInterviewModal(appl)}
                                              className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                                            >
                                              <Calendar className="w-3.5 h-3.5" /> Interview
                                            </button>
                                            <button
                                              onClick={() => setConfirmModal({ type: 'reject', applicant: appl })}
                                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                                            >
                                              Tolak
                                            </button>
                                          </>
                                        )}

                                        {s === 'interview' && (
                                          <>
                                            <button
                                              onClick={() => setConfirmModal({ type: 'accept', applicant: appl })}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                                            >
                                              <CheckCircle className="w-3.5 h-3.5" /> Terima
                                            </button>
                                            <button
                                              onClick={() => setConfirmModal({ type: 'reject', applicant: appl })}
                                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                                            >
                                              Tolak
                                            </button>
                                          </>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards View (< lg) */}
                          <div className="block lg:hidden space-y-3.5">
                            {paginatedAppls.map((appl) => {
                              const s = (appl.status || '').toLowerCase();
                              return (
                                <div key={appl.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{appl.namaMahasiswa}</h4>
                                      <div className="text-xs text-slate-500 mt-0.5">
                                        {appl.programStudi || '-'} {appl.nim ? `• NIM: ${appl.nim}` : ''}
                                      </div>
                                    </div>
                                    <div className="shrink-0">{renderStatusBadge(appl.status)}</div>
                                  </div>

                                  <div className="text-xs space-y-1.5 bg-white p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500 font-medium">Posisi:</span>
                                      <span className="font-bold text-slate-800 text-right">{getJobTitle(appl.tujuanMagang, namaInstansi)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500 font-medium">Tanggal Melamar:</span>
                                      <span className="font-mono text-slate-600">{formatDate(appl.createdAt || appl.tanggalMulai)}</span>
                                    </div>
                                  </div>

                                  <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleOpenApplicantDetail(appl)}
                                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" /> Detail
                                    </button>
                                    {(s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') && (
                                      <button
                                        onClick={() => handleUpdateApplicantStatus(appl.id, 'seleksi_administrasi', `Status pelamar ${appl.namaMahasiswa} kini Seleksi Administrasi.`)}
                                        className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <ArrowRight className="w-3.5 h-3.5" /> Review
                                      </button>
                                    )}
                                    {(s === 'seleksi_administrasi' || s === 'revision') && (
                                      <>
                                        <button
                                          onClick={() => handleOpenInterviewModal(appl)}
                                          className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                                        >
                                          <Calendar className="w-3.5 h-3.5" /> Interview
                                        </button>
                                        <button
                                          onClick={() => setConfirmModal({ type: 'reject', applicant: appl })}
                                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                                        >
                                          Tolak
                                        </button>
                                      </>
                                    )}
                                    {s === 'interview' && (
                                      <>
                                        <button
                                          onClick={() => setConfirmModal({ type: 'accept', applicant: appl })}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" /> Terima
                                        </button>
                                        <button
                                          onClick={() => setConfirmModal({ type: 'reject', applicant: appl })}
                                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                                        >
                                          Tolak
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination Footer */}
                          {filteredAppls.length > 0 && (
                            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                              <div>
                                Menampilkan {startIndex + 1}–{endIndex} dari {totalItems} pelamar
                              </div>

                              <div className="flex items-center gap-1.5 font-bold">
                                <button
                                  type="button"
                                  disabled={safeCurrentPage <= 1}
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                  &lt;
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${safeCurrentPage === pageNum
                                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                      }`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}

                                <button
                                  type="button"
                                  disabled={safeCurrentPage >= totalPages}
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                  &gt;
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* =========================================================
               *  TAB 4: PROFIL INSTANSI
               * =======================================================*/}
              {activeTab === 'profil' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="mtr-panel-profil">
                  {/* Form Profil di Sisi Kiri */}
                  <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[#1E3A8A] font-bold text-xs uppercase tracking-wider block mb-0.5">
                        PENGATURAN IDENTITAS
                      </span>
                      <h3 className="font-bold text-slate-900 text-xl">Kelola Profil Instansi &amp; Kontak</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Informasi ini ditampilkan pada kartu lowongan pekerjaan serta halaman profil mitra resmi di portal CDC.
                      </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-5" id="profile-form">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Nama Lengkap Instansi / Perusahaan *</label>
                          <input
                            type="text"
                            required
                            value={namaInstansi}
                            onChange={(e) => setNamaInstansi(e.target.value)}
                            placeholder="Contoh: PT Telkom Akses Kendari"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Sektor / Bidang Industri</label>
                          <input
                            type="text"
                            value={bidangIndustri}
                            onChange={(e) => setBidangIndustri(e.target.value)}
                            placeholder="Contoh: Teknologi Informasi & Software"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nama Petugas Penghubung / PIC *</label>
                          <input
                            type="text"
                            required
                            value={kontakPerson}
                            onChange={(e) => setKontakPerson(e.target.value)}
                            placeholder="Nama HRD / PIC Kemitraan"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp Resmi *</label>
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Situs Web Resmi (Website)</label>
                          <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://perusahaan.co.id"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Alamat Lengkap Kantor *</label>
                          <textarea
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            rows={3}
                            placeholder="Jl. K.H. Ahmad Dahlan No. 10, Wua-Wua, Kendari..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" /> Simpan Perubahan Profil
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Sisi Kanan: Live Preview Profil Instansi */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        PRATINJAU KARTU INSTANSI
                      </span>

                      <div className="p-5 rounded-xl bg-[#1B365D] text-white space-y-4 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white text-[#1E3A8A] font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            {companyLogoUrl ? (
                              <img src={companyLogoUrl} alt="" className="w-full h-full object-contain p-1.5" />
                            ) : (
                              <span>{namaInstansi ? namaInstansi.charAt(0).toUpperCase() : 'M'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate leading-tight text-white">{namaInstansi || 'Nama Instansi'}</h4>
                            <span className="text-[11px] text-[#BFDBFE] font-medium block mt-0.5">{bidangIndustri || 'Sektor Industri'}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-[#DBEAFE] border-t border-[#1E3A8A]/80 pt-3">
                          <div className="flex items-center gap-2 text-xs">
                            <User className="w-3.5 h-3.5 text-[#93C5FD] shrink-0" />
                            <span>PIC: <strong>{kontakPerson || '-'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="w-3.5 h-3.5 text-[#93C5FD] shrink-0" />
                            <span>{phone || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Globe className="w-3.5 h-3.5 text-[#93C5FD] shrink-0" />
                            <span className="truncate">{website || '-'}</span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-[11px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> STATUS: MITRA AKTIF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* =========================================================
       *  MODALS & SPOTLIGHT OVERLAYS
       * =======================================================*/}

      {/* Modal Jadwalkan Interview */}
      {schedulingApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-xl border border-slate-200 shadow-lg overflow-hidden my-8">
            <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <span className="text-[#1E3A8A] font-bold text-xs uppercase tracking-wider block mb-1">
                  PENJADWALAN WAWANCARA
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Jadwalkan Interview
                </h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">
                  Pelamar: <strong className="text-slate-800">{schedulingApplicant.namaMahasiswa}</strong> ({schedulingApplicant.nim || 'Alumni'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingApplicant(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInterviewSchedule} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold text-xs block">Tanggal Interview *</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold text-xs block">Waktu / Jam (WITA) *</label>
                  <input
                    type="text"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    placeholder="Contoh: 10:00 WITA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold text-xs block">Metode Interview *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterviewMethod('online')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${interviewMethod === 'online'
                      ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD] ring-2 ring-[#1E3A8A]/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Online (Google Meet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewMethod('offline')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${interviewMethod === 'offline'
                      ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD] ring-2 ring-[#1E3A8A]/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Offline (Tatap Muka)
                  </button>
                </div>
              </div>

              {interviewMethod === 'online' ? (
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold text-xs block">Link Video Conference *</label>
                  <input
                    type="url"
                    required
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold text-xs block">Lokasi Pertemuan / Alamat *</label>
                  <input
                    type="text"
                    required
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="Kantor Perusahaan Lt. 2 Ruang Rapat HRD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold text-xs block">Catatan / Instruksi untuk Pelamar</label>
                <textarea
                  rows={3}
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  placeholder="Contoh: Harap membawa dokumen CV fisik & portofolio terbaru."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSchedulingApplicant(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Simpan &amp; Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Pelamar & Berkas CV */}
      {selectedApplicantDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-4xl w-full rounded-xl border border-slate-200 shadow-lg overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            {(() => {
              const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(
                s => s.userId === selectedApplicantDoc.userId || s.id === selectedApplicantDoc.mahasiswaId || (selectedApplicantDoc.nim && s.nim === selectedApplicantDoc.nim)
              );
              const photoUrl = studentRecord?.photoUrl;
              const jobTitleText = getJobTitle(selectedApplicantDoc.tujuanMagang, namaInstansi);

              return (
                <div className="bg-white border-b border-slate-100 p-5 sm:p-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {photoUrl ? (
                        <img src={photoUrl} alt={selectedApplicantDoc.namaMahasiswa} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center text-[#1E3A8A] font-bold text-lg">
                          {selectedApplicantDoc.namaMahasiswa.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[#1E3A8A] font-bold text-xs uppercase tracking-wider block mb-0.5">
                        DETAIL PELAMAR • {jobTitleText}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                        {selectedApplicantDoc.namaMahasiswa}
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium">
                        {studentRecord?.userStatusType || (selectedApplicantDoc.nim ? 'Mahasiswa' : 'Alumni')} · {selectedApplicantDoc.programStudi || 'Teknik Informatika'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplicantDoc(null)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition shrink-0 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })()}

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm overflow-y-auto flex-1">
              {/* Profil & Lowongan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2.5">
                    <User className="w-4 h-4 text-[#1E3A8A]" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">PROFIL PELAMAR</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Nama Lengkap:</span>
                      <span className="font-bold text-slate-900">{selectedApplicantDoc.namaMahasiswa}</span>
                    </div>
                    {selectedApplicantDoc.nim && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">NIM:</span>
                        <span className="font-semibold text-slate-800">{selectedApplicantDoc.nim}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Program Studi:</span>
                      <span className="font-semibold text-slate-800">{selectedApplicantDoc.programStudi || 'Belum Diisi'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Universitas:</span>
                      <span className="font-semibold text-slate-800">Universitas Muhammadiyah Kendari</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Email:</span>
                      <span className="font-semibold text-slate-800">{selectedApplicantDoc.email || (selectedApplicantDoc.nim ? `mhs.${selectedApplicantDoc.nim}@umkendari.ac.id` : 'pelamar@umkendari.ac.id')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Nomor HP / WA:</span>
                      <span className="font-semibold text-slate-800">{selectedApplicantDoc.telepon || selectedApplicantDoc.noHp || '0821-9988-7711'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2.5">
                    <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">LOWONGAN DILAMAR</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Nama Posisi:</span>
                      <span className="font-bold text-slate-900">{getJobTitle(selectedApplicantDoc.tujuanMagang, namaInstansi)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Jenis Program:</span>
                      <span className="font-semibold text-slate-800">Magang &amp; Kerja Praktik Industri</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Periode Pelaksanaan:</span>
                      <span className="font-medium text-slate-700">{selectedApplicantDoc.tanggalMulai || '10 Agt 2026'} s/d {selectedApplicantDoc.tanggalSelesai || '10 Feb 2027'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Tanggal Melamar:</span>
                      <span className="font-medium text-slate-700">{formatDate(selectedApplicantDoc.createdAt || selectedApplicantDoc.tanggalMulai)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Internal Pelamar (Rahasia) */}
              <div className="bg-[#EFF6FF]/60 p-5 rounded-xl border border-[#BFDBFE]/80 space-y-3">
                <div className="flex items-center justify-between border-b border-[#BFDBFE]/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#1E3A8A]" />
                    <h4 className="font-bold text-[#1E3A8A] text-xs">
                      Catatan Internal Evaluasi Pelamar
                    </h4>
                  </div>
                  <span className="text-xs font-medium text-[#1E3A8A] bg-[#DBEAFE] border border-[#BFDBFE] px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Hanya Tim Mitra
                  </span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Tuliskan catatan evaluasi internal tentang pelamar (misal: portofolio bagus, perlu ditanyakan pengalaman kerja sama tim)..."
                    className="w-full p-3.5 rounded-xl border border-[#BFDBFE] bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]-500 leading-relaxed font-medium"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveInternalNote(selectedApplicantDoc.id)}
                      className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Simpan Catatan Internal
                    </button>
                  </div>
                </div>
              </div>

              {/* Pendidikan, Skill, Pengalaman & Sertifikat */}
              {(() => {
                const students = getFromDB<Mahasiswa>('mahasiswa');
                const applicantProfile = students.find(
                  s => s.userId === selectedApplicantDoc.userId || s.id === selectedApplicantDoc.mahasiswaId || s.nama.toLowerCase() === selectedApplicantDoc.namaMahasiswa.toLowerCase()
                );

                const qualifications = (selectedApplicantDoc.qualifications && selectedApplicantDoc.qualifications.length > 0)
                  ? selectedApplicantDoc.qualifications
                  : (applicantProfile?.qualifications && applicantProfile.qualifications.length > 0)
                    ? applicantProfile.qualifications
                    : [];
                const ipkDisplay = selectedApplicantDoc.ipk || applicantProfile?.ipk || '';

                const skillsList = (selectedApplicantDoc.skills && selectedApplicantDoc.skills.length > 0)
                  ? selectedApplicantDoc.skills
                  : (applicantProfile?.skills && applicantProfile.skills.length > 0)
                    ? applicantProfile.skills
                    : [];

                const experiencesList = (selectedApplicantDoc.experiences && selectedApplicantDoc.experiences.length > 0)
                  ? selectedApplicantDoc.experiences
                  : (applicantProfile?.experiences && applicantProfile.experiences.length > 0)
                    ? applicantProfile.experiences
                    : [];

                const certificatesList = (selectedApplicantDoc.certificates && selectedApplicantDoc.certificates.length > 0)
                  ? selectedApplicantDoc.certificates
                  : (applicantProfile?.certificates && applicantProfile.certificates.length > 0)
                    ? applicantProfile.certificates
                    : [];

                const validQualifications = qualifications.filter(q => q && (q.institution?.trim() || q.level?.trim()));
                const hasPendidikan = validQualifications.length > 0 || Boolean(ipkDisplay && String(ipkDisplay).trim());

                const validSkills = (Array.isArray(skillsList) ? skillsList : []).filter(s => s && String(s).trim());
                const hasSkills = validSkills.length > 0;

                const validExperiences = (Array.isArray(experiencesList) ? experiencesList : []).filter(e => e && (e.position?.trim() || e.company?.trim()));
                const hasExperiences = validExperiences.length > 0;

                const validCertificates = (Array.isArray(certificatesList) ? certificatesList : []).filter(c => c && c.name?.trim());
                const hasCertificates = validCertificates.length > 0;

                const hasAnyProfileInfo = hasPendidikan || hasSkills || hasExperiences || hasCertificates;

                // Jika pelamar belum mengisi pendidikan, skill, pengalaman, dan sertifikat, hilangkan seksi ini agar langsung ke CV
                if (!hasAnyProfileInfo) {
                  return null;
                }

                return (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {hasPendidikan && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#1E3A8A]" /> PENDIDIKAN
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            {validQualifications.map((q, idx) => (
                              <div key={q.id || idx} className="border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                                <div className="font-bold text-slate-900">{q.institution}</div>
                                <div className="text-slate-600 font-medium">{q.level} {q.year ? `(${q.year})` : ''}</div>
                                {q.ipk && (
                                  <div className="text-slate-700 font-mono font-bold text-xs mt-0.5">
                                    IPK: {q.ipk}
                                  </div>
                                )}
                              </div>
                            ))}
                            {ipkDisplay && !validQualifications.some(q => q.ipk) && (
                              <div className="text-slate-500 text-xs font-mono pt-1">
                                IPK: <span className="font-bold text-slate-900">{ipkDisplay}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {hasSkills && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            <Code className="w-4 h-4 text-[#1E3A8A]" /> Keahlian &amp; Kompetensi
                          </h4>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {validSkills.map((sk, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs border border-slate-200/80">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasExperiences && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#1E3A8A]" /> PENGALAMAN
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-700 font-medium">
                            {validExperiences.map((exp, idx) => (
                              <li key={exp.id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                <div className="font-bold text-slate-900">{exp.position}</div>
                                <div className="text-slate-600 font-semibold text-xs">{exp.company} {exp.period ? `(${exp.period})` : ''}</div>
                                {exp.description && exp.description !== '-' && (
                                  <div className="text-slate-500 text-xs mt-1 leading-snug">{exp.description}</div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {hasCertificates && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#1E3A8A]" /> SERTIFIKAT
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-700 font-medium">
                            {validCertificates.map((cert, idx) => (
                              <li key={cert.id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                <div className="font-bold text-slate-900">{cert.name}</div>
                                <div className="text-slate-600 font-semibold text-xs">
                                  {cert.issuer ? `${cert.issuer} • ` : ''}{cert.year}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Dokumen Curriculum Vitae (CV) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1E3A8A]" /> DOKUMEN CURRICULUM VITAE (CV)
                </h4>
                <PdfViewerPreview
                  berkasUrl={selectedApplicantDoc.berkasUrl}
                  fileName={selectedApplicantDoc.berkasNama || `CV_${selectedApplicantDoc.namaMahasiswa.replace(/\s+/g, '_')}.pdf`}
                  studentName={selectedApplicantDoc.namaMahasiswa}
                  prodi={selectedApplicantDoc.programStudi}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedApplicantDoc(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {(() => {
                  const s = (selectedApplicantDoc.status || '').toLowerCase();

                  if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateApplicantStatus(selectedApplicantDoc.id, 'seleksi_administrasi', `Status pelamar ${selectedApplicantDoc.namaMahasiswa} kini Seleksi Administrasi.`);
                          setSelectedApplicantDoc(null);
                        }}
                        className="bg-[#1E3A8A] hover:bg-[#142355] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-4 h-4" /> Mulai Review Pelamar
                      </button>
                    );
                  }

                  if (s === 'seleksi_administrasi' || s === 'revision') {
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenInterviewModal(selectedApplicantDoc);
                          }}
                          className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <Calendar className="w-4 h-4" /> Loloskan ke Interview
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({ type: 'reject', applicant: selectedApplicantDoc });
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-rose-200 cursor-pointer"
                        >
                          Tolak Pelamar
                        </button>
                      </>
                    );
                  }

                  if (s === 'interview') {
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({ type: 'accept', applicant: selectedApplicantDoc });
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Terima Pelamar Ini
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({ type: 'reject', applicant: selectedApplicantDoc });
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-rose-200 cursor-pointer"
                        >
                          Tolak Pelamar
                        </button>
                      </>
                    );
                  }

                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Terima / Tolak */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 shadow-lg p-6 sm:p-7 space-y-5 text-center my-8">
            <div className={`w-14 h-14 rounded-xl mx-auto flex items-center justify-center ${confirmModal.type === 'accept'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-rose-100 text-rose-600'
              }`}>
              {confirmModal.type === 'accept' ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-lg">
                {confirmModal.type === 'accept' ? 'Konfirmasi Penerimaan Pelamar' : 'Konfirmasi Penolakan Pelamar'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {confirmModal.type === 'accept'
                  ? `Apakah Anda yakin ingin menerima ${confirmModal.applicant.namaMahasiswa} sebagai peserta?`
                  : `Apakah Anda yakin ingin menolak pelamar ini?`}
              </p>
              <div className="text-xs font-medium text-slate-500 pt-1">
                {confirmModal.applicant.namaMahasiswa} {confirmModal.applicant.nim ? `• NIM: ${confirmModal.applicant.nim}` : `• ${confirmModal.applicant.programStudi || 'Alumni'}`}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batalkan
              </button>

              {confirmModal.type === 'accept' ? (
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateApplicantStatus(confirmModal.applicant.id, 'accepted', `Pelamar ${confirmModal.applicant.namaMahasiswa} telah berhasil Diterima.`);
                    setConfirmModal(null);
                    setSelectedApplicantDoc(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-lg cursor-pointer"
                >
                  Ya, Terima
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateApplicantStatus(confirmModal.applicant.id, 'rejected', `Pelamar ${confirmModal.applicant.namaMahasiswa} telah Ditolak.`);
                    setConfirmModal(null);
                    setSelectedApplicantDoc(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg cursor-pointer"
                >
                  Ya, Tolak
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus Lowongan */}
      {deleteJobTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 shadow-lg p-6 sm:p-7 space-y-5 text-center my-8">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center bg-rose-100 text-rose-600">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-lg">Hapus Lowongan?</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Lowongan <strong className="text-slate-800">{deleteJobTarget.judul || 'tanpa judul'}</strong> akan dihapus permanen dari sistem.
              </p>
              <div className="text-xs font-medium text-slate-500 pt-1">
                Riwayat pelamar yang sudah masuk tidak ikut terhapus.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteJobTarget(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => handleDeleteJob(deleteJobTarget.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Center Popup Modal */}
      {alertPopup && (
        <div
          className="fixed inset-0 z-70 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setAlertPopup(null)}
        >
          <div
            className="bg-white max-w-sm w-full rounded-xl border border-slate-200 shadow-lg p-6 sm:p-7 space-y-4 text-center my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-16 h-16 rounded-xl mx-auto flex items-center justify-center shadow-sm ${alertPopup.type === 'success'
              ? 'bg-[#EFF6FF] text-[#1E3A8A]'
              : alertPopup.type === 'error'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-[#DBEAFE] text-[#1E3A8A]'
              }`}>
              {alertPopup.type === 'success' ? (
                <CheckCircle className="w-8 h-8 text-[#1E3A8A]" />
              ) : alertPopup.type === 'error' ? (
                <XCircle className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-lg leading-tight">
                {alertPopup.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed px-2">
                {alertPopup.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                autoFocus
                onClick={() => setAlertPopup(null)}
                className={`w-full py-3 px-5 rounded-xl text-white font-bold text-xs shadow-lg transition cursor-pointer active:scale-95 ${alertPopup.type === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#1E3A8A] hover:bg-[#142355]'
                  }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette Spotlight Modal (Ctrl + K / Cmd + K) Identik AdminDashboard */}
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
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200/90 overflow-hidden z-10 space-y-0"
            >
              {/* Command Search Header */}
              <div className="flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={cmdSearchQuery}
                  onChange={(e) => setCmdSearchQuery(e.target.value)}
                  placeholder="Ketik navigasi atau tindakan (misal: Lowongan, Pelamar, Posting Baru, Logout)..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none"
                />
                <div className="flex items-center gap-1.5 ml-2">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-[11px] font-bold text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">ESC</kbd>
                </div>
              </div>

              {/* Command Items List */}
              <div className="p-3 max-h-96 overflow-y-auto space-y-1">
                {[
                  { id: 'ringkasan', group: 'Navigasi', label: 'Ringkasan Laporan & Aktivitas Mitra', icon: LayoutDashboard, action: () => { setActiveTab('ringkasan'); setShowAddJob(false); setIsCmdPaletteOpen(false); } },
                  { id: 'job-add', group: 'Aksi Cepat', label: '+ Posting Lowongan Kerja / Magang Baru', icon: Plus, action: () => { setActiveTab('lowongan'); setShowAddJob(true); setIsCmdPaletteOpen(false); } },
                  { id: 'lowongan-list', group: 'Manajemen Lowongan', label: 'Kelola Database Lowongan & Status', icon: Briefcase, badge: myJobs.length > 0 ? `${myJobs.length} Posisi` : undefined, action: () => { setActiveTab('lowongan'); setShowAddJob(false); setIsCmdPaletteOpen(false); } },
                  { id: 'pelamar-list', group: 'Pelamar & Seleksi', label: 'Database Pelamar & Resume Masuk', icon: Users, badge: myApplicants.length > 0 ? `${myApplicants.length} Pelamar` : undefined, action: () => { setActiveTab('pelamar'); setShowAddJob(false); setIsCmdPaletteOpen(false); } },
                  { id: 'profil-mitra', group: 'Instansi & Akun', label: 'Pengaturan Profil Instansi & PIC', icon: Building2, action: () => { setActiveTab('profil'); setShowAddJob(false); setIsCmdPaletteOpen(false); } },
                  { id: 'logout', group: 'Sistem', label: 'Keluar Akun Mitra (Sign Out)', icon: LogOut, action: () => { setIsCmdPaletteOpen(false); onLogout(); } }
                ]
                  .filter((item) => item.label.toLowerCase().includes(cmdSearchQuery.toLowerCase()) || item.group.toLowerCase().includes(cmdSearchQuery.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-[#DBEAFE]/80 hover:text-[#1B365D] transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-[#1B365D] group-hover:text-white flex items-center justify-center transition">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-[#1B365D]">{item.label}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{item.group}</div>
                        </div>
                      </div>
                      {item.badge ? (
                        <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{item.badge}</span>
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B365D] transition" />
                      )}
                    </button>
                  ))}
              </div>

              {/* Command Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Pilih item untuk navigasi cepat</span>
                <span className="flex items-center gap-1.5"><Command className="w-3.5 h-3.5 text-slate-400" /> Command Palette</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold animate-fadeIn ${toast.type === 'success' ? 'bg-[#1E3A8A] text-white' : 'bg-rose-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      {/* Modal Zoom Thumbnail */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
