// ─── WhatsApp via Z-API ─────────────────────────────────────
// Documentação: https://developer.z-api.io/

interface SendMessageParams {
  instanceId: string
  token: string
  phone: string
  message: string
}

export async function sendWhatsApp({ instanceId, token, phone, message }: SendMessageParams) {
  const cleanPhone = phone.replace(/\D/g, '')
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const res = await fetch(
    `${process.env.ZAPI_BASE_URL}/${instanceId}/token/${token}/send-text`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, message }),
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`WhatsApp send failed: ${error}`)
  }

  return res.json()
}

// ─── Templates prontos ───────────────────────────────────────

export function buildTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (msg, [key, val]) => msg.replaceAll(`{${key}}`, val),
    template
  )
}

export const DEFAULT_TEMPLATES = {
  pre_appointment: 'Olá {nome}! 🏋️ Lembrete: sua aula de *{tipo}* com {trainer} é hoje às *{hora}*. Te esperamos! 💪\n\n_GymFlow & Coins_',

  post_checkin: '✅ Check-in confirmado!\n\nOlá {nome}, você ganhou *{coins} GymCoins* 🪙\nSaldo atual: *{total_coins} coins*\nNível: {nivel}\n\n_Continue assim! GymFlow & Coins_',

  level_up: '🎉 *SUBIU DE NÍVEL!*\n\nParabéns {nome}! Você alcançou o nível *{nivel}* {icone}\n\nContinue treinando e conquiste mais recompensas! 🚀\n\n_GymFlow & Coins_',

  goal_reached: '🏆 Meta atingida!\n\nIncrível {nome}! Você completou *{meta} treinos* este mês!\nBônus creditado: *+{bonus} GymCoins* 🪙\n\n_GymFlow & Coins_',

  reactivation: '😢 Sentimos sua falta, {nome}!\n\nFaz *{dias} dias* sem treinar. Seus *{coins} GymCoins* estão esperando por você!\n\nVolte hoje e ganhe um bônus especial 🎁\n\n_GymFlow & Coins_',

  weekly_ranking: '🏆 *Ranking da Semana*\n\nOlá {nome}!\nVocê está em *{posicao}º lugar* com *{checkins} check-ins*\nGymCoins: *{coins}* 🪙\n\n{mensagem}\n\n_GymFlow & Coins_',

  payment_due: '💳 Lembrete de pagamento\n\nOlá {nome}, seu plano *{plano}* vence em *{dias} dias*.\n\nRegularize para continuar treinando e não perder seus GymCoins! 💪\n\n_GymFlow & Coins_',

  reward_redeemed: '🎁 Prêmio resgatado!\n\nParabéns {nome}! Você resgatou: *{premio}*\nCoins utilizados: *{coins}* 🪙\n\nO studio vai confirmar a entrega em breve! 😊\n\n_GymFlow & Coins_',
}

// ─── Enviar notificação usando template do studio ─────────────

export async function sendNotification({
  instanceId,
  token,
  phone,
  templateKey,
  vars,
}: {
  instanceId: string
  token: string
  phone: string
  templateKey: keyof typeof DEFAULT_TEMPLATES
  vars: Record<string, string>
}) {
  const template = DEFAULT_TEMPLATES[templateKey]
  const message = buildTemplate(template, vars)
  return sendWhatsApp({ instanceId, token, phone, message })
}
