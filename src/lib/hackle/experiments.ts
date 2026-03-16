// ── Hackle A/B Experiments ─────────────────────────────────────
// Cada experimento tem um key único e variações mapeadas por número.
// Variation 1 = controle (A), Variation 2 = teste (B), etc.

export const EXPERIMENTS = {
  /** Texto do CTA no onboarding */
  ONBOARDING_CTA: 1,

  /** Quantidade de coins exibida na landing e no onboarding (padrão: 10) */
  COINS_REWARD_DISPLAY: 2,

  /** Layout do card de boas-vindas no dashboard do aluno */
  STUDENT_DASHBOARD_HERO: 3,
} as const

export type ExperimentKey = keyof typeof EXPERIMENTS

// Variações mapeadas por experimento
export const VARIATIONS = {
  ONBOARDING_CTA: {
    1: 'Começar Grátis',       // controle
    2: 'Testar 14 Dias Grátis', // teste B
    3: 'Criar Minha Conta',    // teste C
  },
  COINS_REWARD_DISPLAY: {
    1: 10, // controle — 10 coins por check-in
    2: 15, // teste B — 15 coins (mais atrativo)
  },
  STUDENT_DASHBOARD_HERO: {
    1: 'simple',    // controle — card simples
    2: 'gamified',  // teste B — card com level, streak e progress bar
  },
} as const
