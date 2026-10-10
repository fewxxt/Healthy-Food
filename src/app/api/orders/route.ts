import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const order = (await req.json()) as Record<string, unknown>;
  // TODO: บันทึกลงฐานข้อมูลจริง (เช่น Vercel Postgres / Supabase)
  return NextResponse.json({ ok: true, orderId: "HF" + Date.now().toString().slice(-8), ...order });
}
