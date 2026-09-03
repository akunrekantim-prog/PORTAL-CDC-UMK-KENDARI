import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function repairNullPasswords() {
  console.log('🛠️ Memeriksa dan memperbarui kolom password NULL di database Supabase...');

  const nullUsers = await prisma.user.findMany({
    where: {
      password: null
    }
  });

  console.log(`📌 Ditemukan ${nullUsers.length} pengguna dengan password NULL.`);

  if (nullUsers.length > 0) {
    const defaultHash = await bcrypt.hash('password', 10);

    for (const u of nullUsers) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          password: defaultHash
        }
      });
      console.log(`✅ Fixed: User '${u.name}' (${u.email}) password telah di-update menjadi Bcrypt Hash!`);
    }
  }

  // Verifikasi akhir
  const remainingNull = await prisma.user.count({
    where: { password: null }
  });

  console.log(`\n📊 Status Akhir: ${remainingNull} pengguna dengan password NULL.`);
  if (remainingNull === 0) {
    console.log('🎉 SUKSES! Seluruh pengguna di Supabase PostgreSQL kini memiliki password terenkripsi Bcrypt yang valid!');
  }

  await prisma.$disconnect();
}

repairNullPasswords();
