# Rencana: Perbaiki Field Dibuang Senyap + CHECK Constraint Masuk Schema

> **Status:** ACC 2026-09-14 (Task 1–5)
> **Sumber temuan:** tes login end-to-end (`scripts/e2e_auth_write.ts`) yang menemukan
> 1 kegagalan, lalu membuka kotak Pandora.

---

## 1. Temuan Terkonfirmasi (dengan bukti)

| # | Temuan | Bukti | Status |
|---|---|---|---|
| 1 | **36 field dibuang senyap di 8 entity** | Probe HTTP → baca ulang dari DB | ✅ NYATA |
| 2 | `sumber` ditimpa jadi `"admin"`, bukan nilai kiriman | Probe | ✅ NYATA |
| 3 | **22 CHECK constraint tidak tercatat di schema** | `pg_constraint` (22 ada di DB, 0 di baseline) | ✅ PALING BERBAHAYA |
| 4 | ~~`konten_karir` HTTP 500~~ | Verifikasi ulang: `berita`/`workshop`/`presentasi` lowercase → 200 | ❌ **BUKAN BUG** — kesalahan tes (saya kirim `'BERITA'` uppercase) |

### Detail temuan 1 — field yang dibuang senyap

| Entity | Jumlah | Field |
|---|---|---|
| `konten_karir` | 10 | namaInstansi, tipe, linkLamar, kategori, gaji, kuota, deadline, thumbnail, scope, showOnHome |
| `lowongan` | 8 | imageUrl, flyer, sumber, linkEksternal, jenisPekerjaan, isPinned, kategori, kuota |
| `pengajuan_magang` | 7 | tanggalMulai, tanggalSelesai, interviewDate/Time/Method/Link/Location |
| `mahasiswa` | 4 | photoUrl, aboutMe, sendOpportunities, cvName |
| `mitra` | 2 | logoUrl, deskripsi |
| `berita` | 2 | kategori, viewCount |
| `kalender_kegiatan` | 2 | tanggalSelesai, warna |
| `mou_stakeholder` | 1 | berlakuHingga |

**Dampak nyata ke pengguna:**
- Mahasiswa isi "Tentang Saya" → hilang tanpa pesan error
- Admin pin lowongan (`isPinned`) → tidak tersimpan
- Poster lowongan (`imageUrl`/`flyer`) → hilang
- Penyempurnaan interview magang (tanggal/link/lokasi) → hilang
- `viewCount` berita tidak pernah naik
- `showOnHome` konten → tidak muncul di beranda

### Detail temuan 3 — CHECK constraint

Prisma **mengabaikan** CHECK constraint: `prisma migrate diff` melaporkan
*"This is an empty migration"* walau 22 CHECK ada di DB dan 0 di schema.
Konsekuensi: migrasi ke server kampus **kehilangan seluruh validasi data**
(rentang 1–5 survei, enum `statusPekerjaan`, `interviewMethod`, dll.).

Daftar constraint penting yang harus masuk schema:
`alumnis.statusPekerjaan`, `beritas.status`, `komentar_beritas.status`,
`konten_karirs.jenis/scope/status/tipe`, `lowongans.jenisPekerjaan`,
`lowongans.sumber`, `mou_stakeholders.status`, `pengajuan_magangs.interviewMethod`,
`pengajuan_magangs.interviewStatus`, `pengumumans.status`, `survei_lulusans.*` (5),
`tracer_studies.statusPekerjaan`, `uploaded_documents.category`,
`campus_hirings.status`, `job_fair_events.status`

---

## 2. Akar Masalah

`server.js` punya **13 handler sync**, **semuanya** memakai daftar field eksplisit
(`prisma.model.upsert({ update: { field1: ..., field2: ... } })`) — **0 handler** yang
memakai spread `...payload`.

Karena itu setiap kali model Prisma berkembang tanpa handler ikut diperbarui,
field baru **dibuang senyap**: API tetap membalas `200 {success:true}`.

Ini **bug sistemik**, bukan 8 kesalahan terpisah. Task 2 mengubah polanya supaya
tidak terulang.

---

## 3. File yang Disentuh

| File | Aksi |
|---|---|
| `server.js` | Perbaiki 8 handler + ganti pola ke allowlist dari schema |
| `prisma/schema.prisma` | Catatan konvensi case (CHECK tidak bisa diekspresikan Prisma) |
| `prisma/migrations/0_init/migration.sql` | Regenerate + tempel 22 CHECK |
| `supabase/migrations/004_add_checks.sql` (baru) | CHECK untuk DB Supabase yang sedang live |
| `scripts/e2e_auth_write.ts` | Perluas: 8 entity, assert setiap field bolak-balik |

---

## Task 1 — Lengkapi 8 handler sync

**Files:** `server.js`

Tambahkan field yang hilang ke `update` **dan** `create` untuk:
`mahasiswa`, `mitra`, `lowongan`, `pengajuan_magang`, `konten_karir`, `berita`,
`kalender_kegiatan`, `mou_stakeholder`.

Aturan: jaga `String(...).slice(...)` untuk teks, `!!` untuk boolean,
`Number.isFinite` untuk angka, `Array.isArray` untuk array — konsisten dengan
gaya yang sudah ada di file.

