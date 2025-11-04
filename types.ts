
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  quantity?: number;
  unit?: 'g' | 'szt' | 'ml';
}

export interface AnalysisResult {
  items: FoodItem[];
  totalCalories: number;
}

export interface DiaryEntry {
  id: string;
  mealName: string;
  date: string; // YYYY-MM-DD
  imageUrl?: string;
  items: FoodItem[];
  totalCalories: number;
}