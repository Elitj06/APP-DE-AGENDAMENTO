import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/ranking?studioId=...&year=...&month=...
// Público — usado pelo TV Display e app do aluno
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const studioId = searchParams.get('studioId')
  const now = new Date()
  const year = Number(searchParams.get('year') || now.getFullYear())
  const month = Number(searchParams.get('month') || now.getMonth() + 1)

  if (!studioId) return NextResponse.json({ error: 'studioId obrigatório' }, { status: 400 })

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('monthly_rankings')
    .select(`
      checkins,
      coins_earned,
      rank,
      students (id, name, level, avatar_url, coins)
    `)
    .eq('studio_id', studioId)
    .eq('year', year)
    .eq('month', month)
    .order('checkins', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Adicionar posições
  const ranked = (data || []).map((item, index) => ({
    position: index + 1,
    ...item,
  }))

  return NextResponse.json(ranked)
}
