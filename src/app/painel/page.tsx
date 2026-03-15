"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────
interface StudioData {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  address?: string;
  establishment_type: string;
  plan: string;
}

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  level: string;
  coins: number;
  total_checkins: number;
  monthly_checkins: number;
  last_checkin?: string;
  joined_at: string;
  plan_name?: string;
}

interface AppointmentData {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  service_type: string;
  student?: { full_name: string };
  trainer?: { name: string };
}

interface TrainerData {
  id: string;
  name: string;
  specialty?: string;
  active_students: number;
  rating?: number;
}

interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  newThisMonth: number;
  mrr: number;
  mrrGrowth: number;
  churnRate: number;
  todayCheckins: number;
  todayAppointments: number;
  recentCheckins: Array<{ student_name: string; time: string; coins_earned: number }>;
  rankingTop5: Array<{ rank: number; student_name: string; checkins: number; coins: number }>;
}

interface CoinTx {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  profiles?: { full_name: string };
}

interface RewardData {
  id: string;
  name: string;
  description?: string | null;
  coins_cost: number;
  emoji?: string | null;
  is_active: boolean;
  stock_quantity?: number | null;
}

interface PaymentStats {
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  paidThisMonth: number;
}

// ── Static constants ─────────────────────────────────────────
const LEVELS = [
  { name: "Iniciante", icon: "🌱", color: "#78716c", minCheckins: 0 },
  { name: "Bronze", icon: "🥉", color: "#cd7f32", minCheckins: 10 },
  { name: "Prata", icon: "🥈", color: "#94a3b8", minCheckins: 25 },
  { name: "Ouro", icon: "🥇", color: "#f59e0b", minCheckins: 50 },
  { name: "Diamante", icon: "💎", color: "#818cf8", minCheckins: 100 },
  { name: "Lenda", icon: "👑", color: "#f97316", minCheckins: 200 },
];

const ESTABLISHMENT_TYPES: Record<string, { icon: string; label: string }> = {
  personal: { icon: "🏃", label: "Personal Trainer" },
  studio: { icon: "🏋️", label: "Studio / Micro Gym" },
  pilates: { icon: "🧘", label: "Pilates & Yoga" },
  crossfit: { icon: "🔥", label: "CrossFit & Funcional" },
};

const COIN_RULES = [
  { label: "Coins por check-in", value: 10 },
  { label: "Bônus meta semanal (4 check-ins)", value: 20 },
  { label: "Bônus 15 check-ins/mês", value: 50 },
  { label: "Bônus 20 check-ins/mês", value: 100 },
  { label: "Bônus por indicação", value: 150 },
];

// ── Icons ────────────────────────────────────────────────────
const Icons = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  coin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  tv: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>,
};

type Tab = "overview" | "agenda" | "alunos" | "coins" | "financeiro" | "whatsapp" | "config";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Visão Geral", icon: Icons.home },
  { id: "agenda", label: "Agenda", icon: Icons.calendar },
  { id: "alunos", label: "Alunos", icon: Icons.users },
  { id: "coins", label: "GymCoins", icon: Icons.coin },
  { id: "financeiro", label: "Financeiro", icon: Icons.chart },
  { id: "whatsapp", label: "WhatsApp", icon: Icons.whatsapp },
  { id: "config", label: "Configurar", icon: Icons.settings },
];

