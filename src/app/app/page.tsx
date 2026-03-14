"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { STUDENTS, APPOINTMENTS, LEVELS, GAMIFICATION_CONFIG, COIN_TRANSACTIONS } from "@/lib/mock-data";

const STUDENT = STUDENTS[0]; // Demo as Ana Beatriz
const MY_APPTS = APPOINTMENTS.filter(a => a.studentId === STUDENT.id);

function AnimatedCoinCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const pId = useRef(0);

  useEffect(() => {
    let c = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const timer = setInterval(() => {
      c += step;
      if (c >= target) { setCount(target); clearInterval(timer); }
      else setCount(c);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  const addCoins = () => {
    const newP = Array.from({ length: 6 }, () => ({
      id: pId.current++,
      x: Math.random() * 200 - 100,
      y: Math.random() * -100 - 50,
    }));
    setParticles(p => [...p, ...newP]);
    setCount(c => c + 10);
    setTimeout(() => setParticles(p => p.filter(pp => !newP.includes(pp))), 1200);
    // Sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  return (
    <div className="relative text-center">
      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute left-1/2 top-1/2 text-2xl pointer-events-none animate-coin-float"
          style={{ transform: `translate(${p.x}px, ${p.y}px)`, opacity: 0, animation: "coin-up 1.2s ease-out forwards" }}>
          🪙
        </div>
      ))}
      <div className="text-6xl font-display font-black gradient-text">{count}</div>
      <div className="text-sm text-white/40 mt-1">GymCoins</div>
      <button onClick={addCoins}
        className="mt-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold text-sm px-6 py-3 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] transition-all hover:scale-105 active:scale-95">
        🏋️ Simular Check-in +10
      </button>
      <style jsx>{`
        @keyframes coin-up {
          0% { opacity: 1; transform: translate(var(--tx, 0), 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx, 0), -80px) scale(0.3); }
        }
      `}</style>
    </div>
  );
}

