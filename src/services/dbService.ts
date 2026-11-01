/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Service pengelola transaksi data langsung ke Supabase PostgreSQL via Express API Backend
 *
 * Aturan main:
 * - API_BASE_URL berasal dari src/config/api.ts (default "/api", relative).
 * - Semua request privat (/all-data, /sync/*, DELETE) WAJIB kirim Authorization: Bearer ***
 * - Boot publik pakai /public-data (tanpa token). Boot privat pakai /all-data (dengan token).
 * - Role/status dari backend (UPPERCASE Prisma enum) dinormalisasi ke lowercase konvensi frontend.
 */

import {
  User,
  Mahasiswa,
  Alumni,
  Mitra,
  Lowongan,
  PengajuanMagang,
  TracerStudy,
  KontenKarir
} from '../types';
import { API_BASE_URL } from '../config/api';
import { supabase } from '../config/supabase';

/* ── Auth session helpers ─────────────────────────────────────────── */

export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem('cdc_auth_token');
    const expiry = Number(localStorage.getItem('cdc_token_expiry') || '0');
    if (!token) return null;
    if (expiry && Date.now() > expiry) {
      clearAuthSession();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem('cdc_auth_token');
    localStorage.removeItem('cdc_token_expiry');
    localStorage.removeItem('cdc_session_id');
  } catch {
    /* abaikan */
  }
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

/* ── Normalisasi case backend → frontend ────────────────────────────
   Backend (Prisma enum): ADMIN / PENDING / PUBLISHED / KERJA / AKTIF.
   Frontend (types.ts + filter UI): admin / active / published / kerja / aktif.
   Tanpa ini dashboard blank (role !== 'admin') & filter published kosong. */

function normalizeRecord(entity: string, row: any): any {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  // SECURITY: password/hash tidak pernah boleh masuk MEMORY_DB → tidak bisa bocor ke localStorage/Inspect.
  if ('password' in out) delete (out as any).password;
  if (typeof out.role === 'string') out.role = out.role.toLowerCase();
  if (typeof out.userStatusType === 'string') {
    const v = out.userStatusType.toLowerCase();
    out.userStatusType = v === 'alumni' ? 'Alumni' : 'Mahasiswa';
  }
  if (typeof out.status === 'string') {
    // user: ACTIVE→active; lowongan: PUBLISHED→published; pengajuan: SUBMITTED→submitted
    out.status = out.status.toLowerCase();
  }
  if (typeof out.statusKerjaSama === 'string') {
    const s = out.statusKerjaSama.toLowerCase();
    if (s === 'active' || s === 'approved' || s === 'aktif') out.statusKerjaSama = 'aktif';
    else if (s === 'inactive' || s === 'rejected' || s === 'nonaktif' || s === 'disabled') out.statusKerjaSama = 'nonaktif';
    else out.statusKerjaSama = 'pending';
  }
  if (entity === 'konten_karir' || entity === 'konten_karirs') {
    if (typeof out.jenis === 'string') out.jenis = out.jenis.toLowerCase();
    // Ekstrak metadata event jika tersimpan dalam body
    if (typeof out.body === 'string' && out.body.includes('<!--CDC_EVENT_META:')) {
      try {
        const match = out.body.match(/<!--CDC_EVENT_META:(.*?)-->/);
        if (match && match[1]) {
          const meta = JSON.parse(match[1]);
          if (meta.tanggal && !out.tanggal) out.tanggal = meta.tanggal;
          if (meta.waktu && !out.waktu) out.waktu = meta.waktu;
          if (meta.lokasiEvent && !out.lokasiEvent) out.lokasiEvent = meta.lokasiEvent;
          if (meta.pembicara && !out.pembicara) out.pembicara = meta.pembicara;
          if (meta.kuotaEvent != null && out.kuotaEvent == null) out.kuotaEvent = Math.max(0, Math.abs(Number(meta.kuotaEvent) || 0));
          if (meta.linkDaftar && !out.linkDaftar) out.linkDaftar = meta.linkDaftar;
          if (meta.statusEvent && !out.statusEvent) out.statusEvent = meta.statusEvent;
          if (meta.ctaEnabled !== undefined && out.ctaEnabled === undefined) out.ctaEnabled = meta.ctaEnabled;
          if (meta.ctaLabel && !out.ctaLabel) out.ctaLabel = meta.ctaLabel;
          if (meta.gambarPoster && !out.gambarPoster) out.gambarPoster = meta.gambarPoster;
        }
      } catch { /* abaikan */ }
    }
    // Fallback: Jika tanggal belum terisi tetapi deadline ada (disimpan dari tanggal di DB)
    if (!out.tanggal && out.deadline) {
      out.tanggal = typeof out.deadline === 'string' ? out.deadline.slice(0, 10) : new Date(out.deadline).toISOString().slice(0, 10);
    }
    // Fallback: Jika linkDaftar belum terisi tetapi linkLamar ada
    if (!out.linkDaftar && out.linkLamar) {
      out.linkDaftar = out.linkLamar;
    }
    // Fallback: Jika kuotaEvent belum terisi tetapi kuota ada, dan cegah nilai minus
    if (out.kuotaEvent == null && out.kuota != null) {
      out.kuotaEvent = Math.max(0, Math.abs(Number(out.kuota) || 0));
    }
    if (typeof out.kuotaEvent === 'number' && out.kuotaEvent < 0) {
      out.kuotaEvent = Math.abs(out.kuotaEvent);
    }
    if (typeof out.kuota === 'number' && out.kuota < 0) {
      out.kuota = Math.abs(out.kuota);
    }
  }
  // BUG-004 fix: backend GaleriItem {imageUrl, kategori} → frontend
  // GaleriItem {tipeMedia, posterUrl/youtubeUrl/pdfUrl, kategoriSection}.
  // Tebak tipeMedia dari konten imageUrl (youtube / pdf-base64 / gambar).
  if (entity === 'galeri_items' && !out.tipeMedia && typeof out.imageUrl === 'string') {
    const u = out.imageUrl;
    out.tipeMedia = u.includes('youtube.com') || u.includes('youtu.be')
      ? 'youtube'
      : u.startsWith('data:application/pdf')
        ? 'pdf'
        : 'poster';
    if (out.tipeMedia === 'youtube') out.youtubeUrl = u;
    else if (out.tipeMedia === 'pdf') out.pdfUrl = u;
    else out.posterUrl = u;
    if (!out.kategoriSection && typeof out.kategori === 'string') out.kategoriSection = out.kategori;
  }
  // Normalisasi anggota_tims: DB memakai `photoUrl`, data localStorage lama memakai `fotoUrl`.
  // Pastikan keduanya terisi agar komponen yang masih mereferensi salah satu nama tetap bekerja.
  if (entity === 'anggota_tims' || entity === 'anggota_tim') {
    if (!out.photoUrl && out.fotoUrl) out.photoUrl = out.fotoUrl;
    if (!out.fotoUrl && out.photoUrl) out.fotoUrl = out.photoUrl;
  }
  // Normalisasi HeroSlide: DB pakai judul/linkUrl/subjudul/urutan, frontend pakai title/targetUrl/alt/order
  if (entity === 'hero_slides' || entity === 'hero_slide') {
    if (!out.title && out.judul)        out.title     = out.judul;
    if (!out.judul && out.title)        out.judul     = out.title;
    if (!out.targetUrl && out.linkUrl)  out.targetUrl = out.linkUrl;
    if (!out.linkUrl && out.targetUrl)  out.linkUrl   = out.targetUrl;
    if (!out.alt && out.subjudul)       out.alt       = out.subjudul;
    if (out.order == null && out.urutan != null) out.order = out.urutan;
    if (out.urutan == null && out.order != null) out.urutan = out.order;
  }
  // Normalisasi SuratKeputusan: DB hanya punya fileUrl, frontend butuh pdfUrl/linkUrl/tipe
  if (entity === 'surat_keputusan' || entity === 'surat_keputusans') {
    if (out.fileUrl && !out.pdfUrl) {
      const fu = String(out.fileUrl);
      out.tipe = fu.startsWith('http') && !fu.includes('.pdf') ? 'link' : 'pdf';
      if (out.tipe === 'pdf') out.pdfUrl = fu;
      else out.linkUrl = fu;
    }
  }
  // Normalisasi LaporanKinerja: DB pakai fileUrl, frontend butuh pdfUrl/linkUrl/tipe/kategori
  if (entity === 'laporan_kinerja' || entity === 'laporan_kinerjas') {
    if (out.fileUrl && !out.pdfUrl) {
      const fu = String(out.fileUrl);
      out.tipe = fu.startsWith('http') && !fu.includes('.pdf') ? 'link' : 'pdf';
      if (out.tipe === 'pdf') out.pdfUrl = fu;
      else out.linkUrl = fu;
    }
    if (!out.kategori && out.periode) out.kategori = out.periode;
  }
  // Normalisasi KalenderKegiatan: DB simpan tanggalMulai, frontend butuh posterUrl/pdfUrl/displayType
  // Jika frontend menyimpan url gambar/pdf di `warna` (workaround lama), ekstrak kembali
  if (entity === 'kalender_kegiatan' || entity === 'kalender_kegiatans') {
    if (!out.displayType) out.displayType = 'poster';
    // Jika deskripsi menyimpan JSON payload (posterUrl/pdfUrl), parse kembali
    if (typeof out.deskripsi === 'string' && out.deskripsi.startsWith('{')) {
      try {
        const parsed = JSON.parse(out.deskripsi);
        if (parsed.posterUrl) { out.posterUrl = parsed.posterUrl; out.displayType = 'poster'; }
        if (parsed.pdfUrl) { out.pdfUrl = parsed.pdfUrl; out.displayType = 'pdf'; }
        if (parsed.linkUrl) out.linkUrl = parsed.linkUrl;
        if (parsed.displayType) out.displayType = parsed.displayType;
        if (parsed.deskripsi) out.deskripsi = parsed.deskripsi;
      } catch { /* abaikan */ }
    }
  }
  // Normalisasi MouStakeholder: DB pakai namaInstansi/jenisMou, frontend pakai judul/kategori
  if (entity === 'mou_stakeholder' || entity === 'mou_stakeholders') {
    if (!out.judul && out.namaInstansi)   out.judul    = out.namaInstansi;
    if (!out.namaInstansi && out.judul)   out.namaInstansi = out.judul;
    if (!out.kategori && out.jenisMou)    out.kategori = out.jenisMou;
    if (!out.jenisMou && out.kategori)    out.jenisMou = out.kategori;
    if (!out.displayType) out.displayType = 'poster';
    if (out.logoUrl && !out.posterUrl)    out.posterUrl = out.logoUrl;
  }
  // Normalisasi Komentar Berita: DB pakai konten/beritaId, frontend pakai komentar/beritaSlug/beritaJudul
  if (entity === 'komentar_berita' || entity === 'komentar_beritas') {
    if (!out.komentar && out.konten) out.komentar = out.konten;
    if (!out.konten && out.komentar) out.konten = out.komentar;
    if (!out.beritaSlug) out.beritaSlug = out.berita?.slug || out.beritaId || '';
    if (!out.beritaJudul && out.berita?.judul) out.beritaJudul = out.berita.judul;
    if (typeof out.status === 'string') out.status = out.status.toLowerCase();
  }
  // Normalisasi Campus Hiring: DB pakai logoUrl/namaInstansi, frontend pakai bannerUrl/namaPerusahaan
  if (entity === 'campus_hiring' || entity === 'campus_hirings') {
    if (!out.bannerUrl && out.logoUrl) out.bannerUrl = out.logoUrl;
    if (!out.logoUrl && out.bannerUrl) out.logoUrl = out.bannerUrl;
    if (!out.judul && out.namaInstansi) out.judul = out.namaInstansi;
    if (!out.namaPerusahaan && out.namaInstansi) out.namaPerusahaan = out.namaInstansi;
    if (typeof out.deskripsi === 'string' && out.deskripsi.startsWith('{')) {
      try {
        const parsed = JSON.parse(out.deskripsi);
        Object.assign(out, parsed);
      } catch { /* abaikan */ }
    }
  }
  // Normalisasi Job Fair Event
  if (entity === 'job_fair_event' || entity === 'job_fair_events' || entity === 'job_fair') {
    if (!out.bannerUrl && out.logoUrl) out.bannerUrl = out.logoUrl;
    if (typeof out.deskripsi === 'string' && out.deskripsi.startsWith('{')) {
      try {
        const parsed = JSON.parse(out.deskripsi);
        Object.assign(out, parsed);
      } catch { /* abaikan */ }
    }
  }
  // Workaround Config: DB disimpan sebagai JSON string di field text
  if (entity === 'konseling_configs' || entity === 'konseling_config') {
    if (typeof out.deskripsi === 'string' && out.deskripsi.startsWith('{')) {
      try {
        const parsed = JSON.parse(out.deskripsi);
        Object.assign(out, parsed);
      } catch { /* abaikan */ }
    }
  }
  if (entity === 'visi_misi_configs' || entity === 'visi_misi_config') {
    if (typeof out.visi === 'string' && out.visi.startsWith('{')) {
      try {
        const parsed = JSON.parse(out.visi);
        Object.assign(out, parsed);
      } catch { /* abaikan */ }
    }
  }
  if (entity === 'pengajuan_magang' || entity === 'pengajuan_magangs') {
    if (typeof out.catatanAdmin === 'string' && out.catatanAdmin.startsWith('{')) {
      try {
        const parsed = JSON.parse(out.catatanAdmin);
        Object.assign(out, parsed);
      } catch { /* abaikan */ }
    }
  }
  // Normalisasi Berita: DB pakai judul/body, frontend pakai title/content
  if (entity === 'beritas' || entity === 'berita') {
    if (!out.title && out.judul)   out.title   = out.judul;
    if (!out.judul && out.title)   out.judul   = out.title;
    if (!out.content && out.body)  out.content = out.body;
    if (!out.body && out.content)  out.body    = out.content;
    
    // FIX #2: Threshold turun dari 500 ke 100.
    // base64 header saja "data:image/png;base64," = ~22 char, gambar valid sekecil apapun > 100 char.
    // Threshold 500 sebelumnya membuang thumbnail kecil yang valid (misal ikon/avatar kecil).
    const checkCorrupted = (v: any) => typeof v === 'string' && v.startsWith('data:image/') && v.length < 100;
    if (checkCorrupted(out.thumbnail)) out.thumbnail = null;
    if (checkCorrupted(out.coverImageUrl)) out.coverImageUrl = null;

    // Sinkronkan kedua alias field agar konsisten
    if (!out.coverImageUrl && out.thumbnail) out.coverImageUrl = out.thumbnail;
    if (!out.thumbnail && out.coverImageUrl) out.thumbnail = out.coverImageUrl;
    // FIX #3: Hapus auto-fallback paksa ke /bg-gedung-umk.jpg.
    // Sebelumnya setiap berita tanpa thumbnail dipaksa pakai foto gedung sehingga
    // thumbnail yang diupload user bisa "hilang" tertimpa fallback ini saat refresh.
    // Biarkan null — komponen penampil (PublicLayout, BeritaDetailView) yang handle fallback visual.

    if (!out.slug && out.id) out.slug = out.id;
    if (!out.scope) out.scope = 'LOKAL';
    if (!out.kategori) out.kategori = 'Umum';
  }
  return out;
}

function normalizeDataset(data: Record<string, any[]>): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  for (const [key, arr] of Object.entries(data || {})) {
    if (!Array.isArray(arr)) continue;
    // Mapping nama entitas backend ke DBKey frontend
    const mappedKey = key === 'social_media_items'
      ? 'social_media'
      : key === 'campus_hirings'
        ? 'campus_hiring'
        : key === 'job_fair_events'
          ? 'job_fair'
          : key === 'konseling_configs'
            ? 'konseling_config'
            : key === 'komentar_beritas'
              ? 'komentar_berita'
              : key;
    out[mappedKey] = arr.map((row) => normalizeRecord(key, row));
  }
  return out;
}

/* ── Auth API ─────────────────────────────────────────────────────── */

export interface BackendLoginResult {
  user: any;
  token: string;
  expiresIn: number;
}

import { registerUser, getFromDB } from '../data';

export async function loginToBackend(email: string, password: string): Promise<BackendLoginResult> {
  let response: Response | null = null;
  let isStaticFallback = false;

  try {
    response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      credentials: 'include', // kirim/terima httpOnly auth cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password })
    });
  } catch {
    isStaticFallback = true;
  }

  if (response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      isStaticFallback = true;
    }
  }

  if (!isStaticFallback && response) {
    const result = await response.json().catch(() => null);
    if (result && response.ok && result.success) {
      try {
        localStorage.setItem('cdc_auth_token', result.token);
        localStorage.setItem('cdc_token_expiry', (Date.now() + result.expiresIn * 1000).toString());
        localStorage.setItem('cdc_session_id', result.user.id);
      } catch {
        /* abaikan */
      }
      return {
        user: normalizeRecord('users', result.user),
        token: result.token,
        expiresIn: result.expiresIn
      };
    }
    if (result && (result.message || result.error)) {
      throw new Error(result.message || result.error);
    }
  }

  if (isStaticFallback && API_BASE_URL.startsWith('http')) {
    console.warn(`⚠️ [Backend Auth Warning] Tidak dapat menembak endpoint produksi (${API_BASE_URL}/login). Memeriksa fallback lokal.`);
  }

  // Static Hosting Fallback (Firebase Hosting / Demo Mode tanpa live Node server)
  const users = getFromDB<any>('users') || [];
  const matchedUser = users.find(
    (u: any) => u && u.email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (!matchedUser) {
    if (API_BASE_URL.startsWith('http') && !response) {
      throw new Error(`Gagal terhubung ke backend server (${API_BASE_URL}). Pastikan server backend sedang aktif dan domain frontend (${typeof window !== 'undefined' ? window.location.origin : ''}) diizinkan CORS.`);
    }
    throw new Error('Akun dengan email ini belum terdaftar. Silakan mendaftar terlebih dahulu.');
  }

  if (matchedUser.password && matchedUser.password !== password) {
    throw new Error('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
  }

  try {
    localStorage.setItem('cdc_auth_token', 'demo_token_' + matchedUser.id);
    localStorage.setItem('cdc_token_expiry', (Date.now() + 86400 * 1000).toString());
    localStorage.setItem('cdc_session_id', matchedUser.id);
  } catch {
    /* abaikan */
  }

  return {
    user: normalizeRecord('users', matchedUser),
    token: 'demo_token_' + matchedUser.id,
    expiresIn: 86400
  };
}

export interface BackendRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'MAHASISWA' | 'ALUMNI' | 'MITRA' | 'ADMIN';
  nim?: string;
  namaInstansi?: string;
  kontakPerson?: string;
  programStudi?: string;
  fakultas?: string;
  tahunLulus?: string;
  bidangIndustri?: string;
  alamat?: string;
  website?: string;
}

