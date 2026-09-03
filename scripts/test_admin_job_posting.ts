import { syncLowonganToSupabase } from '../src/services/dbService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminJobPosting() {
  console.log('🧪 Memulai pengujian pembuatan lowongan oleh Admin CDC ke Supabase PostgreSQL Database...\n');

  const testJobId = `test_admin_job_${Date.now()}`;

  const adminJobPayload: any = {
    id: testJobId,
    mitraId: 'admin_cdc', // Simulasi payload bawaan Admin yang dulu bermasalah
    createdBy: 'usr_admin',
    judul: 'Lowongan Software Architect (Admin CDC Test)',
    tipe: 'kerja',
    namaInstansi: 'CDC UM Kendari Official',
    companyLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
    bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800',
    lokasi: 'Kota Kendari, Sulawesi Tenggara',
    deskripsi: 'Pengujian integrasi langsung posting lowongan oleh Admin CDC.',
    kualifikasi: ['S1 Teknik Informatika', 'Pengalaman 2 tahun'],
    gaji: 'Rp 8.000.000 - Rp 12.000.000',
    benefit: ['Asuransi Kesehatan', 'Tunjangan Transport'],
    deadline: '2026-12-31',
    status: 'published',
    sumber: 'admin',
    isPinned: true
  };

  console.log(`📡 Mengirimkan HTTP POST /api/sync/lowongan (ID: ${testJobId})...`);
  const syncSuccess = await syncLowonganToSupabase(adminJobPayload);

  console.log(`\n📊 Status Hasil Sync API: ${syncSuccess ? '✅ BERHASIL (HTTP 200)' : '❌ GAGAL'}`);

  // Kueri langsung ke Supabase PostgreSQL
  const dbRecord = await prisma.lowongan.findUnique({
    where: { id: testJobId }
  });

  if (dbRecord) {
    console.log('🎉 AUDIT SUCCESS! Lowongan Admin berhasil terdaftar di database Supabase PostgreSQL:');
    console.log(`   ID: ${dbRecord.id}`);
    console.log(`   Judul: ${dbRecord.judul}`);
    console.log(`   Instansi: ${dbRecord.namaInstansi}`);
    console.log(`   mitraId (Sanitized): ${dbRecord.mitraId === null ? 'NULL (Valid Sanitized)' : dbRecord.mitraId}`);
    console.log(`   Status: ${dbRecord.status}`);
  } else {
    console.error('❌ GAGAL: Lowongan tidak ditemukan di database Supabase.');
  }

  await prisma.$disconnect();
}

testAdminJobPosting();
