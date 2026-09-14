# Analisis Project — Portal CDC UM Kendari

> Dibuat oleh agent setelah membaca seluruh source (`src/`) + folder `.agents/`.
> Tujuannya: dokumentasi alur kerja & kegunaan sebagai referensi sebelum lanjut develop.

## 1. JENIS & STACK
- Single-page React app (Vite 6 + React 19 + TypeScript), TANPA router library (navigasi pakai state `useState` di `App.tsx`).
- Styling: Tailwind CSS v4 (via `@tailwindcss/vite`), tema kustom di `src/index.css` (palet slate di-rewrite jadi warm clay + emerald botani + blue mineral). Font: Inter / Playfair / JetBrains Mono.
- Motion: `motion` (framer-motion v12) — entrance fade, stagger, hover.
- Ikon: `lucide-react`.
- Database: **localStorage** (bukan backend nyata). Key prefix `cdc_umk_<tabel>`. Seed di `src/data.ts`, di-init lewat `initializeDB()` (versioned `cdc_seed_version`).
- Build: `npm run build` (✅ lolos). Lint: `npm run lint` = `tsc --noEmit` (⚠️ GAGAL — lihat §6).

## 2. ALUR & ROUTING (state-based, App.tsx)
`currentView`: 'public' | 'login' | 'register' | 'dashboard'
- PUBLIC menampilkan `PublicLayout` dengan `publicTab` (beranda, profil, visi-misi, layanan-*, lowongan, prestasi-*, dll).
- DETAIL lowongan/berita/program: state `viewingLowonganId` / `viewingBeritaSlug` / `viewingProgramId` → render `JobDetail` / artikel markdown / program.
- LOGIN: form di `App.tsx`, cocokkan email di `users` localStorage. Cek status pending/inactive/rejected.
- REGISTER: `Register.tsx` → `registerUser()` (alumni/mitra) simpan ke `users`+`alumni`/`mitra`.
- DASHBOARD: dispatch by role:
  - role `user`/`mahasiswa`/`alumni` → `MahasiswaDashboard`
  - role `mitra` → `MitraDashboard`
  - role `admin` → `AdminDashboard`
  - role `viewer` → **TIDAK ada branch** (blank, sesuai catatan memory).

### Akun seed (password semua: "password"):
- admin@umkendari.ac.id (usr_admin)
- mhs@umkendari.ac.id (usr_mhs1, active), rahma@... (usr_mhs2, pending)
- alumni@..., mega@... (active)
- mitra@... (usr_mitra1, active), bsi@... (usr_mitra2, pending)
- viewer@... (usr_viewer, active) — tapi dashboard viewer belum diimplementasi.

## 3. ROLE & KEGUNAAN
- **User/Mahasiswa/Alumni**: cari lowongan (`JobSearchMasterDetail`), apply (`JobApplicationModal` → `applyForJob()` → simpan ke `pengajuan_magang`), lihat "Lamaran Saya" (`StudentApplicationsView`), edit profil (`StudentProfileView`). Bookmark lowongan via localStorage `cdc_saved_job_ids`.
- **Mitra** (`MitraDashboard`, 5 tab: ringkasan, profil, lowongan, pelamar, survei): buat/edit lowongan (sinkron ke `JobDetail`), lihat pelamar + download CV (`FileReader`), terima/tolak/hapus pelamar, lihat Survei Lulusan.
- **Admin** (`AdminDashboard`, 5 tab: ringkasan, konten, mitra, admin, prestasi):
  - Ringkasan: KPI, aktivitas terkini, distribusi role, tren mingguan, top mitra (chart di `ChartArea.tsx`).
  - Konten: editor Medium-style (`KontenKarir` → `konten_karir`) untuk berita/program → muncul di beranda & tab Berita.
  - Mitra: approval + daftar mitra.
  - Admin: kelola user/approval akun.
  - Prestasi: CRUD prestasi mahasiswa.
- **Public**: beranda (HeroSlider, stats, search engine, info karir, program/pengumuman, prestasi), Job Info (katalog + filter), detail lowongan, layanan (pamphlet), tracer study & simbelmawa (external link ke tracerstudy.umkendari.ac.id).

