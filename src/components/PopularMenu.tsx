import Link from "next/link";
import { foods } from "@/lib/foods";

const POPULAR_IDS = [21, 22, 24, 13];

export default function PopularMenu() {
  const items = POPULAR_IDS.flatMap(id => foods.filter(f => f.id === id));
  return (
    <div className="grid">
      {items.map((x, i) => (
        <Link href={`/order?item=${x.id}`} key={x.id} className="card dish">
          <span className="tag">อันดับ {i + 1}</span>
          <img className="food" src={x.image} alt={x.name} />
          <h4>{x.name}</h4>
          <div className="row"><span className="price">฿{x.price}</span><span className="muted">สั่งเลย →</span></div>
        </Link>
      ))}
    </div>
  );
}