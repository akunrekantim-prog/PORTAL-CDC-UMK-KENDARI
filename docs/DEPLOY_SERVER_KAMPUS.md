# Runbook: Deploy Portal CDC UM Kendari ke Server Kampus

> **Tujuan:** memindahkan aplikasi dari test bed (Supabase + Vercel) ke server kampus secara permanen.
> **Prasyarat:** Fase 1 selesai (commit `a5896d7`) — frontend satu origin dengan backend, `VITE_API_URL="/api"`.
>
> **Kunci utama:** karena `VITE_API_URL` sudah relative (`/api`), **tidak perlu rebuild** saat pindah.
> Build artifact yang sudah ditest di Vercel dipakai langsung di kampus. Yang berubah hanya
> konfigurasi infrastruktur (nginx + env), bukan kode.

---

## 0. Ringkasan Perubahan yang Diperlukan

| Komponen | Test bed (sekarang) | Server kampus |
|---|---|---|
| Database | Supabase PostgreSQL 17 | PostgreSQL lokal kampus |
| Frontend | Vercel (static) | `dist/` disajikan `server.js` |
| Routing `/api` | `vercel.json` rewrites | `nginx location /api` |
| RLS | aktif (bypassrls) | **dimatikan** — lihat Langkah 4 |
| Skema DB | `prisma db push` (tanpa jejak) | **`prisma migrate deploy`** |
| `VITE_SUPABASE_*` | dipakai (tidak oleh kode) | **dihapus** |

---

## 1. Prasyarat di Server Kampus

Verifikasi versi sebelum mulai:

```bash
node -v          # butuh >= 20 (diuji di v24.15.0)
npm -v
psql --version   # butuh >= 15 (sumber diuji di PostgreSQL 17.6)
nginx -v
```

Yang perlu dipasang: `nodejs`, `npm`, `postgresql`, `nginx`, `pm2` (atau pakai systemd).

```bash
sudo npm i -g pm2
```

> **Catatan PostgreSQL 17:** aplikasi diuji terhadap PostgreSQL 17.6. Versi lebih lama
> (14–16) umumnya aman, tapi jalankan Langkah 9 (verifikasi) untuk memastikan.

---

## 2. Siapkan Database & Role

> ⚠️ **JANGAN beri `BYPASSRLS` pada role aplikasi.** Ini justru yang diinginkan:
> kalau RLS masih aktif, aplikasi akan buta (lihat Langkah 4). RLS harus dimatikan dulu.

Masuk sebagai superuser postgres:

```bash
sudo -u postgres psql
```

```sql
CREATE ROLE portal_cdc LOGIN PASSWORD 'GANTI_DENGAN_PASSWORD_KUAT';
CREATE DATABASE portal_cdc OWNER portal_cdc;
GRANT ALL PRIVILEGES ON DATABASE portal_cdc TO portal_cdc;
\q
```

Simpan password di tempat aman (password manager kampus). Jangan tulis di repo.

---

## 3. Dump Data dari Supabase

Jalankan dari mesin yang punya akses ke Supabase (mis. laptop dev), **sebelum** Langkah 4.

```bash
# Ganti <SUPABASE_DATABASE_URL> dengan connection string dari Supabase Dashboard
# → Project Settings → Database → Connection string (Session mode, port 5432)
export SUPABASE_URL='<SUPABASE_DATABASE_URL>'

pg_dump "$SUPABASE_URL" \
  --no-owner --no-acl --clean --if-exists \
  -f /tmp/portal_cdc_backup.sql
```

**WAJIB:** catat jumlah baris tiap tabel SEBELUM migrasi, untuk dibandingkan di Langkah 9.

```bash
psql "$SUPABASE_URL" -c "
SELECT 'users' AS t, count(*) FROM users
UNION ALL SELECT 'mahasiswas', count(*) FROM mahasiswas
UNION ALL SELECT 'alumnis', count(*) FROM alumnis
UNION ALL SELECT 'mitras', count(*) FROM mitras
UNION ALL SELECT 'lowongans', count(*) FROM lowongans
UNION ALL SELECT 'beritas', count(*) FROM beritas
UNION ALL SELECT 'pengumumans', count(*) FROM pengumumans
UNION ALL SELECT 'hero_slides', count(*) FROM hero_slides
UNION ALL SELECT 'anggota_tims', count(*) FROM anggota_tims
UNION ALL SELECT 'galeri_items', count(*) FROM galeri_items
UNION ALL SELECT 'konten_karirs', count(*) FROM konten_karirs
UNION ALL SELECT 'kalender_kegiatans', count(*) FROM kalender_kegiatans
UNION ALL SELECT 'surat_keputusans', count(*) FROM surat_keputusans
UNION ALL SELECT 'laporan_kinerjas', count(*) FROM laporan_kinerjas
UNION ALL SELECT 'mou_stakeholders', count(*) FROM mou_stakeholders
ORDER BY t;" | tee /tmp/rowcount_sebelum.txt
```

