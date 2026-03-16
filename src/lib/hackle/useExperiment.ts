'use client'
import { useVariation } from '@hackler/react-sdk'
import { EXPERIMENTS, VARIATIONS, ExperimentKey } from './experiments'

/**
 * Hook para obter a variação de um experimento A/B.
 * Retorna o valor mapeado para a variação ativa, ou o valor do controle
 * caso o SDK não esteja inicializado (SSR / sem SDK key).
 *
 * @example
 * const ctaText = useExperiment('ONBOARDING_CTA')
 * // → 'Começar Grátis' | 'Testar 14 Dias Grátis' | 'Criar Minha Conta'
 */
export function useExperiment<K extends ExperimentKey>(
  key: K
): (typeof VARIATIONS)[K][keyof (typeof VARIATIONS)[K]] {
  const experimentId = EXPERIMENTS[key]
  const variation = useVariation(experimentId, '1') // '1' = controle (fallback), retorna string
  const map = VARIATIONS[key] as Record<number, unknown>
  return (map[Number(variation)] ?? map[1]) as (typeof VARIATIONS)[K][keyof (typeof VARIATIONS)[K]]
}
