import Link from "next/link";
import PopularMenu from "@/components/PopularMenu";
import { CustomerReviews, LatestReviews } from "@/components/HomeReviews";
import Footer from "@/components/Footer";

const PROMOS: [string, string][] = [
  ["ม.ค.", "ปีใหม่สุขภาพดี ลด 15% ทุกเมนูสลัด"], 
  ["ก.พ.", "Valentine Set คู่รักรักสุขภาพ ลด 14%"], 
  ["มี.ค.", "ซื้อ 2 แถม 1 เมนูไก่"],
  ["เม.ย.", "สงกรานต์ ส่งฟรีทั่วเชียงใหม่"], 
  ["พ.ค.", "เมนูคลีนลด 10%"], 
  ["มิ.ย.", "ซื้อครบ 300 บาท ลด 50 บาท"],
  ["ก.ค.", "อาหารทะเลลด 15%"], 
  ["ส.ค.", "วันแม่ ลด 12% ทุกเมนู"], 
  ["ก.ย.", "ซื้อ 3 จาน ลด 50 บาท"],
  ["ต.ค.", "Healthy October ลด 10% (โค้ด HEALTHY10)"], 
  ["พ.ย.", "Black Friday ลด 25%"], 
  ["ธ.ค.", "ส่งท้ายปี ซื้อ 2 จานขึ้นไปส่งฟรี"],
];

export default function Home() {
  const m = new Date().getMonth();
  return (<>
    <section className="hero">
      <span className="pill">Fresh · Clean · Delivered</span>
      <h1>อาหารเพื่อสุขภาพ อร่อย สะอาด
        <br />ส่งตรงถึงบ้าน</h1>
      <p>เลือกเมนูคลีน สลัด อาหารทะเล และอื่นๆ ปรุงสดใหม่ทุกวัน</p>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <Link href="/order" className="btn">สั่งเลย →</Link>
        <Link href="/coupons" className="btn ghost">ดูโค้ดส่วนลด</Link>
      </div>
    </section>

    <section className="sec">
      <h2>โปรโมชั่นประจำเดือนนี้ ({PROMOS[m][0]})</h2>
      <div className="promo"><h3 style={{ margin: 0 }}>{PROMOS[m][1]}</h3></div>
      <h3>โปรโมชั่นตลอดปี</h3>
      <div className="grid">{PROMOS.map(([mo, t], i) => (
        <div key={mo} className="card" style={i === m ? { borderColor: "var(--accent)", background: "var(--accent-soft)" } : undefined}>
          <b>{mo}</b><p style={{ margin: 0 }}>{t}</p>
        </div>))}
      </div>
    </section>

    <section className="sec"><h2>เมนูยอดฮิต</h2><PopularMenu /></section>
    <section className="sec"><h2>รีวิวจากลูกค้า</h2><CustomerReviews /></section>
    <section className="sec"><h2>รีวิวล่าสุด</h2><LatestReviews /></section>
    
    {/* ส่วนท้ายของหน้าเว็บ */}
    <Footer />
  </>);
}
