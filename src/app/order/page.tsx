"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useCart } from "@/components/Providers";
import { foods } from "@/lib/foods";
import type { Food } from "@/lib/types";

const toDish = (f: Food) => ({ id: String(f.id), name: f.name, img: f.image, price: f.price, category: f.categoryName });

export default function Order() {
  const [cat, setCat] = useState("ทั้งหมด");
  const [sel, setSel] = useState<Food | null>(null);
  const { data: session } = useSession();
  const { add } = useCart();

  const addToCart = (f: Food) => (session ? add(toDish(f)) : signIn("google"));

  // กด Esc เพื่อปิดหน้าต่างรายละเอียด
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // มาจากหน้าแรก (/order?item=รหัสเมนู) ให้เปิดรายละเอียดเมนูนั้นทันที
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("item");
    const f = foods.find(x => String(x.id) === id);
    if (f) setSel(f);
  }, []);

  const cats = ["ทั้งหมด", ...Array.from(new Set(foods.map(f => f.categoryName)))];

  return (<>
    <h2>สั่งซื้ออาหาร</h2>
    <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
      {cats.map(c => <button key={c} className={"btn " + (c === cat ? "" : "ghost")} onClick={() => setCat(c)}>{c}</button>)}
    </div>

    <div className="grid">
      {foods.filter(f => cat === "ทั้งหมด" || f.categoryName === cat).map(f => (
        <div className="card clickable" key={f.id} onClick={() => setSel(f)}>
          <img className="food" src={f.image} alt={f.name} />
          <h4>{f.name}</h4>
          <div className="row">
            <span className="price">฿{f.price}</span>
            <button className="btn" onClick={e => { e.stopPropagation(); addToCart(f); }}>+ ใส่ตะกร้า</button>
          </div>
        </div>
      ))}
    </div>

    {sel && (
      <div className="overlay" onClick={() => setSel(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setSel(null)} aria-label="ปิด">✕</button>
          <img className="food" src={sel.image} alt={sel.name} />
          <h2 style={{ marginBottom: 2 }}>{sel.name}</h2>
          <div className="tags"><span>{sel.categoryName}</span></div>
          <h4>คุณค่าทางโภชนาการโดยประมาณ</h4>
          <div className="nutri">
            <div><b>{sel.calories}</b><span>พลังงาน (kcal)</span></div>
            <div><b>{sel.protein}</b><span>โปรตีน (g)</span></div>
            <div><b>{sel.carbs}</b><span>คาร์โบไฮเดรต (g)</span></div>
            <div><b>{sel.fat}</b><span>ไขมัน (g)</span></div>
          </div>
          <div className="row">
            <span className="price" style={{ fontSize: "1.4rem" }}>฿{sel.price}</span>
            <button className="btn" onClick={() => { addToCart(sel); setSel(null); }}>+ ใส่ตะกร้า</button>
          </div>
        </div>
      </div>
    )}
  </>);
}