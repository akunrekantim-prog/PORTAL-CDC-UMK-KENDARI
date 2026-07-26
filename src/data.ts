/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Mahasiswa,
  Alumni,
  Mitra,
  Lowongan,
  PengajuanMagang,
  UploadedDocument,
  TracerStudy,
  Berita,
  Pengumuman,
  SurveiLulusan
} from './types';

// Mock Password: all seeded accounts use "password"
export const SEED_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Operator CDC UM Kendari',
    email: 'admin@umkendari.ac.id',
    phone: '081234567890',
    role: 'admin',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_mhs1',
    name: 'Muhammad Fadly Alamsyah',
    email: 'mhs@umkendari.ac.id',
    phone: '085241009988',
    role: 'mahasiswa',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'usr_mhs2',
    name: 'Siti Rahmawati',
    email: 'rahma@umkendari.ac.id',
    phone: '082199008811',
    role: 'mahasiswa',
    status: 'pending',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-06-01T10:15:00Z'
  },
  {
    id: 'usr_alumni1',
    name: 'Fachrul Alam Prasetyo, S.Kom.',
    email: 'alumni@umkendari.ac.id',
    phone: '081122334455',
    role: 'alumni',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-01-20T11:00:00Z'
  },
  {
    id: 'usr_alumni2',
    name: 'Andi Megawati, S.E.',
    email: 'mega@umkendari.ac.id',
    phone: '085311223344',
    role: 'alumni',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-03-05T14:20:00Z'
  },
  {
    id: 'usr_mitra1',
    name: 'Budi Setiawan (HRD PT Go Digital)',
    email: 'mitra@umkendari.ac.id',
    phone: '081299998888',
    role: 'mitra',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'usr_mitra2',
    name: 'Suhartono (Bank Syariah Indonesia Kendari)',
    email: 'bsi@umkendari.ac.id',
    phone: '081377776666',
    role: 'mitra',
    status: 'pending',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-05-28T09:00:00Z'
  },
  {
    id: 'usr_viewer',
    name: 'Dr. H. Ruslan, M.Si.',
    email: 'viewer@umkendari.ac.id',
    phone: '081144455566',
    role: 'viewer',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-01-15T09:00:00Z'
  }
];

export const SEED_MAHASISWA: Mahasiswa[] = [
  {
    id: 'mhs1',
    userId: 'usr_mhs1',
    nim: '202101001',
    nama: 'Muhammad Fadly Alamsyah',
    email: 'mhs@umkendari.ac.id',
    phone: '085241009988',
    programStudi: 'Teknik Informatika',
    fakultas: 'Fakultas Teknik',
    angkatan: '2021',
    semester: 10,
    alamat: 'Jl. K.H. Ahmad Dahlan No. 10, Kota Kendari, Sulawesi Tenggara'
  },
  {
    id: 'mhs2',
    userId: 'usr_mhs2',
    nim: '202302044',
    nama: 'Siti Rahmawati',
    email: 'rahma@umkendari.ac.id',
    phone: '082199008811',
    programStudi: 'Sistem Informasi',
    fakultas: 'Fakultas Teknik',
    angkatan: '2023',
    semester: 6,
    alamat: 'Jl. Jenderal Sudirman No. 45, Kendari'
  }
];

export const SEED_ALUMNI: Alumni[] = [
  {
    id: 'alm1',
    userId: 'usr_alumni1',
    nim: '202001045',
    nama: 'Fachrul Alam Prasetyo, S.Kom.',
    email: 'alumni@umkendari.ac.id',
    phone: '081122334455',
    programStudi: 'Teknik Informatika',
    fakultas: 'Fakultas Teknik',
    tahunLulus: '2025',
    statusPekerjaan: 'bekerja',
    instansiKerja: 'PT Go Digital Kendari',
    jabatan: 'Web Developer'
  },
  {
    id: 'alm2',
    userId: 'usr_alumni2',
    nim: '202002102',
    nama: 'Andi Megawati, S.E.',
    email: 'mega@umkendari.ac.id',
    phone: '085311223344',
    programStudi: 'Manajemen',
    fakultas: 'Fakultas Ekonomi dan Bisnis Islam',
    tahunLulus: '2024',
    statusPekerjaan: 'wirausaha',
    instansiKerja: 'Kopi Sultan Kendari',
    jabatan: 'Owner'
  }
];

