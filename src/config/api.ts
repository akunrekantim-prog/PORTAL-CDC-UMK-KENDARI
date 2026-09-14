/**
 * Sumber kebenaran tunggal untuk alamat backend API.
 *
 * Prinsip: SELALU relative (`/api`) di semua lingkungan — dev, testing (Vercel),
 * dan server kampus. Yang mengarahkan `/api` adalah lapisan infrastruktur:
 *   - Dev          → vite.config.ts `server.proxy` → localhost:5000
 *   - Vercel       → vercel.json `rewrites`
 *   - Server kampus→ nginx `location /api` → Node :5000
 *
 * Dengan begitu SATU build artifact yang sama dipakai di ketiga lingkungan,
 * tanpa perlu rebuild saat pindah dari test bed ke server kampus.
 *
 * Mengganti nilai ini menjadi URL absolut (mis. https://api.contoh.com/api) akan
 * mengikat build ke satu host dan memaksa rebuild + retest saat deploy ke kampus.
 *
 * CATATAN: sengaja TIDAK ada fallback ke http://localhost:5000. Hardcode itu yang
 * dulu membuat build produksi diam-diam menembak localhost, sehingga login & CRUD
 * mati di server sementara tampak normal di laptop dev.
 */

const RAW: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL) ||
  '/api';

/**
 * Normalisasi nilai env menjadi base URL yang konsisten.
 * - Buang spasi & trailing slash.
 * - Nilai relative (`/api`) dibiarkan apa adanya.
 * - Nilai absolut tanpa `/api` (mis. `https://api.contoh.com`) ditempeli `/api`.
 */
export function normalizeApiBase(raw: string): string {
  const trimmed = String(raw).trim().replace(/\/+$/, '');
  if (!trimmed) return '/api';
  if (trimmed.startsWith('/')) return trimmed;
  if (/\/api$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api`;
}

export const API_BASE_URL: string = normalizeApiBase(RAW);

export default API_BASE_URL;
