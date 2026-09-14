# ⚙️ Backend Architecture - Portal CDC UMK Kendari

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture Diagram](#architecture-diagram)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Security Features](#security-features)
- [Database Access Layer](#database-access-layer)
- [Error Handling](#error-handling)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)

---

## 🎯 Overview

Portal CDC UMK Kendari menggunakan **Express.js** REST API backend yang terhubung ke **Supabase PostgreSQL** melalui **Prisma ORM**. Backend menyediakan authentication, CRUD operations, dan business logic untuk frontend React application.

### Key Features
- ✅ JWT-based authentication with 24-hour tokens
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Rate limiting (login: 5 attempts/15min, API: 100 req/min)
- ✅ CORS protection with origin whitelist
- ✅ Helmet.js security headers
- ✅ Type-safe database queries via Prisma
- ✅ Connection pooling via Supabase
- ✅ Automatic password migration to bcrypt hashes

---

## 💻 Technology Stack

### Core Backend
```
Express.js 4.21.2
├── bcryptjs 3.0.3         # Password hashing
├── jsonwebtoken 9.0.3     # JWT authentication
├── helmet 8.3.0           # Security headers
├── express-rate-limit 8.7.0 # Rate limiting
├── dotenv 17.2.3          # Environment variables
└── @prisma/client 6.19.3  # Database ORM

Node.js 18+ (recommended: 20 LTS)
```

### Database Layer
```
Supabase PostgreSQL 15+
├── Prisma 6.12.0          # ORM & migrations
├── Connection Pooler      # Session mode, Port 5432
└── Type-safe queries      # Generated Prisma Client
```

### Development Tools
```
tsx 4.21.0                 # TypeScript execution
typescript 5.8.2           # Type checking
@types/express 4.17.21     # Express types
@types/node 22.14.0        # Node.js types
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React Frontend (Vite)                                     │  │
│  │ - http://localhost:3000                                   │  │
│  │ - localStorage: JWT token + expiry + session_id           │  │
│  │ - Fetch API for HTTP requests                            │  │
│  └──────────────┬───────────────────────────────────────────┘  │
└─────────────────┼───────────────────────────────────────────────┘
                  │
                  │ HTTP/REST (JSON)
                  │ Authorization: Bearer <JWT_TOKEN>
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Express.js Server (server.js)                            │  │
│  │ - http://localhost:5000                                  │  │
│  │                                                           │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ MIDDLEWARE PIPELINE                                │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ 1. Helmet.js Security Headers                      │  │  │
│  │ │    - X-Frame-Options, CSP, HSTS                    │  │  │
│  │ │ 2. CORS Protection                                 │  │  │
│  │ │    - Whitelist: localhost:3000, localhost:5000     │  │  │
│  │ │ 3. Body Parser                                     │  │  │
│  │ │    - JSON (50MB limit)                             │  │  │
│  │ │ 4. Rate Limiters                                   │  │  │
│  │ │    - Login: 5 attempts / 15 min / IP              │  │  │
│  │ │    - API: 100 requests / 1 min / IP               │  │  │
│  │ │ 5. JWT Authentication Middleware                   │  │  │
│  │ │    - Verify Bearer token                           │  │  │
│  │ │    - Decode user: {id, email, role}               │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ API ROUTES                                         │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ POST   /api/login          (public, rate-limited)  │  │  │
│  │ │ GET    /api/health         (public)                │  │  │
│  │ │ GET    /api/all-data       (protected, JWT)        │  │  │
│  │ │ POST   /api/sync/:entity   (public)                │  │  │
│  │ │ GET    /api/:table         (public)                │  │  │
│  │ │ GET    /api/:table/:id     (public)                │  │  │
│  │ │ DELETE /api/:table/:id     (public)                │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ BUSINESS LOGIC                                     │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ - Password hashing (bcryptjs, 10 rounds)           │  │  │
│  │ │ - JWT token generation (HS256, 24h expiry)         │  │  │
│  │ │ - Email normalization (toLowerCase)                │  │  │
│  │ │ - Enum validation (role, status)                   │  │  │
│  │ │ - Last login tracking                              │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  └──────────────┬───────────────────────────────────────────┘  │
└─────────────────┼───────────────────────────────────────────────┘
                  │
                  │ Prisma Client
                  │ (Type-safe queries)
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Supabase PostgreSQL Database                             │  │
│  │ - Connection Pooler (Session Mode, Port 5432)            │  │
│  │                                                           │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ Tables (27 models)                                 │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ users, mahasiswa, alumni, mitra,                   │  │  │
│  │ │ lowongan, pengajuan_magang, tracer_studies,        │  │  │
│  │ │ berita, konten_karir, pengumuman,                  │  │  │
│  │ │ surat_keputusans, laporan_kinerjas,                │  │  │
│  │ │ kalender_kegiatan, mou_stakeholders,               │  │  │
│  │ │ galeri_items, hero_slides,                         │  │  │
│  │ │ visi_misi_configs, anggota_tims,                   │  │  │
│  │ │ social_media_items, ... (+ 8 more)                 │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ Indexes & Constraints                              │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ - UNIQUE: email, nim, slug                         │  │  │
│  │ │ - FOREIGN KEYS: userId, mahasiswaId, mitraId       │  │  │
│  │ │ - CASCADE DELETE: dependent records                │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Authentication

#### POST /api/login
Authenticate user with email and password.

**Rate Limit:** 5 attempts per IP per 15 minutes

**Request:**
```json
{
  "email": "admin@umkendari.ac.id",
  "password": "<password-admin>"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "usr_admin",
    "name": "Operator CDC UM Kendari",
    "email": "admin@umkendari.ac.id",
    "role": "ADMIN",
    "status": "ACTIVE",
    "photoUrl": "https://...",
    "createdAt": "2026-01-10T08:00:00Z",
    "lastLoginAt": "2026-09-04T12:34:56Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email atau password salah."
}
```

**Security:**
- Password compared with bcrypt
- Returns user WITHOUT password field
- Updates `lastLoginAt` timestamp
- Token valid for 24 hours

---

### Health Check

#### GET /api/health
Check backend and database connectivity.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "userCount": 8
}
```

---

### Data Aggregation

#### GET /api/all-data
Get all data from database (protected endpoint).

**Authentication:** Required (JWT Bearer token)

**Rate Limit:** 100 requests per IP per minute

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "users": [...],
  "mahasiswa": [...],
  "alumni": [...],
  "mitra": [...],
  "lowongan": [...],
  "pengajuan_magang": [...],
  "tracer_studies": [...],
  "konten_karir": [...],
  "berita": [...],
  "pengumuman": [...],
  "surat_keputusan": [...],
  "kalender_kegiatan": [...],
  "laporan_kinerja": [...],
  "mou_stakeholder": [...],
  "galeri_items": [...],
  "hero_slides": [...],
  "visi_misi_configs": [...],
  "anggota_tims": [...],
  "social_media_items": [...]
}
```

**Security:**
- User passwords EXCLUDED from response
- JWT token required (middleware: `authenticateToken`)
- Fails if token expired or invalid (403)

---

### CRUD Operations

#### POST /api/sync/:entity
Upsert (insert or update) a record.

**Parameters:**
- `:entity` - Table name (users, mahasiswa, alumni, mitra, lowongan, etc.)

**Request (Users):**
```json
{
  "id": "usr_new",
  "name": "John Doe",
  "email": "john@umkendari.ac.id",
  "password": "password123",
  "phone": "081234567890",
  "role": "MAHASISWA",
  "status": "PENDING"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_new",
    "name": "John Doe",
    "email": "john@umkendari.ac.id",
    "role": "MAHASISWA",
    "status": "PENDING",
    "createdAt": "2026-09-04T12:34:56Z"
  }
}
```

**Special Handling:**
- **Users:** Password auto-hashed with bcrypt if plaintext
- **Email:** Normalized to lowercase
- **Role/Status:** Converted to UPPERCASE enum
- **Upsert Logic:** Updates if exists (by id or email), creates if new

---

#### GET /api/:table
Get all records from a table.

**Security:** Table name validated against whitelist to prevent SQL injection.

**Allowed Tables:**
```
users, mahasiswa, alumni, mitra, lowongan,
pengajuanMagang, tracerStudy, kontenKarir, berita,
pengumuman, suratKeputusan, kalenderKegiatan,
laporanKinerja, mouStakeholder, galeriItem,
heroSlide, visiMisiConfig, anggotaTim, socialMediaItem
```

**Example:**
```bash
GET /api/mahasiswa
```

**Response:**
```json
[
  {
    "id": "mhs1",
    "userId": "usr_mhs1",
    "nim": "202101001",
    "nama": "Muhammad Fadly Alamsyah",
    "programStudi": "Teknik Informatika",
    "fakultas": "Fakultas Teknik",
    ...
  }
]
```

---

#### GET /api/:table/:id
Get a single record by ID.

**Example:**
```bash
GET /api/users/usr_admin
```

**Response:**
```json
{
  "id": "usr_admin",
  "name": "Operator CDC UM Kendari",
  "email": "admin@umkendari.ac.id",
  "role": "ADMIN",
  "status": "ACTIVE",
  ...
}
```

---

#### DELETE /api/:table/:id
Soft delete or hard delete a record.

**Example:**
```bash
DELETE /api/lowongan/low123
```

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

```
┌──────────┐                                 ┌──────────┐
│  Client  │                                 │  Server  │
└────┬─────┘                                 └────┬─────┘
     │                                            │
     │  POST /api/login                           │
     │  {email, password}                         │
     ├───────────────────────────────────────────>│
     │                                            │
     │                                            │ 1. Find user by email
     │                                            │ 2. Compare password with bcrypt
     │                                            │ 3. Generate JWT token
     │                                            │    - Payload: {id, email, role}
     │                                            │    - Secret: JWT_SECRET
     │                                            │    - Expiry: 24 hours
     │                                            │
     │  {success, user, token, expiresIn}         │
     │<───────────────────────────────────────────┤
     │                                            │
     │ Store in localStorage:                     │
     │ - cdc_auth_token                          │
     │ - cdc_token_expiry                        │
     │ - cdc_session_id                          │
     │                                            │
     │  GET /api/all-data                         │
     │  Authorization: Bearer <token>             │
     ├───────────────────────────────────────────>│
     │                                            │
     │                                            │ 1. Extract token from header
     │                                            │ 2. Verify signature with JWT_SECRET
     │                                            │ 3. Check expiry
     │                                            │ 4. Decode user: {id, email, role}
     │                                            │ 5. Attach to req.user
     │                                            │ 6. Execute route handler
     │                                            │
     │  {users, mahasiswa, alumni, ...}           │
     │<───────────────────────────────────────────┤
     │                                            │
```

### JWT Payload Structure

```javascript
{
  "id": "usr_admin",
  "email": "admin@umkendari.ac.id",
  "role": "ADMIN",
  "iat": 1693824896,  // Issued at (Unix timestamp)
  "exp": 1693911296   // Expires at (Unix timestamp)
}
```

### Token Verification (Middleware)

```javascript
// server.js:76-91
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user; // {id, email, role}
    next();
  });
};
```

**Protected Routes:**
- `GET /api/all-data` - Requires valid JWT

**Public Routes:**
- `POST /api/login`
- `GET /api/health`
- `POST /api/sync/:entity`
- `GET /api/:table`
- `GET /api/:table/:id`
- `DELETE /api/:table/:id`

---

## 🛡️ Security Features

### 1. Password Hashing (Bcrypt)

```javascript
import bcrypt from 'bcryptjs';

