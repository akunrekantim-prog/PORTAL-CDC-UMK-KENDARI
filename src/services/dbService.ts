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
  if (typeof out.tipe === 'string') out.tipe = out.tipe.toLowerCase();
  if (entity === 'konten_karir' && typeof out.jenis === 'string') out.jenis = out.jenis.toLowerCase();
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
    
    // Cegah thumbnail/coverImageUrl yang corrupt (misal base64 terpotong < 500 char)
    const checkCorrupted = (v: any) => typeof v === 'string' && v.startsWith('data:image/') && v.length < 500;
    if (checkCorrupted(out.thumbnail)) out.thumbnail = null;
    if (checkCorrupted(out.coverImageUrl)) out.coverImageUrl = null;

    if (!out.coverImageUrl && out.thumbnail) out.coverImageUrl = out.thumbnail;
    if (!out.thumbnail && out.coverImageUrl) out.thumbnail = out.coverImageUrl;
    if (!out.coverImageUrl) out.coverImageUrl = '/bg-gedung-umk.jpg';
    if (!out.thumbnail) out.thumbnail = out.coverImageUrl;

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
  const headers = authHeaders();
  if (!headers.Authorization) {
    throw new Error('Belum login. Hapus dibatalkan agar data tidak hanya hilang lokal.');
  }
  const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).error || `Gagal menghapus ${table}/${id} di Supabase (status ${response.status}).`);
  }
  console.log(`✅ [Supabase API Delete] Item ${id} dihapus dari tabel ${table}`);
  return true;
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
  return sendSyncRequest('konten_karir', k);
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
  return sendSyncRequest('komentar_berita', k);
}

export async function syncUploadedDocumentToSupabase(d: any): Promise<any> {
  return sendSyncRequest('uploaded_documents', d);
}

// ── Sync fungsi untuk entitas config Admin Dashboard ─────────────────────────

/** Sync satu AnggotaTim ke tabel anggota_tims di Supabase */
export async function syncAnggotaTimToSupabase(item: any): Promise<any> {
  return sendSyncRequest('anggota_tims', item);
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

/** Kirim komentar publik ke endpoint tanpa auth (langsung masuk ke tabel komentar_beritas dengan status PENDING) */
export async function sendPublicKomentar(payload: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/komentar-publik`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data as any).success === false) {
    throw new Error((data as any).error || (data as any).message || `Gagal mengirim komentar (status ${response.status}).`);
  }
  return (data as any).result ?? data;
}

export async function logoutFromBackend(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* abaikan — sesi lokal tetap dibersihkan */ }
  clearAuthSession();
}
