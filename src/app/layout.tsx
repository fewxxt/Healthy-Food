/* ไม่ใช่ error แต่เป็น vscode เวอร์ชันใหม่*/
import "./globals.css"; 
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { error } from "console";

export const metadata: Metadata = { title: "HealthyBite - อาหารสุขภาพ", description: "สั่งอาหารสุขภาพออนไลน์" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th"><body>
      <Providers><Navbar /><main className="wrap">{children}</main></Providers>
    </body></html>
  );
}