// Hashing (10 rounds, ~10ms per hash)
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Verification
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Configuration:**
- Rounds: 10 (balance between security and performance)
- Algorithm: bcrypt (Blowfish-based adaptive hash)
- Storage: 60-character hash string in database

---

### 2. Rate Limiting

#### Login Endpoint
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 attempts
  message: { success: false, message: 'Terlalu banyak percobaan login.' }
});

app.post('/api/login', loginLimiter, async (req, res) => { ... });
```

**Protection:** Prevents brute-force password attacks.

#### API Endpoints
```javascript
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,                  // max 100 requests
  message: { error: 'Terlalu banyak request. Coba lagi nanti.' }
});

app.get('/api/all-data', authenticateToken, apiLimiter, async (req, res) => { ... });
```

**Protection:** Prevents DoS attacks and API abuse.

---

### 3. CORS Protection

```javascript
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
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

**Protection:** Only whitelisted origins can access API.

---

### 4. Security Headers (Helmet.js)

```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Development only
  crossOriginEmbedderPolicy: false
}));
```

**Headers Added:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Strict-Transport-Security` - Enforces HTTPS
- `X-XSS-Protection: 1; mode=block` - XSS protection

**Production:** Enable full CSP and remove overrides.

---

### 5. SQL Injection Prevention

```javascript
// ✅ SECURE: Whitelist + parameterized query
const ALLOWED_TABLES = ['users', 'mahasiswa', 'alumni', ...];

