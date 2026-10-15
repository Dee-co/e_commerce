import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {darkColors, lightColors} from '../theme/colors';

const ThemeContext = createContext(null);

const THEME_KEY = 'appTheme';

const toRgb = hex => {
  const value = hex.replace('#', '');

  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
};

const createThemeVars = colors => ({
  '--color-primary': toRgb(colors.primary),
  '--color-primary-dark': toRgb(colors.primaryDark),
  '--color-primary-light': toRgb(colors.primaryLight),

  '--color-background': toRgb(colors.background),
  '--color-surface': toRgb(colors.surface),
  '--color-surface-light': toRgb(colors.surfaceLight),

  '--color-text-primary': toRgb(colors.textPrimary),
  '--color-text-secondary': toRgb(colors.textSecondary),
  '--color-text-muted': toRgb(colors.textMuted),

  '--color-border': toRgb(colors.border),
  '--color-border-primary': toRgb(colors.borderPrimary),

  '--color-success': toRgb(colors.success),
  '--color-error': toRgb(colors.error),
  '--color-warning': toRgb(colors.warning),
});

export const ThemeProvider = ({children}) => {
  // Default = LIGHT
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Restore saved theme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);

        if (savedTheme === 'dark') {
          setIsDark(true);
        } else {
          // light is default
          setIsDark(false);
        }
      } catch (error) {
        console.log('THEME LOAD ERROR:', error);
        setIsDark(false);
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadTheme();
  }, []);

  const colors = isDark ? darkColors : lightColors;

  const themeVars = useMemo(
    () => createThemeVars(colors),
    [colors],
  );

  const toggleTheme = async () => {
    const newIsDark = !isDark;

    setIsDark(newIsDark);

    try {
      await AsyncStorage.setItem(
        THEME_KEY,
        newIsDark ? 'dark' : 'light',
      );
    } catch (error) {
      console.log('THEME SAVE ERROR:', error);
    }
  };

  const value = useMemo(
    () => ({
      colors,
      isDark,
      toggleTheme,
      themeVars,
      isThemeLoading,
    }),
    [colors, isDark, themeVars, isThemeLoading],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};