> **Baseline 2026-09-14** (untuk referensi, sudah terverifikasi):
> users 11 · mahasiswas 3 · alumnis 2 · mitras 2 · lowongans 0 · beritas 11 ·
> pengumumans 2 · hero_slides 6 · anggota_tims 12 · galeri_items 4 ·
> konten_karirs 11 · kalender_kegiatans 3 · surat_keputusans 6 · laporan_kinerjas 3 ·
> mou_stakeholders 3

---

## 4. Matikan RLS Sebelum Restore  ⚠️ LANGKAH PALING KRITIS

**Kenapa:** Supabase punya `FORCE ROW LEVEL SECURITY` di `pengajuan_magangs`,
`tracer_studies`, dan `uploaded_documents`, dengan policy `auth.uid()::text = "userId"`.

- `auth.uid()` adalah fungsi Supabase (schema `auth`) yang **tidak ada** di PostgreSQL biasa.
- Bahkan di Supabase, `auth.uid()` mengembalikan **NULL** tanpa JWT PostgREST — dan
  `NULL = 'apapun'` bernilai NULL, bukan TRUE, sehingga **semua baris terfilter**.
- Selama ini tidak terasa karena role `postgres` punya `BYPASSRLS=true`. Role aplikasi
  kampus **tidak** akan punya `BYPASSRLS`.

**Akibatnya jika dilewati:** mahasiswa mengajukan magang → data **tersimpan** tapi **tidak
pernah terlihat**; tracer study & dokumen selalu kosong. Gejalanya menyesatkan
("sepertinya belum ada yang apply"), padahal data masuk.

**Solusi:** jalankan `docs/arsip-supabase/004_drop_rls.sql`.

**Sudah teruji:** 68/68 statement berhasil di PostgreSQL 17.6.
Sebelum 26 RLS / 3 FORCE RLS / 39 policy → sesudah 0 / 0 / 0.

Jalankan di database kampus **sebelum** restore dump (karena dump berisi definisi RLS):

```bash
psql "postgresql://portal_cdc:<PASSWORD>@localhost:5432/portal_cdc" \
  -f docs/arsip-supabase/004_drop_rls.sql
```

Verifikasi (ketiganya harus mengembalikan **0 baris**):

```bash
psql "postgresql://portal_cdc:<PASSWORD>@localhost:5432/portal_cdc" -c "
SELECT relname FROM pg_class WHERE relnamespace='public'::regnamespace
  AND relkind='r' AND relrowsecurity;
SELECT relname FROM pg_class WHERE relnamespace='public'::regnamespace
  AND relkind='r' AND relforcerowsecurity;
SELECT tablename, policyname FROM pg_policies WHERE schemaname='public';"
```

> **Trade-off yang disadari:** RLS yang dihapus **tidak sedang melindungi apa pun**
> (karena `BYPASSRLS`), jadi tidak ada penurunan keamanan nyata. Namun
> *defense-in-depth* di level database hilang — otorisasi sepenuhnya bergantung pada
> middleware `authenticateToken` di `server.js`. Karena itu: beri role aplikasi hak
> minimal, dan **ganti `JWT_SECRET`** (Langkah 7).
>
> **Alternatif bila defense-in-depth wajib dipertahankan:** jangan pakai `004_drop_rls.sql`.
> Ganti policy menjadi memakai variabel sesi sendiri
> (`current_setting('app.current_user_id', true)`) dan set nilainya di `server.js`
> dalam transaksi per-request (`SET LOCAL`). Lebih aman, tapi jauh lebih repot dirawat.

---

## 5. Restore Data ke Database Kampus

```bash
psql "postgresql://portal_cdc:<PASSWORD>@localhost:5432/portal_cdc" \
  -f /tmp/portal_cdc_backup.sql 2>&1 | tee /tmp/restore.log

# Cek error yang benar-benar fatal
grep -i "^ERROR" /tmp/restore.log | grep -vi "already exists" | head -20
```

> `ERROR: role "<nama>" does not exist` atau `already exists` biasanya aman karena
> dump memakai `--no-owner`. Yang berbahaya: `ERROR: relation ... does not exist`.

---

