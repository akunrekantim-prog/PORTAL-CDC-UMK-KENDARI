import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncExistingBerita() {
  console.log('🔄 Memulai migrasi berita dari "konten_karirs" ke "beritas"...');
  
  // Ambil semua konten_karir berjenis 'berita'
  const newsInKontenKarir = await prisma.kontenKarir.findMany({
    where: { jenis: 'berita' }
  });

  console.log(`Ditemukan ${newsInKontenKarir.length} berita di tabel konten_karirs.`);

  let syncedCount = 0;
  for (const item of newsInKontenKarir) {
    const slugVal = item.id;
    await prisma.berita.upsert({
      where: { id: item.id },
      update: {
        judul: item.judul,
        body: item.body,
        thumbnail: item.thumbnail,
        penulis: item.penulis || 'Admin Website',
        status: item.status || 'published',
        slug: slugVal,
        kategori: item.kategori || 'Berita',
        isPinned: item.isPinned || false
      },
      create: {
        id: item.id,
        judul: item.judul,
        body: item.body,
        thumbnail: item.thumbnail,
        penulis: item.penulis || 'Admin Website',
        status: item.status || 'published',
        slug: slugVal,
        kategori: item.kategori || 'Berita',
        isPinned: item.isPinned || false,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
    console.log(`✅ Berita tersinkron ke tabel beritas: [${item.id}] ${item.judul}`);
    syncedCount++;
  }

  // Tampilkan hasil akhir
  const totalBeritas = await prisma.berita.count();
  console.log('----------------------------------------------------');
  console.log(`🎉 Berhasil menyinkronkan ${syncedCount} berita ke tabel 'beritas'.`);
  console.log(`📊 Total berita di tabel 'beritas' sekarang: ${totalBeritas}`);

  await prisma.$disconnect();
}

syncExistingBerita().catch(async (e) => {
  console.error('❌ Gagal menyinkronkan berita:', e);
  await prisma.$disconnect();
  process.exit(1);
});
