"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useExperiment } from "@/lib/hackle/useExperiment";

// ─── Níveis (constantes locais, sem mock) ────────────────────
const LEVELS = [
  { name: "Iniciante", minCheckins: 0,   color: "#94a3b8", icon: "🌱" },
  { name: "Bronze",    minCheckins: 20,  color: "#cd7f32", icon: "🥉" },
  { name: "Prata",     minCheckins: 50,  color: "#c0c0c0", icon: "🥈" },
  { name: "Ouro",      minCheckins: 100, color: "#ffd700", icon: "🥇" },
  { name: "Diamante",  minCheckins: 150, color: "#b9f2ff", icon: "💎" },
  { name: "Lenda",     minCheckins: 300, color: "#ff6b6b", icon: "🔥" },
];

function getLevelInfo(checkins: number) {
  const level = [...LEVELS].reverse().find(l => checkins >= l.minCheckins) || LEVELS[0];
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1] || null;
  const progress = next
    ? ((checkins - level.minCheckins) / (next.minCheckins - level.minCheckins)) * 100
    : 100;
  return { level, next, progress };
}

// ─── Animated Coin Counter ────────────────────────────────────
function AnimatedCoinCounter({ target, onCheckin }: { target: number; onCheckin: () => void }) {
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

  const handleCheckin = () => {
    const newP = Array.from({ length: 6 }, () => ({
      id: pId.current++,
      x: Math.random() * 200 - 100,
      y: Math.random() * -100 - 50,
    }));
    setParticles(p => [...p, ...newP]);
    setCount(c => c + 10);
    setTimeout(() => setParticles(p => p.filter(pp => !newP.find(np => np.id === pp.id))), 1200);
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } catch {}
    onCheckin();
  };

  return (
    <div className="relative text-center">
      {particles.map(p => (
        <div key={p.id} className="absolute left-1/2 top-1/2 text-2xl pointer-events-none"
          style={{ transform: `translate(${p.x}px, ${p.y}px)`, opacity: 0,
            animation: "coin-up 1.2s ease-out forwards" }}>🪙</div>
      ))}
      <div className="text-6xl font-display font-black gradient-text">{count}</div>
      <div className="text-sm text-white/40 mt-1">GymCoins</div>
      <button onClick={handleCheckin}
        className="mt-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold text-sm px-6 py-3 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] transition-all hover:scale-105 active:scale-95">
        🏋️ Fazer Check-in
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

// ─── Skeleton loader ──────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} />;
}

