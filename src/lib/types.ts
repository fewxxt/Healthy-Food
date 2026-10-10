export type Food = {
  id: number;
  name: string;
  image: string;
  category: "fruit" | "drink" | "food";
  categoryName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
};