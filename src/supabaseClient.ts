import { createClient } from '@supabase/supabase-js';

// Si defines VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env, se conectará en vivo.
// De lo contrario, funcionará automáticamente en modo local con LocalStorage.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
