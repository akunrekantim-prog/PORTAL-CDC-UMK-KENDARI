import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Testing photourl behavior on berita thumbnail...');
  // Buat mock base64 image data-url sepanjang 50.000 karakter
  const mockBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(50000);
  console.log('Mock Base64 length:', mockBase64.length);

  // Import server.js FIELD_RULES / buildSyncData test secara langsung
  const testId = 'test_thumb_' + Date.now();
  
  // Test langsung via Prisma bahwa DB menyimpan 50.000 char tanpa truncate
  const created = await prisma.berita.create({
    data: {
      id: testId,
      judul: 'Test Image Capacity',
      body: 'Test body',
      thumbnail: mockBase64,
      status: 'draft'
    }
  });

  console.log('Created test berita id:', created.id);
  const fetched = await prisma.berita.findUnique({ where: { id: testId } });
  console.log('Stored thumbnail length in Supabase:', fetched?.thumbnail?.length);

  if (fetched?.thumbnail?.length === mockBase64.length) {
    console.log('[SUCCESS] Database Supabase menyimpan base64 50.000 char dengan sempurna!');
  } else {
    console.error('[FAIL] Stored length does not match!');
  }

  // Cleanup test record
  await prisma.berita.delete({ where: { id: testId } });
  console.log('Cleaned up test record.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