export const SEED_MITRA: Mitra[] = [
  {
    id: 'mtr1',
    userId: 'usr_mitra1',
    namaInstansi: 'PT Go Digital Kendari',
    bidangIndustri: 'Teknologi Informasi & Software',
    alamat: 'Kawasan Bisnis Kendari Town Square (KTS) Lt. 2, Kendari',
    kontakPerson: 'Budi Setiawan',
    email: 'mitra@umkendari.ac.id',
    phone: '081299998888',
    website: 'https://godigitalkendari.com',
    statusKerjaSama: 'aktif'
  },
  {
    id: 'mtr2',
    userId: 'usr_mitra2',
    namaInstansi: 'Bank Syariah Indonesia (BSI) Area Kendari',
    bidangIndustri: 'Perbankan & Keuangan Syariah',
    alamat: 'Jl. Abdullah Silondae No. 12, Kendari',
    kontakPerson: 'Suhartono',
    email: 'bsi@umkendari.ac.id',
    phone: '081377776666',
    website: 'https://bankbsi.co.id',
    statusKerjaSama: 'pending'
  }
];

export const SEED_LOWONGAN: Lowongan[] = [
  {
    id: 'low1',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Fullstack Web Developer Intern',
    tipe: 'magang',
    namaInstansi: 'PT Go Digital Kendari',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop',
    flyers: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744094-3a3e22035383?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop'
    ],
    lokasi: 'Kendari (On-site / Hybrid)',
    deskripsi: 'PT Go Digital Kendari membuka kesempatan magang bagi mahasiswa tingkat akhir Universitas Muhammadiyah Kendari untuk posisi Fullstack Developer. Anda akan terlibat langsung dalam pembangunan aplikasi e-commerce lokal, berkolaborasi dengan tim profesional, dan mempelajari framework modern seperti React dan Express.',
    kualifikasi: [
      'Mahasiswa aktif prodi Teknik Informatika / Sistem Informasi semester 6 ke atas',
      'Memahami dasar pemrograman Javascript/TypeScript, HTML, CSS',
      'Mengenal React atau Node.js adalah nilai tambah',
      'Mampu bekerja sama dalam tim dan bersedia mengikuti program magang selama 3-6 bulan'
    ],
    benefit: [
      'Uang saku bulanan / insentif',
      'Sertifikat magang CDC Universitas Muhammadiyah Kendari',
      'Mentorship intensif oleh Senior Developer',
      'Peluang direkrut menjadi karyawan tetap setelah lulus'
    ],
    kuota: 3,
    deadline: '2026-07-15',
    status: 'published',
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'low2',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'UI/UX Designer Intern',
    tipe: 'magang',
    namaInstansi: 'PT Go Digital Kendari',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    flyers: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop'
    ],
    lokasi: 'Kendari (Hybrid)',
    deskripsi: 'Merancang antarmuka aplikasi mobile dan web berorientasi pengguna. Magang ini sangat cocok bagi Anda yang menyukai visual, prototipe interaktif, dan riset kebiasaan pengguna.',
    kualifikasi: [
      'Menguasai Figma atau Adobe XD',
      'Memiliki portofolio desain UI dasar (meskipun tugas kuliah)',
      'Memiliki pemahaman dasar tentang wireframing, user flows, dan grid system',
      'Membawa laptop pribadi yang mendukung proses desain'
    ],
    benefit: [
      'Uang saku bulanan',
      'Sertifikat magang resmi',
      'Portofolio berkualitas industri',
      'Bimbingan langsung dari UI/UX Specialist'
    ],
    kuota: 2,
    deadline: '2026-07-20',
    status: 'published',
    createdAt: '2026-05-12T11:00:00Z'
  },
  {
    id: 'low3',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Junior Web Developer (Lulusan Baru)',
    tipe: 'kerja',
    namaInstansi: 'PT Go Digital Kendari',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    flyers: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744094-3a3e22035383?q=80&w=800&auto=format&fit=crop'
    ],
    lokasi: 'Kendari (On-site)',
    deskripsi: 'Kami mencari lulusan baru (fresh graduate) dari alumni UM Kendari untuk bergabung dalam tim pengembang perangkat lunak utama kami.',
    kualifikasi: [
      'Alumni UM Kendari (diutamakan Teknik Informatika / Sistem Informasi)',
      'Memahami RESTful API, OOP dasar, dan database SQL',
      'IPK minimal 3.00',
      'Siap ditempatkan di kantor pusat Kendari'
    ],
    benefit: [
      'Gaji pokok kompetitif',
      'BPJS Kesehatan & Ketenagakerjaan',
      'Bonus performa tahunan',
      'Lingkungan kerja tech-startup yang dinamis'
    ],
    kuota: 2,
    deadline: '2026-06-30',
    status: 'published',
    createdAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'low4',
    mitraId: 'mtr2',
    createdBy: 'usr_mitra2',
    judul: 'Frontliner & Operational Internship',
    tipe: 'magang',
    namaInstansi: 'Bank Syariah Indonesia (BSI) Area Kendari',
    companyLogo: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1556742049-0a67d55febc4?q=80&w=1200&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    flyers: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop'
    ],
    lokasi: 'Jl. Abdullah Silondae, Kendari',
    deskripsi: 'Mempelajari sistem administrasi, pencatatan transaksi syariah, dan melayani nasabah secara profesional dengan menerapkan service excellence khas perbankan syariah syandard nasional.',
    kualifikasi: [
      'Mahasiswa aktif Fakultas Ekonomi dan Bisnis Islam atau Fakultas Hukum (Hukum Keluarga/Muamalah)',
      'Berpenampilan rapi, komunikatif, dan ramah',
      'Mampu mengoperasikan Microsoft Office (Word, Excel, PowerPoint) dengan baik',
      'Tinggi badan minimal: Pria 165 cm, Wanita 155 cm'
    ],
    benefit: [
      'Uang saku bulanan resmi dari BSI',
      'Sertifikat industri perbankan syariah nasional',
      'Pengalaman kerja nyata di lembaga keuangan BUMN',
      'Seragam magang standar BSI'
    ],
    kuota: 5,
    deadline: '2026-07-10',
    status: 'published',
    createdAt: '2026-05-29T10:00:00Z'
  }
];

