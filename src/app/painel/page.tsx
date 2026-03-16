"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  DEMO_STUDIO, DEMO_TRAINERS, DEMO_DASHBOARD, DEMO_STUDENTS,
  getDemoAppointments, DEMO_COIN_TXS, DEMO_REWARDS, DEMO_PAYMENT_STATS,
} from "@/lib/demo-data";
import {
  LayoutDashboard, CalendarDays, Users, BarChart2, MessageSquare,
  Settings, Monitor, LogOut, Sun, Moon, Plus, ChevronLeft, ChevronRight,
  X, Check, UserCheck, XCircle, Search, Coins, Trophy, TrendingUp,
  Clock, Dumbbell, Phone, Mail, MapPin, Zap, Bell, Shield, CreditCard,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Ban,
  FileText, UserPlus,
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── Types ────────────────────────────────────────────────────
interface StudioData {
  id: string; name: string; owner_name: string; email: string;
  address?: string; establishment_type: string; plan: string;
}

interface StudentData {
  id: string; name: string; email: string; phone?: string;
  status: string; level: string; coins: number;
  total_checkins: number; monthly_checkins: number;
  last_checkin?: string; joined_at: string; plan_name?: string;
}

interface WorkoutPrescriptionData {
  id: string; name: string; muscle_groups: string[];
  description?: string | null; student_id: string;
}

interface AppointmentData {
  id: string; date: string; time: string; duration: number;
  status: string; service_type: string; notes?: string;
  prescription_id?: string | null;
  students?: { id: string; name: string; phone?: string; level: string; coins: number };
  trainers?: { id: string; name: string; specialty?: string };
  workout_prescriptions?: { id: string; name: string; muscle_groups: string[] } | null;
}

interface TrainerData {
  id: string; name: string; specialty?: string;
  active_students: number; rating?: number;
}

interface DashboardData {
  totalStudents: number; activeStudents: number; newThisMonth: number;
  mrr: number; mrrGrowth: number; churnRate: number;
  todayCheckins: number; todayAppointments: number;
  recentCheckins: Array<{ student_name: string; time: string; coins_earned: number }>;
  rankingTop5: Array<{ rank: number; student_name: string; checkins: number; coins: number }>;
}

interface CoinTx {
  id: string; amount: number; description: string; created_at: string;
  profiles?: { full_name: string };
}

interface RewardData {
  id: string; name: string; description?: string | null;
  coins_cost: number; emoji?: string | null; is_active: boolean;
  stock_quantity?: number | null;
}

interface PaymentStats {
  total: number; paid: number; pending: number; overdue: number;
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

const SERVICE_TYPES = [
  "Personal Training", "Pilates", "Yoga", "CrossFit", "Funcional",
  "Avaliação Física", "Musculação", "Spinning",
];

const MUSCLE_GROUPS = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Abdômen / Core", "Pernas (Geral)", "Quadríceps",
  "Posterior de Coxa", "Glúteos", "Panturrilhas",
  "Trapézio", "Antebraço", "Cardio / Aeróbico",
];

const TIME_SLOTS = [
  "06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30","21:00",
];

type Tab = "overview" | "agenda" | "alunos" | "relatorios" | "coins" | "financeiro" | "whatsapp" | "config";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Visão Geral", icon: <LayoutDashboard size={18} /> },
  { id: "agenda", label: "Agenda", icon: <CalendarDays size={18} /> },
  { id: "alunos", label: "Alunos", icon: <Users size={18} /> },
  { id: "relatorios", label: "Relatórios", icon: <FileText size={18} /> },
  { id: "coins", label: "GymCoins", icon: <Coins size={18} /> },
  { id: "financeiro", label: "Financeiro", icon: <BarChart2 size={18} /> },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare size={18} /> },
  { id: "config", label: "Configurar", icon: <Settings size={18} /> },
];

// ── Dark Mode Hook ────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }, [dark]);
  return { dark, toggle };
}