export async function registerToBackend(payload: BackendRegisterPayload): Promise<any> {
  let response: Response | null = null;
  let isStaticFallback = false;

  try {
    response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    isStaticFallback = true;
  }

  if (response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      isStaticFallback = true;
    }
  }

  if (!isStaticFallback && response) {
    const result = await response.json().catch(() => null);
    if (result && response.ok && result.success) {
      return normalizeRecord('users', result.user);
    }
    if (result && (result.message || result.error)) {
      if (response.status === 504 || response.status === 502) {
        throw new Error('Server backend tidak merespons (Gateway Timeout). Coba lagi dalam beberapa detik.');
      }
      throw new Error(result.message || result.error);
    }
    // FIX: Jika response tidak OK dan tidak ada body JSON (misal: CORS, network error)
    if (!response.ok) {
      if (response.status === 0) {
        throw new Error('Permintaan diblokir oleh kebijakan CORS. Hubungi administrator sistem.');
      }
      if (response.status === 504 || response.status === 502) {
        throw new Error('Server backend tidak merespons (Gateway Timeout). Coba lagi dalam beberapa detik.');
      }
      throw new Error(`Gagal mendaftar (HTTP ${response.status}). Silakan coba lagi.`);
    }
  }

  // Mode Fallback Static Hosting (Firebase Hosting Preview)
  const isMitra = payload.role === 'MITRA';
  const isAlumni = payload.role === 'ALUMNI';
  const userRole = isMitra ? 'mitra' : 'alumni';

  const registeredUser = registerUser(userRole, {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone || '',
    nim: payload.nim || '2026' + Math.floor(1000 + Math.random() * 9000),
    programStudi: payload.programStudi || 'Informatika',
    fakultas: payload.fakultas || 'Teknik',
    tahunLulus: payload.tahunLulus || '2026',
    userStatusType: isAlumni ? 'Alumni' : 'Mahasiswa',
    namaInstansi: payload.namaInstansi || payload.name,
    kontakPerson: payload.kontakPerson || payload.name,
    bidangIndustri: payload.bidangIndustri || 'Teknologi Informasi',
    alamat: payload.alamat || '',
    website: payload.website || ''
  } as any);

  try {
    localStorage.setItem('cdc_session_id', registeredUser.id);
  } catch {
    /* abaikan */
  }

  return normalizeRecord('users', registeredUser);
}

