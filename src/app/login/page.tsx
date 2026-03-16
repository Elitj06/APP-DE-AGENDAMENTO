"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      router.push("/painel");
      router.refresh();
    } catch {
      // If Supabase not configured, go to demo mode
      router.push("/painel");
    }
  }

  function handleDemoAccess() {
    setEmail("demo@gymflow.app");
    setPassword("demo123");
    // Navigate to painel directly (demo fallback will handle data)
    router.push("/painel");
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center p-6 noise">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-xl">G</div>
            <span className="font-display font-bold text-2xl">GymFlow & Coins</span>
          </Link>
          <p className="text-white/30 text-sm mt-3">Acesse seu painel</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="seu@email.com"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-display font-bold py-4 rounded-xl disabled:opacity-40 transition hover:shadow-lg hover:shadow-brand-500/30">
            {loading ? "Entrando..." : "Entrar →"}
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/20">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button type="button" onClick={handleDemoAccess}
            className="w-full border border-brand-500/30 bg-brand-500/5 text-brand-400 font-display font-bold py-3.5 rounded-xl transition hover:bg-brand-500/10 hover:border-brand-500/50 flex items-center justify-center gap-2">
            <span className="text-lg">🚀</span> Acessar Demo Interativa
          </button>

          <p className="text-center text-white/30 text-sm">
            Sem conta?{" "}
            <Link href="/onboarding" className="text-brand-400 hover:text-brand-300 transition">
              Começar grátis
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/15">
            Demo: demo@gymflow.app / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
