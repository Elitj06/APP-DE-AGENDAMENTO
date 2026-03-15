import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center p-6 noise">
      <div className="text-center">
        <div className="font-display font-black text-[8rem] leading-none gradient-text">404</div>
        <h1 className="font-display font-bold text-2xl mt-4 mb-2">Página não encontrada</h1>
        <p className="text-white/40 text-sm mb-8">Esta página não existe ou foi movida.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
            Ir para início
          </Link>
          <Link href="/painel" className="bg-white/5 hover:bg-white/10 text-white/60 font-semibold px-6 py-3 rounded-xl text-sm transition-all">
            Acessar Painel
          </Link>
        </div>
      </div>
    </div>
  );
}
