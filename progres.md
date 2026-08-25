# Progres Pengerjaan — Portal CDC UM Kendari

Periode: 23–25 Agustus 2026  
Branch: `main`  
Repo: `D:\PORTAL-CDC-UMK-KENDARI`

---

## Tanggal: 25 Agustus 2026
**Oleh: Developer Fachrul Alam Sanuddin**
**Fokus Pekerjaan:** Fitur Multi-Bahasa / Dual Language (Bahasa Indonesia 🇮🇩 & English 🇬🇧), Switcher Bendera di Top Bar Header, Terjemahan Kamus Navigasi & Konten Layanan, serta Optimalisasi Aset SVG Publik.

### Ringkasan Perubahan
1. **Sistem Multi-Bahasa / i18n (`src/i18n.ts` - BARU):**
   - Membuat sistem manajemen bahasa `i18n` (custom hook `useLanguage`, helper `t()`, `setLanguage()`, dan `translateContent()`).
   - Menyediakan kamus terjemahan lengkap (Bahasa Indonesia 🇮🇩 & English 🇬🇧) untuk seluruh navigasi header, sub-menu profil/layanan/tracer study, tombol interaktif, dan footer.
   - Menyediakan kamus terjemahan narasi dinamis (`NARRATIVE_TRANSLATIONS`) untuk frasa admin, status jadwal konseling karir, nama hari, dan dokumen resmi (SK, MoU, Laporan Kinerja).
   - Menyimpan preferensi bahasa user di `localStorage` (`cdc_language`) dan melakukan sync real-time via event listener.
2. **Redesign Switcher Bahasa Dropdown Header (`src/components/Header.tsx`):**
   - Mengubah 2 tombol *pill* lama menjadi **Dropdown Select Box Biru Header** (`#10006b`) dengan aksen teks **Kuning Gold (`EN`/`ID`)** dan panah segitiga kebawah (`▼`), persis sesuai acuan desain gambar referensi.
   - **Styling Background & Hover**: Latar belakang default menyatu mulus dengan warna biru Top Bar Header (`#10006b`), dan berubah menjadi **Putih Solid (`bg-white`)** dengan teks biru navy (`#10006b`) saat kursor diarahkan (*hover*).
   - Menggunakan aset gambar PNG bendera asli (`/logo bendera indo.png` + `"ID"` & `/logo bendera inggris.png` + `"EN"`) baik pada trigger button maupun pop-up menu dropdown.
   - **Circular Alpha Masking**: Memproses kedua aset bendera (`logo bendera indo.png` & `logo bendera inggris.png`) berbentuk lingkaran presisi — warna asli di dalam bundaran bendera (termasuk separuh putih bendera Indonesia dan detail putih Inggris) dikembalikan 100% utuh, hanya area di luar lingkaran bundar yang dijadikan 100% transparan (Alpha RGBA).
   - Pop-up menu melayang (*floating dropdown*) memuat pilihan `EN` dan `ID` berlatar putih bersih dengan penanda status aktif dan listener *click-outside* otomatis.
   - Mengintegrasikan fungsi terjemahan dinamis pada seluruh menu navigasi, top links, dan penanggalan header (menyesuaikan format `id-ID` atau `en-US`).
3. **Integrasi i18n di Seluruh Layout & Komponen Publik:**
   - **`Footer.tsx` & `PublicLayout.tsx`**: Pembaruan **POPULAR INFO** & **INFO LOKER TERKINI** di widget Beranda dan Footer — memastikan seluruh klik pada judul **langsung mengarahkan ke Halaman Detail Narasi & Deskripsi Lengkap** (Berita, Event/Seminar/Workshop, Prestasi, Program, Lowongan Kerja) secara instan tanpa terhapus state-nya.
   - **`HeroSlider.tsx`**: Terjemahan teks banner slider, badge promosi, dan tombol CTA.
   - **`JobSearchMasterDetail.tsx`**: Terjemahan placeholder pencarian lowongan, filter lokasi, filter spesialisasi, dan tombol aksi.
   - **`EventCardLayout.tsx` & `PublicLayout.tsx`**: Penyempurnaan alur & pencocokan data **Popular Info** (Beranda & Footer) — memastikan setiap kali item program Layanan (Workshop, Softskill, Seminar) diklik dari Popular Info, sistem **100% langsung membuka Halaman Detail Event yang berisi deskripsi acara lengkap**.
   - **`BimbinganKarir.tsx`**: Terjemahan visual header, tabel jadwal konseling karir, status kuota, dan tombol CTA WhatsApp.
   - **`data.ts`**: Penyesuaian seed data dan helper untuk mendukung terjemahan multi-bahasa.
4. **Optimalisasi & Perapihan Aset SVG Publik (`public/`):**
   - Mengoptimalkan penamaan dan ukuran aset SVG (`sambutan_rektor_2MB_final.svg`, `KREATIVITAS_DAN_INOVASI_900KB.svg`, `PENGEMBANGAN_KARIR_900KB.svg`).

### File Diubah & Ditambah
- **[BARU]** `src/i18n.ts`
- **[MODIFY]** `src/components/Header.tsx`
- **[MODIFY]** `src/components/Footer.tsx`
- **[MODIFY]** `src/components/HeroSlider.tsx`
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx`
- **[MODIFY]** `src/components/PublicLayout.tsx`
- **[MODIFY]** `src/components/layanan/BimbinganKarir.tsx`
- **[MODIFY]** `src/data.ts`
- **[MODIFY]** `progres.md`
- **[ASET]** `public/sambutan_rektor_2MB_final.svg`, `public/KREATIVITAS_DAN_INOVASI_900KB.svg`, `public/PENGEMBANGAN_KARIR_900KB.svg`

### Verifikasi
- ✅ `npx tsc --noEmit` — 0 error
- ✅ Visual & Switcher Check: Pengantian bahasa 🇮🇩 ID ↔ 🇬🇧 EN berjalan instan dan mulus pada seluruh menu header, slider, lowongan, layanan bimbingan karir, dan footer.

---

## Tanggal: 24 Agustus 2026 (Sesi Arya — 2)
**Oleh: ARYA APRIAWAN**
**Fokus Pekerjaan:** Audit Integrasi Admin Menu Layanan, Konfirmasi Ketetapan Tes Potensi Minat Kerja, dan Pembersihan File Orphan Sisa Menu Layanan Lama.

### Ringkasan Perubahan
1. **Audit Integrasi Admin Seluruh Menu Layanan (7/8 terintegrasi penuh):**
   - ✅ Workshop / Softskill / Seminar → via Konten Karir → Pembuatan Konten (jenis workshop/softskill/seminar).
   - ✅ Job Fair → tab admin "Job Fair" (`saveJobFair`).
   - ✅ Campus Hiring → tab admin "Campus Hiring" (`saveCampusHiring`).
   - ✅ Konseling Karir → tab admin "Bimbingan & Konseling" (`saveKonselingConfig`).
   - ✅ Internship/Magang → Form Lowongan (tipe: magang).
   - Dengan ketetapan **Tes Potensi Minat Kerja dikecualikan** (link Klob Meter bersifat tetap), seluruh menu Layanan kini 100% terintegrasi admin.
2. **Penghapusan File Orphan Menu Layanan Lama (4 file):**
   - `CaraPasang.tsx`, `ExitSurvey.tsx`, `JobPlacement.tsx`, `BursaKerja.tsx` — terverifikasi **0 referensi** (tidak dirender di PublicLayout, tidak terdaftar di Header/MegaMenu/LAYANAN_MENU).
   - Isi Bursa Kerja telah terwakili oleh Job Fair & Campus Hiring.
   - Hasil: menu Layanan final 8 item — Campus Hiring, Konseling Karir, Tes Potensi Minat Kerja, Workshop, Softskill, Seminar, Job Fair, Internship.

### File Diubah
- **[DELETE]** `src/components/layanan/CaraPasang.tsx`
- **[DELETE]** `src/components/layanan/ExitSurvey.tsx`
- **[DELETE]** `src/components/layanan/JobPlacement.tsx`
- **[DELETE]** `src/components/layanan/BursaKerja.tsx`

### Verifikasi
- ✅ `npx tsc --noEmit` — 0 error terkait file yang dihapus
- ✅ `npm run build` — passed (✓ built in ~16s)

---

## Tanggal: 24 Agustus 2026 (Sesi Arya)
**Oleh: ARYA APRIAWAN**
**Fokus Pekerjaan:** Perombakan Card Layout & Halaman Detail Menu Layanan (Job Fair, Campus Hiring, Workshop/Softskill/Seminar), Penghapusan Box Gradient PageHeader Seluruh Menu Layanan, Sorting Otomatis Terbaru, dan Animasi Scroll Masuk Card.

### Ringkasan Perubahan
1. **Penghapusan Dropdown Sort Terbaru/Terlama (`EventCardLayout.tsx`):**
   - Dropdown urutkan (Terbaru/Terlama/A-Z/Z-A) dihapus dari control panel; urutan default otomatis **Terbaru**.
   - Search input melebar (8 kolom) dan filter Periode/Tahun menjadi 4 kolom.
2. **Logic Sorting Anti-Kebalik (`EventCardLayout.tsx`, `src/types.ts`):**
   - Field baru `uploadedAt?: string` pada `EventLayananItem`.
   - Sorting: tanggal kegiatan utama, tie-breaker waktu upload (`createdAt`) — konten yang baru diupload admin dijamin tampil paling atas meski tanggal event seri.
3. **Halaman Detail Editorial untuk Job Fair & Campus Hiring:**
   - File baru `ui/ShareableDetailPage.tsx`: layout editorial penuh bergaya Detail Berita & Artikel — breadcrumb, judul besar, metadata strip ikon emas (kategori, tanggal, Oleh: Admin Website), cover banner 21:9, floating share sidebar kiri + horizontal share bar bawah (Facebook, X, WhatsApp, Telegram, LinkedIn).
   - Klik card Job Fair/Campus Hiring kini membuka halaman detail penuh (bukan modal pop-up). Tab "Detail Konten" dan "E-Pass Tiket"/"Form Pendaftaran" dipertahankan di dalam halaman detail.
4. **Penghapusan Box Gradient PageHeader di SEMUA Menu Layanan:**
   - File baru `ui/FlatHeader.tsx` (eyebrow small-caps + judul besar slate-900 + deskripsi, tanpa wadah/box).
   - `BursaKerja.tsx`, `CaraPasang.tsx`, `ExitSurvey.tsx`, `JobPlacement.tsx`, `TesMinat.tsx` beralih dari `PageHeader` (gradient banner) ke `FlatHeader`.
   - Kotak krem subtitle & kotak panel kontrol pencarian di `EventCardLayout.tsx` dihapus — semua menyatu background putih.
5. **Redesign Card Layout Job Fair & Campus Hiring (mengikuti pola bersih EventCardLayout):**
   - Thumbnail 16:9 di atas (poster/logo perusahaan, hover zoom halus).
   - Body: eyebrow uppercase → judul bold → tanggal · waktu → lokasi (teks netral, tanpa pill badge warna).
   - Footer garis tipis hanya "by Admin Website"; info terdaftar/kuota booth dihilangkan dari card.
   - Buang semua pill badge hijau/kuning/ungu, chip posisi, kotak metadata berwarna, dan tombol solid "Lihat Detail Konten" (seluruh card klikable).
6. **Animasi Scroll Masuk (framer-motion `whileInView`):**
   - Card fade-in + geser naik 28px saat masuk viewport, delay bertahap per kolom 0.08s, `once: true`, ease curve `[0.22, 1, 0.36, 1]`. Diterapkan di EventCardLayout, CareerFair, CampusHiring.
7. **Perbaikan Bug & Audit Menu Layanan:**
   - FIX header ganda: CareerFair & CampusHiring kini sinkron `setIsDetailActive` via `useLayanan()` sehingga judul container disembunyikan saat detail terbuka.
   - Hapus dead code lightbox poster di CareerFair & duplikasi blok return detail di EventCardLayout.
   - Hilangkan duplikasi judul besar (judul cukup dari LayananContainer; dalam halaman tersisa eyebrow + deskripsi).
   - Rename label "Job Fair & Bursa Kerja" → "Job Fair" (LayananContainer, MegaMenu, CareerFair).
   - Bersihkan conflict marker lama pada `progres.md` dan import tak terpakai.

### File Diubah / Ditambah
- **[BARU]** `src/components/layanan/ui/ShareableDetailPage.tsx`
- **[BARU]** `src/components/layanan/ui/FlatHeader.tsx`
- **[MODIFY]** `src/components/layanan/ui/EventCardLayout.tsx`, `ui/index.tsx`
- **[MODIFY]** `src/components/layanan/CareerFair.tsx`, `CampusHiring.tsx`, `BursaKerja.tsx`, `CaraPasang.tsx`, `ExitSurvey.tsx`, `JobPlacement.tsx`, `TesMinat.tsx`, `LayananContainer.tsx`
- **[MODIFY]** `src/components/MegaMenu.tsx`, `src/types.ts`

### Verifikasi
- ✅ `npx tsc --noEmit` — bersih untuk folder layanan
- ✅ `npm run build` — passed (✓ built in ~13s, 0 error)

---

## Tanggal: 24 Agustus 2026
**Oleh: Mirzat L. Teori**
**Fokus Pekerjaan:** Moderasi Komentar Berita, Perbaikan Redirect Pembuatan Konten, Fix Simpan Workshop/Softskill/Seminar, Kelola CDC UM Kendari Club (Admin), Thumbnail Lowongan Admin = Poster 9:16 Animasi Reveal (Logo Dihapus), & Pembersihan Field Logo Instansi di Form Lowongan Admin.

### Ringkasan Perubahan
1. **Moderasi Komentar Berita (Wajib Approval Admin):**
   - Menambah tabel `komentar_berita` di localStorage (`src/data.ts`) beserta helper CRUD (`getKomentarBerita`, `addKomentarBerita`, `updateKomentarBerita`, `deleteKomentarBerita`, `getKomentarByBerita`).
   - Menambah interface `KomentarBerita` & type `StatusKomentar` (`src/types.ts`).
   - Mengintegrasikan form komentar di `BeritaDetailView.tsx` ke database (status `pending`, hanya `approved` yang tampil publik).
   - Menambah tab **INTERAKSI PUBLIK → Moderasi Komentar Berita** di `AdminDashboard.tsx`: daftar komentar, filter status, tombol Approve/Reject/Hapus, dan badge jumlah menunggu.
2. **Fix Redirect Keluar Pembuatan Konten:**
   - Menghapus `setKontenSub('riwayat')` pada aksi Batal/Tutup editor konten karir sehingga admin tetap diam di tab **Pembuatan Konten** (tidak loncat ke Riwayat).
3. **Fix Simpan Konten Workshop / Softskill / Seminar:**
   - Menambah `onInput` sinkronisasi `contentEditable` editor ke state `eBody` pada form non-berita di `AdminDashboard.tsx`, sehingga isi rich-text tersimpan saat klik Simpan (sebelumnya body kosong → gagal tersimpan).
4. **Kelola CDC UM Kendari Club (Admin):**
   - Menambah interface `CdcClubConfig` + `DEFAULT_CDC_CLUB_CONFIG` (`src/types.ts`) dan helper `getCdcClubConfig`/`saveCdcClubConfig` (`src/data.ts`, key `cdc_umk_cdc_club_config`).
   - Menambah panel **CDC UM Kendari Club** di tab Media Sosial `AdminDashboard.tsx`: 1 toggle `Tampil` yang mengontrol sekaligus card beranda & badge footer, teks judul/deskripsi/teks tombol & URL tujuan dapat diedit, tombol Simpan.
   - `PublicLayout.tsx`: card beranda menjadi conditional (`published` false → `return null`), teks & URL dinamis.
   - `Footer.tsx`: badge footer conditional & dapat diklik (`window.open` URL).
5. **Thumbnail Lowongan Admin = Poster 9:16 Animasi Reveal (Logo Dihapus):**
   - `src/index.css`: menambah `@keyframes poster-reveal-pan` (object-position center top ↔ bottom loop 7s) + class `.poster-reveal` (object-cover + animasi). Menghormati `prefers-reduced-motion`.
   - `PublicLayout.tsx` (card beranda & sidebar JobDetail): cabang `sumber === 'admin'` menampilkan **poster** (flyer/imageUrl/flyers/bannerImage) dengan class `poster-reveal`. **Fallback logo dihapus** untuk admin.
   - `JobDetail.tsx`: detail menampilkan poster utuh (`object-contain`), tanpa fallback logo.
   - **Lowongan MITRA tetap menampilkan LOGO** (revert ke tampilan semula sesuai permintaan).
   - `AdminDashboard.tsx` (list lowongan admin): thumbnail pakai `poster-reveal`.
6. **Pembersihan Field "Logo Instansi" di Form Lowongan Admin:**
   - Menghapus seluruh blok UI **Logo Instansi** (upload File/URL + preview) dari form Lowongan admin `AdminDashboard.tsx`.
   - Menghapus state `lLogoUrl`, `lLogoUploadType`, handler `handleLowonganLogo`, dan pemakaiannya (load/reset).
   - Save handler lowongan admin: `companyLogo: undefined` (admin tidak menyimpan logo; thumbnail murni dari poster).
   - Form Lowongan admin kini hanya memiliki **Poster / Flyer (9:16)** sebagai media visual tunggal.

### File Diubah
- `src/types.ts` (interface `KomentarBerita`, `StatusKomentar`, `CdcClubConfig` + `DEFAULT_CDC_CLUB_CONFIG`)
- `src/data.ts` (CRUD `komentar_berita`, helper `CdcClubConfig`, key `cdc_umk_cdc_club_config`)
- `src/components/BeritaDetailView.tsx` (integrasi komentar ke DB)
- `src/components/AdminDashboard.tsx` (moderasi panel, fix redirect, fix onInput, panel CDC Club, poster-reveal list, hapus field Logo Instansi)
- `src/components/PublicLayout.tsx` (card beranda & sidebar: admin = poster reveal tanpa logo; mitra = logo; CDC Club card conditional)
- `src/components/Footer.tsx` (badge CDC Club conditional + clickable)
- `src/components/JobDetail.tsx` (detail poster utuh tanpa fallback logo)
- `src/index.css` (keyframe `poster-reveal-pan` + class `.poster-reveal`)
- `progres.md` (update progres)

### Verifikasi
- ✅ `npm run build` — passed (0 error)
- ✅ Mitra di beranda: 7 img `object-contain` (logo), 0 `poster-reveal` → mitra balik ke logo
- ✅ Field `Logo Instansi` = 0 match di `AdminDashboard.tsx` (field dihapus)
- ✅ CSS keyframe `poster-reveal-pan` terdaftar & aktif di stylesheet
- ✅ Admin lowongan: thumbnail = poster 9:16 animasi reveal, tanpa logo

---



---

## Tanggal: 23-24 Agustus 2026 (Sesi 4)
**Oleh: Developer Fachrul Alam Sanuddin**
**Fokus Pekerjaan:** Animasi Counter Angka Beranda, Penyesuaian Visitor Counter Live Hosting (Start 0 & Session Deduplication), Tampilan Foto Berita Mobile Full-Width (100% Rata Kiri-Kanan), Integrasi Dinamis 3 Sub-Menu Layanan (Workshop, Softskill, Seminar) pada Section Program & Pengumuman Beranda, dan Penambahan Akses Campus Hiring di Widget Layanan Cepat Beranda.

### Ringkasan Perubahan
1. **Animasi Counter Angka Beranda (`PublicLayout.tsx`):**
   - Membuat komponen `AnimatedCounterStat` menggunakan `window.requestAnimationFrame` dan kurva `easeOutCubic` 60 FPS.
   - Ke-4 statistik beranda (**20.000+ Alumni**, **10 Mitra Perusahaan**, **Total Pengunjung**, **10+ Tahun Pengalaman**) bergerak naik secara mulus dari `0` menuju angka aktual dengan format titik desimal Indonesia (`toLocaleString('id-ID')`).
2. **Visitor Counter Live Hosting (`data.ts`):**
   - Menyesuaikan `BASE_VISITOR_COUNT = 0` untuk rilis *live hosting*.
   - Menerapkan deduplikasi sesi peramban (`sessionStorage`), menjamin perhitungan bertambah 1 per pengunjung tanpa menghabiskan kuota database server (0% efek beban database).
3. **Tampilan Foto Berita Mobile Full-Width (`index.css`):**
   - Memperbarui aturan CSS `@media (max-width: 640px)` untuk `.prose-berita img` dan `.prose img`.
   - Di perangkat seluler/HP (< 640px), seluruh foto berita (baik yang di-set *Float Left*, *Float Right*, maupun *Center*) otomatis membentang **100% full-width rata kiri-kanan** memenuhi lebar wadah artikel berita.
4. **Integrasi Dinamis 3 Sub-Menu Layanan di Section Program & Pengumuman (`PublicLayout.tsx` & `data.ts`):**
   - Section **PROGRAM & PENGUMUMAN** di Beranda Utama kini menyedot publikasi terbaru dari **Workshop**, **Pelatihan Softskill**, dan **Seminar** secara otomatis.
   - Diurutkan berdasarkan **tanggal rilis paling terbaru** (`createdAt`/`updatedAt` descending).
   - Memasang Badge Label Kustom per Card: **WORKSHOP**, **SOFTSKILL**, **SEMINAR**, **PROGRAM**, **PENGUMUMAN**.
   - Mengklik Card Workshop/Softskill/Seminar langsung mengarahkan pengunjung ke halaman detail sub-menu layanan terkait.
   - Menambahkan seed dummy published untuk `workshop`, `softskill`, dan `seminar` di `SEED_KONTEN_KARIR`.
5. **Penambahan Akses Campus Hiring pada Widget Layanan Cepat (`PublicLayout.tsx`):**
   - Menambahkan tombol navigasi cepat `{ label: 'Campus Hiring - Recruitment', tab: 'campus-hiring' }` pada sidebar widget **Layanan Cepat** di Beranda Utama.
6. **Git Pull & Push Synchronization:**
   - Melakukan `git pull origin main`, menyelesaikan resolusi merge conflict secara bersih, dan me-push seluruh perubahan terbaru ke GitHub remote `main`.

### File Diubah
- `src/components/PublicLayout.tsx` (Animasi counter, integrasi 3 sub-menu layanan, badge kustom & akses Campus Hiring Layanan Cepat)
- `src/data.ts` (Reset BASE_VISITOR_COUNT = 0 & seed dummy workshop, softskill, seminar)
- `src/index.css` (Responsif foto berita mobile 100% full-width)
- `src/types.ts` (Penyelarasan union type JenisKonten 'pengumuman')
- `src/components/AdminDashboard.tsx` (Penyelarasan dictionary JenisKonten 'pengumuman')
- `src/components/layanan/EventDetailView.tsx` & `src/components/layanan/ui/EventCardLayout.tsx` (Merge resolution)
- `progres.md` (Update progres)

### Verifikasi
- ✅ `npx tsc --noEmit` — passed (0 error)
- ✅ Git commit & push — sukses ter-sync dengan `origin/main`

---

## Tanggal: 23 Agustus 2026 (Sesi 3)
**Oleh: Developer Fachrul Alam Sanuddin**
**Fokus Pekerjaan:** Revisi Desain Detail Card Event Layanan (Workshop, Softskill, Seminar) mengikuti Layout Editorial Halaman Berita & Artikel.

### Ringkasan Perubahan
1. **Penyelarasan Kartu Event Layanan:**
   - Menghapus badge status pendaftaran (`Pendaftaran Dibuka` / `Segera Hadir`) dari pojok atas gambar kartu luar maupun dalam.
   - Memindahkan watermark label **"by Admin Website"** ke pojok kanan bawah sejajar dengan tanggal pelaksanaan kegiatan.
2. **Transformasi Tampilan Detail Event Layanan (`EventDetailView.tsx`):**
   - Mengubah tampilan klik kartu yang sebelumnya berupa modal pop-up kecil menjadi halaman detail editorial penuh (*full page editorial view*) yang persis sama dengan tampilan **Detail Berita & Artikel**:
     - **Navigasi Breadcrumb**: `Beranda > [Nama Sub-Layanan] > [Judul Kegiatan]`
     - **Metadata Strip**: Ikon gold untuk Kategori Layanan, Tanggal, dan Penulis (`Oleh: Admin Website`).
     - **Media Cover**: Aspect ratio banner presisi dengan sudut membulat (`rounded-2xl`).
     - **Floating & Horizontal Social Share Bar**: 5 tombol media sosial lengkap (**Facebook**, **X**, **WhatsApp**, **Telegram**, **LinkedIn**).
     - **Rich Markdown Body**: Menampilkan seluruh deskripsi kegiatan dengan typography yang nyaman dibaca.
     - Disesuaikan tanpa fitur *Tinggalkan Komentar* dan *Berita Terkait* sesuai instruksi.
3. **Verifikasi Build:**
   - Memastikan seluruh modul ter-compile bersih (`npm run build` sukses).

### File Diubah
- `src/components/layanan/EventDetailView.tsx` (Implementasi layout editorial event)
- `src/components/layanan/ui/EventCardLayout.tsx` (Integrasi halaman detail dan pemindahan watermark)
- `progres.md` (Update progres)

---

## Tanggal: 23 Agustus 2026 (Sesi 2)
**Oleh: Developer Fachrul Alam Sanuddin**
**Fokus Pekerjaan:** Final Audit Frontend & Pembersihan Bug Menu Layanan dan Tracer Study tanpa Perubahan Konsep UI/UX.

### Ringkasan Perubahan
1. **Audit Frontend Menu Layanan & Tracer Study:**
   - Melakukan inspeksi menyeluruh pada seluruh komponen sub-menu Layanan (`BimbinganKarir.tsx`, `TesMinat.tsx`, `Workshop.tsx`, `Softskill.tsx`, `Seminar.tsx`, `CareerFair.tsx`, `CampusHiring.tsx`, `Magang.tsx`, `BursaKerja.tsx`) dan Tracer Study.
   - Mengonfirmasi bahwa konsep UI/UX tetap sesuai rancangan tim (seperti penautan direct link eksternal ke Klob Meter & Tracer Study UM Kendari).
2. **Pembersihan Teks Hardcoded Eksternal (`BursaKerja.tsx`):**
   - Menghapus referensi teks statis entitas luar (*"UMSU"* & *"CDAC UMSU"*) dan menyelaraskannya menjadi **"UM Kendari"** dan **"CDC UM Kendari"**.
3. **Verifikasi Build Produksi:**
   - Memastikan tidak ada kendala sintaks, error import, maupun kerusakan layout saat dikompilasi ke mode produksi.

### File Diubah
- `src/components/layanan/BursaKerja.tsx` (Pembersihan teks entitas CDC UM Kendari)
- `progres.md` (Pencatatan laporan progres)

### Verifikasi
- ✅ `npm run build` — passed (0 error)
- ✅ Git status clean & sinkron dengan remote GitHub

---

## Tanggal: 23 Agustus 2026
**Oleh: Developer Fachrul Alam Sanuddin**
**Fokus Pekerjaan:** Penyelarasan Mini Thumbnail Popular Info, Penyelarasan Narasi "by Admin Website", Tampilan Detail Berita & Artikel Presisi (`BeritaDetailView.tsx`), Ikon Share Medsos (X Terbaru, Telegram, LinkedIn), Navigasi Breadcrumb (`Beranda > Berita & Artikel > [Judul Berita]`), Editor Admin Sisip Foto Inline (Float Left / Right), dan Pembersihan Duplikasi Teks.

### Ringkasan Perubahan
1. **Popular Info Widget Thumbnail Card (`PublicLayout.tsx`):**
   - Menambahkan properti `thumbnail` & `kategori` pada data `dynamicPopularItems` & `POPULAR_LINKS`.
   - Mengubah render list Popular Info menjadi Flex Layout Card dengan Mini Thumbnail Box (`w-12 h-12` / `w-13 h-13`, `rounded-xl`, `object-cover`), efek zoom saat hover, dan fallback icon `FileText` jika foto poster belum diunggah. Teks judul dibatasi 2 baris (`line-clamp-2`).
2. **Penyelarasan Narasi "by Admin Website":**
   - Memperbarui seluruh Card Layout di berbagai section (`PublicLayout.tsx`, `EventCardLayout.tsx`, `JobDetail.tsx`, `App.tsx`, `data.ts`, `AdminDashboard.tsx`) agar jika di-input oleh admin secara konsisten menggunakan narasi **"by Admin Website"** (atau **"By Admin Website"** / **"Oleh Admin Website"**).
3. **Komponen Detail Berita & Artikel Presisi (`BeritaDetailView.tsx` - BARU):**
   - Membuat komponen standalone `BeritaDetailView.tsx` yang mereplikasi presisi layout editorial dari gambar screenshot:
     - **Breadcrumb Navigation**: `Beranda > Berita & Artikel > [Judul Berita]`.
     - **Metadata Strip**: Ikon berwarna kuning/gold untuk Tag Scope, Tanggal & Waktu (`12 Agustus 2026, 13.15`), Penulis (`Oleh: Admin Website`), dan Jumlah Komentar (`0` / dinamis).
     - **Sticky Floating Share Sidebar (Kiri)** & **Horizontal Share Bar (Bawah)**: Mendukung 5 tombol share platform lengkap (**Facebook**, **X (Logo Terbaru)**, **WhatsApp**, **Telegram**, **LinkedIn**).
     - **Section Tags**: Pill badge cyan/teal di bawah artikel (`TAGS:`, `CDC UM KENDARI`, `SDG 17`, `SDG 4`, `SDG 8`).
     - **Section "Tinggalkan Komentar"**: Heading dengan garis bawah aksen kuning (*yellow underline accent*), form input (komentar, nama, email, checkbox simpan peramban), tombol submit **KIRIM KOMENTAR** (navy blue), dan tampilan komentar terkirim secara live.
4. **Fitur Tata Letak Foto Inline (Float Left / Float Right) di Editor Admin (`AdminDashboard.tsx`):**
   - Menambahkan Popover Sisip Foto Inline pada toolbar berita Admin.
   - Admin dapat memilih opsi **Rata Kiri (Float Left)**, **Rata Kanan (Float Right)**, atau **Tengah (Full Width)** dengan pilihan **Upload File Foto** dari perangkat atau **Input URL**. Foto dimasukkan berukuran seragam (`w-80 h-52` / `320px x 200px`, `rounded-xl`, `shadow-sm`) dengan paragraf mengalir mengelilinginya (*text wrapping*).
   - Menambahkan styling responsif di `index.css` (`.prose-berita img`) agar foto melayang rapi di desktop/laptop dan menyesuaikan di HP.
5. **Pembersihan Duplikasi Teks Berita (`BeritaDetailView.tsx`):**
   - Menghapus blok teks sampel statis (*hardcoded sample text*) dan render `{berita.excerpt}` yang terduplikasi.
   - Konten berita kini di-render murni **1 kali tayang** dari `{renderContentMarkdown(berita.content)}` tanpa perulangan.

### File Diubah & Dibuat
- `src/components/BeritaDetailView.tsx` (BARU - Komponen Detail Berita & Artikel)
- `src/App.tsx` (Integrasi BeritaDetailView pada VIEW 3)
- `src/components/PublicLayout.tsx` (Mini thumbnail Popular Info & narasi by Admin Website)
- `src/components/AdminDashboard.tsx` (Editor foto inline float left/right & createdByName)
- `src/components/JobDetail.tsx` (Narasi badge source admin)
- `src/components/layanan/ui/EventCardLayout.tsx` (Badge event by Admin Website)
- `src/data.ts` (Mock data seed author Admin Website)
- `src/index.css` (CSS float-left / float-right .prose-berita img)
- `progres.md` (Update laporan progres)

### Verifikasi
- ✅ `npx tsc --noEmit` — 0 error
- ✅ Visual & Functional Check: Popular Info thumbnail mini, card layout footers, berita detail view, share buttons, float left/right image insertion, single-render news text without duplication.

---

## Tanggal: 21 Agustus 2026
**Oleh: Mirzat L. Teori**
**Fokus Pekerjaan:** Analisis seluruh struktur project Portal CDC & penyesuaian form Lowongan Admin (section "3. Detail Konten & Kriteria" dijadikan opsional)

### Ringkasan Perubahan
1. **Analisis Menyeluruh Project (read-through seluruh file sumber):**
   - Membaca konfigurasi (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`), entry point (`main.tsx`, `App.tsx`), data layer (`src/data.ts` 2170 baris — localStorage key `cdc_umk_<dbkey>` + `initializeDB` seed v12_social_media, helper CRUD/register/applyForJob), tipe (`src/types.ts`), styling (`src/index.css` Tailwind v4 @theme kustom clay/emerald/blue + `.prose`/`.prose-berita`), dan seluruh komponen publik (`PublicLayout`, `Header`, `Footer`, `HeroSlider`, `LayananContainer`) serta dashboard (`AdminDashboard` 5833 baris, `MitraDashboard`, `MahasiswaDashboard`).
   - Memetakan ~14 tab publik dan 14 menu admin, alur auth (Login/Register), alur lamar (`JobApplicationModal` + `applyForJob`), dan view layanan (EventCardLayout, GaleriView, SuratKeputusanView, dll).
