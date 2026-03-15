import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

// GET /api/qr/generate?studentId=...&studioId=...
// Gera QR Code único para check-in do aluno
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')
  const studioId = searchParams.get('studioId')

  if (!studentId || !studioId) {
    return NextResponse.json({ error: 'studentId e studioId obrigatórios' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Invalidar tokens anteriores do aluno
  await supabase
    .from('qr_tokens')
    .update({ expires_at: new Date().toISOString() })
    .eq('student_id', studentId)
    .eq('studio_id', studioId)
    .eq('used', false)

  // Gerar novo token (válido por 5 minutos)
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { data: tokenRow, error } = await supabase
    .from('qr_tokens')
    .insert({ student_id: studentId, studio_id: studioId, token, expires_at: expiresAt })
    .select('token, expires_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // URL de check-in que o scanner vai abrir
  const checkinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkin?token=${tokenRow.token}&studio=${studioId}`

  // Gerar QR Code como Data URL
  const qrDataUrl = await QRCode.toDataURL(checkinUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#ffffff', light: '#0a0a0a' },
  })

  return NextResponse.json({
    token: tokenRow.token,
    expiresAt: tokenRow.expires_at,
    qrDataUrl,
    checkinUrl,
  })
}
