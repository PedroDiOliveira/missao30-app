import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Stub — Tela 1 do CONTEXT.md (e-mail/senha, "esqueci minha senha").
// Ainda não construída; não está ligada ao fluxo enquanto estivermos na
// fase de dados mockados.
export default function AuthScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Entrar</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Tela ainda não construída.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
});
