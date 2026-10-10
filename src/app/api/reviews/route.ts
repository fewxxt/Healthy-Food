import { NextResponse } from "next/server";
import { auth } from "@/auth";

type Review = { id: string; name: string; image?: string | null; rating: number; text: string; date: string };

// เก็บรีวิวใน Upstash Redis (Vercel Marketplace) ถ้าตั้งค่า env ไว้ ไม่เช่นนั้นเก็บในหน่วยความจำชั่วคราว
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const mem = globalThis as unknown as { __reviews?: Review[] };
mem.__reviews ||= [];

const SEED: Review[] = [
  { id: "s1", name: "น้องหลิน ท่าขอนยาง", rating: 5, text: "สลัดสดมากค่ะ ส่งไวสุดๆ", date: "2026-09-20T09:00:00Z" },
  { id: "s2", name: "พิม แม่แตง", rating: 4, text: "แคลอรีต่ำ อิ่มนาน รสชาติดี", date: "2026-09-12T09:00:00Z" },
  { id: "s3", name: "ฝน", rating: 5, text: "อาหารทะเลสดใหม่ แพ็กเกจดี", date: "2026-09-05T09:00:00Z" },
  { id: "s4", name: "ต้น", rating: 3, text: "รสชาติกลางๆ แต่จัดส่งเร็ว", date: "2026-08-28T09:00:00Z" },
  { id: "s5", name: "อ้อม", rating: 4, text: "ดีต่อสุขภาพ ไม่ใส่ผงชูรส", date: "2026-08-20T09:00:00Z" },
  { id: "s6", name: "บีม", rating: 5, text: "บริการดีมากค่ะ ส่งถึงมือไว", date: "2026-08-12T09:00:00Z" },
  { id: "s7", name: "แอน", rating: 4, text: "อาหารสดใหม่ รสชาติอร่อย", date: "2026-08-05T09:00:00Z" },
  { id: "s8", name: "เจมส์", rating: 3, text: "รสชาติกลางๆ แต่จัดส่งเร็ว", date: "2026-07-28T09:00:00Z" },
  { id: "s9", name: "มิ้นท์", rating: 5, text: "สลัดสดมากค่ะ ส่งไวสุดๆ", date: "2026-07-20T09:00:00Z" },
  { id: "s10", name: "บี", rating: 4, text: "แคลอรีต่ำ อิ่มนาน รสชาติดี", date: "2026-07-12T09:00:00Z" },
];

async function redis(cmd: string[]): Promise<string | null> {
  const res = await fetch(REDIS_URL!, {
    method: "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }, body: JSON.stringify(cmd),
  });
  return ((await res.json()) as { result: string | null }).result;
}
async function load(): Promise<Review[]> {
  return REDIS_URL ? (JSON.parse((await redis(["GET", "reviews"])) || "[]") as Review[]) : mem.__reviews!;
}
async function save(list: Review[]) {
  if (REDIS_URL) await redis(["SET", "reviews", JSON.stringify(list)]);
  else mem.__reviews = list;
}

export async function GET() {
  try {
    const all = [...(await load()), ...SEED].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    return NextResponse.json(all, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(SEED);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { rating, text } = (await req.json()) as { rating: number; text: string };
  const t = String(text || "").trim().slice(0, 300);
  if (!(rating >= 1 && rating <= 5) || t.length < 3) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const review: Review = {
    id: Date.now().toString(36), name: session.user?.name ?? "ลูกค้า", image: session.user?.image ?? null,
    rating: Math.round(rating), text: t, date: new Date().toISOString(),
  };
  await save([review, ...(await load())].slice(0, 200));
  return NextResponse.json({ ok: true, review });
}

/* ลบรีวิว (เฉพาะแอดมินเท่านั้น) */
export async function DELETE(req: Request) {
  const session = await auth();
  const admin = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!session || !admin || session.user?.email !== admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = (await req.json()) as { id: string };
  const list = await load();
  if (!list.some(r => r.id === id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  await save(list.filter(r => r.id !== id));
  return NextResponse.json({ ok: true });
}