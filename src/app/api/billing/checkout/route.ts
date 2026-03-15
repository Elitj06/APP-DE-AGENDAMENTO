import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createBillingPortalSession, type PlanKey } from '@/lib/stripe'
import { z } from 'zod'

// POST /api/billing/checkout — iniciar checkout no Stripe
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('studio_id').eq('id', user.id).single()

  const { data: studio } = await supabase
    .from('studios').select('id, email, stripe_customer_id').eq('id', profile!.studio_id!).single()

  const { plan } = z.object({ plan: z.enum(['starter', 'pro', 'enterprise']) }).parse(await req.json())
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL!

  // Se já tem customer, redirecionar para portal
  if (studio?.stripe_customer_id) {
    const portalSession = await createBillingPortalSession({
      customerId: studio.stripe_customer_id,
      returnUrl: `${origin}/painel/configuracoes`,
    })
    return NextResponse.json({ url: portalSession.url })
  }

  const session = await createCheckoutSession({
    studioId: studio!.id,
    plan: plan as PlanKey,
    customerEmail: studio!.email || user.email!,
    successUrl: `${origin}/painel/configuracoes?upgrade=success`,
    cancelUrl: `${origin}/painel/configuracoes`,
  })

  return NextResponse.json({ url: session.url })
}
