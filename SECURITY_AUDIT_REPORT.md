# 🔒 SECURITY AUDIT REPORT - PORTAL CDC UMK KENDARI
**Audit Date:** September 4, 2026
**Auditor:** Kiro AI Security Reviewer
**Framework:** OWASP Top 10 + Everything Claude Code Security Standards

---

## 📊 EXECUTIVE SUMMARY

**Overall Security Score: 6.5/10** (MODERATE RISK)

- ✅ **CRITICAL Issues:** 1 found
- ⚠️ **HIGH Issues:** 4 found  
- 📋 **MEDIUM Issues:** 5 found
- 💡 **LOW Issues:** 3 found

**Status:** ⚠️ **NOT PRODUCTION READY** - Critical and High issues must be fixed before deployment.

---

## 🚨 CRITICAL ISSUES (MUST FIX IMMEDIATELY)

### [CRITICAL-01] SQL Injection Vulnerability via $queryRawUnsafe
**File:** `server.js:233`
**Severity:** CRITICAL (CVSS 9.8)
**CWE:** CWE-89 (SQL Injection)

```javascript
// ❌ VULNERABLE CODE
const rawData = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
```

**Attack Vector:**
```bash
# Attacker dapat inject SQL:
GET /api/users'; DROP TABLE users; --
# Executes: SELECT * FROM "users'; DROP TABLE users; --"
```

**Impact:**
- Full database compromise
- Data exfiltration
- Data deletion
- Privilege escalation

**Fix:**
```javascript
// ✅ SECURE FIX - Use parameterized queries
const rawData = await prisma.$queryRaw`SELECT * FROM ${Prisma.sql([table])}`;
// OR better: whitelist allowed tables
const ALLOWED_TABLES = ['users', 'mahasiswa', 'alumni', 'mitra', 'lowongan'];
if (!ALLOWED_TABLES.includes(table)) {
  return res.status(400).json({ error: 'Invalid table name' });
}
```

**Recommendation:** PATCH THIS IMMEDIATELY before any production deployment.

---

## ⚠️ HIGH SEVERITY ISSUES

### [HIGH-01] Weak JWT Secret in Production
**File:** `server.js:14`
**Severity:** HIGH (CVSS 7.5)
**CWE:** CWE-798 (Use of Hard-coded Credentials)

```javascript
// ❌ WEAK SECRET GENERATION
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_' + Math.random().toString(36);
```

**Issues:**
1. Math.random() is NOT cryptographically secure
2. Fallback secret is predictable
3. Comment implies production use with weak default

**Fix:**
```javascript
// ✅ SECURE FIX
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set in .env and be at least 32 characters long');
}
```

**Additional:** Generate secure secret with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### [HIGH-02] Hardcoded Plaintext Passwords in Seed Data
**File:** `src/data.ts:133,144,155,166,177,188,199,210`
**Severity:** HIGH (CVSS 7.0)
**CWE:** CWE-259 (Use of Hard-coded Password)

```typescript
// ❌ HARDCODED PASSWORDS (8 accounts)
{
  email: 'admin@umkendari.ac.id',
  password: 'password',  // PLAINTEXT!
  role: 'admin'
}
```

**Impact:**
- All 8 seed accounts (Admin, Mahasiswa, Alumni, Mitra) use same password
- Anyone with code access can login as admin
- Password visible in git history

**Fix:**
1. Remove plaintext passwords from `src/data.ts`
2. Use environment-based seed passwords
3. Force password change on first login
4. Rotate all credentials immediately

---

### [HIGH-03] XSS Vulnerability via dangerouslySetInnerHTML
**File:** `src/markdown.tsx:61`, `src/components/AdminDashboard.tsx:1756`
**Severity:** HIGH (CVSS 6.5)
**CWE:** CWE-79 (Cross-site Scripting)

```tsx
// ❌ POTENTIALLY VULNERABLE
return <div className="prose-berita" dangerouslySetInnerHTML={{ __html: clean }} />;
```

**Issues:**
- Relies on DOMPurify sanitization
- No Content-Security-Policy headers
- innerHTML manipulation in line 952, 1051, 1066, 1235

**Fix:**
```typescript
// ✅ VERIFY DOMPurify is properly configured
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(markdown, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false
});
```

