// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[Supabase] URL:', supabaseUrl || '❌ MISSING');
console.log('[Supabase] Anon key starts with:', supabaseAnon ? supabaseAnon.slice(0, 20) + '...' : '❌ MISSING');

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,   // set false to avoid issues on localhost
    },
  }
);
