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
  SurveiLulusan,
  KontenKarir,
  EventLayananItem,
  SuratKeputusan,
  KalenderKegiatan,
  LaporanKinerja,
  MouStakeholder,
  GaleriItem,
  KonselingConfig,
  KonselingInfoItem,
  KonselingJadwalItem,
  VisiMisiConfig,
  AnggotaTim,
  SocialMediaItem,
  HelpdeskConfig,
  KomentarBerita,
  StatusKomentar,
  CdcClubConfig,
  HeroSlideItem,
  CampusHiringItem,
  JobFairItem,
  JobFairCompany,
  StatistikConfig
} from './types';
import {
  fetchInitialDatabaseFromSupabase,
  deleteFromSupabase,
  syncUserToSupabase,
  syncMahasiswaToSupabase,
  syncAlumniToSupabase,
  syncMitraToSupabase,
  syncLowonganToSupabase,
  syncPengajuanToSupabase,
  syncTracerStudyToSupabase,
  syncKontenKarirToSupabase
} from './services/dbService';

// Daftar Fakultas Resmi Universitas Muhammadiyah Kendari (UM Kendari)
export const FAKULTAS_LIST: string[] = [
  'Fakultas Teknik',
  'Fakultas Ekonomi dan Bisnis Islam',
  'Fakultas Keguruan dan Ilmu Pendidikan',
  'Fakultas Agama Islam',
  'Fakultas Hukum',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Pertanian',
  'Fakultas Perikanan dan Ilmu Kelautan',
  'Fakultas Kedokteran dan Ilmu Kesehatan',
  'Program Pascasarjana (S2)'
];

// Pemetaan Program Studi Resmi per Fakultas di UM Kendari
export const PRODI_MAP: Record<string, string[]> = {
  'Fakultas Teknik': [
    'Teknik Sipil',
    'Teknik Arsitektur',
    'Teknik Lingkungan',
    'Teknik Pertambangan',
    'Sistem dan Teknologi Informasi',
    'Teknik Kimia',
    'Teknik Metalurgi'
  ],
  'Fakultas Ekonomi dan Bisnis Islam': [
    'Manajemen',
    'Bisnis Digital'
  ],
  'Fakultas Keguruan dan Ilmu Pendidikan': [
    'Administrasi Pendidikan',
    'Pendidikan Guru Pendidikan Anak Usia Dini (PG-PAUD)',
    'Pendidikan Bahasa Inggris',
    'Pendidikan Non Formal',
    'Pendidikan Teknologi Informasi',
    'Pendidikan Matematika',
    'Pendidikan Profesi Guru (PPG)'
  ],
  'Fakultas Agama Islam': [
    'Pendidikan Agama Islam (PAI)',
    'Psikologi Islam'
  ],
  'Fakultas Hukum': [
    'Ilmu Hukum'
  ],
  'Fakultas Ilmu Sosial dan Ilmu Politik': [
    'Ilmu Pemerintahan',
    'Desain Komunikasi Visual (DKV)'
  ],
  'Fakultas Pertanian': [
    'Agribisnis',
    'Teknologi Industri Pertanian'
  ],
  'Fakultas Perikanan dan Ilmu Kelautan': [
    'Teknologi Hasil Perikanan',
    'Pemanfaatan Sumberdaya Perikanan'
  ],
  'Fakultas Kedokteran dan Ilmu Kesehatan': [
    'Kedokteran (S1)',
    'Teknologi Laboratorium Medik (D4)',
    'Farmasi (D3)',
    'Profesi Dokter'
  ],
  'Program Pascasarjana (S2)': [
    'Magister Manajemen (MM)',
    'Magister Administrasi Pendidikan',
    'Magister Pendidikan Bahasa Inggris',
    'Magister Ilmu Hukum',
    'Magister Ilmu Pemerintahan',
    'Magister Agribisnis'
  ]
};

// Mock Password: all seeded accounts use "password"
export const SEED_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Operator CDC UM Kendari',
    email: 'admin@umkendari.ac.id',
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
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
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
    phone: '085241009988',
    role: 'user',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'usr_mhs2',
    name: 'Siti Rahmawati',
    email: 'rahma@umkendari.ac.id',
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
    phone: '082199008811',
    role: 'user',
    status: 'pending',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-06-01T10:15:00Z'
  },
  {
    id: 'usr_alumni1',
    name: 'Fachrul Alam Prasetyo, S.Kom.',
    email: 'alumni@umkendari.ac.id',
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
    phone: '081122334455',
    role: 'user',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-01-20T11:00:00Z'
  },
  {
    id: 'usr_alumni2',
    name: 'Andi Megawati, S.E.',
    email: 'mega@umkendari.ac.id',
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
    phone: '085311223344',
    role: 'user',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    createdAt: '2026-03-05T14:20:00Z'
  },
  {
    id: 'usr_mitra1',
    name: 'Budi Setiawan (HRD PT Go Digital)',
    email: 'mitra@umkendari.ac.id',
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
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
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
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
    password: '', // SECURITY: Set via seed script with bcrypt - see SEED_PASSWORDS_README.md
    phone: '081144455566',
    role: 'user',
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
    alamat: 'Jl. K.H. Ahmad Dahlan No. 10, Kota Kendari, Sulawesi Tenggara',
    ipk: '3.85 / 4.00',
    skills: ['JavaScript', 'React.js', 'UI/UX Design', 'Node.js', 'Python', 'Git & GitHub', 'HTML/CSS', 'Tailwind CSS'],
    experiences: [
      {
        id: '1',
        position: 'Fullstack Web Developer Intern',
        company: 'PT Go Digital Kendari',
        period: '2026 - Sekarang',
        description: 'Mengembangkan dan memelihara aplikasi portal akademik kampus dan integrasi RESTful API backend.'
      },
      {
        id: '2',
        position: 'Anggota Divisi IT & Komunikasi',
        company: 'Himpunan Mahasiswa Teknik Informatika UMK',
        period: '2024 - 2025',
        description: 'Mengelola situs web kegiatan mahasiswa dan publikasi digital kampus.'
      }
    ],
    certificates: [
      {
        id: 'cert_1',
        name: 'Sertifikat Kompetensi Fullstack Web Developer - BNSP',
        issuer: 'BNSP',
        year: '2025'
      },
      {
        id: 'cert_2',
        name: 'Google IT Support Professional Certificate',
        issuer: 'Google / Coursera',
        year: '2024'
      }
    ],
    qualifications: [
      {
        id: '1',
        institution: 'UNIVERSITAS MUHAMMADIYAH KENDARI',
        level: 'Sarjana (S1) - Teknik Informatika / Computer Science',
        year: '2026',
        ipk: '3.85 / 4.00'
      }
    ]
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

export function sortJobsByNewest(jobs: Lowongan[]): Lowongan[] {
  return [...jobs].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA; // Newest first
    }
    return b.id.localeCompare(a.id, undefined, { numeric: true });
  });
}

