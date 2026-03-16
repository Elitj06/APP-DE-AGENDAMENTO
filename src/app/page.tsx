"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const COUNTER_TARGETS = [
  { label: "Studios Ativos", value: 847, suffix: "+" },
  { label: "Check-ins/mês", value: 124000, suffix: "+" },
  { label: "GymCoins Distribuídos", value: 2100000, suffix: "+" },
  { label: "Retenção", value: 94, suffix: "%" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  const formatted = count >= 1000000 ? (count / 1000000).toFixed(1) + "M" : count >= 1000 ? (count / 1000).toFixed(count >= 10000 ? 0 : 1) + "K" : count.toString();
  return <>{formatted}{suffix}</>;
}

const FEATURES = [
  { icon: "📅", title: "Agendamento Inteligente", desc: "Seus alunos agendam pelo app. Você controla slots, bloqueios e recorrências. Sem WhatsApp manual." },
  { icon: "🪙", title: "Gamificação com GymCoins", desc: "Cada check-in gera coins. Alunos sobem de nível (Bronze→Lenda), competem em rankings e resgatam prêmios." },
  { icon: "📲", title: "WhatsApp Automatizado", desc: "Lembretes, confirmações, cobranças e rankings enviados automaticamente. 96% de taxa de entrega." },
  { icon: "🔐", title: "Check-in Inteligente", desc: "Facial, digital ou manual. Integração com catracas eletrônicas. Comprovação real de presença." },
  { icon: "📊", title: "Dashboard em Tempo Real", desc: "KPIs financeiros, heatmap de ocupação, funil de retenção e projeção de receita. Tudo num painel." },
  { icon: "🏆", title: "Rankings e Competições", desc: "Ligas mensais (Ouro/Prata/Bronze), TV Display para o studio e premiação automática." },
];

const TYPES = [
  { icon: "🏃", label: "Personal Trainers", desc: "Agenda individual, privacidade de horários, coins por sessão" },
  { icon: "🏋️", label: "Studios & Micro Gyms", desc: "Multi-trainer, turmas, controle de capacidade, catraca" },
  { icon: "🧘", label: "Pilates & Yoga", desc: "Aparelhos/salas, lista de espera, pacotes de aulas" },
  { icon: "🔥", label: "CrossFit & Funcional", desc: "WODs, leaderboards, competições internas" },
];

const PRICING = [
  {
    name: "Starter",
    price: "R$ 149",
    period: "/mês",
    annual: "2 meses grátis no anual",
    features: [
      "Até 50 alunos",
      "Agendamento completo",
      "Check-in por QR Code",
      "1 trainer",
      "GymCoins + Níveis",
      "WhatsApp automático",
      "App do Aluno",
      "Dashboard básico",
    ],
    cta: "14 dias grátis",
    popular: false,
    highlight: null,
  },
  {
    name: "Pro",
    price: "R$ 297",
    period: "/mês",
    annual: "2 meses grátis no anual",
    features: [
      "Até 200 alunos",
      "Agendamento + lista de espera",
      "Check-in QR + PIN + Facial",
      "Até 5 trainers",
      "GymCoins + Rankings + Ligas",
      "WhatsApp ilimitado",
      "TV Display ao vivo",
      "Relatórios financeiros",
      "Suporte prioritário",
    ],
    cta: "14 dias grátis",
    popular: true,
    highlight: "Mais popular",
  },
  {
    name: "Enterprise",
    price: "R$ 597",
    period: "/mês",
    annual: "2 meses grátis no anual",
    features: [
      "Alunos ilimitados",
      "Multi-unidade / Rede",
      "Trainers ilimitados",
      "API completa + Webhooks",
      "Integrações Wellhub/TotalPass",
      "White-label (sua marca)",
      "Analytics avançado + BI",
      "CSM dedicado 24/7",
      "Onboarding personalizado",
    ],
    cta: "Falar com vendas",
    popular: false,
    highlight: null,
  },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden relative noise">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-sm">G</div>
            <span className="font-display font-bold text-lg tracking-tight">GymFlow</span>
            <span className="text-[10px] font-medium bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full ml-1">& Coins</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#types" className="hover:text-white transition">Para quem</a>
            <a href="#pricing" className="hover:text-white transition">Planos</a>
          </div>
          <Link href="/painel" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-brand-500/25">
            Acessar Painel →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-700/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display font-black text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Transforme seus treinos em{" "}
            <span className="gradient-text">benefícios</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Plataforma completa de agendamento, gamificação e gestão para negócios fitness.
            Engaje seus alunos, automatize sua operação e escale seus resultados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/painel" className="bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold text-base px-8 py-4 rounded-full shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] transition-all hover:scale-105">
              Ver Demo Interativa →
            </Link>
            <Link href="/app" className="border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-medium text-sm px-6 py-4 rounded-full transition-all">
              App do Aluno
            </Link>
          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {COUNTER_TARGETS.map((c) => (
            <div key={c.label} className="text-center">
              <div className="font-display font-black text-3xl md:text-4xl gradient-text">
                <AnimatedCounter target={c.value} suffix={c.suffix} />
              </div>
              <div className="text-white/40 text-sm mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight mb-4">
              Tudo que seu negócio <span className="gradient-text">fitness precisa</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">Uma plataforma completa que substitui 5+ ferramentas separadas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {FEATURES.map((f) => (
              <div key={f.title} className="group glass rounded-2xl p-6 hover:border-brand-500/20 transition-all duration-300 hover:bg-brand-500/[0.03]">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section id="types" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight mb-4">
              Para todo tipo de <span className="gradient-text">negócio fitness</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {TYPES.map((t) => (
              <div key={t.label} className="glass rounded-2xl p-6 text-center hover:border-brand-500/20 transition-all">
                <div className="text-5xl mb-4">{t.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2">{t.label}</h3>
                <p className="text-white/40 text-sm">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight mb-4">
              Planos que <span className="gradient-text">cabem no bolso</span>
            </h2>
            <p className="text-white/40">Comece grátis. Sem cartão de crédito.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 stagger">
            {PRICING.map((p) => (
              <div key={p.name} className={`rounded-2xl p-8 relative ${p.popular ? "bg-gradient-to-b from-brand-500/10 to-transparent border-2 border-brand-500/30" : "glass"}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-xs font-bold px-4 py-1 rounded-full">MAIS POPULAR</div>}
                <h3 className="font-display font-bold text-xl mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display font-black text-4xl">{p.price}</span>
                  <span className="text-white/40 text-sm">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-white/60 flex items-start gap-2">
                      <span className="text-brand-400 mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/painel" className={`block text-center font-display font-bold text-sm py-3 rounded-xl transition-all ${p.popular ? "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25" : "bg-white/5 hover:bg-white/10 text-white/80"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🪙</div>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight mb-4">
            Escale para o <span className="gradient-text">próximo nível</span>
          </h2>
          <p className="text-white/40 mb-8">Setup em menos de 10 minutos. Seus alunos vão amar.</p>
          <Link href="/painel" className="inline-block bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold text-lg px-10 py-5 rounded-full shadow-[0_0_60px_rgba(249,115,22,0.5)] hover:shadow-[0_0_80px_rgba(249,115,22,0.7)] transition-all hover:scale-105">
            Começar Agora — É Grátis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-xs text-white">G</div>
            <span className="font-display font-semibold text-white/50">GymFlow & Coins</span>
          </div>
          <div>© 2026 GymFlow. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