/* ── Boot data ──────────────────────────────────────────────────────
   fetchPublicDatabase: untuk halaman depan (tanpa login).
   fetchInitialDatabaseFromSupabase: untuk sesi login (dengan token, full dataset). */

export async function fetchPublicDatabase(): Promise<Record<string, any[]> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public-data`);
    if (!response.ok) {
      console.warn('[Supabase API] Failed to fetch public-data:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('✅ [Supabase API] Berhasil memuat data publik live dari Supabase PostgreSQL!');
    return normalizeDataset(data);
  } catch (err) {
    console.warn('[Supabase API Exception] fetchPublicDatabase:', err);
    return null;
  }
}

export async function fetchInitialDatabaseFromSupabase(): Promise<Record<string, any[]> | null> {
  try {
    const headers = authHeaders();
    if (!headers.Authorization) {
      console.warn('[Supabase API] fetch all-data dilewati: belum login (tanpa token).');
      return null;
    }
    const response = await fetch(`${API_BASE_URL}/all-data`, { headers, credentials: 'include' });
    if (response.status === 401 || response.status === 403) {
      console.warn('[Supabase API] Token tidak valid/kedaluwarsa. Sesi dibersihkan, silakan login ulang.');
      clearAuthSession();
      return null;
    }
    if (!response.ok) {
      console.warn('[Supabase API] Failed to fetch all-data:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('✅ [Supabase API] Berhasil memuat seluruh database live dari Supabase PostgreSQL!');
    return normalizeDataset(data);
  } catch (err) {
    console.warn('[Supabase API Exception] fetchInitialDatabaseFromSupabase:', err);
    return null;
  }
}

async function sendSyncRequest(entity: string, payload: any): Promise<any> {
  const headers = authHeaders();
  if (!headers.Authorization) {
    throw new Error('Belum login. Silakan login ulang agar data tersimpan ke Supabase.');
  }
  const response = await fetch(`${API_BASE_URL}/sync/${entity}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data as any).success === false) {
    throw new Error((data as any).error || (data as any).message || `Gagal menyimpan ${entity} ke Supabase (status ${response.status}).`);
  }
  console.log(`✅ [Supabase API Sync] ${entity} tersimpan ke Supabase PostgreSQL:`, data);
  return (data as any).result ?? data;
}

