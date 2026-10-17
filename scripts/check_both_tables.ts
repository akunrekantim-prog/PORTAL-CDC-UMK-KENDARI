import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const kk = await prisma.kontenKarir.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('konten_karir count:', kk.length);
  for (const item of kk) {
    console.log(`[konten_karir] ID: ${item.id} | Jenis: ${item.jenis} | Judul: ${item.judul.slice(0, 40)} | Created: ${item.createdAt}`);
  }

  const b = await prisma.berita.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('\nberita count:', b.length);
  for (const item of b) {
    console.log(`[berita] ID: ${item.id} | Judul: ${item.judul.slice(0, 40)} | Created: ${item.createdAt}`);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
