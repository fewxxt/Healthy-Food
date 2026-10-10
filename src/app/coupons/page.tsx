"use client";
import Link from "next/link";
import { useCart, COUPONS } from "@/components/Providers";

export default function Coupons() {
  const { collected, collect } = useCart();
  return (<>
    <h2>โค้ดส่วนลด</h2>
    <p className="muted">กดเก็บโค้ดที่ต้องการ โค้ดที่เก็บไว้จะแสดงในหน้าสั่งซื้อ</p>
    {Object.entries(COUPONS).map(([code, v]) => {
      const has = collected.includes(code);
      return (
        <div className="card row" key={code} style={{ marginBottom: 12 }}>
          <div>
            <b>{code}</b>
            <div>{v.label}</div>
          </div>
          <button className={"btn " + (has ? "ghost" : "")} disabled={has} onClick={() => collect(code)}>
            {has ? "เก็บแล้ว" : "เก็บโค้ด"}
          </button>
        </div>
      );
    })}
    <p><Link href="/order" className="price">ไปหน้าสั่งซื้อ</Link></p>
  </>);
}