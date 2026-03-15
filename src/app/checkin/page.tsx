"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckinContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const studioId = params.get("studio");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!token || !studioId) { setState("error"); return; }

    fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, studioId, method: "qr_code" }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setResult(data); setState("success"); }
        else { setResult(data); setState("error"); }
      })
      .catch(() => setState("error"));
  }, [token, studioId]);

  const levelIcons: Record<string, string> = {
    Iniciante: "🌱", Bronze: "🥉", Prata: "🥈",
    Ouro: "🥇", Diamante: "💎", Lenda: "🔥",
  };

  return (
    <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center p-6 noise">
      <div className="w-full max-w-sm text-center">
        {state === "loading" && (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto animate-pulse">
              <span className="text-4xl">🏋️</span>
            </div>
            <p className="text-white/50">Processando check-in...</p>
          </div>
        )}

        {state === "success" && (
          <div className="glass rounded-3xl p-8 space-y-6 animate-fade-up">
            {result.levelUp ? (
              <div className="text-7xl animate-bounce">🎉</div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500/50 flex items-center justify-center mx-auto">
                <span className="text-5xl">✅</span>
              </div>
            )}

            <div>
              <h1 className="font-display font-black text-3xl gradient-text mb-1">
                {result.levelUp ? "SUBIU DE NÍVEL!" : "Check-in feito!"}
              </h1>
              <p className="text-white/50">Olá, {result.studentName?.split(" ")[0]}!</p>
            </div>

            <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">GymCoins ganhos</span>
                <span className="font-display font-black text-2xl text-brand-400">+{result.coinsEarned} 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Saldo total</span>
                <span className="font-bold text-white">{result.newBalance} coins</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Nível</span>
                <span className="font-bold" style={{ color: "#f97316" }}>
                  {levelIcons[result.newLevel]} {result.newLevel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Treinos este mês</span>
                <span className="font-bold text-white">{result.monthlyCheckins}</span>
              </div>
            </div>

            {result.bonusCoins > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 font-bold">🎁 Bônus de meta: +{result.bonusCoins} coins extras!</p>
              </div>
            )}

            <p className="text-white/30 text-xs">Bora treinar! 💪</p>
          </div>
        )}

        {state === "error" && (
          <div className="glass rounded-3xl p-8 space-y-4">
            <div className="text-6xl">❌</div>
            <h1 className="font-display font-bold text-2xl text-red-400">Check-in inválido</h1>
            <p className="text-white/40 text-sm">{result?.error || "QR Code inválido ou expirado. Solicite um novo ao seu studio."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-white/40">Carregando...</div>
      </div>
    }>
      <CheckinContent />
    </Suspense>
  );
}