export async function deleteFromSupabase(table: string, id: string): Promise<boolean> {
  let directDeleted = false;

  // Direct Supabase delete fallback untuk tabel anggota_tims
  if (table === 'anggota_tims' && supabase) {
    try {
      const { error } = await supabase.from('anggota_tims').delete().eq('id', id);
      if (!error) {
        directDeleted = true;
        console.log(`✅ [Direct Supabase Delete] Item ${id} dihapus langsung dari tabel anggota_tims`);
      }
    } catch (e) {
      console.warn('[Direct Supabase Delete] exception:', e);
    }
  }

  // Direct Supabase delete fallback untuk tabel komentar_berita / komentar_beritas
  if ((table === 'komentar_berita' || table === 'komentar_beritas') && supabase) {
    try {
      const { error } = await supabase.from('komentar_beritas').delete().eq('id', id);
      if (!error) {
        directDeleted = true;
        console.log(`✅ [Direct Supabase Delete] Komentar ${id} dihapus langsung dari tabel komentar_beritas`);
      }
    } catch (e) {
      console.warn('[Direct Supabase Delete] exception komentar:', e);
    }
  }

  const headers = authHeaders();
  if (!headers.Authorization) {
    if (directDeleted) return true;
    throw new Error('Belum login. Hapus dibatalkan agar data tidak hanya hilang lokal.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers
    });
    if (!response.ok) {
      if (directDeleted) return true;
      const data = await response.json().catch(() => ({}));
      throw new Error((data as any).error || `Gagal menghapus ${table}/${id} di Supabase (status ${response.status}).`);
    }
    console.log(`✅ [Supabase API Delete] Item ${id} dihapus dari tabel ${table}`);
    return true;
  } catch (err) {
    if (directDeleted) return true;
    throw err;
  }
}

