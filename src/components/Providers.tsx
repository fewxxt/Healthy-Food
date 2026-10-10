"use client";
import DialogProvider from "./Dialog";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

export type Dish = { id: string; name: string; img: string; price: number; category?: string };
export type CartItem = Dish & { qty: number };
type Coupon = { label: string; calc: (subtotal: number) => number; freeShip?: boolean };

export const COUPONS: Record<string, Coupon> = {
  HEALTHY10: { label: "ลด 10%", calc: s => s * 0.1 },
  WELCOME50: { label: "ลด 50 บาท (ขั้นต่ำ 200)", calc: s => (s >= 200 ? 50 : 0) },
  FREESHIP: { label: "ส่งฟรี", calc: () => 0, freeShip: true },
};

type CartCtx = {
  items: CartItem[]; add: (m: Dish) => void; setQty: (id: string, q: number) => void; clear: () => void;
  coupon: string; setCoupon: (c: string) => void;
  subtotal: number; discount: number; delivery: number; total: number; count: number;
};
const Ctx = createContext<CartCtx | null>(null);
export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <Providers>");
  return v;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("cart") || "[]")); setCoupon(localStorage.getItem("coupon") || ""); } catch { }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) { localStorage.setItem("cart", JSON.stringify(items)); localStorage.setItem("coupon", coupon); }
  }, [items, coupon, ready]);

  const add = (m: Dish) => setItems(p => p.find(i => i.id === m.id) ? p.map(i => i.id === m.id ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...m, qty: 1 }]);
  const setQty = (id: string, q: number) => setItems(p => p.map(i => i.id === id ? { ...i, qty: q } : i).filter(i => i.qty > 0));
  const clear = () => { setItems([]); setCoupon(""); };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const c = COUPONS[coupon];
  const discount = c ? Math.round(c.calc(subtotal)) : 0;
  const delivery = !items.length || subtotal >= 300 || c?.freeShip ? 0 : 30;
  const total = Math.max(0, subtotal - discount + delivery);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <SessionProvider>
      <DialogProvider>
        <Ctx.Provider value={{ items, add, setQty, clear, coupon, setCoupon, subtotal, discount, delivery, total, count }}>
          {children}
        </Ctx.Provider>
      </DialogProvider>
    </SessionProvider>
  );
}
