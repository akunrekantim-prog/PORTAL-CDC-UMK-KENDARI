import { useState, useEffect } from 'react';

export type Language = 'id' | 'en';

const STORAGE_KEY = 'cdc_language_preference';
const LANGUAGE_EVENT = 'cdc_language_change';

// Kamus terjemahan dwibahasa (Indonesian <-> English) untuk seluruh antarmuka publik
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  id: {
    // Header & Navigation
    'nav.beranda': 'Beranda',
    'nav.tentang': 'Tentang Kami',
    'nav.profil': 'Profil',
    'nav.visimisi': 'Visi – Misi',
    'nav.keanggotaan': 'Keanggotaan & Tim',
    'nav.skcdc': 'Surat Keputusan CDC',
    'nav.kalender': 'Kalender Kegiatan',
    'nav.laporan': 'Laporan Kinerja & Tracer Study',
    'nav.mou': 'MOU Dengan Stakeholder',
    'nav.galeri': 'Galeri',
    'nav.layanan': 'Layanan',
    'nav.berita': 'Berita & Artikel',
    'nav.konseling': 'Konseling Karir',
    'nav.tesminat': 'Tes Potensi Minat Kerja',
    'nav.workshop': 'Workshop Pengembangan Karir',
    'nav.softskill': 'Pelatihan Softskill & Kewirausahaan',
    'nav.seminar': 'Seminar Sukses Berkarir',
    'nav.jobfair': 'Job Fair',
    'nav.campushiring': 'Campus Hiring',
    'nav.magang': 'Internship / Magang',
    'nav.tracer': 'Tracer Study',
    'nav.tracerform': 'Form Kuesioner Tracer Study',
    'nav.simbelmawa': 'Simbelmawa',
    'nav.prestasi': 'Prestasi',
    'nav.internasional': 'Internasional',
    'nav.nasional': 'Nasional',
    'nav.wilayah': 'Wilayah',
    'nav.akademik': 'Akademik',
    'nav.nonakademik': 'Non-Akademik',
    'nav.olahraga': 'Olahraga',
    'nav.seni': 'Seni',
    'nav.register': 'Register',
    'nav.registeralumni': 'Register Mahasiswa / Alumni',
    'nav.registermitra': 'Register Perusahaan / Mitra',
    'nav.jobinfo': 'Job Info',
    'nav.lowonganterbaru': 'Lowongan Terbaru',
    'nav.login': 'Masuk Portal',
    'nav.adminpanel': 'Dashboard Admin',
    'nav.mitrapanel': 'Dashboard Mitra',

    // Top links
    'top.website': 'Website UM Kendari',

    // Sections & Titles
    'sec.joblistings': 'INFO KARIR CDC TERKINI',
    'sec.programpengumuman': 'PROGRAM & PENGUMUMAN TERBARU',
    'sec.beritahome': 'BERITA & ARTIKEL TERKINI',
    'sec.popularinfo': 'Popular Info',
    'sec.layanancepat': 'Layanan Cepat',
    'sec.pengumumanpenting': 'PENGUMUMAN SANGAT PENTING',
    'sec.perbesarposter': 'Perbesar Poster',
    'sec.bukatautan': 'Buka Tautan',
    'sec.statistik': 'Statistik Karir UM Kendari',
    'sec.mitraaktif': 'Perusahaan Mitra Aktif',
    'sec.alumni': 'Alumni Terdata',
    'sec.serapan': 'Tingkat Serapan Kerja',
    'sec.pengunjung': 'Pengunjung Web',
    'sec.lowongankerja': 'Lowongan Kerja & Magang',
    'sec.semuabagus': 'Temukan Peluang Karir Terbaik Anda',

    // Layanan Cepat
    'lc.konseling': 'Konseling Karir',
    'lc.campushiring': 'Campus Hiring - Recruitment',
    'lc.tesminat': 'Tes Potensi Minat Kerja',

    // Lowongan Search & Filters
    'job.searchplaceholder': 'Cari posisi, kata kunci, atau nama perusahaan...',
    'job.provinsi': 'Semua Provinsi',
    'job.tipe': 'Semua Tipe',
    'job.status': 'Semua Status',
    'job.urutkan': 'Terbaru',
    'job.fulltime': 'Penuh Waktu (Full Time)',
    'job.parttime': 'Paruh Waktu (Part Time)',
    'job.internship': 'Magang (Internship)',
    'job.freelance': 'Lepas (Freelance)',
    'job.kualifikasi': 'Kualifikasi & Persyaratan',
    'job.deskripsi': 'Deskripsi Pekerjaan',
    'job.caramelamar': 'Cara Melamar',
    'job.lamarsekarang': 'Lamar Sekarang',
    'job.bagikan': 'Bagikan Lowongan',
    'job.bataswaktu': 'Batas Akhir',
    'job.dipublikasikan': 'Dipublikasikan pada',
    'job.gaji': 'Kisaran Gaji',
    'job.pengalaman': 'Pengalaman Minimum',
    'job.pendidikan': 'Pendidikan Minimal',
    'job.tidakadadata': 'Tidak ada lowongan yang sesuai pencarian.',

    // Layanan Sub-pages
    'layanan.konselingtitle': 'Layanan Bimbingan & Konseling Karir',
    'layanan.konselingdesc': 'Konsultasikan perencanaan karir, bimbingan pembuatan CV, persiapan wawancara kerja, serta konsultasi karir pribadi bersama tim konselor profesional CDC UM Kendari.',
    'layanan.jadwal': 'Jadwal Konseling Operasional',
    'layanan.hubungiadmin': 'Hubungi Admin Konseling (WhatsApp)',
    'layanan.campushiringtitle': 'Program Campus Hiring & Rekrutmen Langsung',
    'layanan.campushiringdesc': 'Fasilitas rekrutmen langsung di kampus UM Kendari bekerja sama dengan perusahaan mitra nasional dan multinasional.',
    'layanan.jobfairtitle': 'Job Fair CDC UM Kendari',
    'layanan.jobfairdesc': 'Pameran bursa kerja tahunan yang menghadirkan puluhan perusahaan terbaik dari berbagai industri.',
    'layanan.magangtitle': 'Program Internship & Magang Mahasiswa',
    'layanan.magangdesc': 'Kesempatan magang bersertifikat industri untuk meningkatkan pengalaman kerja nyata mahasiswa.',
    'layanan.keanggotaantitle': 'Keanggotaan & Tim CDC UM Kendari',
    'layanan.keanggotaandesc': 'Struktur organisasi dan tim pengelola Pusat Pengembangan Karir Universitas Muhammadiyah Kendari.',

    // Common Buttons & Labels
    'btn.lihatdetail': 'Lihat Detail',
    'btn.daftarsekarang': 'Daftar Sekarang',
    'btn.kembali': 'Kembali',
    'btn.buka': 'Buka Tautan',
    'btn.simpan': 'Simpan',
    'btn.tutup': 'Tutup',
    'btn.search': 'Cari Lowongan',
    'btn.all': 'Semua',
    'btn.reset': 'Reset Filter',
    'btn.baca': 'Baca Selengkapnya',
    'btn.kirim': 'Kirim Pesan',

    // Footer
    'footer.tentang': 'Career Development Center (CDC) Universitas Muhammadiyah Kendari adalah unit pendampingan karir, pelacakan alumni (Tracer Study), serta penghubung kemitraan dunia kerja.',
    'footer.tautan': 'Tautan Cepat',
    'footer.layanan': 'Layanan Karir',
    'footer.kontak': 'Hubungi Kami',
    'footer.hakcipta': 'Hak Cipta Dilindungi Undang-Undang.',
    'footer.infoterkini': 'Info Terkini'
  },
  en: {
    // Header & Navigation
    'nav.beranda': 'Home',
    'nav.tentang': 'About Us',
    'nav.profil': 'Profile',
    'nav.visimisi': 'Vision & Mission',
    'nav.keanggotaan': 'Team & Membership',
    'nav.skcdc': 'CDC Decree',
    'nav.kalender': 'Event Calendar',
    'nav.laporan': 'Performance & Tracer Report',
    'nav.mou': 'Stakeholder MoU',
    'nav.galeri': 'Gallery',
    'nav.layanan': 'Services',
    'nav.berita': 'News & Articles',
    'nav.konseling': 'Career Counseling',
    'nav.tesminat': 'Career Assessment Test',
    'nav.workshop': 'Career Development Workshop',
    'nav.softskill': 'Softskills & Entrepreneurship',
    'nav.seminar': 'Career Success Seminar',
    'nav.jobfair': 'Job Fair',
    'nav.campushiring': 'Campus Hiring',
    'nav.magang': 'Internship',
    'nav.tracer': 'Tracer Study',
    'nav.tracerform': 'Tracer Questionnaire Form',
    'nav.simbelmawa': 'Simbelmawa',
    'nav.prestasi': 'Achievements',
    'nav.internasional': 'International',
    'nav.nasional': 'National',
    'nav.wilayah': 'Regional',
    'nav.akademik': 'Academic',
    'nav.nonakademik': 'Non-Academic',
    'nav.olahraga': 'Sports',
    'nav.seni': 'Arts',
    'nav.register': 'Register',
    'nav.registeralumni': 'Student / Alumni Registration',
    'nav.registermitra': 'Employer Registration',
    'nav.jobinfo': 'Job Info',
    'nav.lowonganterbaru': 'Latest Vacancies',
    'nav.login': 'Portal Login',
    'nav.adminpanel': 'Admin Dashboard',
    'nav.mitrapanel': 'Employer Dashboard',

    // Top links
    'top.website': 'UM Kendari Website',

    // Sections & Titles
    'sec.joblistings': 'LATEST CDC CAREER OPPORTUNITIES',
    'sec.programpengumuman': 'LATEST PROGRAMS & ANNOUNCEMENTS',
    'sec.beritahome': 'LATEST NEWS & ARTICLES',
    'sec.popularinfo': 'Popular Info',
    'sec.layanancepat': 'Quick Services',
    'sec.pengumumanpenting': 'IMPORTANT ANNOUNCEMENT',
    'sec.perbesarposter': 'Enlarge Poster',
    'sec.bukatautan': 'Open Link',
    'sec.statistik': 'UM Kendari Career Statistics',
    'sec.mitraaktif': 'Active Partner Employers',
    'sec.alumni': 'Registered Alumni',
    'sec.serapan': 'Employment Rate',
    'sec.pengunjung': 'Web Visitors',
    'sec.lowongankerja': 'Job Vacancies & Internships',
    'sec.semuabagus': 'Discover Your Best Career Opportunities',

    // Layanan Cepat
    'lc.konseling': 'Career Counseling',
    'lc.campushiring': 'Campus Hiring & Recruitment',
    'lc.tesminat': 'Career Assessment Test',

    // Lowongan Search & Filters
    'job.searchplaceholder': 'Search position, keyword, or company name...',
    'job.provinsi': 'All Provinces',
    'job.tipe': 'All Types',
    'job.status': 'All Statuses',
    'job.urutkan': 'Newest',
    'job.fulltime': 'Full Time',
    'job.parttime': 'Part Time',
    'job.internship': 'Internship',
    'job.freelance': 'Freelance',
    'job.kualifikasi': 'Qualifications & Requirements',
    'job.deskripsi': 'Job Description',
    'job.caramelamar': 'How to Apply',
    'job.lamarsekarang': 'Apply Now',
    'job.bagikan': 'Share Job',
    'job.bataswaktu': 'Deadline',
    'job.dipublikasikan': 'Published on',
    'job.gaji': 'Salary Range',
    'job.pengalaman': 'Minimum Experience',
    'job.pendidikan': 'Minimum Education',
    'job.tidakadadata': 'No job vacancies found matching your search.',

    // Layanan Sub-pages
    'layanan.konselingtitle': 'Career Guidance & Counseling Services',
    'layanan.konselingdesc': 'Consult your career planning, CV development, interview preparation, and personal career counseling with CDC UM Kendari professional team.',
    'layanan.jadwal': 'Operational Counseling Schedule',
    'layanan.hubungiadmin': 'Contact Counseling Admin (WhatsApp)',
    'layanan.campushiringtitle': 'Campus Hiring & Direct Recruitment',
    'layanan.campushiringdesc': 'Direct recruitment facilities at UM Kendari campus in collaboration with national and multinational employer partners.',
    'layanan.jobfairtitle': 'CDC UM Kendari Job Fair',
    'layanan.jobfairdesc': 'Annual career fair featuring dozens of top companies across various industries.',
    'layanan.magangtitle': 'Student Internship & Placement Program',
    'layanan.magangdesc': 'Certified industry internship opportunities to enhance students real-world work experience.',
    'layanan.keanggotaantitle': 'CDC UM Kendari Team & Membership',
    'layanan.keanggotaandesc': 'Organizational structure and management team of UM Kendari Career Development Center.',

    // Common Buttons & Labels
    'btn.lihatdetail': 'View Details',
    'btn.daftarsekarang': 'Apply Now',
    'btn.kembali': 'Back',
    'btn.buka': 'Open Link',
    'btn.simpan': 'Save',
    'btn.tutup': 'Close',
    'btn.search': 'Search Jobs',
    'btn.all': 'All',
    'btn.reset': 'Reset Filters',
    'btn.baca': 'Read More',
    'btn.kirim': 'Send Message',

    // Footer
    'footer.tentang': 'Career Development Center (CDC) UM Kendari is a unit dedicated to career counseling, tracer study alumni tracking, and industry employer partnerships.',
    'footer.tautan': 'Quick Links',
    'footer.layanan': 'Career Services',
    'footer.kontak': 'Contact Us',
    'footer.hakcipta': 'All Rights Reserved.',
    'footer.infoterkini': 'Latest Info'
  }
};

