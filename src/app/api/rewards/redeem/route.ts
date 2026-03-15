import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/whatsapp'
import { z } from 'zod'

const schema = z.object({
  studentId: z.string().uuid(),
  rewardId: z.string().uuid(),
  studioId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient()

  try {
    const body = schema.parse(await req.json())

    const { data, error } = await supabase.rpc('redeem_reward', {
      p_studio_id: body.studioId,
      p_student_id: body.studentId,
      p_reward_id: body.rewardId,
    })

    if (error) throw error

    const result = data as {
      success: boolean
      reward_name: string
      coins_spent: number
      new_balance: number
    }

    // Notificação WhatsApp
    const [{ data: student }, { data: studio }] = await Promise.all([
      supabase.from('students').select('name, phone').eq('id', body.studentId).single(),
      supabase.from('studios').select('zapi_instance_id, zapi_token, whatsapp_connected').eq('id', body.studioId).single(),
    ])

    if (studio?.whatsapp_connected && studio.zapi_instance_id && studio.zapi_token && student?.phone) {
      await sendNotification({
        instanceId: studio.zapi_instance_id,
        token: studio.zapi_token,
        phone: student.phone,
        templateKey: 'reward_redeemed',
        vars: {
          nome: student.name.split(' ')[0],
          premio: result.reward_name,
          coins: String(result.coins_spent),
        },
      }).catch(console.error)
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