export const SEED_PENGAJUAN_MAGANG: PengajuanMagang[] = [
  {
    id: 'pj_001',
    mahasiswaId: 'mhs1',
    userId: 'usr_mhs1',
    lowonganId: 'low1',
    namaMahasiswa: 'Muhammad Fadly Alamsyah',
    nim: '202101001',
    programStudi: 'Teknik Informatika',
    tujuanMagang: 'PT Go Digital Kendari',
    lokasiMagang: 'Kendari',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-10-31',
    status: 'accepted',
    catatanAdmin: 'Berkas lengkap dan sesuai kualifikasi mitra. Disetujui untuk memulai magang.',
    verifiedBy: 'usr_admin',
    verifiedAt: '2026-05-20T10:00:00Z',
    createdAt: '2026-05-18T14:00:00Z'
  }
];

export const SEED_DOCUMENTS: UploadedDocument[] = [
  {
    id: 'doc_001',
    ownerUserId: 'usr_mhs1',
    pengajuanId: 'pj_001',
    name: 'Surat Pengantar Dekan.pdf',
    type: 'surat_pengantar',
    fileUrl: '#mock-file-url',
    mimeType: 'application/pdf',
    sizeBytes: 1542000,
    uploadedAt: '2026-05-18T13:45:00Z'
  },
  {
    id: 'doc_002',
    ownerUserId: 'usr_mhs1',
    pengajuanId: 'pj_001',
    name: 'Curriculum Vitae Fadly.pdf',
    type: 'cv',
    fileUrl: '#mock-file-url',
    mimeType: 'application/pdf',
    sizeBytes: 852000,
    uploadedAt: '2026-05-18T13:46:00Z'
  },
  {
    id: 'doc_003',
    ownerUserId: 'usr_mhs1',
    pengajuanId: 'pj_001',
    name: 'Transkrip Nilai Sementara.pdf',
    type: 'transkrip',
    fileUrl: '#mock-file-url',
    mimeType: 'application/pdf',
    sizeBytes: 2110000,
    uploadedAt: '2026-05-18T13:48:00Z'
  }
];