// Kamus terjemahan frasa & narasi dinamis buatan admin untuk mode Bahasa Inggris
const NARRATIVE_TRANSLATIONS: Record<string, string> = {
  // CDC Club Badge
  'TEMPAT BERKUMPULNYA MAHASISWA & ALUMNI UMK': 'THE GATHERING PLACE FOR UMK STUDENTS & ALUMNI',
  'KOMUNITAS KARIR & ALUMNI UM KENDARI': 'UM KENDARI CAREER & ALUMNI COMMUNITY',

  // Days & Schedule Status
  'Senin': 'Monday',
  'Selasa': 'Tuesday',
  'Rabu': 'Wednesday',
  'Kamis': 'Thursday',
  'Jumat': 'Friday',
  'Sabtu': 'Saturday',
  'Minggu': 'Sunday',
  'Senin - Jumat': 'Monday - Friday',
  'Senin s.d. Jumat': 'Monday to Friday',
  'Sesi Buka': 'Open Session',
  'Sesi Penuh': 'Full Session',
  'Sesi Tutup': 'Closed Session',
  'buka': 'open',
  'penuh': 'full',
  'tutup': 'closed',

  // Common Admin Phrases
  'Layanan Konseling Karir Sedang Dalam Penyusunan': 'Career Counseling Services Under Preparation',
  'Halaman ini masih berstatus Draft dan belum dipublikasikan oleh admin CDC UM Kendari.': 'This page is currently in Draft status and has not been published by CDC UM Kendari admin.',
  'Informasi visual resmi layanan bimbingan & konseling karir CDC UM Kendari': 'Official visual info for CDC UM Kendari career guidance & counseling services',
  'Penjelasan & Topik Konseling': 'Counseling Topics & Information',
  'Jadwal & Pelaksanaan': 'Schedule & Implementation',
  'Jadwal operasional tatap muka & daring untuk sesi konseling karir CDC UM Kendari': 'Face-to-face & online operational schedule for CDC UM Kendari career counseling sessions',
  'Konsultasi & Pendaftaran Konseling': 'Counseling Registration & Consultation',
  'Ingin menjadwalkan sesi konseling karir atau mengajukan pertanyaan lebih lanjut? Silakan hubungi Admin Konseling Karir CDC UM Kendari melalui WhatsApp.': 'Want to schedule a career counseling session or ask further questions? Please contact CDC UM Kendari Counseling Admin via WhatsApp.',
  'Gratis — pesan otomatis siap terisi saat WhatsApp terbuka': 'Free — automatic message ready when WhatsApp opens',
  'Hubungi Admin via WhatsApp': 'Contact Admin via WhatsApp',
  'Perbesar': 'Enlarge',
  'Hari': 'Day',
  'Waktu': 'Time',
  'Lokasi': 'Location',
  'Kuota': 'Quota',
  'Status': 'Status',
  'Poster & Pamflet': 'Poster & Pamphlet',

  // Surat Keputusan & MoU
  'Surat Keputusan (SK) CDC UM Kendari': 'CDC UM Kendari Decree (SK)',
  'Dokumen Resmi Pendirian & Pengangkatan Pengurus UPT Pusat Pengembangan Karir UM Kendari': 'Official Decree on Establishment & Management of UM Kendari Career Development Center',
  'MOU & Kerja Sama Stakeholder': 'MoU & Stakeholder Partnership',
  'Daftar Kemitraan Strategis Dunia Usaha, Dunia Industri (DUDI) dan Instansi Pemerintah': 'List of Strategic Partnerships with Businesses, Industries, and Government Agencies',
  'Laporan Kinerja & Tracer Study': 'Performance Report & Tracer Study',
  'Dokumen Laporan Kinerja Tahunan & Hasil Penelusuran Lulusan UMK': 'Annual Performance Report & Graduate Tracer Study Findings',
  'Kalender Kegiatan CDC': 'CDC Event Calendar',
  'Jadwal Agenda Pelatihan, Workshop, dan Job Fair Sepanjang Tahun': 'Year-Round Schedule for Training, Workshops, and Job Fairs',
  'Galeri Kegiatan': 'Event Gallery',
  'Dokumentasi Visual Kegiatan dan Program Kerja UPT CDC UM Kendari': 'Visual Documentation of UPT CDC UM Kendari Programs and Events'
};

