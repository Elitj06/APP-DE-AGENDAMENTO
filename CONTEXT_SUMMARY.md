# GymFlow & Coins — Resumo de Contexto

## Status: DEPLOYED ✅ — gym-coin-game.vercel.app

---

## URLs de Produção
| Rota | URL |
|------|-----|
| Landing Page | https://gym-coin-game.vercel.app |
| Painel Prestador | https://gym-coin-game.vercel.app/painel |
| App Aluno | https://gym-coin-game.vercel.app/app |
| Check-in (QR) | https://gym-coin-game.vercel.app/checkin?token=...&studio=... |
| TV Display | https://gym-coin-game.vercel.app/tv |
| Login | https://gym-coin-game.vercel.app/login |
| Onboarding | https://gym-coin-game.vercel.app/onboarding |

---

## Repositório & Deploy
- **GitHub**: github.com/Elitj06/APP-DE-AGENDAMENTO (branch `main`)
- **Vercel Project**: gym-coin-game (`prj_rJ76dWkrfKF9GQFMUB8VMWsgzfhY`)
- **Team**: `team_ZkuO9AFG32EIq311tsWgErVf`
- **Auto-deploy**: Push to `main` → Vercel build → Production

---

## Stack
- **Framework**: Next.js 14 (App Router) + TypeScript (strict)
- **DB**: Supabase (PostgreSQL + Auth + RLS + Realtime)
- **Styling**: Tailwind CSS + custom design tokens
- **Charts**: Recharts
- **Validation**: Zod (em todas API routes)
- **Icons**: Lucide React
- **Payments**: Stripe (checkout, portal, webhooks)
- **WhatsApp**: Z-API (8 templates, 3 crons)
- **A/B Testing**: Hackle (3 experimentos)
- **CI/CD**: GitHub Actions → Vercel

---

## Arquitetura

### Frontend (6 páginas)
- `/` — Landing page (pricing, features, counters animados)
- `/login` — Auth com Supabase
- `/onboarding` — Wizard de cadastro com A/B testing
- `/painel` — Dashboard do prestador (8 abas, 2099 linhas)
- `/app` — App do aluno (629 linhas, coins, ranking, agenda)
- `/tv` — TV Display (leaderboard ao vivo)
- `/checkin` — Página de check-in via QR Code

### API Routes (22 endpoints)
- `appointments` (GET, POST, PATCH)
- `auth/signup`, `auth/signout`
- `billing/checkout`
- `checkin` (POST)
- `cron/reminders`, `cron/reactivation`, `cron/rankings`
- `dashboard` (GET)
- `notifications/send` (POST)
- `payments` (GET, PATCH)
- `qr/generate` (GET)
- `ranking` (GET — público)
- `rewards/redeem` (POST)
- `schedule-slots` (GET, POST, PATCH, DELETE)
- `students` (GET, POST)
- `studio` (GET, PATCH)
- `trainers` (GET, POST)
- `webhooks/stripe` (POST)
- `workout-prescriptions` (GET, POST, DELETE)

### Schema (17 tabelas, 14 com RLS)
studios, profiles, trainers, students, appointments, schedule_slots,
checkins, qr_tokens, coin_transactions, rewards, reward_redemptions,
monthly_rankings, student_payments, studio_billing,
notification_templates, notification_logs, workout_prescriptions

### Segurança
- 43 verificações de auth nas API routes
- 70 validações Zod
- 30+ RLS policies (helper function auth_studio_ids)
- CRON_SECRET em todos os cron jobs
- Stripe webhook signature verification
- Security headers (HSTS, X-Frame-Options, CSP, XSS Protection)
- Service role key apenas server-side

---

## Projeto Gym System (SEPARADO — NÃO misturar)
- Repo: Elitj06/Gym-System
- URL: gym-system-green.vercel.app
- Função: IA para detecção de exercícios com câmera

