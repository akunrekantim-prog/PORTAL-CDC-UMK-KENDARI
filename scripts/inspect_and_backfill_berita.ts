import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memeriksa Baris Berita di Database Supabase ---');
  const allBerita = await prisma.berita.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Ditemukan ${allBerita.length} berita di tabel beritas.`);

  for (const b of allBerita) {
    let newScope = (b as any).scope || 'LOKAL';
    let newKategori = b.kategori || 'Umum';

    const text = `${b.judul} ${b.body || ''}`.toLowerCase();

    // Tentukan Kategori / Rubrik yang sesuai jika masih kosong atau hanya 'Berita'
    if (!b.kategori || b.kategori === 'Berita' || b.kategori === 'Umum') {
      if (text.includes('tracer') || text.includes('alumni') || text.includes('lulusan')) {
        newKategori = 'Tracer Study & Alumni';
      } else if (text.includes('magang') || text.includes('karir') || text.includes('kerja') || text.includes('lowongan') || text.includes('hiring') || text.includes('bumn')) {
        newKategori = 'Karir & Magang';
      } else if (text.includes('prestasi') || text.includes('juara') || text.includes('penghargaan') || text.includes('medali')) {
        newKategori = 'Prestasi Kampus';
      } else if (text.includes('workshop') || text.includes('pelatihan') || text.includes('seminar') || text.includes('webinar') || text.includes('bootcamp')) {
        newKategori = 'Pelatihan & Workshop';
      } else if (text.includes('mitra') || text.includes('kerjasama') || text.includes('mou') || text.includes('industri')) {
        newKategori = 'Kerjasama Mitra';
      } else if (text.includes('pengumuman') || text.includes('jadwal') || text.includes('wisuda')) {
        newKategori = 'Pengumuman Kampus';
      } else {
        newKategori = 'Umum';
      }
    }

    // Tentukan Scope jika masih default/null
    if (!(b as any).scope) {
      if (text.includes('global') || text.includes('internasional') || text.includes('dunia')) {
        newScope = 'GLOBAL';
      } else if (text.includes('nasional') || text.includes('kemdikbud') || text.includes('indonesia') || text.includes('bumn')) {
        newScope = 'NASIONAL';
      } else if (text.includes('regional') || text.includes('sulawesi') || text.includes('sultra')) {
        newScope = 'REGIONAL';
      } else {
        newScope = 'LOKAL';
      }
    }

    // Lakukan update via Prisma
    await prisma.berita.update({
      where: { id: b.id },
      data: {
        kategori: newKategori,
        // cast as any karena prisma client mungkin belum regenerate type
        ...({ scope: newScope } as any),
      }
    });

    console.log(`[OK] Berita "${b.judul.slice(0, 40)}..." -> Kategori: "${newKategori}", Scope: "${newScope}"`);
  }

  console.log('--- Selesai Memperbarui Berita di Database! ---');
}

main()
  .catch((e) => {
    console.error('Error saat backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
