import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// ─── Planos no Stripe ─────────────────────────────────────────
export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    name: 'Starter',
    price: 14900,      // R$ 149/mês em centavos
    maxStudents: 50,
    maxTrainers: 1,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: 'Pro',
    price: 29700,      // R$ 297/mês em centavos
    maxStudents: 200,
    maxTrainers: 5,
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    name: 'Enterprise',
    price: 59700,      // R$ 597/mês em centavos
    maxStudents: 99999,
    maxTrainers: 99999,
  },
} as const

export type PlanKey = keyof typeof STRIPE_PLANS

// ─── Criar sessão de checkout ─────────────────────────────────
export async function createCheckoutSession({
  studioId,
  plan,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  studioId: string
  plan: PlanKey
  customerEmail: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: STRIPE_PLANS[plan].priceId, quantity: 1 }],
    customer_email: customerEmail,
    metadata: { studio_id: studioId, plan },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 14,
      metadata: { studio_id: studioId, plan },
    },
  })

  return session
}

// ─── Criar portal de faturamento ──────────────────────────────
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
