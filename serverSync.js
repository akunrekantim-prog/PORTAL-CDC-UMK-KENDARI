/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * serverSync.js — Auto-Sync & Database Bridge dari Supabase ke PostgreSQL Kampus
 * ─────────────────────────────────────────────────────────────────────────────
 * Menjembatani database Supabase (cloud) ke PostgreSQL server kampus:
 * 1. Saat server kampus menyala (boot), cek apakah tabel users/berita masih kosong.
 * 2. Jika kosong (atau belum ada Admin), tarik data otomatis dari REST API Supabase (HTTPS port 443).
 * 3. Jika koneksi outbound ke Supabase terblokir firewall kampus, otomatis gunakan snapshot data
 *    lokal (scripts/supabase_snapshot.json) sebagai fallback 100% aman.
 * 4. Memastikan akun Admin `admin@umkendari.ac.id` memiliki password bcrypt yang valid (`admin123!`).
 * 5. Menyediakan endpoint admin `/api/admin/sync-from-supabase` untuk sinkronisasi manual kapan saja.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wrhybdieqoyqhricplci.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaHliZGllcW95cWhyaWNwbGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NzI1NDcsImV4cCI6MjEwMzA0ODU0N30.dWdgY3hV_8uocyiTWgdNkQ5OGMq_sLgJlS0lKHMnN8U';

/**
 * Baca snapshot data dari file JSON lokal sebagai fallback
 */
function readLocalSnapshot() {
  const snapshotPath = path.join(__dirname, 'scripts', 'supabase_snapshot.json');
  try {
    if (fs.existsSync(snapshotPath)) {
      const raw = fs.readFileSync(snapshotPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[serverSync] Gagal membaca snapshot lokal:', err.message);
  }
  return null;
}

/**
 * Tarik data dari Supabase REST API via HTTPS
 */
async function fetchSupabaseTable(tableName) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=*`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      // Timeout 8 detik agar tidak menggantung server saat boot jika firewall blokir
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[serverSync] Supabase REST API ${tableName} tidak dapat dijangkau:`, err.message);
  }
  return null;
}

/**
 * Eksekusi Sinkronisasi Penuh ke PostgreSQL Database
 */
