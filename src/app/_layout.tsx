import { DefaultTheme, Redirect, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { MissionsProvider } from '@/context/missions-context';
import { ProfileProvider } from '@/context/profile-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <MissionsProvider>
          <ProfileProvider>
            <RootLayoutNav />
          </ProfileProvider>
        </MissionsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

/** Guard de autenticação: sem sessão, só as rotas `auth`/`reset-password`
 * são alcançáveis; com sessão, essas duas ficam inacessíveis (redireciona
 * pro dashboard). A splash nativa some só depois de saber pra que lado ir,
 * pra não piscar tela em branco no meio do caminho. */
function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  const inAuthFlow = segments[0] === 'auth' || segments[0] === 'reset-password';
  if (!session && !inAuthFlow) return <Redirect href="/auth" />;
  if (session && inAuthFlow) return <Redirect href="/home" />;

  return (
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
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
    </Stack>
  );
}
