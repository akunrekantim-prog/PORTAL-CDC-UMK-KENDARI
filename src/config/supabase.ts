/**
 * Supabase Client untuk Frontend
 * Digunakan untuk: upload foto profil ke Storage (profile-photos bucket)
 * 
 * Auth (login/register) tetap via Railway backend (Node.js + Prisma)
 * untuk keamanan bcrypt + JWT.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

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

