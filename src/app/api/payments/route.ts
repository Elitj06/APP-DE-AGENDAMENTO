import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  const url = new URL(req.url)
  const status = url.searchParams.get('status')

  let query = supabase
    .from('student_payments')
    .select('*, students(name, phone, plan_name)')
    .eq('studio_id', profile!.studio_id!)
    .order('due_date', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status as 'pending' | 'paid' | 'overdue' | 'cancelled')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = (data || []).reduce((s, p) => s + Number(p.amount), 0)
  const paid = (data || []).filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
  const pending = (data || []).filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
  const overdue = (data || []).filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0)

  return NextResponse.json({ payments: data, stats: { total, paid, pending, overdue } })
}

const markPaidSchema = z.object({
  paymentId: z.string().uuid(),
  method: z.enum(['credit_card', 'pix', 'boleto', 'debit_card']).default('pix'),
})

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  const body = markPaidSchema.parse(await req.json())

  const { data, error } = await supabase
    .from('student_payments')
    .update({ status: 'paid', paid_at: new Date().toISOString(), method: body.method })
    .eq('id', body.paymentId)
    .eq('studio_id', profile!.studio_id!)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