**Verifikasi:** probe HTTP→DB untuk 36 field harus melaporkan 0 "DIBUANG".

---

## Task 2 — Ganti pola ke allowlist yang diturunkan dari schema

**Files:** `server.js`

Masalah pola lama: menambah field ke model **tidak** otomatis tersimpan.
Pola baru: definisikan allowlist per model sekali, lalu bangun payload dari situ.

```js
// Sanitasi per tipe, dipakai semua handler.
const FIELD_RULES = {
  string:   (v, max = 200) => (v == null ? null : String(v).slice(0, max)),
  text:     (v, max = 20000) => (v == null ? null : String(v).slice(0, max)),
  number:   (v) => (Number.isFinite(Number(v)) ? Number(v) : null),
  boolean:  (v) => !!v,
  stringArr:(v) => (Array.isArray(v) ? v.slice(0, 50).map(String) : []),
  date:     (v) => (v ? new Date(v) : null),
};

// Satu tempat untuk mendefinisikan field yang boleh ditulis, per model.
const SYNC_FIELDS = {
  mahasiswa: {
    userId: 'string', nim: 'string', nama: 'string', email: 'string',
    phone: 'string', programStudi: 'string', fakultas: 'string',
    angkatan: 'string', semester: 'number', alamat: 'string',
    photoUrl: 'text', aboutMe: 'text', ipk: 'string',
    skills: 'stringArr', sendOpportunities: 'string', cvName: 'string',
  },
  // ... model lain
};
```

Handler menjadi seragam:
```js
function buildPayload(entity, payload) {
  const spec = SYNC_FIELDS[entity];
  const out = {};
  const ignored = [];
  for (const [k, v] of Object.entries(payload)) {
    if (k in spec) out[k] = FIELD_RULES[spec[k]](v);
    else if (!['id', 'createdAt', 'updatedAt'].includes(k)) ignored.push(k);
  }
  return { out, ignored };
}
```

**Plus:** laporkan `ignored` di respons sebagai `ignoredFields` (dev) atau
`console.warn` di produksi — supaya field tak dikenal **tidak lagi senyap**.

**Verifikasi:** `npx tsc --noEmit` + probe 8 entity + cek `ignoredFields` muncul
saat mengirim field ngawur.

---

## Task 3 — CHECK constraint masuk schema & migrasi

**Files:** `prisma/migrations/0_init/migration.sql`, `supabase/migrations/004_add_checks.sql`

Prisma tidak bisa mengekspresikan CHECK, jadi harus SQL manual.

1. Ekstrak 22 definisi dari DB (`pg_get_constraintdef`).
2. Tempel ke akhir `0_init/migration.sql` (untuk server kampus).
3. Buat `004_add_checks.sql` (untuk DB Supabase yang sedang live).
4. **Cek dulu** apakah ada data existing yang melanggar (kalau ada, migrasi gagal):

```sql
SELECT count(*) FROM alumni WHERE "statusPekerjaan" NOT IN
  ('bekerja','wirausaha','lanjut_studi','belum_bekerja');
-- ulangi untuk setiap constraint
```

5. Tambahkan komentar besar di `schema.prisma` + `0_init` bahwa CHECK **tidak**
   dikelola Prisma.

**Verifikasi:** `prisma migrate diff` tetap "empty migration" (0 drift),
dan `psql` pada DB salinan memunculkan 22 CHECK.

---

## Task 4 — Perluas E2E jadi regression guard

**Files:** `scripts/e2e_auth_write.ts`

Ubah dari 1 entity (`mahasiswa`) jadi **8 entity**, dan untuk setiap field yang
sebelumnya hilang: kirim sentinel → baca ulang dari DB → assert sama.

Ini yang seharusnya menangkap bug ini sejak awal. Tanpa test ini, bug bisa
kembali lagi tanpa ada yang sadar.

**Verifikasi:** jalankan → semua PASS.

---

## Task 5 — Verifikasi menyeluruh

1. Probe 36 field → **0 DIBUANG**
2. `npx tsc --noEmit` → 0 error
3. `npm run build` → sukses
4. `prisma migrate diff` → "empty migration" (0 drift)
5. `e2e_auth_write.ts` → semua PASS
6. Cek tidak ada data uji tersisa + data produksi utuh (11 users, 11 berita)

---

## Risiko

| Risiko | Mitigasi |
|---|---|
| Task 2 mengubah pola besar → regresi | Uji 8 entity lewat HTTP setelah perubahan |
| 22 CHECK menolak data lama → migrasi gagal | Cek pelanggaran dulu (Task 3 langkah 4) |
| CHECK tak terlihat Prisma → hilang lagi saat regenerate baseline | Komentar besar + item verifikasi di runbook |
| Perubahan `server.js` menyentuh kode auth | Uji ulang login/RBAC setelah perubahan |

---

## Yang TIDAK termasuk plan ini

- `FRONTEND_URL`, `NODE_ENV=production`, `vercel.json` → butuh domain/host dari Boss
- `dotenv.config()` hanya membaca `.env`, tidak `.env.production` → temuan terpisah
- 16 fungsi `save*` localStorage → plan terpisah (lubang terbesar yang tersisa)
