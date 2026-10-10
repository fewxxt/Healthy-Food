"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "./Providers";

export default function Navbar() {
  const { data: session } = useSession();
  const { count } = useCart();
  return (
    <nav className="nav">
      <Link href="/" className="logo">Healthy Food</Link>
      <div className="links">
        <Link href="/">หน้าแรก</Link>
        <Link href="/order">สั่งซื้อ</Link>
        <Link href="/coupons">โค้ดส่วนลด</Link>
        <Link href="/reviews">รีวิว</Link>
        <Link href="/cart">ตะกร้า{count > 0 && <b className="badge">{count}</b>}</Link>
        {session ? <Link href="/profile">โปรไฟล์</Link> : <Link href="/login">เข้าสู่ระบบ</Link>}
      </div>
    </nav>
  );
}