export async function syncUserToSupabase(user: User): Promise<any> {
  return sendSyncRequest('users', user);
}

export async function syncMahasiswaToSupabase(mhs: Mahasiswa): Promise<any> {
  return sendSyncRequest('mahasiswa', mhs);
}

export async function syncAlumniToSupabase(alm: Alumni): Promise<any> {
  return sendSyncRequest('alumni', alm);
}

export async function syncMitraToSupabase(mitra: Mitra): Promise<any> {
  return sendSyncRequest('mitra', mitra);
}

export async function syncLowonganToSupabase(low: Lowongan): Promise<any> {
  return sendSyncRequest('lowongan', low);
}

export async function syncPengajuanToSupabase(p: PengajuanMagang): Promise<any> {
  return sendSyncRequest('pengajuan_magang', p);
}

export async function syncTracerStudyToSupabase(t: TracerStudy): Promise<any> {
  return sendSyncRequest('tracer_study', t);
}

export async function syncKontenKarirToSupabase(k: KontenKarir): Promise<any> {
  const payload: any = { ...k };
  if (payload.jenis === 'event' || payload.jenis === 'workshop' || payload.jenis === 'softskill' || payload.jenis === 'seminar') {
    const meta: Record<string, any> = {};
    if (payload.tanggal) meta.tanggal = payload.tanggal;
    if (payload.waktu) meta.waktu = payload.waktu;
    if (payload.lokasiEvent) meta.lokasiEvent = payload.lokasiEvent;
    if (payload.pembicara) meta.pembicara = payload.pembicara;
    if (payload.kuotaEvent != null) {
      meta.kuotaEvent = Math.max(0, Math.abs(Number(payload.kuotaEvent) || 0));
    }
    if (payload.linkDaftar) meta.linkDaftar = payload.linkDaftar;
    if (payload.statusEvent) meta.statusEvent = payload.statusEvent;
    if (payload.ctaEnabled !== undefined) meta.ctaEnabled = payload.ctaEnabled;
    if (payload.ctaLabel) meta.ctaLabel = payload.ctaLabel;
    if (payload.gambarPoster) meta.gambarPoster = payload.gambarPoster;

    // Bersihkan komentar lama jika ada, lalu sertakan meta baru
    const baseBody = (payload.body || '').replace(/<!--CDC_EVENT_META:.*?-->/g, '').trim();
    if (Object.keys(meta).length > 0) {
      payload.body = `${baseBody}\n<!--CDC_EVENT_META:${JSON.stringify(meta)}-->`;
    } else {
      payload.body = baseBody;
    }

    if (!payload.deadline && payload.tanggal) {
      payload.deadline = payload.tanggal;
    }
    if (!payload.linkLamar && payload.linkDaftar) {
      payload.linkLamar = payload.linkDaftar;
    }
    if (payload.kuotaEvent != null) {
      payload.kuotaEvent = Math.max(0, Math.abs(Number(payload.kuotaEvent) || 0));
      if (payload.kuota == null || payload.kuota < 0) {
        payload.kuota = payload.kuotaEvent;
      }
    }
  }
  return sendSyncRequest('konten_karir', payload);
}

export async function syncBeritaToSupabase(b: any): Promise<any> {
  return sendSyncRequest('berita', b);
}

export async function syncPengumumanToSupabase(p: any): Promise<any> {
  return sendSyncRequest('pengumuman', p);
}

