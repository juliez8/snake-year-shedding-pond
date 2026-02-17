import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-side Supabase client (uses anon key with RLS).
 * Only has SELECT access — cannot insert, update, or delete.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client for API routes.
 * Uses the service role key to bypass RLS for trusted server-side operations.
 * NEVER expose this client or its key to the browser.
 */
let serverClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (serverClient) return serverClient;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. ' +
      'Set it in production to enable tightened RLS policies.'
    );
    serverClient = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    serverClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serverClient;
}
