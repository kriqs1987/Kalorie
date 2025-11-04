
import React, { useMemo } from 'react';

interface RecipeDisplayProps {
  recipe: string;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
  const parsedRecipe = useMemo(() => {
    const lines = recipe.split('\n').filter(line => line.trim() !== '');
    
    const recipeData = {
      title: '',
      description: '',
      ingredients: [] as string[],
      instructions: [] as string[],
    };

    let currentSection: 'title' | 'description' | 'ingredients' | 'instructions' | null = null;

    for (const line of lines) {
        if (line.startsWith('**Tytuł:**')) {
            recipeData.title = line.replace('**Tytuł:**', '').trim();
            currentSection = null;
        } else if (line.startsWith('**Opis:**')) {
            recipeData.description = line.replace('**Opis:**', '').trim();
            currentSection = null;
        } else if (line.startsWith('**Składniki:**')) {
            currentSection = 'ingredients';
        } else if (line.startsWith('**Instrukcje:**')) {
            currentSection = 'instructions';
        } else {
            if (currentSection === 'ingredients') {
                recipeData.ingredients.push(line.replace(/^-|^\* ?/, '').trim());
            } else if (currentSection === 'instructions') {
                recipeData.instructions.push(line.replace(/^\d+\.? ?/, '').trim());
            }
        }
    }
    
    return recipeData;
  }, [recipe]);

  return (
    <div className="bg-amber-50 p-6 rounded-xl animate-fade-in border border-amber-200">
      <h3 className="text-2xl font-bold text-amber-900 mb-2 flex items-center">
        <i className="fas fa-scroll mr-3 text-amber-600"></i> Propozycja przepisu
      </h3>
      {parsedRecipe.title && <h4 className="text-xl font-semibold text-slate-800 mb-3">{parsedRecipe.title}</h4>}
      {parsedRecipe.description && <p className="text-slate-600 mb-4 italic">"{parsedRecipe.description}"</p>}

      {parsedRecipe.ingredients.length > 0 && (
        <div className="mb-4">
          <h5 className="font-bold text-slate-700 mb-2">Składniki:</h5>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {parsedRecipe.ingredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {parsedRecipe.instructions.length > 0 && (
        <div>
          <h5 className="font-bold text-slate-700 mb-2">Instrukcje:</h5>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            {parsedRecipe.instructions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplay;
