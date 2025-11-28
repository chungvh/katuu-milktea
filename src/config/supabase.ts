import { createClient } from '@supabase/supabase-js';

// Get from .env file (Vite automatically loads these)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('supabase.co');
};

// Log configuration status
if (isSupabaseConfigured()) {
  console.log('✅ Supabase configured:', supabaseUrl);
} else {
  console.warn('⚠️ Supabase not configured, using localStorage fallback');
}

