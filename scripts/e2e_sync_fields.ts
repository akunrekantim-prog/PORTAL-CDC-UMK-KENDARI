/**
 * E2E REGRESSION GUARD — field yang dulu dibuang senyap oleh /api/sync/*.
 *
 * Latar: 40 field di 8 entity pernah hilang tanpa error — API membalas
 * 200 {success:true} padahal nilainya tidak tersimpan (aboutMe, isPinned,
 * viewCount, seluruh field interview pengajuan magang, dst).
 *
 * Test ini mengirim sentinel lewat HTTP, lalu MEMBACA ULANG dari database.
 * Kalau API bilang sukses tapi nilai tidak berubah, test GAGAL.
 *
 * Jalankan: npx tsx scripts/e2e_sync_fields.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000/api';
const prisma = new PrismaClient();
const STAMP = Date.now();
const S = (t: string) => `${t}-${STAMP}`;

let pass = 0, fail = 0;
const ok = (m: string) => { pass++; console.log(`  [PASS] ${m}`); };
const no = (m: string) => { fail++; console.log(`  [FAIL] ${m}`); };

async function call(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const t = await res.text();
  let b: any; try { b = JSON.parse(t); } catch { b = t.slice(0, 150); }
  return { status: res.status, body: b };
}

/** Kirim field, baca ulang dari DB, bandingkan. */
async function checkField(
  label: string, sent: any, actual: any, opts: { warn?: string } = {}
) {
  const same = JSON.stringify(sent) === JSON.stringify(actual);
  if (same) ok(`${label} = ${JSON.stringify(sent)}`);
  else no(`${label}: kirim ${JSON.stringify(sent)} tapi DB ${JSON.stringify(actual)}${opts.warn ? ' — ' + opts.warn : ''}`);
}