export const SEED_TRACER_STUDIES: TracerStudy[] = [
  {
    id: 'tr_001',
    alumniId: 'alm1',
    userId: 'usr_alumni1',
    nama: 'Fachrul Alam Prasetyo, S.Kom.',
    programStudi: 'Teknik Informatika',
    tahunLulus: '2025',
    statusPekerjaan: 'bekerja',
    masaTungguKerja: 'kurang_3_bulan',
    namaInstansi: 'PT Go Digital Kendari',
    jabatan: 'Web Developer',
    bidangPekerjaan: 'Teknologi Informasi',
    kesesuaianBidang: 'sangat_sesuai',
    rangePenghasilan: '5_10jt',
    saranUntukKampus: 'Mohon agar praktikum basis data dan pemrograman berorientasi objek lebih diperbanyak studi kasus riil industri.',
    submittedAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'tr_002',
    alumniId: 'alm2',
    userId: 'usr_alumni2',
    nama: 'Andi Megawati, S.E.',
    programStudi: 'Manajemen',
    tahunLulus: '2024',
    statusPekerjaan: 'wirausaha',
    masaTungguKerja: '3_6_bulan',
    namaInstansi: 'Kopi Sultan Kendari',
    jabatan: 'Owner',
    bidangPekerjaan: 'Kuliner & Kafe',
    kesesuaianBidang: 'sesuai',
    rangePenghasilan: '5_10jt',
    saranUntukKampus: 'Mata kuliah kewirausahaan sebaiknya mengundang praktisi UMKM langsung agar memberikan gambaran tantangan yang nyata.',
    submittedAt: '2026-03-25T11:45:00Z'
  },
  {
    id: 'tr_003',
    alumniId: 'alm_dummy1',
    userId: 'usr_dummy1',
    nama: 'Ahmad Faisal, S.Kom.',
    programStudi: 'Sistem Informasi',
    tahunLulus: '2025',
    statusPekerjaan: 'bekerja',
    masaTungguKerja: '3_6_bulan',
    namaInstansi: 'Dinas Kominfo Sultra',
    jabatan: 'IT Support',
    bidangPekerjaan: 'Pemerintahan',
    kesesuaianBidang: 'sesuai',
    rangePenghasilan: '2_5jt',
    saranUntukKampus: 'Akses teknologi dan jaringan komputer kampus perlu terus distabilkan.',
    submittedAt: '2026-04-01T08:20:00Z'
  },
  {
    id: 'tr_004',
    alumniId: 'alm_dummy2',
    userId: 'usr_dummy2',
    nama: 'Nurfadilah, S.Pd.',
    programStudi: 'Pendidikan Bahasa Inggris',
    tahunLulus: '2024',
    statusPekerjaan: 'bekerja',
    masaTungguKerja: 'kurang_3_bulan',
    namaInstansi: 'SMP Muhammadiyah Kendari',
    jabatan: 'Guru Honorer',
    bidangPekerjaan: 'Pendidikan',
    kesesuaianBidang: 'sangat_sesuai',
    rangePenghasilan: 'kurang_2jt',
    saranUntukKampus: 'Fasilitas pembelajaran microteaching sangat membantu.',
    submittedAt: '2026-04-05T09:12:00Z'
  },
  {
    id: 'tr_005',
    alumniId: 'alm_dummy3',
    userId: 'usr_dummy3',
    nama: 'Rahmat Hidayat, S.P.',
    programStudi: 'Agribisnis',
    tahunLulus: '2023',
    statusPekerjaan: 'belum_bekerja',
    saranUntukKampus: 'Perlu bimbingan karier khusus pertanian modern dari CDC.',
    submittedAt: '2026-04-10T14:00:00Z'
  },
  {
    id: 'tr_006',
    alumniId: 'alm_dummy4',
    userId: 'usr_dummy4',
    nama: 'Indra Hermawan, S.H.',
    programStudi: 'Hukum',
    tahunLulus: '2024',
    statusPekerjaan: 'lanjut_studi',
    saranUntukKampus: 'Terima kasih banyak atas program beasiswa pascasarjana.',
    submittedAt: '2026-04-12T16:30:00Z'
  }
];

