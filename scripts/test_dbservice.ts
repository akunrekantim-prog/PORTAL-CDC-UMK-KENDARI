import { syncUserToSupabase, syncLowonganToSupabase } from '../src/services/dbService';

async function testIntegration() {
  console.log('🧪 Testing direct integration to Supabase PostgreSQL...');

  const testUser = {
    id: `test_usr_${Date.now()}`,
    name: 'Tes Integrasi Supabase',
    email: `test_integration_${Date.now()}@umkendari.ac.id`,
    role: 'user' as const,
    status: 'active' as const,
    createdAt: new Date().toISOString()
  };

  const userSuccess = await syncUserToSupabase(testUser);
  console.log('User Sync Success:', userSuccess);

  const testLowongan = {
    id: `test_low_${Date.now()}`,
    createdBy: testUser.id,
    judul: 'Lowongan Software Engineer (Supabase Test)',
    tipe: 'kerja' as const,
    namaInstansi: 'CDC Tech Studio',
    lokasi: 'Kendari',
    kualifikasi: ['S1 Teknik Informatika'],
    benefit: ['Tunjangan'],
    deadline: '2026-12-31',
    status: 'published' as const,
    createdAt: new Date().toISOString()
  };

  const jobSuccess = await syncLowonganToSupabase(testLowongan);
  console.log('Lowongan Sync Success:', jobSuccess);
}

testIntegration();
