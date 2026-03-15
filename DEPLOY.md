# GymFlow & Coins — Guia de Deploy

## Stack
- **Frontend/API**: Next.js 14 + TypeScript + Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL + Auth + Realtime)
- **Pagamentos**: Stripe
- **WhatsApp**: Z-API
- **Deploy**: Vercel
- **A/B Testing**: Hackle

---

## 1. Supabase — Configurar Banco

1. Criar projeto em https://supabase.com
2. Ir em **SQL Editor** → colar e executar `supabase/schema.sql`
3. Copiar as credenciais:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Stripe — Configurar Pagamentos

1. Criar conta em https://stripe.com/br
2. Criar 3 produtos (Starter / Pro / Enterprise) com assinatura mensal:
   - Starter: R$ 77,00/mês
   - Pro: R$ 147,00/mês
   - Enterprise: R$ 297,00/mês
3. Copiar os Price IDs de cada plano
4. Configurar webhook: `https://seu-dominio.vercel.app/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`

---

## 3. Z-API — WhatsApp

1. Criar conta em https://z-api.io
2. Criar instância e conectar número WhatsApp via QR Code
3. Copiar Instance ID e Token
4. Cada studio configura seu próprio número em Configurações > WhatsApp

---

## 4. Variáveis de Ambiente

Criar `.env.local` baseado em `.env.local.example` com todas as credenciais.

---

## 5. Deploy na Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Adicionar variáveis de ambiente no dashboard da Vercel:
- Settings → Environment Variables → adicionar todas do `.env.local`

---

## 6. Hackle — A/B Testing (Opcional mas Recomendado)

1. Criar conta em https://hackle.io
2. Criar experimentos:
   - **EXP-001**: CTA Landing Page (Variante A: "Ver Demo" | B: "Começar Grátis")
   - **EXP-002**: Trigger de reativação (7 dias vs 5 dias sem check-in)
   - **EXP-003**: Preço Starter (R$77 vs R$67 intro)
   - **EXP-004**: Onboarding (direto ao painel vs wizard 3 passos)
3. Adicionar SDK key: `NEXT_PUBLIC_HACKLE_SDK_KEY`

---

## Estrutura de Arquivos Criados

```
src/
├── app/
│   ├── page.tsx              ← Landing page (pricing atualizado)
│   ├── login/page.tsx        ← Login com Supabase Auth
│   ├── onboarding/page.tsx   ← Wizard de cadastro do studio
│   ├── checkin/page.tsx      ← Página de check-in por QR Code
│   ├── tv/page.tsx           ← TV Display com ranking ao vivo
│   ├── app/page.tsx          ← App do aluno (mock + hooks para real)
│   ├── painel/page.tsx       ← Dashboard do studio
│   └── api/
│       ├── auth/signup/      ← Cadastro de novo studio
│       ├── studio/           ← CRUD do studio
│       ├── students/         ← CRUD de alunos
│       ├── trainers/         ← CRUD de trainers
│       ├── appointments/     ← Agendamentos reais
│       ├── schedule-slots/   ← Grade de horários
│       ├── checkin/          ← Processar check-in + GymCoins
│       ├── qr/generate/      ← Gerar QR Code de check-in
│       ├── rewards/redeem/   ← Resgatar prêmios
│       ├── ranking/          ← Ranking mensal (público)
│       ├── dashboard/        ← KPIs em tempo real
│       ├── payments/         ← Pagamentos de alunos
│       ├── notifications/send/ ← Envio WhatsApp em massa
│       └── webhooks/stripe/  ← Webhook de pagamentos
├── lib/
│   ├── supabase/client.ts    ← Supabase browser client
│   ├── supabase/server.ts    ← Supabase server client
│   ├── stripe.ts             ← Stripe + planos
│   └── whatsapp.ts           ← Z-API + templates
├── middleware.ts              ← Auth guard das rotas
├── types/database.ts          ← Types completos do banco
supabase/
└── schema.sql                 ← Schema completo + triggers + RLS
```

---

## Próximos Passos (Fase 2)

- [ ] Implementar Supabase Realtime no TV Display (sem polling)
- [ ] PWA com push notifications para alunos
- [ ] Integração Hackle SDK no frontend
- [ ] Automação de notificações (cron via Vercel ou Supabase Edge Functions)
- [ ] Relatório PDF exportável
- [ ] App React Native (iOS + Android)
