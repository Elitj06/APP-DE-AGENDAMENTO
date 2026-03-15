-- ══════════════════════════════════════════════════════════════
-- Prescrições de Treino
-- Executa no painel Supabase > SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.workout_prescriptions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id   UUID        NOT NULL REFERENCES public.studios(id)   ON DELETE CASCADE,
  student_id  UUID        NOT NULL REFERENCES public.students(id)  ON DELETE CASCADE,
  name        TEXT        NOT NULL,                          -- "Treino A", "Treino B"
  muscle_groups TEXT[]    NOT NULL DEFAULT '{}',             -- ["Peito","Tríceps"]
  description TEXT,
  active      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permite o dono do studio ler/escrever as prescrições do seu studio
ALTER TABLE public.workout_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_prescriptions_studio_access"
  ON public.workout_prescriptions
  FOR ALL
  USING (
    studio_id IN (
      SELECT studio_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Adiciona referência à prescrição usada em cada agendamento
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS prescription_id UUID
  REFERENCES public.workout_prescriptions(id) ON DELETE SET NULL;

-- Trigger updated_at
CREATE TRIGGER workout_prescriptions_updated_at
  BEFORE UPDATE ON public.workout_prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
