/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserType, 
  Mitra, 
  Mahasiswa,
  Lowongan, 
  PengajuanMagang, 
  SurveiLulusan,
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
  XCircle
} from 'lucide-react';
import { JOB_SPECIALIZATIONS, getCompanyBadgeColor, getCompanyInitials } from './JobSearchMasterDetail';
import Dropdown from './Dropdown';

interface MitraDashboardProps {
  user: UserType;
  onLogout: () => void;
  onReloadData?: () => void;
}

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
      <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 p-4 flex items-center justify-center shadow-xs">
        <img src={activeUrl} alt={fileName || "Berkas CV"} className="max-h-[500px] object-contain mx-auto rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
      {/* Top Single Unified Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0077C6] text-white flex items-center justify-center font-extrabold text-[11px] shrink-0">
            PDF
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-100 text-xs truncate block max-w-xs sm:max-w-sm">
              {fileName || `CV_${studentName}.pdf`}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Berkas Resmi Pelamar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {numPages > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono text-[11px]">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="hover:text-white disabled:opacity-30 cursor-pointer font-bold"
              >
                &larr;
              </button>
              <span>{currentPage} / {numPages}</span>
              <button
                type="button"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                className="hover:text-white disabled:opacity-30 cursor-pointer font-bold"
              >
                &rarr;
              </button>
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
            className="bg-[#0077C6] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {/* PDF Content Viewport */}
      <div className="w-full min-h-[480px] max-h-[620px] overflow-auto bg-slate-200/80 p-4 flex items-center justify-center relative">
        {loadingPdf && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
            <div className="w-8 h-8 border-3 border-[#0077C6] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Memuat pratinjau dokumen PDF...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`max-w-full bg-white shadow-lg rounded-md transition-opacity duration-200 ${
            loadingPdf || useFallback ? 'hidden' : 'block'
          }`}
        />

        {useFallback && !loadingPdf && (
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5 text-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0077C6] flex items-center justify-center border border-blue-100 mx-auto shadow-2xs">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">{fileName || `CV_${studentName}.pdf`}</h4>
              <p className="text-xs text-slate-500 font-medium">
                Pelamar: <span className="font-bold text-slate-700">{studentName}</span> ({prodi})
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={openPdf}
                className="bg-[#0077C6] hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
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

export default function MitraDashboard({ user, onLogout, onReloadData }: MitraDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'profil' | 'lowongan' | 'pelamar' | 'survei'>('ringkasan');
  
  // Data States
  const [mitraData, setMitraData] = useState<Mitra | null>(null);
  const [myJobs, setMyJobs] = useState<Lowongan[]>([]);
  const [myApplicants, setMyApplicants] = useState<PengajuanMagang[]>([]);
  const [mySurveys, setMySurveys] = useState<SurveiLulusan[]>([]);
  const [selectedApplicantDoc, setSelectedApplicantDoc] = useState<PengajuanMagang | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form States
  const [namaInstansi, setNamaInstansi] = useState('');
  const [bidangIndustri, setBidangIndustri] = useState('Teknologi Informasi & Software');
  const [alamat, setAlamat] = useState('');
  const [kontakPerson, setKontakPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Add & Edit Job Form States (Matches 100% with Job Detail fields)
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

  // Media Visual Upload States (Company Logo for Job Info card & Poster for Job Detail)
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [logoUploadType, setLogoUploadType] = useState<'url' | 'file'>('file');
  const [posterUploadType, setPosterUploadType] = useState<'url' | 'file'>('file');

  // Text & Multiline Detail Fields
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggungJawab, setTanggungJawab] = useState('');
  const [kualifikasi, setKualifikasi] = useState('');
  const [keahlian, setKeahlian] = useState('');
  const [benefit, setBenefit] = useState('');

  // Survey Form States
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [kualitasLulusan, setKualitasLulusan] = useState(5);
  const [kemampuanTeknis, setKemampuanTeknis] = useState(5);
  const [kemampuanKomunikasi, setKemampuanKomunikasi] = useState(4);
  const [etikaKerja, setEtikaKerja] = useState(5);
  const [kemampuanKerjaTim, setKemampuanKerjaTim] = useState(5);
  const [surveiSaran, setSurveiSaran] = useState('');

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
  const [interviewDate, setInterviewDate] = useState<string>('2026-08-15');
  const [interviewTime, setInterviewTime] = useState<string>('10:00 WITA');
  const [interviewMethod, setInterviewMethod] = useState<'online' | 'offline'>('online');
  const [interviewLink, setInterviewLink] = useState<string>('https://meet.google.com/cdc-umk-interview');
  const [interviewLocation, setInterviewLocation] = useState<string>('Kantor HRD Mitra Lt. 2');
  const [interviewNote, setInterviewNote] = useState<string>('Persiapkan presentasi portofolio singkat (5-10 menit).');

  // Confirmation Modal State (Terima / Tolak)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'accept' | 'reject';
    applicant: PengajuanMagang;
  } | null>(null);

  // Center Alert Popup Modal State (with OK button)
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
      // Prioritas 1: kandidat.lowonganId cocok dengan ID lowongan milik mitra
      if (c.lowonganId && jobIds.has(c.lowonganId)) return true;

      // Prioritas 2: kandidat.mitraId cocok dengan ID mitra yang sedang login
      if (c.mitraId && c.mitraId === mit.id) return true;

      // Match pendukung: kesamaan nama instansi atau judul lowongan
      if (c.namaInstansi && companyNameClean && (c.namaInstansi.toLowerCase().trim().includes(companyNameClean) || companyNameClean.includes(c.namaInstansi.toLowerCase().trim()))) return true;

      const targetTitleClean = (c.tujuanMagang || '').toLowerCase().trim();
      if (targetTitleClean && jobTitles.some(t => t === targetTitleClean || targetTitleClean.includes(t) || t.includes(targetTitleClean))) {
        return true;
      }

      if (companyNameClean && companyNameClean.length > 2 && targetTitleClean.includes(companyNameClean)) {
        return true;
      }

      return true;
    });

    // Sort newest candidates first using parseDateToTimestamp
    partnerCandidates.sort((a, b) => {
      const timeA = parseDateToTimestamp(a.createdAt) || parseDateToTimestamp(a.tanggalMulai) || 0;
      const timeB = parseDateToTimestamp(b.createdAt) || parseDateToTimestamp(b.tanggalMulai) || 0;
      return timeB - timeA;
    });

    setMyApplicants(partnerCandidates);
    setCurrentPage(1);

    // Load surveys
    const surveys = getFromDB<SurveiLulusan>('survei_lulusan');
    const partnerSurveys = surveys.filter(s => s.mitraId === mit.id || (mit.namaInstansi && s.namaInstansi === mit.namaInstansi));
    setMySurveys(partnerSurveys);
  };

  useEffect(() => {
    loadMitraData();

    // Event listener for storage changes & window focus (cross-tab / submit sync)
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

    triggerAlert('success', 'Profil Berhasil Disimpan', 'Identitas dan informasi profil instansi mitra berhasil diperbarui dan disimpan ke sistem.');
  };

  // Upload Logo Perusahaan (Tampil di Kartu Job Info)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      triggerToast('error', 'Ukuran file logo maksimal 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCompanyLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Poster Lowongan (Tampil di Halaman Job Detail)
  const handlePosterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('error', 'Ukuran file poster maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPosterUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
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
    setDeskripsi(job.deskripsi || '');
    setTanggungJawab(Array.isArray(job.tanggungJawab) ? job.tanggungJawab.join('\n') : job.tanggungJawab || '');
    setKualifikasi(Array.isArray(job.kualifikasi) ? job.kualifikasi.join('\n') : job.kualifikasi || '');
    setKeahlian(Array.isArray(job.keahlian) ? job.keahlian.join('\n') : job.keahlian || '');
    setBenefit(Array.isArray(job.benefit) ? job.benefit.join('\n') : job.benefit || '');
    setShowAddJob(true);
  };

  // Add / Update Job Posting
  const handleAddJobPosting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraData) return;

    if (!judul || !lokasi || !deadline) {
      triggerToast('error', 'Semua bidang wajib (*) harus diisi');
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
      judul,
      tipe,
      namaInstansi: mitraData.namaInstansi,
      companyLogo: logoTarget,
      imageUrl: posterUrl || undefined,
      flyer: posterUrl || undefined,
      bannerImage: posterUrl || undefined,
      flyers: posterUrl ? [posterUrl] : undefined,
      lokasi,
      kategori: selectedKategori.join(', '),
      gaji: gaji || 'Kompetitif',
      kuota: Number(kuota) || 1,
      deadline,
      deskripsi: deskripsi ? deskripsi.trim() : '',
      tanggungJawab: parseLines(tanggungJawab),
      kualifikasi: parseLines(kualifikasi),
      keahlian: parseLines(keahlian),
      benefit: parseLines(benefit),
      status: 'published',
      createdAt: existingJob?.createdAt || new Date().toISOString()
    };

    if (editingJobId) {
      updateInDB<Lowongan>('lowongan', newJob);
      triggerToast('success', 'Lowongan pekerjaan berhasil diperbarui.');
    } else {
      insertToDB<Lowongan>('lowongan', newJob);
      triggerToast('success', 'Lowongan baru berhasil diposting aktif ke halaman publik.');
    }

    resetJobForm();
    loadMitraData();
    if (onReloadData) onReloadData();
  };

  // Change job status draft/closed (FR-MTR-04)
  const handleToggleJobStatus = (jobId: string, currentStatus: any) => {
    const allJobs = getFromDB<Lowongan>('lowongan');
    const target = allJobs.find(j => j.id === jobId);
    if (target) {
      target.status = currentStatus === 'published' ? 'closed' : 'published';
      updateInDB<Lowongan>('lowongan', target);
      loadMitraData();
      if (onReloadData) onReloadData();
      triggerToast('success', `Status lowongan berhasil diubah menjadi ${target.status === 'published' ? 'AKTIF/PUBLISHED' : 'DITUTUP'}.`);
    }
  };

  // Delete Job Posting safely
  const handleDeleteJob = (jobId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus lowongan ini dari server? Semua histori pelamar akan diarsipkan.')) {
      deleteInDB('lowongan', jobId);
      loadMitraData();
      if (onReloadData) onReloadData();
      triggerToast('success', 'Lowongan berhasil dihapus dari database.');
    }
  };

  // Helper to get or construct real applicant selection history logs
  const getApplicantHistoryLogs = (appl: PengajuanMagang): SelectionHistoryLog[] => {
    if (appl.riwayatSeleksi && appl.riwayatSeleksi.length > 0) {
      return appl.riwayatSeleksi;
    }

    // Construct real history logs from actual applicant data
    const logs: SelectionHistoryLog[] = [];
    const createdDate = formatDate(appl.createdAt || '2026-08-10');

    // 1. Initial Submission
    logs.push({
      status: 'submitted',
      label: 'Lamaran diterima sistem',
      date: createdDate
    });

    const s = (appl.status || '').toLowerCase();

    // 2. Seleksi Administrasi
    if (s !== 'submitted' && s !== 'under_review' && s !== 'draft') {
      logs.push({
        status: 'seleksi_administrasi',
        label: 'Masuk seleksi administrasi',
        date: createdDate
      });
    }

    // 3. Interview
    if (s === 'interview' || appl.interviewDate) {
      logs.push({
        status: 'interview',
        label: `Interview dijadwalkan (${formatDate(appl.interviewDate || '2026-08-13')} jam ${appl.interviewTime || '10:00 WITA'})`,
        date: formatDate(appl.interviewDate || '2026-08-13'),
        note: appl.interviewNote
      });
    }

    // 4. Final Decision (Accepted / Rejected)
    if (s === 'accepted' || s === 'diterima' || s === 'completed') {
      logs.push({
        status: 'accepted',
        label: 'Lolos seleksi & Diterima sebagai peserta',
        date: '20 Agustus 2026'
      });
    } else if (s === 'rejected' || s === 'ditolak') {
      logs.push({
        status: 'rejected',
        label: 'Lamaran ditolak',
        date: '20 Agustus 2026'
      });
    }

    return logs;
  };

  // Handle Candidate Status Transition (Tahapan Seleksi 1-5)
  const handleUpdateApplicantStatus = (applId: string, decision: string, customMessage?: string) => {
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

      updateInDB<PengajuanMagang>('pengajuan_magang', target);
      loadMitraData();
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
    } else {
      triggerToast('error', 'Data pelamar tidak ditemukan.');
      triggerAlert('error', 'Gagal', 'Data pelamar tidak ditemukan.');
    }
  };

  // Open Interview Scheduling Modal
  const handleOpenInterviewModal = (appl: PengajuanMagang) => {
    setSchedulingApplicant(appl);
    if (appl.interviewDate) setInterviewDate(appl.interviewDate);
    if (appl.interviewTime) setInterviewTime(appl.interviewTime);
    if (appl.interviewMethod) setInterviewMethod(appl.interviewMethod);
    if (appl.interviewLink) setInterviewLink(appl.interviewLink);
    if (appl.interviewLocation) setInterviewLocation(appl.interviewLocation);
    if (appl.interviewNote) setInterviewNote(appl.interviewNote);
  };

  // Submit & Save Interview Schedule
  const handleSaveInterviewSchedule = (e: React.FormEvent) => {
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

      updateInDB<PengajuanMagang>('pengajuan_magang', target);
      loadMitraData();
      if (onReloadData) onReloadData();
      setSchedulingApplicant(null);
      triggerToast('success', `Jadwal interview untuk ${target.namaMahasiswa} berhasil disimpan dan status diubah menjadi INTERVIEW.`);
      triggerAlert('success', 'Jadwal Interview Tersimpan!', `Jadwal interview untuk ${target.namaMahasiswa} berhasil disimpan dan status diubah menjadi INTERVIEW.`);
    }
  };

  // Open Applicant Detail Modal with internal note synced
  const handleOpenApplicantDetail = (appl: PengajuanMagang) => {
    setSelectedApplicantDoc(appl);
    setInternalNoteInput(appl.catatanAdmin || '');
  };

  // Save Internal Note for Applicant (Rahasia Mitra & Admin)
  const handleSaveInternalNote = (applicantId: string) => {
    const allAppls = getFromDB<PengajuanMagang>('pengajuan_magang');
    const target = allAppls.find(a => a.id === applicantId);
    if (target) {
      target.catatanAdmin = internalNoteInput;
      updateInDB<PengajuanMagang>('pengajuan_magang', target);
      loadMitraData();
      if (onReloadData) onReloadData();
      triggerToast('success', 'Catatan internal seleksi berhasil disimpan ke database.');
    } else {
      triggerToast('error', 'Data pelamar tidak ditemukan.');
    }
  };

  // Delete Candidate Applicant
  const handleDeleteApplicant = (applId: string, namaMahasiswa: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pelamar ${namaMahasiswa} dari daftar?`)) {
      deleteInDB('pengajuan_magang', applId);
      loadMitraData();
      triggerToast('success', `Data pelamar ${namaMahasiswa} berhasil dihapus dari database.`);
    }
  };

  // Submit Partner Satisfaction Survey
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumniId) {
      triggerToast('error', 'Silakan pilih alumni/lulusan yang ingin dievaluasi.');
      return;
    }

    const newSurvey: SurveiLulusan = {
      id: `sv_${Date.now()}`,
      mitraId: mitraData?.id || `mtr_${user.id}`,
      namaInstansi: mitraData?.namaInstansi || user.name,
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
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border text-sm max-w-md flex items-center gap-3 transition-all animate-fadeIn ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold' 
              : 'bg-rose-50 text-rose-900 border-rose-300 font-semibold'
          }`}
        >
          {message.type === 'success' ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div className="text-xs sm:text-sm font-bold leading-snug">{message.text}</div>
        </div>
      )}

      {/* HEADER BANNER (Senior Programmer Vercel Grade) */}
      <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-40 shadow-md" id="mtr-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold shadow-xs border border-blue-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                <span>PORTAL MITRA INDUSTRI &amp; CDC</span>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                  VERIFIED MITRA
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-medium">Universitas Muhammadiyah Kendari</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block bg-slate-900/80 px-3.5 py-1 rounded-xl border border-slate-800">
              <div className="font-bold text-xs text-slate-100 leading-none">{namaInstansi || user.name}</div>
              <div className="text-emerald-400 text-[11px] font-semibold leading-tight mt-0.5">PIC: {kontakPerson || user.name}</div>
            </div>
            <button 
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700/80 transition active:scale-95 cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 bg-[#1B365D] text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-xs border border-slate-700/30 overflow-hidden">
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt={namaInstansi} className="w-full h-full object-contain p-1.5 bg-white" />
                ) : (
                  <span>{namaInstansi ? namaInstansi.charAt(0).toUpperCase() : 'M'}</span>
                )}
              </div>
              <div className="truncate min-w-0">
                <div className="font-extrabold text-slate-900 text-sm truncate">{namaInstansi || 'Instansi Mitra'}</div>
                <div className="text-slate-400 text-xs truncate font-medium">{user.email}</div>
                <div className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider mt-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Mitra Terverifikasi</span>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5" id="mtr-nav-menu">
              {[
                { id: 'ringkasan', label: 'Ringkasan Kerja', icon: Building2 },
                { id: 'profil', label: 'Profil Instansi', icon: FileText },
                { id: 'lowongan', label: 'Kelola Lowongan', icon: Briefcase },
                { id: 'pelamar', label: 'Pelamar & Seleksi', icon: Users }
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0077C6] text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {menu.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3" id="mtr-side-status">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Status Kemitraan
            </h4>
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Kerja Sama:</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">VERIFIED / AKTIF</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Lowongan Aktif:</span>
                <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] font-mono">{myJobs.filter(j => j.status === 'published').length} Posisi</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CORE CONTENT DISPLAY BOARD */}
        <main className="lg:col-span-9 space-y-8" id="mtr-dashboard-main">
          
          {/* POLISHED VERIFIED PARTNER HEADER BANNER CARD */}
          {(activeTab === 'ringkasan' || activeTab === 'lowongan') && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6" id="mtr-welcome-banner">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#1B365D] text-white rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md border border-slate-700/40 overflow-hidden">
                    {companyLogoUrl ? (
                      <img src={companyLogoUrl} alt={namaInstansi} className="w-full h-full object-contain p-2 bg-white" />
                    ) : (
                      <span>{namaInstansi ? namaInstansi.charAt(0).toUpperCase() : 'M'}</span>
                    )}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-full font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>MITRA RESMI CDC UM KENDARI</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">{namaInstansi || 'Instansi Mitra Kampus'}</h2>
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs font-medium text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> PIC: <strong className="text-slate-800">{kontakPerson || user.name}</strong></span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Sektor: <strong className="text-slate-800">{bidangIndustri}</strong></span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kontak: <strong className="text-slate-800">{phone || user.phone || '-'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <button 
                    onClick={() => setActiveTab('profil')} 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-slate-500" /> Edit Profil
                  </button>
                  <button 
                    onClick={() => { setActiveTab('lowongan'); setShowAddJob(true); }} 
                    className="bg-gradient-to-r from-[#0077C6] to-[#005FA3] hover:from-blue-700 hover:to-blue-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Posting Lowongan
                  </button>
                </div>
              </div>

              {/* QUICK STAT COUNTERS WITH WOW EXPERT KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-md">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">TOTAL LOWONGAN</span>
                    <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {myJobs.length} <span className="text-sm font-semibold text-slate-500">Posisi</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                      Aktif di CDC
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-[#0077C6] border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-2xs">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-md">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">PELAMAR MASUK</span>
                    <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {myApplicants.length} <span className="text-sm font-semibold text-slate-500">Pelamar</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                      Perlu Evaluasi
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-2xs">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between transition group hover:bg-white hover:shadow-md">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">LOLOS &amp; REKRUT</span>
                    <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {myApplicants.filter(a => {
                        const s = (a.status || '').toLowerCase();
                        return s === 'accepted' || s === 'diterima' || s === 'completed';
                      }).length} <span className="text-sm font-semibold text-slate-500">Orang</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      Diterima Kerja
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-2xs">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div id="mtr-panel-ringkasan" className="space-y-6">
              {/* LATEST APPLICANTS PREVIEW (FR-MTR-05) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5" id="latest-applicants-sec">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg tracking-tight">Pelamar Kerja Terbaru</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Daftar mahasiswa &amp; alumni yang baru saja melamar ke lowongan kerja instansi Anda</p>
                  </div>
                  <button onClick={() => setActiveTab('pelamar')} className="text-[#0077C6] hover:text-blue-800 text-xs font-extrabold flex items-center gap-1 cursor-pointer">
                    Semua Pelamar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {myApplicants.length === 0 ? (
                  <div className="py-14 text-center text-xs text-slate-400 space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Belum ada mahasiswa yang melamar pada postingan lowongan Anda.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {myApplicants.slice(0, 3).map((appl) => {
                      const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(
                        s => s.userId === appl.userId || s.id === appl.mahasiswaId || (appl.nim && s.nim === appl.nim)
                      );
                      const isMahasiswa = studentRecord?.userStatusType === 'Mahasiswa';
                      const roleBadgeText = studentRecord?.userStatusType || (appl.nim ? 'Mahasiswa' : 'Job Seeker / Alumni');
                      const jobTitleText = getJobTitle(appl.tujuanMagang, namaInstansi);

                      return (
                        <div key={appl.id} className="bg-slate-50/80 hover:bg-slate-100/80 p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-2xs">
                          <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 shrink-0">
                              {studentRecord?.photoUrl ? (
                                <img src={studentRecord.photoUrl} alt={appl.namaMahasiswa} className="w-11 h-11 object-cover rounded-2xl border border-slate-200 shadow-2xs" />
                              ) : (
                                <div className="w-11 h-11 bg-[#1B365D] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-2xs border border-slate-700/50">
                                  {appl.namaMahasiswa ? appl.namaMahasiswa.charAt(0).toUpperCase() : 'M'}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-slate-900 text-sm leading-snug">{appl.namaMahasiswa}</h5>
                                <span className="bg-blue-50 text-[#0077C6] border border-blue-200/60 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {roleBadgeText}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 font-medium">
                                {isMahasiswa && appl.nim && (
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[11px] font-bold text-slate-700">NIM: {appl.nim}</span>
                                )}
                                <span>{appl.programStudi || 'Teknik Informatika'}</span>
                              </div>
                              <div className="text-xs text-slate-500 pt-0.5">
                                Posisi Dilamar: <strong className="text-slate-800 font-bold">{jobTitleText}</strong>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            <button 
                              onClick={() => setSelectedApplicantDoc(appl)}
                              className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" /> Lihat Berkas
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedApplicantDoc(appl);
                              }}
                              className="bg-[#0077C6] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                            >
                              Tinjau Pelamar <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL INSTANSI (FR-MTR-02) */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6" id="mtr-panel-profil">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sektor Industri Kemitraan</label>
                    <input 
                      type="text" 
                      value={bidangIndustri}
                      onChange={(e) => setBidangIndustri(e.target.value)}
                      placeholder="Contoh: Teknologi Informasi & Software"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Petugas Penghubung / PIC *</label>
                    <input 
                      type="text" 
                      required
                      value={kontakPerson}
                      onChange={(e) => setKontakPerson(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon / Hotline *</label>
                    <input 
                      type="text" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Situs Web Resmi (Website URL)</label>
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition font-normal"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6] transition font-normal"
                  ></textarea>
                </div>

                <div className="pt-5 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#0077C6] hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: KELOLA LOWONGAN (FR-MTR-03 & FR-MTR-04) */}
          {activeTab === 'lowongan' && (() => {
            // Filter and Sort myJobs
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
              // Default: newest first
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
                
                {/* TOP BAR HEADER & POSTING BUTTON */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">Manajemen Database Lowongan</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      Kelola kuota, batas tanggal pendaftaran, serta publikasi lowongan magang atau kerja.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddJob(!showAddJob)}
                    className="bg-[#0055D4] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddJob ? "Sembunyikan Form" : "Posting Lowongan Baru"}
                  </button>
                </div>

                {/* SEARCH & FILTER CONTROLS BAR (MODERN ADMIN STYLE) */}
                {!showAddJob && (
                  <div className="bg-white relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
                      
                      {/* 1. SEARCH BOX */}
                      <div className="sm:col-span-2 md:col-span-6 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Cari judul lowongan, posisi, atau kata kunci..."
                          value={jobSearchKeyword}
                          onChange={(e) => {
                            setJobSearchKeyword(e.target.value);
                            setJobCurrentPage(1);
                          }}
                          className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 hover:border-blue-300 transition"
                        />
                        {jobSearchKeyword && (
                          <button onClick={() => setJobSearchKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 2. TYPE FILTER */}
                      <div className="md:col-span-2">
                        <Dropdown
                          value={jobTipeFilter}
                          onChange={(v) => {
                            setJobTipeFilter(v as any);
                            setJobCurrentPage(1);
                          }}
                          className="w-full"
                          options={[
                            { value: 'all', label: 'Semua Jenis' },
                            { value: 'magang', label: 'Program Magang' },
                            { value: 'kerja', label: 'Lowongan Kerja' }
                          ]}
                        />
                      </div>

                      {/* 3. STATUS FILTER */}
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
                            { value: 'published', label: 'Aktif' },
                            { value: 'closed', label: 'Tutup' }
                          ]}
                        />
                      </div>

                      {/* 4. SORT ORDER */}
                      <div className="md:col-span-2">
                        <Dropdown
                          value={jobSortOrder}
                          onChange={(v) => {
                            setJobSortOrder(v as any);
                            setJobCurrentPage(1);
                          }}
                          className="w-full"
                          options={[
                            { value: 'newest', label: 'Terbaru' },
                            { value: 'oldest', label: 'Terlama' },
                            { value: 'alphabetical', label: 'Abjad (A-Z)' }
                          ]}
                        />
                      </div>

                    </div>
                  </div>
                )}

                {/* ADD & EDIT FORM SCREEN */}
                {showAddJob && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 animate-fadeIn" id="add-vacancy-panel">
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          {editingJobId ? <Edit3 className="w-5 h-5 text-[#10B981]" /> : <Plus className="w-5 h-5 text-[#10B981]" />}
                          {editingJobId ? "Edit Lowongan Pekerjaan" : "Form Input Lowongan Kerja / Magang Baru"}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Isi rincian lengkap lowongan yang akan ditampilkan pada kartu Job Info dan Halaman Job Detail.</p>
                      </div>
                    </div>

                    <form onSubmit={handleAddJobPosting} className="space-y-6 text-xs" id="add-job-form">
                      
                      {/* BAGIAN 1: INFORMASI UTAMA REKRUTMEN */}
                      <div className="space-y-4">
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">1. Informasi Utama Rekrutmen</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Judul Rekrutmen Karir / Posisi Pekerjaan *</label>
                            <input 
                              type="text" 
                              required
                              value={judul}
                              onChange={(e) => setJudul(e.target.value)}
                              placeholder="Contoh: Fullstack Web Developer Intern"
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

                          <div className="space-y-2 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700">
                                Spesialisasi / Kategori Pekerjaan * (Bisa pilih lebih dari 1)
                              </label>
                              <span className="text-[11px] font-bold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {selectedKategori.length} Kategori Dipilih
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                              {JOB_SPECIALIZATIONS.map((spec) => {
                                const isChecked = selectedKategori.includes(spec);
                                return (
                                  <label 
                                    key={spec} 
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer select-none ${
                                      isChecked 
                                        ? 'bg-white border-[#10B981] text-slate-900 shadow-xs ring-1 ring-[#10B981]/30 font-bold' 
                                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                                    }`}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleCategoryToggle(spec)}
                                      className="w-4 h-4 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer accent-[#10B981]"
                                    />
                                    <span className="truncate">{spec}</span>
                                  </label>
                                );
                              })}
                            </div>
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
                            <label className="text-xs font-bold text-slate-700">Kisaran Gaji / Insentif (Opsional)</label>
                            <input 
                              type="text" 
                              value={gaji}
                              onChange={(e) => setGaji(e.target.value)}
                              placeholder="Contoh: Rp 3.500.000 - Rp 5.000.000 / Kompetitif"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Rencana Kuota Penerimaan (Orang)</label>
                            <input 
                              type="number" 
                              min="1"
                              placeholder="Contoh: 3"
                              value={kuota}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  setKuota('');
                                } else {
                                  const parsed = parseInt(val, 10);
                                  setKuota(isNaN(parsed) ? '' : String(parsed));
                                }
                              }}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            />
                          </div>

                          <div className="space-y-1.5">
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
                      </div>

                      {/* BAGIAN 2: MEDIA VISUAL */}
                      <div className="space-y-4 pt-2">
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">2. Visual Media (Logo Perusahaan & Poster Lowongan)</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* 1. LOGO PERUSAHAAN */}
                          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-150">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-blue-600" /> Logo Perusahaan (Kartu Job Info)
                              </label>
                              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => setLogoUploadType('file')}
                                  className={`px-2 py-1 rounded transition ${logoUploadType === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                                >
                                  File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLogoUploadType('url')}
                                  className={`px-2 py-1 rounded transition ${logoUploadType === 'url' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                                >
                                  URL
                                </button>
                              </div>
                            </div>

                            {logoUploadType === 'file' ? (
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg"
                                  onChange={handleLogoFileUpload}
                                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                              </div>
                            ) : (
                              <input 
                                type="url"
                                value={companyLogoUrl}
                                onChange={(e) => setCompanyLogoUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                              />
                            )}

                            {companyLogoUrl && (
                              <div className="flex items-center gap-3 pt-1">
                                <img src={companyLogoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Logo Siap Ditampilkan</span>
                              </div>
                            )}
                          </div>

                          {/* 2. POSTER LOWONGAN */}
                          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-150">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-[#10B981]" /> Poster Lowongan (Halaman Job Detail)
                              </label>
                              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => setPosterUploadType('file')}
                                  className={`px-2 py-1 rounded transition ${posterUploadType === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                                >
                                  File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPosterUploadType('url')}
                                  className={`px-2 py-1 rounded transition ${posterUploadType === 'url' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                                >
                                  URL
                                </button>
                              </div>
                            </div>

                            {posterUploadType === 'file' ? (
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg"
                                  onChange={handlePosterFileUpload}
                                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                />
                              </div>
                            ) : (
                              <input 
                                type="url"
                                value={posterUrl}
                                onChange={(e) => setPosterUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
                              />
                            )}

                            {posterUrl && (
                              <div className="flex items-center gap-3 pt-1">
                                <img src={posterUrl} alt="Poster" className="w-10 h-14 object-cover rounded-lg border border-slate-200 bg-white" />
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Poster Siap Ditampilkan</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* BAGIAN 3: DETAIL ISI & PERSYARATAN PEKERJAAN */}
                      <div className="space-y-4 pt-2">
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">3. Detail Konten & Kriteria Lowongan</h5>
                        
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Deskripsi Ringkas Pekerjaan (Opsional)</label>
                            <textarea 
                              value={deskripsi}
                              onChange={(e) => setDeskripsi(e.target.value)}
                              rows={3}
                              placeholder="Uraikan gambaran umum, lingkup tugas, dan teknologi yang dipakai... (opsional)"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            ></textarea>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Tanggung Jawab Pekerjaan (Satu baris untuk setiap poin)</label>
                            <textarea 
                              value={tanggungJawab}
                              onChange={(e) => setTanggungJawab(e.target.value)}
                              rows={3}
                              placeholder="Contoh:&#10;Membantu dalam pengembangan aplikasi web&#10;Berkolaborasi dengan tim UI/UX Designer"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            ></textarea>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Kualifikasi & Persyaratan (Satu baris untuk setiap poin)</label>
                            <textarea 
                              value={kualifikasi}
                              onChange={(e) => setKualifikasi(e.target.value)}
                              rows={3}
                              placeholder="Contoh:&#10;Mahasiswa Teknik Informatika semester 6&#10;Menguasai bahasa pemrograman Javascript & React"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            ></textarea>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Keahlian & Technical Skills yang Dibutuhkan (Satu baris untuk setiap poin)</label>
                            <textarea 
                              value={keahlian}
                              onChange={(e) => setKeahlian(e.target.value)}
                              rows={2}
                              placeholder="Contoh:&#10;Javascript&#10;React.js&#10;TailwindCSS"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            ></textarea>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Benefit & Fasilitas Kompensasi (Satu baris untuk setiap poin)</label>
                            <textarea 
                              value={benefit}
                              onChange={(e) => setBenefit(e.target.value)}
                              rows={3}
                              placeholder="Contoh:&#10;Uang saku bulanan&#10;Sertifikat magang industri resmi"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                          type="button"
                          onClick={resetJobForm}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
                        >
                          Batal
                        </button>
                        <button 
                          type="submit"
                          className="bg-[#0077C6] hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" /> {editingJobId ? "Simpan Perubahan Lowongan" : "Posting Lowongan ke Publik"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* LISTING VACANCIES CARDS GRID (2 COLUMNS) MATCHING SCREENSHOT */}
                {!showAddJob && (
                  <>
                    {displayedMyJobs.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl py-14 text-center text-xs text-slate-400 space-y-2 shadow-2xs">
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

                          return (
                            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group relative" id={`job-box-${job.id}`}>
                              <div className="space-y-3.5">
                                
                                {/* Top Badges Row */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`px-3 py-1 rounded-md font-extrabold text-[10px] uppercase tracking-wider border ${
                                    isMagang 
                                      ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60' 
                                      : 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60'
                                  }`}>
                                    {isMagang ? 'PROGRAM MAGANG' : 'LOWONGAN KERJA'}
                                  </span>

                                  {/* Status Badge */}
                                  {isActive ? (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-bold text-xs inline-flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      Aktif
                                    </span>
                                  ) : (
                                    <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold text-xs inline-flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                      Tutup
                                    </span>
                                  )}
                                </div>

                                {/* Logo & Info Header */}
                                <div className="flex items-start gap-3.5 pt-1">
                                  {job.companyLogo ? (
                                    <img 
                                      src={job.companyLogo} 
                                      alt={displayTitle}
                                      className="w-14 h-14 object-contain rounded-2xl border border-slate-200 shrink-0 bg-slate-50 p-1.5 shadow-2xs" 
                                    />
                                  ) : (
                                    <div className={`w-14 h-14 rounded-2xl ${getCompanyBadgeColor(job.namaInstansi || namaInstansi || 'Instansi')} flex flex-col items-center justify-center p-1 shrink-0 shadow-2xs`}>
                                      <span className="font-extrabold text-sm tracking-wider leading-none">{getCompanyInitials(job.namaInstansi || namaInstansi || 'Instansi')}</span>
                                      <span className="text-[7px] font-extrabold tracking-wider uppercase mt-0.5 line-clamp-1">{(job.namaInstansi || namaInstansi || 'Instansi').replace(/^PT\s+/i, '').split(' ')[0]}</span>
                                    </div>
                                  )}

                                  <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="font-extrabold text-slate-900 group-hover:text-[#0055D4] transition-colors text-base sm:text-lg line-clamp-1">{displayTitle}</h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 font-medium">
                                      <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.lokasi || 'Kendari'}</span>
                                      <span className="flex items-center gap-1 shrink-0"><Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kuota: {job.kuota || 3}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Deadline: <strong className="text-slate-700 font-semibold">{formatDateDisplay(job.deadline)}</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* Short Description */}
                                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed pt-2 border-t border-slate-100">{job.deskripsi || ''}</p>
                              </div>

                              {/* Actions Bar */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleEditJob(job)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Edit Detail
                                  </button>
                                  <button 
                                    onClick={() => handleToggleJobStatus(job.id, job.status)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg font-bold text-xs transition"
                                  >
                                    {job.status === 'published' ? 'Tutup' : 'Aktifkan'}
                                  </button>
                                </div>

                                <button 
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-lg transition"
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

                    {/* PAGINATION CONTROLS */}
                    {sortedMyJobs.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5 pt-6">
                        <button
                          onClick={() => setJobCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={jobCurrentPage === 1}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                        >
                          &lt;
                        </button>

                        {Array.from({ length: totalJobPages }, (_, i) => i + 1).map((pageNum) => {
                          const isActive = pageNum === jobCurrentPage;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setJobCurrentPage(pageNum)}
                              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition ${
                                isActive
                                  ? 'bg-[#0055D4] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setJobCurrentPage(prev => Math.min(totalJobPages, prev + 1))}
                          disabled={jobCurrentPage === totalJobPages}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
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

          {/* TAB 4: PELAMAR & SELEKSI */}
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
              // 1. Filter Lowongan
              if (selectedJobFilter !== 'all') {
                const matchId = appl.lowonganId === selectedJobFilter;
                const matchJobObj = myJobs.find(j => j.id === selectedJobFilter);
                const matchTitle = matchJobObj && (appl.tujuanMagang || '').toLowerCase().includes(matchJobObj.judul.toLowerCase());
                if (!matchId && !matchTitle) return false;
              }

              // 2. Filter Status
              if (selectedStatusFilter !== 'all') {
                const normStatus = normalizeStatusKey(appl.status);
                if (normStatus !== selectedStatusFilter) return false;
              }

              // 3. Search Query (Nama atau NIM)
              if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase().trim();
                const matchName = (appl.namaMahasiswa || '').toLowerCase().includes(q);
                const matchNim = (appl.nim || '').toLowerCase().includes(q);
                if (!matchName && !matchNim) return false;
              }

              return true;
            });

            // Pagination Calculations
            const itemsPerPage = 10;
            const totalItems = filteredAppls.length;
            const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
            const safeCurrentPage = Math.min(currentPage, totalPages);
            const startIndex = (safeCurrentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
            const paginatedAppls = filteredAppls.slice(startIndex, startIndex + itemsPerPage);

            const formatDate = (dateStr?: string) => {
              if (!dateStr) return '10 Agustus 2026';
              const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
              const parts = cleanStr.split('-');
              if (parts.length === 3) {
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const year = parts[0];
                const monthIdx = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                if (months[monthIdx]) {
                  return `${day} ${months[monthIdx]} ${year}`;
                }
              }
              return cleanStr;
            };

            const renderStatusBadge = (status: string) => {
              const s = (status || '').toLowerCase();
              if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') {
                return (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Menunggu Review
                  </span>
                );
              }
              if (s === 'seleksi_administrasi' || s === 'revision') {
                return (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Seleksi Administrasi
                  </span>
                );
              }
              if (s === 'interview') {
                return (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-purple-50 text-purple-700 border-purple-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Interview
                  </span>
                );
              }
              if (s === 'accepted' || s === 'diterima' || s === 'completed' || s === 'report_submitted') {
                return (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Diterima
                  </span>
                );
              }
              if (s === 'rejected' || s === 'ditolak') {
                return (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Ditolak
                  </span>
                );
              }
              return (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-200 inline-flex items-center gap-1.5">
                  {status}
                </span>
              );
            };

            return (
              <div className="space-y-6" id="mtr-panel-pelamar">
                {/* HEADER HALAMAN UTAMA & STATISTIK */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">Pelamar & Seleksi</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Kelola dan tinjau mahasiswa yang melamar lowongan di perusahaan Anda.
                    </p>
                  </div>

                  {/* KARTU STATISTIK DINAMIS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Pelamar</div>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">{statTotal}</div>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-amber-700/70 font-bold text-[10px] uppercase tracking-wider">Menunggu Review</div>
                        <div className="text-xl font-extrabold text-amber-900 mt-0.5">{statReview}</div>
                      </div>
                    </div>

                    <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200/80 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-purple-700/70 font-bold text-[10px] uppercase tracking-wider">Interview</div>
                        <div className="text-xl font-extrabold text-purple-900 mt-0.5">{statInterview}</div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-emerald-700/70 font-bold text-[10px] uppercase tracking-wider">Diterima</div>
                        <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{statAccepted}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AREA FILTER DAN SEARCH (MODERN ADMIN STYLE) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                    {/* Filter Lowongan Dropdown */}
                    <div className="md:col-span-4 relative">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Filter Lowongan</label>
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

                    {/* Filter Status Dropdown */}
                    <div className="md:col-span-4 relative">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Filter Status Seleksi</label>
                      <Dropdown
                        value={selectedStatusFilter}
                        onChange={(v) => setSelectedStatusFilter(v)}
                        className="w-full"
                        options={[
                          { value: 'all', label: 'Semua Status' },
                          { value: 'menunggu_review', label: 'Menunggu Review' },
                          { value: 'seleksi_administrasi', label: 'Seleksi Administrasi' },
                          { value: 'interview', label: 'Interview' },
                          { value: 'diterima', label: 'Diterima' },
                          { value: 'ditolak', label: 'Ditolak' }
                        ]}
                      />
                    </div>

                    {/* Search Input (Nama / NIM) */}
                    <div className="md:col-span-4 relative">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pencarian Pelamar</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search nama / NIM..."
                          className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 hover:border-blue-300 transition"
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
                </div>

                {/* DAFTAR PELAMAR HASIL FILTER */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  {filteredAppls.length === 0 ? (
                    <div className="text-center py-16 px-4 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200" id="applicants-empty">
                      {myApplicants.length === 0 ? (
                        <>
                          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                            <Users className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 text-base">Belum ada pelamar</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                              Belum ada mahasiswa/alumni yang melamar lowongan Anda.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                            <Search className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 text-sm">Tidak ada pelamar yang sesuai filter</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                              Tidak ditemukan data yang cocok dengan kriteria pencarian atau status yang Anda pilih.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJobFilter('all');
                              setSelectedStatusFilter('all');
                              setSearchQuery('');
                              setCurrentPage(1);
                            }}
                            className="mt-2 text-xs font-bold text-[#0077C6] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                          >
                            Reset Semua Filter
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* MOBILE CARD VIEW (< lg) */}
                      <div className="block lg:hidden space-y-3.5" id="applicants-card-list">
                        {paginatedAppls.map((appl) => (
                          <div key={appl.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{appl.namaMahasiswa}</h4>
                                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                                  {appl.programStudi || '-'}
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

                            {/* Action Buttons for Mobile */}
                            <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenApplicantDetail(appl)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-500" /> Detail
                              </button>
                              {(() => {
                                const s = (appl.status || '').toLowerCase();
                                if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') {
                                  return (
                                    <button
                                      onClick={() => handleUpdateApplicantStatus(appl.id, 'seleksi_administrasi', `Status pelamar ${appl.namaMahasiswa} kini Seleksi Administrasi.`)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                    >
                                      <ArrowRight className="w-3.5 h-3.5" /> Mulai Review
                                    </button>
                                  );
                                }
                                if (s === 'seleksi_administrasi' || s === 'revision') {
                                  return (
                                    <>
                                      <button
                                        onClick={() => handleOpenInterviewModal(appl)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" /> Interview
                                      </button>
                                      <button
                                        onClick={() => setConfirmModal({ type: 'reject', applicant: appl })}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                                      >
                                        Tolak
                                      </button>
                                    </>
                                  );
                                }
                                if (s === 'interview') {
                                  return (
                                    <>
                                      <button
                                        onClick={() => handleOpenApplicantDetail(appl)}
                                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <Calendar className="w-3.5 h-3.5" /> Jadwal
                                      </button>
                                      <button
                                        onClick={() => setConfirmModal({ type: 'accept', applicant: appl })}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
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
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* DESKTOP TABLE VIEW (>= lg) */}
                      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs" id="applicants-table-container">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider">
                            <th className="py-4 px-4">Pelamar</th>
                            <th className="py-4 px-4">Pendidikan</th>
                            <th className="py-4 px-4">Posisi yang Dilamar</th>
                            <th className="py-4 px-4">Tanggal Melamar</th>
                            <th className="py-4 px-4">Status Seleksi</th>
                            <th className="py-4 px-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700" id="applicants-table-body">
                          {paginatedAppls.map((appl) => {
                            const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(
                              s => s.userId === appl.userId || s.id === appl.mahasiswaId || (appl.nim && s.nim === appl.nim)
                            );
                            const photoUrl = studentRecord?.photoUrl;

                            return (
                              <tr key={appl.id} className="hover:bg-slate-50/80 transition duration-150">
                                <td className="py-4 px-4 font-bold text-slate-900">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 shrink-0">
                                      {photoUrl ? (
                                        <img src={photoUrl} alt={appl.namaMahasiswa} className="w-9 h-9 object-cover rounded-2xl border border-slate-200 shadow-2xs" />
                                      ) : (
                                        <div className="w-9 h-9 bg-[#1B365D] text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-2xs border border-slate-700/50">
                                          {appl.namaMahasiswa ? appl.namaMahasiswa.charAt(0).toUpperCase() : 'M'}
                                        </div>
                                      )}
                                    </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900">{appl.namaMahasiswa}</div>
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
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Lihat Detail
                                </button>
                                {(() => {
                                  const s = (appl.status || '').toLowerCase();

                                  // Status 1: MENUNGGU REVIEW -> [Mulai Review]
                                  if (s === 'submitted' || s === 'under_review' || s === 'menunggu_review' || s === 'draft') {
                                    return (
                                      <button
                                        onClick={() => handleUpdateApplicantStatus(appl.id, 'seleksi_administrasi', `Status pelamar ${appl.namaMahasiswa} kini Seleksi Administrasi.`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <ArrowRight className="w-3.5 h-3.5" /> Mulai Review
                                      </button>
                                    );
                                  }

                                  // Status 2: SELEKSI ADMINISTRASI -> [Lolos ke Interview], [Tolak]
                                  if (s === 'seleksi_administrasi' || s === 'revision') {
                                    return (
                                      <>
                                        <button
                                          onClick={() => handleOpenInterviewModal(appl)}
                                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" /> Lolos ke Interview
                                        </button>
                                        <button
                                          onClick={() => setConfirmModal({ type: 'reject', applicant: appl })}
                                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                                        >
                                          Tolak
                                        </button>
                                      </>
                                    );
                                  }

                                  // Status 3: INTERVIEW -> [Lihat Jadwal], [Terima], [Tolak]
                                  if (s === 'interview') {
                                    return (
                                      <>
                                        <button
                                          onClick={() => handleOpenApplicantDetail(appl)}
                                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer inline-flex items-center gap-1"
                                        >
                                          <Calendar className="w-3.5 h-3.5" /> Lihat Jadwal
                                        </button>
                                        <button
                                          onClick={() => setConfirmModal({ type: 'accept', applicant: appl })}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
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
                                    );
                                  }

                                  // Status 4 & 5: DITERIMA / DITOLAK -> hanya [Lihat Detail]
                                  return null;
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>

                  {/* PAGINATION CONTROLS FOOTER */}
                  {filteredAppls.length > 0 && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                      <div>
                        {totalItems === 0
                          ? 'Menampilkan 0 dari 0 pelamar'
                          : `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalItems} pelamar`}
                      </div>

                      <div className="flex items-center gap-1.5 font-bold">
                        <button
                          type="button"
                          disabled={safeCurrentPage <= 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          &lt;
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              safeCurrentPage === pageNum
                                ? 'bg-[#0077C6] text-white border-[#0077C6] shadow-2xs'
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
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
                    { label: 'Tingkat Etika & Integritas Kerja', state: etikaKerja, setter: setEtikaKerja },
                    { label: 'Kemampuan Kerjasama Tim', state: kemampuanKerjaTim, setter: setKemampuanKerjaTim },
                  ].map((dim, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-700">{dim.label}</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => dim.setter(star)}
                            className={`p-1 rounded transition ${star <= dim.state ? 'text-amber-400' : 'text-slate-200'}`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Masukan & Saran Konstruktif untuk Pengembangan Kurikulum *</label>
                  <textarea 
                    required
                    value={surveiSaran}
                    onChange={(e) => setSurveiSaran(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan saran rekomendasi Anda mengenai skill atau kompetensi yang perlu ditingkatkan oleh perguruan tinggi..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-sm font-normal transition"
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

      {/* MODAL FORM JADWAL INTERVIEW */}
      {schedulingApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#1B365D] text-white p-6 relative flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">
                  Penjadwalan Wawancara Pelamar
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Jadwalkan Interview
                </h3>
                <p className="text-slate-300 text-xs mt-0.5 font-medium">
                  Pelamar: {schedulingApplicant.namaMahasiswa} ({schedulingApplicant.nim || 'Job Seeker'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingApplicant(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInterviewSchedule} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-bold">
                  <label className="text-slate-700 text-xs block">Tanggal Interview *</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6]"
                  />
                </div>

                <div className="space-y-1.5 font-bold">
                  <label className="text-slate-700 text-xs block">Waktu / Jam (WITA) *</label>
                  <input
                    type="text"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    placeholder="Contoh: 10:00 WITA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-bold">
                <label className="text-slate-700 text-xs block">Metode Interview *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterviewMethod('online')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      interviewMethod === 'online'
                        ? 'bg-blue-50 text-[#0077C6] border-[#0077C6] ring-2 ring-[#0077C6]/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Online (Google Meet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewMethod('offline')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      interviewMethod === 'offline'
                        ? 'bg-blue-50 text-[#0077C6] border-[#0077C6] ring-2 ring-[#0077C6]/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Offline (Tatap Muka)
                  </button>
                </div>
              </div>

              {interviewMethod === 'online' ? (
                <div className="space-y-1.5 font-bold">
                  <label className="text-slate-700 text-xs block">Link Video Conference *</label>
                  <input
                    type="url"
                    required
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6]"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 font-bold">
                  <label className="text-slate-700 text-xs block">Lokasi Pertemuan / Alamat *</label>
                  <input
                    type="text"
                    required
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="Kantor Perusahaan Lt. 2 Ruang Rapat HRD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6]"
                  />
                </div>
              )}

              <div className="space-y-1.5 font-bold">
                <label className="text-slate-700 text-xs block">Catatan / Instruksi untuk Pelamar</label>
                <textarea
                  rows={3}
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  placeholder="Contoh: Harap membawa dokumen CV fisik & portofolio terbaru."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 focus:border-[#0077C6]"
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
                  className="bg-[#0077C6] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PELAMAR & BERKAS CV */}
      {selectedApplicantDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-4xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            {(() => {
              const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(
                s => s.userId === selectedApplicantDoc.userId || s.id === selectedApplicantDoc.mahasiswaId || (selectedApplicantDoc.nim && s.nim === selectedApplicantDoc.nim)
              );
              const photoUrl = studentRecord?.photoUrl;
              const jobTitleText = getJobTitle(selectedApplicantDoc.tujuanMagang, namaInstansi);

              return (
                <div className="bg-[#1B365D] text-white p-5 sm:p-6 relative flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl shrink-0 overflow-hidden">
                      {photoUrl ? (
                        <img src={photoUrl} alt={selectedApplicantDoc.namaMahasiswa} className="w-13 h-13 object-cover rounded-2xl border-2 border-white/30 shadow-xs" />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-xs">
                          {selectedApplicantDoc.namaMahasiswa.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider block mb-0.5">
                        DETAIL PELAMAR • {jobTitleText}
                      </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                    {selectedApplicantDoc.namaMahasiswa}
                  </h3>
                  <p className="text-slate-300 text-xs mt-0.5 font-medium">
                    {(() => {
                      const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(s => s.nim === selectedApplicantDoc.nim || s.userId === selectedApplicantDoc.userId || s.id === selectedApplicantDoc.mahasiswaId);
                      const roleLabel = studentRecord?.userStatusType || (selectedApplicantDoc.nim ? 'Mahasiswa' : 'Job Seeker');
                      return `${roleLabel} · ${selectedApplicantDoc.programStudi || 'Sistem dan Teknologi Informasi'}`;
                    })()}
                  </p>
                </div>
              </div>
                <button
                  onClick={() => setSelectedApplicantDoc(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })()}

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm overflow-y-auto flex-1">
              
              {/* 1. PROFIL PELAMAR & LOWONGAN YANG DILAMAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PROFIL PELAMAR */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2.5">
                    <User className="w-4 h-4 text-[#0077C6]" />
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">PROFIL PELAMAR</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Nama Lengkap:</span>
                      <span className="font-bold text-slate-900">{selectedApplicantDoc.namaMahasiswa}</span>
                    </div>
                    {(() => {
                      const studentRecord = getFromDB<Mahasiswa>('mahasiswa').find(s => (selectedApplicantDoc.nim && s.nim === selectedApplicantDoc.nim) || s.userId === selectedApplicantDoc.userId || s.id === selectedApplicantDoc.mahasiswaId);
                      const roleLabel = studentRecord?.userStatusType || (selectedApplicantDoc.nim ? 'Mahasiswa' : 'Job Seeker');
                      if (roleLabel === 'Mahasiswa' && selectedApplicantDoc.nim) {
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">NIM (Data Akademik):</span>
                            <span className="font-semibold text-slate-800">{selectedApplicantDoc.nim}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Pendidikan:</span>
                      <span className="font-semibold text-slate-800">{selectedApplicantDoc.programStudi || 'Teknik Informatika'}</span>
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
                      <span className="text-slate-500 font-medium">Nomor HP / Whatsapp:</span>
                      <span className="font-semibold text-slate-800">{selectedApplicantDoc.telepon || selectedApplicantDoc.noHp || '0821-9988-7711'}</span>
                    </div>
                  </div>
                </div>

                {/* LOWONGAN YANG DILAMAR */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2.5">
                    <Briefcase className="w-4 h-4 text-[#0077C6]" />
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">LOWONGAN YANG DILAMAR</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Nama Posisi:</span>
                      <span className="font-bold text-slate-900">{getJobTitle(selectedApplicantDoc.tujuanMagang, namaInstansi)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Jenis Program:</span>
                      <span className="font-semibold text-slate-800">Magang & Kerja Praktik Industri</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Periode Pelaksanaan:</span>
                      <span className="font-medium text-slate-700">{selectedApplicantDoc.tanggalMulai || '10 Agt 2026'} s/d {selectedApplicantDoc.tanggalSelesai || '10 Feb 2027'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Tanggal Melamar:</span>
                      <span className="font-medium text-slate-700">{selectedApplicantDoc.createdAt ? selectedApplicantDoc.createdAt.split('T')[0] : '10 Agustus 2026'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. TENTANG PELAMAR */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0077C6]" /> TENTANG PELAMAR
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-slate-700 text-xs leading-relaxed">
                  {selectedApplicantDoc.catatan || 'Mahasiswa aktif semester 6 yang berintegritas tinggi, berorientasi pada detail, serta memiliki motivasi kuat untuk berkontribusi secara nyata dalam lingkungan kerja industri professional.'}
                </div>
              </div>

              {/* CATATAN INTERNAL PELAMAR */}
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">
                      CATATAN INTERNAL PELAMAR
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300/80 px-2.5 py-0.5 rounded-md">
                    🔒 Rahasia (Tidak Terlihat oleh Pelamar)
                  </span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Tuliskan catatan evaluasi internal tentang pelamar (misal: Memiliki kemampuan React yang baik. Perlu ditanyakan pengalaman deployment saat interview)..."
                    className="w-full p-3.5 rounded-xl border border-amber-300/80 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed font-medium"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveInternalNote(selectedApplicantDoc.id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Simpan Catatan Internal Pelamar
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. PENDIDIKAN, SKILL, PENGALAMAN & SERTIFIKAT (Dinamis dari Profil Pelamar / Snapshot Lamaran) */}
              {(() => {
                const students = getFromDB<Mahasiswa>('mahasiswa');
                const applicantProfile = students.find(
                  s => s.userId === selectedApplicantDoc.userId || s.id === selectedApplicantDoc.mahasiswaId || s.nama.toLowerCase() === selectedApplicantDoc.namaMahasiswa.toLowerCase()
                );

                // Education / Qualifications
                const qualifications = selectedApplicantDoc.qualifications || applicantProfile?.qualifications || [
                  {
                    id: '1',
                    institution: 'Universitas Muhammadiyah Kendari (UMK)',
                    level: `Sarjana (S1) - ${selectedApplicantDoc.programStudi || 'Teknik Informatika'}`,
                    year: '2026'
                  }
                ];
                const ipkDisplay = selectedApplicantDoc.ipk || applicantProfile?.ipk || '3.85 / 4.00';

                // Skills
                const skillsList = selectedApplicantDoc.skills || applicantProfile?.skills || [
                  'JavaScript', 'React.js', 'UI/UX Design', 'Node.js', 'Python', 'Git & GitHub', 'HTML/CSS', 'Tailwind CSS'
                ];

                // Experiences
                const experiencesList = selectedApplicantDoc.experiences || applicantProfile?.experiences || [
                  {
                    id: '1',
                    position: 'Fullstack Web Developer Intern',
                    company: 'PT Go Digital Kendari',
                    period: '2026 - Sekarang',
                    description: 'Mengembangkan dan memelihara aplikasi portal akademik kampus dan integrasi RESTful API backend.'
                  },
                  {
                    id: '2',
                    position: 'Anggota Divisi IT & Komunikasi',
                    company: 'Himpunan Mahasiswa Teknik Informatika UMK',
                    period: '2024 - 2025',
                    description: 'Mengelola situs web kegiatan mahasiswa dan publikasi digital kampus.'
                  }
                ];

                // Certificates
                const certificatesList = selectedApplicantDoc.certificates || applicantProfile?.certificates || [
                  {
                    id: 'cert_1',
                    name: 'Sertifikat Kompetensi Fullstack Web Developer - BNSP',
                    issuer: 'BNSP',
                    year: '2025'
                  },
                  {
                    id: 'cert_2',
                    name: 'Google IT Support Professional Certificate',
                    issuer: 'Google / Coursera',
                    year: '2024'
                  }
                ];

                return (
                  <div className="space-y-5">
                    {/* Grid Pendidikan & Skill */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* PENDIDIKAN */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-emerald-600" /> PENDIDIKAN
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          {qualifications.map((q, idx) => (
                            <div key={q.id || idx} className="border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                              <div className="font-bold text-slate-900">{q.institution}</div>
                              <div className="text-slate-600 font-medium">{q.level} ({q.year})</div>
                              {q.ipk && (
                                <div className="text-emerald-700 font-mono font-bold text-[11px] mt-0.5">
                                  IPK: {q.ipk}
                                </div>
                              )}
                            </div>
                          ))}
                          {!qualifications.some(q => q.ipk) && (
                            <div className="text-slate-500 text-[11px] font-mono pt-1">
                              IPK: <span className="font-bold text-emerald-600">{ipkDisplay}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SKILL */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Code className="w-4 h-4 text-indigo-600" /> SKILL & KEAHLIAN
                        </h4>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {skillsList.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px] border border-slate-200">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Grid Pengalaman & Sertifikat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* PENGALAMAN */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-amber-600" /> PENGALAMAN
                        </h4>
                        {experiencesList.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Belum ada pengalaman yang tercantum.</p>
                        ) : (
                          <ul className="space-y-2 text-xs text-slate-700 font-medium">
                            {experiencesList.map((exp, idx) => (
                              <li key={exp.id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                <div className="font-extrabold text-slate-900">{exp.position}</div>
                                <div className="text-emerald-700 font-semibold text-[11px]">{exp.company} ({exp.period})</div>
                                {exp.description && exp.description !== '-' && (
                                  <div className="text-slate-500 text-[11px] mt-1 leading-snug">{exp.description}</div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* SERTIFIKAT */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4 text-rose-600" /> SERTIFIKAT
                        </h4>
                        {certificatesList.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Belum ada sertifikat yang tercantum.</p>
                        ) : (
                          <ul className="space-y-2 text-xs text-slate-700 font-medium">
                            {certificatesList.map((cert, idx) => (
                              <li key={cert.id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                <div className="font-extrabold text-slate-900">{cert.name}</div>
                                <div className="text-rose-700 font-semibold text-[11px]">
                                  {cert.issuer ? `${cert.issuer} • ` : ''}{cert.year}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5. DOKUMEN CURRICULUM VITAE (CV) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0077C6]" /> DOKUMEN CURRICULUM VITAE (CV)
                </h4>

                {/* Unified PDF Preview */}
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
                Tutup Modal
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
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
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Loloskan ke Interview
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
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
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

      {/* MODAL DIALOG KONFIRMASI (TERIMA / TOLAK) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 text-center my-8">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              confirmModal.type === 'accept' 
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
              <h3 className="font-extrabold text-slate-900 text-lg">
                {confirmModal.type === 'accept' ? 'Konfirmasi Penerimaan Pelamar' : 'Konfirmasi Penolakan Pelamar'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {confirmModal.type === 'accept' 
                  ? `Apakah Anda yakin ingin menerima ${confirmModal.applicant.namaMahasiswa} sebagai peserta?` 
                  : `Apakah Anda yakin ingin menolak pelamar ini?`}
              </p>
              {(() => {
                const student = getFromDB<Mahasiswa>('mahasiswa').find(
                  s => s.userId === confirmModal.applicant.userId || 
                       s.id === confirmModal.applicant.mahasiswaId || 
                       (confirmModal.applicant.nim && s.nim === confirmModal.applicant.nim)
                );
                const isMahasiswa = student?.userStatusType === 'Mahasiswa';
                const subtitleLabel = isMahasiswa && confirmModal.applicant.nim 
                  ? ` • NIM: ${confirmModal.applicant.nim}`
                  : ` • ${confirmModal.applicant.programStudi || 'Job Seeker'}`;
                return (
                  <div className="text-[11px] font-medium text-slate-500 pt-1">
                    {confirmModal.applicant.namaMahasiswa}{subtitleLabel}
                  </div>
                );
              })()}
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
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
                >
                  Ya, Tolak
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL DI TENGAH DENGAN TOMBOL OK */}
      {alertPopup && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setAlertPopup(null)}
        >
          <div 
            className="bg-white max-w-sm w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 text-center my-8 animate-scaleUp"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xs ${
              alertPopup.type === 'success'
                ? 'bg-blue-50 text-[#0077C6]'
                : alertPopup.type === 'error'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {alertPopup.type === 'success' ? (
                <CheckCircle className="w-8 h-8 text-[#0077C6]" />
              ) : alertPopup.type === 'error' ? (
                <XCircle className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
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
                className={`w-full py-3 px-5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95 ${
                  alertPopup.type === 'error'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#0077C6] hover:bg-blue-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
