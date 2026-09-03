import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_' + Math.random().toString(36);

// Security: Helmet headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Header - Restricted to specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per IP
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  message: { error: 'Terlalu banyak request. Coba lagi nanti.' }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Healthcheck API
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', database: 'connected', userCount });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET /api/all-data - Agregat seluruh data live dari database Supabase PostgreSQL
// PROTECTED: Requires authentication, excludes sensitive fields
app.get('/api/all-data', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        photoUrl: true,
        createdAt: true,
        lastLoginAt: true
        // password EXCLUDED for security
      }
    });
    const mahasiswa = await prisma.mahasiswa.findMany();
    const alumni = await prisma.alumni.findMany();
    const mitra = await prisma.mitra.findMany();
    const lowongan = await prisma.lowongan.findMany({ orderBy: { createdAt: 'desc' } });
    const pengajuan_magang = await prisma.pengajuanMagang.findMany({ orderBy: { createdAt: 'desc' } });
    const tracer_studies = await prisma.tracerStudy.findMany();
    const konten_karir = await prisma.kontenKarir.findMany({ orderBy: { createdAt: 'desc' } });
    const berita = await prisma.berita.findMany({ orderBy: { createdAt: 'desc' } });
    const pengumuman = await prisma.pengumuman.findMany({ orderBy: { createdAt: 'desc' } });
    const surat_keputusan = await prisma.suratKeputusan.findMany();
    const kalender_kegiatan = await prisma.kalenderKegiatan.findMany();
    const laporan_kinerja = await prisma.laporanKinerja.findMany();
    const mou_stakeholder = await prisma.mouStakeholder.findMany();
    const galeri_items = await prisma.galeriItem.findMany();
    const hero_slides = await prisma.heroSlide.findMany({ orderBy: { urutan: 'asc' } });
    const visi_misi_configs = await prisma.visiMisiConfig.findMany();
    const anggota_tims = await prisma.anggotaTim.findMany({ orderBy: { urutan: 'asc' } });
    const social_media_items = await prisma.socialMediaItem.findMany();

    res.json({
      users,
      mahasiswa,
      alumni,
      mitra,
      lowongan,
      pengajuan_magang,
      tracer_studies,
      konten_karir,
      berita,
      pengumuman,
      surat_keputusan,
      kalender_kegiatan,
      laporan_kinerja,
      mou_stakeholder,
      galeri_items,
      hero_slides,
      visi_misi_configs,
      anggota_tims,
      social_media_items
    });
  } catch (error) {
    console.error('[Express API /all-data Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/login - Verifikasi Bcrypt Password Hash di Supabase PostgreSQL
// WITH rate limiting and JWT token generation
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Check account status BEFORE password verification (prevent timing attacks)
    if (user.status === 'PENDING') {
      return res.status(403).json({ success: false, message: 'Akun Anda masih ditinjau administrator.' });
    }

    if (user.status === 'INACTIVE' || user.status === 'REJECTED') {
      return res.status(403).json({ success: false, message: 'Akun dinonaktifkan atau ditolak.' });
    }

    // Password verification
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Password belum diset. Hubungi administrator.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token with 24 hour expiry
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data WITHOUT password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      success: true, 
      user: userWithoutPassword,
      token,
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (error) {
    console.error('[Express Login Error]:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server. Coba lagi.' });
  }
});

