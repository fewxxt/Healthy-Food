"use client";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="card center" style={{ maxWidth: 420, margin: "40px auto", padding: 32 }}>
      <h2>เข้าสู่ระบบ</h2>
      <p>ต้องเข้าสู่ระบบก่อนจึงจะสั่งอาหารได้</p>
      <button className="btn" onClick={() => signIn("google", { callbackUrl: "/order" })}>เข้าสู่ระบบด้วย Google</button>
    </div>
  );
}
