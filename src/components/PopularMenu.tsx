"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Dish = { id: string; name: string; img: string; price: number; category: string };

export default function PopularMenu() {
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  useEffect(() => {
    fetch("/api/menu").then(r => r.json())
      .then((d: Dish[]) => setDishes([0, 6, 12, 3].map(i => d[i]).filter(Boolean)))
      .catch(() => setDishes([]));
  }, []);
  if (!dishes) return <div className="grid">{[1, 2, 3, 4].map(i => <div key={i} className="card skeleton" />)}</div>;
  return (
    <div className="grid">
      {dishes.map((x, i) => (
        <Link href="/order" key={x.id} className="card dish">
          <span className="tag">🔥 อันดับ {i + 1}</span>
          <img className="food" src={x.img} alt={x.name} />
          <h4>{x.name}</h4>
          <div className="row"><span className="price">฿{x.price}</span><span className="muted">สั่งเลย →</span></div>
        </Link>
      ))}
    </div>
  );
}