// GET all items from table
app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  try {
    const modelName = table.charAt(0).toLowerCase() + table.slice(1);
    if (prisma[modelName]) {
      const data = await prisma[modelName].findMany();
      return res.json(data);
    }
    const rawData = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
    res.json(rawData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / SYNC item directly to Supabase PostgreSQL table
app.post('/api/sync/:entity', async (req, res) => {
  const { entity } = req.params;
  const payload = req.body;

  try {
    if (entity === 'users' || entity === 'user') {
      let rawPassword = payload.password || 'password';
      let hashedPassword = rawPassword;
      if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
        hashedPassword = await bcrypt.hash(hashedPassword, 10);
      }

      const emailKey = (payload.email || '').toLowerCase();
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ id: payload.id }, { email: emailKey }] }
      });

      const userWhere = existingUser ? { id: existingUser.id } : { email: emailKey };

      const result = await prisma.user.upsert({
        where: userWhere,
        update: {
          name: payload.name,
          email: emailKey,
          password: hashedPassword,
          phone: payload.phone || null,
          role: (payload.role || 'MAHASISWA').toUpperCase(),
          status: (payload.status || 'PENDING').toUpperCase(),
          photoUrl: payload.photoUrl || null
        },
        create: {
          id: payload.id,
          name: payload.name,
          email: emailKey,
          password: hashedPassword,
          phone: payload.phone || null,
          role: (payload.role || 'MAHASISWA').toUpperCase(),
          status: (payload.status || 'PENDING').toUpperCase(),
          photoUrl: payload.photoUrl || null
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'mahasiswa') {
      const existingMhs = await prisma.mahasiswa.findFirst({
        where: { OR: [{ id: payload.id }, { nim: payload.nim }] }
      });
      const mhsWhere = existingMhs ? { id: existingMhs.id } : { id: payload.id };

      const result = await prisma.mahasiswa.upsert({
        where: mhsWhere,
        update: {
          nama: payload.nama,
          email: payload.email,
          phone: payload.phone || null,
          programStudi: payload.programStudi,
          fakultas: payload.fakultas,
          angkatan: payload.angkatan,
          semester: payload.semester || 1,
          alamat: payload.alamat || null,
          ipk: payload.ipk || null,
          skills: payload.skills || []
        },
        create: {
          id: payload.id,
          userId: payload.userId,
          nim: payload.nim,
          nama: payload.nama,
          email: payload.email,
          phone: payload.phone || null,
          programStudi: payload.programStudi,
          fakultas: payload.fakultas,
          angkatan: payload.angkatan,
          semester: payload.semester || 1,
          alamat: payload.alamat || null,
          ipk: payload.ipk || null,
          skills: payload.skills || []
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'alumni') {
      const existingAlumni = await prisma.alumni.findFirst({
        where: { OR: [{ id: payload.id }, { userId: payload.userId }] }
      });
      const alumniWhere = existingAlumni ? { id: existingAlumni.id } : { id: payload.id };

      const result = await prisma.alumni.upsert({
        where: alumniWhere,
        update: {
          nama: payload.nama,
          email: payload.email,
          programStudi: payload.programStudi,
          fakultas: payload.fakultas,
          tahunLulus: payload.tahunLulus,
          statusPekerjaan: payload.statusPekerjaan,
          instansiKerja: payload.instansiKerja || null,
          jabatan: payload.jabatan || null
        },
        create: {
          id: payload.id,
          userId: payload.userId,
          nim: payload.nim || null,
          nama: payload.nama,
          email: payload.email,
          phone: payload.phone || null,
          programStudi: payload.programStudi,
          fakultas: payload.fakultas,
          tahunLulus: payload.tahunLulus,
          statusPekerjaan: payload.statusPekerjaan,
          instansiKerja: payload.instansiKerja || null,
          jabatan: payload.jabatan || null
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'mitra') {
      const existingMitra = await prisma.mitra.findFirst({
        where: { OR: [{ id: payload.id }, { userId: payload.userId }] }
      });
      const mitraWhere = existingMitra ? { id: existingMitra.id } : { id: payload.id };

      const result = await prisma.mitra.upsert({
        where: mitraWhere,
        update: {
          namaInstansi: payload.namaInstansi,
          bidangIndustri: payload.bidangIndustri || null,
          alamat: payload.alamat || null,
          kontakPerson: payload.kontakPerson,
          email: payload.email,
          phone: payload.phone || null,
          website: payload.website || null,
          statusKerjaSama: (payload.statusKerjaSama || 'PENDING').toUpperCase()
        },
        create: {
          id: payload.id,
          userId: payload.userId,
          namaInstansi: payload.namaInstansi,
          bidangIndustri: payload.bidangIndustri || null,
          alamat: payload.alamat || null,
          kontakPerson: payload.kontakPerson,
          email: payload.email,
          phone: payload.phone || null,
          website: payload.website || null,
          statusKerjaSama: (payload.statusKerjaSama || 'PENDING').toUpperCase()
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'lowongan') {
      let validMitraId = null;
      if (payload.mitraId && payload.mitraId !== 'admin_cdc') {
        const m = await prisma.mitra.findFirst({
          where: { OR: [{ id: payload.mitraId }, { userId: payload.mitraId }] }
        });
        if (m) validMitraId = m.id;
      }

      const parsedDeadline = (payload.deadline && !isNaN(Date.parse(payload.deadline)))
        ? new Date(payload.deadline)
        : new Date();

      const result = await prisma.lowongan.upsert({
        where: { id: payload.id },
        update: {
          mitraId: validMitraId,
          judul: payload.judul,
          tipe: (payload.tipe || 'KERJA').toUpperCase(),
          namaInstansi: payload.namaInstansi,
          companyLogo: payload.companyLogo || null,
          bannerImage: payload.bannerImage || null,
          lokasi: payload.lokasi,
          deskripsi: payload.deskripsi || null,
          kualifikasi: Array.isArray(payload.kualifikasi) ? payload.kualifikasi : [],
          gaji: payload.gaji || null,
          benefit: Array.isArray(payload.benefit) ? payload.benefit : [],
          deadline: parsedDeadline,
          status: (payload.status || 'PUBLISHED').toUpperCase()
        },
        create: {
          id: payload.id,
          mitraId: validMitraId,
          createdBy: payload.createdBy || 'usr_admin',
          judul: payload.judul,
          tipe: (payload.tipe || 'KERJA').toUpperCase(),
          namaInstansi: payload.namaInstansi,
          companyLogo: payload.companyLogo || null,
          bannerImage: payload.bannerImage || null,
          lokasi: payload.lokasi,
          deskripsi: payload.deskripsi || null,
          kualifikasi: Array.isArray(payload.kualifikasi) ? payload.kualifikasi : [],
          gaji: payload.gaji || null,
          benefit: Array.isArray(payload.benefit) ? payload.benefit : [],
          deadline: parsedDeadline,
          status: (payload.status || 'PUBLISHED').toUpperCase()
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'pengajuan_magang') {
      const result = await prisma.pengajuanMagang.upsert({
        where: { id: payload.id },
        update: {
          status: (payload.status || 'SUBMITTED').toUpperCase(),
          catatanAdmin: payload.catatanAdmin || null,
          interviewStatus: payload.interviewStatus || null
        },
        create: {
          id: payload.id,
          mahasiswaId: payload.mahasiswaId,
          userId: payload.userId,
          lowonganId: payload.lowonganId || null,
          mitraId: payload.mitraId || null,
          namaInstansi: payload.namaInstansi || null,
          namaMahasiswa: payload.namaMahasiswa,
          nim: payload.nim,
          programStudi: payload.programStudi,
          tujuanMagang: payload.tujuanMagang,
          lokasiMagang: payload.lokasiMagang || null,
          catatan: payload.catatan || null,
          berkasUrl: payload.berkasUrl || null,
          berkasNama: payload.berkasNama || null,
          status: (payload.status || 'SUBMITTED').toUpperCase()
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'tracer_study' || entity === 'tracer_studies') {
      const result = await prisma.tracerStudy.upsert({
        where: { id: payload.id },
        update: {
          statusPekerjaan: payload.statusPekerjaan,
          namaInstansi: payload.namaInstansi || null,
          jabatan: payload.jabatan || null
        },
        create: {
          id: payload.id,
          mahasiswaId: payload.mahasiswaId || payload.userId,
          userId: payload.userId,
          nama: payload.nama,
          programStudi: payload.programStudi,
          tahunLulus: payload.tahunLulus,
          statusPekerjaan: payload.statusPekerjaan,
          masaTungguKerja: payload.masaTungguKerja || null,
          namaInstansi: payload.namaInstansi || null,
          jabatan: payload.jabatan || null,
          saranUntukKampus: payload.saranUntukKampus || null
        }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'konten_karir') {
      const result = await prisma.kontenKarir.upsert({
        where: { id: payload.id },
        update: {
          judul: payload.judul,
          body: payload.body || '',
          penulis: payload.penulis || null,
          status: payload.status || 'published',
          isPinned: payload.isPinned || false
        },
        create: {
          id: payload.id,
          jenis: payload.jenis || 'berita',
          judul: payload.judul,
          body: payload.body || '',
          penulis: payload.penulis || null,
          status: payload.status || 'published',
          isPinned: payload.isPinned || false
        }
      });
      return res.json({ success: true, result });
    }

    res.json({ success: true, message: `Entity ${entity} processed` });
  } catch (error) {
    console.error(`[Express Sync Error] ${entity}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Whitelist tabel yang boleh di-delete via API
const ALLOWED_DELETE_TABLES = new Set([
  'users', 'mahasiswas', 'alumnis', 'mitras', 'lowongans',
  'pengajuan_magangs', 'tracer_studies', 'konten_karirs',
  'beritas', 'pengumumans', 'galeri_items', 'kalender_kegiatans',
  'hero_slides', 'job_fair_events', 'job_fair_companies',
  'campus_hirings', 'mou_stakeholders', 'surat_keputusans',
  'laporan_kinerjas', 'anggota_tims', 'social_media_items',
  'survei_lulusans', 'mahasiswa_experiences',
  'mahasiswa_certificates', 'mahasiswa_qualifications',
  'uploaded_documents', 'komentar_beritas', 'konseling_configs',
  'visi_misi_configs'
]);

// DELETE item dari tabel (hanya tabel yang diizinkan)
app.delete('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    if (!ALLOWED_DELETE_TABLES.has(table)) {
      return res.status(400).json({ error: `Tabel '${table}' tidak diizinkan untuk DELETE.` });
    }
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ error: 'ID wajib diisi.' });
    }
    const escapedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const escapedId = id.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    await prisma.$queryRawUnsafe(
      `DELETE FROM "${escapedTable}" WHERE id = '${escapedId}'`
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Express API Backend running on http://localhost:${PORT}`);
});
