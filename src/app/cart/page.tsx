"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, COUPONS } from "@/components/Providers";
import { useDialog } from "@/components/Dialog";

const PAY: [string, string][] = [["promptpay", "📱 พร้อมเพย์ / QR"], ["card", "💳 บัตรเครดิต/เดบิต"], ["cod", "💵 เก็บเงินปลายทาง"]];

type Card = { number: string; name: string; exp: string; cvv: string };

const luhn = (d: string) => {
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
};
const expOk = (e: string) => {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(e);
  return !!m && new Date(2000 + Number(m[2]), Number(m[1]), 1) > new Date();
};

export default function Cart() {
  const c = useCart();
  const router = useRouter();
  const dialog = useDialog();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pay, setPay] = useState("promptpay");
  const [prof, setProf] = useState<{ address?: string; phone?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [card, setCard] = useState<Card>({ number: "", name: "", exp: "", cvv: "" });
  const [open, setOpen] = useState(false);   // ป๊อปอัพเลือกโค้ด
  const [pick, setPick] = useState("");      // โค้ดที่เลือกไว้ชั่วคราวในป๊อปอัพ

  useEffect(() => { try { setProf(JSON.parse(localStorage.getItem("profile") || "{}")); } catch { } }, []);

  if (!c.items.length && !done) return (
    <div className="center"><h2>ตะกร้าว่างเปล่า</h2><Link className="btn" href="/order">ไปเลือกอาหาร</Link></div>
  );

  const digits = card.number.replace(/\D/g, "");
  const cardValid = digits.length >= 13 && luhn(digits) && card.name.trim().length >= 2 && expOk(card.exp) && /^\d{3,4}$/.test(card.cvv);

  // ป้ายโค้ดที่ใช้อยู่ แสดงในแถวโค้ดส่วนลด
  const applied = COUPONS[c.coupon];
  const tags: { text: string; kind: "red" | "green" }[] = [];
  if (applied) {
    if (c.discount > 0) tags.push({ text: `-฿${c.discount}`, kind: "red" });
    if (applied.freeShip) tags.push({ text: "ส่งฟรี", kind: "green" });
    if (!tags.length) tags.push({ text: c.coupon, kind: "red" });
  }

  const canUse = (code: string) => {
    const cp = COUPONS[code];
    return !!cp && (!!cp.freeShip || cp.calc(c.subtotal) > 0);
  };
  const openCoupons = () => { setPick(c.coupon); setOpen(true); };
  const confirmCoupon = () => { c.setCoupon(pick); setOpen(false); };

  // ตรวจที่อยู่ก่อนไปขั้นเลือกวิธีชำระเงิน
  const goPayment = async () => {
    if (!prof.address?.trim() || !prof.phone?.trim()) {
      const goProfile = await dialog.confirm(
        "กรุณากรอกที่อยู่และเบอร์โทรศัพท์สำหรับจัดส่งก่อนเลือกวิธีชำระเงิน",
        { title: "ยังไม่ได้กรอกที่อยู่จัดส่ง", okText: "ไปกรอกที่อยู่", cancelText: "ไว้ทีหลัง" }
      );
      if (goProfile) router.push("/profile");
      return;
    }
    setStep(2);
  };

  // ส่งออเดอร์ (ไม่ส่งข้อมูลบัตรไปเซิร์ฟเวอร์ ส่งแค่ 4 หลักท้าย)
  const submitOrder = async () => {
    if (!prof.address || !prof.phone) {
      if (await dialog.confirm("กรุณากรอกที่อยู่และเบอร์โทรในหน้าโปรไฟล์ก่อนสั่งซื้อ", { title: "ข้อมูลจัดส่งไม่ครบ", okText: "ไปหน้าโปรไฟล์" })) router.push("/profile");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: c.items, total: c.total, pay, cardLast4: pay === "card" ? digits.slice(-4) : undefined, ...prof }),
    });
    const d = await res.json();
    setBusy(false);
    if (!d.ok) { await dialog.alert("สั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { kind: "error" }); return; }
    sessionStorage.setItem("lastOrder", JSON.stringify({ id: d.orderId, total: c.total, pay }));
    setDone(true);
    c.clear();
    router.push("/success");
  };

  return (<>
    <div className="steps">
      <span className={step === 1 ? "on" : ""}>1 สรุปรายการ</span>
      <span className={step === 2 ? "on" : ""}>2 วิธีชำระเงิน</span>
      <span className={step === 3 ? "on" : ""}>3 ยืนยัน</span>
    </div>

    {step === 1 && (<>
      <div className="card">
        {c.items.map(i => (
          <div className="cart-row" key={i.id}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <img src={i.img} width={56} height={56} style={{ borderRadius: 8, objectFit: "cover" }} alt="" />{i.name}
            </div>
            <div className="qty">
              <button onClick={() => c.setQty(i.id, i.qty - 1)}>−</button> {i.qty} <button onClick={() => c.setQty(i.id, i.qty + 1)}>+</button>
            </div>
            <b>฿{i.price * i.qty}</b>
          </div>
        ))}
      </div>

      <button className="voucher-row" onClick={openCoupons}>
        <span className="v-title">โค้ดส่วนลด</span>
        <span className="v-tags">
          {tags.length ? tags.map(t => <span key={t.text} className={"vtag " + t.kind}>{t.text}</span>) : <span className="muted">เลือกหรือเก็บโค้ด</span>}
          <span className="chev">›</span>
        </span>
      </button>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row"><span>ยอดอาหาร</span><span>฿{c.subtotal}</span></div>
        <div className="row"><span>ส่วนลด</span><span>-฿{c.discount}</span></div>
        <div className="row"><span>ค่าส่ง</span><span>{c.delivery ? "฿" + c.delivery : "ฟรี"}</span></div>
        <div className="row"><b>รวมทั้งหมด</b><b className="price">฿{c.total}</b></div>
      </div>

      <p style={{ marginTop: 12 }}>
        📍 {prof.address || <span className="err">ยังไม่มีที่อยู่</span>} · 📞 {prof.phone || <span className="err">ยังไม่มีเบอร์โทร</span>}{" "}
        <Link href="/profile" className="price">แก้ไข</Link>
      </p>
      <button className="btn" onClick={goPayment}>เลือกวิธีชำระเงิน →</button>
    </>)}

    {step === 2 && (<>
      {PAY.map(([k, l]) => (
        <label key={k} className={"pay " + (pay === k ? "sel" : "")}>
          <input type="radio" style={{ width: "auto", margin: "0 8px 0 0" }} checked={pay === k} onChange={() => setPay(k)} />{l}
        </label>
      ))}

      {pay === "card" && (
        <div className="card cardform">
          <label>หมายเลขบัตร</label>
          <input inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.number}
            onChange={e => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
          <label>ชื่อบนบัตร</label>
          <input autoComplete="cc-name" placeholder="SOMCHAI JAIDEE" value={card.name}
            onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} />
          <div className="two">
            <div><label>วันหมดอายุ</label>
              <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.exp}
                onChange={e => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCard({ ...card, exp: d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d }); }} /></div>
            <div><label>CVV</label>
              <input inputMode="numeric" autoComplete="cc-csc" type="password" maxLength={4} placeholder="•••" value={card.cvv}
                onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></div>
          </div>
          {digits.length >= 13 && !luhn(digits) && <p className="err">หมายเลขบัตรไม่ถูกต้อง</p>}
          {card.exp.length === 5 && !expOk(card.exp) && <p className="err">บัตรหมดอายุหรือวันที่ไม่ถูกต้อง</p>}
        </div>
      )}

      <div className="row">
        <button className="btn ghost" onClick={() => setStep(1)}>← กลับ</button>
        {pay === "promptpay" && <button className="btn" onClick={() => setStep(3)}>ถัดไป: แสดง QR →</button>}
        {pay === "card" && <button className="btn" disabled={busy || !cardValid} onClick={submitOrder}>{busy ? "กำลังดำเนินการ..." : `ชำระเงิน ฿${c.total}`}</button>}
        {pay === "cod" && <button className="btn" disabled={busy} onClick={submitOrder}>{busy ? "กำลังดำเนินการ..." : `ยืนยันสั่งซื้อ ฿${c.total}`}</button>}
      </div>
    </>)}

    {step === 3 && (
      <div className="card center qrbox">
        <h3>สแกน QR เพื่อชำระเงินผ่านพร้อมเพย์</h3>
        <img src="/qr.png" alt="QR ชำระเงิน" width={240} style={{ borderRadius: 12, margin: "12px 0" }} />
        <p className="price">กรุณาโอนยอด ฿{c.total.toFixed(2)} และเก็บสลิปไว้</p>
        <p>เปิดแอปธนาคาร → สแกน QR → ตรวจสอบยอดเงิน แล้วกดยืนยันด้านล่างหลังโอนเสร็จ</p>
        <div className="row">
          <button className="btn ghost" onClick={() => setStep(2)}>← กลับ</button>
          <button className="btn" disabled={busy} onClick={submitOrder}>{busy ? "กำลังดำเนินการ..." : "ฉันชำระเงินแล้ว ยืนยัน"}</button>
        </div>
      </div>
    )}

    {open && (
      <div className="overlay" onClick={() => setOpen(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setOpen(false)} aria-label="ปิด">✕</button>
          <h3>เลือกโค้ดส่วนลด</h3>
          {c.collected.length === 0 ? (
            <p className="muted">ยังไม่มีโค้ดที่เก็บไว้ <Link href="/coupons" className="price">ไปเก็บโค้ด</Link></p>
          ) : (<>
            <div className="vlist">
              {c.collected.map(code => {
                const cp = COUPONS[code];
                if (!cp) return null;
                const ok = canUse(code);
                return (
                  <button key={code} disabled={!ok} className={"vitem " + (pick === code ? "on" : "")} onClick={() => setPick(pick === code ? "" : code)}>
                    <div>
                      <b>{code}</b>
                      <div>{cp.label}</div>
                      <small>{ok ? (cp.freeShip ? "ส่งฟรี" : `ประหยัด ฿${Math.round(cp.calc(c.subtotal))}`) : "ยังไม่ถึงเงื่อนไขขั้นต่ำ"}</small>
                    </div>
                    <span className="radio" />
                  </button>
                );
              })}
            </div>
            <button className="btn" style={{ width: "100%" }} onClick={confirmCoupon}>ยืนยันการใช้โค้ด</button>
          </>)}
        </div>
      </div>
    )}
  </>);
}