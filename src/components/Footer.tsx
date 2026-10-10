import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="foot-in">

        <div><div className="logo">Healthy Food</div>
        <p>อาหารสุขภาพสดใหม่ ส่งตรงถึงบ้านคุณ</p></div>

        <div><h4>เมนูลัด</h4>
        <Link href="/order">สั่งซื้อ</Link>
        <Link href="/coupons">โค้ดส่วนลด</Link>
        <Link href="/reviews">รีวิว</Link></div>

        <div><h4>ติดต่อเรา</h4>
        <span>📞 09-485-9999</span>
        <span>✉️ food@healthyfood.th</span>
        <span>🕘 ทุกวัน 06:30 – 19:30</span></div>
      </div>
      <div className="copy">© {new Date().getFullYear()} Healthy Food. All rights reserved.</div>
    </footer>
  );
}
