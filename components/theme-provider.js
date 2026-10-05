'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState('light');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('bg-theme');
    setPreference('light');
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = 'light';
      setResolvedTheme(resolved);
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light';
    };
    apply();
    const listener = () => apply();
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, [preference]);

  function changeTheme(next) {
    setPreference('light');
    window.localStorage.setItem('bg-theme', 'light');
  }

  const value = useMemo(() => ({ preference, resolvedTheme, changeTheme }), [preference, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
