import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  planName: z.string().optional(),
  planPrice: z.number().optional(),
  planStart: z.string().optional(),
  planExpiry: z.string().optional(),
  paymentDay: z.number().min(1).max(28).optional(),
  gender: z.enum(['M', 'F']).optional(),
  birthDate: z.string().optional(),
})

// GET /api/students — listar alunos do studio
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')

  let query = supabase
    .from('students')
    .select('*')
    .eq('studio_id', profile.studio_id)
    .order('name')

  if (status) query = query.eq('status', status as 'active' | 'inactive' | 'overdue' | 'suspended')
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST /api/students — cadastrar aluno
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  try {
    const body = createSchema.parse(await req.json())

    const { data, error } = await supabase
      .from('students')
      .insert({
        studio_id: profile.studio_id,
        name: body.name,
        phone: body.phone,
        email: body.email,
        plan_name: body.planName,
        plan_price: body.planPrice,
        plan_start: body.planStart,
        plan_expiry: body.planExpiry,
        payment_day: body.paymentDay,
        gender: body.gender,
        birth_date: body.birthDate,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    // Criar pagamento inicial se tiver plano
    if (body.planPrice && body.paymentDay) {
      const now = new Date()
      const dueDate = new Date(now.getFullYear(), now.getMonth(), body.paymentDay)
      if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1)

      await supabase.from('student_payments').insert({
        studio_id: profile.studio_id,
        student_id: data.id,
        amount: body.planPrice,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
