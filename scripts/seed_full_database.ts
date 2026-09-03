import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  SEED_USERS,
  SEED_MAHASISWA,
  SEED_ALUMNI,
  SEED_MITRA,
  SEED_LOWONGAN,
  SEED_BERITA,
  SEED_PENGUMUMAN,
  SEED_KONTEN_KARIR,
  SEED_KONTEN_KARIR_PRESENTASI,
  SEED_SURAT_KEPUTUSAN,
  SEED_KALENDER_KEGIATAN,
  SEED_LAPORAN_KINERJA,
  SEED_MOU_STAKEHOLDER,
  SEED_GALERI_ITEMS,
  SEED_SOCIAL_MEDIA
} from '../src/data';

const prisma = new PrismaClient();

async function seedFullDatabase() {
  console.log('🚀 Memulai migrasi total seluruh data dummy ke Supabase PostgreSQL...\n');

  const defaultPasswordHash = await bcrypt.hash('password', 10);

  // User ID Map
  const userMap: Record<string, string> = {};

  // 1. Users
  console.log('1️⃣ Memasukkan data Users...');
  for (const u of SEED_USERS) {
    let passwordHash = defaultPasswordHash;
    if (u.password && (u.password.startsWith('$2a$') || u.password.startsWith('$2b$'))) {
      passwordHash = u.password;
    } else if (u.password) {
      passwordHash = await bcrypt.hash(u.password, 10);
    }

    const saved = await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        name: u.name,
        password: passwordHash,
        phone: u.phone || null,
        role: (u.role || 'MAHASISWA').toUpperCase() as any,
        status: (u.status || 'PENDING').toUpperCase() as any,
        photoUrl: u.photoUrl || null
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        password: passwordHash,
        phone: u.phone || null,
        role: (u.role || 'MAHASISWA').toUpperCase() as any,
        status: (u.status || 'PENDING').toUpperCase() as any,
        photoUrl: u.photoUrl || null
      }
    });

    userMap[u.id] = saved.id;
    userMap[u.email.toLowerCase()] = saved.id;
  }

  // 2. Mahasiswa
  console.log('2️⃣ Memasukkan data Mahasiswa...');
  for (const m of SEED_MAHASISWA) {
    const targetUserId = userMap[m.userId] || userMap[m.email.toLowerCase()] || m.userId;
    const userObj = await prisma.user.findFirst({ where: { OR: [{ id: targetUserId }, { email: m.email.toLowerCase() }] } });
    if (!userObj) continue;

    await prisma.mahasiswa.upsert({
      where: { nim: m.nim },
      update: {
        nama: m.nama,
        email: m.email,
        phone: m.phone || null,
        programStudi: m.programStudi,
        fakultas: m.fakultas,
        angkatan: m.angkatan,
        semester: m.semester || 1,
        alamat: m.alamat || null,
        ipk: m.ipk || null,
        skills: m.skills || []
      },
      create: {
        id: m.id,
        userId: userObj.id,
        nim: m.nim,
        nama: m.nama,
        email: m.email,
        phone: m.phone || null,
        programStudi: m.programStudi,
        fakultas: m.fakultas,
        angkatan: m.angkatan,
        semester: m.semester || 1,
        alamat: m.alamat || null,
        ipk: m.ipk || null,
        skills: m.skills || []
      }
    });
  }

  // 3. Alumni
  console.log('3️⃣ Memasukkan data Alumni...');
  for (const a of SEED_ALUMNI) {
    const userObj = await prisma.user.findFirst({ where: { OR: [{ id: a.userId }, { email: a.email.toLowerCase() }] } });
    if (!userObj) continue;

    const existing = await prisma.alumni.findUnique({ where: { userId: userObj.id } });
    if (existing) {
      await prisma.alumni.update({
        where: { userId: userObj.id },
        data: {
          nama: a.nama,
          email: a.email,
          programStudi: a.programStudi,
          fakultas: a.fakultas,
          tahunLulus: a.tahunLulus,
          statusPekerjaan: a.statusPekerjaan,
          instansiKerja: a.instansiKerja || null,
          jabatan: a.jabatan || null
        }
      });
    } else {
      await prisma.alumni.create({
        data: {
          id: a.id,
          userId: userObj.id,
          nim: a.nim || null,
          nama: a.nama,
          email: a.email,
          phone: a.phone || null,
          programStudi: a.programStudi,
          fakultas: a.fakultas,
          tahunLulus: a.tahunLulus,
          statusPekerjaan: a.statusPekerjaan,
          instansiKerja: a.instansiKerja || null,
          jabatan: a.jabatan || null
        }
      });
    }
  }

  // 4. Mitra
  console.log('4️⃣ Memasukkan data Mitra...');
  for (const mt of SEED_MITRA) {
    const userObj = await prisma.user.findFirst({ where: { OR: [{ id: mt.userId }, { email: mt.email.toLowerCase() }] } });
    if (!userObj) continue;

    await prisma.mitra.upsert({
      where: { userId: userObj.id },
      update: {
        namaInstansi: mt.namaInstansi,
        bidangIndustri: mt.bidangIndustri || null,
        alamat: mt.alamat || null,
        kontakPerson: mt.kontakPerson,
        email: mt.email,
        phone: mt.phone || null,
        website: mt.website || null,
        statusKerjaSama: (mt.statusKerjaSama || 'PENDING').toUpperCase() as any
      },
      create: {
        id: mt.id,
        userId: userObj.id,
        namaInstansi: mt.namaInstansi,
        bidangIndustri: mt.bidangIndustri || null,
        alamat: mt.alamat || null,
        kontakPerson: mt.kontakPerson,
        email: mt.email,
        phone: mt.phone || null,
        website: mt.website || null,
        statusKerjaSama: (mt.statusKerjaSama || 'PENDING').toUpperCase() as any
      }
    });
  }

  // 5. Lowongan
  console.log('5️⃣ Memasukkan data Lowongan...');
  for (const l of SEED_LOWONGAN) {
    let validMitraId: string | null = null;
    if (l.mitraId) {
      const mObj = await prisma.mitra.findFirst({ where: { OR: [{ id: l.mitraId }, { userId: l.mitraId }] } });
      if (mObj) validMitraId = mObj.id;
    }

    const existing = await prisma.lowongan.findUnique({ where: { id: l.id } });
    if (existing) {
      await prisma.lowongan.update({
        where: { id: l.id },
        data: {
          mitraId: validMitraId,
          judul: l.judul,
          tipe: (l.tipe || 'KERJA').toUpperCase() as any,
          namaInstansi: l.namaInstansi,
          companyLogo: l.companyLogo || null,
          bannerImage: l.bannerImage || null,
          lokasi: l.lokasi,
          deskripsi: l.deskripsi || null,
          kualifikasi: l.kualifikasi || [],
          gaji: l.gaji || null,
          benefit: l.benefit || [],
          status: (l.status || 'PUBLISHED').toUpperCase() as any
        }
      });
    } else {
      await prisma.lowongan.create({
        data: {
          id: l.id,
          mitraId: validMitraId,
          createdBy: l.createdBy || 'usr_admin',
          judul: l.judul,
          tipe: (l.tipe || 'KERJA').toUpperCase() as any,
          namaInstansi: l.namaInstansi,
          companyLogo: l.companyLogo || null,
          bannerImage: l.bannerImage || null,
          lokasi: l.lokasi,
          deskripsi: l.deskripsi || null,
          kualifikasi: l.kualifikasi || [],
          gaji: l.gaji || null,
          benefit: l.benefit || [],
          deadline: l.deadline ? new Date(l.deadline) : new Date(),
          status: (l.status || 'PUBLISHED').toUpperCase() as any
        }
      });
    }
  }

  // 6. Konten Karir & Berita
  console.log('6️⃣ Memasukkan data Konten Karir & Berita...');
  const allKonten = [...SEED_KONTEN_KARIR, ...SEED_KONTEN_KARIR_PRESENTASI];
  for (const k of allKonten) {
    const existing = await prisma.kontenKarir.findUnique({ where: { id: k.id } });
    if (!existing) {
      await prisma.kontenKarir.create({
        data: {
          id: k.id,
          jenis: k.jenis || 'berita',
          judul: k.judul,
          body: k.body || '',
          penulis: k.penulis || null,
          namaInstansi: k.namaInstansi || null,
          tipe: k.tipe || null,
          linkLamar: k.linkLamar || k.linkCta || null,
          kategori: k.kategori || null,
          gaji: k.gaji || null,
          kuota: k.kuota || null,
          deadline: k.deadline ? new Date(k.deadline) : null,
          thumbnail: k.thumbnail || null,
          scope: k.scope || 'NASIONAL',
          status: k.status || 'published',
          isPinned: k.isPinned || false,
          showOnHome: k.showOnHome !== undefined ? k.showOnHome : true
        }
      });
    }
  }

  // 7. Berita Seed
  for (const b of SEED_BERITA) {
    const existing = await prisma.berita.findFirst({ where: { judul: b.title } });
    if (!existing) {
      await prisma.berita.create({
        data: {
          id: b.id,
          judul: b.title,
          slug: b.slug,
          body: b.content,
          thumbnail: b.coverImageUrl || undefined,
          penulis: b.penulis || 'Tim CDC',
          status: b.status || 'published',
          createdAt: b.createdAt ? new Date(b.createdAt) : new Date()
        }
      });
    }
  }

  // 8. Pengumuman
  console.log('7️⃣ Memasukkan data Pengumuman...');
  for (const p of SEED_PENGUMUMAN) {
    const existing = await prisma.pengumuman.findFirst({ where: { judul: p.title } });
    if (!existing) {
      await prisma.pengumuman.create({
        data: {
          id: p.id,
          judul: p.title,
          body: p.content,
          thumbnail: p.posterUrl || undefined,
          status: p.status || 'published',
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
        }
      });
    }
  }

  // 9. Surat Keputusan
  console.log('8️⃣ Memasukkan data Surat Keputusan...');
  for (const sk of SEED_SURAT_KEPUTUSAN) {
    const existing = await prisma.suratKeputusan.findFirst({ where: { judul: sk.judul } });
    if (!existing) {
      await prisma.suratKeputusan.create({
        data: {
          id: sk.id,
          nomor: `SK-${sk.id}`,
          judul: sk.judul,
          tanggal: sk.createdAt ? new Date(sk.createdAt) : new Date(),
          fileUrl: sk.pdfUrl || sk.linkUrl || undefined,
          kategori: sk.kategori || 'Umum'
        }
      });
    }
  }

  // 10. Kalender Kegiatan
  console.log('9️⃣ Memasukkan data Kalender Kegiatan...');
  for (const kk of SEED_KALENDER_KEGIATAN) {
    const existing = await prisma.kalenderKegiatan.findFirst({ where: { judul: kk.judul } });
    if (!existing) {
      await prisma.kalenderKegiatan.create({
        data: {
          id: kk.id,
          judul: kk.judul,
          tanggalMulai: kk.createdAt ? new Date(kk.createdAt) : new Date(),
          kategori: kk.kategori || 'Event',
          lokasi: 'UM Kendari'
        }
      });
    }
  }

  // 11. MOU Stakeholder
  console.log('🔟 Memasukkan data MOU Stakeholder...');
  for (const mou of SEED_MOU_STAKEHOLDER) {
    const existing = await prisma.mouStakeholder.findFirst({ where: { namaInstansi: mou.judul } });
    if (!existing) {
      await prisma.mouStakeholder.create({
        data: {
          id: mou.id,
          namaInstansi: mou.judul,
          jenisMou: mou.kategori || 'Kerjasama',
          tanggalMou: mou.createdAt ? new Date(mou.createdAt) : new Date(),
          status: 'aktif'
        }
      });
    }
  }

  // 12. Galeri Items
  console.log('1️⃣1️⃣ Memasukkan data Galeri Items...');
  for (const g of SEED_GALERI_ITEMS) {
    const existing = await prisma.galeriItem.findFirst({ where: { judul: g.judul } });
    if (!existing) {
      await prisma.galeriItem.create({
        data: {
          id: g.id,
          judul: g.judul,
          imageUrl: g.posterUrl || g.pdfUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
          kategori: g.kategoriSection || 'Kegiatan',
          deskripsi: g.deskripsi || null
        }
      });
    }
  }

  // 13. Laporan Kinerja
  console.log('1️⃣2️⃣ Memasukkan data Laporan Kinerja...');
  for (const lap of SEED_LAPORAN_KINERJA) {
    const existing = await prisma.laporanKinerja.findFirst({ where: { judul: lap.judul } });
    if (!existing) {
      await prisma.laporanKinerja.create({
        data: {
          id: lap.id,
          judul: lap.judul,
          tahun: new Date(lap.createdAt || Date.now()).getFullYear(),
          periode: lap.kategori || 'Tahunan',
          fileUrl: lap.pdfUrl || lap.linkUrl || undefined,
          deskripsi: (lap as any).deskripsi || null
        }
      });
    }
  }

  // 14. Social Media Items
  console.log('1️⃣3️⃣ Memasukkan data Social Media...');
  for (const sm of SEED_SOCIAL_MEDIA) {
    const existing = await prisma.socialMediaItem.findFirst({ where: { platform: sm.platform } });
    if (!existing) {
      await prisma.socialMediaItem.create({
        data: {
          id: sm.id,
          platform: sm.platform,
          url: sm.url,
          icon: (sm as any).icon || null,
          isActive: sm.isActive !== false
        }
      });
    }
  }

  console.log('\n🎉 SELESAI! Seluruh data dummy dari src/data.ts telah 100% dipindahkan ke database Supabase PostgreSQL!');
  await prisma.$disconnect();
}

seedFullDatabase().catch((err) => {
  console.error('❌ Error during full database seed:', err);
  process.exit(1);
});
