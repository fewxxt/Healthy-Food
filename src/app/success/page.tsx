"use client";

/* การชำระเงินเสร็สิ้น */

import { useEffect, useState } from "react";
import Link from "next/link";

type LastOrder = { id: string; total: number; pay: string };

export default function Success() {
  const [o, setO] = useState<LastOrder | null>(null);
  useEffect(() => { try { setO(JSON.parse(sessionStorage.getItem("lastOrder") ?? "null")); } catch {} }, []);
  return (
    <div className="card center" style={{ maxWidth: 460, margin: "40px auto", padding: 32 }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <h2>การชำระเงินเสร็จสิ้น</h2>
      {o && <p>หมายเลขคำสั่งซื้อ <b>{o.id}</b><br />ยอดชำระ ฿{o.total}</p>}
      <Link className="btn" href="/">กลับหน้าแรก</Link>
    </div>
  );
}
