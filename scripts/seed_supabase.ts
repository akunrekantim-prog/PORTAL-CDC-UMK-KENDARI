import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Fungsi untuk memecah string SQL menjadi perintah individual
function splitSqlStatements(sql: string): string[] {
  // Hapus komentar RAISE NOTICE yang tidak valid di luar blok DO/function
  const cleanSql = sql
    .replace(/RAISE NOTICE [^;]+;/gi, '')
    .trim();

  // Pisahkan berdasarkan titik koma, tetapi tidak di dalam $$ ... $$ (fungsi/trigger)
  const statements: string[] = [];
  let currentStmt = '';
  let inDollarBlock = false;
  let dollarTag = '';

  const lines = cleanSql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Abaikan baris komentar tunggal
    if (trimmed.startsWith('--') && !inDollarBlock) continue;

    // Cek tag dollar $$
    const dollarMatch = line.match(/\$\$|\$[a-zA-Z0-9_]*\$/g);
    if (dollarMatch) {
      for (const tag of dollarMatch) {
        if (!inDollarBlock) {
          inDollarBlock = true;
          dollarTag = tag;
        } else if (tag === dollarTag) {
          inDollarBlock = false;
          dollarTag = '';
        }
      }
    }

    currentStmt += line + '\n';

    if (!inDollarBlock && trimmed.endsWith(';')) {
      const stmtToPush = currentStmt.trim();
      if (stmtToPush.length > 0) {
        statements.push(stmtToPush);
      }
      currentStmt = '';
    }
  }

  if (currentStmt.trim().length > 0) {
    statements.push(currentStmt.trim());
  }

  return statements;
}

async function runSeed() {
  console.log('🚀 Memulai eksekusi SQL ke Supabase...\n');

  try {
    // 1. Eksekusi 001_create_all_tables.sql
    const sqlTablesPath = path.join(process.cwd(), 'supabase', 'migrations', '001_create_all_tables.sql');
    if (fs.existsSync(sqlTablesPath)) {
      console.log('📝 Memproses 001_create_all_tables.sql...');
      const sqlTables = fs.readFileSync(sqlTablesPath, 'utf8');
      const statements = splitSqlStatements(sqlTables);

      let successCount = 0;
      for (const stmt of statements) {
        if (!stmt || stmt === ';') continue;
        try {
          await prisma.$executeRawUnsafe(stmt);
          successCount++;
        } catch (err: any) {
          // Abaikan error "already exists" agar idempoten
          if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate'))) {
            continue;
          }
          console.warn(`⚠️ Warning pada statement:\n${stmt.slice(0, 80)}...\nDetail: ${err.message}\n`);
        }
      }
      console.log(`✅ ${successCount} statement skema tabel berhasil dieksekusi!\n`);
    }

    // 2. Eksekusi 002_seed_data.sql
    const sqlSeedPath = path.join(process.cwd(), 'supabase', 'migrations', '002_seed_data.sql');
    if (fs.existsSync(sqlSeedPath)) {
      console.log('🌱 Memproses 002_seed_data.sql...');
      const sqlSeed = fs.readFileSync(sqlSeedPath, 'utf8');
      const statements = splitSqlStatements(sqlSeed);

      let seedCount = 0;
      for (const stmt of statements) {
        if (!stmt || stmt === ';') continue;
        try {
          await prisma.$executeRawUnsafe(stmt);
          seedCount++;
        } catch (err: any) {
          if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate') || err.message.includes('unique constraint'))) {
            continue;
          }
          console.warn(`⚠️ Warning pada statement seed:\n${stmt.slice(0, 80)}...\nDetail: ${err.message}\n`);
        }
      }
      console.log(`✅ ${seedCount} statement data seed berhasil dimasukkan!\n`);
    }

    console.log('🎉 SELESAI BERHASIL! Database Supabase Anda telah terisi data seed.');
  } catch (error) {
    console.error('❌ Terjadi kesalahan fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();
