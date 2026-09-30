'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('bg-theme');
    setPreference(saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system');
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
      setResolvedTheme(resolved);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };
    apply();
    const listener = () => preference === 'system' && apply();
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, [preference]);

  function changeTheme(next) {
    setPreference(next);
    window.localStorage.setItem('bg-theme', next);
  }

  const value = useMemo(() => ({ preference, resolvedTheme, changeTheme }), [preference, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
