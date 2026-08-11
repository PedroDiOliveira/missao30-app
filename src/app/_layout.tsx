import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { MissionsProvider } from '@/context/missions-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <MissionsProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.light.backgroundElement },
            headerTintColor: Colors.light.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Colors.light.background },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mission/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="report/[id]" options={{ headerShown: false }} />
        </Stack>
      </MissionsProvider>
    </ThemeProvider>
  );
}
