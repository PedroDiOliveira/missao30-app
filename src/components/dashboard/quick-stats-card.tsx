import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import { computeQuickStats } from '@/lib/stats';
import type { UserMissionView } from '@/lib/types';

interface QuickStatsCardProps {
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
}

/** Nada aqui é precomputado no modelo de dados — tudo derivado sob demanda
 * via computeQuickStats() (src/lib/stats.ts). */
export function QuickStatsCard({ activeMissions, missionHistory }: QuickStatsCardProps) {
  const theme = useTheme();
  const stats = computeQuickStats(activeMissions, missionHistory);

  const items = [
    { Icon: UiIcons.trophy, label: 'Missões\nconcluídas', value: stats.totalCompletedMissions },
    { Icon: UiIcons.streak, label: 'Melhor\nsequência', value: stats.currentBestStreak },
    { Icon: UiIcons.stats, label: 'Check-ins\nno total', value: stats.totalLifetimeCheckIns },
  ];

  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
        SUAS ESTATÍSTICAS
      </ThemedText>
      <View style={styles.row}>
        {items.map((item) => (
          <View key={item.label} style={styles.stat}>
            <item.Icon size={18} color={theme.primary} />
            <ThemedText type="default" style={styles.value}>
              {item.value}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.label}
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
