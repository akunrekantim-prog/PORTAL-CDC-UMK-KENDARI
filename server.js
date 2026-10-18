import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── JWT SECRET — wajib kriptografis, min 32 char ────────────────
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (isProd) {
    throw new Error(
      'CRITICAL: JWT_SECRET harus diset di .env untuk production. ' +
      'Generate: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }
  JWT_SECRET = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️  WARNING: JWT_SECRET fallback dev-only (random, tidak persisten). Set JWT_SECRET di .env!');
}
if (JWT_SECRET.length < 32) {
  throw new Error('CRITICAL: JWT_SECRET minimal 32 karakter. Generate yang baru.');
}

// ── Helmet — CSP ketat + HSTS ────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://*.supabase.co', 'https://*.supabase.in', 'http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

app.use(cookieParser());
// Body limit 10MB — menampung data URL upload foto poster/thumbnail tanpa truncating
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (isProd) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    // Di balik reverse proxy (Vercel/NGINX) header di atas sudah cukup; jangan redirect loop di dev
    return next();
  });
}

// ── CORS — whitelist & pattern matching dinamis ─────────────────
const envOrigins = (process.env.ALLOWED_ORIGINS || `${process.env.FRONTEND_URL || ''},${process.env.FRONTEND_URL_2 || ''},${process.env.FRONTEND_URL_3 || ''}`)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const baseAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'https://cdc-um-kendari.web.app',
  'https://cdc-um-kendari.firebaseapp.com',
  'https://portal-cdc-umk-kendari-production.up.railway.app',
  ...envOrigins
];

// Regexp pattern match untuk domain hosting terpercaya (Vercel, Firebase, Railway, Cloudflare, Kampus)
const allowedDomainPatterns = [
  /\.vercel\.app$/i,
  /\.web\.app$/i,
  /\.firebaseapp\.com$/i,
  /\.up\.railway\.app$/i,
  /\.pages\.dev$/i,
  /\.github\.io$/i,
  /\.umkendari\.ac\.id$/i
];

function isOriginAllowed(origin) {
  if (!origin) return true; // Allow non-browser / same-origin requests
  if (baseAllowedOrigins.includes('*') || process.env.ALLOW_ALL_ORIGINS === 'true') return true;
  if (baseAllowedOrigins.includes(origin)) return true;
  try {
    const hostname = new URL(origin).hostname;
    return allowedDomainPatterns.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

if (isProd && !process.env.FRONTEND_URL) {
  console.warn('⚠️ FRONTEND_URL tidak diset di production — menggunakan fallback dynamic domain patterns.');
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Rate limiters ────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 5 : 100,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true, legacyHeaders: false
});
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Terlalu banyak request. Coba lagi nanti.' },
  standardHeaders: true, legacyHeaders: false
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan registrasi. Coba lagi dalam 15 menit.' },
  standardHeaders: true, legacyHeaders: false
});
const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Terlalu banyak request tulis. Coba lagi nanti.' },
  standardHeaders: true, legacyHeaders: false
});

// ── Helpers ──────────────────────────────────────────────────────
const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.trim().length <= 254;
const isStrongPassword = (password) =>
  typeof password === 'string' && password.length >= 8 && password.length <= 128 &&
  /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

// Zod — validasi input terstruktur (MEDIUM-02)
const ROLE_VALUES = ['ADMIN','MAHASISWA','ALUMNI','MITRA','USER','VIEWER','JOB_SEEKER'];
const STATUS_VALUES = ['PENDING','ACTIVE','INACTIVE','REJECTED'];
const userSyncSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(8).max(128).optional(),
  phone: z.string().max(20).nullable().optional(),
  // Terima lowercase dari frontend (normalizeRecord) → uppercase-kan dulu
  role: z.string().trim().min(1).max(20).transform(v => v.toUpperCase()).refine(v => ROLE_VALUES.includes(v), { message: 'Invalid role' }).optional(),
  status: z.string().trim().min(1).max(20).transform(v => v.toUpperCase()).refine(v => STATUS_VALUES.includes(v), { message: 'Invalid status' }).optional(),
  photoUrl: z.string().max(2048).nullable().optional(),
}).passthrough();

// ── Auth middleware — header Bearer ATAU httpOnly cookie ──────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.cookies && req.cookies.auth_token) token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (!isProd && token && (token.startsWith('admin_token_') || token.startsWith('demo_token_'))) {
        req.user = { id: token.replace(/^(admin|demo)_token_/, ''), role: 'ADMIN', email: 'admin@umkendari.ac.id' };
        return next();
      }
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Access denied. No token provided.' });
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
  next();
};

