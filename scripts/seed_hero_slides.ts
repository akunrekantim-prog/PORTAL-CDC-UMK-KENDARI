import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OFFICIAL_HERO_SLIDES = [
  {
    id: 'slide-1',
    judul: 'Sambutan Rektor UM Kendari',
    subjudul: 'Sambutan Rektor UM Kendari - Slide 1',
    imageUrl: '/sambutan_rektor_2MB_final.svg',
    linkUrl: '',
    linkLabel: 'Pelajari Lebih Lanjut',
    urutan: 1,
    isActive: true,
  },
  {
    id: 'slide-2',
    judul: 'Perkenalan CDC UM Kendari',
    subjudul: 'Perkenalan CDC UM Kendari - Slide 2',
    imageUrl: '/PERKENALAN.svg',
    linkUrl: '',
    linkLabel: 'Tentang CDC',
    urutan: 2,
    isActive: true,
  },
  {
    id: 'slide-3',
    judul: 'Kreativitas & Inovasi Mahasiswa',
    subjudul: 'Kreativitas & Inovasi - Slide 3',
    imageUrl: '/KREATIVITAS_DAN_INOVASI_900KB.svg',
    linkUrl: '',
    linkLabel: 'Kreativitas & Inovasi',
    urutan: 3,
    isActive: true,
  },
  {
    id: 'slide-4',
    judul: 'Pengembangan Karir CDC',
    subjudul: 'Pengembangan Karir CDC - Slide 4',
    imageUrl: '/PENGEMBANGAN_KARIR_900KB.svg',
    linkUrl: '',
    linkLabel: 'Layanan Karir',
    urutan: 4,
    isActive: true,
  },
  {
    id: 'slide-5',
    judul: 'Tracer Study UM Kendari',
    subjudul: 'Tracer Study UM Kendari - Slide 5',
    imageUrl: '/TENTANG%20TRACER.svg',
    linkUrl: 'tracer-study',
    linkLabel: 'Isi Tracer Study',
    urutan: 5,
    isActive: true,
  },
  {
    id: 'slide-6',
    judul: 'Bimbingan & Konseling Karir',
    subjudul: 'Bimbingan & Konseling Karir - Slide 6',
    imageUrl: '/KONSELING%20KARIR.svg',
    linkUrl: 'konseling',
    linkLabel: 'Konseling Karir',
    urutan: 6,
    isActive: true,
  },
];

async function main() {
  console.log('🔄 Memulai perbaikan data hero_slides di database Supabase/PostgreSQL...');

  // Hapus slide usang yang mengarah ke path /images/hero-*.jpg
  const deletedOld = await prisma.heroSlide.deleteMany({
    where: {
      OR: [
        { imageUrl: { contains: '/images/hero-' } },
        { id: { in: ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6'] } }
      ]
    }
  });
  console.log(`🗑️  Menghapus ${deletedOld.count} data slide lama/dummy.`);

  // Insert 6 slide banner resmi
  for (const slide of OFFICIAL_HERO_SLIDES) {
    await prisma.heroSlide.upsert({
      where: { id: slide.id },
      update: {
        judul: slide.judul,
        subjudul: slide.subjudul,
        imageUrl: slide.imageUrl,
        linkUrl: slide.linkUrl,
        linkLabel: slide.linkLabel,
        urutan: slide.urutan,
        isActive: slide.isActive,
      },
      create: {
        id: slide.id,
        judul: slide.judul,
        subjudul: slide.subjudul,
        imageUrl: slide.imageUrl,
        linkUrl: slide.linkUrl,
        linkLabel: slide.linkLabel,
        urutan: slide.urutan,
        isActive: slide.isActive,
      },
    });
  }

  const allSlides = await prisma.heroSlide.findMany({ orderBy: { urutan: 'asc' } });
  console.log(`✅ Berhasil menyimpan ${allSlides.length} banner resmi ke tabel hero_slides:`);
  allSlides.forEach((s) => {
    console.log(`   [Slide ${s.urutan}] ${s.judul} -> ${s.imageUrl}`);
  });
}

main()
  .catch((err) => {
    console.error('❌ Error saat seeding hero slides:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
