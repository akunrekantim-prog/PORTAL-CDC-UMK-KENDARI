import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const count = await prisma.berita.count();
  console.log('Count berita:', count);

  const allBerita = await prisma.berita.findMany();
  console.log('allBerita length:', allBerita.length);
  for (const b of allBerita) {
    console.log({
      id: b.id,
      judul: b.judul,
      thumbnail_length: b.thumbnail ? b.thumbnail.length : 0,
      thumbnail_preview: b.thumbnail ? b.thumbnail.slice(0, 50) : null,
      status: b.status,
      kategori: b.kategori,
      scope: (b as any).scope
    });
  }

  // Also check konten_karir table with jenis='berita'
  const kkBerita = await prisma.kontenKarir.findMany({
    where: { jenis: 'berita' }
  });
  console.log('konten_karir jenis=berita length:', kkBerita.length);
  for (const k of kkBerita) {
    console.log({
      id: k.id,
      judul: k.judul,
      thumbnail_length: k.thumbnail ? k.thumbnail.length : 0,
      thumbnail_preview: k.thumbnail ? k.thumbnail.slice(0, 50) : null,
      status: k.status
    });
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
