/**
 * VERIFIKASI: apakah konten_karir benar-benar gagal, atau itu artefak tes
 * (saya kirim 'BERITA' uppercase sedangkan DB hanya menerima lowercase)?
 *
 * Uji tiga kasus: lowercase (yang UI kirim), uppercase, dan jenis valid lain.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const BASE = 'http://localhost:5000/api';
const prisma = new PrismaClient();
const STAMP = Date.now();
const EMAIL = `probe_kk_${STAMP}@umkendari.ac.id`;
const PASSWORD = 'ProbeTest123!';

async function call(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const t = await res.text();
  let b: any; try { b = JSON.parse(t); } catch { b = t.slice(0, 120); }
  return { status: res.status, body: b };
}

(async () => {
  const userId = `probe_kk_${STAMP}`;
  const made: string[] = [];
  console.log('\n=== VERIFIKASI konten_karir: lowercase vs uppercase ===\n');
  try {
    await prisma.user.create({
      data: { id: userId, name: 'Probe KK', email: EMAIL,
        password: await bcrypt.hash(PASSWORD, 10), role: 'ADMIN', status: 'ACTIVE' }
    });
    const lr = await call('/login', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
    if (lr.status !== 200) throw new Error(`login gagal HTTP ${lr.status}`);
    const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${lr.body.token}` };

    for (const jenis of ['berita', 'BERITA', 'workshop', 'presentasi']) {
      const id = `probe_kk_${STAMP}_${jenis}`;
      const r = await call('/sync/konten_karir', { method: 'POST', headers: auth,
        body: JSON.stringify({ id, jenis, judul: `Uji ${jenis}`, body: 'isi',
          status: 'draft', penulis: 'probe' }) });
      const row = await prisma.kontenKarir.findUnique({ where: { id } });
      if (row) made.push(id);
      const label = r.status === 200 ? `HTTP 200, tersimpan jenis="${row?.jenis}"` : `HTTP ${r.status} GAGAL`;
      console.log(`  jenis=${jenis.padEnd(12)} -> ${label}`);
    }

    console.log('\n  KESIMPULAN:');
    console.log('    kalau lowercase 200 & uppercase 500 -> bukan bug produksi, UI kirim lowercase');
    console.log('    kalau lowercase juga 500 -> bug produksi nyata');
  } catch (e: any) {
    console.log('  ERROR: ' + e.message);
  } finally {
    try {
      for (const id of made) await prisma.kontenKarir.deleteMany({ where: { id } });
      await prisma.kontenKarir.deleteMany({ where: { id: { startsWith: 'probe_kk_' } } });
      await prisma.user.deleteMany({ where: { id: userId } });
      console.log(`\n  cleanup: konten_sisa=${await prisma.kontenKarir.count({ where: { id: { startsWith: 'probe_' } } })}` +
                  ` user_sisa=${await prisma.user.count({ where: { email: { startsWith: 'probe_kk_' } } })}`);
      console.log(`  data asli: users=${await prisma.user.count()} konten_karirs=${await prisma.kontenKarir.count()}`);
    } catch (e: any) { console.log('  cleanup GAGAL: ' + e.message); }
    await prisma.$disconnect();
  }
})();
