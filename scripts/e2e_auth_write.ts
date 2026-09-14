/**
 * E2E TEST: alur auth + tulis data lewat API produksi (satu origin).
 *
 * Membuktikan: register -> (aktivasi admin) -> login -> write -> tersimpan di DB.
 * Semua lewat HTTP, bukan panggilan fungsi internal — jadi ini menguji jalur nyata.
 *
 * Jalankan: npx tsx scripts/e2e_auth_write.ts
 * Script membersihkan datanya sendiri di akhir (idak meninggalkan sampah).
 */
import { PrismaClient } from '@prisma/client';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000/api';
const prisma = new PrismaClient();

const STAMP = Date.now();
const EMAIL = `e2e_test_${STAMP}@umkendari.ac.id`;
const PASSWORD = 'E2eTest123!';
const NAME = `E2E Test ${STAMP}`;
const SENTINEL = `aboutme-e2e-${STAMP}`;   // ditulis lewat API, dibaca ulang dari DB

let pass = 0, fail = 0;
const ok = (label: string, extra = '') => { pass++; console.log(`  [PASS] ${label}${extra ? ' — ' + extra : ''}`); };
const no = (label: string, extra = '') => { fail++; console.log(`  [FAIL] ${label}${extra ? ' — ' + extra : ''}`); };

async function call(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  let body: any = null;
  const text = await res.text();
  try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
  return { status: res.status, body, headers: res.headers };
}

