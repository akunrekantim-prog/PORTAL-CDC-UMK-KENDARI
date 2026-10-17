import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'beritas' AND column_name IN ('thumbnail', 'body', 'judul')
  `);
  console.log('Columns in beritas:', cols);
}

run().finally(() => prisma.$disconnect());
