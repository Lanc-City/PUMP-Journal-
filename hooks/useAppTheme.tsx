
import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useAccentColorStore } from './use-accent-color-store';

// We'll provide the paper theme via context
const AppThemeContext = createContext(null);

type AppThemeProviderProps = {
  children: ReactNode;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const colorScheme = useColorScheme();
  const { accentColor } = useAccentColorStore();
  const { theme } = useMaterial3Theme({ fallbackSourceColor: accentColor });

  const isDark = colorScheme === 'dark';

  const paperTheme = isDark
    ? { ...MD3DarkTheme, colors: theme.dark }
    : { ...MD3LightTheme, colors: theme.light };

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          ...theme.dark,
          card: theme.dark.surface,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          ...theme.light,
          card: theme.light.surface,
        },
      };
  
  return (
    // The context provides the paper theme, so components can access it via useAppTheme
    <AppThemeContext.Provider value={paperTheme}>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          {children}
        </NavigationThemeProvider>
      </PaperProvider>
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const theme = useContext(AppThemeContext);
  if (theme === null) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return theme;
};
