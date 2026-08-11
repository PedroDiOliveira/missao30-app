import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import type { CatalogStatus } from '@/lib/catalog';

interface MissionStatusBadgeProps {
  status: CatalogStatus;
  dayNumber?: number;
  durationDays?: number;
}

const STATUS_LABEL: Record<Exclude<CatalogStatus, 'available'>, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  // Linguagem neutra de propósito (CONTEXT.md Seção 1) — o catálogo não usa
  // "Falhou", pra não reintroduzir a mecânica de culpa que o produto existe
  // pra evitar.
  failed: 'Não completada',
  abandoned: 'Abandonada',
};

/** Selo de status de uma missão no catálogo — usado pelo carrossel e pela
 * grade (CONTEXT.md Seção 8, Tela 2: toda missão aparece sempre, com selo). */
export function MissionStatusBadge({ status, dayNumber, durationDays }: MissionStatusBadgeProps) {
  const theme = useTheme();
  if (status === 'available') return null;

  const label =
    status === 'active' && dayNumber !== undefined && durationDays !== undefined
      ? `Ativa · Dia ${dayNumber}/${durationDays}`
      : STATUS_LABEL[status];

  const backgroundColor: Record<Exclude<CatalogStatus, 'available'>, string> = {
    active: theme.secondary,
    completed: theme.success,
    failed: theme.border,
    abandoned: theme.border,
  };
  const textColor: ThemeColor = status === 'failed' || status === 'abandoned' ? 'textSecondary' : 'textOnDark';

  return (
    <View style={[styles.badge, { backgroundColor: backgroundColor[status] }]}>
      {status === 'completed' && <UiIcons.trophy size={11} color={theme.textOnDark} />}
      <ThemedText type="smallBold" themeColor={textColor} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.sm,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
});
