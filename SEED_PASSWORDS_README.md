# 🔐 Seed Account Credentials - CDC UMK Portal

## ⚠️ SECURITY NOTICE

**Plaintext passwords have been REMOVED from source code** (src/data.ts) as of security audit fix #3.

Seed accounts are now created via `scripts/seed_full_database.ts` which:
1. Reads passwords from environment variables
2. Hashes them with bcrypt (10 rounds)
3. Inserts hashed passwords into Supabase

---

## 🔑 Default Development Credentials

**IMPORTANT:** These are DEVELOPMENT-ONLY credentials. 
**DO NOT USE in production.** Change immediately after first deployment.

### Admin Account
- Email: `admin@umkendari.ac.id`
- Password: `admin123!` (temporary dev password)
- Role: Admin
- Access: Full system access

### Mahasiswa Account
- Email: `mhs@umkendari.ac.id`
- Password: `mahasiswa123!`
- Role: User (Mahasiswa)
- Access: Student portal features

### Alumni Account
- Email: `alumni@umkendari.ac.id`
- Password: `alumni123!`
- Role: User (Alumni)
- Access: Alumni portal features

### Mitra Account
- Email: `mitra@umkendari.ac.id`
- Password: `mitra123!`
- Role: Mitra
- Access: Partner portal features

---

## 🛠️ How to Seed Database with Passwords

### Option 1: Via Seed Script (Recommended)

```bash
# Set environment variables for seed passwords
export SEED_ADMIN_PASSWORD="admin123!"
export SEED_MAHASISWA_PASSWORD="mahasiswa123!"
export SEED_ALUMNI_PASSWORD="alumni123!"
export SEED_MITRA_PASSWORD="mitra123!"

# Run seed script
npm run seed
# Or: tsx scripts/seed_full_database.ts
```

### Option 2: Reseed with Hashed Passwords

```bash
# Script already implements bcrypt hashing
npm run tsx scripts/reseed_with_hashed_passwords.ts
```

### Option 3: Manual Password Reset via Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click on user → Reset password
3. Send password reset email
4. User changes password via email link

---

## 🔐 Production Password Requirements

Before deploying to production:

1. ✅ Change ALL seed passwords
2. ✅ Enforce strong password policy:
   - Minimum 12 characters
   - Uppercase + lowercase + numbers + symbols
   - No dictionary words
3. ✅ Enable 2FA for admin accounts
4. ✅ Set up password rotation policy (90 days)
5. ✅ Monitor failed login attempts (already rate-limited to 5/15min)

---

## 📝 Password Management Best Practices

### For Development
- Use password manager (1Password, Bitwarden, LastPass)
- Never commit passwords to git
- Store dev credentials in `.env.local` (gitignored)
- Rotate every 30 days

### For Production
- Use Supabase Auth password reset flow
- Force password change on first login
- Implement "forgot password" feature
- Log all password changes with audit trail
- Use Supabase RLS policies to restrict access

---

## 🚨 If Credentials are Compromised

1. **Immediate Actions:**
   ```bash
   # Reset all user passwords via Supabase Dashboard
   # Or programmatically:
   tsx scripts/emergency_password_reset.ts
   ```

2. **Rotate JWT_SECRET:**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Update .env
   JWT_SECRET="<new_secret>"
   
   # Restart server (invalidates all existing tokens)
   npm run server
   ```

3. **Check Audit Logs:**
   - Review Supabase Auth logs
   - Check Express server logs for suspicious activity
   - Review database access logs

4. **Notify Users:**
   - Send security alert email
   - Force re-authentication
   - Enable 2FA requirement

---

## 📚 Related Files

- `scripts/seed_full_database.ts` - Main seed script with bcrypt
- `scripts/reseed_with_hashed_passwords.ts` - Re-hash existing passwords
- `scripts/repair_null_passwords.ts` - Fix NULL password issues
- `server.js` - JWT authentication + rate limiting
- `.env.example` - Environment variables template

---

## 📞 Support

If you have issues with authentication:
1. Check server logs: `npm run server`
2. Verify JWT_SECRET is set in `.env`
3. Confirm Supabase credentials are correct
4. Test with Postman: `POST http://localhost:5000/api/login`

For security concerns, contact: admin@umkendari.ac.id
