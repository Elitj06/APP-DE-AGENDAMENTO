import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const studioId = session.metadata?.studio_id
      const plan = session.metadata?.plan as keyof typeof STRIPE_PLANS

      if (studioId && plan) {
        await supabase.from('studios').update({
          plan: plan,
          plan_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          max_students: STRIPE_PLANS[plan].maxStudents,
          max_trainers: STRIPE_PLANS[plan].maxTrainers,
        }).eq('id', studioId)
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: studio } = await supabase
        .from('studios').select('id').eq('stripe_customer_id', customerId).single()

      if (studio) {
        await supabase.from('studio_billing').insert({
          studio_id: studio.id,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_paid / 100,
          status: 'paid',
          paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
          period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString().split('T')[0] : null,
          period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString().split('T')[0] : null,
        })

        await supabase.from('studios').update({ plan_status: 'active' }).eq('id', studio.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('studios')
        .update({ plan_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('studios')
        .update({ plan_status: 'cancelled', plan: 'starter' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