export default function AppPage() {
  const [tab, setTab] = useState<"home" | "agenda" | "ranking" | "rewards">("home");
  const currentLevel = LEVELS.find(l => STUDENT.checkins >= l.minCheckins) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progress = nextLevel ? ((STUDENT.checkins - currentLevel.minCheckins) / (nextLevel.minCheckins - currentLevel.minCheckins)) * 100 : 100;

  return (
    <div className="min-h-screen bg-surface-950 text-white max-w-md mx-auto relative overflow-x-hidden noise">
      {/* Status bar mock */}
      <div className="h-11 flex items-center justify-between px-6 text-[11px] text-white/40">
        <span>09:41</span>
        <div className="flex gap-1.5">
          <span>📶</span><span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/40 text-xs">Bom dia 👋</div>
            <div className="font-display font-bold text-xl">{STUDENT.name.split(" ")[0]}</div>
          </div>
          <Link href="/painel" className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-sm">
            {STUDENT.avatar}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        {tab === "home" && (
          <div className="space-y-6 stagger">
            {/* Coin Counter */}
            <div className="glass rounded-2xl p-8">
              <AnimatedCoinCounter target={STUDENT.coins} />
            </div>

            {/* Level Progress */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentLevel.icon}</span>
                  <span className="font-display font-bold" style={{ color: currentLevel.color }}>{currentLevel.name}</span>
                </div>
                {nextLevel && <span className="text-xs text-white/30">Próximo: {nextLevel.icon} {nextLevel.name}</span>}
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: currentLevel.color }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-white/30">
                <span>{STUDENT.checkins} check-ins</span>
                {nextLevel && <span>{nextLevel.minCheckins} para {nextLevel.name}</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-black">{STUDENT.monthlyCheckins}</div>
                <div className="text-[10px] text-white/30 uppercase">Este mês</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-black">{STUDENT.checkins}</div>
                <div className="text-[10px] text-white/30 uppercase">Total</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-black">#{3}</div>
                <div className="text-[10px] text-white/30 uppercase">Ranking</div>
              </div>
            </div>

            {/* Next appointment */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-white/30 uppercase mb-3">Próxima aula</div>
              {MY_APPTS.filter(a => a.status === "booked" || a.status === "confirmed")[0] ? (() => {
                const next = MY_APPTS.filter(a => a.status === "booked" || a.status === "confirmed")[0];
                return (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-500/20 flex flex-col items-center justify-center">
                      <span className="text-xs text-brand-400 font-medium">{next.date === "2026-03-13" ? "Hoje" : "Amanhã"}</span>
                      <span className="text-lg font-display font-bold text-brand-300">{next.time}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{next.type}</div>
                      <div className="text-sm text-white/40">com {next.trainer} • {next.duration}min</div>
                    </div>
                  </div>
                );
              })() : <div className="text-white/30 text-sm">Nenhuma aula agendada</div>}
            </div>

            {/* Recent coins */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-white/30 uppercase mb-3">Últimas moedas</div>
              <div className="space-y-2">
                {COIN_TRANSACTIONS.filter(ct => ct.studentName.includes("Ana")).slice(0, 3).map(ct => (
                  <div key={ct.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-400 font-bold">+{ct.amount}</div>
                    <div className="flex-1">
                      <div className="text-sm">{ct.description}</div>
                      <div className="text-xs text-white/30">{ct.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "agenda" && (
          <div className="space-y-4 stagger">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">Minhas Aulas</h3>
              <div className="space-y-3">
                {MY_APPTS.map(a => (
                  <div key={a.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-brand-400">{a.date === "2026-03-13" ? "Hoje" : "Amanhã"}</span>
                      <span className="text-sm font-bold text-brand-300">{a.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{a.type}</div>
                      <div className="text-xs text-white/40">com {a.trainer} • {a.duration}min</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      a.status === "completed" ? "bg-green-500/20 text-green-400" :
                      a.status === "checked_in" ? "bg-blue-500/20 text-blue-400" :
                      "bg-brand-500/20 text-brand-400"}`}>
                      {a.status === "completed" ? "✓ Feito" : a.status === "checked_in" ? "Em andamento" : "Agendado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "ranking" && (
          <div className="space-y-4 stagger">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">🏆 Ranking do Mês</h3>
              <div className="space-y-2">
                {STUDENTS.sort((a, b) => b.monthlyCheckins - a.monthlyCheckins).slice(0, 8).map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${s.id === STUDENT.id ? "bg-brand-500/10 border border-brand-500/20" : ""}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      i === 1 ? "bg-gray-400/20 text-gray-300" :
                      i === 2 ? "bg-amber-600/20 text-amber-500" :
                      "bg-white/5 text-white/40"}`}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[10px] font-bold">{s.avatar}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.name.split(" ").slice(0, 2).join(" ")}</div>
                      <div className="text-xs text-white/30">{s.level} • {s.coins}🪙</div>
                    </div>
                    <span className="font-display font-bold text-brand-400">{s.monthlyCheckins}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "rewards" && (
          <div className="space-y-4 stagger">
            <div className="glass rounded-2xl p-5 text-center">
              <div className="text-4xl font-display font-black gradient-text">{STUDENT.coins} 🪙</div>
              <div className="text-sm text-white/40 mt-1">Seus GymCoins disponíveis</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">Resgatar Prêmios</h3>
              <div className="space-y-3">
                {GAMIFICATION_CONFIG.rewards.map(r => {
                  const canAfford = STUDENT.coins >= r.cost;
                  return (
                    <div key={r.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                      <span className="text-3xl">{r.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{r.name}</div>
                        <div className="text-xs text-brand-400 font-bold">{r.cost} 🪙</div>
                      </div>
                      <button className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${canAfford ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-white/5 text-white/20 cursor-not-allowed"}`}>
                        {canAfford ? "Resgatar" : "Faltam " + (r.cost - STUDENT.coins)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-surface-900/95 backdrop-blur-xl border-t border-white/5 px-6 py-2 z-50">
        <div className="flex justify-around">
          {([
            { id: "home", label: "Home", icon: "🏠" },
            { id: "agenda", label: "Agenda", icon: "📅" },
            { id: "ranking", label: "Ranking", icon: "🏆" },
            { id: "rewards", label: "Prêmios", icon: "🎁" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${tab === t.id ? "text-brand-400" : "text-white/30"}`}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
