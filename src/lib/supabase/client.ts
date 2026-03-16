import { createBrowserClient } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Fallback URL/key prevent crash in demo mode (when env vars not configured)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder'

// Cast to SupabaseClient<Database> — same version mismatch workaround as server.ts
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY) as unknown as SupabaseClient<Database>
}
