# GymFlow & Coins — Resumo do Projeto

## Visão Geral
SaaS para academias e estúdios fitness com sistema de gamificação (GymCoins), agendamento de aulas, prescrições de treino, relatórios e notificações via WhatsApp.

---

## Stack Técnica
- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript strict
- **Banco de Dados:** Supabase (PostgreSQL + RLS + Realtime)
- **Autenticação:** Supabase Auth
- **Estilização:** Tailwind CSS com tokens customizados
- **Gráficos:** Recharts
- **Validação:** Zod
- **Ícones:** Lucide React
- **Pagamentos:** Stripe (integração parcial)
- **WhatsApp:** Z-API
- **Deploy:** Vercel

---

## Credenciais do Supabase

| Campo | Valor |
|-------|-------|
| **Projeto** | Gym-System |
| **Project ID** | *(ver Supabase Dashboard)* |
| **URL** | *(configurar em .env.local via NEXT_PUBLIC_SUPABASE_URL)* |
| **Região** | us-west-2 |
| **Anon Key** | *(configurar em .env.local via NEXT_PUBLIC_SUPABASE_ANON_KEY)* |
| **Service Role Key** | ⚠️ Obter em: Supabase Dashboard → Settings → API → `service_role` |

> ⚠️ **NUNCA commitar credenciais no repositório.** Use `.env.local` (ignorado pelo `.gitignore`) ou variáveis de ambiente no Vercel.

---

## Arquivos de Configuração

### `.env.local` (criar localmente — não commitar)
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### `vercel.json` — já configurado com crons e referências às env vars.

---

## Schema do Banco de Dados

Migrações aplicadas no Supabase:
- `001_gymflow_base_schema` — todas as tabelas base
- `002_workout_prescriptions` — tabela de prescrições + coluna `prescription_id` em `appointments`

### Tabelas (todas com RLS ativo)
| Tabela | Descrição |
|--------|-----------|
| `studios` | Dados do estabelecimento, config de gamificação e assinatura |
| `profiles` | Extensão de `auth.users` (owner/trainer/student) |
| `students` | Alunos com coins, nível, plano e referral |
| `trainers` | Treinadores com especialidade e avaliação |
| `appointments` | Agendamentos com `service_type`, `time`, `duration`, `prescription_id` |
| `schedule_slots` | Grade de horários recorrentes |
| `checkins` | Check-ins com `checked_in_at`, `level_before`, `level_after` |
| `qr_tokens` | Tokens de QR Code para check-in |
| `coin_transactions` | Histórico de transações de GymCoins |
| `rewards` | Catálogo de prêmios (`coins_cost`, `stock_quantity`, `is_active`) |
| `reward_redemptions` | Resgates de prêmios |
| `monthly_rankings` | Rankings mensais com `rank` e `awarded` |
| `student_payments` | Mensalidades dos alunos |
| `studio_billing` | Faturas do studio no GymFlow |
| `notification_templates` | Templates de mensagens |
| `notification_logs` | Log de notificações enviadas |
| `workout_prescriptions` | Prescrições de treino por aluno (grupos musculares) |

### Funções PostgreSQL
- `process_checkin(p_student_id, p_studio_id, p_method, p_appointment_id)` — processa check-in, credita coins, atualiza nível e ranking
- `redeem_reward(p_student_id, p_reward_id)` — resgata prêmio e debita coins
- `reset_monthly_checkins()` — zera check-ins mensais (cron)
- `update_updated_at()` — trigger automático de `updated_at`

---

## Estrutura de Páginas

```
/                   → Redirect para /login ou /painel
/login              → Login/signup
/onboarding         → Configuração inicial do studio
/painel             → Painel admin (owner/trainer)
/app                → App do aluno (mobile-first)
/tv                 → Display para TV com ranking em tempo real
/api/...            → API Routes (Next.js)
```

### Abas do Painel Admin (`/painel`)
1. **Dashboard** — KPIs e próximos agendamentos
2. **Alunos** — lista, cadastro, histórico e prescrições de treino
3. **Agenda** — agendamentos por data + modal de booking
4. **Treinadores** — gestão de treinadores
5. **Financeiro** — pagamentos e mensalidades
6. **Recompensas** — catálogo de prêmios
7. **Notificações** — templates de WhatsApp/email
8. **Relatórios** — gráficos de check-ins, receita, top alunos
9. **Configurações** — dados do studio, gamificação, integrações

---