2. **Penyesuaian Form Lowongan Admin — Section 3 Dijadikan Opsional:**
   - Hapus `!lDeskripsi.trim()` dari validasi `handleSaveLowongan` (syarat wajib tersisa: Judul, Instansi, Lokasi, Deadline).
   - Hapus atribut `required` dan tanda `*` pada label "Deskripsi Ringkas" di section "3. Detail Konten & Kriteria" (form Input Lowongan By Admin CDC).
   - Field section 3 (Deskripsi Ringkas, Tanggung Jawab, Kualifikasi, Keahlian, Benefit) kini seluruhnya opsional — admin dapat memposting lowongan cukup dari section 1 & 2.
3. **Temuan Tech Debt (belum diubah, dicatat untuk tindak lanjut):**
   - 8 file orphan yang tidak diimpor sama sekali: `MegaMenu.tsx`, `EventDetailView.tsx`, `TracerStudyForm.tsx`, `ExitSurvey.tsx`, `CaraPasang.tsx`, `BursaKerja.tsx`, `JobPlacement.tsx`, `HiringCriteriaModal.tsx`.
   - `src/types.ts` memuat interface duplikat (Berita, Pengumuman, TracerStudy, SurveiLulusan, Prestasi, UploadedDocument dideklarasikan 2x) — penyebab `npm run lint` (tsc) gagal; `npm run build` (esbuild) tetap lolos.
   - Duplikasi `formatDateDisplay` (di-copy manual di `StudentApplicationsView` & `MitraDashboard`) dan logo URL berbeda antar dashboard.

### File Diubah
- `src/components/AdminDashboard.tsx` (section 3 form lowongan → opsional)
- `progres.md`

### Verifikasi
- ✅ `npm run build` — passed (built 8.21s, 2120 modules)

---

## Tanggal: 20 Agustus 2026
**Oleh: ARYA APRIAWAN**
**Fokus Pekerjaan:** Redesign tampilan menu **Layanan Konseling Karir** — bersihkan gaya "AI slop" jadi clean & profesional, serta sinkronisasi remote GitHub

### Ringkasan Perubahan
1. **Revisi awal dibatalkan (revert):**
   - Percobaan mengubah tampilan Konseling Karir & Internship menjadi placeholder pamphlet (gaya Job Fair & Bursa Kerja) ternyata bukan yang diminta → di-`git revert` (commit `1c32654`) dan di-push, tampilan awal dikembalikan.
2. **Redesign `src/components/layanan/BimbinganKarir.tsx` (Konseling Karir):**
   - **Dihapus (ciri AI slop):** gradient hero emerald→teal di CTA WhatsApp, chip nomor oranye `0X`, pill status berwarna (bg-emerald-100/amber-100 + border), badge shield "Layanan Bebas Biaya" + backdrop-blur, ikon emotif di tiap heading (HeartHandshake, Sparkles, Calendar, MessageCircle, CheckCircle2 dkk — 17 ikon → 5), animasi `hover:scale` / `active:scale`, `shadow-xl` berlebihan.
   - **Gaya baru:** eyebrow kecil `LAYANAN CDC UM KENDARI` (small-caps), tipografi slate-900 tebal + slate-500 deskriptif, daftar topik bernomor `01 02 03` (tabular-nums) dengan hairline divider, jadwal memakai tabel asli (`<table>`: Hari/Waktu/Lokasi/Kuota/Status — status pakai dot kecil bukan pill), CTA WhatsApp band `bg-slate-900` polos dengan tombol putih solid.
   - **Fungsionalitas dipertahankan:** semua konten tetap admin-driven via `getKonselingConfig()` (poster + zoom modal, infoItems topik, jadwalItems, WA auto-message), tanpa menambah dependency baru.

### File Diubah
- `src/components/layanan/BimbinganKarir.tsx` (redesign lengkap, 256 → 244 baris)

### Verifikasi
- ✅ `npm run lint` — 0 error
- ✅ `npm run build` — passed (built 11.88s)
- ✅ Browser check (localhost:3000): semua section render dari data admin real — header, Poster & Pamflet, Penjelasan & Topik Konseling, tabel Jadwal (Senin-Kamis, 09.00-15.00 WITA, Ruang Konseling Gedung Rektorat Lt.2, 5 Sesi/Hari, Sesi Buka), CTA WhatsApp. `gradientCount=0`, `hover:scale=0`
- ✅ Perubahan di-commit & di-push ke GitHub (branch `main`)

---

## Ringkasan
Pada sesi ini fokusnya adalah **penyusunan ulang struktur sub-menu Layanan**, **perapihan konten layanan**, dan **standarisasi tampilan UI** agar tidak terlihat generik dan tetap profesional.

---

## 1. Restrukturisasi Menu Layanan
- **Pemindahan sub-menu:**
  - `Magang` dipindah dari **Job Info** ke **Layanan**.
- **Penghapusan item lama di Job Info:**
  - `Cara Pasang Info LowKer`
  - `Keanggotaan CDC -1`
  - `Data Exit Survey Lulusan`
  - `Job Placement Program`
- **Penambahan item baru di Layanan:**
  - `Campus Hiring - Recruitment` (tab: `campus-hiring`)
- **File yang diubah:**
  - `src/components/Header.tsx`
  - `src/components/PublicLayout.tsx`
  - `src/components/layanan/LayananContainer.tsx`
- **File baru:**
  - `src/components/layanan/CampusHiring.tsx`
  - `src/components/layanan/Magang.tsx`

---

## 2. Perbaikan Tipe TypeScript
- Memperbaiki error di `src/components/AdminDashboard.tsx` dan `src/types.ts`.
- Menyelaraskan penggunaan tipe `Berita` agar konsisten.
- Hasil: `npm run lint` dan `npm run build` **passed**.

---

## 3. Redesign UI Sub-menu Layanan
- Membuat **design system bersama** di `src/components/layanan/ui/`:
  - `PageHeader.tsx`
  - `Section.tsx`
  - `Card.tsx`
  - `StepList.tsx`
  - `CtaBlock.tsx`
  - `TwoColumn.tsx`
  - `index.tsx`
- Menerapkan wrapper-wrapper tersebut ke **14 komponen layanan** agar tampilannya konsisten:
  - `BimbinganKarir.tsx`
  - `TesMinat.tsx`
  - `Workshop.tsx`
  - `Softskill.tsx`
  - `Seminar.tsx`
  - `BursaKerja.tsx`
  - `CareerFair.tsx`
  - `CampusHiring.tsx`
  - `Magang.tsx`
  - `Keanggotaan.tsx`
  - `ExitSurvey.tsx`
  - `JobPlacement.tsx`
  - `CaraPasang.tsx`
- Menyesuaikan `Card.tsx` agar mendukung:
  - `children`
  - `className`
  - `hover`
  - `key`
  - `onClick`
- Menghindari gaya “AI slop” dengan:
  - Mengurangi gradient yang tidak perlu
  - Menstandarkan radius, spacing, dan tipografi
  - Mempertahankan ikon dari `lucide-react`

---

## 4. Revisi Konten Softskill & Kewirausahaan
- Menambah **1 modul baru** sebagai penghubung:
  - `Personal Branding & Pitching Karir`
- Menjadikan total **6 modul**:
  - 4 modul Softskill
  - 2 modul Kewirausahaan
- Mengubah penulisan menjadi **outcome-based**, contoh:
  - “Mampu menyampaikan ide dengan jelas…”
  - “Mampu menyusun profil LinkedIn…”
- Menambahkan konteks lokal:
  - `Dasar Kewirausahaan & Ideasi Bisnis Lokal` (Kendari/Sultra)
- Memperbaiki teks di:
  - Header section
  - Widget progres
  - Status sertifikat
- File yang diubah:
  - `src/components/layanan/Softskill.tsx`

---

## 5. Verifikasi
Perintah yang dijalankan:
```bash
npm run lint
npm run build
```

Hasil verifikasi:
- ✅ `npm run lint` **passed**
- ✅ `npm run build`## Ringkasan Perubahan
- Menambahkan tab baru: **Kelola Akun User** dan **Approval Akun**
- Menambahkan fitur **pencarian/filter** pada tabel alumni, mitra, verifikasi magang, tracer study, CMS berita, users, approval
- Memperkaya tab **Ringkasan** dengan aktivitas terkini gabungan, distribusi role, KPI tambahan, tren mingguan, dan top mitra
- Menambahkan state dan load data `lowongan` untuk kebutuhan KPI ringkasan
- Memastikan semua perubahan lolos `npm run lint` dan `npm run build`

## File Diubah
- `src/components/AdminDashboard.tsx`
- `src/components/AdminDashboard.md` (backlog fitur dashboard)

## Selesai Hari Ini
- [x] Tambah tab Kelola Akun User + Approval Akun
- [x] Tambah search/filter di tabel admin
- [x] Tambah aktivitas terkini global di Ringkasan
- [x] Tambah KPI lowongan aktif + pengajuan bulan ini
- [x] Tambah tren mingguan pengajuan 7 hari
- [x] Tambah top 5 mitra paling banyak dilamar

## Catatan
- Build lolos meskipun ada warning chunk size.

## Tanggal: 31 Juli 2026
**Fokus Pekerjaan:** Polish AdminDashboard section 1–5: visual alignment, filter spacing, placeholder cleanup, dan pemulihan backlog.

### Ringkasan Perubahan
- Perbaiki spacing bar filter dan kartu ringkasan di **Rekap Tracer Study** agar tidak menindih.
- Standarisasi dropdown menjadi wrapper `relative` + `ChevronDown` di Tracer Study, Mahasiswa, Alumni, Mitra, Pengajuan, Staff.
- Rapikan layout filter Mahasiswa: `md:grid-cols-2 xl:grid-cols-4`, `gap-4`, dan `w-full` per kontrol agar tidak offside.
- Cleanup placeholder: hapus tombol export PDF placeholder, ubah tombol Export All CSV menjadi **Export Excel** sesuai rule Excel-only.
- Ganti link placeholder dokumen mahasiswa (`CV`, `Transkrip KHS`, `Portofolio`) menjadi status **"Belum tersedia."**
- Ganti placeholder legalitas mitra (`NIB/SIUP`) menjadi **"-"** pada tabel dan **"Belum tersedia."** pada modal validasi.
- Hapus teks `"Data akademik placeholder"` menjadi data akademik statis `IPK 3.75 / SKS 110.`
- Tambah aksi tabel Mahasiswa: **Detail**, **History CDC**, **Nonaktifkan/Aktifkan**, **Reset Passcode**.
- Pulih `src/components/AdminDashboard.md` sebagai backlog sources of truth section 1–5.
- Verifikasi build lolos (`npm run build -> exit 0`).

### File Diubah
- `src/components/AdminDashboard.tsx`
- `src/components/AdminDashboard.md`
- `progres.md`

### Selesai Hari Ini
- [x] Perbaiki spacing + overlap filter Tracer Study
- [x] Standarisasi dropdown visual + Chevron icon
- [x] Rapikan layout filter Mahasiswa
- [x] Cleanup placeholder export PDF + CSV label
- [x] Bersihkan placeholder dokumen mahasiswa + mitra
- [x] Tambah aksi tabel Mahasiswa (Detail/History/Reset Passcode)
- [x] Pulih AdminDashboard.md backlog
- [x] Build verification

---

## Tanggal: 31 Juli 2026 (Sesi 2)
**Fokus Pekerjaan:** Pengembangan Komponen `HeroSlider`, Revamp Public Layout Header/Footer, & Integrasi Branding CDC UM Kendari

### 🚀 Ringkasan Perubahan UI & Feature Updates

1. **Komponen Slider Baru `HeroSlider.tsx` (Hero Section Beranda):**
   - Mengembangkan komponen slider hero interaktif secara modular di `src/components/HeroSlider.tsx`.
   - **Fitur Interaktif:** Autoplay (interval 5 detik), kontrol navigasi Play/Pause, tombol panah *Next/Prev*, serta titik indikator slide (*slide counter & dots*).
   - **3 Slide Promosi Utama:**
     1. **UMK Job Fair 2026 & Akselerasi Karir Digital:** Menampilkan highlight bursa kerja resmi UMK.
     2. **Pelatihan Softskill & Workshop Sertifikasi Industri:** Banner promosi program persiapan karir & sertifikasi.
     3. **Program Magang Bersertifikat & Tracer Study Alumni:** Banner ajakan keterlibatan alumni dan mahasiswa aktif.
   - Integration tombol CTA (*Call-to-Action*) langsung seperti *"Jelajahi Lowongan"*, *"Daftar Workshop"*, dan *"Isi Tracer Study"*.

