"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type LastOrder = { id: string; total: number; pay: string; at?: number };

const STEPS = [
  { title: "รับออเดอร์", desc: "ร้านได้รับคำสั่งซื้อของคุณแล้ว" },
  { title: "เตรียมสินค้า", desc: "กำลังเตรียมอาหารและบรรจุหีบห่อ" },
  { title: "กำลังจัดส่ง", desc: "กำลังนำส่งไปยังที่อยู่ของคุณ" },
  { title: "จัดส่งสำเร็จ", desc: "ส่งอาหารถึงคุณเรียบร้อยแล้ว" },
];
const STEP_MS = 5000; // เวลาต่อหนึ่งขั้นตอน (มิลลิวินาที)

export default function Success() {
  const [o, setO] = useState<LastOrder | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("lastOrder") ?? "null") as LastOrder | null;
      if (data && !data.at) {
        data.at = Date.now();
        sessionStorage.setItem("lastOrder", JSON.stringify(data));
      }
      setO(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (!o?.at) return;
    const at = o.at;
    const tick = () => setStep(Math.min(STEPS.length - 1, Math.floor((Date.now() - at) / STEP_MS)));
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [o]);

  const finished = step === STEPS.length - 1;
  const state = (i: number) => (i < step || finished ? "done" : i === step ? "now" : "");

  return (
    <div className="card center" style={{ maxWidth: 460, margin: "40px auto", padding: 32 }}>
      <h2>การชำระเงินเสร็จสิ้น</h2>
      {o && <p>หมายเลขคำสั่งซื้อ <b>{o.id}</b><br />ยอดชำระ ฿{o.total}</p>}

      {o && (<>
        <h3 style={{ marginTop: 24 }}>สถานะคำสั่งซื้อ</h3>
        <ol className="track">
          {STEPS.map((s, i) => (
            <li key={s.title} className={state(i)}>
              <span className="dot">{i + 1}</span>
              <div><b>{s.title}</b><small>{s.desc}</small></div>
            </li>
          ))}
        </ol>
        {finished && <p>ขอบคุณที่ใช้บริการ</p>}
      </>)}

      <Link className="btn" href="/">กลับหน้าแรก</Link>
    </div>
  );
}