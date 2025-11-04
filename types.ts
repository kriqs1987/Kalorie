
export interface FoodItem {
  name: string;
  calories: number;
}

export interface AnalysisResult {
  items: FoodItem[];
  totalCalories: number;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  analysis: AnalysisResult;
  timestamp: string;
}
