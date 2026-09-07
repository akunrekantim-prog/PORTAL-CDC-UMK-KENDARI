/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Service pengelola transaksi data langsung ke Supabase PostgreSQL via Express API Backend
 *
 * Aturan main:
 * - API_BASE_URL dari VITE_API_URL (prod) dengan fallback localhost:5000 (dev).
 * - Semua request privat (/all-data, /sync/*, DELETE) WAJIB kirim Authorization: Bearer <cdc_auth_token>.
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

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL) ||
  'http://localhost:5000/api';

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
  if (typeof out.role === 'string') out.role = out.role.toLowerCase();
  if (typeof out.userStatusType === 'string') {
    const v = out.userStatusType.toLowerCase();
    out.userStatusType = v === 'alumni' ? 'Alumni' : 'Mahasiswa';
  }
  if (typeof out.status === 'string') {
    // user: ACTIVE→active; lowongan: PUBLISHED→published; pengajuan: SUBMITTED→submitted
    out.status = out.status.toLowerCase();
  }
  if (typeof out.statusKerjaSama === 'string') out.statusKerjaSama = out.statusKerjaSama.toLowerCase();
  if (typeof out.tipe === 'string') out.tipe = out.tipe.toLowerCase();
  if (entity === 'konten_karir' && typeof out.jenis === 'string') out.jenis = out.jenis.toLowerCase();
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

export async function loginToBackend(email: string, password: string): Promise<BackendLoginResult> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include', // kirim/terima httpOnly auth cookie
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase(), password })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Login gagal. Periksa kredensial Anda.');
  }
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

export interface BackendRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'MAHASISWA' | 'ALUMNI' | 'MITRA';
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
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Pendaftaran gagal. Coba lagi.');
  }
  return normalizeRecord('users', result.user);
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

async function sendSyncRequest(entity: string, payload: any): Promise<boolean> {
  try {
    const headers = authHeaders();
    if (!headers.Authorization) {
      console.warn(`[API Sync Skip] ${entity}: belum login, perubahan hanya tersimpan lokal.`);
      return false;
    }
    const response = await fetch(`${API_BASE_URL}/sync/${entity}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`[API Sync Warning] ${entity} status:`, response.status);
      return false;
    }
    const data = await response.json();
    console.log(`✅ [Supabase API Sync] ${entity} tersimpan ke Supabase PostgreSQL:`, data);
    return true;
  } catch (err) {
    console.warn(`[API Sync Exception] ${entity}:`, err);
    return false;
  }
}

export async function deleteFromSupabase(table: string, id: string): Promise<boolean> {
  try {
    const headers = authHeaders();
    if (!headers.Authorization) {
      console.warn(`[API Delete Skip] ${table}/${id}: belum login, hapus hanya lokal.`);
      return false;
    }
    const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers
    });
    if (!response.ok) return false;
    console.log(`✅ [Supabase API Delete] Item ${id} dihapus dari tabel ${table}`);
    return true;
  } catch (err) {
    console.warn(`[Supabase Delete Exception] ${table}:`, err);
    return false;
  }
}

export async function syncUserToSupabase(user: User): Promise<boolean> {
  return sendSyncRequest('users', user);
}

export async function syncMahasiswaToSupabase(mhs: Mahasiswa): Promise<boolean> {
  return sendSyncRequest('mahasiswa', mhs);
}

export async function syncAlumniToSupabase(alm: Alumni): Promise<boolean> {
  return sendSyncRequest('alumni', alm);
}

export async function syncMitraToSupabase(mitra: Mitra): Promise<boolean> {
  return sendSyncRequest('mitra', mitra);
}

export async function syncLowonganToSupabase(low: Lowongan): Promise<boolean> {
  return sendSyncRequest('lowongan', low);
}

export async function syncPengajuanToSupabase(p: PengajuanMagang): Promise<boolean> {
  return sendSyncRequest('pengajuan_magang', p);
}

export async function syncTracerStudyToSupabase(t: TracerStudy): Promise<boolean> {
  return sendSyncRequest('tracer_study', t);
}

export async function syncKontenKarirToSupabase(k: KontenKarir): Promise<boolean> {
  return sendSyncRequest('konten_karir', k);
}

export async function logoutFromBackend(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* abaikan — sesi lokal tetap dibersihkan */ }
  clearAuthSession();
}

export { API_BASE_URL };
