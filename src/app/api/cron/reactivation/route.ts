import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/whatsapp";

// Vercel Cron: roda diariamente às 10h
// Envia mensagem de reativação para alunos sem check-in há 7–14 dias
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

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: students, error } = await supabase
    .from("students")
    .select("id, name, phone, last_checkin_at, studio_id")
    .eq("status", "active")
    .not("phone", "is", null)
    .lte("last_checkin_at", sevenDaysAgo)
    .gte("last_checkin_at", fourteenDaysAgo);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const student of students ?? []) {
    if (!student.phone) continue;

    // Evitar re-envio: checar se já notificamos nos últimos 7 dias
    const { data: recentLog } = await supabase
      .from("notification_logs")
      .select("id")
      .eq("student_id", student.id)
      .eq("channel", "whatsapp")
      .gte("created_at", sevenDaysAgo)
      .maybeSingle();

    if (recentLog) continue;

    const lastCheckin = student.last_checkin_at ? new Date(student.last_checkin_at) : null;
    const daysSince = lastCheckin
      ? Math.floor((Date.now() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24))
      : 7;

    const ok = await sendNotification({
      instanceId,
      token,
      phone: student.phone,
      templateKey: "reactivation",
      vars: {
        nome: student.name,
        dias: daysSince.toString(),
        coins: "0", // saldo será exibido como 0 se não disponível
      },
    });

    if (ok) {
      sent++;
      await supabase.from("notification_logs").insert({
        studio_id: student.studio_id,
        student_id: student.id,
        channel: "whatsapp",
        message: `Reativação: ${daysSince} dias sem check-in`,
        status: "sent",
      });
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    message: "Reactivation messages sent",
    sent,
    failed,
    total: students?.length ?? 0,
  });
}
