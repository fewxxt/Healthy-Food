import { NextResponse } from "next/server";
import { priceOf, toThai, TH_OVERRIDE } from "@/lib/menu";

type Meal = { idMeal: string; strMeal: string; strMealThumb: string };
const CATS: [string, string][] = [["Vegetarian", "สลัด/มังสวิรัติ"], ["Seafood", "อาหารทะเล"], ["Chicken", "ไก่"]];

export async function GET() {
  const all = await Promise.all(CATS.map(async ([c, label]) => {
    const r = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${c}`, { next: { revalidate: 3600 } });
    const d = (await r.json()) as { meals: Meal[] | null };
    return Promise.all((d.meals || []).slice(0, 6).map(async m => ({
      id: m.idMeal,
      name: TH_OVERRIDE[m.idMeal] ?? (await toThai(m.strMeal)),
      img: m.strMealThumb,
      category: label,
      price: priceOf(m.idMeal),
    })));
  }));
  return NextResponse.json(all.flat());
}