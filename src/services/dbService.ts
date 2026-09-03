/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Service pengelola transaksi data langsung ke Supabase PostgreSQL via Express API Backend
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

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Mengambil seluruh data live dari database Supabase PostgreSQL
 */
export async function fetchInitialDatabaseFromSupabase(): Promise<Record<string, any[]> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/all-data`);
    if (!response.ok) {
      console.warn('[Supabase API] Failed to fetch all-data:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('✅ [Supabase API] Berhasil memuat seluruh database live dari Supabase PostgreSQL!');
    return data;
  } catch (err) {
    console.warn('[Supabase API Exception] fetchInitialDatabaseFromSupabase:', err);
    return null;
  }
}

async function sendSyncRequest(entity: string, payload: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
      method: 'DELETE'
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
