"use client";
import { useRouter } from "next/navigation";
import { useCart, COUPONS } from "@/components/Providers";

export default function Coupons() {
  const { setCoupon, coupon } = useCart();
  const router = useRouter();
  return (<>
    <h2>โค้ดส่วนลด</h2>
    {Object.entries(COUPONS).map(([code, v]) => (
      <div className="card row" key={code} style={{ marginBottom: 12 }}>
        <div><b>{code}</b><div>{v.label}</div></div>
        <button className="btn" onClick={() => {
          setCoupon(code);
          router.push("/cart");
        }}>{coupon === code ? "ใช้อยู่" : "ใช้โค้ดนี้"}
        </button>
      </div>
    ))}
  </>);
}
