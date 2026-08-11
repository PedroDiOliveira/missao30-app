import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppMark } from '@/components/ui/app-mark';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

/**
 * Botão de voltar reusado por toda tela empilhada sobre as abas
 * (`mission/[id]`, `report/[id]`) — a marca do app em vez de um ícone de
 * voltar genérico, com um chevron + "Voltar" do lado pra deixar a ação
 * óbvia (extraído de `mission/[id].tsx` quando `report/[id]` passou a
 * precisar do mesmo bloco).
 */
export function BackButton() {
  const theme = useTheme();

  // Cobre o caso de chegar aqui sem histórico de navegação (link direto,
  // recarregar a página no web) — o toque na marca sempre volta pro menu,
  // nunca fica sem efeito.
  function handleGoToMenu() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  return (
    <Pressable
      onPress={handleGoToMenu}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Voltar ao início"
      style={({ pressed }) => [styles.backRow, pressed && styles.backRowPressed]}>
      <AppMark size={32} />
      <View style={styles.backLabel}>
        <UiIcons.chevronLeft size={16} color={theme.textSecondary} />
        <ThemedText type="small" themeColor="textSecondary">
          Voltar
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
  },
  backRowPressed: {
    opacity: 0.7,
  },
  backLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
