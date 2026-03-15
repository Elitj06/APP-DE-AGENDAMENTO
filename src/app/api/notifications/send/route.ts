import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsApp, buildTemplate } from '@/lib/whatsapp'
import { z } from 'zod'

const schema = z.object({
  studentIds: z.array(z.string().uuid()),
  message: z.string().min(1),
  templateId: z.string().uuid().optional(),
})

// POST /api/notifications/send — envio manual em massa
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  const { data: studio } = await supabase
    .from('studios')
    .select('id, zapi_instance_id, zapi_token, whatsapp_connected, plan')
    .eq('id', profile!.studio_id!)
    .single()

  if (!studio?.whatsapp_connected) {
    return NextResponse.json({ error: 'WhatsApp não conectado. Configure em Configurações.' }, { status: 400 })
  }

  if (studio.plan === 'starter') {
    return NextResponse.json({ error: 'WhatsApp em massa disponível nos planos Pro e Enterprise.' }, { status: 403 })
  }

  const body = schema.parse(await req.json())

  const { data: students } = await supabase
    .from('students')
    .select('id, name, phone, level, coins')
    .in('id', body.studentIds)
    .eq('studio_id', studio.id)
    .eq('status', 'active')

  const results = await Promise.allSettled(
    (students || []).map(async (student) => {
      const message = buildTemplate(body.message, {
        nome: student.name.split(' ')[0],
        nivel: student.level,
        coins: String(student.coins),
      })

      const sent = await sendWhatsApp({
        instanceId: studio.zapi_instance_id!,
        token: studio.zapi_token!,
        phone: student.phone,
        message,
      })

      // Log
      await supabase.from('notification_logs').insert({
        studio_id: studio.id,
        student_id: student.id,
        channel: 'whatsapp',
        message,
        status: 'sent',
        external_id: sent?.zaapId,
      })

      return { studentId: student.id, success: true }
    })
  )

  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ sent: successful, failed, total: results.length })
}
