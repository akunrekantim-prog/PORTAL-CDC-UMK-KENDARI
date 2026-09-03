import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedHashedUsers() {
  console.log('🔒 Mengenkripsi kata sandi seluruh akun seed di Supabase...');

  const defaultPasswordHash = await bcrypt.hash('password', 10);

  const usersToSeed = [
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000001',
      name: 'Operator CDC UM Kendari',
      email: 'admin@umkendari.ac.id',
      phone: '081234567890',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000002',
      name: 'Muhammad Fadly Alamsyah',
      email: 'mhs@umkendari.ac.id',
      phone: '085241009988',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000003',
      name: 'Siti Rahmawati',
      email: 'rahma@umkendari.ac.id',
      phone: '082199008811',
      role: 'USER' as const,
      status: 'PENDING' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000004',
      name: 'Fachrul Alam Prasetyo, S.Kom.',
      email: 'alumni@umkendari.ac.id',
      phone: '081122334455',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000005',
      name: 'Andi Megawati, S.E.',
      email: 'mega@umkendari.ac.id',
      phone: '085311223344',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000006',
      name: 'Budi Setiawan (HRD PT Go Digital)',
      email: 'mitra@umkendari.ac.id',
      phone: '081299998888',
      role: 'MITRA' as const,
      status: 'ACTIVE' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000007',
      name: 'Suhartono (BSI Kendari)',
      email: 'bsi@umkendari.ac.id',
      phone: '081377776666',
      role: 'MITRA' as const,
      status: 'PENDING' as const,
      password: defaultPasswordHash
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000008',
      name: 'Dr. H. Ruslan, M.Si.',
      email: 'viewer@umkendari.ac.id',
      phone: '081144455566',
      role: 'VIEWER' as const,
      status: 'ACTIVE' as const,
      password: defaultPasswordHash
    }
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: u.password,
        role: u.role,
        status: u.status,
        phone: u.phone
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        phone: u.phone,
        role: u.role,
        status: u.status
      }
    });
  }

  console.log('✅ seluruh 8 akun seed (Admin, Mahasiswa, Alumni, Mitra) di Supabase kini menggunakan kata sandi terenkripsi Bcrypt!');
  await prisma.$disconnect();
}

seedHashedUsers();
