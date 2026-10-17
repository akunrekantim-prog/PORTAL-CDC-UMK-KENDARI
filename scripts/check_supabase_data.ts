import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const cols: any = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'beritas'
    ORDER BY ordinal_position;
  `;
  console.log('📋 DAFTAR KOLOM TABEL "beritas" DI SUPABASE:');
  console.table(cols);

  const sampleRows: any = await prisma.$queryRaw`
    SELECT id, judul, slug, substring(thumbnail, 1, 50) as thumb_start, length(thumbnail) as thumb_len, status, "createdAt"
    FROM beritas 
    ORDER BY "createdAt" DESC
    LIMIT 10;
  `;
  console.log('🔍 SAMPEL BARIS TABEL "beritas":');
  console.table(sampleRows);

  await prisma.$disconnect();
}

check();