export const SEED_BERITA: Berita[] = [
  {
    id: 'news1',
    title: 'Peluncuran Portal Karir dan CDC Terintegrasi Universitas Muhammadiyah Kendari',
    slug: 'peluncuran-portal-karir-cdc-umk',
    excerpt: 'Universitas Muhammadiyah Kendari meluncurkan portal karir (CDC) terpadu yang memudahkan mahasiswa aktif mendaftar magang dan memfasilitasi alumni mengisi tracer study.',
    content: 'KENDARI — Universitas Muhammadiyah Kendari resmi meluncurkan portal digital terpadu untuk Career Development Center (CDC), layanan magang, alumni, tracer study, serta mitra kerja sama. Peluncuran ini dipimpin langsung oleh Rektor UM Kendari, disaksikan seluruh jajaran dekanat, perwakilan mitra industri, serta ratusan alumni secara daring maupun luring di Aula Sang Surya.\n\nDalam pidatonya, Rektor menegaskan bahwa portal ini adalah langkah transformatif untuk menjembatani lulusan dengan pasar kerja global serta menjamin sirkulasi data yang aman dan terintegrasi di server kampus. Melalui platform ini, mahasiswa dapat melamar program magang yang disediakan oleh mitra resmi kampus dengan kelengkapan surat pengantar legalitas otomatis.\n\nSelain itu, alumni UM Kendari dari berbagai angkatan diimbau untuk berkontribusi mengisi Tracer Study guna evaluasi kurikulum dan kelayakan akreditasi masing-masing program studi. Platform ini beroperasi penuh dan dapat diakses dari browser maupun gawai pintar dengan arsitektur modern berkecepatan tinggi.',
    coverImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-05-15T08:00:00Z',
    createdAt: '2026-05-15T08:00:00Z'
  },
  {
    id: 'news2',
    title: 'Tips Lolos Magang Industri dan Membangun Portofolio Karir Sejak Kuliah',
    slug: 'tips-lolos-magang-industri-mahasiswa',
    excerpt: 'CDC UM Kendari membagikan beberapa tips kunci menyusun curriculum vitae (CV) kreatif dan melewati tahap wawancara magang di era digital.',
    content: 'Program magang bukan lagi sekadar pelengkap mata kuliah, melainkan jembatan krusial menuju karir profesional sejati. Memasuki pertengahan tahun akademik, CDC UM Kendari menyusun kiat praktis agar mahasiswa sukses mengamankan posisi magang dambaan mereka di berbagai mitra perbankan, teknologi, maupun pemerintahan:\n\n1. Susun CV Terarah: Tuliskan proyek kuliah, keterlibatan organisasi, serta keahlian teknis yang relevan dengan spesifikasi lowongan yang dilamar. Hindari memasukkan hobi yang tidak berhubungan.\n2. Pahami Profil Perusahaan: Saat panggilan wawancara tiba, sempatkan membaca profil umum mitra, sejarah singkat, dan produk mereka. Mitra sangat mengapresiasi kandidat yang menaruh perhatian khusus terhadap bisnis mereka.\n3. Jaga Etika Komunikasi: Mulai dari mengirim pesan WhatsApp, email, hingga pembawaan diri saat interviu. Penggunaan bahasa santun dan profesional memberikan impresi awal yang gemilang.\n\nSimak lowongan magang terbaru setiap pekan pada Portal CDC ini dan konsultasikan dokumen CV Anda langsung dengan tim konselor CDC pada hari kerja.',
    coverImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-05-22T09:00:00Z',
    createdAt: '2026-05-22T09:00:00Z'
  }
];

