import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'https://tuggmosuqiasletsjera.supabase.co';
const fallbackSupabaseAnonKey = 'sb_publishable_oKlOsd9n98HmQwUBrc4ktQ_Ne4HMvj2';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