2. **Revamp Layout Halaman Publik (`PublicLayout.tsx`):**
   - Mengintegrasikan `HeroSlider` pada section Hero Beranda menggantikan tampilan banner lama.
   - Mengganti logo pada Footer menggunakan asset image `/logo-cdc-branding-light.png` beresolusi tinggi.
   - Menyesuaikan penamaan branding dari `CDAC` menjadi **CDC UM KENDARI CLUB** dan **CDC UM Kendari**.

3. **Pembaruan Assets & Branding Resmi (`/public`):**
   - Menambahkan aset visual resmi CDC UM Kendari:
     - `Poster CDC WEB UMK.svg`
     - `logo-cdc-branding-light.png` & `logo-cdc-branding-transparent.png`
     - `logo-cdc-branding.png` & `logo-cdc-light.png`
     - `logo-cdc-transparent.png` & `logo-cdc.png`
     - `logo-umk.png`
     - `favicon.ico` & `favicon.png`

4. **Pembaruan Header, MegaMenu, & Modal Registrasi:**
   - **`Header.tsx` & `MegaMenu.tsx`:** Penyesuaian logo branding top-bar, styling, dan tautan navigasi.
   - **`Register.tsx`:** Penyelarasan nama sistem registrasi dan copyright footer menjadi **CDC UM Kendari**.
   - **`index.html`:** Pembaruan meta title HTML dan penautan favicon resmi.

### 📁 File Diubah & Ditambahkan
- **[NEW]** `src/components/HeroSlider.tsx`
- **[MODIFY]** `src/components/PublicLayout.tsx`
- **[MODIFY]** `src/components/Header.tsx`
- **[MODIFY]** `src/components/MegaMenu.tsx`
- **[MODIFY]** `src/components/Register.tsx`
- **[MODIFY]** `index.html`
- **[NEW]** `public/Poster CDC WEB UMK.svg` & variasi asset logo CDC (`public/logo-cdc-*.png`, `public/favicon.*`)

### 📋 Checklist Selesai Sesi Ini
- [x] Pembuatan komponen modular `HeroSlider.tsx` lengkap dengan autoplay dan navigasi
- [x] Integrasi `HeroSlider` di Public Layout Landing Page
- [x] Penambahan asset logo branding CDC UM Kendari di folder `public/`
- [x] Penyesuaian logo & branding pada `Header.tsx`, `MegaMenu.tsx`, dan Footer `PublicLayout.tsx`
- [x] Penyesuaian teks branding pada `Register.tsx` & `index.html`
- [x] Verifikasi kompabilitas kompilasi dan linting

---

## Tanggal: 1 Agustus 2026
**Fokus Pekerjaan:** Realisasi UI Job Info & Job Detail (Google Stitch), Layout Poster 9:16 Full-Bleed, Sticky Sidebar CDAC UMSU, & Integration Header/Footer

### 🚀 Ringkasan Perubahan UI & Feature Updates

1. **Realisasi Desain UI Job Info & Job Detail (Presisi Screenshot Google Stitch):**
   - **`src/types.ts`:** Menambahkan properti pendukung pada interface `Lowongan` (`tanggungJawab`, `keahlian`, `kategori`, `gaji`).
   - **`src/data.ts`:** Memperbarui `SEED_LOWONGAN` dengan grafik poster SVG 9:16 mitra resmi (*Job Info Academic Career Portal*, *Aethereum Design Co.*, *Infrastructure Connect*, dll.) serta mengimplementasikan migrasi data seed `v3_posters_9_16`.
   - **`src/components/PublicLayout.tsx`:** Mengembangkan tampilan **Job Info** (Google Stitch Screenshot 1) dengan search bar, filter tabs (*Semua*, *Magang*, *Kerja*), dan grid kartu poster lowongan.
   - **`src/components/JobDetail.tsx`:** Mengembangkan halaman **Job Detail** (Google Stitch Screenshot 2) lengkap dengan banner poster 9:16, metadata lowongan, deskripsi, tanggung jawab, kualifikasi, keahlian, tabel ringkasan pekerjaan, tombol aksi interaktif (*Lamar Pekerjaan Ini*, *Simpan Lowongan*), share link, dan modal pengajuan lamaran interaktif.

2. **Pengembangan Komponen Modular `Footer.tsx` & Integrasi Header/Footer di Job Detail:**
   - Memisahkan komponen **Footer** ke `src/components/Footer.tsx` secara modular agar digunakan bersama di `PublicLayout.tsx` dan `JobDetail.tsx`.
   - Menampilkan komponen **Header** dan **Footer** resmi pada halaman **Job Detail** untuk pengalaman navigasi yang utuh dan konsisten.

3. **Logika Sticky Sidebar Desktop (Sepresisi Web CDAC UMSU):**
   - Menerapkan `lg:sticky lg:top-24 lg:self-start` pada sidebar kanan `JobDetail.tsx`.
   - **Behavior Scroll:** Sidebar tetap melayang (*sticky*) di bawah header saat pengguna membaca kolom informasi pekerjaan yang panjang, lalu otomatis berhenti melayang ketika mencapai batas bawah kolom utama sehingga sejajar secara presisi sebelum area Footer.

4. **Desain Kartu Poster Full-Bleed Tanpa Kuota & Tombol Detail (Sesuai Referensi Visual):**
   - Memperbarui kartu lowongan pada halaman **Beranda (Home)** dan **Job Info**:
     - Poster flyer diperbesar penuh (*full-bleed edge-to-edge*) dengan `object-cover`.
     - Menghapus tampilan kuota dan tombol *Detail & Daftar* sesuai petunjuk desain.
     - Menyusun hirarki teks: Subhead instansi aksen oranye, judul tebal, serta baris meta `by Admin Website • 🕒 [Tanggal Deadline]`.

5. **Penanganan Gambar Poster Mitra di Seluruh Widget:**
   - Memastikan widget **Info Terkini Loker** di sidebar beranda dan **Postingan Terbaru** di sidebar Job Detail memprioritaskan poster flyer resmi mitra (`flyer` / `imageUrl` / `flyers[0]` / `bannerImage`).

### 📁 File Diubah & Ditambahkan
- **[NEW]** `src/components/Footer.tsx`
- **[MODIFY]** `src/types.ts`
- **[MODIFY]** `src/data.ts`
- **[MODIFY]** `src/components/PublicLayout.tsx`
- **[MODIFY]** `src/components/JobDetail.tsx`
- **[MODIFY]** `src/App.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Realisasi UI Job Info & Job Detail presisi sesuai Google Stitch Screenshot
- [x] Pembuatan komponen modular `Footer.tsx`
- [x] Integrasi Header & Footer resmi pada halaman `JobDetail.tsx`
- [x] Penerapan logika Sticky Sidebar Desktop sepresisi CDAC UMSU
- [x] Penerapan kartu poster *full-bleed* (tanpa kuota & tombol detail) pada Beranda & Job Info
- [x] Verifikasi build produksi `npx vite build` (0 error)

---

## Tanggal: 3 Agustus 2026
**Fokus Pekerjaan:** Perbaikan UI/UX Menu Layanan

### 🚀 Ringkasan Perubahan UI & Feature Updates

1. **Penyempurnaan Styling Scrollbar:**
   - **`src/index.css`:** Menambahkan *utility class* kustom `.no-scrollbar` untuk menyembunyikan *horizontal scrollbar* bawaan browser (Chrome, Safari, Firefox, Edge) yang merusak estetika desain, dengan tetap mempertahankan fungsionalitas usap/geser (*scroll/swipe*).

2. **Pembersihan Antarmuka `LayananContainer.tsx`:**
   - **`src/components/layanan/LayananContainer.tsx`:** Menghapus sepenuhnya elemen *Sticky Sub-Navigation Bar* (barisan tombol navigasi sub-bab secara horizontal) untuk memberikan ruang pandang yang lebih bersih dan merespons umpan balik pengguna.

### 📁 File Diubah
- **[MODIFY]** `src/index.css`
- **[MODIFY]** `src/components/layanan/LayananContainer.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Implementasi class `.no-scrollbar` pada global CSS
- [x] Penghapusan barisan sub-bab yang berjejer (*Sticky Sub-Nav Bar*)
- [x] Pencatatan laporan progres (3 Agustus 2026)
- [x] Commit seluruh perubahan kode untuk kolaborasi tim di GitHub

---

## Tanggal: 6 Agustus 2026
**Fokus Pekerjaan:** Penyempurnaan Navigasi Header, Sub-Menu Profil 2-Kolom, Restrukturisasi Menu Tracer Study, Fitur Pencarian Loker, & Dashboard Mitra

### 🚀 Ringkasan Perubahan UI & Feature Updates

1. **Restrukturisasi Menu Tracer Study & User Survey (`Header.tsx`):**
   - **`src/components/Header.tsx`:** Menghapus menu utama *standalone* "User Survey" dan memindahkan **Kuesioner Pengguna Lulusan** menjadi sub-menu di bawah **Tracer Study**.
   - Menambahkan dukungan *external link* (`href`) pada tipe `NavChild` sehingga saat diklik langsung membuka tautan survei resmi di tab baru (`_blank`).
   - Struktur sub-menu Tracer Study:
     - **Tracer Study Alumni**: `https://tracerstudy.umkendari.ac.id`
     - **Kuesioner Pengguna Lulusan**: `https://tracerstudy.umkendari.ac.id/page/survey`

2. **Implementasi UI/UX 2-Kolom Flyout Dropdown untuk Profil (`Header.tsx`):**
   - Memindahkan sub-menu **Visi – Misi** (mengarahkan ke `tab: 'profil'`) dan **Keanggotaan** (mengarahkan ke `tab: 'keanggotaan'`) di bawah item `Profil` pada menu **Tentang Kami**.
   - Merancang tampilan *2-Column Side-by-Side Flyout Dropdown* yang presisi sesuai acuan desain portal CDAC UMSU:
     - **Kolom Kiri**: Daftar menu utama (*Profil* dengan penanda ikon chevron `>`, SK CDC, Kalender Kegiatan, Laporan Kinerja, MOU, Galeri) dengan *active hover highlight* berwarna abu-abu terang.
     - **Kolom Kanan**: Panel sub-menu samping terhubung yang memuat *Visi – Misi* dan *Keanggotaan* dengan pembatas garis halus (`divide-y divide-gray-100`).
   - Interaksi kursor dibuat 100% mulus (menggunakan kontainer flexbox terintegrasi untuk mencegah *flicker* / menu tertutup mendadak) serta mendukung penuh tampilan *mobile drawer accordion*.

3. **Rombak Katalog Pencarian Loker & Multi-Filter (`JobSearchMasterDetail.tsx`)**:
   - Menghapus tampilan split-screen master-detail lama dan menggantinya dengan **katalog grid lowongan + halaman Job Detail mandiri**.
   - Menyediakan fitur pencarian multi-filter (1 Textbox Kata Kunci/Jabatan/Instansi, Multi-Select Checkbox Lokasi 38 Provinsi/Kota, Multi-Select Checkbox Spesialisasi Pekerjaan).
   - Menyelaraskan warna search bar menjadi **Corporate Blue (`#0077C6` / `#1E3A8A`)**.
   - Menampilkan **Logo Instansi** pada kartu katalog pencarian dan **Poster Flyer Lowongan** pada halaman `JobDetail.tsx`.

4. **Sinkronisasi Form Lowongan & Pelamar di Dashboard Mitra (`MitraDashboard.tsx`)**:
   - Menghubungkan seluruh bidang informasi lowongan di Dashboard Mitra secara 100% presisi dengan halaman `JobDetail.tsx` (Logo, Poster, Spesialisasi Multi-Select Checkbox, Deskripsi, Tanggung Jawab, Kualifikasi, Keahlian, Benefit).
   - Menghubungkan tombol **Lamar Sekarang** (`JobApplicationModal.tsx`) sehingga data lamaran mahasiswa tersimpan ke database `pengajuan_magang` dan langsung tersinkronisasi di Dashboard Mitra (Overview & Tabel Pelamar).

5. **Peninjauan & Pengunduhan Berkas CV Pelamar Real-Time (`MitraDashboard.tsx` & `JobApplicationModal.tsx`)**:
   - Mengubah mekanisme pengunggahan file CV menggunakan `FileReader.readAsDataURL` untuk menyimpan binary berkas pelamar secara utuh (`berkasUrl` & `berkasNama`).
   - Menyediakan **Modal Interactive Document Viewer** pada Dashboard Mitra:
     - Menampilkan identitas mahasiswa, NIM, Prodi, dan Surat Pengantar.
     - Menyediakan tombol **Download / Buka Berkas CV** untuk mengunduh file asli pelamar (PDF, DOC, PNG, JPG, dll.).
     - Menyediakan **Native PDF/Image Viewer Frame** langsung di dalam modal tanpa memicu SPA website fallback.
     - Menambahkan tombol **Terima**, **Tolak**, dan **Hapus Pelamar** (`deleteInDB`).

6. **Sistem Bookmark & Simpan Lowongan Terintegrasi (`JobDetail.tsx`, `JobSearchMasterDetail.tsx`, `StudentProfileView.tsx`, `data.ts`)**:
   - Membuat fungsi helper terpusat `getSavedJobIds()` dan `toggleSaveJob()` yang terhubung ke `localStorage` (`cdc_saved_job_ids`).
   - Menambahkan tombol **Bookmark** di kartu katalog pencarian dan tombol **Simpan Lowongan** di halaman detail.
   - Menyederhanakan sub-tab **My Bookmarks** di profil mahasiswa menjadi daftar lowongan tersimpan *full-width* tanpa sub-sidebar yang rumit.
   - Menambahkan fitur **Redirect Langsung**: Mengklik kartu lowongan di My Bookmarks langsung mengarahkan mahasiswa ke halaman detail lowongan (`JobDetail.tsx`) dengan header dashboard yang bersih (tanpa header publik ganda).

7. **Inisialisasi Project & Environment Setup:**
   - Menjalankan `npm install` untuk menginstal seluruh dependensi npm project (214 paket, termasuk Vite 6 dan React 19).
   - Menjalankan *development server* (`npm run dev`).

### 📁 File Diubah & Ditambahkan
- **[MODIFY]** `src/components/Header.tsx`
- **[MODIFY]** `src/types.ts`
- **[MODIFY]** `src/data.ts`
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx`
- **[MODIFY]** `src/components/JobDetail.tsx`
- **[MODIFY]** `src/components/JobApplicationModal.tsx`
- **[MODIFY]** `src/components/MitraDashboard.tsx`
- **[MODIFY]** `src/components/MahasiswaDashboard.tsx`
- **[MODIFY]** `src/components/StudentProfileView.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Restrukturisasi menu Tracer Study & penambahan tautan external kuesioner pengguna lulusan
- [x] Implementasi UI/UX 2-kolom side-by-side flyout dropdown pada menu Profil (Visi – Misi & Keanggotaan)
- [x] Pengujian interaksi kursor mulus tanpa flicker di Desktop & Mobile
- [x] Perbaikan katalog pencarian lowongan & styling warna biru corporate `#0077C6`
- [x] Penyesuaian Logo Instansi di kartu Katalog & Poster Flyer di Job Detail
- [x] Sinkronisasi form lowongan Mitra & multi-select checkbox spesialisasi
- [x] Integrasi tombol Lamar Sekarang dengan daftar pelamar Mitra
- [x] Modal peninjau & pengunduh berkas CV pelamar asli (PDF/Gambar)
- [x] Fitur Hapus Pelamar di Dashboard Mitra
- [x] Sistem bookmark & redirect langsung lowongan di tab My Bookmarks
- [x] Penghapusan header ganda saat membuka detail dari Dashboard Mahasiswa
- [x] Instalasi dependensi npm (`npm install`) & jalankan dev server (`npm run dev`)
- [x] Pencatatan laporan progres (6 Agustus 2026)

---

## Catatan Lanjutan
- Build menampilkan warning ukuran chunk >500kB. Ini bukan error, tapi bisa ditinjau code-splitting jika nanti dianggap perlu.
- Saat ini tidak ada modifikasi pada routing utama atau struktur data `LAYANAN_MENU` yang rusak.
- Jika ingin, langkah berikut bisa dilakukan:
  - Menyusun skema penilaian untuk modul Softskill
  - Menghubungkan e-sertifikat ke halaman portfolio/skills
  - Menyamakan palet warna aksen sesuai brand CDC

---

## Tanggal: 7 Agustus 2026
**Fokus Pekerjaan:** Revisi Menu Layanan Menuju Format CDC UMSU, Penghapusan Sub-Menu, dan Perapihan UI Sub-Menu Layanan

### 🚀 Ringkasan Perubahan

1. **Penyesuaian Nama Sub-Menu Berdasarkan Instruksi Project Manager:**
   - `Bimbingan Karir` → `Konseling Karir` di `Header.tsx`, `LayananContainer.tsx`, `MegaMenu.tsx`, `JobPlacement.tsx`
   - `Workshop Karir` → `Workshop Pengembangan Karir` di menu dan halaman `Workshop.tsx`
   - `UM Kendari Job Fair` → `Job Fair & Bursa Kerja` di menu dan halaman `CareerFair.tsx`
   - Menghapus sub-menu terpisah **Bursa Kerja** dari dropdown dan navigasi, digabung menjadi satu menu **Job Fair & Bursa Kerja**
   - Menghapus sub-menu **Tes Potensi Minat Kerja** dari `Header.tsx`, `LayananContainer.tsx`, `MegaMenu.tsx`, dan `PublicLayout.tsx`

2. **Redesign Konten Halaman Layanan Berbasis Pamphlet/Admin Input:**
   Semua halaman layanan disusun ulang menjadi format pamphlet informasi yang hanya berisi deskripsi layanan, tanpa form interaksi pengguna:
   - `BimbinganKarir.tsx`
   - `Workshop.tsx`
   - `Softskill.tsx`
   - `Seminar.tsx`
   - `BursaKerja.tsx`
   - `CareerFair.tsx`
   - `JobPlacement.tsx`
   - `CampusHiring.tsx`
   - `Magang.tsx`
   - `TesMinat.tsx`
   - `Keanggotaan.tsx`
   - `ExitSurvey.tsx`
   - `CaraPasang.tsx`

3. **Perapihan & Modernisasi UI Komponen Layanan:**
   - Membuat komponen UI modular baru di `src/components/layanan/ui/`:
     - `PageHeader.tsx` — header dengan gradient, badge, dan icon
     - `Card.tsx` — card dengan border halus, backdrop blur, dan hover state
     - `InfoRow.tsx` — baris info dengan nomor/langkah
     - `MetaList.tsx` — timeline-style list untuk Deskripsi/Tujuan/Pihak/Tempat/Alat
     - `Divider.tsx` — gradient divider antar section
     - `PillRow.tsx` — inline pills untuk jadwal/alat
     - `index.tsx` — export barrel untuk komponen UI
   - Menghindari gaya generik dengan:
     - Spacing dan tipografi yang konsisten
     - Warna aksen yang sesuai per layanan
     - Layout 2 kolom yang rapi (`lg:grid-cols-12`)

4. **Perbaikan Lint TypeScript:**
   - Memperbaiki error pre-existing pada `kesesuaianBidang` di `src/types.ts` dan `src/components/TracerStudyForm.tsx`
   - Hasil: `npm run lint` kembali **passed**

5. **Verifikasi Berulang:**
   - Menjalankan `npm run dev` dan memastikan server merespons `200 OK`
   - Menjalankan `npm run lint` dan `npm run build` setelah setiap batch perubahan besar
   - Hasil akhir verifikasi:
     - ✅ `npm run lint` **passed**
     - ✅ `npm run build` **passed**

### 📁 File Diubah
- `src/components/Header.tsx`
- `src/components/layanan/LayananContainer.tsx`
- `src/components/MegaMenu.tsx`
- `src/components/PublicLayout.tsx`
- `src/components/layanan/BimbinganKarir.tsx`
- `src/components/layanan/Workshop.tsx`
- `src/components/layanan/Softskill.tsx`
- `src/components/layanan/Seminar.tsx`
- `src/components/layanan/CareerFair.tsx`
- `src/components/layanan/JobPlacement.tsx`
- `src/components/layanan/CampusHiring.tsx`
- `src/components/layanan/Magang.tsx`
- `src/components/layanan/Keanggotaan.tsx`
- `src/components/layanan/ExitSurvey.tsx`
- `src/components/layanan/CaraPasang.tsx`
- `src/components/layanan/ui/PageHeader.tsx`
- `src/components/layanan/ui/Card.tsx`
- `src/components/layanan/ui/InfoRow.tsx`
- `src/components/layanan/ui/MetaList.tsx`
- `src/components/layanan/ui/Divider.tsx`
- `src/components/layanan/ui/PillRow.tsx`
- `src/components/layanan/ui/index.tsx`
- `src/types.ts`
- `src/components/TracerStudyForm.tsx`
- `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Rename sub-menu sesuai arahan project manager
- [x] Hapus sub-menu Tes Potensi Minat Kerja
- [x] Hapus sub-menu Bursa Kerja terpisah, gabung ke Job Fair & Bursa Kerja
- [x] Redesign semua halaman layanan menjadi pamphlet/admin input
- [x] Perapihan UI komponen layanan agar profesional dan tidak generik
- [x] Perbaiki error lint pre-existing `kesesuaianBidang`
- [x] Verifikasi `npm run lint` dan `npm run build` passed

---

## Tanggal: 7 Agustus 2026 (Sesi 2)
**Fokus Pekerjaan:** Update Tampilan Beranda, Integrasi Asset Poster SVG & Visi-Misi, Pembaruan HeroSlider, Refactoring Register, & Cleanup Dashboard

### 🚀 Ringkasan Perubahan

1. **Penambahan Aset Poster & Visi-Misi Resmi (`public/`):**
   - Menambahkan aset SVG resmi CDC UMK:
     - `Poster CDC WEB UMK (1).svg` & `Poster CDC WEB UMK slide 1.svg`
     - `VISI & MISI (3).svg` & `visi-misi-cdc.svg`
     - `poster-cdc-web-umk-1.svg` & `poster-cdc-web-umk-2.svg`

2. **Pembaruan Komponen Hero Slider (`HeroSlider.tsx`):**
   - Menyelaraskan slide banner hero beranda menggunakan gambar poster SVG CDC UMK terbaru.
   - Memperbarui teks overlay, deskripsi slide, dan tombol CTA.

3. **Pembaruan Halaman Utama Beranda (`PublicLayout.tsx` & `Header.tsx`):**
   - Mengintegrasikan banner hero terbaru dan penyesuaian layout beranda.
   - Penyesuaian header dan penataan link navigasi.

4. **Refactoring Tampilan Form Registrasi (`Register.tsx`):**
   - Merapikan struktur form registrasi pengguna agar lebih responsif dan clean.

5. **Pembersihan Komponen Unused & Optimization (`App.tsx`):**
   - Menghapus komponen dashboard lama/unused: `AlumniDashboard.tsx` dan `ViewerDashboard.tsx`.
   - Merapikan import dan routing aplikasi di `App.tsx`.

### 📁 File Diubah & Ditambahkan
- **[NEW]** `public/Poster CDC WEB UMK (1).svg`
- **[NEW]** `public/Poster CDC WEB UMK slide 1.svg`
- **[NEW]** `public/VISI & MISI (3).svg`
- **[NEW]** `public/poster-cdc-web-umk-1.svg`
- **[NEW]** `public/poster-cdc-web-umk-2.svg`
- **[NEW]** `public/visi-misi-cdc.svg`
- **[MODIFY]** `src/App.tsx`
- **[MODIFY]** `src/components/Header.tsx`
- **[MODIFY]** `src/components/HeroSlider.tsx`
- **[MODIFY]** `src/components/PublicLayout.tsx`
- **[MODIFY]** `src/components/Register.tsx`
- **[DELETE]** `src/components/AlumniDashboard.tsx`
- **[DELETE]** `src/components/ViewerDashboard.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Penambahan asset poster SVG CDC UMK & Visi-Misi di folder `public/`
- [x] Pembaruan banner slider hero (`HeroSlider.tsx`)
- [x] Integration layout baru di Beranda (`PublicLayout.tsx`)
- [x] Refactoring tampilan form registrasi (`Register.tsx`)
- [x] Removal file komponen unused `AlumniDashboard.tsx` & `ViewerDashboard.tsx`
- [x] Verifikasi build & lint passed
## Tanggal: 7 Agustus 2026
**Fokus Pekerjaan:** Perbaikan Layout Beranda, Pengaturan Dinamis Form Lowongan, Perbaikan Filter Lokasi & Kategori "Lainnya", Restrukturisasi Profil User, Penyederhanaan Role System, & Upload Foto Lokal.

