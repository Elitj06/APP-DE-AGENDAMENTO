import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  studioName: z.string().min(2),
  studioType: z.enum(['personal', 'studio', 'micro_gym', 'pilates', 'crossfit', 'yoga']),
  phone: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const supabase = await createServiceClient()

    // 1. Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.name, role: 'owner' },
    })

    if (authError) throw authError

    const userId = authData.user.id

    // 2. Gerar slug único do studio
    const baseSlug = body.studioName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40)

    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    // 3. Criar studio
    const { data: studio, error: studioError } = await supabase
      .from('studios')
      .insert({
        owner_id: userId,
        name: body.studioName,
        slug,
        type: body.studioType,
        phone: body.phone,
        email: body.email,
        plan: 'starter' as const,
        plan_status: 'trial' as const,
      })
      .select()
      .single()

    if (studioError) throw studioError

    // 4. Criar perfil
    await supabase.from('profiles').insert({
      id: userId,
      studio_id: studio.id,
      full_name: body.name,
      phone: body.phone,
      role: 'owner',
    })

    // 5. Criar recompensas padrão
    await supabase.from('rewards').insert([
      { studio_id: studio.id, name: 'Squeeze Personalizada', emoji: '🧴', coins_cost: 50 },
      { studio_id: studio.id, name: 'Camiseta do Studio', emoji: '👕', coins_cost: 150 },
      { studio_id: studio.id, name: '1 Aula Grátis', emoji: '🎫', coins_cost: 200 },
      { studio_id: studio.id, name: 'Avaliação Física Completa', emoji: '📊', coins_cost: 300 },
      { studio_id: studio.id, name: '1 Mês Grátis', emoji: '🏆', coins_cost: 500 },
    ])

    return NextResponse.json({ success: true, studioId: studio.id, slug })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