export async function runFullSync(prisma) {
  console.log('🔄 [serverSync] Memulai proses sinkronisasi database dari Supabase...');
  const stats = { users: 0, beritas: 0, slides: 0, galeri: 0, lowongan: 0, akreditasi: 0 };
  const snapshot = readLocalSnapshot() || {};

  // 1. Sinkronisasi Users
  try {
    let users = await fetchSupabaseTable('users');
    if (!users || users.length === 0) users = snapshot.users || [];

    const defaultAdminHash = await bcrypt.hash('admin123!', 10);
    const defaultUserHash = await bcrypt.hash('password', 10);

    for (const u of users) {
      if (!u.email) continue;
      const isAdmin = u.email.toLowerCase() === 'admin@umkendari.ac.id';
      const role = isAdmin ? 'ADMIN' : (u.role || 'MAHASISWA').toUpperCase();
      const status = (u.status || 'ACTIVE').toUpperCase();
      const passwordHash = isAdmin ? defaultAdminHash : defaultUserHash;

      await prisma.user.upsert({
        where: { email: u.email.toLowerCase().trim() },
        update: {
          name: u.name || (isAdmin ? 'Operator CDC UM Kendari' : 'Pengguna CDC'),
          role,
          status,
          phone: u.phone || null,
          ...(isAdmin ? { password: defaultAdminHash } : {})
        },
        create: {
          id: u.id || `usr_${Date.now().toString(36)}`,
          name: u.name || (isAdmin ? 'Operator CDC UM Kendari' : 'Pengguna CDC'),
          email: u.email.toLowerCase().trim(),
          password: passwordHash,
          role,
          status,
          phone: u.phone || null
        }
      });
      stats.users++;
    }

    // Pastikan admin@umkendari.ac.id SELALU ada
    const adminCheck = await prisma.user.findFirst({ where: { email: 'admin@umkendari.ac.id' } });
    if (!adminCheck) {
      await prisma.user.create({
        data: {
          id: 'a1b2c3d4-0001-0001-0001-000000000001',
          name: 'Operator CDC UM Kendari',
          email: 'admin@umkendari.ac.id',
          password: defaultAdminHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          phone: '081234567890'
        }
      });
      stats.users++;
    }
  } catch (err) {
    console.error('⚠️ [serverSync] Error saat sinkronisasi users:', err.message);
  }

  // 2. Sinkronisasi Berita
  try {
    let beritas = await fetchSupabaseTable('beritas');
    if (!beritas || beritas.length === 0) beritas = snapshot.beritas || [];

    for (const b of beritas) {
      if (!b.id || !b.judul) continue;
      await prisma.berita.upsert({
        where: { id: b.id },
        update: {
          judul: b.judul,
          slug: b.slug || b.id,
          body: b.body || '',
          thumbnail: b.thumbnail || null,
          penulis: b.penulis || 'Admin CDC UMK',
          kategori: b.kategori || 'Umum',
          scope: b.scope || 'LOKAL',
          tags: Array.isArray(b.tags) ? b.tags : [],
          isPinned: !!b.isPinned,
          status: b.status || 'published',
          viewCount: typeof b.viewCount === 'number' ? b.viewCount : 0
        },
        create: {
          id: b.id,
          judul: b.judul,
          slug: b.slug || b.id,
          body: b.body || '',
          thumbnail: b.thumbnail || null,
          penulis: b.penulis || 'Admin CDC UMK',
          kategori: b.kategori || 'Umum',
          scope: b.scope || 'LOKAL',
          tags: Array.isArray(b.tags) ? b.tags : [],
          isPinned: !!b.isPinned,
          status: b.status || 'published',
          viewCount: typeof b.viewCount === 'number' ? b.viewCount : 0,
          createdAt: b.createdAt ? new Date(b.createdAt) : new Date()
        }
      });
      stats.beritas++;
    }
  } catch (err) {
    console.error('⚠️ [serverSync] Error saat sinkronisasi beritas:', err.message);
  }

  // 3. Sinkronisasi Hero Slides
  try {
    let slides = await fetchSupabaseTable('hero_slides');
    if (!slides || slides.length === 0) slides = snapshot.hero_slides || [];

    for (const s of slides) {
      if (!s.id || !s.judul) continue;
      await prisma.heroSlide.upsert({
        where: { id: s.id },
        update: {
          judul: s.judul,
          subjudul: s.subjudul || null,
          imageUrl: s.imageUrl || '',
          linkUrl: s.linkUrl || null,
          linkLabel: s.linkLabel || null,
          urutan: typeof s.urutan === 'number' ? s.urutan : 0,
          isActive: s.isActive !== false
        },
        create: {
          id: s.id,
          judul: s.judul,
          subjudul: s.subjudul || null,
          imageUrl: s.imageUrl || '',
          linkUrl: s.linkUrl || null,
          linkLabel: s.linkLabel || null,
          urutan: typeof s.urutan === 'number' ? s.urutan : 0,
          isActive: s.isActive !== false
        }
      });
      stats.slides++;
    }
  } catch (err) {
    console.error('⚠️ [serverSync] Error saat sinkronisasi hero_slides:', err.message);
  }

  // 4. Sinkronisasi Galeri Items
  try {
    let galeri = await fetchSupabaseTable('galeri_items');
    if (!galeri || galeri.length === 0) galeri = snapshot.galeri_items || [];

    for (const g of galeri) {
      if (!g.id || !g.judul) continue;
      await prisma.galeriItem.upsert({
        where: { id: g.id },
        update: {
          judul: g.judul,
          imageUrl: g.imageUrl || '',
          kategori: g.kategori || 'Umum',
          deskripsi: g.deskripsi || null,
          tanggal: g.tanggal ? new Date(g.tanggal) : null
        },
        create: {
          id: g.id,
          judul: g.judul,
          imageUrl: g.imageUrl || '',
          kategori: g.kategori || 'Umum',
          deskripsi: g.deskripsi || null,
          tanggal: g.tanggal ? new Date(g.tanggal) : null
        }
      });
      stats.galeri++;
    }
  } catch (err) {
    console.error('⚠️ [serverSync] Error saat sinkronisasi galeri_items:', err.message);
  }

  // 5. Sinkronisasi Lowongan
  try {
    let lowongans = await fetchSupabaseTable('lowongans');
    if (!lowongans || lowongans.length === 0) lowongans = snapshot.lowongans || [];

    for (const l of lowongans) {
      if (!l.id || !l.judul) continue;
      await prisma.lowongan.upsert({
        where: { id: l.id },
        update: {
          judul: l.judul,
          tipe: (l.tipe || 'FULL_TIME').toUpperCase(),
          namaInstansi: l.namaInstansi || 'Perusahaan Mitra',
          companyLogo: l.companyLogo || null,
          bannerImage: l.bannerImage || null,
          imageUrl: l.imageUrl || null,
          lokasi: l.lokasi || 'Kendari',
          deskripsi: l.deskripsi || '',
          status: (l.status || 'PUBLISHED').toUpperCase()
        },
        create: {
          id: l.id,
          judul: l.judul,
          tipe: (l.tipe || 'FULL_TIME').toUpperCase(),
          namaInstansi: l.namaInstansi || 'Perusahaan Mitra',
          companyLogo: l.companyLogo || null,
          bannerImage: l.bannerImage || null,
          imageUrl: l.imageUrl || null,
          lokasi: l.lokasi || 'Kendari',
          deskripsi: l.deskripsi || '',
          status: (l.status || 'PUBLISHED').toUpperCase()
        }
      });
      stats.lowongan++;
    }
  } catch (err) {
    console.error('⚠️ [serverSync] Error saat sinkronisasi lowongans:', err.message);
  }

  // 6. Sinkronisasi Dokumen Akreditasi (34 Prodi UM Kendari)
  try {
    if (prisma.dokumenAkreditasi) {
      const akreditasiList = snapshot.dokumen_akreditasis || [];
      for (const a of akreditasiList) {
        if (!a.id || !a.prodi) continue;
        await prisma.dokumenAkreditasi.upsert({
          where: { id: a.id },
          update: {
            fakultas: a.fakultas,
            kodeFakultas: a.kodeFakultas,
            prodi: a.prodi,
            jenjang: a.jenjang || 'S1',
            statusAkreditasi: a.statusAkreditasi || 'UNGGUL',
            nomorSk: a.nomorSk || null,
            tahunAkreditasi: a.tahunAkreditasi || null,
            masaBerlaku: a.masaBerlaku || null,
            lembaga: a.lembaga || 'LAMDIK',
            websiteFakultas: a.websiteFakultas || null,
            logoFakultasUrl: a.logoFakultasUrl || null,
            urutan: a.urutan || 0
          },
          create: {
            id: a.id,
            fakultas: a.fakultas,
            kodeFakultas: a.kodeFakultas,
            prodi: a.prodi,
            jenjang: a.jenjang || 'S1',
            statusAkreditasi: a.statusAkreditasi || 'UNGGUL',
            nomorSk: a.nomorSk || null,
            tahunAkreditasi: a.tahunAkreditasi || null,
            masaBerlaku: a.masaBerlaku || null,
            lembaga: a.lembaga || 'LAMDIK',
            websiteFakultas: a.websiteFakultas || null,
            logoFakultasUrl: a.logoFakultasUrl || null,
            urutan: a.urutan || 0
          }
        });
        stats.akreditasi++;
      }
    }
  } catch (err) {
    console.error('⚠️ [serverSync] Error saat sinkronisasi dokumen_akreditasi:', err.message);
  }

  console.log('✅ [serverSync] Sinkronisasi selesai dengan hasil:', stats);
  return stats;
}

