// ============================================================
// GymFlow & Coins — Mock Data for Demo/Investor Presentation
// ============================================================

export const PROVIDER_PROFILE = {
  id: "prov_001",
  name: "Studio Vitale",
  type: "studio" as const,
  ownerName: "Mariana Costa",
  email: "mariana@studiovitale.com.br",
  phone: "(21) 99876-5432",
  address: "Rua Visconde de Pirajá, 595 — Ipanema, RJ",
  logo: "V",
  plan: "Pro" as const,
  since: "2024-03-15",
  activeStudents: 127,
  monthlyRevenue: 48750,
  totalCoinsDistributed: 15420,
};

export type EstablishmentType = "personal" | "studio" | "micro_gym" | "pilates" | "crossfit" | "yoga";

export const ESTABLISHMENT_TYPES: Record<EstablishmentType, { label: string; icon: string; color: string }> = {
  personal: { label: "Personal Trainer", icon: "🏃", color: "#3b82f6" },
  studio: { label: "Studio", icon: "🏋️", color: "#f97316" },
  micro_gym: { label: "Micro Gym", icon: "💪", color: "#ef4444" },
  pilates: { label: "Pilates", icon: "🧘", color: "#8b5cf6" },
  crossfit: { label: "CrossFit", icon: "🔥", color: "#f59e0b" },
  yoga: { label: "Yoga", icon: "🕉️", color: "#10b981" },
};

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  plan: string;
  status: "active" | "inactive" | "overdue";
  coins: number;
  level: string;
  checkins: number;
  lastCheckin: string;
  monthlyCheckins: number;
  joinedAt: string;
}

export const STUDENTS: Student[] = [
  { id:"s01", name:"Ana Beatriz Silva", email:"ana@email.com", phone:"(21) 99111-2222", avatar:"AB", plan:"Mensal", status:"active", coins:342, level:"Ouro", checkins:89, lastCheckin:"2026-03-13", monthlyCheckins:14, joinedAt:"2025-06-12" },
  { id:"s02", name:"Carlos Eduardo Reis", email:"carlos@email.com", phone:"(21) 99222-3333", avatar:"CR", plan:"Trimestral", status:"active", coins:578, level:"Diamante", checkins:156, lastCheckin:"2026-03-12", monthlyCheckins:18, joinedAt:"2025-01-08" },
  { id:"s03", name:"Daniela Ferreira", email:"dani@email.com", phone:"(21) 99333-4444", avatar:"DF", plan:"Mensal", status:"active", coins:215, level:"Prata", checkins:52, lastCheckin:"2026-03-13", monthlyCheckins:11, joinedAt:"2025-09-20" },
  { id:"s04", name:"Eduardo Martins", email:"edu@email.com", phone:"(21) 99444-5555", avatar:"EM", plan:"Semestral", status:"active", coins:891, level:"Lenda", checkins:312, lastCheckin:"2026-03-11", monthlyCheckins:22, joinedAt:"2024-03-15" },
  { id:"s05", name:"Fernanda Alves", email:"fer@email.com", phone:"(21) 99555-6666", avatar:"FA", plan:"Mensal", status:"overdue", coins:67, level:"Bronze", checkins:23, lastCheckin:"2026-02-28", monthlyCheckins:3, joinedAt:"2025-11-05" },
  { id:"s06", name:"Gabriel Santos", email:"gab@email.com", phone:"(21) 99666-7777", avatar:"GS", plan:"Anual", status:"active", coins:445, level:"Ouro", checkins:134, lastCheckin:"2026-03-13", monthlyCheckins:16, joinedAt:"2025-04-10" },
  { id:"s07", name:"Helena Rodrigues", email:"helena@email.com", phone:"(21) 99777-8888", avatar:"HR", plan:"Trimestral", status:"active", coins:334, level:"Prata", checkins:78, lastCheckin:"2026-03-12", monthlyCheckins:12, joinedAt:"2025-07-22" },
  { id:"s08", name:"Igor Nascimento", email:"igor@email.com", phone:"(21) 99888-9999", avatar:"IN", plan:"Mensal", status:"inactive", coins:12, level:"Iniciante", checkins:8, lastCheckin:"2026-01-15", monthlyCheckins:0, joinedAt:"2025-12-01" },
  { id:"s09", name:"Julia Mendes", email:"julia@email.com", phone:"(21) 98111-2222", avatar:"JM", plan:"Semestral", status:"active", coins:267, level:"Prata", checkins:95, lastCheckin:"2026-03-13", monthlyCheckins:15, joinedAt:"2025-05-18" },
  { id:"s10", name:"Leonardo Barros", email:"leo@email.com", phone:"(21) 98222-3333", avatar:"LB", plan:"Mensal", status:"active", coins:189, level:"Bronze", checkins:41, lastCheckin:"2026-03-10", monthlyCheckins:8, joinedAt:"2025-10-30" },
];

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: "booked" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";
  trainer: string;
}

