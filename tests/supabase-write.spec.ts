import { test, expect } from '@playwright/test';

/**
 * tests/supabase-write.spec.ts — Task 5 plan 100% Supabase.
 * Bukti write-through end-to-end tanpa selektor UI rapuh:
 * 1. login admin via API -> JWT
 * 2. POST /api/sync/lowongan row [E2E-VERIFY]
 * 3. GET /api/lowongan -> row ada (read-back)
 * 4. buka halaman publik '/' -> load OK (FE tidak crash dengan data baru)
 * 5. DELETE row dummy -> GET lagi -> row hilang
 */
test.describe('Supabase write-through (Task 5)', () => {
  test('admin tambah lowongan muncul setelah reload', async ({ page, request }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, 'Butuh env E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD');

    const stamp = Date.now();
    const dummyId = `e2e_verify_${stamp}`;

    const login = await request.post('/api/login', {
      data: { email, password }
    });
    expect(login.ok()).toBeTruthy();
    const { token } = await login.json();
    expect(token).toBeTruthy();
    const auth = { Authorization: `Bearer ${token}` };

    const sync = await request.post('/api/sync/lowongan', {
      headers: auth,
      data: {
        id: dummyId,
        judul: `[E2E-VERIFY-${stamp}] Lowongan bukti tulis`,
        tipe: 'kerja',
        namaInstansi: 'CDC UM Kendari (e2e)',
        lokasi: 'Kendari',
        deskripsi: 'Row dummy E2E, dihapus otomatis.',
        status: 'published'
      }
    });
    expect(sync.ok()).toBeTruthy();

    const list = await request.get('/api/lowongan', { headers: auth });
    expect(list.ok()).toBeTruthy();
    const rows = await list.json();
    const found = (Array.isArray(rows) ? rows : rows?.data || []).some((r: any) => r.id === dummyId);
    expect(found).toBeTruthy();

    // Halaman publik tetap load OK dengan data baru di DB
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible({ timeout: 20000 });

    // Bersihkan dummy, verifikasi hilang
    const del = await request.delete(`/api/lowongan/${dummyId}`, { headers: auth });
    expect(del.ok()).toBeTruthy();
    const list2 = await request.get('/api/lowongan', { headers: auth });
    const rows2 = await list2.json();
    const gone = !(Array.isArray(rows2) ? rows2 : rows2?.data || []).some((r: any) => r.id === dummyId);
    expect(gone).toBeTruthy();
  });
});
