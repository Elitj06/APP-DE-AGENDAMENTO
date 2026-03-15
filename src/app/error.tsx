"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="font-display font-black text-3xl mb-3">Algo deu errado</h1>
        <p className="text-white/40 text-sm mb-8">{error.message || "Erro inesperado. Tente novamente."}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
          >
            Tentar novamente
          </button>
          <Link href="/" className="bg-white/5 hover:bg-white/10 text-white/60 font-semibold px-6 py-3 rounded-xl text-sm transition-all">
            Ir para início
          </Link>
        </div>
      </div>
    </div>
  );
}
