import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const meta = import.meta as any;

const supabaseUrl =
  (typeof meta !== 'undefined' && meta.env && meta.env.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://wrhybdieqoyqhricplci.supabase.co';

const supabaseAnonKey =
  (typeof meta !== 'undefined' && meta.env && meta.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

if (!supabaseAnonKey) {
  console.warn(
    '[Supabase Client] SUPABASE_ANON_KEY tidak di-set. ' +
    'Salin .env.example ke .env dan isi VITE_SUPABASE_ANON_KEY dari Supabase Dashboard → Project Settings → API.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
