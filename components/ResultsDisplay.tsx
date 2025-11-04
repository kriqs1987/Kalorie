
import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultsDisplayProps {
  data: AnalysisResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  return (
    <div className="bg-slate-50 p-6 rounded-xl animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Wyniki analizy</h3>
      
      {data.items.length > 0 ? (
        <>
          <ul className="space-y-3 mb-6">
            {data.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                <span className="text-slate-700 capitalize">{item.name}</span>
                <span className="font-semibold text-indigo-600">{item.calories.toFixed(0)} kcal</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center bg-indigo-600 text-white p-4 rounded-lg">
            <span className="text-lg font-bold">Łącznie</span>
            <span className="text-2xl font-extrabold">{data.totalCalories.toFixed(0)} kcal</span>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
            <i className="fas fa-search-minus text-4xl text-slate-400 mb-3"></i>
            <p className="text-slate-600 font-semibold">Nie znaleziono jedzenia na zdjęciu.</p>
            <p className="text-sm text-slate-500">Spróbuj z innym obrazem.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
