/**
 * supabase.ts — single source of truth for Supabase configuration.
 *
 * SETUP (this is the only file you should need to touch to go live):
 *   1. Create a project at https://supabase.com
 *   2. Project Settings → API → copy "Project URL" and "anon public" key
 *   3. Add them to `.env.local` (see `.env.example`):
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *   4. In Supabase Auth settings, enable "Email" provider (Email+Password).
 *      Disable "Confirm email" while testing locally, or check your inbox
 *      after signup.
 *
 * Every user gets a Supabase-issued JWT (session.access_token). That token
 * is attached automatically as an Authorization header on every backend
 * API call (see `api.ts`) so your Flask backend can verify who's calling
 * it — see `backend/app/auth.py` for the matching verification helper.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly at build/runtime rather than silently no-op-ing auth —
  // a misconfigured deployment should be obvious, not a confusing 401 loop.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Auth will not work until you configure .env.local — see .env.example."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
