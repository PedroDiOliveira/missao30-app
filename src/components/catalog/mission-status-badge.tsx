import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MedalRingIcon } from '@/components/ui/medal-ring-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MissionAchievement } from '@/lib/catalog';
import type { MedalTier } from '@/lib/medals';

interface MissionStatusBadgeProps {
  achievement: MissionAchievement;
}

/** Selo do catálogo — CONTEXT.md Log de Decisões #16: linguagem de
 * conquista, não de status. Nunca rotula um resultado passado ruim (nem
 * "falhou", nem "abandonada") — ou convida a tentar, ou celebra uma
 * medalha, ou não diz nada. */
export function MissionStatusBadge({ achievement }: MissionStatusBadgeProps) {
  const theme = useTheme();

  if (achievement.kind === 'no_medal') return null;

  if (achievement.kind === 'never_tried') {
    return <View style={[styles.dot, { backgroundColor: theme.primary }]} accessibilityLabel="Nunca tentada" />;
  }

  if (achievement.kind === 'active') {
    return (
      <View style={[styles.pill, { backgroundColor: theme.secondary }]}>
        <ThemedText type="smallBold" themeColor="textOnDark" style={styles.pillLabel}>
          Dia {achievement.dayNumber}/{achievement.durationDays}
        </ThemedText>
      </View>
    );
  }

  // 'medal' — sem pill de fundo, de propósito: é a mesma linguagem de
  // "anel colorido + número" que o perfil já usa pras contagens por nível,
  // aqui aplicada a uma missão específica.
  const tierColor: Record<MedalTier, string> = {
    1: theme.secondary,
    2: theme.success,
    3: theme.warning,
  };

  return (
    <View style={styles.medalRow}>
      <MedalRingIcon tier={achievement.tier} color={tierColor[achievement.tier]} size={16} />
      <ThemedText type="smallBold">×{achievement.count}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.sm,
  },
  pillLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
