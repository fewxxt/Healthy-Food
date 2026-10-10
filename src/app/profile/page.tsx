"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useDialog } from "@/components/Dialog";

type Info = { address: string; phone: string };

export default function Profile() {
  const { data: session } = useSession();
  const dialog = useDialog();
  const [f, setF] = useState<Info>({ address: "", phone: "" });
  const [ok, setOk] = useState(false);

  useEffect(() => { try { setF(JSON.parse(localStorage.getItem("profile") || '{"address":"","phone":""}')); } catch { } }, []);
  if (!session) return <p>กำลังโหลด...</p>;

  const save = () => {
    if (!/^0\d{8,9}$/.test(f.phone)) {
      dialog.alert("กรุณากรอกเบอร์โทร 9-10 หลัก ขึ้นต้นด้วย 0", { title: "เบอร์โทรไม่ถูกต้อง", kind: "error" });
      return;
    }
    localStorage.setItem("profile", JSON.stringify(f));
    setOk(true);
    dialog.alert("บันทึกข้อมูลจัดส่งเรียบร้อยแล้ว", { title: "บันทึกแล้ว", kind: "success" });
  };

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="center">
        {session.user?.image && <img className="avatar" src={session.user.image} alt="" referrerPolicy="no-referrer" />}
        <h2>{session.user?.name}</h2><p>{session.user?.email}</p>
      </div>
      <label>ที่อยู่จัดส่ง</label>
      <textarea rows={3} value={f.address} onChange={e => { setOk(false); setF({ ...f, address: e.target.value }); }} />
      <label>เบอร์โทรศัพท์</label>
      <input inputMode="numeric" maxLength={10} value={f.phone} onChange={e => { setOk(false); setF({ ...f, phone: e.target.value.replace(/\D/g, "") }); }} />
      <div className="row">
        <button className="btn" onClick={save}>บันทึก</button>
        <button className="btn ghost" onClick={() => signOut({ callbackUrl: "/" })}>ออกจากระบบ</button>
      </div>
      {ok && <p className="price">✓ บันทึกแล้ว</p>}
    </div>
  );
}
