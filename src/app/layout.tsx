import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymFlow & Coins — Agendamento + Gamificação para Fitness",
  description: "Plataforma SaaS para personal trainers, studios, pilates e micro gyms. Agendamento automatizado, check-in inteligente, gamificação com Gym Coins.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏋️</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