export async function syncSurveiLulusanToSupabase(s: any): Promise<any> {
  return sendSyncRequest('survei_lulusan', s);
}

export async function syncDokumenAkreditasiToSupabase(da: any): Promise<any> {
  return sendSyncRequest('dokumen_akreditasi', da);
}

export async function syncSuratKeputusanToSupabase(sk: any): Promise<any> {
  return sendSyncRequest('surat_keputusan', sk);
}

export async function syncKalenderKegiatanToSupabase(k: any): Promise<any> {
  return sendSyncRequest('kalender_kegiatan', k);
}

export async function syncLaporanKinerjaToSupabase(l: any): Promise<any> {
  return sendSyncRequest('laporan_kinerja', l);
}

export async function syncMouStakeholderToSupabase(m: any): Promise<any> {
  return sendSyncRequest('mou_stakeholder', m);
}

export async function syncGaleriItemToSupabase(g: any): Promise<any> {
  return sendSyncRequest('galeri_items', g);
}

export async function syncSocialMediaToSupabase(s: any): Promise<any> {
  return sendSyncRequest('social_media', s);
}

export async function syncKomentarBeritaToSupabase(k: any): Promise<any> {
  const statusUpper = String(k.status || 'PENDING').toUpperCase();
  let directSuccess = false;

  // 1. Direct Supabase Client update status (Jalur Utama & Fail-safe)
  if (supabase && k.id) {
    try {
      const { error } = await supabase
        .from('komentar_beritas')
        .update({ status: statusUpper })
        .eq('id', k.id);
      if (!error) {
        directSuccess = true;
        console.log(`✅ [Direct Supabase] Status komentar ${k.id} berhasil diperbarui ke ${statusUpper}`);
      } else {
        console.warn('[Direct Supabase] Gagal update status komentar:', error.message);
      }
    } catch (e) {
      console.warn('[Direct Supabase] Exception update status komentar:', e);
    }
  }

  // 2. Sinkronisasi ke backend API
  try {
    return await sendSyncRequest('komentar_berita', { ...k, status: statusUpper });
  } catch (err) {
    if (directSuccess) return k;
    throw err;
  }
}

export async function syncUploadedDocumentToSupabase(d: any): Promise<any> {
  return sendSyncRequest('uploaded_documents', d);
}

// ── Sync fungsi untuk entitas config Admin Dashboard ─────────────────────────

/** 
 * Sync satu AnggotaTim ke tabel anggota_tims di Supabase.
 * Menggunakan arsitektur Dual-Path:
 * 1. Sanitasi ketat payload ke nama kolom PostgreSQL (buang fotoUrl agar tidak memicu error Prisma)
 * 2. Simpan langsung ke Supabase PostgreSQL via Supabase SDK (instan, bebas error 500 Railway)
 * 3. Kirim juga ke Express Backend API untuk audit log dan sinkronisasi
 */
export async function syncAnggotaTimToSupabase(item: any): Promise<any> {
  const cleanItem: Record<string, any> = {
    id: String(item.id || `angt_${Date.now().toString(36)}`),
    nama: String(item.nama || '').trim(),
    jabatan: String(item.jabatan || '').trim(),
    photoUrl: item.photoUrl || item.fotoUrl || null,
    email: item.email ? String(item.email).trim() : null,
    bio: item.bio ? String(item.bio).trim() : null,
    urutan: typeof item.urutan === 'number' ? item.urutan : (Number(item.urutan) || 0),
    isActive: item.isActive !== false
  };

  let directSuccess = false;
  let directResult: any = null;

  // 1. Direct Supabase Client (Jalur Utama & Fail-safe)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('anggota_tims')
        .upsert(cleanItem)
        .select();

      if (!error && data && data.length > 0) {
        directSuccess = true;
        directResult = data[0];
        console.log('✅ [Direct Supabase Sync] AnggotaTim tersimpan langsung ke PostgreSQL Supabase:', directResult);
      } else if (error) {
        console.warn('[Direct Supabase Sync] Gagal direct upsert, mencoba backend API:', error.message);
      }
    } catch (directErr) {
      console.warn('[Direct Supabase Sync] Exception:', directErr);
    }
  }

  // 2. Sinkronisasi ke Backend Express API
  try {
    const apiResult = await sendSyncRequest('anggota_tims', cleanItem);
    return apiResult || directResult || cleanItem;
  } catch (apiErr) {
    if (directSuccess) {
      console.log('ℹ️ [Sync AnggotaTim] Direct Supabase sukses meskipun Backend API offline/error.');
      return directResult || cleanItem;
    }
    throw apiErr;
  }
}

/** Sync satu HeroSlide ke tabel hero_slides di Supabase */
export async function syncHeroSlideToSupabase(item: any): Promise<any> {
  return sendSyncRequest('hero_slides', item);
}

/** Sync KonselingConfig (upsert by id) ke tabel konseling_configs di Supabase */
export async function syncKonselingConfigToSupabase(config: any): Promise<any> {
  return sendSyncRequest('konseling_configs', config);
}

