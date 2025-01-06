import React, { useState } from 'react';
import AirdropForm from './components/AirdropForm';
import { ThemeToggle } from './components/ThemeToggle';
import { Github } from 'lucide-react';
import FuelLogo from "./assets/fuel_logo.svg";
import FuelLogoLight from "./assets/fuel_logo_light.svg";
import { useTheme } from './hooks/useTheme';

function App() {
    const [isDark, setIsDark] = useState(() => {
      const saved = localStorage.getItem("theme");
      return (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    });
  return (
    <div className="min-h-screen bg-white dark:bg-fuel-dark-900 transition-colors">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between mb-4">
          {isDark ? (
            <img
              src={FuelLogo}
              alt="FUEL Logo"
              className="w-12 md:w-36 h-auto"
            />
          ) : (
            <img
              src={FuelLogoLight}
              alt="FUEL Logo"
              className="w-12 md:w-36 h-auto"
            />
          )}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/rishabhkeshan/fuelshot"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="View source on GitHub"
            >
              <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-fuel-dark-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-fuel-dark-600">
          <AirdropForm />
        </div>
      </div>
    </div>
  );
}

export default App;