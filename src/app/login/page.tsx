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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/painel");
    router.refresh();
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

          <p className="text-center text-white/30 text-sm">
            Sem conta?{" "}
            <Link href="/onboarding" className="text-brand-400 hover:text-brand-300 transition">
              Começar grátis
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
