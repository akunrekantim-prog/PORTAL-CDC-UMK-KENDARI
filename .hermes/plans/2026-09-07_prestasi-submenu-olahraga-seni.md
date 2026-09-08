# Plan: Menu Prestasi — Tambah Sub-menu "Olahraga" & "Seni"

## Goal
Di dropdown menu **Prestasi** (Header), setiap tingkat (Internasional, Nasional, Wilayah)
yang saat ini hanya punya sub-menu **Akademik** dan **Non-Akademik**, ditambah 2 sub-menu
lagi: **Olahraga** dan **Seni**. Perilaku halaman, filter data, form admin, dan detail view
harus sama persis seperti sub-menu yang sudah ada (tanpa sub-menu bertingkat lagi).

Tab baru yang dihasilkan:
- `presentasi-{internasional|nasional|wilayah}-olahraga`
- `presentasi-{internasional|nasional|wilayah}-seni`

## Asumsi
- Nilai `subKategori` baru: `'olahraga'` dan `'seni'` (lowercase, konsisten dengan
  `'akademik'` / `'non-akademik'`).
- Data lama tanpa `subKategori` tetap fallback ke `'akademik'` (tidak berubah).
- Tidak ada perubahan backend/DB — `subKategori` disimpan sebagai string bebas di
  `konten_karir` (localStorage + sync), jadi hanya union type TypeScript yang perlu
  dilebarkan.

## Titik perubahan (hasil penelusuran kode)

| # | File | Lokasi | Perubahan |
|---|------|--------|-----------|
| 1 | `src/types.ts` | baris 135 | `subKategori?: 'akademik' \| 'non-akademik'` → tambah `\| 'olahraga' \| 'seni'` |
| 2 | `src/components/Header.tsx` | baris 112–133 (`NAV_ITEMS` id `presentasi`) | Tambah 2 child per tingkat: `{ label: 'Olahraga', tab: 'presentasi-<scope>-olahraga' }`, `{ label: 'Seni', tab: 'presentasi-<scope>-seni' }` (6 baris baru total) |
| 3 | `src/components/Header.tsx` | baris 216–217 (`getNavText` keyMap) | Tambah `'Olahraga': 'nav.olahraga'` dan `'Seni': 'nav.seni'` |
| 4 | `src/i18n.ts` | ~baris 40 (blok `id`) & ~baris 162 (blok `en`) | Tambah `'nav.olahraga'` / `'nav.seni'`: id → `'Olahraga'` / `'Seni'`, en → `'Sports'` / `'Arts'` |
| 5 | `src/components/PublicLayout.tsx` | baris 2072 | Parsing `currentKategori` dari tab: ganti ternary 2-cabang jadi deteksi 4 nilai (lihat kode di bawah) |
| 6 | `src/components/PublicLayout.tsx` | baris 2103 | `pageTitle`: pakai label map, bukan ternary `'Non-Akademik' : 'Akademik'` |
| 7 | `src/components/AdminDashboard.tsx` | baris 990 | Tipe state `eSubKategori` → union 4 nilai |
| 8 | `src/components/AdminDashboard.tsx` | baris 3850–3853 | Dropdown "Kategori *" form prestasi: tambah option Olahraga & Seni |
| 9 | `src/components/PrestasiDetailView.tsx` | baris 163 | `subCategoryDisplay`: ganti ternary jadi label map 4 nilai |

Tidak perlu diubah (sudah generik, hanya meneruskan nilai `subKategori` apa adanya):
- `Header.tsx` render dropdown desktop (baris 479–570) & drawer mobile — data-driven dari `NAV_ITEMS`.
- `Footer.tsx:72`, `JobDetail.tsx:723`, `PublicLayout.tsx:284` — template `presentasi-${kategori}-${subKategori}` otomatis benar.
- `PrestasiDetailView.tsx:177, 253` — bangun tab dari `prestasi.subKategori` langsung.
- Filter list prestasi `PublicLayout.tsx:2077–2081` — perbandingan string equality, tidak hardcode nilai.

## Langkah implementasi

### 1. types.ts
```ts
subKategori?: 'akademik' | 'non-akademik' | 'olahraga' | 'seni';
```

### 2. Header.tsx — NAV_ITEMS (contoh untuk Internasional; ulangi Nasional & Wilayah)
```tsx
{
  label: 'Internasional',
  children: [
    { label: 'Akademik', tab: 'presentasi-internasional-akademik' },
    { label: 'Non-Akademik', tab: 'presentasi-internasional-non-akademik' },
    { label: 'Olahraga', tab: 'presentasi-internasional-olahraga' },
    { label: 'Seni', tab: 'presentasi-internasional-seni' },
  ],
},
```
Lalu di `getNavText` keyMap tambah:
```tsx
'Olahraga': 'nav.olahraga',
'Seni': 'nav.seni',
```

