import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

interface CustomMissionBannerProps {
  onPress: () => void;
}

/** Banner de destaque no topo do catálogo, antes do carrossel — ponto de
 * entrada da criação de missão personalizada, já pensada como recurso
 * pago futuro (CONTEXT.md Log de Decisões #14). Borda tracejada + selo
 * "PREMIUM" marcam visualmente que é diferente das missões reais do
 * catálogo abaixo. Sem formulário nem cobrança: toque só abre o modal-teaser. */
export function CustomMissionBanner({ onPress }: CustomMissionBannerProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: theme.backgroundElement, borderColor: theme.primary },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button">
      <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
        <UiIcons.lock size={18} color={theme.textOnDark} />
      </View>

      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <ThemedText type="smallBold">Crie a sua própria missão</ThemedText>
          <View style={[styles.tag, { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" themeColor="textOnDark" style={styles.tagLabel}>
              PREMIUM
            </ThemedText>
          </View>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Não achou a missão certa? Em breve você vai poder criar a sua, do seu jeito.
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
    borderWidth: 1.5,
    borderStyle: 'dashed',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tagLabel: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.5,
  },
});
