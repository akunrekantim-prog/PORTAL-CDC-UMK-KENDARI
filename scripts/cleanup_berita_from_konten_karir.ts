import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Memulai pembersihan berita dari tabel "konten_karirs"...');
  
  // Hitung jumlah record dengan jenis = 'berita' di konten_karirs
  const beforeCount = await prisma.kontenKarir.count({ where: { jenis: 'berita' } });
  console.log(`Ditemukan ${beforeCount} berita di tabel konten_karirs.`);

  if (beforeCount > 0) {
    const deleted = await prisma.kontenKarir.deleteMany({
      where: { jenis: 'berita' }
    });
    console.log(`🗑️ Berhasil menghapus ${deleted.count} berita dari tabel konten_karirs.`);
  } else {
    console.log('Tabel konten_karirs sudah bersih dari jenis berita.');
  }

  // Verifikasi akhir
  const afterKKBerita = await prisma.kontenKarir.count({ where: { jenis: 'berita' } });
  const afterKKTotal = await prisma.kontenKarir.count();
  const totalBeritas = await prisma.berita.count();

  console.log('----------------------------------------------------');
  console.log('📊 STATUS AKHIR DATABASE SUPABASE:');
  console.log('Tabel "beritas" (seluruh berita resmi):', totalBeritas);
  console.log('Tabel "konten_karirs" (jenis=berita):', afterKKBerita);
  console.log('Tabel "konten_karirs" (non-berita: program, presentasi, dll):', afterKKTotal);
  console.log('----------------------------------------------------');

  await prisma.$disconnect();
}

cleanup().catch(async (e) => {
  console.error('❌ Gagal membersihkan:', e);
  await prisma.$disconnect();
  process.exit(1);
});
