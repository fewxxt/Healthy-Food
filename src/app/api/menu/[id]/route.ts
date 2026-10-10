import { NextResponse } from "next/server";
import { priceOf, toThai, TH_OVERRIDE } from "@/lib/menu";

const CAT_TH: Record<string, string> = { Vegetarian: "สลัด/มังสวิรัติ", Seafood: "อาหารทะเล", Chicken: "ไก่" };

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(params.id)}`, { next: { revalidate: 3600 } });
  const d = (await r.json()) as { meals: Record<string, string | null>[] | null };
  const m = d.meals?.[0];
  if (!m) return NextResponse.json({ error: "not found" }, { status: 404 });

  const raw = Array.from({ length: 20 }, (_, i) => ({
    name: (m[`strIngredient${i + 1}`] || "").trim(),
    measure: (m[`strMeasure${i + 1}`] || "").trim(),
  })).filter(x => x.name);
  const ingredients = await Promise.all(raw.map(async x => ({ name: await toThai(x.name), measure: x.measure })));

  return NextResponse.json({
    id: params.id,
    name: TH_OVERRIDE[params.id] ?? (await toThai(m.strMeal ?? "")),
    nameEn: m.strMeal,
    img: m.strMealThumb,
    price: priceOf(params.id),
    category: CAT_TH[m.strCategory ?? ""] ?? m.strCategory,
    area: await toThai(m.strArea ?? ""),
    ingredients,
  });
}