## 6. Terapkan Skema dengan Prisma Migrate

Repo kini punya `prisma/migrations/0_init/migration.sql` (baseline, 626 baris, 19 index).
Sebelumnya skema hanya dikelola via `prisma db push` tanpa jejak migrasi — itu berisiko
drift, dan sudah terbukti: **19 index di DB live tidak tercatat di `schema.prisma`**.

```bash
cd /var/www/portal-cdc
npm ci
npx prisma migrate deploy
```

Verifikasi:

```bash
npx prisma migrate status
```

Harus melaporkan `0_init` sebagai **applied**, tanpa peringatan drift.

Untuk memastikan 19 index benar-benar ada di database kampus:

```bash
psql "postgresql://portal_cdc:<PASSWORD>@localhost:5432/portal_cdc" -c "
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname='public' AND indexname LIKE 'idx_%' ORDER BY tablename, indexname;"
# Harus mengembalikan 19 baris
```

> **Catatan tentang 19 index:** index `idx_*` di DB dibuat lewat SQL manual dan kini
> sudah di-pin di `schema.prisma` dengan `map:` agar tidak dihapus saat migrasi.
> Dua di antaranya (`idx_beritas_created_at`, `idx_lowongans_created_at`) memakai
> `createdAt DESC` — dipertahankan lewat `sort: Desc`.
>
> Jika restore (Langkah 5) sudah membuat tabelnya, `migrate deploy` bisa bentrok.
> Dalam hal ini tandai baseline sebagai sudah diterapkan:
> ```bash
> npx prisma migrate resolve --applied 0_init
> ```

> ⚠️ **CHECK constraint TIDAK dikelola Prisma — jangan sampai hilang.**
> Prisma tidak bisa mengekspresikan `CHECK` di `schema.prisma`, dan
> `prisma migrate diff` **mengabaikannya** (melaporkan "empty migration" walau
> constraint ada di DB). Karena itu **22 CHECK** ditempel manual di akhir
> `prisma/migrations/0_init/migration.sql`, dengan sumber kebenaran di
> `docs/arsip-supabase/005_add_checks.sql`.
>
> Kalau baseline di-generate ulang (`migrate diff --from-empty`), blok CHECK itu
> **akan hilang** dan database kampus kehilangan seluruh validasi (status/enum,
> rentang skor survei 1..5, kategori dokumen, metode interview). Setelah
> regenerate, **tempel ulang** blok dari `005_add_checks.sql`.
>
> Verifikasi setelah migrasi (harus **22**, tanpa duplikat):
> ```bash
> psql "$DATABASE_URL" -c "
> SELECT count(*) FROM pg_constraint c
>   JOIN pg_class r ON r.oid=c.conrelid
>   JOIN pg_namespace n ON n.oid=r.relnamespace
>  WHERE n.nspname='public' AND c.contype='c';"
> ```
>
> **Jebakan case-sensitif:** nama constraint asli memakai camelCase
> (`alumnis_statusPekerjaan_check`), tapi PostgreSQL menurunkan identifier tanpa
> kutip menjadi lowercase. `DROP CONSTRAINT IF EXISTS` dengan nama camelCase
> TIDAK cocok dan menghasilkan **constraint duplikat**. `005_add_checks.sql`
> sudah menangani ini lewat perbandingan `lower(...) = lower(...)`.

---

## 7. Build & Konfigurasi Environment

```bash
cd /var/www/portal-cdc
npm ci
npm run build          # menghasilkan dist/
```

> ⚠️ **JEBAKAN ENV — `.env.production` TIDAK dibaca backend.**
> `server.js` memanggil `dotenv.config()` tanpa argumen, jadi ia **hanya** membaca
> `.env`. File `.env.production` hanya dipakai **Vite saat `npm run build`**
> (untuk variabel `VITE_*`). Kalau nilai produksi ditaruh di `.env.production`,
> backend tidak akan melihatnya dan diam-diam memakai default `development`.
>
> Jadi di server kampus: taruh konfigurasi backend di **`.env`** (atau set sebagai
> environment variable dari proses manager / systemd).
>
> Verifikasi setelah start: `curl -s localhost:5000/api/health` harus
> `{"status":"ok",...}`. Kalau `server.js` menolak start karena `JWT_SECRET`,
> berarti `.env` belum terbaca — itu pengaman yang disengaja.

Buat `.env` di server kampus:

