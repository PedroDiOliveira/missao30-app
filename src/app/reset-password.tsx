import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { SurfaceCard } from '@/components/ui/surface-card';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

/**
 * Recebe o deep link de recuperação de senha
 * (`missao30app://reset-password?code=...` — fluxo PKCE, o padrão do
 * client em `lib/supabase.ts`). Troca o código pela sessão de recuperação,
 * deixa definir a senha nova, e desloga de propósito depois — a pessoa
 * entra de novo já com a senha nova, em vez de ficar logada silenciosamente
 * só por ter clicado no link.
 */
export default function ResetPasswordScreen() {
  const theme = useTheme();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [exchanging, setExchanging] = useState(() => Boolean(code));
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sem `code`, não há nada assíncrono a fazer — o erro correspondente é
  // derivado direto abaixo (`linkError`), não guardado em state pra evitar
  // um setState síncrono dentro do efeito (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!code) return;
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) setExchangeError('Esse link expirou ou já foi usado — solicite um novo.');
      setExchanging(false);
    });
  }, [code]);

  const linkError = !code ? 'Link inválido ou incompleto.' : exchangeError;

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <AppMark size={40} />
          <ThemedText type="title" style={styles.title}>
            Nova senha
          </ThemedText>

          {exchanging ? (
            <ThemedText type="default" themeColor="textSecondary">
              Confirmando o link...
            </ThemedText>
          ) : linkError ? (
            <ThemedText type="default" themeColor="warning">
              {linkError}
            </ThemedText>
          ) : (
            <SurfaceCard style={styles.form}>
              <ThemedTextInput
                placeholder="Nova senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {error && (
                <ThemedText type="small" themeColor="warning">
                  {error}
                </ThemedText>
              )}
              <Pressable
                onPress={handleSave}
                disabled={saving || password.length < 6}
                style={[styles.submitButton, { backgroundColor: theme.primary }, saving && styles.disabled]}
                accessibilityRole="button">
                <ThemedText type="smallBold" themeColor="textOnDark">
                  Salvar nova senha
                </ThemedText>
              </Pressable>
            </SurfaceCard>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  form: {
    width: '100%',
    gap: Spacing.three,
  },
  submitButton: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
