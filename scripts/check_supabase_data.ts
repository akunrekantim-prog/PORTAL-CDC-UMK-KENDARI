import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users: any = await prisma.$queryRaw`SELECT count(*) FROM users`;
  const mahasiswas: any = await prisma.$queryRaw`SELECT count(*) FROM mahasiswas`;
  const lowongans: any = await prisma.$queryRaw`SELECT count(*) FROM lowongans`;
  const mitras: any = await prisma.$queryRaw`SELECT count(*) FROM mitras`;

  console.log('📊 DATA DI SUPABASE:');
  console.log('-------------------');
  console.log('Users:', users[0].count.toString());
  console.log('Mahasiswas:', mahasiswas[0].count.toString());
  console.log('Mitras:', mitras[0].count.toString());
  console.log('Lowongans:', lowongans[0].count.toString());

  await prisma.$disconnect();
}

check();
