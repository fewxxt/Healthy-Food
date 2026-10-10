"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useCart, type Dish } from "@/components/Providers";

type Detail = Dish & { nameEn: string; area: string; ingredients: { name: string; measure: string }[] };

export default function Order() {
  const [menu, setMenu] = useState<Dish[] | null>(null);
  const [cat, setCat] = useState("ทั้งหมด");
  const [sel, setSel] = useState<Dish | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const { data: session } = useSession();
  const { add } = useCart();

  const open = (m: Dish) => {
    setSel(m);
    setDetail(null);
    fetch(`/api/menu/${m.id}`).then(r => r.json()).then(setDetail).catch(() => {});
  };
  const addToCart = (m: Dish) => (session ? add(m) : signIn("google"));

  useEffect(() => { fetch("/api/menu").then(r => r.json()).then(setMenu).catch(() => setMenu([])); }, []);

  // กด Esc เพื่อปิดหน้าต่างรายละเอียด
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // มาจากหน้าแรก (/order?item=รหัสเมนู) ให้เปิดรายละเอียดเมนูนั้นทันที
  useEffect(() => {
    if (!menu) return;
    const id = new URLSearchParams(window.location.search).get("item");
    const m = menu.find(x => x.id === id);
    if (m) open(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  if (!menu) return <p>กำลังโหลดเมนู...</p>;

  const cats = ["ทั้งหมด", ...Array.from(new Set(menu.map(m => m.category ?? "")))];

  return (<>
    <h2>สั่งซื้ออาหาร</h2>
    <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
      {cats.map(c => <button key={c} className={"btn " + (c === cat ? "" : "ghost")} onClick={() => setCat(c)}>{c}</button>)}
    </div>

    <div className="grid">
      {menu.filter(m => cat === "ทั้งหมด" || m.category === cat).map(m => (
        <div className="card clickable" key={m.id} onClick={() => open(m)}>
          <img className="food" src={m.img} alt={m.name} />
          <h4>{m.name}</h4>
          <div className="row">
            <span className="price">฿{m.price}</span>
            <button className="btn" onClick={e => { e.stopPropagation(); addToCart(m); }}>+ ใส่ตะกร้า</button>
          </div>
        </div>
      ))}
    </div>

    {sel && (
      <div className="overlay" onClick={() => setSel(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setSel(null)} aria-label="ปิด">✕</button>
          <img className="food" src={sel.img} alt={sel.name} />
          <h2 style={{ marginBottom: 2 }}>{sel.name}</h2>
          {detail?.nameEn && <p className="muted" style={{ margin: 0 }}>{detail.nameEn}</p>}
          <div className="tags">
            {sel.category && <span>{sel.category}</span>}
            {detail?.area && <span>🌍 {detail.area}</span>}
          </div>
          <h4>ส่วนผสม</h4>
          {!detail ? <p className="muted">กำลังโหลด...</p> : (
            <ul className="ing">
              {detail.ingredients.map((x, i) => (
                <li key={i}><span>{x.name}</span><span className="muted">{x.measure}</span></li>
              ))}
            </ul>
          )}
          <div className="row">
            <span className="price" style={{ fontSize: "1.4rem" }}>฿{sel.price}</span>
            <button className="btn" onClick={() => { addToCart(sel); setSel(null); }}>+ ใส่ตะกร้า</button>
          </div>
        </div>
      </div>
    )}
  </>);
}