// ── Helper Components ────────────────────────────────────────
function KPI({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: string }) {
  const isPositive = trend?.startsWith("+");
  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200/60 hover:shadow-lg hover:shadow-brand-500/5 transition-all">
      <div className="text-xs text-surface-700/50 font-medium uppercase tracking-wider mb-2">{label}</div>
      <div className="font-display font-black text-2xl text-surface-900 tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {sub && <span className="text-xs text-surface-700/40">{sub}</span>}
        {trend && <span className={`text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-500"}`}>{trend}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-surface-100 text-surface-700/40 border-surface-200",
    overdue: "bg-red-50 text-red-600 border-red-200",
    booked: "bg-blue-50 text-blue-600 border-blue-200",
    confirmed: "bg-indigo-50 text-indigo-600 border-indigo-200",
    checked_in: "bg-green-50 text-green-600 border-green-200",
    completed: "bg-surface-100 text-surface-700/60 border-surface-200",
    cancelled: "bg-red-50 text-red-500 border-red-200",
    no_show: "bg-amber-50 text-amber-600 border-amber-200",
  };
  const labels: Record<string, string> = {
    active: "Ativo", inactive: "Inativo", overdue: "Inadimplente",
    booked: "Agendado", confirmed: "Confirmado", checked_in: "Check-in",
    completed: "Concluído", cancelled: "Cancelado", no_show: "Faltou",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${styles[status] || styles.active}`}>{labels[status] || status}</span>;
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return <div className={`${sz} rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shrink-0`}>{initials}</div>;
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-200 rounded-xl ${className}`} />;
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════
function OverviewTab({ dashboard, trainers, loading }: {
  dashboard: DashboardData | null;
  trainers: TrainerData[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const d = dashboard;
  const todayCheckins = d?.todayCheckins ?? 0;
  const todayAppts = d?.todayAppointments ?? 0;
  const recentCheckins = d?.recentCheckins ?? [];
  const rankingTop5 = d?.rankingTop5 ?? [];

  return (
    <div className="space-y-6 stagger">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Alunos Ativos" value={(d?.activeStudents ?? 0).toString()} sub={`${d?.newThisMonth ?? 0} novos`} trend={`+${d?.mrrGrowth?.toFixed(1) ?? 0}%`} />
        <KPI label="MRR" value={`R$ ${((d?.mrr ?? 0) / 100 / 1000).toFixed(1)}K`} trend={`+${d?.mrrGrowth?.toFixed(1) ?? 0}%`} />
        <KPI label="Aulas Hoje" value={`${todayCheckins}/${todayAppts}`} sub="check-ins/agendadas" />
        <KPI label="Ranking Top" value={rankingTop5[0]?.student_name?.split(" ")[0] ?? "—"} sub={`${rankingTop5[0]?.checkins ?? 0} check-ins`} />
      </div>

      {/* Recent Check-ins + Ranking */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Check-ins Recentes</h3>
          {recentCheckins.length === 0 ? (
            <div className="text-center py-8 text-surface-700/30 text-sm">Nenhum check-in hoje ainda</div>
          ) : (
            <div className="space-y-2">
              {recentCheckins.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                  <span className="text-sm font-mono text-surface-700/50 w-12">{c.time}</span>
                  <Avatar initials={c.student_name.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-900 truncate">{c.student_name}</div>
                    <div className="text-xs text-surface-700/40">+{c.coins_earned} 🪙</div>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-semibold">✓</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">🏆 Ranking do Mês</h3>
          {rankingTop5.length === 0 ? (
            <div className="text-center py-8 text-surface-700/30 text-sm">Sem dados de ranking ainda</div>
          ) : (
            <div className="space-y-2">
              {rankingTop5.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-surface-100 text-surface-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-surface-50 text-surface-500"}`}>
                    {i + 1}
                  </span>
                  <Avatar initials={r.student_name.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-900 truncate">{r.student_name}</div>
                    <div className="text-xs text-surface-700/40">{r.checkins} check-ins</div>
                  </div>
                  <span className="text-sm font-bold text-brand-500">{r.coins} 🪙</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trainers */}
      {trainers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Equipe</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {trainers.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200/40">
                <Avatar initials={t.name.slice(0, 2).toUpperCase()} size="lg" />
                <div>
                  <div className="font-semibold text-surface-900">{t.name}</div>
                  <div className="text-xs text-surface-700/40">{t.specialty ?? "Trainer"}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-700/50">
                    <span>{t.active_students} alunos</span>
                    {t.rating && <span>⭐ {t.rating.toFixed(1)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AGENDA TAB
// ══════════════════════════════════════════════════════════════
function AgendaTab({ trainers }: { trainers: TrainerData[] }) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/appointments?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const timeSlots = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
  const dateLabels: Record<string, string> = {
    [today]: "Hoje",
    [tomorrow]: "Amanhã",
    [dayAfter]: new Date(Date.now() + 172800000).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
  };

  return (
    <div className="space-y-6 stagger">
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-surface-900">Agenda</h3>
          <div className="flex gap-2">
            {[today, tomorrow, dayAfter].map(d => (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${d === selectedDate ? "bg-brand-500 text-white" : "bg-surface-50 text-surface-700/60 hover:bg-surface-100"}`}>
                {dateLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : (
          <div className="space-y-1">
            {timeSlots.map(time => {
              const appt = appointments.find(a => a.time?.startsWith(time));
              return (
                <div key={time} className="flex items-center gap-4 py-2 border-b border-surface-100/60 last:border-0">
                  <span className="text-sm font-mono text-surface-700/40 w-12">{time}</span>
                  {appt ? (
                    <div className="flex-1 flex items-center gap-3 bg-brand-50/50 rounded-xl px-4 py-3 border border-brand-200/30">
                      <Avatar initials={(appt.student?.full_name ?? "?").slice(0, 2).toUpperCase()} size="sm" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-surface-900">{appt.student?.full_name ?? "—"}</div>
                        <div className="text-xs text-surface-700/40">{appt.service_type} • {appt.duration}min • {appt.trainer?.name ?? "—"}</div>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-3 rounded-xl border-2 border-dashed border-surface-200/40 text-xs text-surface-700/30 hover:border-brand-300/40 hover:text-brand-400 transition-all cursor-pointer">
                      + Disponível
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trainers availability */}
      {trainers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Disponibilidade da Equipe</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {trainers.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-surface-200/40">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initials={t.name.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="font-semibold text-sm text-surface-900">{t.name}</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {["S","T","Q","Q","S","S","D"].map((d, i) => (
                    <div key={i} className={`text-center py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${i < 6 ? "bg-brand-50 text-brand-600 border border-brand-200/30" : "bg-surface-50 text-surface-700/30"}`}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-surface-700/40">06:00 — 20:00 • Intervalo 12:00-13:00</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STUDENTS TAB
// ══════════════════════════════════════════════════════════════
function AlunosTab() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "inactive">("all");
  const [selected, setSelected] = useState<StudentData | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then(r => r.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !s.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: students.length,
    active: students.filter(s => s.status === "active").length,
    overdue: students.filter(s => s.status === "overdue").length,
    inactive: students.filter(s => s.status === "inactive").length,
  };

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total" value={counts.total.toString()} />
        <KPI label="Ativos" value={counts.active.toString()} trend={counts.active > 0 ? `+${Math.round(counts.active / Math.max(counts.total, 1) * 100)}%` : undefined} />
        <KPI label="Inadimplentes" value={counts.overdue.toString()} />
        <KPI label="Inativos" value={counts.inactive.toString()} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar aluno..." className="flex-1 bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 transition-all" />
          <div className="flex gap-2">
            {(["all","active","overdue","inactive"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${f === filter ? "bg-brand-500 text-white" : "bg-surface-50 text-surface-700/60 hover:bg-surface-100"}`}>
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "overdue" ? "Inadimpl." : "Inativos"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-surface-700/30 text-sm">
            {search ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado ainda"}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(s => (
              <div key={s.id} onClick={() => setSelected(s)} className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-surface-50 cursor-pointer transition-all border-b border-surface-100/60 last:border-0">
                <Avatar initials={s.full_name.slice(0, 2).toUpperCase()} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-surface-900">{s.full_name}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="text-xs text-surface-700/40">{s.plan_name ?? "—"} • {s.total_checkins} check-ins • Nível: {s.level}</div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-brand-500">{s.coins} 🪙</div>
                  <div className="text-xs text-surface-700/40">{s.monthly_checkins} este mês</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <Avatar initials={selected.full_name.slice(0, 2).toUpperCase()} size="lg" />
              <div>
                <h3 className="font-display font-bold text-xl text-surface-900">{selected.full_name}</h3>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black text-brand-500">{selected.coins}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">GymCoins</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black text-surface-900">{selected.total_checkins}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">Check-ins Total</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black">{selected.level}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">Nível</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black">{selected.monthly_checkins}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">Mês Atual</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-surface-700/60 mb-6">
              <div className="flex justify-between"><span>Email</span><span className="text-surface-900 truncate ml-4">{selected.email}</span></div>
              {selected.phone && <div className="flex justify-between"><span>Telefone</span><span className="text-surface-900">{selected.phone}</span></div>}
              <div className="flex justify-between"><span>Plano</span><span className="text-surface-900">{selected.plan_name ?? "—"}</span></div>
              {selected.last_checkin && <div className="flex justify-between"><span>Último Check-in</span><span className="text-surface-900">{new Date(selected.last_checkin).toLocaleDateString("pt-BR")}</span></div>}
              <div className="flex justify-between"><span>Membro desde</span><span className="text-surface-900">{new Date(selected.joined_at).toLocaleDateString("pt-BR")}</span></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-brand-600 transition-all">Enviar Mensagem</button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-surface-100 text-surface-700/60 font-semibold py-2.5 rounded-xl text-sm hover:bg-surface-200 transition-all">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GYMCOINS TAB
// ══════════════════════════════════════════════════════════════
function CoinsTab() {
  const [transactions, setTransactions] = useState<CoinTx[]>([]);
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("coin_transactions")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("coins_cost", { ascending: true }),
    ]).then(([txRes, rewardsRes]) => {
      setTransactions((txRes.data ?? []) as unknown as CoinTx[]);
      setRewards(rewardsRes.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalDistributed = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalRedeemed = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Coins Distribuídos" value={totalDistributed.toLocaleString()} />
        <KPI label="Coins Resgatados" value={totalRedeemed.toLocaleString()} />
        <KPI label="Transações" value={transactions.length.toString()} />
        <KPI label="Recompensas Ativas" value={rewards.length.toString()} />
      </div>

      {/* Reward catalog */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Catálogo de Recompensas</h3>
        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-8 text-surface-700/30 text-sm">Nenhuma recompensa cadastrada</div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {rewards.map(r => (
              <div key={r.id} className="text-center p-4 rounded-xl border border-surface-200/40 hover:border-brand-300/40 transition-all">
                <div className="text-4xl mb-2">{r.emoji ?? "🎁"}</div>
                <div className="text-sm font-semibold text-surface-900">{r.name}</div>
                <div className="text-brand-500 font-display font-bold mt-1">{r.coins_cost} 🪙</div>
                {r.stock_quantity != null && (
                  <div className="text-xs text-surface-700/40 mt-1">{r.stock_quantity} disponíveis</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Config + Levels */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Regras de Coins</h3>
          <div className="space-y-3">
            {COIN_RULES.map(rule => (
              <div key={rule.label} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                <span className="text-sm text-surface-700/60">{rule.label}</span>
                <span className="font-display font-bold text-brand-500">{rule.value} 🪙</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Níveis de Progressão</h3>
          <div className="space-y-2">
            {LEVELS.map(l => (
              <div key={l.name} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <span className="text-2xl">{l.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: l.color }}>{l.name}</div>
                  <div className="text-xs text-surface-700/40">{l.minCheckins}+ check-ins</div>
                </div>
                <div className="w-20 h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: l.color, width: `${Math.min(100, l.minCheckins / 3)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Transações Recentes</h3>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-surface-700/30 text-sm">Nenhuma transação ainda</div>
        ) : (
          <div className="space-y-2">
            {transactions.map(ct => (
              <div key={ct.id} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${ct.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {ct.amount > 0 ? "+" + ct.amount : ct.amount}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-surface-900">{ct.profiles?.full_name ?? "—"}</div>
                  <div className="text-xs text-surface-700/40">{ct.description}</div>
                </div>
                <span className="text-xs text-surface-700/40">{new Date(ct.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FINANCIAL TAB
// ══════════════════════════════════════════════════════════════
function FinanceiroTab({ dashboard }: { dashboard: DashboardData | null }) {
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then(r => r.json())
      .then(data => setPaymentStats(data.stats ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mrr = (dashboard?.mrr ?? 0) / 100;
  const mrrGrowth = dashboard?.mrrGrowth ?? 0;
  const pendingRevenue = (paymentStats?.pendingRevenue ?? 0) / 100;
  const overdueRevenue = (paymentStats?.overdueRevenue ?? 0) / 100;
  const paidThisMonth = (paymentStats?.paidThisMonth ?? 0) / 100;

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="MRR" value={`R$ ${(mrr / 1000).toFixed(1)}K`} trend={`+${mrrGrowth.toFixed(1)}%`} />
        <KPI label="Arrecadado (Mês)" value={`R$ ${(paidThisMonth / 1000).toFixed(1)}K`} />
        <KPI label="Pendente" value={`R$ ${(pendingRevenue / 1000).toFixed(1)}K`} sub={`${paymentStats?.pendingCount ?? 0} faturas`} />
        <KPI label="Inadimplência" value={`R$ ${(overdueRevenue / 1000).toFixed(1)}K`} sub={`${paymentStats?.overdueCount ?? 0} atrasadas`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Resumo Financeiro</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50/50 border border-green-200/30">
                <div>
                  <div className="text-sm font-semibold text-green-700">Receita Paga (Mês)</div>
                  <div className="text-xs text-green-600/60">{paymentStats?.paidCount ?? 0} pagamentos confirmados</div>
                </div>
                <div className="font-display font-black text-xl text-green-600">R$ {paidThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200/30">
                <div>
                  <div className="text-sm font-semibold text-amber-700">Pagamentos Pendentes</div>
                  <div className="text-xs text-amber-600/60">{paymentStats?.pendingCount ?? 0} faturas aguardando</div>
                </div>
                <div className="font-display font-black text-xl text-amber-600">R$ {pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-200/30">
                <div>
                  <div className="text-sm font-semibold text-red-600">Pagamentos Atrasados</div>
                  <div className="text-xs text-red-500/60">{paymentStats?.overdueCount ?? 0} faturas em atraso</div>
                </div>
                <div className="font-display font-black text-xl text-red-500">R$ {overdueRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Métricas SaaS</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-surface-100">
              <span className="text-sm text-surface-700/60">MRR Atual</span>
              <span className="font-display font-bold text-surface-900">R$ {mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-surface-100">
              <span className="text-sm text-surface-700/60">Crescimento MoM</span>
              <span className={`font-display font-bold ${mrrGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>{mrrGrowth >= 0 ? "+" : ""}{mrrGrowth.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-surface-100">
              <span className="text-sm text-surface-700/60">Alunos Ativos</span>
              <span className="font-display font-bold text-surface-900">{dashboard?.activeStudents ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-surface-700/60">Ticket Médio</span>
              <span className="font-display font-bold text-surface-900">
                R$ {dashboard?.activeStudents ? (mrr / dashboard.activeStudents).toFixed(2) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WHATSAPP TAB
// ══════════════════════════════════════════════════════════════
function WhatsAppTab() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const templates = [
    { id: "pre_appointment", name: "Lembrete de Agendamento", trigger: "1h antes da aula", active: true, preview: "Olá {name}! Sua aula começa em 1 hora. Confirme sua presença 💪" },
    { id: "post_checkin", name: "Confirmação de Check-in", trigger: "Após check-in", active: true, preview: "Check-in confirmado! Você ganhou {coins} GymCoins 🪙 Total: {total}" },
    { id: "level_up", name: "Subiu de Nível", trigger: "Ao subir de nível", active: true, preview: "🎉 Parabéns! Você subiu para o nível {level}!" },
    { id: "reactivation", name: "Reativação", trigger: "7 dias sem visita", active: true, preview: "Saudades! Faz {days} dias que você não nos visita. Que tal voltar hoje? 💪" },
    { id: "payment_due", name: "Aviso de Cobrança", trigger: "3 dias antes do vencimento", active: true, preview: "Lembrete: Sua mensalidade vence em {days} dias. Evite a inadimplência!" },
    { id: "weekly_ranking", name: "Ranking Semanal", trigger: "Toda segunda-feira", active: false, preview: "📊 Ranking da semana: Você está em #{position} com {checkins} check-ins!" },
  ];

  async function sendBroadcast() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: "custom", message, target: "all_active" }),
      });
      const data = await res.json();
      setResult(res.ok ? `✅ Enviado para ${data.sent ?? "?"} alunos` : `❌ Erro: ${data.error}`);
      setMessage("");
    } catch {
      setResult("❌ Falha ao enviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Templates Ativos" value={templates.filter(t => t.active).length.toString()} />
        <KPI label="Taxa de Entrega" value="96%" />
        <KPI label="Taxa de Leitura" value="87%" />
        <KPI label="Taxa de Clique" value="31%" />
      </div>

      {/* Send broadcast */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Enviar Mensagem em Massa</h3>
        <div className="flex gap-3">
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Digite a mensagem para enviar a todos os alunos ativos..."
            className="flex-1 bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 transition-all resize-none h-20" />
          <button onClick={sendBroadcast} disabled={sending || !message.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 rounded-xl text-sm transition-all flex items-center gap-2">
            {sending ? "..." : "📤 Enviar"}
          </button>
        </div>
        {result && <p className="mt-2 text-sm text-surface-700/60">{result}</p>}
      </div>

      {/* Templates */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Templates de Notificação</h3>
        <div className="space-y-3">
          {templates.map(n => (
            <div key={n.id} className="flex items-start gap-4 p-4 rounded-xl border border-surface-200/40 hover:border-brand-200/40 transition-all">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${n.active ? "bg-green-50" : "bg-surface-100"}`}>
                {n.active ? "✅" : "⏸️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-surface-900">{n.name}</span>
                  <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">WhatsApp</span>
                </div>
                <div className="text-xs text-surface-700/40 mb-2">Disparo: {n.trigger}</div>
                <div className="bg-[#dcf8c6] rounded-xl rounded-tl-none px-4 py-2 text-sm text-surface-800 max-w-md">
                  {n.preview}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" defaultChecked={n.active} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-200 peer-focus:ring-2 peer-focus:ring-brand-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONFIG TAB
// ══════════════════════════════════════════════════════════════
function ConfigTab({ studio, onStudioUpdate }: { studio: StudioData | null; onStudioUpdate: (s: StudioData) => void }) {
  const [form, setForm] = useState({
    name: studio?.name ?? "",
    owner_name: studio?.owner_name ?? "",
    email: studio?.email ?? "",
    address: studio?.address ?? "",
    establishment_type: studio?.establishment_type ?? "studio",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (studio) {
      setForm({
        name: studio.name,
        owner_name: studio.owner_name,
        email: studio.email,
        address: studio.address ?? "",
        establishment_type: studio.establishment_type,
      });
    }
  }, [studio]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        onStudioUpdate(updated);
        setSaveMsg("✅ Alterações salvas!");
      } else {
        setSaveMsg("❌ Erro ao salvar");
      }
    } catch {
      setSaveMsg("❌ Erro ao salvar");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  return (
    <div className="space-y-6 stagger">
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Perfil do Estabelecimento</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Nome</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Responsável</label>
              <input value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
                className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Endereço</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-2">Tipo de Estabelecimento</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ESTABLISHMENT_TYPES).map(([key, val]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, establishment_type: key }))}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border ${form.establishment_type === key ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-surface-50 border-surface-200/40 text-surface-700/60 hover:bg-surface-100"}`}>
                    <span className="text-lg">{val.icon}</span>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button onClick={handleSave} disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          {saveMsg && <span className="text-sm text-surface-700/60">{saveMsg}</span>}
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Assinatura</h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50/50 border border-brand-200/30 mb-4">
          <div>
            <div className="font-semibold text-surface-900">Plano {studio?.plan ?? "—"}</div>
            <div className="text-xs text-surface-700/40 mt-1">Gerencie sua assinatura no portal de faturamento</div>
          </div>
          <button
            onClick={() => fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "portal" }) }).then(r => r.json()).then(d => d.url && window.open(d.url, "_blank"))}
            className="bg-brand-500 text-white font-semibold py-2 px-4 rounded-xl text-sm hover:bg-brand-600 transition-all">
            Gerenciar Assinatura →
          </button>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Integrações</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Wellhub (Gympass)", status: "Disponível", color: "blue", icon: "🏋️" },
            { name: "TotalPass", status: "Disponível", color: "blue", icon: "🎫" },
            { name: "Catraca Eletrônica", status: "Configurar", color: "amber", icon: "🚪" },
            { name: "WhatsApp Business", status: "Conectado", color: "green", icon: "📱" },
            { name: "PIX Automático", status: "Disponível", color: "blue", icon: "💳" },
            { name: "Google Calendar", status: "Disponível", color: "blue", icon: "📅" },
          ].map(int => (
            <div key={int.name} className="flex items-center gap-3 p-4 rounded-xl border border-surface-200/40">
              <div className="text-2xl">{int.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-surface-900">{int.name}</div>
                <span className={`text-[10px] font-medium ${int.color === "green" ? "text-green-600" : int.color === "blue" ? "text-blue-600" : "text-amber-600"}`}>
                  ● {int.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/app" className="bg-white rounded-2xl p-6 border border-surface-200/60 hover:border-brand-300/40 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📱</div>
            <div>
              <div className="font-display font-bold text-surface-900">App do Aluno</div>
              <div className="text-xs text-surface-700/40">Ver como seus alunos veem</div>
            </div>
          </div>
        </Link>
        <Link href="/tv" className="bg-white rounded-2xl p-6 border border-surface-200/60 hover:border-brand-300/40 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📺</div>
            <div>
              <div className="font-display font-bold text-surface-900">TV Display</div>
              <div className="text-xs text-surface-700/40">Ranking ao vivo no studio</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════
export default function PainelPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/studio").then(r => r.ok ? r.json() : null),
      fetch("/api/dashboard").then(r => r.ok ? r.json() : null),
      fetch("/api/trainers").then(r => r.ok ? r.json() : []),
    ]).then(([studioData, dashData, trainersData]) => {
      setStudio(studioData);
      setDashboard(dashData);
      setTrainers(Array.isArray(trainersData) ? trainersData : []);
    }).catch(() => {}).finally(() => setLoadingGlobal(false));
  }, []);

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const TabContent = useCallback(() => {
    switch (activeTab) {
      case "overview": return <OverviewTab dashboard={dashboard} trainers={trainers} loading={loadingGlobal} />;
      case "agenda": return <AgendaTab trainers={trainers} />;
      case "alunos": return <AlunosTab />;
      case "coins": return <CoinsTab />;
      case "financeiro": return <FinanceiroTab dashboard={dashboard} />;
      case "whatsapp": return <WhatsAppTab />;
      case "config": return <ConfigTab studio={studio} onStudioUpdate={setStudio} />;
    }
  }, [activeTab, dashboard, trainers, loadingGlobal, studio]);

  const studioInitials = studio?.name?.slice(0, 2).toUpperCase() ?? "G";
  const estType = ESTABLISHMENT_TYPES[studio?.establishment_type ?? "studio"];

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-950 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-lg">G</div>
            <div>
              <div className="font-display font-bold text-base tracking-tight">GymFlow</div>
              <div className="text-[10px] text-white/40">& Coins</div>
            </div>
          </Link>
        </div>

        <div className="px-6 py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400">{studioInitials}</div>
            <div>
              <div className="text-sm font-semibold">{studio?.name ?? "Carregando..."}</div>
              <div className="text-[10px] text-white/40">Plano {studio?.plan ?? "—"} • {estType?.label ?? "Studio"}</div>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1 border-t border-white/5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-brand-500/15 text-brand-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/tv" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white py-2 rounded-xl text-xs font-medium transition-all">
              {Icons.tv} TV Display
            </Link>
            <Link href="/app" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white py-2 rounded-xl text-xs font-medium transition-all">
              📱 App Aluno
            </Link>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-white/3 hover:bg-red-500/10 text-white/20 hover:text-red-400 py-2 rounded-xl text-xs font-medium transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-700/60 hover:text-surface-900 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <h1 className="font-display font-bold text-xl text-surface-900">{TABS.find(t => t.id === activeTab)?.label}</h1>
                <p className="text-xs text-surface-700/40 capitalize">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dashboard && (
                <div className="hidden md:flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full">
                  <span className="text-lg">🪙</span>
                  <span className="font-display font-bold text-brand-600">{dashboard.totalStudents}</span>
                  <span className="text-xs text-brand-400">alunos</span>
                </div>
              )}
              <Avatar initials={studioInitials} size="sm" />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl">
          <TabContent />
        </div>
      </main>
    </div>
  );
}