if (!ALLOWED_TABLES.includes(table)) {
  return res.status(400).json({ error: 'Invalid table name' });
}

const rawData = await prisma.$queryRaw`SELECT * FROM ${table}`;
```

**Protection:**
- Table names validated against whitelist
- Parameterized queries prevent SQL injection
- No user input concatenated into SQL strings

---

### 6. Input Validation & Sanitization

```javascript
// Email normalization
const emailKey = (payload.email || '').toLowerCase();

// Enum validation (converts to uppercase)
role: (payload.role || 'MAHASISWA').toUpperCase()
status: (payload.status || 'PENDING').toUpperCase()

// Password hashing before storage
if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
  hashedPassword = await bcrypt.hash(hashedPassword, 10);
}
```

---

## 💾 Database Access Layer

### Prisma Client

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

**Features:**
- Type-safe queries (TypeScript autocomplete)
- Connection pooling (managed by Supabase)
- Automatic migrations (`prisma migrate`)
- Query builder with filtering, sorting, pagination

### Example Queries

#### Find User by Email
```javascript
const user = await prisma.user.findUnique({
  where: { email: emailKey }
});
```

#### Upsert User
```javascript
const result = await prisma.user.upsert({
  where: { email: emailKey },
  update: {
    name: payload.name,
    password: hashedPassword,
    phone: payload.phone || null,
    role: payload.role.toUpperCase(),
    status: payload.status.toUpperCase()
  },
  create: {
    id: payload.id,
    name: payload.name,
    email: emailKey,
    password: hashedPassword,
    phone: payload.phone || null,
    role: payload.role.toUpperCase(),
    status: payload.status.toUpperCase()
  }
});
```

#### Get All Records with Relations
```javascript
const mahasiswa = await prisma.mahasiswa.findMany({
  include: {
    user: true,
    pengajuan: true
  },
  orderBy: { createdAt: 'desc' }
});
```

#### Delete with Cascade
```javascript
await prisma.lowongan.delete({
  where: { id: lowonganId }
  // Cascade deletes pengajuan_magang linked to this lowongan
});
```

---

## 🚨 Error Handling

### Global Error Format

```javascript
// Generic error (production)
res.status(500).json({ error: 'Internal server error' });

