/**
 * scripts/verify_supabase_write.ts
 * Task 5 plan 100% Supabase: bukti COUNT +1 per write.
 * 1. login admin -> JWT
 * 2. COUNT lowongan via GET /api/lowongan
 * 3. POST /api/sync/lowongan 1 row dummy [VERIFY] (+berita sebagai entity konten ke-2)
 * 4. COUNT lagi -> harus +1
 * 5. DELETE row dummy -> COUNT kembali semula
 * 6. print PASS/FAIL per langkah, exit 1 kalau ada FAIL.
 *
 * Butuh: backend hidup (PORT default 5000), kredensial admin via env:
 *   VERIFY_ADMIN_EMAIL, VERIFY_ADMIN_PASSWORD
 * Opsional: API_BASE_URL (default http://localhost:5000)
 */
const API = process.env.API_BASE_URL || 'http://localhost:5000';
const EMAIL = process.env.VERIFY_ADMIN_EMAIL;
const PASSWORD = process.env.VERIFY_ADMIN_PASSWORD;

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures++;
}

async function api(path: string, token?: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((init?.headers as Record<string, string>) || {})
    }
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('FAIL - butuh env VERIFY_ADMIN_EMAIL + VERIFY_ADMIN_PASSWORD');
    process.exit(1);
  }

  // 0. health
  try {
    const h = await api('/api/health');
    check('backend /api/health hidup', h.status === 200);
  } catch (e: any) {
    check('backend /api/health hidup', false, e?.message);
    process.exit(1);
  }

  // 1. login admin
  let token = '';
  try {
    const { status, body } = await api('/api/login', undefined, {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const ok = status === 200 && body?.success && body?.token;
    check('login admin dapat JWT', ok, `status=${status}`);
    if (!ok) process.exit(1);
    token = body.token;
  } catch (e: any) {
    check('login admin dapat JWT', false, e?.message);
    process.exit(1);
  }

  // 2. COUNT awal lowongan
  const countLowongan = async (): Promise<number> => {
    const { body } = await api('/api/lowongan', token);
    const rows = Array.isArray(body) ? body : body?.data || [];
    return rows.length;
  };
  const before = await countLowongan();
  console.log(`INFO - COUNT lowongan awal: ${before}`);

  // 3. POST sync lowongan dummy
  const stamp = Date.now();
  const dummyId = `verify_${stamp}`;
  const syncRes = await api('/api/sync/lowongan', token, {
    method: 'POST',
    body: JSON.stringify({
      id: dummyId,
      mitraId: null,
      judul: `[VERIFY] Lowongan bukti tulis ${stamp}`,
      tipe: 'kerja',
      namaInstansi: 'CDC UM Kendari (verify)',
      lokasi: 'Kendari',
      deskripsi: 'Row dummy verifikasi Task 5, dihapus otomatis.',
      status: 'draft'
    })
  });
  check('POST /api/sync/lowongan 200', syncRes.status === 200, `status=${syncRes.status}`);

  // 4. COUNT harus +1
  const after = await countLowongan();
  check('COUNT lowongan +1 setelah sync', after === before + 1, `before=${before} after=${after}`);

  // 4b. entity konten ke-2: berita (jalur baru Task 1)
  const syncBerita = await api('/api/sync/berita', token, {
    method: 'POST',
    body: JSON.stringify({
      slug: `verify-berita-${stamp}`,
      title: `[VERIFY] Berita bukti tulis ${stamp}`,
      content: 'Konten dummy verifikasi Task 5.',
      status: 'draft'
    })
  });
  check('POST /api/sync/berita 200 (jalur baru Task 1)', syncBerita.status === 200, `status=${syncBerita.status}`);
  await api(`/api/berita/verify-berita-${stamp}`, token, { method: 'DELETE' });

  // 5. DELETE dummy -> COUNT kembali
  const del = await api(`/api/lowongan/${dummyId}`, token, { method: 'DELETE' });
  check('DELETE row dummy 200', del.status === 200, `status=${del.status}`);
  const restored = await countLowongan();
  check('COUNT kembali semula setelah delete', restored === before, `before=${before} restored=${restored}`);

  console.log(failures === 0 ? '\nSEMUA VERIFIKASI PASS' : `\n${failures} VERIFIKASI FAIL`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
