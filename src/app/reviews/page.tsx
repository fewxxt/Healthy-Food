"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Stars from "@/components/Stars";
import { useReviews, Avatar, fmt } from "@/components/HomeReviews";
import { useDialog } from "@/components/Dialog";

export default function Reviews() {
  const { data: session } = useSession();
  const dialog = useDialog();
  const [reviews, setReviews] = useReviews();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = !!session?.user?.email && session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  console.log("admin check:", session?.user?.email, process.env.NEXT_PUBLIC_ADMIN_EMAIL, isAdmin);

  const submit = async () => {
    if (text.trim().length < 3) {
      await dialog.alert("กรุณาพิมพ์รีวิวอย่างน้อย 3 ตัวอักษร", { title: "ยังพิมพ์ไม่ครบ", kind: "error" });
      return;
    }
    setBusy(true);
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, text }) });
    const d = await res.json();
    setBusy(false);
    if (!d.ok) { await dialog.alert("ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { kind: "error" }); return; }
    setReviews([d.review, ...(reviews || [])]);
    setText("");
    await dialog.alert("ขอบคุณสำหรับรีวิวของคุณ", { title: "ส่งรีวิวแล้ว", kind: "success" });
  };

  const remove = async (id: string) => {
    if (!(await dialog.confirm("รีวิวนี้จะถูกลบถาวรและกู้คืนไม่ได้", { title: "ลบรีวิว?", okText: "ลบ" }))) return;
    const res = await fetch("/api/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) setReviews((reviews || []).filter(x => x.id !== id));
    else await dialog.alert("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { kind: "error" });
  };

  return (<>
    <h2>⭐ รีวิวจากลูกค้า</h2>
    <div className="card" style={{ marginBottom: 24 }}>
      {session ? (<>
        <b>เขียนรีวิวของคุณ</b>
        <div className="pick">{[1, 2, 3, 4, 5].map(n => <button key={n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)}>★</button>)}</div>
        <textarea rows={3} maxLength={300} placeholder="บอกเล่าประสบการณ์ของคุณ..." value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" disabled={busy} onClick={submit}>{busy ? "กำลังส่ง..." : "ส่งรีวิว"}</button>
      </>) : (
        <div className="row"><span>เข้าสู่ระบบเพื่อเขียนรีวิว</span><button className="btn" onClick={() => signIn("google")}>เข้าสู่ระบบด้วย Google</button></div>
      )}
    </div>

    {!reviews ? <p>กำลังโหลด...</p> : (
      <div className="list">{reviews.map(x => (
        <div className="card rv" key={x.id}><Avatar r={x} />
          <div>
            <div className="row" style={{ margin: 0 }}>
              <b>{x.name}</b>
              <span className="muted small">
                {fmt(x.date)}
                {isAdmin && !/^s\d$/.test(x.id) && (
                  <button className="btn ghost" style={{ marginLeft: 8, padding: "2px 10px" }} onClick={() => remove(x.id)}>ลบ</button>
                )}
              </span>
            </div>
            <Stars n={x.rating} /><p style={{ margin: "4px 0 0" }}>{x.text}</p>
          </div>
        </div>))}
      </div>)}
  </>);
}