
import React from 'react';

interface TabsProps {
  activeTab: 'add' | 'diary';
  setActiveTab: (tab: 'add' | 'diary') => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const getButtonClass = (tabName: 'add' | 'diary') => {
    const baseClass = "flex-1 py-4 px-6 text-center font-bold transition-colors duration-200 ease-in-out focus:outline-none flex items-center justify-center";
    if (activeTab === tabName) {
      return `${baseClass} bg-indigo-600 text-white`;
    }
    return `${baseClass} bg-slate-200 text-slate-600 hover:bg-slate-300`;
  };

  return (
    <div className="flex border-b border-slate-200">
      <button onClick={() => setActiveTab('add')} className={getButtonClass('add')}>
        <i className="fas fa-plus-circle mr-2"></i> Dodaj Posiłek
      </button>
      <button onClick={() => setActiveTab('diary')} className={getButtonClass('diary')}>
        <i className="fas fa-book-open mr-2"></i> Dziennik
      </button>
    </div>
  );
};

export default Tabs;
