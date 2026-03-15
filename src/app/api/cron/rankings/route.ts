import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/whatsapp";

// Vercel Cron: roda toda segunda-feira às 09h
// Envia ranking mensal para todos os alunos de todos os studios ativos
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instanceId = process.env.ZAPI_INSTANCE_ID ?? "";
  const token = process.env.ZAPI_TOKEN ?? "";
  if (!instanceId || !token) {
    return NextResponse.json({ error: "WhatsApp not configured" }, { status: 500 });
  }

  const supabase = await createServiceClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Studios com plano ativo (não trial expirado)
  const { data: studios } = await supabase
    .from("studios")
    .select("id, name")
    .in("plan", ["starter", "pro", "enterprise"]);

  let totalSent = 0;

  for (const studio of studios ?? []) {
    const { data: ranking } = await supabase
      .from("monthly_rankings")
      .select("rank, checkins, coins_earned, students(id, full_name, phone, level)")
      .eq("studio_id", studio.id)
      .eq("year", year)
      .eq("month", month)
      .order("rank", { ascending: true })
      .limit(10);

    if (!ranking?.length) continue;

    for (const entry of ranking) {
      const student = (entry as any).students;
      if (!student?.phone) continue;

      const isTop3 = entry.rank <= 3;
      const mensagem = isTop3
        ? "Você está no PÓDIO! 🏅 Continue assim, campeão!"
        : "Treine mais para subir no ranking! 💪";

      const ok = await sendNotification({
        instanceId,
        token,
        phone: student.phone,
        templateKey: "weekly_ranking",
        vars: {
          nome: student.full_name,
          posicao: entry.rank.toString(),
          checkins: entry.checkins.toString(),
          coins: (entry.coins_earned ?? 0).toString(),
          mensagem,
        },
      });

      if (ok) {
        totalSent++;
        await supabase.from("notification_logs").insert({
          studio_id: studio.id,
          student_id: student.id,
          channel: "whatsapp",
          message: `Ranking mensal: ${entry.rank}º lugar com ${entry.checkins} check-ins`,
          status: "sent",
        });
      }
    }
  }

  return NextResponse.json({
    message: "Weekly ranking notifications sent",
    sent: totalSent,
    studios: studios?.length ?? 0,
    period: `${year}-${String(month).padStart(2, "0")}`,
  });
}
