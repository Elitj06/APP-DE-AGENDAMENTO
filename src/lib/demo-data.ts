// ═══════════════════════════════════════════════════════════════
// GymFlow & Coins — Demo Data System
// Provides realistic data when Supabase is not connected.
// All CRUD operations work in-memory for live demos.
// ═══════════════════════════════════════════════════════════════

const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const yesterday = new Date(today.getTime() - 86400000).toISOString().split("T")[0];
const uuid = () => crypto.randomUUID?.() ?? `demo-${Math.random().toString(36).slice(2, 10)}`;

export const DEMO_STUDIO = {
  id: uuid(), name: "Studio Vitale", owner_name: "Mariana Costa",
  email: "mariana@studiovitale.com.br", address: "Rua Visconde de Pirajá, 595 — Ipanema, RJ",
  establishment_type: "studio", plan: "Pro",
};

export const DEMO_TRAINERS = [
  { id: uuid(), name: "Mariana Costa", specialty: "Musculação / Pilates", active_students: 45, rating: 4.9 },
  { id: uuid(), name: "Ricardo Lima", specialty: "Funcional / CrossFit", active_students: 38, rating: 4.8 },
  { id: uuid(), name: "Camila Souza", specialty: "Yoga / Pilates", active_students: 32, rating: 4.9 },
];

export const DEMO_STUDENTS = [
  { id: uuid(), name: "Ana Beatriz Silva", email: "ana@email.com", phone: "(21) 99111-2222", status: "active", level: "Ouro", coins: 342, total_checkins: 89, monthly_checkins: 14, last_checkin: todayStr, joined_at: "2025-06-12", plan_name: "Mensal" },
  { id: uuid(), name: "Carlos Eduardo Reis", email: "carlos@email.com", phone: "(21) 99222-3333", status: "active", level: "Diamante", coins: 578, total_checkins: 156, monthly_checkins: 18, last_checkin: yesterday, joined_at: "2025-01-08", plan_name: "Trimestral" },
  { id: uuid(), name: "Daniela Ferreira", email: "dani@email.com", phone: "(21) 99333-4444", status: "active", level: "Prata", coins: 215, total_checkins: 52, monthly_checkins: 11, last_checkin: todayStr, joined_at: "2025-09-20", plan_name: "Mensal" },
  { id: uuid(), name: "Eduardo Martins", email: "edu@email.com", phone: "(21) 99444-5555", status: "active", level: "Lenda", coins: 891, total_checkins: 312, monthly_checkins: 22, last_checkin: yesterday, joined_at: "2024-03-15", plan_name: "Semestral" },
  { id: uuid(), name: "Fernanda Alves", email: "fer@email.com", phone: "(21) 99555-6666", status: "overdue", level: "Bronze", coins: 67, total_checkins: 23, monthly_checkins: 3, last_checkin: "2026-02-28", joined_at: "2025-11-05", plan_name: "Mensal" },
  { id: uuid(), name: "Gabriel Santos", email: "gab@email.com", phone: "(21) 99666-7777", status: "active", level: "Ouro", coins: 445, total_checkins: 134, monthly_checkins: 16, last_checkin: todayStr, joined_at: "2025-04-10", plan_name: "Anual" },
  { id: uuid(), name: "Helena Rodrigues", email: "helena@email.com", phone: "(21) 99777-8888", status: "active", level: "Prata", coins: 334, total_checkins: 78, monthly_checkins: 12, last_checkin: yesterday, joined_at: "2025-07-22", plan_name: "Trimestral" },
  { id: uuid(), name: "Igor Nascimento", email: "igor@email.com", phone: "(21) 99888-9999", status: "inactive", level: "Iniciante", coins: 12, total_checkins: 8, monthly_checkins: 0, last_checkin: "2026-01-15", joined_at: "2025-12-01", plan_name: "Mensal" },
  { id: uuid(), name: "Julia Mendes", email: "julia@email.com", phone: "(21) 98111-2222", status: "active", level: "Prata", coins: 267, total_checkins: 95, monthly_checkins: 15, last_checkin: todayStr, joined_at: "2025-05-18", plan_name: "Semestral" },
  { id: uuid(), name: "Leonardo Barros", email: "leo@email.com", phone: "(21) 98222-3333", status: "active", level: "Bronze", coins: 189, total_checkins: 41, monthly_checkins: 8, last_checkin: yesterday, joined_at: "2025-10-30", plan_name: "Mensal" },
  { id: uuid(), name: "Marina Costa", email: "marina@email.com", phone: "(21) 98333-4444", status: "active", level: "Ouro", coins: 410, total_checkins: 122, monthly_checkins: 17, last_checkin: todayStr, joined_at: "2025-02-14", plan_name: "Anual" },
  { id: uuid(), name: "Pedro Henrique", email: "pedro@email.com", phone: "(21) 98444-5555", status: "active", level: "Bronze", coins: 156, total_checkins: 35, monthly_checkins: 9, last_checkin: yesterday, joined_at: "2025-08-03", plan_name: "Mensal" },
];

const services = ["Personal Training", "Pilates", "Yoga", "CrossFit", "Funcional", "Musculação"];

