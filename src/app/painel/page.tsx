"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PROVIDER_PROFILE, STUDENTS, APPOINTMENTS, TRAINERS, COIN_TRANSACTIONS,
  REVENUE_DATA, CHECKIN_HEATMAP, HOURS_LABELS, LEVELS, NOTIFICATION_TEMPLATES,
  PLANS, FINANCIAL_SUMMARY, WHATSAPP_STATS, GAMIFICATION_CONFIG,
  ESTABLISHMENT_TYPES, type Student, type Appointment
} from "@/lib/mock-data";

// ── ICONS (inline SVG) ─────────────────────────────────────
const Icons = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  coin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>,
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

// ── KPI Card ─────────────────────────────────────────────────
function KPI({ label, value, sub, trend, color = "brand" }: { label: string; value: string; sub?: string; trend?: string; color?: string }) {
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

// ── Status Badge ─────────────────────────────────────────────
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

// ── Avatar ──────────────────────────────────────────────────
function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return <div className={`${sz} rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shrink-0`}>{initials}</div>;
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════
function OverviewTab() {
  const todayAppts = APPOINTMENTS.filter(a => a.date === "2026-03-13");
  const completed = todayAppts.filter(a => a.status === "completed" || a.status === "checked_in").length;
  const fs = FINANCIAL_SUMMARY;

  return (
    <div className="space-y-6 stagger">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Alunos Ativos" value={fs.activeStudents.toString()} sub={`${fs.newThisMonth} novos`} trend="+7.2%" />
        <KPI label="MRR" value={`R$ ${(fs.mrr / 1000).toFixed(1)}K`} trend={`+${fs.mrrGrowth}%`} />
        <KPI label="Aulas Hoje" value={`${completed}/${todayAppts.length}`} sub="concluídas" />
        <KPI label="GymCoins Mês" value="4.280" trend="+12%" />
      </div>

      {/* Revenue Chart + Heatmap */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Receita Mensal</h3>
          <div className="h-40 flex items-end gap-3">
            {REVENUE_DATA.map((r, i) => {
              const max = Math.max(...REVENUE_DATA.map(d => d.value));
              const h = (r.value / max) * 100;
              const isLast = i === REVENUE_DATA.length - 1;
              return (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-surface-700/50">
                    {(r.value / 1000).toFixed(1)}K
                  </span>
                  <div className={`w-full rounded-xl transition-all duration-500 ${isLast ? "bg-gradient-to-t from-brand-600 to-brand-400" : "bg-surface-100"}`} style={{ height: `${h}%` }} />
                  <span className="text-[11px] text-surface-700/40">{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Mapa de Ocupação</h3>
          <div className="space-y-2">
            <div className="flex gap-2 pl-10">
              {HOURS_LABELS.map(h => <div key={h} className="flex-1 text-center text-[10px] text-surface-700/40">{h}</div>)}
            </div>
            {CHECKIN_HEATMAP.map(row => (
              <div key={row.day} className="flex items-center gap-2">
                <span className="w-8 text-[11px] text-surface-700/50 font-medium">{row.day}</span>
                <div className="flex-1 flex gap-1.5">
                  {row.slots.map((v, i) => {
                    const max = 28;
                    const intensity = v / max;
                    return <div key={i} className="flex-1 h-8 rounded-lg transition-all" style={{ backgroundColor: `rgba(249, 115, 22, ${intensity * 0.9 + 0.05})` }} title={`${v} check-ins`} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule Mini + Recent Coins */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-surface-900">Agenda de Hoje</h3>
            <span className="text-xs text-surface-700/40">13 Mar 2026</span>
          </div>
          <div className="space-y-2">
            {todayAppts.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <span className="text-sm font-mono text-surface-700/50 w-12">{a.time}</span>
                <Avatar initials={a.studentName.slice(0,2).toUpperCase()} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-surface-900 truncate">{a.studentName}</div>
                  <div className="text-xs text-surface-700/40">{a.type} • {a.trainer}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Últimas Transações GymCoins</h3>
          <div className="space-y-2">
            {COIN_TRANSACTIONS.slice(0, 5).map(ct => (
              <div key={ct.id} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ct.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {ct.amount > 0 ? "+" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-surface-900">{ct.studentName}</div>
                  <div className="text-xs text-surface-700/40">{ct.description}</div>
                </div>
                <span className={`text-sm font-bold ${ct.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {ct.amount > 0 ? "+" : ""}{ct.amount} 🪙
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trainers */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Equipe</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {TRAINERS.map(t => (
            <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200/40">
              <Avatar initials={t.avatar} size="lg" />
              <div>
                <div className="font-semibold text-surface-900">{t.name}</div>
                <div className="text-xs text-surface-700/40">{t.specialty}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-surface-700/50">
                  <span>{t.activeStudents} alunos</span>
                  <span>⭐ {t.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AGENDA TAB
// ══════════════════════════════════════════════════════════════
function AgendaTab() {
  const [selectedDate, setSelectedDate] = useState("2026-03-13");
  const filtered = APPOINTMENTS.filter(a => a.date === selectedDate);
  const timeSlots = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

  return (
    <div className="space-y-6 stagger">
      {/* Date selector */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-surface-900">Agenda</h3>
          <div className="flex gap-2">
            {["2026-03-13", "2026-03-14", "2026-03-15"].map(d => (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${d === selectedDate ? "bg-brand-500 text-white" : "bg-surface-50 text-surface-700/60 hover:bg-surface-100"}`}>
                {d === "2026-03-13" ? "Hoje" : d === "2026-03-14" ? "Amanhã" : "15 Mar"}
              </button>
            ))}
          </div>
        </div>

        {/* Time grid */}
        <div className="space-y-1">
          {timeSlots.map(time => {
            const appt = filtered.find(a => a.time === time);
            return (
              <div key={time} className="flex items-center gap-4 py-2 border-b border-surface-100/60 last:border-0">
                <span className="text-sm font-mono text-surface-700/40 w-12">{time}</span>
                {appt ? (
                  <div className="flex-1 flex items-center gap-3 bg-brand-50/50 rounded-xl px-4 py-3 border border-brand-200/30">
                    <Avatar initials={appt.studentName.slice(0,2).toUpperCase()} size="sm" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-surface-900">{appt.studentName}</div>
                      <div className="text-xs text-surface-700/40">{appt.type} • {appt.duration}min • {appt.trainer}</div>
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
      </div>

      {/* Availability config */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Configurar Disponibilidade</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {TRAINERS.map(t => (
            <div key={t.id} className="p-4 rounded-xl border border-surface-200/40">
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={t.avatar} size="sm" />
                <div className="font-semibold text-sm text-surface-900">{t.name}</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {["S","T","Q","Q","S","S","D"].map((d,i) => (
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
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STUDENTS TAB
// ══════════════════════════════════════════════════════════════
function AlunosTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "inactive">("all");
  const [selected, setSelected] = useState<Student | null>(null);
  const filtered = STUDENTS.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 stagger">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total" value={STUDENTS.length.toString()} />
        <KPI label="Ativos" value={STUDENTS.filter(s=>s.status==="active").length.toString()} trend="+7" />
        <KPI label="Inadimplentes" value={STUDENTS.filter(s=>s.status==="overdue").length.toString()} />
        <KPI label="Inativos" value={STUDENTS.filter(s=>s.status==="inactive").length.toString()} />
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

        <div className="space-y-1">
          {filtered.map(s => (
            <div key={s.id} onClick={() => setSelected(s)} className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-surface-50 cursor-pointer transition-all border-b border-surface-100/60 last:border-0">
              <Avatar initials={s.avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-surface-900">{s.name}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="text-xs text-surface-700/40">{s.plan} • {s.checkins} check-ins • Nível: {s.level}</div>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-brand-500">{s.coins} 🪙</div>
                <div className="text-xs text-surface-700/40">{s.monthlyCheckins} este mês</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <Avatar initials={selected.avatar} size="lg" />
              <div>
                <h3 className="font-display font-bold text-xl text-surface-900">{selected.name}</h3>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black text-brand-500">{selected.coins}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">GymCoins</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black text-surface-900">{selected.checkins}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">Check-ins Total</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black">{selected.level}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">Nível</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-black">{selected.monthlyCheckins}</div>
                <div className="text-[10px] text-surface-700/40 uppercase">Mês Atual</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-surface-700/60 mb-6">
              <div className="flex justify-between"><span>Email</span><span className="text-surface-900">{selected.email}</span></div>
              <div className="flex justify-between"><span>Telefone</span><span className="text-surface-900">{selected.phone}</span></div>
              <div className="flex justify-between"><span>Plano</span><span className="text-surface-900">{selected.plan}</span></div>
              <div className="flex justify-between"><span>Último Check-in</span><span className="text-surface-900">{selected.lastCheckin}</span></div>
              <div className="flex justify-between"><span>Membro desde</span><span className="text-surface-900">{selected.joinedAt}</span></div>
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
  const gc = GAMIFICATION_CONFIG;
  return (
    <div className="space-y-6 stagger">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Coins Distribuídos (Mês)" value="4.280" trend="+12%" />
        <KPI label="Coins Resgatados" value="1.350" />
        <KPI label="Resgates Realizados" value="67" trend="+23%" />
        <KPI label="Coin/Aluno Médio" value="36.4" />
      </div>

      {/* Reward catalog */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Catálogo de Recompensas</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
          {gc.rewards.map(r => (
            <div key={r.id} className="text-center p-4 rounded-xl border border-surface-200/40 hover:border-brand-300/40 transition-all">
              <div className="text-4xl mb-2">{r.emoji}</div>
              <div className="text-sm font-semibold text-surface-900">{r.name}</div>
              <div className="text-brand-500 font-display font-bold mt-1">{r.cost} 🪙</div>
              <div className="text-xs text-surface-700/40 mt-1">{r.claimed}x resgatado</div>
            </div>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Regras de Coins</h3>
          <div className="space-y-3">
            {[
              { label: "Coins por check-in", value: gc.coinsPerCheckin },
              { label: "Bônus meta semanal", value: gc.bonusWeeklyGoal },
              { label: "Bônus 15 check-ins/mês", value: gc.bonusMonthly15 },
              { label: "Bônus 20 check-ins/mês", value: gc.bonusMonthly20 },
              { label: "Bônus por indicação", value: gc.referralBonus },
            ].map(rule => (
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
        <div className="space-y-2">
          {COIN_TRANSACTIONS.map(ct => (
            <div key={ct.id} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${ct.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                {ct.amount > 0 ? "+" + ct.amount : ct.amount}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-surface-900">{ct.studentName}</div>
                <div className="text-xs text-surface-700/40">{ct.description}</div>
              </div>
              <span className="text-xs text-surface-700/40">{ct.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FINANCIAL TAB
// ══════════════════════════════════════════════════════════════
function FinanceiroTab() {
  const fs = FINANCIAL_SUMMARY;
  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="MRR" value={`R$ ${(fs.mrr/1000).toFixed(1)}K`} trend={`+${fs.mrrGrowth}%`} />
        <KPI label="Churn Rate" value={`${fs.churnRate}%`} trend="-0.4%" />
        <KPI label="LTV" value={`R$ ${fs.ltv}`} trend="+R$ 120" />
        <KPI label="ARPU" value={`R$ ${fs.arpu}`} />
      </div>

      {/* Plans breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Planos Ativos</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {PLANS.map(p => {
            const pct = (p.students / FINANCIAL_SUMMARY.totalStudents * 100).toFixed(0);
            return (
              <div key={p.id} className="p-4 rounded-xl border border-surface-200/40 text-center">
                <div className="font-display font-bold text-lg text-surface-900">{p.name}</div>
                <div className="text-2xl font-display font-black text-brand-500">R$ {p.price}</div>
                <div className="text-xs text-surface-700/40 mt-1">{p.students} alunos ({pct}%)</div>
                <div className="w-full h-2 bg-surface-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-brand-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Receita Mensal</h3>
          <div className="h-48 flex items-end gap-3">
            {REVENUE_DATA.map((r, i) => {
              const max = Math.max(...REVENUE_DATA.map(d => d.value));
              const h = (r.value / max) * 100;
              return (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-surface-900">R$ {(r.value/1000).toFixed(1)}K</span>
                  <div className="w-full rounded-xl bg-gradient-to-t from-brand-600 to-brand-300 transition-all" style={{ height: `${h}%` }} />
                  <span className="text-[11px] text-surface-700/40">{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
          <h3 className="font-display font-bold text-surface-900 mb-4">Cobranças</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200/30">
              <div>
                <div className="text-sm font-semibold text-amber-700">Pagamentos Pendentes</div>
                <div className="text-xs text-amber-600/60">8 faturas aguardando</div>
              </div>
              <div className="font-display font-black text-xl text-amber-600">R$ {(fs.pendingPayments / 1000).toFixed(1)}K</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-200/30">
              <div>
                <div className="text-sm font-semibold text-red-600">Pagamentos Atrasados</div>
                <div className="text-xs text-red-500/60">3 faturas em atraso</div>
              </div>
              <div className="font-display font-black text-xl text-red-500">R$ {(fs.overduePayments / 1000).toFixed(1)}K</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50/50 border border-green-200/30">
              <div>
                <div className="text-sm font-semibold text-green-700">Projeção Março</div>
                <div className="text-xs text-green-600/60">Baseado na tendência atual</div>
              </div>
              <div className="font-display font-black text-xl text-green-600">R$ 52.3K</div>
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
  const ws = WHATSAPP_STATS;
  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Enviadas (Mês)" value={ws.sent.toString()} />
        <KPI label="Taxa de Entrega" value={`${ws.deliveryRate}%`} />
        <KPI label="Taxa de Leitura" value={`${ws.readRate}%`} />
        <KPI label="Taxa de Clique" value={`${ws.clickRate}%`} />
      </div>

      {/* Notification Templates */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Templates de Notificação</h3>
        <div className="space-y-3">
          {NOTIFICATION_TEMPLATES.map(n => (
            <div key={n.id} className="flex items-start gap-4 p-4 rounded-xl border border-surface-200/40 hover:border-brand-200/40 transition-all">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${n.active ? "bg-green-50" : "bg-surface-100"}`}>
                {n.active ? "✅" : "⏸️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-surface-900">{n.name}</span>
                  <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{n.channel}</span>
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

      {/* Funnel */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Funil de Engajamento</h3>
        <div className="space-y-3">
          {[
            { label: "Enviadas", value: ws.sent, pct: 100, color: "bg-surface-300" },
            { label: "Entregues", value: ws.delivered, pct: ws.deliveryRate, color: "bg-blue-400" },
            { label: "Lidas", value: ws.read, pct: ws.readRate, color: "bg-brand-400" },
            { label: "Clicadas", value: ws.clicked, pct: ws.clickRate, color: "bg-green-500" },
          ].map(step => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="text-sm text-surface-700/60 w-20">{step.label}</span>
              <div className="flex-1 h-8 bg-surface-50 rounded-full overflow-hidden">
                <div className={`h-full ${step.color} rounded-full transition-all flex items-center justify-end pr-3`} style={{ width: `${step.pct}%` }}>
                  <span className="text-xs font-bold text-white">{step.value}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-surface-700/60 w-16 text-right">{step.pct}%</span>
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
function ConfigTab() {
  const [estType, setEstType] = useState<string>("studio");
  return (
    <div className="space-y-6 stagger">
      {/* Profile */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Perfil do Estabelecimento</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Nome</label>
              <input defaultValue={PROVIDER_PROFILE.name} className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Responsável</label>
              <input defaultValue={PROVIDER_PROFILE.ownerName} className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Email</label>
              <input defaultValue={PROVIDER_PROFILE.email} className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-1">Endereço</label>
              <input defaultValue={PROVIDER_PROFILE.address} className="w-full bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-surface-700/50 uppercase tracking-wider font-medium block mb-2">Tipo de Estabelecimento</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ESTABLISHMENT_TYPES).map(([key, val]) => (
                  <button key={key} onClick={() => setEstType(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border ${estType === key ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-surface-50 border-surface-200/40 text-surface-700/60 hover:bg-surface-100"}`}>
                    <span className="text-lg">{val.icon}</span>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button className="mt-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20">
          Salvar Alterações
        </button>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200/60">
        <h3 className="font-display font-bold text-surface-900 mb-4">Integrações</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Wellhub (Gympass)", status: "Conectado", color: "green", icon: "🏋️" },
            { name: "TotalPass", status: "Disponível", color: "blue", icon: "🎫" },
            { name: "Catraca Eletrônica", status: "Configurar", color: "amber", icon: "🚪" },
            { name: "WhatsApp Business", status: "Conectado", color: "green", icon: "📱" },
            { name: "PIX Automático", status: "Disponível", color: "blue", icon: "💳" },
            { name: "Google Calendar", status: "Conectado", color: "green", icon: "📅" },
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

  const TabContent = useCallback(() => {
    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "agenda": return <AgendaTab />;
      case "alunos": return <AlunosTab />;
      case "coins": return <CoinsTab />;
      case "financeiro": return <FinanceiroTab />;
      case "whatsapp": return <WhatsAppTab />;
      case "config": return <ConfigTab />;
    }
  }, [activeTab]);

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

        {/* Provider info */}
        <div className="px-6 py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400">{PROVIDER_PROFILE.logo}</div>
            <div>
              <div className="text-sm font-semibold">{PROVIDER_PROFILE.name}</div>
              <div className="text-[10px] text-white/40">Plano {PROVIDER_PROFILE.plan} • {ESTABLISHMENT_TYPES.studio.label}</div>
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Link href="/tv" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white py-2 rounded-xl text-xs font-medium transition-all">
              {Icons.tv} TV Display
            </Link>
            <Link href="/app" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white py-2 rounded-xl text-xs font-medium transition-all">
              📱 App Aluno
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-700/60 hover:text-surface-900 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <h1 className="font-display font-bold text-xl text-surface-900">{TABS.find(t => t.id === activeTab)?.label}</h1>
                <p className="text-xs text-surface-700/40">Sexta, 13 de Março 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full">
                <span className="text-lg">🪙</span>
                <span className="font-display font-bold text-brand-600">{PROVIDER_PROFILE.totalCoinsDistributed.toLocaleString()}</span>
                <span className="text-xs text-brand-400">distribuídos</span>
              </div>
              <Avatar initials="MC" size="sm" />
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