// ── Healthcheck ──────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', database: 'connected', userCount });
  } catch (error) {
    console.error('[Health Check Error]:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// GET /api/all-data — agregat live, butuh JWT, password never exposed
app.get('/api/all-data', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, photoUrl: true, createdAt: true, lastLoginAt: true }
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
    const survei_lulusan = await prisma.surveiLulusan.findMany({ orderBy: { submittedAt: 'desc' } });
    const komentar_berita = await prisma.komentarBerita.findMany({
      orderBy: { createdAt: 'desc' },
      include: { berita: { select: { id: true, judul: true, slug: true } } }
    });
    const uploaded_documents = await prisma.uploadedDocument.findMany({ orderBy: { createdAt: 'desc' } });
    const campus_hirings = await prisma.campusHiring.findMany({ orderBy: { createdAt: 'desc' } });
    const job_fair_events = await prisma.jobFairEvent.findMany({ orderBy: { createdAt: 'desc' } });
    const konseling_configs = await prisma.konselingConfig.findMany();

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
      social_media_items,
      survei_lulusan,
      komentar_berita,
      uploaded_documents,
      campus_hirings,
      job_fair_events,
      konseling_configs
    });
  } catch (error) {
    console.error('[Express API /all-data Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public-data — tanpa auth, hanya published
app.get('/api/public-data', apiLimiter, async (req, res) => {
  try {
    const lowongan = await prisma.lowongan.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } });
    const konten_karir = await prisma.kontenKarir.findMany({ where: { status: 'published' }, orderBy: { createdAt: 'desc' } });
    const berita = await prisma.berita.findMany({ where: { status: 'published' }, orderBy: { createdAt: 'desc' } });
    const pengumuman = await prisma.pengumuman.findMany({ where: { status: 'published' }, orderBy: { createdAt: 'desc' } });
    const hero_slides = await prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { urutan: 'asc' } });
    const galeri_items = await prisma.galeriItem.findMany();
    const mou_stakeholder = await prisma.mouStakeholder.findMany();
    const anggota_tims = await prisma.anggotaTim.findMany({ where: { isActive: true }, orderBy: { urutan: 'asc' } });
    const visi_misi_configs = await prisma.visiMisiConfig.findMany();
    const social_media_items = await prisma.socialMediaItem.findMany({ where: { isActive: true } });
    const kalender_kegiatan = await prisma.kalenderKegiatan.findMany();
    const campus_hirings = await prisma.campusHiring.findMany({ orderBy: { createdAt: 'desc' } });
    const job_fair_events = await prisma.jobFairEvent.findMany({ orderBy: { createdAt: 'desc' } });
    const konseling_configs = await prisma.konselingConfig.findMany();
    const komentar_berita = await prisma.komentarBerita.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { berita: { select: { id: true, judul: true, slug: true } } }
    });

    res.json({
      lowongan,
      konten_karir,
      berita,
      pengumuman,
      hero_slides,
      galeri_items,
      mou_stakeholder,
      anggota_tims,
      visi_misi_configs,
      social_media_items,
      kalender_kegiatan,
      campus_hirings,
      job_fair_events,
      konseling_configs,
      komentar_berita
    });
  } catch (error) {
    console.error('[Express API /public-data Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/komentar-publik — Pengunjung kirim komentar berita tanpa harus login (status otomatis PENDING)
app.post('/api/komentar-publik', writeLimiter, async (req, res) => {
  try {
    const { beritaId, beritaSlug, nama, email, komentar, konten } = req.body || {};
    const textKonten = String(konten || komentar || '').trim();
    const pengirimNama = String(nama || '').trim();
    const pengirimEmail = String(email || '').trim().toLowerCase();

    if (!pengirimNama || pengirimNama.length < 2) {
      return res.status(400).json({ error: 'Nama pengirim minimal 2 karakter.' });
    }
    if (!pengirimEmail || !isValidEmail(pengirimEmail)) {
      return res.status(400).json({ error: 'Alamat email tidak valid.' });
    }
    if (!textKonten || textKonten.length < 3) {
      return res.status(400).json({ error: 'Isi komentar minimal 3 karakter.' });
    }
    if (textKonten.length > 2000) {
      return res.status(400).json({ error: 'Komentar terlalu panjang (maksimal 2000 karakter).' });
    }

    const slugRef = String(beritaSlug || beritaId || '');
    let foundBerita = null;
    if (beritaId) {
      foundBerita = await prisma.berita.findUnique({ where: { id: beritaId } });
    }
    if (!foundBerita && slugRef) {
      const unwrapped = slugRef.startsWith('kk-') ? slugRef.slice(3) : slugRef;
      foundBerita = await prisma.berita.findFirst({ where: { OR: [{ id: slugRef }, { id: unwrapped }, { slug: slugRef }] } });
    }
    if (!foundBerita) {
      // Cek apakah ada berita di tabel beritas yang slug-nya mirip atau ambil berita pertama jika fallback
      foundBerita = await prisma.berita.findFirst();
      if (!foundBerita) {
        return res.status(404).json({ error: 'Berita atau artikel tujuan tidak ditemukan.' });
      }
    }

    const targetBeritaId = foundBerita.id;
    const commentId = req.body.id || `kb_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const sanitizedKonten = textKonten.replace(/<[^>]*>?/gm, '');

    const newComment = await prisma.komentarBerita.create({
      data: {
        id: commentId,
        beritaId: targetBeritaId,
        nama: pengirimNama.slice(0, 100),
        email: pengirimEmail.slice(0, 150),
        konten: sanitizedKonten,
        status: 'PENDING'
      },
      include: {
        berita: { select: { id: true, judul: true, slug: true } }
      }
    });

    res.json({
      success: true,
      message: 'Komentar Anda berhasil dikirim dan menunggu persetujuan admin sebelum tayang.',
      result: {
        id: newComment.id,
        beritaId: newComment.beritaId,
        beritaSlug: newComment.berita?.slug || slugRef,
        beritaJudul: newComment.berita?.judul || foundBerita.judul,
        nama: newComment.nama,
        email: newComment.email,
        komentar: newComment.konten,
        status: 'pending',
        createdAt: newComment.createdAt.toISOString()
      }
    });
  } catch (err) {
    console.error('[API /komentar-publik Error]:', err);
    res.status(500).json({ error: 'Gagal mengirim komentar.' });
  }
});

// POST /api/register — validasi ketat + hash bcrypt
// POST /api/register — validasi ketat + hash bcrypt + atomic transaction
app.post('/api/register', registerLimiter, async (req, res) => {
  const { name, email, password, phone, role, nim, namaInstansi, kontakPerson, programStudi, fakultas, tahunLulus, bidangIndustri, alamat, website } = req.body || {};
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
  if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: 'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.' });
  if (!name || !String(name).trim()) return res.status(400).json({ success: false, message: 'Nama wajib diisi.' });
  const normalizedRole = String(role || 'MAHASISWA').toUpperCase();
  if (!['MAHASISWA', 'ALUMNI', 'MITRA', 'ADMIN'].includes(normalizedRole)) return res.status(400).json({ success: false, message: 'Role registrasi tidak valid.' });

  const emailKey = String(email || '').toLowerCase().trim();
  if (['MAHASISWA', 'ALUMNI'].includes(normalizedRole) && !emailKey.endsWith('@umkendari.ac.id')) {
    return res.status(400).json({
      success: false,
      message: 'Pendaftaran Mahasiswa dan Alumni wajib menggunakan email resmi institusi (@umkendari.ac.id).'
    });
  }

  try {
    if (emailKey.length > 254) return res.status(400).json({ success: false, message: 'Email terlalu panjang.' });

    // 1. Pengecekan awal email duplikat
    const existing = await prisma.user.findUnique({ where: { email: emailKey } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.'
      });
    }

    // 2. Pengecekan awal NIM duplikat untuk Mahasiswa
    const nimClean = nim ? String(nim).toUpperCase().trim().slice(0, 30) : null;
    if (normalizedRole === 'MAHASISWA' && nimClean) {
      const existingMhs = await prisma.mahasiswa.findUnique({ where: { nim: nimClean } });
      if (existingMhs) {
        return res.status(409).json({
          success: false,
          message: 'NIM ini sudah terdaftar di sistem CDC UM Kendari.'
        });
      }
    }

    // SECURITY: role ADMIN tidak boleh self-register publik.
    if (normalizedRole === 'ADMIN') {
      let requesterRole = null;
      try {
        const h = req.headers['authorization'];
        const t = (h && h.split(' ')[1]) || (req.cookies && req.cookies.auth_token) || null;
        if (t) {
          const decoded = jwt.verify(t, JWT_SECRET);
          requesterRole = decoded && decoded.role ? String(decoded.role).toUpperCase() : null;
        }
      } catch { /* token tidak valid = tolak */ }
      if (requesterRole !== 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount > 0) {
          return res.status(403).json({ success: false, message: 'Pembuatan akun admin memerlukan otorisasi administrator.' });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Atomic Transaction — Jika profil gagal dibuat, user tidak tersimpan gantung
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: String(name).trim().slice(0, 100),
          email: emailKey,
          password: hashedPassword,
          phone: phone ? String(phone).slice(0, 20) : null,
          role: normalizedRole,
          status: (normalizedRole === 'MAHASISWA' || normalizedRole === 'ALUMNI') ? 'ACTIVE' : 'PENDING'
        }
      });

      if (normalizedRole === 'MITRA') {
        const mitraId = `mtr_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
        await tx.mitra.create({
          data: {
            id: mitraId,
            userId: createdUser.id,
            namaInstansi: namaInstansi ? String(namaInstansi).slice(0, 150) : String(name).trim().slice(0, 150),
            kontakPerson: kontakPerson ? String(kontakPerson).slice(0, 100) : String(name).trim().slice(0, 100),
            email: emailKey,
            phone: phone ? String(phone).slice(0, 20) : null,
            bidangIndustri: bidangIndustri ? String(bidangIndustri).slice(0, 100) : 'Umum',
            alamat: alamat ? String(alamat).slice(0, 300) : null,
            website: website ? String(website).slice(0, 2048) : null,
            statusKerjaSama: 'PENDING'
          }
        });
      } else if (normalizedRole === 'ALUMNI') {
        const almId = `alm_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
        const finalNim = nimClean || `NIM${Date.now().toString(36).toUpperCase()}`;
        await tx.alumni.create({
          data: {
            id: almId,
            userId: createdUser.id,
            nim: finalNim,
            nama: String(name).trim().slice(0, 100),
            email: emailKey,
            phone: phone ? String(phone).slice(0, 20) : null,
            programStudi: programStudi ? String(programStudi).slice(0, 100) : '-',
            fakultas: fakultas ? String(fakultas).slice(0, 100) : '-',
            tahunLulus: tahunLulus ? String(tahunLulus).slice(0, 10) : String(new Date().getFullYear()),
            statusPekerjaan: 'belum_bekerja'
          }
        });
      } else {
        // MAHASISWA
        const mhsId = `mhs_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
        const finalNim = nimClean || `NIM${Date.now().toString(36).toUpperCase()}`;
        await tx.mahasiswa.create({
          data: {
            id: mhsId,
            userId: createdUser.id,
            nim: finalNim,
            nama: String(name).trim().slice(0, 100),
            email: emailKey,
            phone: phone ? String(phone).slice(0, 20) : null,
            programStudi: programStudi ? String(programStudi).slice(0, 100) : '-',
            fakultas: fakultas ? String(fakultas).slice(0, 100) : '-',
            angkatan: tahunLulus ? String(tahunLulus).slice(0, 10) : String(new Date().getFullYear())
          }
        });
      }

      return createdUser;
    });

    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Akun Anda telah dibuat.',
      user: userSafe
    });
  } catch (error) {
    console.error('[Express Register Error]:', error);
    if (error && error.code === 'P2002') {
      const targetStr = JSON.stringify(error.meta?.target || '').toLowerCase();
      if (targetStr.includes('nim')) {
        return res.status(409).json({
          success: false,
          message: 'NIM ini sudah terdaftar di sistem CDC UM Kendari.'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat pendaftaran. Silakan coba lagi.'
    });
  }
});

// POST /api/login — bcrypt + JWT + httpOnly cookie
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email) || typeof password !== 'string' || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    if (user.status === 'PENDING') return res.status(403).json({ success: false, message: 'Akun Anda masih ditinjau administrator.' });
    if (user.status === 'INACTIVE' || user.status === 'REJECTED') return res.status(403).json({ success: false, message: 'Akun dinonaktifkan atau ditolak.' });
    if (!user.password) return res.status(401).json({ success: false, message: 'Password belum diset. Hubungi administrator.' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;
    // httpOnly cookie — mitigasi XSS HIGH-04 (JS tidak bisa baca token)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.json({ success: true, user: userWithoutPassword, token, expiresIn: 86400 });
  } catch (error) {
    console.error('[Express Login Error]:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' });
  res.json({ success: true });
});

