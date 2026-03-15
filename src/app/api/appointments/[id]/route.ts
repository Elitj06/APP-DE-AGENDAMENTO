import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['booked', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show']),
})

// PATCH /api/appointments/[id] — atualizar status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  try {
    const body = patchSchema.parse(await req.json())

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: body.status })
      .eq('id', params.id)
      .eq('studio_id', profile.studio_id)
      .select(`*, students(id, name, phone, level, coins), trainers(id, name, specialty), workout_prescriptions(id, name, muscle_groups)`)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE /api/appointments/[id] — cancelar agendamento
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', params.id)
    .eq('studio_id', profile.studio_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
