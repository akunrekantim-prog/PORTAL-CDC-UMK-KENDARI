/**
 * SECURITY HARDENING — Row Level Security (RLS) Policy
 * Portal CDC Universitas Muhammadiyah Kendari
 *
 * Menambahkan granular RLS policies untuk tabel sensitif:
 *   - pengajuan_magangs  (data lamaran mahasiswa)
 *   - tracer_studies      (survei karir alumni)
 *   - uploaded_documents  (file upload mahasiswa)
 *
 * Idempotent: DROP POLICY IF EXISTS sebelum CREATE.
 * Menggunakan Prisma $executeRawUnsafe() — tidak perlu dependency tambahan.
 *
 * CARA JALAN:
 *   npm run db:harden           # apply policies
 *   npm run db:verify-rls       # cek status RLS (read-only)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── WARNA TERMINAL ────────────────────────────────────────────────
const C = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
};

// ─── RLS POLICIES (kolom pakai camelCase sesuai Prisma/DB) ─────────
const RLS_POLICIES = [
  {
    table: 'pengajuan_magangs',
    description: 'Data lamaran/ajuan mahasiswa ke lowongan',
    enableRls: true,
    policies: [
      {
        name: 'rls_mahasiswa_baca_pengajuan_sendiri',
        action: 'SELECT',
        // userId di Supabase auth = userId di tabel (bukan mahasiswaId)
        // Karena saat register, userId = id dari tabel users
        sql: `auth.uid()::text = "userId"::text`,
      },
      {
        name: 'rls_service_role_pengajuan_full',
        action: 'ALL',
        sql: `(SELECT role FROM users WHERE id::text = auth.uid()::text) = 'ADMIN'`,
      },
    ],
  },
  {
    table: 'tracer_studies',
    description: 'Survei karir lulusan / tracer study',
    enableRls: true,
    policies: [
      {
        name: 'rls_user_baca_tracer_study_sendiri',
        action: 'SELECT',
        sql: `auth.uid()::text = "userId"::text`,
      },
    ],
  },
  {
    table: 'uploaded_documents',
    description: 'Dokumen upload mahasiswa (CV, transkrip, KTP)',
    enableRls: true,
    policies: [
      {
        name: 'rls_user_baca_dokumen_sendiri',
        action: 'SELECT',
        sql: `auth.uid()::text = "userId"::text`,
      },
    ],
  },
];

// ─── FUNGSI HELPERS ────────────────────────────────────────────────
async function execSql(sql: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.$executeRawUnsafe(sql);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

async function querySql<T = any>(sql: string): Promise<T[]> {
  return prisma.$queryRawUnsafe<T[]>(sql);
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await querySql<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${table}'
     ) AS exists`
  );
  return rows[0]?.exists ?? false;
}

async function rlsEnabled(table: string): Promise<boolean> {
  const rows = await querySql<{ relrowsecurity: boolean }>(
    `SELECT relrowsecurity FROM pg_class
     WHERE relname = '${table}'
       AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')`
  );
  return rows[0]?.relrowsecurity ?? false;
}

async function getExistingPolicies(table: string): Promise<string[]> {
  const rows = await querySql<{ policyname: string }>(
    `SELECT policyname FROM pg_policies
     WHERE tablename = '${table}' AND schemaname = 'public'`
  );
  return rows.map((r) => r.policyname);
}

// ─── MODE: VERIFY ──────────────────────────────────────────────────
async function verifyRls() {
  console.log(C.bold('\n🔍 VERIFIKASI STATUS RLS — Portal CDC UM Kendari\n'));

  for (const entry of RLS_POLICIES) {
    const exists = await tableExists(entry.table);
    if (!exists) {
      console.log(C.yellow(`  ⚠  Tabel "${entry.table}" tidak ditemukan — skip`));
      continue;
    }

    const enabled = await rlsEnabled(entry.table);
    const policies = await getExistingPolicies(entry.table);

    console.log(C.bold(`  📋 ${entry.table}`));
    console.log(`     Deskripsi : ${entry.description}`);
    console.log(`     RLS       : ${enabled ? C.green('AKTIF ✅') : C.red('MATI ❌')}`);
    console.log(`     Policies  : ${policies.length > 0 ? policies.join(', ') : C.yellow('Tidak ada policy')}`);
    console.log('');
  }
}

// ─── MODE: APPLY ───────────────────────────────────────────────────
async function applyRls() {
  console.log(C.bold('\n🛡️  SECURITY HARDENING — Menerapkan RLS Policies\n'));
  console.log(C.cyan('   Portal CDC Universitas Muhammadiyah Kendari'));
  console.log(C.cyan('   Menggunakan Prisma $executeRawUnsafe()\n'));

  let totalOk = 0;
  let totalFail = 0;

  for (const entry of RLS_POLICIES) {
    const exists = await tableExists(entry.table);
    if (!exists) {
      console.log(C.yellow(`  ⚠  Tabel "${entry.table}" tidak ditemukan — skip`));
      continue;
    }

    console.log(C.bold(`  📋 ${entry.table} — ${entry.description}`));

    // 1. Enable RLS (idempotent)
    if (entry.enableRls) {
      const { ok, error } = await execSql(
        `ALTER TABLE "${entry.table}" ENABLE ROW LEVEL SECURITY`
      );
      if (ok) {
        console.log(`     ${C.green('✅')} RLS enabled`);
        totalOk++;
      } else if (error?.includes('already has row level')) {
        console.log(`     ${C.green('✅')} RLS sudah aktif`);
        totalOk++;
      } else {
        console.log(`     ${C.red('❌')} Gagal enable RLS: ${error}`);
        totalFail++;
      }
    }

    // 2. Force RLS (admin juga kena policy kecuali bypass via service role)
    const { ok: forceOk } = await execSql(
      `ALTER TABLE "${entry.table}" FORCE ROW LEVEL SECURITY`
    );
    if (forceOk) {
      console.log(`     ${C.green('✅')} FORCE RLS aktif`);
      totalOk++;
    }

    // 3. Apply each policy
    for (const policy of entry.policies) {
      // Drop dulu (idempotent)
      await execSql(`DROP POLICY IF EXISTS "${policy.name}" ON "${entry.table}"`);

      // Build SQL string — penting: jangan pakai template literal
      // Prisma $executeRawUnsafe membutuhkan SQL yang valid PostgreSQL
      const sql = [
        `CREATE POLICY "${policy.name}"`,
        `ON "${entry.table}"`,
        `FOR ${policy.action}`,
        `USING (${policy.sql})`
      ].join(' ');

      const { ok, error } = await execSql(sql);

      if (ok) {
        console.log(`     ${C.green('✅')} Policy "${policy.name}" (${policy.action})`);
        totalOk++;
      } else {
        console.log(`     ${C.red('❌')} Policy "${policy.name}" gagal: ${error}`);
        totalFail++;
      }
    }

    console.log('');
  }

  // Ringkasan
  console.log(C.bold('─'.repeat(50)));
  console.log(`  Total operasi : ${C.green(`${totalOk} berhasil`)} / ${totalFail > 0 ? C.red(`${totalFail} gagal`) : C.green('0 gagal')}`);

  if (totalFail === 0) {
    console.log(C.green('\n  ✅ Semua RLS policies berhasil diterapkan!\n'));
  } else {
    console.log(C.red('\n  ❌ Ada operasi yang gagal — periksa log di atas\n'));
  }

  // Verifikasi ulang
  await verifyRls();
}

// ─── MAIN ──────────────────────────────────────────────────────────
async function main() {
  const mode = process.argv[2] || 'apply';

  try {
    console.log(C.cyan('  🔌 Menghubungkan ke database...'));
    await querySql('SELECT 1 AS ok');
    console.log(C.green('  ✅ Koneksi OK\n'));

    if (mode === 'verify') {
      await verifyRls();
    } else {
      await applyRls();
    }
  } catch (e: any) {
    console.error(C.red(`\n  ❌ Gagal koneksi database: ${e.message}`));
    console.error(C.yellow('  Pastikan DATABASE_URL sudah benar di .env\n'));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