// ─── Main App Page ────────────────────────────────────────────
export default function AppPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<"home" | "agenda" | "ranking" | "rewards">("home");
  const [loading, setLoading] = useState(true);

  // Estado real
  const [student, setStudent] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [coinTxs, setCoinTxs] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Buscar perfil e studio_id
      const { data: profile } = await supabase
        .from("profiles").select("studio_id").eq("id", user.id).single();

      if (!profile?.studio_id) { setLoading(false); return; }

      // Buscar aluno vinculado ao user
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("studio_id", profile.studio_id)
        .eq("user_id", user.id)
        .single();

      if (!studentData) { setLoading(false); return; }
      setStudent(studentData);

      // Buscar dados em paralelo
      const [apptRes, txRes, rankRes, rewardRes] = await Promise.all([
        fetch(`/api/appointments?studentId=${studentData.id}`).then(r => r.json()),
        supabase.from("coin_transactions")
          .select("*").eq("student_id", studentData.id)
          .order("created_at", { ascending: false }).limit(10),
        fetch(`/api/ranking?studioId=${profile.studio_id}`).then(r => r.json()),
        supabase.from("rewards")
          .select("*").eq("studio_id", profile.studio_id).eq("is_active", true).order("coins_cost"),
      ]);

      setAppointments(Array.isArray(apptRes) ? apptRes : []);
      setCoinTxs(txRes.data || []);
      setRanking(Array.isArray(rankRes) ? rankRes : []);
      setRewards(rewardRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // QR Check-in real
  const handleCheckin = async () => {
    if (!student) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from("profiles").select("studio_id").eq("id", session?.user?.id || "").single();
      if (!profile?.studio_id) return;

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studioId: profile.studio_id,
          method: "manual",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStudent((s: any) => ({ ...s, coins: data.newBalance, total_checkins: s.total_checkins + 1, monthly_checkins: data.monthlyCheckins, level: data.newLevel }));
        showToast(data.levelUp ? `🎉 Subiu para ${data.newLevel}! +${data.coinsEarned} coins` : `✅ +${data.coinsEarned} GymCoins!`);
        loadAll();
      }
    } catch {}
  };

  // Resgatar prêmio
  const handleRedeem = async (rewardId: string) => {
    if (!student) return;
    setRedeemLoading(rewardId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from("profiles").select("studio_id").eq("id", session?.user?.id || "").single();

      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, rewardId, studioId: profile?.studio_id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎁 ${data.reward_name} resgatado!`);
        setStudent((s: any) => ({ ...s, coins: data.new_balance }));
        loadAll();
      } else {
        showToast(`❌ ${data.error}`);
      }
    } catch {
      showToast("❌ Erro ao resgatar");
    } finally {
      setRedeemLoading(null);
    }
  };

  // Se não logado, mostra demo
  const isDemo = !student && !loading;
  const displayStudent = student || {
    name: "Demo Aluno", coins: 342, total_checkins: 89,
    monthly_checkins: 14, level: "Ouro",
  };

  const { level: lvl, next: nextLvl, progress } = getLevelInfo(displayStudent.total_checkins || 0);
  const myRankPos = ranking.findIndex((r: any) => r.students?.id === student?.id) + 1;
  const dashboardHero = useExperiment('STUDENT_DASHBOARD_HERO');

  const futureAppts = appointments.filter((a: any) =>
    a.status === "booked" || a.status === "confirmed"
  );
  const nextAppt = futureAppts[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="min-h-screen bg-surface-950 text-white max-w-md mx-auto relative overflow-x-hidden noise">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-500 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg animate-fade-up">
          {toast}
        </div>
      )}

      {/* Status bar */}
      <div className="h-11 flex items-center justify-between px-6 text-[11px] text-white/40">
        <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        <div className="flex gap-1.5"><span>📶</span><span>🔋</span></div>
      </div>

      {/* Header */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/40 text-xs">{greeting} 👋</div>
            {loading ? <Skeleton className="w-24 h-6 mt-1" /> :
              <div className="font-display font-bold text-xl">{displayStudent.name.split(" ")[0]}</div>}
          </div>
          <Link href="/painel" className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-sm">
            {displayStudent.name?.slice(0, 2).toUpperCase() || "??"}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">

        {/* ── HOME ── */}
        {tab === "home" && (
          <div className="space-y-6 stagger">
            {loading ? (
              <>
                <Skeleton className="h-40" />
                <Skeleton className="h-24" />
                <Skeleton className="h-28" />
              </>
            ) : (
              <>
                {/* Hero Card — A/B: simple vs gamified */}
                {dashboardHero === 'gamified' ? (
                  <div className="glass rounded-2xl p-6 space-y-4 border border-brand-500/20">
                    {/* Gamified: coins + nível + streak tudo junto */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/30 uppercase tracking-wider">Seus GymCoins</div>
                        <div className="text-5xl font-display font-black gradient-text mt-0.5">{displayStudent.coins}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">{lvl.icon}</div>
                        <div className="text-xs font-bold" style={{ color: lvl.color }}>{lvl.name}</div>
                        <div className="text-[10px] text-white/30">{displayStudent.monthly_checkins} este mês</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-white/30 mb-1">
                        <span>{displayStudent.total_checkins} check-ins</span>
                        {nextLvl && <span>{nextLvl.minCheckins - displayStudent.total_checkins} para {nextLvl.icon} {nextLvl.name}</span>}
                      </div>
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${lvl.color}99, ${lvl.color})` }} />
                      </div>
                    </div>
                    <button onClick={handleCheckin}
                      className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold py-3.5 rounded-xl shadow-[0_0_25px_rgba(249,115,22,0.35)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] text-sm">
                      🏋️ Registrar Check-in
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Simple (controle): coin counter separado */}
                    <div className="glass rounded-2xl p-8">
                      <AnimatedCoinCounter target={displayStudent.coins} onCheckin={handleCheckin} />
                    </div>
                    <div className="glass rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{lvl.icon}</span>
                          <span className="font-display font-bold" style={{ color: lvl.color }}>{lvl.name}</span>
                        </div>
                        {nextLvl && <span className="text-xs text-white/30">Próximo: {nextLvl.icon} {nextLvl.name}</span>}
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%`, backgroundColor: lvl.color }} />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-white/30">
                        <span>{displayStudent.total_checkins} check-ins</span>
                        {nextLvl && <span>{nextLvl.minCheckins} para {nextLvl.name}</span>}
                      </div>
                    </div>
                  </>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: displayStudent.monthly_checkins, label: "Este mês" },
                    { val: displayStudent.total_checkins, label: "Total" },
                    { val: myRankPos > 0 ? `#${myRankPos}` : "-", label: "Ranking" },
                  ].map(({ val, label }) => (
                    <div key={label} className="glass rounded-xl p-4 text-center">
                      <div className="text-2xl font-display font-black">{val}</div>
                      <div className="text-[10px] text-white/30 uppercase">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Próxima aula */}
                <div className="glass rounded-2xl p-5">
                  <div className="text-xs text-white/30 uppercase mb-3">Próxima aula</div>
                  {nextAppt ? (
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-brand-500/20 flex flex-col items-center justify-center">
                        <span className="text-xs text-brand-400 font-medium">
                          {nextAppt.date === new Date().toISOString().split("T")[0] ? "Hoje" : "Em breve"}
                        </span>
                        <span className="text-lg font-display font-bold text-brand-300">
                          {nextAppt.time?.slice(0, 5)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{nextAppt.service_type}</div>
                        <div className="text-sm text-white/40">
                          com {nextAppt.trainers?.name} • {nextAppt.duration || 60}min
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/30 text-sm">Nenhuma aula agendada</div>
                  )}
                </div>

                {/* Últimas moedas */}
                <div className="glass rounded-2xl p-5">
                  <div className="text-xs text-white/30 uppercase mb-3">Últimas moedas</div>
                  {coinTxs.length === 0
                    ? <div className="text-white/30 text-sm text-center py-4">Nenhuma transação ainda</div>
                    : (
                      <div className="space-y-2">
                        {coinTxs.slice(0, 5).map((ct: any) => (
                          <div key={ct.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${ct.amount > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {ct.amount > 0 ? `+${ct.amount}` : ct.amount}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm">{ct.description}</div>
                              <div className="text-xs text-white/30">
                                {new Date(ct.created_at).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {isDemo && (
                  <div className="glass rounded-xl p-4 border border-brand-500/20 text-center text-sm text-white/50">
                    👆 Modo demo — <Link href="/login" className="text-brand-400">faça login</Link> para ver seus dados reais
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── AGENDA ── */}
        {tab === "agenda" && (() => {
          const SERVICE_ICONS: Record<string, string> = {
            "Personal Training": "🏋️", "Pilates": "🧘", "Yoga": "🌿",
            "CrossFit": "🔥", "Funcional": "⚡", "Musculação": "💪",
            "Spinning": "🚴", "Avaliação Física": "📋",
          };
          const todayStr = new Date().toISOString().split("T")[0];
          const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

          const upcoming = appointments.filter((a: any) => ["booked", "confirmed"].includes(a.status));
          const history = appointments
            .filter((a: any) => ["completed", "checked_in"].includes(a.status))
            .sort((a: any, b: any) => (b.date + b.time).localeCompare(a.date + a.time));

          function dateLabel(date: string) {
            if (date === todayStr) return "Hoje";
            if (date === tomorrowStr) return "Amanhã";
            return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          }

          return (
            <div className="space-y-4 stagger">
              {/* Próximas aulas */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-display font-bold mb-4">Próximas Aulas</h3>
                {loading ? <Skeleton className="h-32" /> : upcoming.length === 0 ? (
                  <div className="text-white/30 text-sm text-center py-6">Nenhuma aula agendada</div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                        <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] text-brand-400 font-medium">{dateLabel(a.date)}</span>
                          <span className="text-sm font-bold text-brand-300">{a.time?.slice(0, 5)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm flex items-center gap-1.5">
                            <span>{SERVICE_ICONS[a.service_type] ?? "🏃"}</span>
                            <span className="truncate">{a.service_type}</span>
                          </div>
                          <div className="text-xs text-white/40">com {a.trainers?.name ?? "—"} • {a.duration || 60}min</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-brand-500/20 text-brand-400 shrink-0">
                          {a.status === "confirmed" ? "Confirmado" : "Agendado"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Histórico de treinos */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold">Histórico de Treinos</h3>
                  <span className="text-xs text-white/30">{history.length} treino{history.length !== 1 ? "s" : ""}</span>
                </div>
                {loading ? <Skeleton className="h-40" /> : history.length === 0 ? (
                  <div className="text-white/30 text-sm text-center py-6">Nenhum treino registrado ainda</div>
                ) : (
                  <div className="space-y-3">
                    {history.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] text-white/40 font-medium">
                            {new Date(a.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          </span>
                          <span className="text-sm font-bold text-white/60">{a.time?.slice(0, 5)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm flex items-center gap-1.5">
                            <span>{SERVICE_ICONS[a.service_type] ?? "🏃"}</span>
                            <span className="truncate">{a.service_type}</span>
                          </div>
                          <div className="text-xs text-white/40">com {a.trainers?.name ?? "—"} • {a.duration || 60}min</div>
                          {a.workout_prescriptions && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <span className="text-[10px] font-semibold bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-full">
                                {a.workout_prescriptions.name}
                              </span>
                              {(a.workout_prescriptions.muscle_groups as string[]).map((mg: string) => (
                                <span key={mg} className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded-full">{mg}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400 shrink-0">
                          ✓ Feito
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── RANKING ── */}
        {tab === "ranking" && (
          <div className="space-y-4 stagger">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">🏆 Ranking do Mês</h3>
              {loading ? <Skeleton className="h-60" /> : ranking.length === 0 ? (
                <div className="text-white/30 text-sm text-center py-8">Nenhum dado de ranking ainda</div>
              ) : (
                <div className="space-y-2">
                  {ranking.slice(0, 10).map((r: any, i: number) => {
                    const isMe = r.students?.id === student?.id;
                    return (
                      <div key={r.students?.id || i}
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${isMe ? "bg-brand-500/10 border border-brand-500/20" : ""}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                          i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                          i === 1 ? "bg-gray-400/20 text-gray-300" :
                          i === 2 ? "bg-amber-600/20 text-amber-500" :
                          "bg-white/5 text-white/40"}`}>
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[10px] font-bold">
                          {r.students?.name?.slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">
                            {r.students?.name?.split(" ").slice(0, 2).join(" ") || "Aluno"}
                            {isMe && <span className="ml-1 text-brand-400 text-xs">(você)</span>}
                          </div>
                          <div className="text-xs text-white/30">{r.students?.level} • {r.students?.coins}🪙</div>
                        </div>
                        <span className="font-display font-bold text-brand-400">{r.checkins}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRÊMIOS ── */}
        {tab === "rewards" && (
          <div className="space-y-4 stagger">
            <div className="glass rounded-2xl p-5 text-center">
              <div className="text-4xl font-display font-black gradient-text">{displayStudent.coins} 🪙</div>
              <div className="text-sm text-white/40 mt-1">Seus GymCoins disponíveis</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">Resgatar Prêmios</h3>
              {loading ? <Skeleton className="h-40" /> : rewards.length === 0 ? (
                <div className="text-white/30 text-sm text-center py-8">Nenhum prêmio cadastrado ainda</div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((r: any) => {
                    const canAfford = displayStudent.coins >= r.coins_cost;
                    const isLoading = redeemLoading === r.id;
                    return (
                      <div key={r.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                        <span className="text-3xl">{r.emoji || "🎁"}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{r.name}</div>
                          <div className="text-xs text-brand-400 font-bold">{r.coins_cost} 🪙</div>
                        </div>
                        <button
                          onClick={() => canAfford && !isLoading && handleRedeem(r.id)}
                          disabled={!canAfford || isLoading || isDemo}
                          className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                            canAfford && !isDemo
                              ? "bg-brand-500 text-white hover:bg-brand-600"
                              : "bg-white/5 text-white/20 cursor-not-allowed"}`}>
                          {isLoading ? "..." : canAfford ? "Resgatar" : `Faltam ${r.coins_cost - displayStudent.coins}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* QR Code pessoal */}
            {student && (
              <div className="glass rounded-2xl p-5 text-center">
                <div className="text-xs text-white/30 uppercase mb-3">Meu QR Code de Check-in</div>
                <button
                  onClick={async () => {
                    const { data: profile } = await createClient()
                      .from("profiles").select("studio_id").eq("id", student.user_id || "").single();
                    if (profile?.studio_id) {
                      window.open(`/api/qr/generate?studentId=${student.id}&studioId=${profile.studio_id}`, "_blank");
                    }
                  }}
                  className="bg-white/10 border border-white/20 text-white/70 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/15 transition">
                  📲 Gerar meu QR Code
                </button>
                <p className="text-white/20 text-xs mt-2">Válido por 24h • Use para check-in sem app</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-surface-900/95 backdrop-blur-xl border-t border-white/5 px-6 py-2 z-50">
        <div className="flex justify-around">
          {([
            { id: "home",    label: "Home",    icon: "🏠" },
            { id: "agenda",  label: "Agenda",  icon: "📅" },
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
