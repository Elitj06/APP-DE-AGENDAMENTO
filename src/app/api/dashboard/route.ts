import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/dashboard — KPIs em tempo real do studio
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  if (!profile?.studio_id) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const studioId = profile.studio_id
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: overdueStudents },
    { count: todayCheckins },
    { count: todayAppointments },
    { data: payments },
    { data: lastMonthPayments },
    { data: studio },
    { data: recentCheckins },
    { data: rankingTop5 },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('studio_id', studioId),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('status', 'active'),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('status', 'overdue'),
    supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).gte('created_at', today),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('date', today),
    supabase.from('student_payments').select('amount').eq('studio_id', studioId).eq('status', 'paid').gte('paid_at', startOfMonth),
    supabase.from('student_payments').select('amount').eq('studio_id', studioId).eq('status', 'paid').gte('paid_at', startOfLastMonth).lte('paid_at', endOfLastMonth),
    supabase.from('studios').select('name, plan, plan_status, trial_ends_at, max_students').eq('id', studioId).single(),
    supabase.from('checkins').select('created_at, students(name, level, coins)').eq('studio_id', studioId).order('created_at', { ascending: false }).limit(10),
    supabase.from('monthly_rankings').select('checkins, coins_earned, students(name, level, avatar_url)').eq('studio_id', studioId).eq('year', now.getFullYear()).eq('month', now.getMonth() + 1).order('checkins', { ascending: false }).limit(5),
  ])

  const mrr = (payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0)
  const lastMrr = (lastMonthPayments || []).reduce((s: number, p: any) => s + Number(p.amount), 0)
  const mrrGrowth = lastMrr === 0 ? 100 : ((mrr - lastMrr) / lastMrr) * 100
  const retentionRate = totalStudents ? ((activeStudents || 0) / totalStudents) * 100 : 0

  return NextResponse.json({
    studio,
    kpis: {
      totalStudents,
      activeStudents,
      overdueStudents,
      retentionRate: Number(retentionRate.toFixed(1)),
      todayCheckins,
      todayAppointments,
      mrr,
      mrrGrowth: Number(mrrGrowth.toFixed(1)),
    },
    recentCheckins,
    rankingTop5,
  })
}
