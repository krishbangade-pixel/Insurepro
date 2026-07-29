import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create a Supabase client for use in the browser (Client Components).
 * Uses @supabase/ssr for proper cookie-based session management with Next.js.
 *
 * Guard: During Next.js build-time static page pre-rendering, env vars may be
 * undefined. We fall back to placeholder values so the build doesn't crash.
 * The real values MUST be set in the Vercel environment variable settings.
 */
export function createClient() {
  return createBrowserClient(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
}

