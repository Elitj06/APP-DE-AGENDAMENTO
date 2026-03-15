-- ============================================================
-- GymFlow & Coins — Supabase Schema v2.0
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ───────────────────────────────────────────────

CREATE TYPE establishment_type AS ENUM (
  'personal', 'studio', 'micro_gym', 'pilates', 'crossfit', 'yoga'
);

CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled');
CREATE TYPE student_status AS ENUM ('active', 'inactive', 'overdue', 'suspended');
CREATE TYPE appointment_status AS ENUM (
  'booked', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'
);
CREATE TYPE coin_tx_type AS ENUM (
  'earned_checkin', 'earned_bonus', 'earned_referral', 'spent', 'redeemed', 'expired'
);
CREATE TYPE checkin_method AS ENUM ('qr_code', 'pin', 'facial', 'manual', 'nfc');
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'push', 'email', 'sms');
CREATE TYPE notification_trigger AS ENUM (
  'pre_appointment', 'post_checkin', 'goal_reached', 'payment_due',
  'reactivation', 'weekly_ranking', 'level_up', 'reward_redeemed'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'pix', 'boleto', 'debit_card');

-- ─── STUDIOS (donos de negócio) ──────────────────────────────

CREATE TABLE studios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(50) UNIQUE NOT NULL,
  type          establishment_type NOT NULL DEFAULT 'studio',
  logo_url      TEXT,
  phone         VARCHAR(20),
  email         VARCHAR(255),
  address       TEXT,
  city          VARCHAR(100),
  state         CHAR(2),
  zip_code      VARCHAR(9),
  description   TEXT,
  -- Gamificação config
  coins_per_checkin     INTEGER NOT NULL DEFAULT 10,
  bonus_weekly_goal     INTEGER NOT NULL DEFAULT 25,
  bonus_monthly_15      INTEGER NOT NULL DEFAULT 50,
  bonus_monthly_20      INTEGER NOT NULL DEFAULT 100,
  referral_bonus        INTEGER NOT NULL DEFAULT 100,
  -- Assinatura
  plan                  subscription_plan NOT NULL DEFAULT 'trial',
  plan_status           subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at         TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  -- WhatsApp
  zapi_instance_id      TEXT,
  zapi_token            TEXT,
  whatsapp_connected    BOOLEAN DEFAULT FALSE,
  -- Limites por plano
  max_students          INTEGER NOT NULL DEFAULT 30,
  max_trainers          INTEGER NOT NULL DEFAULT 1,
  -- Metadados
  active                BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PERFIS (extensão de auth.users) ─────────────────────────

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id   UUID REFERENCES studios(id) ON DELETE SET NULL,
  full_name   VARCHAR(100) NOT NULL,
  avatar_url  TEXT,
  phone       VARCHAR(20),
  role        VARCHAR(20) NOT NULL DEFAULT 'student', -- owner | trainer | student | admin
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRAINERS ─────────────────────────────────────────────────

CREATE TABLE trainers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(20),
  avatar_url    TEXT,
  specialty     VARCHAR(200),
  bio           TEXT,
  rating        DECIMAL(2,1) DEFAULT 5.0,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUDENTS ─────────────────────────────────────────────────

CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20) NOT NULL,
  avatar_url      TEXT,
  birth_date      DATE,
  gender          CHAR(1),
  status          student_status NOT NULL DEFAULT 'active',
  -- Plano do aluno
  plan_name       VARCHAR(50),
  plan_price      DECIMAL(10,2),
  plan_start      DATE,
  plan_expiry     DATE,
  payment_day     INTEGER DEFAULT 5,
  -- Gamificação
  coins           INTEGER NOT NULL DEFAULT 0,
  total_checkins  INTEGER NOT NULL DEFAULT 0,
  monthly_checkins INTEGER NOT NULL DEFAULT 0,
  level           VARCHAR(20) NOT NULL DEFAULT 'Iniciante',
  last_checkin_at TIMESTAMPTZ,
  -- Referral
  referral_code   VARCHAR(10) UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
  referred_by_id  UUID REFERENCES students(id),
  -- Metadados
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENT SLOTS (grade de horários) ────────────────────