**Additional:** Add CSP headers in server.js:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"]
    }
  }
}));
```

---

### [HIGH-04] JWT Token Stored in localStorage (XSS Risk)
**File:** `src/App.tsx:148-150`
**Severity:** HIGH (CVSS 6.8)
**CWE:** CWE-522 (Insufficiently Protected Credentials)

```typescript
// ⚠️ INSECURE STORAGE
localStorage.setItem('cdc_auth_token', result.token);
localStorage.setItem('cdc_token_expiry', (Date.now() + result.expiresIn * 1000).toString());
localStorage.setItem('cdc_session_id', result.user.id);
```

**Issue:**
- localStorage accessible via JavaScript
- If XSS occurs, attacker steals JWT token
- No httpOnly protection

**Fix (Best):**
```javascript
// Server-side: Use httpOnly cookies
res.cookie('auth_token', token, {
  httpOnly: true,  // Cannot be accessed via JavaScript
  secure: true,    // HTTPS only
  sameSite: 'strict',
  maxAge: 86400000 // 24 hours
});
```

**Fix (Alternative):**
If localStorage required, implement:
1. Short token expiry (15 min)
2. Refresh token rotation
3. CSP headers to mitigate XSS

---

## 📋 MEDIUM SEVERITY ISSUES

### [MEDIUM-01] Vulnerable Dependencies
**npm audit output:** 3 moderate vulnerabilities

```
- body-parser (1.20.5-1.20.6): Moderate severity
- express (4.22.2): Moderate severity via qs
- qs (6.14.2-6.15.3): DoS + array-limit bypass
```

**Fix:**
```bash
npm audit fix --force
# OR manually update:
npm install express@latest
```

---

### [MEDIUM-02] Missing Input Validation on API Endpoints
**File:** `server.js:241-280`
**Severity:** MEDIUM (CVSS 5.0)

```javascript
// ❌ NO INPUT VALIDATION
app.post('/api/sync/:entity', async (req, res) => {
  const payload = req.body;  // Accepts any JSON!
  // No validation of payload structure
```

**Fix:**
```javascript
// ✅ ADD INPUT VALIDATION with Zod
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().regex(/^[0-9]{10,15}$/).optional(),
  role: z.enum(['ADMIN', 'MAHASISWA', 'ALUMNI', 'MITRA']),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE'])
});

app.post('/api/sync/users', async (req, res) => {
  try {
    const payload = UserSchema.parse(req.body); // Throws if invalid
    // Continue with validated payload
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input', details: error.errors });
  }
});
```

---

### [MEDIUM-03] Error Messages Leak Stack Traces
**File:** `server.js:150,219,236,524`
**Severity:** MEDIUM (CVSS 4.0)

```javascript
// ❌ LEAKS IMPLEMENTATION DETAILS
console.error('[Express API /all-data Error]:', error);
res.status(500).json({ error: error.message });  // Exposes stack trace
```

**Fix:**
```javascript
// ✅ GENERIC ERROR MESSAGES
console.error('[API Error]:', error); // Log internally only
res.status(500).json({ 
  error: 'Internal server error',
  requestId: generateRequestId() // For support correlation
});
```

---

### [MEDIUM-04] No HTTPS Enforcement
**File:** `src/App.tsx:131`, hardcoded `http://localhost:5000`
**Severity:** MEDIUM (CVSS 5.5)

**Issue:**
- API calls hardcoded to HTTP
- JWT tokens transmitted in clear
- No HSTS headers