## 4. STRUKTUR FOLDER PENTING
```
src/
  App.tsx                 # router state + auth + reload DB
  data.ts                 # SEED_* + CRUD localStorage helpers (1482 baris)
  types.ts                # semua interface domain
  markdown.tsx            # mini markdown renderer (#, ##, >, **, *)
  index.css               # tema Tailwind kustom
  components/
    PublicLayout.tsx      # halaman publik utama (1187 baris)
    Header.tsx            # navbar 2-layer + mega menu (595 baris)
    HeroSlider.tsx, Footer.tsx, MegaMenu.tsx, Register.tsx
    JobSearchMasterDetail.tsx  # katalog + filter 38 provinsi
    JobDetail.tsx, JobApplicationModal.tsx
    ChartArea.tsx, Dropdown.tsx
    MahasiswaDashboard.tsx, MitraDashboard.tsx (3156 baris!), AdminDashboard.tsx (2353 baris)
    StudentProfileView.tsx, StudentApplicationsView.tsx, TracerStudyForm.tsx
    layanan/              # 14 halaman layanan (sebagian masih dummy)
      LayananContainer.tsx  # hero + menu LAYANAN_MENU (8 item)
      ui/                 # design system bersama (PageHeader, Card, Section, ...)
```

## 5. FOLDER `.agents/` (skill terinstal)
7 skill desain/brand: `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`, `ui-ux-pro-max`.
- `ui-ux-pro-max`: 67 style, 161 palet, 57 font pairing, 99 UX guideline, 25 chart, 22 stack — ada `scripts/search.py` (jalankan via `python`, NOT `python3`).
- `design`: logo/CIP/banner/icon/slides generator + `scripts/` (core.py, generate.py, search.py).
- `brand`: voice/visual identity + `scripts/` (extract-colors, sync-brand-to-tokens).
- `ui-styling`: shadcn/ui + tailwind generator.
- Gunakan ini untuk kerja desain biar nggak "AI-slop".

## 6. FINDING / INKONSISTENSI (perlu perhatian)
1. ⚠️ **`npm run lint` GAGAL** — `src/components/layanan/EventDetailView.tsx` impor `react-router-dom` yang TIDAK ada di `package.json`/`node_modules`. Build tetap lolos (Vite tree-shake / tipe tidak fatal saat bundling). Perlu: hapus impor `useParams/useNavigate` (komponen orphan) atau tambah dependency.
2. ⚠️ **`EventDetailView` orphan** — diimpor di `App.tsx` (line 20) tapi TIDAK PERNAH di-render (`<EventDetailView .../>` tidak ada). `EventCardLayout.tsx` juga tidak mereferensikannya. Komponen mati +DependencyError.
3. ⚠️ **Inkonsistensi menu "Tes Minat"**:
   - `Header.tsx` (line 78): Tes Potensi Minat Kerja = external link klob.id (sudah benar, sesuai progres 7 Agt).
   - TAPI `LayananContainer.tsx` (LAYANAN_MENU) & `PublicLayout.tsx` (line 1011-1014) MASIH memetakan tab `tes-minat` → halaman internal `<TesMinat />` (112 baris, konten asli). Jadi ada 2 pintu "Tes Minat": external (Header) + internal (URL manual `tab=tes-minat`). Progres bilang TesMinat dihapus dari menu, tapi kodenya masih ada di LayananContainer. Rawan kebingungan.
4. ⚠️ **Layanan masih placeholder/dummy**: `BimbinganKarir.tsx`, `CampusHiring.tsx`, `CareerFair.tsx` masing-masing cuma ~11 baris ("Pamphlet akan diunggah Admin"). Sesuai progres yang bilang layanan = pamphlet admin-input, tapi user yang buka bakal lihat kosong.
5. ℹ️ **`SEED_EVENT_LAYANAN`** (`EventLayananItem`, workshop/seminar seed) TIDAK dipakai di UI manapun (grep hanya di data.ts). Event card layout ada tapi belum wiring.
6. ℹ️ **`viewer` role** tidak di-dispatch di dashboard (blank) — sesuai catatan memory, ini known gap.
7. ℹ️ `progres.md` menyebut `AdminDashboard.md` sebagai backlog, tapi file itu TIDAK ADA di repo.
8. ℹ️ Chunk JS 888 kB (>500 kB warning) — bisa di-code-split kalau perlu.

## 7. KONVENSI YANG SUDAH BERLAKU (ikuti saat develop)
- Warna brand: biru corporate `#0077C6` / `#1E3A8A`, aksen oranye `#F26522` (header hover), emerald `#10B981` (akses/CTA sekunder). Hindari gradient soup.
- Radius konsisten `rounded-xl`/`rounded-2xl`. Minimalis. Tidak ada card grid equal-weight / icon-topper filler (anti-AI-slop).
- Layanan pakai design system `src/components/layanan/ui/` (PageHeader, Card, Section, dll) via barrel `ui/index.tsx`.
- Reuse UI surface yang ADA, jangan duplikasi tombol/menu (user sudah 2x mengkoreksi ini).
- Verifikasi selalu `npm run build` (bukan cuma lint). `npm run lint` saat ini GAGAL jadi jangan jadikan gate.
- DEFINITION_OF_DONE.md wajib dipatuhi: fitur = fungsional + run + semua state + skenario gagal + no placeholder.
