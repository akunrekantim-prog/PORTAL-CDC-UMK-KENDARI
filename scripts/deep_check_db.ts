import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const allTables: any = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Tables:', allTables.map((t: any) => t.table_name));

  const beritaRows: any = await prisma.$queryRawUnsafe(`
    SELECT id, judul, LEFT(thumbnail, 60) as thumb, LENGTH(thumbnail) as thumb_len, status, "createdAt"
    FROM beritas
    ORDER BY "createdAt" DESC;
  `);
  console.log('beritas rows count:', beritaRows.length);
  console.log('beritas rows:', beritaRows);

  const kontenKarirRows: any = await prisma.$queryRawUnsafe(`
    SELECT id, jenis, judul, LEFT(thumbnail, 60) as thumb, LENGTH(thumbnail) as thumb_len, status
    FROM konten_karirs
    WHERE jenis = 'berita';
  `);
  console.log('konten_karirs jenis=berita count:', kontenKarirRows.length);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
