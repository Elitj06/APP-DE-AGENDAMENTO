import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/studio — dados do studio autenticado
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('id', profile.studio_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// PATCH /api/studio — atualizar configurações do studio
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const body = await req.json()

  // Campos permitidos de atualizar
  const allowed = [
    'name', 'phone', 'email', 'address', 'city', 'state', 'description',
    'logo_url', 'coins_per_checkin', 'bonus_weekly_goal', 'bonus_monthly_15',
    'bonus_monthly_20', 'referral_bonus', 'zapi_instance_id', 'zapi_token',
    'whatsapp_connected',
  ]

  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const { data, error } = await supabase
    .from('studios')
    .update(updates)
    .eq('id', profile.studio_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
