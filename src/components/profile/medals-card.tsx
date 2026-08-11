import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MedalRingIcon } from '@/components/ui/medal-ring-icon';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { computeBestMedals, countMedalsByTier, MEDAL_TIER_LABEL, type MedalTier } from '@/lib/medals';
import type { UserMissionView } from '@/lib/types';

interface MedalsCardProps {
  missionHistory: UserMissionView[];
}

const TIERS: MedalTier[] = [1, 2, 3];

/** Vitrine de medalhas — mostra só a CONTAGEM por nível (CONTEXT.md Log de
 * Decisões #15), não uma medalha por missão. Os contadores em si já
 * comunicam "ainda não tem nenhuma" quando zerados, então não precisa de um
 * estado vazio à parte — a seção nunca some. */
export function MedalsCard({ missionHistory }: MedalsCardProps) {
  const theme = useTheme();
  const counts = countMedalsByTier(computeBestMedals(missionHistory));

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

      <View style={styles.row}>
        {TIERS.map((tier) => (
          <View key={tier} style={styles.stat}>
            <MedalRingIcon tier={tier} color={tierColor[tier]} size={32} />
            <ThemedText type="default" style={styles.value}>
              {counts[tier]}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {MEDAL_TIER_LABEL[tier]}
            </ThemedText>
          </View>
        ))}
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
});
