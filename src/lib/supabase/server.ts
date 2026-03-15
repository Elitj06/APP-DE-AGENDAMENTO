import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

function cookieHandlers(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    getAll() { return cookieStore.getAll() },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      } catch {}
    },
  }
}

// Cast to SupabaseClient<Database> to work around a type-parameter ordering
// mismatch between @supabase/ssr v0.5.x and @supabase/supabase-js v2.99+.
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieHandlers(cookieStore) }
  ) as unknown as SupabaseClient<Database>
}

export async function createServiceClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: cookieHandlers(cookieStore) }
  ) as unknown as SupabaseClient<Database>
}