CREATE TABLE schedule_slots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  trainer_id    UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  type          VARCHAR(50) NOT NULL, -- Musculação, Pilates, Yoga, etc.
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  duration_min  INTEGER NOT NULL DEFAULT 60,
  max_capacity  INTEGER NOT NULL DEFAULT 20,
  location      VARCHAR(100),
  color         VARCHAR(7) DEFAULT '#f97316',
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────

CREATE TABLE appointments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  slot_id       UUID REFERENCES schedule_slots(id),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  trainer_id    UUID NOT NULL REFERENCES trainers(id),
  type          VARCHAR(50) NOT NULL,
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  status        appointment_status NOT NULL DEFAULT 'booked',
  checkin_at    TIMESTAMPTZ,
  checkin_method checkin_method,
  coins_earned  INTEGER DEFAULT 0,
  notes         TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHECK-INS ────────────────────────────────────────────────

CREATE TABLE checkins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id),
  method          checkin_method NOT NULL DEFAULT 'qr_code',
  coins_earned    INTEGER NOT NULL DEFAULT 0,
  verified_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QR CODE TOKENS (check-in sem app) ───────────────────────

CREATE TABLE qr_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  token       VARCHAR(64) UNIQUE NOT NULL DEFAULT ENCODE(GEN_RANDOM_BYTES(32), 'hex'),
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COIN TRANSACTIONS ────────────────────────────────────────

CREATE TABLE coin_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type            coin_tx_type NOT NULL,
  amount          INTEGER NOT NULL,
  balance_after   INTEGER NOT NULL,
  description     TEXT NOT NULL,
  reference_id    UUID, -- appointment_id, reward_id, etc.
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REWARDS (catálogo de prêmios) ───────────────────────────

CREATE TABLE rewards (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  emoji         VARCHAR(10),
  coin_cost     INTEGER NOT NULL,
  stock         INTEGER DEFAULT -1, -- -1 = ilimitado
  claimed_count INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REWARD REDEMPTIONS ───────────────────────────────────────

CREATE TABLE reward_redemptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  reward_id     UUID NOT NULL REFERENCES rewards(id),
  coins_spent   INTEGER NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending', -- pending | delivered | cancelled
  delivered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATION TEMPLATES ──────────────────────────────────

CREATE TABLE notification_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  trigger     notification_trigger NOT NULL,
  channel     notification_channel NOT NULL DEFAULT 'whatsapp',
  template    TEXT NOT NULL,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATION LOGS ───────────────────────────────────────

CREATE TABLE notification_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id),
  student_id      UUID NOT NULL REFERENCES students(id),
  template_id     UUID REFERENCES notification_templates(id),
  channel         notification_channel NOT NULL,
  message         TEXT NOT NULL,
  status          VARCHAR(20) DEFAULT 'sent', -- sent | delivered | read | failed
  external_id     TEXT, -- ID retornado pela Z-API
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS (mensalidades dos alunos) ──────────────────────

CREATE TABLE student_payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount          DECIMAL(10,2) NOT NULL,
  due_date        DATE NOT NULL,
  paid_at         TIMESTAMPTZ,
  status          payment_status NOT NULL DEFAULT 'pending',
  method          payment_method,
  reference       VARCHAR(100),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUDIO SUBSCRIPTIONS (assinatura do studio no GymFlow) ──

CREATE TABLE studio_billing (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id           UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  stripe_invoice_id   TEXT,
  amount              DECIMAL(10,2) NOT NULL,
  currency            CHAR(3) DEFAULT 'BRL',
  status              payment_status NOT NULL DEFAULT 'pending',
  period_start        DATE,
  period_end          DATE,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RANKINGS MENSAIS (snapshot) ─────────────────────────────

CREATE TABLE monthly_rankings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL,
  checkins        INTEGER NOT NULL DEFAULT 0,
  coins_earned    INTEGER NOT NULL DEFAULT 0,
  rank_position   INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(studio_id, student_id, year, month)
);

-- ─── INDEXES ─────────────────────────────────────────────────

CREATE INDEX idx_students_studio ON students(studio_id);
CREATE INDEX idx_students_status ON students(studio_id, status);
CREATE INDEX idx_appointments_studio_date ON appointments(studio_id, date);
CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_checkins_studio_date ON checkins(studio_id, created_at DESC);
CREATE INDEX idx_checkins_student ON checkins(student_id, created_at DESC);
CREATE INDEX idx_coin_tx_student ON coin_transactions(student_id, created_at DESC);
CREATE INDEX idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX idx_rankings_month ON monthly_rankings(studio_id, year, month);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

