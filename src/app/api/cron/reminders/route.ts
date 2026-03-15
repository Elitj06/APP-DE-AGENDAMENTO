import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/whatsapp";

// Vercel Cron: roda de hora em hora — envia lembretes 1h antes de cada aula
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

  // Janela: agendamentos daqui a 60–70 min
  const from = new Date(now.getTime() + 60 * 60 * 1000);
  const to = new Date(now.getTime() + 70 * 60 * 1000);
  const fromTime = from.toTimeString().slice(0, 5);
  const toTime = to.toTimeString().slice(0, 5);
  const targetDate = from.toISOString().split("T")[0];

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id, time, service_type, studio_id,
      students!inner(id, full_name, phone),
      trainers(name)
    `)
    .eq("date", targetDate)
    .gte("time", fromTime)
    .lte("time", toTime)
    .in("status", ["booked", "confirmed"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const appt of appointments ?? []) {
    const student = (appt as any).students;
    const trainer = (appt as any).trainers;
    if (!student?.phone) continue;

    const ok = await sendNotification({
      instanceId,
      token,
      phone: student.phone,
      templateKey: "pre_appointment",
      vars: {
        nome: student.full_name,
        hora: appt.time,
        tipo: appt.service_type,
        trainer: trainer?.name ?? "Seu Trainer",
      },
    });

    if (ok) {
      sent++;
      await supabase.from("notification_logs").insert({
        studio_id: (appt as any).studio_id,
        student_id: student.id,
        channel: "whatsapp",
        message: `Lembrete de aula às ${appt.time}`,
        status: "sent",
      });
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    message: "Reminders sent",
    sent,
    failed,
    total: appointments?.length ?? 0,
    window: `${fromTime}–${toTime} on ${targetDate}`,
  });
}