export const SEED_PENGUMUMAN: Pengumuman[] = [
  {
    id: 'ann1',
    title: 'Pengisian Tracer Study Alumni Angkatan Lulusan 2024 dan 2025',
    content: 'Dalam rangka pengumpulan data evaluasi kurikulum serta akreditasi instansi Universitas Muhammadiyah Kendari, dihimbau kepada seluruh lulusan/alumni angkatan kelulusan tahun 2024 dan 2025 untuk menyempatkan waktu mengisi kuesioner Tracer Study pada dashboard alumni Portal CDC ini. Partisipasi Anda sangat menentukan kualitas masa depan almamater tercinta. Terima kasih.',
    category: 'tracer_study',
    status: 'published',
    publishedAt: '2026-05-10T08:00:00Z',
    createdAt: '2026-05-10T08:00:00Z'
  },
  {
    id: 'ann2',
    title: 'Pembukaan Pendaftaran Magang Bersama PT Go Digital Kendari - Periode Ganjil',
    content: 'Diberitahukan kepada mahasiswa Teknik Informatika dan Sistem Informasi semester 6 dan 8, pendaftaran program magang bersertifikat industri dari PT Go Digital Kendari telah resmi dibuka. Silakan mempelajari kualifikasi secara mendalam pada menu Lowongan Karir, persiapkan Surat Pengantar Akademik, CV, dan lakukan pengajuan di portal sebelum tanggal 15 Juli 2026.',
    category: 'magang',
    status: 'published',
    publishedAt: '2026-05-12T09:00:00Z',
    createdAt: '2026-05-12T09:00:00Z'
  }
];

export const SEED_SURVEI_LULUSAN: SurveiLulusan[] = [
  {
    id: 'sv_001',
    mitraId: 'mtr1',
    namaInstansi: 'PT Go Digital Kendari',
    alumniId: 'alm1',
    kualitasLulusan: 5,
    kemampuanTeknis: 5,
    kemampuanKomunikasi: 4,
    etikaKerja: 5,
    kemampuanKerjaTim: 5,
    saran: 'Lulusan bersangkutan (Fachrul) memiliki keahlian teknis pemrograman web yang istimewa. Harapan kami agar kebiasaan presentasi bahasa Inggris di perkuliahan lebih ditingkatkan.',
    submittedAt: '2026-04-10T08:00:00Z'
  }
];

// Helper to safely access database keys
export type DBKey =
  | 'users'
  | 'mahasiswa'
  | 'alumni'
  | 'mitra'
  | 'lowongan'
  | 'pengajuan_magang'
  | 'uploaded_documents'
  | 'tracer_studies'
  | 'berita'
  | 'pengumuman'
  | 'survei_lulusan';

const DEFAULT_SEEDS = {
  users: SEED_USERS,
  mahasiswa: SEED_MAHASISWA,
  alumni: SEED_ALUMNI,
  mitra: SEED_MITRA,
  lowongan: SEED_LOWONGAN,
  pengajuan_magang: SEED_PENGAJUAN_MAGANG,
  uploaded_documents: SEED_DOCUMENTS,
  tracer_studies: SEED_TRACER_STUDIES,
  berita: SEED_BERITA,
  pengumuman: SEED_PENGUMUMAN,
  survei_lulusan: SEED_SURVEI_LULUSAN
};