function buildDemoAppointments(date: string) {
  const slots = [
    { time: "06:00", student: 0, trainer: 0, svc: 5, status: "completed" },
    { time: "07:00", student: 1, trainer: 1, svc: 4, status: "completed" },
    { time: "08:00", student: 2, trainer: 0, svc: 1, status: "checked_in" },
    { time: "09:00", student: 5, trainer: 1, svc: 5, status: "confirmed" },
    { time: "10:00", student: 6, trainer: 2, svc: 2, status: "confirmed" },
    { time: "11:00", student: 8, trainer: 1, svc: 4, status: "booked" },
    { time: "14:00", student: 3, trainer: 0, svc: 5, status: "booked" },
    { time: "15:00", student: 10, trainer: 2, svc: 1, status: "booked" },
    { time: "16:00", student: 9, trainer: 1, svc: 3, status: "booked" },
    { time: "17:00", student: 11, trainer: 0, svc: 0, status: "booked" },
    { time: "18:00", student: 4, trainer: 2, svc: 2, status: "booked" },
  ];
  return slots.map(s => ({
    id: uuid(),
    date,
    time: s.time,
    duration: 60,
    status: date < todayStr ? "completed" : s.status,
    service_type: services[s.svc],
    notes: null,
    prescription_id: null,
    students: { id: DEMO_STUDENTS[s.student].id, name: DEMO_STUDENTS[s.student].name, phone: DEMO_STUDENTS[s.student].phone, level: DEMO_STUDENTS[s.student].level, coins: DEMO_STUDENTS[s.student].coins },
    trainers: { id: DEMO_TRAINERS[s.trainer].id, name: DEMO_TRAINERS[s.trainer].name, specialty: DEMO_TRAINERS[s.trainer].specialty },
    workout_prescriptions: null,
  }));
}

export function getDemoAppointments(date: string) {
  return buildDemoAppointments(date);
}

export const DEMO_DASHBOARD = {
  totalStudents: DEMO_STUDENTS.length,
  activeStudents: DEMO_STUDENTS.filter(s => s.status === "active").length,
  newThisMonth: 3,
  mrr: 4875000, // centavos
  mrrGrowth: 8.5,
  churnRate: 3.2,
  todayCheckins: 6,
  todayAppointments: 11,
  recentCheckins: [
    { student_name: "Ana Beatriz Silva", time: "06:45", coins_earned: 10 },
    { student_name: "Carlos Eduardo Reis", time: "07:12", coins_earned: 10 },
    { student_name: "Daniela Ferreira", time: "08:05", coins_earned: 10 },
    { student_name: "Gabriel Santos", time: "09:18", coins_earned: 10 },
    { student_name: "Marina Costa", time: "10:02", coins_earned: 10 },
    { student_name: "Julia Mendes", time: "11:30", coins_earned: 10 },
  ],
  rankingTop5: [
    { rank: 1, student_name: "Eduardo Martins", checkins: 22, coins: 891 },
    { rank: 2, student_name: "Carlos Eduardo Reis", checkins: 18, coins: 578 },
    { rank: 3, student_name: "Marina Costa", checkins: 17, coins: 410 },
    { rank: 4, student_name: "Gabriel Santos", checkins: 16, coins: 445 },
    { rank: 5, student_name: "Julia Mendes", checkins: 15, coins: 267 },
  ],
};

export const DEMO_COIN_TXS = [
  { id: uuid(), amount: 10, description: "Check-in Personal Training", created_at: `${todayStr}T06:45:00`, profiles: { full_name: "Ana Beatriz Silva" } },
  { id: uuid(), amount: 50, description: "Bônus: 15 check-ins no mês", created_at: `${yesterday}T19:00:00`, profiles: { full_name: "Carlos Eduardo Reis" } },
  { id: uuid(), amount: -200, description: "Resgatou: 1 aula grátis", created_at: `${yesterday}T14:30:00`, profiles: { full_name: "Eduardo Martins" } },
  { id: uuid(), amount: 10, description: "Check-in Musculação", created_at: `${todayStr}T09:18:00`, profiles: { full_name: "Gabriel Santos" } },
  { id: uuid(), amount: 10, description: "Check-in Yoga", created_at: `${yesterday}T10:30:00`, profiles: { full_name: "Helena Rodrigues" } },
  { id: uuid(), amount: 25, description: "Bônus: Meta semanal atingida", created_at: `${yesterday}T20:00:00`, profiles: { full_name: "Julia Mendes" } },
  { id: uuid(), amount: 10, description: "Check-in Pilates", created_at: `${todayStr}T08:05:00`, profiles: { full_name: "Daniela Ferreira" } },
  { id: uuid(), amount: -50, description: "Resgatou: Squeeze personalizada", created_at: `${yesterday}T16:00:00`, profiles: { full_name: "Leonardo Barros" } },
];

export const DEMO_REWARDS = [
  { id: uuid(), name: "Squeeze Personalizada", description: null, coins_cost: 50, emoji: "🧴", is_active: true, stock_quantity: 20 },
  { id: uuid(), name: "Camiseta do Studio", description: null, coins_cost: 150, emoji: "👕", is_active: true, stock_quantity: 15 },
  { id: uuid(), name: "1 Aula Grátis", description: null, coins_cost: 200, emoji: "🎫", is_active: true, stock_quantity: null },
  { id: uuid(), name: "1 Mês Grátis", description: null, coins_cost: 500, emoji: "🏆", is_active: true, stock_quantity: 5 },
  { id: uuid(), name: "Avaliação Física", description: null, coins_cost: 300, emoji: "📊", is_active: true, stock_quantity: null },
];

export const DEMO_PAYMENT_STATS = { total: 12, paid: 8, pending: 3, overdue: 1 };

export const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://SEU_PROJETO.supabase.co";