(async () => {
  console.log(`\n=== E2E SYNC FIELDS (regression guard) — ${BASE} ===\n`);
  const U = `e2e_sf_${STAMP}`;
  const made = { user: '', mhs: '', mitra: '', low: '', peng: '', kk: '', berita: '', kal: '', mou: '' };

  try {
    // ── setup: admin + login ──────────────────────────────────────
    const email = `${U}@umkendari.ac.id`;
    made.user = U;
    await prisma.user.create({
      data: { id: U, name: 'E2E SF', email, password: await bcrypt.hash('E2eTest123!', 10), role: 'ADMIN', status: 'ACTIVE' }
    });
    const lr = await call('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'E2eTest123!' }) });
    if (lr.status !== 200) throw new Error(`login gagal HTTP ${lr.status}`);
    const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${lr.body.token}` };

    // ── MHS: buat lewat DB, uji update via API (field yang dulu hilang) ──
    made.mhs = `mhs_${U}`;
    await prisma.mahasiswa.create({ data: {
      id: made.mhs, userId: U, nim: `NIM${STAMP}`, nama: 'E2E Mhs',
      email, programStudi: '-', fakultas: '-', angkatan: '' } });

    const mhsSent = { id: made.mhs, userId: U, nim: `NIM${STAMP}`, nama: 'E2E Mhs', email,
      programStudi: 'Informatika', fakultas: 'Teknik', angkatan: '2024', semester: 6,
      alamat: S('alamat'), photoUrl: S('foto'), aboutMe: S('tentang'),
      ipk: '3.75', skills: ['a', 'b'], sendOpportunities: S('kirim'), cvName: S('cv') };
    let r = await call('/sync/mahasiswa', { method: 'POST', headers: auth, body: JSON.stringify(mhsSent) });
    let row: any = await prisma.mahasiswa.findUnique({ where: { id: made.mhs } });
    if (r.status === 200) ok('mahasiswa: HTTP 200'); else no(`mahasiswa: HTTP ${r.status}`);
    for (const k of ['aboutMe', 'photoUrl', 'sendOpportunities', 'cvName', 'ipk', 'semester'])
      await checkField(`mahasiswa.${k}`, (mhsSent as any)[k], row?.[k]);
    await checkField('mahasiswa.skills', mhsSent.skills, row?.skills);

    // ── MITRA ─────────────────────────────────────────────────────
    made.mitra = `mtr_${U}`;
    await prisma.mitra.create({ data: { id: made.mitra, userId: U, namaInstansi: 'E2E', kontakPerson: 'x', email } });
    r = await call('/sync/mitra', { method: 'POST', headers: auth, body: JSON.stringify({
      id: made.mitra, userId: U, namaInstansi: S('inst'), kontakPerson: 'PIC', email,
      bidangIndustri: 'IT', alamat: S('almt'), phone: '0812', website: S('web'),
      logoUrl: S('logo'), deskripsi: S('desk'), statusKerjaSama: 'AKTIF' }) });
    row = await prisma.mitra.findUnique({ where: { id: made.mitra } });
    if (r.status === 200) ok('mitra: HTTP 200'); else no(`mitra: HTTP ${r.status}`);
    const mitraExp: Record<string, any> = {
      logoUrl: S('logo'), deskripsi: S('desk'), bidangIndustri: 'IT', website: S('web')
    };
    for (const k of Object.keys(mitraExp))
      await checkField(`mitra.${k}`, mitraExp[k], row?.[k]);

    // ── LOWONGAN (11 field dulu hilang) ───────────────────────────
    made.low = `low_${U}`;
    const lowSent = { id: made.low, createdBy: U, judul: S('judul-low'), tipe: 'KERJA',
      namaInstansi: 'Inst', lokasi: 'Kendari', status: 'PUBLISHED',
      imageUrl: S('img'), flyer: S('flyer'), sumber: 'admin', jenisPekerjaan: 'full-time',
      isPinned: true, kategori: S('kat'), kuota: 5, linkEksternal: S('link'),
      kualifikasi: ['S1'], benefit: ['BPJS'], deadline: new Date(Date.now() + 864e5).toISOString() };
    r = await call('/sync/lowongan', { method: 'POST', headers: auth, body: JSON.stringify(lowSent) });
    row = await prisma.lowongan.findUnique({ where: { id: made.low } });
    if (r.status === 200) ok('lowongan: HTTP 200'); else no(`lowongan: HTTP ${r.status} ${JSON.stringify(r.body).slice(0,100)}`);
    if (row) {
      for (const k of ['imageUrl', 'flyer', 'sumber', 'jenisPekerjaan', 'kategori', 'linkEksternal'])
        await checkField(`lowongan.${k}`, (lowSent as any)[k], row[k]);
      await checkField('lowongan.isPinned', true, row.isPinned);
      await checkField('lowongan.kuota', 5, row.kuota);
      await checkField('lowongan.kualifikasi', ['S1'], row.kualifikasi);
    } else no('lowongan tidak terbuat');

    // ── KONTEN_KARIR (10 field dulu hilang) ───────────────────────
    made.kk = `kk_${U}`;
    const kkSent = { id: made.kk, jenis: 'berita', judul: S('judul-kk'), body: S('body'),
      penulis: 'Admin', namaInstansi: S('inst-kk'), tipe: 'magang', linkLamar: S('lamar'),
      kategori: S('kat-kk'), gaji: S('gaji'), kuota: 3, thumbnail: S('thumb'),
      scope: 'NASIONAL', status: 'published', showOnHome: true,
      deadline: new Date(Date.now() + 864e5).toISOString() };
    r = await call('/sync/konten_karir', { method: 'POST', headers: auth, body: JSON.stringify(kkSent) });
    row = await prisma.kontenKarir.findUnique({ where: { id: made.kk } });
    if (r.status === 200) ok('konten_karir: HTTP 200'); else no(`konten_karir: HTTP ${r.status} ${JSON.stringify(r.body).slice(0,100)}`);
    if (row) {
      for (const k of ['namaInstansi', 'tipe', 'linkLamar', 'kategori', 'gaji', 'thumbnail', 'scope'])
        await checkField(`konten_karir.${k}`, (kkSent as any)[k], row[k]);
      await checkField('konten_karir.kuota', 3, row.kuota);
      await checkField('konten_karir.showOnHome', true, row.showOnHome);
    } else no('konten_karir tidak terbuat');

    // ── BERITA (kategori, tags, viewCount) ────────────────────────
    made.berita = `brt_${U}`;
    const brSent = { id: made.berita, judul: S('judul-brt'), slug: `e2e-${STAMP}`, body: S('body'),
      kategori: S('kat-brt'), tags: ['e2e', 'uji'], viewCount: 777, status: 'published', penulis: 'Admin' };
    r = await call('/sync/berita', { method: 'POST', headers: auth, body: JSON.stringify(brSent) });
    row = await prisma.berita.findUnique({ where: { id: made.berita } });
    if (r.status === 200) ok('berita: HTTP 200'); else no(`berita: HTTP ${r.status}`);
    if (row) {
      await checkField('berita.kategori', S('kat-brt'), row.kategori);
      await checkField('berita.tags', ['e2e', 'uji'], row.tags);
      await checkField('berita.viewCount', 777, row.viewCount);
    } else no('berita tidak terbuat');

    // ── KALENDER (tanggalSelesai, warna) ──────────────────────────
    made.kal = `kal_${U}`;
    const kalSent = { id: made.kal, judul: S('judul-kal'), deskripsi: S('desk-kal'),
      tanggalMulai: new Date().toISOString(), tanggalSelesai: new Date(Date.now() + 864e5).toISOString(),
      lokasi: 'Aula', kategori: S('kat-kal'), warna: '#ff0000' };
    r = await call('/sync/kalender_kegiatan', { method: 'POST', headers: auth, body: JSON.stringify(kalSent) });
    row = await prisma.kalenderKegiatan.findUnique({ where: { id: made.kal } });
    if (r.status === 200) ok('kalender_kegiatan: HTTP 200'); else no(`kalender: HTTP ${r.status}`);
    if (row) {
      await checkField('kalender.warna', '#ff0000', row.warna);
      (row.tanggalSelesai !== null) ? ok('kalender.tanggalSelesai tersimpan') : no('kalender.tanggalSelesai null');
    } else no('kalender tidak terbuat');

    // ── MOU (berlakuHingga) ───────────────────────────────────────
    made.mou = `mou_${U}`;
    const mouSent = { id: made.mou, namaInstansi: S('inst-mou'), jenisMou: 'MoU',
      tanggalMou: new Date().toISOString(), berlakuHingga: new Date(Date.now() + 31536e6).toISOString(),
      status: 'aktif', logoUrl: S('logo-mou') };
    r = await call('/sync/mou_stakeholder', { method: 'POST', headers: auth, body: JSON.stringify(mouSent) });
    row = await prisma.mouStakeholder.findUnique({ where: { id: made.mou } });
    if (r.status === 200) ok('mou_stakeholder: HTTP 200'); else no(`mou: HTTP ${r.status}`);
    if (row) {
      (row.berlakuHingga !== null) ? ok('mou.berlakuHingga tersimpan') : no('mou.berlakuHingga null');
      await checkField('mou.logoUrl', S('logo-mou'), row.logoUrl);
    } else no('mou tidak terbuat');

    // ── PENGAJUAN_MAGANG (7 field interview) ──────────────────────
    made.peng = `peng_${U}`;
    const pengSent = { id: made.peng, mahasiswaId: made.mhs, userId: U, namaMahasiswa: 'E2E Mhs',
      nim: `NIM${STAMP}`, programStudi: 'Informatika', tujuanMagang: S('tujuan'),
      tanggalMulai: new Date().toISOString(), tanggalSelesai: new Date(Date.now() + 2 * 864e5).toISOString(),
      interviewStatus: 'scheduled', interviewDate: new Date().toISOString(),
      interviewTime: '09:00', interviewMethod: 'online', interviewLink: S('meet'),
      interviewLocation: 'Ruang CDC', status: 'INTERVIEW' };
    r = await call('/sync/pengajuan_magang', { method: 'POST', headers: auth, body: JSON.stringify(pengSent) });
    row = await prisma.pengajuanMagang.findUnique({ where: { id: made.peng } });
    if (r.status === 200) ok('pengajuan_magang: HTTP 200'); else no(`pengajuan: HTTP ${r.status} ${JSON.stringify(r.body).slice(0,100)}`);
    if (row) {
      for (const k of ['interviewStatus', 'interviewTime', 'interviewMethod', 'interviewLink', 'interviewLocation'])
        await checkField(`pengajuan.${k}`, (pengSent as any)[k], row[k]);
      (row.tanggalMulai !== null) ? ok('pengajuan.tanggalMulai tersimpan') : no('pengajuan.tanggalMulai null');
      (row.tanggalSelesai !== null) ? ok('pengajuan.tanggalSelesai tersimpan') : no('pengajuan.tanggalSelesai null');
      (row.interviewDate !== null) ? ok('pengajuan.interviewDate tersimpan') : no('pengajuan.interviewDate null');
    } else no('pengajuan tidak terbuat');

  } catch (e: any) {
    no('EXCEPTION: ' + e.message);
  } finally {
    // ── CLEANUP berurutan (hormati FK) ────────────────────────────
    try {
      if (made.peng) await prisma.pengajuanMagang.deleteMany({ where: { id: made.peng } });
      if (made.kk) await prisma.kontenKarir.deleteMany({ where: { id: made.kk } });
      if (made.berita) await prisma.berita.deleteMany({ where: { id: made.berita } });
      if (made.low) await prisma.lowongan.deleteMany({ where: { id: made.low } });
      if (made.kal) await prisma.kalenderKegiatan.deleteMany({ where: { id: made.kal } });
      if (made.mou) await prisma.mouStakeholder.deleteMany({ where: { id: made.mou } });
      if (made.mhs) await prisma.mahasiswa.deleteMany({ where: { id: made.mhs } });
      if (made.mitra) await prisma.mitra.deleteMany({ where: { id: made.mitra } });
      if (made.user) await prisma.user.deleteMany({ where: { id: made.user } });
      const sisa = await prisma.user.count({ where: { email: { startsWith: 'e2e_sf_' } } });
      sisa === 0 ? ok('cleanup bersih') : no(`sisa ${sisa} data uji`);
      console.log(`\n  data produksi: users=${await prisma.user.count()} beritas=${await prisma.berita.count()} lowongans=${await prisma.lowongan.count()} konten_karirs=${await prisma.kontenKarir.count()} hero_slides=${await prisma.heroSlide.count()}`);
    } catch (e: any) { no('cleanup gagal: ' + e.message); }
    await prisma.$disconnect();
    console.log(`\n=== HASIL: ${pass} PASS, ${fail} FAIL ===\n`);
    process.exit(fail === 0 ? 0 : 1);
  }
})();
