import React from 'react';
import AirdropForm from './components/AirdropForm';
import { ThemeToggle } from './components/ThemeToggle';
import FuelLogo from "./assets/fuel_logo.svg";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between mb-4">
          <img src={FuelLogo} alt="FUEL Logo" className="w-12 md:w-36 h-auto" />{" "}
          <ThemeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <AirdropForm />
        </div>
      </div>
    </div>
  );
}

export default App;