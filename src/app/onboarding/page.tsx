"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/lib/hackle/useExperiment";

const STEPS = ["Seu Studio", "Tipo de Negócio", "Pronto!"] as const;

const TYPES = [
  { value: "personal", icon: "🏃", label: "Personal Trainer", desc: "Atendimento 1:1, agenda individual" },
  { value: "studio", icon: "🏋️", label: "Studio / Academia", desc: "Multi-alunos, múltiplos trainers" },
  { value: "pilates", icon: "🧘", label: "Pilates", desc: "Aparelhos, salas, lista de espera" },
  { value: "crossfit", icon: "🔥", label: "CrossFit / Funcional", desc: "WODs, leaderboards, competições" },
  { value: "yoga", icon: "🕉️", label: "Yoga", desc: "Turmas, meditação, pacotes" },
  { value: "micro_gym", icon: "💪", label: "Micro Gym", desc: "Box pequeno, comunidade forte" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const ctaText = useExperiment('ONBOARDING_CTA');
  const coinsDisplay = useExperiment('COINS_REWARD_DISPLAY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", studioName: "",
    studioType: "" as typeof TYPES[number]["value"] | "",
    phone: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center p-6 noise">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-xl">G</div>
            <span className="font-display font-bold text-2xl">GymFlow & Coins</span>
          </div>
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? "bg-brand-500 text-white" : "bg-white/10 text-white/30"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i < step ? "bg-brand-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm mt-3">{STEPS[step]}</p>
        </div>

        {/* Step 0 — Dados do usuário */}
        {step === 0 && (
          <div className="glass rounded-2xl p-8 space-y-5">
            <h2 className="font-display font-bold text-2xl">Vamos começar! 🚀</h2>
            <p className="text-white/40 text-sm">Setup em menos de 2 minutos. Ganhe <strong className="text-brand-400">{coinsDisplay} GymCoins</strong> por check-in. Sem cartão.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Seu Nome</label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Ana Beatriz Costa"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">E-mail</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="ana@seustudio.com.br"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">WhatsApp</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)}
                  placeholder="(21) 99999-0000"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Nome do Studio / Negócio</label>
                <input value={form.studioName} onChange={e => set("studioName", e.target.value)}
                  placeholder="Studio Vitale"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Senha</label>
                <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!form.name || !form.email || !form.password || !form.studioName || !form.phone}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold py-4 rounded-xl disabled:opacity-40 transition hover:shadow-lg hover:shadow-brand-500/30">
              {ctaText} →
            </button>
          </div>
        )}

        {/* Step 1 — Tipo de negócio */}
        {step === 1 && (
          <div className="glass rounded-2xl p-8 space-y-5">
            <h2 className="font-display font-bold text-2xl">Qual é seu negócio?</h2>
            <p className="text-white/40 text-sm">Vamos personalizar o GymFlow para você.</p>

            <div className="grid grid-cols-2 gap-3">
              {TYPES.map(t => (
                <button key={t.value} onClick={() => set("studioType", t.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${form.studioType === t.value ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)}
                className="flex-1 border border-white/10 text-white/60 font-semibold py-3 rounded-xl hover:border-white/20 transition">
                ← Voltar
              </button>
              <button onClick={submit} disabled={!form.studioType || loading}
                className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold py-3 rounded-xl disabled:opacity-40 transition hover:shadow-lg hover:shadow-brand-500/30">
                {loading ? "Criando..." : "Criar minha conta →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Sucesso */}
        {step === 2 && (
          <div className="glass rounded-2xl p-10 text-center space-y-6">
            <div className="text-7xl">🎉</div>
            <h2 className="font-display font-black text-3xl gradient-text">Studio criado!</h2>
            <p className="text-white/50">
              Bem-vindo ao GymFlow & Coins! Seu trial de <strong className="text-white">14 dias</strong> está ativo.
              Você vai receber um e-mail de confirmação.
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[["✅", "Conta criada"], ["🪙", "GymCoins ativo"], ["📊", "Painel pronto"]].map(([icon, text]) => (
                <div key={text} className="bg-white/5 rounded-xl p-3">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-white/60 text-xs">{text}</div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/painel")}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] transition-all hover:scale-105">
              Acessar meu Painel →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