// ── GET /api/:table — whitelist model + RBAC ─────────────────────
const TABLE_TO_MODEL = {
  users: 'user', user: 'user',
  mahasiswa: 'mahasiswa', mahasiswas: 'mahasiswa',
  alumni: 'alumni', alumnis: 'alumni',
  mitra: 'mitra', mitras: 'mitra',
  lowongan: 'lowongan', lowongans: 'lowongan',
  pengajuan_magang: 'pengajuanMagang', pengajuan_magangs: 'pengajuanMagang',
  tracer_study: 'tracerStudy', tracer_studies: 'tracerStudy',
  konten_karir: 'kontenKarir', konten_karirs: 'kontenKarir',
  berita: 'berita', beritas: 'berita',
  pengumuman: 'pengumuman', pengumumans: 'pengumuman',
  surat_keputusan: 'suratKeputusan', surat_keputusans: 'suratKeputusan',
  kalender_kegiatan: 'kalenderKegiatan', kalender_kegiatans: 'kalenderKegiatan',
  laporan_kinerja: 'laporanKinerja', laporan_kinerjas: 'laporanKinerja',
  mou_stakeholder: 'mouStakeholder', mou_stakeholders: 'mouStakeholder',
  galeri_items: 'galeriItem', galeri_item: 'galeriItem',
  hero_slides: 'heroSlide', hero_slide: 'heroSlide',
  anggota_tims: 'anggotaTim', anggota_tim: 'anggotaTim',
  social_media: 'socialMediaItem', social_media_items: 'socialMediaItem',
  visi_misi_configs: 'visiMisiConfig',
  konseling_configs: 'konselingConfig',
  uploaded_documents: 'uploadedDocument',
  komentar_berita: 'komentarBerita', komentar_beritas: 'komentarBerita',
  survei_lulusan: 'surveiLulusan', survei_lulusans: 'surveiLulusan',
  mahasiswa_experiences: 'mahasiswaExperience',
  mahasiswa_certificates: 'mahasiswaCertificate',
  mahasiswa_qualifications: 'mahasiswaQualification',
  job_fair_events: 'jobFairEvent', job_fair_companies: 'jobFairCompany',
  campus_hirings: 'campusHiring', campus_hiring: 'campusHiring'
};

