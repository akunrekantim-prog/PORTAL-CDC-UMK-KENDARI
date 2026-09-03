import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const meta = import.meta as any;

const supabaseUrl =
  (typeof meta !== 'undefined' && meta.env && meta.env.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  (typeof meta !== 'undefined' && meta.env && meta.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase Client] VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY harus di-set. ' +
    'Salin .env.example ke .env dan isi credentials dari Supabase Dashboard → Project Settings → API.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