// Initializer to make sure local storage has everything
export function initializeDB() {
  Object.entries(DEFAULT_SEEDS).forEach(([key, val]) => {
    const storageKey = `cdc_umk_${key}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(val));
    }
  });
}

// Low-level fetch
export function getFromDB<T>(key: DBKey): T[] {
  initializeDB();
  const storageKey = `cdc_umk_${key}`;
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
}

// Low-level write
export function saveToDB<T>(key: DBKey, data: T[]) {
  const storageKey = `cdc_umk_${key}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// Helper to push new item
export function insertToDB<T extends { id: string }>(key: DBKey, item: T): T {
  const current = getFromDB<T>(key);
  current.push(item);
  saveToDB(key, current);
  return item;
}

// Helper to update item
export function updateInDB<T extends { id: string }>(key: DBKey, item: T): T {
  const current = getFromDB<T>(key);
  const index = current.findIndex(i => i.id === item.id);
  if (index !== -1) {
    current[index] = item;
  } else {
    current.push(item);
  }
  saveToDB(key, current);
  return item;
}

// Helper to delete item
export function deleteInDB<T extends { id: string }>(key: DBKey, id: string) {
  const current = getFromDB<T>(key);
  const filtered = current.filter(i => i.id !== id);
  saveToDB(key, filtered);
}

/* ─────────────────────────────────────────────────────────────────
   REGISTRATION MODULE HELPERS
───────────────────────────────────────────────────────────────── */
export interface RegisterAlumniPayload {
  name: string;
  nim: string;
  email: string;
  phone?: string;
  programStudi: string;
  fakultas: string;
  tahunLulus: string;
  statusPekerjaan?: 'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja';
}

export interface RegisterMitraPayload {
  namaInstansi: string;
  kontakPerson: string;
  email: string;
  phone?: string;
  bidangIndustri?: string;
  alamat?: string;
  website?: string;
}

export function registerUser(
  role: 'alumni' | 'mitra',
  payload: RegisterAlumniPayload | RegisterMitraPayload
): User {
  const users = getFromDB<User>('users');
  
  // Check if email already exists
  const exists = users.some(u => u.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error('Email sudah terdaftar di sistem. Silakan gunakan email lain atau login.');
  }

  const userId = `usr_${role}_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newUser: User = {
    id: userId,
    name: role === 'alumni' 
      ? (payload as RegisterAlumniPayload).name 
      : `${(payload as RegisterMitraPayload).kontakPerson} (${(payload as RegisterMitraPayload).namaInstansi})`,
    email: payload.email,
    phone: payload.phone || '',
    role: role,
    status: 'active', // Active by default so testing is smooth and immediate
    photoUrl: role === 'alumni' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    createdAt: now
  };

  insertToDB<User>('users', newUser);

  if (role === 'alumni') {
    const almPayload = payload as RegisterAlumniPayload;
    const newAlumni: Alumni = {
      id: `alm_${Date.now().toString(36)}`,
      userId: userId,
      nim: almPayload.nim,
      nama: almPayload.name,
      email: almPayload.email,
      phone: almPayload.phone || '',
      programStudi: almPayload.programStudi,
      fakultas: almPayload.fakultas,
      tahunLulus: almPayload.tahunLulus,
      statusPekerjaan: almPayload.statusPekerjaan || 'belum_bekerja'
    };
    insertToDB<Alumni>('alumni', newAlumni);
  } else if (role === 'mitra') {
    const mtrPayload = payload as RegisterMitraPayload;
    const newMitra: Mitra = {
      id: `mtr_${Date.now().toString(36)}`,
      userId: userId,
      namaInstansi: mtrPayload.namaInstansi,
      bidangIndustri: mtrPayload.bidangIndustri || 'Umum',
      alamat: mtrPayload.alamat || '',
      kontakPerson: mtrPayload.kontakPerson,
      email: mtrPayload.email,
      phone: mtrPayload.phone || '',
      website: mtrPayload.website || '',
      statusKerjaSama: 'aktif'
    };
    insertToDB<Mitra>('mitra', newMitra);
  }

  return newUser;
}

