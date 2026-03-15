import type { Metadata } from "next";
export const metadata: Metadata = { title: "Painel — GymFlow & Coins" };
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
