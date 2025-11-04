
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-3xl font-bold text-indigo-600 flex items-center">
            <i className="fas fa-camera-retro mr-3"></i>
            Kalkulator Kalorii AI
        </h1>
      </div>
    </header>
  );
};

export default Header;