```bash
NODE_ENV=production
PORT=5000

# Database lokal kampus
DATABASE_URL="postgresql://portal_cdc:***@localhost:5432/portal_cdc"
DIRECT_URL="postgresql://portal_cdc:***@localhost:5432/portal_cdc"

# WAJIB BARU — jangan pakai yang dari Supabase/Vercel.
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="<GENERATE_BARU_64_BYTE_HEX>"

# Origin frontend untuk whitelist CORS
FRONTEND_URL="https://portal-cdc.umkendari.ac.id"

# Frontend → backend. TETAP "/api" (relative). Jangan diganti URL absolut.
VITE_API_URL="/api"
```

> `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` **tidak perlu lagi** — `supabaseClient.ts`
> sudah dihapus di commit `a5896d7` dan tidak ada kode yang memakainya.

> ⚠️ `server.js` akan **`throw` dan gagal start** bila `NODE_ENV=production` tanpa
> `JWT_SECRET`. Itu pengaman yang disengaja.

---

## 8. Nginx + PM2

`/etc/nginx/sites-available/portal-cdc`:

```nginx
server {
    listen 443 ssl http2;
    server_name portal-cdc.umkendari.ac.id;

    ssl_certificate     /etc/ssl/certs/portal-cdc.crt;
    ssl_certificate_key /etc/ssl/private/portal-cdc.key;

    # Aset statis dilayani langsung nginx (lebih cepat dari Express)
    root /var/www/portal-cdc/dist;
    index index.html;

    client_max_body_size 5M;   # sesuaikan bila ada upload dokumen

    # /api diteruskan ke Express. INILAH yang mengarahkan API_BASE_URL="/api".
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback: deep link di-refresh tidak 404
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> **Catatan:** `server.js` juga sudah punya `express.static(dist)` + SPA fallback.
> Jadi ada dua lapis — keduanya aman. Kalau nginx melayani `dist/` langsung, Express
> hanya menangani `/api`. Ini konfigurasi yang direkomendasikan (nginx lebih efisien).

Jalankan aplikasi:

```bash
cd /var/www/portal-cdc
pm2 start server.js --name portal-cdc
pm2 save
pm2 startup     # ikuti instruksi yang muncul agar auto-start saat reboot

sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. Verifikasi Setelah Deploy

### 9a. Kesehatan dasar

```bash
curl -s https://portal-cdc.umkendari.ac.id/api/health
# Harus: {"status":"ok","database":"connected","userCount":<N>}

curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://portal-cdc.umkendari.ac.id/
# Harus: 200 text/html

curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://portal-cdc.umkendari.ac.id/berita
# Harus: 200 text/html (SPA fallback)
```

### 9b. Bandingkan jumlah baris dengan Langkah 3

```bash
psql "postgresql://portal_cdc:<PASSWORD>@localhost:5432/portal_cdc" -c "
SELECT 'users' AS t, count(*) FROM users
UNION ALL SELECT 'mahasiswas', count(*) FROM mahasiswas
UNION ALL SELECT 'beritas', count(*) FROM beritas
UNION ALL SELECT 'hero_slides', count(*) FROM hero_slides
ORDER BY t;"
```

Angka **harus sama** dengan `/tmp/rowcount_sebelum.txt`. Kalau tidak, restore tidak lengkap.

### 9c. Uji tulis (yang paling sering terlewat)

Baca saja tidak cukup — **RLS hanya memblokir jalur tertentu**, dan masalahnya baru
muncul saat menulis:

1. Login sebagai mahasiswa di browser kampus.
2. Ajukan magang (atau isi tracer study).
3. **Refresh halaman** — data harus masih ada.
4. Login sebagai admin → data pengajuan harus **terlihat**.

Kalau data hilang atau admin tidak melihatnya, RLS **belum** dimatikan. Ulangi Langkah 4.

### 9d. Cek cookie

```bash
curl -sI -X POST https://portal-cdc.umkendari.ac.id/api/logout | grep -i set-cookie
# Harus: HttpOnly; Secure; SameSite=Strict
```

`SameSite=Strict` **aman** karena frontend & backend satu origin. Kalau nanti dipisah
lagi, lihat catatan di `docs/superpowers/plans/2026-09-14-migrasi-server-kampus.md`
(Lampiran Opsi B) — cookie harus jadi `None` + `Secure`.

---

## 10. SETELAH MIGRASI BERHASIL

Checklist pembersihan:

- [ ] Hapus kredensial Supabase dari `.env` server kampus
- [ ] `npm uninstall @supabase/supabase-js` (satu-satunya pemakai sudah dihapus)
- [ ] Hapus `scripts/harden_rls.ts` — memakai Supabase Management API, tidak jalan di kampus
- [ ] Hapus `scripts/seed_supabase.ts` (digantikan seed lokal)
- [ ] Perbarui `SEED_PASSWORDS_README.md` — **isinya sudah usang**, password di sana
      tidak berlaku lagi (terverifikasi 2026-09-14). Dokumen yang salah lebih berbahaya
      daripada tidak ada dokumen.