-- Owner vê e edita seu próprio studio
CREATE POLICY "owner_manage_studio" ON studios
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Studio members veem dados do seu studio
CREATE POLICY "studio_members_view" ON students
  USING (studio_id IN (
    SELECT id FROM studios WHERE owner_id = auth.uid()
    UNION
    SELECT studio_id FROM profiles WHERE id = auth.uid()
  ));

-- Profiles próprios
CREATE POLICY "own_profile" ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── FUNCTIONS & TRIGGERS ────────────────────────────────────

-- Função: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_studios_updated_at BEFORE UPDATE ON studios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função: processar check-in e creditar GymCoins
CREATE OR REPLACE FUNCTION process_checkin(
  p_studio_id UUID,
  p_student_id UUID,
  p_appointment_id UUID DEFAULT NULL,
  p_method checkin_method DEFAULT 'qr_code'
)
RETURNS JSONB AS $$
DECLARE
  v_studio          studios%ROWTYPE;
  v_student         students%ROWTYPE;
  v_coins_to_credit INTEGER;
  v_new_balance     INTEGER;
  v_new_level       VARCHAR(20);
  v_level_up        BOOLEAN := FALSE;
  v_monthly_count   INTEGER;
  v_bonus_coins     INTEGER := 0;
BEGIN
  SELECT * INTO v_studio FROM studios WHERE id = p_studio_id;
  SELECT * INTO v_student FROM students WHERE id = p_student_id AND studio_id = p_studio_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  -- Coins base por check-in
  v_coins_to_credit := v_studio.coins_per_checkin;

  -- Verificar bônus de meta mensal
  v_monthly_count := v_student.monthly_checkins + 1;
  IF v_monthly_count = 15 THEN
    v_bonus_coins := v_studio.bonus_monthly_15;
  ELSIF v_monthly_count = 20 THEN
    v_bonus_coins := v_studio.bonus_monthly_20;
  END IF;

  v_coins_to_credit := v_coins_to_credit + v_bonus_coins;
  v_new_balance := v_student.coins + v_coins_to_credit;

  -- Calcular novo nível
  v_new_level := CASE
    WHEN v_student.total_checkins + 1 >= 300 THEN 'Lenda'
    WHEN v_student.total_checkins + 1 >= 150 THEN 'Diamante'
    WHEN v_student.total_checkins + 1 >= 100 THEN 'Ouro'
    WHEN v_student.total_checkins + 1 >= 50  THEN 'Prata'
    WHEN v_student.total_checkins + 1 >= 20  THEN 'Bronze'
    ELSE 'Iniciante'
  END;

  v_level_up := v_new_level != v_student.level;

  -- Inserir check-in
  INSERT INTO checkins (studio_id, student_id, appointment_id, method, coins_earned)
  VALUES (p_studio_id, p_student_id, p_appointment_id, p_method, v_coins_to_credit);

  -- Registrar transação de coins
  INSERT INTO coin_transactions (studio_id, student_id, type, amount, balance_after, description)
  VALUES (p_studio_id, p_student_id, 'earned_checkin', v_coins_to_credit, v_new_balance,
    CASE WHEN v_bonus_coins > 0
      THEN 'Check-in + Bônus meta de ' || v_monthly_count || ' treinos'
      ELSE 'Check-in confirmado'
    END
  );

  -- Atualizar student
  UPDATE students SET
    coins = v_new_balance,
    total_checkins = total_checkins + 1,
    monthly_checkins = v_monthly_count,
    level = v_new_level,
    last_checkin_at = NOW()
  WHERE id = p_student_id;

  -- Atualizar status do appointment se vinculado
  IF p_appointment_id IS NOT NULL THEN
    UPDATE appointments SET
      status = 'checked_in',
      checkin_at = NOW(),
      checkin_method = p_method,
      coins_earned = v_coins_to_credit
    WHERE id = p_appointment_id;
  END IF;

  -- Atualizar ranking mensal
  INSERT INTO monthly_rankings (studio_id, student_id, year, month, checkins, coins_earned)
  VALUES (p_studio_id, p_student_id, EXTRACT(YEAR FROM NOW()), EXTRACT(MONTH FROM NOW()), 1, v_coins_to_credit)
  ON CONFLICT (studio_id, student_id, year, month)
  DO UPDATE SET
    checkins = monthly_rankings.checkins + 1,
    coins_earned = monthly_rankings.coins_earned + v_coins_to_credit;

  RETURN jsonb_build_object(
    'success', true,
    'coins_earned', v_coins_to_credit,
    'bonus_coins', v_bonus_coins,
    'new_balance', v_new_balance,
    'new_level', v_new_level,
    'level_up', v_level_up,
    'monthly_checkins', v_monthly_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: resgatar prêmio
CREATE OR REPLACE FUNCTION redeem_reward(
  p_studio_id UUID,
  p_student_id UUID,
  p_reward_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_student   students%ROWTYPE;
  v_reward    rewards%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  SELECT * INTO v_student FROM students WHERE id = p_student_id AND studio_id = p_studio_id;
  SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id AND studio_id = p_studio_id AND active = TRUE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Reward not found'; END IF;
  IF v_student.coins < v_reward.coin_cost THEN
    RAISE EXCEPTION 'Insufficient coins. Need %, have %', v_reward.coin_cost, v_student.coins;
  END IF;
  IF v_reward.stock = 0 THEN RAISE EXCEPTION 'Out of stock'; END IF;

  v_new_balance := v_student.coins - v_reward.coin_cost;

  -- Debitar coins
  UPDATE students SET coins = v_new_balance WHERE id = p_student_id;

  -- Registrar transação
  INSERT INTO coin_transactions (studio_id, student_id, type, amount, balance_after, description, reference_id)
  VALUES (p_studio_id, p_student_id, 'redeemed', -v_reward.coin_cost, v_new_balance,
    'Resgatou: ' || v_reward.name, p_reward_id);

  -- Registrar resgate
  INSERT INTO reward_redemptions (studio_id, student_id, reward_id, coins_spent)
  VALUES (p_studio_id, p_student_id, p_reward_id, v_reward.coin_cost);

  -- Decrementar stock se limitado
  IF v_reward.stock > 0 THEN
    UPDATE rewards SET stock = stock - 1, claimed_count = claimed_count + 1 WHERE id = p_reward_id;
  ELSE
    UPDATE rewards SET claimed_count = claimed_count + 1 WHERE id = p_reward_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reward_name', v_reward.name,
    'coins_spent', v_reward.coin_cost,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset mensal de check-ins (rodar no cron todo dia 1)
CREATE OR REPLACE FUNCTION reset_monthly_checkins()
RETURNS void AS $$
BEGIN
  UPDATE students SET monthly_checkins = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── SEED: Templates de Notificação Padrão ───────────────────
-- (Inserir após criar o primeiro studio via app)
-- INSERT INTO notification_templates (studio_id, name, trigger, channel, template)
-- VALUES
-- (?, 'Lembrete de Aula', 'pre_appointment', 'whatsapp', 'Olá {nome}! 🏋️ Sua aula de {tipo} com {trainer} é às {hora}. Não falta não! 💪'),
-- (?, 'Check-in Confirmado', 'post_checkin', 'whatsapp', '✅ Check-in confirmado! Você ganhou {coins} GymCoins 🪙. Total: {total_coins}. Bora treinar!'),
-- (?, 'Subiu de Nível!', 'level_up', 'whatsapp', '🎉 PARABÉNS {nome}! Você subiu para {nivel}! Continue assim! 🚀'),
-- (?, 'Reativação', 'reactivation', 'whatsapp', 'Sentimos sua falta {nome}! 😢 Faz {dias} dias sem treinar. Seus GymCoins estão esperando por você! 🪙'),
-- (?, 'Ranking Semanal', 'weekly_ranking', 'whatsapp', '🏆 Ranking da semana: Você está em {posicao}º com {checkins} check-ins! {mensagem_posicao}');

-- ─── SUPABASE REALTIME ───────────────────────────────────────
-- Habilitar Realtime nas tabelas que o TV Display e App usam
-- Executar no Supabase Dashboard > Database > Replication
-- ou via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE monthly_rankings;
ALTER PUBLICATION supabase_realtime ADD TABLE coin_transactions;
