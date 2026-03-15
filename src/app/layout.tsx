import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymFlow & Coins — Agendamento + Gamificação para Fitness",
  description: "Plataforma SaaS para personal trainers, studios, pilates e micro gyms. Agendamento automatizado, check-in inteligente, gamificação com Gym Coins.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏋️</text></svg>" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GymFlow",
  },
  openGraph: {
    title: "GymFlow & Coins — Agendamento + Gamificação para Fitness",
    description: "Plataforma SaaS para personal trainers, studios, pilates e micro gyms.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
