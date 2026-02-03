import { createContext, useContext, useEffect, useState } from 'react';
import { useTaxNarrate, UserMode } from '@/contexts/TaxNarrateContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  modeTheme: 'lite' | 'secure' | 'premium';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'taxnarrate_theme';

// Map user modes to theme class names
const modeToThemeClass: Record<UserMode, string> = {
  lite: 'theme-lite',
  secure: 'theme-secure',
  secure_plus: 'theme-premium',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useTaxNarrate();
  const currentMode = state.currentMode;
  
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme;
      return stored || 'system';
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Handle light/dark theme
  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    updateTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply mode-specific theme class
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all mode theme classes
    Object.values(modeToThemeClass).forEach(cls => {
      root.classList.remove(cls);
    });
    
    // Add current mode theme class
    const themeClass = modeToThemeClass[currentMode];
    root.classList.add(themeClass);
  }, [currentMode]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };

  const modeTheme = currentMode === 'secure_plus' ? 'premium' : currentMode === 'secure' ? 'secure' : 'lite';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, modeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