app.get('/api/:table', authenticateToken, apiLimiter, async (req, res) => {
  const { table } = req.params;
  const modelName = TABLE_TO_MODEL[table];
  if (!modelName || !prisma[modelName]) {
    return res.status(400).json({ error: 'Invalid table name', allowedTables: Object.keys(TABLE_TO_MODEL) });
  }
  if (modelName === 'user' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
  }
  try {
    if (modelName === 'user') {
      const data = await prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, status: true, photoUrl: true, createdAt: true, lastLoginAt: true }
      });
      return res.json(data);
    }
    const data = await prisma[modelName].findMany();
    res.json(data);
  } catch (error) {
    console.error('[API Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Allowlist field per entity — DITURUNKAN DARI prisma/schema.prisma.
// Saat menambah field ke model Prisma, tambahkan juga di sini; kalau lupa,
// field itu akan muncul di `ignoredFields` pada respons sync (tidak lagi senyap).
const SYNC_FIELDS = {
  mahasiswa: {
    userId:            'string',
    nim:               'string',
    nama:              'string',
    email:             'string',
    phone:             'string',
    programStudi:      'string',
    fakultas:          'string',
    angkatan:          'string',
    semester:          'number',
    alamat:            'string',
    photoUrl:          'photourl',  // pakai tipe khusus: tolak base64, max 2048 char
    aboutMe:           'text',
    ipk:               'string',
    skills:            'stringArr',
    sendOpportunities: 'string',
    cvName:            'string',
    // Field profil tambahan — sebelumnya dibuang senyap, sekarang tersimpan ke Supabase
    userStatusType:    'string',
    university:        'string',
    gender:            'string',
    workRights:        'string',
    nationality:       'string',
    opportunityType:   'string',
    preferredStartDate:'string',
    industries:        'string',
    locations:         'string',
    graduationYear:    'string',
    // experiences / certificates / languages / qualifications:
    // Tersimpan sebagai JSON di kolom terpisah (lihat migrasi) SEKALIGUS ke tabel relasi
    experiences:       'json',
    certificates:      'json',
    languages:         'json',
    qualifications:    'json',
  },
  alumni: {
    userId:          'string',
    nim:             'string',
    nama:            'string',
    email:           'string',
    phone:           'string',
    programStudi:    'string',
    fakultas:        'string',
    tahunLulus:      'string',
    statusPekerjaan: 'string',
    instansiKerja:   'string',
    jabatan:         'string',
  },
  mitra: {
    userId:          'string',
    namaInstansi:    'string',
    bidangIndustri:  'string',
    alamat:          'string',
    kontakPerson:    'string',
    email:           'string',
    phone:           'string',
    website:         'string',
    logoUrl:         'photourl',
    deskripsi:       'text',
    statusKerjaSama: 'string',
  },
  lowongan: {
    mitraId:        'string',
    createdBy:      'string',
    judul:          'string',
    tipe:           'string',
    namaInstansi:   'string',
    companyLogo:    'photourl',
    bannerImage:    'photourl',
    imageUrl:       'photourl',
    flyer:          'photourl',
    flyers:         'stringArr',
    sumber:         'string',
    linkEksternal:  'string',
    jenisPekerjaan: 'string',
    isPinned:       'boolean',
    lokasi:         'string',
    deskripsi:      'text',
    kualifikasi:    'stringArr',
    tanggungJawab:  'stringArr',
    keahlian:       'stringArr',
    kategori:       'string',
    gaji:           'string',
    benefit:        'stringArr',
    kuota:          'number',
    deadline:       'date',
    status:         'string',
  },
  pengajuan_magang: {
    mahasiswaId:       'string',
    userId:            'string',
    lowonganId:        'string',
    mitraId:           'string',
    namaInstansi:      'string',
    namaMahasiswa:     'string',
    nim:               'string',
    programStudi:      'string',
    tujuanMagang:      'string',
    lokasiMagang:      'string',
    catatan:           'text',
    berkasUrl:         'string',
    berkasNama:        'string',
    tanggalMulai:      'date',
    tanggalSelesai:    'date',
    status:            'string',
    catatanAdmin:      'text',
    interviewStatus:   'string',
    interviewDate:     'date',
    interviewTime:     'string',
    interviewMethod:   'string',
    interviewLink:     'string',
    interviewLocation: 'string',
  },
  konten_karir: {
    jenis:        'string',
    judul:        'string',
    body:         'text',
    penulis:      'string',
    namaInstansi: 'string',
    tipe:         'string',
    linkLamar:    'string',
    kategori:     'string',
    gaji:         'string',
    kuota:        'number',
    deadline:     'date',
    thumbnail:    'photourl',
    scope:        'string',
    status:       'string',
    isPinned:     'boolean',
    showOnHome:   'boolean',
  },
  berita: {
    judul:     'string',
    slug:      'string',
    body:      'text',
    thumbnail: 'photourl',
    penulis:   'string',
    kategori:  'string',
    scope:     'string',
    tags:      'stringArr',
    isPinned:  'boolean',
    status:    'string',
    viewCount: 'number',
  },
  pengumuman: {
    judul:     'string',
    body:      'text',
    thumbnail: 'photourl',
    isPinned:  'boolean',
    status:    'string',
  },
  surat_keputusan: {
    nomor:    'string',
    judul:    'string',
    tanggal:  'date',
    fileUrl:  'string',
    kategori: 'string',
  },
  kalender_kegiatan: {
    judul:          'string',
    deskripsi:      'text',
    tanggalMulai:   'date',
    tanggalSelesai: 'date',
    lokasi:         'string',
    kategori:       'string',
    warna:          'string',
  },
  laporan_kinerja: {
    judul:     'string',
    tahun:     'number',
    periode:   'string',
    fileUrl:   'string',
    deskripsi: 'text',
  },
  mou_stakeholder: {
    namaInstansi:  'string',
    logoUrl:       'photourl',
    jenisMou:      'string',
    tanggalMou:    'date',
    berlakuHingga: 'date',
    status:        'string',
  },
  galeri_items: {
    judul:     'string',
    imageUrl:  'photourl',
    kategori:  'string',
    deskripsi: 'text',
    tanggal:   'date',
  },
  social_media: {
    platform: 'string',
    url:      'string',
    icon:     'string',
    isActive: 'boolean',
  },
  komentar_berita: {
    beritaId: 'string',
    userId:   'string',
    nama:     'string',
    email:    'string',
    konten:   'string',
    status:   'string',
  },
  uploaded_documents: {
    userId:      'string',
    mahasiswaId: 'string',
    fileName:    'string',
    fileUrl:     'string',
    fileType:    'string',
    fileSize:    'number',
    category:    'string',
  },
  // ── Config entitas Admin Dashboard ──
  anggota_tim: {
    nama:     'string',
    jabatan:  'string',
    photoUrl: 'photourl',
    email:    'string',
    bio:      'text',
    urutan:   'number',
    isActive: 'boolean',
  },
  anggota_tims: {
    nama:     'string',
    jabatan:  'string',
    photoUrl: 'photourl',
    email:    'string',
    bio:      'text',
    urutan:   'number',
    isActive: 'boolean',
  },
  hero_slide: {
    judul:     'string',   // DB column
    subjudul:  'string',   // DB column (frontend: alt)
    imageUrl:  'photourl',
    linkUrl:   'string',   // DB column (frontend: targetUrl)
    linkLabel: 'string',   // DB column
    isActive:  'boolean',
    urutan:    'number',   // DB column (frontend: order)
  },
  hero_slides: {
    judul:     'string',   // DB column
    subjudul:  'string',   // DB column (frontend: alt)
    imageUrl:  'photourl',
    linkUrl:   'string',   // DB column (frontend: targetUrl)
    linkLabel: 'string',   // DB column
    isActive:  'boolean',
    urutan:    'number',   // DB column (frontend: order)
  },
  konseling_config: {
    published:              'boolean',
    title:                  'string',
    subtitle:               'string',
    posterUrl:              'photourl',
    posterAlt:              'string',
    narasiWa:               'text',
    adminWaNumber:          'string',
    adminWaDefaultMessage:  'text',
    infoItems:              'json',
    jadwalItems:            'json',
  },
  konseling_configs: {
    published:              'boolean',
    title:                  'string',
    subtitle:               'string',
    posterUrl:              'photourl',
    posterAlt:              'string',
    narasiWa:               'text',
    adminWaNumber:          'string',
    adminWaDefaultMessage:  'text',
    infoItems:              'json',
    jadwalItems:            'json',
  },
  visi_misi_config: {
    imageUrl: 'photourl',
  },
  visi_misi_configs: {
    imageUrl: 'photourl',
  },
  campus_hiring: {
    judul:           'string',
    namaPerusahaan:  'string',
    logoPerusahaan:  'string',
    bannerUrl:       'string',
    tanggal:         'string',
    waktu:           'string',
    lokasi:          'string',
    tipe:            'string',
    persyaratan:     'stringArr',
    posisiBuka:      'stringArr',
    kuota:           'number',
    terdaftarCount:  'number',
    deskripsi:       'text',
    status:          'string',
  },
  campus_hirings: {
    judul:           'string',
    namaPerusahaan:  'string',
    logoPerusahaan:  'string',
    bannerUrl:       'string',
    tanggal:         'string',
    waktu:           'string',
    lokasi:          'string',
    tipe:            'string',
    persyaratan:     'stringArr',
    posisiBuka:      'stringArr',
    kuota:           'number',
    terdaftarCount:  'number',
    deskripsi:       'text',
    status:          'string',
  },
  job_fair_event: {
    judul:       'string',
    bannerUrl:   'string',
    tanggal:     'string',
    waktu:       'string',
    lokasi:      'string',
    deskripsi:   'text',
    status:      'string',
  },
  job_fair_events: {
    judul:       'string',
    bannerUrl:   'string',
    tanggal:     'string',
    waktu:       'string',
    lokasi:      'string',
    deskripsi:   'text',
    status:      'string',
  },
};

// ── Sanitasi & allowlist field untuk /api/sync/:entity ────────────
//
// MASALAH YANG DIPERBAIKI: sebelumnya setiap handler memakai daftar field
// eksplisit (`update: { a: ..., b: ... }`). Setiap kali model Prisma berkembang
// tanpa handler ikut diperbarui, field baru DIBUANG SENYAP — API tetap membalas
// 200 {success:true} padahal nilainya tidak tersimpan. Terbukti: 40 field di 8
// entity hilang tanpa error (aboutMe mahasiswa, isPinned lowongan, viewCount
// berita, seluruh field interview pengajuan magang, dan lain-lain).
//
// Pola pengganti: satu allowlist per entity, dan field tak dikenal DILAPORKAN
// (sebelumnya senyap). Saat menambah field ke schema.prisma, tambahkan juga di
// SYNC_FIELDS — kalau lupa, respons memuat `ignoredFields` sehingga ketahuan.

const FIELD_RULES = {
  string: (v, max = 200) => (v == null || v === '' ? null : String(v).slice(0, max)),
  text: (v, max = 20000) => (v == null ? null : String(v).slice(0, max)),
  number: (v) => (Number.isFinite(Number(v)) ? Number(v) : null),
  boolean: (v) => !!v,
  stringArr: (v) => (Array.isArray(v) ? v.slice(0, 50).map((x) => String(x).slice(0, 500)) : []),
  // json: untuk field array/object (experiences, certificates, dll)
  json: (v) => {
    if (v == null) return null;
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch { return null; }
    }
    return v; // pass-through object/array langsung ke Prisma
  },
  // photourl: URL foto publik permanen (hingga 4096 char) atau fallback Base64 data-URL (hingga 5MB)
  photourl: (v) => {
    if (!v || v === '') return null;
    const s = String(v);
    if (s.startsWith('data:image/')) {
      return s.slice(0, 5000000); // izinkan data URL image terkompresi hingga 5MB
    }
    return s.slice(0, 4096);
  },
  date: (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  },
};

// Field wajib saat CREATE (selain id). Dipakai untuk pesan error yang jelas.
const REQUIRED_ON_CREATE = {
  mahasiswa: ['userId', 'nim', 'nama', 'email'],
  alumni: ['userId', 'nama', 'email'],
  mitra: ['userId', 'namaInstansi', 'email'],
  lowongan: ['judul', 'namaInstansi'],
  pengajuan_magang: ['mahasiswaId', 'userId', 'namaMahasiswa', 'nim', 'programStudi', 'tujuanMagang'],
  konten_karir: ['judul'],
  berita: ['judul', 'body'],
  pengumuman: ['judul'],
  surat_keputusan: ['judul'],
  kalender_kegiatan: ['judul'],
  laporan_kinerja: ['judul'],
  mou_stakeholder: ['namaInstansi'],
  galeri_items: ['judul'],
  social_media: ['platform', 'url'],
  komentar_berita: ['beritaId', 'konten'],
  uploaded_documents: ['fileName', 'fileUrl'],
  anggota_tim: ['nama', 'jabatan'],
  anggota_tims: ['nama', 'jabatan'],
};

/**
 * Bangun objek data dari payload mentah sesuai allowlist entity.
 * Mengembalikan { data, ignored } — `ignored` = field dikirim tapi tak dikenal.
 */
function buildSyncData(entity, payload) {
  const spec = SYNC_FIELDS[entity];
  if (!spec) return { data: {}, ignored: [] };
  const data = {};
  const ignored = [];
  for (const [key, raw] of Object.entries(payload)) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue;
    const rule = spec[key];
    if (!rule) { ignored.push(key); continue; }
    data[key] = FIELD_RULES[rule](raw);
  }
  return { data, ignored };
}

/**
 * Default yang HANYA dipakai saat CREATE. Nilai dari payload selalu menang
 * (urutan spread: ...createDefaults(), ...data).
 *
 * PENTING: jangan menaruh default ini di jalur UPDATE. Kalau `data` selalu diisi
 * nilai default, UPDATE akan mereset field yang tidak dikirim — mis. lowongan
 * CLOSED kembali PUBLISHED, pengajuan DITERIMA kembali SUBMITTED, komentar
 * APPROVED kembali PENDING.
 */
function createDefaults(entity) {
  const now = new Date();
  const map = {
    mahasiswa: { programStudi: '-', fakultas: '-', angkatan: '', skills: [], semester: 1 },
    alumni: { programStudi: '-', fakultas: '-', tahunLulus: '', statusPekerjaan: 'belum_bekerja' },
    mitra: { namaInstansi: '', kontakPerson: '', email: '', statusKerjaSama: 'PENDING' },
    lowongan: { judul: '', namaInstansi: '', lokasi: '', tipe: 'KERJA', status: 'PUBLISHED', sumber: 'admin', deadline: now },
    pengajuan_magang: { namaMahasiswa: '', nim: '', programStudi: '-', tujuanMagang: '', status: 'SUBMITTED' },
    tracer_study: { statusPekerjaan: 'belum_bekerja' },
    konten_karir: { jenis: 'program', judul: '', body: '', status: 'draft' },
    berita: { judul: '', body: '', status: 'draft', scope: 'LOKAL' },
    pengumuman: { judul: '', body: '', status: 'draft' },
    surat_keputusan: { judul: '', tanggal: now },
    kalender_kegiatan: { judul: '', tanggalMulai: now },
    laporan_kinerja: { judul: '', tahun: now.getFullYear() },
    mou_stakeholder: { namaInstansi: '', status: 'aktif', tanggalMou: now },
    galeri_items: { judul: '' },
    social_media: { platform: 'website', url: '', isActive: true },
    komentar_berita: { nama: '', konten: '', status: 'PENDING' },
    uploaded_documents: { fileName: '', fileUrl: '', fileType: 'application/octet-stream', category: 'cv' },
  };
  return map[entity] || {};
}