const today = "2026-03-13";
const tomorrow = "2026-03-14";

export const APPOINTMENTS: Appointment[] = [
  { id:"a01", studentId:"s01", studentName:"Ana Beatriz", type:"Musculação", date:today, time:"06:00", duration:60, status:"completed", trainer:"Mariana" },
  { id:"a02", studentId:"s02", studentName:"Carlos Eduardo", type:"Funcional", date:today, time:"07:00", duration:45, status:"completed", trainer:"Ricardo" },
  { id:"a03", studentId:"s03", studentName:"Daniela", type:"Pilates Solo", date:today, time:"08:00", duration:50, status:"checked_in", trainer:"Mariana" },
  { id:"a04", studentId:"s06", studentName:"Gabriel", type:"Musculação", date:today, time:"09:00", duration:60, status:"confirmed", trainer:"Ricardo" },
  { id:"a05", studentId:"s07", studentName:"Helena", type:"Yoga", date:today, time:"10:00", duration:60, status:"confirmed", trainer:"Camila" },
  { id:"a06", studentId:"s09", studentName:"Julia", type:"Funcional", date:today, time:"11:00", duration:45, status:"booked", trainer:"Ricardo" },
  { id:"a07", studentId:"s04", studentName:"Eduardo", type:"Musculação", date:today, time:"14:00", duration:60, status:"booked", trainer:"Mariana" },
  { id:"a08", studentId:"s10", studentName:"Leonardo", type:"CrossFit", date:today, time:"16:00", duration:60, status:"booked", trainer:"Ricardo" },
  { id:"a09", studentId:"s01", studentName:"Ana Beatriz", type:"Pilates", date:tomorrow, time:"07:00", duration:50, status:"booked", trainer:"Camila" },
  { id:"a10", studentId:"s05", studentName:"Fernanda", type:"Funcional", date:tomorrow, time:"09:00", duration:45, status:"booked", trainer:"Mariana" },
];

export interface Trainer {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  activeStudents: number;
  todayAppointments: number;
  rating: number;
}

export const TRAINERS: Trainer[] = [
  { id:"t01", name:"Mariana Costa", avatar:"MC", specialty:"Musculação / Pilates", activeStudents:45, todayAppointments:6, rating:4.9 },
  { id:"t02", name:"Ricardo Lima", avatar:"RL", specialty:"Funcional / CrossFit", activeStudents:38, todayAppointments:5, rating:4.8 },
  { id:"t03", name:"Camila Souza", avatar:"CS", specialty:"Yoga / Pilates", activeStudents:32, todayAppointments:4, rating:4.9 },
];

export interface CoinTransaction {
  id: string;
  studentName: string;
  type: "earned_checkin" | "earned_bonus" | "spent" | "redeemed";
  amount: number;
  description: string;
  date: string;
}

export const COIN_TRANSACTIONS: CoinTransaction[] = [
  { id:"ct01", studentName:"Ana Beatriz", type:"earned_checkin", amount:10, description:"Check-in Musculação", date:"2026-03-13 06:45" },
  { id:"ct02", studentName:"Carlos Eduardo", type:"earned_bonus", amount:50, description:"Bônus: 15 check-ins no mês", date:"2026-03-12 19:00" },
  { id:"ct03", studentName:"Eduardo", type:"redeemed", amount:-200, description:"Resgatou: 1 aula grátis", date:"2026-03-12 14:30" },
  { id:"ct04", studentName:"Gabriel", type:"earned_checkin", amount:10, description:"Check-in Musculação", date:"2026-03-13 09:15" },
  { id:"ct05", studentName:"Helena", type:"earned_checkin", amount:10, description:"Check-in Yoga", date:"2026-03-12 10:30" },
  { id:"ct06", studentName:"Daniela", type:"earned_checkin", amount:10, description:"Check-in Pilates", date:"2026-03-13 08:05" },
  { id:"ct07", studentName:"Julia", type:"earned_bonus", amount:25, description:"Bônus: Meta semanal atingida", date:"2026-03-11 20:00" },
  { id:"ct08", studentName:"Leonardo", type:"spent", amount:-50, description:"Comprou: Squeeze personalizada", date:"2026-03-10 16:00" },
];