// ── Helper Components ────────────────────────────────────────
function KPI({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: string }) {
  const isPositive = trend?.startsWith("+");
  return (
    <div className="card p-5 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200">
      <div className="text-[11px] text-surface-500 dark:text-surface-500 font-semibold uppercase tracking-widest mb-2">{label}</div>
      <div className="font-display font-black text-2xl text-surface-900 dark:text-white tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {sub && <span className="text-xs text-surface-500 dark:text-surface-500">{sub}</span>}
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{trend}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; icon?: React.ReactNode }> = {
    active:     { cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", label: "Ativo" },
    inactive:   { cls: "bg-surface-100 dark:bg-surface-800 text-surface-500 border-surface-200 dark:border-surface-700", label: "Inativo" },
    overdue:    { cls: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800", label: "Inadimplente" },
    booked:     { cls: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800", label: "Agendado" },
    confirmed:  { cls: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800", label: "Confirmado" },
    checked_in: { cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", label: "Check-in" },
    completed:  { cls: "bg-surface-100 dark:bg-surface-800 text-surface-500 border-surface-200 dark:border-surface-700", label: "Concluído" },
    cancelled:  { cls: "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800", label: "Cancelado" },
    no_show:    { cls: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800", label: "Faltou" },
  };
  const s = map[status] ?? map.active;
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-brand-500/20`}>
      {initials}
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-200 dark:bg-surface-800 rounded-xl ${className}`} />;
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
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" /><Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const d = dashboard;
  const recentCheckins = d?.recentCheckins ?? [];
  const rankingTop5 = d?.rankingTop5 ?? [];

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Alunos Ativos" value={(d?.activeStudents ?? 0).toString()} sub={`${d?.newThisMonth ?? 0} novos este mês`} trend={`+${d?.mrrGrowth?.toFixed(1) ?? 0}%`} />
        <KPI label="MRR" value={`R$ ${((d?.mrr ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} trend={`+${d?.mrrGrowth?.toFixed(1) ?? 0}%`} />
        <KPI label="Aulas Hoje" value={(d?.todayCheckins ?? 0).toString()} sub={`${d?.todayAppointments ?? 0} agendadas`} />
        <KPI label="Top do Mês" value={rankingTop5[0]?.student_name?.split(" ")[0] ?? "—"} sub={`${rankingTop5[0]?.checkins ?? 0} check-ins`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Check-ins Recentes</h3>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-semibold">
              ● Ao vivo
            </span>
          </div>
          {recentCheckins.length === 0 ? (
            <div className="text-center py-10 text-surface-400 dark:text-surface-600 text-sm">
              <Dumbbell className="mx-auto mb-2 opacity-30" size={32} />
              <p>Nenhum check-in hoje ainda</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentCheckins.slice(0, 7).map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                  <span className="text-xs font-mono text-surface-400 w-12">{c.time}</span>
                  <Avatar name={c.student_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-900 dark:text-white truncate">{c.student_name}</div>
                    <div className="text-xs text-surface-400 flex items-center gap-1">
                      <Coins size={10} /> +{c.coins_earned} GymCoins
                    </div>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Ranking do Mês</h3>
            <Trophy size={18} className="text-amber-500" />
          </div>
          {rankingTop5.length === 0 ? (
            <div className="text-center py-10 text-surface-400 dark:text-surface-600 text-sm">
              <Trophy className="mx-auto mb-2 opacity-30" size={32} />
              <p>Sem dados de ranking ainda</p>
            </div>
          ) : (
            <div className="space-y-1">
              {rankingTop5.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" : i === 1 ? "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400" : i === 2 ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400" : "bg-surface-50 dark:bg-surface-800 text-surface-500"}`}>
                    {i + 1}
                  </span>
                  <Avatar name={r.student_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-900 dark:text-white truncate">{r.student_name}</div>
                    <div className="text-xs text-surface-400">{r.checkins} check-ins</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-brand-500">
                    <Coins size={14} />{r.coins}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {trainers.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Equipe</h3>
            <span className="text-xs text-surface-400">{trainers.length} profissional{trainers.length > 1 ? "is" : ""}</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/40 dark:border-surface-700/40 hover:border-brand-300/40 transition-all">
                <Avatar name={t.name} size="lg" />
                <div>
                  <div className="font-semibold text-surface-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{t.specialty ?? "Trainer"}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><Users size={11} />{t.active_students} alunos</span>
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
// BOOKING MODAL
// ══════════════════════════════════════════════════════════════
interface BookingForm {
  studentId: string; studentName: string;
  trainerId: string; serviceType: string;
  date: string; time: string; duration: number; notes: string;
  prescriptionId: string;
}

function BookingModal({
  onClose, onCreated, trainers, initialDate, initialTime,
}: {
  onClose: () => void;
  onCreated: (appt: AppointmentData) => void;
  trainers: TrainerData[];
  initialDate: string;
  initialTime?: string;
}) {
  const [form, setForm] = useState<BookingForm>({
    studentId: "", studentName: "", trainerId: trainers[0]?.id ?? "",
    serviceType: SERVICE_TYPES[0], date: initialDate,
    time: initialTime ?? "08:00", duration: 60, notes: "", prescriptionId: "",
  });
  const [students, setStudents] = useState<StudentData[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentList, setShowStudentList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [prescriptions, setPrescriptions] = useState<WorkoutPrescriptionData[]>([]);

  useEffect(() => {
    if (!form.studentId) { setPrescriptions([]); setForm(f => ({ ...f, prescriptionId: "" })); return; }
    fetch(`/api/workout-prescriptions?studentId=${form.studentId}`)
      .then(r => r.json())
      .then(d => setPrescriptions(Array.isArray(d) ? d : []))
      .catch(() => setPrescriptions([]));
  }, [form.studentId]);

  useEffect(() => {
    const q = studentSearch.trim();
    if (q.length < 1) { setStudents([]); return; }
    const url = `/api/students?search=${encodeURIComponent(q)}&status=active`;
    fetch(url).then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d.slice(0, 8) : []));
  }, [studentSearch]);

  async function handleSubmit() {
    if (!form.studentId) { setError("Selecione um aluno"); return; }
    if (!form.trainerId) { setError("Selecione um professor"); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          trainerId: form.trainerId,
          serviceType: form.serviceType,
          date: form.date,
          time: form.time,
          duration: form.duration,
          notes: form.notes || undefined,
          prescriptionId: form.prescriptionId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar agendamento");
      onCreated(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg shadow-2xl dark:shadow-black/50" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Novo Agendamento</h2>
              <p className="text-xs text-surface-400 mt-0.5">Preencha os dados para criar uma aula</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Student picker */}
            <div className="relative">
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Aluno *</label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  ref={searchRef}
                  value={form.studentId ? form.studentName : studentSearch}
                  onChange={e => {
                    if (form.studentId) { setForm(f => ({ ...f, studentId: "", studentName: "" })); }
                    setStudentSearch(e.target.value);
                    setShowStudentList(true);
                  }}
                  onFocus={() => setShowStudentList(true)}
                  placeholder="Buscar aluno..."
                  className="input-base w-full pl-9"
                />
                {form.studentId && (
                  <button onClick={() => { setForm(f => ({ ...f, studentId: "", studentName: "" })); setStudentSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {showStudentList && students.length > 0 && !form.studentId && (
                <div className="absolute top-full left-0 right-0 mt-1 card shadow-xl z-10 py-1 max-h-48 overflow-y-auto">
                  {students.map(s => (
                    <button key={s.id} onMouseDown={() => {
                      setForm(f => ({ ...f, studentId: s.id, studentName: s.name }));
                      setStudentSearch("");
                      setShowStudentList(false);
                    }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 text-left transition-colors">
                      <Avatar name={s.name} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-surface-900 dark:text-white">{s.name}</div>
                        <div className="text-xs text-surface-400">{s.plan_name ?? "Sem plano"} • {s.level}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Row: Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Data *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-base w-full" />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Horário *</label>
                <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input-base w-full">
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Row: Trainer + Service */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Professor *</label>
                <select value={form.trainerId} onChange={e => setForm(f => ({ ...f, trainerId: e.target.value }))} className="input-base w-full">
                  {trainers.length === 0
                    ? <option value="">Nenhum professor</option>
                    : trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                  }
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Modalidade *</label>
                <select value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} className="input-base w-full">
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Duração</label>
              <div className="flex gap-2">
                {[30, 45, 60, 90].map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${form.duration === d ? "bg-brand-500 border-brand-500 text-white" : "bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-300"}`}>
                    {d}min
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription */}
            {prescriptions.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Prescrição de Treino</label>
                <select value={form.prescriptionId} onChange={e => setForm(f => ({ ...f, prescriptionId: e.target.value }))} className="input-base w-full">
                  <option value="">Sem prescrição específica</option>
                  {prescriptions.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.muscle_groups.join(", ")}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Observações</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Informações adicionais (opcional)..."
                className="input-base w-full resize-none h-16" />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={15} />{error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-ghost flex-1 py-3 text-sm">Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting || !form.studentId}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Plus size={16} />}
              {submitting ? "Criando..." : "Criar Agendamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AGENDA TAB
// ══════════════════════════════════════════════════════════════
function AgendaTab({ trainers }: { trainers: TrainerData[] }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [modalTime, setModalTime] = useState<string | undefined>(undefined);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const dateStr = currentDate.toISOString().split("T")[0];
  const isToday = dateStr === todayStr;

  const displayDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  function prevDay() { setCurrentDate(d => new Date(d.getTime() - 86400000)); }
  function nextDay() { setCurrentDate(d => new Date(d.getTime() + 86400000)); }
  function goToday() { setCurrentDate(new Date()); }

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    fetch(`/api/appointments?date=${dateStr}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAppointments(data);
        } else {
          // Demo fallback: use realistic demo appointments
          setAppointments(getDemoAppointments(dateStr) as any);
        }
      })
      .catch(() => setAppointments(getDemoAppointments(dateStr) as any))
      .finally(() => setLoading(false));
  }, [dateStr]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = selectedTrainer === "all"
    ? appointments
    : appointments.filter(a => a.trainers?.id === selectedTrainer);

  // Group by trainer for column view
  const trainerColumns = selectedTrainer === "all" && trainers.length > 1
    ? trainers
    : (selectedTrainer !== "all" ? trainers.filter(t => t.id === selectedTrainer) : null);

  function getApptForSlot(time: string, trainerId?: string) {
    return filtered.find(a => {
      const match = a.time?.startsWith(time);
      if (trainerId) return match && a.trainers?.id === trainerId;
      return match;
    });
  }

  const VIEW_SLOTS = TIME_SLOTS.filter((_, i) => i % 2 === 0); // hourly view

  return (
    <div className="space-y-5 stagger">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <button onClick={prevDay} className="w-9 h-9 rounded-xl btn-ghost flex items-center justify-center">
              <ChevronLeft size={16} />
            </button>
            <div className="text-center min-w-[180px]">
              <div className="font-display font-bold text-surface-900 dark:text-white capitalize text-sm">{displayDate}</div>
              {!isToday && (
                <button onClick={goToday} className="text-[11px] text-brand-500 hover:text-brand-600 font-medium transition-colors">
                  Voltar para hoje
                </button>
              )}
            </div>
            <button onClick={nextDay} className="w-9 h-9 rounded-xl btn-ghost flex items-center justify-center">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Trainer filter */}
          {trainers.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setSelectedTrainer("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedTrainer === "all" ? "bg-brand-500 text-white" : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"}`}>
                Todos
              </button>
              {trainers.map(t => (
                <button key={t.id} onClick={() => setSelectedTrainer(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedTrainer === t.id ? "bg-brand-500 text-white" : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"}`}>
                  {t.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => { setModalTime(undefined); setShowModal(true); }}
            className="btn-primary ml-auto px-4 py-2 text-sm flex items-center gap-2">
            <Plus size={16} /> Agendar
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day stats */}
        <div className="grid grid-cols-3 border-b border-surface-200/60 dark:border-surface-800/60">
          {[
            { label: "Total", value: filtered.length, icon: <CalendarDays size={14} className="text-brand-500" /> },
            { label: "Confirmados", value: filtered.filter(a => ["confirmed","checked_in"].includes(a.status)).length, icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
            { label: "Pendentes", value: filtered.filter(a => a.status === "booked").length, icon: <Clock size={14} className="text-amber-500" /> },
          ].map(stat => (
            <div key={stat.label} className="flex items-center justify-center gap-2 py-3 border-r border-surface-200/60 dark:border-surface-800/60 last:border-0">
              {stat.icon}
              <span className="font-display font-bold text-surface-900 dark:text-white text-sm">{stat.value}</span>
              <span className="text-xs text-surface-400">{stat.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* If multi-trainer: column layout */}
            {trainerColumns && trainerColumns.length > 1 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200/60 dark:border-surface-800/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 w-16">Hora</th>
                    {trainerColumns.map(t => (
                      <th key={t.id} className="text-left px-4 py-3 text-xs font-semibold text-surface-700 dark:text-surface-300">
                        <div className="flex items-center gap-2">
                          <Avatar name={t.name} size="sm" />
                          {t.name.split(" ")[0]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VIEW_SLOTS.map(time => (
                    <tr key={time} className="border-b border-surface-100/60 dark:border-surface-800/40 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs text-surface-400 align-top pt-3">{time}</td>
                      {trainerColumns.map(trainer => {
                        const appt = getApptForSlot(time, trainer.id);
                        return (
                          <td key={trainer.id} className="px-2 py-1.5 align-top">
                            {appt ? (
                              <AppointmentCard appt={appt} onUpdateStatus={updateStatus} updatingId={updatingId} compact />
                            ) : (
                              <button onClick={() => { setModalTime(time); setShowModal(true); }}
                                className="w-full h-10 rounded-lg border-2 border-dashed border-surface-200/60 dark:border-surface-700/60 text-surface-300 dark:text-surface-600 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-400 transition-all text-xs flex items-center justify-center gap-1">
                                <Plus size={12} />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Single trainer or "all" as list */
              <div>
                {VIEW_SLOTS.map(time => {
                  const appt = getApptForSlot(time);
                  return (
                    <div key={time} className="flex items-center gap-4 px-5 py-2.5 border-b border-surface-100/60 dark:border-surface-800/40 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <span className="text-xs font-mono text-surface-400 w-12 shrink-0">{time}</span>
                      {appt ? (
                        <AppointmentCard appt={appt} onUpdateStatus={updateStatus} updatingId={updatingId} />
                      ) : (
                        <button onClick={() => { setModalTime(time); setShowModal(true); }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-surface-200/50 dark:border-surface-700/50 text-surface-300 dark:text-surface-600 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-400 transition-all text-xs">
                          <Plus size={13} /> Disponível — clique para agendar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onCreated={appt => { setAppointments(prev => [...prev, appt]); setShowModal(false); }}
          trainers={trainers}
          initialDate={dateStr}
          initialTime={modalTime}
        />
      )}
    </div>
  );
}

// ── Appointment Card ──────────────────────────────────────────
function AppointmentCard({ appt, onUpdateStatus, updatingId, compact = false }: {
  appt: AppointmentData;
  onUpdateStatus: (id: string, status: string) => void;
  updatingId: string | null;
  compact?: boolean;
}) {
  const isUpdating = updatingId === appt.id;
  const studentName = appt.students?.name ?? "—";
  const trainerName = appt.trainers?.name ?? "—";
  const canConfirm = appt.status === "booked";
  const canCheckin = appt.status === "confirmed" || appt.status === "booked";
  const canCancel = !["cancelled", "completed", "no_show"].includes(appt.status);

  if (compact) {
    return (
      <div className={`rounded-lg px-2.5 py-2 border ${appt.status === "cancelled" ? "opacity-50 border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800" : "border-brand-200/50 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-950/20"}`}>
        <div className="text-[11px] font-semibold text-surface-900 dark:text-white truncate">{studentName}</div>
        <div className="flex items-center justify-between mt-1 gap-1">
          <StatusBadge status={appt.status} />
          {canCheckin && !isUpdating && (
            <button onClick={() => onUpdateStatus(appt.id, "checked_in")} className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-all">
              <Check size={10} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${appt.status === "cancelled" ? "opacity-50 border-surface-200/60 dark:border-surface-700/60 bg-surface-50 dark:bg-surface-800/30" : "border-brand-200/40 dark:border-brand-800/40 bg-brand-50/30 dark:bg-brand-950/10"}`}>
      <Avatar name={studentName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-surface-900 dark:text-white">{studentName}</span>
          <StatusBadge status={appt.status} />
        </div>
        <div className="text-xs text-surface-400 mt-0.5">
          {appt.service_type} • {appt.duration}min • {trainerName}
        </div>
      </div>

      {/* Action buttons */}
      {!isUpdating && canCancel && (
        <div className="flex items-center gap-1.5 shrink-0">
          {canConfirm && (
            <button onClick={() => onUpdateStatus(appt.id, "confirmed")}
              title="Confirmar"
              className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-200/50 dark:border-indigo-800/50">
              <Check size={14} />
            </button>
          )}
          {canCheckin && (
            <button onClick={() => onUpdateStatus(appt.id, "checked_in")}
              title="Check-in"
              className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-200/50 dark:border-emerald-800/50">
              <UserCheck size={14} />
            </button>
          )}
          <button onClick={() => onUpdateStatus(appt.id, "cancelled")}
            title="Cancelar"
            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-200/50 dark:border-red-800/50">
            <XCircle size={14} />
          </button>
        </div>
      )}
      {isUpdating && (
        <div className="w-6 h-6 border-2 border-brand-400/30 border-t-brand-500 rounded-full animate-spin shrink-0" />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STUDENT REGISTRATION MODAL
// ══════════════════════════════════════════════════════════════
interface StudentRegForm {
  name: string; phone: string; email: string;
  gender: "M" | "F" | "";
  planName: string; planPrice: string; paymentDay: string;
}

function StudentRegModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (student: StudentData) => void;
}) {
  const [form, setForm] = useState<StudentRegForm>({
    name: "", phone: "", email: "", gender: "",
    planName: "", planPrice: "", paymentDay: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!form.name.trim() || form.name.trim().length < 2) { setError("Nome deve ter ao menos 2 caracteres"); return; }
    if (!form.phone.replace(/\D/g, "") || form.phone.replace(/\D/g, "").length < 10) { setError("Telefone deve ter ao menos 10 dígitos"); return; }
    setSubmitting(true); setError(null);
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ""),
      };
      if (form.email.trim()) body.email = form.email.trim();
      if (form.gender) body.gender = form.gender;
      if (form.planName.trim()) body.planName = form.planName.trim();
      if (form.planPrice) body.planPrice = Number(form.planPrice);
      if (form.paymentDay) body.paymentDay = Number(form.paymentDay);

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar aluno");
      onCreated(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg shadow-2xl dark:shadow-black/50 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Novo Aluno</h2>
              <p className="text-xs text-surface-400 mt-0.5">Preencha os dados para cadastrar</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Nome Completo *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome do aluno" className="input-base w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Telefone *</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999" className="input-base w-full" />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Gênero</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as "M" | "F" | "" }))} className="input-base w-full">
                  <option value="">Não informado</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@exemplo.com (opcional)" className="input-base w-full" />
            </div>

            <div className="border-t border-surface-100 dark:border-surface-800 pt-4">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">Plano (opcional)</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-surface-500 dark:text-surface-400 block mb-1.5">Nome do Plano</label>
                  <input value={form.planName} onChange={e => setForm(f => ({ ...f, planName: e.target.value }))}
                    placeholder="Ex: Mensal, Trimestral..." className="input-base w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-500 dark:text-surface-400 block mb-1.5">Valor Mensal (R$)</label>
                    <input type="number" value={form.planPrice} onChange={e => setForm(f => ({ ...f, planPrice: e.target.value }))}
                      placeholder="0" min="0" className="input-base w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 dark:text-surface-400 block mb-1.5">Dia de Vencimento</label>
                    <input type="number" value={form.paymentDay} onChange={e => setForm(f => ({ ...f, paymentDay: e.target.value }))}
                      placeholder="1–28" min="1" max="28" className="input-base w-full" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={15} />{error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-ghost flex-1 py-3 text-sm">Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting || !form.name || !form.phone}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <UserPlus size={16} />}
              {submitting ? "Cadastrando..." : "Cadastrar Aluno"}
            </button>
          </div>
        </div>
      </div>
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
  const [showNewModal, setShowNewModal] = useState(false);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modalTab, setModalTab] = useState<"info" | "historico" | "prescricoes">("info");
  const [prescriptions, setPrescriptions] = useState<WorkoutPrescriptionData[]>([]);
  const [prescLoading, setPrescLoading] = useState(false);
  const [newPresc, setNewPresc] = useState({ name: "", muscle_groups: [] as string[], description: "" });
  const [savingPresc, setSavingPresc] = useState(false);

  useEffect(() => {
    fetch("/api/students")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setStudents(data);
        else setStudents(DEMO_STUDENTS as any);
      })
      .catch(() => setStudents(DEMO_STUDENTS as any))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) {
      setStudentHistory([]); setPrescriptions([]);
      setModalTab("info"); setNewPresc({ name: "", muscle_groups: [], description: "" });
      return;
    }
    setHistoryLoading(true);
    setPrescLoading(true);
    fetch(`/api/appointments?studentId=${selected.id}`)
      .then(r => r.json())
      .then(data => {
        const done = (Array.isArray(data) ? data : [])
          .filter((a: any) => ["completed", "checked_in"].includes(a.status))
          .sort((a: any, b: any) => (b.date + b.time).localeCompare(a.date + a.time));
        setStudentHistory(done);
      })
      .catch(() => setStudentHistory([]))
      .finally(() => setHistoryLoading(false));
    fetch(`/api/workout-prescriptions?studentId=${selected.id}`)
      .then(r => r.json())
      .then(d => setPrescriptions(Array.isArray(d) ? d : []))
      .catch(() => setPrescriptions([]))
      .finally(() => setPrescLoading(false));
  }, [selected]);

  async function handleSavePresc() {
    if (!selected || !newPresc.name.trim() || newPresc.muscle_groups.length === 0) return;
    setSavingPresc(true);
    try {
      const res = await fetch("/api/workout-prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selected.id, name: newPresc.name.trim(), muscleGroups: newPresc.muscle_groups, description: newPresc.description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrescriptions(prev => [...prev, data]);
      setNewPresc({ name: "", muscle_groups: [], description: "" });
    } catch {}
    finally { setSavingPresc(false); }
  }

  async function handleDeletePresc(id: string) {
    await fetch(`/api/workout-prescriptions/${id}`, { method: "DELETE" });
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  }

  function handleStudentCreated(student: StudentData) {
    setStudents(prev => [student, ...prev]);
    setShowNewModal(false);
  }

  const filtered = students.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    const nm = s.name ?? "";
    if (search && !nm.toLowerCase().includes(search.toLowerCase())) return false;
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

      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-5">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar aluno..." className="input-base w-full pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all","active","overdue","inactive"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${f === filter ? "bg-brand-500 text-white" : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"}`}>
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "overdue" ? "Inadimpl." : "Inativos"}
              </button>
            ))}
            <button onClick={() => setShowNewModal(true)}
              className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 ml-auto md:ml-0">
              <UserPlus size={14} /> Novo Aluno
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-surface-400 dark:text-surface-600 text-sm">
            <Users className="mx-auto mb-2 opacity-30" size={36} />
            <p>{search ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado ainda"}</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map(s => (
              <div key={s.id} onClick={() => setSelected(s)}
                className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-all border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                <Avatar name={s.name ?? "?"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-surface-900 dark:text-white">{s.name}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="text-xs text-surface-400 mt-0.5">{s.plan_name ?? "—"} • {s.total_checkins} check-ins • {s.level}</div>
                </div>
                <div className="text-right hidden md:block shrink-0">
                  <div className="text-sm font-bold text-brand-500 flex items-center gap-1 justify-end"><Coins size={13} />{s.coins}</div>
                  <div className="text-xs text-surface-400">{s.monthly_checkins} este mês</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card w-full max-w-lg shadow-2xl dark:shadow-black/50 max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header fixo */}
            <div className="p-5 pb-0 shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name ?? "?"} size="lg" />
                  <div>
                    <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{selected.name}</h3>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-1 border-b border-surface-200/60 dark:border-surface-700/60">
                {([
                  { id: "info" as const, label: "Info" },
                  { id: "historico" as const, label: `Histórico (${studentHistory.length})` },
                  { id: "prescricoes" as const, label: `Prescrições (${prescriptions.length})` },
                ]).map(t => (
                  <button key={t.id} onClick={() => setModalTab(t.id)}
                    className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 -mb-px ${modalTab === t.id ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-surface-400 hover:text-surface-700 dark:hover:text-surface-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo com scroll */}
            <div className="overflow-y-auto flex-1 p-5">

              {/* ── INFO ── */}
              {modalTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "GymCoins", value: selected.coins, icon: <Coins size={16} className="text-brand-500" /> },
                      { label: "Check-ins", value: selected.total_checkins, icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
                      { label: "Este Mês", value: selected.monthly_checkins, icon: <TrendingUp size={16} className="text-indigo-500" /> },
                    ].map(stat => (
                      <div key={stat.label} className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 text-center">
                        <div className="flex justify-center mb-1">{stat.icon}</div>
                        <div className="text-xl font-display font-black text-surface-900 dark:text-white">{stat.value}</div>
                        <div className="text-[10px] text-surface-400 uppercase font-semibold tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { icon: <Mail size={14} />, label: selected.email },
                      ...(selected.phone ? [{ icon: <Phone size={14} />, label: selected.phone }] : []),
                      { icon: <Dumbbell size={14} />, label: selected.plan_name ?? "Sem plano" },
                      { icon: <Zap size={14} />, label: `Nível: ${selected.level}` },
                      ...(selected.last_checkin ? [{ icon: <Clock size={14} />, label: `Último check-in: ${new Date(selected.last_checkin).toLocaleDateString("pt-BR")}` }] : []),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                        <span className="text-surface-400 dark:text-surface-500">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── HISTÓRICO ── */}
              {modalTab === "historico" && (
                historyLoading ? (
                  <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
                ) : studentHistory.length === 0 ? (
                  <div className="text-center py-10 text-surface-400 dark:text-surface-600 text-sm">
                    <Dumbbell className="mx-auto mb-2 opacity-30" size={28} />
                    Nenhum treino registrado
                  </div>
                ) : (
                  <div className="space-y-1">
                    {studentHistory.map((a: any) => (
                      <div key={a.id} className="flex items-start gap-3 py-2.5 px-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] text-brand-500 font-medium leading-tight">
                            {new Date(a.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          </span>
                          <span className="text-[9px] text-brand-400 font-mono leading-tight">{a.time?.slice(0, 5)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-surface-900 dark:text-white">{a.service_type}</div>
                          <div className="text-[10px] text-surface-400">{a.trainers?.name ?? "—"}{a.duration ? ` • ${a.duration}min` : ""}</div>
                          {a.workout_prescriptions && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded-full">
                                {a.workout_prescriptions.name}
                              </span>
                              {(a.workout_prescriptions.muscle_groups as string[]).map((mg: string) => (
                                <span key={mg} className="text-[10px] text-surface-500 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded-full">{mg}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 mt-0.5 ${a.status === "completed" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"}`}>
                          {a.status === "completed" ? "Concluído" : "Check-in"}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── PRESCRIÇÕES ── */}
              {modalTab === "prescricoes" && (
                <div className="space-y-4">
                  {prescLoading ? (
                    <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                  ) : prescriptions.length === 0 ? (
                    <div className="text-center py-6 text-surface-400 dark:text-surface-600 text-sm">
                      <Dumbbell className="mx-auto mb-2 opacity-30" size={28} />
                      Nenhuma prescrição cadastrada
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prescriptions.map(p => (
                        <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-surface-200/40 dark:border-surface-700/40 bg-surface-50/50 dark:bg-surface-800/30">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-surface-900 dark:text-white">{p.name}</div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {p.muscle_groups.map(mg => (
                                <span key={mg} className="text-[10px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 px-2 py-0.5 rounded-full">{mg}</span>
                              ))}
                            </div>
                            {p.description && <p className="text-xs text-surface-400 mt-1.5">{p.description}</p>}
                          </div>
                          <button onClick={() => handleDeletePresc(p.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-all shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-surface-100 dark:border-surface-800 pt-4 space-y-3">
                    <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Nova Prescrição</p>
                    <input value={newPresc.name} onChange={e => setNewPresc(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nome: Treino A, Treino B, Full Body..." className="input-base w-full" />
                    <div>
                      <p className="text-xs text-surface-400 mb-2">Grupos musculares *</p>
                      <div className="flex flex-wrap gap-1.5">
                        {MUSCLE_GROUPS.map(mg => {
                          const active = newPresc.muscle_groups.includes(mg);
                          return (
                            <button key={mg} type="button"
                              onClick={() => setNewPresc(p => ({
                                ...p,
                                muscle_groups: active ? p.muscle_groups.filter(x => x !== mg) : [...p.muscle_groups, mg],
                              }))}
                              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${active ? "bg-brand-500 border-brand-500 text-white" : "bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-300"}`}>
                              {mg}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <textarea value={newPresc.description} onChange={e => setNewPresc(p => ({ ...p, description: e.target.value }))}
                      placeholder="Observações (opcional)..." className="input-base w-full resize-none h-14" />
                    <button onClick={handleSavePresc}
                      disabled={savingPresc || !newPresc.name.trim() || newPresc.muscle_groups.length === 0}
                      className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                      {savingPresc ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                      {savingPresc ? "Salvando..." : "Adicionar Prescrição"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-100 dark:border-surface-800 flex gap-2 shrink-0">
              <button className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                <MessageSquare size={15} /> Mensagem
              </button>
              <button onClick={() => setSelected(null)} className="btn-ghost flex-1 py-2.5 text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <StudentRegModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleStudentCreated}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// REPORTS TAB
// ══════════════════════════════════════════════════════════════
function RelatoriosTab() {
  const [loading, setLoading] = useState(true);
  const [checkinData, setCheckinData] = useState<{ month: string; total: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; total: number }[]>([]);
  const [topStudents, setTopStudents] = useState<StudentData[]>([]);
  const [retention, setRetention] = useState({ active: 0, overdue: 0, inactive: 0, total: 0 });

  useEffect(() => {
    const supabase = createClient();

    // Last 6 months labels
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") + "/" + d.getFullYear().toString().slice(2),
      });
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    Promise.all([
      supabase.from("checkins").select("checked_in_at").gte("checked_in_at", sixMonthsAgo.toISOString()),
      supabase.from("student_payments").select("amount, paid_at").eq("status", "paid").gte("paid_at", sixMonthsAgo.toISOString().slice(0, 10)),
      supabase.from("students").select("id,name,level,coins,total_checkins,monthly_checkins,status,email,phone,plan_name,last_checkin,joined_at").order("total_checkins", { ascending: false }).limit(10),
      supabase.from("students").select("status"),
    ]).then(([ci, py, top, st]) => {
      const ciMap: Record<string, number> = {};
      (ci.data ?? []).forEach(c => {
        const k = (c.checked_in_at as string).slice(0, 7);
        ciMap[k] = (ciMap[k] ?? 0) + 1;
      });
      setCheckinData(months.map(m => ({ month: m.label, total: ciMap[m.key] ?? 0 })));

      const revMap: Record<string, number> = {};
      (py.data ?? []).forEach(p => {
        if (p.paid_at) {
          const k = (p.paid_at as string).slice(0, 7);
          revMap[k] = (revMap[k] ?? 0) + Number(p.amount);
        }
      });
      setRevenueData(months.map(m => ({ month: m.label, total: revMap[m.key] ?? 0 })));

      setTopStudents((top.data ?? []) as unknown as StudentData[]);

      const statusData = st.data ?? [];
      setRetention({
        active: statusData.filter(s => s.status === "active").length,
        overdue: statusData.filter(s => s.status === "overdue").length,
        inactive: statusData.filter(s => ["inactive", "suspended"].includes(s.status)).length,
        total: statusData.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const totalCheckins = checkinData.reduce((s, m) => s + m.total, 0);
  const totalRevenue = revenueData.reduce((s, m) => s + m.total, 0);

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Check-ins (6 meses)" value={totalCheckins.toLocaleString("pt-BR")} />
        <KPI label="Receita (6 meses)" value={`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} />
        <KPI label="Taxa de Retenção" value={`${retention.total > 0 ? Math.round(retention.active / retention.total * 100) : 0}%`} />
        <KPI label="Inadimplência" value={`${retention.total > 0 ? Math.round(retention.overdue / retention.total * 100) : 0}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-5">Check-ins por Mês</h3>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={checkinData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}
                  formatter={(v: number) => [v, "Check-ins"]}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-5">Receita por Mês (R$)</h3>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                  tickFormatter={v => `R$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}
                  formatter={(v: number) => [`R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"]}
                />
                <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-5">Distribuição de Alunos</h3>
          {loading ? <Skeleton className="h-32" /> : (
            <div className="space-y-4">
              {[
                { label: "Ativos", value: retention.active, color: "bg-emerald-500", pct: retention.total > 0 ? retention.active / retention.total : 0 },
                { label: "Inadimplentes", value: retention.overdue, color: "bg-red-500", pct: retention.total > 0 ? retention.overdue / retention.total : 0 },
                { label: "Inativos", value: retention.inactive, color: "bg-surface-400", pct: retention.total > 0 ? retention.inactive / retention.total : 0 },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-surface-600 dark:text-surface-400">{row.label}</span>
                    <span className="font-semibold text-surface-900 dark:text-white">{row.value} <span className="text-surface-400 font-normal">({(row.pct * 100).toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${row.pct * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-400 text-center">
                {retention.total} alunos no total
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Top 10 Alunos por Check-ins</h3>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : topStudents.length === 0 ? (
            <div className="text-center py-8 text-surface-400 dark:text-surface-600 text-sm">
              <Users className="mx-auto mb-2 opacity-30" size={32} />
              <p>Nenhum aluno ainda</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${i === 0 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" : i === 1 ? "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400" : i === 2 ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400" : "bg-surface-50 dark:bg-surface-800 text-surface-400"}`}>
                    {i + 1}
                  </span>
                  <Avatar name={s.name ?? "?"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-900 dark:text-white truncate">{s.name}</div>
                    <div className="text-xs text-surface-400">{s.level} • {s.plan_name ?? "—"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-surface-900 dark:text-white">{s.total_checkins} <span className="text-xs font-normal text-surface-400">check-ins</span></div>
                    <div className="flex items-center gap-0.5 text-brand-500 text-xs font-semibold justify-end"><Coins size={10} />{s.coins}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
      supabase.from("coin_transactions").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(20),
      supabase.from("rewards").select("*").eq("is_active", true).order("coins_cost", { ascending: true }),
    ]).then(([txRes, rewardsRes]) => {
      const txData = (txRes.data ?? []) as unknown as CoinTx[];
      const rwData = rewardsRes.data ?? [];
      setTransactions(txData.length > 0 ? txData : DEMO_COIN_TXS as any);
      setRewards(rwData.length > 0 ? rwData : DEMO_REWARDS as any);
    }).catch(() => {
      setTransactions(DEMO_COIN_TXS as any);
      setRewards(DEMO_REWARDS as any);
    }).finally(() => setLoading(false));
  }, []);

  const totalDistributed = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalRedeemed = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Coins Distribuídos" value={totalDistributed.toLocaleString()} trend="+12%" />
        <KPI label="Coins Resgatados" value={totalRedeemed.toLocaleString()} />
        <KPI label="Transações" value={transactions.length.toString()} />
        <KPI label="Recompensas Ativas" value={rewards.length.toString()} />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-surface-900 dark:text-white">Catálogo de Recompensas</h3>
          <button className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"><Plus size={13} /> Nova Recompensa</button>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-10 text-surface-400 dark:text-surface-600 text-sm">
            <Coins className="mx-auto mb-2 opacity-30" size={32} />
            <p>Nenhuma recompensa cadastrada</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {rewards.map(r => (
              <div key={r.id} className="text-center p-4 rounded-xl border border-surface-200/40 dark:border-surface-700/40 hover:border-brand-300/40 dark:hover:border-brand-700/40 hover:shadow-sm transition-all bg-surface-50/50 dark:bg-surface-800/30">
                <div className="text-4xl mb-2">{r.emoji ?? "🎁"}</div>
                <div className="text-sm font-semibold text-surface-900 dark:text-white">{r.name}</div>
                <div className="flex items-center justify-center gap-1 text-brand-500 font-display font-bold mt-1">
                  <Coins size={13} />{r.coins_cost}
                </div>
                {r.stock_quantity != null && (
                  <div className="text-xs text-surface-400 mt-1">{r.stock_quantity} disponíveis</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Regras de Coins</h3>
          <div className="space-y-1">
            {COIN_RULES.map(rule => (
              <div key={rule.label} className="flex items-center justify-between py-3 border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                <span className="text-sm text-surface-600 dark:text-surface-400">{rule.label}</span>
                <div className="flex items-center gap-1 font-display font-bold text-brand-500">
                  <Coins size={14} />{rule.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Níveis de Progressão</h3>
          <div className="space-y-1">
            {LEVELS.map(l => (
              <div key={l.name} className="flex items-center gap-3 py-2.5 border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                <span className="text-xl w-7 text-center">{l.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: l.color }}>{l.name}</div>
                  <div className="text-xs text-surface-400">{l.minCheckins}+ check-ins</div>
                </div>
                <div className="w-16 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: l.color, width: `${Math.min(100, l.minCheckins / 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Transações Recentes</h3>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-surface-400 dark:text-surface-600 text-sm">Nenhuma transação ainda</div>
        ) : (
          <div className="space-y-0.5">
            {transactions.map(ct => (
              <div key={ct.id} className="flex items-center gap-3 py-2.5 border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${ct.amount > 0 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400"}`}>
                  {ct.amount > 0 ? "+" + ct.amount : ct.amount}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-surface-900 dark:text-white">{ct.profiles?.full_name ?? "—"}</div>
                  <div className="text-xs text-surface-400 truncate">{ct.description}</div>
                </div>
                <span className="text-xs text-surface-400 shrink-0">{new Date(ct.created_at).toLocaleDateString("pt-BR")}</span>
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
      .then(r => r.ok ? r.json() : null)
      .then(data => setPaymentStats(data?.stats ?? DEMO_PAYMENT_STATS))
      .catch(() => setPaymentStats(DEMO_PAYMENT_STATS))
      .finally(() => setLoading(false));
  }, []);

  const mrr = (dashboard?.mrr ?? 0) / 100;
  const mrrGrowth = dashboard?.mrrGrowth ?? 0;
  const paid = (paymentStats?.paid ?? 0);
  const pending = (paymentStats?.pending ?? 0);
  const overdue = (paymentStats?.overdue ?? 0);

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="MRR" value={`R$ ${(mrr / 1000).toFixed(1)}K`} trend={`${mrrGrowth >= 0 ? "+" : ""}${mrrGrowth.toFixed(1)}%`} />
        <KPI label="Arrecadado" value={`R$ ${(paid / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} />
        <KPI label="Pendente" value={`R$ ${(pending / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} />
        <KPI label="Inadimplência" value={`R$ ${(overdue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Resumo do Mês</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/40">
                <div>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Pagamentos Recebidos</div>
                  <div className="text-xs text-emerald-600/60 dark:text-emerald-500/60">Este mês</div>
                </div>
                <div className="font-display font-black text-xl text-emerald-600 dark:text-emerald-400">
                  R$ {(paid / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/40 dark:border-amber-800/40">
                <div>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-400">Aguardando Pagamento</div>
                  <div className="text-xs text-amber-600/60 dark:text-amber-500/60">Em aberto</div>
                </div>
                <div className="font-display font-black text-xl text-amber-600 dark:text-amber-400">
                  R$ {(pending / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/40 dark:border-red-800/40">
                <div>
                  <div className="text-sm font-semibold text-red-600 dark:text-red-400">Inadimplência</div>
                  <div className="text-xs text-red-500/60 dark:text-red-500/60">Faturas em atraso</div>
                </div>
                <div className="font-display font-black text-xl text-red-500 dark:text-red-400">
                  R$ {(overdue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Métricas SaaS</h3>
          <div className="space-y-1">
            {[
              { label: "MRR Atual", value: `R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
              { label: "Crescimento MoM", value: `${mrrGrowth >= 0 ? "+" : ""}${mrrGrowth.toFixed(1)}%`, cls: mrrGrowth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500" },
              { label: "Alunos Ativos", value: (dashboard?.activeStudents ?? 0).toString() },
              { label: "Ticket Médio", value: dashboard?.activeStudents ? `R$ ${(mrr / dashboard.activeStudents).toFixed(2)}` : "—" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-surface-100/60 dark:border-surface-800/60 last:border-0">
                <span className="text-sm text-surface-500 dark:text-surface-400">{row.label}</span>
                <span className={`font-display font-bold text-surface-900 dark:text-white ${row.cls ?? ""}`}>{row.value}</span>
              </div>
            ))}
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
    { id: "pre_appointment", name: "Lembrete de Aula", trigger: "1h antes", active: true, preview: "Olá {name}! Sua aula começa em 1 hora. Confirme sua presença 💪" },
    { id: "post_checkin", name: "Confirmação de Check-in", trigger: "Após check-in", active: true, preview: "Check-in confirmado! Você ganhou {coins} GymCoins 🪙 Total: {total}" },
    { id: "level_up", name: "Subiu de Nível", trigger: "Ao subir de nível", active: true, preview: "🎉 Parabéns! Você subiu para o nível {level}!" },
    { id: "reactivation", name: "Reativação", trigger: "7 dias sem visita", active: true, preview: "Saudades! Faz {days} dias que você não nos visita. Que tal voltar hoje? 💪" },
    { id: "payment_due", name: "Aviso de Cobrança", trigger: "3 dias antes", active: true, preview: "Lembrete: Sua mensalidade vence em {days} dias. Evite a inadimplência!" },
    { id: "weekly_ranking", name: "Ranking Semanal", trigger: "Segunda-feira", active: false, preview: "📊 Ranking da semana: Você está em #{position} com {checkins} check-ins!" },
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
    } catch { setResult("❌ Falha ao enviar"); }
    finally { setSending(false); }
  }

  return (
    <div className="space-y-6 stagger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Templates Ativos" value={templates.filter(t => t.active).length.toString()} />
        <KPI label="Taxa de Entrega" value="96%" trend="+2%" />
        <KPI label="Taxa de Leitura" value="87%" />
        <KPI label="Taxa de Clique" value="31%" trend="+5%" />
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
            <MessageSquare size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Enviar Mensagem em Massa</h3>
            <p className="text-xs text-surface-400">Para todos os alunos ativos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Digite a mensagem..."
            className="input-base flex-1 resize-none h-20" />
          <button onClick={sendBroadcast} disabled={sending || !message.trim()}
            className="btn-primary px-5 flex items-center gap-2 text-sm">
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Bell size={15} />}
            {sending ? "..." : "Enviar"}
          </button>
        </div>
        {result && <p className="mt-2 text-sm text-surface-500">{result}</p>}
      </div>

      <div className="card p-6">
        <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Templates de Notificação</h3>
        <div className="space-y-3">
          {templates.map(n => (
            <div key={n.id} className="flex items-start gap-4 p-4 rounded-xl border border-surface-200/40 dark:border-surface-700/40 hover:border-brand-200/40 dark:hover:border-brand-700/40 transition-all">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.active ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-surface-100 dark:bg-surface-800"}`}>
                {n.active ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Clock size={18} className="text-surface-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-surface-900 dark:text-white">{n.name}</span>
                  <span className="text-[10px] bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 px-2 py-0.5 rounded-full">WhatsApp</span>
                </div>
                <div className="text-xs text-surface-400 mb-2">Disparo: {n.trigger}</div>
                <div className="bg-[#dcf8c6] dark:bg-[#1a3a25] rounded-xl rounded-tl-none px-4 py-2 text-sm text-surface-800 dark:text-emerald-200 max-w-sm">
                  {n.preview}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" defaultChecked={n.active} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-200 dark:bg-surface-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
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
    name: studio?.name ?? "", owner_name: studio?.owner_name ?? "",
    email: studio?.email ?? "", address: studio?.address ?? "",
    establishment_type: studio?.establishment_type ?? "studio",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (studio) setForm({ name: studio.name, owner_name: studio.owner_name, email: studio.email, address: studio.address ?? "", establishment_type: studio.establishment_type });
  }, [studio]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/studio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { onStudioUpdate(await res.json()); setSaveMsg("✅ Alterações salvas!"); }
      else setSaveMsg("❌ Erro ao salvar");
    } catch { setSaveMsg("❌ Erro ao salvar"); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(null), 3000); }
  }

  const inputCls = "input-base w-full";
  const labelCls = "text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="space-y-6 stagger">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <Settings size={18} className="text-brand-500" />
          </div>
          <h3 className="font-display font-bold text-surface-900 dark:text-white">Perfil do Estabelecimento</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className={labelCls}>Nome do Estabelecimento</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Responsável</label><input value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Endereço</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro..." className={inputCls} /></div>
          </div>
          <div>
            <label className={labelCls}>Tipo de Estabelecimento</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ESTABLISHMENT_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, establishment_type: key }))}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border ${form.establishment_type === key ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400" : "bg-surface-50 dark:bg-surface-800 border-surface-200/40 dark:border-surface-700/40 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"}`}>
                  <span className="text-lg">{val.icon}</span>{val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-primary py-3 px-8 text-sm flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          {saveMsg && <span className="text-sm text-surface-400">{saveMsg}</span>}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <CreditCard size={18} className="text-brand-500" />
          </div>
          <h3 className="font-display font-bold text-surface-900 dark:text-white">Assinatura</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/30 dark:border-brand-800/30">
          <div>
            <div className="font-semibold text-surface-900 dark:text-white">Plano {studio?.plan ?? "—"}</div>
            <div className="text-xs text-surface-400 mt-0.5">Gerencie no portal de faturamento</div>
          </div>
          <button onClick={() => fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "portal" }) }).then(r => r.json()).then(d => d.url && window.open(d.url, "_blank"))}
            className="btn-primary py-2 px-4 text-sm">
            Gerenciar →
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <Zap size={18} className="text-brand-500" />
          </div>
          <h3 className="font-display font-bold text-surface-900 dark:text-white">Integrações</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Wellhub (Gympass)", status: "Disponível", color: "blue", icon: "🏋️" },
            { name: "TotalPass", status: "Disponível", color: "blue", icon: "🎫" },
            { name: "Catraca Eletrônica", status: "Configurar", color: "amber", icon: "🚪" },
            { name: "WhatsApp Business", status: "Conectado", color: "green", icon: "📱" },
            { name: "Google Calendar", status: "Disponível", color: "blue", icon: "📅" },
          ].map(int => (
            <div key={int.name} className="flex items-center gap-3 p-4 rounded-xl border border-surface-200/40 dark:border-surface-700/40 hover:border-brand-200/40 dark:hover:border-brand-700/40 transition-all">
              <div className="text-2xl">{int.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-surface-900 dark:text-white">{int.name}</div>
                <span className={`text-[10px] font-semibold ${int.color === "green" ? "text-emerald-500" : int.color === "blue" ? "text-blue-500" : "text-amber-500"}`}>
                  ● {int.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/app" className="card p-5 hover:border-brand-300/40 dark:hover:border-brand-700/40 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📱</div>
          <div>
            <div className="font-display font-bold text-surface-900 dark:text-white">App do Aluno</div>
            <div className="text-xs text-surface-400">Ver como seus alunos veem</div>
          </div>
        </Link>
        <Link href="/tv" className="card p-5 hover:border-brand-300/40 dark:hover:border-brand-700/40 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📺</div>
          <div>
            <div className="font-display font-bold text-surface-900 dark:text-white">TV Display</div>
            <div className="text-xs text-surface-400">Ranking ao vivo no studio</div>
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
  const { dark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    Promise.all([
      fetch("/api/studio").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/dashboard").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/trainers").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([studioData, dashData, trainersData]) => {
      // If no data from APIs, use demo data for investor presentation
      const useDemoFallback = !studioData && !dashData;

      if (useDemoFallback) {
        setStudio(DEMO_STUDIO as any);
        setDashboard(DEMO_DASHBOARD);
        setTrainers(DEMO_TRAINERS as any);
        setLoadingGlobal(false);
        return;
      }

      setStudio(studioData);
      setDashboard(dashData?.kpis ? {
        totalStudents: dashData.kpis.totalStudents ?? 0,
        activeStudents: dashData.kpis.activeStudents ?? 0,
        newThisMonth: 0,
        mrr: dashData.kpis.mrr ?? 0,
        mrrGrowth: dashData.kpis.mrrGrowth ?? 0,
        churnRate: 0,
        todayCheckins: dashData.kpis.todayCheckins ?? 0,
        todayAppointments: dashData.kpis.todayAppointments ?? 0,
        recentCheckins: (dashData.recentCheckins ?? []).map((c: any) => ({
          student_name: c.students?.name ?? "—",
          time: new Date(c.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          coins_earned: c.students?.coins ?? 10,
        })),
        rankingTop5: (dashData.rankingTop5 ?? []).map((r: any, i: number) => ({
          rank: i + 1,
          student_name: r.students?.name ?? "—",
          checkins: r.checkins ?? 0,
          coins: r.coins_earned ?? 0,
        })),
      } : null);
      setTrainers(Array.isArray(trainersData) ? trainersData : []);
    }).catch(() => {}).finally(() => setLoadingGlobal(false));
  }, []);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const studioInitials = studio?.name?.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "G";
  const estType = ESTABLISHMENT_TYPES[studio?.establishment_type ?? "studio"];

  const TabContent = useCallback(() => {
    switch (activeTab) {
      case "overview":    return <OverviewTab dashboard={dashboard} trainers={trainers} loading={loadingGlobal} />;
      case "agenda":      return <AgendaTab trainers={trainers} />;
      case "alunos":      return <AlunosTab />;
      case "relatorios":  return <RelatoriosTab />;
      case "coins":       return <CoinsTab />;
      case "financeiro":  return <FinanceiroTab dashboard={dashboard} />;
      case "whatsapp":    return <WhatsAppTab />;
      case "config":      return <ConfigTab studio={studio} onStudioUpdate={setStudio} />;
    }
  }, [activeTab, dashboard, trainers, loadingGlobal, studio]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex transition-colors">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-950 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static border-r border-white/5 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 pb-4">
          <Link href="/" className="flex items-center gap-3 mb-0.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-black text-base shadow-lg shadow-brand-600/40">G</div>
            <div>
              <div className="font-display font-bold text-sm tracking-tight">GymFlow</div>
              <div className="text-[10px] text-white/30 tracking-widest uppercase">& Coins</div>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 mx-3 rounded-xl bg-white/5 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/30 flex items-center justify-center font-display font-bold text-sm text-brand-300">{studioInitials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{studio?.name ?? "Carregando..."}</div>
              <div className="text-[10px] text-white/30">{estType?.label ?? "Studio"} • {studio?.plan ?? "—"}</div>
            </div>
          </div>
        </div>

        <nav className="px-3 py-2 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-brand-500/20 text-brand-300 shadow-sm" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              <span className={activeTab === t.id ? "text-brand-400" : ""}>{t.icon}</span>
              {t.label}
              {activeTab === t.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/tv" className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 py-2 rounded-xl text-xs font-medium transition-all">
              <Monitor size={14} /> TV
            </Link>
            <Link href="/app" className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 py-2 rounded-xl text-xs font-medium transition-all">
              📱 App
            </Link>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-white/3 hover:bg-red-500/10 text-white/20 hover:text-red-400 py-2 rounded-xl text-xs font-medium transition-all">
              <LogOut size={14} /> Sair
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/60 dark:border-surface-800/60 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-400 hover:text-surface-900 dark:hover:text-white transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <h1 className="font-display font-bold text-lg text-surface-900 dark:text-white">{TABS.find(t => t.id === activeTab)?.label}</h1>
                <p className="text-xs text-surface-400 capitalize hidden sm:block">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dashboard && (
                <div className="hidden md:flex items-center gap-1.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/40 dark:border-brand-800/40 px-3.5 py-1.5 rounded-full">
                  <Users size={13} className="text-brand-500" />
                  <span className="font-display font-bold text-brand-600 dark:text-brand-400 text-sm">{dashboard.activeStudents}</span>
                  <span className="text-xs text-brand-400/70 dark:text-brand-500">ativos</span>
                </div>
              )}
              {/* Theme toggle */}
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
                title={dark ? "Modo claro" : "Modo escuro"}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Avatar name={studio?.name ?? "G"} size="sm" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-5 max-w-7xl w-full mx-auto">
          <TabContent />
        </div>
      </main>
    </div>
  );
}
