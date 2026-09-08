# 🚀 LAUNCH PLAN — Portal CDC UMK Kendari

> **Target: JUMAT (go-live)** · Disusun: Selasa
> Status kode terakhir: commit `9d2bd94` (security hardening) · E2E: 19/21 pass (90.5%)
> Aturan main: semua klaim "selesai" mengikuti `DEFINITION_OF_DONE.md`

---

## 1. Pembagian Kerja & Owner

| Owner | Wilayah | Status per Selasa |
|---|---|---|
| **Admin** (1 orang) | Dashboard admin + integrasinya | ⚠️ Ada perubahan belum di-commit (`AdminDashboard.tsx`) |
| **User** (1 orang) | Dashboard mitra & mahasiswa/alumni + menu lowongan + integrasinya | Cek: commit sendiri |
| **Layanan** (1 orang) | Menu layanan + integrasinya | ⚠️ 3 placeholder: BimbinganKarir, CampusHiring, CareerFair |
| **Fahrul** | Beranda + backend + database | ⚠️ WIP: `PublicLayout.tsx`, `data.ts`, `types.ts`, `i18n.ts` |
| **Koordinator** | Fahrul (PM) | Scope freeze, risiko, deploy |

---

## 2. Jadwal Harian

### Selasa (HARI INI) — Bersihkan & Bekukan
- [ ] **SEMUA ANGGOTA**: commit/push semua WIP masing-masing. Tidak ada kerjaan "menggantung" menjelang launch. (deadline: hari ini)
- [ ] **Admin**: fix `EventDetailView.tsx` — impor `react-router-dom` yang tidak ada → `npm run lint` harus hijau (±15 menit)
- [ ] **Layanan**: keputusan final 3 placeholder → **sembunyikan dari menu publik** (tandai "Segera"), JANGAN bangun baru. Catat sebagai defer.
- [ ] **Fahrul**: audit — data apa yang masih localStorage vs sudah Supabase? Ini penghambat launch #1.
- [ ] **Fahrul**: siapkan staging cloud (Railway/Render/Vercel + Supabase production branch)
- [ ] **Tim**: putuskan fitur Must vs Defer → tulis di §4, tidak ada additions setelah ini

### Rabu — Sprint Perbaikan
- [ ] **Admin**: integrasi dashboard admin ↔ Supabase selesai + diverifikasi
- [ ] **User**: alur mahasiswa/mitra end-to-end (register → pending → active → apply loker → mitra terima/tolak) jalan di DB nyata
- [ ] **Layanan**: halaman layanan yang live (PKL/Magang, Tracer Study, Konseling, Prestasi) diverifikasi di DB nyata
- [ ] **Fahrul**: beranda + backend: rate limit, helmet, env production, seed data produksi (lowongan & artikel ASLI, bukan seed)
- [ ] **SEMUA**: nonaktifkan akun seed password `"password"` + Fast Role Tester di build production ← **launch blocker**
- [ ] Deploy staging cloud, jalankan `npm run test` penuh

### Kamis — CODE FREEZE + UAT
- [ ] Tidak ada fitur baru. Hanya bugfix kritis.
- [ ] E2E penuh di staging (target: 21/21)
- [ ] UAT: demo ke stakeholder CDC kampus lewat URL staging → catat feedback, triase (kritis vs defer)
- [ ] Siapkan prosedur rollback VPS (backup DB + snapshot deploy sebelumnya)
- [ ] Cek DNS `cdc.umkendari.ac.id` → arahkan ke VPS

### Jumat — GO-LIVE
- [ ] Pagi: deploy final ke VPS kampus dari kode yang sama dengan staging
- [ ] Smoke test di VPS (login, apply loker, admin CRUD, tracer study form)
- [ ] Siang: rilis / umumkan
- [ ] Sepanjang hari: pantau log & error. Bugfix kecil boleh hotfix; sisanya masuk V1.1

---

## 3. Strategi Deploy

```
Local dev ──> Staging cloud (Rabu-Kamis) ──> VPS kampus (Jumat)
              ↑ bug ditemukan & difix di sini   ↑ hanya kode yang sudah hijau
```
- Staging = percobaan nyata: env production, DB Supabase terpisah (branch/staging)
- VPS kampus = hanya menerima kode yang sudah lolos UAT Kamis
- Rollback: tag git `v1.0.0-rc` sebelum freeze; VPS simpan build sebelumnya

## 4. Scope: Must vs Defer

**MUST (launch Jumat):**
- Portal publik (beranda, lowongan, berita, program) dengan data ASLI
- Login/register + alur pending→active (3 role)
- Dashboard admin, mitra, mahasiswa/alumni — fungsional penuh di DB
- Layanan live: PKL/Magang, Tracer Study, Konseling, Prestasi
- Keamanan production: tanpa seed password, tanpa role switcher dev

**DEFER → V1.1:**
- BimbinganKarir, CampusHiring, CareerFair (tampil "Segera")
- Dashboard role `viewer`
- Tes Minat internal vs eksternal (pakai link eksternal dulu)
- Code-splitting chunk 888 kB
- Cleanup `SEED_EVENT_LAYANAN`, `transform_layout.cjs`

## 5. Risk Register

| Risiko | L | D | Mitigasi | Owner |
|---|---|---|---|---|
| Data masih localStorage, belum migrasi Supabase | T | Tinggi | Audit Selasa, migrasi Rabu | Fahrul |
| Konten asli (loker/artikel/logo mitra) belum ada | T | Tinggi | Kumpulkan dari staff CDC hari ini | Fahrul+tim |
| VPS kampus bermasalah (network, SSL, resource) | S | Sedang | Staging cloud = plan B sementara | Fahrul |
| Permintaan fitur baru dari stakeholder | T | Sedang | §4 final, negosiasi oleh PM | Semua |
| Bug muncul saat go-live Jumat | S | Rendah | Rollback siap, freeze Kamis | Semua |

## 6. Ritual
- **Standup 10 menit tiap pagi** (chat grup): kemarin apa, hari ini apa, blocker apa
- Setiap selesai fitur → update dokumen ini + commit dengan pesan jelas
- Bug baru → tambah ke §5, tentukan kritis/defer sebelum dikerjakan
