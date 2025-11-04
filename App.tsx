
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImageForCalories, generateRecipeFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { AnalysisResult, DiaryEntry, FoodItem } from './types';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import RecipeDisplay from './components/RecipeDisplay';
import Tabs from './components/Tabs';
import DiaryView from './components/DiaryView';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'add' | 'diary'>('add');
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [mealName, setMealName] = useState<string>('');

  useEffect(() => {
    try {
      const storedDiary = localStorage.getItem('foodDiary');
      if (storedDiary) {
        setDiary(JSON.parse(storedDiary));
      }
    } catch (error) {
      console.error("Failed to load diary from localStorage", error);
      localStorage.removeItem('foodDiary');
    }
  }, []);

  const saveDiary = (updatedDiary: DiaryEntry[]) => {
    setDiary(updatedDiary);
    try {
      localStorage.setItem('foodDiary', JSON.stringify(updatedDiary));
    } catch (storageError) {
      console.error("Failed to save diary to localStorage", storageError);
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setRecipe(null);
    setShowCamera(false);
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
    setMealName('');

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await analyzeImageForCalories(base64, mimeType);
      
      // Add unique IDs to each food item for future editing
      const itemsWithIds: FoodItem[] = result.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      }));

      setAnalysisResult({ ...result, items: itemsWithIds });
    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd podczas analizy obrazu. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imageUrl]);

  const handleGenerateRecipeClick = useCallback(async () => {
    if (!imageFile || !analysisResult || analysisResult.items.length === 0) {
      setError("Nie można wyszukać przepisu bez zidentyfikowanych składników.");
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
      setError("Wystąpił błąd podczas wyszukiwania przepisu. Spróbuj ponownie.");
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
    setMealName('');
    setShowCamera(false);
  };

  const handleAddToDiary = () => {
    if (!analysisResult) return;

    const itemsWithDefaults: FoodItem[] = analysisResult.items.map(item => ({
      ...item,
      quantity: item.quantity || 100,
      unit: item.unit || 'g',
    }));

    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      mealName: mealName || "Posiłek",
      date: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || undefined,
      items: itemsWithDefaults,
      totalCalories: analysisResult.totalCalories,
    };

    saveDiary([newEntry, ...diary]);
    resetState();
    setActiveTab('diary'); // Switch to diary view after adding
  };
  
  const handleUpdateEntry = (updatedEntry: DiaryEntry) => {
    const updatedDiary = diary.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
    saveDiary(updatedDiary);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedDiary = diary.filter(entry => entry.id !== id);
    saveDiary(updatedDiary);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };
  
  const renderAddMealView = () => (
    <>
      {!imageUrl ? (
        showCamera ? (
          <CameraCapture onImageCapture={handleImageSelect} onCancel={handleCameraCancel} />
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Prześlij zdjęcie swojego posiłku</h2>
            <p className="text-slate-500 mb-6">Nasza sztuczna inteligencja przeanalizuje zdjęcie, oszacuje liczbę kalorii i pozwoli dodać posiłek do Twojego dziennika.</p>
            <ImageUpload onImageSelect={handleImageSelect} disabled={isLoading} />
            <div className="my-6 flex items-center text-slate-400">
              <hr className="flex-grow border-t" />
              <span className="px-4 font-semibold">LUB</span>
              <hr className="flex-grow border-t" />
            </div>
            <button
              onClick={() => setShowCamera(true)}
              disabled={isLoading}
              className="w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-camera mr-3"></i> Użyj aparatu
            </button>
          </div>
        )
      ) : (
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
                <div className="space-y-4">
                  <div>
                      <label htmlFor="mealName" className="block text-sm font-medium text-slate-700 mb-1">Nazwa posiłku (opcjonalnie)</label>
                      <input 
                        type="text"
                        id="mealName"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        placeholder="np. Śniadanie, Obiad"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                  </div>
                  <button
                    onClick={handleAddToDiary}
                    disabled={isGeneratingRecipe}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors flex items-center justify-center"
                  >
                    <i className="fas fa-book-medical mr-2"></i> Dodaj do dziennika
                  </button>
                  {!recipe && analysisResult.items.length > 0 && (
                      <button
                        onClick={handleGenerateRecipeClick}
                        disabled={isGeneratingRecipe}
                        className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center justify-center w-full"
                      >
                        {isGeneratingRecipe ? <Spinner /> : <><i className="fas fa-search mr-2"></i> Szukaj na Cookido</>}
                      </button>
                  )}
                </div>
              </>
            )}
            {isGeneratingRecipe && (
              <div className="text-center p-8 bg-slate-100 rounded-lg">
                <Spinner color="text-indigo-600" />
                <p className="mt-4 font-semibold text-slate-600">Szukanie przepisu na Cookido...</p>
                <p className="text-sm text-slate-500">To może zająć chwilę.</p>
              </div>
            )}
            {recipe && <RecipeDisplay recipe={recipe} />}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-6 md:p-10">
            {activeTab === 'add' ? renderAddMealView() : <DiaryView entries={diary} onUpdate={handleUpdateEntry} onDelete={handleDeleteEntry} />}
          </div>
        </div>

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Gemini AI. Pamiętaj, że wartości kalorii i przepisy są generowane przez AI.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;