/** Sync VisiMisiConfig (upsert by id) ke tabel visi_misi_configs di Supabase */
export async function syncVisiMisiConfigToSupabase(config: any): Promise<any> {
  return sendSyncRequest('visi_misi_configs', config);
}

/** Sync satu CampusHiringItem ke tabel campus_hirings di Supabase */
export async function syncCampusHiringToSupabase(item: any): Promise<any> {
  return sendSyncRequest('campus_hirings', item);
}

/** Sync satu JobFairItem ke tabel job_fair_events di Supabase */
export async function syncJobFairToSupabase(item: any): Promise<any> {
  return sendSyncRequest('job_fair_events', item);
}

/** 
 * Kirim komentar publik dengan arsitektur Dual-Path:
 * 1. Simpan langsung ke Supabase PostgreSQL tabel 'komentar_beritas' via Supabase JS SDK (instan, bebas 404/500 backend)
 * 2. Kirim juga ke Express Backend API (/api/komentar-publik) untuk audit log & sinkronisasi
 */
export async function sendPublicKomentar(payload: any): Promise<any> {
  const commentId = String(payload.id || `kmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const textKonten = String(payload.konten || payload.komentar || '').trim();
  const nama = String(payload.nama || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  let beritaId = payload.beritaId || null;

  let directSuccess = false;
  let directResult: any = null;

  // 1. Direct Supabase Client (Jalur Utama & Fail-safe)
  if (supabase) {
    try {
      // Jika beritaId belum ada tapi ada slug, cari id berita terlebih dahulu
      if (!beritaId && payload.beritaSlug) {
        const slugRef = String(payload.beritaSlug).trim();
        const unwrapped = slugRef.startsWith('kk-') ? slugRef.slice(3) : slugRef;
        const { data: bData } = await supabase
          .from('beritas')
          .select('id, judul, slug')
          .or(`slug.eq.${slugRef},id.eq.${slugRef},slug.eq.${unwrapped},id.eq.${unwrapped}`)
          .limit(1)
          .maybeSingle();
        if (bData && bData.id) {
          beritaId = bData.id;
        }
      }

      if (beritaId) {
        const { data, error } = await supabase
          .from('komentar_beritas')
          .insert({
            id: commentId,
            beritaId: beritaId,
            nama: nama.slice(0, 100),
            email: email.slice(0, 150),
            konten: textKonten,
            status: 'PENDING'
          })
          .select('*, berita:beritas(id, judul, slug)');

        if (!error && data && data.length > 0) {
          directSuccess = true;
          directResult = normalizeRecord('komentar_berita', data[0]);
          console.log('✅ [Direct Supabase Sync] Komentar berita tersimpan langsung ke PostgreSQL Supabase:', directResult);
        } else if (error) {
          console.warn('[Direct Supabase Sync] Gagal insert komentar:', error.message);
        }
      } else {
        console.warn('[Direct Supabase Sync] Berita tujuan tidak ditemukan untuk slug:', payload.beritaSlug);
      }
    } catch (directErr) {
      console.warn('[Direct Supabase Sync] Exception komentar:', directErr);
    }
  }

  // 2. Sinkronisasi ke Backend Express API
  try {
    const response = await fetch(`${API_BASE_URL}/komentar-publik`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: commentId,
        beritaId: beritaId,
        beritaSlug: payload.beritaSlug,
        nama: nama,
        email: email,
        komentar: textKonten
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && (data as any).success !== false) {
      return (data as any).result ?? directResult ?? data;
    }
    if (directSuccess) {
      console.log('ℹ️ [Komentar Publik] Direct Supabase sukses meskipun Backend API mengembalikan status error:', response.status);
      return directResult;
    }
    throw new Error((data as any).error || (data as any).message || `Gagal mengirim komentar (status ${response.status}).`);
  } catch (apiErr: any) {
    if (directSuccess) {
      console.log('ℹ️ [Komentar Publik] Direct Supabase sukses meskipun Backend API offline/404.');
      return directResult;
    }
    throw apiErr;
  }
}

/** Tarik data live komentar berita langsung dari Supabase PostgreSQL dengan relasi judul & slug berita */
export async function fetchDirectKomentarBerita(): Promise<any[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('komentar_beritas')
      .select('*, berita:beritas(id, judul, slug)')
      .order('createdAt', { ascending: false });
    if (error || !data) {
      if (error) console.warn('[Direct Supabase Komentar Fetch] Error:', error.message);
      return [];
    }
    return data.map(row => normalizeRecord('komentar_berita', row));
  } catch (e) {
    console.warn('[Direct Supabase Komentar Fetch] Exception:', e);
    return [];
  }
}

export async function logoutFromBackend(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* abaikan — sesi lokal tetap dibersihkan */ }
  clearAuthSession();
}