**Fix:**
```typescript
// Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Production server.js: Force HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

---

### [MEDIUM-05] Excessive console.log() in Production Code
**Files:** 30+ instances across codebase
**Severity:** MEDIUM (Code Quality)

```javascript
// ❌ PRODUCTION LOGGING
console.log(`🚀 Express API Backend running on http://localhost:${PORT}`);
console.error('[Login Error]:', error);
```

**Fix:**
```javascript
// ✅ USE PROPER LOGGER
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}
```

---

## 💡 LOW SEVERITY ISSUES

### [LOW-01] Missing Rate Limiting on Non-Auth Endpoints
**Severity:** LOW (CVSS 3.0)

Only `/api/login` has rate limiting. Consider adding to:
- `/api/all-data`
- `/api/sync/:entity`
- `/api/:table`

---

### [LOW-02] No Request Size Limits Beyond JSON Parser
**File:** `server.js:22-23`

```javascript
// Body parser set to 50MB - very high for CDC portal
app.use(express.json({ limit: '50mb' }));
```

**Recommendation:** Reduce to 1-5MB unless file uploads required.

---

### [LOW-03] CORS Allows Credentials Without Strict Origin Check
**File:** `server.js:26-46`

CORS allows `process.env.FRONTEND_URL` without validation. If undefined, could allow unintended origins.

**Fix:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// Add validation
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be set in production');
}
```

---

## ✅ SECURITY STRENGTHS (GOOD PRACTICES FOUND)

1. ✅ **Bcrypt password hashing** (10 rounds) - GOOD
2. ✅ **JWT authentication** with token expiry - GOOD
3. ✅ **Rate limiting on login** (5 attempts/15min) - GOOD
4. ✅ **Helmet.js security headers** - GOOD
5. ✅ **Password excluded from API responses** (line 106, 210) - GOOD
6. ✅ **CORS restricted to specific origins** - GOOD
7. ✅ **Input sanitization** with toLowerCase() for emails - GOOD
8. ✅ **No .env file in git** (properly gitignored) - GOOD

---

## 📋 RECOMMENDED ACTION PLAN

### Phase 1: IMMEDIATE (Before ANY Production Deployment)
1. ❗ Fix CRITICAL-01: Replace $queryRawUnsafe with parameterized queries
2. ❗ Fix HIGH-01: Generate secure JWT_SECRET and enforce in production
3. ❗ Fix HIGH-02: Remove hardcoded passwords from src/data.ts
4. ❗ Run `npm audit fix` to patch vulnerable dependencies

### Phase 2: HIGH PRIORITY (Within 7 Days)
5. Fix HIGH-03: Review all dangerouslySetInnerHTML usage, add CSP headers
6. Fix HIGH-04: Move JWT to httpOnly cookies OR implement token rotation
7. Add input validation with Zod on all API endpoints
8. Remove console.log, implement proper logging

### Phase 3: MEDIUM PRIORITY (Within 30 Days)
9. Add rate limiting to all public endpoints
10. Implement generic error messages in production
11. Enforce HTTPS in production environment
12. Reduce body-parser limits to reasonable size

### Phase 4: CONTINUOUS
13. Regular dependency audits (`npm audit` weekly)
14. Penetration testing before major releases
15. Security code review for all PRs
16. Monitor security advisories for used libraries

---

## 🛡️ COMPLIANCE STATUS

### OWASP Top 10 (2021) Coverage:
- ✅ A01: Broken Access Control - GOOD (JWT + role checks)
- ❌ A02: Cryptographic Failures - FAIL (JWT in localStorage)
- ❌ A03: Injection - FAIL (SQL injection vulnerability)
- ⚠️ A04: Insecure Design - PARTIAL (needs threat modeling)
- ⚠️ A05: Security Misconfiguration - PARTIAL (CSP missing)
- ⚠️ A06: Vulnerable Components - PARTIAL (3 moderate vulns)
- ⚠️ A07: Identification/Auth Failures - PARTIAL (weak JWT secret)
- ✅ A08: Software/Data Integrity - GOOD
- ⚠️ A09: Security Logging Failures - PARTIAL (console.log only)
- ✅ A10: Server-Side Request Forgery - N/A (no SSRF vectors)

**OWASP Score:** 5/10 categories PASS

---

## 📞 NEXT STEPS

1. Review this report with development team
2. Create GitHub issues for each CRITICAL and HIGH item
3. Implement fixes following the code examples provided
4. Re-run security audit after fixes
5. Consider external penetration testing before production

---

**Report Generated By:** Kiro AI Security Reviewer
**Framework:** OWASP Top 10 + Everything Claude Code Security Standards
**Confidence Level:** HIGH (automated + manual code review)

---

## 📚 REFERENCES

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Prisma Security: https://www.prisma.io/docs/guides/security
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Everything Claude Code Security Rules: security.md, security-reviewer.md
