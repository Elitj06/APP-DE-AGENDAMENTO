import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  trainerId: z.string().uuid(),
  name: z.string().min(2),
  type: z.string().min(2),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  durationMin: z.number().default(60),
  maxCapacity: z.number().default(20),
  location: z.string().optional(),
  color: z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  const { data, error } = await supabase
    .from('schedule_slots')
    .select('*, trainers(name, specialty)')
    .eq('studio_id', profile!.studio_id!)
    .eq('active', true)
    .order('day_of_week')
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  try {
    const body = schema.parse(await req.json())

    const { data, error } = await supabase
      .from('schedule_slots')
      .insert({
        studio_id: profile!.studio_id!,
        trainer_id: body.trainerId,
        name: body.name,
        type: body.type,
        day_of_week: body.dayOfWeek,
        start_time: body.startTime,
        end_time: body.endTime,
        duration_min: body.durationMin,
        max_capacity: body.maxCapacity,
        location: body.location,
        color: body.color || '#f97316',
      })
      .select('*, trainers(name)')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
