import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Menambahkan kolom "scope" ke tabel "beritas" di Supabase...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "beritas" ADD COLUMN IF NOT EXISTS "scope" TEXT DEFAULT 'LOKAL';
  `);
  console.log('✅ Kolom "scope" berhasil ditambahkan!');

  // Verifikasi kolom tabel beritas
  const cols: any = await prisma.$queryRaw`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'beritas'
    ORDER BY ordinal_position;
  `;
  console.log('📋 Kolom tabel "beritas" saat ini:');
  console.table(cols);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Gagal menambahkan kolom:', e);
  await prisma.$disconnect();
  process.exit(1);
});
