/**
 * Supabase Client untuk Frontend
 * Digunakan untuk: upload foto profil ke Storage (profile-photos bucket)
 * 
 * Auth (login/register) tetap via Railway backend (Node.js + Prisma)
 * untuk keamanan bcrypt + JWT.
 */

import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = "https://wrhybdieqoyqhricplci.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaHliZGllcW95cWhyaWNwbGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NzI1NDcsImV4cCI6MjEwMzA0ODU0N30.dWdgY3hV_8uocyiTWgdNkQ5OGMq_sLgJlS0lKHMnN8U";

const supabaseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload foto profil ke Supabase Storage bucket 'profile-photos'.
 * Mengembalikan URL publik permanen yang bisa disimpan ke DB dan diakses dari device mana pun.
 * 
 * @param userId - ID user (dipakai sebagai nama folder)
 * @param file - File gambar yang akan diupload
 * @returns URL publik foto, atau null jika gagal
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
  if (!supabase) {
    console.warn('[Supabase Storage] Client tidak terinisialisasi — cek VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY');
    return null;
  }

  try {
    // Tentukan ekstensi dari MIME type
    const ext = file.type === 'image/png' ? 'png'
      : file.type === 'image/webp' ? 'webp'
      : file.type === 'image/gif' ? 'gif'
      : 'jpg';

    const filePath = `${userId}/photo_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: true,          // timpa file lama jika ada
        contentType: file.type,
        cacheControl: '3600'
      });

    if (error) {
      console.error('[Supabase Storage] Upload gagal:', error.message);
      return null;
    }

    // Dapatkan URL publik yang bisa diakses dari mana saja
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(data.path);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage] Exception:', err);
    return null;
  }
}

/**
 * Upload foto anggota tim CDC ke Supabase Storage bucket 'profile-photos' subfolder 'team'.
 * Mengembalikan URL publik permanen HTTPS yang bisa disimpan ke DB.
 *
 * @param file - File gambar yang akan diupload
 * @returns URL publik foto, atau null jika gagal
 */
export async function uploadTeamMemberPhoto(file: File): Promise<string | null> {
  if (!supabase) {
    console.warn('[Supabase Storage] Client tidak terinisialisasi — fallback ke kompresi lokal');
    return null;
  }

  try {
    const ext = file.type === 'image/png' ? 'png'
      : file.type === 'image/webp' ? 'webp'
      : file.type === 'image/gif' ? 'gif'
      : 'jpg';

    const filePath = `team/member_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600'
      });

    if (error) {
      console.error('[Supabase Storage] Upload foto tim gagal:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(data.path);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage] Exception upload foto tim:', err);
    return null;
  }
}

/**
 * Upload gambar thumbnail/poster konten atau berita ke Supabase Storage bucket 'profile-photos'
 * (disimpan dalam subfolder terstruktur 'berita' atau 'konten').
 * Mengembalikan URL publik HTTPS permanen yang ringan dan aman.
 *
 * @param file - File atau Blob gambar
 * @param folder - Subfolder dalam bucket (default 'berita')
 * @returns URL publik foto permanen, atau null jika gagal
 */
export async function uploadContentImage(file: File | Blob, folder = 'berita'): Promise<string | null> {
  if (!supabase) {
    console.warn('[Supabase Storage] Client tidak terinisialisasi');
    return null;
  }

  try {
    const mime = file.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png'
      : mime.includes('webp') ? 'webp'
      : mime.includes('gif') ? 'gif'
      : 'jpg';

    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'berita';
    const fileName = `${cleanFolder}/thumb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        upsert: true,
        contentType: mime,
        cacheControl: '86400'
      });

    if (error) {
      console.error('[Supabase Storage] Upload gambar konten gagal:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(data.path);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage] Exception upload gambar konten:', err);
    return null;
  }
}

/**
 * Konversi DataURL Base64 menjadi Blob dan unggah langsung ke Supabase Storage.
 * Jika input sudah berupa URL HTTP/HTTPS biasa, langsung kembalikan apa adanya.
 * 
 * @param dataUrl - Base64 DataURL (mis. data:image/jpeg;base64,...) atau URL HTTP
 * @param folder - Subfolder dalam bucket (default 'berita')
 * @returns URL publik foto permanen di Supabase Storage, atau null jika gagal
 */
export async function uploadDataUrlToStorage(dataUrl: string, folder = 'berita'): Promise<string | null> {
  if (!dataUrl) return null;
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }
  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return await uploadContentImage(blob, folder);
  } catch (e) {
    console.error('[Supabase Storage] Gagal konversi dataURL ke blob:', e);
    return null;
  }
}