/**
 * Helper boot: Dipanggil saat startup server.js
 */
export async function autoSyncDatabaseOnBoot(prisma) {
  try {
    const userCount = await prisma.user.count().catch(() => 0);
    const beritaCount = await prisma.berita.count().catch(() => 0);

    console.log(`📡 [Auto-Sync Check] Status Database: ${userCount} users, ${beritaCount} berita.`);

    // Jika database kosong, lakukan sinkronisasi otomatis
    if (userCount === 0 || beritaCount === 0) {
      console.log('🚀 [Auto-Sync] Database kosong/belum lengkap. Menjalankan auto-sync dari Supabase...');
      await runFullSync(prisma);
    } else {
      // Pastikan akun admin@umkendari.ac.id selalu aktif dan password siap digunakan
      const adminUser = await prisma.user.findFirst({ where: { email: 'admin@umkendari.ac.id' } });
      if (!adminUser) {
        const defaultAdminHash = await bcrypt.hash('admin123!', 10);
        await prisma.user.create({
          data: {
            id: 'a1b2c3d4-0001-0001-0001-000000000001',
            name: 'Operator CDC UM Kendari',
            email: 'admin@umkendari.ac.id',
            password: defaultAdminHash,
            role: 'ADMIN',
            status: 'ACTIVE',
            phone: '081234567890'
          }
        });
        console.log('✅ [Auto-Sync] Akun default admin@umkendari.ac.id dipastikan aktif.');
      }
    }
  } catch (err) {
    console.error('⚠️ [Auto-Sync Boot Warning]:', err.message);
  }
}
