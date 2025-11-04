import React from 'react';
import type { DiaryEntry } from '../types';
import DiaryEntryCard from './DiaryEntryCard';

interface DiaryViewProps {
  entries: DiaryEntry[];
  onUpdate: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

const DiaryView: React.FC<DiaryViewProps> = ({ entries, onUpdate, onDelete }) => {

  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <i className="fas fa-book text-5xl text-slate-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-slate-700">Twój dziennik jest pusty</h2>
        <p className="text-slate-500 mt-2">Przejdź do zakładki "Dodaj Posiłek", aby rozpocząć śledzenie kalorii.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Twój Dziennik Żywieniowy</h2>
      {/* Fix: Changed from Object.entries to Object.keys to resolve type inference issues where dailyEntries was treated as 'unknown'. */}
      {Object.keys(groupedEntries).map((date) => {
        const dailyEntries = groupedEntries[date];
        const dailyTotalCalories = dailyEntries.reduce((sum, entry) => sum + entry.totalCalories, 0);
        return (
            <div key={date}>
                <div className="flex justify-between items-baseline mb-4 pb-2 border-b-2 border-indigo-100">
                    <h3 className="text-xl font-bold text-slate-800">{date}</h3>
                    <p className="text-lg font-semibold text-indigo-600">
                        Suma dnia: <span className="font-extrabold">{dailyTotalCalories.toFixed(0)} kcal</span>
                    </p>
                </div>
                <div className="space-y-4">
                    {dailyEntries.map(entry => (
                        <DiaryEntryCard
                            key={entry.id}
                            entry={entry}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        )
      })}
    </div>
  );
};

export default DiaryView;