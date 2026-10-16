import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      const t = localStorage.getItem('tema');
      if (t === 'claro' || t === 'escuro') return t;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
    } catch {
      return 'claro';
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'escuro');
    try {
      localStorage.setItem('tema', tema);
    } catch {
      // storage indisponível — mantém só em memória
    }
  }, [tema]);

  const alternar = () => setTema((t) => (t === 'escuro' ? 'claro' : 'escuro'));

  return (
    <ThemeContext.Provider value={{ tema, escuro: tema === 'escuro', alternar }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