(async () => {
  console.log(`\n=== E2E TEST — ${BASE} ===`);
  const created: { userId?: string; mhsId?: string } = {};

  try {
    // ── 1. REGISTER ────────────────────────────────────────────────
    const reg = await call('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: NAME, email: EMAIL, password: PASSWORD, role: 'MAHASISWA', phone: '081200000000' })
    });
    if (reg.status === 201 && reg.body?.success) {
      ok('register', `HTTP 201, user id = ${reg.body.user?.id}`);
      created.userId = reg.body.user.id;
    } else {
      no('register', `HTTP ${reg.status} — ${JSON.stringify(reg.body).slice(0, 150)}`);
      throw new Error('register gagal — hentikan');
    }

    // ── 2. LOGIN SEBELUM AKTIVASI (harus DITOLAK) ──────────────────
    const early = await call('/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    early.status === 403
      ? ok('login akun PENDING ditolak', `HTTP 403 — ${early.body?.message}`)
      : no('login akun PENDING seharusnya 403', `dapat HTTP ${early.status}`);

    // ── 3. AKTIVASI (simulasi admin approve) ───────────────────────
    await prisma.user.update({ where: { id: created.userId }, data: { status: 'ACTIVE' } });
    ok('aktivasi akun (setup)', 'status -> ACTIVE');

    // ── 4. LOGIN ───────────────────────────────────────────────────
    const login = await call('/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    let token = '';
    if (login.status === 200 && login.body?.success && login.body?.token) {
      token = login.body.token;
      ok('login berhasil', `role = ${login.body.user?.role}, token ${token.length} char`);
    } else {
      no('login gagal', `HTTP ${login.status} — ${JSON.stringify(login.body).slice(0, 150)}`);
      throw new Error('login gagal — hentikan');
    }

    const setCookie = login.headers.get('set-cookie') || '';
    if (/HttpOnly/i.test(setCookie) && /SameSite/i.test(setCookie)) {
      const secure = /Secure/i.test(setCookie) ? 'Secure' : 'tanpa Secure';
      ok('cookie httpOnly diset', `${secure}, SameSite=${(setCookie.match(/SameSite=(\w+)/i) || [])[1]}`);
    } else {
      no('cookie httpOnly tidak terdeteksi', setCookie.slice(0, 120));
    }

    // ── 5. PASSWORD SALAH (harus 401) ──────────────────────────────
    const bad = await call('/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: 'SalahBanget123!' })
    });
    bad.status === 401
      ? ok('password salah ditolak', 'HTTP 401')
      : no('password salah seharusnya 401', `dapat HTTP ${bad.status}`);

    // ── 6. AKSES PRIVAT TANPA TOKEN (harus 401) ────────────────────
    const anon = await call('/all-data');
    anon.status === 401
      ? ok('/all-data tanpa token ditolak', 'HTTP 401')
      : no('/all-data tanpa token seharusnya 401', `dapat HTTP ${anon.status}`);

    // ── 7. AKSES PRIVAT DENGAN TOKEN (harus 200) ───────────────────
    const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const all = await call('/all-data', { headers: auth });
    if (all.status === 200 && Array.isArray(all.body?.users)) {
      ok('/all-data dengan token', `${all.body.users.length} users, ${all.body.mahasiswas?.length} mahasiswas`);
    } else {
      no('/all-data dengan token', `HTTP ${all.status} — ${JSON.stringify(all.body).slice(0, 150)}`);
    }

    // ── 8. WRITE: sinkron data mahasiswa sendiri ───────────────────
    const mhs = await prisma.mahasiswa.findFirst({ where: { userId: created.userId } });
    if (!mhs) throw new Error('mahasiswa tidak dibuat saat register');
    created.mhsId = mhs.id;

    const write = await call('/sync/mahasiswa', {
      method: 'POST', headers: auth,
      body: JSON.stringify({
        id: mhs.id, userId: created.userId, nim: mhs.nim, nama: mhs.nama, email: mhs.email,
        programStudi: 'Teknik Informatika', fakultas: 'Teknik', angkatan: '2024',
        semester: 6, alamat: 'Kendari', aboutMe: SENTINEL, skills: ['e2e', 'test']
      })
    });
    if (write.status === 200 && write.body?.success) {
      ok('write via /sync/mahasiswa', 'HTTP 200');
    } else {
      no('write via /sync/mahasiswa', `HTTP ${write.status} — ${JSON.stringify(write.body).slice(0, 150)}`);
    }

    // ── 9. VERIFIKASI DI DATABASE (bukan percaya respons API) ──────
    const readBack = await prisma.mahasiswa.findUnique({ where: { id: mhs.id } });
    readBack?.aboutMe === SENTINEL
      ? ok('data BENAR-BENAR tersimpan di DB', `aboutMe = "${readBack.aboutMe}"`)
      : no('data tidak tersimpan di DB', `aboutMe = "${readBack?.aboutMe}"`);

    (readBack?.skills || []).includes('e2e')
      ? ok('array skills tersimpan', JSON.stringify(readBack?.skills))
      : no('array skills tidak tersimpan', JSON.stringify(readBack?.skills));

    // ── 10. RBAC: user lain tidak boleh menulis data orang lain ────
    const other = await prisma.user.findFirst({
      where: { role: 'ADMIN', NOT: { id: created.userId } }, select: { id: true }
    });
    if (other) {
      const sneaky = await call('/sync/mahasiswa', {
        method: 'POST', headers: auth,
        body: JSON.stringify({ id: 'mhs_sneaky_probe', userId: other.id, nim: 'X', nama: 'X', email: 'x@x.com' })
      });
      sneaky.status === 403
        ? ok('RBAC: tolak tulis data user lain', 'HTTP 403')
        : no('RBAC: seharusnya 403', `dapat HTTP ${sneaky.status}`);
    }

    // ── 11. LOGOUT ─────────────────────────────────────────────────
    const out = await call('/logout', { method: 'POST', headers: auth });
    out.status === 200 ? ok('logout', 'HTTP 200') : no('logout', `HTTP ${out.status}`);

  } catch (e: any) {
    no('EXCEPTION', e.message);
  } finally {
    // ── CLEANUP: hapus data uji (FK cascade dari user) ─────────────
    try {
      if (created.userId) {
        await prisma.mahasiswa.deleteMany({ where: { userId: created.userId } });
        await prisma.alumni.deleteMany({ where: { userId: created.userId } });
        await prisma.user.delete({ where: { id: created.userId } });
        const gone = await prisma.user.findUnique({ where: { id: created.userId } });
        gone === null ? ok('cleanup', 'data uji terhapus') : no('cleanup', 'data uji masih ada');
      }
      const leftovers = await prisma.user.count({ where: { email: { startsWith: 'e2e_test_' } } });
      leftovers === 0 ? ok('tidak ada sisa data uji', '0 user e2e_test_*')
                      : no('masih ada sisa data uji', `${leftovers} user`);
    } catch (e: any) {
      no('cleanup gagal', e.message);
    }
    await prisma.$disconnect();
    console.log(`\n=== HASIL: ${pass} PASS, ${fail} FAIL ===\n`);
    process.exit(fail === 0 ? 0 : 1);
  }
})();