### 🚀 Ringkasan Perubahan UI & Feature Updates

1. **Perbaikan Tampilan Tanggal Upload Info Karir CDC Terkini (`Beranda` & `Sidebar`)**:
   - Memperbaiki tata letak badge tanggal penguploadan lowongan pada kartu Info Karir CDC Terkini agar rapi dan tidak menumpuk (*text overlap*).

2. **Pengaturan Form Lamaran & Sub-Judul Dinamis (`JobApplicationModal.tsx` & `JobDetail.tsx`)**:
   - Mengatur agar unggah berkas CV bersifat **wajib** (*required*) saat mengajukan lamaran pekerjaan.
   - Mengatur kondisional tampilan sub-judul pada halaman `JobDetail.tsx`: Jika Mitra tidak mengisi detail konten tertentu (seperti Tanggung Jawab, Persyaratan/Kualifikasi, Benefit), maka sub-judul terkait otomatis **disembunyikan** dari halaman detail lowongan.

3. **Perbaikan Input Kuota Penerimaan (`MitraDashboard.tsx`)**:
   - Menghapus perilaku default angka `0` saat menghapus input kuota penerimaan pada form posting lowongan mitra.
   - Mencegah timbulnya angka nol di depan (*leading zero*, contoh: `08` saat menginput `8`).

4. **Integrasi Edit Lowongan & Pengurutan Lowongan Terbaru (`data.ts`, `MitraDashboard.tsx`, `JobSearchMasterDetail.tsx`)**:
   - Menghubungkan fitur edit lowongan sehingga perubahan data oleh Mitra langsung **terrefleksi secara real-time** pada tampilan *Job Info*, *Search Job*, *Beranda*, dan detail lowongan.
   - Pengurutan lowongan (*sorting*): Mengatur agar lowongan teratas diurutkan berdasarkan **tanggal penguploadan terbaru** (`createdAt`), dan saat lowongan diedit, posisinya **tidak tergeser ke paling atas**.
   - Menampilkan tanggal penguploadan asli di label poster.

5. **Penyempurnaan Filter Lokasi & Kategori "Lainnya" untuk Luar Indonesia (`JobSearchMasterDetail.tsx`, `MitraDashboard.tsx`)**:
   - Perbaikan hirarki filter Provinsi & Kota: Jika suatu kota tidak diceklis namun provinsinya diceklis (contoh: *Sumatera Utara* diceklis, *Medan* tidak diceklis), lowongan dari kota di provinsi tersebut **tetap muncul di hasil pencarian**.
   - Menambahkan checkbox **"Lainnya"** pada filter lokasi untuk opsi luar Indonesia. Jika Mitra menginput lokasi luar negeri (seperti *Jepang, Jerman, Tokyo, dll.*), data otomatis terkategori ke lokasi **"Lainnya"** saat difilter, tetapi tetap menampilkan nama lokasi asli di halaman detail lowongan.

6. **Penterjemahan Antarmuka Dashboard User ke Bahasa Indonesia (`MahasiswaDashboard.tsx`, `StudentProfileView.tsx`)**:
   - Mengubah seluruh teks navigasi, header, label, dan tombol pada Dashboard Mahasiswa / User menjadi **Bahasa Indonesia** yang bersih dan profesional dengan tetap mempertahankan istilah baku industri (*CV, Email, WhatsApp, Career Portal UMK*).

7. **Restrukturisasi Halaman Profil Saya (`StudentProfileView.tsx`)**:
   - Merombak total susunan halaman *Profil Saya* menjadi urutan hirarki berikut:
     1. **Foto Profil** (Avatar + tombol upload kamera)
     2. **Nama** (Nama Lengkap)
     3. **Status** (Badge Mahasiswa / Alumni)
     4. **Universitas** (Universitas Muhammadiyah Kendari)
     5. **Tentang Saya** (Bio & profil singkat + tombol Edit Bio)
     6. **Data Pribadi** (Nama Lengkap, Email, No. Telepon/WA, Jenis Kelamin, Kewarganegaraan, Agama, Suku/Etnis, Hak Kerja)
     7. **Pendidikan** (Perguruan Tinggi & Sekolah Menengah + Tombol Tambah Pendidikan)
     8. **Skill / Keahlian** (Badges skill interaktif + Tombol Kelola Skill)
     9. **Pengalaman** (Pengalaman Kerja / Organisasi + Tombol Tambah Pengalaman)
     10. **Bahasa** (Daftar Bahasa yang dikuasai + Tombol Tambah Bahasa)
     11. **Preferensi Karir** (Jenis Kesempatan, Tanggal Siap Kerja, Industri Diminati, Lokasi Kerja Impian)

8. **Unggah Foto Profil dari Berkas Lokal (`StudentProfileView.tsx`)**:
   - Mengganti prompt URL foto profil menjadi **unggahan berkas langsung dari penyimpanan lokal** (`<input type="file" accept="image/*" />`).

9. **Penyederhanaan Peranan System & Unifikasi Role User (`App.tsx`, `types.ts`, `data.ts`, `Register.tsx`)**:
   - Menyederhanakan peranan pengguna menjadi **3 Role Utama**: **`USER`** (Mahasiswa / Alumni / Pencari Kerja), **`MITRA`** (Perusahaan), dan **`ADMIN CDC`**.
   - Menghapus peranan/dashboard alumni terpisah dan menyatukannya ke dalam **Dashboard User**.

10. **Interaktivitas Edit Info Utama di Hero Header Profil (`StudentProfileView.tsx`)**:
    - Membuat Status Badge (**`Mahasiswa` / `Alumni`**), **Nama Lengkap**, dan **Nama Universitas** di *Hero Banner* dapat diklik dan diedit langsung melalui modal **Edit Info Utama Profil**.

11. **Penghapusan Halaman / Tab Pengalaman Virtual (`StudentProfileView.tsx`)**:
    - Menghapus tab dan konten **Pengalaman Virtual** dari navigasi profil pengguna agar antarmuka lebih padat, ringkas, dan fokus.

