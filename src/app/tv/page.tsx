"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LEVELS = [
  { name: "Iniciante", icon: "🌱", color: "#78716c" },
  { name: "Bronze", icon: "🥉", color: "#cd7f32" },
  { name: "Prata", icon: "🥈", color: "#94a3b8" },
  { name: "Ouro", icon: "🥇", color: "#f59e0b" },
  { name: "Diamante", icon: "💎", color: "#818cf8" },
  { name: "Lenda", icon: "👑", color: "#f97316" },
];

function TVContent() {
  const params = useSearchParams();
  const studioId = params.get("studio");

  const [time, setTime] = useState(new Date());
  const [highlight, setHighlight] = useState(0);
  const [liveRanking, setLiveRanking] = useState<any[] | null>(null);
  const [studioName, setStudioName] = useState("GymFlow Studio");
  const [realtimeActive, setRealtimeActive] = useState(false);

  const fetchLiveRanking = useCallback(async () => {
    try {
      const url = studioId ? `/api/ranking?studioId=${studioId}` : "/api/ranking";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setLiveRanking(data);
    } catch {}
  }, [studioId]);

  useEffect(() => {
    fetch("/api/studio").then(r => r.ok ? r.json() : null).then(d => { if (d?.name) setStudioName(d.name); }).catch(() => {});
  }, []);

  // Realtime subscription — re-fetch ranking when a new check-in happens
  useEffect(() => {
    const supabase = createClient();
    fetchLiveRanking();

    const channel = supabase
      .channel("tv-checkins")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "checkins",
          ...(studioId ? { filter: `studio_id=eq.${studioId}` } : {}),
        },
        () => { fetchLiveRanking(); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "monthly_rankings" },
        () => { fetchLiveRanking(); }
      )
      .subscribe(status => {
        setRealtimeActive(status === "SUBSCRIBED");
      });

    const t1 = setInterval(() => setTime(new Date()), 1000);
    const t2 = setInterval(() => setHighlight(h => (h + 1) % 3), 4000);
    // Fallback polling every 30s in case realtime is unavailable
    const t3 = setInterval(fetchLiveRanking, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, [fetchLiveRanking, studioId]);

  const sorted = (liveRanking ?? []).map(r => ({
    id: r.students?.id ?? r.student_id,
    name: r.students?.name || r.student_name || "Aluno",
    avatar: (r.students?.name || r.student_name || "?").charAt(0),
    level: r.students?.level || "Bronze",
    monthlyCheckins: r.checkins,
    coins: r.students?.coins || r.coins || 0,
  }));

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden relative noise">
      <div className={`fixed top-3 right-3 z-50 flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1 ${realtimeActive ? "text-green-400 bg-green-500/10 border border-green-500/20" : "text-white/30 bg-white/5 border border-white/10"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${realtimeActive ? "bg-green-400 animate-pulse" : "bg-white/30"}`} />
        {realtimeActive ? "Ao vivo" : "Conectando..."}
      </div>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-700/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-2xl">G</div>
          <div>
            <div className="font-display font-black text-3xl tracking-tight">{studioName}</div>
            <div className="text-white/30 text-sm">Ranking do Mês — {time.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display font-black text-4xl tracking-tight tabular-nums">
            {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-white/30 text-sm">
            {time.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </header>

      <div className="relative z-10 px-12 pb-8 grid grid-cols-[1fr_320px] gap-8 h-[calc(100vh-140px)]">
        {/* Main ranking */}
        <div className="space-y-6">
          {/* Podium */}
          <div className="flex items-end justify-center gap-6 h-60">
            {[1, 0, 2].map((idx) => {
              const s = top3[idx];
              if (!s) return null;
              const heights = [200, 240, 170];
              const medals = ["🥈", "🥇", "🥉"];
              const glows = ["shadow-gray-400/10", "shadow-yellow-400/20", "shadow-amber-600/10"];
              const isHighlighted = highlight === idx;
              return (
                <div key={s.id} className={`flex flex-col items-center transition-all duration-700 ${isHighlighted ? "scale-105" : "scale-100"}`}>
                  <div className="text-4xl mb-2">{medals[idx]}</div>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-black text-2xl shadow-2xl ${glows[idx]} mb-3`}>
                    {s.avatar}
                  </div>
                  <div className="font-display font-bold text-lg text-center">{s.name.split(" ").slice(0, 2).join(" ")}</div>
                  <div className="text-brand-400 font-display font-black text-3xl">{s.monthlyCheckins}</div>
                  <div className="text-white/30 text-xs">check-ins</div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <span className="text-lg">{LEVELS.find(l => l.name === s.level)?.icon}</span>
                    <span style={{ color: LEVELS.find(l => l.name === s.level)?.color }}>{s.level}</span>
                  </div>
                  <div className="w-24 rounded-t-xl bg-gradient-to-t from-brand-600/30 to-brand-500/10 mt-4" style={{ height: heights[idx] }} />
                </div>
              );
            })}
          </div>

          {/* Rest of ranking */}
          <div className="space-y-2">
            {rest.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 glass rounded-xl px-6 py-3 animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-display font-bold text-white/40">{i + 4}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400/60 to-brand-600/60 flex items-center justify-center font-bold text-xs">{s.avatar}</div>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-white/30">{s.level} • {s.coins}🪙</div>
                </div>
                <div className="font-display font-black text-2xl text-brand-400">{s.monthlyCheckins}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-5xl mb-2">🪙</div>
            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Total de Coins</div>
            <div className="font-display font-black text-4xl gradient-text">
              {sorted.reduce((sum, s) => sum + s.coins, 0).toLocaleString()}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-4">Níveis</div>
            <div className="space-y-3">
              {LEVELS.map(l => {
                const count = sorted.filter(s => s.level === l.name).length;
                const total = Math.max(sorted.length, 1);
                return (
                  <div key={l.name} className="flex items-center gap-3">
                    <span className="text-xl">{l.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: l.color }}>{l.name}</div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full" style={{ backgroundColor: l.color, width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white/40">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Alunos no Ranking</div>
            <div className="font-display font-black text-5xl">{sorted.length}</div>
            <div className="text-brand-400 text-sm font-semibold mt-1">este mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TVPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-950" />}>
      <TVContent />
    </Suspense>
  );
}
