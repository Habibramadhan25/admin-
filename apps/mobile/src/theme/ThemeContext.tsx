import React, { createContext, useContext, useState, useEffect } from 'react';
import { LIGHT_THEME, DARK_THEME, ThemeColors } from './colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  isDark: false,
  colors: LIGHT_THEME,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // Inject Google Fonts and Material Symbols Outlined on web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fontId = 'bacayuk-google-fonts';
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400&family=Manrope:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
        document.head.appendChild(link);
      }

      // Add a style tag for base styles and font helpers
      const styleId = 'bacayuk-base-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          body {
            font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: ${themeMode === 'dark' ? '#161311' : '#fcf9f4'};
            color: ${themeMode === 'dark' ? '#eae1dd' : '#1c1c19'};
          }
          .font-literata {
            font-family: 'Literata', Georgia, serif !important;
          }
          .font-manrope {
            font-family: 'Manrope', sans-serif !important;
          }
          .material-symbols-outlined {
            font-family: 'Material Symbols Outlined' !important;
            font-weight: normal;
            font-style: normal;
            font-size: 20px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
          }
        `;
        document.head.appendChild(style);
      } else {
        const style = document.getElementById(styleId);
        if (style) {
          style.textContent = `
            body {
              font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background-color: ${themeMode === 'dark' ? '#161311' : '#fcf9f4'};
              color: ${themeMode === 'dark' ? '#eae1dd' : '#1c1c19'};
            }
            .font-literata {
              font-family: 'Literata', Georgia, serif !important;
            }
            .font-manrope {
              font-family: 'Manrope', sans-serif !important;
            }
            .material-symbols-outlined {
              font-family: 'Material Symbols Outlined' !important;
              font-weight: normal;
              font-style: normal;
              font-size: 20px;
              line-height: 1;
              letter-spacing: normal;
              text-transform: none;
              display: inline-block;
              white-space: nowrap;
              word-wrap: normal;
              direction: ltr;
              -webkit-font-smoothing: antialiased;
            }
          `;
        }
      }
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark: themeMode === 'dark',
        colors,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => useContext(ThemeContext);
export const useTheme = useAppTheme;

