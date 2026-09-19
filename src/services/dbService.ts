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
  return out;
}

function normalizeDataset(data: Record<string, any[]>): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  for (const [key, arr] of Object.entries(data || {})) {
    if (!Array.isArray(arr)) continue;
    // social_media_items (backend) → social_media (DBKey frontend)
    const mappedKey = key === 'social_media_items' ? 'social_media' : key;
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

  // Static Hosting Fallback (Firebase Hosting / Demo Mode tanpa live Node server)
  const users = getFromDB<any>('users') || [];
  const matchedUser = users.find(
    (u: any) => u && u.email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (!matchedUser) {
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
        throw new Error('Server backend tidak merespons (Gateway Timeout).');
      }
      throw new Error(result.message || result.error);
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

export async function logoutFromBackend(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* abaikan — sesi lokal tetap dibersihkan */ }
  clearAuthSession();
}