export const SEED_LOWONGAN: Lowongan[] = [
  {
    id: 'low1',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Fullstack Web Developer Intern',
    tipe: 'magang',
    namaInstansi: 'PT Go Digital Kendari',
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%230f172a"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%230284c7"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">GD</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%2338bdf8" letter-spacing="1">GO DIGITAL</text></g></svg>',
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
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%230f172a"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%230284c7"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">GD</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%2338bdf8" letter-spacing="1">GO DIGITAL</text></g></svg>',
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
    id: 'low_magang3',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Data Analyst Intern',
    tipe: 'magang',
    namaInstansi: 'PT Sultra Data Analytics',
    lokasi: 'Kendari (On-site)',
    kategori: 'Data & Analitik',
    gaji: 'Uang Saku',
    deskripsi: 'Menganalisis data operasional perusahaan, membuat dashboard visualisasi, dan menyusun laporan insight bisnis berbasis data.',
    kualifikasi: ['Mahasiswa aktif Statistika / Informatika / Matematika', 'Menguasai Excel & SQL dasar', 'Familiar dengan Python atau R'],
    keahlian: ['SQL', 'Python', 'Excel', 'Data Visualization'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang resmi', 'Portofolio proyek data nyata'],
    kuota: 3,
    deadline: '2026-08-15',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'low_magang4',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Social Media Marketing Intern',
    tipe: 'magang',
    namaInstansi: 'CV Kreatif Sultra',
    lokasi: 'Kendari (Hybrid)',
    kategori: 'Pemasaran & Digital',
    gaji: 'Uang Saku',
    deskripsi: 'Mengelola akun media sosial klien, membuat konten kreatif, dan menganalisis performa kampanye digital.',
    kualifikasi: ['Mahasiswa aktif Ilmu Komunikasi / Manajemen / DKV', 'Kreatif dan up-to-date dengan tren media sosial', 'Mampu menggunakan Canva / Adobe Photoshop'],
    keahlian: ['Social Media', 'Content Creation', 'Canva', 'Copywriting'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang', 'Pengalaman mengelola brand nyata'],
    kuota: 2,
    deadline: '2026-08-20',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-03T09:00:00Z'
  },
  {
    id: 'low_magang5',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Mobile App Developer Intern',
    tipe: 'magang',
    namaInstansi: 'PT Appsolute Kendari',
    lokasi: 'Kendari (On-site)',
    kategori: 'TI / Pengembangan Mobile',
    gaji: 'Uang Saku',
    deskripsi: 'Mengembangkan aplikasi mobile berbasis React Native / Flutter untuk kebutuhan klien korporat dan UMKM lokal.',
    kualifikasi: ['Mahasiswa Teknik Informatika / Sistem Informasi semester 5+', 'Memahami dasar React Native atau Flutter', 'Familiar dengan REST API'],
    keahlian: ['React Native', 'Flutter', 'REST API', 'Git'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang', 'Mentorship senior developer'],
    kuota: 2,
    deadline: '2026-09-01',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-05T10:00:00Z'
  },
  {
    id: 'low_magang6',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Graphic Designer Intern',
    tipe: 'magang',
    namaInstansi: 'Studio Desain Sultra',
    lokasi: 'Kendari (On-site)',
    kategori: 'Desain Kreatif & Multimedia',
    gaji: 'Uang Saku',
    deskripsi: 'Merancang materi visual untuk branding, packaging produk UMKM, dan konten media sosial klien.',
    kualifikasi: ['Mahasiswa DKV / Informatika / Komunikasi', 'Menguasai Adobe Illustrator & Photoshop', 'Memiliki portofolio desain'],
    keahlian: ['Adobe Illustrator', 'Photoshop', 'Branding', 'Layout Design'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang', 'Portofolio proyek klien nyata'],
    kuota: 2,
    deadline: '2026-09-10',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-08T08:30:00Z'
  },
  {
    id: 'low_magang7',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Network & IT Support Intern',
    tipe: 'magang',
    namaInstansi: 'PT Jaringan Nusantara Kendari',
    lokasi: 'Kendari (On-site)',
    kategori: 'TI / Infrastruktur Jaringan',
    gaji: 'Uang Saku',
    deskripsi: 'Membantu tim IT dalam instalasi, konfigurasi, dan troubleshooting jaringan komputer serta perangkat server perusahaan.',
    kualifikasi: ['Mahasiswa Teknik Informatika / Teknik Komputer semester 5+', 'Memahami TCP/IP, LAN, dan konfigurasi router/switch', 'Familiar dengan OS Linux dasar'],
    keahlian: ['Networking', 'TCP/IP', 'Linux', 'Troubleshooting'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang', 'Peluang rekrutmen setelah lulus'],
    kuota: 3,
    deadline: '2026-09-15',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-10T09:00:00Z'
  },
  {
    id: 'low_magang8',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Accounting & Finance Intern',
    tipe: 'magang',
    namaInstansi: 'KAP Sultra & Rekan',
    lokasi: 'Kendari (On-site)',
    kategori: 'Keuangan & Akuntansi',
    gaji: 'Uang Saku',
    deskripsi: 'Membantu proses audit internal, pencatatan jurnal keuangan, dan penyusunan laporan keuangan bulanan.',
    kualifikasi: ['Mahasiswa Akuntansi / Manajemen Keuangan semester 6+', 'Memahami dasar akuntansi & perpajakan', 'Mampu mengoperasikan spreadsheet & software akuntansi'],
    keahlian: ['Akuntansi', 'Perpajakan', 'Microsoft Excel', 'Laporan Keuangan'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang', 'Pengalaman audit profesional'],
    kuota: 2,
    deadline: '2026-09-20',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-12T10:00:00Z'
  },
  {
    id: 'low_magang9',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Human Resource Intern',
    tipe: 'magang',
    namaInstansi: 'PT Sumber Daya Sultra',
    lokasi: 'Kendari (Hybrid)',
    kategori: 'SDM & Personalia',
    gaji: 'Uang Saku',
    deskripsi: 'Membantu proses rekrutmen, administrasi kepegawaian, dan pelaksanaan program pengembangan karyawan.',
    kualifikasi: ['Mahasiswa Manajemen SDM / Psikologi / Hukum semester 5+', 'Komunikatif dan detail-oriented', 'Mampu mengoperasikan Microsoft Office'],
    keahlian: ['Rekrutmen', 'Administrasi', 'Microsoft Office', 'Komunikasi'],
    benefit: ['Uang saku bulanan', 'Sertifikat magang', 'Networking profesional HR'],
    kuota: 2,
    deadline: '2026-09-25',
    status: 'published',
    sumber: 'admin',
    createdAt: '2026-06-15T08:00:00Z'
  },
  {
    id: 'low3',
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Junior Web Developer (Lulusan Baru)',
    tipe: 'kerja',
    namaInstansi: 'PT Go Digital Kendari',
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%230f172a"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%230284c7"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">GD</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%2338bdf8" letter-spacing="1">GO DIGITAL</text></g></svg>',
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
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%23701a75"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%23d946ef"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">TS</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%23f0abfc" letter-spacing="1">TECH STUDIO</text></g></svg>',
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fdf4ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23f0abfc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23701a75">TECH STUDIO CREATIVE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23c026d3">HIRING: CREATIVE DIRECTOR</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fdf4ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23f0abfc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23701a75">TECH STUDIO CREATIVE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23c026d3">HIRING: CREATIVE DIRECTOR</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fdf4ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23f0abfc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23701a75">TECH STUDIO CREATIVE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23c026d3">HIRING: CREATIVE DIRECTOR</text></g></svg>',
    flyers: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fdf4ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23f0abfc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23701a75">TECH STUDIO CREATIVE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23c026d3">HIRING: CREATIVE DIRECTOR</text></g></svg>'
    ],
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
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%231e3a8a"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%232563eb"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">GF</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%2393c5fd" letter-spacing="1">GLOBAL FINANCE</text></g></svg>',
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eff6ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%2393c5fd" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%231e3a8a">GLOBAL FINANCE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%232563eb">HIRING: ACCOUNTANT</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eff6ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%2393c5fd" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%231e3a8a">GLOBAL FINANCE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%232563eb">HIRING: ACCOUNTANT</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eff6ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%2393c5fd" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%231e3a8a">GLOBAL FINANCE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%232563eb">HIRING: ACCOUNTANT</text></g></svg>',
    flyers: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eff6ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%2393c5fd" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%231e3a8a">GLOBAL FINANCE</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%232563eb">HIRING: ACCOUNTANT</text></g></svg>'
    ],
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
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%23c2410c"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%23ea580c"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">CA</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%23fdba74" letter-spacing="1">CREATIVE AGENCY</text></g></svg>',
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fff7ed"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23fdba74" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23c2410c">CREATIVE AGENCY</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23ea580c">HIRING: MARKETING MANAGER</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fff7ed"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23fdba74" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23c2410c">CREATIVE AGENCY</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23ea580c">HIRING: MARKETING MANAGER</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fff7ed"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23fdba74" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23c2410c">CREATIVE AGENCY</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23ea580c">HIRING: MARKETING MANAGER</text></g></svg>',
    flyers: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23fff7ed"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23fdba74" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23c2410c">CREATIVE AGENCY</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23ea580c">HIRING: MARKETING MANAGER</text></g></svg>'
    ],
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
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Junior Project Engineer',
    tipe: 'kerja',
    namaInstansi: 'PT RIASARANA ELECTRINDO',
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%23047857"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%2310b981"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">RE</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%23a7f3d0" letter-spacing="1">RIASARANA</text></g></svg>',
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ecfdf5"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%236ee7b7" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23047857">PT RIASARANA ELECTRINDO</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23059669">HIRING: JUNIOR PROJECT ENGINEER</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ecfdf5"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%236ee7b7" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23047857">PT RIASARANA ELECTRINDO</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23059669">HIRING: JUNIOR PROJECT ENGINEER</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ecfdf5"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%236ee7b7" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23047857">PT RIASARANA ELECTRINDO</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23059669">HIRING: JUNIOR PROJECT ENGINEER</text></g></svg>',
    flyers: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ecfdf5"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%236ee7b7" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%23047857">PT RIASARANA ELECTRINDO</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%23059669">HIRING: JUNIOR PROJECT ENGINEER</text></g></svg>'],
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
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'PT Yanasurya Bhaktipersada is Hiring for Marketing EXIM Staff!',
    tipe: 'kerja',
    namaInstansi: 'PT Yanasurya Bhaktipersada',
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%233730a3"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%236366f1"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">YB</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%23c7d2fe" letter-spacing="1">YANASURYA</text></g></svg>',
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eef2ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23a5b4fc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%233730a3">PT YANASURYA BHAKTIPERSADA</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%234f46e5">HIRING: MARKETING EXIM STAFF</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eef2ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23a5b4fc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%233730a3">PT YANASURYA BHAKTIPERSADA</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%234f46e5">HIRING: MARKETING EXIM STAFF</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eef2ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23a5b4fc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%233730a3">PT YANASURYA BHAKTIPERSADA</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%234f46e5">HIRING: MARKETING EXIM STAFF</text></g></svg>',
    flyers: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23eef2ff"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%23a5b4fc" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%233730a3">PT YANASURYA BHAKTIPERSADA</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%234f46e5">HIRING: MARKETING EXIM STAFF</text></g></svg>'],
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
    mitraId: 'mtr1',
    createdBy: 'usr_mitra1',
    judul: 'Jr Quality Assurance',
    tipe: 'kerja',
    namaInstansi: 'Celerates',
    companyLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="%230f766e"/><g transform="translate(100,100)" text-anchor="middle"><circle cx="0" cy="-15" r="32" fill="%2314b8a6"/><text y="-6" font-family="sans-serif" font-weight="900" font-size="26" fill="%23ffffff">CL</text><text y="42" font-family="sans-serif" font-weight="800" font-size="14" fill="%2399f6e4" letter-spacing="1">CELERATES</text></g></svg>',
    bannerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ccfbf1"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%235eead4" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%230f766e">CELERATES</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%230d9488">HIRING: JR QUALITY ASSURANCE</text></g></svg>',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ccfbf1"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%235eead4" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%230f766e">CELERATES</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%230d9488">HIRING: JR QUALITY ASSURANCE</text></g></svg>',
    flyer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ccfbf1"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%235eead4" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%230f766e">CELERATES</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%230d9488">HIRING: JR QUALITY ASSURANCE</text></g></svg>',
    flyers: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="%23ccfbf1"/><rect x="30" y="30" width="740" height="390" rx="16" fill="%23ffffff" stroke="%235eead4" stroke-width="2"/><g transform="translate(400, 200)"><text x="0" y="20" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="%230f766e">CELERATES</text><text x="0" y="55" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="%230d9488">HIRING: JR QUALITY ASSURANCE</text></g></svg>'],
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

export const DEFAULT_SAMPLE_PDF_DATA_URL = `data:application/pdf;base64,JVBERi0xLjQKJSC1tbW1CjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvQ291bnQgMSAvS2lkcyBbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA0IDAgUiAvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggMjA1Pj4Kc3RyZWFtCkJVCkJUMgogL0YxIDIyIFRmCiA1MCA3MzAgVGQKIChDVVJRQ0VMVU0gVklUQUUgKENWKSAtIFBFTEFNQVIgUkVTTUkpIFRqCiAwIC0zMCBUZgogL0YxIDE0IFRmCiAoUG9ydGFsIENEQyBVbml2ZXJzaXRhcyBNdWhhbW1hZGl5YWggS2VuZGFyaSkgVGoKIDAgLTMwIFRmCiAvRjEgMTIgVGYKIChEb2t1bWVuIENTIFBlbGFtYXIgVGVydmVyaWZpa2FzaSAmIExlbmdrYXApIFRqCkVUCgplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjM4IDAwMDAwIG4gCjAwMDAwMDA0OTQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYgL1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNTY1CiUlRU9GCg==`;

export const SEED_PENGAJUAN_MAGANG: PengajuanMagang[] = [
  {
    id: 'pj_001',
    mahasiswaId: 'mhs1',
    userId: 'usr_mhs1',
    lowonganId: 'low1',
    namaMahasiswa: 'Muhammad Fadly Alamsyah',
    nim: '202101001',
    programStudi: 'Teknik Informatika',
    tujuanMagang: 'Fullstack Web Developer Intern',
    lokasiMagang: 'Kendari',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-10-31',
    status: 'interview',
    interviewStatus: 'pending',
    catatanAdmin: 'Berkas lengkap dan sesuai kualifikasi mitra.',
    verifiedBy: 'usr_admin',
    verifiedAt: '2026-05-20T10:00:00Z',
    createdAt: '2026-08-10T14:00:00Z',
    berkasNama: 'CV_Muhammad_Fadly_Alamsyah.pdf',
    berkasUrl: DEFAULT_SAMPLE_PDF_DATA_URL,
    catatanInternal: [
      'Memiliki portofolio React & Node.js yang sangat kuat.',
      'Perlu diverifikasi pengalaman penggunaan TailwindCSS saat interview.'
    ],
    riwayatSeleksi: [
      { status: 'menunggu_review', label: 'Menunggu Review', date: '2026-08-10', note: 'Lamaran diterima oleh sistem' },
      { status: 'seleksi_administrasi', label: 'Seleksi Administrasi', date: '2026-08-11', note: 'Masuk tahap verifikasi berkas administrasi' },
      { status: 'interview', label: 'Lolos ke Interview', date: '2026-08-11', note: 'Lolos seleksi administrasi, menunggu penjadwalan interview' }
    ]
  },
  {
    id: 'pj_002',
    mahasiswaId: 'mhs2',
    userId: 'usr_mhs2',
    lowonganId: 'low1',
    namaMahasiswa: 'Siti Rahmawati',
    nim: '202302044',
    programStudi: 'Sistem Informasi',
    tujuanMagang: 'Fullstack Web Developer Intern',
    lokasiMagang: 'Kendari',
    tanggalMulai: '2026-08-01',
    tanggalSelesai: '2026-11-30',
    status: 'menunggu_review',
    interviewStatus: 'pending',
    createdAt: '2026-08-11T09:00:00Z',
    berkasNama: 'CV_Siti_Rahmawati.pdf',
    berkasUrl: DEFAULT_SAMPLE_PDF_DATA_URL,
    catatanInternal: [],
    riwayatSeleksi: [
      { status: 'menunggu_review', label: 'Menunggu Review', date: '2026-08-11', note: 'Lamaran baru diterima oleh sistem' }
    ]
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
    kesesuaianBidang: 'sangat_erat',
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
    kesesuaianBidang: 'erat',
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
    kesesuaianBidang: 'erat',
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
    kesesuaianBidang: 'sangat_erat',
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
  },
  {
    id: 'news3',
    title: 'Career Expo 2026 UMK Tawarkan 1.200 Lowongan dari 60 Perusahaan Mitra',
    slug: 'career-expo-2026-umk-1200-lowongan',
    excerpt: 'CDC UMK Kendari siap menggelar Career Expo 2026 yang mempertemukan mahasiswa dan alumni dengan 60 perusahaan mitra nasional.',
    content: 'KENDARI — CDC Universitas Muhammadiyah Kendari resmi menggelar Career Expo 2026 yang menghadirkan lebih dari 1.200 lowongan kerja dan magang dari 60 perusahaan mitra, mulai dari BUMN, perbankan, teknologi, hingga manufaktur.\n\nExpo bertema "Siap Kerja, Siap Berkarya" dilengkapi klinik review CV gratis, simulasi wawancara on-the-spot, serta talkshow inspirasi karir bersama praktisi industri. Terbuka gratis bagi mahasiswa aktif maupun alumni UM Kendari dengan registrasi melalui portal CDC.',
    coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-06-10T08:00:00Z',
    createdAt: '2026-06-10T08:00:00Z'
  },
  {
    id: 'news4',
    title: 'UMK Raih Penghargaan Perguruan Tinggi Berdaya Saing Tinggi Tingkat Regional Sulawesi',
    slug: 'umk-penghargaan-pt-daya-saing-regional',
    excerpt: 'Universitas Muhammadiyah Kendari meraih penghargaan perguruan tinggi berdaya saing tinggi kategori regional Sulawesi pada forum perguruan tinggi muhammadiyat.',
    content: 'KENDARI — Atas konsistensinya meningkatkan mutu lulusan dan penyerapan alumni di dunia industri, Universitas Muhammadiyah Kendari dinobatkan sebagai perguruan tinggi berdaya saing tinggi tingkat regional Sulawesi. Penghargaan diserahkan dalam forum koordinasi perguruan tinggi muhammadiyat se-Sulawesi.\n\nRektor UM Kendari menyampaikan bahwa capaian ini merupakan buah kolaborasi seluruh unit, termasuk CDC yang berhasil mencatatkan rata-rata waktu tunggu kerja lulusan di bawah enam bulan. Ke depan, kampus menargetkan penetrasi lulusan ke pasar kerja nasional dan global melalui program job matching lintas daerah.',
    coverImageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-06-02T09:30:00Z',
    createdAt: '2026-06-02T09:30:00Z'
  },
  {
    id: 'news5',
    title: 'MoU UM Kendari dengan 15 Perusahaan Teknologi Nasional untuk Magang Bersertifikat',
    slug: 'mou-umk-15-perusahaan-teknologi-magang',
    excerpt: 'UM Kendari menandatangani nota kesepahaman dengan 15 perusahaan teknologi nasional untuk membuka 300 kursi magang bersertifikat.',
    content: 'KENDARI — Universitas Muhammadiyah Kendari menandatangani MoU dengan 15 perusahaan teknologi nasional di bidang software house, fintech, dan telekomunikasi. Kerja sama ini membuka 300 kursi magang bersertifikat bagi mahasiswa semester lima ke atas dari seluruh program studi.\n\nMelalui portal CDC, mahasiswa dapat mendaftar magang secara daring lengkap dengan surat pengantar otomatis. Proses seleksi dilakukan langsung oleh perusahaan mitra, dan nilai akhir magang dikonversi menjadi SKS sesuai ketentuan akademik kampus.',
    coverImageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-07-08T07:00:00Z',
    createdAt: '2026-07-08T07:00:00Z'
  },
  {
    id: 'news6',
    title: 'Alumni UM Kendari Dominasi Seleksi CPNS & BUMN Regional Sultra 2026',
    slug: 'alumni-umk-dominasi-seleksi-cpns-bumn-sultra',
    excerpt: 'Data sementara menunjukkan lebih dari 120 alumni UM Kendari lolos tahap administrasi seleksi CPNS dan BUMN wilayah Sulawesi Tenggara.',
    content: 'KENDARI — Hasil monitoring CDC UM Kendari terhadap angkatan lulusan 2024-2026 mencatatkan lebih dari 120 alumni dinyatakan lolos seleksi administrasi CPNS dan rekrutmen BUMN kawasan Sulawesi Tenggara. Angka ini meningkat dua kali lipat dibandingkan periode sebelumnya.\n\nKeberhasilan tersebut didukung program intensif persiapan seleksi yang diselenggarakan CDC bekerja sama dengan forum alumni, mencakup bimbingan SKD, psikotes, hingga simulasi wawancara. Kampus berkomitmen melanjutkan program serupa secara rutin setiap tahun.',
    coverImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-07-20T08:00:00Z',
    createdAt: '2026-07-20T08:00:00Z'
  },
  {
    id: 'news7',
    title: 'CDC UMK Luncurkan Fitur Job Matching Berbasis AI untuk Lulusan',
    slug: 'cdc-umk-fitur-job-matching-ai',
    excerpt: 'Portal CDC UM Kendari kini dilengkapi fitur pencocokan lowongan berbasis AI yang merekomendasikan pekerjaan sesuai profil lulusan.',
    content: 'KENDARI — CDC Universitas Muhammadiyah Kendari memperkenalkan fitur terbaru pada portal resminya: Job Matching berbasis Artificial Intelligence. Sistem menganalisis profil mahasiswa dan alumni — jurusan, IPK, keahlian, dan minat karir — lalu merekomendasikan lowongan kerja, magang, maupun event rekrutmen yang paling relevan.\n\nFitur ini hadir sebagai jawaban atas kesulitan lulusan menemukan lowongan yang cocok di tengah banjir informasi rekrutmen. Tahap awal, sistem telah mengindeks ribuan lowongan dari mitra kampus serta kanal karir nasional, dan terus diperbarui setiap hari.',
    coverImageUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    authorId: 'usr_admin',
    publishedAt: '2026-08-05T08:00:00Z',
    createdAt: '2026-08-05T08:00:00Z'
  }
];

export const SEED_KONTEN_KARIR: KontenKarir[] = [
  {
    id: 'kk_seed_berita1',
    jenis: 'berita',
    judul: 'UMK Raih Penghargaan Perguruan Tinggi Berdaya Saing Tinggi di Tingkat Regional Sulawesi',
    body: '# Prestasi Gemilang UMK di Ajang Regional\n\nUniversitas Muhammadiyah Kendari kembali menorehkan prestasi membanggakan dengan meraih penghargaan sebagai Perguruan Tinggi Berdaya Saing Tinggi tingkat **Regional Sulawesi**.\n\nPenghargaan ini diberikan berdasarkan evaluasi terhadap kualitas lulusan, rasio penyerapan kerja alumni, serta kolaborasi aktif dengan mitra industri di kawasan timur Indonesia.\n\n> Capaian ini merupakan hasil kerja sama lintas fakultas dan dukungan penuh dari CDC UM Kendari dalam memfasilitasi tracer study serta program magang terstruktur.\n\nKe depannya, UMK menargetkan perluasan jaringan mitra hingga cakupan nasional guna meningkatkan peluang karir mahasiswa.',
    penulis: 'Humas UMK',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
    scope: 'REGIONAL',
    status: 'published',
    createdAt: '2026-06-02T08:30:00Z',
    updatedAt: '2026-06-02T08:30:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'kk_seed_berita2',
    jenis: 'berita',
    judul: 'Career Expo 2026 UMK Tawarkan 1.200 Lowongan dari 60 Perusahaan Mitra',
    body: '# Career Expo 2026 Siap Digelar\n\nCDC UM Kendari akan menggelar **Career Expo 2026** yang mempertemukan mahasiswa dan alumni dengan puluhan perusahaan mitra.\n\nBeberapa agenda utama:\n1. Job fair dengan 1.200+ posisi tersedia\n2. Workshop CV & interview oleh praktisi HR\n3. One-on-one mentoring karir\n\nAcara terbuka untuk seluruh mahasiswa aktif dan alumni. Pastikan dokumen lamaran sudah lengkap sebelum hadir.',
    penulis: 'CDC UM Kendari',
    thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
    scope: 'LOKAL',
    status: 'published',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'kk_seed_ws1',
    jenis: 'workshop',
    judul: 'Workshop UI/UX Design & Interactive Prototyping Figma 2026',
    body: 'Pelatihan praktis pembuatan wireframe, Design System, hingga Interactive Prototype aplikasi berbasis industri dengan alat Figma bersama praktisi profesional.',
    penulis: 'CDC UM Kendari & Studio Kreatif',
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
    kategori: 'Workshop',
    status: 'published',
    createdAt: '2026-08-18T09:00:00Z',
    updatedAt: '2026-08-18T09:00:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'kk_seed_ss1',
    jenis: 'softskill',
    judul: 'Pelatihan Softskill Public Speaking & Persuasi Komunikasi Karir',
    body: 'Membangun kepercayaan diri saat presentasi, wawancara kerja, dan komunikasi profesional di dunia industri modern.',
    penulis: 'CDC UM Kendari',
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    kategori: 'Softskill',
    status: 'published',
    createdAt: '2026-08-19T10:00:00Z',
    updatedAt: '2026-08-19T10:00:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'kk_seed_sm1',
    jenis: 'seminar',
    judul: 'Seminar Nasional Strategi Menembus BUMN & Perusahaan Multinasional',
    body: 'Pemaparan komprehensif mengenai alur seleksi Rekrutmen Bersama BUMN, psikotes, dan tips wawancara langsung bersama praktisi HR.',
    penulis: 'CDC UM Kendari',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    kategori: 'Seminar',
    status: 'published',
    createdAt: '2026-08-20T11:00:00Z',
    updatedAt: '2026-08-20T11:00:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  }
];

export const SEED_PENGUMUMAN: Pengumuman[] = [
  {
    id: 'ann1',
    title: 'Pengisian Tracer Study Alumni Angkatan Lulusan 2024 dan 2025',
    content: 'Dalam rangka pengumpulan data evaluasi kurikulum serta akreditasi instansi Universitas Muhammadiyah Kendari, dihimbau kepada seluruh lulusan/alumni angkatan kelulusan tahun 2024 dan 2025 untuk menyempatkan waktu mengisi kuesioner Tracer Study pada dashboard alumni Portal CDC ini. Partisipasi Anda sangat menentukan kualitas masa depan almamater tercinta. Terima kasih.',
    category: 'tracer_study',
    status: 'published',
    isImportant: true,
    displayType: 'badge',
    linkUrl: 'https://tracerstudy.umkendari.ac.id',
    linkLabel: 'Isi Tracer Study',
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

export const SEED_EVENT_LAYANAN: EventLayananItem[] = [
  // Workshop
  {
    id: 'evt_ws_001',
    category: 'workshop',
    title: 'Workshop UI/UX Design & Prototyping Figma',
    organizer: 'CDC UM Kendari & Digital Creative Studio',
    date: '2026-08-25',
    time: '09:00 - 15:00 WITA',
    location: 'Lab Komputer Gd. Rektorat Lt. 3 UMK',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
    description: `### Tingkatkan Daya Saing Digital Anda Bersama Praktisi Industri

Career Development Center Universitas Muhammadiyah Kendari (CDC UM Kendari) bekerja sama dengan Digital Creative Studio menyelenggarakan **Workshop UI/UX Design & Prototyping Figma** yang dirancang khusus bagi mahasiswa dan calon alumni yang ingin mendalami industri desain produk digital modern.

Perkembangan transformasi digital saat ini menuntut talenta-talenta muda untuk memiliki pemahaman mendalam terkait *User-Centered Design*, arsitektur informasi, serta kemampuan merealisasikan konsep ide ke dalam bentuk prototipe interaktif yang siap diuji oleh pengguna.

#### Pokok Materi Pembelajaran:
1. **Dasar & Prinsip UI/UX Modern:** Memahami perbedaan UI dan UX, metodologi *Design Thinking*, serta riset pengguna (*user persona & journey map*).
2. **Wireframing & Low-Fidelity Prototyping:** Teknik sketsa alur aplikasi cepat sebelum masuk tahap visual styling.
3. **Membangun Design System di Figma:** Menggunakan auto-layout, components, variants, token warna, dan tipografi konsisten standar industri.
4. **Interactive High-Fidelity Prototyping:** Membuat animasi transisi antar halaman dan interaksi mikro (*micro-interactions*).
5. **Usability Testing & Design Handoff:** Menyiapkan aset dan dokumentasi desain untuk kolaborasi bersama tim pengembang perangkat lunak (*software engineers*).

Kegiatan ini dilengkapi dengan sesi praktik langsung (*hands-on lab*) dan telaah portfolio desain. Pastikan Anda telah membawa laptop dan menginstal akun Figma sebelum menghadiri sesi pelatihan.`,
    speaker: 'Ahmad Fauzi, S.Kom. (Senior Product Designer)',
    quota: 50,
    registeredCount: 38,
    registrationLink: 'https://bit.ly/workshop-uiux-umk',
    status: 'buka'
  },
  {
    id: 'evt_ws_002',
    category: 'workshop',
    title: 'Workshop Pembuatan CV ATS Friendly & Portfolio Digital',
    organizer: 'CDC UM Kendari',
    date: '2026-09-02',
    time: '13:30 - 16:30 WITA',
    location: 'Aula Utama Universitas Muhammadiyah Kendari',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop',
    description: `### Kunci Menembus Seleksi Berkas Perusahaan Nasional & Multinasional

Dalam era digitalisasi rekrutmen, lebih dari 80% perusahaan besar menggunakan sistem otomatis *Applicant Tracking System* (ATS) untuk menyaring ribuan berkas lamaran kerja yang masuk. Kesalahan dalam struktur format atau pemilihan kata kunci dapat menyebabkan berkas lamaran gugur sebelum sempat dibaca oleh staf HRD.

CDC UM Kendari menghadirkan **Workshop Pembuatan CV ATS Friendly & Portfolio Digital** guna membimbing mahasiswa tingkat akhir dan alumni UMK dalam menyusun berkas lamaran yang profesional, relevan, serta memiliki peluang lolos saring tertinggi.

#### Topik Utama Pembahasan:
- **Cara Kerja Mesin ATS:** Memahami algoritma *keyword extraction*, formatting tabel, dan struktur heading dokumen yang disukai bot ATS.
- **Formula Penulisan Action Verbs & STAR Method:** Mengubah deskripsi pengalaman organisasi/magang menjadi pencapaian terukur (*quantifiable achievements*).
- **Kurasi Portfolio Karir Digital:** Panduan membuat halaman portfolio web sederhana dan tautan GitHub/LinkedIn/Drive yang tertata rapi.
- **Bedah CV Langsung (Live Review):** Uji coba parsing CV menggunakan scanner ATS dan umpan balik langsung dari konsultan rekrutmen.

Workshop ini sangat dianjurkan bagi Anda yang sedang mempersiapkan diri melamar program Management Trainee (MT), magang industri bersertifikat, maupun rekrutmen BUMN/swasta.`,
    speaker: 'Nurlia, S.Psi., M.Psi. (Talent Acquisition Specialist)',
    quota: 100,
    registeredCount: 84,
    registrationLink: 'https://bit.ly/cv-ats-umk',
    status: 'buka'
  },
  {
    id: 'evt_ws_003',
    category: 'workshop',
    title: 'Workshop Modern Web Development React & Tailwind CSS',
    organizer: 'CDC UMK & Himpunan Mahasiswa Informatika',
    date: '2026-09-18',
    time: '08:30 - 16:00 WITA',
    location: 'Auditorium KH. Ahmad Dahlan UMK',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    description: `### Akselerasi Keterampilan Full-Stack Web Frontend Anda

Kebutuhan industri teknologi terhadap pengembang web yang menguasai ekosistem JavaScript modern seperti **React.js** dan utilitas CSS **Tailwind CSS** terus meningkat pesat. 

Workshop intensif ini dipandu oleh instruktur dan praktisi industri untuk memberikan pemahaman menyeluruh tentang cara membangun antarmuka web performa tinggi, modular, dan responsif dari awal hingga siap dipublikasikan (*production deploy*).

#### Agenda Workshop:
1. **Fundamental React Modern:** Component architecture, JSX, React Hooks (\`useState\`, \`useEffect\`, \`useMemo\`), serta pengelolaan state aplikasi.
2. **Styling Cepat dengan Tailwind CSS:** Utility-first workflow, responsivitas breakpoint mobile/desktop, dan integrasi ikon.
3. **Konsumsi REST API Asinkron:** Pengambilan data live (*data fetching*), penanganan status loading & error, serta optimasi caching.
4. **Deploy Aplikasi ke Cloud:** Mempublikasikan proyek ke platform Vercel / Netlify dengan domain kustom.

Peserta akan mendapatkan studi kasus nyata pembuatan dashboard portal terpadu serta sertifikat resmi pelatihan keterampilan teknologi.`,
    speaker: 'Rahmat Hidayat, M.T. (Software Engineer Lead)',
    quota: 60,
    registeredCount: 15,
    registrationLink: 'https://bit.ly/webdev-react-umk',
    status: 'segera'
  },
  {
    id: 'evt_ws_004',
    category: 'workshop',
    title: 'Workshop Strategi Lolos Hackathon & Program Digital Talent',
    organizer: 'CDC UM Kendari',
    date: '2026-07-15',
    time: '09:00 - 12:00 WITA',
    location: 'Zoom Meeting Online',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    description: `### Rahasia Juara Kompetisi Inovasi Teknologi Nasional

Mengikuti ajang kompetisi inovasi digital seperti Hackathon, Gemastik, dan program Digital Talent Scholarship merupakan salah satu batu loncatan tercepat bagi mahasiswa untuk membangun rekam jejak (*track record*) prestasi yang diakui secara nasional.

Workshop ini mengupas tuntas pengalaman para juara dalam merumuskan ide produk inovatif, memvalidasi masalah di lapangan, membangun MVP (*Minimum Viable Product*) dalam waktu singkat, serta menyajikan presentasi pitching yang memukau dewan juri.

#### Materi Pembahasan:
- **Ideation & Problem Framing:** Mengidentifikasi masalah nyata masyarakat lokal/nasional yang memiliki nilai dampak sosial dan ekonomi tinggi.
- **Rapid Prototyping:** Memilih arsitektur teknologi yang cepat dieksekusi dalam batas waktu kompetisi 24–48 jam.
- **The Art of Pitching:** Struktur deck presentasi 3 menit yang memikat perhatian investor dan juri penilai.`,
    speaker: 'Rizal Triputra, S.T. (Tech Entrepreneur)',
    quota: 200,
    registeredCount: 200,
    registrationLink: '#',
    status: 'selesai'
  },

  // Softskill
  {
    id: 'evt_ss_001',
    category: 'softskill',
    title: 'Pelatihan Public Speaking & Pitching Presentasi Karir',
    organizer: 'CDC UM Kendari',
    date: '2026-08-28',
    time: '09:00 - 15:00 WITA',
    location: 'Gedung Ketenagakerjaan & Karir UMK',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    description: `### Kuasai Panggung dan Tingkatkan Kepercayaan Diri Profesional

Kemampuan berkomunikasi secara lugas, meyakinkan, dan percaya diri di hadapan publik merupakan keterampilan paling dicari oleh para pemimpin perusahaan. Seringkali ide cemerlang gagal tersampaikan hanya karena rasa gugup dan bahasa tubuh yang kurang terlatih.

CDC UM Kendari menyelenggarakan **Pelatihan Public Speaking & Pitching Presentasi Karir** guna membekali para mahasiswa dengan metodologi komunikasi efektif yang dapat diterapkan saat presentasi kerja, wawancara direksi, maupun memimpin rapat tim.

#### Agenda & Sesi Praktik:
1. **Mindset & Overcoming Stage Fright:** Teknik pernapasan diafragma, manajemen ketegangan mental, dan peningkatan intonasi suara.
2. **Struktur Penyampaian Pesan (Hook, Story, Call to Action):** Merangkai alur pembicaraan yang mudah dicerna dan berkesan bagi audiens.
3. **Bahasa Tubuh & Kontak Mata:** Memaksimalkan ekspresi wajah, postur tubuh tegap, serta artikulasi yang berwibawa.
4. **Sesi Simulasi Langsung:** Setiap peserta diberikan kesempatan praktik pitching 2 menit di depan kelas dengan evaluasi personal.`,
    speaker: 'Dra. Endang Lestari, M.Si. (Professional Communication Trainer)',
    quota: 80,
    registeredCount: 65,
    registrationLink: 'https://bit.ly/public-speaking-umk',
    status: 'buka'
  },
  {
    id: 'evt_ss_002',
    category: 'softskill',
    title: 'Pelatihan Kewirausahaan: Ideasi Bisnis Lokal Sultra',
    organizer: 'CDC UMK x LPPM UMK',
    date: '2026-09-10',
    time: '08:30 - 15:30 WITA',
    location: 'Hall Sains & Technopark UMK',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop',
    description: `### Menggali Potensi Daerah Menjadi Peluang Wirausaha Unggul

Provinsi Sulawesi Tenggara menyimpan kekayaan komoditas alam yang melimpah, mulai dari sektor maritim, pertanian, perkebunan mete dan kelapa, hingga industri kreatif berbasis kearifan lokal. Mahasiswa sebagai agen perubahan memiliki potensi besar untuk menjadi wirausahawan muda (*sociopreneurs*).

Pelatihan ini memadukan konsep Business Model Canvas (BMC) dengan analisis rantai pasok lokal untuk melahirkan model bisnis yang berkelanjutan dan siap bersaing di pasar nasional.

#### Topik Utama:
- **Analisis Peluang Pasar Lokal & Digital:** Menemukan celah pasar komoditas daerah yang belum tergarap optimal.
- **Perancangan Business Model Canvas (BMC):** Menyusun proporsi nilai, struktur biaya, saluran distribusi, dan segmen pelanggan.
- **Strategi Pemasaran Digital & Branding:** Pemanfaatan media sosial, marketplace, dan kemasan produk modern.
- **Akses Permodalan & Inkubasi:** Pengenalan program hibah wirausaha mahasiswa (P2MW) dan jaringan investor UMKM.`,
    speaker: 'Ir. H. Sudirman, M.M. (Pengusaha & Facilitator UMKM)',
    quota: 120,
    registeredCount: 40,
    registrationLink: 'https://bit.ly/wirausaha-lokal-umk',
    status: 'buka'
  },
  {
    id: 'evt_ss_003',
    category: 'softskill',
    title: 'Pelatihan Critical Thinking & Problem Solving di Tempat Kerja',
    organizer: 'CDC UM Kendari',
    date: '2026-10-05',
    time: '09:00 - 14:00 WITA',
    location: 'Ruang Seminar Perpustakaan UMK',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    description: `### Mengasah Ketajaman Logika Analitis dan Pengambilan Keputusan

Di lingkungan profesional yang dinamis, tantangan kerja kerap kali muncul tanpa solusi yang langsung terlihat. Kemampuan berpikir kritis (*critical thinking*) dan pemecahan masalah secara terstruktur (*problem solving*) menjadi pembeda utama antara karyawan biasa dan talenta berprestasi tinggi.

Pelatihan ini melatih peserta untuk membedakan antara asumsi dan fakta, membedah akar permasalahan yang kompleks, serta merumuskan opsi solusi yang logis dan terukur.

#### Silabus Pelatihan:
- **Kerangka Root Cause Analysis (5-Whys & Fishbone Diagram):** Teknik mengidentifikasi penyebab mendasar dari suatu hambatan operasional.
- **Cognitive Bias & Logical Fallacies:** Menghindari jebakan bias berpikir saat mengevaluasi data dan argumen tim.
- **Decision Matrix Analysis:** Memberikan bobot prioritas terhadap beberapa alternatif solusi sebelum eksekusi.`,
    speaker: 'Dr. Hj. Wa Ode Sitti, M.Pd.',
    quota: 75,
    registeredCount: 10,
    registrationLink: 'https://bit.ly/critical-thinking-umk',
    status: 'segera'
  },

  // Seminar
  {
    id: 'evt_sm_001',
    category: 'seminar',
    title: 'Seminar Nasional: Navigasi Karir Era Gen-AI & Automasi',
    organizer: 'CDC UM Kendari',
    date: '2026-08-30',
    time: '08:00 - 12:30 WITA',
    location: 'Auditorium Utama Universitas Muhammadiyah Kendari',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    description: `### Menjawab Tantangan & Memanfaatkan Peluang di Era Kecerdasan Buatan

Lanskap ketenagakerjaan global tengah mengalami disrupsi masif seiring pesatnya kemajuan teknologi Generative Artificial Intelligence (Gen-AI) dan otomatisasi industri. Pekerjaan-pekerjaan repetitif mulai terotomasi, sementara kebutuhan akan talenta yang mampu berkolaborasi dengan AI semakin meningkat.

**Seminar Nasional CDC UM Kendari 2026** mempertemukan para akademisi, pimpinan HR korporasi, serta pakar teknologi untuk mengupas tuntas transformasi kompetensi yang wajib dikuasai generasi muda agar tetap unggul dan berdaya saing tinggi.

#### Poin-Poin Seminar:
1. **Peta Kebutuhan Karir Masa Depan (Future of Jobs Report):** Memetakan profesi-profesi baru yang bertumbuh pesat di kawasan Asia Pasifik.
2. **AI Augmentation vs Human Skills:** Mengapa kecerdasan emosional, kreativitas, dan kepemimpinan etis semakin bernilai tinggi di era mesin cerdas.
3. **Pemanfaatan AI untuk Produktivitas Karir:** Penggunaan alat bantu AI secara etis dalam riset, sintesis data, dan otomatisasi tugas harian.
4. **Tanya Jawab & Diskusi Panel:** Sesi interaktif langsung bersama narasumber pimpinan HR korporat.`,
    speaker: 'Prof. Dr. Supriyadi, M.Sc. (Chief HR Officer & Practical Researcher)',
    quota: 300,
    registeredCount: 245,
    registrationLink: 'https://bit.ly/semnas-genai-umk',
    status: 'buka'
  },
  {
    id: 'evt_sm_002',
    category: 'seminar',
    title: 'Seminar Karir BUMN & Management Trainee Program 2026',
    organizer: 'CDC UMK x Mitra BUMN',
    date: '2026-09-15',
    time: '09:00 - 13:00 WITA',
    location: 'Ballroom Syariah Kendari & Hybrid Zoom',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    description: `### Strategi Tembus Seleksi Rekrutmen Bersama BUMN (RBB)

BUMN terus menjadi destinasi karir impian bagi ratusan ribu lulusan perguruan tinggi di seluruh Indonesia. Proses seleksi yang ketat dan bertingkat menuntut persiapan yang terencana matang sejak masa perkuliahan.

CDC UM Kendari bekerja sama dengan forum HR BUMN menggelar seminar edukasi karir guna membedah tahapan seleksi resmi Rekrutmen Bersama BUMN 2026.

#### Materi Eksklusif:
- **Kiat Sukses Tes Kemampuan Dasar (TKD):** Trik menjawab soal numerik, penalaran verbal, dan figural dengan efisiensi waktu tinggi.
- **Memahami Core Values AKHLAK:** Implementasi nilai Amanah, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif dalam studi kasus tes situasi kerja (*situational judgment test*).
- **Strategi Wawancara Direksi & User:** Panduan menjawab pertanyaan behavioral dan studi kelayakan proyek secara meyakinkan.`,
    speaker: 'Tim HR Business Partner Perbankan & Energi BUMN',
    quota: 500,
    registeredCount: 310,
    registrationLink: 'https://bit.ly/seminar-bumn-umk',
    status: 'buka'
  },
  {
    id: 'evt_sm_003',
    category: 'seminar',
    title: 'Seminar Beasiswa Luar Negeri & Persiapan IELTS/TOEFL',
    organizer: 'CDC UM Kendari & International Office UMK',
    date: '2026-10-12',
    time: '08:30 - 12:00 WITA',
    location: 'Gedung Rektorat Lantai 4 UMK',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    description: `### Wujudkan Impian Studi S2/S3 di Universitas Top Dunia

Melanjutkan studi pascasarjana ke luar negeri dengan pendanaan beasiswa penuh (*fully-funded scholarship*) seperti LPDP, Australia Awards Scholarship (AAS), Chevening, maupun Erasmus+ kini semakin terbuka lebar bagi lulusan UM Kendari.

Seminar ini menghadirkan para *awardee* beasiswa dan konsultan pendidikan internasional untuk berbagi peta jalan (*roadmap*) persiapan dokumen, esai kontribusi, serta kiat mencapai skor kemahiran bahasa Inggris yang dipersyaratkan.

#### Sesi Pembahasan:
- **Memilih Skema Beasiswa yang Tepat:** Karakteristik dan jadwal pembukaan program beasiswa pemerintah dan donor internasional.
- **Menulis Personal Statement & Study Plan yang Kuat:** Menghubungkan latar belakang akademis dengan kontribusi nyata pasca kelulusan.
- **Kiat Efektif Meraih Skor Target IELTS/TOEFL:** Strategi penguasaan sesi *Listening*, *Reading*, *Writing Task 2*, dan *Speaking*.`,
    speaker: 'Awardee LPDP & Alumni University of Melbourne',
    quota: 250,
    registeredCount: 20,
    registrationLink: 'https://bit.ly/seminar-beasiswa-umk',
    status: 'segera'
  },
  {
    id: 'evt_wo_workshop-public-speaking-perso',
    description: 'Sesi workshop CDC UM Kendari: Workshop Public Speaking & Personal Branding untuk Fresh Graduate. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'workshop',
    title: 'Workshop Public Speaking & Personal Branding untuk Fresh Graduate',
    organizer: 'CDC UM Kendari',
    date: '2026-10-06',
    time: '09:00 - 12:00 WITA',
    location: 'Ruang Seminar FKIP UM Kendari',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    speaker: 'Rizky Pratama, S.E., M.M. (Corporate Trainer)',
    quota: 60,
    registeredCount: 41,
    registrationLink: 'https://bit.ly/wspublik-umk',
    status: 'buka',
  },
  {
    id: 'evt_wo_workshop-excel-data-analysis-u',
    description: 'Sesi workshop CDC UM Kendari: Workshop Excel & Data Analysis untuk Administrasi Perkantoran. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'workshop',
    title: 'Workshop Excel & Data Analysis untuk Administrasi Perkantoran',
    organizer: 'CDC UM Kendari & Microsoft Learn Student Chapter',
    date: '2026-10-20',
    time: '13:00 - 16:00 WITA',
    location: 'Lab Komputer FEB UM Kendari',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    speaker: 'Andi Saputra, S.Kom. (Data Analyst Practitioner)',
    quota: 45,
    registeredCount: 45,
    registrationLink: 'https://bit.ly/wsexcel-umk',
    status: 'segera',
  },
  {
    id: 'evt_wo_workshop-digital-marketing-soc',
    description: 'Sesi workshop CDC UM Kendari: Workshop Digital Marketing & Social Media Strategy. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'workshop',
    title: 'Workshop Digital Marketing & Social Media Strategy',
    organizer: 'CDC UM Kendari & Komunitas Digital Kendari',
    date: '2026-11-04',
    time: '08:30 - 15:00 WITA',
    location: 'Auditorium KH. Ahmad Dahlan UM Kendari',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    speaker: 'Fitriani Abidin, S.Kom. (Digital Marketing Consultant)',
    quota: 90,
    registeredCount: 52,
    registrationLink: 'https://bit.ly/wsdigmar-umk',
    status: 'buka',
  },
  {
    id: 'evt_se_seminar-nasional-strategi-suks',
    description: 'Sesi seminar CDC UM Kendari: Seminar Nasional "Strategi Sukses Menyambut Demografi Emas 2045". Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'seminar',
    title: 'Seminar Nasional "Strategi Sukses Menyambut Demografi Emas 2045"',
    organizer: 'CDC UM Kendari & BKK KM UMK',
    date: '2026-09-29',
    time: '08:00 - 12:00 WITA',
    location: 'Auditorium Utama UM Kendari',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    speaker: 'Prof. Dr. H. Amirullah, M.Si. & Narasumber BUMN',
    quota: 300,
    registeredCount: 214,
    registrationLink: 'https://bit.ly/seminas-umk',
    status: 'buka',
  },
  {
    id: 'evt_se_seminar-karir-bumn-rahasia-lol',
    description: 'Sesi seminar CDC UM Kendari: Seminar Karir BUMN: Rahasia Lolos Seleksi SDM BUMN 2026. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'seminar',
    title: 'Seminar Karir BUMN: Rahasia Lolos Seleksi SDM BUMN 2026',
    organizer: 'CDC UM Kendari',
    date: '2026-10-27',
    time: '13:00 - 17:00 WITA',
    location: 'Gedung Serba Guna UM Kendari',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=800&auto=format&fit=crop',
    speaker: 'Tim Rekrutmen SDM BUMN Regional Sulawesi',
    quota: 250,
    registeredCount: 118,
    registrationLink: 'https://bit.ly/sembumn-umk',
    status: 'buka',
  },
  {
    id: 'evt_se_negosiasi-gaji-dan-benefit-kerja',
    description: 'Sesi seminar CDC UM Kendari: Seminar Negosiasi Gaji & Benefit Kerja. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'seminar',
    title: 'Seminar Negosiasi Gaji & Benefit Kerja untuk Fresh Graduate',
    organizer: 'CDC UM Kendari', date: '2026-12-02', time: '13:00 - 16:00 WITA',
    location: 'Aula Utama UM Kendari',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop',
    speaker: 'Bayu Setiawan, CHRP. (Compensation & Benefit Specialist)',
    quota: 180, registeredCount: 76, registrationLink: 'https://bit.ly/semnegosiasi-umk', status: 'buka'
  },
  {
    id: 'evt_se_seminar-motivasi-bangun-mental',
    description: 'Sesi seminar CDC UM Kendari: "Seminar Motivasi: Bangun Mental Entrepreneur Muda". Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'seminar',
    title: '"Seminar Motivasi: Bangun Mental Entrepreneur Muda"',
    organizer: 'CDC UM Kendari & Inkubator Bisnis UMK',
    date: '2026-11-18',
    time: '09:00 - 13:00 WITA',
    location: 'Aula Utama UM Kendari',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
    speaker: 'Founder UMKM Naik Kelas & Mentor Inkubator',
    quota: 200,
    registeredCount: 95,
    registrationLink: 'https://bit.ly/semwirausaha-umk',
    status: 'buka',
  },
  {
    id: 'evt_so_soft-skill-class-etika-profesi',
    description: 'Sesi softskill CDC UM Kendari: Soft Skill Class: Etika Profesi & Business Manner. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'softskill',
    title: 'Soft Skill Class: Etika Profesi & Business Manner',
    organizer: 'CDC UM Kendari',
    date: '2026-09-21',
    time: '10:00 - 12:00 WITA',
    location: 'Ruang Pelatihan CDC UM Kendari',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
    speaker: 'Hj. Nurhayati, S.Sos., M.M. (HR Practitioner)',
    quota: 40,
    registeredCount: 28,
    registrationLink: 'https://bit.ly/ss-etika-umk',
    status: 'buka',
  },
  {
    id: 'evt_so_soft-skill-class-teamwork-lead',
    description: 'Sesi softskill CDC UM Kendari: Soft Skill Class: Teamwork & Leadership Development. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'softskill',
    title: 'Soft Skill Class: Teamwork & Leadership Development',
    organizer: 'CDC UM Kendari & LDK Universitas Muhammadiyah Kendari',
    date: '2026-10-13',
    time: '13:00 - 16:00 WITA',
    location: 'Ruang Pelatihan CDC UM Kendari',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&auto=format&fit=crop',
    speaker: 'Muhammad Iqbal, S.Psi. (Leadership Facilitator)',
    quota: 35,
    registeredCount: 19,
    registrationLink: 'https://bit.ly/ss-leader-umk',
    status: 'buka',
  },
  {
    id: 'evt_so_soft-skill-class-time-manageme',
    description: 'Sesi softskill CDC UM Kendari: Soft Skill Class: Time Management & Productivity Hacks. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'softskill',
    title: 'Soft Skill Class: Time Management & Productivity Hacks',
    organizer: 'CDC UM Kendari',
    date: '2026-11-11',
    time: '10:00 - 12:30 WITA',
    location: 'Ruang Pelatihan CDC UM Kendari',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop',
    speaker: 'Dr. Sitti Rahmah, M.Pd.I. (Academic & Productivity Coach)',
    quota: 40,
    registeredCount: 33,
    registrationLink: 'https://bit.ly/ss-time-umk',
    status: 'buka',
  },
  {
    id: 'evt_so_adaptabilitas-dan-etika-digital',
    description: 'Sesi softskill CDC UM Kendari: Adaptabilitas & Etika Digital. Kegiatan pembinaan karir bersama praktisi industri untuk mahasiswa dan alumni UM Kendari.',
    category: 'softskill',
    title: 'Soft Skill Class: Adaptabilitas & Etika Digital di Dunia Kerja',
    organizer: 'CDC UM Kendari', date: '2026-12-09', time: '10:00 - 12:30 WITA',
    location: 'Ruang Pelatihan CDC UM Kendari',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    speaker: 'Dewi Anggraini, S.Psi., M.A. (Industrial-Organizational Psychologist)',
    quota: 40, registeredCount: 22, registrationLink: 'https://bit.ly/ss-adaptasi-umk', status: 'buka'
  }
]

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

export const SEED_KONTEN_KARIR_PRESENTASI: KontenKarir[] = [
  {
    id: 'prest_007',
    jenis: 'presentasi',
    judul: 'SEA University Games 2026 – Cabang Renang',
    kategori: 'internasional',
    subKategori: 'olahraga',
    peringkat: 'Juara 3 / Perunggu',
    tahun: '2026',
    namaMahasiswa: 'Muhammad Fauzan',
    prodi: 'Pendidikan Olahraga',
    body: 'Perenang muda UMK berhasil menyumbangkan medali perunggu pada nomor 100m gaya bebas putra di ajang SEA University Games.',
    thumbnail: 'https://images.unsplash.com/photo-1530543746129-07ab857928c7?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-07-02T08:30:00Z',
    updatedAt: '2026-07-02T08:30:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_008',
    jenis: 'presentasi',
    judul: 'International Traditional Dance Festival 2026',
    kategori: 'internasional',
    subKategori: 'seni',
    peringkat: 'Best Performance Award',
    tahun: '2026',
    namaMahasiswa: 'Sanggar Seni UMK (Tim Tari)',
    prodi: 'Pendidikan Bahasa dan Sastra Indonesia',
    body: 'Penampilan tari kreasi berbasis budaya Tolaki berhasil meraih penghargaan Best Performance pada festival tari tradisional internasional.',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-44ecd06ad815?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_009',
    jenis: 'presentasi',
    judul: 'ASEAN Youth Music & Arts Competition 2026',
    kategori: 'internasional',
    subKategori: 'seni',
    peringkat: 'Juara 1 / Gold',
    tahun: '2026',
    namaMahasiswa: 'Ahmad Rizki Hidayat',
    prodi: 'Seni Musik',
    body: 'Menjadi yang terbaik pada kategori instrumental musik tradisional di kompetisi seni musik pemuda se-ASEAN.',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-05-30T09:45:00Z',
    updatedAt: '2026-05-30T09:45:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_010',
    jenis: 'presentasi',
    judul: 'Turnamen Bola Voli Pantai Mahasiswa Asia Tenggara 2026',
    kategori: 'internasional',
    subKategori: 'olahraga',
    peringkat: 'Juara 3 / Perunggu',
    tahun: '2026',
    namaMahasiswa: 'Duet Voli Pantai UMK',
    prodi: 'Pendidikan Olahraga',
    body: 'Pasangan voli pantai mahasiswa UMK meraih medali perunggu pada turnamen internasional di pantai Los Baños, Filipina.',
    thumbnail: 'https://images.unsplash.com/photo-1612872087720-dbb86e8b7ba7?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-08-02T07:50:00Z',
    updatedAt: '2026-08-02T07:50:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_011',
    jenis: 'presentasi',
    judul: 'Kejuaraan Nasional Bridge Mahasiswa 2026',
    kategori: 'nasional',
    subKategori: 'olahraga',
    peringkat: 'Juara 3 / Semifinalis Terbaik',
    tahun: '2026',
    namaMahasiswa: 'Tim Bridge UMK',
    prodi: 'Akuntansi',
    body: 'Debut pertama tim bridge UMK di Kejurnas mahasiswa dan langsung membawa pulang predikat semifinalis terbaik.',
    thumbnail: 'https://images.unsplash.com/photo-1596854407930-d5a4f1f1c3e5?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-05-08T14:15:00Z',
    updatedAt: '2026-05-08T14:15:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_012',
    jenis: 'presentasi',
    judul: 'Gemastik Esports National Championship 2026',
    kategori: 'nasional',
    subKategori: 'olahraga',
    peringkat: 'Juara 2 / Runner Up',
    tahun: '2026',
    namaMahasiswa: 'UMK Esports Division',
    prodi: 'Teknik Informatika',
    body: 'Tim Mobile Legends UMK berhasil menjadi runner up pada divisi esports pesta olahraga mahasiswa nasional.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-8c5e26379865?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-06-05T20:30:00Z',
    updatedAt: '2026-06-05T20:30:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_013',
    jenis: 'presentasi',
    judul: 'Festival Film Pendek Mahasiswa Nasional 2026',
    kategori: 'nasional',
    subKategori: 'seni',
    peringkat: 'Juara 1 / Film Dokumenter Terbaik',
    tahun: '2026',
    namaMahasiswa: 'UMK Film Collective',
    prodi: 'Ilmu Komunikasi',
    body: 'Film dokumenter "Nelayan Kota" mengangkat kehidupan pesisir Kendari dan menang kategori dokumenter terbaik tingkat nasional.',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-04-30T16:45:00Z',
    updatedAt: '2026-04-30T16:45:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_014',
    jenis: 'presentasi',
    judul: 'Lomba Cipta Lagu & Musik Tradisional Nasional 2026',
    kategori: 'nasional',
    subKategori: 'seni',
    peringkat: 'Juara 1 / Cipta Lagu Terbaik',
    tahun: '2026',
    namaMahasiswa: 'Alamsyah Putra',
    prodi: 'Pendidikan Seni Musik',
    body: 'Lagu "Rohi Kendari" perpaduan musik modern dan alat musik tradisional Lada-gi meraih juara pertama lomba cipta lagu nasional.',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-dbc7e7f2f6be?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-03-25T09:10:00Z',
    updatedAt: '2026-03-25T09:10:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_015',
    jenis: 'presentasi',
    judul: 'Pekan Olahraga Mahasiswa Daerah (POPDA) Sultra 2026',
    kategori: 'wilayah',
    subKategori: 'olahraga',
    peringkat: 'Juara 1 / Emas',
    tahun: '2026',
    namaMahasiswa: 'La Ode Fajar Sidik',
    prodi: 'Pendidikan Jasmani Kesehatan dan Rekreasi',
    body: 'Medali emas cabang pencak silat kelas tanding 60kg putra pada POPDA Sulawesi Tenggara, lolos ke POPNAS.',
    thumbnail: 'https://images.unsplash.com/photo-1555597673-b2d75c1f8bd1?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-04-22T13:20:00Z',
    updatedAt: '2026-04-22T13:20:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_016',
    jenis: 'presentasi',
    judul: 'Sulawesi Tenggara Futsal Student League 2026',
    kategori: 'wilayah',
    subKategori: 'olahraga',
    peringkat: 'Juara 2 / Runner Up',
    tahun: '2026',
    namaMahasiswa: 'Tim Futsal UMK',
    prodi: 'Berbagai Program Studi',
    body: 'Tim Futsal Universitas Muhammadiyah Kendari berhasil melaju hingga final liga futsal mahasiswa se-Sulawesi Tenggara.',
    thumbnail: 'https://images.unsplash.com/photo-1531446149050-48d686921263?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-03-14T17:30:00Z',
    updatedAt: '2026-03-14T17:30:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_017',
    jenis: 'presentasi',
    judul: 'Festival Lagu Daerah & Keroncong Tingkat Sulawesi 2026',
    kategori: 'wilayah',
    subKategori: 'seni',
    peringkat: 'Juara 1 / Penyanyi Terbaik',
    tahun: '2026',
    namaMahasiswa: 'Hasnawati',
    prodi: 'Pendidikan Guru Sekolah Dasar',
    body: 'Membawakan lagu daerah Wolaku Pi Poria dengan aransemen modern dan dinobatkan sebagai penyanyi terbaik festival.',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-02-26T19:00:00Z',
    updatedAt: '2026-02-26T19:00:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  },
  {
    id: 'prest_018',
    jenis: 'presentasi',
    judul: 'Pameran Rupa & Lukis Mahasiswa Sulawesi 2026',
    kategori: 'wilayah',
    subKategori: 'seni',
    peringkat: 'Juara 2 / Karya Terpilih',
    tahun: '2026',
    namaMahasiswa: 'Fitriani',
    prodi: 'Pendidikan Seni Rupa',
    body: 'Karya lukis bertema "Pesisir Kendari" terpilih sebagai karya terbaik kedua pada pameran seni rupa mahasiswa regional Sulawesi.',
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    terverifikasi: true,
    status: 'published',
    createdAt: '2026-01-18T11:40:00Z',
    updatedAt: '2026-01-18T11:40:00Z',
    createdBy: 'usr_admin',
    createdByName: 'Admin Website'
  }
];

export const SAMPLE_PDF_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQKJSDi48vNCiAxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzMgMCBSXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDQgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA1IDAgUj4+Pj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA3Nz4+CnN0cmVhbQpCVAovRjEgMjQgVGYKNzAgNzIwIFRkCihTVVJBVCBLRVBVVFVTRUFOIENEQyBVTSBLRU5EQVJJKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDA0MDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNjggMDAwMDAgbiAKMDA0MDAwMDEyNSAwMDAwMCBuIAowMDAwMDAyNDQgMDAwMDAgbiAKMDA0MDAwMDM3MiAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNj4+CnN0YXJ0eHJlZgoxNzgKJSVFT0Y=';

export const SEED_SURAT_KEPUTUSAN: SuratKeputusan[] = [
  {
    id: 'sk_1',
    judul: 'SK CDC UMK 2026 – 2027',
    kategori: 'SK CDC UMK',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'sk_2',
    judul: 'SK CDC 2025–2026',
    kategori: 'SK CDC UMK',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'sk_3',
    judul: 'SK CDC 2024–2025',
    kategori: 'SK CDC UMK',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'sk_4',
    judul: 'SK CDC 2022–2024',
    kategori: 'SK CDC UMK',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2022-01-10T08:00:00Z'
  },
  {
    id: 'sk_5',
    judul: 'SK PJK UMK & Perubahan nama CDC',
    kategori: 'SK PJK UMK 2017 & Perubahan Nama CDC',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2017-01-10T08:00:00Z'
  },
  {
    id: 'sk_6',
    judul: 'SK PJK UMK 2014',
    kategori: 'SK PJK UMK 2014',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2014-01-10T08:00:00Z'
  }
];

export const SEED_KALENDER_KEGIATAN: KalenderKegiatan[] = [
  {
    id: 'kal_1',
    judul: 'Kalender Kegiatan Akademik & Karir CDC UMK 2026',
    kategori: 'Kalender Utama CDC',
    displayType: 'poster',
    posterUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
    isFeatured: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'kal_2',
    judul: 'Jadwal Agenda Job Fair & Campus Hiring 2026',
    kategori: 'Agenda Bursa Kerja',
    displayType: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'kal_3',
    judul: 'Jadwal Pelatihan Softskill & Workshop Karir Semester Genap',
    kategori: 'Pelatihan & Workshop',
    displayType: 'poster',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    isFeatured: false,
    createdAt: '2026-03-01T08:00:00Z'
  }
];

export const SEED_LAPORAN_KINERJA: LaporanKinerja[] = [
  {
    id: 'lap_1',
    judul: 'Laporan Kinerja CDC UM Kendari Tahun 2025',
    kategori: 'Laporan Kinerja CDC',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'lap_2',
    judul: 'Laporan Hasil Tracer Study Universitas Muhammadiyah Kendari 2025',
    kategori: 'Laporan Tracer Study',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2025-12-20T08:00:00Z'
  },
  {
    id: 'lap_3',
    judul: 'Laporan Monev & Evaluasi Karir Alumni UMK 2024',
    kategori: 'Laporan Kinerja CDC',
    tipe: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2024-12-15T08:00:00Z'
  }
];

export const SEED_MOU_STAKEHOLDER: MouStakeholder[] = [
  {
    id: 'mou_1',
    judul: 'MOU Kerjasama Industri & Rekrutmen CDC UMK dengan PT Pertamina (Persero)',
    kategori: 'MOU Perusahaan BUMN & Swasta',
    displayType: 'poster',
    posterUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop',
    isFeatured: true,
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'mou_2',
    judul: 'Dokumen MOU Nota Kesepahaman UMK & Bank Syariah Indonesia (BSI)',
    kategori: 'MOU Perusahaan BUMN & Swasta',
    displayType: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2025-11-10T08:00:00Z'
  },
  {
    id: 'mou_3',
    judul: 'MOU Kemitraan Magang Industri & Karir dengan Dinas Tenaga Kerja Kota Kendari',
    kategori: 'MOU Instansi Pemerintah',
    displayType: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    isFeatured: false,
    createdAt: '2025-08-20T08:00:00Z'
  }
];

export const SEED_GALERI_ITEMS: GaleriItem[] = [
  {
    id: 'gal_1',
    judul: 'Bimbingan Karir & Pembekalan Wisudawan UMK',
    kategoriSection: 'Kegiatan Terkini 2026',
    tipeMedia: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    linkUrl: 'https://tracerstudy.umkendari.ac.id',
    deskripsi: 'Dokumentasi video sesi bimbingan karir dan mekanisme tracer study bagi calon wisudawan UMK.',
    isFeatured: true,
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'gal_2',
    judul: 'Poster 9th UMK Job Fair & Bursa Kerja Annual 2025',
    kategoriSection: 'Kegiatan Terkini 2026',
    tipeMedia: 'poster',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    linkUrl: 'https://jobfair.umkendari.ac.id',
    deskripsi: 'Flyer resmi bursa kerja tahunan UMK mempertemukan alumni dengan 30+ perusahaan mitra.',
    isFeatured: false,
    createdAt: '2025-11-15T08:00:00Z'
  },
  {
    id: 'gal_3',
    judul: 'Bulan Perencanaan Karir Mahasiswa UMK - Seminar & Workshop',
    kategoriSection: 'Galeri Kegiatan 2025',
    tipeMedia: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    deskripsi: 'Rangkaian kegiatan webinar dan workshop pengembangan softskill mahasiswa UMK.',
    isFeatured: false,
    createdAt: '2025-10-10T08:00:00Z'
  },
  {
    id: 'gal_4',
    judul: 'Majalah Temu Alumni & Survei Pengguna Lulusan 2024/2025',
    kategoriSection: 'Majalah & Survei Lulusan',
    tipeMedia: 'pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    linkUrl: 'https://tracerstudy.umkendari.ac.id/survey',
    deskripsi: 'E-Book Majalah Temu Alumni CDC UMK serta hasil rekapitulasi survei pengguna lulusan.',
    isFeatured: false,
    createdAt: '2025-07-20T08:00:00Z'
  }
];

// Helper to safely access database keys
export const SEED_SOCIAL_MEDIA: SocialMediaItem[] = [
  {
    id: 'soc_fb',
    platform: 'facebook',
    label: 'Facebook CDC UM Kendari',
    url: 'https://facebook.com/umkendari',
    isActive: true,
    hoverColor: 'hover:bg-blue-600'
  },
  {
    id: 'soc_ig',
    platform: 'instagram',
    label: 'Instagram CDC UM Kendari',
    url: 'https://instagram.com/cdc_umkendari',
    isActive: true,
    hoverColor: 'hover:bg-pink-600'
  },
  {
    id: 'soc_yt',
    platform: 'youtube',
    label: 'YouTube CDC UM Kendari',
    url: 'https://youtube.com/@umkendari',
    isActive: true,
    hoverColor: 'hover:bg-red-600'
  },
  {
    id: 'soc_web',
    platform: 'website',
    label: 'Website UM Kendari',
    url: 'https://umkendari.ac.id',
    isActive: true,
    hoverColor: 'hover:bg-[#10B981]'
  }
];

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
  | 'survei_lulusan'
  | 'konten_karir'
  | 'surat_keputusan'
  | 'kalender_kegiatan'
  | 'laporan_kinerja'
  | 'mou_stakeholder'
  | 'galeri_items'
  | 'social_media'
  | 'komentar_berita'
  | 'statistik_config';

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
  survei_lulusan: SEED_SURVEI_LULUSAN,
  konten_karir: [...SEED_KONTEN_KARIR, ...SEED_KONTEN_KARIR_PRESENTASI],
  surat_keputusan: SEED_SURAT_KEPUTUSAN,
  kalender_kegiatan: SEED_KALENDER_KEGIATAN,
  laporan_kinerja: SEED_LAPORAN_KINERJA,
  mou_stakeholder: SEED_MOU_STAKEHOLDER,
  galeri_items: SEED_GALERI_ITEMS,
  social_media: SEED_SOCIAL_MEDIA,
};

// In-Memory Database State (100% Bebas LocalStorage)
const MEMORY_DB: Record<string, any[]> = { ...DEFAULT_SEEDS };
let _dbInitialized = false;

// Async initializer yang memuat seluruh data live dari Supabase PostgreSQL Database
// dengan fallback ke localStorage jika Supabase gagal
export async function initializeDB(): Promise<void> {
  try {
    const liveData = await fetchInitialDatabaseFromSupabase();
    if (liveData) {
      Object.keys(liveData).forEach(key => {
        if (Array.isArray(liveData[key]) && liveData[key].length > 0) {
          MEMORY_DB[key] = liveData[key];
        }
      });
      console.log('⚡ [Portal Data Engine] Storage dialihkan 100% ke Supabase PostgreSQL Database!');
    }
  } catch (err) {
    console.warn('[DB Init Exception] Falling back to localStorage:', err);
    // Fallback: gunakan localStorage dengan versioning
    const CURRENT_SEED_VERSION = 'v17_magang_dummy_7';
    if (localStorage.getItem('cdc_seed_version') !== CURRENT_SEED_VERSION) {
      Object.entries(DEFAULT_SEEDS).forEach(([key, val]) => {
        const storageKey = `cdc_umk_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(val));
      });
      localStorage.setItem('cdc_seed_version', CURRENT_SEED_VERSION);
    } else {
      Object.entries(DEFAULT_SEEDS).forEach(([key, val]) => {
        const storageKey = `cdc_umk_${key}`;
        if (!localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, JSON.stringify(val));
        }
      });
    }
  } finally {
    _dbInitialized = true;
    cleanupGoogleUsersEducation();
  }
}

// Auto cleanup helper for Google users to ensure clean slate if no NIM has been registered
export function cleanupGoogleUsersEducation() {
  try {
    const users = (MEMORY_DB['users'] as User[]) || [];
    const students = (MEMORY_DB['mahasiswa'] as Mahasiswa[]) || [];
    let changed = false;

    students.forEach(st => {
      const u = users.find(usr => usr.id === st.userId);
      const isGoogle = u && (
        u.password === 'google_authenticated' || 
        u.id.startsWith('usr_google_') || 
        u.email.toLowerCase().includes('akunrekantim')
      );
      if (isGoogle && !st.nim) {
        if (st.qualifications && st.qualifications.length > 0) {
          st.qualifications = [];
          changed = true;
        }
        if (st.programStudi || st.fakultas || st.angkatan || st.graduationYear) {
          st.programStudi = '';
          st.fakultas = '';
          st.angkatan = '';
          st.graduationYear = '';
          changed = true;
        }
      }
    });

    if (changed) {
      saveToDB('mahasiswa', students);
    }
  } catch (e) {
    // silent
  }
}

// Fetch item dari In-Memory DB
export function getFromDB<T>(key: DBKey): T[] {
  if (!_dbInitialized) {
    initializeDB();
  }
  return (MEMORY_DB[key] as T[]) || [];
}

// Simpan/Update item ke In-Memory DB & Sinkronisasi Langsung ke Supabase PostgreSQL
export function saveToDB<T>(key: DBKey, data: T[]) {
  MEMORY_DB[key] = data;

  // Asynchronous Sync ke Supabase PostgreSQL Database API
  setTimeout(async () => {
    try {
      if (key === 'users' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncUserToSupabase(item);
        }
      } else if (key === 'mahasiswa' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncMahasiswaToSupabase(item);
        }
      } else if (key === 'alumni' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncAlumniToSupabase(item);
        }
      } else if (key === 'mitra' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncMitraToSupabase(item);
        }
      } else if (key === 'lowongan' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncLowonganToSupabase(item);
        }
      } else if (key === 'pengajuan_magang' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncPengajuanToSupabase(item);
        }
      } else if ((key === ('tracer_study' as any) || key === 'tracer_studies') && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncTracerStudyToSupabase(item);
        }
      } else if (key === 'konten_karir' && Array.isArray(data)) {
        for (const item of data as any[]) {
          await syncKontenKarirToSupabase(item);
        }
      }
    } catch (e) {
      console.warn('[Sync Error]', key, e);
    }
  }, 0);
}

// Helper to push new item at top
export function insertToDB<T extends { id: string }>(key: DBKey, item: T): T {
  const current = getFromDB<T>(key);
  current.unshift(item);
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
  MEMORY_DB[key] = filtered;
  saveToDB(key, filtered);
  deleteFromSupabase(key, id);
}

/* ─────────────────────────────────────────────────────────────────
   REGISTRATION MODULE HELPERS
───────────────────────────────────────────────────────────────── */
export interface RegisterAlumniPayload {
  name: string;
  nim: string;
  email: string;
  password?: string;
  phone?: string;
  programStudi: string;
  fakultas: string;
  tahunLulus: string;
  userStatusType?: 'Mahasiswa' | 'Alumni';
  statusPekerjaan?: 'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja' | 'mahasiswa_aktif';
}

export interface RegisterMitraPayload {
  namaInstansi: string;
  kontakPerson: string;
  email: string;
  password?: string;
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
    password: payload.password || 'password',
    phone: payload.phone || '',
    role: role === 'alumni' ? 'user' : 'mitra',
    userStatusType: role === 'alumni' ? ((payload as RegisterAlumniPayload).userStatusType || 'Mahasiswa') : undefined,
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
      statusPekerjaan: almPayload.statusPekerjaan || (almPayload.userStatusType === 'Mahasiswa' ? 'mahasiswa_aktif' : 'belum_bekerja')
    };
    insertToDB<Alumni>('alumni', newAlumni);

    // Create fresh clean Mahasiswa profile with reset/empty resume fields for self-configuration
    const newMahasiswa: Mahasiswa = {
      id: `mhs_${userId}`,
      userId: userId,
      nim: almPayload.nim,
      nama: almPayload.name,
      email: almPayload.email,
      phone: almPayload.phone || '',
      fakultas: almPayload.fakultas,
      programStudi: almPayload.programStudi,
      angkatan: almPayload.tahunLulus,
      graduationYear: almPayload.tahunLulus,
      semester: almPayload.userStatusType === 'Mahasiswa' ? 6 : 8,
      userStatusType: almPayload.userStatusType || 'Mahasiswa',
      alamat: '',
      photoUrl: newUser.photoUrl,
      aboutMe: '',
      ipk: '',
      nationality: 'Indonesia',
      opportunityType: '',
      preferredStartDate: '',
      gender: '',
      industries: '',
      locations: '',
      university: 'Universitas Muhammadiyah Kendari',
      skills: [],
      experiences: [],
      certificates: [],
      qualifications: [],
      languages: []
    };
    insertToDB<Mahasiswa>('mahasiswa', newMahasiswa);

    // Initialize clean empty bookmarks for new user
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`cdc_saved_job_ids_${userId}`, JSON.stringify([]));
      }
    } catch { }
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

/**
 * Autentikasi langsung dengan Akun Google (Login / Auto-Register)
 */
export function loginOrRegisterWithGoogle(googleAccount: {
  name: string;
  email: string;
  photoUrl?: string;
}): { user: User; isNew: boolean } {
  const users = getFromDB<User>('users');
  const existingUser = users.find(
    u => u.email.toLowerCase() === googleAccount.email.trim().toLowerCase()
  );

  const now = new Date().toISOString();

  if (existingUser) {
    const updatedUser: User = {
      ...existingUser,
      lastLoginAt: now,
      photoUrl: googleAccount.photoUrl || existingUser.photoUrl
    };
    const updatedUsers = users.map(u => (u.id === existingUser.id ? updatedUser : u));
    saveToDB('users', updatedUsers);

    // Reset dummy education on Google user if it was auto-generated
    const students = getFromDB<Mahasiswa>('mahasiswa');
    const student = students.find(s => s.userId === existingUser.id);
    if (student && !student.nim) {
      student.qualifications = [];
      student.fakultas = '';
      student.programStudi = '';
      student.angkatan = '';
      student.graduationYear = '';
      saveToDB('mahasiswa', students);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cdc_session_id', updatedUser.id);
      localStorage.setItem('cdc_auth_token', `google_token_${Date.now()}`);
    }

    return { user: updatedUser, isNew: false };
  }

  // Create new user through Google OAuth
  const userId = `usr_google_${Date.now().toString(36)}`;
  const newUser: User = {
    id: userId,
    name: googleAccount.name.trim(),
    email: googleAccount.email.trim().toLowerCase(),
    password: 'google_authenticated',
    phone: '',
    role: 'user',
    userStatusType: 'Mahasiswa',
    status: 'active',
    photoUrl: googleAccount.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    createdAt: now,
    lastLoginAt: now
  };
  insertToDB<User>('users', newUser);

  // Auto-generate clean, uninitialized Alumni & Mahasiswa profile
  const newAlumni: Alumni = {
    id: `alm_${Date.now().toString(36)}`,
    userId: userId,
    nim: '',
    nama: googleAccount.name.trim(),
    email: googleAccount.email.trim().toLowerCase(),
    phone: '',
    programStudi: '',
    fakultas: '',
    tahunLulus: '',
    statusPekerjaan: 'mahasiswa_aktif'
  };
  insertToDB<Alumni>('alumni', newAlumni);

  const newMahasiswa: Mahasiswa = {
    id: `mhs_${userId}`,
    userId: userId,
    nim: '',
    nama: googleAccount.name.trim(),
    email: googleAccount.email.trim().toLowerCase(),
    phone: '',
    fakultas: '',
    programStudi: '',
    angkatan: '',
    graduationYear: '',
    semester: 1,
    userStatusType: 'Mahasiswa',
    alamat: '',
    photoUrl: newUser.photoUrl,
    aboutMe: '',
    ipk: '',
    nationality: 'Indonesia',
    opportunityType: '',
    preferredStartDate: '',
    gender: '',
    industries: '',
    locations: '',
    university: 'Universitas Muhammadiyah Kendari',
    skills: [],
    experiences: [],
    certificates: [],
    qualifications: [],
    languages: []
  };
  insertToDB<Mahasiswa>('mahasiswa', newMahasiswa);

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cdc_session_id', newUser.id);
    localStorage.setItem('cdc_auth_token', `google_token_${Date.now()}`);
    localStorage.setItem(`cdc_saved_job_ids_${userId}`, JSON.stringify([]));
  }

  return { user: newUser, isNew: true };
}

export function updateUserProfile(userId: string, profileData: Partial<Mahasiswa>) {
  const students = getFromDB<Mahasiswa>('mahasiswa');
  let student = students.find(s => s.userId === userId);
  let updatedStudent: Mahasiswa;

  if (student) {
    updatedStudent = { ...student, ...profileData };
    updateInDB<Mahasiswa>('mahasiswa', updatedStudent);
  } else {
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
    updatedStudent = newStudent;
  }

  // Also sync name, email, photoUrl with users table
  const users = getFromDB<User>('users');
  const userObj = users.find(u => u.id === userId);
  if (userObj) {
    const updatedUser: User = {
      ...userObj,
      name: profileData.nama || userObj.name,
      email: profileData.email || userObj.email,
      photoUrl: profileData.photoUrl || userObj.photoUrl
    };
    updateInDB<User>('users', updatedUser);
  }

  return updatedStudent;
}

export function applyForJob(userId: string, job: Lowongan, extraData?: any) {
  if (isJobDeadlinePassed(job.deadline)) {
    throw new Error('Pendaftaran untuk lowongan ini telah ditutup karena telah melewati batas waktu (deadline).');
  }

  const students = getFromDB<Mahasiswa>('mahasiswa');
  const student = students.find(s => s.userId === userId);

  const users = getFromDB<User>('users');
  const currentUser = users.find(u => u.id === userId);

  const applicantName = extraData?.applicantName || (student ? student.nama : (currentUser?.name || 'Mahasiswa Pelamar'));
  const applicantEmail = extraData?.applicantEmail || (student ? student.email : (currentUser?.email || ''));
  const applicantProdi = extraData?.applicantProdi || (student ? student.programStudi : 'Teknologi Informasi');
  const isMahasiswaRole = student?.userStatusType === 'Mahasiswa' || (!student?.userStatusType && Boolean(student?.nim));
  const applicantNim = extraData?.applicantNim ?? (isMahasiswaRole ? (student?.nim || '') : '');

  const pengajuanId = `pj_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newPengajuan: PengajuanMagang = {
    id: pengajuanId,
    mahasiswaId: student ? student.id : `mhs_${userId}`,
    userId: userId,
    lowonganId: job.id,
    mitraId: job.mitraId,
    namaInstansi: job.namaInstansi,
    namaMahasiswa: applicantName,
    nim: applicantNim,
    programStudi: applicantProdi,
    tujuanMagang: job.judul,
    lokasiMagang: job.lokasi,
    catatan: extraData?.applicantNotes || '',
    berkasUrl: extraData?.uploadedFileUrl || extraData?.berkasUrl || undefined,
    berkasNama: extraData?.uploadedFileName || extraData?.berkasNama || 'CV_Mahasiswa_Pelamar.pdf',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'under_review',
    createdAt: new Date().toISOString(),
    ipk: student?.ipk || '',
    skills: student?.skills || [],
    experiences: student?.experiences || [],
    certificates: student?.certificates || [],
    qualifications: student?.qualifications || []
  };

  insertToDB<PengajuanMagang>('pengajuan_magang', newPengajuan);
  return newPengajuan;
}

/* ─────────────────────────────────────────────────────────────────
   KOMENTAR BERITA HELPERS (moderasi admin)
───────────────────────────────────────────────────────────────── */
export function getKomentarBerita(): KomentarBerita[] {
  return getFromDB<KomentarBerita>('komentar_berita');
}

/** Komentar yang sudah disetujui admin — untuk render publik. */
export function getApprovedKomentarBerita(slug: string): KomentarBerita[] {
  return getKomentarBerita()
    .filter(k => k.beritaSlug === slug && k.status === 'approved')
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function insertKomentarBerita(item: KomentarBerita): KomentarBerita {
  return insertToDB<KomentarBerita>('komentar_berita', item);
}

export function updateKomentarBeritaStatus(id: string, status: StatusKomentar): KomentarBerita | null {
  const all = getKomentarBerita();
  const idx = all.findIndex(k => k.id === id);
  if (idx === -1) return null;
  const updated = { ...all[idx], status };
  updateInDB<KomentarBerita>('komentar_berita', updated);
  return updated;
}

export function deleteKomentarBerita(id: string): void {
  deleteInDB<KomentarBerita>('komentar_berita', id);
}

/* ─────────────────────────────────────────────────────────────────
   BOOKMARK / SAVED JOBS HELPERS (ISOLATED PER USER)
───────────────────────────────────────────────────────────────── */
export function getSavedJobIds(userId?: string): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const currentUserId = userId || localStorage.getItem('cdc_session_id');
    const storageKey = currentUserId ? `cdc_saved_job_ids_${currentUserId}` : 'cdc_saved_job_ids_guest';
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getValidSavedJobs(userId?: string): Lowongan[] {
  const savedIds = getSavedJobIds(userId);
  const allJobs = getFromDB<Lowongan>('lowongan');
  return allJobs.filter(job => savedIds.includes(job.id));
}

export function toggleSaveJob(jobId: string, userId?: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  const currentUserId = userId || localStorage.getItem('cdc_session_id');
  const storageKey = currentUserId ? `cdc_saved_job_ids_${currentUserId}` : 'cdc_saved_job_ids_guest';
  const current = getSavedJobIds(userId);
  let next: string[];
  let isSaved = false;
  if (current.includes(jobId)) {
    next = current.filter(id => id !== jobId);
    isSaved = false;
  } else {
    next = [...current, jobId];
    isSaved = true;
  }
  localStorage.setItem(storageKey, JSON.stringify(next));
  if (currentUserId) {
    localStorage.setItem(`saved_job_${currentUserId}_${jobId}`, isSaved ? 'true' : 'false');
  } else {
    localStorage.setItem(`saved_job_${jobId}`, isSaved ? 'true' : 'false');
  }
  return isSaved;
}

/* ─────────────────────────────────────────────────────────────────
   DATE FORMATTER HELPER
───────────────────────────────────────────────────────────────── */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const cleanDate = dateStr.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    const monthIdx = parseInt(month, 10) - 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    if (!isNaN(parseInt(day, 10)) && monthIdx >= 0 && monthIdx < 12) {
      return `${parseInt(day, 10)} ${months[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

/* ─────────────────────────────────────────────────────────────────
   DEADLINE CHECKER HELPER
───────────────────────────────────────────────────────────────── */
export function isJobDeadlinePassed(deadlineStr?: string): boolean {
  if (!deadlineStr || !deadlineStr.trim()) return false;
  const str = deadlineStr.trim().toLowerCase();

  if (str.includes('tutup') || str.includes('expired') || str.includes('selesai')) {
    return true;
  }

  // YYYY-MM-DD pattern
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const cleanDate = str.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(n => parseInt(n, 10));
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Set deadline date to end of that day (23:59:59.999)
      const deadlineDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      return new Date() > deadlineDate;
    }
  }

  // Indonesian text date format e.g. "15 Juli 2026" or "10 Agustus 2026"
  const indoMonths: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agu: 7, agustus: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9,
    nov: 10, november: 10,
    des: 11, desember: 11
  };

  const matchIndo = str.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (matchIndo) {
    const day = parseInt(matchIndo[1], 10);
    const monthKey = matchIndo[2];
    const year = parseInt(matchIndo[3], 10);
    if (indoMonths[monthKey] !== undefined && !isNaN(day) && !isNaN(year)) {
      const deadlineDate = new Date(year, indoMonths[monthKey], day, 23, 59, 59, 999);
      return new Date() > deadlineDate;
    }
  }

  return false;
}

/* ─────────────────────────────────────────────────────────────────
   VISITOR COUNTER HELPER
───────────────────────────────────────────────────────────────── */
export function trackAndGetVisitorCount(): string {
  // Untuk rilis live hosting: Dimulai dari 0 dan bertambah secara otomatis & alami per sesi peramban unik
  const BASE_VISITOR_COUNT = 0;
  const STORAGE_KEY = 'cdc_umk_visitor_count';
  const SESSION_KEY = 'cdc_umk_session_tracked';

  let currentCount = BASE_VISITOR_COUNT;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed)) {
      currentCount = Math.max(BASE_VISITOR_COUNT, parsed);
    }
  }

  if (!sessionStorage.getItem(SESSION_KEY)) {
    currentCount += 1;
    localStorage.setItem(STORAGE_KEY, currentCount.toString());
    sessionStorage.setItem(SESSION_KEY, 'true');
  }

  return `${currentCount.toLocaleString('id-ID')}+`;
}

// Helper untuk nomor WhatsApp Admin (Lapor Prestasi)
export function getAdminWaPrestasi(): string {
  const saved = localStorage.getItem('cdc_umk_admin_wa_prestasi');
  if (saved && saved.trim()) {
    let clean = saved.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return clean;
  }
  return '6285299887766';
}

export function saveAdminWaPrestasi(phone: string) {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  localStorage.setItem('cdc_umk_admin_wa_prestasi', clean);
}

/* ─────────────────────────────────────────────────────────────────
   HELPDESK & PEMULIHAN KATA SANDI CONFIG & HELPER
───────────────────────────────────────────────────────────────── */
export const DEFAULT_HELPDESK_CONFIG: HelpdeskConfig = {
  email: 'helpdesk@umkendari.ac.id',
  whatsappNumber: '0852-4100-9988',
  whatsappNote: '(Jam Kerja 08.00 - 16.00 WITA)',
  jamLayanan: 'Senin - Jumat: 08.00 - 16.00 WITA',
  defaultMessage: 'Halo Admin CDC UM Kendari, saya ingin berkonsultasi mengenai...',
  isFloatingActive: true
};

export function getHelpdeskConfig(): HelpdeskConfig {
  const saved = localStorage.getItem('cdc_umk_helpdesk_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        email: parsed.email || DEFAULT_HELPDESK_CONFIG.email,
        whatsappNumber: parsed.whatsappNumber || DEFAULT_HELPDESK_CONFIG.whatsappNumber,
        whatsappNote: parsed.whatsappNote ?? DEFAULT_HELPDESK_CONFIG.whatsappNote,
        jamLayanan: parsed.jamLayanan || DEFAULT_HELPDESK_CONFIG.jamLayanan,
        defaultMessage: parsed.defaultMessage || DEFAULT_HELPDESK_CONFIG.defaultMessage,
        isFloatingActive: parsed.isFloatingActive !== false
      };
    } catch (e) {
      // ignore
    }
  }
  return DEFAULT_HELPDESK_CONFIG;
}

export function saveHelpdeskConfig(config: HelpdeskConfig) {
  localStorage.setItem('cdc_umk_helpdesk_config', JSON.stringify(config));
}

/* ─────────────────────────────────────────────────────────────────
   KONSELING KARIR CONFIG & HELPER
───────────────────────────────────────────────────────────────── */
export const DEFAULT_KONSELING_CONFIG: KonselingConfig = {
  id: 'konseling_config_default',
  published: true,
  title: 'Layanan Konseling Karir UPT CDC UM Kendari',
  subtitle: 'Sesi konsultasi karir personal & pendampingan profesional untuk mahasiswa dan alumni Universitas Muhammadiyah Kendari',
  posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
  posterAlt: 'Poster Layanan Konseling Karir CDC UM Kendari',
  infoItems: [
    {
      id: 'info-1',
      judul: 'Konseling Perencanaan & Pengembangan Karir',
      deskripsi: 'Diskusi tatap muka maupun daring mengenai pemetaan minat, potensi diri, perencanaan karir jangka panjang, serta strategi menghadapi dunia kerja pasca kelulusan.',
      linkLabel: 'Panduan Konseling Karir',
      linkUrl: 'https://umkendari.ac.id'
    },
    {
      id: 'info-2',
      judul: 'Review CV, Cover Letter & Portofolio',
      deskripsi: 'Sesi penelaahan dan perbaikan dokumen lamaran kerja (CV, Surat Lamaran, & Portofolio) bersama konselor CDC agar sesuai standar industri profesional.',
      linkLabel: 'Template CV Standar CDC',
      linkUrl: 'https://umkendari.ac.id'
    },
    {
      id: 'info-3',
      judul: 'Simulasi & Konsultasi Persiapan Wawancara (Interview)',
      deskripsi: 'Simulasi wawancara kerja (mock interview), latihan menjawab pertanyaan teknis & HRD, serta tips percaya diri saat menghadapi proses rekrutmen.',
      linkLabel: 'Tips & Trik Wawancara Kerja',
      linkUrl: 'https://umkendari.ac.id'
    }
  ],
  jadwalItems: [
    {
      id: 'jdw-1',
      hari: 'Senin - Kamis',
      jam: '09.00 - 15.00 WITA',
      lokasi: 'Ruang Konseling CDC UM Kendari, Gedung Rektorat Lt. 2',
      kuotaPerHari: '5 Sesi / Hari',
      status: 'buka'
    },
    {
      id: 'jdw-2',
      hari: 'Jumat',
      jam: '09.00 - 11.30 WITA',
      lokasi: 'Ruang Konseling CDC UM Kendari / Daring via Zoom',
      kuotaPerHari: '3 Sesi / Hari',
      status: 'buka'
    }
  ],
  narasiWa: 'Ingin menjadwalkan sesi konseling karir atau mengajukan pertanyaan lebih lanjut? Silakan hubungi Admin Konseling Karir CDC UM Kendari melalui WhatsApp di bawah ini.',
  adminWaNumber: '6285299887766',
  adminWaDefaultMessage: 'Halo Admin CDC UM Kendari, saya ingin berkonsultasi mengenai Layanan Konseling Karir.'
};

export function getKonselingConfig(): KonselingConfig {
  const saved = localStorage.getItem('cdc_umk_konseling_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_KONSELING_CONFIG,
          ...parsed,
          infoItems: Array.isArray(parsed.infoItems) ? parsed.infoItems : DEFAULT_KONSELING_CONFIG.infoItems,
          jadwalItems: Array.isArray(parsed.jadwalItems) ? parsed.jadwalItems : DEFAULT_KONSELING_CONFIG.jadwalItems,
        };
      }
    } catch (e) {
      console.error('Error parsing konseling config:', e);
    }
  }
  return DEFAULT_KONSELING_CONFIG;
}

export function saveKonselingConfig(config: KonselingConfig): void {
  const updated = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('cdc_umk_konseling_config', JSON.stringify(updated));
}

/* =========================================================
 *  CDC UM KENDARI CLUB (card beranda + badge footer, 1 toggle)
 * =======================================================*/
export const DEFAULT_CDC_CLUB_CONFIG: CdcClubConfig = {
  id: 'cdc_club_config_default',
  published: true,
  title: 'CDC UM KENDARI CLUB',
  subtitle: 'Bergabunglah dengan komunitas alumni tangguh yang tersebar di seluruh nusantara.',
  buttonText: 'Gabung Komunitas',
  buttonUrl: 'https://umkendari.ac.id'
};

export function getCdcClubConfig(): CdcClubConfig {
  const saved = localStorage.getItem('cdc_umk_cdc_club_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_CDC_CLUB_CONFIG, ...parsed };
      }
    } catch (e) {
      console.error('Error parsing cdc club config:', e);
    }
  }
  return DEFAULT_CDC_CLUB_CONFIG;
}

export function saveCdcClubConfig(config: CdcClubConfig): void {
  const updated = { ...config, updatedAt: new Date().toISOString() } as CdcClubConfig & { updatedAt?: string };
  localStorage.setItem('cdc_umk_cdc_club_config', JSON.stringify(updated));
}

/* =========================================================
 *  VISI & MISI (config gambar beranda)
 * =======================================================*/
export const DEFAULT_VISI_MISI_CONFIG: VisiMisiConfig = {
  id: 'visi_misi_default',
  // Fallback ke aset publik bawaan kalau admin belum upload
  imageUrl: '/visi-misi-cdc.svg'
};

export function getVisiMisiConfig(): VisiMisiConfig {
  const saved = localStorage.getItem('cdc_umk_visi_misi_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && typeof parsed.imageUrl === 'string') {
        return { ...DEFAULT_VISI_MISI_CONFIG, ...parsed };
      }
    } catch (e) {
      console.error('Error parsing visi misi config:', e);
    }
  }
  return DEFAULT_VISI_MISI_CONFIG;
}

export function saveVisiMisiConfig(config: VisiMisiConfig): void {
  const updated = { ...config, updatedAt: new Date().toISOString() };
  localStorage.setItem('cdc_umk_visi_misi_config', JSON.stringify(updated));
}

export const DEFAULT_ANGGOTA_TIM: AnggotaTim[] = [
  {
    id: 'tim_1',
    nama: 'drh. Retno Murwanti, M.P., Ph.D.',
    jabatan: 'Kepala Kantor Alumni',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    urutan: 1
  },
  {
    id: 'tim_2',
    nama: 'Ariani Ratna Budiati, S.S., M.A.',
    jabatan: 'Ketua Tim Kerja Program & Hubungan Alumni',
    fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    urutan: 2
  },
  {
    id: 'tim_3',
    nama: 'Merryta Andriani, S.E., Akt.',
    jabatan: 'Ketua Tim Kerja Pengembangan Karier Lulusan',
    fotoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=600&auto=format&fit=crop',
    urutan: 3
  },
  {
    id: 'tim_4',
    nama: 'Nindi Mabruri Asnan, S.I.P., M.A.',
    jabatan: 'Pengelola Alumni',
    fotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop',
    urutan: 4
  },
  {
    id: 'tim_5',
    nama: 'Lusiawati Dewi Nurvitasari, S.Pd.',
    jabatan: 'Pengelola Alumni',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    urutan: 5
  },
  {
    id: 'tim_6',
    nama: 'Dewi Novyantari, S.Ant.',
    jabatan: 'Pengelola Alumni',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    urutan: 6
  },
  {
    id: 'tim_7',
    nama: 'Saputro Eko Rahmatulloh, S.Kom.',
    jabatan: 'Pengolah Layanan Teknologi Informasi dan Komputer',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    urutan: 7
  },
  {
    id: 'tim_8',
    nama: 'Ira Shavilla Sudjono',
    jabatan: 'Asisten Program',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    urutan: 8
  },
  {
    id: 'tim_9',
    nama: 'Shafna Puspita Prastya',
    jabatan: 'Asisten Program',
    fotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    urutan: 9
  },
  {
    id: 'tim_10',
    nama: 'Andreas Hanches Parlindungan S',
    jabatan: 'Asisten Program',
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
    urutan: 10
  },
  {
    id: 'tim_11',
    nama: 'Ni Luh Putu Swandewi',
    jabatan: 'Asisten Program',
    fotoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop',
    urutan: 11
  },
  {
    id: 'tim_12',
    nama: 'Ahmad Lutfi Alfajar',
    jabatan: 'Asisten Program',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    urutan: 12
  }
];

export function getAnggotaTim(): AnggotaTim[] {
  const saved = localStorage.getItem('cdc_umk_keanggotaan_tim');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing anggota tim:', e);
    }
  }
  return DEFAULT_ANGGOTA_TIM;
}

export function saveAnggotaTim(items: AnggotaTim[]): void {
  localStorage.setItem('cdc_umk_keanggotaan_tim', JSON.stringify(items));
}

// Default Seed Hero Slides Beranda Utama (6 Slide Banner Resmi UMK)
export const SEED_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'slide-1',
    title: 'Sambutan Rektor UM Kendari',
    imageUrl: '/sambutan_rektor_2MB_final.svg',
    targetUrl: '',
    alt: 'Sambutan Rektor UM Kendari - Slide 1',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-2',
    title: 'Perkenalan CDC UM Kendari',
    imageUrl: '/PERKENALAN.svg',
    targetUrl: '',
    alt: 'Perkenalan CDC UM Kendari - Slide 2',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-3',
    title: 'Kreativitas & Inovasi Mahasiswa',
    imageUrl: '/KREATIVITAS_DAN_INOVASI_900KB.svg',
    targetUrl: '',
    alt: 'Kreativitas & Inovasi - Slide 3',
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-4',
    title: 'Pengembangan Karir CDC',
    imageUrl: '/PENGEMBANGAN_KARIR_900KB.svg',
    targetUrl: '',
    alt: 'Pengembangan Karir CDC - Slide 4',
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-5',
    title: 'Tracer Study UM Kendari',
    imageUrl: '/TENTANG%20TRACER.svg',
    targetUrl: '',
    alt: 'Tracer Study UM Kendari - Slide 5',
    isActive: true,
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-6',
    title: 'Bimbingan & Konseling Karir',
    imageUrl: '/KONSELING%20KARIR.svg',
    targetUrl: 'konseling',
    alt: 'Bimbingan & Konseling Karir - Slide 6',
    isActive: true,
    order: 6,
    createdAt: new Date().toISOString()
  }
];

export function getHeroSlides(): HeroSlideItem[] {
  const saved = localStorage.getItem('cdc_umk_hero_slides_v5');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    } catch (e) {
      console.error('Error parsing hero slides:', e);
    }
  }
  // Migrate or initialize from latest SEED_HERO_SLIDES
  try {
    localStorage.setItem('cdc_umk_hero_slides_v5', JSON.stringify(SEED_HERO_SLIDES));
  } catch { }
  return SEED_HERO_SLIDES;
}

export function saveHeroSlides(slides: HeroSlideItem[]): void {
  localStorage.setItem('cdc_umk_hero_slides_v5', JSON.stringify(slides));
}

// Default Seeds for Campus Hiring
export const SEED_CAMPUS_HIRING: CampusHiringItem[] = [
  {
    id: 'ch_1',
    judul: 'On-Campus Recruitment & Direct Interview PT Bank Central Asia Tbk 2026',
    namaPerusahaan: 'PT Bank Central Asia Tbk (BCA)',
    logoPerusahaan: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/poster-cdc-web-umk-1.svg',
    tanggal: '2026-09-10',
    waktu: '08:30 - 15:00 WITA',
    lokasi: 'Aula Gedung Rektorat Lt. 2 Universitas Muhammadiyah Kendari',
    tipe: 'on-campus',
    persyaratan: [
      'Lulusan S1/D3 Semua Jurusan (IPK Min 3.00)',
      'Usia maksimal 25 tahun (S1) / 23 tahun (D3)',
      'Bersedia mengikuti proses seleksi offline di Kampus UM Kendari',
      'Membawa CV Terbaru, Pasfoto 4x6, Transkrip Nilai, FC Ijazah/SKL'
    ],
    posisiBuka: ['Management Development Program (MDP)', 'Frontliner & Customer Service Specialist', 'Account Officer Trainee'],
    kuota: 100,
    terdaftarCount: 42,
    deskripsi: 'Program rekrutmen terbuka langsung oleh Tim HRD BCA di Kampus UM Kendari. Peserta lolos tes tahap awal langsung diwawancarai di hari yang sama.',
    status: 'buka',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ch_2',
    judul: 'Virtual Campus Hiring & Talkshow Karir PT Indofood Sukses Makmur Tbk',
    namaPerusahaan: 'PT Indofood Sukses Makmur Tbk',
    logoPerusahaan: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/PENGEMBANGAN%20KARIR.svg',
    tanggal: '2026-09-18',
    waktu: '09:00 - 12:00 WITA',
    lokasi: 'Daring via Zoom Meeting (Tautan dikirim via Email H-1)',
    tipe: 'virtual',
    linkVirtual: 'https://zoom.us/j/example-indofood-umk',
    persyaratan: [
      'Mahasiswa Akhir / Alumni S1 Teknik, Pertanian, Ekonomi, & Sosial',
      'Memiliki kemampuan komunikasi & analisis yang baik',
      'Mengisi formulir pendaftaran daring CDC UMK'
    ],
    posisiBuka: ['Field Officer Supervisor', 'Quality Control Staff', 'Sales Executive Specialist'],
    kuota: 250,
    terdaftarCount: 115,
    deskripsi: 'Sesi presentasi korporat Indofood dilanjutkan dengan registrasi seleksi cepat calon karyawan baru khusus lulusan Sulawesi Tenggara.',
    status: 'buka',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ch_3',
    judul: 'On-Campus Recruitment & Walk-In Interview PT Telekomunikasi Indonesia (Telkom)',
    namaPerusahaan: 'PT Telekomunikasi Indonesia (Persero) Tbk',
    logoPerusahaan: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/PENGEMBANGAN%20KARIR.svg',
    tanggal: '2026-09-24',
    waktu: '08:00 - 14:00 WITA',
    lokasi: 'Gedung Serba Guna UM Kendari Lt. 1',
    tipe: 'on-campus',
    persyaratan: ['Lulusan D3/S1 Teknik, Informatika, & Manajemen (IPK Min 2.75)', 'Usia maksimal 26 tahun per 31 Desember 2026', 'Bersedia ditempatkan seluruh wilayah Indonesia'],
    posisiBuka: ['Network Engineer', 'Digital Business Officer', 'Customer Care Staff'],
    kuota: 150,
    terdaftarCount: 88,
    deskripsi: 'Rekrutmen langsung Telkom Group di kampus. Kandidat terpilih mengikuti wawancara on-the-spot bersama jajaran HRD Telkom Regional Sulawesi.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_4',
    judul: 'Hybrid Campus Hiring PT Bank Rakyat Indonesia (BRI) - BRImitra 2026',
    namaPerusahaan: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    logoPerusahaan: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/poster-cdc-web-umk-1.svg',
    tanggal: '2026-10-02',
    waktu: '09:00 - 15:30 WITA',
    lokasi: 'Aula Fakultas Ekonomi & Bisnis UM Kendari',
    tipe: 'on-campus',
    persyaratan: ['Lulusan S1 Semua Jurusan Non-Pendidikan Kesehatan (IPK Min 3.00)', 'Diutamakan yang menguasai bahasa daerah setempat', 'Bersedia ditempatkan di unit kerja wilayah Sulawesi Tenggara'],
    posisiBuka: ['Assistant Manager (AM)', 'Marketing Funding Officer (MFO)', 'Lending Officer (LO)'],
    kuota: 120,
    terdaftarCount: 64,
    deskripsi: 'Program rekrutmen BRI untuk posisi pelaksana dan manajerial junior. Seleksi administrasi dilakukan di tempat pada hari yang sama.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_5',
    judul: 'Virtual Job Matching & Interview PT Astra International Tbk',
    namaPerusahaan: 'PT Astra International Tbk',
    logoPerusahaan: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/PENGEMBANGAN%20KARIR.svg',
    tanggal: '2026-10-09',
    waktu: '13:00 - 16:00 WITA',
    lokasi: 'Daring via Zoom Meeting (Tautan dikirim via Email H-1)',
    tipe: 'virtual',
    linkVirtual: 'https://zoom.us/j/example-astra-umk',
    persyaratan: ['Mahasiswa tingkat akhir / fresh graduate S1 & D4 semua jurusan', 'IPK minimal 3.00 dan mahir berbahasa Inggris', 'Mengunggah CV dan transkrip pada formulir pendaftaran CDC UMK'],
    posisiBuka: ['Management Trainee (MT)', 'Dealer Development Program', 'Astra Financial Officer Program'],
    kuota: 200,
    terdaftarCount: 131,
    deskripsi: 'Sesi job matching bersama 5 business group Astra International, dilanjutkan interview ringan bagi kandidat yang memenuhi kriteria.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_6',
    judul: 'On-Campus Recruitment PT Pertamina (Persero) - Perekrutan Operator Baru',
    namaPerusahaan: 'PT Pertamina (Persero) Tbk',
    logoPerusahaan: 'https://images.unsplash.com/photo-1611270629569-8b357cb88da9?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/poster-cdc-web-umk-1.svg',
    tanggal: '2026-10-16',
    waktu: '08:00 - 12:00 WITA',
    lokasi: 'Ruang Seminar Teknik UM Kendari Lt. 2',
    tipe: 'on-campus',
    persyaratan: ['Lulusan D3/D4 Teknik (Semua Jurusan) dengan IPK min 2.75', 'Sehat jasmani & rohani, bersedia kerja shift', 'Membawa berkas lamaran lengkap sesuai ketentuan di poster'],
    posisiBuka: ['Operator Sistem Distribusi (OSD)', 'Operator Fuel Terminal'],
    kuota: 80,
    terdaftarCount: 57,
    deskripsi: 'Sosialisasi perekrutan operator baru Pertamina MOR VII Sulawesi, disertai pre-screening berkas langsung di tempat.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_7',
    judul: 'Career Talk & Direct Interview Bank Syariah Indonesia (BSI) 2026',
    namaPerusahaan: 'PT Bank Syariah Indonesia (Persero) Tbk',
    logoPerusahaan: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?q=80&w=400&auto=format&fit=crop',
    bannerUrl: '/PENGEMBANGAN%20KARIR.svg',
    tanggal: '2026-10-23',
    waktu: '08:30 - 14:00 WITA',
    lokasi: 'Aula Utama UM Kendari',
    tipe: 'on-campus',
    persyaratan: ['Lulusan S1 semua jurusan dengan IPK min 3.00', 'Memahami dasar-dasar perbankan syariah (diutamakan)', 'Siap mengikuti pendidikan BSO (Banking Syariah Officer)'],
    posisiBuka: ['Development Program (DP)', 'Frontliner Syariah', 'Funding & Service Officer'],
    kuota: 100,
    terdaftarCount: 45,
    deskripsi: 'Career talk inspiratif bersama leadership BSI dilanjutkan direct interview untuk program pengembangan SDM perbankan syariah.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  }
];

export function getCampusHiring(): CampusHiringItem[] {
  const saved = localStorage.getItem('cdc_umk_campus_hiring');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing campus hiring:', e);
    }
  }
  return SEED_CAMPUS_HIRING;
}

export function saveCampusHiring(items: CampusHiringItem[]): void {
  localStorage.setItem('cdc_umk_campus_hiring', JSON.stringify(items));
}

// Default Seeds for Job Fair & Career Expo
export const SEED_JOB_FAIR: JobFairItem[] = [
  {
    id: 'jf_1',
    judul: 'UMK Mega Career Expo & Job Fair Nasional 2026',
    tagline: 'Langkah Awal Karir Impianmu Dimulai dari Sini!',
    bannerUrl: '/poster-cdc-web-umk-2.svg',
    tanggalMulai: '2026-10-05',
    tanggalSelesai: '2026-10-07',
    waktu: '08:00 - 16:00 WITA Setiap Hari',
    lokasi: 'Auditorium Utama & Lapangan Indoor UM Kendari',
    htm: 'Gratis Khusus Mahasiswa & Alumni UM Kendari (Umum: Rp 10.000)',
    perusahaanPeserta: [
      { id: 'p1', nama: 'PT Bank Central Asia Tbk', bidang: 'Perbankan & Keuangan' },
      { id: 'p2', nama: 'PT Indofood Sukses Makmur Tbk', bidang: 'Manufaktur & FMCG' },
      { id: 'p3', nama: 'PT Telekomunikasi Indonesia (Telkom)', bidang: 'Teknologi & Komunikasi' },
      { id: 'p4', nama: 'PT Vale Indonesia Tbk', bidang: 'Pertambangan & Energi' },
      { id: 'p5', nama: 'PT Adaro Energy Indonesia Tbk', bidang: 'Energi & Konstruksi' },
      { id: 'p6', nama: 'PT Astra International Tbk', bidang: 'Otomotif & Distribusi' }
    ],
    deskripsi: 'Pameran Bursa Kerja terbesar Universitas Muhammadiyah Kendari yang menghadirkan 30+ Perusahaan BUMN, Swasta Nasional, dan Multinasional. Dilengkapi dengan Talkshow Karir, Klinik Review CV Gratis, dan Test Interview On-the-Spot.',
    status: 'buka',
    createdAt: new Date().toISOString()
  },
  {
    id: 'jf_2',
    judul: 'Job Fair Ramadan & Bursa Kerja Syariah UM Kendari 2026',
    tagline: 'Dapatkan Rejeki Halal di Bulan Suci',
    bannerUrl: '/poster-cdc-web-umk-2.svg',
    tanggalMulai: '2026-11-10',
    tanggalSelesai: '2026-11-11',
    waktu: '08:00 - 15:00 WITA',
    lokasi: 'Lapangan Indoor UM Kendari',
    htm: 'Gratis untuk Mahasiswa, Alumni, dan Umum',
    deskripsi: 'Job fair bertema syariah menghadirkan bank syariah, perusahaan halal industry, dan UMKM naik kelas. Dilengkapi kajian motivasi karir.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jf_3',
    judul: 'Sulawesi Tenggara Digital Talent Job Fair 2026',
    tagline: 'Menjadi Talenta Digital Kelas Dunia dari Bumi Anoa',
    bannerUrl: '/poster-cdc-web-umk-1.svg',
    tanggalMulai: '2026-11-25',
    tanggalSelesai: '2026-11-26',
    waktu: '09:00 - 16:00 WITA',
    lokasi: 'Auditorium KH. Ahmad Dahlan UM Kendari',
    htm: 'Gratis (Kuota Terbatas)',
    deskripsi: 'Job fair khusus talenta digital: startup, software house, dan perusahaan teknologi nasional. Ada sesi portfolio review dan tech talk.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jf_4',
    judul: 'BUMN Career Day & Job Fair Kendari 2026',
    tagline: 'Bergabunglah dengan Perusahaan Negara Terbaik',
    bannerUrl: '/PENGEMBANGAN%20KARIR.svg',
    tanggalMulai: '2026-12-08',
    tanggalSelesai: '2026-12-09',
    waktu: '08:00 - 16:00 WITA',
    lokasi: 'Gedung Serba Guna UM Kendari',
    htm: 'Rp 10.000 (Umum), Gratis Mahasiswa UMK',
    deskripsi: 'Menghadirkan 20+ BUMN dan anak usaha: Pertamina, Telkom, PLN, BRI, BTN, Jiwasraya, dan lainnya dengan stand rekrutmen aktif.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jf_5',
    judul: 'Green Jobs & Energy Career Expo UM Kendari',
    tagline: 'Karir Masa Depan di Industri Hijau',
    bannerUrl: '/poster-cdc-web-umk-2.svg',
    tanggalMulai: '2027-01-13',
    tanggalSelesai: '2027-01-14',
    waktu: '08:30 - 15:30 WITA',
    lokasi: 'Aula Fakultas Teknik UM Kendari',
    htm: 'Gratis Khusus Mahasiswa & Alumni',
    deskripsi: 'Expo karir industri energi terbarukan, pertambangan modern, dan kehutanan lestari bersama Vale, Adaro, dan mitra industri hijau lainnya.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jf_6',
    judul: 'Alumni Homecoming Job Fair UM Kendari 2027',
    tagline: 'Kembali ke Kampus, Bawa Karir Gemilang',
    bannerUrl: '/poster-cdc-web-umk-1.svg',
    tanggalMulai: '2027-02-05',
    tanggalSelesai: '2027-02-06',
    waktu: '08:00 - 16:00 WITA',
    lokasi: 'Halaman Utama & Auditorium UM Kendari',
    htm: 'Gratis untuk Seluruh Alumni UM Kendari',
    deskripsi: 'Job fair reuni alumni yang mempertemukan alumni berpengalaman dengan perusahaan pencari talenta senior dan middle management.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jf_7',
    judul: 'Job Fair & Creative Economy Expo Kendari 2027',
    tagline: 'Wujudkan Bisnismu, Raih Karir Terbaikmu',
    bannerUrl: '/PENGEMBANGAN%20KARIR.svg',
    tanggalMulai: '2027-03-10',
    tanggalSelesai: '2027-03-12',
    waktu: '09:00 - 17:00 WITA',
    lokasi: 'Plaza UM Kendari',
    htm: 'Gratis untuk Umum',
    deskripsi: 'Kolaborasi job fair dan expo ekonomi kreatif: 40+ booth perusahaan, 30 stand UMKM, lomba pitching bisnis, dan showcase mahasiswa.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jf_8',
    judul: 'UMK Hybrid Virtual Job Fair & Recruitment Day 2027',
    tagline: 'Melamar Kerja Mudah Langsung dari Rumah atau Kampus',
    bannerUrl: '/poster-cdc-web-umk-1.svg',
    tanggalMulai: '2027-04-15',
    tanggalSelesai: '2027-04-17',
    waktu: '08:00 - 17:00 WITA',
    lokasi: 'Platform Daring Portal CDC & Gedung Rektorat UMK',
    htm: 'Gratis Seluruh Peserta',
    deskripsi: 'Bursa kerja virtual hybrid terintegrasi dengan portal CDC UMK, memudahkan pelamar mengikuti seleksi online dari mana saja.',
    status: 'buka',
    createdAt: new Date().toISOString(),
  }
];

export function getJobFair(): JobFairItem[] {
  const saved = localStorage.getItem('cdc_umk_job_fair');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing job fair:', e);
    }
  }
  return SEED_JOB_FAIR;
}

export function saveJobFair(items: JobFairItem[]): void {
  localStorage.setItem('cdc_umk_job_fair', JSON.stringify(items));
}

// Document Section Database Helpers
export function getSuratKeputusan(): SuratKeputusan[] {
  const saved = localStorage.getItem('cdc_umk_surat_keputusan');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { }
  }
  return SEED_SURAT_KEPUTUSAN;
}

export function saveSuratKeputusan(items: SuratKeputusan[]): void {
  localStorage.setItem('cdc_umk_surat_keputusan', JSON.stringify(items));
}

export function getKalenderKegiatan(): KalenderKegiatan[] {
  const saved = localStorage.getItem('cdc_umk_kalender_kegiatan');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { }
  }
  return SEED_KALENDER_KEGIATAN;
}

export function saveKalenderKegiatan(items: KalenderKegiatan[]): void {
  localStorage.setItem('cdc_umk_kalender_kegiatan', JSON.stringify(items));
}

export function getLaporanKinerja(): LaporanKinerja[] {
  const saved = localStorage.getItem('cdc_umk_laporan_kinerja');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { }
  }
  return SEED_LAPORAN_KINERJA;
}

export function saveLaporanKinerja(items: LaporanKinerja[]): void {
  localStorage.setItem('cdc_umk_laporan_kinerja', JSON.stringify(items));
}

export function getMouStakeholder(): MouStakeholder[] {
  const saved = localStorage.getItem('cdc_umk_mou_stakeholder');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { }
  }
  return SEED_MOU_STAKEHOLDER;
}

export function saveMouStakeholder(items: MouStakeholder[]): void {
  localStorage.setItem('cdc_umk_mou_stakeholder', JSON.stringify(items));
}

export function getGaleriItems(): GaleriItem[] {
  const saved = localStorage.getItem('cdc_umk_galeri_items');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { }
  }
  return SEED_GALERI_ITEMS;
}

export function saveGaleriItems(items: GaleriItem[]): void {
  localStorage.setItem('cdc_umk_galeri_items', JSON.stringify(items));
}

/* ─────────────────────────────────────────────────────────────────
   STATISTIK BERANDA CONFIG HELPERS (Alumni & Mitra Perusahaan)
───────────────────────────────────────────────────────────────── */
export const DEFAULT_STATISTIK_CONFIG: StatistikConfig = {
  id: 'cfg_statistik',
  jumlahAlumni: '20.000+',
  jumlahMitra: '10',
  updatedAt: new Date().toISOString()
};

export function getStatistikConfig(): StatistikConfig {
  const saved = localStorage.getItem('cdc_umk_statistik_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.jumlahAlumni && parsed.jumlahMitra) {
        return parsed;
      }
    } catch { }
  }
  return DEFAULT_STATISTIK_CONFIG;
}

export function saveStatistikConfig(config: Partial<StatistikConfig>): StatistikConfig {
  const current = getStatistikConfig();
  const updated: StatistikConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('cdc_umk_statistik_config', JSON.stringify(updated));
  return updated;
}




