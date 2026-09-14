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
// Body limit 2MB — cegah DoS via payload 50MB
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

if (isProd) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    // Di balik reverse proxy (Vercel/NGINX) header di atas sudah cukup; jangan redirect loop di dev
    return next();
  });
}

// ── CORS — whitelist ketat ───────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

if (isProd && !process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL tidak diset di production — CORS akan menolak origin tak dikenal.');
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  // Jika origin tidak dikenal: JANGAN set Allow-Origin (browser block)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Rate limiters ────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
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
    const komentar_berita = await prisma.komentarBerita.findMany({ orderBy: { createdAt: 'desc' } });
    const uploaded_documents = await prisma.uploadedDocument.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ users, mahasiswa, alumni, mitra, lowongan, pengajuan_magang, tracer_studies, konten_karir, berita, pengumuman, surat_keputusan, kalender_kegiatan, laporan_kinerja, mou_stakeholder, galeri_items, hero_slides, visi_misi_configs, anggota_tims, social_media_items, survei_lulusan, komentar_berita, uploaded_documents });
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
    res.json({ lowongan, konten_karir, berita, pengumuman, hero_slides, galeri_items, mou_stakeholder, anggota_tims, visi_misi_configs, social_media_items, kalender_kegiatan });
  } catch (error) {
    console.error('[Express API /public-data Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/register — validasi ketat + hash bcrypt
app.post('/api/register', registerLimiter, async (req, res) => {
  const { name, email, password, phone, role, nim, namaInstansi, kontakPerson, programStudi, fakultas, tahunLulus, bidangIndustri, alamat, website } = req.body || {};
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
  if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: 'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.' });
  if (!name || !String(name).trim()) return res.status(400).json({ success: false, message: 'Nama wajib diisi.' });
  const normalizedRole = String(role || 'MAHASISWA').toUpperCase();
  if (!['MAHASISWA', 'ALUMNI', 'MITRA'].includes(normalizedRole)) return res.status(400).json({ success: false, message: 'Role registrasi tidak valid.' });
  try {
    const emailKey = String(email).toLowerCase().trim();
    if (emailKey.length > 254) return res.status(400).json({ success: false, message: 'Email terlalu panjang.' });
    const existing = await prisma.user.findUnique({ where: { email: emailKey } });
    if (existing) return res.status(409).json({ success: false, message: 'Pendaftaran gagal. Silakan gunakan data lain atau hubungi admin.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name: String(name).trim().slice(0, 100), email: emailKey, password: hashedPassword, phone: phone ? String(phone).slice(0, 20) : null, role: normalizedRole, status: 'PENDING' }
    });
    if (normalizedRole === 'MITRA') {
      const mitraId = `mtr_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
      await prisma.mitra.create({
        data: { id: mitraId, userId: newUser.id, namaInstansi: namaInstansi ? String(namaInstansi).slice(0, 150) : String(name).trim().slice(0, 150), kontakPerson: kontakPerson ? String(kontakPerson).slice(0, 100) : String(name).trim().slice(0, 100), email: emailKey, phone: phone ? String(phone).slice(0, 20) : null, bidangIndustri: bidangIndustri ? String(bidangIndustri).slice(0, 100) : 'Umum', alamat: alamat ? String(alamat).slice(0, 300) : null, website: website ? String(website).slice(0, 2048) : null, statusKerjaSama: 'PENDING' }
      });
    } else {
      const mhsId = `mhs_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
      const almId = `alm_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
      const nimVal = nim ? String(nim).toUpperCase().slice(0, 30) : `NIM${Date.now().toString(36).toUpperCase()}`;
      await prisma.mahasiswa.create({
        data: { id: mhsId, userId: newUser.id, nim: nimVal, nama: String(name).trim().slice(0, 100), email: emailKey, phone: phone ? String(phone).slice(0, 20) : null, programStudi: programStudi ? String(programStudi).slice(0, 100) : '-', fakultas: fakultas ? String(fakultas).slice(0, 100) : '-', angkatan: tahunLulus ? String(tahunLulus).slice(0, 10) : String(new Date().getFullYear()) }
      });
      await prisma.alumni.create({
        data: { id: almId, userId: newUser.id, nim: nimVal, nama: String(name).trim().slice(0, 100), email: emailKey, phone: phone ? String(phone).slice(0, 20) : null, programStudi: programStudi ? String(programStudi).slice(0, 100) : '-', fakultas: fakultas ? String(fakultas).slice(0, 100) : '-', tahunLulus: tahunLulus ? String(tahunLulus).slice(0, 10) : String(new Date().getFullYear()), statusPekerjaan: 'belum_bekerja' }
      });
    }
    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({ success: true, message: 'Pendaftaran berhasil. Akun menunggu verifikasi administrator.', user: userSafe });
  } catch (error) {
    console.error('[Express Register Error]:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      sameSite: isProd ? 'strict' : 'lax',
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
  res.clearCookie('auth_token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax', path: '/' });
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

// ── POST /api/sync/:entity — Zod + RBAC + ownership ───────────────
app.post('/api/sync/:entity', authenticateToken, writeLimiter, async (req, res) => {
  const { entity } = req.params;
  const payload = req.body || {};
  const r = req.user?.role;
  const requesterId = req.user?.id;

  // Validasi entity whitelist — 21 entity (10 lama + 11 tambahan 100% Supabase)
  const allowedEntities = new Set(['users','user','mahasiswa','alumni','mitra','lowongan','pengajuan_magang','tracer_study','tracer_studies','konten_karir','berita','pengumuman','survei_lulusan','survei_lulusans','surat_keputusan','kalender_kegiatan','laporan_kinerja','mou_stakeholder','galeri_items','galeri_item','social_media','social_media_items','komentar_berita','komentar_beritas','uploaded_documents']);
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
      const existingMhs = await prisma.mahasiswa.findFirst({ where: { OR: [{ id: payload.id }, { nim: payload.nim }] } });
      const mhsWhere = existingMhs ? { id: existingMhs.id } : { id: payload.id };
      const result = await prisma.mahasiswa.upsert({
        where: mhsWhere,
        update: { nama: String(payload.nama||'').slice(0,100), email: String(payload.email||'').slice(0,254), phone: payload.phone ? String(payload.phone).slice(0,20) : null, programStudi: String(payload.programStudi||'-').slice(0,100), fakultas: String(payload.fakultas||'-').slice(0,100), angkatan: String(payload.angkatan||'').slice(0,10), semester: Number.isFinite(payload.semester) ? Math.min(14, Math.max(1, Number(payload.semester))) : 1, alamat: payload.alamat ? String(payload.alamat).slice(0,300) : null, ipk: payload.ipk || null, skills: Array.isArray(payload.skills) ? payload.skills.slice(0,30) : [] },
        create: { id: payload.id, userId: payload.userId, nim: String(payload.nim||'').slice(0,30), nama: String(payload.nama||'').slice(0,100), email: String(payload.email||'').slice(0,254), phone: payload.phone ? String(payload.phone).slice(0,20) : null, programStudi: String(payload.programStudi||'-').slice(0,100), fakultas: String(payload.fakultas||'-').slice(0,100), angkatan: String(payload.angkatan||'').slice(0,10), semester: Number.isFinite(payload.semester) ? Math.min(14, Math.max(1, Number(payload.semester))) : 1, alamat: payload.alamat ? String(payload.alamat).slice(0,300) : null, ipk: payload.ipk || null, skills: Array.isArray(payload.skills) ? payload.skills.slice(0,30) : [] }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'alumni') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const existingAlumni = await prisma.alumni.findFirst({ where: { OR: [{ id: payload.id }, { userId: payload.userId }] } });
      const alumniWhere = existingAlumni ? { id: existingAlumni.id } : { id: payload.id };
      const result = await prisma.alumni.upsert({
        where: alumniWhere,
        update: { nama: String(payload.nama||'').slice(0,100), email: String(payload.email||'').slice(0,254), programStudi: String(payload.programStudi||'-').slice(0,100), fakultas: String(payload.fakultas||'-').slice(0,100), tahunLulus: String(payload.tahunLulus||'').slice(0,10), statusPekerjaan: String(payload.statusPekerjaan||'belum_bekerja').slice(0,50), instansiKerja: payload.instansiKerja ? String(payload.instansiKerja).slice(0,150) : null, jabatan: payload.jabatan ? String(payload.jabatan).slice(0,100) : null },
        create: { id: payload.id, userId: payload.userId, nim: payload.nim ? String(payload.nim).slice(0,30) : null, nama: String(payload.nama||'').slice(0,100), email: String(payload.email||'').slice(0,254), phone: payload.phone ? String(payload.phone).slice(0,20) : null, programStudi: String(payload.programStudi||'-').slice(0,100), fakultas: String(payload.fakultas||'-').slice(0,100), tahunLulus: String(payload.tahunLulus||'').slice(0,10), statusPekerjaan: String(payload.statusPekerjaan||'belum_bekerja').slice(0,50), instansiKerja: payload.instansiKerja ? String(payload.instansiKerja).slice(0,150) : null, jabatan: payload.jabatan ? String(payload.jabatan).slice(0,100) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'mitra') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const existingMitra = await prisma.mitra.findFirst({ where: { OR: [{ id: payload.id }, { userId: payload.userId }] } });
      const mitraWhere = existingMitra ? { id: existingMitra.id } : { id: payload.id };
      const result = await prisma.mitra.upsert({
        where: mitraWhere,
        update: { namaInstansi: String(payload.namaInstansi||'').slice(0,150), bidangIndustri: payload.bidangIndustri ? String(payload.bidangIndustri).slice(0,100) : null, alamat: payload.alamat ? String(payload.alamat).slice(0,300) : null, kontakPerson: String(payload.kontakPerson||'').slice(0,100), email: String(payload.email||'').slice(0,254), phone: payload.phone ? String(payload.phone).slice(0,20) : null, website: payload.website ? String(payload.website).slice(0,2048) : null, statusKerjaSama: (payload.statusKerjaSama || 'PENDING').toUpperCase().slice(0,20) },
        create: { id: payload.id, userId: payload.userId, namaInstansi: String(payload.namaInstansi||'').slice(0,150), bidangIndustri: payload.bidangIndustri ? String(payload.bidangIndustri).slice(0,100) : null, alamat: payload.alamat ? String(payload.alamat).slice(0,300) : null, kontakPerson: String(payload.kontakPerson||'').slice(0,100), email: String(payload.email||'').slice(0,254), phone: payload.phone ? String(payload.phone).slice(0,20) : null, website: payload.website ? String(payload.website).slice(0,2048) : null, statusKerjaSama: (payload.statusKerjaSama || 'PENDING').toUpperCase().slice(0,20) }
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
      const parsedDeadline = (payload.deadline && !isNaN(Date.parse(payload.deadline))) ? new Date(payload.deadline) : new Date();
      const result = await prisma.lowongan.upsert({
        where: { id: payload.id },
        update: { mitraId: validMitraId, judul: String(payload.judul||'').slice(0,200), tipe: (payload.tipe || 'KERJA').toUpperCase().slice(0,20), namaInstansi: String(payload.namaInstansi||'').slice(0,150), companyLogo: payload.companyLogo ? String(payload.companyLogo).slice(0,2048) : null, bannerImage: payload.bannerImage ? String(payload.bannerImage).slice(0,2048) : null, lokasi: String(payload.lokasi||'').slice(0,150), deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0,10000) : null, kualifikasi: Array.isArray(payload.kualifikasi) ? payload.kualifikasi.slice(0,30) : [], gaji: payload.gaji ? String(payload.gaji).slice(0,100) : null, benefit: Array.isArray(payload.benefit) ? payload.benefit.slice(0,30) : [], deadline: parsedDeadline, status: (payload.status || 'PUBLISHED').toUpperCase().slice(0,20) },
        create: { id: payload.id, mitraId: validMitraId, createdBy: payload.createdBy || 'usr_admin', judul: String(payload.judul||'').slice(0,200), tipe: (payload.tipe || 'KERJA').toUpperCase().slice(0,20), namaInstansi: String(payload.namaInstansi||'').slice(0,150), companyLogo: payload.companyLogo ? String(payload.companyLogo).slice(0,2048) : null, bannerImage: payload.bannerImage ? String(payload.bannerImage).slice(0,2048) : null, lokasi: String(payload.lokasi||'').slice(0,150), deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0,10000) : null, kualifikasi: Array.isArray(payload.kualifikasi) ? payload.kualifikasi.slice(0,30) : [], gaji: payload.gaji ? String(payload.gaji).slice(0,100) : null, benefit: Array.isArray(payload.benefit) ? payload.benefit.slice(0,30) : [], deadline: parsedDeadline, status: (payload.status || 'PUBLISHED').toUpperCase().slice(0,20) }
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
      const result = await prisma.pengajuanMagang.upsert({
        where: { id: payload.id },
        update: { status: (payload.status || 'SUBMITTED').toUpperCase().slice(0,30), catatanAdmin: payload.catatanAdmin ? String(payload.catatanAdmin).slice(0,1000) : null, interviewStatus: payload.interviewStatus ? String(payload.interviewStatus).slice(0,50) : null },
        create: { id: payload.id, mahasiswaId: payload.mahasiswaId, userId: payload.userId, lowonganId: payload.lowonganId || null, mitraId: payload.mitraId || null, namaInstansi: payload.namaInstansi ? String(payload.namaInstansi).slice(0,150) : null, namaMahasiswa: String(payload.namaMahasiswa||'').slice(0,100), nim: String(payload.nim||'').slice(0,30), programStudi: String(payload.programStudi||'-').slice(0,100), tujuanMagang: String(payload.tujuanMagang||'').slice(0,500), lokasiMagang: payload.lokasiMagang ? String(payload.lokasiMagang).slice(0,150) : null, catatan: payload.catatan ? String(payload.catatan).slice(0,1000) : null, berkasUrl: payload.berkasUrl ? String(payload.berkasUrl).slice(0,2048) : null, berkasNama: payload.berkasNama ? String(payload.berkasNama).slice(0,200) : null, status: (payload.status || 'SUBMITTED').toUpperCase().slice(0,30) }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'tracer_study' || entity === 'tracer_studies') {
      if (r !== 'ADMIN' && (!payload.userId || payload.userId !== requesterId)) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const result = await prisma.tracerStudy.upsert({
        where: { id: payload.id },
        update: { statusPekerjaan: String(payload.statusPekerjaan||'').slice(0,50), namaInstansi: payload.namaInstansi ? String(payload.namaInstansi).slice(0,150) : null, jabatan: payload.jabatan ? String(payload.jabatan).slice(0,100) : null },
        create: { id: payload.id, mahasiswaId: payload.mahasiswaId || payload.userId, userId: payload.userId, nama: String(payload.nama||'').slice(0,100), programStudi: String(payload.programStudi||'-').slice(0,100), tahunLulus: String(payload.tahunLulus||'').slice(0,10), statusPekerjaan: String(payload.statusPekerjaan||'').slice(0,50), masaTungguKerja: payload.masaTungguKerja ? String(payload.masaTungguKerja).slice(0,50) : null, namaInstansi: payload.namaInstansi ? String(payload.namaInstansi).slice(0,150) : null, jabatan: payload.jabatan ? String(payload.jabatan).slice(0,100) : null, saranUntukKampus: payload.saranUntukKampus ? String(payload.saranUntukKampus).slice(0,2000) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'konten_karir') {
      if (r !== 'ADMIN' && r !== 'MITRA') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      if (r === 'MITRA' && payload.createdBy && payload.createdBy !== requesterId) return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      if (r === 'MITRA' && !payload.createdBy) payload.createdBy = requesterId;
      const result = await prisma.kontenKarir.upsert({
        where: { id: payload.id },
        update: { judul: String(payload.judul||'').slice(0,200), body: payload.body ? String(payload.body).slice(0,20000) : '', penulis: payload.penulis ? String(payload.penulis).slice(0,100) : null, status: String(payload.status||'published').slice(0,20), isPinned: !!payload.isPinned },
        create: { id: payload.id, jenis: String(payload.jenis||'berita').slice(0,20), judul: String(payload.judul||'').slice(0,200), body: payload.body ? String(payload.body).slice(0,20000) : '', penulis: payload.penulis ? String(payload.penulis).slice(0,100) : null, status: String(payload.status||'published').slice(0,20), isPinned: !!payload.isPinned }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'berita') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const slugVal = String(payload.slug || payload.id || '').slice(0, 220);
      const data = { judul: String(payload.judul || payload.title || '').slice(0, 500), slug: slugVal || undefined, body: payload.body || payload.content ? String(payload.body || payload.content).slice(0, 20000) : '', thumbnail: payload.thumbnail || payload.coverImageUrl ? String(payload.thumbnail || payload.coverImageUrl).slice(0, 2048) : null, penulis: payload.penulis ? String(payload.penulis).slice(0, 100) : null, status: String(payload.status || 'published').slice(0, 20), isPinned: !!payload.isPinned };
      let result;
      if (payload.id) {
        result = await prisma.berita.upsert({ where: { id: payload.id }, update: data, create: { id: payload.id, ...data } });
      } else if (slugVal) {
        result = await prisma.berita.upsert({ where: { slug: slugVal }, update: data, create: data });
      } else {
        result = await prisma.berita.create({ data });
      }
      return res.json({ success: true, result });
    }

    if (entity === 'pengumuman') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const result = await prisma.pengumuman.upsert({
        where: { id: payload.id },
        update: { judul: String(payload.judul || payload.title || '').slice(0, 500), body: payload.body || payload.content ? String(payload.body || payload.content).slice(0, 20000) : '', thumbnail: payload.thumbnail || payload.posterUrl ? String(payload.thumbnail || payload.posterUrl).slice(0, 2048) : null, isPinned: !!(payload.isPinned || payload.isImportant), status: String(payload.status || 'published').slice(0, 20) },
        create: { id: payload.id, judul: String(payload.judul || payload.title || '').slice(0, 500), body: payload.body || payload.content ? String(payload.body || payload.content).slice(0, 20000) : '', thumbnail: payload.thumbnail || payload.posterUrl ? String(payload.thumbnail || payload.posterUrl).slice(0, 2048) : null, isPinned: !!(payload.isPinned || payload.isImportant), status: String(payload.status || 'published').slice(0, 20) }
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
      const result = await prisma.surveiLulusan.upsert({
        where: { id: payload.id },
        update: { namaInstansi: String(payload.namaInstansi || mitraExists.namaInstansi || '').slice(0, 150), kualitasLulusan: clampScore(payload.kualitasLulusan), kemampuanTeknis: clampScore(payload.kemampuanTeknis), kemampuanKomunikasi: clampScore(payload.kemampuanKomunikasi), etikaKerja: clampScore(payload.etikaKerja), kemampuanKerjaTim: clampScore(payload.kemampuanKerjaTim), saran: payload.saran ? String(payload.saran).slice(0, 2000) : null },
        create: { id: payload.id, mitraId: mitraIdVal, namaInstansi: String(payload.namaInstansi || mitraExists.namaInstansi || '').slice(0, 150), alumniId: alumniIdVal, kualitasLulusan: clampScore(payload.kualitasLulusan), kemampuanTeknis: clampScore(payload.kemampuanTeknis), kemampuanKomunikasi: clampScore(payload.kemampuanKomunikasi), etikaKerja: clampScore(payload.etikaKerja), kemampuanKerjaTim: clampScore(payload.kemampuanKerjaTim), saran: payload.saran ? String(payload.saran).slice(0, 2000) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'surat_keputusan') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tgl = (payload.tanggal || payload.createdAt) && !isNaN(Date.parse(payload.tanggal || payload.createdAt)) ? new Date(payload.tanggal || payload.createdAt) : new Date();
      const result = await prisma.suratKeputusan.upsert({
        where: { id: payload.id },
        update: { judul: String(payload.judul || '').slice(0, 500), fileUrl: payload.fileUrl || payload.pdfUrl || payload.linkUrl ? String(payload.fileUrl || payload.pdfUrl || payload.linkUrl).slice(0, 2048) : null, kategori: payload.kategori ? String(payload.kategori).slice(0, 100) : null, tanggal: tgl },
        create: { id: payload.id, nomor: payload.nomor ? String(payload.nomor).slice(0, 100) : `SK-${String(payload.id).slice(0, 50)}`, judul: String(payload.judul || '').slice(0, 500), tanggal: tgl, fileUrl: payload.fileUrl || payload.pdfUrl || payload.linkUrl ? String(payload.fileUrl || payload.pdfUrl || payload.linkUrl).slice(0, 2048) : null, kategori: payload.kategori ? String(payload.kategori).slice(0, 100) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'kalender_kegiatan') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tglMulai = (payload.tanggalMulai || payload.createdAt) && !isNaN(Date.parse(payload.tanggalMulai || payload.createdAt)) ? new Date(payload.tanggalMulai || payload.createdAt) : new Date();
      const result = await prisma.kalenderKegiatan.upsert({
        where: { id: payload.id },
        update: { judul: String(payload.judul || '').slice(0, 500), deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0, 5000) : null, tanggalMulai: tglMulai, lokasi: payload.lokasi ? String(payload.lokasi).slice(0, 200) : null, kategori: payload.kategori ? String(payload.kategori).slice(0, 100) : null },
        create: { id: payload.id, judul: String(payload.judul || '').slice(0, 500), deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0, 5000) : null, tanggalMulai: tglMulai, lokasi: payload.lokasi ? String(payload.lokasi).slice(0, 200) : null, kategori: payload.kategori ? String(payload.kategori).slice(0, 100) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'laporan_kinerja') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tahunVal = Number.isFinite(Number(payload.tahun)) ? Number(payload.tahun) : new Date(payload.createdAt || Date.now()).getFullYear();
      const result = await prisma.laporanKinerja.upsert({
        where: { id: payload.id },
        update: { judul: String(payload.judul || '').slice(0, 500), tahun: tahunVal, periode: payload.periode || payload.kategori ? String(payload.periode || payload.kategori).slice(0, 100) : null, fileUrl: payload.fileUrl || payload.pdfUrl || payload.linkUrl ? String(payload.fileUrl || payload.pdfUrl || payload.linkUrl).slice(0, 2048) : null, deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0, 5000) : null },
        create: { id: payload.id, judul: String(payload.judul || '').slice(0, 500), tahun: tahunVal, periode: payload.periode || payload.kategori ? String(payload.periode || payload.kategori).slice(0, 100) : null, fileUrl: payload.fileUrl || payload.pdfUrl || payload.linkUrl ? String(payload.fileUrl || payload.pdfUrl || payload.linkUrl).slice(0, 2048) : null, deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0, 5000) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'mou_stakeholder') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const tglMou = (payload.tanggalMou || payload.createdAt) && !isNaN(Date.parse(payload.tanggalMou || payload.createdAt)) ? new Date(payload.tanggalMou || payload.createdAt) : null;
      const result = await prisma.mouStakeholder.upsert({
        where: { id: payload.id },
        update: { namaInstansi: String(payload.namaInstansi || payload.judul || '').slice(0, 150), logoUrl: payload.logoUrl || payload.posterUrl ? String(payload.logoUrl || payload.posterUrl).slice(0, 2048) : null, jenisMou: payload.jenisMou || payload.kategori ? String(payload.jenisMou || payload.kategori).slice(0, 100) : null, tanggalMou: tglMou, status: String(payload.status || 'aktif').slice(0, 20) },
        create: { id: payload.id, namaInstansi: String(payload.namaInstansi || payload.judul || '').slice(0, 150), logoUrl: payload.logoUrl || payload.posterUrl ? String(payload.logoUrl || payload.posterUrl).slice(0, 2048) : null, jenisMou: payload.jenisMou || payload.kategori ? String(payload.jenisMou || payload.kategori).slice(0, 100) : null, tanggalMou: tglMou, status: String(payload.status || 'aktif').slice(0, 20) }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'galeri_items' || entity === 'galeri_item') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const imgUrl = payload.imageUrl || payload.posterUrl || payload.pdfUrl || payload.youtubeUrl ? String(payload.imageUrl || payload.posterUrl || payload.pdfUrl || payload.youtubeUrl).slice(0, 2048) : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop';
      const result = await prisma.galeriItem.upsert({
        where: { id: payload.id },
        update: { judul: String(payload.judul || '').slice(0, 500), imageUrl: imgUrl, kategori: payload.kategori || payload.kategoriSection ? String(payload.kategori || payload.kategoriSection).slice(0, 100) : null, deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0, 5000) : null },
        create: { id: payload.id, judul: String(payload.judul || '').slice(0, 500), imageUrl: imgUrl, kategori: payload.kategori || payload.kategoriSection ? String(payload.kategori || payload.kategoriSection).slice(0, 100) : null, deskripsi: payload.deskripsi ? String(payload.deskripsi).slice(0, 5000) : null }
      });
      return res.json({ success: true, result });
    }

    if (entity === 'social_media' || entity === 'social_media_items') {
      if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
      const result = await prisma.socialMediaItem.upsert({
        where: { id: payload.id },
        update: { platform: String(payload.platform || 'website').slice(0, 50), url: String(payload.url || '').slice(0, 2048), icon: payload.icon || payload.hoverColor ? String(payload.icon || payload.hoverColor).slice(0, 200) : null, isActive: payload.isActive !== false },
        create: { id: payload.id, platform: String(payload.platform || 'website').slice(0, 50), url: String(payload.url || '').slice(0, 2048), icon: payload.icon || payload.hoverColor ? String(payload.icon || payload.hoverColor).slice(0, 200) : null, isActive: payload.isActive !== false }
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
      const result = await prisma.komentarBerita.upsert({
        where: { id: payload.id },
        update: { nama: String(payload.nama || '').slice(0, 100), email: payload.email ? String(payload.email).slice(0, 254) : null, konten: String(payload.konten || payload.komentar || '').slice(0, 5000), status: payload.status ? String(payload.status).toUpperCase().slice(0, 20) : 'PENDING' },
        create: { id: payload.id, beritaId: beritaIdVal, userId: payload.userId || requesterId || null, nama: String(payload.nama || '').slice(0, 100), email: payload.email ? String(payload.email).slice(0, 254) : null, konten: String(payload.konten || payload.komentar || '').slice(0, 5000), status: payload.status ? String(payload.status).toUpperCase().slice(0, 20) : 'PENDING' }
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
      const result = await prisma.uploadedDocument.upsert({
        where: { id: payload.id },
        update: { fileName: String(payload.fileName || payload.name || '').slice(0, 255), fileUrl: String(payload.fileUrl || '').slice(0, 2048), fileType: String(payload.fileType || payload.mimeType || 'application/octet-stream').slice(0, 100), fileSize: Number.isFinite(Number(payload.fileSize || payload.sizeBytes)) ? Number(payload.fileSize || payload.sizeBytes) : null, category: payload.category || payload.type ? String(payload.category || payload.type).slice(0, 50) : 'cv' },
        create: { id: payload.id, userId: ownerId, mahasiswaId: mhsIdVal, fileName: String(payload.fileName || payload.name || '').slice(0, 255), fileUrl: String(payload.fileUrl || '').slice(0, 2048), fileType: String(payload.fileType || payload.mimeType || 'application/octet-stream').slice(0, 100), fileSize: Number.isFinite(Number(payload.fileSize || payload.sizeBytes)) ? Number(payload.fileSize || payload.sizeBytes) : null, category: payload.category || payload.type ? String(payload.category || payload.type).slice(0, 50) : 'cv' }
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
    const adminOnlyModels = new Set(['user','mahasiswa','alumni','surveiLulusan','berita','pengumuman','galeriItem','kalenderKegiatan','heroSlide','jobFairEvent','jobFairCompany','campusHiring','mouStakeholder','suratKeputusan','laporanKinerja','anggotaTim','socialMediaItem','konselingConfig','visiMisiConfig']);
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

app.listen(PORT, () => {
  if (!isProd) console.log(`🚀 Express API Backend running on http://localhost:${PORT}`);
});
