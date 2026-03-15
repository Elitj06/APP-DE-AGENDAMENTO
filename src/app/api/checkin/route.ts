import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/whatsapp'
import { z } from 'zod'

const schema = z.object({
  token: z.string().optional(),        // QR Code token
  studentId: z.string().uuid().optional(), // PIN / manual
  appointmentId: z.string().uuid().optional(),
  method: z.enum(['qr_code', 'pin', 'manual', 'facial', 'nfc']).default('qr_code'),
  studioId: z.string().uuid(),
})

// POST /api/checkin — processar check-in
export async function POST(req: NextRequest) {
  const supabase = await createServiceClient()

  try {
    const body = schema.parse(await req.json())
    let studentId = body.studentId

    // Validar QR token e extrair studentId
    if (body.method === 'qr_code' && body.token) {
      const { data: qr, error } = await supabase
        .from('qr_tokens')
        .select('student_id, used, expires_at')
        .eq('token', body.token)
        .eq('studio_id', body.studioId)
        .single()

      if (error || !qr) return NextResponse.json({ error: 'QR Code inválido' }, { status: 400 })
      if (qr.used) return NextResponse.json({ error: 'QR Code já utilizado' }, { status: 400 })
      if (new Date(qr.expires_at) < new Date()) return NextResponse.json({ error: 'QR Code expirado' }, { status: 400 })

      studentId = qr.student_id

      // Marcar token como usado
      await supabase.from('qr_tokens').update({ used: true }).eq('token', body.token)
    }

    if (!studentId) return NextResponse.json({ error: 'Student ID obrigatório' }, { status: 400 })

    // Processar check-in via função SQL (credita coins, atualiza nível, ranking)
    const { data, error } = await supabase.rpc('process_checkin', {
      p_studio_id: body.studioId,
      p_student_id: studentId,
      p_appointment_id: body.appointmentId || null,
      p_method: body.method,
    })

    if (error) throw error

    const result = data as {
      success: boolean
      coins_earned: number
      bonus_coins: number
      new_balance: number
      new_level: string
      level_up: boolean
      monthly_checkins: number
    }

    // Buscar dados do aluno para WhatsApp
    const { data: student } = await supabase
      .from('students')
      .select('name, phone')
      .eq('id', studentId)
      .single()

    const { data: studio } = await supabase
      .from('studios')
      .select('zapi_instance_id, zapi_token, whatsapp_connected')
      .eq('id', body.studioId)
      .single()

    // Enviar WhatsApp se conectado
    if (studio?.whatsapp_connected && studio.zapi_instance_id && studio.zapi_token && student?.phone) {
      try {
        await sendNotification({
          instanceId: studio.zapi_instance_id,
          token: studio.zapi_token,
          phone: student.phone,
          templateKey: result.level_up ? 'level_up' : 'post_checkin',
          vars: {
            nome: student.name.split(' ')[0],
            coins: String(result.coins_earned),
            total_coins: String(result.new_balance),
            nivel: result.new_level,
            icone: getLevelIcon(result.new_level),
          },
        })
      } catch (whatsappError) {
        console.error('WhatsApp send failed:', whatsappError)
        // Não bloqueia o check-in se WhatsApp falhar
      }
    }

    return NextResponse.json({
      success: true,
      studentName: student?.name,
      coinsEarned: result.coins_earned,
      bonusCoins: result.bonus_coins,
      newBalance: result.new_balance,
      newLevel: result.new_level,
      levelUp: result.level_up,
      monthlyCheckins: result.monthly_checkins,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

function getLevelIcon(level: string): string {
  const icons: Record<string, string> = {
    'Iniciante': '🌱', 'Bronze': '🥉', 'Prata': '🥈',
    'Ouro': '🥇', 'Diamante': '💎', 'Lenda': '🔥',
  }
  return icons[level] || '⭐'
}
