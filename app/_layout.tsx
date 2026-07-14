
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAccentColorStore } from '../hooks/use-accent-color-store';
import { AppThemeProvider } from '../hooks/useAppTheme';
import { useIsAppReady } from '@/hooks/use-is-app-ready';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="appearance" options={{ title: 'Appearance' }} />
      <Stack.Screen name="active-workout" options={{ title: 'Active Workout' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });
  const { isAppReady } = useIsAppReady();

  // By using the accentColor as a key, we force the ThemeAppliedLayout to re-mount
  // whenever the accent color changes, ensuring the theme is re-generated.
  const { accentColor } = useAccentColorStore();

  useEffect(() => {
    if ((fontsLoaded || fontError) && isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isAppReady]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isAppReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppThemeProvider key={accentColor}>
        <RootLayoutNav />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
