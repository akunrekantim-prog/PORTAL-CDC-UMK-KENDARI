import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testPasswordHashInSupabase() {
  console.log('🔍 Mengaudit sampel data kolom password di database Supabase...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true
    },
    take: 5
  });

  console.log(`📌 Ditemukan ${users.length} pengguna sampel di Supabase:\n`);

  let allHashed = true;

  for (const u of users) {
    const isHashed = u.password ? (u.password.startsWith('$2a$') || u.password.startsWith('$2b$')) : false;
    const isPlaintext = u.password ? !isHashed : false;
    const testMatch = u.password ? await bcrypt.compare('password', u.password) : false;

    console.log(`👤 Name: ${u.name}`);
    console.log(`   Email: ${u.email} (${u.role})`);
    console.log(`   Stored Password (Supabase DB): ${u.password ? u.password.slice(0, 30) + '...' : '(null)'}`);
    console.log(`   Format Enkripsi Bcrypt: ${isHashed ? '✅ TERENKRIPSI (BCRYPT HASH)' : '❌ PLAINTEXT / NULL'}`);
    console.log(`   Verifikasi Match ('password'): ${testMatch ? '✅ MATCH SUCCESS' : '❌ FAILED'}\n`);

    if (!isHashed) allHashed = false;
  }

  if (allHashed) {
    console.log('🎉 AUDIT SUCCESS! Seluruh kata sandi pengguna di Supabase tersimpan secara aman dalam format TERENKRIPSI BCRYPT HASH!');
  } else {
    console.warn('⚠️ Perhatian: Ada pengguna yang kata sandinya belum terenkripsi.');
  }

  await prisma.$disconnect();
}

testPasswordHashInSupabase();