## API Routes Implementadas

```
GET/POST   /api/appointments           — Lista por data ou aluno / cria agendamento
PATCH/DEL  /api/appointments/[id]      — Atualiza status / cancela
GET/POST   /api/workout-prescriptions  — Lista prescrições do aluno / cria
DELETE     /api/workout-prescriptions/[id] — Soft delete (active=false)
GET/POST   /api/students               — Lista / cria aluno
GET/POST   /api/trainers               — Lista / cria treinador
GET/POST   /api/payments               — Lista / cria pagamento
POST       /api/checkin                — Processa check-in
POST       /api/rewards/redeem         — Resgata prêmio
GET        /api/ranking                — Ranking mensal
GET/POST   /api/schedule-slots         — Grade de horários
GET        /api/qr/generate            — Gera token QR
POST       /api/auth/signup            — Cadastro com criação de studio
GET        /api/cron/reminders         — Cron: lembretes de aula
GET        /api/cron/reactivation      — Cron: alunos inativos
GET        /api/cron/rankings          — Cron: ranking semanal
POST       /api/webhooks/stripe        — Webhook Stripe
```

---

## Funcionalidades Implementadas nesta Sessão

1. **Cadastro de Aluno** — modal `StudentRegModal` no painel com name, phone, email, gender, plano, preço, dia de vencimento
2. **Relatórios** — aba com 4 KPIs, gráfico de check-ins/mês (BarChart), receita/mês (AreaChart), distribuição por status, top 10 alunos
3. **Histórico de Treinos** — app do aluno mostra "Próximas Aulas" e "Histórico" separados com emojis por modalidade
4. **Prescrições de Treino** — CRUD no painel (aba Prescrições dentro do modal do aluno), seletor no modal de agendamento, exibição no histórico do aluno
5. **Remoção do PIX** — opção de pagamento PIX removida da ConfigTab
6. **Fix de Build CSS** — removida classe `dark:placeholder:text-surface-500` inválida em `@apply`

---

## Grupos Musculares Disponíveis
```
Peito | Costas | Ombros | Bíceps | Tríceps | Abdômen / Core
Pernas (Geral) | Quadríceps | Posterior de Coxa | Glúteos
Panturrilhas | Trapézio | Antebraço | Cardio / Aeróbico
```

---

## Como Rodar Localmente

```bash
cd "C:\Users\Acer Aspire E 15\Downloads\gymflow-coins-complete\gymflow-app"

# Adicionar SUPABASE_SERVICE_ROLE_KEY no .env.local antes de rodar

npm run dev
# → http://localhost:3000
```

---

## Como Fazer Deploy no Vercel

```bash
cd "C:\Users\Acer Aspire E 15\Downloads\gymflow-coins-complete\gymflow-app"

# Login (abre browser)
vercel login

# Deploy
vercel deploy --yes
```

Após o deploy, adicionar no Vercel Dashboard → Settings → Environment Variables:
- `SUPABASE_SERVICE_ROLE_KEY` — obrigatório para check-in, cadastro, resgates
- `STRIPE_SECRET_KEY` — para cobrança de mensalidades
- `NEXT_PUBLIC_APP_URL` — URL do deploy gerado pelo Vercel

---

## Pendências / Próximos Passos

- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` e no Vercel
- [ ] Configurar Stripe (criar produtos/preços no dashboard do Stripe)
- [ ] Configurar Z-API para notificações WhatsApp
- [ ] Testar fluxo completo: cadastro → agendamento → check-in → coins → resgate
- [ ] Implementar autenticação do aluno (login no `/app`)
- [ ] Configurar domínio customizado no Vercel
- [ ] Habilitar Supabase Realtime para o display de TV (`/tv`)

---

## Arquivos-Chave

| Arquivo | Descrição |
|---------|-----------|
| `src/types/database.ts` | Tipos TypeScript do banco (fonte da verdade) |
| `src/app/painel/page.tsx` | Painel admin completo |
| `src/app/app/page.tsx` | App mobile do aluno |
| `src/lib/supabase/server.ts` | Clientes Supabase (session e service role) |
| `supabase/migrations/001_gymflow_base_schema` | Schema base (aplicado) |
| `supabase/migrations/002_workout_prescriptions.sql` | Migração de prescrições (aplicada) |
| `.env.local` | Variáveis de ambiente locais |
| `vercel.json` | Config de deploy e crons |

---

*Gerado em: 2026-03-15*
