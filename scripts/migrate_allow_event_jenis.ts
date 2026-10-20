import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memastikan constraint jenis di tabel konten_karirs mendukung "event"...');
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'konten_karirs_jenis_check'
        ) THEN
          ALTER TABLE "konten_karirs" DROP CONSTRAINT "konten_karirs_jenis_check";
        END IF;

        ALTER TABLE "konten_karirs" ADD CONSTRAINT "konten_karirs_jenis_check"
          CHECK (jenis IN ('berita','lowongan','program','pengumuman','workshop','softskill','seminar','presentasi','event'));
      END $$;
    `);
    console.log('✅ Constraint konten_karirs_jenis_check berhasil diperbarui dengan dukungan "event"!');
  } catch (err: any) {
    console.error('❌ Gagal memperbarui constraint:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
