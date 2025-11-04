
import React, { useState } from 'react';
import type { DiaryEntry } from '../types';
import EditMealModal from './EditMealModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onUpdate: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleUpdate = (updatedEntry: DiaryEntry) => {
    onUpdate(updatedEntry);
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(entry.id);
    setIsConfirmOpen(false);
  };
  
  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 transition-shadow hover:shadow-lg animate-fade-in">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <h4 className="font-bold text-lg text-slate-800">{entry.mealName}</h4>
             {entry.imageUrl && (
              <a href={entry.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                Zobacz zdjęcie
              </a>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-2xl text-indigo-600">{entry.totalCalories.toFixed(0)} <span className="text-base font-semibold">kcal</span></p>
          </div>
        </div>
        
        <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
          {entry.items.map(item => (
            <li key={item.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
              <span className="text-slate-700 capitalize">
                {item.name}
                {item.quantity && item.unit && ` (${item.quantity}${item.unit})`}
              </span>
              <span className="font-semibold text-slate-600">{item.calories.toFixed(0)} kcal</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-slate-100">
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
            aria-label={`Edytuj ${entry.mealName}`}
          >
            <i className="fas fa-pencil-alt mr-1.5"></i> Edytuj
          </button>
          <button 
            onClick={() => setIsConfirmOpen(true)}
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors flex items-center"
            aria-label={`Usuń ${entry.mealName}`}
          >
            <i className="fas fa-trash-alt mr-1.5"></i> Usuń
          </button>
        </div>
      </div>

      {isEditing && (
        <EditMealModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          entry={entry}
          onSave={handleUpdate}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć posiłek "${entry.mealName}"? Tej operacji nie można cofnąć.`}
      />
    </>
  );
};

export default DiaryEntryCard;