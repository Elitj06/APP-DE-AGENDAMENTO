import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSchema = z.object({
  studentId: z.string().uuid(),
  name: z.string().min(1),
  muscleGroups: z.array(z.string()).min(1),
  description: z.string().optional(),
})

// GET /api/workout-prescriptions?studentId=...
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()
  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const studentId = new URL(req.url).searchParams.get('studentId')
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('workout_prescriptions')
    .select('*')
    .eq('studio_id', profile.studio_id)
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/workout-prescriptions
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
      .from('workout_prescriptions')
      .insert({
        studio_id: profile.studio_id,
        student_id: body.studentId,
        name: body.name,
        muscle_groups: body.muscleGroups,
        description: body.description ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