export const REVENUE_DATA = [
  { month:"Out", value:32400 },
  { month:"Nov", value:35800 },
  { month:"Dez", value:29600 },
  { month:"Jan", value:41200 },
  { month:"Fev", value:44900 },
  { month:"Mar", value:48750 },
];

export const CHECKIN_HEATMAP = [
  { day:"Seg", slots:[12,18,22,15,8,3] },
  { day:"Ter", slots:[10,16,20,18,12,5] },
  { day:"Qua", slots:[14,20,25,16,10,4] },
  { day:"Qui", slots:[11,17,21,19,11,6] },
  { day:"Sex", slots:[15,22,28,14,8,2] },
  { day:"Sáb", slots:[8,14,18,12,0,0] },
];

export const HOURS_LABELS = ["06h","08h","10h","14h","16h","18h"];

export const LEVELS = [
  { name:"Iniciante", minCheckins:0, color:"#94a3b8", icon:"🌱" },
  { name:"Bronze", minCheckins:20, color:"#cd7f32", icon:"🥉" },
  { name:"Prata", minCheckins:50, color:"#c0c0c0", icon:"🥈" },
  { name:"Ouro", minCheckins:100, color:"#ffd700", icon:"🥇" },
  { name:"Diamante", minCheckins:150, color:"#b9f2ff", icon:"💎" },
  { name:"Lenda", minCheckins:300, color:"#ff6b6b", icon:"🔥" },
];

export const NOTIFICATION_TEMPLATES = [
  { id:"n01", name:"Lembrete de Aula", trigger:"1h antes da aula", channel:"WhatsApp", active:true, preview:"Olá {nome}! Sua aula de {tipo} com {trainer} é às {hora}. Não esqueça! 💪" },
  { id:"n02", name:"Check-in Confirmado", trigger:"Após check-in", channel:"WhatsApp", active:true, preview:"✅ Check-in confirmado! Você ganhou 10 GymCoins 🪙. Total: {coins}" },
  { id:"n03", name:"Meta Atingida", trigger:"Ao completar meta", channel:"WhatsApp", active:true, preview:"🎉 Parabéns {nome}! Você atingiu sua meta de {meta}! Bônus de {bonus} coins!" },
  { id:"n04", name:"Cobrança Pendente", trigger:"Dia de vencimento", channel:"WhatsApp", active:false, preview:"Olá {nome}, seu plano {plano} vence hoje. Regularize para continuar treinando!" },
  { id:"n05", name:"Reativação", trigger:"7 dias sem check-in", channel:"WhatsApp", active:true, preview:"Sentimos sua falta, {nome}! 😢 Seu último treino foi há {dias} dias. Bora voltar?" },
  { id:"n06", name:"Ranking Semanal", trigger:"Domingo 20h", channel:"WhatsApp", active:true, preview:"🏆 Ranking da semana: Você está em {posição}º lugar com {checkins} check-ins!" },
];

export const PLANS = [
  { id:"p01", name:"Mensal", price:299, students:42, billingCycle:"monthly" },
  { id:"p02", name:"Trimestral", price:799, students:28, billingCycle:"quarterly" },
  { id:"p03", name:"Semestral", price:1399, students:18, billingCycle:"semiannual" },
  { id:"p04", name:"Anual", price:2499, students:12, billingCycle:"annual" },
];

export const FINANCIAL_SUMMARY = {
  mrr: 48750,
  mrrGrowth: 8.5,
  churnRate: 3.2,
  ltv: 2840,
  arpu: 384,
  pendingPayments: 4200,
  overduePayments: 1800,
  totalStudents: 127,
  activeStudents: 118,
  newThisMonth: 9,
  cancelledThisMonth: 4,
};

export const WHATSAPP_STATS = {
  sent: 1247,
  delivered: 1198,
  read: 987,
  clicked: 342,
  deliveryRate: 96.1,
  readRate: 82.4,
  clickRate: 34.6,
};

export const GAMIFICATION_CONFIG = {
  coinsPerCheckin: 10,
  bonusWeeklyGoal: 25,
  bonusMonthly15: 50,
  bonusMonthly20: 100,
  referralBonus: 100,
  rewards: [
    { id:"r01", name:"Squeeze Personalizada", cost:50, emoji:"🧴", claimed:34 },
    { id:"r02", name:"Camiseta do Studio", cost:150, emoji:"👕", claimed:18 },
    { id:"r03", name:"1 Aula Grátis", cost:200, emoji:"🎫", claimed:42 },
    { id:"r04", name:"1 Mês Grátis", cost:500, emoji:"🏆", claimed:8 },
    { id:"r05", name:"Avaliação Física Completa", cost:300, emoji:"📊", claimed:15 },
  ],
};
