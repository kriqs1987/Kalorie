
import React, { useState, useEffect } from 'react';
import type { DiaryEntry, FoodItem } from '../types';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DiaryEntry;
  onSave: (entry: DiaryEntry) => void;
}

const EditMealModal: React.FC<EditMealModalProps> = ({ isOpen, onClose, entry, onSave }) => {
  const [editedEntry, setEditedEntry] = useState<DiaryEntry>(JSON.parse(JSON.stringify(entry)));

  useEffect(() => {
    // Recalculate total calories whenever items change
    const totalCalories = editedEntry.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    setEditedEntry(prev => ({ ...prev, totalCalories }));
  }, [editedEntry.items]);
  
  useEffect(() => {
    // Reset state when a new entry is passed in
    setEditedEntry(JSON.parse(JSON.stringify(entry)));
  }, [entry]);


  const handleMealNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEntry({ ...editedEntry, mealName: e.target.value });
  };

  const handleItemChange = (index: number, field: keyof FoodItem, value: string | number) => {
    const newItems = [...editedEntry.items];
    const item = newItems[index];

    if (field === 'calories' || field === 'quantity') {
        (item[field] as number) = value === '' ? 0 : Number(value) || 0;
    } else {
        (item[field] as string) = value as string;
    }

    setEditedEntry({ ...editedEntry, items: newItems });
  };

  const handleAddItem = () => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: '',
      calories: 0,
      quantity: 1,
      unit: 'szt',
    };
    setEditedEntry({ ...editedEntry, items: [...editedEntry.items, newItem] });
  };
  
  const handleRemoveItem = (id: string) => {
    const newItems = editedEntry.items.filter(item => item.id !== id);
    setEditedEntry({ ...editedEntry, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedEntry);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="edit-meal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <h2 id="edit-meal-title" className="text-2xl font-bold text-slate-800">Edytuj Posiłek</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>

          <div className="mb-4">
            <label htmlFor="mealName" className="block text-sm font-medium text-slate-700 mb-1">Nazwa posiłku</label>
            <input
              type="text"
              id="mealName"
              value={editedEntry.mealName}
              onChange={handleMealNameChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Składniki</h3>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
            {editedEntry.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Nazwa produktu"
                  className="col-span-5 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <input
                  type="number"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="Ilość"
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <select
                    value={item.unit || 'g'}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="col-span-2 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                    <option value="g">g</option>
                    <option value="szt">szt</option>
                    <option value="ml">ml</option>
                </select>
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                  placeholder="Kalorie"
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full" aria-label={`Usuń ${item.name}`}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddItem} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 mb-4">
            <i className="fas fa-plus-circle mr-1"></i> Dodaj składnik
          </button>
          
          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg mt-4">
              <span className="text-lg font-bold text-indigo-800">Nowa suma kalorii:</span>
              <span className="text-2xl font-extrabold text-indigo-600">{editedEntry.totalCalories.toFixed(0)} kcal</span>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
              Anuluj
            </button>
            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMealModal;