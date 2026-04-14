import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeCtx = createContext(null);
const LS_KEY = 'api-tester.theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const t = localStorage.getItem(LS_KEY);
    if (t === 'light' || t === 'dark') setTheme(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem(LS_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggle() {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      }
    }),
    [theme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
}