- [ ] Nonaktifkan project Supabase & deployment Vercel setelah masa paralel selesai
- [ ] Simpan `/tmp/portal_cdc_backup.sql` + `/tmp/rowcount_sebelum.txt` sebagai arsip
- [ ] Jadwalkan backup harian PostgreSQL kampus (`pg_dump` via cron)
- [ ] Pastikan `JWT_SECRET` kampus **berbeda** dari test bed (semua token lama jadi invalid)

---

## 11. Rollback

Simpan sebelum cutover: `dist/` versi sebelumnya, `.env` lama, dan `portal_cdc_backup.sql`.

```bash
pm2 stop portal-cdc
# Restore database
psql "postgresql://portal_cdc:<PASSWORD>@localhost:5432/portal_cdc" \
  -f /tmp/portal_cdc_backup.sql
# Kembalikan dist/ + .env lama
pm2 start portal-cdc
```

Database kampus dan Supabase bisa berjalan paralel selama masa uji. Selama `VITE_API_URL`
tetap `/api`, berpindah antar backend cukup mengubah konfigurasi nginx — **tanpa rebuild**.

---

## 12. Diketahui Belum Selesai (bukan bagian migrasi ini)

1. **16 fungsi `save*` localStorage** — hero slides, statistik beranda, keanggotaan tim,
   konseling, campus hiring, job fair, visi-misi, helpdesk, CDC club, WA prestasi.
   Data ini **tidak akan ikut** ke server kampus karena disimpan di browser admin.
   Catatan: `hero_slides` SUDAH ada 6 baris di database, tapi UI membacanya dari
   localStorage — jadi **data terbelah dua**. Ini lubang terbesar yang tersisa.
2. **Gambar disimpan base64 di kolom database** (`canvas.toDataURL` → ~90–160 KB per
   gambar). Saat ini belum menggigit (DB cuma 12 MB), tapi akan membengkakkan database
   kampus. Rencana perbaikan: endpoint upload + simpan path.
3. **`lowongans` kosong** (0 baris) sementara UI menampilkan 7 lowongan contoh dari
   `DEFAULT_SEEDS` karena `src/data.ts` hanya menimpa data live bila `length > 0`.
   Perlu diputuskan: seed ulang atau perbaiki agar data kosong tidak ditutupi dummy.

---

## 13. Catatan Perawatan (WAJIB dibaca sebelum menambah field)

### Menambah field ke `schema.prisma` → update juga `SYNC_FIELDS` di `server.js`

`/api/sync/:entity` memakai **allowlist** `SYNC_FIELDS` (162 field, 16 entity).
Field yang tidak ada di allowlist **tidak akan tersimpan** — tapi API tetap
membalas `200 {success:true}`.

Ini pernah terjadi: **40 field di 8 entity hilang senyap** (aboutMe mahasiswa,
isPinned lowongan, viewCount berita, seluruh field interview pengajuan magang).
Tidak ada error, tidak ada log — hanya data yang tidak muncul.

**Sekarang sudah ada pengamannya:** respons sync menyertakan `ignoredFields` bila
ada field yang dikirim tapi tidak dikenal. Kalau `ignoredFields` muncul, berarti
`SYNC_FIELDS` perlu diperbarui.

Alur yang benar saat menambah field:
1. Tambahkan field ke model di `prisma/schema.prisma`
2. Tambahkan juga ke `SYNC_FIELDS` di `server.js` (pilih tipe: `string`, `text`,
   `number`, `boolean`, `stringArr`, `date`)
3. Kalau field itu non-nullable, tambahkan default-nya di `createDefaults()`
   — **hanya untuk CREATE**, jangan di jalur UPDATE (lihat komentar di fungsi itu)
4. Jalankan regression guard:
   ```bash
   npx tsx scripts/e2e_sync_fields.ts    # harus 53 PASS / 0 FAIL
   ```

> **Jangan** menaruh nilai default langsung ke objek `data`. Kalau `data` selalu
> diisi default, UPDATE akan mereset field yang tidak dikirim — misalnya lowongan
> `CLOSED` kembali `PUBLISHED`, pengajuan `DITERIMA` kembali `SUBMITTED`.
> Ini sempat terjadi (15 tempat) dan sudah diperbaiki lewat `createDefaults()`.
