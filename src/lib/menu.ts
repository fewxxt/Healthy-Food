// ราคา (สมมติ) คำนวณจากรหัสเมนู
export const priceOf = (id: string) => 80 + (Number(id) % 8) * 10;

// ถ้าชื่อที่แปลอัตโนมัติไม่ถูกใจ ใส่ชื่อไทยเองได้ที่นี่ เช่น "52772": "ไก่เทอริยากิ"
export const TH_OVERRIDE: Record<string, string> = {};

export async function toThai(text: string): Promise<string> {
  if (!text) return text;
  try {
    const r = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th`,
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    );
    const d = (await r.json()) as { responseData?: { translatedText?: string } };
    const t = d.responseData?.translatedText;
    return t && !t.toUpperCase().includes("MYMEMORY WARNING") ? t : text; // แปลไม่ได้ ใช้ชื่ออังกฤษแทน
  } catch {
    return text;
  }
}