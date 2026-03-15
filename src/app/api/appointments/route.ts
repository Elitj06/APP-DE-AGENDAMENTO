import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSchema = z.object({
  studentId: z.string().uuid(),
  trainerId: z.string().uuid(),
  serviceType: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  slotId: z.string().uuid().optional(),
})

// GET /api/appointments
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const url = new URL(req.url)
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
  const studentId = url.searchParams.get('studentId')

  let query = supabase
    .from('appointments')
    .select(`
      *,
      students (id, name, phone, level, coins),
      trainers (id, name, specialty)
    `)
    .eq('studio_id', profile.studio_id)
    .order('time')

  if (studentId) {
    query = query.eq('student_id', studentId)
  } else {
    query = query.eq('date', date)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST /api/appointments — agendar aula
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  try {
    const body = createSchema.parse(await req.json())

    // Verificar conflito de horário
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('studio_id', profile.studio_id)
      .eq('student_id', body.studentId)
      .eq('date', body.date)
      .eq('time', body.time)
      .not('status', 'in', '("cancelled","no_show")')

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Aluno já tem aula neste horário' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        studio_id: profile.studio_id,
        student_id: body.studentId,
        trainer_id: body.trainerId,
        slot_id: body.slotId,
        service_type: body.serviceType,
        date: body.date,
        time: body.time,
        duration: body.duration,
        notes: body.notes,
        status: 'booked',
      })
      .select(`*, students(name, phone), trainers(name)`)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
