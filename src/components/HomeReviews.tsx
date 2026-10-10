"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Stars from "./Stars";

export type Review = { id: string; name: string; image?: string | null; rating: number; text: string; date: string };

export const fmt = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export function useReviews() {
  const [r, setR] = useState<Review[] | null>(null);
  useEffect(() => {
    fetch("/api/reviews", { cache: "no-store" }).then(x => x.json()).then(setR).catch(() => setR([]));
  }, []);
  return [r, setR] as const;
}

export function Avatar({ r }: { r: Review }) {
  return r.image
    ? <img className="mini" src={r.image} alt="" referrerPolicy="no-referrer" />
    : <span className="mini ph">{r.name?.[0]}</span>;
}

export function CustomerReviews() {
  const [r] = useReviews();
  if (!r) return <p className="muted">กำลังโหลด...</p>;
  const avg = r.length ? (r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1) : "-";
  const top = r.filter(x => x.rating >= 4).slice(0, 3);
  return (<>
    <div className="summary"><b>{avg}</b><div><Stars n={Math.round(Number(avg)) || 0} /><div className="muted">จาก {r.length} รีวิว</div></div></div>
    <div className="grid">{top.map(x => (
      <div className="card quote" key={x.id}><Stars n={x.rating} /><p>“{x.text}”</p><div className="who"><Avatar r={x} /><b>{x.name}</b></div></div>
    ))}</div>
  </>);
}

export function LatestReviews() {
  const [r] = useReviews();
  if (!r) return null;
  return (<>
    <div className="list">{r.slice(0, 4).map(x => (
      <div className="card rv" key={x.id}><Avatar r={x} />
        <div>
          <div className="row" style={{ margin: 0 }}><b>{x.name}</b><span className="muted small">{fmt(x.date)}</span></div>
          <Stars n={x.rating} /><p style={{ margin: "4px 0 0" }}>{x.text}</p>
        </div>
      </div>
    ))}</div>
    <p className="center"><Link href="/reviews" className="btn ghost">ดูทั้งหมด / เขียนรีวิว</Link></p>
  </>);
}
