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
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="1000" height="500"><rect width="1000" height="500" fill="%23e2e8f0"/><rect x="20" y="20" width="960" height="460" rx="16" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(60, 60)"><text x="0" y="30" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="%230284c7">QuantumTech Careers | Job Opportunities</text><text x="0" y="65" font-family="system-ui, sans-serif" font-weight="900" font-size="26" fill="%230f172a">Job Title: Fullstack Web Developer Intern</text><text x="0" y="95" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="%23475569">Location: Kendari | Salary: Competitive</text></g><rect x="340" y="120" width="580" height="320" rx="16" fill="%230284c7"/><g transform="translate(370, 180)"><text x="0" y="30" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="%23ffffff">JOIN OUR INNOVATIVE</text><text x="0" y="70" font-family="system-ui, sans-serif" font-weight="900" font-size="36" fill="%2338bdf8">TECH TEAM</text><text x="0" y="105" font-family="system-ui, sans-serif" font-weight="600" font-size="16" fill="%23e0f2fe">Innovate. Collaborate. Lead.</text><rect x="0" y="130" width="160" height="44" rx="8" fill="%230f172a"/><text x="80" y="157" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="%23ffffff">APPLY NOW</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="20" y="20" width="760" height="410" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><g transform="translate(400, 200)"><circle cx="0" cy="-30" r="50" fill="none" stroke="%232563eb" stroke-width="12"/><path d="M-20 -30 L20 -60 L10 -10 Z" fill="%232563eb"/><text x="0" y="60" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="%231e293b">JOB INFO</text><text x="0" y="85" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="%2364748b" letter-spacing="3">ACADEMIC CAREER PORTAL</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="20" y="20" width="760" height="410" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><g transform="translate(400, 200)"><circle cx="0" cy="-30" r="50" fill="none" stroke="%232563eb" stroke-width="12"/><path d="M-20 -30 L20 -60 L10 -10 Z" fill="%232563eb"/><text x="0" y="60" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="%231e293b">JOB INFO</text><text x="0" y="85" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="%2364748b" letter-spacing="3">ACADEMIC CAREER PORTAL</text></g></svg>',
    flyers: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="1000" height="500"><rect width="1000" height="500" fill="%23e2e8f0"/><rect x="20" y="20" width="960" height="460" rx="16" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(60, 60)"><text x="0" y="30" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="%230284c7">QuantumTech Careers | Job Opportunities</text><text x="0" y="65" font-family="system-ui, sans-serif" font-weight="900" font-size="26" fill="%230f172a">Job Title: Fullstack Web Developer Intern</text><text x="0" y="95" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="%23475569">Location: Kendari | Salary: Competitive</text></g><rect x="340" y="120" width="580" height="320" rx="16" fill="%230284c7"/><g transform="translate(370, 180)"><text x="0" y="30" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="%23ffffff">JOIN OUR INNOVATIVE</text><text x="0" y="70" font-family="system-ui, sans-serif" font-weight="900" font-size="36" fill="%2338bdf8">TECH TEAM</text><text x="0" y="105" font-family="system-ui, sans-serif" font-weight="600" font-size="16" fill="%23e0f2fe">Innovate. Collaborate. Lead.</text><rect x="0" y="130" width="160" height="44" rx="8" fill="%230f172a"/><text x="80" y="157" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="%23ffffff">APPLY NOW</text></g></svg>'
    ],
    lokasi: 'Kendari (Hybrid)',
    kategori: 'TI / Perangkat Lunak',
    gaji: 'Kompetitif',
    deskripsi: 'PT Go Digital Kendari sedang mencari Mahasiswa Magang Fullstack Web Developer yang sangat termotivasi untuk bergabung dengan tim dinamis kami. Dalam peran ini, Anda akan bekerja sama dengan insinyur senior dan manajer produk kami untuk mengembangkan, memelihara, dan meningkatkan sistem frontend dan backend untuk aplikasi web inti kami. Ini adalah kesempatan langsung untuk mendapatkan pengalaman dunia nyata di lingkungan teknologi yang serba cepat.',
    tanggungJawab: [
      'Membantu dalam pengembangan aplikasi web yang kuat dan dapat diskalakan.',
      'Berkolaborasi dengan tim lintas fungsi untuk mendefinisikan, merancang, dan mengirimkan fitur baru.',
      'Menulis kode yang bersih, dapat dipelihara, dan efisien (HTML, CSS, JavaScript, Node.js, Python).',
      'Berpartisipasi dalam tinjauan kode dan berkontribusi pada diskusi teknis.',
      'Memecahkan masalah, menguji, dan memelihara perangkat lunak produk inti untuk memastikan optimasi dan fungsionalitas yang kuat.'
    ],
    kualifikasi: [
      'Saat ini terdaftar dalam program gelar Sarjana Ilmu Komputer, Teknologi Informasi, atau bidang terkait (minimal semester 6).',
      'Pemahaman dasar tentang teknologi frontend (React, Vue, atau kerangka kerja serupa).',
      'Keakraban dengan pengembangan backend (Node.js, Express, atau serupa).',
      'Pemahaman tentang sistem basis data (SQL atau NoSQL).',
      'Keterampilan pemecahan masalah yang kuat dan kemauan untuk belajar.',
      'Keterampilan komunikasi yang baik dan kemampuan bekerja dalam tim.'
    ],
    keahlian: ['JavaScript', 'React.js', 'Node.js', 'Git', 'Problem Solving'],
    benefit: [
      'Uang saku bulanan / insentif',
      'Sertifikat magang CDC Universitas Muhammadiyah Kendari',
      'Mentorship intensif oleh Senior Developer',
      'Peluang direkrut menjadi karyawan tetap setelah lulus'
    ],
    kuota: 3,
    deadline: '15 Juli 2026',
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
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><rect x="40" y="30" width="720" height="36" rx="12" fill="%23f1f5f9"/><circle cx="65" cy="48" r="5" fill="%23ef4444"/><circle cx="80" cy="48" r="5" fill="%23f59e0b"/><circle cx="95" cy="48" r="5" fill="%2310b981"/><g transform="translate(80, 110)"><path d="M0 40 L30 0 L50 40 L35 40 L25 20 L15 40 Z" fill="%23d946ef"/><text x="65" y="25" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="%231e1b4b">Aethereum</text><text x="65" y="42" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="%23a21caf" letter-spacing="2">DESIGN CO.</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><rect x="40" y="30" width="720" height="36" rx="12" fill="%23f1f5f9"/><circle cx="65" cy="48" r="5" fill="%23ef4444"/><circle cx="80" cy="48" r="5" fill="%23f59e0b"/><circle cx="95" cy="48" r="5" fill="%2310b981"/><g transform="translate(80, 110)"><path d="M0 40 L30 0 L50 40 L35 40 L25 20 L15 40 Z" fill="%23d946ef"/><text x="65" y="25" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="%231e1b4b">Aethereum</text><text x="65" y="42" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="%23a21caf" letter-spacing="2">DESIGN CO.</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(80, 110)"><path d="M0 40 L30 0 L50 40 L35 40 L25 20 L15 40 Z" fill="%23d946ef"/><text x="65" y="25" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="%231e1b4b">Aethereum</text><text x="65" y="42" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="%23a21caf" letter-spacing="2">DESIGN CO.</text></g></svg>',
    flyers: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(80, 110)"><path d="M0 40 L30 0 L50 40 L35 40 L25 20 L15 40 Z" fill="%23d946ef"/><text x="65" y="25" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="%231e1b4b">Aethereum</text><text x="65" y="42" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="%23a21caf" letter-spacing="2">DESIGN CO.</text></g></svg>'
    ],
    lokasi: 'Kendari (Hybrid)',
    kategori: 'Desain Kreatif & Multimedia',
    gaji: 'Kompetitif',
    deskripsi: 'Merancang antarmuka aplikasi mobile dan web berorientasi pengguna. Magang ini sangat cocok bagi Anda yang menyukai visual, prototipe interaktif, dan riset kebiasaan pengguna.',
    tanggungJawab: [
      'Membuat wireframe, storyboards, user flows, dan sitemaps.',
      'Merancang desain UI interaktif menggunakan Figma.',
      'Melakukan usability testing dan mengumpulkan feedback pengguna.'
    ],
    kualifikasi: [
      'Menguasai Figma atau Adobe XD.',
      'Memiliki portofolio desain UI dasar.',
      'Memahami konsep Design System dan visual hierarchy.'
    ],
    keahlian: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
    benefit: [
      'Uang saku bulanan',
      'Sertifikat magang resmi',
      'Portofolio berkualitas industri'
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
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(400, 200)"><path d="M-60 10 L0 -50 L40 10 L10 10 L0 -20 L-30 10 Z" fill="%230284c7"/><path d="M-20 20 L30 -40 L70 20 Z" fill="%230d9488" opacity="0.8"/><text x="0" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="30" fill="%230f172a" letter-spacing="2">INFRASTRUCTURE</text><text x="0" y="95" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="%230284c7" letter-spacing="3">CONNECT</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(400, 200)"><path d="M-60 10 L0 -50 L40 10 L10 10 L0 -20 L-30 10 Z" fill="%230284c7"/><path d="M-20 20 L30 -40 L70 20 Z" fill="%230d9488" opacity="0.8"/><text x="0" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="30" fill="%230f172a" letter-spacing="2">INFRASTRUCTURE</text><text x="0" y="95" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="%230284c7" letter-spacing="3">CONNECT</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(400, 200)"><path d="M-60 10 L0 -50 L40 10 L10 10 L0 -20 L-30 10 Z" fill="%230284c7"/><text x="0" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="30" fill="%230f172a">INFRASTRUCTURE CONNECT</text></g></svg>',
    flyers: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23f8fafc"/><rect x="40" y="30" width="720" height="390" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(400, 200)"><path d="M-60 10 L0 -50 L40 10 L10 10 L0 -20 L-30 10 Z" fill="%230284c7"/><text x="0" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="30" fill="%230f172a">INFRASTRUCTURE CONNECT</text></g></svg>'
    ],
    lokasi: 'Kendari (On-site)',
    kategori: 'TI / Rekayasa Perangkat Lunak',
    gaji: 'Rp 4.500.000 - Rp 6.000.000',
    deskripsi: 'Kami mencari lulusan baru (fresh graduate) dari alumni UM Kendari untuk bergabung dalam tim pengembang perangkat lunak utama kami.',
    tanggungJawab: [
      'Mengembangkan fitur aplikasi web berbasis React dan Node.js.',
      'Melakukan maintenance dan fixing bug pada sistem eksisting.'
    ],
    kualifikasi: [
      'Alumni UM Kendari (diutamakan Teknik Informatika / Sistem Informasi).',
      'Memahami RESTful API, OOP dasar, dan database SQL.',
      'IPK minimal 3.00.'
    ],
    keahlian: ['JavaScript', 'React', 'Node.js', 'SQL'],
    benefit: [
      'Gaji pokok kompetitif',
      'BPJS Kesehatan & Ketenagakerjaan',
      'Bonus performa tahunan'
    ],
    kuota: 2,
    deadline: '2026-06-30',
    status: 'published',
    createdAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'low5',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Creative Director',
    tipe: 'kerja',
    namaInstansi: 'Tech Studio',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1542744094-3a3e22035383?q=80&w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a3e22035383?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1542744094-3a3e22035383?q=80&w=800&auto=format&fit=crop',
    lokasi: 'Kendari (Hybrid)',
    kategori: 'Kreatif & Media',
    gaji: 'Kompetitif',
    deskripsi: 'Mengarahkan tim kreatif dalam pembuatan kampanye digital branding dan produksi media visual.',
    kualifikasi: ['Pengalaman minimal 2 tahun', 'Portofolio kampanye kreatif'],
    benefit: ['Tunjangan kesehatan', 'Bonus tahunan'],
    kuota: 1,
    deadline: '15 Juli 2026',
    status: 'published',
    createdAt: '2026-05-20T08:00:00Z'
  },
  {
    id: 'low6',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Accountant',
    tipe: 'kerja',
    namaInstansi: 'Global Finance',
    companyLogo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    lokasi: 'Kendari (On-site)',
    kategori: 'Keuangan & Akuntansi',
    gaji: 'Kompetitif',
    deskripsi: 'Mengelola laporan keuangan bulanan dan penyusunan anggaran operasional perusahaan.',
    kualifikasi: ['Lulusan S1 Akuntansi', 'Memahami pajak & SAP'],
    benefit: ['Gaji tetap', 'Asuransi jiwa'],
    kuota: 2,
    deadline: '14 Juli 2026',
    status: 'published',
    createdAt: '2026-05-21T09:00:00Z'
  },
  {
    id: 'low7',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Marketing Manager',
    tipe: 'kerja',
    namaInstansi: 'Creative Agency',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    lokasi: 'Kendari (Hybrid)',
    kategori: 'Pemasaran & Digital',
    gaji: 'Kompetitif',
    deskripsi: 'Merencanakan dan mengeksekusi strategi pemasaran digital untuk klien korporat.',
    kualifikasi: ['Pengalaman digital marketing', 'Keterampilan analisis data'],
    benefit: ['Insentif performa', 'Fleksibilitas kerja'],
    kuota: 1,
    deadline: '13 Juli 2026',
    status: 'published',
    createdAt: '2026-05-22T10:00:00Z'
  },
  {
    id: 'low8',
    mitraId: 'mtr_trisakti1',
    createdBy: 'usr_mitra1',
    judul: 'Junior Project Engineer',
    tipe: 'kerja',
    namaInstansi: 'PT RIASARANA ELECTRINDO',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    flyers: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop'],
    lokasi: 'Jakarta Barat, JAKARTA BARAT, DKI JAKARTA',
    kategori: 'Teknik/Rekayasa & Manufaktur',
    gaji: 'Rp 6.000.000 - Rp 8.500.000',
    deskripsi: 'PT Riasarana Electrindo membuka lowongan Junior Project Engineer untuk perencanaan, pengawasan, dan pelaksanaan proyek rekayasa elektrikal.',
    kualifikasi: [
      'Pendidikan S1 Teknik Elektro / Teknik Industri / Teknik Mesin.',
      'IPK minimal 3.00.',
      'Memahami gambar teknik (AutoCAD / Electrical CAD).',
      'Mampu bekerja dalam tim dan bersedia perjalanan dinas.'
    ],
    keahlian: ['AutoCAD', 'Project Management', 'Electrical Engineering'],
    benefit: ['Gaji Pokok & Tunjangan Proyek', 'BPJS Kesehatan & Ketenagakerjaan', 'Pelatihan Sertifikasi'],
    kuota: 3,
    deadline: '2026-08-31',
    status: 'published',
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'low9',
    mitraId: 'mtr_trisakti2',
    createdBy: 'usr_mitra1',
    judul: 'PT Yanasurya Bhaktipersada is Hiring for Marketing EXIM Staff!',
    tipe: 'kerja',
    namaInstansi: 'PT Yanasurya Bhaktipersada',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
    flyers: ['https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop'],
    lokasi: 'Jakarta Utara, JAKARTA UTARA, DKI JAKARTA',
    kategori: 'Pemasaran/Pemasaran Digital & PR',
    gaji: 'Rp 5.500.000 - Rp 7.500.000',
    deskripsi: 'Mengurus dokumen ekspor impor (EXIM), komunikasi dengan buyer luar negeri, serta penyusunan laporan administrasi perdagangan internasional.',
    kualifikasi: [
      'S1 Perdagangan Internasional / Manajemen / Bahasa Inggris / Administrasi Bisnis.',
      'Memahami prosedur ekspor-impor (Incoterms, L/C, PEB, PIB).',
      'Fasih berbahasa Inggris (lisan & tulisan).'
    ],
    keahlian: ['Export Import', 'International Trade', 'English Business Communication'],
    benefit: ['Tunjangan Kesehatan', 'Bonus Performa Ekspor', 'Jalur Karir Internasional'],
    kuota: 2,
    deadline: '2026-08-31',
    status: 'published',
    createdAt: '2026-06-05T09:00:00Z'
  },
  {
    id: 'low10',
    mitraId: 'mtr_trisakti3',
    createdBy: 'usr_mitra1',
    judul: 'Jr Quality Assurance',
    tipe: 'kerja',
    namaInstansi: 'Celerates',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop',
    flyer: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop',
    flyers: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop'],
    lokasi: 'North Jakarta, JAKARTA UTARA, DKI JAKARTA',
    kategori: 'IT/Komputer & Teknologi Informasi',
    gaji: 'Rp 6.500.000 - Rp 9.000.000',
    deskripsi: 'Celerates mencari Jr Quality Assurance untuk melakukan pengujian manual dan otomatisasi pada aplikasi web dan mobile enterprise.',
    kualifikasi: [
      'Pendidikan S1 Teknik Informatika / Sistem Informasi.',
      'Memahami Software Testing Life Cycle (STLC).',
      'Pengalaman membuat test script & test plan.'
    ],
    keahlian: ['Software Testing', 'QA Automation', 'Selenium/Cypress', 'API Testing'],
    benefit: ['Insentif Properti', 'Asuransi Kesehatan Swasta', 'Work-from-Home Hybrid'],
    kuota: 4,
    deadline: '2026-08-31',
    status: 'published',
    createdAt: '2026-06-10T10:00:00Z'
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
  const CURRENT_SEED_VERSION = 'v3_posters_9_16';
  if (localStorage.getItem('cdc_seed_version') !== CURRENT_SEED_VERSION) {
    Object.entries(DEFAULT_SEEDS).forEach(([key, val]) => {
      const storageKey = `cdc_umk_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(val));
    });
    localStorage.setItem('cdc_seed_version', CURRENT_SEED_VERSION);
    return;
  }

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

export function updateUserProfile(userId: string, profileData: Partial<Mahasiswa>) {
  const students = getFromDB<Mahasiswa>('mahasiswa');
  let student = students.find(s => s.userId === userId);
  
  if (student) {
    const updatedStudent = { ...student, ...profileData };
    updateInDB<Mahasiswa>('mahasiswa', updatedStudent);
    return updatedStudent;
  }
  
  // If no existing record, create one
  const newStudent: Mahasiswa = {
    id: `mhs_${Date.now()}`,
    userId: userId,
    nim: profileData.nim || '',
    nama: profileData.nama || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    programStudi: profileData.programStudi || '',
    fakultas: profileData.fakultas || '',
    angkatan: profileData.angkatan || '',
    semester: profileData.semester || 1,
    ...profileData
  };
  insertToDB<Mahasiswa>('mahasiswa', newStudent);
  return newStudent;
}

export function applyForJob(userId: string, job: Lowongan, extraData?: any) {
  const students = getFromDB<Mahasiswa>('mahasiswa');
  const student = students.find(s => s.userId === userId);
  
  const users = getFromDB<User>('users');
  const currentUser = users.find(u => u.id === userId);

  const applicantName = extraData?.applicantName || (student ? student.nama : (currentUser?.name || 'Mahasiswa Pelamar'));
  const applicantEmail = extraData?.applicantEmail || (student ? student.email : (currentUser?.email || ''));
  const applicantProdi = extraData?.applicantProdi || (student ? student.programStudi : 'Teknologi Informasi');
  const applicantNim = student?.nim || '202201001';

  const pengajuanId = `pj_${Date.now()}`;
  const newPengajuan: PengajuanMagang = {
    id: pengajuanId,
    mahasiswaId: student ? student.id : `mhs_${userId}`,
    userId: userId,
    lowonganId: job.id,
    namaMahasiswa: applicantName,
    nim: applicantNim,
    programStudi: applicantProdi,
    tujuanMagang: job.judul,
    lokasiMagang: job.lokasi,
    catatan: extraData?.applicantNotes || '',
    berkasUrl: extraData?.uploadedFileUrl || (extraData?.uploadedFileName ? `data:application/pdf;name=${encodeURIComponent(extraData.uploadedFileName)}` : undefined),
    berkasNama: extraData?.uploadedFileName || 'CV_Mahasiswa_Pelamar.pdf',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'under_review',
    createdAt: new Date().toISOString()
  };

  insertToDB<PengajuanMagang>('pengajuan_magang', newPengajuan);
  return newPengajuan;
}

/* ─────────────────────────────────────────────────────────────────
   BOOKMARK / SAVED JOBS HELPERS
───────────────────────────────────────────────────────────────── */
export function getSavedJobIds(): string[] {
  try {
    const saved = localStorage.getItem('cdc_saved_job_ids');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function toggleSaveJob(jobId: string): boolean {
  const current = getSavedJobIds();
  let next: string[];
  let isSaved = false;
  if (current.includes(jobId)) {
    next = current.filter(id => id !== jobId);
    isSaved = false;
  } else {
    next = [...current, jobId];
    isSaved = true;
  }
  localStorage.setItem('cdc_saved_job_ids', JSON.stringify(next));
  localStorage.setItem(`saved_job_${jobId}`, isSaved ? 'true' : 'false');
  return isSaved;
}

