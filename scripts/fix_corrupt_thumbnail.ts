import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const targetId = 'kk_1791971282943';
  const target = await prisma.berita.findUnique({
    where: { id: targetId }
  });

  if (!target) {
    console.log(`Berita ${targetId} tidak ditemukan.`);
    return;
  }

  console.log('Berita ditemukan:', target.judul);
  console.log('Thumbnail lama panjang:', target.thumbnail ? target.thumbnail.length : 0);

  // Jika thumbnail terpotong <= 250 karakter dan diawali 'data:image/', itu adalah thumbnail rusak akibat pemotongan 200 karakter
  if (target.thumbnail && target.thumbnail.startsWith('data:image/') && target.thumbnail.length <= 250) {
    const validPhoto = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop';
    await prisma.berita.update({
      where: { id: targetId },
      data: {
        thumbnail: validPhoto
      }
    });
    console.log('[SUKSES] Thumbnail rusak diperbaiki dengan foto valid:', validPhoto);
  } else {
    console.log('Thumbnail saat ini tidak terpotong atau sudah valid.');
  }

  // Cek ulang
  const updated = await prisma.berita.findUnique({ where: { id: targetId } });
  console.log('Status terkini:', {
    id: updated?.id,
    judul: updated?.judul,
    thumbnail: updated?.thumbnail?.slice(0, 80)
  });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