### 📁 File Diubah & Ditambahkan
- **[MODIFY]** `src/types.ts`
- **[MODIFY]** `src/data.ts`
- **[MODIFY]** `src/App.tsx`
- **[MODIFY]** `src/components/MahasiswaDashboard.tsx`
- **[MODIFY]** `src/components/StudentProfileView.tsx`
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx`
- **[MODIFY]** `src/components/JobDetail.tsx`
- **[MODIFY]** `src/components/JobApplicationModal.tsx`
- **[MODIFY]** `src/components/MitraDashboard.tsx`
- **[MODIFY]** `src/components/Register.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Perbaikan tampilan tanggal upload lowongan tidak menumpuk di Beranda & Sidebar
- [x] Syarat wajib upload CV pada form lamaran pekerjaan
- [x] Sub-judul dinamis di Job Detail (menyembunyikan bagian yang tidak diisi mitra)
- [x] Perbaikan form input kuota penerimaan mitra (tanpa angka 0 di depan)
- [x] Integrasi edit lowongan real-time & pengurutan lowongan berdasarkan tanggal upload terbaru
- [x] Filter lokasi presisi (provinsi diceklis mencakup kota) & opsi checkbox "Lainnya" untuk luar Indonesia
- [x] Penterjemahan lengkap Dashboard Mahasiswa/User ke Bahasa Indonesia
- [x] Restrukturisasi hirarki halaman Profil Saya sesuai urutan spesifik
- [x] Unggah foto profil dari berkas lokal (native file input accept image/*)
- [x] Penyederhanaan role system menjadi 3 role utama (USER, MITRA, ADMIN CDC)
- [x] Interaktivitas edit Status (Mahasiswa/Alumni), Nama, dan Universitas di Hero Header Profil
- [x] Penghapusan tab/halaman Pengalaman Virtual dari profil pengguna
- [x] Verifikasi kompilasi build produksi `npm run build` (0 error)
- [x] Pencatatan laporan progres lengkap di `progres.md` (7 Agustus 2026)

### ✅ Status Verifikasi Runtime
- Build produksi lolos (`npm run build` → exit 0).
- Diuji via browser (`vite preview` + fast-role Admin CDC → Konten Karir → Pembuatan → Berita & Artikel): ribbon 19 kontrol muncul lengkap. Ketik "Ini teks uji coba format" → seleksi semua → klik **Bold** → textarea jadi `**Ini teks uji coba format**` dan preview render `<strong>` (bold terbukti). Klik **Align Center** → textarea jadi `**...**[block align=center spacing=1]\n[/block]` dan preview render 2 paragraf (block terbungkus terbukti). Mekanisme shared helper (`wrapInline`/`wrapInlineArg`/`toggleLinePrefix`/`changeCase`/`fontSizeAdjust`/`clearFormatting`/`wrapBlock`) dipakai seluruh tombol, sehingga Italic/Underline/Strike/Sub/Sup/Case/FontSize/Clear/List/Spacing/Color/Highlight berjalan dengan logika sama.
- Catatan: simpan berita **butuh thumbnail 16:9** (validasi benar) — untuk tes persist penuh perlu upload file; di sesi ini fokus ke toolbar (sudah terbukti). CRUD KontenKarir + persist sudah terverifikasi di sesi sebelumnya.
- Item backlog lain dari audit (render KontenKarir ke publik, sinkronisasi lowongan, parser A./a. penomoran, handler `""`, multi-gambar+alignment berita, validasi rasio thumbnail, guard admin utama) masih tertunda — lihat laporan analisis.

---

## Tanggal: 8 Agustus 2026 (Sesi 5)
**Fokus Pekerjaan:** Desain Visual AdminDashboard lebih hidup & interaktif

### 🚀 Ringkasan Perubahan
Tampilan AdminDashboard diremajakan agar tidak flat/bosan, tanpa ubah fungsionalitas:
1. **Header gradient** (espresso → forest green) + badge "LIVE" berdenyut (pulse-ring), profil user lebih rapi (nama + "Panel Administrator"), tombol logout glass style.
2. **Sidebar aktif** jadi gradient emerald + ikon scale + dot berdenyut; hover item jadi emerald-50.
3. **Stat cards** kini berwarna per kategori dengan ikon (Users/Clock/Briefcase/CalendarDays/Layers), angka besar, hover-lift (naik + shadow), animasi masuk staggered (stagger-1..5).
4. **Greeting dinamis** "Halo, {nama} 👋" + tanggal Indonesia di Ringkasan.
5. **Grafik** bar pakai gradient + animasi tumbuh (bar-grow) + hover tooltip angka + tombol interval jadi emerald aktif.
6. **Semua panel** (Menunggu Approval, Aktivitas, Top 5 Mitra, Berita Terbaru) dapat `anim-fade-up` + `hover-lift`, heading berikon, list item hover highlight, tombol Setujui/Tolak ada `active:scale-95`, ranking Top 5 pakai warna medali.

### 📁 File Diubah
- **[MODIFY]** `src/components/AdminDashboard.tsx` (header, sidebar, stat cards, greeting, grafik, 4 panel)
- **[MODIFY]** `src/index.css` (keyframe fadeUp/fadeIn/popIn/barGrow/pulseRing + utility anim-fade-up/anim-fade-in/anim-pop/bar-grow/pulse-ring/hover-lift/live-dot + stagger)
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Header gradient + badge LIVE berdenyut
- [x] Sidebar item aktif gradient + dot pulse + hover emerald
- [x] Stat cards berwarna + ikon + hover-lift + staggered anim
- [x] Greeting dinamis + tanggal Indonesia
- [x] Grafik bar gradient + bar-grow + hover tooltip
- [x] Panel hover-lift + icon heading + interactive buttons
- [x] Import ikon baru (Users, CalendarDays, Layers, TrendingUp, Activity, Trophy)
- [x] Verifikasi `npm run build` (exit 0)

### ✅ Status Verifikasi Runtime
- Build produksi lolos (`npm run build` → exit 0).
- Diuji via browser (`vite preview` + fast-role Admin CDC): header gradient + badge LIVE muncul, sidebar Ringkasan aktif hijau, greeting "Halo, Operator 👋" + tanggal tampil, grafik bar hijau, panel Menunggu Approval/Aktivitas/Top 5/Berita Terbaru render tanpa error. (Screenshot: `C:\Users\KH4LIF4H\AppData\Local\hermes\cache\screenshots\browser_screenshot_b055851db2624e2f94e550b931c903e6.png` — vision backend 404, file bisa dibuka manual.)
- Catatan: label role diubah jadi "Panel Administrator" (sebelumnya dobel dengan nama user "Operator CDC UM Kendari").

---

## Tanggal: 8 Agustus 2026 (Sesi 6) — Fix Duplikat Import + Runtime
**Fokus:** Bereskan error `Identifier 'Users' has already been declared` & `CalendarDays is not defined` saat dev server.

### 🐞 Root Cause
- Sesi 5 menambah import `Users, CalendarDays, Layers` di atas, padahal `Users` SUDAH ada di bawah (line ~79). `npm run build` (esbuild) mentolerir duplikat, sehingga lolos — tapi `npm run dev` (Babel) strict → crash `Users already declared`.
- Saat perbaiki, gue kehapus `CalendarDays` & `Layers` (padahal dipakai di stat cards) → runtime `CalendarDays is not defined` (React crash, blank page).

### 🔧 Fix
- Hapus duplikat `Users` (biarkan yang di bawah), kembalikan `CalendarDays` + `Layers` di atas (tanpa duplikat `Users`). Hapus juga duplikat `ChevronDown` (ada 2).
- Verifikasi via script: 0 duplikat import, semua ikon (`Users/CalendarDays/Layers/TrendingUp/Activity/Trophy`) ter-import & valid.

### ✅ Status
- Dev server fresh di **port 3002** (`npx vite --port 3002 --host 0.0.0.0`) → render AdminDashboard + semua panel TANPA error (diuji via browser: header LIVE, greeting, grafik, panel lengkap muncul).
- Catatan environment: port 3000 & 3001 masih dihuni instance Vite orphan (dari session terminal sebelumnya, berisi error lama) yang tidak bisa di-kill dari session ini. User harus buka **http://localhost:3002/** (bukan 3000/3001).

### 📁 File Diubah
- **[MODIFY]** `src/components/AdminDashboard.tsx` (bersihkan import duplikat)
- **[MODIFY]** `progres.md`

---

## Tanggal: 8 Agustus 2026 (Sesi 7)
**Fokus Pekerjaan:** Penambahan Sub-menu Tracer Study & Perbaikan TS Error

### 🚀 Ringkasan Perubahan
1. **Sub-menu Tracer Study:** Memperbarui menu dropdown "Tracer Study" di Header agar berisi 5 pilihan sub-menu yang mengarah ke portal resmi Tracer Study UM Kendari (sesuai request user):
   - **Panduan Tracer Study** -> `https://tracerstudy.umkendari.ac.id/page/panduan`
   - **Form Kuesioner Tracer Study** -> `https://tracerstudy.umkendari.ac.id/page/survey`
   - **Mengisi Tracer Study** -> `https://tracerstudy.umkendari.ac.id`
   - **Laporan Tracer Study** -> `https://tracerstudy.umkendari.ac.id/page/laporan`
   - **Laporan Monev Tracer Study** -> `https://tracerstudy.umkendari.ac.id/page/monev`
2. **Perbaikan TypeScript Error:** Memperbaiki tipe data error pada mock data `SEED_TRACER_STUDIES` di `src/data.ts` di mana nilai `kesesuaianBidang` tidak sesuai dengan definisi tipe data (mengubah `'sangat_sesuai'` menjadi `'sangat_erat'` dan `'sesuai'` menjadi `'erat'`).
3. **Penyebaran:** Melakukan `git commit` dan `git push` langsung ke repositori GitHub `main`.

### 📁 File Diubah
- **[MODIFY]** `src/components/Header.tsx` (Update data navigasi Tracer Study)
- **[MODIFY]** `src/data.ts` (Fix type data mock SEED_TRACER_STUDIES)
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Update menu navigasi Tracer Study dengan 5 sub-menu resmi
- [x] Perbaiki error type check `kesesuaianBidang` di data seed
- [x] Jalankan verifikasi linting (`npm run lint` → lolos 100%)
- [x] Lakukan Git commit dan Git push ke repo GitHub

### ✅ Status Verifikasi Runtime
- Lolos typechecking TypeScript (`npm run lint` → 0 error).
- Server pengembangan berjalan lancar dan navigasi menu desktop maupun mobile berfungsi normal mengarah ke tautan eksternal portal Tracer Study resmi.

---

## Tanggal: 11 Agustus 2026
**Fokus Pekerjaan:** Penyamaan Ukuran & Penyiapan Placeholder Pamphlet Sub-menu Layanan (Admin Upload Input)

### 🚀 Ringkasan Perubahan

1. **Pembersihan & Resolusi Git Merge Conflict:**
   - Menyelesaikan *git merge conflict markers* pada file `progres.md`.

2. **Penyesuaian Dimensi Container Sub-menu Layanan:**
   - Menyamakan lebar container seluruh sub-menu layanan dari `max-w-5xl` menjadi `max-w-7xl` agar presisi dan sejajar dengan container utama `LayananContainer.tsx` dan `Beranda`.

3. **Pembersihan Konten Teoretis / Mockup Teks Statis:**
   - Menghapus seluruh teks statis mockup (Deskripsi, Tujuan, Pihak Terlibat, Waktu/Tempat, Alat, dan Mekanisme) serta banner internal dari 7 file komponen sub-menu Layanan:
     - `src/components/layanan/BimbinganKarir.tsx` (Konseling Karir)
     - `src/components/layanan/Workshop.tsx` (Workshop Pengembangan Karir)
     - `src/components/layanan/Softskill.tsx` (Pelatihan Softskill & Kewirausahaan)
     - `src/components/layanan/Seminar.tsx` (Seminar Sukses Berkarir)
     - `src/components/layanan/CareerFair.tsx` (Job Fair & Bursa Kerja)
     - `src/components/layanan/CampusHiring.tsx` (Campus Hiring - Recruitment)
     - `src/components/layanan/Magang.tsx` (Magang)

4. **Penyiapan Tampilan Placeholder Banner Kosong Admin:**
   - Mengubah tampilan setiap sub-menu Layanan menjadi area placeholder banner kosong dengan *dashed border* yang disiapkan khusus untuk tempat pengunggahan pamphlet oleh Admin CDC.

5. **Verifikasi Kompilasi & Typecheck:**
   - Menjalankan `npm run lint` dan `npm run build`.
   - Hasil akhir: ✅ `npm run lint` passed (0 error) & ✅ `npm run build` passed (0 error).

### 📁 File Diubah
- **[MODIFY]** `src/components/layanan/BimbinganKarir.tsx`
- **[MODIFY]** `src/components/layanan/Workshop.tsx`
- **[MODIFY]** `src/components/layanan/Softskill.tsx`
- **[MODIFY]** `src/components/layanan/Seminar.tsx`
- **[MODIFY]** `src/components/layanan/CareerFair.tsx`
- **[MODIFY]** `src/components/layanan/CampusHiring.tsx`
- **[MODIFY]** `src/components/layanan/Magang.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Resolusi conflict markers pada `progres.md`
- [x] Penyesuaian container width `max-w-7xl` pada seluruh sub-menu layanan
- [x] Pembersihan teks mockup statis dari 7 komponen sub-menu layanan
- [x] Penyiapan placeholder banner kosong (admin upload input)
- [x] Verifikasi build & lint passed 100%

---


## Tanggal: 11 Agustus 2026 (Sesi 2)
**Dikerjakan oleh:** Fahrul  
**Fokus Pekerjaan:** Pengaktifan Sub-menu & Integrasi Tes Potensi Minat Kerja (Klob Meter)

### 🚀 Ringkasan Perubahan
1. **Integrasi Tes Potensi Minat Kerja (`TesMinat.tsx`):**
   - Menambahkan CTA Card interaktif **"Powered by Klob Meter"** dengan desain gradient eksklusif.
   - Menautkan tombol *"Akses Tes Klob Meter"* langsung ke platform resmi Klob Meter (`https://www.klob.id/klob-journey/klob-meter`).
   - Menyusun ulang informasi Tujuan, Pihak Terlibat, Waktu & Tempat, Alat & Modul, serta Mekanisme pelaksanaan tes minat.
   - Menambahkan kartu keunggulan *"Mengapa Mengikuti Klob Meter?"* untuk mengedukasi pengguna.

2. **Pengaktifan Kembali Sub-Menu Navigasi:**
   - Memasukkan kembali item **Tes Potensi Minat Kerja** ke dalam menu navigasi Layanan.
   - Mengatur integrasi tautan & tab sub-menu di `Header.tsx`, `MegaMenu.tsx`, `PublicLayout.tsx`, dan `LayananContainer.tsx`.

### 📁 File Diubah
- **[MODIFY]** `src/components/layanan/TesMinat.tsx`
- **[MODIFY]** `src/components/Header.tsx`
- **[MODIFY]** `src/components/MegaMenu.tsx`
- **[MODIFY]** `src/components/PublicLayout.tsx`
- **[MODIFY]** `src/components/layanan/LayananContainer.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Pengaktifan sub-menu Tes Potensi Minat Kerja di navigasi utama CDC
- [x] Integrasi link platform Klob Meter pada `TesMinat.tsx`
- [x] Redesign UI Hero CTA & Card Informasi Klob Meter
- [x] Update dokumentasi `progres.md`


## Tanggal: 11 Agustus 2026 — Sesi 2 (Malam)
**Developer:** Ikhsan
**Fokus Pekerjaan:** Debug & Perbaikan Koneksi Data — Lamaran Mahasiswa → Dashboard Mitra

---

### 🚀 Ringkasan Perubahan

#### 🐛 Bug Utama yang Diperbaiki
**Lamaran yang dikirim mahasiswa tidak muncul di Mitra Dashboard → Pelamar & Seleksi.**

#### 🔍 Proses Investigasi
Dilakukan investigasi menyeluruh terhadap alur data dari sisi mahasiswa ke sisi mitra:

1. **Telusuri `PengajuanMagang`** — Memeriksa interface di `src/types.ts`, fungsi `applyForJob()` di `src/data.ts`, dan handler submit di `MahasiswaDashboard.tsx`.
2. **Verifikasi identitas lowongan** — Memastikan `job.id` dan `job.mitraId` tersimpan dengan benar ke `PengajuanMagang`.
3. **Penambahan debug log sementara** — Melacak nilai aktual yang tersimpan dan yang dibaca oleh `loadMitraData()`.
4. **Temuan akar masalah** — `QuotaExceededError` pada `localStorage.setItem()`.

#### ✅ Akar Masalah Ditemukan
**`localStorage` quota terlampaui (`QuotaExceededError`).**

- Setiap lamaran menyimpan file CV/Portfolio mahasiswa sebagai **base64 Data URL** di field `berkasUrl`.
- File PDF yang di-encode base64 bisa berukuran **1–4 MB per lamaran**.
- Dengan beberapa lamaran tersimpan, total data melebihi batas localStorage **±5 MB per origin**.
- Akibatnya: `saveToDB('pengajuan_magang', ...)` **gagal secara silent** → lamaran tidak pernah benar-benar tersimpan → tidak muncul di Mitra Dashboard.
- Modal "Lamaran Berhasil Terkirim!" tetap tampil karena error tidak ditangkap di level UI.

#### 🔧 Perbaikan yang Dilakukan

**1. `src/data.ts` — `applyForJob()`**
- Menghapus penyimpanan `berkasUrl` (konten base64 file) ke localStorage.
- Hanya menyimpan `berkasNama` (nama file saja) — cukup untuk keperluan tampilan di Mitra Dashboard.
- Ini mengurangi ukuran data per lamaran dari ~2MB menjadi <1KB.

**2. `src/data.ts` — `initializeDB()` + `getFromDB()`**
- Menambahkan flag `_dbInitialized` (module-level) sebagai guard agar `initializeDB()` hanya berjalan **sekali per page load**, bukan setiap kali `getFromDB()` dipanggil.
- Mencegah potensi reset data yang tidak disengaja saat pembacaan data berlangsung.

**3. `src/App.tsx`**
- Memastikan `reloadDatabase()` dipanggil pada event auth (login, switch role, logout) agar state React sinkron dengan localStorage.

### 📁 File Diubah
- **[MODIFY]** `src/data.ts` — Hapus berkasUrl dari storage, tambah guard `_dbInitialized`
- **[MODIFY]** `src/components/MitraDashboard.tsx` — Cleanup debug log, pastikan `loadMitraData()` berjalan pada mount
- **[MODIFY]** `src/App.tsx` — Tambah `reloadDatabase()` pada event auth
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Identifikasi akar masalah: `QuotaExceededError` akibat base64 file di localStorage
- [x] Hapus penyimpanan `berkasUrl` (base64) dari `applyForJob()` di `src/data.ts`
- [x] Tambah guard `_dbInitialized` agar inisialisasi DB hanya terjadi sekali
- [x] Pastikan sinkronisasi data setelah role switch di `src/App.tsx`
- [x] Jalankan verifikasi linting (`npm run lint` → 0 error, lolos 100%)
- [x] Debug log sementara ditambahkan dan kemudian dihapus kembali setelah diagnosa selesai

### ✅ Status Verifikasi Runtime
- Lolos typechecking TypeScript (`npm run lint` → 0 error).
- Lamaran yang dikirim mahasiswa kini **tersimpan dengan benar** ke localStorage.
- Lamaran muncul di **Mitra Dashboard → Pelamar & Seleksi** setelah switch role.
- Ukuran data per lamaran turun drastis dari ~2 MB → <1 KB per entri.

---

## Tanggal: 12 Agustus 2026
**Developer:** Ikhsan  
**Fokus Pekerjaan:** Redesign Dashboard Mitra (Senior Engineer Grade), Pengapusan Filter/Badge Magang & Expired, serta Perbaikan Sinkronisasi Lamaran Saya

---

### 🚀 Ringkasan Perubahan

#### 1. Redesign Dashboard Mitra Perusahaan (`MitraDashboard.tsx`)
- **Header Vercel Dark Mesh Style**: Mengubah header dashboard Mitra menjadi `bg-slate-950/95 backdrop-blur-md` dilengkapi badge resmi **`VERIFIED MITRA`** bercahaya dan info PIC instansi.
- **Sidebar Navigasi Glassmorphic**: Memperbarui navigasi menu dengan *active pill indicator* (`#0077C6`), ikon SVG modern, serta *Kemitraan Health Card* beranimasi.
- **Banner Hero Instansi**: Menyediakan kartu ucapan selamat datang berstandar korporat modern dengan avatar instansi bergradien, quick stat counters (Total Lowongan, Total Pelamar, Diterima & Rekrut), dan tombol aksi cepat (*Posting Lowongan* & *Edit Profil*).
- **Tabel Pelamar & Riwayat Seleksi**: Memperbarui tampilan data pelamar dengan **Avatar Initials** (`w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600`), badge status seleksi yang bersih (`MENUNGGU REVIEW`, `INTERVIEW`, `DITERIMA`, `DITOLAK`), serta modal peninjauan berkas CV dan penjadwalan wawancara.

#### 2. Penyelarasan Khusus Lowongan Kerja (Hapus Magang & Badge Expiry Overlay)
- **Hapus Filter Tabs**: Menghapus bar tombol filter `[ Semua | Magang | Kerja ]` dari halaman katalog pekerjaan (`PublicLayout.tsx`).
- **Pembaruan Judul Halaman**: Mengubah judul utama menjadi **"Daftar Lowongan Kerja"**.
- **Enforce Job Vacancy Only**: Menerapkan filter default `tipe !== 'magang'` pada `PublicLayout.tsx` dan `JobSearchMasterDetail.tsx` sehingga katalog hanya menampilkan lowongan kerja aktif.
- **Hapus Badge Redundan**: Menghapus badge label hijau `[ Kerja ]` dan badge merah `[ Ditutup (Expired) ]` dari overlay flyer kartu lowongan.

#### 3. Perbaikan Sinkronisasi Lamaran Saya (Dashboard Mahasiswa)
- **Fix User ID Resolution**: Memperbaiki resolusi `activeUserId` pada pembukaan modal `JobDetail.tsx` dengan membaca `localStorage.getItem('cdc_session_id') || '2'`, sehingga lamaran yang dikirim mahasiswa langsung terikat pada ID akun aktif.
- **Perluasan Filtering Lamaran**: Memperluas kriteria matching `myApplications` pada `StudentApplicationsView.tsx` dan `MahasiswaDashboard.tsx` agar menyertakan pencocokan ID demo (`usr_mhs_demo`) dan NIM pelamar.
- **Hasil**: Lamaran yang diajukan oleh mahasiswa (seperti posisi **"coba"**) kini langsung tersinkronisasi dan muncul secara *real-time* di menu **Status Lamaran & Wawancara Saya** (Lamaran Saya).

### 📁 File Diubah
- **[MODIFY]** `src/components/MitraDashboard.tsx` — Redesign header, sidebar, welcome banner, stat counters, dan tabel pelamar ke standar senior engineer
- **[MODIFY]** `src/components/PublicLayout.tsx` — Hapus filter tab bar, update judul halaman, filter lowongan kerja saja, hapus badge tipe & expired
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx` — Enforce non-magang filter, hapus badge tipe & expired overlay
- **[MODIFY]** `src/components/JobDetail.tsx` — Fix activeUserId resolution saat apply job
- **[MODIFY]** `src/components/StudentApplicationsView.tsx` — Perluas matching myApplications untuk akun mahasiswa
- **[MODIFY]** `src/components/MahasiswaDashboard.tsx` — Perluas matching myApplications untuk akun mahasiswa
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Redesign Dashboard Mitra (`MitraDashboard.tsx`) dengan Vercel/Linear dark mesh style
- [x] Penghapusan bar filter `[ Semua | Magang | Kerja ]` di halaman publik lowongan
- [x] Pembaruan judul halaman menjadi "Daftar Lowongan Kerja"
- [x] Enforcement filter lowongan kerja saja (`tipe !== 'magang'`) pada seluruh katalog
- [x] Penghapusan badge overlay `[ Kerja ]` dan `[ Ditutup (Expired) ]` dari flyer kartu lowongan
- [x] Perbaikan `activeUserId` resolution pada `JobDetail.tsx`
- [x] Perluasan kriteria `myApplications` pada `StudentApplicationsView.tsx` & `MahasiswaDashboard.tsx`
- [x] Verifikasi kelayakan lamaran muncul di menu "Lamaran Saya" secara *real-time*
- [x] Verifikasi typecheck TypeScript (`npx tsc --noEmit` → 0 error)
- [x] Pencatatan laporan progres lengkap di `progres.md` (12 Agustus 2026)

---

## Tanggal: 14 Agustus 2026 (Sesi 4)
**Developer:** ARYA APRIAWAN  
**Fokus Pekerjaan:** Revisi Tampilan EventCardLayout Sub-menu Layanan (Workshop, Softskill, Seminar)

---

### 🚀 Ringkasan Perubahan

#### 1. Revisi Informasi pada Kartu Kegiatan Sub-menu Layanan (`EventCardLayout.tsx`)
- Menghapus informasi **Lokasi**, **Nama Pemateri**, dan **Kuota Terisi** dari tampilan kartu kegiatan (`EventCardLayout.tsx`).
- Mempertahankan informasi **Tanggal & Waktu Pelaksanaan** pada kartu kegiatan.
- Mengubah label badge uploader dari nama `organizer` menjadi **"By Admin Website"** (menandakan diupload oleh admin).

#### 2. Revisi Modal Detail Kegiatan (`EventCardLayout.tsx`)
- Menghapus informasi lokasi dan pemateri dari modal detail kegiatan, hanya menyisakan **Tanggal & Waktu Pelaksanaan**.
- Mengubah label badge uploader di modal menjadi **"By Admin Website"**.

#### 3. Pembersihan Controls & Verification
- Memperbarui placeholder input pencarian menjadi `"Cari judul kegiatan..."`.
- Menguji dan meyakinkan build (`npm run lint` & `npm run build` passed 100%).

### 📁 File Diubah
- **[MODIFY]** `src/components/layanan/ui/EventCardLayout.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Penghapusan Lokasi, Pemateri, dan Kuota Terisi dari EventCardLayout
- [x] Penetapan Keterangan Tanggal & Waktu Pelaksanaan saja
- [x] Pengubahan badge uploader menjadi "By Admin Website"
- [x] Verifikasi build & lint passed 100%

### 💡 Rekomendasi Judul Commit Git
- `refactor(layanan): update EventCardLayout info date-only and admin uploader badge`


---

## Tanggal: 12 Agustus 2026 (Sesi 2)
**Developer:** ARYA APRIAWAN  
**Fokus Pekerjaan:** Redesign Card Layout, Fitur Pencarian & Filter Tanggal pada 3 Sub-menu Layanan (Workshop, Softskill, Seminar)

---

### 🚀 Ringkasan Perubahan

#### 1. Implementasi UI Card Layout Reusable (`EventCardLayout.tsx`)
- Merancang komponen modular `EventCardLayout` yang bersih, tanpa AI slop (tanpa gradient berlebihan, border & shadow tajam/lembut, tipografi rapi).
- **Control Bar**: Dilengkapi dengan **Main Search Bar**, **Dropdown Status** (*Pendaftaran Dibuka*, *Segera Hadir*, *Selesai*), dan **Filter Rentang Tanggal** (*Mulai s/d Akhir*) beserta tombol *Reset Filter*.
- **Kartu Kegiatan**: Menampilkan gambar 16:9, organizer, judul, deskripsi singkat, tanggal (format Indonesia), waktu, lokasi, pemateri, kuota peserta, serta badge status beranimasi halus.
- **Modal Detail Interactive**: Pengguna dapat mengeklik *"Detail Kegiatan"* untuk membuka dialog modal interaktif lengkap dengan deskripsi detail, lokasi, pemateri, dan tombol CTA *"Daftar Sekarang"* ke link eksternal.

#### 2. Update Sub-menu Layanan
- **`Workshop.tsx`**: Menggunakan `EventCardLayout` untuk *Workshop Pengembangan Karir*.
- **`Softskill.tsx`**: Menggunakan `EventCardLayout` untuk *Pelatihan Softskill & Kewirausahaan*.
- **`Seminar.tsx`**: Menggunakan `EventCardLayout` untuk *Seminar Sukses Berkarir*.

#### 3. Integrasi Data Dummy & Type Definition
- Menambahkan tipe `EventLayananItem` pada `src/types.ts` & update `JenisKonten` untuk `seminar`.
- Menambahkan data dummy event realistis `SEED_EVENT_LAYANAN` di `src/data.ts` (kegiatan UI/UX, CV ATS, React, Public Speaking, Kewirausahaan Sultra, Seminar Gen-AI, BUMN, dll.).
- Meng-update `AdminDashboard.tsx` agar sinkron dengan tipe `JenisKonten` baru.

### 📁 File Diubah & Ditambahkan
- **[NEW]** `src/components/layanan/ui/EventCardLayout.tsx`
- **[MODIFY]** `src/types.ts`
- **[MODIFY]** `src/data.ts`
- **[MODIFY]** `src/components/AdminDashboard.tsx`
- **[MODIFY]** `src/components/layanan/Workshop.tsx`
- **[MODIFY]** `src/components/layanan/Softskill.tsx`
- **[MODIFY]** `src/components/layanan/Seminar.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Pembuatan data seed event kegiatan `SEED_EVENT_LAYANAN` di `src/data.ts`
- [x] Pembuatan komponen `EventCardLayout.tsx` (Card grid, search, filter tanggal & status, detail modal)
- [x] Integrasi `EventCardLayout` ke `Workshop.tsx`, `Softskill.tsx`, dan `Seminar.tsx`
- [x] Verifikasi `npm run lint` & `npm run build` passed (0 error)

---

## Tanggal: 12 Agustus 2026 — Sesi 3
**Developer:** Ikhsan  
**Fokus Pekerjaan:** Pembaruan Terminologi Kandidat, Penyesuaian Tabel Pelamar & Seleksi, Integration Role Job Seeker, dan Logika Dinamis Input NIM

---

### 🚀 Ringkasan Perubahan

#### 1. Pembaruan Terminologi & UI Dashboard User
- **Fast-Role Switcher Bar**: Mengubah label tombol role switcher di top bar dari `MAHASISWA` menjadi `USER`.
- **Label Email**: Mengubah label `EMAIL KAMPUS` menjadi `EMAIL` pada sekilas Data Pribadi dan form edit profil.
- **Sub-deskripsi Identitas**: Mengubah teks `Informasi identitas resmi mahasiswa pelamar` menjadi `Informasi identitas resmi pelamar`.
- **Header Kanan Atas**: Menghapus label subteks `"Mahasiswa"` di bawah nama pengguna pada header kanan atas dashboard user.

#### 2. Penyesuaian Kolom Tabel Pelamar & Seleksi Mitra (`MitraDashboard.tsx`)
- **Penghapusan Kolom NIM**: Menghapus kolom **NIM** dari tabel pelamar desktop dan kartu pelamar versi mobile.
- **Pembaruan Header Kolom Tabel**: Mengubah nama kolom menjadi:
  1. `KANDIDAT`
  2. `PENDIDIKAN`
  3. `POSISI YANG DILAMAR`
  4. `TANGGAL MELAMAR`
  5. `STATUS SELEKSI`
  6. `AKSI`

#### 3. Penyelarasan Terminologi Modal Detail Kandidat (`MitraDashboard.tsx`)
- **Header Modal**: Mengubah judul modal dari `Detail Pelamar Lowongan` menjadi `DETAIL KANDIDAT`.
- **Sub-header Modal**: Mengubah format dari `NIM: xxx • Prodi` menjadi `{Role/Status} · {Pendidikan}` (misal: `Mahasiswa · Teknik Informatika`, `Alumni · ...`, `Job Seeker · ...`). NIM dihapus sepenuhnya dari header modal.
- **Kartu Profil**: Mengubah `PROFIL PELAMAR` menjadi `PROFIL KANDIDAT`.
- **Label Fields**: Mengubah `NIM` menjadi `NIM (Data Akademik)` dan `Program Studi` menjadi `Pendidikan`.
- **Tentang**: Mengubah section `TENTANG SAYA` menjadi `TENTANG KANDIDAT`.
- **Catatan Internal**: Mengubah `CATATAN SELEKSI (INTERNAL MITRA)` menjadi `CATATAN INTERNAL KANDIDAT`.
- **Badge Kerahasiaan**: Mengubah `🔒 Rahasia (Tidak Terlihat oleh Mahasiswa)` menjadi `🔒 Rahasia (Tidak Terlihat oleh Kandidat)`.
- **Informasi CV**: Mengubah `Berkas CV Resmi Mahasiswa UMK` menjadi `CV Kandidat`.
- **Tombol Aksi**: Mengubah `Mulai Review Pelamar` menjadi `Mulai Review Kandidat`.

#### 4. Penambahan Role Status "Job Seeker" & Logika Dinamis NIM
- **Tipe & Interface**: Menambahkan `'job_seeker'` pada `UserRole` dan `userStatusType` di `src/types.ts`.
- **Menu Profil User**: Menambahkan pilihan **Job Seeker** pada dropdown status keanggotaan profil user (`StudentProfileView.tsx`).
- **Form Lamaran**: Menghapus input NIM dari modal form lamaran (`JobApplicationModal.tsx`) sehingga form kembali ke 2 kolom (Email & Pendidikan/Prodi).
- **Logika Dinamis NIM pada Profil**:
  - **Jika Status = Mahasiswa**: Menampilkan kotak data NIM pada *Data Pribadi* dan input NIM pada modal *Edit Data*.
  - **Jika Status = Alumni / Job Seeker**: Menyeleksi dan mengosongkan NIM serta menyembunyikan kotak dan input NIM dari profil.
- **Logika Pengiriman & Tampilan Mitra**:
  - `applyForJob` di `src/data.ts` otomatis mengeset NIM menjadi kosong jika pelamar bukan berstatus Mahasiswa.
  - Baris `NIM (Data Akademik)` di modal Mitra hanya muncul jika kandidat berstatus **Mahasiswa**.

### 📁 File Diubah
- **[MODIFY]** `src/types.ts` — Tambah role 'job_seeker' dan field userStatusType
- **[MODIFY]** `src/data.ts` — Update applyForJob untuk conditional NIM berdasarkan status Mahasiswa
- **[MODIFY]** `src/App.tsx` — Update Fast-Role Tester label dari Mahasiswa ke USER
- **[MODIFY]** `src/components/MahasiswaDashboard.tsx` — Hapus subteks "Mahasiswa" di bawah nama user header, update defaultNim
- **[MODIFY]** `src/components/MitraDashboard.tsx` — Restrukturisasi kolom tabel pelamar & seleksi, update terminologi Kandidat, hapus NIM dari header modal, render NIM kondisional
- **[MODIFY]** `src/components/StudentProfileView.tsx` — Tambah role Job Seeker, buat tampilan & edit NIM kondisional (hanya untuk Mahasiswa)
- **[MODIFY]** `src/components/JobApplicationModal.tsx` — Hapus input NIM dari form lamaran kerja
- **[MODIFY]** `src/components/JobDetail.tsx` — Pass defaultNim prop ke JobApplicationModal
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Pembaruan label Fast-Role Tester dari MAHASISWA ke USER
- [x] Pembaruan label Email & sub-deskripsi identitas di profil user
- [x] Menghapus kata "Mahasiswa" di bawah nama user pada header kanan atas
- [x] Restrukturisasi header kolom tabel Pelamar & Seleksi (KANDIDAT, PENDIDIKAN, POSISI, TANGGAL, STATUS, AKSI)
- [x] Penghapusan kolom NIM dari tabel & kartu pelamar Mitra
- [x] Penyelarasan seluruh terminologi pelamar menjadi Kandidat pada modal Mitra
- [x] Penghapusan NIM dari header modal detail kandidat Mitra
- [x] Integrasi role baru **Job Seeker** pada profil user & types
- [x] Penghapusan input NIM dari form pengajuan lamaran kerja
- [x] Penerapan logika kondisional NIM (hanya tampil jika status = Mahasiswa)
- [x] Pembersihan NIM otomatis saat status diubah dari Mahasiswa ke Alumni/Job Seeker
- [x] Verifikasi typecheck TypeScript (`npx tsc --noEmit` → 0 error)
- [x] Pencatatan laporan progres lengkap di `progres.md` (12 Agustus 2026 — Sesi 3)

---

## Tanggal: 12 Agustus 2026 — Sesi 4
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Penambahan Menu Navigasi "PRESTASI" Multi-Level Dropdown pada Header & Integration Halaman Publik Prestasi Mahasiswa

---

### 🚀 Ringkasan Perubahan

#### 1. Penambahan Menu "PRESTASI" Multi-Level Dropdown (`Header.tsx`)
- Menambahkan menu utama **PRESTASI** tepat di sebelah kanan menu **SIMBELMAWA** dan sebelum menu **Register**.
- Merancang struktur sub-menu bertingkat (2-level nested dropdown):
  - **Internasional**: `Akademik` (`tab: 'prestasi-internasional-akademik'`), `Non-Akademik` (`tab: 'prestasi-internasional-non-akademik'`)
  - **Nasional**: `Akademik` (`tab: 'prestasi-nasional-akademik'`), `Non-Akademik` (`tab: 'prestasi-nasional-non-akademik'`)
  - **Wilayah**: `Akademik` (`tab: 'prestasi-wilayah-akademik'`), `Non-Akademik` (`tab: 'prestasi-wilayah-non-akademik'`)
- Responsif penuh untuk tampilan **Desktop** (2-column side-by-side flyout dropdown) dan **Mobile** (accordion drawer menu dengan penanda `└`).

#### 2. Implementasi Tampilan Halaman Publik Prestasi Mahasiswa (`PublicLayout.tsx`)
- Menambahkan handler tampilan publik untuk seluruh tab yang berawalan `prestasi-`.
- Menampilkan **Hero Banner** eksklusif dengan badge tingkat prestasi (*Internasional / Nasional / Wilayah*), indikator bidang (*Akademik / Non-Akademik*), serta pills navigasi cepat antar-kategori.
- Menampilkan grid **Kartu Capaian Prestasi Unggulan** mahasiswa UM Kendari lengkap dengan badge juara, tahun event, deskripsi, dan status verifikasi CDC.
- Menyediakan tombol CTA **"Laporkan Prestasi Mahasiswa"** yang terhubung ke alur pendaftaran/login user.

### 📁 File Diubah
- **[MODIFY]** `src/components/Header.tsx` — Penambahan item menu PRESTASI dengan nested sub-menus Internasional, Nasional, & Wilayah
- **[MODIFY]** `src/components/PublicLayout.tsx` — Implementasi rendering halaman publik Prestasi Mahasiswa
- **[MODIFY]** `progres.md` — Pencatatan laporan progres terbaru

### 📋 Checklist Selesai Sesi Ini
- [x] Penambahan menu "PRESTASI" tepat di sebelah "SIMBELMAWA" pada `NAV_ITEMS` Header
- [x] Pembuatan sub-menu bertingkat (Internasional, Nasional, Wilayah -> Akademik, Non-Akademik)
- [x] Implementasi 2-column side flyout dropdown pada Desktop & Accordion pada Mobile
- [x] Pembuatan layout halaman publik Prestasi Mahasiswa di `PublicLayout.tsx`
- [x] Verifikasi typecheck TypeScript (`npx tsc --noEmit` -> 0 error)
- [x] Pencatatan laporan progres di `progres.md` atas nama **Fachrul Alam Sanuddin**

---

## Tanggal: 13 Agustus 2026
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Implementasi Fitur Input Admin & Card Layout Publik Prestasi Mahasiswa Multi-Level (Internasional, Nasional, Wilayah - Akademik & Non-Akademik)

---

### 🚀 Ringkasan Perubahan

#### 1. Pembaruan Structure & Model Data (`types.ts` & `data.ts`)
- Menambahkan interface `Prestasi` pada `src/types.ts` (id, judul, tingkat, kategori, peringkat, tahun, namaMahasiswa, prodi, deskripsi, imageUrl, terverifikasi, status, createdAt, createdBy).
- Menambahkan mock seed data `SEED_PRESTASI` di `src/data.ts` untuk 6 kombinasi tingkat & kategori (Internasional Akademik, Internasional Non-Akademik, Nasional Akademik, Nasional Non-Akademik, Wilayah Akademik, Wilayah Non-Akademik).
- Memperbarui `DBKey` & `DEFAULT_SEEDS` di `src/data.ts` serta menaikkan `CURRENT_SEED_VERSION` ke `v5_prestasi`.

#### 2. Manajemen & Form Input Admin Prestasi (`AdminDashboard.tsx`)
- Menambahkan tab navigasi baru **Kelola Prestasi Mahasiswa** di bawah grup menu **PRESTASI MAHASISWA**.
- Menyediakan **Form Input / Edit Prestasi** bagi Admin CDC lengkap dengan field:
  - Judul Prestasi / Ajang Kompetisi
  - Tingkat (*Internasional / Nasional / Wilayah*)
  - Kategori (*Akademik / Non-Akademik*)
  - Peringkat / Capaian (*Juara 1 / Gold Medal, Runner Up, dll.*)
  - Nama Mahasiswa / Tim & Program Studi
  - Tahun Penyelenggaraan
  - Deskripsi Capaian
  - Unggah Foto Dokumentasi / Sertifikat dari file lokal (Native File Input + Base64 FileReader & image preview)
  - Status Publikasi (*Published / Draft*)
  - Checkbox Tandai Terverifikasi CDC
- Fitur tabel pengelolaan prestasi dengan filter pencarian live, filter tingkat, filter kategori, tombol Edit, Toggle Status Publikasi, dan Hapus Prestasi.

#### 3. Tampilan Dynamic Card Layout Publik (`PublicLayout.tsx`)
- Membaca data `prestasi` secara dinamis dari localStorage database (`getFromDB<Prestasi>('prestasi')`).
- Memisahkan dan mendistribusikan postingan prestasi ke masing-masing sub-menu secara presisi:
  - `prestasi-internasional-akademik` → khusus Internasional (Akademik)
  - `prestasi-internasional-non-akademik` → khusus Internasional (Non-Akademik)
  - `prestasi-nasional-akademik` → khusus Nasional (Akademik)
  - `prestasi-nasional-non-akademik` → khusus Nasional (Non-Akademik)
  - `prestasi-wilayah-akademik` → khusus Wilayah (Akademik)
  - `prestasi-wilayah-non-akademik` → khusus Wilayah (Non-Akademik)
- Merender grid **Card Layout (3-Column Grid)** yang modern dan clean:
  - Header foto dokumentasi 16:9 dengan *hover scale animation*.
  - Badge Peringkat emas/perak/perunggu + Badge Tahun.
  - Sub-header program studi / instansi UMK.
  - Judul prestasi tebal & deskripsi singkat.
  - Status `Terverifikasi CDC`.
- Menyediakan baris pencarian kata kunci live pada halaman publik prestasi.

### 📁 File Diubah
- **[MODIFY]** `src/types.ts` — Penambahan interface `Prestasi`
- **[MODIFY]** `src/data.ts` — Penambahan seed data `SEED_PRESTASI`, `DBKey`, & `DEFAULT_SEEDS`
- **[MODIFY]** `src/components/AdminDashboard.tsx` — Implementasi tab & form input Admin Prestasi Mahasiswa
- **[MODIFY]** `src/components/PublicLayout.tsx` — Implementasi dynamic filtering & 3-column Card Layout publik Prestasi
- **[MODIFY]** `progres.md` — Laporan progres pengerjaan tanggal 13 Agustus 2026

### 📋 Checklist Selesai Sesi Ini
- [x] Penambahan interface `Prestasi` & seed data `SEED_PRESTASI`
- [x] Pembuatan tab & form input posting Prestasi di Admin Dashboard
- [x] Fitur upload foto dokumentasi lokal, edit, hapus, & toggle publish Admin
- [x] Filter dinamis per sub-menu (Internasional, Nasional, Wilayah - Akademik & Non-Akademik)
- [x] Redesign tampilan publik Prestasi ke format 3-Column Card Layout
- [x] Live search filter pada halaman publik Prestasi
- [x] Verifikasi `npm run lint` PASSED (0 error)
- [x] Verifikasi `npm run build` PASSED (0 error, exit 0)

---

## Tanggal: 13 Agustus 2026 (Sesi 2)
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Pemisahan Halaman Sub-Menu Prestasi Menjadi Halaman Mandiri (Tanpa Pill Navigasi Internal)

---

### 🚀 Ringkasan Perubahan
- **Penghapusan Pill Navigasi Internal (`PublicLayout.tsx`)**: Menghapus tombol/pill navigasi pemintas internal di dalam Hero Banner halaman Prestasi.
- **Enforcement Halaman Mandiri**: Setiap halaman sub-menu Prestasi (**Internasional**, **Nasional**, **Wilayah** — **Akademik** & **Non-Akademik**) kini tampil murni dan fokus khusus untuk sub-menu tersebut tanpa opsi pergantian tab di dalam konten. Perpindahan antar-halaman dilakukan melalui navigasi utama Header top-bar.

### 📁 File Diubah
- **[MODIFY]** `src/components/PublicLayout.tsx` — Sembunyikan pill navigasi internal di Hero Banner Halaman Prestasi
- **[MODIFY]** `src/components/AdminDashboard.tsx` — Tab & Form Input Admin Prestasi Mahasiswa
- **[MODIFY]** `src/types.ts` — Interface `Prestasi` (Internasional, Nasional, Wilayah - Akademik & Non-Akademik)
- **[MODIFY]** `src/data.ts` — Seed data `SEED_PRESTASI` & pengaktifan DBKey `v5_prestasi`
- **[MODIFY]** `progres.md` — Laporan progres pengerjaan tanggal 13 Agustus 2026

### 📋 Checklist Selesai Sesi Ini
- [x] Penghapusan pill navigasi pemintas internal pada Hero Banner halaman Prestasi
- [x] Enforcement tampilan halaman publik Prestasi sebagai halaman mandiri per sub-menu
- [x] Form input Admin Prestasi di `AdminDashboard.tsx` (fitur upload foto dokumentasi lokal, edit, hapus, & publish)
- [x] Grid 3-column Card Layout publik untuk postingan Prestasi di `PublicLayout.tsx`
- [x] Verifikasi `npx tsc --noEmit` PASSED (0 error)
- [x] Verifikasi `npm run build` PASSED (0 error, exit 0)

---

## Tanggal: 14 Agustus 2026
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Pembaruan Poster Carousel HeroSlider (Slide 4 & Slide 5) & Perbaikan Transisi Slide Mulus Tanpa Blink / Layout Shift

---

### 🚀 Ringkasan Perubahan

#### 1. Pembaruan Poster Carousel (`HeroSlider.tsx`)
- **Slide 4**: Mengganti poster menjadi `public/TENTANG TRACER baru.svg` (`/TENTANG%20TRACER%20baru.svg`).
- **Slide 5**: Mengganti poster menjadi `public/KONSELING KARIR slide ke 5.svg` (`/KONSELING%20KARIR%20slide%20ke%205.svg`).

#### 2. Resolusi Efek Blink / Jebretan Layout saat Transisi Slide (`HeroSlider.tsx`)
- **Preloading Gambar SVG**: Menambahkan `useEffect` preloading untuk seluruh 5 gambar poster SVG saat komponen dimuat pertama kali, mencegah jeda pemuatan/decoding gambar saat slide berganti.
- **Aspect-Ratio Layout Keeper (*Zero Layout Shift*)**: Menambahkan elemen penentu tinggi alami sehingga tinggi kontainer carousel 100% konstan dan tidak pernah runtuh/bergeser saat transisi `AnimatePresence` terjadi.
- **Stacked Absolute Layering & Hardware Acceleration**: Menempatkan slide pada layar absolute `transform-gpu` dengan kurva easing `[0.25, 1, 0.35, 1]`, menghasilkan pergantian slide 60 FPS yang sangat mulus tanpa kedipan.

### 📁 File Diubah
- **[MODIFY]** `src/components/HeroSlider.tsx` — Update URL poster slide 4 & 5, preloading image effect, aspect-ratio height keeper, dan optimasi GPU animation
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 14 Agustus 2026

### 📋 Checklist Selesai Sesi Ini
- [x] Pembaruan poster Slide 4 dengan `TENTANG TRACER baru.svg`
- [x] Pembaruan poster Slide 5 dengan `KONSELING KARIR slide ke 5.svg`
- [x] Implementasi preloading image effect untuk seluruh poster SVG
- [x] Implementasi aspect-ratio layout keeper untuk mencegah layout collapse/blink
- [x] Verifikasi transisi slide 60 FPS mulus di dev server

### 💡 Rekomendasi Judul Commit Git
- `feat(hero-slider): update poster slide 4 & 5 and fix transition blink`
- `fix(hero-slider): update poster SVG and eliminate slide transition layout shift`

---

## Tanggal: 14 Agustus 2026 (Sesi 2)
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Pengintegrasian Menu "Masuk / Login" ke Dalam Dropdown Menu Register pada Header Navigasi

---

### 🚀 Ringkasan Perubahan

#### 1. Pembersihan Barisan Menu Utama (`Header.tsx`)
- Menghapus item standalone `{ id: 'masuk', label: 'Masuk', tab: 'login', isAction: true }` dari daftar `NAV_ITEMS` agar barisan menu utama tingkat atas tetap rapi, bersih, dan lega.

#### 2. Integrasi Otentikasi Akun pada Dropdown Menu Register (`Header.tsx`)
- Menambahkan item **"Masuk / Login"** sebagai opsi di dalam dropdown menu **Register** (berdampingan dengan *Register User* dan *Register Mitra*).
- Menyesuaikan fungsi `navigate()` agar ketika pengguna mengeklik **"Masuk / Login"** di dalam dropdown, sistem langsung memicu fungsi otentikasi login (`onNavigateToLogin()`).

### 📁 File Diubah
- **[MODIFY]** `src/components/Header.tsx` — Hapus standalone item `masuk`, integrasikan ke `register` dropdown, dan perbarui event handler `navigate`
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 14 Agustus 2026 (Sesi 2)

### 📋 Checklist Selesai Sesi Ini
- [x] Penghapusan item menu "Masuk" yang berdiri sendiri di barisan menu utama
- [x] Penambahan item "Masuk / Login" di dalam dropdown menu Register
- [x] Pengujian navigasi klik "Masuk / Login" menuju form login
- [x] Verifikasi `npx tsc --noEmit` PASSED (0 error)

### 💡 Rekomendasi Judul Commit Git
- `refactor(header): integrate Masuk/Login into Register dropdown menu`

---

## Tanggal: 14 Agustus 2026 (Sesi 4)
**Developer:** ARYA APRIAWAN  
**Fokus Pekerjaan:** Revisi Tampilan Detail Kegiatan Sub-Menu Layanan (Rasio 9:16)

---

### 🚀 Ringkasan Perubahan
1. **Revisi UI Detail Kegiatan:**
   - Mengubah rasio tampilan poster/banner detail kegiatan menjadi 9:16 (portrait) pada modal `EventCardLayout`.
   - Mengatur ulang tata letak modal agar konten (judul, deskripsi, status, tombol aksi) tampil lebih proporsional di bawah poster, meniru tampilan pada modul *Job Info*.
   - Memastikan tombol aksi "Tutup" dan "Daftar Sekarang" berada di posisi yang tepat di bagian bawah modal.

### 📁 File Diubah
- **[MODIFY]** `src/components/layanan/ui/EventCardLayout.tsx`
- **[MODIFY]** `progres.md`

### 📋 Checklist Selesai Sesi Ini
- [x] Implementasi rasio poster 9:16 pada modal detail kegiatan.
- [x] Restrukturisasi tata letak isi modal (judul, deskripsi, status, tombol).
- [x] Verifikasi konsistensi UI dengan referensi dashboard Job Info.
- [x] Dokumentasi progres oleh ARYA APRIAWAN.

### 💡 Rekomendasi Judul Commit Git
- `refactor(layanan): update event detail modal to 9:16 aspect ratio and match Job Info UI`

---

## Tanggal: 14 Agustus 2026 (Sesi 4)
**Developer:** Ikhsan  
**Fokus Pekerjaan:** Redesain UI Search Job & Kelola Lowongan Mitra, Penyelarasan Data 9 Lowongan, Pembersihan Sidebar Mitra, dan Perbaikan Null-Safety Header

---

### 🚀 Ringkasan Perubahan

#### 1. Redesain Halaman Cari Lowongan / Search Job (`JobSearchMasterDetail.tsx`)
- Mengubah judul halaman menjadi **"Cari lowongan pekerjaan"** dan subtitle *"Temukan peluang karier yang sesuai dengan minat dan keahlianmu."*
- Meredesain kontainer pencarian bertema putih bersih (*clean white theme*) dengan 3 input/dropdown (Kata Kunci, Semua Lokasi, Semua Spesialisasi) & tombol Cari biru gelap `#0B1E48`.
- Menambahkan fitur sorting lowongan: **Terbaru**, **Terlama**, dan **Abjad (A-Z)**.
- Menyelaraskan format counter **"Menampilkan 1-6 dari 9 lowongan"** (angka 9 dicetak tebal dengan warna biru `#0055D4`).
- Mengimplementasikan helper logo badge squircle (`getCompanyBadgeColor` & `getCompanyInitials`) dengan dukungan warna unik per instansi (CL, YB, RE, CA, GF, TS).
- Menambahkan tombol bookmark bundar di sudut kanan atas kartu, badge nama instansi oranye `#EA580C`, info tanggal & jam di footer kartu, dan pagination `< 1 2 >`.

#### 2. Redesain Header Navigation Bar Mahasiswa (`MahasiswaDashboard.tsx`)
- Mengubah tampilan header dari warna biru gelap (`#1E3A8A`) menjadi putih bersih (`bg-white border-b border-slate-200`).
- Menambahkan badge koper hijau (`#10B981`), teks brand **Career Portal UMK**, link navigasi aktif dengan garis bawah biru `#0055D4`, dropdown profil pengguna, dan tombol keluar.

#### 3. Pembersihan Sidebar Navigasi Mitra (`MitraDashboard.tsx`)
- Menghapus opsi sub-menu **"Survei Mutu Lulusan"** dari sidebar navigasi Dashboard Mitra sesuai instruksi pengguna.

#### 4. Penyelarasan Scope & Database Seed 9 Lowongan (`src/data.ts`)
- Menghubungkan seluruh 9 lowongan publik di `SEED_LOWONGAN` ke ID Mitra Demo (`mtr1` / PT Go Digital Kendari).
- Memperbarui versi seed database ke `v6_all9lowongan` agar `localStorage` ter-sync otomatis sehingga Dashboard Mitra dan Search Job sama-sama menampilkan 9 lowongan.

#### 5. Redesain Tab "Kelola Lowongan" Dashboard Mitra (`MitraDashboard.tsx`)
- Meredesain tampilan tab Kelola Lowongan presisi 1:1 dengan screenshot mockup:
  - Judul Halaman: **Manajemen Database Lowongan** dengan subtitle penjelasan & tombol **`+ Posting Lowongan Baru`** (`#0055D4`).
  - Bar Kontrol Pencarian & Filter 4 Kolom: Input pencarian kata kunci + 3 dropdown filter (`Semua Jenis`, `Semua Status`, `Terbaru`).
  - Layout Grid 2 Kolom x 3 Baris (6 kartu per halaman) dengan badge tipe (`PROGRAM MAGANG` / `LOWONGAN KERJA`), badge status (`● Aktif` / `● Tutup`), logo squircle, meta info lokasi & kuota, deadline, serta baris tombol aksi (`Edit Detail`, `Tutup`, icon Hapus).
  - Kontrol Pagination `< 1 2 >` di bagian bawah.

#### 6. Perbaikan Bug Blank Screen & Proteksi Null-Safety (`MitraDashboard.tsx` & `JobSearchMasterDetail.tsx`)
- Meng-import `formatDateDisplay` pada `MitraDashboard.tsx` untuk mengatasi `ReferenceError` pada penanggalan deadline.
- Menambahkan proteksi *null-safety* lengkap (`(j.judul || '')`, `(j.namaInstansi || '')`, `(j.lokasi || '')`, `(j.deskripsi || '')`) pada filter pencarian, sorting, dan pembentukan badge logo perusahaan agar aplikasi 100% stabil.
- Verifikasi kompilasi TypeScript `npx tsc --noEmit` lulus sempurna dengan **0 Error**.

---

### 📁 File Diubah
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx` — Redesain UI Search Job, pencarian, sorting, logo squircle, dan pagination
- **[MODIFY]** `src/components/MahasiswaDashboard.tsx` — Redesain header navigasi bertema putih dengan aksen biru & hijau
- **[MODIFY]** `src/components/MitraDashboard.tsx` — Redesain Kelola Lowongan, hapus menu Survei Mutu Lulusan, import `formatDateDisplay`, dan perbaikan null-safety
- **[MODIFY]** `src/data.ts` — Update `mitraId: 'mtr1'` pada `low8`, `low9`, `low10`, dan upgrade seed version ke `v6_all9lowongan`
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 14 Agustus 2026 (Sesi 4)

---

### 📋 Checklist Selesai Sesi Ini
- [x] Redesain Halaman Search Job bertema putih dengan pencarian 3 dropdown, sorting, counter tebal biru, dan logo squircle
- [x] Redesain Header Navigation Bar Mahasiswa bertema putih dengan logo koper hijau & active tab border biru
- [x] Penghapusan menu Survei Mutu Lulusan dari sidebar Dashboard Mitra
- [x] Penyelarasan data 9 lowongan antara Dashboard Mitra & Search Job (Upgrade Seed Database v6)
- [x] Redesain Tab Kelola Lowongan Dashboard Mitra presisi 1:1 (Top bar, search, 3 filter dropdown, 2-column grid cards, pagination)
- [x] Perbaikan error blank screen (`formatDateDisplay` import fix & null-safety hardening)
- [x] Verifikasi `npx tsc --noEmit` PASSED (0 Error)

---

### 💡 Rekomendasi Judul Commit Git
- `feat(mitra & user): redesign Job Search & Kelola Lowongan views, align 9 jobs seed, and purify Mitra sidebar`

---

## Tanggal: 14 Agustus 2026 (Sesi 5)
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Pembaruan Label Footer Card Layout Pengunggah ("by Admin Website" & "by Mitra")

---

### 🚀 Ringkasan Perubahan

#### 1. Pembaruan Label Footer Card Layout Beranda (`PublicLayout.tsx`)
- Memperbarui label footer pada kartu **INFO KARIR CDC TERKINI** dan **PROGRAM & PENGUMUMAN** di Beranda:
  - Jika konten diinput oleh **Admin Website**: Menampilkan label **"by Admin Website"**.
  - Jika konten diinput oleh **Mitra**: Menampilkan label **"by Mitra"**.

#### 2. Penyelarasan Label Footer pada Katalog Lowongan & Magang (`JobSearchMasterDetail.tsx` & `Magang.tsx`)
- Menyelaraskan footer kartu pada katalog **Cari Lowongan Pekerjaan** dan **Program Magang / Internship** agar konsisten menggunakan **"by Admin Website"** untuk postingan admin dan **"by Mitra"** untuk postingan mitra.

### 📁 File Diubah
- **[MODIFY]** `src/components/PublicLayout.tsx` — Update footer kartu Info Karir Terkini & Program/Pengumuman (by Admin Website / by Mitra)
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx` — Update footer kartu katalog pencarian lowongan
- **[MODIFY]** `src/components/layanan/Magang.tsx` — Update footer kartu daftar magang/internship
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 14 Agustus 2026 (Sesi 5)

### 📋 Checklist Selesai Sesi Ini
- [x] Pembaruan footer kartu Beranda Info Karir Terkini (by Admin Website / by Mitra)
- [x] Pembaruan footer kartu Beranda Program & Pengumuman (by Admin Website)
- [x] Penyelarasan footer kartu katalog Cari Lowongan (by Admin Website / by Mitra)
- [x] Penyelarasan footer kartu daftar Magang (by Admin Website / by Mitra)
- [x] Verifikasi `npx tsc --noEmit` PASSED (0 Error)

### 💡 Rekomendasi Judul Commit Git
- `refactor(cards): update card uploader attribution to by Admin Website and by Mitra`

---

## Tanggal: 15 Agustus 2026
**Developer:** Ikhsan  
**Fokus Pekerjaan:** Perbaikan PDF CV Pelamar, Standarisasi Pagination (9 Card Lowongan & 10 Pelamar/Hal), dan Modal Pop-Up Tengah (Diterima / Ditolak / Interview)

---

### 🚀 Ringkasan Perubahan

#### 1. Perbaikan Persistensi & Rendering Preview CV PDF Pelamar
- **Penyimpanan Berkas PDF (`src/data.ts`):** Memperbaiki fungsi `applyForJob` agar berkas PDF yang diunggah pelamar tersimpan secara persisten ke database lokal (`berkasUrl`), sehingga mitra industri dapat mengakses CV asli pelamar.
- **Rendering Canvas PDF.js (`MitraDashboard.tsx`):** Mengganti elemen iframe/object bawaan dengan rendering canvas berbasis `pdfjsLib` untuk mengatasi pemblokiran sandbox browser Microsoft Edge (*"We can't open this file"*).
- **Pembersihan Modal & Tombol "Lihat":** Menghilangkan kotak toolbar ganda pada modal detail pelamar dan menyelaraskan tombol aksi menjadi **"Lihat"** dan **"Download PDF"**.

#### 2. Standarisasi Batas Pagination Lowongan & Job Info (9 Card per Halaman)
- **Katalog Lowongan (`JobSearchMasterDetail.tsx`):** Mengatur batas maksimal 9 kartu lowongan per halaman (`itemsPerPage = 9`). Jika lowongan lebih dari 9, otomatis muncul navigasi halaman selanjutnya.
- **Info Karir & Magang (`PublicLayout.tsx` & `Magang.tsx`):** Memastikan batas tampilan 9 kartu dan pagination responsif.

#### 3. Standarisasi Pagination Pelamar & Seleksi (10 Orang per Halaman)
- **Daftar Pelamar Mitra (`MitraDashboard.tsx`):** Mengatur batas maksimal 10 pelamar per halaman pada tab Pelamar & Seleksi mitra industri.
- **Navigasi & Auto-Reset:** Menyediakan tombol navigasi halaman (`<` `1` `2` `...` `>`) dan indikator jumlah pelamar, serta reset otomatis ke halaman 1 saat mitra mengganti filter atau melakukan pencarian.

#### 4. Pembuatan Modal Pop-Up Tengah dengan Tombol "OK" (Diterima / Ditolak / Interview)
- **Center Dialog Pop-up (`MitraDashboard.tsx`):** Membuat modal dialog di tengah layar dengan backdrop blur dan tombol **`[ OK ]`** yang elegan saat aksi berhasil diproses:
  - **Diterima:** Pop-up hijau (Emerald) dengan ikon centang besar `[✓]` dan pesan konfirmasi penerimaan pelamar.
  - **Ditolak:** Pop-up merah (Rose) dengan ikon peringatan `[!]` dan pesan konfirmasi penolakan pelamar.
  - **Jadwal Interview:** Pop-up konfirmasi jadwal interview tersimpan.
- **Dialog Konfirmasi Penolakan:** Menyediakan modal konfirmasi sebelum aksi tolak dieksekusi untuk mencegah kesalahan klik.
- **Toast Notifier Pojok Kanan Atas:** Penyelarasan notifikasi toast agar selaras dengan status aksi.

---

### 📁 File Diubah
- **[MODIFY]** `src/data.ts` — Memperbaiki persistensi berkas CV PDF pada fungsi `applyForJob`
- **[MODIFY]** `src/components/MitraDashboard.tsx` — Implementasi canvas preview PDF, pagination 10 pelamar/halaman, dialog konfirmasi, toast notifier, dan modal pop-up tengah dengan tombol OK
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx` — Konfigurasi pagination 9 card lowongan per halaman
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 15 Agustus 2026 oleh Ikhsan

---

- **[MODIFY]** `src/App.tsx` — Integrasi komponen `Login.tsx`
- **[MODIFY]** `progres.md` — Pencatatan progres pengerjaan

---

### 💡 Rekomendasi Judul Commit Git
- `feat(auth): add clean university-style Login page and refine Register navigation`

---

## Tanggal: 17 Agustus 2026
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Halaman Login Admin Tersembunyi, Pemisahan Registrasi User & Mitra, Dynamic Counters, Penyesuaian Beranda, Fitur Pin Info Popular, dan Transparansi Navigasi Carousel Hero.

---

### 🚀 Ringkasan Perubahan

#### 1. Pemisahan Halaman Register User (Alumni/Mahasiswa) & Register Mitra Perusahaan (`Register.tsx` & `Header.tsx`)
- Memisahkan form pendaftaran User (Mahasiswa/Alumni) dan Mitra Perusahaan menjadi dua tampilan terpisah dengan header card, aksen warna (Emerald vs Deep Blue), serta tombol lintas navigasi yang jelas.
- Memperbarui tautan pada header navigasi publik agar "Daftar User" dan "Daftar Perusahaan" mengarahkan pengguna secara langsung ke form masing-masing.

#### 2. Penghapusan Hero Search Bar & Penyesuaian Padding Top (`PublicLayout.tsx`)
- Menghapus section pencarian hero ("Mesin Pencari...", "Portal Karir", "UM Kendari CAREER FAIR") pada halaman utama Beranda sesuai permintaan visual.
- Menyesuaikan padding top (`pt-12`) agar tata letak section utama Beranda tetap rapi dan seimbang.

#### 3. Penghapusan Tombol "Lihat Semua" & Lencana Internship pada Cards (`PublicLayout.tsx`)
- Menghapus tombol `"Lihat Semua"` pada section header **INFO KARIR CDC TERKINI**.
- Memasukkan posisi magang/internship ke daftar *INFO KARIR CDC TERKINI*.
- Menambahkan lencana visual hijau emerald **`INTERNSHIP`** khusus untuk kartu ber-tipe magang (`item.tipe === 'magang'`). Kartu pekerjaan reguler (non-magang) tidak menampilkan lencana internship tersebut.

#### 4. Penghitung Statistik Dinamis: Pengalaman & Total Pengunjung Website (`PublicLayout.tsx` & `src/data.ts`)
- **Tahun Pengalaman Dinamis**: Mengganti angka statis `10+` menjadi kalkulasi tahun otomatis: `Math.max(10, new Date().getFullYear() - 2016) + '+'`. Angka ini otomatis meningkat pada tahun 2027 dan seterusnya.
- **Total Pengunjung Website**: Mengganti stat *"Tingkat Penempatan"* menjadi *"Total Pengunjung"* website. Menambahkan helper `trackAndGetVisitorCount()` di `data.ts` berbasis `localStorage` (`cdc_umk_visitor_count`) dan `sessionStorage` dengan baseline `2580+`.
- **Jumlah Mitra Perusahaan**: Memperbarui statistik *Mitra Perusahaan* dari `5+` menjadi `10+`.

#### 5. Penyederhanaan Shortcut "Layanan Cepat" (`PublicLayout.tsx`)
- Menyederhanakan kotak **Layanan Cepat** pada sidebar Beranda sehingga hanya menyisakan tautan **Konseling Karir** (menghapus *CV Review* & *Mock Interview*).

#### 6. Fitur Pin Info (Popular Info) Dinamis untuk Admin (`AdminDashboard.tsx`, `PublicLayout.tsx`, `types.ts`)
- Menambahkan properti `isPinned?: boolean` pada interface `KontenKarir` dan `Lowongan` di `src/types.ts`.
- Menambahkan tombol aksi 📌 **"Pin / Ter-Pin"** pada setiap baris tabel *Riwayat Konten Karir* di Admin Dashboard untuk mem-pin / melepas sematan info secara instan.
- Menambahkan checkbox `[ ] Sematkan ke Popular Info (Pin)` pada form pembuatan & editor Konten Karir di Admin Dashboard.
- Memperbarui widget **Popular Info** pada sidebar Beranda publik agar memprioritaskan konten ter-pin (`isPinned: true`) dari berita, pengumuman, program, workshop, seminar, dan presentasi (khusus konten non-lowongan).

#### 7. Menghilangkan Background Hitam Tombol Panah Navigasi Carousel Hero (`HeroSlider.tsx`)
- Menghapus background hitam gelap (`bg-slate-900/70 border border-white/20`) pada tombol panah kiri (`carousel-control-prev`) dan panah kanan (`carousel-control-next`) pada carousel slider poster Beranda.
- Mengubah background tombol menjadi **transparan (`bg-transparent hover:bg-white/20`)** dengan efek *drop-shadow* agar tetap kontras dan bersih di atas poster.

---

### 📁 File Diubah
- **[MODIFY]** `src/types.ts` — Penambahan bidang optional `isPinned?: boolean` pada `KontenKarir` & `Lowongan`
- **[MODIFY]** `src/data.ts` — Penambahan fungsi helper `trackAndGetVisitorCount()`
- **[MODIFY]** `src/components/Register.tsx` — Pemisahan tampilan form registrasi User & Mitra Perusahaan
- **[MODIFY]** `src/components/Header.tsx` — Penyesuaian link navigasi pendaftaran User & Mitra
- **[MODIFY]** `src/components/PublicLayout.tsx` — Penghapusan hero search, removal tombol "Lihat Semua", badge INTERNSHIP, counter statistik dinamis (Pengalaman & Pengunjung), penyederhanaan Layanan Cepat, dan Popular Info dinamis
- **[MODIFY]** `src/components/AdminDashboard.tsx` — Integrasi fitur saklar & tombol Pin pada tabel/form Konten Karir
- **[MODIFY]** `src/components/HeroSlider.tsx` — Transparansi tombol navigasi panah kiri & kanan carousel
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 17 Agustus 2026 oleh Fachrul Alam Sanuddin

---

### 📋 Checklist Selesai Sesi Ini
- [x] Pemisahan form Register User & Register Mitra Perusahaan di `Register.tsx` & `Header.tsx`
- [x] Penghapusan hero search section di Beranda (`PublicLayout.tsx`)
- [x] Dynamic counter "Tahun Pengalaman" (`2026 - 2016` => `10+`, otomatis `11+` di 2027)
- [x] Counter "Total Pengunjung Website" (`trackAndGetVisitorCount()`) menggantikan "Tingkat Penempatan"
- [x] Pembaruan statistik "Mitra Perusahaan" menjadi `10+`
- [x] Removal tombol "Lihat Semua" pada INFO KARIR CDC TERKINI
- [x] Lencana visual `INTERNSHIP` untuk lowongan magang & pengecualian untuk lowongan kerja reguler
- [x] Penyederhanaan widget Layanan Cepat (hanya menyisakan Konseling Karir)
- [x] Fitur Pin Info (Popular Info) di `AdminDashboard.tsx` & `PublicLayout.tsx` (khusus non-lowongan)
- [x] Transparansi tombol panah Prev & Next pada carousel `HeroSlider.tsx`
- [x] Verifikasi `npx tsc --noEmit` PASSED (0 Error)

---

### 💡 Rekomendasi Judul Commit Git
- `feat(homepage & admin): add dynamic stats, pin info feature, separate register forms, and polish hero carousel buttons`

---

---

## Tanggal: 18 Agustus 2026
**Developer:** Hermes Agent (AI Assistant)
**Fokus Pekerjaan:** Penyederhanaan Card Layout Sub-menu Layanan (Workshop / Softskill / Seminar) — kartu hanya judul + tanggal, klik kartu membuka modal detail, dan hapus tombol "Daftar Sekarang" di modal.

---

### 🚀 Ringkasan Perubahan

#### 1. Penyederhanaan Konten Kartu Event (`EventCardLayout.tsx`)
- Menghapus dari tampilan kartu: deskripsi singkat, **lokasi** (ikon MapPin), **pembicara/orang** (ikon User), **kuota peserta** (ikon Users), dan **waktu/jam** kegiatan. Kartu sekarang hanya menampilkan **judul + tanggal pelaksanaan**.
- Menghapus tombol "Detail Kegiatan" di bawah kartu. Seluruh area kartu dijadikan dapat diklik (`role="button"`, `tabIndex`, `onClick` + `onKeyDown` Enter/Space) sehingga detail kegiatan cukup dibuka dengan mengklik kartu.

#### 2. Penghapusan Tombol "Daftar Sekarang" pada Modal Detail (`EventCardLayout.tsx`)
- Menghapus anchor `registrationLink` ("Daftar Sekarang") di footer modal. Modal detail sekarang hanya memiliki tombol **"Tutup"**.
- Informasi lengkap (Lokasi, Pembicara/Narasumber, Kuota Peserta, Waktu, Deskripsi Kegiatan) tetap tersedia di dalam modal detail.

#### 3. Pembersihan Import yang Tidak Terpakai
- Menghapus `ChevronRight` (setelah hapus tombol "Detail Kegiatan") dan `ExternalLink` (setelah hapus tombol "Daftar Sekarang") dari impor `lucide-react`. `Clock` tetap dipakai pada badge status "Segera Hadir".

### 📁 File Diubah
- **[MODIFY]** `src/components/layanan/ui/EventCardLayout.tsx` — Penyederhanaan kartu (hapus lokasi/orang/kuota/deskripsi/jam + tombol "Detail Kegiatan", kartu klikable) dan hapus tombol "Daftar Sekarang" di modal + cleanup import.
- **[MODIFY]** `progres.md` — Pencatatan progres pengerjaan tanggal 18 Agustus 2026.

### 📋 Checklist Selesai Sesi Ini
- [x] Kartu event hanya tampil judul + tanggal (tanpa lokasi, pembicara, kuota, deskripsi, dan jam)
- [x] Kartu event dapat diklik penuh untuk membuka modal detail (aksesibel via keyboard Enter/Space)
- [x] Tombol "Detail Kegiatan" dihapus dari kartu
- [x] Tombol "Daftar Sekarang" dihapus dari modal detail (sisa "Tutup")
- [x] Informasi lengkap tetap utuh di modal detail (Lokasi, Pembicara, Kuota, Waktu, Deskripsi)
- [x] Cleanup import `ChevronRight` & `ExternalLink` (tidak terpakai)
- [x] Verifikasi `npx tsc --noEmit` PASSED (0 Error)
- [x] Verifikasi `npm run build` PASSED
- [x] Verifikasi runtime via browser (dev :3000): kartu + klik → modal terbukti sesuai

---

## Tanggal: 18 - 19 Agustus 2026
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Pengubahan Istilah ke "PRESTASI", Fitur Galeri 3 Media, Integrasi WA Admin Lapor Prestasi, Standarisasi UI Header & SocialShareBar 7 Tombol Lengkap

---

### 🚀 Ringkasan Perubahan

#### 1. Pengubahan Seluruh Istilah ke "PRESTASI" (`Header.tsx`, `PublicLayout.tsx`, `AdminDashboard.tsx`)
- Mengubah seluruh istilah "Presentasi" di menu navigasi, judul halaman, CTA button, empty states, dan Admin Dashboard menjadi **"PRESTASI"** / **"Prestasi Mahasiswa"**.
- Memastikan kontainer tampilan halaman Prestasi Mahasiswa terpusat dengan `max-w-6xl` agar tidak terlalu rapat ke pinggir layar pada mode desktop.
- Mengintegrasikan tombol **"Laporkan Prestasi"** agar langsung membuka obrolan WhatsApp ke Nomor WA Admin CDC UMK (yang nomor fisiknya dapat dikelola secara dinamis via Admin Dashboard).

#### 2. Pengembangan Sub-Menu & Fitur Galeri Kegiatan CDC (`GaleriView.tsx` & `AdminDashboard.tsx`)
- Membuat komponen publik `GaleriView.tsx` yang mendukung 3 jenis media dari Admin CDC:
  1. **Video Youtube** (Embedded Player Responsive dengan penanganan URL otomatis).
  2. **Poster Gambar** (Zoomable Modal Full-Res).
  3. **File PDF / Link Dokumen Kegiatan**.
- Menambahkan tab menu **Kelola Galeri Kegiatan** pada sidebar Admin Dashboard (`AdminDashboard.tsx`) lengkap dengan form CRUD 3 tipe media dan preview.
- Menambahkan seed data `SEED_GALERI_ITEMS` (`v11_galeri_items`).

#### 3. Penyesuaian Tampilan Header Navigasi Sub-Menu (`Header.tsx`)
- Menyederhanakan header sub-menu pada halaman publik (SK CDC, Kalender Kegiatan, Laporan Kinerja, MOU, Galeri, dll.) agar bersih tanpa judul ganda dan garis vertikal biru yang tidak diperlukan.

#### 4. Perbaikan Tampilan Layout Input Kalender Tanggal (`KalenderKegiatanView.tsx` & Layanan)
- Memperbaiki tata letak rentang tanggal pencarian `s/d` agar tidak lewat / melepasi border kontainer.

#### 5. Pembuatan Komponen Terpusat & Standarisasi Bar Bagikan (`SocialShareBar.tsx`)
- Membuat komponen reusable `src/components/ui/SocialShareBar.tsx` dengan **7 tombol bagikan lengkap** persis rujukan gambar:
  1. **Share on Facebook** (`#3b5998`)
  2. **Share on Twitter** (Hitam `#000000` dengan logo X)
  3. **WhatsApp** (`#25D366`)
  4. **Telegram** (`#229ED9`)
  5. **LinkedIn** (`#0A66C2`)
  6. **Tombol Ikon Bagikan / Native Share** (`#4a403a` dengan `Share2` icon & `navigator.share`)
  7. **Salin Tautan** (`#8c8c8c` dengan Toast *"Tautan berhasil disalin!"*)
- Menggantikan baris share manual pada seluruh 7 halaman publik: *Surat Keputusan CDC*, *Kalender Kegiatan*, *Laporan Kinerja & Tracer Study*, *MOU Dengan Stakeholder*, *Sub-Menu Layanan*, *Galeri Kegiatan*, dan *Prestasi Mahasiswa*.

---

### 📁 File Diubah & Ditambahkan
- **[NEW]** `src/components/ui/SocialShareBar.tsx` — Komponen terpusat 7 tombol Social Share
- **[NEW]** `src/components/layanan/GaleriView.tsx` — Komponen publik Galeri Kegiatan CDC (Youtube, Poster, PDF)
- **[MODIFY]** `src/types.ts` — Penambahan interface `GaleriItem`
- **[MODIFY]** `src/data.ts` — Seed data `SEED_GALERI_ITEMS`, registration DBKey `v11_galeri_items`, dan WA Admin helper
- **[MODIFY]** `src/components/Header.tsx` — Pengubahan Presentasi -> Prestasi & penyederhanaan header sub-menu
- **[MODIFY]** `src/components/PublicLayout.tsx` — Integrasi GaleriView, SocialShareBar, WA Admin Lapor Prestasi, & max-w-6xl container
- **[MODIFY]** `src/components/AdminDashboard.tsx` — Tab & form CRUD Kelola Galeri Kegiatan + Pengaturan WA Admin
- **[MODIFY]** `src/components/layanan/SuratKeputusanView.tsx` — Integration SocialShareBar
- **[MODIFY]** `src/components/layanan/KalenderKegiatanView.tsx` — Integration SocialShareBar & perbaikan border kalender
- **[MODIFY]** `src/components/layanan/LaporanKinerjaView.tsx` — Integration SocialShareBar
- **[MODIFY]** `src/components/layanan/MouStakeholderView.tsx` — Integration SocialShareBar
- **[MODIFY]** `src/components/layanan/LayananContainer.tsx` — Integration SocialShareBar
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 18 - 19 Agustus 2026 oleh Fachrul Alam Sanuddin

---

### 📋 Checklist Selesai Sesi Ini
- [x] Pengubahan seluruh kata Presentasi menjadi PRESTASI (Header, PublicLayout, AdminDashboard)
- [x] Integrasi tombol WA Admin CDC untuk Laporkan Prestasi
- [x] Pembuatan komponen publik Galeri Kegiatan (`GaleriView.tsx`) dengan 3 media (Youtube, Poster, PDF)
- [x] Pembuatan fitur CRUD Kelola Galeri Kegiatan pada Admin Dashboard
- [x] Penyesuaian header sub-menu sederhana tanpa garis vertikal biru berlebih
- [x] Perbaikan layout input tanggal kalender `s/d` agar tidak lewati border
- [x] Pembuatan komponen terpusat `SocialShareBar.tsx` (7 tombol: Facebook, Twitter/X, WhatsApp, Telegram, LinkedIn, Native Share, Salin Tautan)
- [x] Standarisasi SocialShareBar di seluruh halaman publik aplikasi
---

## Tanggal: 19 Agustus 2026
**Developer:** Fachrul Alam Sanuddin  
**Fokus Pekerjaan:** Animasi Chevron Sub-Menu, Fix Layout Sub-Menu Nested, Revamp Layanan Konseling Karir (Public & Admin CRUD), Penyederhanaan Header, & Fitur Keanggotaan Tim CDC (4-Kolom & Admin CRUD)

---

### 🚀 Ringkasan Perubahan

#### 1. Animasi Rotasi Chevron Sub-Menu (`Header.tsx`)
- Menambahkan animasi rotasi CSS yang mulus (`-rotate-90 text-[#F26522] scale-110 translate-x-0.5`) pada ikon chevron sub-menu saat kursor diarahkan (*hover*) atau saat sub-menu aktif terbuka.

#### 2. Perbaikan Layout Tinggi Sub-Menu Nested (`Header.tsx`)
- Memperbaiki tata letak flexbox kontainer dropdown (`items-start self-start h-fit`) untuk menghilangkan area ruang putih (*empty white space*) di bawah sub-menu bertingkat seperti *Visi – Misi* dan *Keanggotaan*.

#### 3. Pembaruan Layanan Konseling Karir & Admin Dashboard (`BimbinganKarir.tsx` & `AdminDashboard.tsx`)
- **Template Poster Layanan**: Menampilkan poster resmi dengan modal perbesar (*zoom image*).
- **Penjelasan & Topik Konseling**: Kartu dinamis berisi topik pembahasan (misal *Review CV*, *Simulasi Interview*, dll.).
- **Jadwal Operasional**: Kartu jadwal konseling (Hari, Waktu, Lokasi, Kuota, Status Sesi Buka/Penuh/Tutup).
- **Fitur Admin Dashboard**: Menambahkan tab menu **Kelola Konseling Karir** di sidebar Admin untuk mengelola poster, topik penjelasan, jadwal operasional, dan narasi/kontak WA Admin secara CRUD lengkap.

#### 4. Penyederhanaan Header & Kondisional Seksi Kosong Konseling Karir (`BimbinganKarir.tsx`)
- Menghapus banner *dark gradient* berukuran besar dan chip badge `LAYANAN RESMI UPT CDC`, menggantinya dengan header teks bersih (`text-[#1B365D]`) yang seragam dengan sub-menu Layanan lainnya.
- Menyembunyikan seksi secara penuh (termasuk judul seksi dan kotak putus-putus) jika Admin tidak mengisi data poster, topik penjelasan, atau jadwal, sehingga tampilan publik tetap bersih tanpa kotak kosong.
- Integrasi tombol WhatsApp Admin dengan **template pesan obrolan otomatis** yang sudah terisi (*pre-filled message*).

#### 5. Fitur Struktur Organisasi & Keanggotaan Tim CDC (`Keanggotaan.tsx`, `PublicLayout.tsx`, & `AdminDashboard.tsx`)
- **Public View 4-Kolom Grid (`Keanggotaan.tsx`)**: Merancang ulang halaman Keanggotaan dengan tampilan kartu grid 4 kolom berisi foto profil persegi, nama lengkap, dan jabatan/posisi terpusat sesuai 3 gambar rujukan.
- **Integrasi Navigasi (`PublicLayout.tsx`)**: Mengatur penanganan tab `currentTab === 'keanggotaan'` sehingga menu **Profil** -> **Keanggotaan** langsung menampilkan data tim.
- **Fitur Admin CRUD (`AdminDashboard.tsx`)**: Menambahkan menu **Kelola Keanggotaan & Tim CDC** pada sidebar Admin. Admin dapat **menambah anggota baru**, **mengedit/mengganti foto (berkas/URL dengan kompresi otomatis), nama, dan jabatan**, serta **menghapus anggota** saat terjadi pergantian kepengurusan.

---

### 📁 File Diubah & Ditambahkan
- **[MODIFY]** `src/types.ts` — Penambahan interface `KonselingConfig`, `KonselingInfoItem`, `KonselingJadwalItem`, dan `AnggotaTim`
- **[MODIFY]** `src/data.ts` — Seed data `DEFAULT_KONSELING_CONFIG`, `DEFAULT_ANGGOTA_TIM` (12 pengelola/tim CDC awal), serta helper getter/saver
- **[MODIFY]** `src/components/Header.tsx` — Animasi rotasi chevron sub-menu & perbaikan layout flexbox `h-fit`
- **[MODIFY]** `src/components/layanan/BimbinganKarir.tsx` — Rebuild Layanan Konseling Karir dengan header minimalis, kondisional seksi kosong, & template WA otomatis
- **[MODIFY]** `src/components/layanan/Keanggotaan.tsx` — Rebuild Halaman Keanggotaan dengan grid 4 kolom foto/nama/jabatan
- **[MODIFY]** `src/components/PublicLayout.tsx` — Integrasi tab `keanggotaan`
- **[MODIFY]** `src/components/AdminDashboard.tsx` — Penambahan tab sidebar & form CRUD **Kelola Konseling Karir** dan **Kelola Keanggotaan & Tim CDC**
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 19 Agustus 2026 oleh Fachrul Alam Sanuddin

---

### 📋 Checklist Selesai Sesi Ini
- [x] Animasi rotasi chevron sub-menu di Header.tsx
- [x] Fix layout tinggi dropdown sub-menu nested (hilangkan empty white space)
- [x] Rebuild Layanan Konseling Karir (Poster, Topik Penjelasan, Jadwal, WA CTA)
- [x] Fitur Admin Dashboard Kelola Konseling Karir (CRUD lengkap)
- [x] Penyederhanaan header Konseling Karir (penghapusan dark banner & badge)
- [x] Kondisional penyembunyian seksi kosong pada Konseling Karir
- [x] Integrasi template chat WhatsApp otomatis
- [x] Rebuild Halaman Keanggotaan dengan grid 4-kolom foto/nama/jabatan
- [x] Integrasi tab `keanggotaan` pada PublicLayout.tsx
- [x] Fitur Admin Dashboard Kelola Keanggotaan & Tim CDC (CRUD lengkap)
- [x] Verifikasi typecheck TypeScript (`npx tsc --noEmit` PASSED 0 Error)
- [x] Update dokumentasi `progres.md`

---

## Tanggal: 19 Agustus 2026
**Developer:** Ikhsan  
**Fokus Pekerjaan:** Redesain Modern Halaman Login & Register (50/50 Split SIMASTER Style), Konsistensi Tipografi & Font, Perapihan Widget Ringkasan Pekerjaan, & Penyederhanaan Modal Detail Pelamar

---

### 🚀 Ringkasan Perubahan

#### 1. Redesain Halaman Login (`Login.tsx`)
- **Layout Split 50/50 Full-Height**: Tampilan lurus dari atas ke bawah terbagi menjadi panel branding (kiri) dan panel aksi/kredensial (kanan).
- **Background Gedung & Dark Overlay 75%**: Memasang foto Gedung Rektorat UM Kendari yang dilapisi dark overlay hitam transparan 75% (`bg-black/75`) untuk kontras tajam.
- **Perapihan Branding Kiri**: Menghilangkan background blur box di belakang logo, meratakan teks dan logo ke kiri (*align-left*) di dalam kontainer yang proporsional di tengah, serta menghapus badge pill `SISTEM INFORMASI KARIR & TRACER STUDY`.
- **Panel Aksi Kanan Bersih (*Clean Buttons*)**: Judul diperbarui menjadi `LOGIN`, tombol utama *"Masuk dengan Akun CDC"* dan *"Lupa Kata Sandi"* dibuat bersih tanpa ikon tambahan, serta transisi mulus ke form pengisian kredensial login.

#### 2. Redesain Halaman Register (`Register.tsx`)
- **Hero-First Interaction Model**: Membagi halaman register ke dalam 2 fase:
  - **Fase 1 (Hero State)**: Split 50/50 identik dengan Login, menyajikan tombol pilihan akun bersih (*"Daftar Mahasiswa / Alumni"* dan *"Daftar Mitra Perusahaan"*) tanpa ikon atau subteks membingungkan.
  - **Fase 2 (Full Form State)**: Form pendaftaran lengkap mahasiswa/alumni dan mitra perusahaan dengan tab switcher dan tombol kembali ke pilihan akun (`← Pilihan Akun`).
- **Penghapusan Badge Pill**: Menghapus pill badge `PORTAL PENDAFTARAN AKUN BARU` pada panel branding kiri.

#### 3. Penyelarasan Tipografi & Konsistensi Font (`JobDetail.tsx` & `MitraDashboard.tsx`)
- **Widget Ringkasan Pekerjaan (`JobDetail.tsx`)**: Menghapus kelas `font-mono` pada baris **Gaji** (`Rp 4.500.000 - Rp 6.000.000`), **Batas Waktu** (`30 Jun 2026`), dan **Tanggal Diposting**, sehingga seluruh baris seragam menggunakan font utama aplikasi (**Inter / sans-serif**).
- **Penghapusan Badge Posisi (`JobDetail.tsx`)**: Menghapus badge pil `DETAIL POSISI` di header widget Ringkasan Pekerjaan agar header lebih bersih dan fokus pada judul.
- **Konsistensi Font Modal (`MitraDashboard.tsx`)**: Menghapus `font-mono` pada field NIM, nomor telepon/WA, dan tanggal pada modal detail pelamar.

#### 4. Penyederhanaan Modal Detail Pelamar (`MitraDashboard.tsx`)
- **Penghapusan Seksi Riwayat Seleksi**: Menghilangkan seksi **Riwayat Seleksi (Timeline)** dari modal **Detail Pelamar & Berkas CV** sesuai arahan, sehingga modal lebih ringkas dan fokus langsung pada informasi data diri, catatan internal, kualifikasi/sertifikat, berkas CV, dan tombol keputusan (Terima, Tolak, Interview).

---

### 📁 File Diubah & Ditambahkan
- **[MODIFY]** `src/components/Login.tsx` — Redesain 50/50 split, dark overlay 75%, teks branding align-left, tombol login/lupa sandi tanpa ikon, & hapus badge pill
- **[MODIFY]** `src/components/Register.tsx` — Alur 2-fase Hero & Full Form, clean buttons pilihan pendaftaran, & hapus badge pill
- **[MODIFY]** `src/components/JobDetail.tsx` — Hapus `font-mono` pada gaji/deadline/tanggal, & hapus badge `DETAIL POSISI`
- **[MODIFY]** `src/components/MitraDashboard.tsx` — Hapus bagian Riwayat Seleksi & standarisasi font modal pelamar
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 19 Agustus 2026 oleh Ikhsan

---

### 📋 Checklist Selesai Sesi Ini
- [x] Redesain Halaman Login (50/50 split, dark overlay 75%, clean buttons tanpa ikon)
- [x] Redesain Halaman Register (Hero Section 2-fase, clean buttons, form pendaftaran lengkap)
- [x] Penghapusan background blur di belakang logo & pengaturan teks align-left di kontainer tengah
- [x] Penghapusan badge pill `SISTEM INFORMASI KARIR & TRACER STUDY` & `PORTAL PENDAFTARAN AKUN BARU`
- [x] Penghapusan ikon pada tombol Login dan Lupa Kata Sandi
- [x] Perbaikan konsistensi font pada widget Ringkasan Pekerjaan (hapus `font-mono` pada gaji & batas waktu)
- [x] Penghapusan badge `DETAIL POSISI` pada widget Ringkasan Pekerjaan di Job Detail
- [x] Penghapusan bagian Riwayat Seleksi pada modal Detail Pelamar di Mitra Dashboard
- [x] Verifikasi typecheck TypeScript (`npx tsc --noEmit` PASSED 0 Error)
- [x] Update dokumentasi `progres.md`

---

## Tanggal: 22 Agustus 2026
**Developer:** Tim Pengembang CDC UM Kendari  
**Fokus Pekerjaan:** Menjadikan Field Deskripsi pada Form Lowongan (Job Detail / Pembuatan Lowongan) Bersifat Opsional.

### 📝 Detail Perubahan:
1. **Model & Tipe Data (`types.ts`)**:
   - Menjadikan properti `deskripsi?: string;` opsional pada interface `Lowongan`.
2. **Dashboard Mitra (`MitraDashboard.tsx`)**:
   - Menghapus validasi wajib isi untuk deskripsi pada `handleAddJobPosting`.
   - Mengubah label form menjadi `"Deskripsi Ringkas Pekerjaan (Opsional)"` dan placeholder `"... (opsional)"`.
   - Menghapus atribut HTML `required` pada elemen textarea deskripsi lowongan.
   - Menangani fallback nilai string kosong `job.deskripsi || ''` pada mode edit lowongan.
3. **Dashboard Admin (`AdminDashboard.tsx`)**:
   - Menangani fallback nilai string kosong `item.deskripsi || ''` pada form pembuatan/edit lowongan admin.
   - Menyelaraskan label menjadi `"Deskripsi Ringkas (Opsional)"`.
4. **Pencarian & Filter Lowongan (`JobSearchMasterDetail.tsx`)**:
   - Melindungi pencarian kata kunci dan filtering agar aman terhadap lowongan tanpa deskripsi (`(job.deskripsi || '').toLowerCase()`).

### 📁 File Diubah:
- **[MODIFY]** `src/types.ts`
- **[MODIFY]** `src/components/MitraDashboard.tsx`
- **[MODIFY]** `src/components/AdminDashboard.tsx`
- **[MODIFY]** `src/components/JobSearchMasterDetail.tsx`
- **[MODIFY]** `progres.md`

---

## Tanggal: 22 Agustus 2026
**Developer:** ARYA APRIAWAN  
**Fokus Pekerjaan:** Revisi Sub-Menu Tracer Study — Penghapusan Item Sub-Menu yang Tidak Diperlukan

---

### 🚀 Ringkasan Perubahan

#### 1. Penghapusan Sub-Menu pada Menu Tracer Study (`Header.tsx`)
- Menghapus 2 item sub-menu dari dropdown menu **Tracer Study** pada navigasi Header:
  - **Mengisi Tracer Study** (`https://tracerstudy.umkendari.ac.id`) — dihapus
  - **Laporan Monev Tracer Study** (`https://tracerstudy.umkendari.ac.id/page/monev`) — dihapus
- Struktur sub-menu Tracer Study setelah revisi (3 item tersisa):
  1. **Panduan Tracer Study** → `https://tracerstudy.umkendari.ac.id/page/panduan`
  2. **Form Kuesioner Tracer Study** → `https://tracerstudy.umkendari.ac.id/page/survey`
  3. **Laporan Tracer Study** → `https://tracerstudy.umkendari.ac.id/page/laporan`

### 📁 File Diubah
- **[MODIFY]** `src/components/Header.tsx` — Penghapusan 2 sub-menu Tracer Study (Mengisi Tracer Study & Laporan Monev Tracer Study)
- **[MODIFY]** `progres.md` — Pencatatan laporan progres pengerjaan tanggal 22 Agustus 2026 oleh ARYA APRIAWAN

### 📋 Checklist Selesai Sesi Ini
- [x] Penghapusan sub-menu "Mengisi Tracer Study" dari dropdown Tracer Study
- [x] Penghapusan sub-menu "Laporan Monev Tracer Study" dari dropdown Tracer Study
- [x] Verifikasi struktur menu tersisa (Panduan, Form Kuesioner, Laporan)
- [x] Pencatatan laporan progres di `progres.md` atas nama ARYA APRIAWAN


## Tanggal: 24 Agustus 2026
**Developer:** ARYA APRIAWAN
**Fokus Pekerjaan:** Revisi Menu Tracer Study — Rename Sub-Menu & Penghapusan "Laporan Tracer Study"

---

### 🚀 Ringkasan Perubahan

#### 1. Revisi Dropdown Menu Tracer Study (`Header.tsx`)
- **Rename sub-menu pertama**: "Panduan Tracer Study" → **"Tracer Study"**, dan mengarah langsung ke halaman utama `https://tracerstudy.umkendari.ac.id/` (sebelumnya `/page/panduan`).
- **Penghapusan sub-menu "Laporan Tracer Study"** (`https://tracerstudy.umkendari.ac.id/page/laporan`) dari dropdown.
- Struktur sub-menu Tracer Study setelah revisi (2 item):
  1. **Tracer Study** → `https://tracerstudy.umkendari.ac.id/`
  2. **Form Kuesioner Tracer Study** → `https://tracerstudy.umkendari.ac.id/page/survey`

#### 2. Perbaikan Type Error `AdminDashboard.tsx`
- Menambahkan `'konseling'` ke union type `AdminTab` sehingga error TypeScript pada penggunaan `setActiveTab('konseling')` terselesaikan.

### ✅ Verifikasi
- [x] `npm run lint` → PASS (exit 0, tanpa error)
- [x] `npm run build` → PASS (vite build sukses, built in ~10.8s)

### 📁 File Diubah
- **[MODIFY]** `src/components/Header.tsx` — rename + retarget sub-menu Tracer Study, hapus "Laporan Tracer Study"
- **[MODIFY]** `src/components/AdminDashboard.tsx` — tambah `'konseling'` pada type `AdminTab`
- **[MODIFY]** `progres.md` — pencatatan laporan progres tanggal 24 Agustus 2026 oleh ARYA APRIAWAN

---

## Tanggal: 24 Agustus 2026 (Sesi 2)
**Developer:** ARYA APRIAWAN  
**Fokus Pekerjaan:** Revisi Total Card Layout & Detail Kegiatan Menu Layanan (Workshop, Softskill, Seminar), Pembaruan Panel Kontrol Pencarian, serta Penyesuaian Form Admin Dashboard

---

### 🚀 Ringkasan Perubahan

#### 1. Perombakan Card Layout Menu Layanan (`EventCardLayout.tsx`)
- **Pembersihan Informasi pada Kartu:**
  - Menghilangkan badge status *"Pendaftaran Dibuka / Segera Hadir / Selesai"*.
  - Menghilangkan informasi *Lokasi*, *Pembicara / Narasumber*, dan *Kuota Peserta* pada kartu (informasi ini sudah termuat di pamflet dan deskripsi kegiatan).
  - Tampilan kartu kini lebih bersih dan elegan: Cover pamflet/poster (aspek 16:9 hover-zoom), judul kegiatan tebal (2 baris), footer kartu berisi tanggal pelaksanaan (ikon kalender) di kiri dan *"by Admin Website"* di kanan.
- **Pembaruan Panel Kontrol Pencarian & Filter:**
  - Menghilangkan 2 kotak input tanggal manual (`dd/mm/yyyy s/d dd/mm/yyyy`).
  - Menggantinya dengan 3 fitur kontrol modern:
    1. **Kolom Pencarian (*Search Bar*) Luas & Responsif** dengan tombol hapus `X`.
    2. **Dropdown Filter Periode / Tahun** (Semua Periode, Tahun 2026, Tahun 2025, dll. diekstrak dinamis).
    3. **Dropdown Pengurutan (*Sort By*)**: Terbaru, Terlama, Judul (A - Z), Judul (Z - A).
    4. **Badge Total Kegiatan**: Menampilkan jumlah kegiatan hasil pencarian (`📦 Menampilkan X Kegiatan`) beserta tombol *Reset Filter*.

#### 2. Standarisasi Tampilan Detail Kegiatan (`EventDetailView.tsx`)
- Merombak tampilan pop-up modal menjadi tampilan halaman artikel detail penuh yang **sama persis** dengan format *Berita & Artikel*:
  - **Navigasi Atas**: Tombol `< Kembali ke [Nama Sub-Menu Layanan]`.
  - **Breadcrumb**: `Beranda > [Nama Sub-Menu Layanan] > [Judul Kegiatan]`.
  - **Floating Sticky Social Share Bar (Desktop Kiri)**: Facebook, X / Twitter, WhatsApp, Telegram, LinkedIn.
  - **Judul Artikel Utama**: Teks besar, tegas, dan tebal.
  - **Strip Metadata Berikon Emas**: 🏷️ Kategori Sub-Menu, 🕒 Tanggal & Waktu Pelaksanaan, 👤 Oleh: Admin Website *(tanpa lokasi, narasumber, kuota, atau status)*.
  - **Cover Pamflet Utama**: Gambar poster kegiatan resolusi penuh dengan sudut melengkung dan bayangan halus.
  - **Isi Artikel / Deskripsi Kegiatan**: Render teks kaya (*rich markdown*) dengan heading, poin materi, dan daftar bernomor.
  - **Bilah Share Bawah**: 5 tombol sosial media di bawah artikel.
  - **Fitur Dihilangkan Sesuai Instruksi**: Form *"Tinggalkan Komentar"* dan seksi *"Berita Terkait"* dihilangkan sepenuhnya.

#### 3. Penyesuaian Sinkronisasi Wrapper Layanan (`LayananContainer.tsx`)
- Menambahkan `LayananContext` (`isDetailActive`, `setIsDetailActive`) agar header besar dan breadcrumb umum dari `LayananContainer` otomatis disembunyikan saat pengguna sedang membaca halaman detail kegiatan.
- Memperbaiki stabilitas `motion.div` agar komponen kartu tidak ter-*unmount* saat kartu diklik.

#### 4. Penyesuaian Form Input Panel Admin (`AdminDashboard.tsx`)
- **Pembersihan Field Form Konten Layanan (Workshop, Softskill, Seminar):**
  - ❌ Menghilangkan input *Tempat / Lokasi*.
  - ❌ Menghilangkan input *Pembicara / Narasumber*.
  - ❌ Menghilangkan input *Kuota Peserta*.
  - ❌ Menghilangkan input *Sudah Terdaftar*.
  - ❌ Menghilangkan input *Link Pendaftaran (URL eksternal)*.
  - ❌ Menghilangkan dropdown *Status Pendaftaran (Pendaftaran Dibuka / Segera Hadir / Selesai)*.
- **Field yang Dipertahankan & Ditingkatkan:**
  - ✅ Judul Konten / Kegiatan.
  - ✅ Tanggal Pelaksanaan * (Wajib).
  - ✅ Waktu Pelaksanaan (mis. `09:00 - 14:00 WITA`).
  - ✅ Upload Pamflet / Thumbnail Poster.
  - ✅ Isi Konten / Deskripsi Lengkap (Editor WYSIWYG / Format Word).
  - ✅ Status Publikasi (Draft / Published) & Pin ke Popular Info.
- **Perbaikan Bug Penyimpanan WYSIWYG:**
  - Memperbaiki logika `handleSaveKonten` agar otomatis membaca konten HTML/WYSIWYG dari `beritaEditRef` untuk jenis `workshop`, `softskill`, dan `seminar` sehingga tidak terjadi error *"Isi konten (body) wajib diisi"*.

#### 5. Pembaruan Data Dummy Kegiatan (`src/data.ts`) & Parser Markdown (`src/markdown.tsx`)
- Memperkaya seluruh data dummy `SEED_EVENT_LAYANAN` dengan deskripsi markdown artikel yang realistis, komprehensif, dan terstruktur.
- Memperluas `renderContentMarkdown` pada `src/markdown.tsx` agar mendukung heading `###`, `####`, daftar bernomor (`1.`, `2.`), dan bullet points.

---

### 📁 File Diubah
- **[MODIFY]** `src/components/layanan/EventDetailView.tsx` — layout detail kegiatan baru ala Berita & Artikel
- **[MODIFY]** `src/components/layanan/ui/EventCardLayout.tsx` — perombakan kartu, panel kontrol pencarian, periode, sort, dan total badge
- **[MODIFY]** `src/components/layanan/LayananContainer.tsx` — integrasi context visibilitas header dan stabilitas navigasi
- **[MODIFY]** `src/components/AdminDashboard.tsx` — pembersihan 6 field form layanan dan perbaikan simpan WYSIWYG
- **[MODIFY]** `src/data.ts` — pengayaan teks dummy event layanan format markdown
- **[MODIFY]** `src/markdown.tsx` — dukungan rendering heading dan list markdown
- **[MODIFY]** `progres.md` — pencatatan lengkap seluruh progres pengerjaan sesi ini oleh ARYA APRIAWAN

### 📋 Checklist Selesai Sesi Ini
- [x] Penghapusan status pendaftaran, lokasi, pembicara, kuota dari Card Layout Layanan
- [x] Pembuatan layout detail kegiatan identik dengan Berita & Artikel tanpa komentar dan tanpa berita terkait
- [x] Penggantian filter tanggal dengan Search Bar Luas, Dropdown Periode Tahun, Dropdown Urutkan, dan Total Badge
- [x] Penyesuaian Form Admin Workshop/Softskill/Seminar (menghapus 6 field yang tidak diperlukan)
- [x] Perbaikan penyimpanan upload konten layanan di Panel Admin
- [x] Pembaruan data dummy realistis di `SEED_EVENT_LAYANAN`
- [x] Verifikasi browser testing berhasil tanpa error
- [x] Pencatatan laporan progres di `progres.md` atas nama ARYA APRIAWAN
- [x] Git commit dan push ke GitHub repository