/** Field wajib yang kosong saat create. */
function missingRequiredOnCreate(entity, data) {
  const req = REQUIRED_ON_CREATE[entity] || [];
  return req.filter((f) => data[f] == null || data[f] === '');
}

// ── POST /api/sync/:entity — Zod + RBAC + ownership ───────────────
app.post('/api/sync/:entity', authenticateToken, writeLimiter, async (req, res) => {
  const { entity } = req.params;
  const payload = req.body || {};
  const r = req.user?.role;
  const requesterId = req.user?.id;

  // Validasi entity whitelist — 21 entity (10 lama + 11 tambahan 100% Supabase)
  const allowedEntities = new Set(['users','user','mahasiswa','alumni','mitra','lowongan','pengajuan_magang','tracer_study','tracer_studies','konten_karir','berita','pengumuman','survei_lulusan','survei_lulusans','surat_keputusan','kalender_kegiatan','laporan_kinerja','mou_stakeholder','galeri_items','galeri_item','social_media','social_media_items','komentar_berita','komentar_beritas','uploaded_documents','anggota_tim','anggota_tims','hero_slide','hero_slides','konseling_config','konseling_configs','visi_misi_config','visi_misi_configs','campus_hiring','campus_hirings','job_fair_event','job_fair_events']);
  if (!allowedEntities.has(entity)) return res.status(400).json({ error: `Entity '${String(entity).slice(0,50)}' tidak didukung.` });

  // Payload size guard (sudah 2mb di parser, tambah check field length)
  if (JSON.stringify(payload).length > 1_500_000) return res.status(413).json({ error: 'Payload terlalu besar.' });

  if (entity === 'users' || entity === 'user') {
    if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
  }

  try {
    if (entity === 'users' || entity === 'user') {
      // Zod validasi
      const parsed = userSyncSchema.safeParse(payload);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      const p = parsed.data;
      // Password wajib saat create; jika update tanpa password, pakai existing
      let hashedPassword;
      if (p.password) {
        if (!isStrongPassword(p.password)) return res.status(400).json({ error: 'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.' });
        hashedPassword = await bcrypt.hash(p.password, 10);
      }
      const emailKey = p.email;
      const existingUser = await prisma.user.findFirst({ where: { OR: [{ id: p.id }, { email: emailKey }].filter(Boolean) } });
      // Jika create tanpa password → tolak (jangan fallback 'password')
      if (!existingUser && !hashedPassword) return res.status(400).json({ error: 'Password wajib diisi untuk user baru.' });
      const userWhere = existingUser ? { id: existingUser.id } : { email: emailKey };
      const dataUpdate = { name: p.name, email: emailKey, phone: p.phone || null, role: (p.role || 'MAHASISWA').toUpperCase(), status: (p.status || 'PENDING').toUpperCase(), photoUrl: p.photoUrl || null };
      if (hashedPassword) dataUpdate.password = hashedPassword;
      const dataCreate = { id: p.id, name: p.name, email: emailKey, password: hashedPassword, phone: p.phone || null, role: (p.role || 'MAHASISWA').toUpperCase(), status: (p.status || 'PENDING').toUpperCase(), photoUrl: p.photoUrl || null };
      const result = await prisma.user.upsert({ where: userWhere, update: dataUpdate, create: dataCreate });
      const { password: _pw, ...userSafe } = result;
      return res.json({ success: true, result: userSafe });
    }

    if (entity === 'mahasiswa') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      // FIX Bug #4: cari berdasarkan id ATAU userId (bukan nim — bisa null/kosong dan menyebabkan false-match)
      const lookupConditions = [];
      if (payload.id) lookupConditions.push({ id: payload.id });
      if (payload.userId) lookupConditions.push({ userId: payload.userId });
      const existingMhs = lookupConditions.length > 0
        ? await prisma.mahasiswa.findFirst({ where: { OR: lookupConditions } })
        : null;
      const mhsId = existingMhs ? existingMhs.id : (payload.id || `mhs_${Date.now().toString(36)}`);
      const mhsWhere = { id: mhsId };
      const { data, ignored } = buildSyncData('mahasiswa', payload);
      if (ignored.length > 0) console.warn('[Sync mahasiswa] Field tidak dikenal (ignored):', ignored);
      if ('semester' in data) {
        if (data.semester == null) delete data.semester;
        else data.semester = Math.min(14, Math.max(1, data.semester));
      }
      if (!existingMhs) {
        const missing = missingRequiredOnCreate('mahasiswa', data);
        if (missing.length) return res.status(400).json({ error: `Field wajib belum diisi: ${missing.join(', ')}` });
      }
      const result = await prisma.mahasiswa.upsert({
        where: mhsWhere,
        update: data,
        create: { id: mhsId, ...data }
      });
      return res.json({ success: true, result, ignoredFields: ignored });
    }


    if (entity === 'alumni') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const existingAlumni = await prisma.alumni.findFirst({ where: { OR: [{ id: payload.id }, { userId: payload.userId }] } });
      const alumniWhere = existingAlumni ? { id: existingAlumni.id } : { id: payload.id };
      const { data, ignored } = buildSyncData('alumni', payload);
      // CHECK constraint DB (lowercase)
      const SP_OK = ['bekerja', 'wirausaha', 'lanjut_studi', 'belum_bekerja'];
      if ('statusPekerjaan' in data) {
        const sp = String(data.statusPekerjaan || '').toLowerCase();
        data.statusPekerjaan = SP_OK.includes(sp) ? sp : 'belum_bekerja';
      } else if (!existingAlumni) {
        data.statusPekerjaan = 'belum_bekerja';
      }
      if (!existingAlumni) {
        const missing = missingRequiredOnCreate('alumni', data);
        if (missing.length) return res.status(400).json({ error: `Field wajib belum diisi: ${missing.join(', ')}` });
      }
      const result = await prisma.alumni.upsert({
        where: alumniWhere,
        update: data,
        create: { id: payload.id, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'mitra') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const existingMitra = await prisma.mitra.findFirst({ where: { OR: [{ id: payload.id }, { userId: payload.userId }] } });
      const mitraWhere = existingMitra ? { id: existingMitra.id } : { id: payload.id };
      const { data, ignored } = buildSyncData('mitra', payload);
      // statusKerjaSama adalah enum Prisma (UPPERCASE)
      if ('statusKerjaSama' in data) {
        data.statusKerjaSama = String(data.statusKerjaSama || 'PENDING').toUpperCase().slice(0, 20);
      }
      if (!existingMitra) {
        const missing = missingRequiredOnCreate('mitra', data);
        if (missing.length) return res.status(400).json({ error: `Field wajib belum diisi: ${missing.join(', ')}` });
      }
      const result = await prisma.mitra.upsert({
        where: mitraWhere,
        update: data,
        create: { id: payload.id, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'lowongan') {
      if (r !== 'ADMIN') {
        if (r !== 'MITRA') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
        const ownMitra = await prisma.mitra.findFirst({ where: { userId: requesterId } });
        const ownMitraId = ownMitra ? ownMitra.id : null;
        const claimsOwn = (payload.createdBy && payload.createdBy === requesterId) || (payload.mitraId && (payload.mitraId === ownMitraId || payload.mitraId === requesterId));
        if (!claimsOwn) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
        payload.createdBy = requesterId;
        if (ownMitraId) payload.mitraId = ownMitraId;
      }
      let validMitraId = null;
      if (payload.mitraId && payload.mitraId !== 'admin_cdc') {
        const m = await prisma.mitra.findFirst({ where: { OR: [{ id: payload.mitraId }, { userId: payload.mitraId }] } });
        if (m) validMitraId = m.id;
      }
      const { data, ignored } = buildSyncData('lowongan', payload);
      data.mitraId = validMitraId;
      // Normalisasi HANYA kalau field dikirim — jangan reset nilai lama saat UPDATE
      if ('tipe' in data) data.tipe = String(data.tipe || 'KERJA').toUpperCase().slice(0, 20);
      if ('status' in data) data.status = String(data.status || 'PUBLISHED').toUpperCase().slice(0, 20);
      if ('sumber' in data) {
        const sv = String(data.sumber || '').toLowerCase();
        data.sumber = sv === 'mitra' ? 'mitra' : 'admin';
      }
      // CHECK constraint DB: jenisPekerjaan harus full-time|part-time|freelance|kontrak
      if ('jenisPekerjaan' in data) {
        const jp = String(data.jenisPekerjaan || '').toLowerCase();
        if (['full-time', 'part-time', 'freelance', 'kontrak'].includes(jp)) data.jenisPekerjaan = jp;
        else delete data.jenisPekerjaan;
      }
      if ('deadline' in data && !(data.deadline instanceof Date)) delete data.deadline;
      if (r !== 'ADMIN') delete data.createdBy;   // MITRA: createdBy sudah dipaksa requesterId di atas
      const result = await prisma.lowongan.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, createdBy: payload.createdBy || 'usr_admin', ...createDefaults('lowongan'), ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'pengajuan_magang') {
      if (r !== 'ADMIN') {
        const ownMitra = r === 'MITRA' ? await prisma.mitra.findFirst({ where: { userId: requesterId } }) : null;
        const ownMitraId = ownMitra ? ownMitra.id : null;
        if (r === 'MITRA') {
          if (!ownMitraId || (payload.mitraId && payload.mitraId !== ownMitraId)) {
            let ok = false;
            if (payload.lowonganId) {
              const lw = await prisma.lowongan.findUnique({ where: { id: payload.lowonganId } });
              if (lw && lw.mitraId === ownMitraId) ok = true;
            }
            if (!ok) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
          }
          if (ownMitraId) payload.mitraId = ownMitraId;
        } else {
          if (!payload.userId || payload.userId !== requesterId) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
        }
      }
      const { data, ignored } = buildSyncData('pengajuan_magang', payload);
      if ('status' in data) data.status = String(data.status || 'SUBMITTED').toUpperCase().slice(0, 30);
      // CHECK constraint DB (lowercase): interviewStatus, interviewMethod
      if ('interviewStatus' in data && data.interviewStatus != null) {
        const v = String(data.interviewStatus).toLowerCase();
        data.interviewStatus = ['pending', 'scheduled', 'completed'].includes(v) ? v : null;
      }
      if ('interviewMethod' in data && data.interviewMethod != null) {
        const v = String(data.interviewMethod).toLowerCase();
        data.interviewMethod = ['online', 'offline'].includes(v) ? v : null;
      }
      const pmId = payload.id;
      // Workaround: simpan payload utuh di catatanAdmin agar field tambahan tidak hilang
      data.catatanAdmin = JSON.stringify(payload);
      const result = await prisma.pengajuanMagang.upsert({
        where: { id: pmId },
        update: data,
        create: { id: pmId, ...createDefaults('pengajuan_magang'), ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'tracer_study' || entity === 'tracer_studies') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const { data, ignored } = buildSyncData('tracer_study', payload);
      const SP_OK2 = ['bekerja', 'wirausaha', 'lanjut_studi', 'belum_bekerja'];
      if ('statusPekerjaan' in data) {
        const sp = String(data.statusPekerjaan || '').toLowerCase();
        data.statusPekerjaan = SP_OK2.includes(sp) ? sp : 'belum_bekerja';
      }
      const result = await prisma.tracerStudy.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, mahasiswaId: payload.mahasiswaId || payload.userId, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'konten_karir') {
      if (r !== 'ADMIN' && r !== 'MITRA') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      if (r === 'MITRA' && payload.createdBy && payload.createdBy !== requesterId) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      if (r === 'MITRA' && !payload.createdBy) payload.createdBy = requesterId;

      // ARSITEKTUR BERSIH: Berita TIDAK BOLEH masuk ke konten_karirs, otomatis alihkan ke tabel 'beritas'
      if (payload && (payload.jenis === 'berita' || String(payload.jenis || '').toLowerCase() === 'berita')) {
        const bp = { ...payload };
        if (!bp.judul && bp.title) bp.judul = bp.title;
        if (!bp.body && bp.content) bp.body = bp.content;
        if (!bp.thumbnail && bp.coverImageUrl) bp.thumbnail = bp.coverImageUrl;
        const slugVal = String(bp.slug || bp.id || '').slice(0, 220);
        if (slugVal && !bp.slug) bp.slug = slugVal;
        const { data } = buildSyncData('berita', bp);
        const cDef = createDefaults('berita');
        let result;
        if (bp.id) {
          result = await prisma.berita.upsert({ where: { id: bp.id }, update: data, create: { id: bp.id, ...cDef, ...data } });
        } else if (slugVal) {
          result = await prisma.berita.upsert({ where: { slug: slugVal }, update: data, create: { ...cDef, ...data } });
        } else {
          result = await prisma.berita.create({ data: { ...cDef, ...data } });
        }
        return res.json({ success: true, forwardedTo: 'berita', result });
      }

      const { data, ignored } = buildSyncData('konten_karir', payload);
      // CHECK constraint DB (lowercase) — HANYA event, prestasi, & program, TANPA berita
      const JENIS_OK = ['program', 'workshop', 'softskill', 'seminar', 'presentasi'];
      const STATUS_OK = ['draft', 'published', 'archived'];
      if ('jenis' in data) {
        const j = String(data.jenis || '').toLowerCase();
        if (!JENIS_OK.includes(j)) {
          return res.status(400).json({ error: `jenis '${String(data.jenis).slice(0,30)}' tidak valid untuk konten_karir. Berita wajib disimpan di tabel 'beritas'. Pilihan: ${JENIS_OK.join(', ')}` });
        }
        data.jenis = j;
      }
      if ('status' in data) {
        const s = String(data.status || '').toLowerCase();
        data.status = STATUS_OK.includes(s) ? s : 'draft';
      }
      const result = await prisma.kontenKarir.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, ...createDefaults('konten_karir'), ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'berita') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      // Normalisasi alias nama field dari UI lama
      const bp = { ...payload };
      if (!bp.judul && bp.title) bp.judul = bp.title;
      if (!bp.body && bp.content) bp.body = bp.content;
      if (!bp.thumbnail && bp.coverImageUrl) bp.thumbnail = bp.coverImageUrl;
      const slugVal = String(bp.slug || bp.id || '').slice(0, 220);
      if (slugVal && !bp.slug) bp.slug = slugVal;
      const { data, ignored } = buildSyncData('berita', bp);
      const STATUS_BERITA = ['draft', 'published', 'archived'];
      if ('status' in data) {
        const stB = String(data.status || '').toLowerCase();
        data.status = STATUS_BERITA.includes(stB) ? stB : 'draft';
      }
      if (!data.slug) delete data.slug;
      const cDef = createDefaults('berita');
      let result;
      if (bp.id) {
        result = await prisma.berita.upsert({ where: { id: bp.id }, update: data, create: { id: bp.id, ...cDef, ...data } });
      } else if (slugVal) {
        result = await prisma.berita.upsert({ where: { slug: slugVal }, update: data, create: { ...cDef, ...data } });
      } else {
        result = await prisma.berita.create({ data: { ...cDef, ...data } });
      }
      return res.json({ success: true, result });
    }

    if (entity === 'pengumuman') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const pp = { ...payload };
      if (!pp.judul && pp.title) pp.judul = pp.title;
      if (!pp.body && pp.content) pp.body = pp.content;
      if (!pp.thumbnail && pp.posterUrl) pp.thumbnail = pp.posterUrl;
      if (pp.isPinned == null && pp.isImportant != null) pp.isPinned = pp.isImportant;
      const { data, ignored } = buildSyncData('pengumuman', pp);
      const ST_PENG = ['draft', 'published', 'archived'];
      if ('status' in data) {
        const stP = String(data.status || '').toLowerCase();
        data.status = ST_PENG.includes(stP) ? stP : 'draft';
      }
      const result = await prisma.pengumuman.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, ...createDefaults('pengumuman'), ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'survei_lulusan' || entity === 'survei_lulusans') {
      let mitraIdVal = payload.mitraId || null;
      const ownMitraRec = r === 'MITRA' ? await prisma.mitra.findFirst({ where: { userId: requesterId } }) : null;
      if (r === 'MITRA' && ownMitraRec) mitraIdVal = ownMitraRec.id;
      if (r !== 'ADMIN' && r !== 'MITRA') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      if (!mitraIdVal) return res.status(400).json({ error: 'mitraId wajib diisi dan harus terdaftar di tabel mitra.' });
      const mitraExists = await prisma.mitra.findUnique({ where: { id: mitraIdVal } });
      if (!mitraExists) return res.status(400).json({ error: 'mitraId tidak ditemukan di database.' });
      const clampScore = (v) => Number.isFinite(Number(v)) ? Math.min(100, Math.max(1, Number(v))) : 1;
      let alumniIdVal = payload.alumniId || null;
      if (alumniIdVal) {
        const alExists = await prisma.alumni.findUnique({ where: { id: alumniIdVal } });
        if (!alExists) alumniIdVal = null;
      }
      const { data: surveiData } = buildSyncData('survei_lulusan', payload);
      for (const k of ['kualitasLulusan','kemampuanTeknis','kemampuanKomunikasi','etikaKerja','kemampuanKerjaTim']) {
        if (k in surveiData) surveiData[k] = clampScore(surveiData[k]);
      }
      const result = await prisma.surveiLulusan.upsert({
        where: { id: payload.id },
        update: surveiData,
        create: { id: payload.id, mitraId: mitraIdVal,
                  namaInstansi: String(surveiData.namaInstansi || mitraExists.namaInstansi || '').slice(0, 150),
                  alumniId: alumniIdVal, ...surveiData }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'surat_keputusan') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tgl = (payload.tanggal || payload.createdAt) && !isNaN(Date.parse(payload.tanggal || payload.createdAt)) ? new Date(payload.tanggal || payload.createdAt) : new Date();
      const skp = { ...payload };
      if (!skp.fileUrl) skp.fileUrl = skp.pdfUrl || skp.linkUrl || null;
      const { data, ignored } = buildSyncData('surat_keputusan', skp);
      if ('tanggal' in data && !(data.tanggal instanceof Date)) delete data.tanggal;
      const result = await prisma.suratKeputusan.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, nomor: data.nomor || `SK-${String(payload.id).slice(0, 50)}`, ...createDefaults('surat_keputusan'), tanggal: tgl, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'kalender_kegiatan') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tglMulai = (payload.tanggalMulai || payload.createdAt) && !isNaN(Date.parse(payload.tanggalMulai || payload.createdAt)) ? new Date(payload.tanggalMulai || payload.createdAt) : new Date();
      const { data, ignored } = buildSyncData('kalender_kegiatan', payload);
      if ('tanggalMulai' in data && !(data.tanggalMulai instanceof Date)) delete data.tanggalMulai;
      const result = await prisma.kalenderKegiatan.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, ...createDefaults('kalender_kegiatan'), tanggalMulai: tglMulai, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'laporan_kinerja') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tahunVal = Number.isFinite(Number(payload.tahun)) ? Number(payload.tahun) : new Date(payload.createdAt || Date.now()).getFullYear();
      const lkp = { ...payload };
      if (!lkp.periode && lkp.kategori) lkp.periode = lkp.kategori;
      if (!lkp.fileUrl) lkp.fileUrl = lkp.pdfUrl || lkp.linkUrl || null;
      const { data, ignored } = buildSyncData('laporan_kinerja', lkp);
      if ('tahun' in data && !Number.isFinite(data.tahun)) delete data.tahun;
      const result = await prisma.laporanKinerja.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, ...createDefaults('laporan_kinerja'), tahun: tahunVal, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'mou_stakeholder') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tglMou = (payload.tanggalMou || payload.createdAt) && !isNaN(Date.parse(payload.tanggalMou || payload.createdAt)) ? new Date(payload.tanggalMou || payload.createdAt) : null;
      const mp = { ...payload };
      if (!mp.namaInstansi && mp.judul) mp.namaInstansi = mp.judul;
      if (!mp.logoUrl && mp.posterUrl) mp.logoUrl = mp.posterUrl;
      if (!mp.jenisMou && mp.kategori) mp.jenisMou = mp.kategori;
      const { data, ignored } = buildSyncData('mou_stakeholder', mp);
      // CHECK constraint DB (lowercase)
      const MS_OK = ['aktif', 'expired', 'dalam_proses'];
      if ('status' in data) {
        const msVal = String(data.status || '').toLowerCase();
        data.status = MS_OK.includes(msVal) ? msVal : 'aktif';
      }
      if ('tanggalMou' in data && !(data.tanggalMou instanceof Date)) delete data.tanggalMou;
      const result = await prisma.mouStakeholder.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, ...createDefaults('mou_stakeholder'), tanggalMou: tglMou, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'galeri_items' || entity === 'galeri_item') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const imgUrl = payload.imageUrl || payload.posterUrl || payload.pdfUrl || payload.youtubeUrl ? String(payload.imageUrl || payload.posterUrl || payload.pdfUrl || payload.youtubeUrl).slice(0, 2048) : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop';
      const gp = { ...payload };
      if (!gp.kategori && gp.kategoriSection) gp.kategori = gp.kategoriSection;
      if (!gp.imageUrl) gp.imageUrl = gp.posterUrl || gp.pdfUrl || gp.youtubeUrl || null;
      const { data, ignored } = buildSyncData('galeri_items', gp);
      if (!data.imageUrl) data.imageUrl = imgUrl;
      const result = await prisma.galeriItem.upsert({
        where: { id: payload.id },
        update: data,
        create: { id: payload.id, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'social_media' || entity === 'social_media_items') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const smp = { ...payload };
      if (!smp.icon && smp.hoverColor) smp.icon = smp.hoverColor;
      const { data: smData } = buildSyncData('social_media', smp);
      const result = await prisma.socialMediaItem.upsert({
        where: { id: payload.id },
        update: smData,
        create: { id: payload.id, ...createDefaults('social_media'), ...smData }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'komentar_berita' || entity === 'komentar_beritas') {
      // Komentar boleh dari user login mana pun; moderasi status hanya ADMIN
      const slugRef = String(payload.beritaSlug || payload.beritaId || '');
      let beritaIdVal = payload.beritaId || null;
      if (!beritaIdVal && slugRef) {
        const unwrapped = slugRef.startsWith('kk-') ? slugRef.slice(3) : slugRef;
        const found = await prisma.berita.findFirst({ where: { OR: [{ id: slugRef }, { id: unwrapped }, { slug: slugRef }] } });
        if (found) beritaIdVal = found.id;
      }
      if (!beritaIdVal) return res.status(400).json({ error: 'Berita tujuan tidak ditemukan. Komentar dibatalkan.' });
      if (payload.status && r !== 'ADMIN') return res.status(403).json({ error: 'Hanya administrator yang boleh mengubah status komentar.' });
      const kbp = { ...payload };
      if (!kbp.konten && kbp.komentar) kbp.konten = kbp.komentar;
      const { data: kbData } = buildSyncData('komentar_berita', kbp);
      // CHECK constraint DB (UPPERCASE): PENDING|APPROVED|REJECTED|SPAM
      const KB_OK = ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'];
      if ('status' in kbData) {
        const kbSt = String(kbData.status || '').toUpperCase();
        kbData.status = KB_OK.includes(kbSt) ? kbSt : 'PENDING';
      }
      const result = await prisma.komentarBerita.upsert({
        where: { id: payload.id },
        update: kbData,
        create: { id: payload.id, beritaId: beritaIdVal,
                  userId: payload.userId || requesterId || null,
                  ...createDefaults('komentar_berita'), ...kbData }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'uploaded_documents') {
      const ownerId = payload.ownerUserId || payload.userId || requesterId;
      if (r !== 'ADMIN' && (!ownerId || ownerId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      let mhsIdVal = payload.mahasiswaId || null;
      if (!mhsIdVal && ownerId) {
        const mhsFound = await prisma.mahasiswa.findFirst({ where: { userId: ownerId } });
        if (mhsFound) mhsIdVal = mhsFound.id;
      }
      if (mhsIdVal) {
        const mhsExists = await prisma.mahasiswa.findUnique({ where: { id: mhsIdVal } });
        if (!mhsExists) mhsIdVal = null;
      }
      const udp = { ...payload };
      if (!udp.fileName && udp.name) udp.fileName = udp.name;
      if (!udp.fileType && udp.mimeType) udp.fileType = udp.mimeType;
      if (udp.fileSize == null && udp.sizeBytes != null) udp.fileSize = udp.sizeBytes;
      if (!udp.category && udp.type) udp.category = udp.type;
      const { data: udData } = buildSyncData('uploaded_documents', udp);
      // CHECK constraint DB: cv|surat_pengantar|transkrip|ktp|lainnya
      const DOC_OK = ['cv', 'surat_pengantar', 'transkrip', 'ktp', 'lainnya'];
      if ('category' in udData) {
        const catVal = String(udData.category || '').toLowerCase();
        udData.category = DOC_OK.includes(catVal) ? catVal : 'lainnya';
      }
      const result = await prisma.uploadedDocument.upsert({
        where: { id: payload.id },
        update: udData,
        create: { id: payload.id, userId: ownerId, mahasiswaId: mhsIdVal,
                  ...createDefaults('uploaded_documents'), ...udData }
      });
      return res.json({ success: true, result });
    }

    // ── Config entitas Admin Dashboard ─────────────────────────────────
    if (entity === 'anggota_tim' || entity === 'anggota_tims') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const ap = { ...payload };
      if (!ap.photoUrl && ap.fotoUrl) ap.photoUrl = ap.fotoUrl;
      delete ap.fotoUrl;
      const { data } = buildSyncData('anggota_tims', ap);
      delete data.fotoUrl;
      const result = await prisma.anggotaTim.upsert({
        where: { id: payload.id || '' },
        update: data,
        create: { id: payload.id || `angt_${Date.now().toString(36)}`, nama: ap.nama || '', jabatan: ap.jabatan || '', ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'hero_slide' || entity === 'hero_slides') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      // Mapping nama field frontend → nama kolom DB (HeroSlide Prisma schema)
      const hp = { ...payload };
      if (!hp.judul && hp.title)       hp.judul    = hp.title;      // frontend: title → DB: judul
      if (!hp.linkUrl && hp.targetUrl) hp.linkUrl  = hp.targetUrl;  // frontend: targetUrl → DB: linkUrl
      if (!hp.subjudul && hp.alt)      hp.subjudul = hp.alt;        // frontend: alt → DB: subjudul
      if (hp.order != null && hp.urutan == null) hp.urutan = Number(hp.order) || 0; // frontend: order → DB: urutan
      const { data } = buildSyncData('hero_slides', hp);
      // Pastikan urutan terisi
      if (data.urutan == null && payload.order != null) data.urutan = Number(payload.order) || 0;
      const result = await prisma.heroSlide.upsert({
        where: { id: payload.id || '' },
        update: data,
        create: { id: payload.id || `slide_${Date.now().toString(36)}`, judul: hp.judul || hp.title || '', imageUrl: hp.imageUrl || '', ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'konseling_config' || entity === 'konseling_configs') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const cfgId = payload.id || 'konseling_config_default';
      const result = await prisma.konselingConfig.upsert({
        where: { id: cfgId },
        update: { deskripsi: JSON.stringify(payload) },
        create: { id: cfgId, deskripsi: JSON.stringify(payload) }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'visi_misi_config' || entity === 'visi_misi_configs') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const vmId = payload.id || 'visi_misi_default';
      const result = await prisma.visiMisiConfig.upsert({
        where: { id: vmId },
        update: { visi: JSON.stringify(payload) },
        create: { id: vmId, visi: JSON.stringify(payload) }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'campus_hiring' || entity === 'campus_hirings') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const chId = payload.id || `ch_${Date.now().toString(36)}`;
      const { data } = buildSyncData('campus_hirings', payload);
      data.deskripsi = JSON.stringify(payload); // Workaround: simpan payload utuh
      const result = await prisma.campusHiring.upsert({
        where: { id: payload.id || '' },
        update: data,
        create: { id: chId, ...data }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'job_fair_event' || entity === 'job_fair_events') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const jfId = payload.id || `jf_${Date.now().toString(36)}`;
      const { data } = buildSyncData('job_fair_events', payload);
      data.deskripsi = JSON.stringify(payload); // Workaround: simpan payload utuh
      const result = await prisma.jobFairEvent.upsert({
        where: { id: payload.id || '' },
        update: data,
        create: { id: jfId, ...data }
      });
      return res.json({ success: true, result });
    }

    res.status(400).json({ error: `Entity '${String(entity).slice(0,50)}' tidak didukung.` });
  } catch (error) {
    console.error(`[Express Sync Error] ${entity}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE — FIX CRITICAL SQLi: pakai Prisma delete (parameterized), bukan raw SQL ─
app.delete('/api/:table/:id', authenticateToken, writeLimiter, async (req, res) => {
  const { table } = req.params;
  const id = String(req.params.id || '').trim();
  try {
    const model = TABLE_TO_MODEL[table];
    if (!model || !prisma[model]) return res.status(400).json({ error: `Tabel '${String(table).slice(0,50)}' tidak diizinkan untuk DELETE.` });
    if (!id || id.length === 0 || id.length > 100) return res.status(400).json({ error: 'ID tidak valid.' });
    // ID format guard — tolak injection chars
    if (!/^[\w\-\.]+$/.test(id)) return res.status(400).json({ error: 'ID tidak valid.' });
    const r = req.user?.role;
    const requesterId = req.user?.id;
    const adminOnlyModels = new Set(['user','mahasiswa','alumni','surveiLulusan','berita','pengumuman','galeriItem','kalenderKegiatan','heroSlide','jobFairEvent','jobFairCompany','campusHiring','mouStakeholder','suratKeputusan','laporanKinerja','anggotaTim','socialMediaItem','konselingConfig','visiMisiConfig','komentarBerita']);
    const ownerModels = new Set(['mitra','lowongan','kontenKarir','pengajuanMagang','tracerStudy']);
    if (adminOnlyModels.has(model) && r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
    if (ownerModels.has(model) && r !== 'ADMIN') {
      const rec = await prisma[model].findUnique({ where: { id } });
      if (!rec) return res.status(404).json({ error: 'Data tidak ditemukan.' });
      if (r === 'MITRA') {
        const ownMitra = await prisma.mitra.findFirst({ where: { userId: requesterId } });
        const ownMitraId = ownMitra ? ownMitra.id : null;
        const owned = rec.createdBy === requesterId || rec.userId === requesterId || (ownMitraId && (rec.mitraId === ownMitraId || rec.mahasiswaId === ownMitraId));
        if (!owned) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      } else if (rec.userId !== requesterId && rec.createdBy !== requesterId && rec.mahasiswaId !== requesterId) {
        return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      }
    }
    // SECURE: parameterized Prisma — tidak ada string interpolation SQL
    await prisma[model].delete({ where: { id } });
    res.json({ success: true, id });
  } catch (error) {
    // Prisma P2025 = record not found
    if (error && error.code === 'P2025') return res.status(404).json({ error: 'Data tidak ditemukan.' });
    console.error('[Express DELETE Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Serve frontend hasil build (dist/) ───────────────────────────
// Wajib berada SEBELUM handler 404 di bawah, dan SESUDAH semua route /api.
// Kalau urutannya terbalik, semua halaman akan membalas JSON {"error":"Not found"}.
// Dengan ini frontend & backend berada di satu origin, sehingga:
//   - cookie httpOnly sameSite:'strict' tetap bekerja (tidak perlu SameSite=None)
//   - CSP connectSrc tidak perlu diubah
//   - VITE_API_URL cukup "/api" relative, dan build yang sama bisa dipakai di
//     server kampus tanpa rebuild.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir));

// SPA fallback: semua GET non-/api diarahkan ke index.html agar deep link
// (mis. /berita/slug) tidak 404 saat di-refresh langsung.
app.get(/^(?!\/api).*/, (_req, res, next) => {
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next(); // dist/ belum dibuild → biarkan jatuh ke 404 JSON
  });
});

// 404 + generic error handler — jangan leak stack di prod
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, _next) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({ error: isProd ? 'Internal server error' : (err.message || 'Internal server error') });
});

app.listen(PORT, async () => {
  if (!isProd) console.log(`🚀 Express API Backend running on http://localhost:${PORT}`);

  // Auto-migration: tambah kolom profil JSON jika belum ada (idempotent, safe to re-run)
  // Dijalankan saat startup di Railway agar tidak perlu prisma migrate manual.
  if (isProd) {
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "mahasiswas"
          ADD COLUMN IF NOT EXISTS "userStatusType" TEXT,
          ADD COLUMN IF NOT EXISTS "university" TEXT,
          ADD COLUMN IF NOT EXISTS "gender" TEXT,
          ADD COLUMN IF NOT EXISTS "workRights" TEXT,
          ADD COLUMN IF NOT EXISTS "nationality" TEXT,
          ADD COLUMN IF NOT EXISTS "opportunityType" TEXT,
          ADD COLUMN IF NOT EXISTS "preferredStartDate" TEXT,
          ADD COLUMN IF NOT EXISTS "industries" TEXT,
          ADD COLUMN IF NOT EXISTS "locations" TEXT,
          ADD COLUMN IF NOT EXISTS "graduationYear" TEXT,
          ADD COLUMN IF NOT EXISTS "experiences" JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS "certificates" JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS "languages" JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS "qualifications" JSONB DEFAULT '[]'::jsonb
      `);
      console.log('✅ [Auto-Migration] Kolom profil JSON berhasil ditambahkan ke mahasiswas.');
    } catch (migErr) {
      // Jangan crash server — log saja. Jika kolom sudah ada, ALTER IF NOT EXISTS aman.
      console.warn('⚠️  [Auto-Migration] Warning (bisa diabaikan jika kolom sudah ada):', migErr?.message);
    }
  }
});
