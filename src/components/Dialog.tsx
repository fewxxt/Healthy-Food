"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type Kind = "info" | "success" | "error" | "confirm";
type State = { kind: Kind; title?: string; message: string; okText?: string; cancelText?: string } | null;
type Api = {
  alert: (message: string, opts?: { title?: string; kind?: "info" | "success" | "error"; okText?: string }) => Promise<void>;
  confirm: (message: string, opts?: { title?: string; okText?: string; cancelText?: string }) => Promise<boolean>;
};

const ICON: Record<Kind, string> = { info: "ℹ️", success: "✅", error: "⚠️", confirm: "❓" };
const TITLE: Record<Kind, string> = { info: "แจ้งเตือน", success: "สำเร็จ", error: "เกิดข้อผิดพลาด", confirm: "ยืนยันการทำรายการ" };

const Ctx = createContext<Api | null>(null);
export function useDialog(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDialog must be used inside <DialogProvider>");
  return v;
}

export default function DialogProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>(null);
  const resolver = useRef<((v: boolean) => void) | undefined>(undefined);

  const open = useCallback((st: NonNullable<State>) => new Promise<boolean>(res => { resolver.current = res; setS(st); }), []);
  const close = (v: boolean) => { resolver.current?.(v); resolver.current = undefined; setS(null); };

  const api = useMemo<Api>(() => ({
    alert: async (message, o) => { await open({ kind: o?.kind ?? "info", message, title: o?.title, okText: o?.okText }); },
    confirm: (message, o) => open({ kind: "confirm", message, ...o }),
  }), [open]);

  useEffect(() => {
    if (!s) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Ctx.Provider value={api}>
      {children}
      {s && (
        <div className="dlg-overlay" onClick={() => close(false)}>
          <div className="dlg" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className={"dlg-icon " + s.kind}>{ICON[s.kind]}</div>
            <h3>{s.title ?? TITLE[s.kind]}</h3>
            <p>{s.message}</p>
            <div className="dlg-actions">
              {s.kind === "confirm" && <button className="btn ghost" onClick={() => close(false)}>{s.cancelText ?? "ยกเลิก"}</button>}
              <button className="btn" autoFocus onClick={() => close(true)}>{s.okText ?? "ตกลง"}</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}