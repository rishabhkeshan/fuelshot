import { useState, useEffect } from 'react';

export function useTheme({ isDark, setIsDark }: { isDark: boolean; setIsDark: (isDark: boolean) => void }) {

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return {
    isDark,
    toggle: () => setIsDark(!isDark)
  };
}