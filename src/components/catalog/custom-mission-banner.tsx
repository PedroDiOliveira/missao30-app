import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

interface CustomMissionBannerProps {
  onPress: () => void;
}

/** Banner de destaque no topo do catálogo, antes do carrossel — ponto de
 * entrada da criação de missão personalizada, liberada pra todo mundo
 * (CONTEXT.md Log de Decisões, corrige a moldura de "recurso pago futuro"
 * da Decisão #14 original). Toque abre o formulário de verdade
 * (`/create-mission`), não um teaser. */
export function CustomMissionBanner({ onPress }: CustomMissionBannerProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button">
      <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
        <UiIcons.add size={20} color={theme.textOnDark} />
      </View>

      <View style={styles.textBlock}>
        <ThemedText type="smallBold">Crie a sua própria missão</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Não achou a missão certa? Monte a sua, do seu jeito e no seu ritmo.
        </ThemedText>
      </View>

      <UiIcons.chevronRight size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.9,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
  },
});