// Specific error (development)
res.status(400).json({ 
  error: 'Invalid input',
  details: validationErrors 
});
```

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid table name",
  "allowedTables": ["users", "mahasiswa", ...]
}
```

#### 401 Unauthorized
```json
{
  "error": "Access denied. No token provided."
}
```

#### 403 Forbidden
```json
{
  "error": "Invalid or expired token."
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

**Security:** Error messages DO NOT leak stack traces or sensitive info in production.

---

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="<64-char-random-hex>"
PORT=5000
NODE_ENV=development
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Push Schema to Database
```bash
npx prisma db push
```

### 5. Seed Database
```bash
npm run tsx scripts/seed_full_database.ts
```

### 6. Start Development Server
```bash
npm run server
```

Server runs at: **http://localhost:5000**

### 7. Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@umkendari.ac.id","password":"<password-admin>"}'
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Set strong `JWT_SECRET` (64+ chars)
- [ ] Enable `NODE_ENV=production`
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Run `npm audit fix` to patch vulnerabilities
- [ ] Enable full Helmet CSP headers
- [ ] Test authentication flow
- [ ] Verify CORS origins
- [ ] Review rate limit thresholds
- [ ] Change all seed passwords
- [ ] Enable HTTPS redirect
- [ ] Set up monitoring & logging
- [ ] Configure error reporting (Sentry, etc.)
- [ ] Run security audit

### Environment Variables (Production)

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="<secure-64-char-random-string>"
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://cdc.umkendari.ac.id"
```

### Build & Deploy

```bash
# Install production dependencies only
npm ci --production

# Start server
node server.js
```

### Process Manager (Recommended: PM2)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name cdc-backend

# Auto-restart on crash
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Health Monitoring

```bash
# Healthcheck endpoint
curl https://api.cdc.umkendari.ac.id/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "userCount": 150
}
```

---

## 📊 Performance Metrics

### Response Times (Average)
- `POST /api/login`: ~150ms (bcrypt hashing)
- `GET /api/health`: ~20ms
- `GET /api/all-data`: ~300ms (19 table queries)
- `POST /api/sync/users`: ~200ms (upsert + hash)
- `GET /api/:table`: ~50ms

### Throughput
- API rate limit: 100 requests/min/IP
- Login rate limit: 5 attempts/15min/IP
- Concurrent connections: ~100 (default Node.js)

### Optimization Strategies
1. **Connection Pooling:** Supabase pooler (Session Mode)
2. **Indexed Queries:** email, nim, slug
3. **Select Specific Fields:** Exclude password from responses
4. **Caching:** (TODO) Add Redis for frequently accessed data
5. **Pagination:** (TODO) Implement for large datasets

---

## 🔗 Related Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database schema & migrations
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - Security audit results
- [SEED_PASSWORDS_README.md](SEED_PASSWORDS_README.md) - Password management
- [.env.example](../.env.example) - Environment variables template

---

## 📞 Support & Debugging

### Debug Mode
```bash
# Enable verbose logging
DEBUG=express:* npm run server
```

### Common Issues

**Issue:** Cannot connect to database
```bash
# Test connection
npx prisma db pull
```

**Issue:** JWT_SECRET not set
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Issue:** Rate limit too strict
```bash
# Adjust in server.js:61-73
max: 10  # Increase from 5
```

---

**Last Updated:** September 4, 2026  
**Backend Version:** 1.0.0  
**API Version:** v1  
**Framework:** Express.js 4.21.2  
**Database:** Supabase PostgreSQL 15+