### 3. i18n.ts
Blok `id` (setelah `'nav.nonakademik'`):
```ts
'nav.olahraga': 'Olahraga',
'nav.seni': 'Seni',
```
Blok `en`:
```ts
'nav.olahraga': 'Sports',
'nav.seni': 'Arts',
```

### 4. PublicLayout.tsx — parsing kategori (baris 2072)
```tsx
const currentKategori = currentTab.includes('non-akademik')
  ? 'non-akademik'
  : currentTab.includes('olahraga')
    ? 'olahraga'
    : currentTab.includes('seni')
      ? 'seni'
      : 'akademik';
```
Catatan urutan: `non-akademik` dicek lebih dulu (mengandung substring 'akademik');
'olahraga'/'seni' tidak bentrok dengan substring scope (`internasional`, `nasional`,
`wilayah`) maupun satu sama lain.

### 5. PublicLayout.tsx — pageTitle (baris 2103)
```tsx
const PRESTASI_SUB_LABELS: Record<string, string> = {
  akademik: 'Akademik',
  'non-akademik': 'Non-Akademik',
  olahraga: 'Olahraga',
  seni: 'Seni',
};
const pageTitle = `Prestasi ${currentScope.charAt(0).toUpperCase() + currentScope.slice(1)} (${PRESTASI_SUB_LABELS[currentKategori] ?? 'Akademik'})`;
```
(Map bisa didefinisikan sekali di module scope file, dipakai juga untuk deskripsi
"Menampilkan data prestasi ... di tingkat {scope} ({kategori})" di baris 2143 yang
sudah memakai `currentKategori` — label manusia perlu map yang sama.)

### 6. AdminDashboard.tsx
```tsx
// baris 990
const [eSubKategori, setESubKategori] = useState<'akademik' | 'non-akademik' | 'olahraga' | 'seni'>('akademik');
```
```tsx
// baris 3850–3853 options Dropdown "Kategori *"
options={[
  { value: 'akademik', label: 'Akademik' },
  { value: 'non-akademik', label: 'Non-Akademik' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'seni', label: 'Seni' },
]}
```
`setESubKategori(item.subKategori || 'akademik')` (baris 1217) dan penyimpanan
`subKategori: eJenis === 'presentasi' ? eSubKategori : undefined` (baris 1654)
tidak perlu diubah — sudah generik.

### 7. PrestasiDetailView.tsx (baris 163)
```tsx
const PRESTASI_SUB_LABELS: Record<string, string> = {
  akademik: 'Akademik', 'non-akademik': 'Non-Akademik', olahraga: 'Olahraga', seni: 'Seni',
};
const subCategoryDisplay =
  PRESTASI_SUB_LABELS[(prestasi.subKategori || 'akademik').toLowerCase()] ?? 'Akademik';
```

### 8. (Opsional — tanyakan ke Boss) Seed data contoh
Tambah 1–2 entri contoh `subKategori: 'olahraga'` dan `'seni'` di `src/data.ts`
(sekitar baris 1609+, pola `prest_00x`) supaya halaman baru tidak kosong saat demo.
Lewati jika data asli akan diinput lewat admin.

## Verifikasi
1. `npm run build` — TypeScript lolos (union type baru tidak bocor ke switch/case
   hardcode lain; grep `non-akademik` sudah dilakukan, hanya titik di atas yang hardcode).
2. Manual di browser:
   - Hover Prestasi → tiap tingkat menampilkan 4 sub-menu; klik Olahraga/Seni membuka
     halaman list dengan judul benar, mis. "Prestasi Internasional (Olahraga)".
   - Mobile drawer: sub-menu muncul & bisa diklik.
   - Admin → tambah/edit prestasi, dropdown Kategori punya 4 opsi; simpan sebagai
     Olahraga → kartu muncul hanya di tab Olahraga scope terkait.
   - Detail prestasi Olahraga/Seni: badge kategori benar, breadcrumb kembali ke tab
     yang benar, "Prestasi Terkait" tetap relevan.
   - EN toggle: label "Sports"/"Arts" muncul di nav.
3. Regresi: tab Akademik/Non-Akademik lama tidak berubah perilaku.

## Risiko
- Rendah. Perubahan murni perluasan enum + data-driven menu. Satu-satunya jebakan:
  urutan substring matching di parsing tab (`non-akademik` sebelum `akademik`) —
  sudah diperhatikan di langkah 4.
- Data existing di localStorage/supabase sync tidak disentuh; tidak ada migrasi.
