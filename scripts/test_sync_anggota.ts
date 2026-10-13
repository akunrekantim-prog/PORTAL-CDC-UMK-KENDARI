import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const adminToken = jwt.sign(
  { id: 'usr_admin', email: 'admin@umkendari.ac.id', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function testSync() {
  // Generate a base64 image string of ~200KB (common from compressImageAdaptive)
  const base64Data = 'data:image/jpeg;base64,' + 'A'.repeat(250000);

  const item = {
    id: '54e9fa75-c3d0-4f99-b6a3-f5e34c17c15e',
    nama: 'Ary Tamtama S.Pd., M.Pi.',
    jabatan: 'Kepala CDC UM Kendari',
    photoUrl: base64Data,
    urutan: 1,
    isActive: true
  };

  try {
    const res = await fetch('http://localhost:5000/api/sync/anggota_tims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(item)
    });

    console.log('Status Base64:', res.status);
    const json = await res.json();
    console.log('Response Base64:', json?.success, 'Photo len in DB:', json?.result?.photoUrl?.length);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testSync();
