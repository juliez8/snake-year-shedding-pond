/**
 * Supabase clients.
 * - Anon: browser, read-only via RLS.
 * - Service role: server-only, full access for trusted API routes.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return serverClient;
}
