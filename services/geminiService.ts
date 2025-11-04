
import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisResult, FoodItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Nazwa zidentyfikowanego produktu spożywczego po polsku.",
          },
          calories: {
            type: Type.NUMBER,
            description: "Szacowana liczba kalorii dla tego produktu.",
          },
        },
        required: ["name", "calories"],
      },
    },
    totalCalories: {
      type: Type.NUMBER,
      description: "Suma kalorii wszystkich zidentyfikowanych produktów.",
    },
  },
  required: ["items", "totalCalories"],
};


export const analyzeImageForCalories = async (
  base64ImageData: string,
  mimeType: string
): Promise<Omit<AnalysisResult, 'items'> & { items: Omit<FoodItem, 'id'>[] }> => {
  const prompt = `Jesteś ekspertem w dziedzinie żywienia. Proszę, zidentyfikuj jedzenie na tym zdjęciu. Podaj szacunkową liczbę kalorii dla każdego produktu oraz łączną sumę kalorii. Jeśli na zdjęciu nie ma jedzenia, zwróć pustą listę i 0 kalorii. Odpowiadaj wyłącznie w formacie JSON, zgodnie z dostarczonym schematem.`;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType,
                    },
                },
            ],
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });

    const jsonString = response.text;
    const parsedResult = JSON.parse(jsonString);
    return parsedResult;

  } catch (error) {
    console.error("Error calling Gemini API for calorie analysis:", error);
    throw new Error("Nie udało się przeanalizować obrazu. Model AI zwrócił błąd.");
  }
};

export const generateRecipeFromImage = async (
  base64ImageData: string,
  mimeType: string,
  ingredients: FoodItem[]
): Promise<string> => {
    const ingredientList = ingredients.map(item => item.name).join(', ');
    const prompt = `Jesteś asystentem przepisów platformy Cookidoo (oficjalna platforma z przepisami na Thermomix). Twoim zadaniem jest znalezienie w bazie danych Cookidoo prostego i smacznego przepisu na podstawie zdjęcia oraz listy zidentyfikowanych składników.

Zidentyfikowane składniki: ${ingredientList}.

Proszę, znajdź przepis, który będzie zawierał:
1.  **Tytuł:** Chwytliwa i apetyczna nazwa dania.
2.  **ID Przepisu Cookido:** Fikcyjny identyfikator w formacie 'CK-XXXXX'.
3.  **Czas przygotowania:** Szacowany czas, np. "25 min".
4.  **Opis:** Krótki, zachęcający opis (2-3 zdania).
5.  **Składniki:** Wypunktowana lista. Możesz dodać kilka podstawowych składników, których nie widać na zdjęciu, ale są niezbędne (np. oliwa z oliwek, sól, pieprz, woda).
6.  **Instrukcje:** Ponumerowana lista kroków do wykonania, jeśli to możliwe, dostosowana do urządzenia Thermomix.

Odpowiedź sformatuj w czytelny sposób, używając poniższych etykiet (w języku polskim, pogrubione):
**Tytuł:** ...
**ID Przepisu Cookido:** ...
**Czas przygotowania:** ...
**Opis:** ...
**Składniki:** ...
**Instrukcje:** ...
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType,
                        },
                    },
                ],
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API for recipe generation:", error);
        throw new Error("Nie udało się wyszukać przepisu. Model AI zwrócił błąd.");
    }
};
