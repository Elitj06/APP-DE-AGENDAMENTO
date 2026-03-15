import { createBrowserClient } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Cast to SupabaseClient<Database> — same version mismatch workaround as server.ts
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as SupabaseClient<Database>
}