/**
 * Mendapatkan bahasa aktif saat ini ('id' atau 'en')
 */
export function getLanguage(): Language {
  if (typeof localStorage === 'undefined') return 'id';
  const saved = localStorage.getItem(STORAGE_KEY) as Language;
  return saved === 'en' ? 'en' : 'id';
}

/**
 * Mengubah bahasa aktif dan mentrigger event perubahan
 */
export function setLanguage(lang: Language): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: lang }));
  }
}

/**
 * Custom Hook untuk komponen React agar merender ulang saat bahasa diubah
 */
export function useLanguage(): { 
  lang: Language; 
  setLang: (l: Language) => void; 
  t: (key: string, fallback?: string) => string;
  translateContent: (text: string | undefined | null, fallback?: string) => string;
} {
  const [lang, setLangState] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        setLangState(customEvent.detail);
      } else {
        setLangState(getLanguage());
      }
    };

    window.addEventListener(LANGUAGE_EVENT, handleLangChange);
    window.addEventListener('storage', handleLangChange);

    return () => {
      window.removeEventListener(LANGUAGE_EVENT, handleLangChange);
      window.removeEventListener('storage', handleLangChange);
    };
  }, []);

  const setLang = (newLang: Language) => {
    setLanguage(newLang);
    setLangState(newLang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    if (dict[key]) return dict[key];
    return fallback !== undefined ? fallback : key;
  };

  const translateContent = (text: string | undefined | null, fallback?: string): string => {
    if (!text) return fallback || '';
    if (lang === 'id') return text;

    // 1. Exact match in narrative dictionary
    const trimmed = text.trim();
    if (NARRATIVE_TRANSLATIONS[trimmed]) return NARRATIVE_TRANSLATIONS[trimmed];
    if (NARRATIVE_TRANSLATIONS[text]) return NARRATIVE_TRANSLATIONS[text];

    // 2. Partial phrase replacement
    let translated = text;
    Object.entries(NARRATIVE_TRANSLATIONS).forEach(([idPhrase, enPhrase]) => {
      if (translated.includes(idPhrase)) {
        translated = translated.split(idPhrase).join(enPhrase);
      }
    });

    return translated || fallback || text;
  };

  return { lang, setLang, t, translateContent };
}

/**
 * Helper terjemahan langsung tanpa hook
 */
export function t(key: string, fallback?: string): string {
  const currentLang = getLanguage();
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.id;
  if (dict[key]) return dict[key];
  return fallback !== undefined ? fallback : key;
}

export function translateContent(text: string | undefined | null, fallback?: string): string {
  if (!text) return fallback || '';
  const lang = getLanguage();
  if (lang === 'id') return text;

  const trimmed = text.trim();
  if (NARRATIVE_TRANSLATIONS[trimmed]) return NARRATIVE_TRANSLATIONS[trimmed];
  if (NARRATIVE_TRANSLATIONS[text]) return NARRATIVE_TRANSLATIONS[text];

  let translated = text;
  Object.entries(NARRATIVE_TRANSLATIONS).forEach(([idPhrase, enPhrase]) => {
    if (translated.includes(idPhrase)) {
      translated = translated.split(idPhrase).join(enPhrase);
    }
  });

  return translated || fallback || text;
}
