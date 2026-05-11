// Supabase client singleton. Reads URL + publishable key from Vite env vars
// at build time. Safe to expose in client bundle — security is enforced by
// row-level security policies on each table (see supabase/schema.sql).
//
// If env vars are missing (e.g., dev clone without Supabase setup), the
// client is still constructed but every query will fail. Callers should
// check hasSupabaseConfig before relying on cloud features.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

export const hasSupabaseConfig = !!(SUPABASE_URL && SUPABASE_KEY);

if (!hasSupabaseConfig) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_KEY not set. Auth and cloud sync are disabled.\n' +
    'Add them to .env.local for local dev, or to Vercel env vars for production.'
  );
}

// Custom storage key prevents collision with other Supabase apps on the same
// origin. Session persists in localStorage by default.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_KEY || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'tuk-talk-thai-auth',
    },
  }
);
