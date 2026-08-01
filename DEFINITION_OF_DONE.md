# DEFINITION OF DONE — CDC UM Kendari

> File ini adalah standar kerja permanen. Mention file ini (`@DEFINITION_OF_DONE.md`) di SETIAP prompt yang meminta agent membangun atau mengubah fitur — bukan cuma sekali di awal project.

---

## 1. Masalah yang Ingin Dicegah

Agent sering menganggap sebuah fitur "selesai" hanya karena **tampilannya sudah ada**, padahal:
- Tombol/menu ada tapi belum terhubung ke fungsi apa pun (contoh: menu Pengaturan yang muncul tapi tidak melakukan apa-apa saat diklik).
- Data ditampilkan tapi hardcoded/statis, bukan hasil dari logic/API yang sebenarnya.
- Ada state (loading, error, kosong) yang tidak ditangani, hanya "happy path" yang dibuat.
- Fitur terlihat jalan di satu skenario tapi belum dicoba di skenario lain (misal: form belum dicoba submit dengan input kosong/salah).

**Aturan dasar: UI tanpa fungsi yang benar-benar bekerja BUKAN fitur selesai — itu mockup.**

---

## 2. Definisi "Selesai" (Definition of Done)

Sebuah fitur baru boleh dilaporkan "selesai" HANYA jika semua poin berikut terpenuhi:

- [ ] **Fungsional penuh** — setiap tombol, input, toggle, atau menu yang terlihat di UI benar-benar terhubung ke logic/fungsi yang bekerja, bukan sekadar dekorasi visual.
- [ ] **Sudah dijalankan/di-run, bukan cuma ditulis** — agent benar-benar menjalankan aplikasi/fitur tersebut (build, hot reload, atau test run), bukan hanya menulis kode dan mengasumsikan itu akan bekerja.
- [ ] **Semua state ditangani** — loading, kosong (empty state), error, dan sukses. Kalau salah satu belum ditangani, sebutkan secara eksplisit ke saya, jangan disembunyikan.
- [ ] **Sudah dicoba dengan skenario gagal**, bukan cuma skenario ideal. Contoh: form dicoba disubmit kosong, koneksi API dicoba saat gagal/timeout, dsb.
- [ ] **Tidak ada TODO, placeholder, atau komentar "nanti dilengkapi" yang tersisa** di kode untuk fitur yang diklaim selesai. Kalau memang ada bagian yang sengaja belum dikerjakan, itu harus dilaporkan sebagai "belum selesai", bukan "selesai dengan catatan".
- [ ] **Konsisten dengan bagian lain aplikasi** — style, penamaan, dan struktur mengikuti yang sudah ada, bukan menciptakan pola baru sendiri.

Kalau salah satu poin di atas tidak terpenuhi, status yang benar adalah **"belum selesai"**, bukan "selesai".

---

## 3. Larangan

- **Jangan melaporkan fitur "selesai" atau "berhasil" tanpa benar-benar menjalankannya lebih dulu.** Menulis kode yang *terlihat* benar tidak sama dengan kode yang *terbukti* berjalan.
- **Jangan mengerjakan tampilan (UI) sebelum logic/fungsinya jelas.** Kalau UI dibuat duluan (misalnya untuk keperluan review desain), itu harus dilabeli eksplisit sebagai "UI only — belum fungsional", bukan disajikan seolah sudah jadi fitur utuh.
- **Jangan lompat mengerjakan banyak fitur sekaligus lalu melaporkan semuanya "selesai" di akhir.** Selesaikan dan verifikasi satu fitur dulu sampai benar-benar bekerja, baru lanjut ke fitur berikutnya.
- **Jangan diam-diam melewati bagian yang sulit/error dan lanjut ke bagian lain.** Kalau ada bagian yang gagal atau tidak bisa diselesaikan, laporkan itu duluan — jangan ditinggalkan dalam kondisi setengah jadi tanpa keterangan.
- **Jangan mengarang bahwa sesuatu "sudah ditest"** kalau agent tidak benar-benar menjalankan test/eksekusi tersebut.

---

## 4. Format Laporan yang Wajib Dipakai

Setiap kali agent selesai mengerjakan sesuatu, laporkan dengan format berikut — bukan sekadar "sudah selesai, silakan dicek":

```
STATUS: [Selesai / Belum Selesai / Sebagian]

Yang sudah bekerja dan sudah diverifikasi:
jangan copas kodenya 
- ...

Yang BELUM bekerja / belum diverifikasi (jika ada):
- ...

Cara saya memverifikasi ini:
- (jelaskan bagaimana agent menguji/menjalankan fitur ini, bukan hanya menulis kodenya)

Langkah berikutnya yang saya sarankan:
- ...
```

Kalau agent tidak bisa mengisi bagian "Cara saya memverifikasi ini" dengan jujur (misalnya karena belum sempat run), maka STATUS wajib "Belum Selesai" atau "Sebagian" — tidak boleh "Selesai".

---

## 5. Kalau Waktu/Scope Terbatas

Kalau suatu fitur terlalu besar untuk diselesaikan sekaligus:
- Pecah jadi bagian-bagian kecil yang masing-masing bisa benar-benar selesai dan diverifikasi.
- Laporkan ke saya bagian mana yang akan dikerjakan dulu, dan tunggu konfirmasi sebelum lanjut ke bagian berikutnya.
- Jangan membuat kerangka besar semua fitur sekaligus dalam kondisi setengah jadi hanya supaya "kelihatan progress banyak".

Lebih baik 1 fitur kecil yang benar-benar selesai dan berfungsi, daripada 5 fitur yang semuanya setengah jadi.
