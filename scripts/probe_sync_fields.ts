/**
 * PROBE: buktikan field mana yang benar-benar dibuang senyap oleh /api/sync/*.
 *
 * Cara kerja: kirim nilai sentinel lewat HTTP, lalu BACA ULANG dari database.
 * Kalau API bilang sukses tapi nilai tidak berubah -> field itu dibuang senyap.
 *
 * Membuat user admin sementara, lalu membersihkan semuanya di akhir.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const BASE = 'http://localhost:5000/api';
const prisma = new PrismaClient();
const STAMP = Date.now();
const EMAIL = `probe_admin_${STAMP}@umkendari.ac.id`;
const PASSWORD = 'ProbeTest123!';

const S: Record<string, string> = {
  berita_kategori: `kat-${STAMP}`,
  lowongan_imageUrl: `img-${STAMP}`,
  lowongan_flyer: `flyer-${STAMP}`,
  lowongan_sumber: 'mitra',
  lowongan_jenisPekerjaan: 'full-time',
  konten_thumbnail: `thumb-${STAMP}`,
  konten_kategori: `kkat-${STAMP}`,
  berita_viewCount: '4242',
};

async function call(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let body: any; try { body = JSON.parse(text); } catch { body = text.slice(0, 150); }
  return { status: res.status, body };
}

(async () => {
  const ids = { userId: '', beritaId: '', lowonganId: '', kontenId: '' };
  console.log(`\n=== PROBE FIELD DIBUANG SENYAP (${BASE}) ===\n`);

  try {
    // ── siapkan admin sementara ────────────────────────────────────
    const u = await prisma.user.create({
      data: {
        id: `probe_admin_${STAMP}`, name: `Probe Admin ${STAMP}`, email: EMAIL,
        password: await bcrypt.hash(PASSWORD, 10), role: 'ADMIN', status: 'ACTIVE'
      }
    });
    ids.userId = u.id;
    const lr = await call('/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    if (lr.status !== 200) throw new Error(`login admin gagal: HTTP ${lr.status}`);
    const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${lr.body.token}` };
    console.log('  setup: admin sementara + login OK\n');

    // ── BERITA ─────────────────────────────────────────────────────
    ids.beritaId = `probe_berita_${STAMP}`;
    const b = await call('/sync/berita', {
      method: 'POST', headers: auth,
      body: JSON.stringify({
        id: ids.beritaId, judul: 'Probe Berita', slug: `probe-${STAMP}`,
        body: 'isi', kategori: S.berita_kategori, viewCount: Number(S.berita_viewCount),
        status: 'draft', penulis: 'probe'
      })
    });
    const bRow = await prisma.berita.findUnique({ where: { id: ids.beritaId } });
    console.log('  BERITA  (HTTP ' + b.status + ')');
    console.log(`    kategori    kirim="${S.berita_kategori}"  DB="${bRow?.kategori}"  -> ${bRow?.kategori === S.berita_kategori ? 'TERSIMPAN' : 'DIBUANG'}`);
    console.log(`    viewCount   kirim=${S.berita_viewCount}  DB=${bRow?.viewCount}  -> ${Number(bRow?.viewCount) === Number(S.berita_viewCount) ? 'TERSIMPAN' : 'DIBUANG'}`);

    // ── LOWONGAN ───────────────────────────────────────────────────
    ids.lowonganId = `probe_low_${STAMP}`;
    const l = await call('/sync/lowongan', {
      method: 'POST', headers: auth,
      body: JSON.stringify({
        id: ids.lowonganId, createdBy: ids.userId, judul: 'Probe Lowongan', tipe: 'KERJA',
        namaInstansi: 'Probe Inc', lokasi: 'Kendari', status: 'PUBLISHED', isPinned: true,
        deadline: new Date(Date.now() + 864e5).toISOString(),
        imageUrl: S.lowongan_imageUrl, flyer: S.lowongan_flyer, sumber: S.lowongan_sumber,
        jenisPekerjaan: S.lowongan_jenisPekerjaan, kategori: 'probe', kuota: 3
      })
    });
    const lRow = await prisma.lowongan.findUnique({ where: { id: ids.lowonganId } });
    console.log('\n  LOWONGAN  (HTTP ' + l.status + ')');
    const chk = (label: string, sent: any, got: any) =>
      console.log(`    ${label.padEnd(15)} kirim=${JSON.stringify(sent)}  DB=${JSON.stringify(got)}  -> ${JSON.stringify(sent) === JSON.stringify(got) ? 'TERSIMPAN' : 'DIBUANG'}`);
    chk('judul', 'Probe Lowongan', lRow?.judul);
    chk('imageUrl', S.lowongan_imageUrl, lRow?.imageUrl);
    chk('flyer', S.lowongan_flyer, lRow?.flyer);
    chk('sumber', S.lowongan_sumber, lRow?.sumber);
    chk('jenisPekerjaan', S.lowongan_jenisPekerjaan, lRow?.jenisPekerjaan);
    chk('isPinned', true, lRow?.isPinned);
    chk('kuota', 3, lRow?.kuota);

    // ── KONTEN KARIR ───────────────────────────────────────────────
    ids.kontenId = `probe_konten_${STAMP}`;
    const k = await call('/sync/konten_karir', {
      method: 'POST', headers: auth,
      body: JSON.stringify({
        id: ids.kontenId, judul: 'Probe Konten', jenis: 'berita', status: 'draft',
        thumbnail: S.konten_thumbnail, kategori: S.konten_kategori, showOnHome: true
      })
    });
    const kRow = await prisma.kontenKarir.findUnique({ where: { id: ids.kontenId } });
    console.log('\n  KONTEN_KARIR  (HTTP ' + k.status + ')');
    chk('judul', 'Probe Konten', kRow?.judul);
    chk('thumbnail', S.konten_thumbnail, kRow?.thumbnail);
    chk('kategori', S.konten_kategori, kRow?.kategori);
    chk('showOnHome', true, kRow?.showOnHome);

  } catch (e: any) {
    console.log('  ERROR: ' + e.message);
  } finally {
    // ── CLEANUP ────────────────────────────────────────────────────
    try {
      if (ids.beritaId) await prisma.berita.deleteMany({ where: { id: ids.beritaId } });
      if (ids.lowonganId) await prisma.lowongan.deleteMany({ where: { id: ids.lowonganId } });
      if (ids.kontenId) await prisma.kontenKarir.deleteMany({ where: { id: ids.kontenId } });
      if (ids.userId) await prisma.user.deleteMany({ where: { id: ids.userId } });
      const left = {
        b: await prisma.berita.count({ where: { id: { startsWith: 'probe_' } } }),
        l: await prisma.lowongan.count({ where: { id: { startsWith: 'probe_' } } }),
        k: await prisma.kontenKarir.count({ where: { id: { startsWith: 'probe_' } } }),
        u: await prisma.user.count({ where: { email: { startsWith: 'probe_admin_' } } }),
      };
      const clean = Object.values(left).every(v => v === 0);
      console.log(`\n  cleanup: ${clean ? 'BERSIH ✅' : 'MASIH ADA SISA ' + JSON.stringify(left)}`);
      // pastikan data produksi tidak tersentuh
      console.log(`  data asli: users=${await prisma.user.count()} beritas=${await prisma.berita.count()} lowongans=${await prisma.lowongan.count()} konten_karirs=${await prisma.kontenKarir.count()}`);
    } catch (e: any) {
      console.log('  cleanup GAGAL: ' + e.message);
    }
    await prisma.$disconnect();
  }
})();
