import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { SurfaceCard } from '@/components/ui/surface-card';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

type Mode = 'login' | 'signup';

// Supabase devolve mensagem em inglês — traduz só os casos mais comuns,
// o resto cai na mensagem original mesmo (melhor que nada).
function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('User already registered')) return 'Já existe uma conta com esse e-mail.';
  if (message.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  return message;
}

/**
 * Tela 1 do CONTEXT.md — e-mail/senha, sem login social (fora do MVP).
 * Cadastro ganha um campo Nome que o brainstorm original não pedia: o
 * trigger `handle_new_user()` já lê `full_name` dos metadados do cadastro,
 * então sem esse campo todo usuário novo nasceria sem nome.
 */
export default function AuthScreen() {
  const theme = useTheme();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, fullName.trim());
      } else {
        await signIn(email.trim(), password);
      }
      // Sucesso não precisa de mais nada aqui — o AuthProvider escuta a
      // sessão nova e o guard em _layout.tsx libera o resto do app sozinho.
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Digite seu e-mail acima primeiro, aí toque em "Esqueci minha senha" de novo.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
    setResetSent(false);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <AppMark size={48} />
              <ThemedText type="title" style={styles.appName}>
                Missão30
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.tagline}>
                Construa hábitos de verdade, um dia de cada vez.
              </ThemedText>
            </View>

            <SurfaceCard style={styles.form}>
              {mode === 'signup' && (
                <ThemedTextInput
                  placeholder="Nome"
                  value={fullName}
                  onChangeText={setFullName}
                  autoComplete="name"
                  returnKeyType="next"
                />
              )}
              <ThemedTextInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
              <ThemedTextInput
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {resetSent && (
                <ThemedText type="small" themeColor="success">
                  Te mandamos um e-mail com um link pra criar uma senha nova.
                </ThemedText>
              )}
              {error && (
                <ThemedText type="small" themeColor="warning">
                  {error}
                </ThemedText>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={loading || !email.trim() || !password || (mode === 'signup' && !fullName.trim())}
                style={[styles.submitButton, { backgroundColor: theme.primary }, loading && styles.disabled]}
                accessibilityRole="button">
                <ThemedText type="smallBold" themeColor="textOnDark">
                  {mode === 'signup' ? 'Criar Conta' : 'Entrar'}
                </ThemedText>
              </Pressable>

              {mode === 'login' && (
                <Pressable onPress={handleForgotPassword} style={styles.linkButton} accessibilityRole="button">
                  <ThemedText type="small" themeColor="textSecondary">
                    Esqueci minha senha
                  </ThemedText>
                </Pressable>
              )}
            </SurfaceCard>

            <Pressable onPress={toggleMode} style={styles.toggleButton} accessibilityRole="button">
              <ThemedText type="small" themeColor="textSecondary">
                {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
                <ThemedText type="smallBold" themeColor="primary">
                  {mode === 'login' ? 'Criar uma' : 'Entrar'}
                </ThemedText>
              </ThemedText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.five,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  appName: {
    fontSize: 28,
    lineHeight: 34,
  },
  tagline: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  submitButton: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  disabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  toggleButton: {
    alignItems: 'center',
  },
});
