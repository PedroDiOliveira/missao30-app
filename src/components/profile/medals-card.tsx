import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MedalRingIcon } from '@/components/ui/medal-ring-icon';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { computeBestMedals, MEDAL_TIER_LABEL, type MedalTier } from '@/lib/medals';
import type { UserMissionView } from '@/lib/types';

interface MedalsCardProps {
  missionHistory: UserMissionView[];
}

/** Vitrine de medalhas — uma por missão do catálogo, a melhor já
 * conquistada (CONTEXT.md Log de Decisões #15). Fica visível mesmo vazia,
 * com uma chamada pra ação, em vez de sumir da tela. */
export function MedalsCard({ missionHistory }: MedalsCardProps) {
  const theme = useTheme();
  const medals = computeBestMedals(missionHistory);

  const tierColor: Record<MedalTier, string> = {
    1: theme.secondary,
    2: theme.success,
    3: theme.warning,
  };

  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
        SUAS MEDALHAS
      </ThemedText>

      {medals.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Complete uma missão sem estourar o limite de faltas pra ganhar sua primeira medalha.
        </ThemedText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {medals.map((medal) => (
            <View key={medal.missionId} style={styles.tile}>
              <MedalRingIcon tier={medal.tier} color={tierColor[medal.tier]} size={36} />
              <ThemedText type="small" numberOfLines={1} style={styles.tileTitle}>
                {medal.missionTitle}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {MEDAL_TIER_LABEL[medal.tier]}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  row: {
    gap: Spacing.four,
  },
  tile: {
    width: 88,
    alignItems: 'center',
    gap: Spacing.one,
  },
  tileTitle: {
    textAlign: 'center',
  },
});
