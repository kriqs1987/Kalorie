
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImageForCalories, generateRecipeFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { AnalysisResult, HistoryItem } from './types';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import HistoryDisplay from './components/HistoryDisplay';
import RecipeDisplay from './components/RecipeDisplay';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState<boolean>(false);


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('calorieHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      localStorage.removeItem('calorieHistory');
    }
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setRecipe(null);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile || !imageUrl) {
      setError("Proszę najpierw wybrać zdjęcie.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setRecipe(null);

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await analyzeImageForCalories(base64, mimeType);
      setAnalysisResult(result);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        imageUrl: imageUrl,
        analysis: result,
        timestamp: new Date().toISOString(),
      };

      setHistory(prevHistory => {
          const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 5);
          localStorage.setItem('calorieHistory', JSON.stringify(updatedHistory));
          return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd podczas analizy obrazu. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imageUrl]);

  const handleGenerateRecipeClick = useCallback(async () => {
    if (!imageFile || !analysisResult || analysisResult.items.length === 0) {
        setError("Nie można wygenerować przepisu bez zidentyfikowanych składników.");
        return;
    }

    setIsGeneratingRecipe(true);
    setError(null);
    setRecipe(null);

    try {
        const { base64, mimeType } = await fileToBase64(imageFile);
        const generatedRecipe = await generateRecipeFromImage(base64, mimeType, analysisResult.items);
        setRecipe(generatedRecipe);
    } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas generowania przepisu. Spróbuj ponownie.");
    } finally {
        setIsGeneratingRecipe(false);
    }
  }, [imageFile, analysisResult]);
  
  const resetState = () => {
      setImageFile(null);
      setImageUrl(null);
      setAnalysisResult(null);
      setError(null);
      setIsLoading(false);
      setRecipe(null);
      setIsGeneratingRecipe(false);
  }

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calorieHistory');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-10">
            {!imageUrl && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-4">Prześlij zdjęcie swojego posiłku</h2>
                    <p className="text-slate-500 mb-6">Nasza sztuczna inteligencja przeanalizuje zdjęcie, oszacuje liczbę kalorii i zaproponuje przepis.</p>
                    <ImageUpload onImageSelect={handleImageSelect} disabled={isLoading} />
                </div>
            )}
            
            {imageUrl && (
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center">
                    <div className="w-full aspect-square rounded-xl overflow-hidden shadow-md border-4 border-slate-100 mb-4">
                        <img src={imageUrl} alt="Przesłany posiłek" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleAnalyzeClick} 
                            disabled={isLoading || isGeneratingRecipe}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center justify-center w-48"
                        >
                            {isLoading ? <Spinner /> : <><i className="fas fa-magic mr-2"></i> Analizuj</>}
                        </button>
                         <button 
                            onClick={resetState} 
                            disabled={isLoading || isGeneratingRecipe}
                            className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors"
                        >
                            <i className="fas fa-trash-alt mr-2"></i> Wyczyść
                        </button>
                    </div>
                </div>

                <div className="mt-8 md:mt-0 space-y-6">
                  {isLoading && (
                    <div className="text-center p-8 bg-slate-100 rounded-lg">
                      <Spinner color="text-indigo-600" />
                      <p className="mt-4 font-semibold text-slate-600">Analizowanie obrazu...</p>
                      <p className="text-sm text-slate-500">To może zająć chwilę.</p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                      <p className="font-bold">Błąd</p>
                      <p>{error}</p>
                    </div>
                  )}
                  {analysisResult && (
                    <>
                        <ResultsDisplay data={analysisResult} />
                        {!recipe && analysisResult.items.length > 0 && (
                            <div className="text-center">
                                <button
                                    onClick={handleGenerateRecipeClick}
                                    disabled={isGeneratingRecipe}
                                    className="bg-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-600 disabled:bg-amber-300 transition-colors flex items-center justify-center w-full"
                                >
                                    {isGeneratingRecipe ? <Spinner /> : <><i className="fas fa-utensils mr-2"></i> Wygeneruj przepis</>}
                                </button>
                            </div>
                        )}
                    </>
                  )}
                  {isGeneratingRecipe && (
                     <div className="text-center p-8 bg-slate-100 rounded-lg">
                      <Spinner color="text-indigo-600" />
                      <p className="mt-4 font-semibold text-slate-600">Tworzenie przepisu...</p>
                      <p className="text-sm text-slate-500">Nasz szef kuchni AI już działa!</p>
                    </div>
                  )}
                  {recipe && <RecipeDisplay recipe={recipe} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {history.length > 0 && (
            <div className="max-w-4xl mx-auto mt-8">
                <HistoryDisplay history={history} onClearHistory={clearHistory} />
            </div>
        )}

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Gemini AI. Pamiętaj, że wartości kalorii i przepisy są generowane przez AI.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
