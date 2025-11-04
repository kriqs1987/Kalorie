
import React from 'react';
import type { HistoryItem } from '../types';

interface HistoryDisplayProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onClearHistory }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Historia Analiz</h2>
        <button
          onClick={onClearHistory}
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center"
          aria-label="Wyczyść historię analiz"
        >
          <i className="fas fa-trash-alt mr-2"></i> Wyczyść
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div key={item.id} className="group relative rounded-lg overflow-hidden shadow-md border border-slate-200 aspect-square">
            <img src={item.imageUrl} alt={`Analiza z ${new Date(item.timestamp).toLocaleString()}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-white text-center p-2">
                <p className="font-bold text-xl">{item.analysis.totalCalories.toFixed(0)}</p>
                <p className="text-sm font-semibold">kcal</p>
              </div>
            </div>
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white group-hover:opacity-0 transition-opacity duration-300">
                <p className="font-semibold text-sm truncate">{item.analysis.totalCalories.toFixed(0)} kcal</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryDisplay;
